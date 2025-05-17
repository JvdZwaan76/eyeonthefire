async function fetchApiKeys() {
  console.log('Fetching API keys for Google Maps');
  const url = 'https://firemap-worker.jaspervdz.workers.dev/api-keys';
  console.log('Fetching API keys from:', url);
  try {
    const response = await fetch(url);
    const keys = await response.json();
    console.log('API keys received:', keys);
    return keys;
  } catch (error) {
    console.error('Error fetching API keys:', error.message);
    throw error;
  }
}

function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    console.log('Loading Google Maps script with key:', apiKey);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization,marker&callback=initMap&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
    console.log('Google Maps script appended');
  });
}

function initMap() {
  console.log('Initializing Google Map');
  const mapElement = document.getElementById('map');
  console.log('Map element:', mapElement);
  if (!mapElement) {
    console.error('Map element not found in DOM');
    return;
  }
  window.globalMap = new google.maps.Map(mapElement, {
    center: { lat: 37.0902, lng: -95.7129 },
    zoom: 4,
  });
  console.log('Global map created:', window.globalMap);
  console.log('Map created, hiding loading overlay');
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing map script');
  try {
    const keys = await fetchApiKeys();
    await loadGoogleMapsScript(keys.googleMaps);

    // Wait for initMap to complete and window.globalMap to be set
    const waitForMap = () => new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (window.globalMap) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error('Timed out waiting for map to initialize'));
      }, 10000);
    });

    await waitForMap();
    console.log('Map initialization complete, proceeding with FireDataService');
    const fireDataService = new FireDataService(window.globalMap);
    fireDataService.initialize();

    setupRangeDisplays();
    updateFooterYear();
  } catch (error) {
    console.error('Failed to initialize Google Maps:', error.message);
  }
});

function setupRangeDisplays() {
  console.log('Setting up range displays');
  // Placeholder for range display logic (assumed in the original)
}

function updateFooterYear() {
  console.log('Updating footer year');
  document.getElementById('year').textContent = new Date().getFullYear();
}
