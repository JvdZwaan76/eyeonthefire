export default {
  async fetch(request, env) {
    try {
      const apiKey = env.NASA_FIRMS_MAP_KEY;
      if (!apiKey) {
        return new Response('API key not set', { status: 500 });
      }
      const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/world/1`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`FIRMS API error! status: ${response.status}`);
      }
      const csvText = await response.text();
      const rows = csvText.trim().split('\n').slice(1); // Skip header
      const fires = rows.map(row => {
        const columns = row.split(',');
        if (columns.length < 7) return null;
        const lat = parseFloat(columns[0]);
        const lon = parseFloat(columns[1]);
        const acqDate = columns[5];
        const acqTime = columns[6];
        if (isNaN(lat) || isNaN(lon)) return null;
        return { lat, lon, title: `Fire on ${acqDate} at ${acqTime}` };
      }).filter(fire => fire !== null);
      return new Response(JSON.stringify(fires), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error(error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
