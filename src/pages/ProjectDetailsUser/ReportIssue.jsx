import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { useUserContext } from "../../context/UserContext";
import { useAlertContext } from "../../context/AlertContext";
import { useLoaderContext } from "../../context/LoaderContext";
import Sidebar from "./Sidebar";

const ReportIssue = () => {
  const { projectid } = useParams();
  const [projectDetails, setProjectDetails] = useState(null);
  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { setIsLoading } = useLoaderContext();
  const { loginUser } = useUserContext();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [issueDescription, setIssueDescription] = useState("");
  const [issueIn, setIssueIn] = useState("");
  const [priority, setPriority] = useState("");
  const [customIssue, setCustomIssue] = useState("");

  const filteredUsers = (projectDetails?.users || []).filter(
    (user) => user.email !== loginUser.email
  );

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BACKEND_API_URL}/project-details/${projectid}`
      );
      setProjectDetails(response.data.project);
    } catch (error) {
      setAlertMessage("Error fetching project details: " + error.message);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchProjectDetails();
  }, [projectid]);

  if (!projectDetails) return <div>Loading...</div>;

  const handleCheckboxChange = (email) => {
    setSelectedUsers((prevSelectedUsers) => {
      if (prevSelectedUsers.includes(email)) {
        return prevSelectedUsers.filter((userEmail) => userEmail !== email);
      } else {
        return [...prevSelectedUsers, email];
      }
    });
  };

  const handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      const allEmails = filteredUsers.map((user) => user.email);
      setSelectedUsers(allEmails);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleReportIssue = async () => {
    if (!issueIn) {
      setAlertMessage("Please select an issue category under 'Issue In'");
      setShowAlert(true);
      return;
    }
    if (issueIn === "Other" && !customIssue.trim()) {
      setAlertMessage("Please specify the custom issue for 'Other'");
      setShowAlert(true);
      return;
    }
    if (!priority) {
      setAlertMessage("Please select an Priority under 'Priority'");
      setShowAlert(true);
      return;
    }
    if (!issueDescription.trim()) {
      setAlertMessage("Please provide a description for the issue.");
      setShowAlert(true);
      return;
    }
    if (!selectedUsers.length) {
      setAlertMessage("Please select at least one user to assign the issue.");
      setShowAlert(true);
      return;
    }


    const fileInputImages = document.getElementById(`reportImgs_input_file`);
    const fileInputVideos = document.getElementById(`reportvideos_input_file`);

    const formData = new FormData();
    if (fileInputImages.files) {
      for (let i = 0; i < fileInputImages.files.length; i++) {
        formData.append("fileInputImage", fileInputImages.files[i]);
      }
    }
    if (fileInputVideos.files) {
      for (let i = 0; i < fileInputVideos.files.length; i++) {
        formData.append("fileInputVideo", fileInputVideos.files[i]);
      }
    }
    formData.append("projectId", projectid);
    formData.append("issueIn", issueIn === "Other" ? customIssue : issueIn);
    formData.append("priority", priority);
    formData.append("description", issueDescription);
    formData.append("reportedBy", loginUser.email);
    formData.append("assignedTo", JSON.stringify(selectedUsers));
    formData.append("timestamp", new Date().toISOString());

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BACKEND_API_URL}/report-issue`,
        formData
      );
      if (response.status === 200) {
        setAlertMessage("Issue Reported Successfully!");
        setShowAlert(true);
        setIssueDescription("");
        setSelectedUsers([]);
        setIssueIn("");
        setCustomIssue("");
        setPriority("Low");
      }
    } catch (error) {
      setAlertMessage("Failed to report the issue. Please try again.");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main_page_container">
      <div className="project_details_container">
        <Sidebar />
        <div className="tabs_container">
          <div id="reportIssue" className="tab-content">
            <div className="page_section_heading">
              <h2> Report Issue</h2>
            </div>
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">Issue In</label>
                <select
                  className="form-control"
                  value={issueIn}
                  onChange={(e) => setIssueIn(e.target.value)}
                >
                  <option value="" disabled>Select an Issue</option>
                  <option value="Gates">Gates</option>
                  <option value="Structural">Structural</option>
                  <option value="Spillway">Spillway</option>
                  <option value="Drainage System">Drainage System</option>
                  <option value="Turbine">Turbine</option>
                  <option value="Foundation and Seepage">
                    Foundation and Seepage
                  </option>
                  <option value="Instrumentation and Monitoring">
                    Instrumentation and Monitoring
                  </option>
                  <option value="Electric Issue">Electric Issue</option>
                  <option value="Other">Other</option>
                </select>

                {issueIn === "Other" && (
                  <input
                    type="text"
                    className="form-control mt-2"
                    placeholder="Please specify the issue"
                    value={customIssue}
                    onChange={(e) => setCustomIssue(e.target.value)}
                  />
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label">Priority</label>
                <select
                  className="form-control"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                   <option value="" disabled>Select Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="col-md-12">
                <textarea
                  name="project_description"
                  required
                  placeholder="Description of Issue"
                  className="form-control mt-3 mb-3"
                  rows="3"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Upload Images</label>
                <div className="input_file_upload">
                  <input
                    id="reportImgs_input_file"
                    className="form-control"
                    type="file"
                    multiple
                    accept="image/*"
                  />
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Upload Video</label>
                <div className="input_file_upload">
                  <input
                    id="reportvideos_input_file"
                    className="form-control"
                    type="file"
                    multiple
                    accept="video/*"
                  />
                </div>
              </div>
              <div className="col-md-6 ">
                <h5>Assign To</h5>
                <div>
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={
                      filteredUsers.length > 0 &&
                      filteredUsers.every((user) =>
                        selectedUsers.includes(user.email)
                      )
                    }
                    onChange={handleSelectAllChange}
                  />
                  <label htmlFor="select-all">All</label>
                </div>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user.email}>
                      <input
                        type="checkbox"
                        id={user.email}
                        value={user.email}
                        checked={selectedUsers.includes(user.email)}
                        onChange={() => handleCheckboxChange(user.email)}
                      />
                      <label htmlFor={user.email}>
                        {user.name || user.email}
                      </label>
                    </div>
                  ))
                ) : (
                  <p>No users available to assign.</p>
                )}
              </div>
              <div className="auth_button">
                <button onClick={handleReportIssue}>Report Issue </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;