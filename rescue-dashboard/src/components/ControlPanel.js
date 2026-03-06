import { useState } from "react";
import axios from "axios";

export default function ControlPanel(){

const [query,setQuery] = useState("");

/* ---------- Change Video Source ---------- */

const changeSource = async(source)=>{

try{

const formData = new FormData();
formData.append("source",source);

await axios.post(
"http://localhost:8000/api/stream/source",
formData
);

alert("Video source changed");

}catch(err){

console.error(err);
alert("Failed to change source");

}

};

/* ---------- Upload Video ---------- */

const uploadVideo = async (event) => {

const file = event.target.files[0];
if(!file) return;

const formData = new FormData();
formData.append("file", file);

try{

await axios.post(
"http://localhost:8000/api/stream/upload",
formData,
{
headers:{
"Content-Type":"multipart/form-data"
}
}
);

/* switch stream to uploaded video */

const sourceForm = new FormData();
sourceForm.append("source","uploads/" + file.name);

await axios.post(
"http://localhost:8000/api/stream/source",
sourceForm
);

alert("Video uploaded and streaming started");

}catch(err){

console.error(err);
alert("Upload failed");

}

};

/* ---------- VIP Tracker ---------- */

const searchTarget = async()=>{

if(!query) return;

try{

await axios.post(
"http://localhost:8000/api/alerts/vip_target",
{description:query}
);

alert("VIP search activated");

}catch(err){

console.error(err);
alert("VIP search failed");

}

};

const clearTarget = async()=>{

try{

await axios.post(
"http://localhost:8000/api/alerts/clear_vip"
);

alert("VIP tracker reset");

}catch(err){

console.error(err);
alert("Reset failed");

}

};

/* ---------- Export Mission Report ---------- */

const exportReport = () => {

const report = {
mission:"Guardian Eye SAR",
timestamp:new Date().toISOString(),
status:"Mission Completed"
};

const blob = new Blob(
[JSON.stringify(report,null,2)],
{type:"application/json"}
);

const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href=url;
a.download="mission_report.json";
a.click();

};

/* ---------- AI Brain Controls ---------- */

const scanHazards = async()=>{

try{

await axios.post(
"http://localhost:8000/api/analysis/hazards"
);

alert("Hazard scan started");

}catch(err){

console.error(err);

}

};

const triageVictim = async()=>{

try{

await axios.post(
"http://localhost:8000/api/analysis/triage"
);

alert("AI triage started");

}catch(err){

console.error(err);

}

};

/* ---------- UI ---------- */

return(

<div className="panel">

<h3>🎥 Video Source</h3>

<button onClick={()=>changeSource("0")}>
Use Webcam </button>

<button onClick={()=>changeSource("uploads/demoPS7.mp4")}>
Use Demo Video </button>

<input
type="file"
accept="video/*"
onChange={uploadVideo}
/>

<hr/>

<h3>🎯 VIP Tracker</h3>

<input
placeholder="blue shirt black pants"
value={query}
onChange={(e)=>setQuery(e.target.value)}
/>

<button onClick={searchTarget}>
Find Target
</button>

<button onClick={clearTarget}>
Clear Target
</button>

<hr/>

<h3>🤖 AI Controls</h3>

<button onClick={scanHazards}>
Scan Hazards
</button>

<button onClick={triageVictim}>
Triage Victim
</button>

<hr/>

<h3>📄 Mission Control</h3>

<button onClick={exportReport}>
Export Mission Report
</button>

</div>

);

}
