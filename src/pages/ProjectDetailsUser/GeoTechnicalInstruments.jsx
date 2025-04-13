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

const GeoTechnicalInstruments = () => {
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

  const handleAddGeoTechnicalInstruments = async () => {
    if (nameOfInstrument === "Other" && !customInstrument.trim()) {
      setAlertMessage("Please specify the custom instrument name.");
      setShowAlert(true);
      return;
    }

    const fileInputImages = document.getElementById("geoTechnicalImagesInput");
    const fileInputVideos = document.getElementById("geoTechnicalVideosInput");

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
        `${
          import.meta.env.VITE_API_BACKEND_API_URL
        }/geo-Technical/${projectid}`,
        formData
      );
      if (response.status === 200) {
        setAlertMessage("Geo-Technical Instrument Added Successfully!");
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
    const fileInputImages = document.getElementById("geoTechnicalImagesInput");
    const fileInputVideos = document.getElementById("geoTechnicalVideosInput");
    if (fileInputImages) fileInputImages.value = "";
    if (fileInputVideos) fileInputVideos.value = "";
  };

  const getUserNameByEmail = (email) => {
    const user = projectDetails?.users?.find((u) => u.email === email);
    return user ? user.name || user.email : email;
  };

  const generatePDF = (gti, filename) => {
    const addedByUser = projectDetails?.users?.find(
      (user) => user.email === gti.addedBy
    );
    const userPosition = addedByUser?.position || "N/A";
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const topBottomMargtin = 5;
    const leftRightMargtin = 22;
    const tableWidth = pageWidth - 2 * leftRightMargtin;
    let y = topBottomMargtin;

    const logoMargtin = 10;

    const addHeader = () => {
      doc.addImage(WordLogo1, "PNG", logoMargtin, topBottomMargtin, 30, 20);
      doc.addImage(
        WordLogo2,
        "PNG",
        pageWidth - 40 - logoMargtin,
        topBottomMargtin,
        45,
        20
      );
      doc.setFontSize(25);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(48, 73, 131);
      doc.text(
        `${projectDetails.project_name}`,
        pageWidth / 2,
        topBottomMargtin + 12,
        {
          align: "center",
        }
      );
      doc.setDrawColor(0);
      doc.line(0, topBottomMargtin + 20, pageWidth, topBottomMargtin + 20);
      doc.setFillColor(48, 73, 131);
      doc.rect(0, topBottomMargtin + 20, pageWidth, 1, "F");
    };

    addHeader();
    y += 35;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const headingText = "GEO-TECHNICAL INSTRUMENTS REPORT";
    doc.setFillColor(48, 73, 131);
    doc.rect(leftRightMargtin, y - 7, tableWidth, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(headingText, pageWidth / 2, y, { align: "center" });
    y += 10;

    let videoLinksText = "N/A";
    if (gti.geoTechnical_videos?.length > 0) {
      videoLinksText = gti.geoTechnical_videos
        .map((_, index) => `Video ${index + 1}`)
        .join("\n");
    }

    const table1Data = [
      ["Name of Instrument", gti.nameOfInstrument],
      ["Number of Instruments", gti.numberOfInstruments.toString()],
      [
        "Responsible Agency for Data Collection and Processing",
        gti.agencyResponsible || "N/A",
      ],
      ["Location", gti.location || "N/A"],
      ["Installed Date", gti.sinceWhenInstalled || "N/A"],
      ["Date Of Last/Next Calibration", gti.dateLastNextCalibration || "N/A"],
      ["Whether in Working Condition", gti.workingCondition],
      ["Observations Maintained", gti.observationsMaintained],
      ["Analysis Done at Field Level", gti.analysisDoneAtFieldLevel],
      ["Data Sent To DSO Regularly", gti.dataSentToDSO],
      ["Videos", videoLinksText],
      ["Remarks", gti.remarks || "N/A"],
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

      if (y + rowHeight > pageHeight - topBottomMargtin - 15) {
        doc.addPage();
        addHeader();
        y = topBottomMargtin + 35;
      }

      if (index % 2 === 0) {
        doc.setFillColor(195, 206, 232);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(leftRightMargtin, y - 2, tableWidth, rowHeight, "F");

      doc.setDrawColor(0);
      doc.rect(leftRightMargtin, y - 2, colWidth, rowHeight, "S");
      doc.rect(leftRightMargtin + colWidth, y - 2, colWidth, rowHeight, "S");

      labelLines.forEach((line, i) => {
        doc.text(line, leftRightMargtin + 2, y + 2 + i * lineHeight);
      });

      valueLines.forEach((line, i) => {
        if (label === "Videos" && gti.geoTechnical_videos?.length > 0) {
          doc.setTextColor(0, 0, 255);
          doc.text(
            line,
            leftRightMargtin + colWidth + 2,
            y + 2 + i * lineHeight
          );
          const textWidth = doc.getTextWidth(line);
          doc.link(
            leftRightMargtin + colWidth + 2,
            y + 2 + i * lineHeight - 5,
            textWidth,
            6,
            {
              url: gti.geoTechnical_videos[i]
                ? `${import.meta.env.VITE_API_BACKEND_API_URL}/${
                    gti.geoTechnical_videos[i]
                  }`
                : "",
            }
          );
          doc.setTextColor(0);
        } else {
          doc.text(
            line,
            leftRightMargtin + colWidth + 2,
            y + 2 + i * lineHeight
          );
        }
      });
      y += rowHeight;
    });

    doc.rect(
      leftRightMargtin,
      table1StartY - 2,
      tableWidth,
      y - table1StartY,
      "S"
    );
    y += 10;

    if (gti.geoTechnical_images && gti.geoTechnical_images.length > 0) {
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      const heading2Text = "IMAGES";
      doc.setFillColor(48, 73, 131);
      doc.rect(leftRightMargtin, y - 7, tableWidth, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(heading2Text, pageWidth / 2, y, { align: "center" });
      y += 10;

      gti.geoTechnical_images.forEach((imgPath, index) => {
        if (y + 70 > pageHeight - topBottomMargtin - 15) {
          doc.addPage();
          addHeader();
          y = topBottomMargtin + 35;
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
      doc.rect(leftRightMargtin, y - 7, tableWidth, 10, "F");
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
    // doc.line(leftRightMargtin, y, pageWidth - leftRightMargtin, y);
    // const table2StartY = y;

    y += 10;

    const table2Data = [
      ["Report Generated by", getUserNameByEmail(gti.addedBy)],
      ["Position", `${userPosition}`],
      ["Department", `${projectDetails.department_name}`],
      [
        "Reported Date",
        ` ${
          gti.timestamp
            ? new Date(gti.timestamp).toLocaleDateString("en-GB")
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

    if (y + table2Height + 10 > pageHeight - topBottomMargtin - 15) {
      doc.addPage();
      addHeader();
      y = topBottomMargtin + 35;
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
      doc.rect(leftRightMargtin, y - 2, tableWidth, rowHeight, "F");

      doc.setDrawColor(0);
      doc.rect(leftRightMargtin, y - 2, colWidth, rowHeight, "S");
      doc.rect(leftRightMargtin + colWidth, y - 2, colWidth, rowHeight, "S");

      labelLines.forEach((line, i) => {
        doc.text(line, leftRightMargtin + 2, y + 2 + i * lineHeight);
      });
      valueLines.forEach((line, i) => {
        doc.text(line, leftRightMargtin + colWidth + 2, y + 2 + i * lineHeight);
      });

      y += rowHeight;
    });

    doc.rect(
      leftRightMargtin,
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
        doc.text(
          "GEO-TECHNICAL INSTRUMENTS REPORT",
          leftRightMargtin,
          footerTextY
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - leftRightMargtin,
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

  const downloadSingleEntryAsPDF = (gti, filename) => {
    const pdfBlob = generatePDF(gti, filename);
    saveAs(pdfBlob, `${filename}.pdf`);
  };

  const downloadAllEntriesAsPDF = (entries) => {
    const zip = new JSZip();
    entries.forEach((gti, index) => {
      const pdfBlob = generatePDF(
        gti,
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
          <div id="geoTechnicalInstruments" className="tab-content">
            <div className="page_section_heading">
              <h2>Geo-Technical Instruments</h2>
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
                    Add Geo-Technical Instruments
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
                          <optgroup label="1. Piezometers">
                            <option value="Stand Pipe (Piezometers)">
                              1.1 Stand Pipe
                            </option>
                            <option value="Casagrande (Piezometers)">
                              1.2 Casagrande
                            </option>
                            <option value="Twin Tube (Piezometers)">
                              1.3 Twin Tube
                            </option>
                            <option value="Vibrating Wire (Piezometers)">
                              1.4 Vibrating Wire
                            </option>
                          </optgroup>
                          <optgroup label="2. Uplift Pressure Cell">
                            <option value="For Permeable Foundation (Uplift pressure Cell)">
                              2.1 For Permeable Foundation
                            </option>
                            <option value="For Rock Foundation (Uplift Pressure Cell)">
                              2.2 For Rock Foundation
                            </option>
                          </optgroup>
                          <optgroup label="3. Strain Gauge">
                            <option value="Mechanical Strain Gauge (Strain Gauge)">
                              3.1 Mechanical Strain Gauge
                            </option>
                            <option value="Electrical Strain Gauge (Strain Gauge)">
                              3.2 Electrical Strain Gauge
                            </option>
                          </optgroup>
                          <optgroup label="4. Strain Meter">
                            <option value="Vibrating Wire (Strain Meter)">
                              4.1 Vibrating Wire
                            </option>
                          </optgroup>
                          <optgroup label="5. Thermometers">
                            <option value="Resistance (Thermometers)">
                              5.1 Resistance
                            </option>
                            <option value="Vibrating Wire (Thermometers)">
                              5.2 Vibrating Wire
                            </option>
                          </optgroup>
                          <optgroup label="6. Stress Meter">
                            <option value="Mechanical (Stress Meter)">
                              6.1 Mechanical
                            </option>
                            <option value="Electrical (Stress Meter)">
                              6.2 Electrical
                            </option>
                          </optgroup>
                          <optgroup label="7. Seepage Measurement">
                            <option value="V-Notch (Seepage Measurement)">
                              7.1 V-Notch
                            </option>
                            <option value="Other devices (Seepage Measurement)">
                              7.2 Other devices
                            </option>
                          </optgroup>
                          <optgroup label="8. Automation">
                            <option value="Data Logger (Automation)">
                              8.1 Data Logger
                            </option>
                            <option value="Data Acquisition System (Automation)">
                              8.2 Data Acquisition System
                            </option>
                            <option value="Computers (Automation)">
                              8.3 Computers
                            </option>
                          </optgroup>
                          <option value="Plumb Bob – Direct">
                            9. Plumb Bob – Direct
                          </option>
                          <option value="Plumb Bob – Inverted">
                            10. Plumb Bob – Inverted
                          </option>
                          <option value="Detachable Gauges for Surface Displacement">
                            11. Detachable Gauges for Surface Displacement
                          </option>
                          <option value="Joint Meter for Internal Joint Movement">
                            12. Joint Meter for Internal Joint Movement
                          </option>
                          <option value="Tilt Meter">13. Tilt Meter</option>
                          <option value="Foundation Settlement Deformation Meter">
                            14. Foundation Settlement Deformation Meter
                          </option>
                          <option value="Inclinometer">15. Inclinometer</option>
                          <option value="Other">
                            16. Other Geo-Technical Instruments, If Any
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
                          placeholder="Number of Instruments"
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
                          Data sent to DSO Regularly
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
                          id="geoTechnicalImagesInput"
                          className="form-control"
                          type="file"
                          multiple
                          accept="image/*"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Upload Video</label>
                        <input
                          id="geoTechnicalVideosInput"
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
                          <button onClick={handleAddGeoTechnicalInstruments}>
                            Add Geo-Technical Instruments
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
                    View and Download Geo-Technical Instruments Data
                  </button>
                </h2>
                <div
                  id="panelsStayOpen-collapseSeven"
                  className="accordion-collapse collapse"
                  aria-labelledby="panelsStayOpen-headingTwo"
                >
                  <div className="accordion-body">
                    <div className="row">
                      {projectDetails?.geo_Technical_Instruments?.length > 0 ? (
                        <div className="col-md-12 mb-3">
                          <button
                            className="btn btn-primary mb-3"
                            onClick={() =>
                              downloadAllEntriesAsPDF(
                                projectDetails.geo_Technical_Instruments
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
                                {projectDetails.geo_Technical_Instruments.map(
                                  (gti, index) => (
                                    <tr key={index}>
                                      <td>{index + 1}</td>
                                      <td>{gti.nameOfInstrument}</td>
                                      <td>
                                        {gti.geoTechnical_videos &&
                                        gti.geoTechnical_videos.length > 0
                                          ? gti.geoTechnical_videos.map(
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
                                      <td>{getUserNameByEmail(gti.addedBy)}</td>

                                      <td>
                                        {gti.timestamp
                                          ? new Date(
                                              gti.timestamp
                                            ).toLocaleDateString("en-GB")
                                          : "N/A"}
                                      </td>
                                      <td style={{ textAlign: "center" }}>
                                        <div className="user_update_btn">
                                          <button
                                            onClick={() =>
                                              downloadSingleEntryAsPDF(
                                                gti,
                                                `geo_technical_instrument_${
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
                          ℹ️ Uh-oh! Geo-Technical Instruments Data is Not
                          Available. You Can Add it Above!
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

export default GeoTechnicalInstruments;
