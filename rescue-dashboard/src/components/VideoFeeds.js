import { useState } from "react";

export default function VideoFeeds() {

  const [mode,setMode] = useState("rgb");

  const getFeed = () => {

    if(mode === "rgb")
      return "http://localhost:8000/api/stream/webcam";

    if(mode === "thermal")
      return "http://localhost:8000/api/stream/thermal";

    if(mode === "depth")
      return "http://localhost:8000/api/stream/depth";

  };

  return (

    <div className="panel">

      <h3>📡 Tactical Video Feed</h3>

      <div className="video-wrapper">

        <img
          src={getFeed()}
          width="100%"
          alt="video feed"
        />

        <div className="video-overlay">
          LIVE AI INFERENCE
        </div>

        <div className="crosshair"></div>

      </div>

      <div style={{marginTop:"10px"}}>

        <button onClick={()=>setMode("rgb")}>
          RGB
        </button>

        <button onClick={()=>setMode("thermal")}>
          Thermal
        </button>

        <button onClick={()=>setMode("depth")}>
          Depth
        </button>

      </div>

    </div>

  );

}