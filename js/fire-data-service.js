/**
 * Fire Map API Integration
 * Fetches real-time fire data from NASA FIRMS via Cloudflare Worker
 */

// Configuration
const fireMapConfig = {
  apiEndpoint: 'https://firemap-worker.jaspervdz.workers.dev/nasa/firms',
  mapDefaults: {
    center: { lat: 39.5, lng: -98.35 }, // USA center
    zoom: 4,
    maxZoom: 18,
    minZoom: 3,
  },
  usaBounds: {
    north: 49,
    south: 24,
    east: -66,
    west: -125,
    territories: [
      { name: 'Alaska', north: 71, south: 51, east: -130, west: -170 },
      { name: 'Hawaii', north: 23, south: 18, east: -154, west: -160 },
    ],
  },
};

// FireData class handles data fetching and processing
class FireDataService {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.markers = [];
    this.markerClusterer = null;
    this.map = null;
    this.isLoading = false;
    this.lastFetchTime = null;
    this.abortController = null;
    this.settings = {
      source: 'MODIS_NRT',
      days: '1',
      minConfidence: 0,
      minFrp: 0,
      clustering: true,
      heatmap: false,
      lazyLoading: true,
      maxMarkers: 1000,
      currentPage: 1,
    };
  }

  initialize(mapInstance) {
    this.map = mapInstance;
    if (this.map && this.settings.lazyLoading) {
      this.map.addListener('idle', () => {
        if (this.isViewportChanged()) {
          this.fetchDataForViewport();
        }
      });
    }
    this.fetchUSAFireData();
  }

  isViewportChanged() {
    if (!this.map || !this.lastViewport) return true;
    const bounds = this.map.getBounds();
    if (!bounds) return true;
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const newViewport = {
      north: ne.lat(),
      east: ne.lng(),
      south: sw.lat(),
      west: sw.lng(),
    };
    const latDiff =
      Math.abs(this.lastViewport.north - newViewport.north) +
      Math.abs(this.lastViewport.south - newViewport.south);
    const lngDiff =
      Math.abs(this.lastViewport.east - newViewport.east) +
      Math.abs(this.lastViewport.west - newViewport.west);
    this.lastViewport = newViewport;
    return latDiff > 0.1 || lngDiff > 0.1;
  }

  async fetchUSAFireData() {
    this.setLoading(true);
    this.showLoadingMessage('Loading USA fire data...');
    try {
      this.cancelPendingRequests();
      this.abortController = new AbortController();
      const params = new URLSearchParams();
      params.append('source', this.settings.source);
      params.append('days', this.settings.days);
      params.append('area', 'usa');
      const token = await this.getTurnstileToken();
      if (token) {
        params.append('cf-turnstile-token', token);
      }
      const response = await fetch(`${fireMapConfig.apiEndpoint}?${params.toString()}`, {
        method: 'GET',
        signal: this.abortController.signal,
        headers: { 'Accept': 'text/csv' },
      });
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const csvData = await response.text();
      const data = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;
      if (Array.isArray(data)) {
        this.processFireData(data);
        this.showStatusMessage(`Loaded ${data.length} fire data points for USA`, 'success');
        this.lastFetchTime = new Date();
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted', error);
        return;
      }
      console.error('Error fetching USA fire data:', error);
      this.showStatusMessage(`Error loading fire data: ${error.message}`, 'error');
      this.showSampleData();
    } finally {
      this.setLoading(false);
      this.hideLoadingMessage();
    }
  }

  async fetchDataForViewport() {
    if (!this.map || this.isLoading) return;
    const bounds = this.map.getBounds();
    if (!bounds) return;
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    this.setLoading(true);
    this.showRegionLoadingIndicator();
    try {
      this.cancelPendingRequests();
      this.abortController = new AbortController();
      const params = new URLSearchParams();
      params.append('source', this.settings.source);
      params.append('days', this.settings.days);
      params.append('north', ne.lat().toFixed(6));
      params.append('south', sw.lat().toFixed(6));
      params.append('east', ne.lng().toFixed(6));
      params.append('west', sw.lng().toFixed(6));
      const token = await this.getTurnstileToken();
      if (token) {
        params.append('cf-turnstile-token', token);
      }
      const response = await fetch(`${fireMapConfig.apiEndpoint}?${params.toString()}`, {
        method: 'GET',
        signal: this.abortController.signal,
        headers: { 'Accept': 'text/csv' },
      });
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const csvData = await response.text();
      const data = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;
      if (Array.isArray(data)) {
        this.mergeFireData(data);
        this.showStatusMessage(`Loaded ${data.length} fire data points for this region`, 'success');
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted', error);
        return;
      }
      console.error('Error fetching fire data for viewport:', error);
      this.showStatusMessage(`Error loading fire data: ${error.message}`, 'error');
    } finally {
      this.setLoading(false);
      this.hideRegionLoadingIndicator();
    }
  }

  async getTurnstileToken() {
    return new Promise((resolve) => {
      if (window.turnstile) {
        fetch('https://firemap-worker.jaspervdz.workers.dev/api-keys')
          .then((res) => res.json())
          .then((keys) => {
            if (keys.turnstileSiteKey) {
              window.turnstile.render('#turnstile-container', {
                sitekey: keys.turnstileSiteKey,
                callback: (token) => resolve(token),
                'expired-callback': () => resolve(null),
                'error-callback': () => resolve(null),
              });
            } else {
              resolve(null);
            }
          })
          .catch(() => resolve(null));
      } else {
        resolve(null);
      }
    });
  }

  processFireData(data) {
    if (!Array.isArray(data)) {
      console.error('Invalid data format received');
      return;
    }
    this.data = data.map((point) => {
      const lat = parseFloat(point.latitude);
      const lng = parseFloat(point.longitude);
      const confidence = parseInt(point.confidence || 0);
      const frp = parseFloat(point.frp || 0);
      const acqDate = point.acq_date || '';
      const acqTime = point.acq_time || '';
      const formattedDate = this.formatDateTime(acqDate, acqTime);
      return {
        ...point,
        lat,
        lng,
        confidence,
        frp,
        formattedDate,
      };
    });
    this.applyFilters();
    this.updateMarkers();
  }

  formatDateTime(dateStr, timeStr) {
    if (!dateStr) return 'Unknown date';
    const dateParts = dateStr.split('-');
    if (dateParts.length !== 3) return dateStr;
    const year = dateParts[0];
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);
    let timeFormatted = '';
    if (timeStr) {
      const timeValue = timeStr.toString().padStart(4, '0');
      const hours = timeValue.substring(0, 2);
      const minutes = timeValue.substring(2, 4);
      timeFormatted = ` at ${hours}:${minutes}`;
    }
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${months[month - 1]} ${day}, ${year}${timeFormatted}`;
  }

  mergeFireData(newData) {
    if (!Array.isArray(newData) || newData.length === 0) return;
    const existingIds = new Set();
    this.data.forEach((point) => {
      const id = `${point.lat},${point.lng},${point.acq_date || ''},${point.acq_time || ''}`;
      existingIds.add(id);
    });
    const uniqueNewData = newData.filter((point) => {
      const lat = parseFloat(point.latitude);
      const lng = parseFloat(point.longitude);
      const id = `${lat},${lng},${point.acq_date || ''},${point.acq_time || ''}`;
      return !existingIds.has(id);
    });
    const processedNewData = uniqueNewData.map((point) => {
      const lat = parseFloat(point.latitude);
      const lng = parseFloat(point.longitude);
      const confidence = parseInt(point.confidence || 0);
      const frp = parseFloat(point.frp || 0);
      const acqDate = point.acq_date || '';
      const acqTime = point.acq_time || '';
      const formattedDate = this.formatDateTime(acqDate, acqTime);
      return {
        ...point,
        lat,
        lng,
        confidence,
        frp,
        formattedDate,
      };
    });
    this.data = [...this.data, ...processedNewData];
    this.applyFilters();
    this.updateMarkers();
  }

  applyFilters() {
    this.filteredData = this.data.filter((point) => {
      if (point.confidence < this.settings.minConfidence) return false;
      if (point.frp < this.settings.minFrp) return false;
      return true;
    });
    this.updateFilterStatus();
  }

  updateFilterStatus() {
    const activeFiltersElement = document.getElementById('active-filters');
    if (!activeFiltersElement) return;
    activeFiltersElement.innerHTML = '';
    const filters = [];
    if (this.settings.minConfidence > 0) {
      filters.push(`Confidence >= ${this.settings.minConfidence}%`);
    }
    if (this.settings.minFrp > 0) {
      filters.push(`Fire Power >= ${this.settings.minFrp} MW`);
    }
    if (this.settings.source !== 'MODIS_NRT') {
      filters.push(`Source: ${this.settings.source}`);
    }
    if (this.settings.days !== '1') {
      filters.push(`Last ${this.settings.days} days`);
    }
    if (filters.length > 0) {
      const filterTitle = document.createElement('div');
      filterTitle.className = 'mb-2 fw-bold';
      filterTitle.textContent = 'Active Filters:';
      activeFiltersElement.appendChild(filterTitle);
      const filterContainer = document.createElement('div');
      filters.forEach((filter) => {
        const filterTag = document.createElement('span');
        filterTag.className = 'filter-tag';
        filterTag.textContent = filter;
        filterContainer.appendChild(filterTag);
      });
      activeFiltersElement.appendChild(filterContainer);
    }
    this.updatePagination();
  }

  updatePagination() {
    const currentPageEl = document.getElementById('current-page');
    const totalPagesEl = document.getElementById('total-pages');
    if (currentPageEl && totalPagesEl) {
      const totalPages = Math.ceil(this.filteredData.length / this.settings.maxMarkers);
      currentPageEl.textContent = this.settings.currentPage;
      totalPagesEl.textContent = totalPages > 0 ? totalPages : 1;
    }
  }

  updateMarkers() {
    if (!this.map) return;
    this.clearMarkers();
    const totalPages = Math.ceil(this.filteredData.length / this.settings.maxMarkers);
    this.settings.currentPage = Math.min(this.settings.currentPage, totalPages);
    if (this.settings.currentPage < 1) this.settings.currentPage = 1;
    const startIndex = (this.settings.currentPage - 1) * this.settings.maxMarkers;
    const endIndex = startIndex + this.settings.maxMarkers;
    const dataSlice = this.filteredData.slice(startIndex, endIndex);
    this.markers = dataSlice.map((point) => this.createMarker(point));
    if (this.settings.clustering && window.markerClusterer) {
      this.markerClusterer = new markerClusterer.MarkerClusterer({
        map: this.map,
        markers: this.markers,
        algorithm: new markerClusterer.SuperClusterAlgorithm({
          radius: 100,
          maxZoom: 15,
        }),
      });
    }
    if (this.settings.heatmap && google.maps.visualization) {
      this.createHeatmap();
    }
    this.updatePagination();
  }

  createMarker(point) {
    let color = '#FFCC00';
    if (point.confidence >= 80) {
      color = '#FF0000';
    } else if (point.confidence >= 60) {
      color = '#FF4500';
    } else if (point.confidence >= 30) {
      color = '#FFA500';
    }
    let size = 8;
    if (point.frp > 100) {
      size = 16;
    } else if (point.frp > 50) {
      size = 14;
    } else if (point.frp > 20) {
      size = 12;
    } else if (point.frp > 10) {
      size = 10;
    }
    const marker = new google.maps.Marker({
      position: { lat: point.lat, lng: point.lng },
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 0.8,
        strokeColor: 'white',
        strokeWeight: 1,
        scale: size,
      },
      zIndex: Math.floor(point.confidence),
      title: `Fire detected on ${point.formattedDate}`,
    });
    marker.addListener('click', () => {
      const infoWindow = new google.maps.InfoWindow({
        content: this.createInfoWindowContent(point),
      });
      infoWindow.open(this.map, marker);
    });
    return marker;
  }

  createInfoWindowContent(point) {
    return `
      <div class="fire-info">
        <h5>Fire Hotspot</h5>
        <p><strong>Detected:</strong> ${point.formattedDate}</p>
        <p><strong>Confidence:</strong> ${point.confidence}%</p>
        <p><strong>Fire Power:</strong> ${point.frp} MW</p>
        <p><strong>Location:</strong> ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}</p>
        <p><small>Source: ${point.satellite || 'NASA FIRMS'}</small></p>
      </div>
    `;
  }

  createHeatmap() {
    if (!google.maps.visualization || !this.map) return;
    if (this.heatmap) {
      this.heatmap.setMap(null);
    }
    const heatmapData = this.filteredData.map((point) => {
      const weight = Math.min(1, point.frp / 100);
      return {
        location: new google.maps.LatLng(point.lat, point.lng),
        weight: weight,
      };
    });
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: this.map,
      radius: 20,
      opacity: 0.7,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)',
      ],
    });
  }

  clearMarkers() {
    this.markers.forEach((marker) => marker.setMap(null));
    this.markers = [];
    if (this.markerClusterer) {
      this.markerClusterer.clearMarkers();
      this.markerClusterer = null;
    }
    if (this.heatmap) {
      this.heatmap.setMap(null);
      this.heatmap = null;
    }
  }

  cancelPendingRequests() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
  }

  showLoadingMessage(message) {
    const loadingMessage = document.getElementById('loading-data-message');
    if (loadingMessage) {
      const textNode = loadingMessage.querySelector('span + text') || loadingMessage;
      if (textNode) {
        textNode.textContent = message || 'Loading data...';
      }
      loadingMessage.style.display = 'block';
    }
  }

  hideLoadingMessage() {
    const loadingMessage = document.getElementById('loading-data-message');
    if (loadingMessage) {
      loadingMessage.style.display = 'none';
    }
  }

  showRegionLoadingIndicator() {
    const regionLoading = document.getElementById('region-loading');
    if (regionLoading) {
      regionLoading.style.display = 'block';
    }
  }

  hideRegionLoadingIndicator() {
    const regionLoading = document.getElementById('region-loading');
    if (regionLoading) {
      regionLoading.style.display = 'none';
    }
  }

  showStatusMessage(message, type = 'info') {
    const statusPanel = document.getElementById('status-panel');
    if (!statusPanel) return;
    statusPanel.textContent = message;
    statusPanel.style.display = 'block';
    switch (type) {
      case 'error':
        statusPanel.style.borderLeft = '4px solid #dc3545';
        break;
      case 'success':
        statusPanel.style.borderLeft = '4px solid #28a745';
        setTimeout(() => {
          statusPanel.style.display = 'none';
        }, 5000);
        break;
      case 'warning':
        statusPanel.style.borderLeft = '4px solid #ffc107';
        break;
      default:
        statusPanel.style.borderLeft = '4px solid #17a2b8';
    }
  }

  applyFilterSettings() {
    const dataSource = document.getElementById('data-source');
    if (dataSource) {
      this.settings.source = dataSource.value;
    }
    const daysRange = document.getElementById('days-range');
    if (daysRange) {
      this.settings.days = daysRange.value;
    }
    const confidenceRange = document.getElementById('confidence-range');
    if (confidenceRange) {
      this.settings.minConfidence = parseInt(confidenceRange.value);
    }
    const frpRange = document.getElementById('frp-range');
    if (frpRange) {
      this.settings.minFrp = parseInt(frpRange.value);
    }
    const enableClustering = document.getElementById('enable-clustering');
    if (enableClustering) {
      this.settings.clustering = enableClustering.checked;
    }
    const showHeatmap = document.getElementById('show-heatmap');
    if (showHeatmap) {
      this.settings.heatmap = showHeatmap.checked;
    }
    const lazyLoading = document.getElementById('lazy-loading');
    if (lazyLoading) {
      this.settings.lazyLoading = lazyLoading.checked;
    }
    const markersPerPage = document.getElementById('markers-per-page');
    if (markersPerPage) {
      this.settings.maxMarkers = parseInt(markersPerPage.value);
    }
    this.settings.currentPage = 1;
    this.applyFilters();
    this.updateMarkers();
    if (this.settings.lazyLoading) {
      this.fetchDataForViewport();
    } else {
      this.fetchUSAFireData();
    }
  }

  resetFilters() {
    const dataSource = document.getElementById('data-source');
    if (dataSource) {
      dataSource.value = 'MODIS_NRT';
    }
    const daysRange = document.getElementById('days-range');
    if (daysRange) {
      daysRange.value = '1';
    }
    const confidenceRange = document.getElementById('confidence-range');
    if (confidenceRange) {
      confidenceRange.value = '0';
    }
    const confidenceMin = document.getElementById('confidence-min');
    if (confidenceMin) {
      confidenceMin.textContent = '0%';
    }
    const frpRange = document.getElementById('frp-range');
    if (frpRange) {
      frpRange.value = '0';
    }
    const frpMin = document.getElementById('frp-min');
    if (frpMin) {
      frpMin.textContent = '0';
    }
    this.settings = {
      source: 'MODIS_NRT',
      days: '1',
      minConfidence: 0,
      minFrp: 0,
      clustering: true,
      heatmap: false,
      lazyLoading: true,
      maxMarkers: 1000,
      currentPage: 1,
    };
    this.applyFilters();
    this.updateMarkers();
    this.fetchUSAFireData();
  }

  showStatistics() {
    const statsPanel = document.getElementById('stats-panel');
    const statsContent = document.getElementById('stats-content');
    if (!statsPanel || !statsContent) return;
    statsContent.innerHTML = '';
    const countByConfidence = {
      high: 0,
      medium: 0,
      low: 0,
      veryLow: 0,
    };
    this.data.forEach((point) => {
      if (point.confidence >= 80) {
        countByConfidence.high++;
      } else if (point.confidence >= 60) {
        countByConfidence.medium++;
      } else if (point.confidence >= 30) {
        countByConfidence.low++;
      } else {
        countByConfidence.veryLow++;
      }
    });
    const totalFires = this.data.length;
    const filteredFires = this.filteredData.length;
    statsContent.innerHTML = `
      <div class="mb-3">
        <strong>Total Fire Hotspots:</strong> ${totalFires.toLocaleString()}
      </div>
      <div class="mb-3">
        <strong>After Filtering:</strong> ${filteredFires.toLocaleString()}
      </div>
      <div class="mb-3">
        <strong>By Confidence Level:</strong>
        <ul class="list-unstyled mt-2">
          <li class="d-flex align-items-center mb-1">
            <span class="legend-color legend-high me-2"></span>
            High (80-100%): ${countByConfidence.high.toLocaleString()}
          </li>
          <li class="d-flex align-items-center mb-1">
            <span class="legend-color legend-medium me-2"></span>
            Medium (60-79%): ${countByConfidence.medium.toLocaleString()}
          </li>
          <li class="d-flex align-items-center mb-1">
            <span class="legend-color legend-low me-2"></span>
            Low (30-59%): ${countByConfidence.low.toLocaleString()}
          </li>
          <li class="d-flex align-items-center">
            <span class="legend-color legend-very-low me-2"></span>
            Very Low (0-29%): ${countByConfidence.veryLow.toLocaleString()}
          </li>
        </ul>
      </div>
      <div>
        <strong>Data Source:</strong> ${this.settings.source}
      </div>
      <div>
        <strong>Time Range:</strong> Last ${this.settings.days} day(s)
      </div>
      <div class="mt-3 text-muted">
        <small>Data provided by NASA FIRMS and processed in real-time. Last updated: ${new Date().toLocaleString()}</small>
      </div>
    `;
    statsPanel.style.display = 'block';
  }

  showSampleData() {
    if (!this.map) return;
    const samplePoints = [
      { lat: 40.7128, lng: -74.006, confidence: 95, frp: 75, acq_date: '2025-05-13' },
      { lat: 34.0522, lng: -118.2437, confidence: 80, frp: 50, acq_date: '2025-05-13' },
      { lat: 41.8781, lng: -87.6298, confidence: 65, frp: 30, acq_date: '2025-05-13' },
      { lat: 29.7604, lng: -95.3698, confidence: 40, frp: 15, acq_date: '2025-05-14' },
      { lat: 33.4484, lng: -112.074, confidence: 20, frp: 5, acq_date: '2025-05-14' },
      { lat: 47.6062, lng: -122.3321, confidence: 85, frp: 60, acq_date: '2025-05-14' },
      { lat: 39.7392, lng: -104.9903, confidence: 70, frp: 40, acq_date: '2025-05-14' },
      { lat: 25.7617, lng: -80.1918, confidence: 50, frp: 25, acq_date: '2025-05-14' },
      { lat: 36.1699, lng: -115.1398, confidence: 30, frp: 10, acq_date: '2025-05-14' },
      { lat: 37.7749, lng: -122.4194, confidence: 90, frp: 80, acq_date: '2025-05-14' },
    ];
    this.data = samplePoints.map((point) => ({
      ...point,
      formattedDate: this.formatDateTime(point.acq_date, ''),
    }));
    this.applyFilters();
    this.updateMarkers();
    this.showStatusMessage('Note: Showing sample data as API could not be reached', 'warning');
  }
}

window.FireDataService = FireDataService;
