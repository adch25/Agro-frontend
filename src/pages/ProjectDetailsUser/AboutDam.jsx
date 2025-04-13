import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { useAlertContext } from "../../context/AlertContext";
import { useLoaderContext } from "../../context/LoaderContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import Sidebar from "./Sidebar";

const AboutDam = () => {
  const { projectid } = useParams();
  const [mapCenter, setMapCenter] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { setIsLoading } = useLoaderContext();

  const locationPin = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BACKEND_API_URL
          }/project-details/${projectid}`
        );

        setProjectDetails(response.data.project);
        if (
          response.data.project &&
          !isNaN(parseFloat(response.data.project.latitude)) &&
          !isNaN(parseFloat(response.data.project.longitude))
        ) {
          setMapCenter([
            parseFloat(response.data.project.latitude),
            parseFloat(response.data.project.longitude),
          ]);
        }
      } catch (error) {
        setAlertMessage("Error fetching project details:", error);
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectDetails();
  }, [projectid]);

  if (!projectDetails) return <div>Loading...</div>;

  return (
    <div className="main_page_container">
      <div className="project_details_container">
        <Sidebar />
        <div className="tabs_container">
          <div id="aboutDam" className="tab-content">
            <div className="page_section_heading">
              <h2>{projectDetails?.project_name}</h2>
            </div>
            <div className="row">
              <div className="col-sm-4 mb-2">
                <div className="card bg-light">
                  <div className="card-body">
                    <h4 className="card-title">DEPARTMENT NAME</h4>
                    <p className="card-text">
                      {projectDetails?.department_name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-sm-4 mb-2">
                <div className="card bg-light">
                  <div className="card-body">
                    <h4 className="card-title">ADDRESS</h4>
                    <p className="card-text">{projectDetails?.address}</p>
                  </div>
                </div>
              </div>
              <div className="col-sm-4 mb-2">
                <div className="card bg-light">
                  <div className="card-body">
                    <h4 className="card-title">PURPOSE OF DAM</h4>
                    <p className="card-text">
                      {projectDetails?.purpose_of_dam?.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-sm-9 mb-2">
                <div className="card bg-light">
                  <div className="card-body">
                    <MapContainer
                      center={mapCenter}
                      style={{
                        width: "100%",
                        height: "48vh",
                        borderRadius: "5px",
                      }}
                      zoom={13}
                      maxZoom={18}
                      minZoom={13}
                      attributionControl={false}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                        subdomains={["mt0", "mt1", "mt2", "mt3"]}
                        attribution="Basemap: &copy;2024 Google"
                      />
                      <Marker
                        position={[mapCenter?.[0], mapCenter?.[1]]}
                        icon={locationPin}
                      >
                        <Popup>
                          {projectDetails?.project_name} <br />
                          {projectDetails?.address}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              </div>
              <div className="col-sm-3 mb-2">
                <div className="card bg-light">
                  <div className="card-body">
                    <p className="card-text">
                      <h5>DAM HEIGHT</h5>
                      {projectDetails?.dam_height?.value}{" "}
                      {projectDetails?.dam_height?.unit}
                    </p>
                    <p className="card-text">
                      <h5>RESERVIOR AREA</h5>
                      {projectDetails?.reservoir_area?.value}{" "}
                      {projectDetails?.reservoir_area?.unit}
                    </p>
                    <p className="card-text">
                      <h5>RESERVIOR VOLUME</h5>
                      {projectDetails?.reservoir_volume?.value}{" "}
                      {projectDetails?.reservoir_volume?.unit}
                    </p>
                    <p className="card-text">
                      <h5>HFL</h5>
                      {projectDetails?.hfl?.value} {projectDetails?.hfl?.unit}
                    </p>
                    <p className="card-text">
                      <h5>MRL</h5>
                      {projectDetails?.mrl?.value} {projectDetails?.mrl?.unit}
                    </p>
                    <p className="card-text">
                      <h5>HYDROPOWER CAPACITY</h5>
                      {projectDetails?.hydropower_capacity?.value}
                      {projectDetails?.hydropower_capacity?.unit}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-sm-12 mb-2">
                <div className="card bg-light">
                  <div className="card-body">
                    <h4 className="card-title">DAM DESCRIPTION</h4>
                    <p className="card-text">
                      {projectDetails?.project_description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-sm-12 mb-2">
                <div className="card bg-light">
                  <div className="card-body">
                    <h4 className="card-title">DAM IMAGES</h4>
                    <div className="home_cards">
                      {projectDetails?.dam_images &&
                      projectDetails?.dam_images.length > 0 ? (
                        projectDetails.dam_images.map((imageData, index) => (
                          <div key={imageData._id} className="dam_card">
                            <div className="dam_image">
                              <a
                                href={`${
                                  import.meta.env.VITE_API_BACKEND_API_URL
                                }/${imageData.file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={`${
                                    import.meta.env.VITE_API_BACKEND_API_URL
                                  }/${imageData.file_url}`}
                                  alt={`Dam Image ${index + 1}`}
                                />
                              </a>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No dam images available for this project.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-sm-12">
                <div className="card bg-light">
                  <div className="card-body">
                    <h4 className="card-title">DAM VIDEOS</h4>
                    <div className="home_cards">
                      {projectDetails?.dam_videos &&
                      projectDetails?.dam_videos.length > 0 ? (
                        projectDetails.dam_videos.map((videoData, index) => (
                          <div key={videoData._id} className="dam_video_card">
                            <div className="dam_video">
                              <a
                                href={`${
                                  import.meta.env.VITE_API_BACKEND_API_URL
                                }/${videoData.file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <video
                                  // controls
                                  width="100%"
                                  alt={`Dam Video ${index + 1}`}
                                  muted
                                >
                                  <source
                                    src={`${
                                      import.meta.env.VITE_API_BACKEND_API_URL
                                    }/${videoData.file_url}`}
                                    type="video/mp4"
                                  />
                                  Your browser does not support the video tag.
                                </video>
                              </a>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No dam videos available for this project.</p>
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

export default AboutDam;