const http = require('http');
const fs = require('fs');
const path = require('path');
const types = { '.css': 'text/css', '.js': 'application/javascript', '.html': 'text/html' };

http.createServer((req, res) => {
  const requestPath = req.url === '/' ? 'index.html' : decodeURIComponent(req.url).replace(/^\/+/, '');
  const file = path.join(__dirname, requestPath);
  if (!file.startsWith(__dirname)) return res.writeHead(403).end('Forbidden');
  fs.readFile(file, (error, data) => {
    if (error) return res.writeHead(404).end('Not found');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(4173, '127.0.0.1');
