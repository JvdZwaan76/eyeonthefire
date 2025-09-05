// Fixed Fire Map Application - Prevents duplicate variable declarations
// This version ensures no variables are declared multiple times

// Use IIFE (Immediately Invoked Function Expression) to avoid global scope pollution
(function() {
    'use strict';
    
    // Check if already initialized to prevent double initialization
    if (window.fireMapInitialized) {
        console.log('Fire map already initialized, skipping...');
        return;
    }
    
    // Mark as initialized
    window.fireMapInitialized = true;
    
    // Global variables - using var to avoid redeclaration errors, or check if exists
    if (typeof savedPlaces === 'undefined') {
        var savedPlaces = JSON.parse(localStorage.getItem('eyeonthefire-saved-places') || '[]');
    }
    
    if (typeof map === 'undefined') {
        var map = null;
    }
    
    if (typeof fireMarkers === 'undefined') {
        var fireMarkers = [];
    }
    
    if (typeof savedPlaceMarkers === 'undefined') {
        var savedPlaceMarkers = [];
    }
    
    // Configuration
    const CONFIG = {
        DEFAULT_CENTER: [36.7783, -119.4179], // California center
        DEFAULT_ZOOM: 6,
        API_BASE_URL: window.location.origin + '/api',
        UPDATE_INTERVAL: 300000, // 5 minutes
        MAX_RETRIES: 3
    };
    
    // Initialize the application
    function initializeApp() {
        try {
            console.log('Initializing Fire Map Application...');
            
            // Initialize map
            initializeMap();
            
            // Load initial fire data
            loadFireData();
            
            // Set up periodic updates
            setInterval(loadFireData, CONFIG.UPDATE_INTERVAL);
            
            // Initialize saved places
            initializeSavedPlaces();
            
            // Set up event listeners
            setupEventListeners();
            
            console.log('Fire Map Application initialized successfully');
            
        } catch (error) {
            console.error('Error initializing Fire Map Application:', error);
            showErrorMessage('Failed to initialize fire map. Please refresh the page.');
        }
    }
    
    function initializeMap() {
        if (typeof L === 'undefined') {
            throw new Error('Leaflet library not loaded');
        }
        
        // Initialize the map
        map = L.map('map', {
            center: CONFIG.DEFAULT_CENTER,
            zoom: CONFIG.DEFAULT_ZOOM,
            zoomControl: true,
            scrollWheelZoom: true
        });
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);
        
        console.log('Map initialized successfully');
    }
    
    async function loadFireData() {
        let attempts = 0;
        const maxAttempts = CONFIG.MAX_RETRIES;
        
        while (attempts < maxAttempts) {
            try {
                console.log(`Loading fire data (attempt ${attempts + 1}/${maxAttempts})...`);
                
                const response = await fetch(`${CONFIG.API_BASE_URL}/nasa/firms?source=VIIRS_NOAA20_NRT&days=3&area=california`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/csv',
                        'Content-Type': 'text/csv'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`API responded with status: ${response.status}`);
                }
                
                const csvData = await response.text();
                console.log('Fire data loaded successfully');
                
                parseAndDisplayFireData(csvData);
                
                updateLastUpdated();
                return; // Success, exit the retry loop
                
            } catch (error) {
                attempts++;
                console.error(`Error loading fire data (attempt ${attempts}):`, error);
                
                if (attempts >= maxAttempts) {
                    showErrorMessage('Failed to load fire data. Please check your connection and try again.');
                    break;
                }
                
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
            }
        }
    }
    
    function parseAndDisplayFireData(csvData) {
        try {
            // Clear existing markers
            clearFireMarkers();
            
            const lines = csvData.split('\n');
            const headers = lines[0].split(',');
            
            let fireCount = 0;
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line || line.startsWith('#')) continue;
                
                const values = line.split(',');
                if (values.length < headers.length) continue;
                
                const lat = parseFloat(values[0]);
                const lon = parseFloat(values[1]);
                const brightness = parseFloat(values[2]);
                const confidence = parseFloat(values[8]);
                const acqDate = values[5];
                const acqTime = values[6];
                
                if (isNaN(lat) || isNaN(lon)) continue;
                
                // Create fire marker
                const marker = createFireMarker(lat, lon, brightness, confidence, acqDate, acqTime);
                if (marker) {
                    fireMarkers.push(marker);
                    fireCount++;
                }
            }
            
            console.log(`Displayed ${fireCount} fire locations`);
            updateFireCount(fireCount);
            
        } catch (error) {
            console.error('Error parsing fire data:', error);
            showErrorMessage('Error displaying fire data. Data may be corrupted.');
        }
    }
    
    function createFireMarker(lat, lon, brightness, confidence, acqDate, acqTime) {
        try {
            // Determine marker color based on brightness and confidence
            let color = '#ff4444'; // Default red
            if (brightness > 350) color = '#ff0000'; // Bright red for very hot fires
            else if (brightness > 320) color = '#ff6600'; // Orange for hot fires
            else if (confidence < 50) color = '#ffaa00'; // Yellow for low confidence
            
            const marker = L.circleMarker([lat, lon], {
                radius: Math.min(8, Math.max(3, brightness / 50)),
                fillColor: color,
                color: '#000',
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.6
            });
            
            // Create popup content
            const popupContent = `
                <div class="fire-popup">
                    <h3>🔥 Fire Detection</h3>
                    <p><strong>Location:</strong> ${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
                    <p><strong>Brightness:</strong> ${brightness}K</p>
                    <p><strong>Confidence:</strong> ${confidence}%</p>
                    <p><strong>Detected:</strong> ${acqDate} ${acqTime}</p>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            marker.addTo(map);
            
            return marker;
            
        } catch (error) {
            console.error('Error creating fire marker:', error);
            return null;
        }
    }
    
    function clearFireMarkers() {
        fireMarkers.forEach(marker => {
            map.removeLayer(marker);
        });
        fireMarkers = [];
    }
    
    function initializeSavedPlaces() {
        try {
            // Load saved places from localStorage
            const saved = localStorage.getItem('eyeonthefire-saved-places');
            if (saved) {
                savedPlaces = JSON.parse(saved);
            }
            
            // Display saved places on map
            displaySavedPlaces();
            
            console.log(`Loaded ${savedPlaces.length} saved places`);
            
        } catch (error) {
            console.error('Error initializing saved places:', error);
            savedPlaces = [];
        }
    }
    
    function displaySavedPlaces() {
        // Clear existing saved place markers
        savedPlaceMarkers.forEach(marker => {
            map.removeLayer(marker);
        });
        savedPlaceMarkers = [];
        
        // Add markers for each saved place
        savedPlaces.forEach(place => {
            const marker = L.marker([place.lat, place.lon], {
                icon: L.icon({
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            });
            
            marker.bindPopup(`
                <div class="saved-place-popup">
                    <h3>📍 ${place.name}</h3>
                    <p>${place.lat.toFixed(4)}, ${place.lon.toFixed(4)}</p>
                    <button onclick="removeSavedPlace('${place.id}')">Remove</button>
                </div>
            `);
            
            marker.addTo(map);
            savedPlaceMarkers.push(marker);
        });
    }
    
    function setupEventListeners() {
        // Map click event for adding saved places
        map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lon = e.latlng.lng;
            
            const name = prompt('Enter a name for this location:');
            if (name) {
                addSavedPlace(name, lat, lon);
            }
        });
        
        // Set up UI event listeners
        document.addEventListener('DOMContentLoaded', function() {
            // Refresh button
            const refreshBtn = document.getElementById('refresh-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', loadFireData);
            }
            
            // Any other UI elements...
        });
    }
    
    function addSavedPlace(name, lat, lon) {
        const place = {
            id: Date.now().toString(),
            name: name,
            lat: lat,
            lon: lon,
            created: new Date().toISOString()
        };
        
        savedPlaces.push(place);
        localStorage.setItem('eyeonthefire-saved-places', JSON.stringify(savedPlaces));
        
        displaySavedPlaces();
        console.log('Saved place added:', place);
    }
    
    // Make removeSavedPlace globally accessible
    window.removeSavedPlace = function(id) {
        savedPlaces = savedPlaces.filter(place => place.id !== id);
        localStorage.setItem('eyeonthefire-saved-places', JSON.stringify(savedPlaces));
        displaySavedPlaces();
        console.log('Saved place removed:', id);
    };
    
    function updateFireCount(count) {
        const countElement = document.getElementById('fire-count');
        if (countElement) {
            countElement.textContent = count;
        }
    }
    
    function updateLastUpdated() {
        const timeElement = document.getElementById('last-updated');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleString();
        }
    }
    
    function showErrorMessage(message) {
        // Create or update error message element
        let errorDiv = document.getElementById('error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-message';
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4444;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 1000;
                max-width: 300px;
            `;
            document.body.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }, 5000);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
    
})(); // End of IIFE

console.log('Fire Map JavaScript loaded successfully - no duplicate declarations');
