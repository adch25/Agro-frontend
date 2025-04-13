import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RiArrowGoBackLine } from "react-icons/ri";
import axios from "axios";
import { useAlertContext } from "../../context/AlertContext";
import { useLoaderContext } from "../../context/LoaderContext";

const Sidebar = ({
  selectedFloodMap,
  setSelectedFloodMap,
  selectedGeoJSONFile,
  setSelectedGeoJSONFile,
  fileColors,
  setFileColors,
}) => {
  const navigate = useNavigate();
  const { projectid } = useParams();
  const [activeMenu, setActiveMenu] = useState(null);
  const [showInstrumentationSubs, setShowInstrumentationSubs] = useState(false);
  const [projectDetails, setProjectDetails] = useState(null);
  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { setIsLoading } = useLoaderContext();

  const toggleSubMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
    if (activeMenu === menuName && menuName === "Inspection") {
      setShowInstrumentationSubs(false);
    }
    if (menuName === "flood" && activeMenu !== "flood") {
      navigate(`/project/${projectid}/flood-map`);
    }
  };

  const toggleInstrumentationSubs = () => {
    setShowInstrumentationSubs(!showInstrumentationSubs);
  };

  const handleGoBack = () => {
    navigate("/");
  };

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BACKEND_API_URL
        }/project-details/${projectid}`
      );
      setProjectDetails(response.data.project);
    } catch (error) {
      setAlertMessage("Error fetching project details:", error);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckFloodMapChange = (file) => {
    setSelectedFloodMap(
      selectedFloodMap?.file_name === file.file_name ? null : file
    );
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

  useEffect(() => {
    fetchProjectDetails();
  }, [projectid]);

  return (
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

          <button
            onClick={() => navigate(`/project/${projectid}`)}
            className="list-group-item list-group-item-action py-2 ripple"
          >
            <span>About Dam</span>
          </button>

          <div className="list-group-item list-group-item-action py-2 ripple">
            <span
              onClick={() => toggleSubMenu("reportRespond")}
              style={{ cursor: "pointer" }}
            >
              Report/Respond
            </span>
            {activeMenu === "reportRespond" && (
              <div className="ms-3">
                <button
                  onClick={() => navigate(`/project/${projectid}/report-issue`)}
                  className="list-group-item list-group-item-action py-2 ripple"
                >
                  <span>Report Issue</span>
                </button>
                <button
                  onClick={() =>
                    navigate(`/project/${projectid}/respond-issue`)
                  }
                  className="list-group-item list-group-item-action py-2 ripple"
                >
                  <span>Respond Issue</span>
                </button>
                <button
                  onClick={() =>
                    navigate(`/project/${projectid}/archive-of-issue`)
                  }
                  className="list-group-item list-group-item-action py-2 ripple"
                >
                  <span>Archive Issue</span>
                </button>
                <button
                  onClick={() => navigate(`/project/${projectid}/statistics`)}
                  className="list-group-item list-group-item-action py-2 ripple"
                >
                  <span>Statistics</span>
                </button>
              </div>
            )}
          </div>

          <div className="list-group-item list-group-item-action py-2 ripple">
            <span
              onClick={() => toggleSubMenu("observation")}
              style={{ cursor: "pointer" }}
            >
              Observation
            </span>
            {activeMenu === "observation" && (
              <div className="ms-3">
                <button
                  onClick={() => navigate(`/project/${projectid}/water-level`)}
                  className="list-group-item list-group-item-action py-2 ripple"
                >
                  <span>Water Level</span>
                </button>
                <button
                  onClick={() => navigate(`/project/${projectid}/discharge`)}
                  className="list-group-item list-group-item-action py-2 ripple"
                >
                  <span>Discharge</span>
                </button>
              </div>
            )}
          </div>

          <div className="list-group-item list-group-item-action py-2 ripple">
            <span
              onClick={() => toggleSubMenu("Inspection")}
              style={{ cursor: "pointer" }}
            >
              Inspection
            </span>
            {activeMenu === "Inspection" && (
              <div className="ms-3">
                <button
                  onClick={toggleInstrumentationSubs}
                  className="list-group-item list-group-item-action py-2 ripple"
                >
                  <span>Instrumentation</span>
                </button>
                {showInstrumentationSubs && (
                  <div className="ms-3">
                    <button
                      onClick={() =>
                        navigate(
                          `/project/${projectid}/hydro-meteorological-instruments`
                        )
                      }
                      className="list-group-item list-group-item-action py-2 ripple"
                    >
                      <span>Hydro-Meteorological Instruments</span>
                    </button>
                    <button
                      onClick={() =>
                        navigate(
                          `/project/${projectid}/geo-technical-instruments`
                        )
                      }
                      className="list-group-item list-group-item-action py-2 ripple"
                    >
                      <span>Geo-Technical Instruments</span>
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/project/${projectid}/geodetic-instruments`)
                      }
                      className="list-group-item list-group-item-action py-2 ripple"
                    >
                      <span>Geodetic Instruments</span>
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/project/${projectid}/seismic-instruments`)
                      }
                      className="list-group-item list-group-item-action py-2 ripple"
                    >
                      <span>Seismic Instruments</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="list-group-item list-group-item-action py-2 ripple">
            <span
              onClick={() => toggleSubMenu("flood")}
              style={{ cursor: "pointer" }}
            >
              Flood Map
            </span>
            {activeMenu === "flood" && (
              <div className="accordion" id="accordionPanelsStayOpenExample">
                <div className="accordion-item">
                  {Object.entries(groupedFloodMaps).map(([scenario, files]) => (
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
                                  selectedFloodMap.file_url === file.file_url
                                }
                                onChange={() => handleCheckFloodMapChange(file)}
                              />
                              <label htmlFor={file.file_name}>
                                {file.file_name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <h2 className="accordion-header" id="panelsStayOpen-heading3">
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

          <button
            onClick={() => navigate(`/project/${projectid}/weather-forecast`)}
            className="list-group-item list-group-item-action py-2 ripple"
          >
            <span>Weather Forecast</span>
          </button>

          <button
            onClick={() => navigate(`/project/${projectid}/reports`)}
            className="list-group-item list-group-item-action py-2 ripple"
          >
            <span>Reports</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
