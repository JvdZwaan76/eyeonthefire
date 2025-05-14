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
      totalPagesEl.textContent = total -papaparse@latest/papaparse.min.js"></script>
    <script src="https://unpkg.com/@googlemaps/markerclusterer@2.0.15/dist/index.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Fire Data Service -->
    <script src="/js/fire-data-service.js"></script>

    <!-- Map Integration Script -->
    <script src="/js/map-integration.js"></script>

    <!-- Main Script -->
    <script src="/js/main.js"></script>
</body>
</html>
