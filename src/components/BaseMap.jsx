import React, { useState } from "react";
import {
  ScaleControl,
  useMapEvents,
} from "react-leaflet";

const BaseMap = () => {
  const [mousePosition, setMousePosition] = useState({ lat: 0, lng: 0 });

  const HandleMouseHover = () => {
    useMapEvents({
      mousemove: (e) => {
        setMousePosition(e.latlng);
      },
    });
    return null;
  };

  return (
    <>
      <HandleMouseHover/>
      <div className="coordinates_container">
        Lat: {mousePosition.lat.toFixed(4)}, Long:{" "}
        {mousePosition.lng.toFixed(4)}
      </div>

      <ScaleControl />
    </>
  );
};

export default BaseMap;