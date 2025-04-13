import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();
export const UserProvider = ({ children }) => {
  const navigate = useNavigate();

  const [loginUser, setLoginUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      return parsedUser;
    } else {
      return null;
    }
  });

  const handleLogout = () => {
    setLoginUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setLoginUser(parsedUser);
    } else {
      setLoginUser(null);
    }
  }, []);

  return (
    <UserContext.Provider value={{ loginUser, setLoginUser, handleLogout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};
