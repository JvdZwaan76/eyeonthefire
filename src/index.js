addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  console.log('Handling request for:', url.pathname);
  if (url.pathname === '/' || url.pathname === '/index.html') {
    console.log('Processing index.html');
    try {
      // Adjust the fetch URL based on where index.html is hosted
      let response = await fetch('https://eyeonthefire.com/index.html');
      if (!response.ok) {
        throw new Error(`Failed to fetch index.html: ${response.status}`);
      }
      let html = await response.text();
      const nonce = btoa(String.fromCharCode.apply(null, crypto.getRandomValues(new Uint8Array(16))));
      console.log('Generated nonce:', nonce);
      console.log('GOOGLE_MAPS_API_KEY:', GOOGLE_MAPS_API_KEY);
      if (typeof GOOGLE_MAPS_API_KEY === 'undefined') {
        console.error('GOOGLE_MAPS_API_KEY is undefined');
        return new Response('API Key not set', { status: 500 });
      }
      html = html.replace(/{{NONCE}}/g, nonce);
      html = html.replace('{{GOOGLE_MAPS_API_KEY}}', GOOGLE_MAPS_API_KEY);
      const csp = `default-src 'none'; script-src 'self' 'nonce-${nonce}' https://accounts.google.com https://maps.googleapis.com https://unpkg.com https://www.googletagmanager.com https://code.jquery.com https://cdn.jsdelivr.net https://static.cloudflareinsights.com https://challenges.cloudflare.com 'strict-dynamic'; style-src 'self' 'nonce-${nonce}' https://maps.googleapis.com https://cdnjs.cloudflare.com https://fonts.googleapis.com; connect-src 'self' https://firemap-worker.jaspervdz.workers.dev https://maps.googleapis.com https://www.googletagmanager.com https://analytics.google.com https://www.google-analytics.com https://stats.g.doubleclick.net; img-src 'self' data: https://maps.googleapis.com https://www.googletagmanager.com https://maps.gstatic.com; font-src https://fonts.gstatic.com;`;
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Security-Policy': csp,
          'X-Worker': 'true'
        }
      });
    } catch (error) {
      console.error('Error processing index.html:', error);
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
