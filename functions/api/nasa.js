export async function onRequest(context) {
  const apiKey = context.env.NASA_FIRMS_MAP_KEY;
  const url = `https://firms.modaps.eosdis.nasa.gov/api/some-endpoint?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Error fetching data", { status: 500 });
  }
}
