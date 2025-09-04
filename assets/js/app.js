/**
 * Eye on the Fire - Professional Emergency Fire Tracking Platform
 * Enhanced with multi-state support and location services
 * Based on WatchDuty design principles and emergency service standards
 */

// === Global Variables and State ===
let map;
let fireMarkers = [];
let userLocationMarker;
let fireData = [];
let userLocation = null;
let isLoading = false;
let lastUpdateTime = null;
let userState = null;
let nearbyRadius = 100; // Default 100km radius

// Emergency color coding (OSHA/Emergency Service Standards)
const EMERGENCY_COLORS = {
    DANGER: '#dc2626',      // Active fires, immediate threat
    WARNING: '#ea580c',     // Fire activity, moderate threat  
    CAUTION: '#d97706',     // Low threat, monitoring
    SAFETY: '#16a34a',      // Contained, safe areas
    INFO: '#2563eb'         // Informational content
};

// Fire intensity thresholds
const FIRE_INTENSITY = {
    HIGH: { frp: 100, confidence: 85, color: EMERGENCY_COLORS.DANGER, size: 32 },
    MEDIUM: { frp: 50, confidence: 70, color: EMERGENCY_COLORS.WARNING, size: 24 },
    LOW: { frp: 0, confidence: 50, color: EMERGENCY_COLORS.CAUTION, size: 18 }
};

// State-specific fire data sources and map bounds
const STATE_CONFIG = {
    'California': {
        center: [36.7783, -119.4179],
        zoom: 6,
        bounds: [[32.5343, -124.4096], [42.0095, -114.1312]],
        apiRegion: 'california'
    },
    'Colorado': {
        center: [39.0598, -105.3111],
        zoom: 7,
        bounds: [[36.9924, -109.0489], [41.0032, -102.0517]],
        apiRegion: 'colorado'
    },
    'Oregon': {
        center: [44.5721, -120.5542],
        zoom: 7,
        bounds: [[41.9917, -124.7039], [46.2991, -116.463]],
        apiRegion: 'oregon'
    },
    'Washington': {
        center: [47.0379, -121.0187],
        zoom: 7,
        bounds: [[45.5442, -124.7837], [49.0024, -116.9161]],
        apiRegion: 'washington'
    },
    'Texas': {
        center: [31.0545, -97.5635],
        zoom: 6,
        bounds: [[25.8371, -106.6456], [36.5007, -93.5083]],
        apiRegion: 'texas'
    },
    'Arizona': {
        center: [33.7298, -111.4312],
        zoom: 7,
        bounds: [[31.3322, -114.8154], [37.0043, -109.0452]],
        apiRegion: 'arizona'
    },
    // Default for other states
    'default': {
        center: [39.8283, -98.5795], // Geographic center of US
        zoom: 5,
        bounds: [[24.396308, -125.0], [49.384358, -66.93457]],
        apiRegion: 'usa'
    }
};

// === Application Initialization ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Initializing Eye on the Fire application...');
    initializeApplication();
});

/**
 * Main application initialization
 */
async function initializeApplication() {
    try {
        // Show loading screen
        showLoadingScreen();
        
        // Initialize components in order
        await initializeMap();
        initializeNavigation();
        initializeEventListeners();
        
        // Detect user's state/location first
        await detectUserState();
        
        // Load initial fire data based on location
        await loadFireData();
        
        // Hide loading screen
        hideLoadingScreen();
        
        // Start auto-refresh
        startAutoRefresh();
        
        console.log('✅ Application initialized successfully');
        
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        showErrorAlert('Failed to initialize application. Please refresh the page.');
        hideLoadingScreen();
    }
}

// === State Detection and Geolocation ===
/**
 * Detect user's state and set appropriate map bounds
 */
async function detectUserState() {
    try {
        // First try to get precise location if user has granted permission
        const location = await getUserLocation(false); // Don't prompt, just check if available
        
        if (location) {
            const state = await getStateFromCoordinates(location.lat, location.lng);
            if (state) {
                userState = state;
                console.log(`User detected in: ${state}`);
                setupMapForState(state);
                return;
            }
        }
        
        // Fallback to IP-based location
        const ipLocation = await getLocationFromIP();
        if (ipLocation && ipLocation.region) {
            userState = ipLocation.region;
            console.log(`User detected in: ${ipLocation.region} (IP-based)`);
            setupMapForState(ipLocation.region);
            return;
        }
        
        // Default to national view
        console.log('Using default national view');
        userState = 'United States';
        setupMapForState('default');
        
    } catch (error) {
        console.error('State detection failed:', error);
        setupMapForState('default');
    }
}

/**
 * Get user's location (with or without prompting)
 */
async function getUserLocation(prompt = true) {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        const options = {
            enableHighAccuracy: true,
            timeout: prompt ? 10000 : 1000,
            maximumAge: 300000 // 5 minutes
        };
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                if (!prompt) {
                    resolve(null); // Don't reject if not prompting
                } else {
                    reject(error);
                }
            },
            options
        );
    });
}

/**
 * Get state from coordinates using reverse geocoding
 */
async function getStateFromCoordinates(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
            { 
                headers: { 
                    'User-Agent': 'EyeOnTheFire/2.0 (https://eyeonthefire.com)' 
                }
            }
        );
        
        const data = await response.json();
        if (data && data.address && data.address.state) {
            return data.address.state;
        }
        
        return null;
    } catch (error) {
        console.error('Reverse geocoding failed:', error);
        return null;
    }
}

/**
 * Get approximate location from IP address
 */
async function getLocationFromIP() {
    try {
        const response = await fetch('https://ipapi.co/json/', {
            timeout: 5000
        });
        
        if (response.ok) {
            const data = await response.json();
            return {
                lat: data.latitude,
                lng: data.longitude,
                region: data.region,
                country: data.country_name
            };
        }
        
        return null;
    } catch (error) {
        console.warn('IP location detection failed:', error);
        return null;
    }
}

/**
 * Setup map for specific state or region
 */
function setupMapForState(state) {
    const config = STATE_CONFIG[state] || STATE_CONFIG.default;
    
    if (map) {
        map.setView(config.center, config.zoom);
        
        // Set max bounds to keep focus on region
        if (config.bounds) {
            map.setMaxBounds(config.bounds);
        }
    }
    
    // Update UI to reflect region
    updateRegionDisplay(state);
}

/**
 * Update UI to show current monitoring region
 */
function updateRegionDisplay(state) {
    const displayState = state === 'default' ? 'United States' : state;
    
    // Update any region indicators in the UI
    const regionElements = document.querySelectorAll('.region-display');
    regionElements.forEach(el => {
        el.textContent = `Monitoring: ${displayState}`;
    });
}

// === Enhanced Location Services ===
/**
 * Find user location with enhanced feedback
 */
async function findUserLocation() {
    const button = document.getElementById('locateMeBtn');
    if (!button) return;
    
    const originalContent = button.innerHTML;
    button.innerHTML = '<span class="button-icon">🔍</span><span class="button-text">Locating...</span>';
    button.disabled = true;
    
    try {
        console.log('Requesting user location...');
        
        const location = await getUserLocation(true);
        userLocation = location;
        
        console.log('Location obtained:', location);
        
        // Detect state from new location
        const state = await getStateFromCoordinates(location.lat, location.lng);
        if (state && state !== userState) {
            userState = state;
            setupMapForState(state);
            
            // Reload fire data for new region
            await loadFireData();
        }
        
        // Add/update user location marker
        updateUserLocationMarker();
        
        // Show nearby fires
        await showNearbyFires();
        
        // Update button
        button.innerHTML = '<span class="button-icon">📍</span><span class="button-text">Located</span>';
        
        // Store permission granted
        localStorage.setItem('locationPermissionGranted', 'true');
        
        // Analytics
        if (window.gtag) {
            gtag('event', 'location_found', {
                event_category: 'User Engagement',
                event_label: state || 'unknown_state'
            });
        }
        
    } catch (error) {
        console.error('Geolocation error:', error);
        
        let errorMessage = 'Unable to determine your location.';
        if (error.code === 1) {
            errorMessage = 'Location access denied. Please enable location services and try again.';
        } else if (error.code === 2) {
            errorMessage = 'Location unavailable. Please try again.';
        } else if (error.code === 3) {
            errorMessage = 'Location request timed out. Please try again.';
        }
        
        showErrorAlert(errorMessage);
        button.innerHTML = originalContent;
        
        // Analytics
        if (window.gtag) {
            gtag('event', 'location_error', {
                event_category: 'User Engagement',
                event_label: error.code ? `error_${error.code}` : 'unknown_error'
            });
        }
        
    } finally {
        button.disabled = false;
        
        // Reset button after 3 seconds
        setTimeout(() => {
            if (button.textContent.includes('Located')) {
                button.innerHTML = originalContent;
            }
        }, 3000);
    }
}

// === Add Places Functionality ===
/**
 * Search for fires near a specific location/place
 */
async function searchLocation(placeName) {
    try {
        console.log('Searching location:', placeName);
        
        // Geocode the place name
        const coords = await geocodePlace(placeName);
        if (!coords) {
            showErrorAlert(`Could not find location: ${placeName}`);
            return;
        }
        
        // Center map on location
        map.setView([coords.lat, coords.lng], 10);
        
        // Add a temporary marker
        const searchMarker = L.marker([coords.lat, coords.lng], {
            icon: L.divIcon({
                html: '<div style="background: #2563eb; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">📍</div>',
                className: 'search-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(map);
        
        // Remove marker after 10 seconds
        setTimeout(() => {
            map.removeLayer(searchMarker);
        }, 10000);
        
        // Show fires near this location
        const firesNearPlace = fireData.map(fire => ({
            ...fire,
            distance: calculateDistance(
                coords.lat, coords.lng,
                parseFloat(fire.latitude), parseFloat(fire.longitude)
            )
        })).filter(fire => fire.distance <= nearbyRadius)
          .sort((a, b) => a.distance - b.distance);
        
        if (firesNearPlace.length === 0) {
            showInfoAlert(`No active fires found within ${nearbyRadius}km of ${placeName}`);
        } else {
            showInfoAlert(`Found ${firesNearPlace.length} fire(s) within ${nearbyRadius}km of ${placeName}`);
            
            // Highlight the nearby fires
            highlightNearbyFires(firesNearPlace.slice(0, 10));
        }
        
        // Analytics
        if (window.gtag) {
            gtag('event', 'location_searched', {
                event_category: 'User Engagement',
                event_label: 'place_search'
            });
        }
        
    } catch (error) {
        console.error('Location search failed:', error);
        showErrorAlert('Failed to search location. Please try again.');
    }
}

/**
 * Geocode a place name to coordinates
 */
async function geocodePlace(placeName) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&countrycodes=us&limit=1&addressdetails=1`,
            { 
                headers: { 
                    'User-Agent': 'EyeOnTheFire/2.0 (https://eyeonthefire.com)' 
                }
            }
        );
        
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                display_name: data[0].display_name
            };
        }
        
        return null;
    } catch (error) {
        console.error('Geocoding failed:', error);
        return null;
    }
}

/**
 * Highlight nearby fires on the map
 */
function highlightNearbyFires(fires) {
    // Remove previous highlights
    fireMarkers.forEach(marker => {
        const el = marker.getElement();
        if (el) el.style.filter = '';
    });
    
    // Highlight nearby fires
    fires.forEach(fire => {
        const marker = fireMarkers.find(m => {
            const pos = m.getLatLng();
            return Math.abs(pos.lat - parseFloat(fire.latitude)) < 0.001 && 
                   Math.abs(pos.lng - parseFloat(fire.longitude)) < 0.001;
        });
        
        if (marker) {
            const el = marker.getElement();
            if (el) {
                el.style.filter = 'drop-shadow(0 0 10px #2563eb) brightness(1.2)';
                el.style.transform += ' scale(1.1)';
            }
        }
    });
    
    // Fit map to show highlighted fires
    if (fires.length > 0) {
        const bounds = L.latLngBounds(
            fires.map(fire => [parseFloat(fire.latitude), parseFloat(fire.longitude)])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
    }
}

// === Enhanced Fire Data Management ===
async function loadFireData() {
    if (isLoading) return;
    
    isLoading = true;
    updateFireCount('Loading...');
    
    try {
        console.log('Loading fire data for region:', userState || 'default');
        
        // Determine API endpoint based on user's region
        const config = STATE_CONFIG[userState] || STATE_CONFIG.default;
        const apiUrl = `/api/nasa/firms?region=${config.apiRegion}&days=1`;
        
        const response = await fetch(apiUrl, {
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
        console.log(`Received fire data: ${csvText.substring(0, 200)}...`);
        
        // Check for no fires message
        if (csvText.startsWith('#')) {
            console.log('No active fires detected');
            fireData = [];
            updateFireCount('0');
            updateLastUpdateTime();
            clearFireMarkers();
            return;
        }
        
        // Parse CSV data
        fireData = parseFireCSV(csvText);
        console.log(`Parsed ${fireData.length} fire records`);
        
        // Filter fires for current region if specific state
        if (userState && userState !== 'United States' && userState !== 'default') {
            fireData = filterFiresForRegion(fireData, userState);
            console.log(`Filtered to ${fireData.length} fires for ${userState}`);
        }
        
        // Update UI
        updateFireCount(fireData.length.toString());
        updateLastUpdateTime();
        
        // Add fire markers to map
        await addFireMarkers();
        
    } catch (error) {
        console.error('Error loading fire data:', error);
        updateFireCount('Error');
        showErrorAlert('Failed to load fire data. Please try again.');
    } finally {
        isLoading = false;
    }
}

/**
 * Filter fires for specific region/state
 */
function filterFiresForRegion(fires, state) {
    const config = STATE_CONFIG[state];
    if (!config || !config.bounds) {
        return fires;
    }
    
    const [[minLat, minLng], [maxLat, maxLng]] = config.bounds;
    
    return fires.filter(fire => {
        const lat = parseFloat(fire.latitude);
        const lng = parseFloat(fire.longitude);
        
        return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    });
}

// === Map Initialization ===
async function initializeMap() {
    console.log('Initializing map...');
    
    try {
        // Get initial config (will be updated after state detection)
        const config = STATE_CONFIG.default;
        
        // Initialize Leaflet map
        map = L.map('map', {
            center: config.center,
            zoom: config.zoom,
            zoomControl: false,
            attributionControl: false,
            maxBounds: config.bounds,
            maxBoundsViscosity: 0.7
        });
        
        // Add tile layer with emergency-appropriate styling
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            className: 'map-tiles'
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
            prefix: false
        }).addTo(map);
        
        console.log('Map initialized successfully');
        
    } catch (error) {
        console.error('[Map Initialization]', error);
        throw new Error('Failed to initialize map');
    }
}

// === Navigation Management ===
function initializeNavigation() {
    // Navigation is handled in HTML inline scripts for immediate responsiveness
    console.log('Navigation initialized');
}

// === Event Listeners ===
function initializeEventListeners() {
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Handle online/offline events
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
}

function handleKeyboardNavigation(event) {
    // Implement keyboard shortcuts for emergency situations
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
                findUserLocation();
            }
            break;
        case 'Escape':
            // Close any open panels
            closeNearbyPanel();
            const dropdown = document.getElementById('navDropdownMenu');
            if (dropdown && dropdown.classList.contains('active')) {
                closeDropdown();
            }
            break;
    }
}

function handleOnlineStatus() {
    console.log('Connection restored');
    // Refresh data when back online
    if (fireData.length === 0) {
        loadFireData();
    }
}

function handleOfflineStatus() {
    console.log('Connection lost');
    showErrorAlert('Connection lost. Some features may be limited until connectivity is restored.');
}

// === Fire Data Parsing (Existing) ===
function parseFireCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const fires = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const fire = {};
        
        headers.forEach((header, index) => {
            fire[header] = values[index]?.trim() || '';
        });
        
        // Validate required fields
        if (fire.latitude && fire.longitude && !isNaN(fire.latitude) && !isNaN(fire.longitude)) {
            fires.push(fire);
        }
    }
    
    return fires;
}

// === Fire Marker Management (Enhanced) ===
async function addFireMarkers() {
    console.log(`Adding ${fireData.length} fire markers to map`);
    
    // Clear existing markers
    clearFireMarkers();
    
    for (const fire of fireData) {
        const marker = createFireMarker(fire);
        if (marker) {
            fireMarkers.push(marker);
        }
    }
}

function createFireMarker(fire) {
    const lat = parseFloat(fire.latitude);
    const lng = parseFloat(fire.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates for fire:', fire);
        return null;
    }
    
    const intensity = determineFireIntensity(fire);
    const icon = createFlameIcon(intensity);
    
    const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(createFirePopup(fire))
        .on('popupopen', () => loadFireLocationInfo(fire, lat, lng));
    
    return marker;
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

function createFlameIcon(intensity) {
    const config = FIRE_INTENSITY[intensity];
    
    return L.divIcon({
        html: `<div class="fire-marker" style="
            font-size: ${config.size}px; 
            color: ${config.color}; 
            text-shadow: 0 0 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${config.size}px;
            height: ${config.size}px;
        ">🔥</div>`,
        className: `flame-icon flame-${intensity.toLowerCase()}`,
        iconSize: [config.size, config.size],
        iconAnchor: [config.size/2, config.size],
        popupAnchor: [0, -config.size]
    });
}

function createFirePopup(fire) {
    const intensity = determineFireIntensity(fire);
    const confidence = parseInt(fire.confidence) || 0;
    const frp = parseFloat(fire.frp) || 0;
    const brightness = parseFloat(fire.brightness) || 0;
    
    // Emergency status determination
    let statusClass = 'status-info';
    let statusText = 'Monitoring';
    
    if (intensity === 'HIGH') {
        statusClass = 'status-danger';
        statusText = 'High Risk';
    } else if (intensity === 'MEDIUM') {
        statusClass = 'status-warning';
        statusText = 'Active';
    }
    
    return `
        <div class="fire-popup" role="dialog" aria-label="Fire details">
            <div class="popup-header">
                <h3>🔥 Wildfire Detection</h3>
                <span class="fire-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="fire-metrics">
                <div class="metric-group">
                    <div class="metric">
                        <span class="metric-label">Confidence</span>
                        <span class="metric-value">${confidence}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Fire Power</span>
                        <span class="metric-value">${frp.toFixed(1)} MW</span>
                    </div>
                </div>
                
                <div class="metric-group">
                    <div class="metric">
                        <span class="metric-label">Brightness</span>
                        <span class="metric-value">${brightness.toFixed(1)}K</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Satellite</span>
                        <span class="metric-value">${fire.satellite || 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <div class="detection-info">
                <div class="detection-time">
                    <strong>Detected:</strong> ${formatDetectionTime(fire.acq_date, fire.acq_time)}
                </div>
                <div class="coordinates">
                    <strong>Location:</strong> ${parseFloat(fire.latitude).toFixed(4)}, ${parseFloat(fire.longitude).toFixed(4)}
                </div>
            </div>
            
            <div class="location-info loading" id="location-${fire.latitude}-${fire.longitude}">
                📍 Loading location details...
            </div>
            
            <div class="popup-actions">
                <button class="popup-button" onclick="centerOnFire(${fire.latitude}, ${fire.longitude})">
                    🎯 Center on Fire
                </button>
            </div>
        </div>
    `;
}

// === Location Info Loading (Enhanced) ===
async function loadFireLocationInfo(fire, lat, lng) {
    const locationElement = document.getElementById(`location-${lat}-${lng}`);
    if (!locationElement) return;
    
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
            { headers: { 'User-Agent': 'EyeOnTheFire/2.0 (https://eyeonthefire.com)' }}
        );
        
        const data = await response.json();
        let locationText = '📍 Location details unavailable';
        
        if (data && data.address) {
            const addr = data.address;
            const parts = [];
            
            // Build location hierarchy
            if (addr.city) parts.push(addr.city);
            else if (addr.town) parts.push(addr.town);
            else if (addr.village) parts.push(addr.village);
            
            if (addr.county) parts.push(addr.county);
            if (addr.state) parts.push(addr.state);
            
            if (parts.length > 0) {
                locationText = `📍 Near ${parts.join(', ')}`;
            }
        }
        
        locationElement.textContent = locationText;
        locationElement.classList.remove('loading');
        
    } catch (error) {
        console.error('Error loading location info:', error);
        locationElement.textContent = '📍 Location lookup unavailable';
        locationElement.classList.remove('loading');
    }
}

// === User Location Marker Management ===
function updateUserLocationMarker() {
    if (!userLocation) return;
    
    // Remove existing marker
    if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
    }
    
    // Add new marker
    userLocationMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
            html: '<div class="user-location-marker"></div>',
            className: 'user-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        })
    }).addTo(map);
    
    userLocationMarker.bindPopup('📍 Your Location').openPopup();
}

// === Nearby Fires Display ===
async function showNearbyFires() {
    if (!userLocation || fireData.length === 0) return;
    
    // Calculate distances to all fires
    const firesWithDistance = fireData.map(fire => ({
        ...fire,
        distance: calculateDistance(
            userLocation.lat, userLocation.lng,
            parseFloat(fire.latitude), parseFloat(fire.longitude)
        )
    })).sort((a, b) => a.distance - b.distance);
    
    // Show nearby panel
    const nearbyPanel = document.getElementById('nearbyPanel');
    const nearbyList = document.getElementById('nearbyList');
    const userLocationText = document.getElementById('userLocationText');
    
    if (nearbyPanel && nearbyList) {
        const nearbyFires = firesWithDistance.filter(fire => fire.distance <= nearbyRadius);
        
        // Update user location text
        if (userLocationText) {
            const stateText = userState && userState !== 'default' ? ` in ${userState}` : '';
            userLocationText.textContent = `Your location${stateText} (${nearbyFires.length} fires within ${nearbyRadius}km)`;
        }
        
        // Populate nearby fires list
        if (nearbyFires.length === 0) {
            nearbyList.innerHTML = `<div class="no-fires">No fires within ${nearbyRadius}km of your location</div>`;
        } else {
            nearbyList.innerHTML = nearbyFires.slice(0, 10).map((fire, index) => {
                const intensity = determineFireIntensity(fire);
                const statusColor = FIRE_INTENSITY[intensity].color;
                
                return `
                    <div class="nearby-fire-item" onclick="focusOnFire(${fire.latitude}, ${fire.longitude})" role="button" tabindex="0">
                        <div class="fire-header">
                            <span class="fire-badge" style="background-color: ${statusColor}">Fire #${index + 1}</span>
                            <span class="fire-distance">${fire.distance.toFixed(1)}km away</span>
                        </div>
                        <div class="fire-details">
                            <span>Confidence: ${fire.confidence}%</span>
                            <span>Power: ${parseFloat(fire.frp || 0).toFixed(1)}MW</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        nearbyPanel.style.display = 'block';
        nearbyPanel.setAttribute('aria-hidden', 'false');
        
        // Focus map on user and nearby fires
        if (nearbyFires.length > 0) {
            const bounds = L.latLngBounds([
                [userLocation.lat, userLocation.lng],
                ...nearbyFires.slice(0, 5).map(fire => [fire.latitude, fire.longitude])
            ]);
            map.fitBounds(bounds, { padding: [20, 20] });
        } else {
            map.setView([userLocation.lat, userLocation.lng], 10);
        }
    }
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

// === UI Helper Functions ===
function updateFireCount(count) {
    const element = document.getElementById('fireCount');
    if (element) {
        element.textContent = count;
        element.setAttribute('aria-live', 'polite');
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

function formatDetectionTime(date, time) {
    if (!date || !time) return 'Unknown';
    
    try {
        // Parse time (HHMM format to HH:MM)
        const timeStr = time.toString().padStart(4, '0');
        const hours = timeStr.substring(0, 2);
        const minutes = timeStr.substring(2, 4);
        
        return `${date} at ${hours}:${minutes} UTC`;
    } catch (error) {
        return `${date} ${time}`;
    }
}

// === Action Functions ===
function refreshFireData() {
    console.log('Refreshing fire data...');
    loadFireData();
}

function showAllFires() {
    closeNearbyPanel();
    
    if (fireMarkers.length > 0) {
        const group = L.featureGroup(fireMarkers);
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
    } else {
        // Show appropriate view based on user's state
        const config = STATE_CONFIG[userState] || STATE_CONFIG.default;
        map.setView(config.center, config.zoom);
    }
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
    
    // Close nearby panel
    closeNearbyPanel();
}

function centerOnFire(lat, lng) {
    map.setView([lat, lng], 14);
}

function closeNearbyPanel() {
    const nearbyPanel = document.getElementById('nearbyPanel');
    if (nearbyPanel) {
        nearbyPanel.style.display = 'none';
        nearbyPanel.setAttribute('aria-hidden', 'true');
    }
}

function clearFireMarkers() {
    fireMarkers.forEach(marker => {
        map.removeLayer(marker);
    });
    fireMarkers = [];
}

// === Alert Management ===
function showErrorAlert(message) {
    const alert = document.getElementById('emergency-alert');
    const alertText = alert?.querySelector('.alert-text');
    
    if (alert && alertText) {
        alertText.textContent = message;
        alert.style.display = 'block';
        alert.setAttribute('aria-hidden', 'false');
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            closeEmergencyAlert();
        }, 10000);
    }
}

function showInfoAlert(message) {
    // Create a temporary info alert
    const infoAlert = document.createElement('div');
    infoAlert.className = 'info-alert';
    infoAlert.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #2563eb;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    infoAlert.textContent = message;
    
    document.body.appendChild(infoAlert);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (infoAlert.parentNode) {
            infoAlert.parentNode.removeChild(infoAlert);
        }
    }, 5000);
}

function closeEmergencyAlert() {
    const alert = document.getElementById('emergency-alert');
    if (alert) {
        alert.style.display = 'none';
        alert.setAttribute('aria-hidden', 'true');
    }
}

// === Auto-refresh Management ===
function startAutoRefresh() {
    // Refresh every 20 minutes (matching cache expiration)
    setInterval(() => {
        console.log('Auto-refreshing fire data...');
        loadFireData();
    }, 20 * 60 * 1000);
}

// === Loading Screen Management ===
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.setAttribute('aria-hidden', 'false');
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingScreen.setAttribute('aria-hidden', 'true');
        }, 300);
    }
}

// === Error Handling ===
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    if (window.gtag) {
        gtag('event', 'js_error', {
            event_category: 'Error',
            event_label: event.error ? event.error.message : 'Unknown error',
            non_interaction: true
        });
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    if (window.gtag) {
        gtag('event', 'promise_rejection', {
            event_category: 'Error',
            event_label: event.reason ? event.reason.toString() : 'Unknown rejection',
            non_interaction: true
        });
    }
});

// === Accessibility Enhancements ===
document.addEventListener('keydown', (event) => {
    // Skip to main content
    if (event.altKey && event.key === '1') {
        const map = document.getElementById('map');
        if (map) {
            map.focus();
            event.preventDefault();
        }
    }
});

// === Export Functions for Global Access ===
window.eyeOnTheFire = {
    refreshFireData,
    findUserLocation,
    showAllFires,
    focusOnFire,
    centerOnFire,
    closeNearbyPanel,
    closeEmergencyAlert,
    searchLocation,
    detectUserState,
    getUserLocation
};

console.log('🔥 Eye on the Fire JavaScript loaded successfully');
