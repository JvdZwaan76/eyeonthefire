let map = null;
window.globalMap = null;

async function fetchApiKeys() {
  console.log('Fetching API keys for Google Maps');
  const url = 'https://firemap-worker.jaspervdz.workers.dev/api-keys';
  console.log('Fetching API keys from:', url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch API keys: ${response.status}`);
    }
    const keys = await response.json();
    console.log('API keys received:', keys);
    return keys;
  } catch (error) {
    console.error('Error fetching API keys:', error);
    throw error;
  }
}

async function loadGoogleMapsScript() {
  const { googleMaps: apiKey } = await fetchApiKeys();
  console.log('Loading Google Maps script with key:', apiKey);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization&callback=initMap&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
      reject(new Error('Failed to load Google Maps script'));
    };
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      resolve();
    };
    document.head.appendChild(script);
    console.log('Google Maps script appended');
  });
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
  if (!mapElement) {
    console.error('Map element not found');
    return null;
  }
  map = new google.maps.Map(mapElement, mapOptions);
  window.globalMap = map;
  console.log('Map created successfully');
  return map;
}

function initializeFireDataService(mapInstance) {
  console.log('Initializing FireDataService with map');
  if (!mapInstance) {
    console.error('Map instance is undefined, cannot initialize FireDataService');
    return;
  }
  window.fireDataService = new FireDataService(mapInstance);
}

window.initMap = function () {
  console.log('initMap called');
  const mapInstance = initializeGoogleMap();
  if (!mapInstance) {
    console.error('Failed to initialize map instance');
    return;
  }
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
  console.log('Map created, hiding loading overlay');
  initializeFireDataService(mapInstance);
  // Ensure map is set globally for other scripts
  window.mapInitialized = true;
};

async function initializeMap() {
  try {
    await loadGoogleMapsScript();
    // Wait for map to be initialized
    await new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds with 100ms intervals
      const checkMap = () => {
        attempts++;
        if (window.mapInitialized || map || window.globalMap) {
          console.log('Map initialization confirmed');
          resolve(map || window.globalMap);
        } else if (attempts >= maxAttempts) {
          console.error('Timed out waiting for map to initialize after', maxAttempts, 'attempts');
          reject(new Error('Timed out waiting for map to initialize'));
        } else {
          setTimeout(checkMap, 100);
        }
      };
      checkMap();
    });
  } catch (error) {
    console.error('Failed to initialize Google Maps:', error);
    throw error;
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
  if (confidenceRange && confidenceMin) {
    confidenceRange.addEventListener('input', () => {
      confidenceMin.textContent = `${confidenceRange.value}%`;
    });
  }
  if (frpRange && frpMin) {
    frpRange.addEventListener('input', () => {
      frpMin.textContent = frpRange.value;
    });
  }
}

function updateFooterYear() {
  console.log('Updating footer year');
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}
