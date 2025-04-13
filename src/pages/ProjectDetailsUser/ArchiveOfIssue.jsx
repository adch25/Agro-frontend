import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { useAlertContext } from "../../context/AlertContext";
import { useLoaderContext } from "../../context/LoaderContext";
import Sidebar from "./Sidebar";

const ArchiveOfIssue = () => {
  const { projectid } = useParams();
  const [projectDetails, setProjectDetails] = useState(null);
  const [archivedReports, setArchivedReports] = useState([]);
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
      setAlertMessage("Error fetching project details: " + error.message);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignedReports = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BACKEND_API_URL}/reports/${projectid}/${
          loginUser.email
        }`
      );
      setArchivedReports(
        response.data.filter((item) => item.isActive === false)
      );
    } catch (error) {
      setAlertMessage("Error fetching assigned reports: " + error.message);
      setShowAlert(true);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchAssignedReports();
  }, [projectid]);

  const handleCloseAndReopenTicket = async (reportID) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BACKEND_API_URL}/reports/active`,
        {
          projectId: projectid,
          reportID: reportID,
          changedBy: loginUser.email,
        }
      );
      await fetchAssignedReports();

      setAlertMessage("Ticket reopened successfully!");
      setShowAlert(true);
    } catch (error) {
      setAlertMessage("Failed to reopen ticket: " + error.message);
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

  const getImageURL = (path) =>
    `${import.meta.env.VITE_API_BACKEND_API_URL}/${path}`;

  const getUserNameByEmail = (email) => {
    const user = projectDetails?.users?.find((u) => u.email === email);
    return user ? user.name || user.email : email;
  };

  return (
    <div className="main_page_container">
      <div className="project_details_container">
        <Sidebar />
        <div className="tabs_container">
          <div id="archieveOfTickets" className="tab-content">
            <div className="page_section_heading">
              <h2>Archive Issue</h2>
            </div>
            {archivedReports.length > 0 ? (
              archivedReports.map((report, index) => (
                <div key={report._id} className="report_card">
                  <details>
                    <summary>
                      <table
                        className="item_table table-bordered"
                        style={{
                          width: "100%",
                          tableLayout: "fixed",
                        }}
                      >
                        <thead>
                          <tr>
                            <th style={{ width: "10%" }}>Reported By</th>
                            <th style={{ width: "9%" }}>Assigned To</th>
                            <th style={{ width: "10%" }}>Issue In</th>
                            <th style={{ width: "6%" }}>Priority</th>
                            <th style={{ width: "13%" }}>Issue Description</th>
                            <th style={{ width: "10%" }}>Open Date</th>
                            <th style={{ width: "6%" }}>Images</th>
                            <th style={{ width: "6%" }}>Videos</th>
                            <th style={{ width: "10%" }}>Closed By</th>
                            <th style={{ width: "10%" }}>Close Date</th>
                            <th style={{ width: "10%" }}>Reopen Ticket</th>
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
                                <p>No Images Available</p>
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
                                <p>No Video Available</p>
                              )}
                            </td>
                            <td>
                              {getUserNameByEmail(report.statusChangedBy)}
                            </td>
                            <td>
                              {new Date(
                                report.statusChangedAt
                              ).toLocaleString()}
                            </td>
                            <td>
                              <div className="user_update_btn">
                                <button
                                  onClick={() =>
                                    handleCloseAndReopenTicket(report._id)
                                  }
                                >
                                  Reopen Ticket
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </summary>
                    <div className="chat-container">
                      {report.responses.length > 0 ? (
                        <table
                          className="item_table_respond table-bordered"
                          style={{
                            width: "100%",
                            tableLayout: "fixed",
                          }}
                        >
                          <thead>
                            <tr>
                              <th style={{ width: "10%" }}>Responded By</th>
                              <th style={{ width: "10%" }}>Assigned To</th>
                              <th style={{ width: "15%" }}>Issue In</th>
                              <th style={{ width: "10%" }}>Priority</th>
                              <th style={{ width: "15%" }}>
                                Respond Description
                              </th>
                              <th style={{ width: "10%" }}>Respond Date</th>
                              <th style={{ width: "15%" }}>Respond Images</th>
                              <th style={{ width: "15%" }}>Respond Videos</th>
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
                                        {index !==
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
                         ⚠️ No Responses yet! You Can Re-Open Ticket and Add Responses. 
                        </p>
                      )}
                    </div>
                  </details>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", fontSize: "20px" }}>
                ℹ️ Uh-oh! No Archive Tickets Are Available For Review At
                This Time.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveOfIssue;
