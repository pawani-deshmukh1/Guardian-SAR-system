import { useEffect, useState } from "react";

export default function AITerminal(){

const [logs,setLogs] = useState([]);

useEffect(()=>{

const ws = new WebSocket("ws://localhost:8000/api/stream/ws");

ws.onmessage = (event)=>{

const data = JSON.parse(event.data);

let newLogs=[];

if(data.persons){

data.persons.forEach((p)=>{

newLogs.push(`Tracking ${p.person_id} : ${p.status}`);

if(p.status.includes("INJURED")){
newLogs.push("⚠ MEDICAL ALERT: Victim detected");
}

if(p.status === "VIP TARGET ACQUIRED"){
newLogs.push("🎯 TARGET LOCK ACQUIRED");
}

});

}

if(data.landing_zones){

data.landing_zones.forEach((z)=>{

newLogs.push(`Landing Zone Found : ${z.lz_id}`);

});

}

setLogs(prev=>[...newLogs,...prev].slice(0,12));

};

return ()=>ws.close();

},[]);

return(

<div className="panel">

<h3>🤖 AI Terminal</h3>

<div className="terminal">

{logs.map((log,i)=>(
<div key={i}>{">"} {log}</div>
))}

</div>

</div>

);

}