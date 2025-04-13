import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "./UserContext";

const AdminRoute = () => {
  const { loginUser } = useUserContext();
  return loginUser && loginUser.isAdmin === true ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
};

export default AdminRoute;