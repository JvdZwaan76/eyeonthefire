/**
 * Eye on the Fire - Production Optimized v3.0
 * Integrated with Cloudflare Worker API
 * Ultra-fast loading, unified fire icons, enhanced location features
 */

// === Performance-First Global State ===
if (!window.eyeOnTheFireInitialized) {
    window.eyeOnTheFireInitialized = true;
    
    // Core state - minimal for performance
    window.appState = {
        map: null,
        fireMarkers: [],
        fireData: [],
        userLocation: null,
        isLoading: false,
        isLocationEnabled: false,
        currentRegion: 'california',
        places: [],
        lastUpdate: null
    };
}

const state = window.appState;

// === Optimized Fire Configuration ===
const FIRE_CONFIG = {
    HIGH: { minFrp: 100, minConf: 85, icon: '🔥', size: 28, color: '#dc2626' },
    MEDIUM: { minFrp: 50, minConf: 70, icon: '🔥', size: 22, color: '#ea580c' },
    LOW: { minFrp: 0, minConf: 50, icon: '🔥', size: 16, color: '#f59e0b' }
};

// === Fast Initialization ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔥 Initializing optimized Eye on the Fire...');
    
    try {
        // Parallel initialization for speed
        await Promise.all([
            initializeMap(),
            initializeLocation(),
            loadPlaces()
        ]);
        
        // Load fire data after core setup
        await loadFireData();
        
        // Setup auto-refresh
        setupAutoRefresh();
        
        console.log('✅ Application ready');
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showError('Application failed to load. Please refresh.');
    }
});

// === Ultra-Fast Map Setup ===
async function initializeMap() {
    const container = document.getElementById('map');
    if (!container) throw new Error('Map container not found');
    
    // Use saved location or default center
    const center = getSavedLocation() || [39.8283, -98.5795];
    const zoom = getSavedLocation() ? 8 : 4;
    
    state.map = L.map('map', {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true, // Performance boost
        maxZoom: 18,
        minZoom: 4
    });
    
    // Single tile layer for speed
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        keepBuffer: 4 // Reduce tile requests
    }).addTo(state.map);
    
    // Minimal controls
    L.control.zoom({ position: 'bottomright' }).addTo(state.map);
    
    console.log('Map initialized');
}

// === Enhanced Location System ===
async function initializeLocation() {
    // Check for saved preference
    const savedEnabled = localStorage.getItem('location_enabled');
    if (savedEnabled === 'true') {
        await requestLocation(false); // Silent request for returning users
    }
    
    // Setup location button
    const locationBtn = document.getElementById('locationBtn');
    if (locationBtn) {
        locationBtn.addEventListener('click', () => requestLocation(true));
    }
}

async function requestLocation(showPrompt = true) {
    if (!navigator.geolocation) {
        if (showPrompt) showError('Location not supported on this device');
        return;
    }
    
    if (showPrompt) showLoading('Getting your location...');
    
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes cache
            });
        });
        
        const { latitude: lat, longitude: lng } = position.coords;
        
        // Save location and preference
        state.userLocation = { lat, lng, timestamp: Date.now() };
        state.isLocationEnabled = true;
        localStorage.setItem('user_location', JSON.stringify(state.userLocation));
        localStorage.setItem('location_enabled', 'true');
        
        // Add user marker
        addUserMarker(lat, lng);
        
        // Zoom to 50-mile radius (approximately zoom level 9)
        state.map.setView([lat, lng], 9);
        
        // Get location name
        await getLocationName(lat, lng);
        
        // Reload fire data for this area
        await loadFireData();
        
        if (showPrompt) {
            hideLoading();
            showSuccess('Location found! Showing fires within 50 miles.');
        }
        
        trackEvent('location_enabled');
        
    } catch (error) {
        console.error('Location error:', error);
        
        if (showPrompt) {
            hideLoading();
            const message = error.code === 1 ? 
                'Location access denied. You can still view fires manually.' :
                'Could not get your location. Please try again.';
            showError(message);
        }
    }
}

function addUserMarker(lat, lng) {
    // Remove existing user marker
    if (state.userLocationMarker) {
        state.map.removeLayer(state.userLocationMarker);
    }
    
    // Create pulsing user location marker
    const userIcon = L.divIcon({
        html: `<div class="user-marker">
            <div class="user-pulse"></div>
            <div class="user-dot">📍</div>
        </div>`,
        className: 'user-location-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    state.userLocationMarker = L.marker([lat, lng], { icon: userIcon })
        .addTo(state.map)
        .bindPopup('Your Location')
        .openPopup();
}

async function getLocationName(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
            { headers: { 'User-Agent': 'EyeOnTheFire/3.0' } }
        );
        const data = await response.json();
        
        if (data.display_name) {
            const locationName = data.display_name.split(',').slice(0, 3).join(', ');
            updateLocationDisplay(locationName);
        }
    } catch (error) {
        console.warn('Could not get location name:', error);
    }
}

// === Optimized Fire Data Loading with Cloudflare Worker ===
async function loadFireData() {
    if (state.isLoading) return;
    
    state.isLoading = true;
    updateStatus('Loading fires...');
    
    try {
        console.log('Loading fire data from Cloudflare Worker...');
        
        // Use your existing Cloudflare Worker API
        const response = await fetch('/api/nasa/firms?source=VIIRS_NOAA20_NRT&days=3', {
            headers: { 
                'Accept': 'text/csv',
                'User-Agent': 'EyeOnTheFire/3.0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const csvText = await response.text();
        console.log(`Received ${csvText.length} characters of fire data from worker`);
        
        // Check if we got actual fire data or error message
        if (csvText.includes('Error fetching fire data') || csvText.includes('No active fires detected')) {
            console.log('Worker returned no fires or error - this may be accurate');
            state.fireData = [];
        } else {
            // Parse CSV data from your worker
            state.fireData = parseWorkerFireCSV(csvText);
        }
        
        // Filter by user location if available
        if (state.userLocation) {
            state.fireData = filterNearbyFires(state.fireData);
        }
        
        // Add markers efficiently
        await addFireMarkers();
        
        updateStatus(`${state.fireData.length} active fires`);
        updateLastUpdate();
        
        // Log success
        console.log(`Successfully loaded ${state.fireData.length} fires from Cloudflare Worker`);
        
    } catch (error) {
        console.error('Fire data error:', error);
        updateStatus('Error loading fires');
        showError('Failed to load fire data. Please check your connection and try again.');
        
        // Don't use demo data - let the worker handle fallbacks
        state.fireData = [];
        await addFireMarkers();
    } finally {
        state.isLoading = false;
    }
}

// === Parse CSV from Your Cloudflare Worker ===
function parseWorkerFireCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const fires = [];
    
    for (let i = 1; i < lines.length; i++) {
        try {
            const values = lines[i].split(',');
            const fire = {};
            
            headers.forEach((header, index) => {
                fire[header] = values[index]?.trim() || '';
            });
            
            // Validate coordinates
            const lat = parseFloat(fire.latitude);
            const lng = parseFloat(fire.longitude);
            
            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                fires.push({
                    latitude: lat,
                    longitude: lng,
                    confidence: Math.max(0, Math.min(100, parseInt(fire.confidence) || 0)),
                    frp: Math.max(0, parseFloat(fire.frp) || 0),
                    brightness: parseFloat(fire.brightness || fire.bright_t31) || 0,
                    satellite: fire.satellite || 'NASA',
                    acq_date: fire.acq_date || new Date().toISOString().split('T')[0],
                    acq_time: fire.acq_time || '0000',
                    daynight: fire.daynight || 'D',
                    type: parseInt(fire.type) || 0
                });
            }
        } catch (error) {
            console.warn(`Error parsing fire data line ${i}:`, error);
        }
    }
    
    return fires;
}

// === Unified Fire Marker System ===
async function addFireMarkers() {
    // Clear existing markers efficiently
    state.fireMarkers.forEach(marker => state.map.removeLayer(marker));
    state.fireMarkers = [];
    
    if (state.fireData.length === 0) return;
    
    // Batch process for performance
    const batchSize = 50;
    for (let i = 0; i < state.fireData.length; i += batchSize) {
        const batch = state.fireData.slice(i, i + batchSize);
        
        // Process batch
        batch.forEach(fire => {
            const marker = createFireMarker(fire);
            if (marker) {
                state.fireMarkers.push(marker);
            }
        });
        
        // Yield control to prevent blocking
        if (i + batchSize < state.fireData.length) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
    
    console.log(`Added ${state.fireMarkers.length} fire markers`);
}

function createFireMarker(fire) {
    const intensity = getFireIntensity(fire);
    const config = FIRE_CONFIG[intensity];
    
    // Calculate distance for context
    let distance = null;
    if (state.userLocation) {
        distance = calculateDistance(
            state.userLocation.lat, state.userLocation.lng,
            fire.latitude, fire.longitude
        );
    }
    
    // Create unified fire icon
    const icon = L.divIcon({
        html: `<div class="fire-icon fire-${intensity.toLowerCase()}" style="
            font-size: ${config.size}px;
            color: ${config.color};
            filter: drop-shadow(0 0 4px rgba(0,0,0,0.5));
            transition: transform 0.2s ease;
        ">${config.icon}</div>`,
        className: 'unified-fire-marker',
        iconSize: [config.size, config.size],
        iconAnchor: [config.size/2, config.size],
        popupAnchor: [0, -config.size]
    });
    
    const marker = L.marker([fire.latitude, fire.longitude], { icon })
        .addTo(state.map)
        .bindPopup(() => createFirePopup(fire, intensity, distance), {
            maxWidth: 300,
            className: 'fire-popup-container'
        });
    
    // Add hover effects
    marker.on('mouseover', function() {
        this.getElement().style.transform = 'scale(1.2)';
        this.getElement().style.zIndex = '1000';
    });
    
    marker.on('mouseout', function() {
        this.getElement().style.transform = 'scale(1)';
        this.getElement().style.zIndex = '400';
    });
    
    return marker;
}

function createFirePopup(fire, intensity, distance) {
    const confidence = fire.confidence || 0;
    const frp = fire.frp || 0;
    const brightness = fire.brightness || 0;
    
    // Status based on intensity and confidence
    let status = 'Monitoring';
    let statusClass = 'status-info';
    
    if (intensity === 'HIGH' || confidence > 85) {
        status = 'High Risk';
        statusClass = 'status-danger';
    } else if (intensity === 'MEDIUM' || confidence > 70) {
        status = 'Active Fire';
        statusClass = 'status-warning';
    } else if (confidence > 50) {
        status = 'Confirmed';
        statusClass = 'status-caution';
    }
    
    // Distance info
    const distanceText = distance ? 
        `<div class="popup-distance">${distance.toFixed(1)} km from you</div>` : '';
    
    // Exact coordinates
    const exactLat = fire.latitude.toFixed(6);
    const exactLng = fire.longitude.toFixed(6);
    
    // Detection time
    const detectionTime = formatDetectionTime(fire.acq_date, fire.acq_time);
    
    return `
        <div class="fire-popup-content">
            <div class="popup-header">
                <div class="popup-title">🔥 Wildfire Detection</div>
                <div class="popup-status ${statusClass}">${status}</div>
            </div>
            
            ${distanceText}
            
            <div class="popup-metrics">
                <div class="metric">
                    <span class="metric-label">Confidence</span>
                    <span class="metric-value confidence-${getConfidenceClass(confidence)}">${confidence}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Fire Power</span>
                    <span class="metric-value">${frp.toFixed(1)} MW</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Brightness</span>
                    <span class="metric-value">${brightness.toFixed(1)}K</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Satellite</span>
                    <span class="metric-value">${fire.satellite || 'NASA'}</span>
                </div>
            </div>
            
            <div class="popup-location">
                <div class="location-title">📍 Exact Location</div>
                <div class="coordinates">${exactLat}, ${exactLng}</div>
                <div class="coordinates-copy" onclick="copyCoordinates('${exactLat}, ${exactLng}')">
                    📋 Copy Coordinates
                </div>
            </div>
            
            <div class="popup-detection">
                <div class="detection-label">Detected</div>
                <div class="detection-time">${detectionTime}</div>
            </div>
            
            <div class="popup-actions">
                <button class="action-btn primary" onclick="centerOnFire(${fire.latitude}, ${fire.longitude})">
                    🎯 Center View
                </button>
                <button class="action-btn secondary" onclick="shareFireLocation(${fire.latitude}, ${fire.longitude})">
                    📱 Share
                </button>
                <button class="action-btn tertiary" onclick="getDirections(${fire.latitude}, ${fire.longitude})">
                    🧭 Directions
                </button>
            </div>
        </div>
    `;
}

// === Helper Functions ===
function getFireIntensity(fire) {
    const frp = parseFloat(fire.frp) || 0;
    const confidence = parseInt(fire.confidence) || 0;
    
    if (frp >= FIRE_CONFIG.HIGH.minFrp || confidence >= FIRE_CONFIG.HIGH.minConf) {
        return 'HIGH';
    } else if (frp >= FIRE_CONFIG.MEDIUM.minFrp || confidence >= FIRE_CONFIG.MEDIUM.minConf) {
        return 'MEDIUM';
    }
    return 'LOW';
}

function getConfidenceClass(confidence) {
    if (confidence >= 80) return 'high';
    if (confidence >= 60) return 'medium';
    return 'low';
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function filterNearbyFires(fires) {
    if (!state.userLocation) return fires;
    
    return fires.filter(fire => {
        const distance = calculateDistance(
            state.userLocation.lat, state.userLocation.lng,
            fire.latitude, fire.longitude
        );
        return distance <= 80; // 50 miles ≈ 80 km
    }).sort((a, b) => {
        // Sort by distance and intensity
        const distA = calculateDistance(state.userLocation.lat, state.userLocation.lng, a.latitude, a.longitude);
        const distB = calculateDistance(state.userLocation.lat, state.userLocation.lng, b.latitude, b.longitude);
        const intensityA = getFireIntensity(a);
        const intensityB = getFireIntensity(b);
        
        // High intensity fires first
        if (intensityA === 'HIGH' && intensityB !== 'HIGH') return -1;
        if (intensityB === 'HIGH' && intensityA !== 'HIGH') return 1;
        
        // Then by distance
        return distA - distB;
    });
}

// === Action Functions ===
function centerOnFire(lat, lng) {
    state.map.setView([lat, lng], 14);
    trackEvent('center_on_fire');
}

function shareFireLocation(lat, lng) {
    const url = `${window.location.origin}?lat=${lat}&lng=${lng}&zoom=12`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Active Wildfire - Eye on the Fire',
            text: `Wildfire detected at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            url: url
        }).catch(console.error);
    } else {
        copyToClipboard(url);
        showSuccess('Fire location link copied to clipboard');
    }
    
    trackEvent('share_fire');
}

function copyCoordinates(coords) {
    copyToClipboard(coords);
    showSuccess('Coordinates copied to clipboard');
    trackEvent('copy_coordinates');
}

function getDirections(lat, lng) {
    const mapsUrl = `https://maps.google.com/maps?daddr=${lat},${lng}`;
    window.open(mapsUrl, '_blank');
    trackEvent('get_directions');
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

// === UI Functions ===
function updateStatus(message) {
    const statusEl = document.getElementById('fireCount');
    if (statusEl) statusEl.textContent = message;
}

function updateLastUpdate() {
    state.lastUpdate = new Date();
    const updateEl = document.getElementById('lastUpdate');
    if (updateEl) {
        updateEl.textContent = `Updated: ${state.lastUpdate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })}`;
    }
}

function updateLocationDisplay(locationName) {
    const locationEl = document.getElementById('currentLocation');
    if (locationEl) {
        locationEl.textContent = locationName;
        locationEl.style.display = 'block';
    }
}

function showLoading(message = 'Loading...') {
    const loadingEl = document.getElementById('loadingMessage');
    if (loadingEl) {
        loadingEl.textContent = message;
        loadingEl.style.display = 'block';
    }
}

function hideLoading() {
    const loadingEl = document.getElementById('loadingMessage');
    if (loadingEl) loadingEl.style.display = 'none';
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: ${type === 'error' ? '#dc2626' : type === 'success' ? '#16a34a' : '#2563eb'};
        color: white; padding: 12px 16px; border-radius: 8px;
        font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// === Utility Functions ===
function formatDetectionTime(date, time) {
    if (!date || !time) return 'Unknown';
    
    try {
        const timeStr = time.toString().padStart(4, '0');
        const hours = timeStr.substring(0, 2);
        const minutes = timeStr.substring(2, 4);
        
        const detectionDate = new Date(`${date}T${hours}:${minutes}:00Z`);
        const now = new Date();
        const diffHours = (now - detectionDate) / (1000 * 60 * 60);
        
        if (diffHours < 1) return 'Less than 1 hour ago';
        if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
    } catch (error) {
        return `${date} ${time}`;
    }
}

function getSavedLocation() {
    try {
        const saved = localStorage.getItem('user_location');
        if (saved) {
            const location = JSON.parse(saved);
            const age = Date.now() - (location.timestamp || 0);
            // Use saved location if less than 24 hours old
            if (age < 24 * 60 * 60 * 1000) {
                return [location.lat, location.lng];
            }
        }
    } catch (error) {
        console.warn('Could not load saved location:', error);
    }
    return null;
}

// === Places Management ===
function loadPlaces() {
    try {
        const saved = localStorage.getItem('saved_places');
        state.places = saved ? JSON.parse(saved) : [];
        if (window.renderSavedPlaces) window.renderSavedPlaces();
    } catch (error) {
        console.warn('Could not load places:', error);
        state.places = [];
    }
}

function renderSavedPlaces() {
    const container = document.getElementById('saved-places-list');
    if (!container || !Array.isArray(state.places)) return;
    
    if (state.places.length === 0) {
        container.innerHTML = '<p class="no-places">No saved places yet.</p>';
        return;
    }
    
    container.innerHTML = state.places.map((place, index) => `
        <div class="saved-place-item">
            <div class="place-info">
                <h4>${place.name || `Place ${index + 1}`}</h4>
                <p>${place.lat?.toFixed(4) || 'Unknown'}, ${place.lng?.toFixed(4) || 'Unknown'}</p>
            </div>
            <div class="place-actions">
                <button onclick="goToPlace(${index})">📍</button>
                <button onclick="removePlace(${index})">🗑️</button>
            </div>
        </div>
    `).join('');
}

// === Auto-refresh ===
function setupAutoRefresh() {
    // Refresh every 15 minutes when page is visible
    setInterval(() => {
        if (!document.hidden && !state.isLoading) {
            console.log('Auto-refreshing fire data...');
            loadFireData();
        }
    }, 15 * 60 * 1000);
}

// === Analytics ===
function trackEvent(action, properties = {}) {
    if (window.gtag) {
        window.gtag('event', action, {
            event_category: 'fire_map',
            ...properties
        });
    }
    console.log(`Analytics: ${action}`, properties);
}

// === Global API ===
window.eyeOnTheFire = {
    refreshData: () => loadFireData(),
    showAllFires: () => {
        if (state.fireMarkers.length > 0) {
            const group = L.featureGroup(state.fireMarkers);
            state.map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
    },
    requestLocation: () => requestLocation(true),
    centerOnFire,
    shareFireLocation,
    getState: () => state
};

// === Global Functions for HTML ===
window.renderSavedPlaces = renderSavedPlaces;
window.centerOnFire = centerOnFire;
window.shareFireLocation = shareFireLocation;
window.copyCoordinates = copyCoordinates;
window.getDirections = getDirections;

console.log('🔥 Eye on the Fire v3.0 - Optimized & Integrated with Cloudflare Worker');
