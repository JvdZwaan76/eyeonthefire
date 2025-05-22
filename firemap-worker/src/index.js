addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  console.log('Handling request for:', url.pathname);
  if (url.pathname === '/' || url.pathname === '/index.html') {
    console.log('Processing index.html');
    try {
      console.log('Attempting to get index.html from KV');
      let html = await env['eyeonthefire-keys'].get('index.html', 'text');
      if (!html) {
        console.log('index.html not found in KV');
        return new Response('index.html not found in KV', { status: 404 });
      }
      console.log('index.html retrieved from KV');
      const nonce = btoa(String.fromCharCode.apply(null, crypto.getRandomValues(new Uint8Array(16))));
      console.log('Generated nonce:', nonce);
      console.log('GOOGLE_MAPS_API_KEY:', GOOGLE_MAPS_API_KEY);
      if (typeof GOOGLE_MAPS_API_KEY === 'undefined') {
        console.error('GOOGLE_MAPS_API_KEY is undefined');
        return new Response('API Key not set', { status: 500 });
      }
      html = html.replace(/{{NONCE}}/g, nonce);
      html = html.replace('{{GOOGLE_MAPS_API_KEY}}', GOOGLE_MAPS_API_KEY);
      const csp = `default-src 'none'; script-src 'self' 'nonce-${nonce}' https://accounts.google.com https://maps.googleapis.com https://unpkg.com https://www.googletagmanager.com https://code.jquery.com https://cdn.jsdelivr.net https://static.cloudflareinsights.com https://challenges.cloudflare.com 'strict-dynamic'; style-src 'self' 'unsafe-inline' https://maps.googleapis.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; connect-src 'self' https://firemap-worker.jaspervdz.workers.dev https://maps.googleapis.com https://www.googletagmanager.com https://analytics.google.com https://www.google-analytics.com https://stats.g.doubleclick.net; img-src 'self' data: https://maps.googleapis.com https://www.googletagmanager.com https://*.gstatic.com https://*.google.com https://*.googleapis.com; font-src https://fonts.googleapis.com`;
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Security-Policy': csp,
          'X-Worker': 'true',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      });
    } catch (error) {
      console.error('Error processing index.html:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  if (url.pathname === '/styles.css') {
    console.log('Processing styles.css');
    try {
      console.log('Attempting to get styles.css from KV');
      const css = await env['eyeonthefire-keys'].get('styles.css', 'text');
      if (!css) {
        console.log('styles.css not found in KV');
        return new Response('CSS not found', { status: 404 });
      }
      console.log('styles.css retrieved from KV');
      return new Response(css, {
        headers: {
          'Content-Type': 'text/css',
          'X-Worker': 'true',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      });
    } catch (error) {
      console.error('Error processing styles.css:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  if (url.pathname.startsWith('/nasa/firms')) {
    console.log('Handling /nasa/firms request');
    if (typeof NASA_FIRMS_API_KEY === 'undefined') {
      console.error('NASA_FIRMS_API_KEY is undefined');
      return new Response('NASA API Key not set', { status: 500 });
    }
    const source = url.searchParams.get('source') || 'MODIS_NRT';
    const days = url.searchParams.get('days') || '1';
    const area = url.searchParams.get('area') || 'usa';
    const firmsUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${NASA_FIRMS_API_KEY}/${source}/USA/${days}`;
    try {
      const response = await fetch(firmsUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from NASA FIRMS: ${response.status}`);
      }
      const csvData = await response.text();
      return new Response(csvData, { headers: { 'Content-Type': 'text/csv' } });
    } catch (error) {
      console.error('Error fetching fire data:', error);
      return new Response(error.message, { status: 500 });
    }
  }

  return fetch(request);
}
