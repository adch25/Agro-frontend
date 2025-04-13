import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { useUserContext } from "../../context/UserContext";
import { useAlertContext } from "../../context/AlertContext";
import { useLoaderContext } from "../../context/LoaderContext";
import Sidebar from "./Sidebar";

const Reports = () => {
  const { projectid } = useParams();
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

  const getPdfURL = (pdfPath) => {
    return `${import.meta.env.VITE_API_BACKEND_API_URL}/${pdfPath}`;
  };

  return (
    <div className="main_page_container">
      <div className="project_details_container">
        <Sidebar />
        <div className="tabs_container">
          <div id="report" className="tab-content">
            <div className="page_section_heading">
              <h2>Reports</h2>
            </div>
            {projectDetails?.reports_file &&
            projectDetails.reports_file.length > 0 ? (
              projectDetails.reports_file.map((report, index) =>
                report.file_url ? (
                  <div key={index} className="report-item">
                    <div className="dam_pdf">
                      <a
                        href={getPdfURL(report.file_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-link"
                      >
                        View or Download {report.file_name}
                      </a>
                    </div>
                  </div>
                ) : null
              )
            ) : (
              <p style={{ textAlign: "center", fontSize: "20px" }}>
                ℹ️ Uh-oh! Report PDFs Is Not Available For This Dam.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
