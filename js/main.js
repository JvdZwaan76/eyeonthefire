function initializeSite() {
  console.log('Initializing site');
  setupMobileMenu();
  setupScrollEffect();
  setupSmoothScrolling();
  initializeMap();
  setupMapControls();
}

function setupMobileMenu() {
  console.log('Setting up mobile menu');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }
}

function setupScrollEffect() {
  console.log('Setting up scroll effect');
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });
}

function setupSmoothScrolling() {
  console.log('Setting up smooth scrolling');
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function initializeMap() {
  if (typeof google === 'undefined' || !google.maps) {
    console.log('Google Maps API not available, setting initMap callback');
    window.initMap = initializeGoogleMap;
  } else {
    console.log('Google Maps API available, initializing map');
    initializeGoogleMap();
  }
}

function initializeGoogleMap() {
  console.log('Initializing Google Map');
  const mapOptions = {
    center: { lat: 39.8283, lng: -98.5795 },
    zoom: 4,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    ],
  };
  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.error('Map element not found');
    return;
  }
  const map = new google.maps.Map(mapElement, mapOptions);
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
  console.log('Map created, hiding loading overlay');
  initializeFireDataService(map);
}

function initializeFireDataService(map) {
  try {
    if (typeof FireDataService === 'undefined') {
      throw new Error('FireDataService not found. Make sure fire-data-service.js is loaded properly.');
    }
    console.log('Initializing FireDataService with map');
    window.fireDataService = new FireDataService(map);
  } catch (error) {
    console.error(error.message);
    showStatusMessage('Error loading fire data service', 'error');
  }
}

function setupMapControls() {
  console.log('Setting up map controls');
  const zoomInButton = document.getElementById('zoom-in');
  const zoomOutButton = document.getElementById('zoom-out');
  const recenterButton = document.getElementById('recenter');
  const showStatsButton = document.getElementById('show-stats');
  const toggleSidebarButton = document.getElementById('toggle-sidebar');
  const applyFiltersButton = document.getElementById('apply-filters');
  const resetFiltersButton = document.getElementById('reset-filters');
  const prevPageButton = document.getElementById('prev-page');
  const nextPageButton = document.getElementById('next-page');
  const regionButtons = document.querySelectorAll('.region-button');

  if (zoomInButton) {
    zoomInButton.addEventListener('click', () => {
      if (window.globalMap) {
        window.globalMap.setZoom(window.globalMap.getZoom() + 1);
      }
    });
  }

  if (zoomOutButton) {
    zoomOutButton.addEventListener('click', () => {
      if (window.globalMap) {
        window.globalMap.setZoom(window.globalMap.getZoom() - 1);
      }
    });
  }

  if (recenterButton) {
    recenterButton.addEventListener('click', () => {
      if (window.globalMap) {
        window.globalMap.setCenter({ lat: 39.8283, lng: -98.5795 });
        window.globalMap.setZoom(4);
      }
    });
  }

  if (showStatsButton) {
    showStatsButton.addEventListener('click', () => {
      const statsPanel = document.getElementById('stats-panel');
      if (statsPanel) {
        statsPanel.style.display = 'block';
        if (window.fireDataService) {
          window.fireDataService.showStats();
        } else {
          showStatusMessage('Statistics unavailable: Fire data service not loaded', 'error');
        }
      }
    });
  }

  if (toggleSidebarButton) {
    toggleSidebarButton.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.toggle('collapsed');
        toggleSidebarButton.classList.toggle('collapsed');
      }
    });
  }

  if (applyFiltersButton) {
    applyFiltersButton.addEventListener('click', () => {
      if (window.fireDataService) {
        window.fireDataService.applyFilterSettings();
      } else {
        showStatusMessage('Cannot apply filters: Fire data service not loaded', 'error');
      }
    });
  }

  if (resetFiltersButton) {
    resetFiltersButton.addEventListener('click', () => {
      if (window.fireDataService) {
        window.fireDataService.resetFilters();
      } else {
        showStatusMessage('Cannot reset filters: Fire data service not loaded', 'error');
      }
    });
  }

  if (prevPageButton) {
    prevPageButton.addEventListener('click', () => {
      if (window.fireDataService) {
        window.fireDataService.prevPage();
      }
    });
  }

  if (nextPageButton) {
    nextPageButton.addEventListener('click', () => {
      if (window.fireDataService) {
        window.fireDataService.nextPage();
      }
    });
  }

  if (regionButtons) {
    regionButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (window.globalMap) {
          const bounds = button.getAttribute('data-bounds').split(',').map(Number);
          window.globalMap.fitBounds({
            west: bounds[0],
            south: bounds[1],
            east: bounds[2],
            north: bounds[3],
          });
        }
      });
    });
  }
}

function showStatusMessage(message, type) {
  console.log('Showing status message:', message, type);
  const statusPanel = document.getElementById('status-panel');
  if (statusPanel) {
    statusPanel.textContent = message;
    statusPanel.className = `status-${type}`;
    statusPanel.style.display = 'block';
    setTimeout(() => {
      statusPanel.style.display = 'none';
    }, 5000);
  }
}

document.addEventListener('DOMContentLoaded', initializeSite);
