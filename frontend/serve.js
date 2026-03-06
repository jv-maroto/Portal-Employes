const http = require('http');
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(buildDir, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(buildDir, 'index.html');
  }
  const ext = path.extname(filePath);
  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

const port = process.env.PORT || 3000;
server.listen(port, '127.0.0.1', () => {
  console.log(`Frontend corriendo en http://localhost:${port}`);
});
