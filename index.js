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
        const upstreamUrl = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${MAP_KEY}/VIIRS_SNPP_NRT/USA/1/${today}`;
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
            if (!contentType.includes('text/csv')) {
                const errorText = await response.text();
                console.error('Invalid Content-Type:', contentType, 'Response:', errorText.slice(0, 200));
                return new Response(JSON.stringify({ error: `Invalid Content-Type from upstream API: ${contentType}` }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            // Parse CSV response
            const csvText = await response.text();
            console.log('CSV data:', csvText.slice(0, 200));
            const rows = csvText.trim().split('\n').map(row => row.split(','));
            if (rows.length < 2) {
                console.error('Empty or invalid CSV data');
                return new Response(JSON.stringify({ error: 'Empty or invalid CSV data from upstream API' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            const headers = rows[0];
            const fireData = rows.slice(1).map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index];
                });
                return obj;
            });
            // Normalize data
            const normalizedData = {
                events: fireData.map(item => {
                    const lon = parseFloat(item.longitude);
                    const lat = parseFloat(item.latitude);
                    if (!lon || !lat) {
                        console.warn('Skipping invalid item:', item);
                        return null;
                    }
                    return {
                        geometry: [{ coordinates: [lon, lat] }],
                        title: item.acq_date || 'Active Fire'
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