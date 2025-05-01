export default {
    async fetch(request, env) {
        const MAP_KEY = env.NASA_FIRMS_MAP_KEY || 'YOUR_MAP_KEY_HERE';
        if (MAP_KEY === 'YOUR_MAP_KEY_HERE') {
            console.error('MAP_KEY not set in environment variables');
            return new Response(JSON.stringify({ error: 'Internal server error: NASA FIRMS MAP_KEY not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        // Dynamic date for today
        const today = new Date().toISOString().split('T')[0];
        const upstreamUrl = `https://firms.modaps.eosdis.nasa.gov/api/country/html/${MAP_KEY}/VIIRS_SNPP_NRT/USA/1/${today}`;
        try {
            const response = await fetch(upstreamUrl, {
                headers: { 'User-Agent': 'EyeOnTheFire/1.0' },
                redirect: 'manual'
            });
            console.log('Upstream status:', response.status, 'Headers:', Object.fromEntries(response.headers));
            // Check for redirects
            if (response.status >= 300 && response.status < 400) {
                const location = response.headers.get('Location') || 'unknown';
                console.error('Redirect detected:', response.status, 'Location:', location);
                return new Response(JSON.stringify({ error: `Upstream API redirected: ${response.status} to ${location}` }), {
                    status: 502,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upstream error:', errorText, 'Status:', response.status);
                return new Response(JSON.stringify({ error: `Upstream API failed: ${response.status} ${errorText.slice(0, 100)}` }), {
                    status: 502,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            // Check Content-Type
            const contentType = response.headers.get('Content-Type') || '';
            if (!contentType.includes('application/json') && !contentType.includes('text/csv')) {
                const errorText = await response.text();
                console.error('Invalid Content-Type:', contentType, 'Response:', errorText.slice(0, 200));
                return new Response(JSON.stringify({ error: `Invalid Content-Type from upstream API: ${contentType}` }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            // Handle CSV response
            let fireData;
            if (contentType.includes('text/csv')) {
                const csvText = await response.text();
                console.log('CSV data:', csvText.slice(0, 200));
                // Parse CSV
                const rows = csvText.trim().split('\n').map(row => row.split(','));
                const headers = rows[0];
                fireData = rows.slice(1).map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index];
                    });
                    return obj;
                });
            } else {
                // Handle JSON response (fallback)
                const responseClone = response.clone();
                try {
                    fireData = await response.json();
                } catch (jsonError) {
                    const errorText = await responseClone.text();
                    console.error('JSON parse error:', jsonError.message, 'Response:', errorText.slice(0, 200));
                    return new Response(JSON.stringify({ error: `Invalid JSON response from upstream API: ${jsonError.message} - ${errorText.slice(0, 100)}` }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                if (fireData.features) {
                    fireData = fireData.features; // GeoJSON format
                } else if (!Array.isArray(fireData)) {
                    console.error('Invalid data format: Expected array or GeoJSON, got:', typeof fireData);
                    return new Response(JSON.stringify({ error: 'Invalid data format from upstream API' }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
            // Normalize data
            const normalizedData = {
                events: fireData.map(item => {
                    const lon = parseFloat(item.longitude || item.geometry?.coordinates?.[0]);
                    const lat = parseFloat(item.latitude || item.geometry?.coordinates?.[1]);
                    if (!lon || !lat) {
                        console.warn('Skipping invalid item:', item);
                        return null;
                    }
                    return {
                        geometry: [{ coordinates: [lon, lat] }],
                        title: item.acq_date || item.properties?.name || item.name || 'Active Fire'
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