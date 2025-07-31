const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

let sender = null;
let viewer = null;

wss.on('connection', function connection(ws) {
  if (!viewer) viewer = ws;

  ws.on('message', function incoming(message) {
    const msg = JSON.parse(message);
    if (msg.offer) {
      sender = ws;
      if (viewer) viewer.send(message);
    } else if (msg.answer) {
      if (sender) sender.send(message);
    }
  });

  ws.on('close', () => {
    if (ws === sender) sender = null;
    if (ws === viewer) viewer = null;
  });
});

console.log("✅ WebSocket server running on ws://localhost:3000");
