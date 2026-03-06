import React, { useState } from "react";
import VideoFeeds from "./components/VideoFeeds";
import TacticalMap from "./components/TacticalMap";
import AlertsPanel from "./components/AlertsPanel";
import ControlPanel from "./components/ControlPanel";
import AITerminal from "./components/AITerminal";
import "./dashboard.css";

export default function Dashboard() {

  const [safety,setSafety] = useState("SAFE");

  return (

    <div className="container">

      <div className="topbar">

        🚁 GUARDIAN EYE — SAR COMMAND CENTER

        <span className={`status ${safety.toLowerCase()}`}>
          {safety}
        </span>

        <span className="system">
          AI ACTIVE | YOLOv8 | MiDaS | BoT-SORT
        </span>

      </div>

      <div className="main">

        {/* LEFT */}
        <div className="left-panel">
          <ControlPanel/>
          <AlertsPanel setSafety={setSafety}/>
        </div>

        {/* CENTER */}
        <div className="center-panel">
          <VideoFeeds/>
          <AITerminal/>
        </div>

        {/* RIGHT */}
        <div className="right-panel">
          <TacticalMap/>
        </div>

      </div>

    </div>

  );

}