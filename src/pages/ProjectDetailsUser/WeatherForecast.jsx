import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAlertContext } from "../../context/AlertContext";
import { useLoaderContext } from "../../context/LoaderContext";
import ReactApexChart from "react-apexcharts";
import { CiTempHigh } from "react-icons/ci";
import { IoTodayOutline } from "react-icons/io5";
import { MdOutlineDateRange } from "react-icons/md";
import { LuCloudRainWind } from "react-icons/lu";
import { WiHumidity } from "react-icons/wi";
import { GiWhirlwind } from "react-icons/gi";
import Sidebar from "./Sidebar";

const WeatherForecast = () => {
  const { projectid } = useParams();
  const [projectDetails, setProjectDetails] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [selectedChart, setSelectedChart] = useState("temperature");
  const [error, setError] = useState("");
  
  const { setAlertMessage, setShowAlert } = useAlertContext();
  const { setIsLoading } = useLoaderContext();
  const apiKey = "c627b59d5716584638eb911e11ab8709";

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BACKEND_API_URL}/project-details/${projectid}`
      );
      setProjectDetails(response.data.project);
    } catch (error) {
      setAlertMessage("Error fetching project details:", error);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectid]);

  const latitude = projectDetails?.latitude || 0;
  const longitude = projectDetails?.longitude || 0;

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const liveResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
        );
        if (!liveResponse.ok) throw new Error("Failed to fetch live weather data");
        const liveResult = await liveResponse.json();
        setLiveData(liveResult);

        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
        );
        if (!forecastResponse.ok) throw new Error("Failed to fetch forecast data");
        const forecastResult = await forecastResponse.json();

        const today = new Date().toLocaleDateString("en-GB");
        const dailySummary = {};
        forecastResult.list.forEach((item) => {
          const date = new Date(item.dt * 1000).toLocaleDateString("en-GB");
          if (date === today) return;
          if (!dailySummary[date]) {
            dailySummary[date] = {
              tempMin: item.main.temp,
              tempMax: item.main.temp,
              windSpeed: item.wind.speed,
              rainfall: item.rain ? item.rain["3h"] || 0 : 0,
            };
          } else {
            dailySummary[date].tempMin = Math.min(dailySummary[date].tempMin, item.main.temp);
            dailySummary[date].tempMax = Math.max(dailySummary[date].tempMax, item.main.temp);
            dailySummary[date].windSpeed = Math.max(dailySummary[date].windSpeed, item.wind.speed);
            dailySummary[date].rainfall += item.rain ? item.rain["3h"] || 0 : 0;
          }
        });

        const dailyArray = Object.entries(dailySummary)
          .map(([date, data]) => ({
            date,
            tempMin: Math.round(data.tempMin),
            tempMax: Math.round(data.tempMax),
            windSpeed: Math.round(data.windSpeed),
            rainfall: Math.round(data.rainfall),
          }))
          .sort((a, b) => new Date(a.date.split("/").reverse().join("-")) - new Date(b.date.split("/").reverse().join("-")))
          .slice(0, 5);

        setDailyData(dailyArray);
        setError("");
      } catch (err) {
        setError(err.message);
        setLiveData(null);
        setDailyData([]);
      }
    };

    if (latitude && longitude) {
      fetchWeatherData();
    }
  }, [latitude, longitude]);

  const getChartOptions = (type, yAxisTitle, yMin, yMax) => ({
    chart: { type, zoom: { enabled: false } },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: dailyData.map((day) => day.date),
    },
    yaxis: {
      title: { text: yAxisTitle },
      min: yMin,
      max: yMax,
      tickAmount: 5,
      labels: { formatter: (value) => Math.round(value) },
    },
    dataLabels: { enabled: false },
  });

  const tempMin = dailyData.length > 0 ? Math.min(...dailyData.map((d) => d.tempMin)) - 5 : 0;
  const tempMax = dailyData.length > 0 ? Math.max(...dailyData.map((d) => d.tempMax)) + 5 : 40;
  const rainfallMax = dailyData.length > 0 ? Math.max(...dailyData.map((d) => d.rainfall), 10) : 10;
  const windSpeedMax = dailyData.length > 0 ? Math.max(...dailyData.map((d) => d.windSpeed), 10) : 10;

  return (
    <div className="main_page_container">
      <div className="project_details_container">
        <Sidebar />
        <div className="tabs_container">
          <div id="weatherForecast" className="tab-content">
            <div className="page_section_heading">
              <h2>Current Weather</h2>
            </div>
            <div className="row">
              <div className="col-sm-4 mb-3">
                <div
                  className="card bg-light"
                  style={{
                    padding: "10px 20px",
                    height: "100px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <p>
                    <MdOutlineDateRange style={{ color: "#111", fontSize: "25px" }} />{" "}
                    Date: {new Date().toLocaleDateString("en-GB")}
                  </p>
                  <p>
                    <IoTodayOutline style={{ color: "#111", fontSize: "25px" }} />{" "}
                    Day: {new Date().toLocaleDateString("en-US", { weekday: "long" })}
                  </p>
                </div>
              </div>
              <div className="col-sm-4 mb-3">
                <div
                  className="card bg-light"
                  style={{
                    padding: "10px 20px",
                    height: "100px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {liveData && (
                    <>
                      <p>
                        <CiTempHigh style={{ color: "green", fontSize: "25px" }} />{" "}
                        Temperature: {liveData.main.temp} °C
                      </p>
                      <p>
                        <LuCloudRainWind style={{ color: "green", fontSize: "25px" }} />{" "}
                        Rainfall: {liveData.rain?.["1h"] ? `${liveData.rain["1h"]} mm` : "0 mm"}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="col-sm-4 mb-3">
                <div
                  className="card bg-light"
                  style={{
                    padding: "10px 20px",
                    height: "100px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {liveData && (
                    <>
                      <p>
                        <WiHumidity style={{ color: "skyblue", fontSize: "25px" }} />{" "}
                        Humidity: {liveData.main.humidity}%
                      </p>
                      <p>
                        <GiWhirlwind style={{ color: "skyblue", fontSize: "25px" }} />{" "}
                        Wind Speed: {liveData.wind.speed} m/s
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="page_section_heading">
              <h2>Weather Forecast</h2>
            </div>
            {error && <h3 style={{ color: "red" }}>{error}</h3>}
            <div className="chart-tabs">
              {["temperature", "rainfall", "windSpeed"].map((chart) => (
                <button
                  key={chart}
                  onClick={() => setSelectedChart(chart)}
                  className={`btn btn-success ${selectedChart === chart ? "active" : ""}`}
                  style={{
                    margin: "0px 5px",
                    backgroundColor: selectedChart === chart ? "green" : "#fff",
                    borderColor: selectedChart === chart ? "green" : "black",
                    color: selectedChart === chart ? "white" : "black",
                    transform: selectedChart === chart ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  {chart.charAt(0).toUpperCase() + chart.slice(1)}
                </button>
              ))}
            </div>
            {dailyData.length > 0 ? (
              <div className="row">
                {selectedChart === "temperature" && (
                  <div className="col-sm-12 mb-3">
                    <ReactApexChart
                      options={getChartOptions("line", "Temperature (°C)", tempMin, tempMax)}
                      series={[
                        { name: "Max Temp (°C)", data: dailyData.map((day) => day.tempMax), color: "#FF4444" },
                        { name: "Min Temp (°C)", data: dailyData.map((day) => day.tempMin), color: "#FFA500" },
                      ]}
                      type="line"
                      height={350}
                    />
                  </div>
                )}
                {selectedChart === "rainfall" && (
                  <div className="col-sm-12 mb-3">
                    <ReactApexChart
                      options={getChartOptions("line", "Rainfall (mm)", 0, rainfallMax)}
                      series={[
                        { name: "Rainfall (mm)", data: dailyData.map((day) => day.rainfall), color: "#1E90FF" },
                      ]}
                      type="line"
                      height={350}
                    />
                  </div>
                )}
                {selectedChart === "windSpeed" && (
                  <div className="col-sm-12 mb-3">
                    <ReactApexChart
                      options={getChartOptions("bar", "Wind Speed (m/s)", 0, windSpeedMax)}
                      series={[
                        { name: "Wind Speed (m/s)", data: dailyData.map((day) => day.windSpeed) },
                      ]}
                      type="bar"
                      height={350}
                    />
                  </div>
                )}
              </div>
            ) : (
              !error && <h3>Loading 5-day forecast data...</h3>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;