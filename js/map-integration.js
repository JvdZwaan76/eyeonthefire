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
  console.log('Loading Google Maps script with key:', apiKey);
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization,marker&callback=initMap&loading=async`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
  console.log('Google Maps script appended');
}

function initMap() {
  // Placeholder for map initialization (assumed in the original)
  console.log('Initializing Google Map');
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 37.0902, lng: -95.7129 },
    zoom: 4,
  });
  const fireDataService = new FireDataService(map);
  fireDataService.initialize();
  console.log('Map created, hiding loading overlay');
}

function setupRangeDisplays() {
  console.log('Setting up range displays');
  // Placeholder for range display logic (assumed in the original)
}

function updateFooterYear() {
  console.log('Updating footer year');
  document.getElementById('year').textContent = new Date().getFullYear();
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing map script');
  try {
    const keys = await fetchApiKeys();
    loadGoogleMapsScript(keys.googleMaps);
    setupRangeDisplays();
    updateFooterYear();
  } catch (error) {
    console.error('Failed to initialize Google Maps:', error.message);
  }
});
