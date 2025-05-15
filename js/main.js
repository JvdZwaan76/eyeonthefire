/**
 * Eye on the Fire - Main JavaScript
 * Initializes the fire map and connects UI elements
 */

document.addEventListener('DOMContentLoaded', () => {
  initializeSite();
  if (!window.turnstile) {
    const turnstileScript = document.createElement('script');
    turnstileScript.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    turnstileScript.async = true;
    turnstileScript.defer = true;
    document.head.appendChild(turnstileScript);
    const turnstileContainer = document.createElement('div');
    turnstileContainer.id = 'turnstile-container';
    turnstileContainer.style.display = 'none';
    document.body.appendChild(turnstileContainer);
  }
});

function initializeSite() {
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
  setupMobileMenu();
  setupScrollEffect();
  setupSmoothScrolling();
  if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
    initializeGoogleMap();
  } else {
    window.initMap = initializeGoogleMap;
    setTimeout(() => {
      if (!window.fireMapInitialized) {
        showMapLoadingError();
      }
    }, 10000);
  }
  setupMapControls();
}

function setupMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      this.classList.toggle('active');
      navMenu.classList.toggle('active');
      this.setAttribute('aria-expanded', this.classList.contains('active'));
    });
    document.addEventListener('click', function (e) {
      if (
        hamburger.classList.contains('active') &&
        !e.target.closest('.hamburger') &&
        !e.target.closest('.nav-menu')
      ) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

function setupScrollEffect() {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
}

function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: 'smooth',
        });
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        if (hamburger && hamburger.classList.contains('active')) {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
}

function initializeGoogleMap() {
  if (window.fireMapInitialized) return;
  window.fireMapInitialized = true;
  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.error('Map container not found');
    return;
  }
  const mapOptions = {
    center: { lat: 39.5, lng: -98.35 },
    zoom: 4,
    mapTypeId: 'terrain',
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP_LEFT,
    },
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl: false,
    styles: [
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#e9e9e9' }, { lightness: 17 }],
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#f5f5f5' }, { lightness: 20 }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#c5e8c5' }, { lightness: 21 }],
      },
    ],
  };
  const map = new google.maps.Map(mapElement, mapOptions);
  window.fireMap = map;
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
  initializeFireDataService(map);
}

function initializeFireDataService(map) {
  if (typeof window.FireDataService !== 'function') {
    console.error('FireDataService not found. Make sure fire-data-service.js is loaded properly.');
    showStatusMessage('Error loading fire data service', 'error');
    return;
  }
  const fireDataService = new window.FireDataService();
  window.fireDataService = fireDataService;
  fireDataService.initialize(map);
}

function setupMapControls() {
  const toggleSidebar = document.getElementById('toggle-sidebar');
  if (toggleSidebar) {
    toggleSidebar.addEventListener('click', toggleSidebarPanel);
  }
  const zoomIn = document.getElementById('zoom-in');
  if (zoomIn) {
    zoomIn.addEventListener('click', () => {
      const map = getFireMap();
      if (map) {
        map.setZoom(map.getZoom() + 1);
      }
    });
  }
  const zoomOut = document.getElementById('zoom-out');
  if (zoomOut) {
    zoomOut.addEventListener('click', () => {
      const map = getFireMap();
      if (map) {
        map.setZoom(map.getZoom() - 1);
      }
    });
  }
  const recenter = document.getElementById('recenter');
  if (recenter) {
    recenter.addEventListener('click', () => {
      const fireDataService = window.fireDataService;
      if (fireDataService) {
        fireDataService.getUserLocation();
      }
    });
  }
  const showStats = document.getElementById('show-stats');
  if (showStats) {
    showStats.addEventListener('click', () => {
      const fireDataService = window.fireDataService;
      if (fireDataService) {
        fireDataService.showStatistics();
      }
    });
  }
  const closeStats = document.getElementById('close-stats');
  if (closeStats) {
    closeStats.addEventListener('click', () => {
      const statsPanel = document.getElementById('stats-panel');
      if (statsPanel) {
        statsPanel.style.display = 'none';
      }
    });
  }
  const applyFilters = document.getElementById('apply-filters');
  if (applyFilters) {
    applyFilters.addEventListener('click', () => {
      const fireDataService = window.fireDataService;
      if (fireDataService) {
        fireDataService.applyFilterSettings();
      }
    });
  }
  const resetFilters = document.getElementById('reset-filters');
  if (resetFilters) {
    resetFilters.addEventListener('click', () => {
      const fireDataService = window.fireDataService;
      if (fireDataService) {
        fireDataService.resetFilters();
      }
    });
  }
  const regionButtons = document.querySelectorAll('.region-button');
  regionButtons.forEach((button) => {
    button.addEventListener('click', function () {
      regionButtons.forEach((btn) => btn.classList.remove('active'));
      this.classList.add('active');
      const bounds = this.getAttribute('data-bounds');
      if (bounds) {
        const [west, south, east, north] = bounds.split(',').map(Number);
        focusMapOnRegion(north, south, east, west);
      }
    });
  });
  const globalMode = document.getElementById('global-mode');
  const usaMode = document.getElementById('usa-mode');
  if (globalMode && usaMode) {
    globalMode.addEventListener('click', function () {
      this.classList.remove('btn-outline-primary');
      this.classList.add('btn-primary');
      usaMode.classList.remove('btn-primary');
      usaMode.classList.add('btn-outline-primary');
      const fireDataService = window.fireDataService;
      if (fireDataService) {
        fireDataService.setViewMode('global');
      }
    });
    usaMode.addEventListener('click', function () {
      this.classList.remove('btn-outline-primary');
      this.classList.add('btn-primary');
      globalMode.classList.remove('btn-primary');
      globalMode.classList.add('btn-outline-primary');
      const fireDataService = window.fireDataService;
      if (fireDataService) {
        fireDataService.setViewMode('usa');
      }
    });
  }
  const prevPage = document.getElementById('prev-page');
  if (prevPage) {
    prevPage.addEventListener('click', () => {
      const fireDataService = window.fireDataService;
      if (fireDataService && fireDataService.settings.currentPage > 1) {
        fireDataService.settings.currentPage--;
        fireDataService.updateMarkers();
      }
    });
  }
  const nextPage = document.getElementById('next-page');
  if (nextPage) {
    nextPage.addEventListener('click', () => {
      const fireDataService = window.fireDataService;
      if (fireDataService) {
        const totalPages = Math.ceil(
          fireDataService.filteredData.length / fireDataService.settings.maxMarkers
        );
        if (fireDataService.settings.currentPage < totalPages) {
          fireDataService.settings.currentPage++;
          fireDataService.updateMarkers();
        }
      }
    });
  }
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

function toggleSidebarPanel() {
  const sidebar = document.getElementById('sidebar');
  const toggleSidebar = document.getElementById('toggle-sidebar');
  const statusPanel = document.getElementById('status-panel');
  const viewModeToggle = document.getElementById('view-mode-toggle');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
  }
  if (toggleSidebar) {
    toggleSidebar.classList.toggle('collapsed');
    const icon = toggleSidebar.querySelector('i');
    if (icon) {
      if (sidebar && sidebar.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
      } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
      }
    }
  }
  if (statusPanel) {
    statusPanel.classList.toggle('sidebar-collapsed');
  }
  if (viewModeToggle) {
    viewModeToggle.classList.toggle('sidebar-collapsed');
  }
}

function focusMapOnRegion(north, south, east, west) {
  const map = getFireMap();
  if (!map) return;
  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(south, west),
    new google.maps.LatLng(north, east)
  );
  map.fitBounds(bounds);
}

function getFireMap() {
  return window.fireMap;
}

function showStatusMessage(message, type = 'info') {
  const statusPanel = document.getElementById('status-panel');
  if (!statusPanel) return;
  statusPanel.textContent = message;
  statusPanel.style.display = 'block';
  switch (type) {
    case 'error':
      statusPanel.style.borderLeft = '4px solid #dc3545';
      break;
    case 'success':
      statusPanel.style.borderLeft = '4px solid #28a745';
      setTimeout(() => {
        statusPanel.style.display = 'none';
      }, 5000);
      break;
    case 'warning':
      statusPanel.style.borderLeft = '4px solid #ffc107';
      break;
    default:
      statusPanel.style.borderLeft = '4px solid #17a2b8';
  }
}

function showMapLoadingError() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
  mapElement.innerHTML = `
    <div style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: #f1f1f1; padding: 20px; text-align: center;">
      <i class="fas fa-exclamation-triangle fa-3x" style="color: #ff4500; margin-bottom: 15px;"></i>
      <h3>Map Loading Error</h3>
      <p>We couldn't load the Google Maps API. This may be due to network connectivity issues or because your API key is invalid.</p>
      <button onclick="location.reload()" class="btn btn-primary">
        <i class="fas fa-sync-alt"></i> Refresh Page
      </button>
      <p class="mt-3" style="font-size: 0.9rem; color: #666;">
        <i class="fas fa-info-circle"></i> If the problem persists, check your internet connection or contact support.
      </p>
    </div>
  `;
}
