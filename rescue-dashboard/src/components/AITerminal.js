import { useEffect, useState } from "react";

export default function AITerminal(){

const [logs,setLogs] = useState([]);

useEffect(()=>{

const ws = new WebSocket("ws://localhost:8000/api/stream/ws");

ws.onmessage = (event)=>{

const data = JSON.parse(event.data);

let newLogs=[];

/* PERSON TRACKING */

if(data.persons){

data.persons.forEach((p)=>{

if(!p.person_id) return;

newLogs.push(`Tracking ${p.person_id} : ${p.status || "UNKNOWN"}`);

if(p.status && p.status.includes("INJURED")){
newLogs.push("⚠ MEDICAL ALERT: Victim detected");
}

if(p.status === "VIP TARGET ACQUIRED"){
newLogs.push("🎯 TARGET LOCK ACQUIRED");
}

});

}

/* LANDING ZONES */

if(data.landing_zones){

data.landing_zones.forEach((z)=>{

if(z.lz_id){
newLogs.push(`Landing Zone Found : ${z.lz_id}`);
}

});

}

/* LIMIT TERMINAL LOG SIZE */

setLogs(prev=>{

const updated=[...newLogs,...prev];

return updated.slice(0,15);

});

};

ws.onerror = ()=>{
console.log("WebSocket error");
};

return ()=>ws.close();

},[]);

return(

<div className="panel">

<h3>🤖 AI Terminal</h3>

<div className="terminal">

{logs.length === 0 && (
<div>{">"} Waiting for telemetry...</div>
)}

{logs.map((log,i)=>(
<div key={i}>{">"} {log}</div>
))}

</div>

</div>

);

}