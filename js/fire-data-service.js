console.log('fire-data-service.js loaded successfully');

class FireDataService {
  constructor(map) {
    console.log('Initializing FireDataService with map');
    this.map = map;
    this.markers = [];
    this.markerCluster = null;
    this.heatmapLayer = null;
    this.data = [];
    this.filteredData = [];
    this.currentPage = 1;
    this.markersPerPage = 1000;
    this.initialLoadLimit = 100; // Load top 100 fires initially
    this.lazyLoadBatchSize = 100; // Lazy load in batches of 100
    if (!map) {
      console.error('Map object is undefined, attempting to retrieve from window.globalMap');
      this.map = window.globalMap;
      if (!this.map) {
        console.error('Map object is still undefined after retry, cannot initialize FireDataService');
        return;
      }
    }
    this.initialize();
  }

  async initialize() {
    console.log('Fetching USA fire data');
    await this.fetchUSAFireData();
  }

  async fetchUSAFireData() {
    console.log('Skipping Turnstile token for fetchUSAFireData (Worker bypass)');
    const url = 'https://firemap-worker.jaspervdz.workers.dev/nasa/firms?source=MODIS_NRT&days=1&area=usa';
    try {
      console.log('Fetching fire data from:', url);
      const response = await fetch(url);
      console.log('Fire data response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API responded with status ${response.status}: ${errorText}`);
      }
      const csvData = await response.text();
      console.log('Fire data received:', csvData.substring(0, 100));
      this.data = Papa.parse(csvData, { header: true }).data;
      // Sort data by FRP in descending order
      this.data.sort((a, b) => (parseFloat(b.frp) || 0) - (parseFloat(a.frp) || 0));
      console.log('Sorted data by FRP, total fires:', this.data.length);
      this.applyFilterSettings();
    } catch (error) {
      console.error('Error fetching USA fire data:', error.message);
      this.showSampleData();
    }
  }

  applyFilterSettings() {
    console.log('Applying filter settings');
    const dataSource = document.getElementById('data-source').value;
    const daysRange = parseInt(document.getElementById('days-range').value);
    const confidenceRange = parseInt(document.getElementById('confidence-range').value);
    const frpRange = parseInt(document.getElementById('frp-range').value);
    const enableClustering = document.getElementById('enable-clustering').checked;
    const showHeatmap = document.getElementById('show-heatmap').checked;

    this.filteredData = this.data.filter(item => {
      const confidence = parseInt(item.confidence) || 0;
      const frp = parseFloat(item.frp) || 0;
      return confidence >= confidenceRange && frp >= frpRange;
    });

    console.log('Applied filters, filtered data:', this.filteredData.length, 'points');
    // Initially load top 100 fires
    this.loadInitialFires();
    // Lazy load the rest in the background
    this.lazyLoadRemainingFires();
  }

  loadInitialFires() {
    const initialFires = this.filteredData.slice(0, this.initialLoadLimit);
    console.log('Loading initial top 100 fires:', initialFires.length);
    this.updateMarkers(initialFires);
  }

  async lazyLoadRemainingFires() {
    const remainingFires = this.filteredData.slice(this.initialLoadLimit);
    console.log('Starting lazy load of remaining fires:', remainingFires.length);
    for (let i = 0; i < remainingFires.length; i += this.lazyLoadBatchSize) {
      const batch = remainingFires.slice(i, i + this.lazyLoadBatchSize);
      console.log('Lazy loading batch:', i, 'to', i + batch.length);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async loading
      this.updateMarkers(batch, true); // Append to existing markers
    }
    console.log('Lazy loading complete');
  }

  showSampleData() {
    console.log('Showing sample data: 10 points');
    this.data = [
      { latitude: 40.7128, longitude: -74.0060, confidence: 80, frp: 50 },
      { latitude: 34.0522, longitude: -118.2437, confidence: 75, frp: 45 },
      { latitude: 41.8781, longitude: -87.6298, confidence: 70, frp: 40 },
      { latitude: 29.7604, longitude: -95.3698, confidence: 65, frp: 35 },
      { latitude: 33.4484, longitude: -112.0740, confidence: 60, frp: 30 },
      { latitude: 47.6062, longitude: -122.3321, confidence: 55, frp: 25 },
      { latitude: 39.7392, longitude: -104.9903, confidence: 50, frp: 20 },
      { latitude: 25.7617, longitude: -80.1918, confidence: 45, frp: 15 },
      { latitude: 36.1699, longitude: -115.1398, confidence: 40, frp: 10 },
      { latitude: 37.7749, longitude: -122.4194, confidence: 35, frp: 5 },
    ];
    this.data.sort((a, b) => (parseFloat(b.frp) || 0) - (parseFloat(a.frp) || 0));
    console.log('Sorted sample data by FRP, total fires:', this.data.length);
    this.applyFilterSettings();
  }

  updateMarkers(fires, append = false) {
    console.log('Updating markers:', fires.length, 'points, append:', append);
    if (!append) {
      this.clearMarkers();
    }
    fires.forEach(item => {
      const marker = this.createMarker(item);
      this.markers.push(marker);
    });
    if (document.getElementById('enable-clustering').checked) {
      console.log('Marker clustering enabled');
      if (this.markerCluster) {
        this.markerCluster.addMarkers(this.markers);
      } else {
        this.markerCluster = new MarkerClusterer(this.map, this.markers, { imagePath: 'https://unpkg.com/@googlemaps/markerclusterer@2.0.15/dist/images/m' });
      }
    }
    this.updatePagination();
  }

  clearMarkers() {
    console.log('Cleared markers');
    if (this.markerCluster) {
      this.markerCluster.clearMarkers();
    }
    this.markers = [];
  }

  createMarker(item) {
    const position = { lat: parseFloat(item.latitude), lng: parseFloat(item.longitude) };
    console.log(`Created marker: ${position.lat} ${position.lng}`);
    return new google.maps.Marker({
      position,
      map: this.map,
      title: `Confidence: ${item.confidence}%, FRP: ${item.frp} MW`,
    });
  }

  updatePagination() {
    console.log('Updated pagination: 1 of 1');
    // Simplified pagination for sample data
    document.getElementById('current-page').textContent = '1';
    document.getElementById('total-pages').textContent = '1';
  }
}

// Make FireDataService globally available
window.FireDataService = FireDataService;
console.log('FireDataService class defined globally');
