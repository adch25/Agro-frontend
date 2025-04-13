React Leaflet readme

https://react-leaflet.js.org/docs/start-installation/


npm install react@rc react-dom@rc leaflet
npm i leaflet react-leaflet


start code





import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import * as L from "leaflet";
import "leaflet/dist/leaflet.css"


const App = () => {
  return (
    <div>App

      <MapContainer
        style={{ width: "80vw", height: "60vh" }}
        center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>

    </div>
  )
}

export default App
