/**
 * Map Integration Script
 * Connects Google Maps with FireDataService
 */

// Create instance of FireDataService
const fireService = new FireDataService();

// Make initMap function available globally for Google Maps callback
window.initMap = function() {
    console.log('Google Maps API loaded, initializing map...');
    
    // Create map
    const map = new google.maps.Map(document.getElementById('map'), {
        center: fireMapConfig.mapDefaults.center,
        zoom: fireMapConfig.mapDefaults.zoom,
        maxZoom: fireMapConfig.mapDefaults.maxZoom,
        minZoom: fireMapConfig.mapDefaults.minZoom,
        mapTypeId: 'terrain',
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: false
    });
    
    // Initialize the FireDataService with the map instance
    fireService.initialize(map);
    
    // Hide loading overlay
    document.getElementById('loading-overlay').style.display = 'none';
    
    // Setup UI controls and event listeners
    setupUIControls(map, fireService);
};

/**
 * Set up UI controls and event listeners
 */
function setupUIControls(map, service) {
    // Zoom in button
    document.getElementById('zoom-in').addEventListener('click', function() {
        map.setZoom(map.getZoom() + 1);
    });
    
    // Zoom out button
    document.getElementById('zoom-out').addEventListener('click', function() {
        map.setZoom(map.getZoom() - 1);
    });
    
    // Recenter/location button
    document.getElementById('recenter').addEventListener('click', function() {
        if (navigator.geolocation) {
            service.showStatusMessage('Getting your location...');
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    map.setCenter(userLocation);
                    map.setZoom(10);
                    
                    // Add marker for user location
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
                    
                    service.showStatusMessage('Map centered on your location', 'success');
                },
                function(error) {
                    service.showStatusMessage('Could not get your location: ' + error.message, 'error');
                }
            );
        } else {
            service.showStatusMessage('Geolocation is not supported by your browser', 'error');
        }
    });
    
    // Statistics button
    document.getElementById('show-stats').addEventListener('click', function() {
        service.showStatistics();
    });
    
    // Close stats button
    document.getElementById('close-stats').addEventListener('click', function() {
        document.getElementById('stats-panel').style.display = 'none';
    });
    
    // Region buttons
    document.querySelectorAll('.region-button').forEach(function(button) {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.region-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get bounds from data attribute
            const bounds = this.getAttribute('data-bounds');
            if (bounds) {
                const [west, south, east, north] = bounds.split(',').map(Number);
                
                // Focus map on region
                map.fitBounds(new google.maps.LatLngBounds(
                    new google.maps.LatLng(south, west),
                    new google.maps.LatLng(north, east)
                ));
            }
        });
    });
    
    // Apply filters button
    document.getElementById('apply-filters').addEventListener('click', function() {
        service.applyFilterSettings();
    });
    
    // Reset filters button
    document.getElementById('reset-filters').addEventListener('click', function() {
        service.resetFilters();
    });
    
    // View mode toggles
    document.getElementById('usa-mode').addEventListener('click', function() {
        this.classList.remove('btn-outline-primary');
        this.classList.add('btn-primary');
        document.getElementById('global-mode').classList.remove('btn-primary');
        document.getElementById('global-mode').classList.add('btn-outline-primary');
        
        // Focus on USA
        map.fitBounds(new google.maps.LatLngBounds(
            new google.maps.LatLng(fireMapConfig.usaBounds.south, fireMapConfig.usaBounds.west),
            new google.maps.LatLng(fireMapConfig.usaBounds.north, fireMapConfig.usaBounds.east)
        ));
        
        // Reload USA data
        service.fetchUSAFireData();
    });
    
    document.getElementById('global-mode').addEventListener('click', function() {
        this.classList.remove('btn-outline-primary');
        this.classList.add('btn-primary');
        document.getElementById('usa-mode').classList.remove('btn-primary');
        document.getElementById('usa-mode').classList.add('btn-outline-primary');
        
        // Adjust map to world view
        map.setCenter({ lat: 0, lng: 0 });
        map.setZoom(2);
        
        // Reload data for current viewport
        service.fetchDataForViewport();
    });
    
    // Set up sidebar toggle
    setupSidebar();
    
    // Set up range input displays
    setupRangeDisplays();
    
    // Set current year in footer
    updateFooterYear();
}

/**
 * Set up sidebar toggle functionality
 */
function setupSidebar() {
    const toggleBtn = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        toggleBtn.classList.toggle('collapsed');
        
        const statusPanel = document.getElementById('status-panel');
        if (statusPanel) statusPanel.classList.toggle('sidebar-collapsed');
        
        const viewModeToggle = document.getElementById('view-mode-toggle');
        if (viewModeToggle) viewModeToggle.classList.toggle('sidebar-collapsed');
        
        // Update icon
        const icon = toggleBtn.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
        } else {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
        }
    });
    
    // Auto-collapse on mobile
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

/**
 * Set up range input displays
 */
function setupRangeDisplays() {
    // Confidence range
    const confidenceRange = document.getElementById('confidence-range');
    const confidenceMin = document.getElementById('confidence-min');
    
    if (confidenceRange && confidenceMin) {
        confidenceRange.addEventListener('input', function() {
            confidenceMin.textContent = this.value + '%';
        });
    }
    
    // FRP range
    const frpRange = document.getElementById('frp-range');
    const frpMin = document.getElementById('frp-min');
    
    if (frpRange && frpMin) {
        frpRange.addEventListener('input', function() {
            frpMin.textContent = this.value;
        });
    }
}

/**
 * Update footer year
 */
function updateFooterYear() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/**
 * Initialize when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load the Google Maps API dynamically
    loadGoogleMapsScript();
    
    // Set up range input displays
    setupRangeDisplays();
    
    // Update footer year
    updateFooterYear();
});

/**
 * Load Google Maps API script
 */
function loadGoogleMapsScript() {
    // Skip if already loaded
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
        return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Handle loading errors
    script.onerror = function() {
        console.error('Failed to load Google Maps API');
        document.getElementById('loading-message').textContent = 'Failed to load Google Maps. Please refresh and try again.';
    };
    
    // Add to document
    document.head.appendChild(script);
}
