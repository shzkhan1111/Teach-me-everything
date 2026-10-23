const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = { '/': ['index.html', 'text/html'], '/lesson.js': ['lesson.js', 'text/javascript'], '/app.js': ['app.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'], '/LCM-lesson-with-voice.mp4': ['LCM-lesson-with-voice.mp4', 'video/mp4'] };
const port = Number(process.env.PORT || 4173);
http.createServer((req, res) => {
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404); res.end('Not found'); return; }
  fs.readFile(path.join(__dirname, file[0]), (error, data) => {
    if (error) { res.writeHead(500); res.end('Unable to read app file'); return; }
    res.writeHead(200, { 'Content-Type': file[1].startsWith('text/') ? file[1] + '; charset=utf-8' : file[1], 'Content-Length': data.length, 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => console.log(`Prompt Video Studio: http://127.0.0.1:${port}`));
