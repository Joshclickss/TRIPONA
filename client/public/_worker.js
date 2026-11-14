// Cloudflare Pages / Workers Single-Page-App Static Asset Handler
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Try serving static asset directly
    let response = await env.ASSETS.fetch(request);

    // If 404 on a page navigation, return index.html for SPA client-side routing
    if (response.status === 404 && !url.pathname.includes('.')) {
      response = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
    }

    return response;
  }
};
