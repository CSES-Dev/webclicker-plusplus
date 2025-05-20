import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

let wss: WebSocketServer;

export function initWebSocketServer(server: Server) {
  wss = new WebSocketServer({ 
    server,
    clientTracking: true,
    perMessageDeflate: false
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');
    
    // Send welcome message
    ws.send('Connected to WebSocket server!');

    ws.on('message', (message: Buffer) => {
      try {
        console.log('Received:', message.toString());
        ws.send(`Server received: ${message}`);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', (code: number, reason: Buffer) => {
      console.log('Client disconnected:', code, reason.toString());
    });
  });

  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });

  return wss;
}

export function getWebSocketServer() {
  return wss;
} 