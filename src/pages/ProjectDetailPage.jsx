import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useLoaderContext } from "../context/LoaderContext";
import { useAlertContext } from "../context/AlertContext";
import { CiCirclePlus } from "react-icons/ci";
import { CiCircleMinus } from "react-icons/ci";
import { useUserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { RiArrowGoBackLine } from "react-icons/ri";

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("damDetails");
  const { projectid } = useParams();
  const { token } = useUserContext();
  const [projectDetails, setProjectDetails] = useState(null);
  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { setIsLoading } = useLoaderContext();
  const [updateUser, setUpdateUser] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState(
    Array.from({ length: 1 }, () => ({
      name: "",
      email: "",
      mobile: "",
      position: "",
      isProjectAdmin: false,
    }))
  );

  const [newProjectDetail, setNewProjectDetail] = useState({
    project_name: "",
    department_name: "",
    address: "",
    purpose_of_dam: [],
    dam_height: { value: "", unit: "Meter" },
    reservoir_area: { value: "", unit: "M²" },
    reservoir_volume: { value: "", unit: "M³" },
    hfl: { value: "", unit: "Meter" },
    mrl: { value: "", unit: "Meter" },
    hydropower_capacity: { value: "", unit: "MW" },
    project_description: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (projectDetails) {
      setNewProjectDetail({
        project_name: projectDetails.project_name,
        department_name: projectDetails.department_name,
        address: projectDetails.address,
        purpose_of_dam: projectDetails.purpose_of_dam || [],
        dam_height: projectDetails.dam_height,
        reservoir_area: projectDetails.reservoir_area,
        reservoir_volume: projectDetails.reservoir_volume,
        hfl: projectDetails.hfl,
        mrl: projectDetails.mrl,
        hydropower_capacity: projectDetails.hydropower_capacity,
        project_description: projectDetails.project_description,
        latitude: projectDetails.latitude,
        longitude: projectDetails.longitude,
      });
    }
  }, [projectDetails]);

  const addUser = () => {
    setUsers((prevUsers) => [
      ...prevUsers,
      // { name: "", email: "", mobile: "", isProjectAdmin: false },
      { name: "", email: "", mobile: "", position: "", isProjectAdmin: false },
    ]);
  };

  const handleUserChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const [property, userIndex] = name.split("_").slice(1);
    setUsers((prevUsers) =>
      prevUsers.map((user, i) =>
        i === parseInt(userIndex) - 1
          ? { ...user, [property]: type === "checkbox" ? checked : value }
          : user
      )
    );
  };

  const handleEditProject = () => {
    setUpdateUser(true);
  };

  const handleAddUser = () => {
    const validUsers = users.every(
      (user) => user.name && user.email && user.mobile && user.position
    );
    if (!validUsers) {
      setAlertMessage(
        "Invalid input for one or more users. All fields (name, email, mobile, position) are required."
      );
      setShowAlert(true);
      return;
    }

    if (projectDetails && validUsers) {
      setIsLoading(true);
      axios
        .post(`${import.meta.env.VITE_API_BACKEND_API_URL}/add-users`, {
          users: users,
          project_id: projectid,
        })
        .then((res) => {
          setAlertMessage(res.data.message);
          setShowAlert(true);
          setIsLoading(false);
          setUpdateUser(false);
          setUsers(
            Array.from({ length: 1 }, () => ({
              name: "",
              email: "",
              mobile: "",
              position: "",
              isProjectAdmin: false,
            }))
          );
          fetchProjectDetails();
        })
        .catch((err) => {
          setAlertMessage(err.response.data.message);
          setShowAlert(true);
          setIsLoading(false);
          setUpdateUser(false);
        });
    } else {
      setAlertMessage("Please select a file to upload.");
      setShowAlert(true);
    }
  };

  const handleUpdateProject = () => {
    const {
      project_name,
      department_name,
      address,
      purpose_of_dam,
      dam_height,
      reservoir_area,
      reservoir_volume,
      hfl,
      mrl,
      hydropower_capacity,
      project_description,
      latitude,
      longitude,
    } = newProjectDetail;

    if (
      projectDetails &&
      (project_name ||
        department_name ||
        address ||
        purpose_of_dam.length > 0 ||
        dam_height.value ||
        reservoir_area.value ||
        reservoir_volume.value ||
        hfl.value ||
        mrl.value ||
        hydropower_capacity.value ||
        project_description ||
        latitude ||
        longitude)
    ) {
      setIsLoading(true);
      axios
        .post(
          `${import.meta.env.VITE_API_BACKEND_API_URL}/update-project-details`,
          {
            project_id: projectid,
            project_name,
            department_name,
            address,
            purpose_of_dam,
            dam_height,
            reservoir_area,
            reservoir_volume,
            hfl,
            mrl,
            hydropower_capacity,
            project_description,
            latitude,
            longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          setAlertMessage(res.data.message);
          setShowAlert(true);
          setIsLoading(false);
          setUpdateUser(false);
          fetchProjectDetails();
        })
        .catch((err) => {
          setAlertMessage(err.response.data.message);
          setShowAlert(true);
          setIsLoading(false);
          setUpdateUser(false);
        });
    } else {
      setAlertMessage("Please Edit At least one field");
      setShowAlert(true);
      setUpdateUser(false);
    }
  };

  const handleProjectDetailsChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "purpose_of_dam") {
      setNewProjectDetail((prev) => {
        const purposes = [...prev.purpose_of_dam];
        if (checked) {
          purposes.push(value);
        } else {
          const index = purposes.indexOf(value);
          if (index > -1) purposes.splice(index, 1);
        }
        return { ...prev, purpose_of_dam: purposes };
      });
    } else if (name.includes("_unit")) {
      const baseName = name.replace("_unit", "");
      setNewProjectDetail((prev) => ({
        ...prev,
        [baseName]: { ...prev[baseName], unit: value },
      }));
    } else if (
      [
        "dam_height",
        "hfl",
        "mrl",
        "reservoir_area",
        "reservoir_volume",
        "hydropower_capacity",
      ].includes(name)
    ) {
      setNewProjectDetail((prev) => ({
        ...prev,
        [name]: { ...prev[name], value },
      }));
    } else {
      setNewProjectDetail((prev) => ({ ...prev, [name]: value }));
    }
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
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectid]);

  const removeUser = () => {
    if (users.length > 1) {
      setUsers((prevUsers) => prevUsers.slice(0, -1));
    }
  };

  const handleDeleteUser = (email) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmed) {
      return;
    }
    setIsLoading(true);
    //! Make the API call to delete the user
    axios({
      method: "delete",
      url: `${import.meta.env.VITE_API_BACKEND_API_URL}/delete_user`,
      data: { userEmail: email, projectid: projectid },

      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setAlertMessage(res.data.message);
        setShowAlert(true);
        setIsLoading(false);
        fetchProjectDetails();
      })
      .catch((err) => {
        setAlertMessage(err.response.data.message);
        setShowAlert(true);
        setIsLoading(false);
      });
  };

  const handleUploadFile = async (fileId, fileType, accept) => {
    const fileInput = document.getElementById(`${fileId}_input_file`);
    const fileNameInput = document.getElementById(`${fileId}_input_file_name`);
    const scenarioInput = document.getElementById(`${fileId}_input_scenario`);
    const legendUnitInput = document.getElementById(
      `${fileId}_input_legend_unit`
    );

    if (
      !fileInput ||
      !fileNameInput ||
      (fileType === "flood_maps" && (!scenarioInput || !legendUnitInput))
    ) {
      setAlertMessage("Please fill all required fields");
      setShowAlert(true);
      return;
    }

    const file = fileInput.files[0];
    const fileName = fileNameInput.value.trim();
    const scenario =
      fileType === "flood_maps" ? scenarioInput.value.trim() : null;
    const legendUnit =
      fileType === "flood_maps" ? legendUnitInput.value.trim() : null;

    if (
      !file ||
      !fileName ||
      (fileType === "flood_maps" && (!scenario || !legendUnit))
    ) {
      setAlertMessage("Please fill all required fields");
      setShowAlert(true);
      return;
    }

    const formData = new FormData();
    formData.append("projectid", projectid);
    formData.append("file", file);
    formData.append("filetype", fileType);
    formData.append("filename", fileName);

    if (fileType === "flood_maps") {
      formData.append("scenario", scenario);
      formData.append("legend_unit", legendUnit);
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BACKEND_API_URL}/upload-file`,
        formData
      );
      setAlertMessage(res.data.message);
      setShowAlert(true);
      fetchProjectDetails();
      fileInput.value = "";
      fileNameInput.value = "";
      if (fileType === "flood_maps" && scenarioInput && legendUnitInput) {
        scenarioInput.value = "";
        legendUnitInput.value = "";
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "File upload failed.";
      setAlertMessage(errorMessage);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFileInput = (fileId, label, fileType, accept) => (
    <div className="mb-3">
      <div className="row g-2 align-items-start">
        {" "}
        <div className="col-md-6">
          <label className="form-label">{label}</label>
          <input
            type="text"
            className="form-control"
            id={`${fileId}_input_file_name`}
            placeholder="File Name"
          />
        </div>
        <div className="col-md-6">
          {" "}
          <label htmlFor={`${fileId}_input_file`} className="form-label">
            Select File
          </label>{" "}
          <div className="d-flex align-items-center">
            {" "}
            <input
              className="form-control me-2"
              type="file"
              id={`${fileId}_input_file`}
              accept={accept}
            />
            <button
              className="btn btn-success"
              onClick={() => handleUploadFile(fileId, fileType)}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const handleDeleteFile = async (fileID, fileType) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      setIsLoading(true);
      try {
        const res = await axios.delete(
          `${import.meta.env.VITE_API_BACKEND_API_URL}/delete-file`,
          {
            data: { fileID, projectid, fileType },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAlertMessage(res.data.message);
        setShowAlert(true);
        fetchProjectDetails();
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "An unexpected error occurred during file deletion.";
        console.error("File deletion error:", error);
        setAlertMessage(errorMessage);
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderFileTable = (files, fileTypeLabel, fileType) => {
    if (!files || files.length === 0) return null;

    if (fileType === "flood_maps") {
      const groupedFiles = files.reduce((acc, file) => {
        const scenario = file.scenario || "Unnamed Scenario";
        if (!acc[scenario]) acc[scenario] = [];
        acc[scenario].push(file);
        return acc;
      }, {});

      return (
        <div className="accordion" id="floodMapAccordion">
          {Object.entries(groupedFiles).map(
            ([scenario, scenarioFiles], index) => (
              <div className="accordion-item" key={index}>
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#flush-collapse-${index}`}
                  >
                    {scenario}
                  </button>
                </h2>
                <div
                  id={`flush-collapse-${index}`}
                  className="accordion-collapse collapse"
                  data-bs-parent="#floodMapAccordion"
                >
                  <div className="accordion-body">
                    <table className="item_table">
                      <thead>
                        <tr>
                          <th>File Name</th>
                          <th>Uploaded File</th>
                          <th>Legend Unit</th>
                          <th>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenarioFiles.map((file, fileIndex) => (
                          <tr key={fileIndex}>
                            <td>{file.file_name}</td>
                            <td>
                              <a
                                href={`${
                                  import.meta.env.VITE_API_BACKEND_API_URL
                                }/${file.file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "green" }}
                              >
                                Link
                              </a>
                            </td>
                            <td>{file.legend_unit}</td>
                            <td>
                              <button
                                className="table_delete_btn"
                                onClick={() =>
                                  handleDeleteFile(file._id, fileType)
                                }
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      );
    }

    return (
      <div className="col-md-12 mb-3">
        <table className="item_table">
          <thead>
            <tr>
              <th>{fileTypeLabel} Name</th>
              <th>Uploaded File</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr key={index}>
                <td>{file.file_name}</td>
                <td>
                  <a
                    href={`${import.meta.env.VITE_API_BACKEND_API_URL}/${
                      file.file_url
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "green" }}
                  >
                    Link
                  </a>
                </td>
                <td>
                  <button
                    className="table_delete_btn"
                    onClick={() => handleDeleteFile(file._id, fileType)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleGoBack = () => {
    navigate("/admin");
  };

  return (
    <div className="main_page_container">
      <div className="project_details_container flex">
        <nav className="sidebar bg-white">
          <div className="position-sticky">
            <div className="list-group list-group-flush mx-3">
              <button
                className="list-group-item list-group-item-action py-2 ripple"
                onClick={handleGoBack}
              >
                <span style={{ color: "red" }}>
                  {" "}
                  <RiArrowGoBackLine />
                  &nbsp;&nbsp;Back{" "}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("damDetails")}
                className={`list-group-item list-group-item-action py-2 ripple ${
                  activeTab === "damDetails" ? "active" : ""
                }`}
              >
                <span>Dam Details</span>
              </button>

              <button
                onClick={() => setActiveTab("users")}
                className={`list-group-item list-group-item-action py-2 ripple ${
                  activeTab === "users" ? "active" : ""
                }`}
              >
                <span>Users</span>
              </button>

              <button
                onClick={() => setActiveTab("images")}
                className={`list-group-item list-group-item-action py-2 ripple ${
                  activeTab === "images" ? "active" : ""
                }`}
              >
                <span>Images</span>
              </button>

              <button
                onClick={() => setActiveTab("videos")}
                className={`list-group-item list-group-item-action py-2 ripple ${
                  activeTab === "videos" ? "active" : ""
                }`}
              >
                <span>Videos</span>
              </button>

              <button
                onClick={() => setActiveTab("floodMaps")}
                className={`list-group-item list-group-item-action py-2 ripple ${
                  activeTab === "floodMaps" ? "active" : ""
                }`}
              >
                <span>Flood Maps</span>
              </button>

              <button
                onClick={() => setActiveTab("GeoJSONFile")}
                className={`list-group-item list-group-item-action py-2 ripple ${
                  activeTab === "GeoJSONFile" ? "active" : ""
                }`}
              >
                <span>Administrative Boundaries</span>
              </button>

              <button
                onClick={() => setActiveTab("reports_file")}
                className={`list-group-item list-group-item-action py-2 ripple ${
                  activeTab === "reports_file" ? "active" : ""
                }`}
              >
                <span>Reports</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="tabs_container">
          {activeTab === "damDetails" && (
            <div id="damDetails" className="tab-content">
              <div className="page_section_heading">
                <h2>Dam details</h2>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <label className="form-label">Dam Name</label>
                  <input
                    type="text"
                    disabled={!updateUser}
                    className="form-control"
                    value={newProjectDetail.project_name}
                    name="project_name"
                    onChange={handleProjectDetailsChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Department Name</label>
                  <input
                    type="text"
                    disabled={!updateUser}
                    className="form-control"
                    value={newProjectDetail.department_name}
                    name="department_name"
                    onChange={handleProjectDetailsChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    disabled={!updateUser}
                    className="form-control"
                    value={newProjectDetail.address}
                    name="address"
                    onChange={handleProjectDetailsChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Purpose of Dam</label>
                  {updateUser ? (
                    <div className="position-relative">
                      <div className="accordion" id="purposeAccordion">
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button
                              className={`accordion-button map_layer_collapse ${
                                !isOpen ? "collapsed" : ""
                              }`}
                              type="button"
                              onClick={() => setIsOpen(!isOpen)}
                            >
                              Select Purpose of Dam
                            </button>
                          </h2>
                          <div
                            className={`accordion-collapse collapse ${
                              isOpen ? "show" : ""
                            }`}
                            id="collapsePurpose"
                          >
                            <div className="accordion-body position-absolute top-100 left-0 w-100 bg-white shadow border rounded p-3">
                              {[
                                "Irrigation",
                                "Hydroelectric Power",
                                "Water Supply",
                                "Flood Control",
                                "Other",
                              ].map((purpose) => (
                                <div key={purpose} className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    name="purpose_of_dam"
                                    value={purpose}
                                    checked={newProjectDetail.purpose_of_dam.includes(
                                      purpose
                                    )}
                                    onChange={handleProjectDetailsChange}
                                  />
                                  <label className="form-check-label">
                                    {purpose}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      disabled
                      className="form-control"
                      value={newProjectDetail.purpose_of_dam.join(", ")}
                    />
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Latitude</label>
                  <input
                    type="text"
                    disabled={!updateUser}
                    className="form-control"
                    value={newProjectDetail.latitude}
                    name="latitude"
                    onChange={handleProjectDetailsChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Longitude</label>
                  <input
                    type="text"
                    disabled={!updateUser}
                    className="form-control"
                    value={newProjectDetail.longitude}
                    name="longitude"
                    onChange={handleProjectDetailsChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Dam Height</label>
                  <div className="update_item">
                    <input
                      type="number"
                      disabled={!updateUser}
                      className="form-control"
                      value={newProjectDetail.dam_height.value}
                      name="dam_height"
                      onChange={handleProjectDetailsChange}
                    />
                    <select
                      name="dam_height_unit"
                      disabled={!updateUser}
                      className="form-control"
                      value={newProjectDetail.dam_height.unit}
                      onChange={handleProjectDetailsChange}
                    >
                      <option value="Meter">Meter</option>
                      <option value="Centimeter">Centimeter</option>
                      <option value="Feet">Feet</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">HFL</label>
                  <div className="update_item">
                    <input
                      type="number"
                      disabled={!updateUser}
                      className="form-control"
                      value={newProjectDetail.hfl.value}
                      name="hfl"
                      onChange={handleProjectDetailsChange}
                    />
                    <select
                      name="hfl_unit"
                      disabled={!updateUser}
                      className="form-control"
                      value={newProjectDetail.hfl.unit}
                      onChange={handleProjectDetailsChange}
                    >
                      <option value="Meter">Meter</option>
                      <option value="Centimeter">Centimeter</option>
                      <option value="Feet">Feet</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">MRL</label>
                  <div className="update_item">
                    <input
                      type="number"
                      disabled={!updateUser}
                      className="form-control"
                      value={newProjectDetail.mrl.value}
                      name="mrl"
                      onChange={handleProjectDetailsChange}
                    />
                    <select
                      name="mrl_unit"
                      disabled={!updateUser}
                      className="form-control"
                      value={newProjectDetail.mrl.unit}
                      onChange={handleProjectDetailsChange}
                    >
                      <option value="Meter">Meter</option>
                      <option value="Centimeter">Centimeter</option>
                      <option value="Feet">Feet</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Reservoir Area</label>
                  <div className="update_item">
                    <input
                      type="number"
                      disabled={!updateUser}
                      className="form-control"
                      value={newProjectDetail.reservoir_area.value}
                      name="reservoir_area"
                      onChange={handleProjectDetailsChange}
                    />
                    <select
                      name="reservoir_area_unit"
                      disabled={!updateUser}
                      className="form-control"
                      value={newProjectDetail.reservoir_area.unit}
                      onChange={handleProjectDetailsChange}
                    >
                      <option value="M²">M²</option>
                      <option value="KM²">KM²</option>
                      <option value="BSM">BSM</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Reservoir Volume</label>
                  <div className="update_item">
                    <input
                      type="number"
                      disabled={!updateUser}
                      className="form-control"
                      value={newProjectDetail.reservoir_volume.value}
                      name="reservoir_volume"
                      onChange={handleProjectDetailsChange}
                    />
                    <select
                      name="reservoir_volume_unit"
                      disabled={!updateUser}
                      className="form-control"
                      value={newProjectDetail.reservoir_volume.unit}
                      onChange={handleProjectDetailsChange}
                    >
                      <option value="M³">M³</option>
                      <option value="KM³">KM³</option>
                      <option value="BCM">BCM</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Hydropower Capacity</label>
                  <div className="update_item">
                    <input
                      type="number"
                      disabled={!updateUser}
                      className="form-control"
                      value={newProjectDetail.hydropower_capacity.value}
                      name="hydropower_capacity"
                      onChange={handleProjectDetailsChange}
                    />
                    <select
                      name="hydropower_capacity_unit"
                      disabled={!updateUser}
                      className="form-control"
                      value={newProjectDetail.hydropower_capacity.unit}
                      onChange={handleProjectDetailsChange}
                    >
                      <option value="MW">MW</option>
                      <option value="GW">GW</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-12">
                  <label className="form-label">Dam Description</label>
                  <textarea
                    name="project_description"
                    required
                    className="form-control"
                    disabled={!updateUser}
                    value={newProjectDetail.project_description}
                    onChange={handleProjectDetailsChange}
                    rows="3"
                  ></textarea>
                </div>
              </div>
              {updateUser ? (
                <div className="input_file_upload my-3">
                  <button onClick={handleUpdateProject}>Update</button>
                </div>
              ) : (
                <div className="input_file_upload my-3">
                  <button onClick={handleEditProject}> Edit Dam Details</button>
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div id="users" className="tab-content">
              <div className="page_section_heading">
                <h2>Users</h2>
              </div>
              <div className="row mt-4">
                {projectDetails &&
                  projectDetails.users &&
                  projectDetails.users.length > 0 && (
                    <div className="col-md-12 mb-3">
                      <table className="item_table">
                        <thead>
                          <tr>
                            <th>User Name</th>
                            <th>User Email</th>
                            <th>Person Position</th>
                            <th>User Contact Number</th>
                            {/* <th>Project Admin</th>  */}
                            <th>Delete User</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projectDetails.users.map((user, index) => (
                            <tr key={index}>
                              <td>{user.name}</td>
                              <td>{user.email}</td>
                              <td>{user.position || "Not specified"}</td>
                              <td>{user.mobile}</td>
                              {/* <td>{user.isProjectAdmin ? "Yes" : "No"}</td> */}
                              <td>
                                <button
                                  className="table_delete_btn"
                                  onClick={() => handleDeleteUser(user.email)}
                                >
                                  Delete User
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
              <p>Add New User: </p>
              {users.map((user, index) => (
                <div className="row mt-2 mb-2" key={index}>
                  <div className="col-md-3 mb-1">
                    <input
                      type="text"
                      name={`user_name_${index + 1}`}
                      placeholder={`User ${index + 1} Name`}
                      value={user.name}
                      className="form-control"
                      onChange={(e) => handleUserChange(e, index)}
                    />
                  </div>
                  <div className="col-md-3 mb-1">
                    <input
                      type="email"
                      className="form-control"
                      name={`user_email_${index + 1}`}
                      placeholder={`User ${index + 1} Email`}
                      value={user.email}
                      onChange={(e) => handleUserChange(e, index)}
                    />
                  </div>
                  <div className="col-md-3 mb-1">
                    <input
                      type="number"
                      className="form-control"
                      name={`user_mobile_${index + 1}`}
                      placeholder={`User ${index + 1} Mobile Number`}
                      value={user.mobile}
                      onChange={(e) => handleUserChange(e, index)}
                    />
                  </div>
                  <div className="col-md-3 mb-1">
                    <input
                      type="text"
                      className="form-control"
                      name={`user_position_${index + 1}`}
                      placeholder={`User ${index + 1} Position`}
                      value={user.position}
                      onChange={(e) => handleUserChange(e, index)}
                    />
                  </div>
                </div>
              ))}
              <button className="add_user_btn mt-2" onClick={addUser}>
                <CiCirclePlus />
              </button>
              {users.length > 1 && (
                <button className="add_user_btn mt-2" onClick={removeUser}>
                  <CiCircleMinus />
                </button>
              )}
              <div className="input_file_upload mt-3">
                <button onClick={handleAddUser}>Add User</button>
              </div>
            </div>
          )}
          {activeTab === "images" && (
            <div id="images" className="tab-content">
              <div className="page_section_heading">
                <h2>Images</h2>
              </div>
              {renderFileTable(
                projectDetails?.dam_images,
                "Image",
                "dam_images"
              )}{" "}
              <div className="row">
                <div className="alert alert-warning">
                  <strong style={{ color: "red" }}>Note: </strong>File Type -
                  jpg/png/gif format
                </div>

                {renderFileInput(
                  "thumb",
                  "Project Thumbnail Image",
                  "thumbnail_image",
                  "image/*"
                )}
                {renderFileInput(
                  "damImgs",
                  "More Images",
                  "dam_images",
                  "image/*"
                )}
              </div>
            </div>
          )}

          {activeTab === "videos" && (
            <div id="videos" className="tab-content">
              <div className="page_section_heading">
                <h2>Videos</h2>
              </div>
              {renderFileTable(
                projectDetails?.dam_videos,
                "Video",
                "dam_videos"
              )}
              <div className="alert alert-warning">
                <strong style={{ color: "red" }}>Note: </strong> File Type -
                .mp4 (size less than __ MB)
              </div>
              <div className="row">
                {renderFileInput(
                  "damVids",
                  "Dam Videos",
                  "dam_videos",
                  "video/*"
                )}
              </div>
            </div>
          )}

          {activeTab === "floodMaps" && (
            <div id="floodMaps" className="tab-content">
              <div className="page_section_heading">
                <h2>Flood Maps</h2>
              </div>
              {renderFileTable(
                projectDetails?.flood_maps,
                "Flood Map",
                "flood_maps"
              )}
              <div
                className="alert alert-warning"
                style={{ marginTop: "20px" }}
              >
                <strong style={{ color: "red" }}>Note: </strong>File Type -
                GeoTIFF format
              </div>
              <div className="row">
                <div className="col-md-3">
                  <label className="form-label">Scenario </label>
                  <input
                    type="text"
                    className="form-control"
                    id="floodMaps_input_scenario"
                    placeholder="Scenario Name"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">File Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="floodMaps_input_file_name"
                    placeholder="File Name"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Legend Unit</label>
                  <input
                    type="text"
                    className="form-control"
                    id="floodMaps_input_legend_unit"
                    placeholder="Legend Unit"
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="floodMaps_input_file" className="form-label">
                    Select File
                  </label>
                  <div className="d-flex align-items-center">
                    <input
                      className="form-control me-2"
                      type="file"
                      id="floodMaps_input_file"
                      accept=".tiff, .tif"
                    />
                    <button
                      className="btn btn-success"
                      onClick={() =>
                        handleUploadFile("floodMaps", "flood_maps")
                      }
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "GeoJSONFile" && (
            <div id="shapeFile" className="tab-content">
              <div className="page_section_heading">
                <h2>Administrative Boundaries</h2>
              </div>
              {renderFileTable(
                projectDetails?.GeoJSON_file,
                "GeoJSON File",
                "GeoJSON_file"
              )}
              <div className="alert alert-warning">
                <strong style={{ color: "red" }}>Note: </strong>File Type -
                GeoJSON format
              </div>
              <div className="row">
                {renderFileInput(
                  "GeoJSONFile",
                  "File Name",
                  "GeoJSON_file",
                  ".geojson"
                )}
              </div>
            </div>
          )}

          {activeTab === "reports_file" && (
            <div id="reports_file" className="tab-content">
              <div className="page_section_heading">
                <h2>Reports</h2>
              </div>
              {renderFileTable(
                projectDetails?.reports_file,
                "Report",
                "reports_file"
              )}
              <div className="alert alert-warning">
                <strong style={{ color: "red" }}>Note: </strong>File Type -
                .pdf/.doc/.docx/.cad/.dwg/.dxf
              </div>
              <div className="row">
                {renderFileInput(
                  "reports_file",
                  "Reports",
                  "reports_file",
                  ".pdf, .doc, .docx, .cad, .dwg, .dxf"
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
