import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { handleLogout, loginUser } = useUserContext();
  const [dams, setDams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  console.log(dams);

  useEffect(() => {
    const fetchDams = async () => {
      try {
        if (!loginUser || !loginUser.email) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }
        const response = await axios.get(
          `${import.meta.env.VITE_API_BACKEND_API_URL}/dams-for-user`,
          {
            params: { userEmail: loginUser.email },
          }
        );
        setDams(response.data.dams);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch dams.");
        setLoading(false);
        console.error("Error fetching dams:", err);
      }
    };

    fetchDams();
  }, [loginUser]);

  useEffect(() => {
    if (loginUser && loginUser.isAdmin == true) {
      navigate("/admin");
    }
  }, [loginUser]);

  if (loading) {
    return <div>Loading dams...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!dams || dams.length === 0) {
    return <div>No dams assigned to you.</div>;
  }

  return (
    <div className="main_page_container">
      <div className="admin_container">
        <div className="page_section_heading">
          <h2>Welcome, {loginUser.name}!</h2>
        </div>

        <ul className="home_cards">
          {dams.map((dam) => (
            <li key={dam._id}>
              <Link to={`/project/${dam._id}`}>
                <div className="home_card">
                  <div className="home_image">
                    <img
                      src={`${import.meta.env.VITE_API_BACKEND_API_URL}/${
                        dam.thumbnail_image
                      }`}
                    />
                  </div>
                  <div className="project_name">{dam.project_name}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {loginUser ? (
          <button className="btn_general" onClick={handleLogout}>
            <FiLogOut />
            Logout
          </button>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}
      </div>
    </div>
  );
};
export default HomePage;