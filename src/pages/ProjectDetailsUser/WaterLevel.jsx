import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { useAlertContext } from "../../context/AlertContext";
import { useLoaderContext } from "../../context/LoaderContext";
import Sidebar from "./Sidebar";

const WaterLevel = () => {
  const { projectid } = useParams();
  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { setIsLoading } = useLoaderContext();
  const { loginUser } = useUserContext();
  const [projectDetails, setProjectDetails] = useState(null);
  const [waterLevelValue, setWaterLevelValue] = useState("");
  const [waterLevelUnit, setWaterLevelUnit] = useState("Meter");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

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
  useEffect(() => {
    fetchProjectDetails();
  }, [projectid]);

  const handleAddWaterLevel = async () => {
    if (!waterLevelValue) {
      setAlertMessage("Please enter a water level value.");
      setShowAlert(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BACKEND_API_URL}/water-level/${projectid}`,
        {
          date: selectedDate,
          value: parseFloat(waterLevelValue),
          unit: waterLevelUnit,
          addedBy: loginUser.email,
        }
      );
      if (response.status === 200) {
        setAlertMessage("Water level added successfully!");
        setShowAlert(true);
        setWaterLevelValue("");
        setSelectedDate(new Date().toISOString().split("T")[0]);
        fetchProjectDetails();
      }
    } catch (error) {
      setAlertMessage("Failed to add water level.");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadWaterLevelCSV = (data) => {
    const headers = ["Date", "Water Level", "Unit"];
    const rows = data.map((entry) => {
      const formattedDate = entry.timestamp
        ? new Date(entry.timestamp).toLocaleDateString() || "Invalid Date"
        : "N/A";
      return `${formattedDate},${entry.value},${entry.unit}`;
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "water_level.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUserNameByEmail = (email) => {
    const user = projectDetails?.users?.find((u) => u.email === email);
    return user ? user.name || user.email : email;
  };

  return (
    <div className="main_page_container">
      <div className="project_details_container">
        <Sidebar />
        <div className="tabs_container">
          <div id="waterLevel" className="tab-content">
            <div className="page_section_heading">
              <h2>Reservoir Water Level</h2>
            </div>
            <div className="accordion" id="accordionPanelsStayOpenExample">
              <div className="accordion-item">
                <h2 className="accordion-header" id="panelsStayOpen-headingOne">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#panelsStayOpen-collapseOne"
                    aria-expanded="true"
                    aria-controls="panelsStayOpen-collapseOne"
                  >
                    Add Water Level Data
                  </button>
                </h2>
                <div
                  id="panelsStayOpen-collapseOne"
                  className="accordion-collapse collapse"
                  aria-labelledby="panelsStayOpen-headingOne"
                >
                  <div className="accordion-body">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="auth_item">
                          <input
                            type="number"
                            value={waterLevelValue}
                            onChange={(e) => setWaterLevelValue(e.target.value)}
                            placeholder="Water Level Value"
                          />
                          <select
                            value={waterLevelUnit}
                            onChange={(e) => setWaterLevelUnit(e.target.value)}
                            name="dam_height_unit"
                            style={{
                              marginLeft: "10px",
                              padding: "5px",
                              borderRadius: "4px",
                              border: "1px solid #ccc",
                            }}
                          >
                            <option value="Meter">M</option>
                            <option value="Centimeter">CM</option>
                            <option value="Feet">F</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="auth_item">
                          <input
                            type="date"
                            id="date-picker"
                            className="form-control"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div
                          className="auth_button"
                          style={{ marginTop: "10px" }}
                        >
                          <button
                            onClick={handleAddWaterLevel}
                            style={{ padding: "7px" }}
                          >
                            Add Water Level
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="accordion-item">
                <h2 className="accordion-header" id="panelsStayOpen-headingTwo">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#panelsStayOpen-collapseSeven"
                    aria-expanded="true"
                    aria-controls="panelsStayOpen-collapseSeven"
                  >
                    View and Download Water Level Data
                  </button>
                </h2>
                <div
                  id="panelsStayOpen-collapseSeven"
                  className="accordion-collapse collapse"
                  aria-labelledby="panelsStayOpen-headingTwo"
                >
                  <div className="accordion-body">
                    <div className="row">
                      {projectDetails?.water_levels?.length > 0 ? (
                        <div className="col-md-12 mb-3">
                          <button
                            className="btn btn-primary mb-3"
                            onClick={() =>
                              downloadWaterLevelCSV(projectDetails.water_levels)
                            }
                          >
                            Download Water Level Data (.csv)
                          </button>
                          <table className="item_table">
                            <thead>
                              <tr>
                                <th style={{ width: "25%" }}>Date</th>
                                <th style={{ width: "25%" }}>Water Level</th>
                                <th style={{ width: "25%" }}>Unit</th>
                                <th style={{ width: "25%" }}>Added By</th>
                              </tr>
                            </thead>
                            <tbody>
                              {projectDetails.water_levels.map((wl, index) => (
                                <tr key={index}>
                                  <td>
                                    {wl.timestamp
                                      ? new Date(
                                          wl.timestamp
                                        ).toLocaleDateString() || "Invalid Date"
                                      : "N/A"}
                                  </td>
                                  <td>{wl.value}</td>
                                  <td>{wl.unit}</td>
                                  <td>{getUserNameByEmail(wl.addedBy)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p style={{ textAlign: "center", fontSize: "20px" }}>
                          ℹ️ Uh-oh! Reservoir water level data is currently unavailable. You can add it in the 'Add Water Level' section above.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterLevel;
