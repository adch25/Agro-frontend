import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  AiOutlineUser,
  AiOutlineEyeInvisible,
  AiOutlineEye,
  AiOutlineMail,
} from "react-icons/ai";
import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
import { RiLockPasswordFill, RiAdminLine } from "react-icons/ri";
import { FaPhone } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useAlertContext } from "../context/AlertContext";
import { useLoaderContext } from "../context/LoaderContext";
import { BsPersonStanding } from "react-icons/bs";

const Register = () => {
  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { setIsLoading } = useLoaderContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [projectDetail, setProjectDetail] = useState({
    project_name: "",
    department_name: "",
    address: "",
    purpose_of_dam: [],
    dam_height: { value: "", unit: "Meter" },
    hfl: { value: "", unit: "Meter" },
    mrl: { value: "", unit: "Meter" },
    reservoir_area: { value: "", unit: "M²" },
    reservoir_volume: { value: "", unit: "M³" },
    hydropower_capacity: { value: "", unit: "MW" },
    project_description: "",
    latitude: "",
    longitude: "",
    password: "",
    reEnterPassword: "",
  });

  const [users, setUsers] = useState(
    Array.from({ length: 1 }, () => ({
      name: "",
      email: "",
      mobile: "",
      position: "",
      isProjectAdmin: false,
    }))
  );

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const addUser = () => {
    setUsers((prevUsers) => [
      ...prevUsers,
      { name: "", email: "", mobile: "",  position: "", isProjectAdmin: false },
    ]);
  };

  const removeUser = () => {
    if (users.length > 1) {
      setUsers((prevUsers) => prevUsers.slice(0, -1));
    }
  };

  const handleUserChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const [property, userIndex] = name.split("_").slice(1);
    setUsers((prevUsers) =>
      prevUsers.map((user, i) =>
        i === parseInt(userIndex) - 1
          ? { ...user, [property]: type === "checkbox" ? checked : value }
          : user
      )
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "purpose_of_dam") {
      setProjectDetail((prev) => {
        const purposes = [...prev.purpose_of_dam];
        if (checked) {
          purposes.push(value);
        } else {
          const index = purposes.indexOf(value);
          if (index > -1) {
            purposes.splice(index, 1);
          }
        }
        return { ...prev, purpose_of_dam: purposes };
      });
    } else if (name.includes("_unit")) {
      const baseName = name.replace("_unit", "");
      setProjectDetail((prev) => ({
        ...prev,
        [baseName]: { ...prev[baseName], unit: value },
      }));
    } else if (
      [
        "dam_height",
        "hfl",
        "mrl",
        "reservoir_area",
        "reservoir_volume",
        "hydropower_capacity",
      ].includes(name)
    ) {
      setProjectDetail((prev) => ({
        ...prev,
        [name]: { ...prev[name], value },
      }));
    } else {
      setProjectDetail((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegister = () => {
    const validUsers = users.every((user) => user.name && user.email);
    const {
      project_name,
      department_name,
      address,
      purpose_of_dam,
      dam_height,
      hfl,
      mrl,
      reservoir_area,
      reservoir_volume,
      hydropower_capacity,
      project_description,
      latitude,
      longitude,
      password,
      reEnterPassword,
    } = projectDetail;
    if (
      project_name &&
      department_name &&
      address &&
      // purpose_of_dam &&
      purpose_of_dam.length > 0 &&
      dam_height &&
      hfl &&
      mrl &&
      reservoir_area &&
      reservoir_volume &&
      hydropower_capacity &&
      project_description &&
      latitude &&
      longitude &&
      password &&
      reEnterPassword
    ) {
      if (!validUsers) {
        setAlertMessage("Invalid input for one or more users");
        setShowAlert(true);
        return;
      }
      if (password !== reEnterPassword) {
        setAlertMessage("Password do not match");
        setShowAlert(true);
        return;
      }

      // if (password.length < 6) {
      //   setAlertMessage("Password must be at least 6 characters long");
      //   setShowAlert(true);
      //   return;
      // }
      setIsLoading(true);

      axios
        .post(`${import.meta.env.VITE_API_BACKEND_API_URL}/register`, {
          users: users,
          project_name: project_name,
          department_name: department_name,
          address: address,
          purpose_of_dam: purpose_of_dam,
          dam_height: dam_height,
          hfl: hfl,
          mrl: mrl,
          reservoir_area: reservoir_area,
          reservoir_volume: reservoir_volume,
          hydropower_capacity: hydropower_capacity,
          project_description: project_description,
          latitude: latitude,
          longitude: longitude,
          password: password,
        })
        .then((res) => {
          setAlertMessage(res.data.message);
          setShowAlert(true);
          navigate("/admin");
          setIsLoading(false);
        })
        .catch((err) => {
          setAlertMessage(err.response.data.message);
          setShowAlert(true);
          setIsLoading(false);
        });
    } else {
      setAlertMessage("Fill all the fields");
      setShowAlert(true);
    }
  };

  return (
    <>
      <div className="main_page_container">
        <div className="register_page">
          <div className="page_section_heading">
            <h2>CREATE PROJECT</h2>
          </div>

          <Link to="/admin">
            <button className="btn_general">
              <IoMdArrowRoundBack /> Back
            </button>{" "}
          </Link>

          <div className="row">
            <div className="col-md-6">
              <div className="auth_item">
                <input
                  type="text"
                  name="project_name"
                  required
                  placeholder="Dam Name"
                  value={projectDetail.project_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="auth_item">
                <input
                  type="text"
                  name="department_name"
                  required
                  placeholder="Department Name"
                  value={projectDetail.department_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="auth_item">
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Address"
                  value={projectDetail.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="position-relative">
                <div className="accordion" id="purposeAccordion">
                  <div className="accordion-item" style={{ marginTop: "11px" }}>
                    {/* Accordion Header */}
                    <h2 className="accordion-header">
                      <button
                        style={{ margin: "2px 0px" }}
                        className={`accordion-button map_layer_collapse ${
                          !isOpen ? "collapsed" : ""
                        }`}
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                      >
                        Purpose of Dam
                      </button>
                    </h2>

                    <div
                      className={`accordion-collapse collapse ${
                        isOpen ? "show" : ""
                      }`}
                      id="collapsePurpose"
                    >
                      <div className="accordion-body position-absolute top-100 left-0 w-100 bg-white shadow border rounded p-3">
                        {[
                          "Irrigation",
                          "Hydroelectric Power",
                          "Water Supply",
                          "Flood Control",
                          "Other",
                        ].map((purpose) => (
                          <div key={purpose} className="form-check">
                            <input
                              type="checkbox"
                              name="purpose_of_dam"
                              value={purpose}
                              checked={projectDetail.purpose_of_dam.includes(
                                purpose
                              )}
                              onChange={handleChange}
                              className="form-check-input"
                              id={purpose}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={purpose}
                            >
                              {purpose}
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
              <div className="auth_item">
                <input
                  type="number"
                  name="dam_height"
                  required
                  placeholder="Dam Height"
                  value={projectDetail.dam_height.value}
                  onChange={handleChange}
                />
                <select
                  name="dam_height_unit"
                  value={projectDetail.dam_height.unit}
                  onChange={handleChange}
                  style={{
                    marginLeft: "10px",
                    padding: "5px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="Meter">M</option>
                  <option value="Centimeter">CM</option>
                  <option value="Feet">F</option>
                </select>
              </div>
            </div>

            <div className="col-md-4">
              <div className="auth_item">
                <input
                  type="number"
                  name="hfl"
                  required
                  placeholder="HFL (High Flood Level)"
                  value={projectDetail.hfl.value}
                  onChange={handleChange}
                />
                <select
                  name="hfl_unit"
                  value={projectDetail.hfl.unit}
                  onChange={handleChange}
                  style={{
                    marginLeft: "10px",
                    padding: "5px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="Meter">M</option>
                  <option value="Centimeter">CM</option>
                  <option value="Feet">F</option>
                </select>
              </div>
            </div>

            <div className="col-md-4">
              <div className="auth_item">
                <input
                  type="number"
                  name="mrl"
                  required
                  placeholder="MRL (Maximum Reservoir Level)"
                  value={projectDetail.mrl.value}
                  onChange={handleChange}
                />
                <select
                  name="mrl_unit"
                  value={projectDetail.mrl.unit}
                  onChange={handleChange}
                  style={{
                    marginLeft: "10px",
                    padding: "5px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="Meter">M</option>
                  <option value="Centimeter">CM</option>
                  <option value="Feet">F</option>
                </select>
              </div>
            </div>

            <div className="col-md-4">
              <div className="auth_item">
                <input
                  type="number"
                  name="reservoir_area"
                  required
                  placeholder="Reservoir Area"
                  value={projectDetail.reservoir_area.value}
                  onChange={handleChange}
                />
                <select
                  name="reservoir_area_unit"
                  value={projectDetail.reservoir_area.unit}
                  onChange={handleChange}
                  style={{
                    marginLeft: "10px",
                    padding: "5px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="Meter Square">M²</option>
                  <option value="Kilometer Square">KM²</option>
                  <option value="BSM">BSM</option>
                </select>
              </div>
            </div>

            <div className="col-md-4">
              <div className="auth_item">
                <input
                  type="number"
                  name="reservoir_volume"
                  required
                  placeholder="Reservoir volume"
                  value={projectDetail.reservoir_volume.value}
                  onChange={handleChange}
                />
                <select
                  name="reservoir_volume_unit"
                  value={projectDetail.reservoir_volume.unit}
                  onChange={handleChange}
                  style={{
                    marginLeft: "10px",
                    padding: "5px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="Meter Cube">M³</option>
                  <option value="Kilometer Cube">KM³</option>
                  <option value="BCM">BCM</option>
                </select>
              </div>
            </div>

            <div className="col-md-4">
              <div className="auth_item">
                <input
                  type="number"
                  name="hydropower_capacity"
                  required
                  placeholder="Hydropower Capacity"
                  value={projectDetail.hydropower_capacity.value}
                  onChange={handleChange}
                />
                <select
                  name="hydropower_capacity_unit"
                  value={projectDetail.hydropower_capacity.unit}
                  onChange={handleChange}
                  style={{
                    marginLeft: "10px",
                    padding: "5px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="MW">MW</option>
                  <option value="GW">GW</option>
                </select>
              </div>
            </div>

            <div className="col-md-12">
              <div className="auth_item">
                <textarea
                  name="project_description"
                  required
                  placeholder="Description"
                  rows="3"
                  value={projectDetail.project_description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <div className="col-md-6">
              <div className="auth_item">
                <input
                  type="number"
                  name="latitude"
                  required
                  placeholder="Latitude"
                  value={projectDetail.latitude}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="auth_item">
                <input
                  type="number"
                  name="longitude"
                  required
                  placeholder="Longitude"
                  value={projectDetail.longitude}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="auth_item">
                <div className="auth_item_icon">
                  <RiLockPasswordFill />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="Password"
                  value={projectDetail.password}
                  onChange={handleChange}
                />
                <div className="auth_item_icon">
                  {showPassword ? (
                    <button onClick={toggleShowPassword}>
                      <AiOutlineEyeInvisible />
                    </button>
                  ) : (
                    <button onClick={toggleShowPassword}>
                      <AiOutlineEye />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="auth_item">
                <div className="auth_item_icon">
                  <RiLockPasswordFill />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  name="reEnterPassword"
                  placeholder="Confirm Password"
                  value={projectDetail.reEnterPassword}
                  onChange={handleChange}
                />
                <div className="auth_item_icon">
                  {showPassword ? (
                    <button onClick={toggleShowPassword}>
                      <AiOutlineEyeInvisible />
                    </button>
                  ) : (
                    <button onClick={toggleShowPassword}>
                      <AiOutlineEye />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {users.map((user, index) => (
            <div className="row" key={index}>
              <div className="col-md-3 ">
                <div className="auth_item">
                  <div className="auth_item_icon">
                    <AiOutlineUser />
                  </div>
                  <input
                    type="text"
                    name={`user_name_${index + 1}`}
                    required
                    placeholder={`User ${index + 1} Name`}
                    value={user.name}
                    onChange={(e) => handleUserChange(e, index)}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="auth_item">
                  <div className="auth_item_icon">
                    <AiOutlineMail />
                  </div>
                  <input
                    type="email"
                    name={`user_email_${index + 1}`}
                    required
                    placeholder={`User ${index + 1} Email`}
                    value={user.email}
                    onChange={(e) => handleUserChange(e, index)}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="auth_item">
                  <div className="auth_item_icon">
                    <FaPhone />
                  </div>
                  <input
                    type="number"
                    name={`user_mobile_${index + 1}`}
                    placeholder={`User ${index + 1} Mobile Number`}
                    value={user.mobile}
                    onChange={(e) => handleUserChange(e, index)}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="auth_item">
                  <div className="auth_item_icon">
                    <BsPersonStanding />
                  </div>
                  <input
                    type="text"
                    name={`user_position_${index + 1}`}
                    placeholder={`User ${index + 1} Position`}
                    value={user.position}
                    onChange={(e) => handleUserChange(e, index)}
                  />
                </div>
              </div>

            {/* <div className="col-md-3">
                <div className="auth_item">
                  <div className="auth_item_icon">
                    <RiAdminLine />
                  </div>
                  <label
                   
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "16px",
                    }}
                  >
                    <input
                      type="checkbox"
                      name={`user_isProjectAdmin_${index + 1}`}
                      checked={user.isProjectAdmin}
                      onChange={(e) => handleUserChange(e, index)}
                      style={{
                        width: "15px",
                        height: "15px",
                        margin: "0px 10px",
                      }}
                    />
                    <span style={{ whiteSpace: "nowrap" }}>Project Admin</span>
                  </label>
                </div>
              </div>  */}
            </div>
          ))}
          <button className="add_user_btn" onClick={addUser}>
            <CiCirclePlus />
          </button>
          {users.length > 1 && (
            <button className="add_user_btn" onClick={removeUser}>
              <CiCircleMinus />
            </button>
          )}

          <div className="auth_button">
            <button onClick={handleRegister}> CREATE PROJECT</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
