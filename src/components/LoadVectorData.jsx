import { useEffect, useState } from "react";
import { useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";

const LoadVectorData = ({ url, Color }) => {
  const [geojsonData, setGeojsonData] = useState(null);
  const map = useMap();

  const geojsonKey = geojsonData ? JSON.stringify(geojsonData) : url;

  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
        }
        const data = await response.json();
        map.fitBounds(L.geoJson(data).getBounds());

        setGeojsonData(data);
      } catch (error) {
        console.error("Error fetching GeoJSON data:", error);
      }
    };

    fetchGeoJSON();
  }, [url, map]);

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const popupContent = Object.keys(feature.properties)
        .map((key) => `<strong>${key}:</strong> ${feature.properties[key]}`)
        .join("<br/>");

      layer.bindPopup(popupContent);

      // Disable automatic popup on click
      layer.off("click");
      
      layer.on("click", (e) => {
        e.originalEvent.preventDefault();
        layer.openPopup();
      });
  
    }
  };

  return (
    <>
      {geojsonData && (
        <GeoJSON
          data={geojsonData}
          key={geojsonKey}
          style={{
            fillColor: "black",
            weight: 1.2,
            opacity: 1,
            color: Color,
            fillOpacity: 0.07,
          }}
          onEachFeature={onEachFeature}
        />
      )}
    </>
  );
};

export default LoadVectorData;