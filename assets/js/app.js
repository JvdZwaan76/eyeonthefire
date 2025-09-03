/**
 * Eye on the Fire - Main Application JavaScript
 * Production-ready enterprise-level wildfire tracking platform
 * Author: Eye on the Fire Team
 * Version: 1.0.0
 */

'use strict';

// Application State Management
const AppState = {
    map: null,
    markers: [],
    userLocation: null,
    activeAlerts: [],
    lastUpdate: null,
    isFullscreen: false,
    isLoading: false,
    currentFilters: {
        confidence: 0,
        timeRange: 1,
        source: 'MODIS_NRT'
    }
};

// Configuration Constants
const CONFIG = {
    API_ENDPOINT: '/api/nasa/firms',
    UPDATE_INTERVAL: 15 * 60 * 1000, // 15 minutes
    DEFAULT_CENTER: [39.8283, -98.5795], // Geographic center of USA
    DEFAULT_ZOOM: 4,
    MAX_MARKERS: 5000,
    RETRY_ATTEMPTS: 3,
    FIRE_ICON_COLORS: {
        high: '#DC2626',
        medium: '#FF8C00', 
        low: '#FFA500'
    },
    FIRE_SIZE_MULTIPLIER: {
        min: 4,
        max: 20,
        factor: 0.1
    }
};

// Utility Functions
const Utils = {
    /**
     * Debounce function calls to improve performance
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Format timestamp for display
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Formatted time string
     */
    formatTime: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    },

    /**
     * Format date for display
     * @param {string} dateString - Date string in YYYY-MM-DD format
     * @returns {string} Formatted date string
     */
    formatDate: (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString([], { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    },

    /**
     * Get fire confidence level
     * @param {number} confidence - Confidence percentage
     * @returns {string} Confidence level (high/medium/low)
     */
    getConfidenceLevel: (confidence) => {
        if (confidence >= 80) return 'high';
        if (confidence >= 60) return 'medium';
        return 'low';
    },

    /**
     * Calculate distance between two points in kilometers
     * @param {number} lat1 - Latitude 1
     * @param {number} lon1 - Longitude 1
     * @param {number} lat2 - Latitude 2
     * @param {number} lon2 - Longitude 2
     * @returns {number} Distance in kilometers
     */
    calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    /**
     * Show toast notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success/warning/danger/info)
     * @param {number} duration - Display duration in milliseconds
     */
    showAlert: (message, type = 'info', duration = 5000) => {
        const alert = document.getElementById('alert-template').cloneNode(true);
        alert.id = `alert-${Date.now()}`;
        alert.classList.remove('hidden');
        alert.classList.add(`alert-${type}`, 'show');
        
        const titleMap = {
            success: 'Success',
            warning: 'Warning', 
            danger: 'Alert',
            info: 'Information'
        };
        
        alert.querySelector('.alert-title').textContent = titleMap[type] || 'Notification';
        alert.querySelector('.alert-content p').textContent = message;
        
        const closeBtn = alert.querySelector('.alert-close');
        closeBtn.addEventListener('click', () => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        });
        
        document.body.appendChild(alert);
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (document.body.contains(alert)) {
                    alert.classList.remove('show');
                    setTimeout(() => alert.remove(), 300);
                }
            }, duration);
        }
        
        return alert;
    },

    /**
     * Log errors with context
     * @param {string} context - Error context
     * @param {Error} error - Error object
     */
    logError: (context, error) => {
        console.error(`[${context}]`, error);
        // In production, send to error tracking service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: `${context}: ${error.message}`,
                fatal: false
            });
        }
    }
};

// Map Management Module
const MapManager = {
    /**
     * Initialize the Leaflet map
     */
    init: () => {
        console.log('Initializing map...');
        
        try {
            // Initialize Leaflet map
            AppState.map = L.map('wildfire-map', {
                center: CONFIG.DEFAULT_CENTER,
                zoom: CONFIG.DEFAULT_ZOOM,
                zoomControl: false, // We'll add custom controls
                attributionControl: true
            });
            
            // Add tile layer with retina support
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Fire data: NASA FIRMS',
                maxZoom: 18,
                detectRetina: true
            }).addTo(AppState.map);
            
            // Add custom zoom control
            L.control.zoom({
                position: 'bottomright'
            }).addTo(AppState.map);
            
            // Set up event listeners
            MapManager.setupEventListeners();
            
            console.log('Map initialized successfully');
            
            // Load initial fire data
            MapManager.loadFireData();
            
        } catch (error) {
            Utils.logError('Map Initialization', error);
            Utils.showAlert('Failed to initialize map', 'danger');
        }
    },

    /**
     * Set up map event listeners
     */
    setupEventListeners: () => {
        // Map control buttons
        document.getElementById('locate-btn').addEventListener('click', MapManager.locateUser);
        document.getElementById('fullscreen-btn').addEventListener('click', MapManager.toggleFullscreen);
        document.getElementById('layers-btn').addEventListener('click', MapManager.toggleLayers);
        document.getElementById('alerts-btn').addEventListener('click', MapManager.setupAlerts);
        
        // Map events
        AppState.map.on('moveend', Utils.debounce(MapManager.onMapMove, 500));
        AppState.map.on('zoomend', Utils.debounce(MapManager.onMapZoom, 300));
    },

    /**
     * Handle map move events
     */
    onMapMove: () => {
        const center = AppState.map.getCenter();
        const zoom = AppState.map.getZoom();
        
        // Update URL with map state (for sharing/bookmarking)
        if (history.replaceState) {
            const url = new URL(window.location);
            url.searchParams.set('lat', center.lat.toFixed(4));
            url.searchParams.set('lng', center.lng.toFixed(4));
            url.searchParams.set('zoom', zoom);
            history.replaceState(null, '', url);
        }
    },

    /**
     * Handle map zoom events
     */
    onMapZoom: () => {
        const zoom = AppState.map.getZoom();
        
        // Adjust marker sizes based on zoom level
        AppState.markers.forEach(marker => {
            if (marker.options && marker.options.radius) {
                const newRadius = Math.max(2, marker.options.baseRadius * (zoom / 10));
                marker.setRadius(newRadius);
            }
        });
    },

    /**
     * Locate user's current position
     */
    locateUser: () => {
        if (!navigator.geolocation) {
            Utils.showAlert('Geolocation is not supported by this browser', 'warning');
            return;
        }

        const loadingAlert = Utils.showAlert('Finding your location...', 'info', 0);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                AppState.userLocation = [lat, lng];
                AppState.map.setView([lat, lng], 12);
                
                // Add user location marker
                const userMarker = L.circleMarker([lat, lng], {
                    radius: 8,
                    fillColor: '#3B82F6',
                    color: '#FFFFFF',
                    weight: 3,
                    opacity: 1,
                    fillOpacity: 0.8
                });
                
                userMarker.addTo(AppState.map);
                userMarker.bindPopup(`
                    <div style="text-align: center;">
                        <strong>Your Location</strong><br>
                        <small>Accuracy: ±${Math.round(accuracy)}m</small>
                    </div>
                `).openPopup();
                
                // Remove loading alert
                loadingAlert.remove();
                Utils.showAlert('Location found successfully', 'success');
                
                // Check for nearby fires
                MapManager.checkNearbyFires(lat, lng);
                
            },
            (error) => {
                loadingAlert.remove();
                
                let message = 'Unable to access your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location access was denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information is unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out';
                        break;
                }
                
                Utils.showAlert(message, 'warning');
                Utils.logError('Geolocation', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    },

    /**
     * Check for fires near user location
     * @param {number} lat - User latitude
     * @param {number} lng - User longitude
     */
    checkNearbyFires: (lat, lng) => {
        const nearbyFires = AppState.markers
            .map(marker => {
                const markerLatLng = marker.getLatLng();
                const distance = Utils.calculateDistance(
                    lat, lng, 
                    markerLatLng.lat, markerLatLng.lng
                );
                return { marker, distance };
            })
            .filter(({ distance }) => distance < 50) // Within 50km
            .sort((a, b) => a.distance - b.distance);

        if (nearbyFires.length > 0) {
            const count = nearbyFires.length;
            const closest = nearbyFires[0].distance.toFixed(1);
            Utils.showAlert(
                `Found ${count} fire${count > 1 ? 's' : ''} within 50km. Closest is ${closest}km away.`,
                'warning',
                10000
            );
        } else {
            Utils.showAlert('No fires detected within 50km of your location', 'success');
        }
    },

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen: () => {
        const mapContainer = document.querySelector('.map-container');
        
        if (!AppState.isFullscreen) {
            // Enter fullscreen
            if (mapContainer.requestFullscreen) {
                mapContainer.requestFullscreen();
            } else if (mapContainer.webkitRequestFullscreen) {
                mapContainer.webkitRequestFullscreen();
            } else if (mapContainer.msRequestFullscreen) {
                mapContainer.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
        
        // The fullscreen change event will handle the icon update
    },

    /**
     * Toggle map layers (placeholder for future features)
     */
    toggleLayers: () => {
        Utils.showAlert('Layer controls coming soon!', 'info');
    },

    /**
     * Setup fire alerts (placeholder for future features)
     */
    setupAlerts: () => {
        Utils.showAlert('Alert setup coming soon!', 'info');
    },

    /**
     * Load fire data from API
     */
    loadFireData: async () => {
        if (AppState.isLoading) return;
        
        AppState.isLoading = true;
        const statusElement = document.getElementById('last-update');
        
        try {
            console.log('Loading fire data...');
            statusElement.textContent = '(Loading...)';
            
            // Build API URL with filters
            const params = new URLSearchParams({
                source: AppState.currentFilters.source,
                days: AppState.currentFilters.timeRange,
                area: 'usa'
            });
            
            const response = await fetch(`${CONFIG.API_ENDPOINT}?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const csvData = await response.text();
            console.log('Received fire data:', csvData.substring(0, 200) + '...');
            
            // Parse CSV data
            const fires = MapManager.parseCSVData(csvData);
            console.log(`Parsed ${fires.length} fire records`);
            
            // Filter based on confidence if needed
            const filteredFires = fires.filter(fire => {
                const confidence = parseInt(fire.confidence) || 0;
                return confidence >= AppState.currentFilters.confidence;
            });
            
            // Update map with fire data
            MapManager.updateFireMarkers(filteredFires);
            
            // Update statistics
            document.getElementById('active-fires').textContent = filteredFires.length.toLocaleString();
            statusElement.textContent = `(Updated: ${Utils.formatTime(Date.now())})`;
            AppState.lastUpdate = Date.now();
            
            Utils.showAlert(`Loaded ${filteredFires.length} fire reports`, 'success');
            
        } catch (error) {
            Utils.logError('Fire Data Loading', error);
            Utils.showAlert('Failed to load fire data: ' + error.message, 'danger');
            
            // Show sample data for demo purposes
            MapManager.loadSampleData();
            
        } finally {
            AppState.isLoading = false;
        }
    },

    /**
     * Parse CSV fire data
     * @param {string} csvText - Raw CSV data
     * @returns {Array} Parsed fire objects
     */
    parseCSVData: (csvText) => {
        const lines = csvText.trim().split('\n');
        if (lines.length <= 1) return [];
        
        const headers = lines[0].split(',').map(h => h.trim());
        const fires = [];
        
        for (let i = 1; i < lines.length && fires.length < CONFIG.MAX_MARKERS; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            
            if (values.length >= headers.length) {
                const fire = {};
                headers.forEach((header, index) => {
                    fire[header] = values[index] || '';
                });
                
                // Validate required fields
                if (fire.latitude && fire.longitude && 
                    !isNaN(parseFloat(fire.latitude)) && 
                    !isNaN(parseFloat(fire.longitude))) {
                    fires.push(fire);
                }
            }
        }
        
        return fires;
    },

    /**
     * Update fire markers on map
     * @param {Array} fires - Array of fire objects
     */
    updateFireMarkers: (fires) => {
        // Clear existing markers
        AppState.markers.forEach(marker => AppState.map.removeLayer(marker));
        AppState.markers = [];
        
        if (fires.length === 0) {
            Utils.showAlert('No fire data matches current filters', 'info');
            return;
        }
        
        fires.forEach(fire => {
            const lat = parseFloat(fire.latitude);
            const lng = parseFloat(fire.longitude);
            const confidence = parseInt(fire.confidence) || 50;
            const frp = parseFloat(fire.frp) || 0;
            
            if (isNaN(lat) || isNaN(lng)) return;
            
            // Determine marker appearance
            const confidenceLevel = Utils.getConfidenceLevel(confidence);
            const color = CONFIG.FIRE_ICON_COLORS[confidenceLevel];
            const radius = Math.max(
                CONFIG.FIRE_SIZE_MULTIPLIER.min,
                Math.min(
                    CONFIG.FIRE_SIZE_MULTIPLIER.max,
                    frp * CONFIG.FIRE_SIZE_MULTIPLIER.factor + CONFIG.FIRE_SIZE_MULTIPLIER.min
                )
            );
            
            // Create marker
            const marker = L.circleMarker([lat, lng], {
                radius: radius,
                baseRadius: radius, // Store for zoom adjustments
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            });
            
            // Create popup content
            const popupContent = MapManager.createFirePopup(fire, lat, lng);
            marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'fire-popup'
            });
            
            // Add hover effects
            marker.on('mouseover', function() {
                this.setStyle({ weight: 3, opacity: 1 });
            });
            
            marker.on('mouseout', function() {
                this.setStyle({ weight: 2, opacity: 1 });
            });
            
            // Add to map and track
            marker.addTo(AppState.map);
            AppState.markers.push(marker);
        });
        
        console.log(`Added ${AppState.markers.length} fire markers to map`);
    },

    /**
     * Create popup content for fire marker
     * @param {Object} fire - Fire data object
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {string} HTML popup content
     */
    createFirePopup: (fire, lat, lng) => {
        const confidence = parseInt(fire.confidence) || 0;
        const frp = parseFloat(fire.frp) || 0;
        const date = fire.acq_date ? Utils.formatDate(fire.acq_date) : 'Unknown';
        const time = fire.acq_time ? fire.acq_time.toString().padStart(4, '0').replace(/(\d{2})(\d{2})/, '$1:$2') : 'Unknown';
        
        return `
            <div class="fire-popup-content">
                <h4>🔥 Fire Hotspot</h4>
                <div class="fire-details">
                    <p><strong>Confidence:</strong> <span class="confidence-${Utils.getConfidenceLevel(confidence)}">${confidence}%</span></p>
                    <p><strong>Fire Power:</strong> ${frp.toFixed(1)} MW</p>
                    <p><strong>Location:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
                    <p><strong>Detected:</strong> ${date} at ${time} UTC</p>
                    <div class="data-source">
                        <small>📡 Source: NASA ${AppState.currentFilters.source}</small>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Load sample data for demonstration
     */
    loadSampleData: () => {
        console.log('Loading sample fire data for demonstration');
        
        const sampleFires = [
            { 
                latitude: 34.0522, longitude: -118.2437, confidence: 85, frp: 45.2, 
                acq_date: '2025-01-15', acq_time: '1430' 
            },
            { 
                latitude: 37.7749, longitude: -122.4194, confidence: 92, frp: 67.8, 
                acq_date: '2025-01-15', acq_time: '1445' 
            },
            { 
                latitude: 39.7392, longitude: -104.9903, confidence: 76, frp: 23.1, 
                acq_date: '2025-01-15', acq_time: '1500' 
            },
            { 
                latitude: 47.6062, longitude: -122.3321, confidence: 68, frp: 34.5, 
                acq_date: '2025-01-15', acq_time: '1515' 
            },
            { 
                latitude: 40.7128, longitude: -74.0060, confidence: 55, frp: 12.7, 
                acq_date: '2025-01-15', acq_time: '1530' 
            }
        ];
        
        MapManager.updateFireMarkers(sampleFires);
        document.getElementById('active-fires').textContent = sampleFires.length.toLocaleString();
        document.getElementById('last-update').textContent = `(Sample Data - ${Utils.formatTime(Date.now())})`;
        
        Utils.showAlert('Showing sample fire data for demonstration', 'warning', 8000);
    }
};

// Navigation Management Module
const Navigation = {
    /**
     * Initialize navigation functionality
     */
    init: () => {
        Navigation.setupMobileMenu();
        Navigation.setupScrollEffects();
        Navigation.setupSmoothScrolling();
        Navigation.setupActiveNavigation();
    },

    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu: () => {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const navMenu = document.getElementById('nav-menu');
        
        if (!mobileMenuBtn || !navMenu) return;
        
        mobileMenuBtn.addEventListener('click', () => {
            const isActive = navMenu.classList.contains('active');
            
            navMenu.classList.toggle('active');
            
            // Update button icon
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.className = isActive ? 'fas fa-bars' : 'fas fa-times';
            }
            
            // Update ARIA attributes
            mobileMenuBtn.setAttribute('aria-expanded', (!isActive).toString());
            
            // Prevent body scroll when menu is open on mobile
            document.body.style.overflow = isActive ? '' : 'hidden';
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!navMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                navMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
        
        // Close mobile menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    },

    /**
     * Setup navbar scroll effects
     */
    setupScrollEffects: () => {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        const scrollHandler = Utils.throttle(() => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 100);
        
        window.addEventListener('scroll', scrollHandler);
    },

    /**
     * Setup smooth scrolling for anchor links
     */
    setupSmoothScrolling: () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                
                // Skip empty anchors
                if (href === '#') {
                    e.preventDefault();
                    return;
                }
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    // Calculate offset for fixed navbar
                    const navbarHeight = document.getElementById('navbar').offsetHeight;
                    const targetPosition = target.offsetTop - navbarHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    const navMenu = document.getElementById('nav-menu');
                    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
                    
                    if (navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        const icon = mobileMenuBtn.querySelector('i');
                        if (icon) icon.className = 'fas fa-bars';
                        mobileMenuBtn.setAttribute('aria-expanded', 'false');
                        document.body.style.overflow = '';
                    }
                }
            });
        });
    },

    /**
     * Setup active navigation highlighting
     */
    setupActiveNavigation: () => {
        const sections = document.querySelectorAll('section[id]');
        const navItems = document.querySelectorAll('.nav-item a[href^="#"]');
        
        if (sections.length === 0 || navItems.length === 0) return;
        
        const updateActiveNav = Utils.throttle(() => {
            const scrollPos = window.scrollY + 100;
            
            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                const id = section.getAttribute('id');
                
                if (scrollPos >= top && scrollPos < top + height) {
                    navItems.forEach(item => item.classList.remove('active'));
                    
                    const activeItem = document.querySelector(`.nav-item a[href="#${id}"]`);
                    if (activeItem) activeItem.classList.add('active');
                }
            });
        }, 100);
        
        window.addEventListener('scroll', updateActiveNav);
    }
};

// Application Initialization
const App = {
    /**
     * Initialize the application
     */
    init: () => {
        console.log('🔥 Initializing Eye on the Fire application...');
        
        // Check if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', App.start);
        } else {
            App.start();
        }
    },

    /**
     * Start the application
     */
    start: () => {
        try {
            // Initialize core modules
            Navigation.init();
            
            // Initialize map if map container exists
            const mapContainer = document.getElementById('wildfire-map');
            if (mapContainer) {
                MapManager.init();
                
                // Set up periodic data updates
                setInterval(MapManager.loadFireData, CONFIG.UPDATE_INTERVAL);
            }
            
            // Setup additional features
            App.setupURLParams();
            App.setupFullscreenHandlers();
            App.setupPerformanceMonitoring();
            
            console.log('✅ Application initialized successfully');
            
        } catch (error) {
            Utils.logError('Application Initialization', error);
            Utils.showAlert('Application failed to initialize properly', 'danger');
        }
    },

    /**
     * Setup URL parameter handling
     */
    setupURLParams: () => {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Restore map position from URL
        const lat = parseFloat(urlParams.get('lat'));
        const lng = parseFloat(urlParams.get('lng'));
        const zoom = parseInt(urlParams.get('zoom'));
        
        if (!isNaN(lat) && !isNaN(lng) && !isNaN(zoom) && AppState.map) {
            AppState.map.setView([lat, lng], zoom);
        }
    },

    /**
     * Setup fullscreen event handlers
     */
    setupFullscreenHandlers: () => {
        const updateFullscreenState = () => {
            AppState.isFullscreen = !!document.fullscreenElement;
            const btn = document.getElementById('fullscreen-btn');
            if (btn) {
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = AppState.isFullscreen ? 'fas fa-compress' : 'fas fa-expand';
                }
            }
            
            // Invalidate map size after fullscreen change
            if (AppState.map) {
                setTimeout(() => {
                    AppState.map.invalidateSize();
                }, 300);
            }
        };
        
        document.addEventListener('fullscreenchange', updateFullscreenState);
        document.addEventListener('webkitfullscreenchange', updateFullscreenState);
        document.addEventListener('msfullscreenchange', updateFullscreenState);
    },

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring: () => {
        // Monitor page load performance
        window.addEventListener('load', () => {
            if (performance && performance.timing) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);
                
                // Track with analytics if available
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'timing_complete', {
                        name: 'load',
                        value: loadTime
                    });
                }
            }
        });
        
        // Monitor memory usage (if available)
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory;
                console.log(`Memory usage: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`);
            }, 60000); // Check every minute
        }
    }
};

// Global Error Handling
window.addEventListener('error', (event) => {
    Utils.logError('Global Error', event.error || new Error(event.message));
    Utils.showAlert('An unexpected error occurred', 'danger');
});

// Unhandled Promise Rejection Handler
window.addEventListener('unhandledrejection', (event) => {
    Utils.logError('Unhandled Promise Rejection', new Error(event.reason));
    Utils.showAlert('A network error occurred', 'warning');
});

// Start the application
App.init();

// Export for debugging in development
if (typeof window !== 'undefined') {
    window.EyeOnTheFire = {
        AppState,
        Utils,
        MapManager,
        Navigation,
        CONFIG
    };
}