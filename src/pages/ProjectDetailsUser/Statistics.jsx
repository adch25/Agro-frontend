import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { useAlertContext } from "../../context/AlertContext";
import ReactApexChart from "react-apexcharts";
import Sidebar from "./Sidebar";

const Statistics = () => {
  const { projectid } = useParams();
  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { loginUser } = useUserContext();

  const [issueStatistics, setIssueStatistics] = useState({
    activeReports: {
      series: [],
      options: {
        chart: { type: "pie" },
        labels: [
          "Gates",
          "Structural",
          "Spillway",
          "Drainage System",
          "Turbine",
          "Foundation and seepage",
          "Instrumentation and Monitoring",
          "Electric Issue",
          "Other",
        ],
        colors: [
          "#FF6B6B",
          "#FF8787",
          "#FFB347",
          "#FFD700",
          "#40C4FF",
          "#4CAF50",
          "#AB47BC",
          "#FFCA28",
          "#26A69A",
        ],
        dataLabels: {
          formatter(val, opts) {
            const name = opts.w.globals.labels[opts.seriesIndex];
            return [`${name}`, `${val.toFixed(1)}%`];
          },
        },
        legend: { show: false },
      },
    },
    archivedReports: {
      series: [],
      options: {
        chart: { type: "pie" },
        labels: [
          "Gates",
          "Structural",
          "Spillway",
          "Drainage System",
          "Turbine",
          "Foundation and seepage",
          "Instrumentation and Monitoring",
          "Electric Issue",
          "Other",
        ],
        colors: [
          "#FF6B6B",
          "#FF8787",
          "#FFB347",
          "#FFD700",
          "#40C4FF",
          "#4CAF50",
          "#AB47BC",
          "#FFCA28",
          "#26A69A",
        ],
        dataLabels: {
          formatter(val, opts) {
            const name = opts.w.globals.labels[opts.seriesIndex];
            return [`${name}`, `${val.toFixed(1)}%`];
          },
        },
        legend: { show: false },
      },
    },
  });

  const fetchAssignedReports = async () => {
    try {
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

      const countIssues = (reports) => {
        return {
          gates: reports.filter((report) => report.issueIn === "Gates").length,
          structural: reports.filter(
            (report) => report.issueIn === "Structural"
          ).length,
          spillway: reports.filter((report) => report.issueIn === "Spillway")
            .length,
          drainage: reports.filter(
            (report) => report.issueIn === "Drainage System"
          ).length,
          turbine: reports.filter((report) => report.issueIn === "Turbine")
            .length,
          foundation: reports.filter(
            (report) => report.issueIn === "Foundation and seepage"
          ).length,
          instrumentation: reports.filter(
            (report) => report.issueIn === "Instrumentation and Monitoring"
          ).length,
          electric: reports.filter(
            (report) => report.issueIn === "Electric Issue"
          ).length,
          other: reports.filter(
            (report) =>
              ![
                "Gates",
                "Structural",
                "Spillway",
                "Drainage System",
                "Turbine",
                "Foundation and seepage",
                "Instrumentation and Monitoring",
                "Electric Issue",
              ].includes(report.issueIn)
          ).length,
        };
      };

      const activeIssueCounts = countIssues(activeReports);
      const archivedIssueCounts = countIssues(archivedReports);

      setIssueStatistics({
        activeReports: {
          series: [
            activeIssueCounts.gates,
            activeIssueCounts.structural,
            activeIssueCounts.spillway,
            activeIssueCounts.drainage,
            activeIssueCounts.turbine,
            activeIssueCounts.foundation,
            activeIssueCounts.instrumentation,
            activeIssueCounts.electric,
            activeIssueCounts.other,
          ],
          options: issueStatistics.activeReports.options,
        },
        archivedReports: {
          series: [
            archivedIssueCounts.gates,
            archivedIssueCounts.structural,
            archivedIssueCounts.spillway,
            archivedIssueCounts.drainage,
            archivedIssueCounts.turbine,
            archivedIssueCounts.foundation,
            archivedIssueCounts.instrumentation,
            archivedIssueCounts.electric,
            archivedIssueCounts.other,
          ],
          options: issueStatistics.archivedReports.options,
        },
      });
    } catch (error) {
      setAlertMessage("Error fetching assigned reports");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    fetchAssignedReports();
  }, [projectid]);

  return (
    <div className="main_page_container">
      <div className="project_details_container">
        <Sidebar />
        <div className="tabs_container">
          <div id="statistics" className="tab-content">
            <div className="page_section_heading">
              <h2>Statistics</h2>
            </div>
            <div className="row">
              <div className="col-sm-6">
                <div className="page_section_heading">
                  <h2>Live Issue</h2>
                </div>
                {issueStatistics.activeReports.series.some((value) => value > 0) ? (
                  <div className="card bg-light">
                    <div
                      id="chart"
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "60vh",
                      }}
                    >
                      <ReactApexChart
                        options={issueStatistics.activeReports.options}
                        series={issueStatistics.activeReports.series}
                        type="pie"
                        width={400}
                      />
                    </div>
                  </div>
                ) : (
                  <p style={{ textAlign: "center", fontSize: "20px" }}>
                    ℹ️ Uh-oh! Active ticket Data Is Not Available.
                  </p>
                )}
              </div>
              <div className="col-sm-6">
                <div className="page_section_heading">
                  <h2>Archive Issue</h2>
                </div>
                {issueStatistics.archivedReports.series.some((value) => value > 0) ? (
                  <div className="card bg-light">
                    <div
                      id="chart"
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "60vh",
                      }}
                    >
                      <ReactApexChart
                        options={issueStatistics.archivedReports.options}
                        series={issueStatistics.archivedReports.series}
                        type="pie"
                        width={400}
                      />
                    </div>
                  </div>
                ) : (
                  <p style={{ textAlign: "center", fontSize: "20px" }}>
                    ℹ️ Uh-oh! Archived Ticket Data Is Not Available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;