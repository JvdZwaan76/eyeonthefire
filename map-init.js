// Map initialization and functionality
function initializeMap() {
    console.log('Map initialization triggered by Google Maps callback');
    if (window.fireMap) {
        console.log('FireMap already initialized');
        return;
    }
    
    // Delay initialization slightly to ensure DOM is fully ready
    setTimeout(() => {
        window.fireMap = new FireMap();
    }, 100);
}

class FireMap {
    constructor() {
        this.config = {
            apiEndpoint: 'https://eyeonthefire.com/api/nasa/firms',
            defaultCenter: { lat: 39.5, lng: -98.35 },
            defaultZoom: 4,
            usBounds: { west: -125, south: 24, east: -66, north: 49 },
            maxFetchRetries: 3,
            mobileBreakpoint: 768
        };
        this.state = {
            map: null,
            viewport: { north: 0, south: 0, east: 0, west: 0 },
            mapBounds: null,
            markers: [],
            markerClusterer: null,
            heatmap: null,
            totalFirePoints: 0,
            filteredData: [],
            allFireData: [],
            currentPage: 1,
            markersPerPage: 1000,
            activeFilters: {},
            infoWindow: null,
            regionDataCache: new Map(),
            viewMode: 'usa',
            lazyLoading: true,
            loadingRegions: new Set(),
            isMobile: window.innerWidth < 768,
            mapLoaded: false
        };
        this.initialize();
    }

    async initialize() {
        console.log('Initializing FireMap application');
        this.checkMobile();
        this.setupEventListeners();
        try {
            await this.waitForGoogleMaps();
            this.initializeMap();
            this.showLoadingMessage('Loading USA fire data...');
            await this.loadUSAFireData();
            this.hideLoadingMessage();
            this.state.mapLoaded = true;
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showStatus('Error initializing application: ' + error.message, 'error');
            this.hideLoadingMessage();
        }
    }

    checkMobile() {
        this.state.isMobile = window.innerWidth < this.config.mobileBreakpoint;
        if (this.state.isMobile) {
            setTimeout(() => {
                $('#sidebar').addClass('collapsed');
                $('#toggle-sidebar').addClass('collapsed');
                $('#toggle-sidebar i').removeClass('fa-chevron-left').addClass('fa-chevron-right');
                $('#status-panel').addClass('sidebar-collapsed');
                $('#view-mode-toggle').addClass('sidebar-collapsed');
            }, 500);
        }
    }

    waitForGoogleMaps() {
        return new Promise((resolve) => {
            if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
                console.log('Google Maps already loaded');
                resolve();
                return;
            }
            console.log('Waiting for Google Maps to load');
            const checkInterval = setInterval(() => {
                if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
                    clearInterval(checkInterval);
                    console.log('Google Maps loaded successfully');
                    resolve();
                }
            }, 100);
            setTimeout(() => {
                clearInterval(checkInterval);
                if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
                    console.error('Google Maps failed to load within timeout');
                    resolve();
                }
            }, 10000);
        });
    }

    initializeMap() {
        this.showStatus('Initializing map...');
        try {
            console.log('Creating Google Map instance');
            this.state.map = new google.maps.Map(document.getElementById('map'), {
                center: this.config.defaultCenter,
                zoom: this.config.defaultZoom,
                mapTypeId: 'terrain',
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                    position: google.maps.ControlPosition.TOP_LEFT
                },
                fullscreenControl: false,
                streetViewControl: false,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                restriction: {
                    latLngBounds: { north: 85, south: -85, west: -180, east: 180 }
                }
            });
            this.state.infoWindow = new google.maps.InfoWindow();
            google.maps.event.addListener(this.state.map, 'idle', () => {
                const bounds = this.state.map.getBounds();
                if (bounds) {
                    const ne = bounds.getNorthEast();
                    const sw = bounds.getSouthWest();
                    this.state.viewport = {
                        north: ne.lat(),
                        east: ne.lng(),
                        south: sw.lat(),
                        west: sw.lng()
                    };
                    if (this.state.lazyLoading && this.state.mapLoaded) {
                        this.loadDataForViewport();
                    }
                }
            });
            this.focusOnUSA();
            this.hideLoading();
            this.showStatus('Map initialized successfully', 'success');
            console.log('Map initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing map:', error);
            this.showStatus('Error initializing map: ' + error.message, 'error');
            return false;
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        $('#toggle-sidebar').on('click', () => {
            $('#sidebar').toggleClass('collapsed');
            $('#toggle-sidebar').toggleClass('collapsed');
            $('#status-panel').toggleClass('sidebar-collapsed');
            $('#view-mode-toggle').toggleClass('sidebar-collapsed');
            if ($('#sidebar').hasClass('collapsed')) {
                $('#toggle-sidebar i').removeClass('fa-chevron-left').addClass('fa-chevron-right');
            } else {
                $('#toggle-sidebar i').removeClass('fa-chevron-right').addClass('fa-chevron-left');
            }
        });
        $('#zoom-in').on('click', () => {
            const currentZoom = this.state.map.getZoom();
            this.state.map.setZoom(currentZoom + 1);
        });
        $('#zoom-out').on('click', () => {
            const currentZoom = this.state.map.getZoom();
            this.state.map.setZoom(currentZoom - 1);
        });
        $('#recenter').on('click', () => {
            this.recenterMap();
        });
        $('#show-stats').on('click', () => {
            this.showStatistics();
        });
        $('#close-stats').on('click', () => {
            $('#stats-panel').hide();
        });
        $('#apply-filters').on('click', () => {
            this.applyFilters();
        });
        $('#reset-filters').on('click', () => {
            this.resetFilters();
        });
        $('.region-button').on('click', (e) => {
            const $btn = $(e.currentTarget);
            $('.region-button').removeClass('active');
            $btn.addClass('active');
            const bounds = $btn.data('bounds');
            if (bounds) {
                const [west, south, east, north] = bounds.split(',').map(Number);
                this.focusOnRegion(north, south, east, west);
            }
        });
        $('#usa-mode').on('click', () => {
            this.setViewMode('usa');
            $('#usa-mode').removeClass('btn-outline-primary').addClass('btn-primary');
            $('#global-mode').removeClass('btn-primary').addClass('btn-outline-primary');
            this.focusOnUSA();
        });
        $('#global-mode').on('click', () => {
            this.setViewMode('global');
            $('#global-mode').removeClass('btn-outline-primary').addClass('btn-primary');
            $('#usa-mode').removeClass('btn-primary').addClass('btn-outline-primary');
        });
        $('#prev-page').on('click', () => {
            if (this.state.currentPage > 1) {
                this.state.currentPage--;
                this.updateMarkers();
            }
        });
        $('#next-page').on('click', () => {
            const totalPages = this.getTotalPages();
            if (this.state.currentPage < totalPages) {
                this.state.currentPage++;
                this.updateMarkers();
            }
        });
        $('#show-heatmap').on('change', () => {
            this.toggleHeatmap($('#show-heatmap').is(':checked'));
        });
        $('#enable-clustering').on('change', () => {
            this.updateMarkers();
        });
        $('#lazy-loading').on('change', () => {
            this.state.lazyLoading = $('#lazy-loading').is(':checked');
            if (!this.state.lazyLoading) {
                if (this.state.viewMode === 'usa') {
                    this.loadUSAFireData();
                } else {
                    this.loadWorldFireData();
                }
            }
        });
        $('#markers-per-page').on('change', () => {
            this.state.markersPerPage = parseInt($('#markers-per-page').val());
            this.state.currentPage = 1;
            this.updateMarkers();
        });
        $('#confidence-range').on('input', function() {
            const value = parseInt($(this).val());
            $('#confidence-min').text(value + '%');
        });
        $('#frp-range').on('input', function() {
            const value = parseInt($(this).val());
            if (value === 0) {
                $('#frp-min').text('0');
            } else {
                $('#frp-min').text(value);
            }
        });
        window.addEventListener('resize', () => {
            this.checkMobile();
        });
    }

    setViewMode(mode) {
        this.state.viewMode = mode;
        if (mode === 'usa') {
            this.focusOnUSA();
            this.loadUSAFireData();
        }
    }

    focusOnUSA() {
        const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(this.config.usBounds.south, this.config.usBounds.west),
            new google.maps.LatLng(this.config.usBounds.north, this.config.usBounds.east)
        );
        this.state.map.fitBounds(bounds);
    }

    focusOnRegion(north, south, east, west) {
        const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(south, west),
            new google.maps.LatLng(north, east)
        );
        this.state.map.fitBounds(bounds);
    }

    async loadDataForViewport() {
        const viewportString = JSON.stringify(this.state.viewport);
        if (this.state.loadingRegions.has(viewportString)) {
            return;
        }
        const isUSAViewport = this.isViewportInUSA();
        if (this.state.viewMode === 'usa' && !isUSAViewport) {
            return;
        }
        if (this.state.regionDataCache.has(viewportString)) {
            console.log('Using cached data for viewport:', this.state.viewport);
            return;
        }
        this.state.loadingRegions.add(viewportString);
        this.showRegionLoading();
        try {
            let url = this.config.apiEndpoint;
            const params = new URLSearchParams();
            const source = this.state.activeFilters.source?.value || 'MODIS_NRT';
            params.append('source', source);
            params.append('area', 'world');
            const days = this.state.activeFilters.days?.value || '1';
            params.append('days', days);
            url = `${url}?${params.toString()}`;
            console.log(`Fetching fire data for viewport:`, this.state.viewport);
            const response = await this.fetchWithRetry(url);
            if (response.ok) {
                try {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        console.log(`Received ${data.length} fire data points`);
                        const viewportData = this.filterDataToViewport(data, this.state.viewport);
                        console.log(`${viewportData.length} points are in current viewport`);
                        this.state.regionDataCache.set(viewportString, viewportData);
                        this.mergeFireData(viewportData);
                        this.filterData();
                        this.updateMarkers();
                        this.showStatus(`Loaded ${viewportData.length} fire data points for this area`, 'success');
                    }
                } catch (error) {
                    console.error('Error processing viewport data:', error);
                }
            }
        } catch (error) {
            console.error('Error loading viewport data:', error);
        } finally {
            this.state.loadingRegions.delete(viewportString);
            if (this.state.loadingRegions.size === 0) {
                this.hideRegionLoading();
            }
        }
    }

    mergeFireData(newData) {
        if (this.state.allFireData.length === 0) {
            this.state.allFireData = [...newData];
            return;
        }
        const existingIds = new Set();
        this.state.allFireData.forEach(point => {
            const id = `${point.latitude},${point.longitude},${point.acq_date || ''},${point.acq_time || ''}`;
            existingIds.add(id);
        });
        const uniqueNewData = newData.filter(point => {
            const id = `${point.latitude},${point.longitude},${point.acq_date || ''},${point.acq_time || ''}`;
            return !existingIds.has(id);
        });
        this.state.allFireData = [...this.state.allFireData, ...uniqueNewData];
        console.log(`Added ${uniqueNewData.length} new unique fire points`);
    }

    filterDataToViewport(data, viewport) {
        return data.filter(point => {
            const lat = parseFloat(point.latitude);
            const lng = parseFloat(point.longitude);
            return (
                lat >= viewport.south &&
                lat <= viewport.north &&
                lng >= viewport.west &&
                lng <= viewport.east
            );
        });
    }

    isViewportInUSA() {
        const viewport = this.state.viewport;
        const usBounds = this.config.usBounds;
        return !(
            viewport.north < usBounds.south ||
            viewport.south > usBounds.north ||
            viewport.east < usBounds.west ||
            viewport.west > usBounds.east
        );
    }

    async loadUSAFireData() {
        this.showStatus('Loading USA fire data...');
        try {
            let url = this.config.apiEndpoint;
            const params = new URLSearchParams();
            const source = this.state.activeFilters.source?.value || 'MODIS_NRT';
            params.append('source', source);
            params.append('area', 'world');
            const days = this.state.activeFilters.days?.value || '1';
            params.append('days', days);
            url = `${url}?${params.toString()}`;
            console.log(`Fetching USA fire data: ${url}`);
            const response = await this.fetchWithRetry(url);
            if (response.ok) {
                try {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        console.log(`Received ${data.length} global fire data points`);
                        const usaData = this.filterDataToUSA(data);
                        console.log(`${usaData.length} fire points are in the USA`);
                        this.processFireData(usaData);
                        this.showStatus(`Loaded ${usaData.length} USA fire data points`, 'success');
                    } else if (data.error) {
                        throw new Error(data.message || 'Unknown API error');
                    } else {
                        throw new Error('Unexpected response format from API');
                    }
                } catch (error) {
                    console.error(`Error parsing API response: ${error.message}`);
                    throw error;
                }
            } else {
                throw new Error(`API responded with status ${response.status}`);
            }
        } catch (error) {
            console.error(`Error loading USA fire data: ${error.message}`);
            this.showStatus(`Error loading USA fire data: ${error.message}`, 'error');
            if (this.state.allFireData.length === 0) {
                console.warn('Generating sample data as fallback');
                this.generateSampleData();
            }
        }
    }

    filterDataToUSA(data) {
        const usBounds = this.config.usBounds;
        const alaskaBounds = { west: -170, south: 51, east: -130, north: 71 };
        const hawaiiBounds = { west: -160, south: 18, east: -154, north: 23 };
        return data.filter(point => {
            const lat = parseFloat(point.latitude);
            const lng = parseFloat(point.longitude);
            const inContUS = (
                lat >= usBounds.south &&
                lat <= usBounds.north &&
                lng >= usBounds.west &&
                lng <= usBounds.east
            );
            const inAlaska = (
                lat >= alaskaBounds.south &&
                lat <= alaskaBounds.north &&
                lng >= alaskaBounds.west &&
                lng <= alaskaBounds.east
            );
            const inHawaii = (
                lat >= hawaiiBounds.south &&
                lat <= hawaiiBounds.north &&
                lng >= hawaiiBounds.west &&
                lng <= hawaiiBounds.east
            );
            return inContUS || inAlaska || inHawaii;
        });
    }

    async loadWorldFireData() {
        if (!this.state.lazyLoading) {
            this.showLoadingMessage('Loading global fire data...');
        }
        this.showStatus('Loading global fire data...');
        try {
            let url = this.config.apiEndpoint;
            const params = new URLSearchParams();
            const source = this.state.activeFilters.source?.value || 'MODIS_NRT';
            params.append('source', source);
            params.append('area', 'world');
            const days = this.state.activeFilters.days?.value || '1';
            params.append('days', days);
            url = `${url}?${params.toString()}`;
            console.log(`Fetching global fire data: ${url}`);
            const response = await this.fetchWithRetry(url);
            if (response.ok) {
                try {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        console.log(`Received ${data.length} global fire data points`);
                        this.processFireData(data);
                        this.showStatus(`Loaded ${data.length} global fire data points`, 'success');
                    } else if (data.error) {
                        throw new Error(data.message || 'Unknown API error');
                    } else {
                        throw new Error('Unexpected response format from API');
                    }
                } catch (error) {
                    console.error(`Error parsing API response: ${error.message}`);
                    throw error;
                }
            } else {
                throw new Error(`API responded with status ${response.status}`);
            }
        } catch (error) {
            console.error(`Error loading global fire data: ${error.message}`);
            this.showStatus(`Error loading global fire data: ${error.message}`, 'error');
            if (this.state.allFireData.length === 0) {
                console.warn('Generating sample data as fallback');
                this.generateSampleData();
            }
        } finally {
            if (!this.state.lazyLoading) {
                this.hideLoadingMessage();
            }
        }
    }

    recenterMap() {
        if (this.state.viewMode === 'usa') {
            this.focusOnUSA();
        } else if (this.state.filteredData.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            this.state.filteredData.forEach(point => {
                bounds.extend(new google.maps.LatLng(parseFloat(point.latitude), parseFloat(point.longitude)));
            });
            this.state.map.fitBounds(bounds);
        } else {
            this.state.map.setCenter(this.config.defaultCenter);
            this.state.map.setZoom(this.config.defaultZoom);
        }
    }

    applyFilters() {
        this.updateActiveFilters();
        if (this.state.activeFilters.source || this.state.activeFilters.days) {
            this.state.regionDataCache.clear();
            if (this.state.viewMode === 'usa') {
                this.loadUSAFireData();
            } else if (this.state.lazyLoading) {
                this.loadDataForViewport();
            } else {
                this.loadWorldFireData();
            }
        } else {
            this.filterData();
            this.updateMarkers();
        }
    }

    resetFilters() {
        $('#data-source').val('MODIS_NRT');
        $('#days-range').val('1');
        $('#confidence-range').val(0);
        $('#frp-range').val(0);
        $('#confidence-min').text('0%');
        $('#frp-min').text('0');
        $('#enable-clustering').prop('checked', true);
        $('#show-heatmap').prop('checked', false);
        $('#markers-per-page').val('1000');
        this.state.markersPerPage = 1000;
        this.state.currentPage = 1;
        this.state.activeFilters = {};
        $('#active-filters').empty();
        this.state.regionDataCache.clear();
        if (this.state.viewMode === 'usa') {
            this.loadUSAFireData();
        } else {
            this.loadWorldFireData();
        }
    }

    updateActiveFilters() {
        this.state.activeFilters = {};
        $('#active-filters').empty();
        const source = $('#data-source').val();
        const sourceText = $('#data-source option:selected').text();
        if (source !== 'MODIS_NRT') {
            this.state.activeFilters.source = { value: source, label: sourceText };
            this.addFilterTag('source', sourceText, () => {
                $('#data-source').val('MODIS_NRT');
                this.removeFilterTag('source');
                delete this.state.activeFilters.source;
            });
        }
        const days = $('#days-range').val();
        const daysText = $('#days-range option:selected').text();
        if (days !== '1') {
            this.state.activeFilters.days = { value: days, label: daysText };
            this.addFilterTag('days', daysText, () => {
                $('#days-range').val('1');
                this.removeFilterTag('days');
                delete this.state.activeFilters.days;
            });
        }
        const confidence = parseInt($('#confidence-range').val());
        if (confidence > 0) {
            this.state.activeFilters.confidence = { value: confidence, label: `Confidence ≥ ${confidence}%` };
            this.addFilterTag('confidence', `Confidence ≥ ${confidence}%`, () => {
                $('#confidence-range').val(0);
                $('#confidence-min').text('0%');
                this.removeFilterTag('confidence');
                delete this.state.activeFilters.confidence;
            });
        }
        const frp = parseInt($('#frp-range').val());
        if (frp > 0) {
            this.state.activeFilters.frp = { value: frp, label: `FRP ≥ ${frp} MW` };
            this.addFilterTag('frp', `FRP ≥ ${frp} MW`, () => {
                $('#frp-range').val(0);
                $('#frp-min').text('0');
                this.removeFilterTag('frp');
                delete this.state.activeFilters.frp;
            });
        }
    }

    addFilterTag(id, text, removeCallback) {
        const tag = $(`<span class="filter-tag" data-filter-id="${id}">${text} <span class="remove-filter">×</span></span>`);
        tag.find('.remove-filter').on('click', removeCallback);
        $('#active-filters').append(tag);
    }

    removeFilterTag(id) {
        $(`.filter-tag[data-filter-id="${id}"]`).remove();
    }

    processFireData(data) {
        this.state.allFireData = data;
        this.state.totalFirePoints = data.length;
        this.filterData();
        this.updateMarkers();
    }

    filterData() {
        let filtered = [...this.state.allFireData];
        if (this.state.activeFilters.confidence) {
            const minConfidence = parseInt(this.state.activeFilters.confidence.value);
            filtered = filtered.filter(point => {
                const confidence = parseInt(point.confidence) || 0;
                return confidence >= minConfidence;
            });
        }
        if (this.state.activeFilters.frp) {
            const minFrp = parseInt(this.state.activeFilters.frp.value);
            filtered = filtered.filter(point => {
                const frp = parseFloat(point.frp) || 0;
                return frp >= minFrp;
            });
        }
        this.state.filteredData = filtered;
        this.updatePaginationInfo();
    }

    updateMarkers() {
        this.clearMarkers();
        if (this.state.currentPage > this.getTotalPages()) {
            this.state.currentPage = 1;
        }
        this.updatePaginationInfo();
        if (this.state.filteredData.length === 0) {
            this.showStatus('No fire data points match your filters.', 'warning');
            return;
        }
        let displayData;
        if (this.state.markersPerPage === Number.MAX_SAFE_INTEGER) {
            displayData = this.state.filteredData;
        } else {
            const startIndex = (this.state.currentPage - 1) * this.state.markersPerPage;
            const endIndex = startIndex + this.state.markersPerPage;
            displayData = this.state.filteredData.slice(startIndex, endIndex);
        }
        const heatmapData = [];
        const markers = displayData.map(fire => {
            if (!fire.latitude || !fire.longitude) return null;
            const lat = parseFloat(fire.latitude);
            const lng = parseFloat(fire.longitude);
            if (isNaN(lat) || isNaN(lng)) return null;
            heatmapData.push({
                location: new google.maps.LatLng(lat, lng),
                weight: parseFloat(fire.frp) || 1
            });
            const marker = new google.maps.Marker({
                position: { lat, lng },
                map: this.state.map,
                icon: this.createFireIcon(fire),
                title: `Fire at ${lat}, ${lng}`
            });
            marker.addListener('click', () => {
                this.showFireInfo(marker, fire);
            });
            this.addMarkerHoverEffect(marker, fire);
            return marker;
        }).filter(marker => marker !== null);
        this.state.markers = markers;
        if ($('#enable-clustering').is(':checked')) {
            this.setupMarkerClusterer();
        }
        if ($('#show-heatmap').is(':checked')) {
            this.setupHeatmap(heatmapData);
        }
        this.showStatus(`Showing ${markers.length} of ${this.state.filteredData.length} fire points`, 'success');
    }

    setupMarkerClusterer() {
        try {
            if (typeof MarkerClusterer === 'undefined') {
                console.error('MarkerClusterer is not defined. Skipping clustering');
                return;
            }
            console.log('Setting up marker clustering');
            if (this.state.markerClusterer) {
                this.state.markerClusterer.clearMarkers();
            }
            const renderer = {
                render: ({ count, position }) => {
                    return new google.maps.Marker({
                        position,
                        label: { text: String(count), color: "white", fontSize: "10px" },
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: "#ff4500",
                            fillOpacity: 0.7,
                            strokeColor: "#ffffff",
                            strokeWeight: 1,
                            scale: Math.min(count / 5 + 10, 25)
                        },
                        zIndex: 1000
                    });
                }
            };
            this.state.markerClusterer = new MarkerClusterer({
                map: this.state.map,
                markers: this.state.markers,
                renderer: renderer
            });
            console.log('Marker clustering set up successfully');
        } catch (error) {
            console.error('Error setting up marker clustering:', error);
        }
    }

    setupHeatmap(heatmapData) {
        if (this.state.heatmap) {
            this.state.heatmap.setMap(null);
        }
        this.state.heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            map: this.state.map,
            radius: 20,
            opacity: 0.7,
            gradient: [
                'rgba(255, 255, 0, 0)',
                'rgba(255, 255, 0, 1)',
                'rgba(255, 204, 0, 1)',
                'rgba(255, 153, 0, 1)',
                'rgba(255, 102, 0, 1)',
                'rgba(255, 51, 0, 1)',
                'rgba(255, 0, 0, 1)'
            ]
        });
    }

    toggleHeatmap(visible) {
        if (visible) {
            const heatmapData = this.state.filteredData.map(fire => {
                return {
                    location: new google.maps.LatLng(parseFloat(fire.latitude), parseFloat(fire.longitude)),
                    weight: parseFloat(fire.frp) || 1
                };
            });
            this.setupHeatmap(heatmapData);
        } else if (this.state.heatmap) {
            this.state.heatmap.setMap(null);
            this.state.heatmap = null;
        }
    }

    clearMarkers() {
        this.state.markers.forEach(marker => marker.setMap(null));
        this.state.markers = [];
        if (this.state.markerClusterer) {
            this.state.markerClusterer.clearMarkers();
        }
        if (this.state.heatmap) {
            this.state.heatmap.setMap(null);
        }
        if (this.state.infoWindow) {
            this.state.infoWindow.close();
        }
    }

    createFireIcon(fire) {
        const confidence = parseInt(fire.confidence) || 50;
        const frp = parseFloat(fire.frp) || 10;
        const color = this.getFireColor(confidence);
        const size = this.getFireSize(frp);
        return {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 0.7,
            strokeColor: '#FFFFFF',
            strokeWeight: 1,
            scale: size
        };
    }

    getFireColor(confidence) {
        if (confidence >= 80) return '#FF0000';
        if (confidence >= 60) return '#FF4500';
        if (confidence >= 30) return '#FFA500';
        return '#FFCC00';
    }

    getFireSize(frp) {
        if (frp > 50) return 14;
        if (frp > 20) return 12;
        if (frp > 10) return 10;
        return 8;
    }

    showFireInfo(marker, fire) {
        let dateTimeInfo = '';
        if (fire.acq_date) {
            dateTimeInfo += `<p><strong>Detection Date:</strong> ${fire.acq_date}</p>`;
            if (fire.acq_time) {
                const timeStr = fire.acq_time.toString().padStart(4, '0');
                const hours = timeStr.substring(0, 2);
                const minutes = timeStr.substring(2, 4);
                dateTimeInfo += `<p><strong>Detection Time:</strong> ${hours}:${minutes} UTC</p>`;
            }
        }
        const content = `
            <div style="padding: 8px; max-width: 300px;">
                <h5 style="margin-top: 0; color: #333;">Fire Information</h5>
                <p><strong>Location:</strong> ${fire.latitude}, ${fire.longitude}</p>
                <p><strong>Confidence:</strong> ${fire.confidence || 'Unknown'}%</p>
                <p><strong>Fire Power:</strong> ${fire.frp || 'Unknown'} MW</p>
                ${dateTimeInfo}
                <p style="margin-top: 8px; font-size: 12px; color: #666;">
                    <i class="fas fa-info-circle"></i> Data source: ${$('#data-source option:selected').text()}
                </p>
            </div>
        `;
        this.state.infoWindow.setContent(content);
        this.state.infoWindow.open(this.state.map, marker);
    }

    addMarkerHoverEffect(marker, fire) {
        const tooltip = document.getElementById('custom-tooltip');
        marker.addListener('mouseover', function(event) {
            const point = event.pixel;
            tooltip.style.left = (point.x + 15) + 'px';
            tooltip.style.top = (point.y - 15) + 'px';
            tooltip.innerHTML = `
                Confidence: ${fire.confidence || 'Unknown'}%<br>
                Fire Power: ${fire.frp || 'Unknown'} MW
            `;
            tooltip.style.display = 'block';
        });
        marker.addListener('mouseout', function() {
            tooltip.style.display = 'none';
        });
        marker.addListener('mousemove', function(event) {
            const point = event.pixel;
            tooltip.style.left = (point.x + 15) + 'px';
            tooltip.style.top = (point.y - 15) + 'px';
        });
    }

    generateSampleData() {
        this.showStatus('Using sample data as fallback', 'warning');
        const center = this.config.defaultCenter;
        const sampleData = [];
        for (let i = 0; i < 50; i++) {
            const latOffset = (Math.random() - 0.5) * 20;
            const lngOffset = (Math.random() - 0.5) * 50;
            const confidence = Math.floor(Math.random() * 100);
            const frp = Math.random() * 100;
            sampleData.push({
                latitude: center.lat + latOffset,
                longitude: center.lng + lngOffset,
                confidence: confidence,
                frp: frp,
                acq_date: '2025-05-09',
                acq_time: '1200'
            });
        }
        this.processFireData(sampleData);
    }

    showLoading(message = 'Loading...') {
        document.getElementById('loading-overlay').style.display = 'flex';
        document.getElementById('loading-message').textContent = message;
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    showRegionLoading() {
        document.getElementById('region-loading').style.display = 'block';
    }

    hideRegionLoading() {
        document.getElementById('region-loading').style.display = 'none';
    }

    showLoadingMessage(message) {
        const loadingMessage = document.getElementById('loading-data-message');
        loadingMessage.innerHTML = `<span class="loading-data-spinner"></span> ${message}`;
        loadingMessage.style.display = 'block';
    }

    hideLoadingMessage() {
        document.getElementById('loading-data-message').style.display = 'none';
    }

    showStatus(message, type = 'info') {
        const statusPanel = document.getElementById('status-panel');
        statusPanel.textContent = message;
        statusPanel.className = '';
        statusPanel.classList.add('status-panel');
        if ($('#sidebar').hasClass('collapsed')) {
            statusPanel.classList.add('sidebar-collapsed');
        }
        switch (type) {
            case 'success':
                statusPanel.style.backgroundColor = '#d4edda';
                statusPanel.style.color = '#155724';
                break;
            case 'error':
                statusPanel.style.backgroundColor = '#f8d7da';
                statusPanel.style.color = '#721c24';
                break;
            case 'warning':
                statusPanel.style.backgroundColor = '#fff3cd';
                statusPanel.style.color = '#856404';
                break;
            default:
                statusPanel.style.backgroundColor = '#d1ecf1';
                statusPanel.style.color = '#0c5460';
        }
        statusPanel.style.display = 'block';
        if (type !== 'error') {
            setTimeout(() => {
                statusPanel.style.display = 'none';
            }, 5000);
        }
    }

    updatePaginationInfo() {
        const totalPages = this.getTotalPages();
        $('#current-page').text(this.state.currentPage);
        $('#total-pages').text(totalPages);
        $('#prev-page').prop('disabled', this.state.currentPage <= 1);
        $('#next-page').prop('disabled', this.state.currentPage >= totalPages);
        if (totalPages <= 1) {
            $('.pagination-container').hide();
        } else {
            $('.pagination-container').show();
        }
    }

    getTotalPages() {
        return Math.ceil(this.state.filteredData.length / this.state.markersPerPage);
    }

    showStatistics() {
        if (this.state.filteredData.length === 0) {
            this.showStatus('No data available for statistics', 'warning');
            return;
        }
        $('#stats-panel').show();
        const totalFires = this.state.filteredData.length;
        const confidenceLevels = { high: 0, medium: 0, low: 0, veryLow: 0 };
        const frpLevels = { extreme: 0, high: 0, medium: 0, low: 0 };
        const dateMap = new Map();
        this.state.filteredData.forEach(fire => {
            const confidence = parseInt(fire.confidence) || 0;
            if (confidence >= 80) confidenceLevels.high++;
            else if (confidence >= 60) confidenceLevels.medium++;
            else if (confidence >= 30) confidenceLevels.low++;
            else confidenceLevels.veryLow++;
            const frp = parseFloat(fire.frp) || 0;
            if (frp > 50) frpLevels.extreme++;
            else if (frp > 20) frpLevels.high++;
            else if (frp > 10) frpLevels.medium++;
            else frpLevels.low++;
            const date = fire.acq_date || 'Unknown';
            if (dateMap.has(date)) {
                dateMap.set(date, dateMap.get(date) + 1);
            } else {
                dateMap.set(date, 1);
            }
        });
        const sortedDates = [...dateMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
        let statsHtml = `
            <div class="mb-3">
                <strong>Total Fire Points:</strong> ${totalFires}<br>
                <strong>Data Source:</strong> ${$('#data-source option:selected').text()}<br>
                <strong>Time Range:</strong> ${$('#days-range option:selected').text()}<br>
                <strong>Region:</strong> ${this.state.viewMode === 'usa' ? 'USA' : 'Global'}
            </div>
            <div class="mb-3">
                <strong>Confidence Levels:</strong><br>
                High (80-100%): ${confidenceLevels.high} (${Math.round(confidenceLevels.high/totalFires*100)}%)<br>
                Medium (60-79%): ${confidenceLevels.medium} (${Math.round(confidenceLevels.medium/totalFires*100)}%)<br>
                Low (30-59%): ${confidenceLevels.low} (${Math.round(confidenceLevels.low/totalFires*100)}%)<br>
                Very Low (0-29%): ${confidenceLevels.veryLow} (${Math.round(confidenceLevels.veryLow/totalFires*100)}%)
            </div>
            <div class="mb-3">
                <strong>Fire Intensity (FRP):</strong><br>
                Extreme (>50 MW): ${frpLevels.extreme} (${Math.round(frpLevels.extreme/totalFires*100)}%)<br>
                High (20-50 MW): ${frpLevels.high} (${Math.round(frpLevels.high/totalFires*100)}%)<br>
                Medium (10-20 MW): ${frpLevels.medium} (${Math.round(frpLevels.medium/totalFires*100)}%)<br>
                Low (<10 MW): ${frpLevels.low} (${Math.round(frpLevels.low/totalFires*100)}%)
            </div>
        `;
        if (sortedDates.length > 0 && sortedDates[0][0] !== 'Unknown') {
            statsHtml += `
                <div>
                    <strong>Top Detection Dates:</strong><br>
            `;
            sortedDates.forEach(([date, count]) => {
                statsHtml += `${date}: ${count} fires (${Math.round(count/totalFires*100)}%)<br>`;
            });
            statsHtml += `</div>`;
        }
        $('#stats-content').html(statsHtml);
    }

    async fetchWithRetry(url, retries = 0) {
        try {
            console.log(`Fetch attempt ${retries + 1}/${this.config.maxFetchRetries + 1}: ${url}`);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
                cache: 'no-cache'
            });
            console.log(`Response status: ${response.status} ${response.statusText}`);
            return response;
        } catch (error) {
            console.error(`Fetch error: ${error.message}`);
            if (retries < this.config.maxFetchRetries - 1) {
                console.log(`Retrying... (${retries + 1}/${this.config.maxFetchRetries})`);
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries)));
                return this.fetchWithRetry(url, retries + 1);
            }
            throw error;
        }
    }
}
