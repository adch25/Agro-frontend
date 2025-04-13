import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "./UserContext";

const UserRoute = () => {
  const { loginUser } = useUserContext();

  console.log("user", loginUser);

  return loginUser ? <Outlet /> : <Navigate to="/login" />;
};

export default UserRoute;
