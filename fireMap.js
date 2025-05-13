class FireMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.clusterer = null;
        this.initMap();
    }

    initMap() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('Map container not found');
            this.showFallbackMap();
            return;
        }
        if (typeof google === 'undefined' || !google.maps) {
            console.warn('Google Maps API not loaded. Retrying in 1s...');
            setTimeout(() => this.initMap(), 1000);
            return;
        }
        this.map = new google.maps.Map(mapContainer, {
            center: { lat: 39.8283, lng: -98.5795 },
            zoom: 4,
            mapTypeId: 'roadmap'
        });
        if (typeof MarkerClusterer !== 'undefined') {
            this.clusterer = new MarkerClusterer({ map: this.map, markers: [] });
        } else {
            console.warn('MarkerClusterer not loaded. Clustering disabled.');
        }
        this.fetchFireData();
        this.bindControls();
    }

    async fetchFireData() {
        const maxRetries = 4;
        let attempt = 1;
        while (attempt <= maxRetries) {
            try {
                console.log(`Fetch attempt ${attempt}/${maxRetries}: https://eyeonthefire.com/api/nasa/firms?source=MODIS_NRT&area=world&days=1`);
                document.getElementById('loading-overlay').style.display = 'flex';
                const response = await fetch('https://eyeonthefire.com/api/nasa/firms?source=MODIS_NRT&area=world&days=1');
                console.log(`Response status: ${response.status}`);
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
                }
                const data = await response.json();
                if (!data.events || !Array.isArray(data.events) || data.events.length === 0) {
                    throw new Error('Invalid or empty API response');
                }
                this.markers.forEach(marker => marker.setMap(null));
                this.markers = data.events
                    .filter(event => event.geometry && event.geometry[0]?.coordinates)
                    .map(event => {
                        const [lng, lat] = event.geometry[0].coordinates;
                        return new google.maps.marker.AdvancedMarkerElement({
                            position: { lat, lng },
                            map: this.map,
                            title: event.title || 'Active Fire'
                        });
                    });
                if (this.clusterer) {
                    this.clusterer.clearMarkers();
                    this.clusterer.addMarkers(this.markers);
                }
                console.log(`Received ${this.markers.length} fire data points`);
                document.getElementById('loading-overlay').classList.add('hidden');
                return;
            } catch (error) {
                console.error(`Fetch error on attempt ${attempt}:`, error.message);
                if (attempt === maxRetries) {
                    console.error('Max retries reached. Showing fallback map.');
                    this.showFallbackMap();
                }
                attempt++;
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    showFallbackMap() {
        document.getElementById('map').style.display = 'none';
        document.getElementById('fallback-map').style.display = 'block';
        document.getElementById('loading-overlay').style.display = 'none';
    }

    zoomIn() {
        if (this.map) this.map.setZoom(this.map.getZoom() + 1);
    }

    zoomOut() {
        if (this.map) this.map.setZoom(this.map.getZoom() - 1);
    }

    async getLocationName(lat, lng) {
        try {
            const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
            if (!response.ok) throw new Error('Geocoding failed');
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return data.results[0].formatted_address;
            }
            return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        } catch (error) {
            console.error('Google Maps geocoder error:', error.message);
            return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        }
    }

    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    this.map.setCenter({ lat: latitude, lng: longitude });
                    this.map.setZoom(10);
                },
                err => {
                    console.error('Geolocation error:', err.message);
                    alert('Could not get your location: ' + err.message);
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    resize() {
        if (this.map) google.maps.event.trigger(this.map, 'resize');
    }

    toggleStatsPanel() {
        const statsPanel = document.getElementById('stats-panel');
        statsPanel.style.display = statsPanel.style.display === 'block' ? 'none' : 'block';
    }

    onGoogleMapsLoaded() {
        this.initMap();
    }
}

window.FireMap = FireMap;
