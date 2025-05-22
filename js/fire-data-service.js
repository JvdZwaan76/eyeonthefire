class FireDataService {
  constructor(map) {
    this.map = map;
    this.markers = [];
    this.markerCluster = null;
    this.enableClustering = document.getElementById('enable-clustering').checked;
  }

  async fetchUSAFireData() {
    console.log('Fetching USA fire data');
    console.log('Skipping Turnstile token for fetchUSAFireData (Worker bypass)');
    const url = '/nasa/firms?source=MODIS_NRT&days=1&area=usa';
    console.log('Fetching fire data from:', url);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const csvData = await response.text();
      const results = Papa.parse(csvData, { header: true });
      this.applyFilterSettings(results.data);
    } catch (error) {
      console.error('Error fetching USA fire data:', error);
      this.showSampleData();
    }
  }

  showSampleData() {
    console.log('Showing sample data: 10 points');
    const sampleData = [
      { latitude: 40.7128, longitude: -74.0060, confidence: 80, frp: 50 },
      { latitude: 34.0522, longitude: -118.2437, confidence: 75, frp: 45 },
      { latitude: 41.8781, longitude: -87.6298, confidence: 70, frp: 40 },
      { latitude: 29.7604, longitude: -95.3698, confidence: 85, frp: 55 },
      { latitude: 33.4484, longitude: -112.0740, confidence: 90, frp: 60 },
      { latitude: 47.6062, longitude: -122.3321, confidence: 65, frp: 35 },
      { latitude: 39.7392, longitude: -104.9903, confidence: 70, frp: 40 },
      { latitude: 25.7617, longitude: -80.1918, confidence: 80, frp: 50 },
      { latitude: 36.1699, longitude: -115.1398, confidence: 75, frp: 45 },
      { latitude: 37.7749, longitude: -122.4194, confidence: 85, frp: 55 }
    ];
    this.applyFilterSettings(sampleData);
  }

  applyFilterSettings(data) {
    console.log('Applying filter settings');
    const minConfidence = parseInt(document.getElementById('confidence-range').value) || 0;
    const minFrp = parseInt(document.getElementById('frp-range').value) || 0;
    const filteredData = data.filter(fire => 
      parseFloat(fire.confidence) >= minConfidence && parseFloat(fire.frp) >= minFrp
    );
    console.log('Applied filters, filtered data:', filteredData.length, 'points');
    this.updateMarkers(filteredData);
  }

  updateMarkers(data) {
    console.log('Updating markers:', data.length, 'points');
    this.clearMarkers();
    this.markers = data.map(fire => this.createMarker(fire));
    if (this.enableClustering) {
      console.log('Marker clustering enabled');
      try {
        if (typeof markerClusterer !== 'undefined') {
          this.markerCluster = new markerClusterer.MarkerClusterer({
            map: this.map,
            markers: this.markers
          });
        } else {
          console.error('markerClusterer not loaded');
        }
      } catch (error) {
        console.error('Error initializing MarkerClusterer:', error);
      }
    }
  }

  clearMarkers() {
    console.log('Cleared markers');
    if (this.markerCluster) {
      this.markerCluster.clearMarkers();
      this.markerCluster = null;
    }
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }

  createMarker(fire) {
    console.log('Created marker:', fire.latitude, fire.longitude);
    return new google.maps.Marker({
      position: { lat: parseFloat(fire.latitude), lng: parseFloat(fire.longitude) },
      map: this.map,
      title: `Confidence: ${fire.confidence}, FRP: ${fire.frp}`
    });
  }

  initialize() {
    console.log('Initializing FireDataService with map');
    this.fetchUSAFireData();
  }
}

window.FireDataService = FireDataService;
console.log('FireDataService class defined globally');
