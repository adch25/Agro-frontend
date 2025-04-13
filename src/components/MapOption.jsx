export const mapOptions = [
  {
    name: "Esri Satellite Map",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    subdomains: ["a", "b", "c"],
    attribution: "Tiles &copy; Esri &mdash; Source: US National Park Service",
  },
  {
    name: "Street Map",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    subdomains: ["a", "b", "c"],
    attribution: "Basemap: Esri, TomTom, FAO, NOAA, USGS",
  },

  {
    name: "Open Street Map",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: ["a", "b", "c"],
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  
]