// API Keys
const FIRMS_API_KEY = 'd152217c8391eb5b0fbd242290527ae8';
const OPENCAGE_API_KEY = 'a40b9e954e50458bbc09ca24e70201a1';

// Map variables
let map, fireLayer;
let showFires = true;

// Lazy load map on pages with map-container
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

// Initialize map with a view of North America
function initMap() {
  map = L.map('fire-map').setView([54, -105], 3); // Center on North America, zoom level 3
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Data: FIRMS'
  }).addTo(map);
  fireLayer = L.layerGroup().addTo(map);
  console.log('Map initialized');
}

// Load all active fire data for North America
async function loadFireData() {
  console.log('Loading fire data...');
  fireLayer.clearLayers();

  try {
    // Fetch FIRMS data for North America (-168,7,-52,85) for the last 24 hours
    const firmsUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_API_KEY}/VIIRS_SNPP_NRT/-168,7,-52,85/1`;
    const firmsResponse = await fetch(firmsUrl);
    if (!firmsResponse.ok) throw new Error(`FIRMS API failed: ${firmsResponse.status}`);
    const firmsText = await firmsResponse.text();
    const firmsLines = firmsText.split('\n').slice(1); // Skip header
    console.log('FIRMS lines:', firmsLines.length);
    let markerCount = 0;
    firmsLines.forEach(line => {
      const [latitude, longitude, , , acqDate, acqTime] = line.split(',');
      if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
        L.marker([parseFloat(latitude), parseFloat(longitude)], {
          icon: L.icon({ iconUrl: '/images/fire-icon.png', iconSize: [25, 25] })
        })
          .addTo(fireLayer)
          .bindPopup(`FIRMS Hotspot<br>Detected: ${acqDate} ${acqTime}`);
        markerCount++;
      }
    });
    console.log('FIRMS markers added:', markerCount);
    if (markerCount > 0) map.fitBounds(fireLayer.getBounds());
  } catch (e) {
    console.error('FIRMS Error:', e);
  }
}

// Zip code lookup
async function checkFiresNow() {
  const zip = document.getElementById('zip-input').value.trim();
  const usZipRegex = /^\d{5}$/;
  const caZipRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  if (!usZipRegex.test(zip) && !caZipRegex.test(zip)) {
    alert('Please enter a valid USA or Canadian zip code.');
    return;
  }
  if (typeof map !== 'undefined' && map) {
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
  } else {
    localStorage.setItem('zipCode', zip);
    window.location.href = 'index.html#map-section';
  }
}

// Map controls
function zoomToCA() { map.setView([36.7783, -119.4179], 6); }
function zoomToUS() { map.setView([37.0902, -95.7129], 4); }
function toggleFires() {
  showFires = !showFires;
  showFires ? fireLayer.addTo(map) : fireLayer.remove();
}
function toggleFullscreen() {
  document.getElementById('map-container').classList.toggle('fullscreen');
  map.invalidateSize();
}

// Navbar toggle
document.querySelector('.hamburger').addEventListener('click', () => {
  document.querySelector('.nav-menu').classList.toggle('active');
  document.querySelector('.hamburger').classList.toggle('active');
});

// Close zip code form
document.querySelector('.location-form .close-btn').addEventListener('click', () => {
  document.querySelector('.location-form-container').style.display = 'none';
});
