import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
const { setupWSConnection, setPersistence } = require('y-websocket/bin/utils.js');
import { RedisPersistence } from './redis-adapter';
import { createServer } from 'http';
import { parse } from 'url';
import { decode } from 'next-auth/jwt';

const persistence = new RedisPersistence();

// properly configure y-websocket persistence
setPersistence({
  bindState: async (docName: string, ydoc: Y.Doc) => {
    await persistence.bindState(docName, ydoc);
  },
  writeState: async (docName: string, ydoc: Y.Doc) => {
    // Incremental writing is already handled inside bindState
    return Promise.resolve();
  }
});

const server = createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('okay');
});

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (conn, req, { docName }) => {
  setupWSConnection(conn, req, { docName, gc: true, pingTimeout: 30000 });
});

server.on('upgrade', async (request, socket, head) => {
  try {
    const { pathname } = parse(request.url || '', true);

    if (pathname && pathname.startsWith('/yjs/')) {
      const docName = pathname.substring(5);

      // Authenticate via NextAuth JWT
      const cookies = request.headers.cookie
        ? Object.fromEntries(request.headers.cookie.split('; ').map(c => c.split('=')))
        : {};

      const token = cookies['next-auth.session-token'] || cookies['__Secure-next-auth.session-token'];

      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // We decode the token using next-auth/jwt
      const isSecure = !!cookies['__Secure-next-auth.session-token'];
      const salt = isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token';

      const decoded = await decode({
        token,
        secret: process.env.AUTH_SECRET || 'secret',
        salt,
      });

      if (!decoded) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, { docName });
      });
    } else {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
    }
  } catch (err) {
    socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
    socket.destroy();
  }
});

server.listen(1234, () => {
  console.log('Yjs WebSocket Server running on port 1234');
});
