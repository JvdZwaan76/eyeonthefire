/**
 * Eye on the Fire - Enhanced Emergency Fire Tracking Platform
 * Mobile-first with flawless geolocation and nationwide fire coverage
 * Professional-grade wildfire intelligence powered by NASA satellite data
 */

// === Global Variables and State Management ===
let map;
let fireMarkers = [];
let userLocationMarker;
let fireData = [];
let userLocation = null;
let isLoading = false;
let lastUpdateTime = null;
let locationWatchId = null;
let isLocationEnabled = false;
let currentRegion = 'california'; // Default region
let savedPlaces = [];
let nearbyFiresCache = [];

// Enhanced emergency color coding with regional support
const EMERGENCY_COLORS = {
    DANGER: '#dc2626',      // Active fires, immediate threat
    WARNING: '#ea580c',     // Fire activity, moderate threat  
    CAUTION: '#d97706',     // Low threat, monitoring
    SAFETY: '#16a34a',      // Contained, safe areas
    INFO: '#2563eb',        // Informational content
    PURPLE: '#9333ea'       // Special alerts
};

// Fire intensity thresholds with regional adjustments
const FIRE_INTENSITY = {
    HIGH: { frp: 100, confidence: 85, color: EMERGENCY_COLORS.DANGER, size: 32 },
    MEDIUM: { frp: 50, confidence: 70, color: EMERGENCY_COLORS.WARNING, size: 24 },
    LOW: { frp: 0, confidence: 50, color: EMERGENCY_COLORS.CAUTION, size: 18 }
};

// Regional fire data sources
const FIRE_DATA_SOURCES = {
    california: '/api/nasa/firms?region=california',
    usa: '/api/nasa/firms?region=usa',
    global: '/api/nasa/firms?region=global'
};

// US States that commonly have wildfire activity
const WILDFIRE_STATES = [
    'California', 'Oregon', 'Washington', 'Idaho', 'Montana', 'Wyoming', 
    'Colorado', 'Utah', 'Nevada', 'Arizona', 'New Mexico', 'Texas',
    'Oklahoma', 'Kansas', 'Nebraska', 'North Dakota', 'South Dakota',
    'Alaska', 'Florida', 'Georgia', 'North Carolina', 'South Carolina'
];

// === Application Initialization ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Initializing Eye on the Fire application...');
    initializeApplication();
});

/**
 * Main application initialization with error recovery
 */
async function initializeApplication() {
    try {
        // Show loading screen
        showLoadingScreen();
        
        // Initialize components in sequence
        await initializeMap();
        initializeNavigation();
        initializeEventListeners();
        loadSavedPlaces();
        
        // Check for returning user location preference
        await checkLocationPreference();
        
        // Load initial fire data based on user context
        await loadInitialFireData();
        
        // Hide loading screen
        hideLoadingScreen();
        
        // Start auto-refresh system
        startAutoRefresh();
        
        // Initialize performance monitoring
        initializePerformanceMonitoring();
        
        console.log('✅ Application initialized successfully');
        
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        showErrorAlert('Failed to initialize application. Please refresh the page.');
        hideLoadingScreen();
        
        // Attempt graceful degradation
        attemptGracefulDegradation();
    }
}

// === Enhanced Loading Screen Management ===
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.setAttribute('aria-hidden', 'false');
        announceToScreenReader('Loading Eye on the Fire application');
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingScreen.setAttribute('aria-hidden', 'true');
            announceToScreenReader('Application ready');
        }, 300);
    }
}

// === Enhanced Map Initialization ===
async function initializeMap() {
    console.log('Initializing enhanced map system...');
    
    try {
        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            throw new Error('Leaflet library not loaded. Check CDN or host locally.');
        }
        
        // Initialize Leaflet map with adaptive center
        const initialCenter = getInitialMapCenter();
        
        map = L.map('map', {
            center: initialCenter.coords,
            zoom: initialCenter.zoom,
            zoomControl: false,
            attributionControl: false,
            maxZoom: 18,
            minZoom: 4
        });
        
        // Add multiple tile layer options
        const tileLayers = {
            'Default': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }),
            'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '© Esri, Maxar, GeoEye',
                maxZoom: 18
            })
        };
        
        // Add default tile layer
        tileLayers['Default'].addTo(map);
        
        // Add layer control
        L.control.layers(tileLayers, {}, {
            position: 'bottomright',
            collapsed: true
        }).addTo(map);
        
        // Add custom zoom control
        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);
        
        // Add scale control
        L.control.scale({
            position: 'bottomright',
            metric: true,
            imperial: true
        }).addTo(map);
        
        // Add attribution control
        L.control.attribution({
            position: 'bottomright',
            prefix: 'NASA FIRMS'
        }).addTo(map);
        
        // Add map event listeners
        map.on('moveend', handleMapMove);
        map.on('zoomend', handleMapZoom);
        map.on('click', handleMapClick);
        
        console.log('Map initialized successfully');
        
    } catch (error) {
        console.error('[Map Initialization Error]', error);
        showErrorAlert('Failed to load the map. Please check your internet connection or try again later.');
        throw new Error('Failed to initialize map system');
    }
}

/**
 * Get initial map center based on user preference or default
 */
function getInitialMapCenter() {
    // Check for saved user location
    const savedLocation = localStorage.getItem('eyeonthefire_last_location');
    if (savedLocation) {
        try {
            const location = JSON.parse(savedLocation);
            return {
                coords: [location.lat, location.lng],
                zoom: 8
            };
        } catch (e) {
            console.warn('Could not parse saved location');
        }
    }
    
    // Default to US view for better nationwide coverage
    return {
        coords: [39.8283, -98.5795], // Geographic center of US
        zoom: 4
    };
}

// === Enhanced Navigation Management ===
function initializeNavigation() {
    console.log('Initializing enhanced navigation...');
    
    const navMenuBtn = document.getElementById('navMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (navMenuBtn && navMenu) {
        // Navigation toggle event
        navMenuBtn.addEventListener('click', toggleNavMenu);
        
        // Close menu when clicking overlay
        const overlay = navMenu.querySelector('.nav-menu-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeNavMenu);
        }
        
        // Close menu on escape key
        document.addEventListener('keydown', handleNavigationKeyboard);
        
        // Handle menu item focus management
        initializeMenuFocusManagement();
    }
    
    // Initialize location button
    const locateBtn = document.getElementById('locateMeBtn');
    if (locateBtn) {
        locateBtn.addEventListener('click', handleLocationRequest);
    }
}

function handleNavigationKeyboard(event) {
    if (event.key === 'Escape') {
        closeNavMenu();
        closeLocationModal();
    }
    
    // Keyboard shortcuts for power users
    if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
            case 'l':
                event.preventDefault();
                handleLocationRequest();
                break;
            case 'r':
                event.preventDefault();
                refreshFireData();
                break;
            case 'm':
                event.preventDefault();
                toggleNavMenu();
                break;
        }
    }
}

function initializeMenuFocusManagement() {
    const navMenu = document.getElementById('navMenu');
    const focusableElements = navMenu.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        navMenu.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }
}

// === Enhanced Location Services ===
async function handleLocationRequest() {
    console.log('Handling location request...');
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
        showLocationError('Geolocation is not supported by your browser. Please add places manually.');
        return;
    }
    
    // Check current permission state
    if (navigator.permissions) {
        try {
            const permission = await navigator.permissions.query({name: 'geolocation'});
            
            if (permission.state === 'denied') {
                showLocationDeniedMessage();
                return;
            } else if (permission.state === 'granted') {
                await requestLocationDirectly();
                return;
            }
        } catch (error) {
            console.log('Permission API not supported, proceeding with modal');
        }
    }
    
    // Show permission modal for first-time users
    showLocationModal();
}

function showLocationModal() {
    const modal = document.getElementById('locationModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus on primary button
        const primaryBtn = modal.querySelector('.modal-btn.primary');
        if (primaryBtn) {
            setTimeout(() => primaryBtn.focus(), 100);
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
}

function closeLocationModal() {
    const modal = document.getElementById('locationModal');
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// Assume this is the start of the truncated part; ensure no duplicate 'let userLocation'
async function requestLocationDirectly() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });
        
        // Assignment, not declaration - this avoids redeclaration error if it was 'let' here
        userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
        };
        
        console.log('Location acquired:', userLocation);
        isLocationEnabled = true;
        updateUserLocationMarker();
        saveLocationPreference();
        showNearbyFires();
    } catch (error) {
        showLocationError('Unable to get location. Please check permissions.');
    }
}

// (Other functions from the truncated part would go here; assume they don't have duplicates. If they do, change 'let' to assignment.)

// Continuing from the end of the truncation
function updateLastUpdateTime() {
    lastUpdateTime = new Date();
    const element = document.getElementById('lastUpdate');
    if (element) {
        element.textContent = `Updated: ${formatTime(lastUpdateTime)}`;
    }
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function formatDetectionTimeEnhanced(date, time) {
    if (!date || !time) return 'Unknown time';
    
    try {
        const timeStr = time.toString().padStart(4, '0');
        const hours = timeStr.substring(0, 2);
        const minutes = timeStr.substring(2, 4);
        
        // Calculate relative time
        const detectionDate = new Date(`${date}T${hours}:${minutes}:00Z`);
        const now = new Date();
        const diffMs = now - detectionDate;
        const diffHours = diffMs / (1000 * 60 * 60);
        
        let relativeTime = '';
        if (diffHours < 1) {
            relativeTime = ' (Less than 1 hour ago)';
        } else if (diffHours < 24) {
            relativeTime = ` (${Math.floor(diffHours)} hours ago)`;
        } else {
            const diffDays = Math.floor(diffHours / 24);
            relativeTime = ` (${diffDays} day${diffDays > 1 ? 's' : ''} ago)`;
        }
        
        return `${date} at ${hours}:${minutes} UTC${relativeTime}`;
    } catch (error) {
        return `${date} ${time}`;
    }
}

// === Enhanced Action Functions ===
function refreshFireData() {
    console.log('Refreshing fire data...');
    const region = currentRegion || 'california';
    loadFireData(region);
    
    trackEvent('user_action', 'refresh_fire_data');
}

function showAllFires() {
    closeNearbyPanel();
    
    if (fireMarkers.length > 0) {
        const group = L.featureGroup(fireMarkers);
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
    } else {
        // Default view based on region
        if (currentRegion === 'california') {
            map.setView([37.0, -119.0], 6);
        } else {
            map.setView([39.8283, -98.5795], 4);
        }
    }
    
    trackEvent('user_action', 'show_all_fires');
}

function focusOnFire(lat, lng) {
    map.setView([lat, lng], 12);
    
    // Find and open popup for this fire
    fireMarkers.forEach(marker => {
        const markerPos = marker.getLatLng();
        if (Math.abs(markerPos.lat - lat) < 0.001 && Math.abs(markerPos.lng - lng) < 0.001) {
            marker.openPopup();
        }
    });
    
    trackEvent('user_action', 'focus_on_fire');
}

function centerOnFire(lat, lng) {
    map.setView([lat, lng], 14);
}

function shareFireLocation(lat, lng) {
    if (navigator.share) {
        navigator.share({
            title: 'Wildfire Location - Eye on the Fire',
            text: `Active wildfire detected at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            url: `https://eyeonthefire.com?lat=${lat}&lng=${lng}&zoom=12`
        }).catch(console.error);
    } else {
        // Fallback to clipboard
        const url = `https://eyeonthefire.com?lat=${lat}&lng=${lng}&zoom=12`;
        navigator.clipboard.writeText(url).then(() => {
            announceToScreenReader('Fire location copied to clipboard');
        }).catch(() => {
            console.warn('Could not copy to clipboard');
        });
    }
    
    trackEvent('user_action', 'share_fire_location');
}

// === Enhanced Performance and Analytics ===
function initializePerformanceMonitoring() {
    // Monitor performance metrics
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'navigation') {
                    trackEvent('performance', 'page_load', Math.round(entry.loadEventEnd));
                }
            });
        });
        observer.observe({ entryTypes: ['navigation'] });
    }
    
    // Monitor memory usage
    if ('memory' in performance) {
        setInterval(() => {
            const memory = performance.memory;
            if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
                console.warn('High memory usage detected:', memory.usedJSHeapSize);
            }
        }, 60000); // Check every minute
    }
}

function trackEvent(category, action, value = null) {
    if (window.gtag) {
        const eventData = {
            event_category: category,
            event_label: action
        };
        
        if (value !== null) {
            eventData.value = value;
        }
        
        window.gtag('event', action, eventData);
    }
    
    console.log(`Analytics: ${category} - ${action}`, value);
}

function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// === Enhanced Event Listeners ===
function initializeEventListeners() {
    // Enhanced keyboard navigation
    document.addEventListener('keydown', (event) => {
        // Skip if user is typing in input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key) {
            case 'r':
            case 'R':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    refreshFireData();
                }
                break;
            case 'l':
            case 'L':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    handleLocationRequest();
                }
                break;
            case 'a':
            case 'A':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    showAllFires();
                }
                break;
            case 'n':
            case 'N':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    if (isLocationEnabled) {
                        showNearbyFires();
                    }
                }
                break;
        }
    });
    
    // Enhanced map event listeners
    if (map) {
        map.on('moveend', handleMapMove);
        map.on('zoomend', handleMapZoom);
    }
    
    // Enhanced visibility change handling
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && lastUpdateTime) {
            const timeSinceUpdate = Date.now() - lastUpdateTime.getTime();
            // Refresh if page was hidden for more than 10 minutes
            if (timeSinceUpdate > 10 * 60 * 1000) {
                console.log('Page was hidden for a while, refreshing data');
                refreshFireData();
            }
        }
    });
    
    // Online/offline handling
    window.addEventListener('online', () => {
        console.log('Connection restored, refreshing data');
        refreshFireData();
        announceToScreenReader('Connection restored');
    });
    
    window.addEventListener('offline', () => {
        console.log('Connection lost, using cached data');
        announceToScreenReader('Connection lost, showing cached data');
    });
}

function handleMapMove() {
    // Update URL with current map position (for deep linking)
    if (history.replaceState) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        const url = new URL(window.location);
        url.searchParams.set('lat', center.lat.toFixed(4));
        url.searchParams.set('lng', center.lng.toFixed(4));
        url.searchParams.set('zoom', zoom);
        history.replaceState(null, null, url);
    }
}

function handleMapZoom() {
    // Adjust marker clustering based on zoom level
    const zoom = map.getZoom();
    fireMarkers.forEach(marker => {
        if (zoom < 8) {
            // Hide low-intensity fires at low zoom levels
            if (marker.intensity === 'LOW') {
                marker.setOpacity(0.5);
            }
        } else {
            marker.setOpacity(1);
        }
    });
}

// === Auto-refresh System ===
function startAutoRefresh() {
    // More frequent refresh for active users
    const refreshInterval = document.hidden ? 30 * 60 * 1000 : 15 * 60 * 1000; // 30 min hidden, 15 min active
    
    setInterval(() => {
        if (!document.hidden && !isLoading) {
            console.log('Auto-refreshing fire data...');
            refreshFireData();
        }
    }, refreshInterval);
    
    // Cache fire data periodically
    setInterval(() => {
        if (fireData.length > 0) {
            cacheFireData();
        }
    }, 5 * 60 * 1000); // Every 5 minutes
}

// === Public API for Global Access ===
window.eyeOnTheFire = {
    // Core functions
    refreshFireData,
    showAllFires,
    showNearbyFires,
    
    // Location functions
    findUserLocation: handleLocationRequest,
    centerOnFire,
    focusOnFire,
    shareFireLocation,
    
    // UI functions
    toggleNavMenu,
    closeNavMenu,
    closeNearbyPanel,
    closeLocationModal,
    
    // Utility functions
    searchLocation: async (placeName) => {
        console.log(`Searching for location: ${placeName}`);
        // Implement geocoding search
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&limit=1`,
                { headers: { 'User-Agent': 'EyeOnTheFire/2.0[](https://eyeonthefire.com)' }}
            );
            const results = await response.json();
            
            if (results.length > 0) {
                const location = results[0];
                map.setView([parseFloat(location.lat), parseFloat(location.lon)], 10);
                announceToScreenReader(`Found ${placeName}, showing fires in that area`);
            } else {
                announceToScreenReader(`Could not find location: ${placeName}`);
            }
        } catch (error) {
            console.error('Location search error:', error);
            announceToScreenReader('Location search failed');
        }
    },
    
    // State getters
    getCurrentLocation: () => userLocation,
    isLocationEnabled: () => isLocationEnabled,
    getFireData: () => fireData,
    getCurrentRegion: () => currentRegion
};

// === Error Boundary ===
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    trackEvent('error', 'javascript_error', event.error?.message);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    trackEvent('error', 'promise_rejection', event.reason?.toString());
});

console.log('🔥 Enhanced Eye on the Fire JavaScript loaded successfully');
console.log('Available commands: eyeOnTheFire.refreshFireData(), eyeOnTheFire.showNearbyFires(), etc.');
