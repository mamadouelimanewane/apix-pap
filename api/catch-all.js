const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  // For SPA: serve index.html for all non-file requests
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200);

  // Try to read the built index.html
  try {
    const indexPath = path.join(process.cwd(), '.vercel', 'output', 'static', 'index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');
    res.end(html);
  } catch (e) {
    // Fallback minimal HTML
    res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>APIX-PAP</title>
  <script>
    if (window.location.pathname !== '/' && !window.location.pathname.includes('.')) {
      window.location.href = '/?path=' + encodeURIComponent(window.location.pathname);
    }
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>`);
  }
}
