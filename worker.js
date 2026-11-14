// Cloudflare Worker / Pages Single-Page-App Static Asset Handler
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      let response = await env.ASSETS.fetch(request);

      // If 404 on page navigation, route to index.html for SPA client routing
      if (response.status === 404 && !url.pathname.includes('.')) {
        response = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
      }

      return response;
    } catch (e) {
      return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
    }
  }
};
