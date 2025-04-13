import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { useAlertContext } from "../../context/AlertContext";
import { useLoaderContext } from "../../context/LoaderContext";

const RespondIssue = () => {
  const { projectid } = useParams();
  const [projectDetails, setProjectDetails] = useState(null);
  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { setIsLoading } = useLoaderContext();
  const { loginUser } = useUserContext();
  const [assignedReports, setAssignedReports] = useState([]);
  const [archivedReports, setArchivedReports] = useState([]);
  const [selectedReassignUsers, setSelectedReassignUsers] = useState({});
  const [isOpen, setIsOpen] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Refs to manage file inputs for each report
  const imageInputRefs = useRef({});
  const videoInputRefs = useRef({});

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BACKEND_API_URL
        }/project-details/${projectid}`
      );
      setProjectDetails(response.data.project);
    } catch (error) {
      setAlertMessage("Error fetching project details:");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
      setIsLoadingData(false);
    }
  };

  const filteredUsers =
    projectDetails?.users?.filter((user) => user.email !== loginUser.email) ||
    [];

  const updateSelectedReassignUsers = (reportId, users) => {
    setSelectedReassignUsers((prev) => ({
      ...prev,
      [reportId]: users,
    }));
  };

  const handleReassignSelectAll = (reportId) => {
    const allEmails = filteredUsers.map((user) => user.email);
    const currentSelected = selectedReassignUsers[reportId] || [];
    updateSelectedReassignUsers(
      reportId,
      currentSelected.length === allEmails.length ? [] : allEmails
    );
  };

  const handleReassignCheckboxChange = (reportId, email) => {
    const currentSelected = selectedReassignUsers[reportId] || [];
    const newSelected = currentSelected.includes(email)
      ? currentSelected.filter((e) => e !== email)
      : [...currentSelected, email];
    updateSelectedReassignUsers(reportId, newSelected);
  };

  const handleAddResponse = async (
    reportId,
    reply,
    imageFiles,
    videoFiles,
    rePriority,
    reassignedUsers,
    index
  ) => {
    if (
      !reply.trim() &&
      (!imageFiles || imageFiles.length === 0) &&
      (!videoFiles || videoFiles.length === 0)
    ) {
      setAlertMessage("You must provide a reply or attach at least one file.");
      setShowAlert(true);
      return;
    }
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("projectId", projectid);
      formData.append("reportId", reportId);
      formData.append("reply", reply);
      formData.append("repliedBy", loginUser.email);
      formData.append("rePriority", rePriority);
      formData.append("reassignedTo", JSON.stringify(reassignedUsers));

      if (imageFiles) {
        for (let i = 0; i < imageFiles.length; i++) {
          formData.append("respond_images", imageFiles[i]);
        }
      }
      if (videoFiles) {
        for (let i = 0; i < videoFiles.length; i++) {
          formData.append("respond_videos", videoFiles[i]);
        }
      }

      await axios.post(
        `${import.meta.env.VITE_API_BACKEND_API_URL}/reports/respond`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setAlertMessage("Response added successfully.");
      setShowAlert(true);

      // Clear state and reset file inputs
      const updatedReports = [...assignedReports];
      updatedReports[index].newReply = "";
      updatedReports[index].imageFiles = [];
      updatedReports[index].videoFiles = [];
      setAssignedReports(updatedReports);

      // Reset file input elements
      if (imageInputRefs.current[reportId]) {
        imageInputRefs.current[reportId].value = "";
      }
      if (videoInputRefs.current[reportId]) {
        videoInputRefs.current[reportId].value = "";
      }

      fetchAssignedReports(); // Refresh the reports
    } catch (error) {
      setAlertMessage("Failed to add response.");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignedReports = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BACKEND_API_URL}/reports/${projectid}/${
          loginUser.email
        }`
      );
      const reportData = response.data;
      const activeReports = reportData.filter((item) => item.isActive === true);
      const archivedReports = reportData.filter(
        (item) => item.isActive === false
      );

      const initialReassignUsers = {};
      activeReports.forEach((report) => {
        initialReassignUsers[report._id] = [...report.assignedTo];
      });
      setSelectedReassignUsers(initialReassignUsers);

      setAssignedReports(
        activeReports.map((report) => ({
          ...report,
          imageFiles: [],
          videoFiles: [],
          newReply: "",
        }))
      );
      setArchivedReports(archivedReports);
    } catch (error) {
      setAlertMessage("Error fetching assigned reports");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
      setIsLoadingData(false);
    }
  };

  const handleAddResponseAndCloseTicket = async (
    reportId,
    reply,
    imageFiles,
    videoFiles,
    rePriority,
    reassignedUsers,
    index
  ) => {
    if (
      !reply.trim() &&
      (!imageFiles || imageFiles.length === 0) &&
      (!videoFiles || videoFiles.length === 0)
    ) {
      setAlertMessage("Reply or at least one file is required.");
      setShowAlert(true);
      return;
    }
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("projectId", projectid);
      formData.append("reportId", reportId);
      formData.append("reply", reply);
      formData.append("repliedBy", loginUser.email);
      formData.append("rePriority", rePriority);
      formData.append("reassignedTo", JSON.stringify(reassignedUsers));

      if (imageFiles) {
        for (let i = 0; i < imageFiles.length; i++) {
          formData.append("respond_images", imageFiles[i]);
        }
      }
      if (videoFiles) {
        for (let i = 0; i < videoFiles.length; i++) {
          formData.append("respond_videos", videoFiles[i]);
        }
      }

      await axios.post(
        `${import.meta.env.VITE_API_BACKEND_API_URL}/reports/respond-and-close`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setAlertMessage("Response added and Ticket Closed Successfully.");
      setShowAlert(true);

      // Clear state and reset file inputs
      const updatedReports = [...assignedReports];
      updatedReports[index].newReply = "";
      updatedReports[index].imageFiles = [];
      updatedReports[index].videoFiles = [];
      setAssignedReports(updatedReports);

      // Reset file input elements
      if (imageInputRefs.current[reportId]) {
        imageInputRefs.current[reportId].value = "";
      }
      if (videoInputRefs.current[reportId]) {
        videoInputRefs.current[reportId].value = "";
      }

      fetchAssignedReports(); // Refresh the reports
    } catch (error) {
      setAlertMessage("Failed to add response and close ticket.");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAndReopenTicket = async (reportID) => {
    try {
      setIsLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_BACKEND_API_URL}/reports/active`,
        { projectId: projectid, reportID: reportID, changedBy: loginUser.email }
      );
      fetchAssignedReports();
      const report =
        assignedReports.find((r) => r._id === reportID) ||
        archivedReports.find((r) => r._id === reportID);
      setAlertMessage(
        report && report.isActive
          ? "Ticket Closed Successfully."
          : "Ticket Opened Successfully."
      );
      setShowAlert(true);
    } catch (error) {
      setAlertMessage("Failed.");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "red";
      case "Medium":
        return "orange";
      default:
        return "green";
    }
  };

  const getImageURL = (imagePath) =>
    `${import.meta.env.VITE_API_BACKEND_API_URL}/${imagePath}`;
  const getUserNameByEmail = (email) => {
    const user = projectDetails?.users?.find((u) => u.email === email);
    return user ? user.name || user.email : email;
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchAssignedReports();
  }, [projectid]);

  if (isLoadingData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main_page_container">
      <div className="project_details_container">
        <Sidebar />
        <div className="tabs_container">
          <div id="respondIssue" className="tab-content">
            <div className="page_section_heading">
              <h2>Respond Issue</h2>
            </div>
            {assignedReports.length > 0 ? (
              assignedReports.map((report, index) => (
                <div key={report._id} className="report_card">
                  <details>
                    <summary>
                      <table className="item_table table-bordered">
                        <thead>
                          <tr>
                            <th style={{ width: "10%" }}>Reported By</th>
                            <th style={{ width: "15%" }}>Assigned To</th>
                            <th style={{ width: "10%" }}>Issue In</th>
                            <th style={{ width: "10%" }}>Priority</th>
                            <th style={{ width: "20%" }}>Description of Issue</th>
                            <th style={{ width: "15%" }}>Ticket Open Date</th>
                            <th style={{ width: "10%" }}>Images</th>
                            <th style={{ width: "10%" }}>Videos</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{getUserNameByEmail(report.reportedBy)}</td>
                            <td>
                              {report.assignedTo.map((email, idx) => (
                                <div key={idx}>
                                  {getUserNameByEmail(email)}
                                  {idx < report.assignedTo.length - 1 && ", "}
                                </div>
                              ))}
                            </td>
                            <td>{report.issueIn}</td>
                            <td
                              style={{
                                color: handlePriorityColor(report.priority),
                              }}
                            >
                              {report.priority}
                            </td>
                            <td>{report.description}</td>
                            <td>
                              {new Date(report.timestamp).toLocaleString()}
                            </td>
                            <td>
                              {report.report_images?.length > 0 ? (
                                report.report_images.map(
                                  (imagePath, imgIndex) => (
                                    <div key={imgIndex}>
                                      <a
                                        href={getImageURL(imagePath)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "green" }}
                                      >
                                        Image {imgIndex + 1}
                                      </a>
                                      <br />
                                    </div>
                                  )
                                )
                              ) : (
                                <p>No images</p>
                              )}
                            </td>
                            <td>
                              {report.report_videos?.length > 0 ? (
                                report.report_videos.map(
                                  (videoPath, vidIndex) => (
                                    <div key={vidIndex}>
                                      <a
                                        href={getImageURL(videoPath)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "green" }}
                                      >
                                        Video {vidIndex + 1}
                                      </a>
                                      <br />
                                    </div>
                                  )
                                )
                              ) : (
                                <p>No videos</p>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </summary>

                    <div className="chat-container">
                      {report.responses.length > 0 ? (
                        <table className="item_table_respond table-bordered">
                          <thead>
                            <tr>
                              <th>Responded By</th>
                              <th>ReAssigned To</th>
                              <th>Issue In</th>
                              <th>RePriority</th>
                              <th>Respond Description</th>
                              <th>Respond Date</th>
                              <th>Respond Images</th>
                              <th>Respond Videos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.responses.map((response, idx) => (
                              <tr key={idx}>
                                <td>
                                  {getUserNameByEmail(response.repliedBy)}
                                </td>
                                <td>
                                  {response.reassignedTo?.map(
                                    (email, index) => (
                                      <div key={email}>
                                        {getUserNameByEmail(email)}
                                        {index <
                                          response.reassignedTo.length - 1 &&
                                          ", "}
                                      </div>
                                    )
                                  )}
                                </td>
                                <td>{report.issueIn}</td>
                                <td
                                  style={{
                                    color: handlePriorityColor(
                                      response.rePriority
                                    ),
                                  }}
                                >
                                  {response.rePriority}
                                </td>
                                <td>{response.reply}</td>
                                <td>
                                  {new Date(
                                    response.timestamp
                                  ).toLocaleString()}
                                </td>
                                <td>
                                  {response.respond_images?.length > 0
                                    ? response.respond_images.map(
                                        (image, i) => (
                                          <div key={i}>
                                            <a
                                              href={getImageURL(image)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{ color: "green" }}
                                            >
                                              Image {i + 1}
                                            </a>
                                          </div>
                                        )
                                      )
                                    : "No Images"}
                                </td>
                                <td>
                                  {response.respond_videos?.length > 0
                                    ? response.respond_videos.map(
                                        (video, i) => (
                                          <div key={i}>
                                            <a
                                              href={getImageURL(video)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{ color: "green" }}
                                            >
                                              Video {i + 1}
                                            </a>
                                          </div>
                                        )
                                      )
                                    : "No Videos"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ textAlign: "center" }}>
                         ⚠️ No Responses yet! Add a Response below.
                        </p>
                      )}
                      <div className="reply-area">
                        <div className="row">
                          <div
                            className="col-md-12"
                            style={{ marginTop: "20px" }}
                          >
                            <textarea
                              placeholder="Write your response..."
                              rows="2"
                              className="form-control"
                              value={report.newReply || ""}
                              onChange={(e) => {
                                const updatedReports = [...assignedReports];
                                updatedReports[index].newReply = e.target.value;
                                setAssignedReports(updatedReports);
                              }}
                            />
                          </div>
                          <div
                            className="col-md-3"
                            style={{ marginTop: "20px" }}
                          >
                            <label>Upload Images</label>
                            <input
                              id={`respond_images_${report._id}`}
                              className="form-control"
                              type="file"
                              accept="image/*"
                              multiple
                              ref={(el) =>
                                (imageInputRefs.current[report._id] = el)
                              } // Assign ref
                              onChange={(e) => {
                                const updatedReports = [...assignedReports];
                                updatedReports[index].imageFiles = Array.from(
                                  e.target.files
                                );
                                setAssignedReports(updatedReports);
                              }}
                            />
                          </div>
                          <div
                            className="col-md-3"
                            style={{ marginTop: "20px" }}
                          >
                            <label>Upload Videos</label>
                            <input
                              id={`respond_videos_${report._id}`}
                              className="form-control"
                              type="file"
                              accept="video/*"
                              multiple
                              ref={(el) =>
                                (videoInputRefs.current[report._id] = el)
                              } // Assign ref
                              onChange={(e) => {
                                const updatedReports = [...assignedReports];
                                updatedReports[index].videoFiles = Array.from(
                                  e.target.files
                                );
                                setAssignedReports(updatedReports);
                              }}
                            />
                          </div>
                          <div
                            className="col-md-3"
                            style={{ marginTop: "20px" }}
                          >
                            <label>Select Priority</label>
                            <select
                              className="form-control"
                              value={report.rePriority || report.priority}
                              onChange={(e) => {
                                const updatedReports = [...assignedReports];
                                updatedReports[index].rePriority =
                                  e.target.value;
                                setAssignedReports(updatedReports);
                              }}
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                          <div
                            className="col-md-3"
                            style={{ marginTop: "20px" }}
                          >
                            <label>ReAssign Users</label>
                            <div className="position-relative">
                              <div
                                className="accordion"
                                id={`purposeAccordion_${report._id}`}
                              >
                                <div className="accordion-item">
                                  <h2 className="accordion-header">
                                    <button
                                      className={`accordion-button map_layer_collapse ${
                                        !isOpen[report._id] ? "collapsed" : ""
                                      }`}
                                      type="button"
                                      onClick={() =>
                                        setIsOpen((prev) => ({
                                          ...prev,
                                          [report._id]: !prev[report._id],
                                        }))
                                      }
                                    >
                                      Select Users
                                    </button>
                                  </h2>
                                  <div
                                    className={`accordion-collapse collapse ${
                                      isOpen[report._id] ? "show" : ""
                                    }`}
                                    id={`collapsePurpose_${report._id}`}
                                  >
                                    <div
                                      className="accordion-body position-absolute top-100 left-0 w-100 bg-white shadow border rounded pt-2 pb-2 px-3"
                                      style={{
                                        maxHeight: "70px",
                                        overflowY: "auto",
                                      }}
                                    >
                                      <div className="reassign-checkboxes">
                                        <input
                                          type="checkbox"
                                          checked={filteredUsers.every((user) =>
                                            (
                                              selectedReassignUsers[
                                                report._id
                                              ] || []
                                            ).includes(user.email)
                                          )}
                                          onChange={() =>
                                            handleReassignSelectAll(report._id)
                                          }
                                        />
                                        <label>Select All</label>
                                      </div>
                                      {filteredUsers.map((user) => (
                                        <div key={user.email}>
                                          <input
                                            type="checkbox"
                                            checked={(
                                              selectedReassignUsers[
                                                report._id
                                              ] || []
                                            ).includes(user.email)}
                                            onChange={() =>
                                              handleReassignCheckboxChange(
                                                report._id,
                                                user.email
                                              )
                                            }
                                          />
                                          <label>
                                            {user.name || user.email}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="auth_button">
                              <button
                                onClick={() =>
                                  handleAddResponse(
                                    report._id,
                                    report.newReply,
                                    report.imageFiles,
                                    report.videoFiles,
                                    report.rePriority || report.priority,
                                    selectedReassignUsers[report._id] || [],
                                    index
                                  )
                                }
                              >
                                Submit Response
                              </button>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="auth_button">
                              <button
                                onClick={() =>
                                  handleAddResponseAndCloseTicket(
                                    report._id,
                                    report.newReply,
                                    report.imageFiles,
                                    report.videoFiles,
                                    report.rePriority || report.priority,
                                    selectedReassignUsers[report._id] || [],
                                    index
                                  )
                                }
                              >
                                Submit Response and Close Ticket
                              </button>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="auth_button">
                              <button
                                onClick={() =>
                                  handleCloseAndReopenTicket(report._id)
                                }
                              >
                                Close Ticket
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", fontSize: "20px" }}>
                ℹ️  Uh-oh! No Active Tickets Available For Review At This Time.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RespondIssue;
