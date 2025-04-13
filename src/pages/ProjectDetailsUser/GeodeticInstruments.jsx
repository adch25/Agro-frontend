import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAlertContext } from "../../context/AlertContext";
import { useLoaderContext } from "../../context/LoaderContext";
import { useUserContext } from "../../context/UserContext";
import Sidebar from "./Sidebar";
import WordLogo1 from "../../assets/images/PrimaryLogo_TransparentBg.png";
import WordLogo2 from "../../assets/images/logo.png";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const GeodeticInstruments = () => {
  const { projectid } = useParams();
  const { loginUser } = useUserContext();
  const [projectDetails, setProjectDetails] = useState(null);
  const [nameOfInstrument, setNameOfInstrument] = useState("");
  const [customInstrument, setCustomInstrument] = useState("");
  const [numberOfInstruments, setNumberOfInstruments] = useState("");
  const [location, setLocation] = useState("");
  const [sinceWhenInstalled, setSinceWhenInstalled] = useState("");
  const [workingCondition, setWorkingCondition] = useState("N/A");
  const [dateLastNextCalibration, setDateLastNextCalibration] = useState("");
  const [observationsMaintained, setObservationsMaintained] = useState("N/A");
  const [agencyResponsible, setAgencyResponsible] = useState("");
  const [analysisDoneAtFieldLevel, setAnalysisDoneAtFieldLevel] =
    useState("N/A");
  const [dataSentToDSO, setDataSentToDSO] = useState("N/A");
  const [remarks, setRemarks] = useState("");
  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { setIsLoading } = useLoaderContext();

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

  const handleAddGeodeticInstruments = async () => {
    if (nameOfInstrument === "Other" && !customInstrument.trim()) {
      setAlertMessage("Please Specify The Custom Instrument Name.");
      setShowAlert(true);
      return;
    }

    const fileInputImages = document.getElementById("geodeticImagesInput");
    const fileInputVideos = document.getElementById("geodeticVideosInput");

    const formData = new FormData();
    if (fileInputImages?.files) {
      for (let i = 0; i < fileInputImages.files.length; i++) {
        formData.append("fileInputImage", fileInputImages.files[i]);
      }
    }
    if (fileInputVideos?.files) {
      for (let i = 0; i < fileInputVideos.files.length; i++) {
        formData.append("fileInputVideo", fileInputVideos.files[i]);
      }
    }

    formData.append(
      "nameOfInstrument",
      nameOfInstrument === "Other" ? customInstrument : nameOfInstrument
    );
    formData.append("numberOfInstruments", parseInt(numberOfInstruments) || 0);
    formData.append("location", location);
    formData.append("agencyResponsible", agencyResponsible);
    formData.append("sinceWhenInstalled", sinceWhenInstalled);
    formData.append("dateLastNextCalibration", dateLastNextCalibration);
    formData.append("workingCondition", workingCondition);
    formData.append("observationsMaintained", observationsMaintained);
    formData.append("analysisDoneAtFieldLevel", analysisDoneAtFieldLevel);
    formData.append("dataSentToDSO", dataSentToDSO);
    formData.append("remarks", remarks);
    formData.append("addedBy", loginUser.email);

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BACKEND_API_URL}/geodetic/${projectid}`,
        formData
      );
      if (response.status === 200) {
        setAlertMessage("Geodetic Instrument Added Successfully!");
        setShowAlert(true);
        resetForm();
        fetchProjectDetails();
      }
    } catch (error) {
      setAlertMessage("Failed To Add Instrument.");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNameOfInstrument("");
    setCustomInstrument("");
    setNumberOfInstruments("");
    setLocation("");
    setSinceWhenInstalled("");
    setWorkingCondition("N/A");
    setDateLastNextCalibration("");
    setObservationsMaintained("N/A");
    setAgencyResponsible("");
    setAnalysisDoneAtFieldLevel("N/A");
    setDataSentToDSO("N/A");
    setRemarks("");
    const fileInputImages = document.getElementById("geodeticImagesInput");
    const fileInputVideos = document.getElementById("geodeticVideosInput");
    if (fileInputImages) fileInputImages.value = "";
    if (fileInputVideos) fileInputVideos.value = "";
  };

  const getUserNameByEmail = (email) => {
    const user = projectDetails?.users?.find((u) => u.email === email);
    return user ? user.name || user.email : email;
  };

  const generatePDF = (gi, filename) => {
    const addedByUser = projectDetails?.users?.find(
      (user) => user.email === gi.addedBy
    );
    const userPosition = addedByUser?.position || "N/A";
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const topBottomMargin = 5;
    const leftRightMargin = 22;
    const tableWidth = pageWidth - 2 * leftRightMargin;
    let y = topBottomMargin;

    const logoMargin = 10;

    const addHeader = () => {
      doc.addImage(WordLogo1, "PNG", logoMargin, topBottomMargin, 30, 20);
      doc.addImage(
        WordLogo2,
        "PNG",
        pageWidth - 40 - logoMargin,
        topBottomMargin,
        45,
        20
      );
      doc.setFontSize(25);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(48, 73, 131);
      doc.text(
        `${projectDetails.project_name}`,
        pageWidth / 2,
        topBottomMargin + 12,
        {
          align: "center",
        }
      );
      doc.setDrawColor(0);
      doc.line(0, topBottomMargin + 20, pageWidth, topBottomMargin + 20);
      doc.setFillColor(48, 73, 131);
      doc.rect(0, topBottomMargin + 20, pageWidth, 1, "F");
    };

    addHeader();
    y += 35;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const headingText = "GEODETIC INSTRUMENTS REPORT";
    doc.setFillColor(48, 73, 131);
    doc.rect(leftRightMargin, y - 7, tableWidth, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(headingText, pageWidth / 2, y, { align: "center" });
    y += 10;

    let videoLinksText = "N/A";
    if (gi.geodetic_videos?.length > 0) {
      videoLinksText = gi.geodetic_videos
        .map((_, index) => `Video ${index + 1}`)
        .join("\n");
    }

    const table1Data = [
      ["Name of Instrument", gi.nameOfInstrument],
      ["Number of Instruments", gi.numberOfInstruments.toString()],
      [
        "Responsible Agency for Data Collection and Processing",
        gi.agencyResponsible || "N/A",
      ],
      ["Location", gi.location || "N/A"],
      ["Installed Date", gi.sinceWhenInstalled || "N/A"],
      ["Date Of Last/Next Calibration", gi.dateLastNextCalibration || "N/A"],
      ["Whether in Working Condition", gi.workingCondition],
      ["Observations Maintained", gi.observationsMaintained],
      ["Analysis Done at Field Level", gi.analysisDoneAtFieldLevel],
      ["Data Sent To DSO Regularly", gi.dataSentToDSO],
      ["Videos", videoLinksText],
      ["Remarks", gi.remarks || "N/A"],
    ];

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    const baseRowHeight = 10;
    const colWidth = tableWidth / 2;
    const maxTextWidth = colWidth - 4;

    doc.setLineWidth(0.5);

    const table1StartY = y;
    table1Data.forEach(([label, value], index) => {
      const labelLines = doc.splitTextToSize(label, maxTextWidth);
      const valueLines = doc.splitTextToSize(value, maxTextWidth);
      const lineHeight = 5;
      const rowHeight =
        Math.max(labelLines.length, valueLines.length) * lineHeight + 4;

      if (y + rowHeight > pageHeight - topBottomMargin - 15) {
        doc.addPage();
        addHeader();
        y = topBottomMargin + 35;
      }

      if (index % 2 === 0) {
        doc.setFillColor(195, 206, 232);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(leftRightMargin, y - 2, tableWidth, rowHeight, "F");

      doc.setDrawColor(0);
      doc.rect(leftRightMargin, y - 2, colWidth, rowHeight, "S");
      doc.rect(leftRightMargin + colWidth, y - 2, colWidth, rowHeight, "S");

      labelLines.forEach((line, i) => {
        doc.text(line, leftRightMargin + 2, y + 2 + i * lineHeight);
      });

      valueLines.forEach((line, i) => {
        if (label === "Videos" && gi.geodetic_videos?.length > 0) {
          doc.setTextColor(0, 0, 255);
          doc.text(
            line,
            leftRightMargin + colWidth + 2,
            y + 2 + i * lineHeight
          );
          const textWidth = doc.getTextWidth(line);
          doc.link(
            leftRightMargin + colWidth + 2,
            y + 2 + i * lineHeight - 5,
            textWidth,
            6,
            {
              url: gi.geodetic_videos[i]
                ? `${import.meta.env.VITE_API_BACKEND_API_URL}/${
                    gi.geodetic_videos[i]
                  }`
                : "",
            }
          );
          doc.setTextColor(0);
        } else {
          doc.text(
            line,
            leftRightMargin + colWidth + 2,
            y + 2 + i * lineHeight
          );
        }
      });
      y += rowHeight;
    });

    doc.rect(
      leftRightMargin,
      table1StartY - 2,
      tableWidth,
      y - table1StartY,
      "S"
    );
    y += 10;

    if (gi.geodetic_images && gi.geodetic_images.length > 0) {
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      const heading2Text = "IMAGES";
      doc.setFillColor(48, 73, 131);
      doc.rect(leftRightMargin, y - 7, tableWidth, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(heading2Text, pageWidth / 2, y, { align: "center" });
      y += 10;

      gi.geodetic_images.forEach((imgPath, index) => {
        if (y + 70 > pageHeight - topBottomMargin - 15) {
          doc.addPage();
          addHeader();
          y = topBottomMargin + 35;
        }
        const imgUrl = `${import.meta.env.VITE_API_BACKEND_API_URL}/${imgPath}`;
        const imgWidth = 80;
        const imgHeight = 60;
        const x = (pageWidth - imgWidth) / 2;
        doc.addImage(imgUrl, "JPEG", x, y, imgWidth, imgHeight);
        y += imgHeight + 10;
      });
    } else {
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      const heading2Text = "IMAGES";
      doc.setFillColor(48, 73, 131);
      doc.rect(leftRightMargin, y - 7, tableWidth, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(heading2Text, pageWidth / 2, y, { align: "center" });
      y += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.text("No Images Available", pageWidth / 2, y, { align: "center" });
      y += 10;
    }

    // doc.setDrawColor(48, 73, 131);
    // doc.setLineWidth(0.5);
    // doc.line(leftRightMargin, y, pageWidth - leftRightMargin, y);
    // const table2StartY = y;

    y += 10;

    const table2Data = [
      ["Report Generated by", getUserNameByEmail(gi.addedBy)],
      ["Position", `${userPosition}`],
      ["Department", `${projectDetails.department_name}`],
      [
        "Reported Date",
        ` ${
          gi.timestamp
            ? new Date(gi.timestamp).toLocaleDateString("en-GB")
            : "N/A"
        }`,
      ],
    ];

    const lineHeight = 5;
    let table2Height = 0;
    table2Data.forEach(([label, value]) => {
      const labelLines = doc.splitTextToSize(label, maxTextWidth);
      const valueLines = doc.splitTextToSize(value, maxTextWidth);
      const rowHeight =
        Math.max(labelLines.length, valueLines.length) * lineHeight + 4;
      table2Height += rowHeight;
    });

    if (y + table2Height + 10 > pageHeight - topBottomMargin - 15) {
      doc.addPage();
      addHeader();
      y = topBottomMargin + 35;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);

    const table2RenderStartY = y;
    table2Data.forEach(([label, value], index) => {
      const labelLines = doc.splitTextToSize(label, maxTextWidth);
      const valueLines = doc.splitTextToSize(value, maxTextWidth);
      const rowHeight =
        Math.max(labelLines.length, valueLines.length) * lineHeight + 4;

      if (index % 2 === 0) {
        doc.setFillColor(195, 206, 232);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(leftRightMargin, y - 2, tableWidth, rowHeight, "F");

      doc.setDrawColor(0);
      doc.rect(leftRightMargin, y - 2, colWidth, rowHeight, "S");
      doc.rect(leftRightMargin + colWidth, y - 2, colWidth, rowHeight, "S");

      labelLines.forEach((line, i) => {
        doc.text(line, leftRightMargin + 2, y + 2 + i * lineHeight);
      });
      valueLines.forEach((line, i) => {
        doc.text(line, leftRightMargin + colWidth + 2, y + 2 + i * lineHeight);
      });

      y += rowHeight;
    });

    doc.rect(
      leftRightMargin,
      table2RenderStartY - 2,
      tableWidth,
      y - table2RenderStartY,
      "S"
    );
    y += 10;

    const addFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(0);

        const footerY = pageHeight - 15;

        doc.setFillColor(48, 73, 131);
        doc.rect(0, footerY, pageWidth, 15, "F");

        const footerTextY = footerY + 9;

        doc.setTextColor(255, 255, 255);
        doc.text("GEODETIC INSTRUMENTS REPORT", leftRightMargin, footerTextY);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - leftRightMargin,
          footerTextY,
          {
            align: "right",
          }
        );
      }
    };

    addFooter();

    return doc.output("blob");
  };

  const downloadSingleEntryAsPDF = (gi, filename) => {
    const pdfBlob = generatePDF(gi, filename);
    saveAs(pdfBlob, `${filename}.pdf`);
  };

  const downloadAllEntriesAsPDF = (entries) => {
    const zip = new JSZip();
    entries.forEach((gi, index) => {
      const pdfBlob = generatePDF(
        gi,
        `hydro_meteorological_instrument_${index + 1}`
      );
      zip.file(`hydro_meteorological_instrument_${index + 1}.pdf`, pdfBlob);
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "HydroMeteorologicalInstruments_Report.zip");
    });
  };

  return (
    <div className="main_page_container">
      <div className="project_details_container">
        <Sidebar />
        <div className="tabs_container">
          <div id="geodeticInstruments" className="tab-content">
            <div className="page_section_heading">
              <h2>Geodetic Instruments</h2>
            </div>

            <div className="accordion" id="accordionPanelsStayOpenExample">
              <div className="accordion-item">
                <h2 className="accordion-header" id="panelsStayOpen-headingOne">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#panelsStayOpen-collapseOne"
                    aria-expanded="false"
                    aria-controls="panelsStayOpen-collapseOne"
                  >
                    Add Geodetic Instruments
                  </button>
                </h2>
                <div
                  id="panelsStayOpen-collapseOne"
                  className="accordion-collapse collapse"
                  aria-labelledby="panelsStayOpen-headingOne"
                >
                  <div className="accordion-body">
                    <div className="row">
                      <div className="col-md-6">
                        <label className="form-label">Name of Instrument</label>
                        <select
                          className="form-control"
                          value={nameOfInstrument}
                          onChange={(e) => setNameOfInstrument(e.target.value)}
                        >
                          <option value="" disabled>
                            Choose Instrument
                          </option>
                          <option value="Total Station">
                            1. Total Station
                          </option>
                          <option value="Survey Markers">
                            2. Survey Markers
                          </option>
                          <option value="Settlement Plates">
                            3. Settlement Plates
                          </option>
                          <option value="Other">
                            4. Other Geodetic Instruments, If Any
                          </option>
                        </select>
                        {nameOfInstrument === "Other" && (
                          <input
                            type="text"
                            className="form-control mt-2"
                            placeholder="Please Specify Name of Instrument"
                            value={customInstrument}
                            onChange={(e) =>
                              setCustomInstrument(e.target.value)
                            }
                          />
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Number of Instruments
                        </label>
                        <input
                          className="form-control"
                          type="number"
                          value={numberOfInstruments}
                          onChange={(e) =>
                            setNumberOfInstruments(e.target.value)
                          }
                          placeholder="Number Of Instruments"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Location</label>
                        <input
                          className="form-control"
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Location"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Responsible Agency for Data Collection and Processing
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          value={agencyResponsible}
                          onChange={(e) => setAgencyResponsible(e.target.value)}
                          placeholder="Agency name"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Installation Date</label>
                        <input
                          className="form-control"
                          type="date"
                          value={sinceWhenInstalled}
                          onChange={(e) =>
                            setSinceWhenInstalled(e.target.value)
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Date of Last/Next Calibration
                        </label>
                        <input
                          className="form-control"
                          type="date"
                          value={dateLastNextCalibration}
                          onChange={(e) =>
                            setDateLastNextCalibration(e.target.value)
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Whether in Working Condition
                        </label>
                        <select
                          className="form-control"
                          value={workingCondition}
                          onChange={(e) => setWorkingCondition(e.target.value)}
                        >
                          <option value="N/A">N/A</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Observations Maintained
                        </label>
                        <select
                          className="form-control"
                          value={observationsMaintained}
                          onChange={(e) =>
                            setObservationsMaintained(e.target.value)
                          }
                        >
                          <option value="N/A">N/A</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Analysis Done at Field Level
                        </label>
                        <select
                          className="form-control"
                          value={analysisDoneAtFieldLevel}
                          onChange={(e) =>
                            setAnalysisDoneAtFieldLevel(e.target.value)
                          }
                        >
                          <option value="N/A">N/A</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Data sent To DSO Regularly
                        </label>
                        <select
                          className="form-control"
                          value={dataSentToDSO}
                          onChange={(e) => setDataSentToDSO(e.target.value)}
                        >
                          <option value="N/A">N/A</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Upload Images</label>
                        <input
                          id="geodeticImagesInput"
                          className="form-control"
                          type="file"
                          multiple
                          accept="image/*"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Upload Video</label>
                        <input
                          id="geodeticVideosInput"
                          className="form-control"
                          type="file"
                          multiple
                          accept="video/*"
                        />
                      </div>

                      <div className="col-md-12">
                        <label className="form-label">Remarks</label>
                        <textarea
                          className="form-control"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Additional Remarks"
                          rows="2"
                        />
                      </div>

                      <div className="col-md-12">
                        <div
                          className="auth_button"
                          style={{ marginTop: "10px" }}
                        >
                          <button onClick={handleAddGeodeticInstruments}>
                            Add Geodetic Instruments
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
                    aria-expanded="false"
                    aria-controls="panelsStayOpen-collapseSeven"
                  >
                    View and Download Geodetic Instruments Data
                  </button>
                </h2>
                <div
                  id="panelsStayOpen-collapseSeven"
                  className="accordion-collapse collapse"
                  aria-labelledby="panelsStayOpen-headingTwo"
                >
                  <div className="accordion-body">
                    <div className="row">
                      {projectDetails?.geodetic_Instruments?.length > 0 ? (
                        <div className="col-md-12 mb-3">
                          <button
                            className="btn btn-primary mb-3"
                            onClick={() =>
                              downloadAllEntriesAsPDF(
                                projectDetails.geodetic_Instruments
                              )
                            }
                          >
                            Download All Data As Report
                          </button>
                          <div style={{ width: "100%", overflowX: "auto" }}>
                            <table className="item_table">
                              <thead>
                                <tr>
                                  <th style={{ textAlign: "center" }}>S.No.</th>
                                  <th style={{ textAlign: "center" }}>
                                    Name of Instrument
                                  </th>
                                  <th style={{ textAlign: "center" }}>
                                    Videos
                                  </th>
                                  <th style={{ textAlign: "center" }}>
                                    Added By
                                  </th>
                                  <th style={{ textAlign: "center" }}>
                                    Added On
                                  </th>
                                  <th style={{ textAlign: "center" }}>
                                    Download Data
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {projectDetails.geodetic_Instruments.map(
                                  (gi, index) => (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>{gi.nameOfInstrument}</td>
                                      <td>
                                        {gi.geodetic_videos &&
                                        gi.geodetic_videos.length > 0
                                          ? gi.geodetic_videos.map(
                                              (videoPath, vidIndex) => (
                                                <div key={vidIndex}>
                                                  <a
                                                    href={`${
                                                      import.meta.env
                                                        .VITE_API_BACKEND_API_URL
                                                    }/${videoPath}`}
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
                                          : "No Videos"}
                                      </td>
                                      <td>{getUserNameByEmail(gi.addedBy)}</td>
                                      <td>
                                        {gi.timestamp
                                          ? new Date(
                                              gi.timestamp
                                            ).toLocaleDateString("en-GB")
                                          : "N/A"}
                                      </td>

                                      <td style={{ textAlign: "center" }}>
                                        <div className="user_update_btn">
                                          <button
                                            onClick={() =>
                                              downloadSingleEntryAsPDF(
                                                gi,
                                                `geodetic_instrument_${
                                                  index + 1
                                                }`
                                              )
                                            }
                                          >
                                            Download
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <p style={{ textAlign: "center", fontSize: "20px" }}>
                          ℹ️ Uh-oh! Geodetic Instruments Data is Not Available.
                          You Can Add it Above!
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

export default GeodeticInstruments;
