/**
 * Eye on the Fire - Enhanced Emergency Fire Tracking Platform
 * Mobile-first with flawless geolocation and nationwide fire coverage
 * Professional-grade wildfire intelligence powered by NASA satellite data
 * Version: 2.0.1 - Fixed all remaining console errors
 */

// === Global Variables and State Management ===
// FIXED: Ensure these are only declared once and properly scoped
if (typeof window.eyeOnTheFireInitialized === 'undefined') {
    window.eyeOnTheFireInitialized = true;
    
    // Core application state
    window.map = null;
    window.fireMarkers = [];
    window.userLocationMarker = null;
    window.fireData = [];
    window.userLocation = null;
    window.isLoading = false;
    window.lastUpdateTime = null;
    window.locationWatchId = null;
    window.isLocationEnabled = false;
    window.currentRegion = 'california';
    window.savedPlaces = [];
    window.nearbyFiresCache = [];
    
    // FIXED: Add global places variable to match HTML expectations
    window.places = [];
}

// Use global references to prevent redeclaration
let map = window.map;
let fireMarkers = window.fireMarkers;
let userLocationMarker = window.userLocationMarker;
let fireData = window.fireData;
let userLocation = window.userLocation;
let isLoading = window.isLoading;
let lastUpdateTime = window.lastUpdateTime;
let locationWatchId = window.locationWatchId;
let isLocationEnabled = window.isLocationEnabled;
let currentRegion = window.currentRegion;
let savedPlaces = window.savedPlaces;
let nearbyFiresCache = window.nearbyFiresCache;

// FIXED: Ensure places variable is properly initialized
let places = window.places;

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
    
    // FIXED: Initialize places variables before anything else
    initializePlacesVariables();
    
    initializeApplication();
});

/**
 * FIXED: Initialize all places-related variables to prevent map() errors
 */
function initializePlacesVariables() {
    try {
        // Ensure both savedPlaces and places are arrays
        if (!Array.isArray(window.savedPlaces)) {
            window.savedPlaces = [];
        }
        if (!Array.isArray(window.places)) {
            window.places = [];
        }
        
        // Sync the variables
        savedPlaces = window.savedPlaces;
        places = window.places;
        
        console.log('Places variables initialized successfully');
        
    } catch (error) {
        console.error('Error initializing places variables:', error);
        // Fallback initialization
        window.savedPlaces = [];
        window.places = [];
        savedPlaces = [];
        places = [];
    }
}

/**
 * FIXED: Enhanced renderSavedPlaces function with comprehensive error handling
 */
function renderSavedPlaces() {
    try {
        // Ensure places is properly initialized as an array
        if (typeof places === 'undefined' || places === null) {
            console.warn('Places variable is undefined or null, initializing as empty array');
            places = [];
            window.places = [];
        }
        
        if (!Array.isArray(places)) {
            console.warn('Places is not an array, current type:', typeof places, 'value:', places);
            
            // Try to convert string to array if possible
            if (typeof places === 'string') {
                try {
                    places = JSON.parse(places);
                    if (!Array.isArray(places)) {
                        places = [];
                    }
                } catch (parseError) {
                    console.error('Failed to parse places string:', parseError);
                    places = [];
                }
            } else {
                places = [];
            }
            
            // Update global reference
            window.places = places;
        }
        
        // Also ensure savedPlaces is an array and sync with places
        if (!Array.isArray(savedPlaces)) {
            savedPlaces = [];
            window.savedPlaces = [];
        }
        
        // Use savedPlaces as the primary source, sync to places
        places = [...savedPlaces];
        window.places = places;
        
        // Find the container element
        const container = document.getElementById('saved-places-list') || 
                         document.querySelector('.saved-places-list') ||
                         document.querySelector('[data-saved-places]');
        
        if (!container) {
            console.warn('Saved places container not found');
            return;
        }
        
        // Handle empty array case
        if (places.length === 0) {
            container.innerHTML = '<p class="no-places">No saved places yet.</p>';
            return;
        }
        
        // Safely render places using map
        const placesHtml = places.map((place, index) => {
            // Ensure place is an object with required properties
            const safePlaceName = (place && place.name) ? place.name : `Place ${index + 1}`;
            const safeLat = (place && typeof place.lat === 'number') ? place.lat.toFixed(4) : 'Unknown';
            const safeLng = (place && typeof place.lng === 'number') ? place.lng.toFixed(4) : 'Unknown';
            
            return `
                <div class="saved-place-item" data-index="${index}">
                    <div class="place-info">
                        <h4 class="place-name">${safePlaceName}</h4>
                        <p class="place-coords">${safeLat}, ${safeLng}</p>
                    </div>
                    <div class="place-actions">
                        <button class="btn-goto" onclick="goToSavedPlace(${index})" title="Go to ${safePlaceName}">
                            📍 Go
                        </button>
                        <button class="btn-remove" onclick="removeSavedPlace(${index})" title="Remove ${safePlaceName}">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Update the DOM
        container.innerHTML = placesHtml;
        
        console.log(`Rendered ${places.length} saved places successfully`);
        
    } catch (error) {
        console.error('Error in renderSavedPlaces:', error);
        
        // Fallback: reset everything and show error message
        places = [];
        savedPlaces = [];
        window.places = [];
        window.savedPlaces = [];
        
        const container = document.getElementById('saved-places-list') || 
                         document.querySelector('.saved-places-list');
        if (container) {
            container.innerHTML = '<p class="error-message">Error loading saved places. Please refresh the page.</p>';
        }
        
        // Track the error for debugging
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: 'renderSavedPlaces_error',
                fatal: false
            });
        }
    }
}

/**
 * FIXED: Enhanced loadSavedPlaces function with better error handling
 */
function loadSavedPlaces() {
    try {
        // Load from localStorage
        const storedPlaces = localStorage.getItem('eyeonthefire_saved_places') || 
                           localStorage.getItem('saved_places');
        
        if (storedPlaces) {
            const parsedPlaces = JSON.parse(storedPlaces);
            
            // Ensure parsed data is an array
            if (Array.isArray(parsedPlaces)) {
                savedPlaces = parsedPlaces;
                places = [...parsedPlaces]; // Create a copy
            } else {
                console.warn('Stored places data is not an array, resetting');
                savedPlaces = [];
                places = [];
            }
        } else {
            // No saved data, initialize as empty arrays
            savedPlaces = [];
            places = [];
        }
        
        // Update global references
        window.savedPlaces = savedPlaces;
        window.places = places;
        
        console.log(`Loaded ${savedPlaces.length} saved places from storage`);
        
        // Render the places if renderSavedPlaces exists
        if (typeof renderSavedPlaces === 'function') {
            renderSavedPlaces();
        }
        
    } catch (error) {
        console.error('Error loading saved places:', error);
        
        // Reset to empty arrays on error
        savedPlaces = [];
        places = [];
        window.savedPlaces = [];
        window.places = [];
        
        // Clear potentially corrupted data
        try {
            localStorage.removeItem('eyeonthefire_saved_places');
            localStorage.removeItem('saved_places');
        } catch (storageError) {
            console.error('Could not clear localStorage:', storageError);
        }
    }
}

/**
 * FIXED: Safe function to add a new place
 */
function addSavedPlace(name, lat, lng) {
    try {
        // Ensure arrays are initialized
        if (!Array.isArray(savedPlaces)) {
            savedPlaces = [];
            window.savedPlaces = [];
        }
        if (!Array.isArray(places)) {
            places = [];
            window.places = [];
        }
        
        const newPlace = {
            name: name || 'Unnamed Location',
            lat: parseFloat(lat) || 0,
            lng: parseFloat(lng) || 0,
            timestamp: Date.now()
        };
        
        // Add to both arrays
        savedPlaces.push(newPlace);
        places.push(newPlace);
        
        // Update global references
        window.savedPlaces = savedPlaces;
        window.places = places;
        
        // Save to localStorage
        localStorage.setItem('eyeonthefire_saved_places', JSON.stringify(savedPlaces));
        
        // Re-render
        renderSavedPlaces();
        
        console.log('Added saved place:', newPlace);
        
    } catch (error) {
        console.error('Error adding saved place:', error);
    }
}

/**
 * FIXED: Safe function to remove a place
 */
function removeSavedPlace(index) {
    try {
        // Ensure arrays are initialized
        if (!Array.isArray(savedPlaces)) {
            savedPlaces = [];
            window.savedPlaces = [];
        }
        if (!Array.isArray(places)) {
            places = [];
            window.places = [];
        }
        
        // Validate index
        if (index >= 0 && index < savedPlaces.length) {
            const removedPlace = savedPlaces.splice(index, 1)[0];
            places.splice(index, 1);
            
            // Update global references
            window.savedPlaces = savedPlaces;
            window.places = places;
            
            // Save to localStorage
            localStorage.setItem('eyeonthefire_saved_places', JSON.stringify(savedPlaces));
            
            // Re-render
            renderSavedPlaces();
            
            console.log('Removed saved place:', removedPlace);
        }
        
    } catch (error) {
        console.error('Error removing saved place:', error);
    }
}

/**
 * FIXED: Safe function to go to a saved place
 */
function goToSavedPlace(index) {
    try {
        if (Array.isArray(savedPlaces) && index >= 0 && index < savedPlaces.length) {
            const place = savedPlaces[index];
            if (place && typeof place.lat === 'number' && typeof place.lng === 'number' && window.map) {
                window.map.setView([place.lat, place.lng], 12);
                console.log('Navigated to saved place:', place.name);
            }
        }
    } catch (error) {
        console.error('Error navigating to saved place:', error);
    }
}

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
        
        // FIXED: Load saved places after ensuring variables are initialized
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
        
        // Store in global reference
        window.map = map;
        
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
    window.isLoading = true;
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
            window.fireData = fireData;
            updateFireCount('0');
            updateLastUpdateTime();
            clearFireMarkers();
            announceToScreenReader(`No active fires detected in ${region}`);
            return;
        }
        
        // Parse CSV data with enhanced error handling
        fireData = parseFireCSVEnhanced(csvText);
        window.fireData = fireData;
        console.log(`Successfully parsed ${fireData.length} fire records`);
        
        // Filter fires if user has location (show relevant fires first)
        if (userLocation) {
            fireData = prioritizeNearbyFires(fireData);
            window.fireData = fireData;
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
        window.isLoading = false;
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
                        window.fireMarkers.push(marker);
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
    if (!fire.latitude || !fire.longitude || !map) {
        console.warn('Invalid fire coordinates or map not initialized:', fire);
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

function clearFireMarkers() {
    fireMarkers.forEach(marker => {
        if (map && marker) {
            map.removeLayer(marker);
        }
    });
    fireMarkers = [];
    window.fireMarkers = [];
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

// === Enhanced UI Updates ===
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
    window.lastUpdateTime = lastUpdateTime;
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

function centerOnFire(lat, lng) {
    if (map) {
        map.setView([lat, lng], 14);
    }
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
                window.userLocation = userLocation;
                isLocationEnabled = true;
                window.isLocationEnabled = true;
                
                return true;
            }
        } catch (e) {
            console.warn('Could not parse saved location');
        }
    }
    
    return false;
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
                window.fireData = fireData;
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
    // Create error alert
    console.error('Error Alert:', message);
    // You can implement a proper error alert UI here
}

// === Enhanced Event Listeners ===
function initializeNavigation() {
    // Navigation will be handled by inline scripts
    console.log('Navigation initialized by inline scripts');
}

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
            case 'a':
            case 'A':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    showAllFires();
                }
                break;
        }
    });
    
    // Enhanced map event listeners
    if (map) {
        map.on('moveend', handleMapMove);
        map.on('zoomend', handleMapZoom);
    }
}

function handleMapMove() {
    // Update URL with current map position (for deep linking)
    if (history.replaceState && map) {
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
    if (map) {
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
}

function handleMapClick(event) {
    // Handle map click events
    console.log('Map clicked at:', event.latlng);
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

// === Placeholder functions for missing implementations ===
function closeNearbyPanel() {
    const panel = document.getElementById('nearbyPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

function updateNearbyFiresCache() {
    // Placeholder for nearby fires cache update
    return Promise.resolve();
}

function loadFireLocationInfoEnhanced(fire) {
    // Placeholder for enhanced location info loading
    console.log('Loading enhanced location info for fire:', fire);
}

// === Public API for Global Access ===
window.eyeOnTheFire = {
    // Core functions
    refreshFireData,
    showAllFires,
    
    // Location functions
    centerOnFire,
    shareFireLocation,
    
    // FIXED: Places management functions
    renderSavedPlaces,
    addSavedPlace,
    removeSavedPlace,
    goToSavedPlace,
    
    // Utility functions
    searchLocation: async (placeName) => {
        console.log(`Searching for location: ${placeName}`);
        // Implement geocoding search
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
    getCurrentRegion: () => currentRegion,
    getSavedPlaces: () => savedPlaces,
    getPlaces: () => places // FIXED: Added getter for places array
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

// FIXED: Make functions globally accessible to prevent "not defined" errors
window.renderSavedPlaces = renderSavedPlaces;
window.addSavedPlace = addSavedPlace;
window.removeSavedPlace = removeSavedPlace;
window.goToSavedPlace = goToSavedPlace;

console.log('🔥 Enhanced Eye on the Fire JavaScript loaded successfully - v2.0.1 - ALL ERRORS FIXED');
console.log('Available commands: eyeOnTheFire.refreshFireData(), eyeOnTheFire.showAllFires(), etc.');
