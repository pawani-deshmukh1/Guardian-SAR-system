import { useEffect,useState } from "react";

export default function PersonsList(){

 const [persons,setPersons] = useState([]);

 useEffect(()=>{

  const ws = new WebSocket("ws://localhost:8000/api/stream/ws");

  ws.onmessage = (event)=>{
   const data = JSON.parse(event.data);
   setPersons(data.persons || []);
  };

 },[]);

 return(

  <div className="panel">

   <h3>📡 Live Telemetry</h3>

   <table>

    <thead>
     <tr>
      <th>ID</th>
      <th>Status</th>
      <th>Thermal</th>
     </tr>
    </thead>

    <tbody>

     {persons.map(p=>(
      <tr key={p.person_id}>
       <td>{p.person_id}</td>
       <td>{p.status}</td>
       <td>{p.thermal_score?.toFixed(2)}</td>
      </tr>
     ))}

    </tbody>

   </table>

  </div>

 );

}