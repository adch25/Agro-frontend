import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { RiArrowGoBackLine } from "react-icons/ri";
import { useAlertContext } from "../context/AlertContext";
import { useLoaderContext } from "../context/LoaderContext";
import { MapContainer, TileLayer } from "react-leaflet";
import GeotiffLayer from "../components/GeoTiffLayer";
import LoadVectorData from "../components/LoadVectorData";
import { mapOptions } from "../components/MapOption";
import DynamicLegend from "../components/DynamicLegend";
import BaseMap from "../components/BaseMap";

const ProjectDetailsUser = () => {
  const navigate = useNavigate();
  const { projectid } = useParams();
  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { setIsLoading } = useLoaderContext();

  // State Declarations
  const [mapCenter, setMapCenter] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("aboutDam");
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedFloodMap, setSelectedFloodMap] = useState(null);
  const [selectedGeoJSONFile, setSelectedGeoJSONFile] = useState([]);
  const [selectedMap, setSelectedMap] = useState(mapOptions[0].url);
  const [fileColors, setFileColors] = useState({});

  const rasterColorsArray = [
    "#ff7c3d",
    "#ff9a5b",
    "#ffc469",
    "#ffea90",
    "#fffbb1",
    "#c8ecf4",
    "#a0d4e6",
    "#5ba8d2",
    "#346ead",
    "#1f4a85",
  ];

  // Helper Functions
  const toggleSubMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
    if (activeMenu === menuName) {
      setActiveTab(null);
    }
  };

  const handleCheckFloodMapChange = (file) => {
    setSelectedFloodMap(
      selectedFloodMap?.file_name === file.file_name ? null : file
    );
  };

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BACKEND_API_URL
        }/project-details/${projectid}`
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

  const groupFloodMapsByScenario = (floodMaps) => {
    return floodMaps.reduce((acc, file) => {
      if (!acc[file.scenario]) acc[file.scenario] = [];
      acc[file.scenario].push(file);
      return acc;
    }, {});
  };

  const groupedFloodMaps = groupFloodMapsByScenario(
    projectDetails?.flood_maps || []
  );

  // Effects
  useEffect(() => {
    fetchProjectDetails();
  }, [projectid]);

  const handleGoBack = () => navigate("/");

  return (
    <div className="main_page_container">
      <div className="project_details_container">
        <nav className="sidebar bg-white">
          <div className="position-sticky">
            <div className="list-group list-group-flush mx-3">
              <button
                className="list-group-item list-group-item-action py-2 ripple"
                onClick={handleGoBack}
              >
                <span style={{ color: "red" }}>
                  <RiArrowGoBackLine />
                    Back To Home
                </span>
              </button>

              <div className="list-group-item list-group-item-action py-2 ripple">
                <span
                  onClick={() => {
                    toggleSubMenu("flood");
                    setActiveTab("floodMap");
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Flood Map
                </span>
                {activeMenu === "flood" && (
                  <div
                    className="accordion"
                    id="accordionPanelsStayOpenExample"
                  >
                    <div className="accordion-item">
                      {Object.entries(groupedFloodMaps).map(
                        ([scenario, files]) => (
                          <div className="accordion-item" key={scenario}>
                            <h2
                              className="accordion-header"
                              id={`panelsStayOpen-heading-${scenario}`}
                            >
                              <button
                                className="accordion-button map_layer_collapse collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#panelsStayOpen-collapse-${scenario}`}
                                aria-expanded="false"
                                aria-controls={`panelsStayOpen-collapse-${scenario}`}
                              >
                                {scenario}
                              </button>
                            </h2>
                            <div
                              id={`panelsStayOpen-collapse-${scenario}`}
                              className="accordion-collapse collapse"
                              aria-labelledby={`panelsStayOpen-heading-${scenario}`}
                            >
                              <div className="accordion-body map_layer_collapse_body">
                                {files.map((file, index) => (
                                  <div key={index} className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={file.file_url}
                                      value={file.file_url}
                                      checked={
                                        selectedFloodMap &&
                                        selectedFloodMap.file_url ===
                                          file.file_url
                                      }
                                      onChange={() =>
                                        handleCheckFloodMapChange(file)
                                      }
                                    />
                                    <label htmlFor={file.file_name}>
                                      {file.file_name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    <hr
                      style={{
                        borderStyle: "dashed",
                        margin: "12px 0",
                        borderWidth: "2px",
                        color: "black",
                      }}
                    />
                    <div className="accordion-item">
                      <h2
                        className="accordion-header"
                        id="panelsStayOpen-heading3"
                      >
                        <button
                          className="accordion-button map_layer_collapse collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#panelsStayOpen-collapse3"
                          aria-expanded="false"
                          aria-controls="panelsStayOpen-collapse3"
                        >
                          Administrative Boundaries
                        </button>
                      </h2>
                      <div
                        id="panelsStayOpen-collapse3"
                        className="accordion-collapse collapse"
                        aria-labelledby="panelsStayOpen-heading3"
                      >
                        <div className="accordion-body map_layer_collapse_body">
                          {projectDetails?.GeoJSON_file?.map((file, index) => (
                            <div
                              key={index}
                              className="form-check"
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingRight: "15px",
                              }}
                            >
                              <div>
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={selectedGeoJSONFile.includes(
                                    file.file_url
                                  )}
                                  onChange={(e) => {
                                    const value = file.file_url;
                                    if (selectedGeoJSONFile.includes(value)) {
                                      setSelectedGeoJSONFile(
                                        selectedGeoJSONFile.filter(
                                          (item) => item !== value
                                        )
                                      );
                                    } else {
                                      setSelectedGeoJSONFile([
                                        ...selectedGeoJSONFile,
                                        value,
                                      ]);
                                    }
                                  }}
                                />
                                <label className="form-check-label">
                                  {file.file_name}
                                </label>
                              </div>
                              <input
                                type="color"
                                value={fileColors[file.file_url] || "#111111"}
                                onChange={(e) => {
                                  setFileColors((prev) => ({
                                    ...prev,
                                    [file.file_url]: e.target.value,
                                  }));
                                }}
                                style={{
                                  width: "30px",
                                  height: "20px",
                                  padding: "2px",
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="tabs_container">
          {activeTab === "floodMap" && (
            <div id="floodMap" className="tab-content">
              <div className="page_section_heading">
                <h2>Flood Map</h2>
              </div>
              <MapContainer
                center={[22.6, 77.4]}
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
                  <div
                    className="accordion"
                    id="accordionPanelsStayOpenExample"
                  >
                    <div className="accordion-item">
                      <h2
                        className="accordion-header"
                        id="panelsStayOpen-headingOne"
                      >
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
                      mapOptions.find((option) => option.url === selectedMap)
                        ?.subdomains || []
                    }
                    attribution={
                      mapOptions.find((option) => option.url === selectedMap)
                        ?.attribution || ""
                    }
                  />
                )}

                {selectedGeoJSONFile.length > 0 &&
                  selectedGeoJSONFile.map((fileurl, index) => (
                    <LoadVectorData
                      key={index}
                      url={`${
                        import.meta.env.VITE_API_BACKEND_API_URL
                      }/${fileurl}`}
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
                  </>
                )}

                <GeotiffLayer
                  selectedFloodMap={selectedFloodMap}
                  colors={rasterColorsArray}
                  boundaryNames={selectedGeoJSONFile.map((file) => {
                    const fileDetails = projectDetails?.GeoJSON_file?.find(
                      (f) => f.file_url === file
                    );
                    return fileDetails
                      ? fileDetails.file_name
                      : "Unknown Boundary";
                  })}
                  fileName={selectedFloodMap?.file_name ?? "Default File Name"}
                  // Unit={selectedFloodMap.legend_unit}
                  Unit={selectedFloodMap?.legend_unit ?? "No Unit"}
                />
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsUser;
