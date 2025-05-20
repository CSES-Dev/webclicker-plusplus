import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initWebSocketServer } from './lib/websocket';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    
    // handle  WebSocket  requests
    if (parsedUrl.pathname === '/ws') {
      res.writeHead(426);
      res.end();
      return;
    }
    
    handle(req, res, parsedUrl);
  });

  initWebSocketServer(server);

  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
}); 