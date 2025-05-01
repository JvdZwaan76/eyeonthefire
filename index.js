export default {
    async fetch(request) {
        // Replace with the correct NASA FIRMS endpoint
        const upstreamUrl = 'https://firms.modaps.eosdis.nasa.gov/api/active_fire/viirs-snpp?area=USA&day=1';
        try {
            const response = await fetch(upstreamUrl, {
                headers: { 'User-Agent': 'EyeOnTheFire/1.0' }
            });
            console.log('Upstream status:', response.status);
            if (!response.ok) {
                console.error('Upstream error:', response.statusText, 'Status:', response.status);
                return new Response(JSON.stringify({ error: `Upstream API failed: ${response.status} ${response.statusText}` }), {
                    status: 502,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            const data = await response.json();
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
                    // Handle GeoJSON or raw data
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