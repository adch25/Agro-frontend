import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Login from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import Register from "./pages/RegisterPage";
import UserRoute from "./context/userRoute";
import AdminRoute from "./context/adminRoute";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import AboutDam from "./pages/ProjectDetailsUser/AboutDam";
import ReportIssue from "./pages/ProjectDetailsUser/ReportIssue";
import RespondIssue from "./pages/ProjectDetailsUser/RespondIssue";
import ArchiveOfIssue from "./pages/ProjectDetailsUser/ArchiveOfIssue";
import Statistics from "./pages/ProjectDetailsUser/Statistics";
import WaterLevel from "./pages/ProjectDetailsUser/WaterLevel";
import Discharge from "./pages/ProjectDetailsUser/Discharge";
import HydroMeteorologicalInstruments from "./pages/ProjectDetailsUser/HydroMeteorologicalInstruments";
import GeoTechnicalInstruments from "./pages/ProjectDetailsUser/GeoTechnicalInstruments";
import GeodeticInstruments from "./pages/ProjectDetailsUser/GeodeticInstruments";
import SeismicInstruments from "./pages/ProjectDetailsUser/SeismicInstruments";
import FloodMap from "./pages/ProjectDetailsUser/FloodMap";
import WeatherForecast from "./pages/ProjectDetailsUser/WeatherForecast";
import Reports from "./pages/ProjectDetailsUser/Reports";

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<UserRoute />}>
          <Route exact path="/" element={<Home />} />
        </Route>
        <Route path="/project/:projectid" element={<UserRoute />}>
          <Route index element={<AboutDam />} />
          <Route path="report-issue" element={<ReportIssue />} />
          <Route path="respond-issue" element={<RespondIssue />} />
          <Route path="archive-of-issue" element={<ArchiveOfIssue />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="water-level" element={<WaterLevel />} />
          <Route path="discharge" element={<Discharge />} />
          <Route
            path="hydro-meteorological-instruments"
            element={<HydroMeteorologicalInstruments />}
          />
          <Route path="geo-technical-instruments" element={<GeoTechnicalInstruments />} />
          <Route path="geodetic-instruments" element={<GeodeticInstruments />} />
          <Route path="seismic-instruments" element={<SeismicInstruments />} />
          <Route path="flood-map" element={<FloodMap />} />
          <Route path="weather-forecast" element={<WeatherForecast />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="/admin" element={<AdminRoute />}>
          <Route exact path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="/admin/create-project" element={<AdminRoute />}>
          <Route exact path="/admin/create-project" element={<Register />} />
        </Route>
        <Route path="/admin/project/:projectid" element={<AdminRoute />}>
          <Route exact path="/admin/project/:projectid" element={<ProjectDetailPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;