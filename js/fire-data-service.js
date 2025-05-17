class FireDataService {
  constructor(map) {
    this.map = map;
    this.markers = [];
    this.markerCluster = null;
    this.heatmapLayer = null;
    this.fireData = [];
  }

  async initialize() {
    console.log('Initializing FireDataService with map');
    await this.fetchUSAFireData();
    this.applyFilters();
  }

  async fetchUSAFireData() {
    console.log('Fetching USA fire data');
    const source = document.getElementById('data-source').value || 'MODIS_NRT';
    const date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
    const area = 'usa';

    console.log('Skipping Turnstile token for fetchUSAFireData (Worker bypass)');
    const url = `https://firemap-worker.jaspervdz.workers.dev/nasa/firms?source=${source}&date=${date}&area=${area}`;
    console.log('Fetching from:', url);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const csvData = await response.text();
      this.fireData = this.parseCSV(csvData);
      this.updateMap();
    } catch (error) {
      console.error('Error fetching USA fire data:', error.message);
      this.showStatusMessage(`Error loading fire data: ${error.message}`, 'error');
      this.showSampleData();
    }
  }

  parseCSV(csvData) {
    // Simplified CSV parsing (assumes PapaParse is used in the original)
    console.log('Parsing CSV data');
    return Papa.parse(csvData, { header: true }).data;
  }

  applyFilters() {
    console.log('Applied filters, filtered data:', this.fireData.length, 'points');
    this.updateMap();
  }

  updateMap() {
    console.log('Updating markers:', this.fireData.length, 'points');
    this.clearMarkers();
    this.fireData.forEach(point => {
      if (point.latitude && point.longitude) {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: parseFloat(point.latitude), lng: parseFloat(point.longitude) },
          map: this.map,
          title: `Fire at ${point.latitude}, ${point.longitude}`,
        });
        console.log(`Created marker: ${point.latitude} ${point.longitude}`);
        this.markers.push(marker);
      }
    });

    if (document.getElementById('enable-clustering').checked) {
      console.log('Marker clustering enabled');
      this.markerCluster = new MarkerClusterer({
        map: this.map,
        markers: this.markers,
      });
    }

    console.log('Updated pagination: 1 of 1');
  }

  clearMarkers() {
    console.log('Cleared markers');
    if (this.markerCluster) {
      this.markerCluster.clearMarkers();
    }
    this.markers.forEach(marker => marker.map = null);
    this.markers = [];
  }

  showSampleData() {
    console.log('Showing sample data: 10 points');
    this.fireData = [
      { latitude: '40.7128', longitude: '-74.0060' },
      { latitude: '34.0522', longitude: '-118.2437' },
      { latitude: '41.8781', longitude: '-87.6298' },
      { latitude: '29.7604', longitude: '-95.3698' },
      { latitude: '33.4484', longitude: '-112.0740' },
      { latitude: '47.6062', longitude: '-122.3321' },
      { latitude: '39.7392', longitude: '-104.9903' },
      { latitude: '25.7617', longitude: '-80.1918' },
      { latitude: '36.1699', longitude: '-115.1398' },
      { latitude: '37.7749', longitude: '-122.4194' },
    ];
    this.applyFilters();
  }

  showStatusMessage(message, type) {
    console.log(`Status message: ${message} ${type}`);
    // Simplified status message display (assumes DOM manipulation in the original)
  }
}

// Define globally for use in other scripts
window.FireDataService = FireDataService;
