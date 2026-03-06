import { useEffect, useState } from "react";
import { playSiren, stopSiren, playWarning, playTargetLock } from "../utils/sound";

export default function AlertsPanel({ setSafety }) {

  const [alerts,setAlerts] = useState([]);

  useEffect(()=>{

    const ws = new WebSocket("ws://localhost:8000/api/stream/ws");

    ws.onmessage = (event)=>{

      const data = JSON.parse(event.data);

      if(data.environment?.safety_level){
        setSafety(data.environment.safety_level);
      }

      if(data.alerts && data.alerts.length > 0){

        setAlerts(data.alerts);

        data.alerts.forEach(alert => {

          const msg = alert.message || "";

          /* 🚨 CRITICAL ALERTS */
          if(
            msg.includes("HIGH DENSITY") ||
            msg.includes("ENVIRONMENTAL ALERT") ||
            alert.level === "CRITICAL"
          ){
            playSiren();
            return;
          }

          /* 🎯 VIP */
          if(msg.includes("VIP")){
            playTargetLock();
            return;
          }

          /* ⚠️ NORMAL WARNING */
          playWarning();

        });

      }

    };

    return ()=>ws.close();

  },[setSafety]);

  return(

    <div className="panel">

      <h3>🚨 Alerts</h3>

      {alerts.length > 0 ? (

        alerts.map((a,index)=>(
          <p key={index} className={`alert-text ${a.level?.toLowerCase()}`}>
            {a.message}
          </p>
        ))

      ):(

        <p>No alerts</p>

      )}

      <button onClick={stopSiren}>
        🔇 Silence Alarm
      </button>

    </div>

  );
}