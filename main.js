// Initialize site
console.log('Initializing site');

// Hamburger Menu Toggle
function setupMobileMenu() {
  console.log('Setting up mobile menu');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close menu when a menu item is clicked
  document.querySelectorAll('.main-menu a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}

// Map initialization timeout
setTimeout(function() {
  if (!window.google || !window.google.maps) {
    console.log('Map initialization timeout');
    showMapLoadingError();
  }
}, 10000);

// Show map loading error
function showMapLoadingError() {
  var loadingOverlay = document.getElementById('loading-overlay');
  var loadingMessage = document.getElementById('loading-message');
  loadingOverlay.classList.add('error');
  loadingMessage.classList.add('error');
  loadingMessage.textContent = 'Failed to load map. Please try again later.';
}

// Other functions (assumed)
function setupScrollEffect() {
  console.log('Setting up scroll effect');
}

function setupSmoothScrolling() {
  console.log('Setting up smooth scrolling');
}

function setupMapControls() {
  console.log('Setting up map controls');
}

// Initial setup
document.addEventListener('DOMContentLoaded', function() {
  setupMobileMenu();
  setupScrollEffect();
  setupSmoothScrolling();
  setupMapControls();
});
