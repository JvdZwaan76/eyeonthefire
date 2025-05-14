/**
 * Eye on the Fire - Main JavaScript
 * This file handles all site functionality including the interactive fire map
 */

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Toggle mobile menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            this.setAttribute('aria-expanded', this.classList.contains('active'));
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (hamburger.classList.contains('active') && 
                !e.target.closest('.hamburger') && 
                !e.target.closest('.nav-menu')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for navbar height
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (hamburger && hamburger.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });
    
    // Map functionality
    initializeFireMap();
});

// Map initialization function
function initializeFireMap() {
    // Sidebar toggle
    const toggleSidebar = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const statusPanel = document.getElementById('status-panel');
    const viewModeToggle = document.getElementById('view-mode-toggle');
    
    if (toggleSidebar && sidebar) {
        toggleSidebar.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            toggleSidebar.classList.toggle('collapsed');
            
            if (statusPanel) statusPanel.classList.toggle('sidebar-collapsed');
            if (viewModeToggle) viewModeToggle.classList.toggle('sidebar-collapsed');
            
            const icon = toggleSidebar.querySelector('i');
            if (icon) {
                if (sidebar.classList.contains('collapsed')) {
                    icon.classList.remove('fa-chevron-left');
                    icon.classList.add('fa-chevron-right');
                } else {
                    icon.classList.remove('fa-chevron-right');
                    icon.classList.add('fa-chevron-left');
                }
            }
        });
    }
    
    // Region buttons
    const regionButtons = document.querySelectorAll('.region-button');
    regionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            regionButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Focus map on region if Google Maps is loaded
            if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
                const bounds = this.dataset.bounds;
                if (bounds) {
                    const [west, south, east, north] = bounds.split(',').map(Number);
                    focusMapOnRegion(north, south, east, west);
                }
            }
        });
    });
    
    // View mode toggle
    const globalMode = document.getElementById('global-mode');
    const usaMode = document.getElementById('usa-mode');
    
    if (globalMode && usaMode) {
        globalMode.addEventListener('click', function() {
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary');
            usaMode.classList.remove('btn-primary');
            usaMode.classList.add('btn-outline-primary');
        });
        
        usaMode.addEventListener('click', function() {
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary');
            globalMode.classList.remove('btn-primary');
            globalMode.classList.add('btn-outline-primary');
        });
    }
    
    // Map controls
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const recenter = document.getElementById('recenter');
    const showStats = document.getElementById('show-stats');
    const closeStats = document.getElementById('close-stats');
    const statsPanel = document.getElementById('stats-panel');
    
    if (zoomIn && zoomOut && typeof google !== 'undefined') {
        zoomIn.addEventListener('click', function() {
            const map = getGoogleMap();
            if (map) {
                map.setZoom(map.getZoom() + 1);
            }
        });
        
        zoomOut.addEventListener('click', function() {
            const map = getGoogleMap();
            if (map) {
                map.setZoom(map.getZoom() - 1);
            }
        });
    }
    
    if (recenter && typeof google !== 'undefined') {
        recenter.addEventListener('click', function() {
            getUserLocation();
        });
    }
    
    if (showStats && statsPanel) {
        showStats.addEventListener('click', function() {
            statsPanel.style.display = 'block';
        });
    }
    
    if (closeStats && statsPanel) {
        closeStats.addEventListener('click', function() {
            statsPanel.style.display = 'none';
        });
    }
    
    // Filter controls
    const confidenceRange = document.getElementById('confidence-range');
    const confidenceMin = document.getElementById('confidence-min');
    
    if (confidenceRange && confidenceMin) {
        confidenceRange.addEventListener('input', function() {
            confidenceMin.textContent = this.value + '%';
        });
    }
    
    const frpRange = document.getElementById('frp-range');
    const frpMin = document.getElementById('frp-min');
    
    if (frpRange && frpMin) {
        frpRange.addEventListener('input', function() {
            frpMin.textContent = this.value;
        });
    }
    
    // Mobile view adjustment
    function checkMobile() {
        if (window.innerWidth < 768) {
            if (sidebar) sidebar.classList.add('collapsed');
            if (toggleSidebar) {
                toggleSidebar.classList.add('collapsed');
                const icon = toggleSidebar.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-chevron-left');
                    icon.classList.add('fa-chevron-right');
                }
            }
            if (statusPanel) statusPanel.classList.add('sidebar-collapsed');
            if (viewModeToggle) viewModeToggle.classList.add('sidebar-collapsed');
        }
    }
    
    // Call once on page load
    checkMobile();
    
    // And on window resize
    window.addEventListener('resize', checkMobile);
    
    // Initialize Google Map if API is loaded
    if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
        initializeGoogleMap();
    } else {
        // Show fallback message if Google Maps isn't loaded
        const mapElement = document.getElementById('map');
        if (mapElement) {
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            
            mapElement.innerHTML = `
                <div style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: #f1f1f1; padding: 20px; text-align: center;">
                    <i class="fas fa-exclamation-triangle fa-3x" style="color: #ff4500; margin-bottom: 15px;"></i>
                    <h3>Map Loading Error</h3>
                    <p>We couldn't load the fire map. This may be due to network issues or because Google Maps is temporarily unavailable.</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        <i class="fas fa-sync-alt"></i> Refresh Page
                    </button>
                    <p class="mt-3" style="font-size: 0.9rem; color: #666;">
                        <i class="fas fa-info-circle"></i> If the problem persists, try using a different browser or checking your internet connection.
                    </p>
                </div>
            `;
        }
    }
}

// Google Maps initialization
function initializeGoogleMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    // Map configuration options
    const mapOptions = {
        center: { lat: 39.5, lng: -98.35 }, // USA center
        zoom: 4,
        mapTypeId: 'terrain',
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.TOP_LEFT
        },
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: false
    };
    
    // Create the map
    const map = new google.maps.Map(mapElement, mapOptions);
    
    // Store map instance in global window object for access from other functions
    window.fireMap = map;
    
    // Hide loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
    
    // Show success message
    showStatusMessage('Map initialized successfully', 'success');
    
    // Setup map events and listeners here
    
    // Initialize with empty state until API data is loaded
    // This would normally be replaced with actual API data
    showSampleData(map);
}

// Helper to get map instance
function getGoogleMap() {
    return window.fireMap;
}

// Focus map on specific region
function focusMapOnRegion(north, south, east, west) {
    const map = getGoogleMap();
    if (!map) return;
    
    const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(south, west),
        new google.maps.LatLng(north, east)
    );
    
    map.fitBounds(bounds);
}

// Get user location and center map
function getUserLocation() {
    const map = getGoogleMap();
    if (!map) return;
    
    if (navigator.geolocation) {
        showStatusMessage('Getting your location...', 'info');
        
        navigator.geolocation.getCurrentPosition(
            // Success callback
            function(position) {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Center map on user location
                map.setCenter(userLocation);
                map.setZoom(10);
                
                // Add marker at user location
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#4285F4',
                        fillOpacity: 0.7,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2,
                        scale: 8
                    },
                    title: 'Your Location'
                });
                
                showStatusMessage('Map centered on your location', 'success');
            },
            // Error callback
            function(error) {
                let errorMessage = 'Unable to get your location';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access was denied by your browser';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage = 'An unknown error occurred';
                        break;
                }
                
                showStatusMessage(errorMessage, 'error');
            }
        );
    } else {
        showStatusMessage('Geolocation is not supported by your browser', 'error');
    }
}

// Display status message
function showStatusMessage(message, type = 'info') {
    const statusPanel = document.getElementById('status-panel');
    if (!statusPanel) return;
    
    statusPanel.textContent = message;
    statusPanel.style.display = 'block';
    
    // Set color based on message type
    switch(type) {
        case 'error':
            statusPanel.style.borderLeft = '4px solid #dc3545';
            break;
        case 'success':
            statusPanel.style.borderLeft = '4px solid #28a745';
            // Auto-hide success messages after 5 seconds
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

// Show sample data when API is unavailable
function showSampleData(map) {
    if (!map) return;
    
    // Create some sample fire data points
    const samplePoints = [
        {lat: 40.7128, lng: -74.0060, confidence: 95, frp: 75, date: 'May 10, 2025'}, // New York
        {lat: 34.0522, lng: -118.2437, confidence: 80, frp: 50, date: 'May 11, 2025'}, // Los Angeles
        {lat: 41.8781, lng: -87.6298, confidence: 65, frp: 30, date: 'May 12, 2025'}, // Chicago
        {lat: 29.7604, lng: -95.3698, confidence: 40, frp: 15, date: 'May 13, 2025'}, // Houston
        {lat: 33.4484, lng: -112.0740, confidence: 20, frp: 5, date: 'May 13, 2025'} // Phoenix
    ];
    
    // Add markers for each point
    samplePoints.forEach(point => {
        // Determine color based on confidence
        let color = '#FFCC00'; // Very low confidence
        
        if (point.confidence >= 80) {
            color = '#FF0000'; // High confidence
        } else if (point.confidence >= 60) {
            color = '#FF4500'; // Medium confidence
        } else if (point.confidence >= 30) {
            color = '#FFA500'; // Low confidence
        }
        
        // Determine size based on FRP
        let size = 8;
        if (point.frp > 50) {
            size = 14;
        } else if (point.frp > 20) {
            size = 12;
        } else if (point.frp > 10) {
            size = 10;
        }
        
        // Create marker
        const marker = new google.maps.Marker({
            position: {lat: point.lat, lng: point.lng},
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: color,
                fillOpacity: 0.8,
                strokeColor: 'white',
                strokeWeight: 1,
                scale: size
            },
            title: `Sample fire data point (${point.confidence}% confidence)`
        });
        
        // Add click event for info window
        const infoContent = `
            <div style="padding: 10px;">
                <h5 style="margin-top: 0;">Fire Data Point</h5>
                <p><strong>Location:</strong> ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}</p>
                <p><strong>Confidence:</strong> ${point.confidence}%</p>
                <p><strong>Fire Power:</strong> ${point.frp} MW</p>
                <p><strong>Detected:</strong> ${point.date}</p>
                <p><small>Note: This is sample data for demonstration</small></p>
            </div>
        `;
        
        const infoWindow = new google.maps.InfoWindow({
            content: infoContent
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    });
    
    showStatusMessage('Note: Displaying sample data for demonstration', 'info');
}
