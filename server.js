import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    // Disable caching during development
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Normalize URL
    let safePath = req.url.split('?')[0];
    if (safePath === '/') safePath = '/index.html';

    const filePath = path.join(__dirname, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        const nextPort = PORT + 1;
        console.log(`[Server] Port ${PORT} occupied, falling back to ${nextPort}`);
        server.listen(nextPort);
    } else {
        console.error('[Server Error]', err);
    }
});

server.listen(PORT, () => {
    console.log('='.repeat(72));
    console.log('  ⚡ BOUNCE KILL - 3D TACTICAL FPS PROTOTYPE ⚡');
    console.log('='.repeat(72));
    console.log(`  Local Server:  http://localhost:${PORT}`);
    console.log(`  Root Dir:      ${__dirname}`);
    console.log('  The Rule:      Direct shots do 0 damage. Bounce bullets off walls!');
    console.log('='.repeat(72));
    console.log('  Ready! Open http://localhost:8000 in your browser.');
    console.log('-'.repeat(72));
});

