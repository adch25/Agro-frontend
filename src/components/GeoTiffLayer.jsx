import { useEffect, useRef } from "react";
import proj4 from "proj4";
import * as L from "leaflet";
import { useLeafletContext } from "@react-leaflet/core";
import { useMap } from "react-leaflet";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import geoblaze from "geoblaze";
import * as turf from "@turf/turf";

window.proj4 = proj4;

const GeotiffLayer = ({
  colors,
  selectedFloodMap,
  boundaryNames,
  fileName,
  Unit,
}) => {
  const file_url = selectedFloodMap && selectedFloodMap.file_url;
  const min = selectedFloodMap ? selectedFloodMap.min : 0;
  const max = selectedFloodMap ? selectedFloodMap.max : 0;

  const generateValues = (min, max, length) => {
    if (length < 2) return [min];
    const step = (max - min) / (length - 1);
    return Array.from({ length }, (_, i) =>
      Number((min + i * step).toFixed(1))
    );
  };

  const values = generateValues(min, max, 7);
  const geoTiffLayerRef = useRef();
  const clickEventHandlerRef = useRef();

  const options = {
    pixelValuesToColorFn: (vals) => {
      const value = vals[0];
      if (value <= values[0]) return null;
      else if (value < values[1]) return colors[0];
      else if (value < values[2]) return colors[1];
      else if (value < values[3]) return colors[2];
      else if (value < values[4]) return colors[3];
      else if (value < values[5]) return colors[4];
      else return colors[5];
    },
    resolution: 256,
    opacity: 1,
  };

  const context = useLeafletContext();
  const map = useMap();

  useEffect(() => {
    const container = context.layerContainer || context.map;

    if (file_url) {
      fetch(`${import.meta.env.VITE_API_BACKEND_API_URL}/${file_url}`)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
          parseGeoraster(arrayBuffer).then((georaster) => {
            console.log("NoData value:", georaster.noDataValue);

            options.georaster = georaster;
            geoTiffLayerRef.current = new GeoRasterLayer(options);
            container.addLayer(geoTiffLayerRef.current);

            map.fitBounds(geoTiffLayerRef.current.getBounds());

            const handleMapClick = async (event) => {
              const lat = event.latlng.lat;
              const lng = event.latlng.lng;

              // Get GeoTIFF value
              const pixelValue = await geoblaze.identify(georaster, [lng, lat]);

              // Collect GeoJSON features' properties
              const geoJSONProperties = [];
              const point = turf.point([lng, lat]);

              map.eachLayer((layer) => {
                if (layer instanceof L.FeatureGroup) {
                  layer.eachLayer((featureLayer) => {
                    if (featureLayer.feature) {
                      const feature = featureLayer.feature;
                      try {
                        const geometry = feature.geometry;
                        if (
                          geometry &&
                          (geometry.type === "Polygon" ||
                            geometry.type === "MultiPolygon")
                        ) {
                          const turfFeature = turf.feature(geometry);
                          if (turf.booleanPointInPolygon(point, turfFeature)) {
                            geoJSONProperties.push(feature.properties);
                          }
                        }
                      } catch (error) {
                        console.error("Error processing feature:", error);
                      }
                    }
                  });
                }
              });

              // Build popup content
              let popupContent = "";
              if (
                pixelValue &&
                pixelValue[0] !== undefined &&
                pixelValue[0] !== georaster.noDataValue &&
                !isNaN(pixelValue[0])
              ) {
                // popupContent += `<b>${fileName}:</b> ${pixelValue[0].toFixed(2)}<br/>`;
                popupContent += `<b>${fileName}:</b> ${pixelValue[0].toFixed(
                  2
                )} ${Unit}<br/>`;
              }

              geoJSONProperties.forEach((props, index) => {
                // popupContent += `<b>Boundary ${index + 1}:</b> ${boundaryNames[index] || "Unknown Boundary"}<br/>`;
                popupContent += `<b style="color: red; font-size: 15px;">Boundary ${
                  index + 1
                }:</b> ${boundaryNames[index] || "Unknown Boundary"}<br/>`;

                Object.entries(props).forEach(([key, value]) => {
                  popupContent += `<strong>${key}:</strong> ${value}<br/>`;
                });
              });

             
              map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                  map.removeLayer(layer);
                }
              });

              if (popupContent) {
                const marker = L.marker([lat, lng])
                  .addTo(map)
                  .bindPopup(popupContent)
                  .openPopup();
              }
            };

            clickEventHandlerRef.current = handleMapClick;

            map.on("click", handleMapClick);
          });
        });
    } else {
      if (geoTiffLayerRef.current) {
        container.removeLayer(geoTiffLayerRef.current);
        geoTiffLayerRef.current = null;
      }

      if (clickEventHandlerRef.current) {
        map.off("click", clickEventHandlerRef.current);
        clickEventHandlerRef.current = null;
      }

      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
    }

    return () => {
      if (geoTiffLayerRef.current) {
        container.removeLayer(geoTiffLayerRef.current);
      }
      if (clickEventHandlerRef.current) {
        map.off("click", clickEventHandlerRef.current);
      }
    };
  }, [context, file_url, map, options]);

  return null;
};

export default GeotiffLayer;