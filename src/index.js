// Cloudflare Worker for Eye on the Fire
// Handles API key retrieval and NASA FIRMS data fetching

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Wildcard for testing; restrict later
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function validateTurnstileToken(token, env) {
  const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  const response = await fetch(verifyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
    }),
  });
  const result = await response.json();
  return result.success;
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (request.method === 'OPTIONS') {
        console.log('Handling OPTIONS request');
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }

      if (path === '/api-keys') {
        console.log('Serving /api-keys');
        return new Response(
          JSON.stringify({
            googleMaps: env.GOOGLE_MAPS_API_KEY,
            turnstileSiteKey: env.TURNSTILE_SITE_KEY,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          },
        );
      }

      if (path === '/nasa/firms') {
        console.log('Handling /nasa/firms request');
        const source = url.searchParams.get('source') || 'MODIS_NRT';
        const days = parseInt(url.searchParams.get('days')) || 1;
        const area = url.searchParams.get('area') || null;
        const north = parseFloat(url.searchParams.get('north'));
        const south = parseFloat(url.searchParams.get('south'));
        const east = parseFloat(url.searchParams.get('east'));
        const west = parseFloat(url.searchParams.get('west'));

        console.log('Request parameters:', { source, days, area, north, south, east, west });

        if (!env.NASA_FIRMS_API_KEY) {
          console.error('NASA_FIRMS_API_KEY is not set');
          return new Response('Server configuration error: Missing API key', {
            status: 500,
            headers: corsHeaders,
          });
        }

        if (isNaN(days) || days < 1 || days > 10) {
          console.error('Invalid days parameter:', days);
          return new Response('Invalid days parameter. Must be a number between 1-10', {
            status: 400,
            headers: corsHeaders,
          });
        }

        let firmsUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${env.NASA_FIRMS_API_KEY}/${source}`;
        if (north && south && east && west && !isNaN(north) && !isNaN(south) && !isNaN(east) && !isNaN(west)) {
          const intWest = Math.round(west);
          const intSouth = Math.round(south);
          const intEast = Math.round(east);
          const intNorth = Math.round(north);
          console.log('Using provided coordinates:', { intWest, intSouth, intEast, intNorth, days });
          firmsUrl += `/${intWest}/${intSouth}/${intEast}/${intNorth}/${days}`;
        } else if (area === 'usa') {
          const usaWest = -125;
          const usaSouth = 24;
          const usaEast = -66;
          const usaNorth = 49;
          console.log('Using USA coordinates:', { usaWest, usaSouth, usaEast, usaNorth, days });
          firmsUrl += `/${usaWest}/${usaSouth}/${usaEast}/${usaNorth}/${days}`;
        } else {
          console.error('Invalid area or coordinates:', { area, west, south, east, north });
          return new Response('Invalid area or coordinates. Expects valid coordinates or "usa"', {
            status: 400,
            headers: corsHeaders,
          });
        }

        console.log(`Fetching FIRMS data from: ${firmsUrl}`);
        const response = await fetch(firmsUrl, {
          headers: { 'Accept': 'text/csv' },
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`FIRMS API error: ${response.status} ${response.statusText} - ${errorText}`);
          return new Response(`FIRMS API error: ${response.status} - ${errorText}`, {
            status: response.status,
            headers: corsHeaders,
          });
        }

        const csvData = await response.text();
        console.log('FIRMS response:', csvData.substring(0, 100));
        if (csvData.includes('Invalid') || csvData.trim() === '') {
          console.error(`FIRMS API returned error: ${csvData}`);
          return new Response(csvData || 'Empty response from FIRMS API', {
            status: 400,
            headers: corsHeaders,
          });
        }

        return new Response(csvData, {
          status: 200,
          headers: { 'Content-Type': 'text/csv', ...corsHeaders },
        });
      }

      console.log('Path not found:', path);
      return new Response('Not found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Worker error:', error.message, error.stack);
      return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
    }
  },
};
