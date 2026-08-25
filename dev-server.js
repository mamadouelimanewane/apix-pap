import http from 'http';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = http.createServer(async (req, res) => {
  // Parse body
  let body = '';
  req.on('data', chunk => body += chunk.toString());

  req.on('end', async () => {
    try {
      const parsedBody = body ? JSON.parse(body) : {};
      const handlerPath = join(__dirname, `./api${req.url.split('?')[0]}.js`);
      const handlerUrl = pathToFileURL(handlerPath).href;
      const handler = await import(handlerUrl).then(m => m.default);

      if (handler) {
        const mockReq = {
          method: req.method,
          body: parsedBody,
          query: {},
          params: {},
          headers: req.headers
        };

        const mockRes = {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          status: function(code) { this.statusCode = code; return this; },
          json: function(data) {
            res.writeHead(this.statusCode, this.headers);
            res.end(JSON.stringify(data));
          }
        };

        return await handler(mockReq, mockRes);
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Route not found' }));
    } catch (error) {
      console.error('API error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Dev API server running at http://localhost:${PORT}\n`);
});
