export default {
  async fetch(request, env) {
    return new Response(JSON.stringify({ message: "Test response" }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
