import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { useAlertContext } from "../../context/AlertContext";
import { useLoaderContext } from "../../context/LoaderContext";
import { MapContainer, TileLayer } from "react-leaflet";
import GeotiffLayer from "../../components/GeoTiffLayer";
import LoadVectorData from "../../components/LoadVectorData";
import { mapOptions } from "../../components/MapOption";
import DynamicLegend from "../../components/DynamicLegend";
import BaseMap from "../../components/BaseMap";
import Sidebar from "./Sidebar";

const FloodMap = () => {
  const { projectid } = useParams();
  const [mapCenter, setMapCenter] = useState([22.6, 77.4]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [selectedFloodMap, setSelectedFloodMap] = useState(null);
  const [selectedGeoJSONFile, setSelectedGeoJSONFile] = useState([]);
  const [selectedMap, setSelectedMap] = useState(mapOptions[0].url);
  const [fileColors, setFileColors] = useState({});
  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { setIsLoading } = useLoaderContext();

  const rasterColorsArray = [
    "#ff7c3d", "#ff9a5b", "#ffc469", "#ffea90", "#fffbb1",
    "#c8ecf4", "#a0d4e6", "#5ba8d2", "#346ead", "#1f4a85",
  ];

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BACKEND_API_URL}/project-details/${projectid}`
      );
      setProjectDetails(response.data.project);
      if (
        response.data.project &&
        !isNaN(parseFloat(response.data.project.latitude)) &&
        !isNaN(parseFloat(response.data.project.longitude))
      ) {
        setMapCenter([
          parseFloat(response.data.project.latitude),
          parseFloat(response.data.project.longitude),
        ]);
      }
    } catch (error) {
      setAlertMessage("Error fetching project details:", error);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectid]);

  return (
    <div className="main_page_container">
      <div className="project_details_container">
        <Sidebar
          selectedFloodMap={selectedFloodMap}
          setSelectedFloodMap={setSelectedFloodMap}
          selectedGeoJSONFile={selectedGeoJSONFile}
          setSelectedGeoJSONFile={setSelectedGeoJSONFile}
          fileColors={fileColors}
          setFileColors={setFileColors}
        />
        <div className="tabs_container">
          <div id="floodMap" className="tab-content">
            <div className="page_section_heading">
              <h2>Flood Map</h2>
            </div>
            <MapContainer
              center={mapCenter}
              zoom={5}
              style={{
                width: "100%",
                height: "74vh",
                borderRadius: "10px",
                backgroundColor: "white",
                border: "none",
                margin: "auto",
              }}
              scrollWheelZoom={true}
            >
              <BaseMap />
              <div className="map_layer_manager">
                <div className="accordion" id="accordionPanelsStayOpenExample">
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="panelsStayOpen-headingOne">
                      <button
                        className="accordion-button map_layer_collapse collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#panelsStayOpen-collapseOne"
                        aria-expanded="false"
                        aria-controls="panelsStayOpen-collapseOne"
                      >
                        Base Map
                      </button>
                    </h2>
                    <div
                      id="panelsStayOpen-collapseOne"
                      className="accordion-collapse collapse"
                      aria-labelledby="panelsStayOpen-headingOne"
                    >
                      <div className="accordion-body map_layer_collapse_body">
                        {mapOptions.map((option, index) => (
                          <div key={index} className="form-check">
                            <input
                              type="radio"
                              className="form-check-input"
                              id={option.name}
                              name="data_type"
                              value={option.url}
                              checked={selectedMap === option.url}
                              onChange={(e) => setSelectedMap(e.target.value)}
                            />
                            <label htmlFor={option.name}>{option.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedMap && (
                <TileLayer
                  url={selectedMap}
                  subdomains={
                    mapOptions.find((option) => option.url === selectedMap)?.subdomains || []
                  }
                  attribution={
                    mapOptions.find((option) => option.url === selectedMap)?.attribution || ""
                  }
                />
              )}

              {selectedGeoJSONFile.length > 0 &&
                selectedGeoJSONFile.map((fileurl, index) => (
                  <LoadVectorData
                    key={index}
                    url={`${import.meta.env.VITE_API_BACKEND_API_URL}/${fileurl}`}
                    Color={fileColors[fileurl] || "#111111"}
                  />
                ))}

              {selectedFloodMap && (
                <>
                  <DynamicLegend
                    ColorLegendsDataItem={{
                      Title: `${selectedFloodMap.file_name} (${selectedFloodMap.legend_unit})`,
                      min: selectedFloodMap.min,
                      max: selectedFloodMap.max,
                      Colors: rasterColorsArray,
                    }}
                  />
                  <GeotiffLayer
                    selectedFloodMap={selectedFloodMap}
                    colors={rasterColorsArray}
                    boundaryNames={selectedGeoJSONFile.map((file) => {
                      const fileDetails = projectDetails?.GeoJSON_file?.find(
                        (f) => f.file_url === file
                      );
                      return fileDetails ? fileDetails.file_name : "Unknown Boundary";
                    })}
                    fileName={selectedFloodMap?.file_name ?? "Default File Name"}
                    Unit={selectedFloodMap?.legend_unit ?? "No Unit"}
                  />
                </>
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloodMap;