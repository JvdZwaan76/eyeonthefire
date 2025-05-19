let map = null;

async function fetchApiKeys() {
  console.log('Fetching API keys for Google Maps');
  const url = 'https://firemap-worker.jaspervdz.workers.dev/api-keys';
  console.log('Fetching API keys from:', url);
  const response = await fetch(url);
  const keys = await response.json();
  console.log('API keys received:', keys);
  return keys;
}

async function loadGoogleMapsScript() {
  const { googleMaps: apiKey } = await fetchApiKeys();
  console.log('Loading Google Maps script with key:', apiKey);
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
  console.log('Google Maps script appended');
}

function initializeGoogleMap() {
  const mapOptions = {
    center: { lat: 39.8283, lng: -98.5795 },
    zoom: 4,
    mapTypeId: 'terrain',
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    ],
  };
  const mapElement = document.getElementById('map');
  map = new google.maps.Map(mapElement, mapOptions);
  console.log('Map created');
  return map;
}

function initializeFireDataService(map) {
  console.log('Initializing FireDataService with map');
  window.fireDataService = new FireDataService(map);
}

window.initMap = function () {
  console.log('initMap called');
  const map = initializeGoogleMap();
  const loadingOverlay = document.getElementById('loading-overlay');
  loadingOverlay.style.display = 'none';
  console.log('Map created, hiding loading overlay');
  initializeFireDataService(map);
};

async function initializeMap() {
  await loadGoogleMapsScript();
  const mapPromise = new Promise((resolve) => {
    const checkMap = () => {
      if (map) {
        resolve(map);
      } else {
        setTimeout(checkMap, 100);
      }
    };
    checkMap();
  });
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timed out waiting for map to initialize'));
    }, 10000);
  });
  try {
    await Promise.race([mapPromise, timeoutPromise]);
  } catch (error) {
    console.error('Failed to initialize Google Maps:', error);
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  console.log('DOM loaded, initializing map script');
  await initializeMap();
  setupRangeDisplays();
  updateFooterYear();
});

function setupRangeDisplays() {
  console.log('Setting up range displays');
  const confidenceRange = document.getElementById('confidence-range');
  const confidenceMin = document.getElementById('confidence-min');
  const frpRange = document.getElementById('frp-range');
  const frpMin = document.getElementById('frp-min');
  confidenceRange.addEventListener('input', () => {
    confidenceMin.textContent = `${confidenceRange.value}%`;
  });
  frpRange.addEventListener('input', () => {
    frpMin.textContent = frpRange.value;
  });
}

function updateFooterYear() {
  console.log('Updating footer year');
  const yearSpan = document.getElementById('year');
  yearSpan.textContent = new Date().getFullYear();
}
