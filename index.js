Navigated to https://eyeonthefire.pages.dev/
map-integration.js:232 DOM loaded, initializing map script
map-integration.js:33 Fetching API keys for Google Maps
map-integration.js:11 Fetching API keys from: https://firemap-worker.jaspervdz.workers.dev/api-keys
map-integration.js:206 Setting up range displays
map-integration.js:224 Updating footer year
main.js:11 Initializing site
main.js:36 Setting up mobile menu
main.js:60 Setting up scroll effect
main.js:74 Setting up smooth scrolling
main.js:23 Google Maps API not available, setting initMap callback
main.js:163 Setting up map controls
map-integration.js:18 API keys received: {googleMaps: 'AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk', turnstileSiteKey: '0x4AAAAAABc1nqDeCwRviFAi'}
map-integration.js:40 Loading Google Maps script with key: AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk
map-integration.js:50 Google Maps script appended
main.js:109 Initializing Google Map
main.js:142 Map created, hiding loading overlay
main.js:156 Initializing FireDataService
fire-data-service.js:52 Initializing FireDataService with map
fire-data-service.js:87 Fetching USA fire data
fire-data-service.js:98 Skipping Turnstile token for fetchUSAFireData (Worker bypass)
fire-data-service.js:108 Received CSV data: Invalid area. Expects: [west,south,east,north].
fire-data-service.js:193 Processing fire data: 0 points
fire-data-service.js:288 Applied filters, filtered data: 0 points
fire-data-service.js:333 Updated pagination: 1 of 0
fire-data-service.js:342 Updating markers: 0 points
fire-data-service.js:472 Cleared markers
fire-data-service.js:360 Marker clustering enabled
fire-data-service.js:333 Updated pagination: 1 of 0
fire-data-service.js:539 Status message: Loaded 0 fire data points for USA success
Navigated to https://eyeonthefire.pages.dev/
map-integration.js:232 DOM loaded, initializing map script
map-integration.js:33 Fetching API keys for Google Maps
map-integration.js:11 Fetching API keys from: https://firemap-worker.jaspervdz.workers.dev/api-keys
map-integration.js:206 Setting up range displays
map-integration.js:224 Updating footer year
main.js:11 Initializing site
main.js:36 Setting up mobile menu
main.js:60 Setting up scroll effect
main.js:74 Setting up smooth scrolling
main.js:23 Google Maps API not available, setting initMap callback
main.js:163 Setting up map controls
map-integration.js:18 API keys received: {googleMaps: 'AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk', turnstileSiteKey: '0x4AAAAAABc1nqDeCwRviFAi'}
map-integration.js:40 Loading Google Maps script with key: AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk
map-integration.js:50 Google Maps script appended
main.js:109 Initializing Google Map
main.js:142 Map created, hiding loading overlay
main.js:156 Initializing FireDataService
fire-data-service.js:52 Initializing FireDataService with map
fire-data-service.js:87 Fetching USA fire data
fire-data-service.js:98 Skipping Turnstile token for fetchUSAFireData (Worker bypass)
fire-data-service.js:108 Received CSV data: Invalid date format. Expects YYYY-MM-DD.
fire-data-service.js:193 Processing fire data: 0 points
fire-data-service.js:288 Applied filters, filtered data: 0 points
fire-data-service.js:333 Updated pagination: 1 of 0
fire-data-service.js:342 Updating markers: 0 points
fire-data-service.js:472 Cleared markers
fire-data-service.js:360 Marker clustering enabled
fire-data-service.js:333 Updated pagination: 1 of 0
fire-data-service.js:539 Status message: Loaded 0 fire data points for USA success
Navigated to https://eyeonthefire.pages.dev/
map-integration.js:232 DOM loaded, initializing map script
map-integration.js:33 Fetching API keys for Google Maps
map-integration.js:11 Fetching API keys from: https://firemap-worker.jaspervdz.workers.dev/api-keys
map-integration.js:206 Setting up range displays
map-integration.js:224 Updating footer year
main.js:11 Initializing site
main.js:36 Setting up mobile menu
main.js:60 Setting up scroll effect
main.js:74 Setting up smooth scrolling
main.js:23 Google Maps API not available, setting initMap callback
main.js:163 Setting up map controls
map-integration.js:18 API keys received: {googleMaps: 'AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk', turnstileSiteKey: '0x4AAAAAABc1nqDeCwRviFAi'}
map-integration.js:40 Loading Google Maps script with key: AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk
map-integration.js:50 Google Maps script appended
main.js:109 Initializing Google Map
main.js:142 Map created, hiding loading overlay
main.js:156 Initializing FireDataService
fire-data-service.js:52 Initializing FireDataService with map
fire-data-service.js:87 Fetching USA fire data
fire-data-service.js:98 Skipping Turnstile token for fetchUSAFireData (Worker bypass)
fire-data-service.js:99 
            
            
           GET https://firemap-worker.jaspervdz.workers.dev/nasa/firms?source=MODIS_NRT&days=1&area=usa 500 (Internal Server Error)
fetchUSAFireData @ fire-data-service.js:99
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:122 Error fetching USA fire data: Error: API responded with status 500
    at FireDataService.fetchUSAFireData (fire-data-service.js:105:15)
fetchUSAFireData @ fire-data-service.js:122
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:539 Status message: Error loading fire data: API responded with status 500 error
fire-data-service.js:712 Showing sample data: 10 points
fire-data-service.js:288 Applied filters, filtered data: 10 points
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:342 Updating markers: 10 points
fire-data-service.js:472 Cleared markers
main.js:174 As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/deprecations for additional details and https://developers.google.com/maps/documentation/javascript/advanced-markers/migration for the migration guide.
_.kl @ main.js:174
createMarker @ fire-data-service.js:388
(anonymous) @ fire-data-service.js:350
updateMarkers @ fire-data-service.js:350
showSampleData @ fire-data-service.js:714
fetchUSAFireData @ fire-data-service.js:124
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:408 Created marker: 40.7128 -74.006
fire-data-service.js:408 Created marker: 34.0522 -118.2437
fire-data-service.js:408 Created marker: 41.8781 -87.6298
fire-data-service.js:408 Created marker: 29.7604 -95.3698
fire-data-service.js:408 Created marker: 33.4484 -112.074
fire-data-service.js:408 Created marker: 47.6062 -122.3321
fire-data-service.js:408 Created marker: 39.7392 -104.9903
fire-data-service.js:408 Created marker: 25.7617 -80.1918
fire-data-service.js:408 Created marker: 36.1699 -115.1398
fire-data-service.js:408 Created marker: 37.7749 -122.4194
fire-data-service.js:360 Marker clustering enabled
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:539 Status message: Note: Showing sample data as API could not be reached warning
Navigated to https://eyeonthefire.pages.dev/
map-integration.js:232 DOM loaded, initializing map script
map-integration.js:33 Fetching API keys for Google Maps
map-integration.js:11 Fetching API keys from: https://firemap-worker.jaspervdz.workers.dev/api-keys
map-integration.js:206 Setting up range displays
map-integration.js:224 Updating footer year
main.js:11 Initializing site
main.js:36 Setting up mobile menu
main.js:60 Setting up scroll effect
main.js:74 Setting up smooth scrolling
main.js:23 Google Maps API not available, setting initMap callback
main.js:163 Setting up map controls
map-integration.js:18 API keys received: {googleMaps: 'AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk', turnstileSiteKey: '0x4AAAAAABc1nqDeCwRviFAi'}
map-integration.js:40 Loading Google Maps script with key: AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk
map-integration.js:50 Google Maps script appended
main.js:109 Initializing Google Map
main.js:142 Map created, hiding loading overlay
main.js:156 Initializing FireDataService
fire-data-service.js:52 Initializing FireDataService with map
fire-data-service.js:87 Fetching USA fire data
fire-data-service.js:98 Skipping Turnstile token for fetchUSAFireData (Worker bypass)
fire-data-service.js:99 
            
            
           GET https://firemap-worker.jaspervdz.workers.dev/nasa/firms?source=MODIS_NRT&days=1&area=usa 500 (Internal Server Error)
fetchUSAFireData @ fire-data-service.js:99
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:122 Error fetching USA fire data: Error: API responded with status 500
    at FireDataService.fetchUSAFireData (fire-data-service.js:105:15)
fetchUSAFireData @ fire-data-service.js:122
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:539 Status message: Error loading fire data: API responded with status 500 error
fire-data-service.js:712 Showing sample data: 10 points
fire-data-service.js:288 Applied filters, filtered data: 10 points
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:342 Updating markers: 10 points
fire-data-service.js:472 Cleared markers
main.js:174 As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/deprecations for additional details and https://developers.google.com/maps/documentation/javascript/advanced-markers/migration for the migration guide.
_.kl @ main.js:174
createMarker @ fire-data-service.js:388
(anonymous) @ fire-data-service.js:350
updateMarkers @ fire-data-service.js:350
showSampleData @ fire-data-service.js:714
fetchUSAFireData @ fire-data-service.js:124
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:408 Created marker: 40.7128 -74.006
fire-data-service.js:408 Created marker: 34.0522 -118.2437
fire-data-service.js:408 Created marker: 41.8781 -87.6298
fire-data-service.js:408 Created marker: 29.7604 -95.3698
fire-data-service.js:408 Created marker: 33.4484 -112.074
fire-data-service.js:408 Created marker: 47.6062 -122.3321
fire-data-service.js:408 Created marker: 39.7392 -104.9903
fire-data-service.js:408 Created marker: 25.7617 -80.1918
fire-data-service.js:408 Created marker: 36.1699 -115.1398
fire-data-service.js:408 Created marker: 37.7749 -122.4194
fire-data-service.js:360 Marker clustering enabled
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:539 Status message: Note: Showing sample data as API could not be reached warning
Navigated to https://eyeonthefire.pages.dev/
map-integration.js:232 DOM loaded, initializing map script
map-integration.js:33 Fetching API keys for Google Maps
map-integration.js:11 Fetching API keys from: https://firemap-worker.jaspervdz.workers.dev/api-keys
map-integration.js:206 Setting up range displays
map-integration.js:224 Updating footer year
main.js:11 Initializing site
main.js:36 Setting up mobile menu
main.js:60 Setting up scroll effect
main.js:74 Setting up smooth scrolling
main.js:23 Google Maps API not available, setting initMap callback
main.js:163 Setting up map controls
map-integration.js:18 API keys received: {googleMaps: 'AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk', turnstileSiteKey: '0x4AAAAAABc1nqDeCwRviFAi'}
map-integration.js:40 Loading Google Maps script with key: AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk
map-integration.js:50 Google Maps script appended
main.js:109 Initializing Google Map
main.js:142 Map created, hiding loading overlay
main.js:156 Initializing FireDataService
fire-data-service.js:52 Initializing FireDataService with map
fire-data-service.js:87 Fetching USA fire data
fire-data-service.js:98 Skipping Turnstile token for fetchUSAFireData (Worker bypass)
fire-data-service.js:99 
            
            
           GET https://firemap-worker.jaspervdz.workers.dev/nasa/firms?source=MODIS_NRT&days=1&area=usa 500 (Internal Server Error)
fetchUSAFireData @ fire-data-service.js:99
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:122 Error fetching USA fire data: Error: API responded with status 500
    at FireDataService.fetchUSAFireData (fire-data-service.js:105:15)
fetchUSAFireData @ fire-data-service.js:122
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:539 Status message: Error loading fire data: API responded with status 500 error
fire-data-service.js:712 Showing sample data: 10 points
fire-data-service.js:288 Applied filters, filtered data: 10 points
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:342 Updating markers: 10 points
fire-data-service.js:472 Cleared markers
main.js:174 As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/deprecations for additional details and https://developers.google.com/maps/documentation/javascript/advanced-markers/migration for the migration guide.
_.kl @ main.js:174
createMarker @ fire-data-service.js:388
(anonymous) @ fire-data-service.js:350
updateMarkers @ fire-data-service.js:350
showSampleData @ fire-data-service.js:714
fetchUSAFireData @ fire-data-service.js:124
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:408 Created marker: 40.7128 -74.006
fire-data-service.js:408 Created marker: 34.0522 -118.2437
fire-data-service.js:408 Created marker: 41.8781 -87.6298
fire-data-service.js:408 Created marker: 29.7604 -95.3698
fire-data-service.js:408 Created marker: 33.4484 -112.074
fire-data-service.js:408 Created marker: 47.6062 -122.3321
fire-data-service.js:408 Created marker: 39.7392 -104.9903
fire-data-service.js:408 Created marker: 25.7617 -80.1918
fire-data-service.js:408 Created marker: 36.1699 -115.1398
fire-data-service.js:408 Created marker: 37.7749 -122.4194
fire-data-service.js:360 Marker clustering enabled
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:539 Status message: Note: Showing sample data as API could not be reached warning
util.js:38 
            
            
           GET https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Google+Sans:400,500,700|Google+Sans+Text:400,500,700&lang=en net::ERR_SOCKET_NOT_CONNECTED
xDa @ util.js:38
_.PF @ util.js:38
hidden_changed @ controls.js:165
qk @ main.js:160
_.kk.bindTo @ main.js:311
tLa @ controls.js:167
vLa @ controls.js:84
rMa @ controls.js:182
sMa @ controls.js:111
(anonymous) @ map.js:79
Promise.then
Eb @ map.js:79
za @ map.js:68
gb @ map.js:68
(anonymous) @ map.js:69
(anonymous) @ common.js:95
Zna @ common.js:99
aoa @ common.js:100
(anonymous) @ common.js:99
Promise.then
Yna @ common.js:99
Nh @ common.js:191
bBa @ map.js:58
(anonymous) @ map.js:57
requestAnimationFrame
_.vx @ common.js:95
jE @ map.js:57
(anonymous) @ map.js:135
Li @ map.js:124
Li @ map.js:135
(anonymous) @ map.js:69
_.tx @ common.js:95
(anonymous) @ map.js:72
_.Bs @ common.js:25
(anonymous) @ map.js:72
Promise.then
MBa @ map.js:71
(anonymous) @ main.js:239
Promise.then
_.io @ main.js:239
initializeGoogleMap @ main.js:140
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
Navigated to https://eyeonthefire.pages.dev/
map-integration.js:232 DOM loaded, initializing map script
map-integration.js:33 Fetching API keys for Google Maps
map-integration.js:11 Fetching API keys from: https://firemap-worker.jaspervdz.workers.dev/api-keys
map-integration.js:206 Setting up range displays
map-integration.js:224 Updating footer year
main.js:11 Initializing site
main.js:36 Setting up mobile menu
main.js:60 Setting up scroll effect
main.js:74 Setting up smooth scrolling
main.js:23 Google Maps API not available, setting initMap callback
main.js:163 Setting up map controls
map-integration.js:18 API keys received: {googleMaps: 'AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk', turnstileSiteKey: '0x4AAAAAABc1nqDeCwRviFAi'}
map-integration.js:40 Loading Google Maps script with key: AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk
map-integration.js:50 Google Maps script appended
main.js:109 Initializing Google Map
main.js:142 Map created, hiding loading overlay
main.js:156 Initializing FireDataService
fire-data-service.js:52 Initializing FireDataService with map
fire-data-service.js:87 Fetching USA fire data
fire-data-service.js:98 Skipping Turnstile token for fetchUSAFireData (Worker bypass)
fire-data-service.js:99 
            
            
           GET https://firemap-worker.jaspervdz.workers.dev/nasa/firms?source=MODIS_NRT&days=1&area=usa 500 (Internal Server Error)
fetchUSAFireData @ fire-data-service.js:99
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:122 Error fetching USA fire data: Error: API responded with status 500
    at FireDataService.fetchUSAFireData (fire-data-service.js:105:15)
fetchUSAFireData @ fire-data-service.js:122
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:539 Status message: Error loading fire data: API responded with status 500 error
fire-data-service.js:712 Showing sample data: 10 points
fire-data-service.js:288 Applied filters, filtered data: 10 points
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:342 Updating markers: 10 points
fire-data-service.js:472 Cleared markers
main.js:174 As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/deprecations for additional details and https://developers.google.com/maps/documentation/javascript/advanced-markers/migration for the migration guide.
_.kl @ main.js:174
createMarker @ fire-data-service.js:388
(anonymous) @ fire-data-service.js:350
updateMarkers @ fire-data-service.js:350
showSampleData @ fire-data-service.js:714
fetchUSAFireData @ fire-data-service.js:124
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:408 Created marker: 40.7128 -74.006
fire-data-service.js:408 Created marker: 34.0522 -118.2437
fire-data-service.js:408 Created marker: 41.8781 -87.6298
fire-data-service.js:408 Created marker: 29.7604 -95.3698
fire-data-service.js:408 Created marker: 33.4484 -112.074
fire-data-service.js:408 Created marker: 47.6062 -122.3321
fire-data-service.js:408 Created marker: 39.7392 -104.9903
fire-data-service.js:408 Created marker: 25.7617 -80.1918
fire-data-service.js:408 Created marker: 36.1699 -115.1398
fire-data-service.js:408 Created marker: 37.7749 -122.4194
fire-data-service.js:360 Marker clustering enabled
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:539 Status message: Note: Showing sample data as API could not be reached warning
Navigated to https://eyeonthefire.pages.dev/
map-integration.js:232 DOM loaded, initializing map script
map-integration.js:33 Fetching API keys for Google Maps
map-integration.js:11 Fetching API keys from: https://firemap-worker.jaspervdz.workers.dev/api-keys
map-integration.js:206 Setting up range displays
map-integration.js:224 Updating footer year
main.js:11 Initializing site
main.js:36 Setting up mobile menu
main.js:60 Setting up scroll effect
main.js:74 Setting up smooth scrolling
main.js:23 Google Maps API not available, setting initMap callback
main.js:163 Setting up map controls
map-integration.js:18 API keys received: {googleMaps: 'AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk', turnstileSiteKey: '0x4AAAAAABc1nqDeCwRviFAi'}
map-integration.js:40 Loading Google Maps script with key: AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk
map-integration.js:50 Google Maps script appended
main.js:109 Initializing Google Map
main.js:142 Map created, hiding loading overlay
main.js:156 Initializing FireDataService
fire-data-service.js:52 Initializing FireDataService with map
fire-data-service.js:87 Fetching USA fire data
fire-data-service.js:98 Skipping Turnstile token for fetchUSAFireData (Worker bypass)
fire-data-service.js:99 
            
            
           GET https://firemap-worker.jaspervdz.workers.dev/nasa/firms?source=MODIS_NRT&days=1&area=usa 500 (Internal Server Error)
fetchUSAFireData @ fire-data-service.js:99
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:122 Error fetching USA fire data: Error: API responded with status 500
    at FireDataService.fetchUSAFireData (fire-data-service.js:105:15)
fetchUSAFireData @ fire-data-service.js:122
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:539 Status message: Error loading fire data: API responded with status 500 error
fire-data-service.js:712 Showing sample data: 10 points
fire-data-service.js:288 Applied filters, filtered data: 10 points
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:342 Updating markers: 10 points
fire-data-service.js:472 Cleared markers
main.js:174 As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/deprecations for additional details and https://developers.google.com/maps/documentation/javascript/advanced-markers/migration for the migration guide.
_.kl @ main.js:174
createMarker @ fire-data-service.js:388
(anonymous) @ fire-data-service.js:350
updateMarkers @ fire-data-service.js:350
showSampleData @ fire-data-service.js:714
fetchUSAFireData @ fire-data-service.js:124
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:408 Created marker: 40.7128 -74.006
fire-data-service.js:408 Created marker: 34.0522 -118.2437
fire-data-service.js:408 Created marker: 41.8781 -87.6298
fire-data-service.js:408 Created marker: 29.7604 -95.3698
fire-data-service.js:408 Created marker: 33.4484 -112.074
fire-data-service.js:408 Created marker: 47.6062 -122.3321
fire-data-service.js:408 Created marker: 39.7392 -104.9903
fire-data-service.js:408 Created marker: 25.7617 -80.1918
fire-data-service.js:408 Created marker: 36.1699 -115.1398
fire-data-service.js:408 Created marker: 37.7749 -122.4194
fire-data-service.js:360 Marker clustering enabled
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:539 Status message: Note: Showing sample data as API could not be reached warning
Navigated to https://eyeonthefire.pages.dev/
map-integration.js:232 DOM loaded, initializing map script
map-integration.js:33 Fetching API keys for Google Maps
map-integration.js:11 Fetching API keys from: https://firemap-worker.jaspervdz.workers.dev/api-keys
map-integration.js:206 Setting up range displays
map-integration.js:224 Updating footer year
main.js:11 Initializing site
main.js:36 Setting up mobile menu
main.js:60 Setting up scroll effect
main.js:74 Setting up smooth scrolling
main.js:23 Google Maps API not available, setting initMap callback
main.js:163 Setting up map controls
map-integration.js:18 API keys received: {googleMaps: 'AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk', turnstileSiteKey: '0x4AAAAAABc1nqDeCwRviFAi'}
map-integration.js:40 Loading Google Maps script with key: AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk
map-integration.js:50 Google Maps script appended
main.js:109 Initializing Google Map
main.js:142 Map created, hiding loading overlay
main.js:156 Initializing FireDataService
fire-data-service.js:52 Initializing FireDataService with map
fire-data-service.js:87 Fetching USA fire data
fire-data-service.js:98 Skipping Turnstile token for fetchUSAFireData (Worker bypass)
Navigated to https://eyeonthefire.pages.dev/about
Navigated to https://eyeonthefire.pages.dev/
 DOM loaded, initializing map script
 Fetching API keys for Google Maps
 Fetching API keys from: https://firemap-worker.jaspervdz.workers.dev/api-keys
 Setting up range displays
 Updating footer year
 Initializing site
 Setting up mobile menu
 Setting up scroll effect
 Setting up smooth scrolling
 Google Maps API not available, setting initMap callback
 Setting up map controls
 API keys received: {googleMaps: 'AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk', turnstileSiteKey: '0x4AAAAAABc1nqDeCwRviFAi'}
 Loading Google Maps script with key: AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk
 Google Maps script appended
 Initializing Google Map
 Map created, hiding loading overlay
 Initializing FireDataService
 Initializing FireDataService with map
 Fetching USA fire data
 Skipping Turnstile token for fetchUSAFireData (Worker bypass)
 
            
            
           GET https://firemap-worker.jaspervdz.workers.dev/nasa/firms?source=MODIS_NRT&days=1&area=usa 500 (Internal Server Error)
fetchUSAFireData @ fire-data-service.js:99
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
 Error fetching USA fire data: Error: API responded with status 500
    at FireDataService.fetchUSAFireData (fire-data-service.js:105:15)
fetchUSAFireData @ fire-data-service.js:122
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
 Status message: Error loading fire data: API responded with status 500 error
 Showing sample data: 10 points
 Applied filters, filtered data: 10 points
 Updated pagination: 1 of 1
 Updating markers: 10 points
 Cleared markers
 As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/deprecations for additional details and https://developers.google.com/maps/documentation/javascript/advanced-markers/migration for the migration guide.
_.kl @ main.js:174
createMarker @ fire-data-service.js:388
(anonymous) @ fire-data-service.js:350
updateMarkers @ fire-data-service.js:350
showSampleData @ fire-data-service.js:714
fetchUSAFireData @ fire-data-service.js:124
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
 Created marker: 40.7128 -74.006
 Created marker: 34.0522 -118.2437
 Created marker: 41.8781 -87.6298
 Created marker: 29.7604 -95.3698
 Created marker: 33.4484 -112.074
 Created marker: 47.6062 -122.3321
 Created marker: 39.7392 -104.9903
 Created marker: 25.7617 -80.1918
 Created marker: 36.1699 -115.1398
 Created marker: 37.7749 -122.4194
 Marker clustering enabled
 Updated pagination: 1 of 1
 Status message: Note: Showing sample data as API could not be reached warning
Navigated to https://eyeonthefire.pages.dev/
 DOM loaded, initializing map script
 Fetching API keys for Google Maps
 Fetching API keys from: https://firemap-worker.jaspervdz.workers.dev/api-keys
 Setting up range displays
 Updating footer year
 Initializing site
 Setting up mobile menu
 Setting up scroll effect
 Setting up smooth scrolling
 Google Maps API not available, setting initMap callback
 Setting up map controls
 API keys received: {googleMaps: 'AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk', turnstileSiteKey: '0x4AAAAAABc1nqDeCwRviFAi'}
 Loading Google Maps script with key: AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk
 Google Maps script appended
 Initializing Google Map
 Map created, hiding loading overlay
 Initializing FireDataService
 Initializing FireDataService with map
 Fetching USA fire data
 Skipping Turnstile token for fetchUSAFireData (Worker bypass)
 
            
            
           GET https://firemap-worker.jaspervdz.workers.dev/nasa/firms?source=MODIS_NRT&days=1&area=usa 500 (Internal Server Error)
fetchUSAFireData @ fire-data-service.js:99
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
 Error fetching USA fire data: Error: API responded with status 500
    at FireDataService.fetchUSAFireData (fire-data-service.js:105:15)
fetchUSAFireData @ fire-data-service.js:122
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
 Status message: Error loading fire data: API responded with status 500 error
 Showing sample data: 10 points
 Applied filters, filtered data: 10 points
 Updated pagination: 1 of 1
 Updating markers: 10 points
 Cleared markers
 As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/deprecations for additional details and https://developers.google.com/maps/documentation/javascript/advanced-markers/migration for the migration guide.
_.kl @ main.js:174
createMarker @ fire-data-service.js:388
(anonymous) @ fire-data-service.js:350
updateMarkers @ fire-data-service.js:350
showSampleData @ fire-data-service.js:714
fetchUSAFireData @ fire-data-service.js:124
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
 Created marker: 40.7128 -74.006
 Created marker: 34.0522 -118.2437
 Created marker: 41.8781 -87.6298
 Created marker: 29.7604 -95.3698
 Created marker: 33.4484 -112.074
 Created marker: 47.6062 -122.3321
 Created marker: 39.7392 -104.9903
 Created marker: 25.7617 -80.1918
 Created marker: 36.1699 -115.1398
 Created marker: 37.7749 -122.4194
 Marker clustering enabled
 Updated pagination: 1 of 1
 Status message: Note: Showing sample data as API could not be reached warning
Navigated to https://eyeonthefire.pages.dev/
map-integration.js:232 DOM loaded, initializing map script
map-integration.js:33 Fetching API keys for Google Maps
map-integration.js:11 Fetching API keys from: https://firemap-worker.jaspervdz.workers.dev/api-keys
map-integration.js:206 Setting up range displays
map-integration.js:224 Updating footer year
main.js:11 Initializing site
main.js:36 Setting up mobile menu
main.js:60 Setting up scroll effect
main.js:74 Setting up smooth scrolling
main.js:23 Google Maps API not available, setting initMap callback
main.js:163 Setting up map controls
map-integration.js:18 API keys received: {googleMaps: 'AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk', turnstileSiteKey: '0x4AAAAAABc1nqDeCwRviFAi'}
map-integration.js:40 Loading Google Maps script with key: AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk
map-integration.js:50 Google Maps script appended
main.js:109 Initializing Google Map
main.js:142 Map created, hiding loading overlay
main.js:156 Initializing FireDataService
fire-data-service.js:52 Initializing FireDataService with map
fire-data-service.js:87 Fetching USA fire data
fire-data-service.js:98 Skipping Turnstile token for fetchUSAFireData (Worker bypass)
fire-data-service.js:99 
            
            
           GET https://firemap-worker.jaspervdz.workers.dev/nasa/firms?source=MODIS_NRT&days=1&area=usa 500 (Internal Server Error)
fetchUSAFireData @ fire-data-service.js:99
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:122 Error fetching USA fire data: Error: API responded with status 500
    at FireDataService.fetchUSAFireData (fire-data-service.js:105:15)
fetchUSAFireData @ fire-data-service.js:122
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:539 Status message: Error loading fire data: API responded with status 500 error
fire-data-service.js:712 Showing sample data: 10 points
fire-data-service.js:288 Applied filters, filtered data: 10 points
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:342 Updating markers: 10 points
fire-data-service.js:472 Cleared markers
main.js:174 As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/deprecations for additional details and https://developers.google.com/maps/documentation/javascript/advanced-markers/migration for the migration guide.
_.kl @ main.js:174
createMarker @ fire-data-service.js:388
(anonymous) @ fire-data-service.js:350
updateMarkers @ fire-data-service.js:350
showSampleData @ fire-data-service.js:714
fetchUSAFireData @ fire-data-service.js:124
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:408 Created marker: 40.7128 -74.006
fire-data-service.js:408 Created marker: 34.0522 -118.2437
fire-data-service.js:408 Created marker: 41.8781 -87.6298
fire-data-service.js:408 Created marker: 29.7604 -95.3698
fire-data-service.js:408 Created marker: 33.4484 -112.074
fire-data-service.js:408 Created marker: 47.6062 -122.3321
fire-data-service.js:408 Created marker: 39.7392 -104.9903
fire-data-service.js:408 Created marker: 25.7617 -80.1918
fire-data-service.js:408 Created marker: 36.1699 -115.1398
fire-data-service.js:408 Created marker: 37.7749 -122.4194
fire-data-service.js:360 Marker clustering enabled
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:539 Status message: Note: Showing sample data as API could not be reached warning
Navigated to https://eyeonthefire.pages.dev/
map-integration.js:232 DOM loaded, initializing map script
map-integration.js:33 Fetching API keys for Google Maps
map-integration.js:11 Fetching API keys from: https://firemap-worker.jaspervdz.workers.dev/api-keys
map-integration.js:206 Setting up range displays
map-integration.js:224 Updating footer year
main.js:11 Initializing site
main.js:36 Setting up mobile menu
main.js:60 Setting up scroll effect
main.js:74 Setting up smooth scrolling
main.js:23 Google Maps API not available, setting initMap callback
main.js:163 Setting up map controls
map-integration.js:18 API keys received: {googleMaps: 'AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk', turnstileSiteKey: '0x4AAAAAABc1nqDeCwRviFAi'}
map-integration.js:40 Loading Google Maps script with key: AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk
map-integration.js:50 Google Maps script appended
main.js:109 Initializing Google Map
main.js:142 Map created, hiding loading overlay
main.js:156 Initializing FireDataService
fire-data-service.js:52 Initializing FireDataService with map
fire-data-service.js:87 Fetching USA fire data
fire-data-service.js:98 Skipping Turnstile token for fetchUSAFireData (Worker bypass)
fire-data-service.js:99 
            
            
           GET https://firemap-worker.jaspervdz.workers.dev/nasa/firms?source=MODIS_NRT&days=1&area=usa 500 (Internal Server Error)
fetchUSAFireData @ fire-data-service.js:99
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:122 Error fetching USA fire data: Error: API responded with status 500
    at FireDataService.fetchUSAFireData (fire-data-service.js:105:15)
fetchUSAFireData @ fire-data-service.js:122
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:539 Status message: Error loading fire data: API responded with status 500 error
fire-data-service.js:712 Showing sample data: 10 points
fire-data-service.js:288 Applied filters, filtered data: 10 points
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:342 Updating markers: 10 points
fire-data-service.js:472 Cleared markers
main.js:174 As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/deprecations for additional details and https://developers.google.com/maps/documentation/javascript/advanced-markers/migration for the migration guide.
_.kl @ main.js:174
createMarker @ fire-data-service.js:388
(anonymous) @ fire-data-service.js:350
updateMarkers @ fire-data-service.js:350
showSampleData @ fire-data-service.js:714
fetchUSAFireData @ fire-data-service.js:124
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:408 Created marker: 40.7128 -74.006
fire-data-service.js:408 Created marker: 34.0522 -118.2437
fire-data-service.js:408 Created marker: 41.8781 -87.6298
fire-data-service.js:408 Created marker: 29.7604 -95.3698
fire-data-service.js:408 Created marker: 33.4484 -112.074
fire-data-service.js:408 Created marker: 47.6062 -122.3321
fire-data-service.js:408 Created marker: 39.7392 -104.9903
fire-data-service.js:408 Created marker: 25.7617 -80.1918
fire-data-service.js:408 Created marker: 36.1699 -115.1398
fire-data-service.js:408 Created marker: 37.7749 -122.4194
fire-data-service.js:360 Marker clustering enabled
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:539 Status message: Note: Showing sample data as API could not be reached warning
Navigated to https://eyeonthefire.pages.dev/
map-integration.js:232 DOM loaded, initializing map script
map-integration.js:33 Fetching API keys for Google Maps
map-integration.js:11 Fetching API keys from: https://firemap-worker.jaspervdz.workers.dev/api-keys
map-integration.js:206 Setting up range displays
map-integration.js:224 Updating footer year
main.js:11 Initializing site
main.js:36 Setting up mobile menu
main.js:60 Setting up scroll effect
main.js:74 Setting up smooth scrolling
main.js:23 Google Maps API not available, setting initMap callback
main.js:163 Setting up map controls
map-integration.js:18 API keys received: {googleMaps: 'AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk', turnstileSiteKey: '0x4AAAAAABc1nqDeCwRviFAi'}
map-integration.js:40 Loading Google Maps script with key: AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk
map-integration.js:50 Google Maps script appended
main.js:109 Initializing Google Map
main.js:142 Map created, hiding loading overlay
main.js:156 Initializing FireDataService
fire-data-service.js:52 Initializing FireDataService with map
fire-data-service.js:87 Fetching USA fire data
fire-data-service.js:98 Skipping Turnstile token for fetchUSAFireData (Worker bypass)
fire-data-service.js:99 
            
            
           GET https://firemap-worker.jaspervdz.workers.dev/nasa/firms?source=MODIS_NRT&days=1&area=usa 500 (Internal Server Error)
fetchUSAFireData @ fire-data-service.js:99
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:122 Error fetching USA fire data: Error: API responded with status 500
    at FireDataService.fetchUSAFireData (fire-data-service.js:105:15)
fetchUSAFireData @ fire-data-service.js:122
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
 Status message: Error loading fire data: API responded with status 500 error
 Showing sample data: 10 points
 Applied filters, filtered data: 10 points
 Updated pagination: 1 of 1
 Updating markers: 10 points
fire-data-service.js:472 Cleared markers
main.js:174 As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/deprecations for additional details and https://developers.google.com/maps/documentation/javascript/advanced-markers/migration for the migration guide.
_.kl @ main.js:174
createMarker @ fire-data-service.js:388
(anonymous) @ fire-data-service.js:350
updateMarkers @ fire-data-service.js:350
showSampleData @ fire-data-service.js:714
fetchUSAFireData @ fire-data-service.js:124
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:408 Created marker: 40.7128 -74.006
fire-data-service.js:408 Created marker: 34.0522 -118.2437
fire-data-service.js:408 Created marker: 41.8781 -87.6298
fire-data-service.js:408 Created marker: 29.7604 -95.3698
fire-data-service.js:408 Created marker: 33.4484 -112.074
fire-data-service.js:408 Created marker: 47.6062 -122.3321
fire-data-service.js:408 Created marker: 39.7392 -104.9903
fire-data-service.js:408 Created marker: 25.7617 -80.1918
fire-data-service.js:408 Created marker: 36.1699 -115.1398
fire-data-service.js:408 Created marker: 37.7749 -122.4194
fire-data-service.js:360 Marker clustering enabled
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:539 Status message: Note: Showing sample data as API could not be reached warning
Navigated to https://eyeonthefire.pages.dev/
map-integration.js:232 DOM loaded, initializing map script
map-integration.js:33 Fetching API keys for Google Maps
map-integration.js:11 Fetching API keys from: https://firemap-worker.jaspervdz.workers.dev/api-keys
map-integration.js:206 Setting up range displays
map-integration.js:224 Updating footer year
main.js:11 Initializing site
main.js:36 Setting up mobile menu
main.js:60 Setting up scroll effect
main.js:74 Setting up smooth scrolling
main.js:23 Google Maps API not available, setting initMap callback
main.js:163 Setting up map controls
map-integration.js:18 API keys received: {googleMaps: 'AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk', turnstileSiteKey: '0x4AAAAAABc1nqDeCwRviFAi'}
map-integration.js:40 Loading Google Maps script with key: AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk
map-integration.js:50 Google Maps script appended
main.js:109 Initializing Google Map
main.js:142 Map created, hiding loading overlay
main.js:156 Initializing FireDataService
fire-data-service.js:52 Initializing FireDataService with map
fire-data-service.js:87 Fetching USA fire data
fire-data-service.js:98 Skipping Turnstile token for fetchUSAFireData (Worker bypass)
fire-data-service.js:99 
            
            
           GET https://firemap-worker.jaspervdz.workers.dev/nasa/firms?source=MODIS_NRT&days=1&area=usa 500 (Internal Server Error)
fetchUSAFireData @ fire-data-service.js:99
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:122 Error fetching USA fire data: Error: API responded with status 500
    at FireDataService.fetchUSAFireData (fire-data-service.js:105:15)
fetchUSAFireData @ fire-data-service.js:122
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
 Status message: Error loading fire data: API responded with status 500 error
 Showing sample data: 10 points
 Applied filters, filtered data: 10 points
 Updated pagination: 1 of 1
 Updating markers: 10 points
fire-data-service.js:472 Cleared markers
main.js:174 As of February 21st, 2024, google.maps.Marker is deprecated. Please use google.maps.marker.AdvancedMarkerElement instead. At this time, google.maps.Marker is not scheduled to be discontinued, but google.maps.marker.AdvancedMarkerElement is recommended over google.maps.Marker. While google.maps.Marker will continue to receive bug fixes for any major regressions, existing bugs in google.maps.Marker will not be addressed. At least 12 months notice will be given before support is discontinued. Please see https://developers.google.com/maps/deprecations for additional details and https://developers.google.com/maps/documentation/javascript/advanced-markers/migration for the migration guide.
_.kl @ main.js:174
createMarker @ fire-data-service.js:388
(anonymous) @ fire-data-service.js:350
updateMarkers @ fire-data-service.js:350
showSampleData @ fire-data-service.js:714
fetchUSAFireData @ fire-data-service.js:124
await in fetchUSAFireData
initialize @ fire-data-service.js:61
initializeFireDataService @ main.js:159
initializeGoogleMap @ main.js:147
(anonymous) @ main.js:264
(anonymous) @ main.js:263
Promise.then
rga @ main.js:263
await in rga
google.maps.Load @ js?key=AIzaSyD9MXRpmeXMKlezIOs3lPAjn0C5yLeTNUk&libraries=visualization&callback=initMap&loading=async:38
(anonymous) @ main.js:493
(anonymous) @ main.js:493
fire-data-service.js:408 Created marker: 40.7128 -74.006
fire-data-service.js:408 Created marker: 34.0522 -118.2437
fire-data-service.js:408 Created marker: 41.8781 -87.6298
fire-data-service.js:408 Created marker: 29.7604 -95.3698
fire-data-service.js:408 Created marker: 33.4484 -112.074
fire-data-service.js:408 Created marker: 47.6062 -122.3321
fire-data-service.js:408 Created marker: 39.7392 -104.9903
fire-data-service.js:408 Created marker: 25.7617 -80.1918
fire-data-service.js:408 Created marker: 36.1699 -115.1398
fire-data-service.js:408 Created marker: 37.7749 -122.4194
fire-data-service.js:360 Marker clustering enabled
fire-data-service.js:333 Updated pagination: 1 of 1
fire-data-service.js:539 Status message: Note: Showing sample data as API could not be reached warning
