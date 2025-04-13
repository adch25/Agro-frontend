import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useAlertContext } from "../context/AlertContext";
import { useUserContext } from "../context/UserContext";
import { useLoaderContext } from "../context/LoaderContext";
import { FaRegFolderOpen } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { RiExchangeBoxLine } from "react-icons/ri";

const AdminPage = () => {
  const navigate = useNavigate();
  const { loginUser, handleLogout } = useUserContext();
  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { setIsLoading } = useLoaderContext();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BACKEND_API_URL}/all-projects`
      );
      console.log(response);
      setProjects(response.data.projects);
    } catch (error) {
      setAlertMessage("Error fetching projects:", error);
      setShowAlert(true);
    }
  };

  const deleteProject = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );
    if (confirmDelete) {
      try {
        setIsLoading(true);
        console.log(id);
        await axios
          .delete(
            `${import.meta.env.VITE_API_BACKEND_API_URL}/delete-project/${id}`
          )
          .then((response) => {
            fetchProjects();
            setAlertMessage(response.data.message);
            setShowAlert(true);
            setIsLoading(false);
          });
      } catch (error) {
        setAlertMessage("Error deleting project:", error);
        setShowAlert(true);
      }
    }
  };

  console.log(projects);
  console.log(projects.img_url);
  return (
    <>
      <div className="main_page_container">
        <div className="admin_container">
          <div className="panel-content">
            <div className="section_content">
              <div className="page_section_heading">
                <h2>Admin Panel</h2>
              </div>

              <Link to="/admin/create-project">
                {" "}
                <button className="btn_general">
                  <FaRegFolderOpen />
                  New Project{" "}
                </button>
              </Link>

              {loginUser && (
                <button className="btn_general" onClick={handleLogout}>
                  <FiLogOut /> Logout
                </button>
              )}
            </div>
            <div className="section_content">
              <table className="item_table">
                <thead>
                  <tr>
                    <th style={{ width: "10%" }}>Dam Name</th>
                    <th style={{ width: "12%" }}>Department Name</th>
                    <th style={{ width: "8%" }}>Address</th>
                    <th style={{ width: "10%" }}>Purpose of Dam</th>
                    <th style={{ width: "12%" }}>Latitude, Longitude</th>
                    <th style={{ width: "18%" }}>Image</th>
                    <th style={{ width: "10%" }}>Registered Date</th>
                    <th style={{ width: "10%" }}> Delete Project </th>
                    <th style={{ width: "10%" }}>Update Project</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, index) => (
                    <tr key={index}>
                      <td>{project.project_name}</td>
                      <td>{project.department_name}</td>
                      <td>{project.address}</td>
                      {/* <td>{project.purpose_of_dam.join(", ")}</td> */}
                      <td>
                        {project.purpose_of_dam.map((purpose, index) => (
                          <span key={index}>
                            {purpose}
                            {index !== project.purpose_of_dam.length - 1
                              ? ","
                              : ""}
                            <br />
                          </span>
                        ))}
                      </td>

                      <td>{`${project.latitude}, ${project.longitude}`}</td>
                      <td className="admin_image">
                        <img
                          src={`${import.meta.env.VITE_API_BACKEND_API_URL}/${
                            project.thumbnail_image
                          }`}
                          alt={project.project_name}
                        />
                      </td>






                      <td>
                        {new Date(
                          new Date(project.registration_time).setMonth(
                            new Date(project.registration_time).getMonth()
                          )
                        ).toDateString()}{" "}
                        <br />
                      </td>
                      <td>
                        {project.isAdmin !== "true" && (
                          <div className="user_delete_btn">
                            <button onClick={() => deleteProject(project._id)}>
                              <MdDelete style={{ fontSize: "18px" }} /> Delete
                              Project
                            </button>
                          </div>
                        )}
                        {project.isAdmin === "true" && (
                          <div className="user_delete_btn">Admin</div>
                        )}
                      </td>
                      <td>
                        <div className="user_update_btn">
                          <Link to={`/admin/project/${project._id}`}>
                            <button>
                              <RiExchangeBoxLine style={{ fontSize: "18px" }} />
                              Update Project
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;