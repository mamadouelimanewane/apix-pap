export default function middleware(request) {
  // For all non-API, non-static routes, serve index.html
  const { pathname } = new URL(request.url);

  // Skip API routes
  if (pathname.startsWith('/api')) {
    return undefined;
  }

  // Skip static files
  if (pathname.includes('.')) {
    return undefined;
  }

  // Rewrite to index.html for SPA
  return new Response(undefined, {
    status: 307,
    headers: {
      location: pathname === '/' ? '/' : '/?path=' + encodeURIComponent(pathname)
    }
  });
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)']
};
