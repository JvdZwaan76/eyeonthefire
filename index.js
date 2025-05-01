export default {
    async fetch(request, env) {
        const MAP_KEY = env.NASA_FIRMS_MAP_KEY || 'YOUR_MAP_KEY_HERE'; // Use env variable or fallback
        if (MAP_KEY === 'YOUR_MAP_KEY_HERE') {
            console.error('MAP_KEY not set in environment variables');
            return new Response(JSON.stringify({ error: 'Internal server error: NASA FIRMS MAP_KEY not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const upstreamUrl = `https://firms.modaps.eosdis.nasa.gov/api/country/viirs-snpp/USA/1?map_key=${MAP_KEY}`;
        try {
            const response = await fetch(upstreamUrl, {
                headers: { 'User-Agent': 'EyeOnTheFire/1.0' }
            });
            console.log('Upstream status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upstream error:', errorText, 'Status:', response.status);
                return new Response(JSON.stringify({ error: `Upstream API failed: ${response.status} ${errorText.slice(0, 100)}` }), {
                    status: 502,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            // Clone the response to allow multiple reads
            const responseClone = response.clone();
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                const errorText = await responseClone.text();
                console.error('JSON parse error:', jsonError.message, 'Response:', errorText.slice(0, 200));
                return new Response(JSON.stringify({ error: `Invalid JSON response from upstream API: ${jsonError.message} - ${errorText.slice(0, 100)}` }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            console.log('Upstream data:', JSON.stringify(data).slice(0, 200));
            // Handle various response formats
            let fireData = data;
            if (data.features) {
                fireData = data.features; // GeoJSON format
            } else if (!Array.isArray(data)) {
                console.error('Invalid data format: Expected array or GeoJSON, got:', typeof data);
                return new Response(JSON.stringify({ error: 'Invalid data format from upstream API' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            const normalizedData = {
                events: fireData.map(item => {
                    const lon = item.geometry?.coordinates?.[0] || item.longitude || item.lon;
                    const lat = item.geometry?.coordinates?.[1] || item.latitude || item.lat;
                    if (!lon || !lat) {
                        console.warn('Skipping invalid item:', item);
                        return null;
                    }
                    return {
                        geometry: [{ coordinates: [parseFloat(lon), parseFloat(lat)] }],
                        title: item.properties?.name || item.name || item.acq_date || 'Active Fire'
                    };
                }).filter(item => item !== null)
            };
            return new Response(JSON.stringify(normalizedData), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=900'
                }
            });
        } catch (error) {
            console.error('Worker error:', error.message, error.stack);
            return new Response(JSON.stringify({ error: `Internal server error: ${error.message}` }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};