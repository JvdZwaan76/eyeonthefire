export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Rate limiting
    const rateLimit = 100; // Requests per minute
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    const cacheKey = `rate-limit:${clientIp}`;
    const cache = caches.default;
    let count = await cache.match(cacheKey);
    count = count ? parseInt(await count.text()) + 1 : 1;
    if (count > rateLimit) {
      console.error(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    await cache.put(cacheKey, new Response(count, { headers: { 'Cache-Control': 's-maxage=60' } }));

    try {
      if (path.startsWith('/api/nasa/firms')) {
        const MAP_KEY = env.FIRMS_MAP_KEY;
        if (!MAP_KEY) {
          console.error('NASA FIRMS MAP_KEY not configured');
          throw new Error('NASA FIRMS MAP_KEY not configured');
        }
        const dataSource = url.searchParams.get('source') || 'MODIS_NRT';
        const days = url.searchParams.get('days') || '1';
        const apiUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/${dataSource}/world/${days}`;
        console.log(`Fetching NASA FIRMS data: ${apiUrl}`);
        const response = await fetch(apiUrl, { cf: { cacheTtl: 3600 } });
        console.log(`NASA FIRMS response status: ${response.status}`);
        if (!response.ok) {
          console.error(`NASA FIRMS API error: ${response.statusText}`);
          throw new Error(`FIRMS API error: ${response.statusText}`);
        }
        const csv = await response.text();
        const events = csv.split('\n').slice(1).map(line => {
          const [latitude, longitude, , , , , , , , , , title] = line.split(',');
          if (!latitude || !longitude) return null;
          return {
            geometry: [{ coordinates: [parseFloat(longitude), parseFloat(latitude)] }],
            title: title || 'Active Fire'
          };
        }).filter(event => event !== null);
        console.log(`Processed ${events.length} fire events`);
        return new Response(JSON.stringify({ events }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      } else if (path === '/api/geocode') {
        const GOOGLE_MAPS_KEY = env.GOOGLE_MAPS_KEY;
        if (!GOOGLE_MAPS_KEY) {
          console.error('Google Maps API key not configured');
          throw new Error('Google Maps API key not configured');
        }
        const lat = url.searchParams.get('lat');
        const lng = url.searchParams.get('lng');
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_KEY}`;
        console.log(`Fetching geocode data: ${geocodeUrl}`);
        const response = await fetch(geocodeUrl);
        console.log(`Geocode response status: ${response.status}`);
        if (!response.ok) {
          console.error(`Geocode API error: ${response.statusText}`);
          throw new Error(`Geocode API error: ${response.statusText}`);
        }
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } else if (path === '/api/google-maps') {
        const GOOGLE_MAPS_KEY = env.GOOGLE_MAPS_KEY;
        if (!GOOGLE_MAPS_KEY) {
          console.error('Google Maps API key not configured');
          throw new Error('Google Maps API key not configured');
        }
        const mapsUrl = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=visualization,drawing,places&callback=initMap`;
        console.log(`Fetching Google Maps API: ${mapsUrl}`);
        const response = await fetch(mapsUrl);
        console.log(`Google Maps API response status: ${response.status}`);
        if (!response.ok) {
          console.error(`Google Maps API error: ${response.statusText}`);
          throw new Error(`Google Maps API error: ${response.statusText}`);
        }
        const body = await response.text();
        return new Response(body, {
          headers: {
            'Content-Type': 'application/javascript',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      console.warn(`Unknown path requested: ${path}`);
      return new Response('Not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    } catch (error) {
      console.error(`Worker error for path ${path}: ${error.message}`);
      return new Response(JSON.stringify({ error: `Server error: ${error.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
