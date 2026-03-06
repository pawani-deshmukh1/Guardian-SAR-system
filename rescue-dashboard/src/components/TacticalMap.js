import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";

export default function TacticalMap() {

  const [persons,setPersons] = useState([]);
  const [lz,setLz] = useState([]);

  useEffect(()=>{

    const ws = new WebSocket("ws://localhost:8000/api/stream/ws");

    ws.onmessage = (event)=>{

      const data = JSON.parse(event.data);

      setPersons(data.persons || []);
      setLz(data.landing_zones || []);

    };

    return ()=>ws.close();

  },[]);

  return(

    <div className="panel">

      <h3>🗺 Tactical Map</h3>

      <div className="radar-ring"></div>

      <MapContainer
        center={[21.1458,79.0882]}
        zoom={13}
        style={{height:"350px"}}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {persons.map(p=>(
          <Marker key={p.person_id}
          position={[p.gps_lat,p.gps_lon]}>
            <Popup>
              {p.person_id}<br/>
              {p.status}
            </Popup>
          </Marker>
        ))}

        {lz.map(zone=>(
          <Marker key={zone.lz_id}
          position={[zone.gps_lat,zone.gps_lon]}>
            <Popup>
              {zone.lz_id}<br/>
              Safety: {zone.safety_score}
            </Popup>
          </Marker>
        ))}

      </MapContainer>

    </div>

  );

}