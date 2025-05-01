addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const upstreamUrl = 'https://firms.modaps.eosdis.nasa.gov/api/v1/...'; // Update this
    try {
        const response = await fetch(upstreamUrl, {
            headers: { 'User-Agent': 'EyeOnTheFire/1.0' }
        });
        console.log('Upstream status:', response.status);
        if (!response.ok) {
            console.error('Upstream error:', response.statusText);
            return new Response(JSON.stringify({ error: `Upstream API failed: ${response.status}` }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const data = await response.json();
        console.log('Upstream data:', JSON.stringify(data).slice(0, 200));
        const normalizedData = {
            events: Array.isArray(data) ? data.map(item => ({
                geometry: [{ coordinates: [item.longitude, item.latitude] }],
                title: item.name || 'Active Fire'
            })) : []
        };
        return new Response(JSON.stringify(normalizedData), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=900'
            }
        });
    } catch (error) {
        console.error('Worker error:', error.message);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}