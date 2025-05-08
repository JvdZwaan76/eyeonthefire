export default {
  async fetch(request, env) {
    try {
      // Access the NASA FIRMS API key from environment variables
      const apiKey = env.NASA_FIRMS_MAP_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "NASA FIRMS API key not configured" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Construct the NASA FIRMS API URL (example endpoint for active fire data)
      const nasaApiUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/world/1`;

      // Fetch data from NASA FIRMS API
      const response = await fetch(nasaApiUrl);
      if (!response.ok) {
        throw new Error(`NASA API request failed with status: ${response.status}`);
      }

      // Parse the CSV response (assuming the API returns CSV)
      const csvText = await response.text();
      const rows = csvText.split("\n").slice(1); // Skip header row
      const fireData = rows
        .filter(row => row.trim() !== "")
        .map(row => {
          const [latitude, longitude, brightness, scan, track, acq_date, acq_time, satellite, confidence, version, bright_t31, frp, daynight] = row.split(",");
          return {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            brightness: parseFloat(brightness),
            date: acq_date,
            time: acq_time,
            confidence,
          };
        });

      // Return the parsed data as JSON
      return new Response(
        JSON.stringify(fireData),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      // Return a detailed error message
      return new Response(
        JSON.stringify({ error: "Failed to fetch fire data", details: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
