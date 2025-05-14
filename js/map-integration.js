/**
 * Map Integration Script
 * Connects Google Maps with FireDataService, fetching API keys from Cloudflare Worker
 */

const fireService = new FireDataService();
const WORKER_URL = 'https://firemap-worker.jaspervdz.workers.dev';

async function fetchApiKeys() {
  try {
    const response = await fetch(`${WORKER_URL}/api-keys`);
    if (!response.ok) throw new Error('Failed to fetch API keys');
    return await response.json();
  } catch (error) {
    console.error('Error fetching API keys:', error);
    document.getElementById('loading-message').textContent = 'Failed to load API keys. Please refresh and try again.';
    throw error;
  }
}

async function loadGoogleMapsScript() {
  if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
    return;
  }
  try {
    const { googleMaps } = await fetchApiKeys();
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMaps}&libraries=visualization&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      document.getElementById('loading-message').textContent = 'Failed to load Google Maps. Please refresh and try again.';
    };
    document.head.appendChild(script);
  } catch (error) {
    console.error('Failed to initialize Google Maps:', error);
  }
}

window.initMap = function () {
  console.log('Google Maps API loaded, initializing map...');
  const map = new google.maps.Map(document.getElementById('map'), {
    center: fireMapConfig.mapDefaults.center,
    zoom: fireMapConfig.mapDefaults.zoom,
    maxZoom: fireMapConfig.mapDefaults.maxZoom,
    minZoom: fireMapConfig.mapDefaults.minZoom,
    mapTypeId: 'terrain',
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl: false,
  });
  fireService.initialize(map);
  document.getElementById('loading-overlay').style.display = 'none';
  setupUIControls(map, fireService);
};

function setupUIControls(map, service) {
  document.getElementById('zoom-in').addEventListener('click', () => {
    map.setZoom(map.getZoom() + 1);
  });
  document.getElementById('zoom-out').addEventListener('click', () => {
    map.setZoom(map.getZoom() - 1);
  });
  document.getElementById('recenter').addEventListener('click', () => {
    if (navigator.geolocation) {
      service.showStatusMessage('Getting your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(userLocation);
          map.setZoom(10);
          new google.maps.Marker({
            position: userLocation,
            map: map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#4285F4',
              fillOpacity: 0.7,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 8,
            },
            title: 'Your Location',
          });
          service.showStatusMessage('Map centered on your location', 'success');
        },
        (error) => {
          service.showStatusMessage('Could not get your location: ' + error.message, 'error');
        },
      );
    } else {
      service.showStatusMessage('Geolocation is not supported by your browser', 'error');
    }
  });
  document.getElementById('show-stats').addEventListener('click', () => {
    service.showStatistics();
  });
  document.getElementById('close-stats').addEventListener('click', () => {
    document.getElementById('stats-panel').style.display = 'none';
  });
  document.querySelectorAll('.region-button').forEach((button) => {
    button.addEventListener('click', function () {
      document.querySelectorAll('.region-button').forEach((btn) => btn.classList.remove('active'));
      this.classList.add('active');
      const bounds = this.getAttribute('data-bounds');
      if (bounds) {
        const [west, south, east, north] = bounds.split(',').map(Number);
        map.fitBounds(
          new google.maps.LatLngBounds(
            new google.maps.LatLng(south, west),
            new google.maps.LatLng(north, east),
          ),
        );
      }
    });
  });
  document.getElementById('apply-filters').addEventListener('click', () => {
    service.applyFilterSettings();
  });
  document.getElementById('reset-filters').addEventListener('click', () => {
    service.resetFilters();
  });
  document.getElementById('usa-mode').addEventListener('click', () => {
    this.classList.remove('btn-outline-primary');
    this.classList.add('btn-primary');
    document.getElementById('global-mode').classList.remove('btn-primary');
    document.getElementById('global-mode').classList.add('btn-outline-primary');
    map.fitBounds(
      new google.maps.LatLngBounds(
        new google.maps.LatLng(fireMapConfig.usaBounds.south, fireMapConfig.usaBounds.west),
        new google.maps.LatLng(fireMapConfig.usaBounds.north, fireMapConfig.usaBounds.east),
      ),
    );
    service.fetchUSAFireData();
  });
  document.getElementById('global-mode').addEventListener('click', () => {
    this.classList.remove('btn-outline-primary');
    this.classList.add('btn-primary');
    document.getElementById('usa-mode').classList.remove('btn-primary');
    document.getElementById('usa-mode').classList.add('btn-outline-primary');
    map.setCenter({ lat: 0, lng: 0 });
    map.setZoom(2);
    service.fetchDataForViewport();
  });
  setupSidebar();
  setupRangeDisplays();
  updateFooterYear();
}

function setupSidebar() {
  const toggleBtn = document.getElementById('toggle-sidebar');
  const sidebar = document.getElementById('sidebar');
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggleBtn.classList.toggle('collapsed');
    const statusPanel = document.getElementById('status-panel');
    if (statusPanel) statusPanel.classList.toggle('sidebar-collapsed');
    const viewModeToggle = document.getElementById('view-mode-toggle');
    if (viewModeToggle) viewModeToggle.classList.toggle('sidebar-collapsed');
    const icon = toggleBtn.querySelector('i');
    if (sidebar.classList.contains('collapsed')) {
      icon.classList.remove('fa-chevron-left');
      icon.classList.add('fa-chevron-right');
    } else {
      icon.classList.remove('fa-chevron-right');
      icon.classList.add('fa-chevron-left');
    }
  });
  if (window.innerWidth < 768) {
    sidebar.classList.add('collapsed');
    toggleBtn.classList.add('collapsed');
    const icon = toggleBtn.querySelector('i');
    icon.classList.remove('fa-chevron-left');
    icon.classList.add('fa-chevron-right');
    const statusPanel = document.getElementById('status-panel');
    if (statusPanel) statusPanel.classList.add('sidebar-collapsed');
    const viewModeToggle = document.getElementById('view-mode-toggle');
    if (viewModeToggle) viewModeToggle.classList.add('sidebar-collapsed');
  }
}

function setupRangeDisplays() {
  const confidenceRange = document.getElementById('confidence-range');
  const confidenceMin = document.getElementById('confidence-min');
  if (confidenceRange && confidenceMin) {
    confidenceRange.addEventListener('input', function () {
      confidenceMin.textContent = this.value + '%';
    });
  }
  const frpRange = document.getElementById('frp-range');
  const frpMin = document.getElementById('frp-min');
  if (frpRange && frpMin) {
    frpRange.addEventListener('input', function () {
      frpMin.textContent = this.value;
    });
  }
}

function updateFooterYear() {
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadGoogleMapsScript();
  setupRangeDisplays();
  updateFooterYear();
});
