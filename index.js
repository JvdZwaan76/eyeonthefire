// index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path.startsWith('/api/nasa/firms')) {
        const dataSource = url.searchParams.get('source') || 'MODIS_NRT';
        const days = url.searchParams.get('days') || '1';
        const apiUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${env.FIRMS_MAP_KEY}/${dataSource}/world/${days}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
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
        return new Response(JSON.stringify({ events }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } else if (path === '/api/geocode') {
        const lat = url.searchParams.get('lat');
        const lng = url.searchParams.get('lng');
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${env.GOOGLE_MAPS_KEY}`;
        const response = await fetch(geocodeUrl);
        if (!response.ok) {
          throw new Error(`Geocode API error: ${response.statusText}`);
        }
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } else if (path === '/api/google-maps') {
        const mapsUrl = `https://maps.googleapis.com/maps/api/js?key=${env.GOOGLE_MAPS_KEY}&libraries=visualization,drawing,places&callback=initMap`;
        const response = await fetch(mapsUrl);
        return new Response(response.body, {
          headers: { 'Content-Type': 'application/javascript', 'Access-Control-Allow-Origin': '*' }
        });
      }
      return new Response('Not found', { status: 404 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
