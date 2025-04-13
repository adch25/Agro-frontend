import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAlertContext } from "../../context/AlertContext";
import { useLoaderContext } from "../../context/LoaderContext";
import { useUserContext } from "../../context/UserContext";
import Sidebar from "./Sidebar";

const Discharge = () => {
  const { projectid } = useParams();
  const [dischargeValue, setDischargeValue] = useState("");
  const [dischargeUnit, setDischargeUnit] = useState("Cumec");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [projectDetails, setProjectDetails] = useState(null);

  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { setIsLoading } = useLoaderContext();
  const { loginUser } = useUserContext();

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

  const handleDischargeWaterLevel = async () => {
    if (!dischargeValue) {
      setAlertMessage("Please enter a Discharge Level value.");
      setShowAlert(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${
          import.meta.env.VITE_API_BACKEND_API_URL
        }/discharge-level/${projectid}`,
        {
          date: selectedDate,
          value: parseFloat(dischargeValue),
          unit: dischargeUnit,
          addedBy: loginUser.email,
        }
      );
      if (response.status === 200) {
        setAlertMessage("Discharge level added successfully!");
        setShowAlert(true);
        setDischargeValue("");
        setSelectedDate(new Date().toISOString().split("T")[0]);
        fetchProjectDetails();
      }
    } catch (error) {
      setAlertMessage("Failed to add Discharge level.");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDischargeCSV = (data) => {
    const headers = ["Date", "Discharge", "Unit"];
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
    link.setAttribute("download", "discharge.csv");
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
          <div id="discharge" className="tab-content">
            <div className="page_section_heading">
              <h2>Dam Discharge</h2>
            </div>
            <div className="accordion" id="accordionPanelsStayOpenExample">
              <div className="accordion-item">
                <h2
                  className="accordion-header"
                  id="panelsStayOpen-headingThree"
                >
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#panelsStayOpen-collapseOne"
                    aria-expanded="true"
                    aria-controls="panelsStayOpen-collapseOne"
                  >
                    Add Discharge Data
                  </button>
                </h2>
                <div
                  id="panelsStayOpen-collapseOne"
                  className="accordion-collapse collapse"
                  aria-labelledby="panelsStayOpen-headingThree"
                >
                  <div className="accordion-body">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="auth_item">
                          <input
                            type="number"
                            value={dischargeValue}
                            onChange={(e) => setDischargeValue(e.target.value)}
                            placeholder="Discharge Value"
                          />
                          <select
                            value={dischargeUnit}
                            onChange={(e) => setDischargeUnit(e.target.value)}
                            name="dam_height_unit"
                            style={{
                              marginLeft: "10px",
                              padding: "5px",
                              borderRadius: "4px",
                              border: "1px solid #ccc",
                            }}
                          >
                            <option value="Cumec">Cumec</option>
                            <option value="Cusec">Cusec</option>
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
                            onClick={handleDischargeWaterLevel}
                            style={{ padding: "7px" }}
                          >
                            Add Discharge
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2
                  className="accordion-header"
                  id="panelsStayOpen-headingFour"
                >
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#panelsStayOpen-collapseSeven"
                    aria-expanded="true"
                    aria-controls="panelsStayOpen-collapseSeven"
                  >
                    View and Download Discharge Data 
                  </button>
                </h2>
                <div
                  id="panelsStayOpen-collapseSeven"
                  className="accordion-collapse collapse"
                  aria-labelledby="panelsStayOpen-headingFour"
                >
                  <div className="accordion-body">
                    <div className="row">
                      {projectDetails?.discharge_levels?.length > 0 ? (
                        <div className="col-md-12 mb-3">
                          <button
                            className="btn btn-primary mb-3"
                            onClick={() =>
                              downloadDischargeCSV(
                                projectDetails.discharge_levels
                              )
                            }
                          >
                            Download Discharge Data (.csv)
                          </button>
                          <table className="item_table">
                            <thead>
                              <tr>
                                <th style={{ width: "25%" }}>Date</th>
                                <th style={{ width: "25%" }}>Discharge</th>
                                <th style={{ width: "25%" }}>Unit</th>
                                <th style={{ width: "25%" }}>Added By</th>
                              </tr>
                            </thead>
                            <tbody>
                              {projectDetails.discharge_levels.map(
                                (dl, index) => (
                                  <tr key={index}>
                                    <td>
                                      {dl.timestamp
                                        ? new Date(
                                            dl.timestamp
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </td>
                                    <td>{dl.value}</td>
                                    <td>{dl.unit}</td>
                                    <td>{getUserNameByEmail(dl.addedBy)}</td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p style={{ textAlign: "center", fontSize: "20px" }}>
                          ℹ️ Uh-oh! Discharge level data is currently unavailable. You can
                          add it in the 'Add Discharge' section above.
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

export default Discharge;
