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
        document.body.style.overflow = '';
    }
}

async function requestLocationPermission() {
    closeLocationModal();
    await requestLocationDirectly();
}

async function requestLocationDirectly() {
    const button = document.getElementById('locateMeBtn');
    const locationStatus = document.getElementById('locationStatus');
    const locationText = document.getElementById('locationText');
    const nearbyBtn = document.getElementById('nearbyBtn');
    
    // Update UI state
    updateLocationButtonState(button, 'loading');
    showLocationStatus('Getting your location...');
    
    try {
        // Use high accuracy for better results
        const position = await getCurrentPositionEnhanced();
        
        userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
        };
        
        isLocationEnabled = true;
        
        // Save location preference
        saveLocationPreference(true);
        saveLastLocation(userLocation);
        
        // Update UI elements
        updateLocationButtonState(button, 'success');
        
        // Show nearby button
        if (nearbyBtn) {
            nearbyBtn.style.display = 'flex';
        }
        
        // Determine user's geographic context
        await determineUserRegion();
        
        // Load appropriate fire data for user's region
        await loadRegionalFireData();
        
        // Update map view and show nearby fires
        await showUserLocationOnMap();
        await showNearbyFires();
        
        // Start location watching for moving users
        startLocationWatching();
        
        // Track analytics
        trackEvent('location_enabled', 'geolocation_success');
        
        announceToScreenReader('Location found successfully. Showing fires near your area.');
        
    } catch (error) {
        console.error('Enhanced location error:', error);
        handleLocationError(error, button);
    }
}

/**
 * Enhanced geolocation with better error handling
 */
function getCurrentPositionEnhanced() {
    return new Promise((resolve, reject) => {
        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000 // 5 minutes
        };
        
        const timeoutId = setTimeout(() => {
            reject(new Error('Location request timed out'));
        }, options.timeout);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeoutId);
                resolve(position);
            },
            (error) => {
                clearTimeout(timeoutId);
                reject(error);
            },
            options
        );
    });
}

function handleLocationError(error, button) {
    let errorMessage = 'Unable to determine your location.';
    let buttonState = 'error';
    
    switch (error.code) {
        case 1: // PERMISSION_DENIED
            errorMessage = 'Location access denied. You can manually add places to monitor.';
            buttonState = 'denied';
            break;
        case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Location unavailable. Please check your device settings.';
            break;
        case 3: // TIMEOUT
            errorMessage = 'Location request timed out. Please try again.';
            break;
        default:
            errorMessage = error.message || 'Location service error. Please try again.';
    }
    
    updateLocationButtonState(button, buttonState);
    showLocationStatus(errorMessage, 'error');
    
    // Auto-hide error message after 5 seconds
    setTimeout(() => {
        const locationStatus = document.getElementById('locationStatus');
        if (locationStatus) {
            locationStatus.style.display = 'none';
        }
    }, 5000);
    
    trackEvent('location_error', `geolocation_error_${error.code}`);
}

function updateLocationButtonState(button, state) {
    if (!button) return;
    
    const states = {
        loading: {
            html: '<span class="button-icon">📍</span><span class="button-text">Finding...</span>',
            style: { background: '#6b7280', disabled: true }
        },
        success: {
            html: '<span class="button-icon">📍</span><span class="button-text">Located</span>',
            style: { background: '#16a34a', disabled: false }
        },
        error: {
            html: '<span class="button-icon">📍</span><span class="button-text">Try Again</span>',
            style: { background: '#dc2626', disabled: false }
        },
        denied: {
            html: '<span class="button-icon">📍</span><span class="button-text">Denied</span>',
            style: { background: '#6b7280', disabled: true }
        }
    };
    
    const stateConfig = states[state];
    if (stateConfig) {
        button.innerHTML = stateConfig.html;
        Object.assign(button.style, stateConfig.style);
        button.disabled = stateConfig.style.disabled;
    }
}

function showLocationStatus(message, type = 'info') {
    const locationStatus = document.getElementById('locationStatus');
    const locationText = document.getElementById('locationText');
    
    if (locationStatus && locationText) {
        locationText.textContent = message;
        locationStatus.style.display = 'flex';
        
        // Style based on type
        locationStatus.className = `location-status ${type}`;
    }
}

function showLocationDeniedMessage() {
    const message = 'Location access was previously denied. Please enable location services in your browser settings or manually add places to monitor.';
    showLocationStatus(message, 'warning');
    
    // Show manual alternative
    setTimeout(() => {
        announceToScreenReader('You can manually add places to monitor in the navigation menu.');
    }, 2000);
}

/**
 * Determine user's geographic region for appropriate fire data
 */
async function determineUserRegion() {
    if (!userLocation) return;
    
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}&zoom=5&addressdetails=1`,
            { headers: { 'User-Agent': 'EyeOnTheFire/2.0 (https://eyeonthefire.com)' }}
        );
        
        const data = await response.json();
        
        if (data && data.address) {
            const state = data.address.state;
            const country = data.address.country;
            
            userLocation.state = state;
            userLocation.country = country;
            
            // Determine appropriate region for fire data
            if (country === 'United States') {
                if (state === 'California') {
                    currentRegion = 'california';
                    showLocationStatus(`📍 California - Enhanced fire tracking active`);
                } else if (WILDFIRE_STATES.includes(state)) {
                    currentRegion = 'usa';
                    showLocationStatus(`📍 ${state} - US fire tracking active`);
                } else {
                    currentRegion = 'usa';
                    showLocationStatus(`📍 ${state} - US fire monitoring enabled`);
                }
            } else {
                currentRegion = 'global';
                showLocationStatus(`📍 ${country} - Global fire monitoring`);
            }
            
            console.log(`User located in ${state}, ${country} - Using ${currentRegion} region`);
        }
        
    } catch (error) {
        console.error('Error determining user region:', error);
        currentRegion = 'usa'; // Default fallback
        showLocationStatus('📍 Location found - Loading fire data');
    }
}

function startLocationWatching() {
    if (locationWatchId) {
        navigator.geolocation.clearWatch(locationWatchId);
    }
    
    locationWatchId = navigator.geolocation.watchPosition(
        (position) => {
            const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: Date.now()
            };
            
            // Only update if user has moved significantly (>1km)
            const distance = calculateDistance(
                userLocation.lat, userLocation.lng,
                newLocation.lat, newLocation.lng
            );
            
            if (distance > 1) {
                console.log(`User moved ${distance.toFixed(1)}km, updating location`);
                userLocation = newLocation;
                saveLastLocation(userLocation);
                updateUserLocationMarker();
                
                // Refresh nearby fires if panel is open
                const nearbyPanel = document.getElementById('nearbyPanel');
                if (nearbyPanel && nearbyPanel.style.display !== 'none') {
                    showNearbyFires();
                }
            }
        },
        (error) => {
            console.warn('Location watching error:', error);
        },
        {
            enableHighAccuracy: false, // Lower accuracy for battery
            timeout: 30000,
            maximumAge: 600000 // 10 minutes
        }
    );
}

// === Enhanced Fire Data Management ===
async function loadInitialFireData() {
    console.log('Loading initial fire data...');
    
    // Check if user has location enabled from previous session
    if (isLocationEnabled && userLocation) {
        await loadRegionalFireData();
    } else {
        // Load default California data first, then expand if needed
        await loadFireData('california');
    }
}

async function loadRegionalFireData() {
    const region = currentRegion || 'usa';
    console.log(`Loading fire data for region: ${region}`);
    await loadFireData(region);
}

async function loadFireData(region = 'california') {
    if (isLoading) {
        console.log('Fire data loading already in progress');
        return;
    }
    
    isLoading = true;
    updateFireCount('Loading...');
    
    try {
        console.log(`Loading fire data for region: ${region}`);
        
        const endpoint = FIRE_DATA_SOURCES[region] || FIRE_DATA_SOURCES.california;
        const response = await fetchWithRetry(endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'text/csv',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        console.log(`Received ${csvText.length} characters of fire data`);
        
        // Handle no fires case
        if (csvText.startsWith('#') || csvText.trim().length < 100) {
            console.log('No active fires detected in region');
            fireData = [];
            updateFireCount('0');
            updateLastUpdateTime();
            clearFireMarkers();
            announceToScreenReader(`No active fires detected in ${region}`);
            return;
        }
        
        // Parse CSV data with enhanced error handling
        fireData = parseFireCSVEnhanced(csvText);
        console.log(`Successfully parsed ${fireData.length} fire records`);
        
        // Filter fires if user has location (show relevant fires first)
        if (userLocation) {
            fireData = prioritizeNearbyFires(fireData);
        }
        
        // Update UI
        updateFireCount(fireData.length.toString());
        updateLastUpdateTime();
        
        // Add fire markers to map
        await addFireMarkersEnhanced();
        
        // Update nearby fires if location is enabled
        if (isLocationEnabled && userLocation) {
            await updateNearbyFiresCache();
        }
        
        announceToScreenReader(`${fireData.length} active fires loaded`);
        
    } catch (error) {
        console.error('Enhanced fire data loading error:', error);
        updateFireCount('Error');
        showErrorAlert('Failed to load fire data. Please check your connection and try again.');
        
        // Attempt to load cached data
        await loadCachedFireData();
        
    } finally {
        isLoading = false;
    }
}

/**
 * Enhanced CSV parsing with better error handling
 */
function parseFireCSVEnhanced(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    if (lines.length < 2) {
        console.warn('Insufficient CSV data');
        return [];
    }
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const fires = [];
    
    // Validate required headers
    const requiredHeaders = ['latitude', 'longitude', 'confidence', 'frp'];
    const hasRequiredHeaders = requiredHeaders.every(header => 
        headers.some(h => h.includes(header))
    );
    
    if (!hasRequiredHeaders) {
        console.error('CSV missing required headers:', requiredHeaders);
        throw new Error('Invalid fire data format');
    }
    
    for (let i = 1; i < lines.length; i++) {
        try {
            const values = lines[i].split(',');
            const fire = {};
            
            headers.forEach((header, index) => {
                fire[header] = values[index]?.trim() || '';
            });
            
            // Validate and normalize fire data
            const validatedFire = validateFireData(fire);
            if (validatedFire) {
                fires.push(validatedFire);
            }
            
        } catch (error) {
            console.warn(`Error parsing fire data line ${i}:`, error);
        }
    }
    
    return fires;
}

function validateFireData(fire) {
    // Check for required fields
    const lat = parseFloat(fire.latitude);
    const lng = parseFloat(fire.longitude);
    const confidence = parseInt(fire.confidence) || 0;
    const frp = parseFloat(fire.frp) || 0;
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return null;
    }
    
    // Normalize and enhance fire data
    return {
        latitude: lat,
        longitude: lng,
        confidence: Math.max(0, Math.min(100, confidence)),
        frp: Math.max(0, frp),
        brightness: parseFloat(fire.brightness) || 0,
        satellite: fire.satellite || 'Unknown',
        acq_date: fire.acq_date || fire['acq_date'] || 'Unknown',
        acq_time: fire.acq_time || fire['acq_time'] || 'Unknown',
        daynight: fire.daynight || fire['daynight'] || 'D',
        type: fire.type || 0
    };
}

function prioritizeNearbyFires(fires) {
    if (!userLocation || fires.length === 0) return fires;
    
    // Calculate distances and sort by proximity
    const firesWithDistance = fires.map(fire => ({
        ...fire,
        distance: calculateDistance(
            userLocation.lat, userLocation.lng,
            fire.latitude, fire.longitude
        )
    }));
    
    // Sort by distance, but keep high-intensity fires prominent
    return firesWithDistance.sort((a, b) => {
        const aIntensity = determineFireIntensity(a);
        const bIntensity = determineFireIntensity(b);
        
        // Prioritize high-intensity fires within 100km
        if (a.distance < 100 && aIntensity === 'HIGH') return -1;
        if (b.distance < 100 && bIntensity === 'HIGH') return 1;
        
        // Then sort by distance
        return a.distance - b.distance;
    });
}

// === Enhanced Fire Marker Management ===
async function addFireMarkersEnhanced() {
    console.log(`Adding ${fireData.length} enhanced fire markers`);
    
    // Clear existing markers
    clearFireMarkers();
    
    // Add markers in batches for better performance
    const batchSize = 50;
    let processedCount = 0;
    
    for (let i = 0; i < fireData.length; i += batchSize) {
        const batch = fireData.slice(i, i + batchSize);
        
        await new Promise(resolve => {
            setTimeout(() => {
                batch.forEach(fire => {
                    const marker = createEnhancedFireMarker(fire);
                    if (marker) {
                        fireMarkers.push(marker);
                    }
                });
                
                processedCount += batch.length;
                console.log(`Processed ${processedCount}/${fireData.length} markers`);
                resolve();
            }, 0);
        });
    }
    
    console.log(`Added ${fireMarkers.length} fire markers to map`);
}

function createEnhancedFireMarker(fire) {
    if (!fire.latitude || !fire.longitude) {
        console.warn('Invalid fire coordinates:', fire);
        return null;
    }
    
    const intensity = determineFireIntensity(fire);
    const icon = createEnhancedFlameIcon(fire, intensity);
    
    const marker = L.marker([fire.latitude, fire.longitude], { icon })
        .addTo(map)
        .bindPopup(() => createEnhancedFirePopup(fire))
        .on('popupopen', () => loadFireLocationInfoEnhanced(fire));
    
    // Add marker data for filtering
    marker.fireData = fire;
    marker.intensity = intensity;
    
    return marker;
}

function createEnhancedFlameIcon(fire, intensity) {
    const config = FIRE_INTENSITY[intensity];
    const isNearUser = userLocation && calculateDistance(
        userLocation.lat, userLocation.lng,
        fire.latitude, fire.longitude
    ) < 50; // Within 50km
    
    const size = isNearUser ? config.size + 4 : config.size;
    const emoji = getFireEmoji(fire, intensity);
    
    return L.divIcon({
        html: `<div class="fire-marker fire-${intensity.toLowerCase()}" style="
            font-size: ${size}px; 
            color: ${config.color}; 
            text-shadow: 0 0 4px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${size}px;
            height: ${size}px;
            position: relative;
        ">${emoji}</div>`,
        className: `flame-icon flame-${intensity.toLowerCase()}`,
        iconSize: [size, size],
        iconAnchor: [size/2, size],
        popupAnchor: [0, -size]
    });
}

function getFireEmoji(fire, intensity) {
    // Use different emojis based on fire characteristics
    if (fire.daynight === 'N') return '🔥'; // Night fires
    if (intensity === 'HIGH') return '🔥';
    if (intensity === 'MEDIUM') return '🟡';
    return '🟠';
}

function createEnhancedFirePopup(fire) {
    const intensity = determineFireIntensity(fire);
    const confidence = fire.confidence || 0;
    const frp = fire.frp || 0;
    const brightness = fire.brightness || 0;
    
    // Enhanced status determination
    let statusClass = 'status-info';
    let statusText = 'Monitoring';
    
    if (intensity === 'HIGH') {
        statusClass = 'status-danger';
        statusText = 'High Risk';
    } else if (intensity === 'MEDIUM') {
        statusClass = 'status-warning';
        statusText = 'Active Fire';
    } else if (confidence >= 80) {
        statusClass = 'status-warning';
        statusText = 'Confirmed';
    }
    
    // Calculate distance if user location available
    let distanceInfo = '';
    if (userLocation) {
        const distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            fire.latitude, fire.longitude
        );
        distanceInfo = `<div class="distance-info">
            <strong>Distance:</strong> ${distance.toFixed(1)} km from your location
        </div>`;
    }
    
    return `
        <div class="fire-popup enhanced" role="dialog" aria-label="Fire details">
            <div class="popup-header">
                <h3>🔥 Wildfire Detection</h3>
                <span class="fire-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="fire-metrics">
                <div class="metric-row">
                    <div class="metric">
                        <span class="metric-label">Confidence</span>
                        <span class="metric-value confidence-${getConfidenceLevel(confidence)}">${confidence}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Fire Power</span>
                        <span class="metric-value">${frp.toFixed(1)} MW</span>
                    </div>
                </div>
                
                <div class="metric-row">
                    <div class="metric">
                        <span class="metric-label">Brightness</span>
                        <span class="metric-value">${brightness.toFixed(1)}K</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Satellite</span>
                        <span class="metric-value">${fire.satellite}</span>
                    </div>
                </div>
            </div>
            
            <div class="detection-info">
                <div class="detection-time">
                    <strong>Detected:</strong> ${formatDetectionTimeEnhanced(fire.acq_date, fire.acq_time)}
                </div>
                <div class="coordinates">
                    <strong>Location:</strong> ${fire.latitude.toFixed(4)}, ${fire.longitude.toFixed(4)}
                </div>
                ${distanceInfo}
            </div>
            
            <div class="location-info loading" id="location-${fire.latitude}-${fire.longitude}">
                📍 Loading location details...
            </div>
            
            <div class="popup-actions">
                <button class="popup-btn primary" onclick="centerOnFire(${fire.latitude}, ${fire.longitude})">
                    🎯 Center on Fire
                </button>
                <button class="popup-btn secondary" onclick="shareFireLocation(${fire.latitude}, ${fire.longitude})">
                    📱 Share Location
                </button>
            </div>
        </div>
    `;
}

function getConfidenceLevel(confidence) {
    if (confidence >= 80) return 'high';
    if (confidence >= 60) return 'medium';
    return 'low';
}

// === Enhanced Nearby Fires Management ===
async function showNearbyFires() {
    if (!userLocation || fireData.length === 0) {
        console.log('Cannot show nearby fires - no location or fire data');
        return;
    }
    
    console.log('Showing enhanced nearby fires...');
    
    // Update cache
    await updateNearbyFiresCache();
    
    const nearbyPanel = document.getElementById('nearbyPanel');
    const nearbyList = document.getElementById('nearbyList');
    const userLocationText = document.getElementById('userLocationText');
    
    if (!nearbyPanel || !nearbyList) return;
    
    const maxDistance = 100; // 100km radius
    const nearbyFires = nearbyFiresCache.filter(fire => fire.distance <= maxDistance);
    
    // Update user location text
    if (userLocationText) {
        userLocationText.textContent = `Your location (${nearbyFires.length} fires within 100km)`;
    }
    
    // Populate nearby fires list
    if (nearbyFires.length === 0) {
        nearbyList.innerHTML = `
            <div class="no-fires">
                <div class="no-fires-icon">✅</div>
                <div class="no-fires-text">No fires within 100km of your location</div>
                <div class="no-fires-subtext">You're in a relatively safe area</div>
            </div>
        `;
    } else {
        nearbyList.innerHTML = nearbyFires.slice(0, 15).map((fire, index) => {
            const intensity = determineFireIntensity(fire);
            const statusColor = FIRE_INTENSITY[intensity].color;
            const urgencyLevel = getFireUrgencyLevel(fire.distance, intensity);
            
            return `
                <div class="nearby-fire-item ${urgencyLevel}" 
                     onclick="focusOnFire(${fire.latitude}, ${fire.longitude})" 
                     role="button" 
                     tabindex="0"
                     data-distance="${fire.distance}"
                     data-intensity="${intensity}">
                    <div class="fire-header">
                        <span class="fire-badge" style="background-color: ${statusColor}">
                            ${getFireEmoji(fire, intensity)} Fire #${index + 1}
                        </span>
                        <span class="fire-distance ${getDistanceClass(fire.distance)}">
                            ${fire.distance.toFixed(1)}km away
                        </span>
                    </div>
                    <div class="fire-details">
                        <div class="fire-detail">
                            <span class="detail-label">Confidence:</span>
                            <span class="detail-value">${fire.confidence}%</span>
                        </div>
                        <div class="fire-detail">
                            <span class="detail-label">Power:</span>
                            <span class="detail-value">${parseFloat(fire.frp || 0).toFixed(1)}MW</span>
                        </div>
                        <div class="fire-detail">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value ${intensity.toLowerCase()}">${intensity}</span>
                        </div>
                    </div>
                    ${urgencyLevel === 'urgent' ? '<div class="urgency-indicator">⚠️ Close to your location</div>' : ''}
                </div>
            `;
        }).join('');
    }
    
    // Show panel
    nearbyPanel.style.display = 'block';
    nearbyPanel.setAttribute('aria-hidden', 'false');
    
    // Focus map on user and nearby fires
    if (nearbyFires.length > 0) {
        const bounds = L.latLngBounds([
            [userLocation.lat, userLocation.lng],
            ...nearbyFires.slice(0, 10).map(fire => [fire.latitude, fire.longitude])
        ]);
        map.fitBounds(bounds, { padding: [20, 20], maxZoom: 12 });
    } else {
        map.setView([userLocation.lat, userLocation.lng], 10);
    }
    
    announceToScreenReader(`Showing ${nearbyFires.length} fires near your location`);
}

async function updateNearbyFiresCache() {
    if (!userLocation || fireData.length === 0) return;
    
    nearbyFiresCache = fireData.map(fire => ({
        ...fire,
        distance: calculateDistance(
            userLocation.lat, userLocation.lng,
            fire.latitude, fire.longitude
        )
    })).sort((a, b) => a.distance - b.distance);
}

function getFireUrgencyLevel(distance, intensity) {
    if (distance < 25 && intensity === 'HIGH') return 'urgent';
    if (distance < 50 && intensity !== 'LOW') return 'warning';
    return 'normal';
}

function getDistanceClass(distance) {
    if (distance < 25) return 'very-close';
    if (distance < 50) return 'close';
    if (distance < 100) return 'moderate';
    return 'far';
}

function closeNearbyPanel() {
    const nearbyPanel = document.getElementById('nearbyPanel');
    if (nearbyPanel) {
        nearbyPanel.style.display = 'none';
        nearbyPanel.setAttribute('aria-hidden', 'true');
    }
}

// === Core User Functions ===
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

// === Navigation Functions ===
function toggleNavMenu() {
    const navMenu = document.getElementById('navMenu');
    const navMenuBtn = document.getElementById('navMenuBtn');
    const isOpen = navMenuBtn.getAttribute('aria-expanded') === 'true';
    
    navMenuBtn.setAttribute('aria-expanded', !isOpen);
    navMenu.classList.toggle('active', !isOpen);
    navMenu.setAttribute('aria-hidden', isOpen);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = !isOpen ? 'hidden' : '';
}

function closeNavMenu() {
    const navMenu = document.getElementById('navMenu');
    const navMenuBtn = document.getElementById('navMenuBtn');
    
    navMenuBtn.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('active');
    navMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// === Utility Functions ===
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

function determineFireIntensity(fire) {
    const frp = parseFloat(fire.frp) || 0;
    const confidence = parseInt(fire.confidence) || 0;
    
    if (frp >= FIRE_INTENSITY.HIGH.frp || confidence >= FIRE_INTENSITY.HIGH.confidence) {
        return 'HIGH';
    } else if (frp >= FIRE_INTENSITY.MEDIUM.frp || confidence >= FIRE_INTENSITY.MEDIUM.confidence) {
        return 'MEDIUM';
    } else {
        return 'LOW';
    }
}

function clearFireMarkers() {
    fireMarkers.forEach(marker => {
        map.removeLayer(marker);
    });
    fireMarkers = [];
}

function updateFireCount(count) {
    const element = document.getElementById('fireCount');
    if (element) {
        element.textContent = count;
        element.setAttribute('aria-live', 'polite');
        
        // Add visual emphasis for high numbers
        if (parseInt(count) > 100) {
            element.style.color = EMERGENCY_COLORS.DANGER;
        } else if (parseInt(count) > 50) {
            element.style.color = EMERGENCY_COLORS.WARNING;
        } else {
            element.style.color = EMERGENCY_COLORS.CAUTION;
        }
    }
}

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

async function showUserLocationOnMap() {
    if (!userLocation) return;
    
    // Remove existing user location marker
    if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
    }
    
    // Create enhanced user location marker
    const userIcon = L.divIcon({
        html: '<div class="user-location-marker"></div>',
        className: 'user-location-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
    
    userLocationMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`
            <div class="user-popup">
                <h3>📍 Your Location</h3>
                <p><strong>Coordinates:</strong> ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</p>
                <p><strong>Accuracy:</strong> ±${userLocation.accuracy.toFixed(0)}m</p>
            </div>
        `);
    
    // Center map on user location
    map.setView([userLocation.lat, userLocation.lng], 10);
}

function updateUserLocationMarker() {
    if (userLocationMarker && userLocation) {
        userLocationMarker.setLatLng([userLocation.lat, userLocation.lng]);
    }
}

// === Enhanced Error Handling and Recovery ===
async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
            
            if (i === maxRetries - 1) throw new Error(`HTTP ${response.status}`);
            
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
}

async function loadCachedFireData() {
    try {
        const cached = localStorage.getItem('eyeonthefire_cached_fires');
        if (cached) {
            const data = JSON.parse(cached);
            const age = Date.now() - data.timestamp;
            
            // Use cached data if less than 1 hour old
            if (age < 60 * 60 * 1000) {
                console.log('Loading cached fire data');
                fireData = data.fires;
                updateFireCount(fireData.length.toString());
                await addFireMarkersEnhanced();
                announceToScreenReader('Showing cached fire data due to connection issues');
                return true;
            }
        }
    } catch (e) {
        console.warn('Could not load cached fire data');
    }
    return false;
}

function cacheFireData() {
    try {
        localStorage.setItem('eyeonthefire_cached_fires', JSON.stringify({
            fires: fireData.slice(0, 100), // Cache first 100 fires
            timestamp: Date.now(),
            region: currentRegion
        }));
    } catch (e) {
        console.warn('Could not cache fire data');
    }
}

function attemptGracefulDegradation() {
    console.log('Attempting graceful degradation...');
    
    // Hide loading screen
    hideLoadingScreen();
    
    // Show basic map
    try {
        if (!map) {
            initializeMap();
        }
    } catch (error) {
        console.error('Could not initialize basic map');
    }
    
    // Show fallback message
    showErrorAlert('Some features may be limited due to connectivity issues. Basic functionality is available.');
}

function showErrorAlert(message) {
    const alertElement = document.getElementById('emergency-alert');
    const alertMessage = document.getElementById('alert-message');
    
    if (alertElement && alertMessage) {
        alertMessage.textContent = message;
        alertElement.style.display = 'block';
        alertElement.setAttribute('aria-hidden', 'false');
    }
}

// === Storage and Preferences ===
function saveLocationPreference(enabled) {
    try {
        localStorage.setItem('eyeonthefire_location_enabled', enabled.toString());
    } catch (e) {
        console.warn('Could not save location preference');
    }
}

function saveLastLocation(location) {
    try {
        localStorage.setItem('eyeonthefire_last_location', JSON.stringify({
            lat: location.lat,
            lng: location.lng,
            timestamp: location.timestamp || Date.now()
        }));
    } catch (e) {
        console.warn('Could not save last location');
    }
}

function loadSavedPlaces() {
    try {
        const places = localStorage.getItem('eyeonthefire_saved_places');
        savedPlaces = places ? JSON.parse(places) : [];
    } catch (e) {
        console.warn('Could not load saved places');
        savedPlaces = [];
    }
}

async function checkLocationPreference() {
    const savedPref = localStorage.getItem('eyeonthefire_location_enabled');
    const savedLocation = localStorage.getItem('eyeonthefire_last_location');
    
    if (savedPref === 'true' && savedLocation) {
        try {
            const location = JSON.parse(savedLocation);
            const age = Date.now() - (location.timestamp || 0);
            
            // Use saved location if less than 24 hours old
            if (age < 24 * 60 * 60 * 1000) {
                console.log('Using saved location from previous session');
                userLocation = location;
                isLocationEnabled = true;
                
                await determineUserRegion();
                updateLocationButtonState(document.getElementById('locateMeBtn'), 'success');
                
                const nearbyBtn = document.getElementById('nearbyBtn');
                if (nearbyBtn) nearbyBtn.style.display = 'flex';
                
                return true;
            }
        } catch (e) {
            console.warn('Could not parse saved location');
        }
    }
    
    return false;
}

// === Event Listeners ===
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

function handleMapClick(event) {
    // Handle map clicks for future features
    console.log('Map clicked at:', event.latlng);
}

// === Performance and Analytics ===
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

// === Additional Utility Functions ===
async function loadFireLocationInfoEnhanced(fire) {
    // Enhanced location info loading for fire popups
    const locationElement = document.getElementById(`location-${fire.latitude}-${fire.longitude}`);
    if (!locationElement) return;
    
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${fire.latitude}&lon=${fire.longitude}&zoom=10&addressdetails=1`,
            { headers: { 'User-Agent': 'EyeOnTheFire/2.0 (https://eyeonthefire.com)' }}
        );
        
        const data = await response.json();
        
        if (data && data.display_name) {
            const address = data.display_name.split(',').slice(0, 3).join(', ');
            locationElement.innerHTML = `📍 Near: ${address}`;
        } else {
            locationElement.innerHTML = `📍 Remote location`;
        }
    } catch (error) {
        console.error('Error loading location info:', error);
        locationElement.innerHTML = `📍 Location details unavailable`;
    }
}

// === Global API for External Access ===
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
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&limit=1`,
                { headers: { 'User-Agent': 'EyeOnTheFire/2.0 (https://eyeonthefire.com)' }}
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
