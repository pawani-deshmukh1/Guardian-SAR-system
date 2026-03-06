import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const center = [21.1458, 79.0882]; // Nagpur

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
iconAnchor: [12,12]
});

export default function TacticalMap(){

const [persons,setPersons] = useState([]);

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

return(

<div className="panel">

<h3>🛰 Tactical Radar</h3>

<MapContainer
center={center}
zoom={16}
style={{height:"300px",width:"100%"}}

>

<TileLayer
url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
attribution="&copy; OpenStreetMap &copy; CARTO"
subdomains="abcd"
/>

{/* Drone marker */}

<Marker position={center} icon={droneIcon} />

{/* Persons */}

{persons.map((p)=>{

const icon =
p.status === "VIP TARGET ACQUIRED"
? vipIcon
: victimIcon;

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
