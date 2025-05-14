// src/index.js for your eyeonthefire Worker

export default {
  async fetch(request, env, ctx) {
    // Set up CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://eyeonthefire.com",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    
    // Handle OPTIONS request for CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Parse the URL and path
    const url = new URL(request.url);
    const path = url.pathname.split('/').filter(Boolean);
    
    // API endpoint for fire data
    if (path[0] === "api" && path[1] === "nasa" && path[2] === "firms") {
      return await handleFireDataRequest(request, url, env, corsHeaders);
    }
    
    // Default response for unmatched routes
    return new Response("Not found", { 
      status: 404,
      headers: {
        "Content-Type": "text/plain",
        ...corsHeaders
      } 
    });
  }
};

async function handleFireDataRequest(request, url, env, corsHeaders) {
  try {
    // Get Turnstile token from request
    const turnstileToken = url.searchParams.get("cf-turnstile-token");
    
    // Verify Turnstile token
    if (!turnstileToken) {
      return new Response(JSON.stringify({ 
        error: true, 
        message: "Turnstile token is required" 
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    
    // Verify the token with Turnstile
    const turnstileResult = await verifyTurnstileToken(turnstileToken, env, request);
    
    if (!turnstileResult.success) {
      return new Response(JSON.stringify({
        error: true,
        message: "Turnstile verification failed",
        details: turnstileResult
      }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    
    // Parse query parameters for the NASA FIRMS API
    const source = url.searchParams.get("source") || "MODIS_NRT";
    const days = url.searchParams.get("days") || "1";
    const area = url.searchParams.get("area") || "usa";
    
    // Create bounds parameter if provided
    let boundsParam = "";
    if (url.searchParams.has("north") && 
        url.searchParams.has("south") && 
        url.searchParams.has("east") && 
        url.searchParams.has("west")) {
      boundsParam = `&extent=${url.searchParams.get("west")},${url.searchParams.get("south")},${url.searchParams.get("east")},${url.searchParams.get("north")}`;
    }
    
    // Cache key for the request
    const cacheKey = `firms-${source}-${area}-${days}-${boundsParam}`;
    
    // Check if we have a cached response
    const cache = caches.default;
    let cachedResponse = await cache.match(cacheKey);
    
    if (cachedResponse) {
      // Return cached data with cors headers
      return new Response(cachedResponse.body, {
        headers: {
          ...cachedResponse.headers,
          ...corsHeaders
        }
      });
    }
    
    // Construct NASA FIRMS API URL using the base URL and API key from environment
    const nasaFirmsUrl = `${env.NASA_FIRMS_URL}/area/json/${env.NASA_API_KEY}/${source}/${area}/${days}${boundsParam}`;
    
    // Fetch data from NASA FIRMS
    const firmsResponse = await fetch(nasaFirmsUrl);
    
    if (!firmsResponse.ok) {
      throw new Error(`NASA FIRMS API returned status ${firmsResponse.status}`);
    }
    
    const firmsData = await firmsResponse.json();
    
    // Cache the response (5 minutes)
    const response = new Response(JSON.stringify(firmsData), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=300",
        ...corsHeaders
      }
    });
    
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    
    return response;
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(JSON.stringify({
      error: true,
      message: `Error processing request: ${error.message}`
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
}

async function verifyTurnstileToken(token, env, request) {
  const turnstileResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: request.headers.get("CF-Connecting-IP")
      })
    }
  );
  
  return await turnstileResponse.json();
}
