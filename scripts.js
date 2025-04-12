// API Keys
const FIRMS_API_KEY = 'd152217c8391eb5b0fbd242290527ae8';
const AIRNOW_API_KEY = '54044855-7B0C-4023-BEE4-8B3FCA172DED';
const OPENCAGE_API_KEY = 'a40b9e954e50458bbc09ca24e70201a1';

// Map variables
let map, fireLayer, airQualityLayer;
let showFires = true, showAirQuality = false;

// Lazy load map
if (document.getElementById('map-container')) {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !map) {
      initMap();
      loadFireData();
      observer.unobserve(document.getElementById('map-container'));
      setInterval(loadFireData, 900000); // Refresh every 15 minutes
    }
  });
  observer.observe(document.getElementById('map-container'));
}

// Initialize map
function initMap() {
  map = L.map('fire-map').setView([37.0902, -95.7129], 4); // U.S. center
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Data: FIRMS, NIFC, AirNow, NOAA'
  }).addTo(map);
  fireLayer = L.layerGroup().addTo(map);
  airQualityLayer = L.layerGroup();
}

// Load fire and air quality data
async function loadFireData(lat = 37.0902, lon = -95.7129) {
  fireLayer.clearLayers();
  airQualityLayer.clearLayers();

  try {
    const firmsUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_API_KEY}/VIIRS_SNPP_NRT/-125,25,-65,50/1`;
    const firmsResponse = await fetch(firmsUrl);
    const firmsText = await firmsResponse.text();
    const firmsLines = firmsText.split('\n').slice(1);
    firmsLines.forEach(line => {
      const [latitude, longitude, , , acqDate, acqTime] = line.split(',');
      if (latitude && longitude) {
        L.marker([parseFloat(latitude), parseFloat(longitude)])
          .addTo(fireLayer)
          .bindPopup(`FIRMS Hotspot<br>Detected: ${acqDate} ${acqTime}`);
      }
    });
  } catch (e) { console.error('FIRMS Error:', e); }

  try {
    const nifcUrl = 'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Current_WildlandFires/FeatureServer/0/query?where=1%3D1&outFields=IncidentName,Acres,PercentContained&returnGeometry=true&f=geojson';
    const nifcResponse = await fetch(nifcUrl);
    const nifcData = await nifcResponse.json();
    nifcData.features.forEach(feature => {
      const { coordinates } = feature.geometry;
      const { IncidentName, Acres, PercentContained } = feature.properties;
      if (coordinates && coordinates.length >= 2) {
        L.marker([coordinates[1], coordinates[0]])
          .addTo(fireLayer)
          .bindPopup(`<b>${IncidentName}</b><br>Acres: ${Acres}<br>Contained: ${PercentContained}%`);
      }
    });
  } catch (e) { console.error('NIFC Error:', e); }

  try {
    const airNowUrl = `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${lat}&longitude=${lon}&distance=100&API_KEY=${AIRNOW_API_KEY}`;
    const airNowResponse = await fetch(airNowUrl);
    const airNowData = await airNowResponse.json();
    airNowData.forEach(station => {
      const { Latitude, Longitude, AQI, ParameterName } = station;
      if (ParameterName === 'PM2.5' && Latitude && Longitude) {
        L.circleMarker([Latitude, Longitude], { radius: 10, color: aqiColor(AQI), fillOpacity: 0.5 })
          .addTo(airQualityLayer)
          .bindPopup(`PM2.5 AQI: ${AQI}`);
      }
    });
  } catch (e) { console.error('AirNow Error:', e); }
}

function aqiColor(aqi) {
  if (aqi <= 50) return '#00e400';
  if (aqi <= 100) return '#ffff00';
  if (aqi <= 150) return '#ff7e00';
  if (aqi <= 200) return '#ff0000';
  return '#8f3f97';
}

// Zip code lookup
async function checkFiresNow() {
  const zip = document.getElementById('zip-input').value.trim();
  const usZipRegex = /^\d{5}$/;
  const caZipRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  if (!usZipRegex.test(zip) && !caZipRegex.test(zip)) {
    alert('Please enter a valid USA (e.g., 90210) or Canadian (e.g., V6B 2W9) zip code.');
    return;
  }
  try {
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${zip}&key=${OPENCAGE_API_KEY}&countrycode=us,ca&limit=1`);
    const data = await response.json();
    if (data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      map.setView([lat, lng], 10);
      loadFireData(lat, lng);
    } else {
      alert('Zip code not found.');
    }
  } catch (e) {
    console.error('Geocoding Error:', e);
    alert('Error finding location.');
  }
}

// Map controls
function zoomToCA() { map.setView([36.7783, -119.4179], 6); }
function zoomToUS() { map.setView([37.0902, -95.7129], 4); }
function toggleFires() {
  showFires = !showFires;
  showFires ? fireLayer.addTo(map) : fireLayer.remove();
}
function toggleAirQuality() {
  showAirQuality = !showAirQuality;
  showAirQuality ? airQualityLayer.addTo(map) : airQualityLayer.remove();
}
function toggleFullscreen() {
  document.getElementById('map-container').classList.toggle('fullscreen');
  map.invalidateSize();
}

// Navbar toggle
function toggleMenu() {
  document.querySelector('.nav-menu').classList.toggle('active');
  document.querySelector('.hamburger').classList.toggle('active');
}

// Close zip code form
document.querySelector('.location-form .close-btn').addEventListener('click', () => {
  document.querySelector('.location-form-container').style.display = 'none';
});
