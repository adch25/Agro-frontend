import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Button,
} from "react-native";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useAlertContext } from "../../context/AlertContext";
import { useLoaderContext } from "../../context/LoaderContext";
import { useUserContext } from "../../context/UserContext";
import Navbar from "../../components/Navbar";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const AccordionSection = ({ title, children, isOpen, onToggle }) => (
  <View style={styles.accordionItem}>
    <TouchableOpacity style={styles.accordionHeader} onPress={onToggle}>
      <Text style={styles.accordionTitle}>{title}</Text>
      <Ionicons
        name={isOpen ? "chevron-up" : "chevron-down"}
        size={20}
        color="#000"
      />
    </TouchableOpacity>
    {isOpen && <View style={styles.accordionBody}>{children}</View>}
  </View>
);

const HydroMeteorologicalInstruments = () => {
  const { damId } = useLocalSearchParams();
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
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { setIsLoading } = useLoaderContext();
  const [openAccordion, setOpenAccordion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_BACKEND_API_URL}/project-details/${damId}`
      );
      setProjectDetails(response.data.project);
    } catch (error) {
      setAlertMessage(`Error fetching project details: ${error.message}`);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [damId]);

  const handleAddHydroMeteorologicalInstrument = async () => {
    if (nameOfInstrument === "Other" && !customInstrument.trim()) {
      setAlertMessage("Please specify the custom instrument name.");
      setShowAlert(true);
      return;
    }

    const formData = new FormData();
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

    imageFiles.forEach((file, index) => {
      formData.append("fileInputImage", {
        uri: file.uri,
        name: file.name || `image_${index}.jpg`,
        type: file.mimeType || file.type || "image/jpeg",
      });
    });

    videoFiles.forEach((file, index) => {
      formData.append("fileInputVideo", {
        uri: file.uri,
        name: file.name || `video_${index}.mp4`,
        type: file.mimeType || file.type || "video/mp4",
      });
    });

    try {
      setIsLoading(true);
      console.log("FormData contents:");
      for (let pair of formData._parts) {
        console.log(pair[0], pair[1]);
      }
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_BACKEND_API_URL}/hydro-meteorological/${damId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.status === 200) {
        setAlertMessage("Hydro-Meteorological Instrument Added Successfully!");
        setShowAlert(true);
        resetForm();
        fetchProjectDetails();
      }
    } catch (error) {
      console.log(
        "Error adding instrument:",
        error.response?.data || error.message
      );
      setAlertMessage(`Failed To Add Instrument: ${error.message}`);
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
    setImageFiles([]);
    setVideoFiles([]);
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus !== "granted" || mediaStatus !== "granted") {
      setAlertMessage("Camera or media library permissions are required.");
      setShowAlert(true);
      return false;
    }
    return true;
  };

  const pickFromGallery = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: type === "image" ? "image/*" : "video/*",
        multiple: true,
      });
      if (!result.canceled) {
        const files = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          type:
            asset.mimeType || (type === "image" ? "image/jpeg" : "video/mp4"),
        }));
        if (type === "image") {
          setImageFiles((prev) => [...prev, ...files]);
        } else {
          setVideoFiles((prev) => [...prev, ...files]);
        }
      }
    } catch (error) {
      setAlertMessage(`Error picking ${type} from gallery: ${error.message}`);
      setShowAlert(true);
    }
  };

  const captureWithCamera = async (type) => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      let result;
      if (type === "image") {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
      } else {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          videoMaxDuration: 60,
        });
      }

      if (!result.canceled) {
        const file = result.assets[0];
        const formattedFile = {
          uri: file.uri,
          name:
            file.fileName ||
            `capture_${Date.now()}.${type === "image" ? "jpg" : "mp4"}`,
          type:
            file.mimeType || (type === "image" ? "image/jpeg" : "video/mp4"),
        };
        if (type === "image") {
          setImageFiles((prev) => [...prev, formattedFile]);
        } else {
          setVideoFiles((prev) => [...prev, formattedFile]);
        }
      }
    } catch (error) {
      setAlertMessage(`Error capturing ${type} with camera: ${error.message}`);
      setShowAlert(true);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const getUserNameByEmail = (email) => {
    const user = projectDetails?.users?.find((u) => u.email === email);
    return user ? user.name || user.email : email;
  };

  const generatePDF = async (hmi, filename) => {
    const addedByUser = projectDetails?.users?.find(
      (user) => user.email === hmi.addedBy
    );
    const userPosition = addedByUser?.position || "N/A";

    // Create HTML content for the PDF
    let htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; }
          .logo-container { display: flex; justify-content: space-between; }
          .logo { height: 50px; }
          .project-title { color: #304983; font-size: 24px; font-weight: bold; }
          .section-title { background-color: #304983; color: white; padding: 10px; text-align: center; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .row-odd { background-color: #C3CEE8; }
          .row-even { background-color: #FFFFFF; }
          .images { margin-top: 20px; }
          .image { max-width: 200px; margin: 10px; }
          .footer { position: fixed; bottom: 0; width: 100%; background-color: #304983; color: white; text-align: center; padding: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <img src="https://your-backend-url/PrimaryLogo_TransparentBg.png" class="logo" />
            <img src="https://your-backend-url/logo.png" class="logo" />
          </div>
          <h1 class="project-title">${projectDetails.project_name}</h1>
          <hr style="border: 1px solid #000;" />
        </div>
        <h2 class="section-title">HYDRO-METEOROLOGICAL INSTRUMENTS REPORT</h2>
        <table>
          <tr class="row-even">
            <th>Name of Instrument</th>
            <td>${hmi.nameOfInstrument || "N/A"}</td>
          </tr>
          <tr class="row-odd">
            <th>Number of Instruments</th>
            <td>${hmi.numberOfInstruments || "N/A"}</td>
          </tr>
          <tr class="row-even">
            <th>Responsible Agency</th>
            <td>${hmi.agencyResponsible || "N/A"}</td>
          </tr>
          <tr class="row-odd">
            <th>Location</th>
            <td>${hmi.location || "N/A"}</td>
          </tr>
          <tr class="row-even">
            <th>Installed Date</th>
            <td>${hmi.sinceWhenInstalled || "N/A"}</td>
          </tr>
          <tr class="row-odd">
            <th>Date of Last/Next Calibration</th>
            <td>${hmi.dateLastNextCalibration || "N/A"}</td>
          </tr>
          <tr class="row-even">
            <th>Whether in Working Condition</th>
            <td>${hmi.workingCondition || "N/A"}</td>
          </tr>
          <tr class="row-odd">
            <th>Observations Maintained</th>
            <td>${hmi.observationsMaintained || "N/A"}</td>
          </tr>
          <tr class="row-even">
            <th>Analysis Done at Field Level</th>
            <td>${hmi.analysisDoneAtFieldLevel || "N/A"}</td>
          </tr>
          <tr class="row-odd">
            <th>Data Sent to DSO Regularly</th>
            <td>${hmi.dataSentToDSO || "N/A"}</td>
          </tr>
          <tr class="row-even">
            <th>Videos</th>
            <td>${
              hmi.hydroMeteorological_videos?.length > 0
                ? hmi.hydroMeteorological_videos
                    .map(
                      (video, index) =>
                        `<a href="${
                          process.env.EXPO_PUBLIC_API_BACKEND_API_URL
                        }/${video}">Video ${index + 1}</a>`
                    )
                    .join("<br/>")
                : "N/A"
            }</td>
          </tr>
          <tr class="row-odd">
            <th>Remarks</th>
            <td>${hmi.remarks || "N/A"}</td>
          </tr>
        </table>
        <h2 class="section-title">IMAGES</h2>
        <div class="images">
          ${
            hmi.hydroMeteorological_images?.length > 0
              ? hmi.hydroMeteorological_images
                  .map(
                    (img) =>
                      `<img src="${process.env.EXPO_PUBLIC_API_BACKEND_API_URL}/${img}" class="image" />`
                  )
                  .join("")
              : "<p>No Images Available</p>"
          }
        </div>
        <table style="margin-top: 20px;">
          <tr class="row-even">
            <th>Report Generated by</th>
            <td>${getUserNameByEmail(hmi.addedBy)}</td>
          </tr>
          <tr class="row-odd">
            <th>Position</th>
            <td>${userPosition}</td>
          </tr>
          <tr class="row-even">
            <th>Department</th>
            <td>${projectDetails.department_name || "N/A"}</td>
          </tr>
          <tr class="row-odd">
            <th>Reported Date</th>
            <td>${
              hmi.timestamp
                ? new Date(hmi.timestamp).toLocaleDateString("en-GB")
                : "N/A"
            }</td>
          </tr>
        </table>
        <div class="footer">
          <p>HYDRO-METEOROLOGICAL INSTRUMENTS REPORT</p>
        </div>
      </body>
    </html>
  `;

    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      return uri;
    } catch (error) {
      console.error("Error generating PDF:", error);
      setAlertMessage(`Failed to generate PDF: ${error.message}`);
      setShowAlert(true);
      return null;
    }
  };

  const downloadSingleEntryAsPDF = async (item, filename) => {
    const pdfUri = await generatePDF(item, filename);
    if (pdfUri) {
      await Sharing.shareAsync(pdfUri, {
        mimeType: "application/pdf",
        dialogTitle: `Share ${filename}.pdf`,
        UTI: "com.adobe.pdf",
      });
    }
  };

  const downloadAllEntriesAsPDF = async (entries) => {
    if (entries.length === 0) {
      setAlertMessage("No entries available to download.");
      setShowAlert(true);
      return;
    }

    // Generate a single PDF with all entries
    let htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; }
          .logo-container { display: flex; justify-content: space-between; }
          .logo { height: 50px; }
          .project-title { color: #304983; font-size: 24px; font-weight: bold; }
          .section-title { background-color: #304983; color: white; padding: 10px; text-align: center; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .row-odd { background-color: #C3CEE8; }
          .row-even { background-color: #FFFFFF; }
          .images { margin-top: 20px; }
          .image { max-width: 200px; margin: 10px; }
          .footer { position: fixed; bottom: 0; width: 100%; background-color: #304983; color: white; text-align: center; padding: 10px; }
          .entry { margin-bottom: 40px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <img src="https://your-backend-url/PrimaryLogo_TransparentBg.png" class="logo" />
            <img src="https://your-backend-url/logo.png" class="logo" />
          </div>
          <h1 class="project-title">${projectDetails.project_name}</h1>
          <hr style="border: 1px solid #000;" />
        </div>
        <h2 class="section-title">HYDRO-METEOROLOGICAL INSTRUMENTS REPORT</h2>
  `;

    entries.forEach((hmi, index) => {
      const addedByUser = projectDetails?.users?.find(
        (user) => user.email === hmi.addedBy
      );
      const userPosition = addedByUser?.position || "N/A";
      htmlContent += `
      <div class="entry">
        <h3>Entry ${index + 1}</h3>
        <table>
          <tr class="row-even">
            <th>Name of Instrument</th>
            <td>${hmi.nameOfInstrument || "N/A"}</td>
          </tr>
          <tr class="row-odd">
            <th>Number of Instruments</th>
            <td>${hmi.numberOfInstruments || "N/A"}</td>
          </tr>
          <tr class="row-even">
            <th>Responsible Agency</th>
            <td>${hmi.agencyResponsible || "N/A"}</td>
          </tr>
          <tr class="row-odd">
            <th>Location</th>
            <td>${hmi.location || "N/A"}</td>
          </tr>
          <tr class="row-even">
            <th>Installed Date</th>
            <td>${hmi.sinceWhenInstalled || "N/A"}</td>
          </tr>
          <tr class="row-odd">
            <th>Date of Last/Next Calibration</th>
            <td>${hmi.dateLastNextCalibration || "N/A"}</td>
          </tr>
          <tr class="row-even">
            <th>Whether in Working Condition</th>
            <td>${hmi.workingCondition || "N/A"}</td>
          </tr>
          <tr class="row-odd">
            <th>Observations Maintained</th>
            <td>${hmi.observationsMaintained || "N/A"}</td>
          </tr>
          <tr class="row-even">
            <th>Analysis Done at Field Level</th>
            <td>${hmi.analysisDoneAtFieldLevel || "N/A"}</td>
          </tr>
          <tr class="row-odd">
            <th>Data Sent to DSO Regularly</th>
            <td>${hmi.dataSentToDSO || "N/A"}</td>
          </tr>
          <tr class="row-even">
            <th>Videos</th>
            <td>${
              hmi.hydroMeteorological_videos?.length > 0
                ? hmi.hydroMeteorological_videos
                    .map(
                      (video, vidIndex) =>
                        `<a href="${
                          process.env.EXPO_PUBLIC_API_BACKEND_API_URL
                        }/${video}">Video ${vidIndex + 1}</a>`
                    )
                    .join("<br/>")
                : "N/A"
            }</td>
          </tr>
          <tr class="row-odd">
            <th>Remarks</th>
            <td>${hmi.remarks || "N/A"}</td>
          </tr>
        </table>
        <h2 class="section-title">IMAGES</h2>
        <div class="images">
          ${
            hmi.hydroMeteorological_images?.length > 0
              ? hmi.hydroMeteorological_images
                  .map(
                    (img) =>
                      `<img src="${process.env.EXPO_PUBLIC_API_BACKEND_API_URL}/${img}" class="image" />`
                  )
                  .join("")
              : "<p>No Images Available</p>"
          }
        </div>
        <table style="margin-top: 20px;">
          <tr class="row-even">
            <th>Report Generated by</th>
            <td>${getUserNameByEmail(hmi.addedBy)}</td>
          </tr>
          <tr class="row-odd">
            <th>Position</th>
            <td>${userPosition}</td>
          </tr>
          <tr class="row-even">
            <th>Department</th>
            <td>${projectDetails.department_name || "N/A"}</td>
          </tr>
          <tr class="row-odd">
            <th>Reported Date</th>
            <td>${
              hmi.timestamp
                ? new Date(hmi.timestamp).toLocaleDateString("en-GB")
                : "N/A"
            }</td>
          </tr>
        </table>
      </div>
    `;
    });

    htmlContent += `
        <div class="footer">
          <p>HYDRO-METEOROLOGICAL INSTRUMENTS REPORT</p>
        </div>
      </body>
    </html>
  `;

    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share HydroMeteorologicalInstruments_Report.pdf",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Error generating all entries PDF:", error);
      setAlertMessage(`Failed to generate all entries PDF: ${error.message}`);
      setShowAlert(true);
    }
  };

  return (
    <View style={styles.container}>
      <Navbar />
      <View style={styles.headingContainer}>
        <Text style={styles.heading}>Hydro-Meteorological Instruments</Text>
      </View>
      <ScrollView style={styles.scrollContent}>
        <AccordionSection
          title="Add Hydro-Meteorological Instruments"
          isOpen={openAccordion === "add"}
          onToggle={() =>
            setOpenAccordion(openAccordion === "add" ? null : "add")
          }
        >
          <View>
            <Text style={styles.label}>Name of Instrument</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={nameOfInstrument}
                onValueChange={(value) => setNameOfInstrument(value)}
                style={styles.picker}
              >
                <Picker.Item label="Choose Instrument" value="" />
                <Picker.Item
                  label="1. Rain-gauge on Dam"
                  value="Rain-gauge on Dam"
                />
                <Picker.Item
                  label="2. Rain-gauge in the Catchment"
                  value="Rain-gauge in the Catchment"
                />
                <Picker.Item
                  label="3. Pan Evaporimeter"
                  value="Pan Evaporimeter"
                />
                <Picker.Item
                  label="4. Wind Velocity Recorder"
                  value="Wind Velocity Recorder"
                />
                <Picker.Item
                  label="5. Wind Direction Recorder"
                  value="Wind Direction Recorder"
                />
                <Picker.Item
                  label="6. Wave Height Recorder"
                  value="Wave Height Recorder"
                />
                <Picker.Item
                  label="7. Wet and Dry Bulb Thermometer"
                  value="Wet and Dry Bulb Thermometer"
                />
                <Picker.Item label="8. Barometer" value="Barometer" />
                <Picker.Item
                  label="9. Thermometers for Air Temperature"
                  value="Thermometers for Air Temperature"
                />
                <Picker.Item
                  label="10. Thermometers (Reservoir Temp.)"
                  value="Thermometers for Reservoir Water Temperature"
                />
                <Picker.Item
                  label="11. Automatic Weather Station"
                  value="Automatic Weather Station"
                />
                <Picker.Item label="12. Reservoir Level Gate" enabled={false} />
                <Picker.Item
                  label="12.1 Staff Gate"
                  value="Staff Gate (Reservoir Level Gate)"
                />
                <Picker.Item
                  label="12.2 Automatic"
                  value="Automatic (Reservoir Level Gate)"
                />
                <Picker.Item label="13. Other" value="Other" />
              </Picker>
            </View>
            {nameOfInstrument === "Other" && (
              <TextInput
                style={styles.input}
                placeholder="Specify Instrument Name"
                value={customInstrument}
                onChangeText={setCustomInstrument}
              />
            )}

            <Text style={styles.label}>Number of Instruments</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={numberOfInstruments}
              onChangeText={setNumberOfInstruments}
              placeholder="Number of Instruments"
            />

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Location"
            />

            <Text style={styles.label}>Responsible Agency</Text>
            <TextInput
              style={styles.input}
              value={agencyResponsible}
              onChangeText={setAgencyResponsible}
              placeholder="Agency Name"
            />

            <Text style={styles.label}>Installation Date</Text>
            <TextInput
              style={styles.input}
              value={sinceWhenInstalled}
              onChangeText={setSinceWhenInstalled}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Date of Last/Next Calibration</Text>
            <TextInput
              style={styles.input}
              value={dateLastNextCalibration}
              onChangeText={setDateLastNextCalibration}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Whether in Working Condition</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={workingCondition}
                onValueChange={setWorkingCondition}
                style={styles.picker}
              >
                <Picker.Item label="N/A" value="N/A" />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
              </Picker>
            </View>

            <Text style={styles.label}>Observations Maintained</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={observationsMaintained}
                onValueChange={setObservationsMaintained}
                style={styles.picker}
              >
                <Picker.Item label="N/A" value="N/A" />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
              </Picker>
            </View>

            <Text style={styles.label}>Analysis Done at Field Level</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={analysisDoneAtFieldLevel}
                onValueChange={setAnalysisDoneAtFieldLevel}
                style={styles.picker}
              >
                <Picker.Item label="N/A" value="N/A" />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
              </Picker>
            </View>

            <Text style={styles.label}>Data Sent to DSO Regularly</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={dataSentToDSO}
                onValueChange={setDataSentToDSO}
                style={styles.picker}
              >
                <Picker.Item label="N/A" value="N/A" />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
              </Picker>
            </View>

            <Text style={styles.label}>Upload Images</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => openModal("image")}
            >
              <Text>Upload Images ({imageFiles.length})</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Upload Videos</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => openModal("video")}
            >
              <Text>Upload Videos ({videoFiles.length})</Text>
            </TouchableOpacity>

            <Modal visible={showModal} animationType="slide" transparent={true}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    {modalType === "image" ? "Add Image" : "Add Video"}
                  </Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setShowModal(false);
                      captureWithCamera(modalType);
                    }}
                  >
                    <Text>Use Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setShowModal(false);
                      pickFromGallery(modalType);
                    }}
                  >
                    <Text>Use Gallery</Text>
                  </TouchableOpacity>
                  <Button title="Cancel" onPress={() => setShowModal(false)} />
                </View>
              </View>
            </Modal>

            <Text style={styles.label}>Remarks</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Additional Remarks"
            />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAddHydroMeteorologicalInstrument}
            >
              <Text style={styles.actionButtonText}>Add Instrument</Text>
            </TouchableOpacity>
          </View>
        </AccordionSection>

        <AccordionSection
          title="View Hydro-Meteorological Instruments"
          isOpen={openAccordion === "view"}
          onToggle={() =>
            setOpenAccordion(openAccordion === "view" ? null : "view")
          }
        >
          {projectDetails?.hydro_Meteorological_Instruments?.length > 0 ? (
            <ScrollView>
              <TouchableOpacity
                style={styles.downloadPDFAllButton}
                onPress={() =>
                  downloadAllEntriesAsPDF(
                    projectDetails.hydro_Meteorological_Instruments
                  )
                }
              >
                <Text style={styles.downloadPDFAllButtonText}>
                  Download All Data As Report
                </Text>
              </TouchableOpacity>
              {projectDetails.hydro_Meteorological_Instruments.map(
                (item, index) => (
                  <View key={index} style={styles.reportCard}>
                    <View style={styles.row}>
                      <Text style={styles.headingText}>Sr.No.</Text>
                      <Text style={styles.dataText}>{index + 1}</Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.headingText}>Instrument</Text>
                      <Text style={styles.dataText}>
                        {item.nameOfInstrument ? item.nameOfInstrument : "N/A"}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.headingText}>Added By</Text>
                      <Text style={styles.dataText}>
                        {getUserNameByEmail(item.addedBy)}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.headingText}>Added On</Text>
                      <Text style={styles.dataText}>
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleDateString("en-GB")
                          : "N/A"}
                      </Text>
                    </View>

                    <Text style={styles.noteText}>
                      For more details, click on the download button.
                    </Text>

                    <View style={styles.row}>
                      <Text style={styles.headingText}>Download</Text>
                      <Text style={styles.dataText}>
                        <TouchableOpacity
                          style={styles.downloadPDFSingleButton}
                          onPress={() =>
                            downloadSingleEntryAsPDF(
                              item,
                              `hydro_meteorological_instrument_${index + 1}`
                            )
                          }
                        >
                          <Text style={styles.downloadPDFSingleButtonText}>
                            Download
                          </Text>
                        </TouchableOpacity>
                      </Text>
                    </View>
                  </View>
                )
              )}
            </ScrollView>
          ) : (
            <Text style={styles.noDataText}>
              ℹ️ Uh-oh! Hydro-Meteorological Instruments Data Is Not Available.
              You Can Add it Above!
            </Text>
          )}
        </AccordionSection>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flex: 1, paddingHorizontal: 15 },
  headingContainer: {
    backgroundColor: "whitesmoke",
    paddingVertical: 10,
    marginHorizontal: 15,
    borderRadius: 50,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 15,
    color: "#003f7f",
  },
  accordionItem: { marginVertical: 5 },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
  },
  accordionTitle: { fontSize: 16, fontWeight: "bold" },
  accordionBody: { padding: 15, backgroundColor: "#fff", borderRadius: 4 },
  label: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 5,
    paddingLeft: 10,
  },
  pickerContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: { height: 50 },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#43a047",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    minWidth: "30%",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  uploadButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  reportCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "left",
  },
  dataText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
    textAlign: "right",
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  noteText: {
    marginTop: 10,
    fontStyle: "italic",
    fontSize: 11,
    color: "#555",
    textAlign: "center",
  },
  downloadPDFSingleButton: {
    backgroundColor: "#3bc6f9",
    borderRadius: 20,
    alignItems: "center",
  },
  downloadPDFSingleButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 15,
    paddingRight: 15,
  },
  downloadPDFAllButton: {
    backgroundColor: "#0d6efd",
    borderRadius: 8,
    alignItems: "center",
  },
  downloadPDFAllButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    paddingTop: 11,
    paddingBottom: 11,
  },
});

export default HydroMeteorologicalInstruments;
