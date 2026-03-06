"""
Guardian Eye — Live Stream Router (STABLE PRODUCTION VERSION)
"""

import cv2
import asyncio
import json
import numpy as np
from typing import AsyncGenerator
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Form, UploadFile, File
import shutil
import os
from fastapi.responses import StreamingResponse

from app.modules.pipeline import process_frame
from app.core.config import settings
from app.core.logger import get_logger


router = APIRouter()
logger = get_logger(__name__)

# Upload directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Shared global state
_last_annotated: np.ndarray = None
_last_thermal: np.ndarray = None
_last_depth: np.ndarray = None
_last_result = None
_cap: cv2.VideoCapture = None


def _open_camera() -> cv2.VideoCapture:
    global _cap
    source = int(settings.VIDEO_SOURCE) if str(settings.VIDEO_SOURCE).isdigit() else settings.VIDEO_SOURCE
    _cap = cv2.VideoCapture(source)
    _cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    _cap.set(cv2.CAP_PROP_FPS, settings.STREAM_FPS)
    return _cap


def _frame_to_jpeg(frame: np.ndarray) -> bytes:
    _, encoded = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
    return encoded.tobytes()


async def _webcam_generator() -> AsyncGenerator[bytes, None]:
    global _last_annotated, _last_thermal, _last_depth, _last_result

    cap = _open_camera()

    # ── Camera Fallback ─────────────────────────────────────
    if not cap.isOpened():
        logger.error("Camera failed to open.")
        placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(
            placeholder,
            "NO CAMERA DETECTED",
            (150, 240),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2,
        )
        jpeg = _frame_to_jpeg(placeholder)
        while True:
            yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpeg + b"\r\n"
            await asyncio.sleep(0.1)
        return

    frame_idx = 0

    try:
        while True:
            await asyncio.sleep(0.001)

            ret, frame = cap.read()

            if not ret:
              # restart video if it ended
              cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
              continue

            frame = cv2.resize(frame, (640, 480))

            # ── SAFE PIPELINE EXECUTION ─────────────────────
            try:
                result = process_frame(
                    frame=frame,
                    frame_index=frame_idx,
                    run_depth=True,
                    job_id="live_stream",
                )
            except Exception as e:
                logger.exception("PIPELINE CRASHED")
                continue

            _last_result = result
            _last_annotated = result.annotated_path
            _last_thermal = result.thermal_path
            _last_depth = result.depth_path

            if _last_annotated is not None:
                jpeg = _frame_to_jpeg(_last_annotated)
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n"
                    + jpeg
                    + b"\r\n"
                )

            frame_idx += 1

    finally:
        cap.release()


@router.get("/webcam")
async def webcam_stream():
    return StreamingResponse(
        _webcam_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.get("/thermal")
async def video_feed_thermal():
    async def _gen():
        global _last_thermal
        while True:
            if _last_thermal is not None:
                jpeg = _frame_to_jpeg(_last_thermal)
                yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpeg + b"\r\n"
            await asyncio.sleep(0.05)

    return StreamingResponse(
        _gen(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.get("/depth")
async def video_feed_depth():
    async def _gen():
        global _last_depth
        while True:
            if _last_depth is not None:
                jpeg = _frame_to_jpeg(_last_depth)
                yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpeg + b"\r\n"
            await asyncio.sleep(0.05)

    return StreamingResponse(
        _gen(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.post("/source")
async def change_video_source(source: str = Form(...)):
    global _cap
    settings.VIDEO_SOURCE = source

    if _cap is not None:
        _cap.release()

    src = int(source) if source.isdigit() else source
    _cap = cv2.VideoCapture(src)
    _cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    return {"status": "success", "new_source": source}


# ── Upload Video Endpoint ─────────────────────────
@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    """
    Upload video and automatically switch stream source
    """

    global _cap

    file_path = os.path.abspath(os.path.join(UPLOAD_DIR, file.filename))

    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    logger.info(f"Uploaded video saved: {file_path}")

    # Switch stream source
    settings.VIDEO_SOURCE = file_path

    if _cap is not None:
        _cap.release()

    _cap = cv2.VideoCapture(file_path)
    _cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    return {
        "status": "success",
        "video": file.filename,
        "source": file_path
    }


# ── WebSocket ─────────────────────────
@router.websocket("/ws")
async def websocket_stream(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket client connected")

    global _last_result

    try:
        while True:
            if _last_result is not None:
                payload = {
                    "frame_index": _last_result.frame_index,
                    "timestamp": _last_result.timestamp,
                    "person_count": _last_result.person_count,
                    "persons": _last_result.persons,
                    "environment": _last_result.environment,
                    "alerts": _last_result.alerts_fired,
                    "gps_lat": _last_result.gps_lat,
                    "gps_lon": _last_result.gps_lon,
                    "landing_zones": _last_result.landing_zones,
                }
                await websocket.send_text(json.dumps(payload))

            await asyncio.sleep(0.1)

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")