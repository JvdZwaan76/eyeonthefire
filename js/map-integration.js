let map = null;
window.globalMap = null;

async function fetchApiKeys() {
  console.log('Fetching API keys for Google Maps');
  const url = 'https://firemap-worker.jaspervdz.workers.dev/api-keys';
  console.log('Fetching API keys from:', url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch API keys: ${response.status} - ${response.statusText}`);
    }
    const keys = await response.json();
    console.log('API keys received:', keys);
    return keys;
  } catch (error) {
    console.error('Error fetching API keys:', error.message);
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
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
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
  if (typeof google === 'undefined' || !google.maps) {
    console.error('Google Maps API not available');
    return null;
  }
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
  try {
    map = new google.maps.Map(mapElement, mapOptions);
    window.globalMap = map; // Set global map immediately
    console.log('Map created successfully');
    return map;
  } catch (error) {
    console.error('Failed to create map:', error.message);
    return null;
  }
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
  window.mapInitialized = true; // Set flag after map and FireDataService are initialized
};

async function initializeMap() {
  try {
    await loadGoogleMapsScript();
    // Wait for map to be initialized
    await new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds
      const checkMap = () => {
        attempts++;
        if (window.mapInitialized || window.globalMap) {
          console.log('Map initialization confirmed');
          resolve(window.globalMap);
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
    console.error('Failed to initialize Google Maps:', error.message);
    // Fallback: try to initialize map anyway
    if (typeof google !== 'undefined' && google.maps) {
      const mapInstance = initializeGoogleMap();
      if (mapInstance) {
        initializeFireDataService(mapInstance);
      }
    }
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
