import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { RiLockPasswordFill } from "react-icons/ri";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineMail } from "react-icons/ai";
import { useAlertContext } from "../context/AlertContext";
import { useUserContext } from "../context/UserContext";
import { useLoaderContext } from "../context/LoaderContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAlertMessage, setShowAlert } = useAlertContext(); 
  const { setIsLoading } = useLoaderContext();
  const [showPassword, setShowPassword] = useState(false);
  const { setLoginUser, loginUser } = useUserContext();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (loginUser) {
      navigate("/");
    }else{
      
    }
  }, [loginUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const login = () => {
    if (user.email === "" || user.password === "") {
      setAlertMessage("Please fill all fields");
      setShowAlert(true);

      return;
    }
    setIsLoading(true);

    axios
      .post(`${import.meta.env.VITE_API_BACKEND_API_URL}/login`, user)
      .then((res) => {
        setAlertMessage(res.data.message);
        setShowAlert(true);

        if (res.status === 200) {
          setLoginUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          console.log(res.data.user);
          if (res.data.user.isAdmin === true) {
            navigate("/admin");
          } else {
            navigate("/");
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.message) {
          setAlertMessage(err.response.data.message);
          setShowAlert(true);
          setIsLoading(false);
        } else {
          setAlertMessage("An error occurred. Please try again.");
          setShowAlert(true);
          setIsLoading(false);
        }
      });
  };

  return (
    <>
      <div className="main_page_container">
        <div className="auth_container">
          <div className="auth_form_box">
            <div className="auth_profile">
              <CgProfile />
            </div>
            <h3>LOGIN</h3>

            <div className="auth_item">
              <div className="auth_item_icon">
                <AiOutlineMail />
              </div>

              <input
                type="text"
                name="email"
                required
                placeholder="Your Email"
                value={user.email}
                onChange={handleChange}
              />
            </div>
            <div className="auth_item">
              <div className="auth_item_icon">
                <RiLockPasswordFill />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Your Password"
                name="password"
                value={user.password}
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

            <div className="auth_button">
              <button onClick={login}> LOGIN </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
