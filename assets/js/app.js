/**
 * Eye on the Fire - Professional Emergency Fire Tracking Platform
 * Based on WatchDuty design principles and emergency service standards
 * Professional-grade wildfire intelligence powered by NASA satellite data
 */

// === Global Variables and State ===
let map;
let fireMarkers = [];
let userLocationMarker;
let fireData = [];
let userLocation = null;
let isLoading = false;
let lastUpdateTime = null;

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
        
        // Load initial fire data
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

// === Map Initialization ===
async function initializeMap() {
    console.log('Initializing map...');
    
    try {
        // Initialize Leaflet map with California view
        map = L.map('map', {
            center: [37.0, -119.0],
            zoom: 6,
            zoomControl: false,
            attributionControl: false
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
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', toggleNavigation);
        
        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                closeNavigation();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeNavigation();
            }
        });
    }
}

function toggleNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    
    navToggle.setAttribute('aria-expanded', !isOpen);
    navMenu.classList.toggle('active', !isOpen);
    
    // Manage focus for accessibility
    if (!isOpen) {
        const firstLink = navMenu.querySelector('.nav-link');
        if (firstLink) firstLink.focus();
    }
}

function closeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('active');
}

// === Event Listeners ===
function initializeEventListeners() {
    // Layer toggle controls
    const satelliteLayer = document.getElementById('satelliteHotspotsLayer');
    const weatherLayer = document.getElementById('weatherLayer');
    
    if (satelliteLayer) {
        satelliteLayer.addEventListener('change', handleLayerToggle);
    }
    
    if (weatherLayer) {
        weatherLayer.addEventListener('change', handleLayerToggle);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

function handleLayerToggle(event) {
    const layerId = event.target.id;
    const isChecked = event.target.checked;
    
    console.log(`Layer ${layerId} toggled:`, isChecked);
    
    // Implement layer visibility logic here
    if (layerId === 'satelliteHotspotsLayer') {
        toggleFireMarkers(isChecked);
    }
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
    }
}

// === Fire Data Management ===
async function loadFireData() {
    if (isLoading) return;
    
    isLoading = true;
    updateFireCount('Loading...');
    
    try {
        console.log('Loading fire data...');
        
        const response = await fetch('/api/nasa/firms', {
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
 * Parse CSV fire data into structured objects
 */
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

// === Fire Marker Management ===
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

/**
 * Determine fire intensity level based on FRP and confidence
 */
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

/**
 * Create flame icon with emergency-appropriate styling
 */
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

/**
 * Create fire popup with emergency-appropriate information hierarchy
 */
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

/**
 * Load detailed location information for fire popup
 */
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

// === User Location Services ===
async function findUserLocation() {
    const button = document.getElementById('findLocationBtn');
    if (!button) return;
    
    const originalContent = button.innerHTML;
    button.innerHTML = '<span class="button-icon">📍</span><span class="button-text">Finding...</span>';
    button.disabled = true;
    
    try {
        if (!navigator.geolocation) {
            throw new Error('Geolocation not supported');
        }
        
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
        
        userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        
        // Add/update user location marker
        updateUserLocationMarker();
        
        // Show nearby fires
        await showNearbyFires();
        
        button.innerHTML = '<span class="button-icon">📍</span><span class="button-text">Update Location</span>';
        
    } catch (error) {
        console.error('Geolocation error:', error);
        
        let errorMessage = 'Unable to determine location.';
        if (error.code === 1) {
            errorMessage = 'Location access denied. Please enable location services.';
        } else if (error.code === 2) {
            errorMessage = 'Location unavailable. Please try again.';
        } else if (error.code === 3) {
            errorMessage = 'Location request timed out. Please try again.';
        }
        
        showErrorAlert(errorMessage);
        button.innerHTML = originalContent;
        
    } finally {
        button.disabled = false;
    }
}

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

/**
 * Show fires near user location
 */
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
        const maxDistance = 100; // 100km radius
        const nearbyFires = firesWithDistance.filter(fire => fire.distance <= maxDistance);
        
        // Update user location text
        if (userLocationText) {
            userLocationText.textContent = `Your current location (${nearbyFires.length} fires within 100km)`;
        }
        
        // Populate nearby fires list
        if (nearbyFires.length === 0) {
            nearbyList.innerHTML = '<div class="no-fires">No fires within 100km of your location</div>';
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

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
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
        map.setView([37.0, -119.0], 6);
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
}

function centerOnFire(lat, lng) {
    map.setView([lat, lng], 14);
}

function closeNearbyPanel() {
    const nearbyPanel = document.getElementById('nearbyPanel');
    if (nearbyPanel) {
        nearbyPanel.style.display = 'none';
    }
}

function toggleFireMarkers(visible) {
    fireMarkers.forEach(marker => {
        if (visible) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });
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
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            closeEmergencyAlert();
        }, 10000);
    }
}

function closeEmergencyAlert() {
    const alert = document.getElementById('emergency-alert');
    if (alert) {
        alert.style.display = 'none';
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

// === Modal Management ===
function closeFireModal() {
    const modal = document.getElementById('fireModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// === Performance Monitoring ===
function logPerformance(label, duration) {
    console.log(`⏱️ ${label}: ${duration}ms`);
    
    // In production, send to analytics
    if (window.gtag) {
        window.gtag('event', 'performance', {
            event_category: 'Application',
            event_label: label,
            value: Math.round(duration)
        });
    }
}

// === Error Handling ===
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // In production, log to error tracking service
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // In production, log to error tracking service
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
    closeFireModal
};

console.log('🔥 Eye on the Fire JavaScript loaded successfully');
