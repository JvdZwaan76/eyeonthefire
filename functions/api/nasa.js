export async function onRequest(context) {
     const mapKey = context.env.NASA_FIRMS_MAP_KEY;
     const response = await fetch(`https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/world/1`, {
       method: 'GET',
     });
     const data = await response.text();
     return new Response(data, { status: 200 });
   }
