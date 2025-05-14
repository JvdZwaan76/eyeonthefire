/**
 * Cloudflare Worker to handle API keys and proxy NASA FIRMS requests
 * Validates Turnstile tokens and secures sensitive keys
 */
export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method === 'GET') {
      try {
        const url = new URL(request.url);
        const path = url.pathname;
        if (path === '/api-keys') {
          return new Response(
            JSON.stringify({
              googleMaps: env.GOOGLE_youMAPS_API_KEY || '',
              turnstileSiteKey: env.TURNSTILE_SITE_KEY || '',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            },
          );
        }
        if (path === '/nasa/firms') {
          const turnstileToken = url.searchParams.get('cf-turnstile-token');
          if (!turnstileToken || !(await validateTurnstileToken(turnstileToken, env))) {
            return new Response('Invalid or missing Turnstile token', {
              status: 403,
              headers: corsHeaders,
            });
          }
          const source = url.searchParams.get('source') || 'MODIS_NRT';
          const days = url.searchParams.get('days') || '1';
          const area = url.searchParams.get('area') || 'world';
          let firmsUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${env.NASA_FIRMS_API_KEY}/${source}/${area}/${days}`;
          const north = url.searchParams.get('north');
          const south = url.searchParams.get('south');
          const east = url.searchParams.get('east');
          const west = url.searchParams.get('west');
          if (north && south && east && west) {
            firmsUrl += `/${west}/${south}/${east}/${north}`;
          }
          const response = await fetch(firmsUrl);
          if (!response.ok) {
            throw new Error(`FIRMS API responded with status ${response.status}`);
          }
          const csvData = await response.text();
          return new Response(csvData, {
            status: 200,
            headers: { 'Content-Type': 'text/csv', ...corsHeaders },
          });
        }
        return new Response('Not Found', { status: 404, headers: corsHeaders });
      } catch (error) {
        console.error('Worker error:', error);
        return new Response('Internal Server Error', {
          status: 500,
          headers: corsHeaders,
        });
      }
    }
    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders,
    });
  },
};

async function validateTurnstileToken(token, env) {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Turnstile validation error:', error);
    return false;
  }
}
