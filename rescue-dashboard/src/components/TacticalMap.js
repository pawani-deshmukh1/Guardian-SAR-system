import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const center = [21.1458, 79.0882]; // Nagpur

/* ---------- Icons ---------- */

const droneIcon = new L.Icon({
  iconUrl: "/icons/drone.svg",
  iconSize: [30,30],
  iconAnchor: [15,15]
});

const victimIcon = new L.Icon({
  iconUrl: "/icons/victim.svg",
  iconSize: [20,20],
  iconAnchor: [10,10]
});

const vipIcon = new L.Icon({
  iconUrl: "/icons/vip.svg",
  iconSize: [24,24],
  iconAnchor: [12,12],
  className: "vip-marker"
});

export default function TacticalMap(){

const [persons,setPersons] = useState([]);
const [droneHeading,setDroneHeading] = useState(0);

/* ---------- WebSocket ---------- */

useEffect(()=>{

const ws = new WebSocket("ws://localhost:8000/api/stream/ws");

ws.onmessage = (event)=>{

const data = JSON.parse(event.data);

if(data.persons){
setPersons(data.persons);
}

};

return ()=>ws.close();

},[]);


/* ---------- Drone rotation ---------- */

useEffect(()=>{

const interval = setInterval(()=>{

setDroneHeading(prev => (prev + 20) % 360);

},2000);

return ()=>clearInterval(interval);

},[]);


/* ---------- Rotated drone icon ---------- */

const rotatedDrone = L.divIcon({
html: `<img src="/icons/drone.svg" style="width:30px;height:30px;transform:rotate(${droneHeading}deg);" />`,
iconSize: [30,30],
iconAnchor: [15,15],
className:""
});


return(

<div className="panel">

<h3>🛰 Tactical Radar</h3>

<MapContainer
center={center}
zoom={16}
style={{height:"300px",width:"100%"}}
zoomControl={false}
>

{/* Dark map WITHOUT labels */}

<TileLayer
url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
attribution="&copy; OpenStreetMap &copy; CARTO"
subdomains="abcd"
/>

{/* Drone marker */}

<Marker
position={center}
icon={rotatedDrone}
/>

{/* Persons */}

{persons.map((p)=>{

const isVIP = p.status === "VIP TARGET ACQUIRED";

const icon = isVIP ? vipIcon : victimIcon;

return(

<Marker
key={p.person_id}
position={[p.gps_lat,p.gps_lon]}
icon={icon}
/>

);

})}

</MapContainer>

</div>

);

}