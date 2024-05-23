const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const games = {};

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);

    if (data.type === 'host') {
      const code = generateCode();
      games[code] = { teacher: ws };
      ws.send(JSON.stringify({ type: 'host', code }));
    } else if (data.type === 'join') {
      const { code } = data;
      if (games[code]) {
        games[code].student = ws;
        games[code].teacher.send(JSON.stringify({ type: 'studentJoined' }));
        ws.send(JSON.stringify({ type: 'join', success: true }));
      } else {
        ws.send(JSON.stringify({ type: 'join', success: false, message: 'Invalid code' }));
      }
    } else if (data.type === 'offer') {
      games[data.code].student.send(JSON.stringify({ type: 'offer', offer: data.offer }));
    } else if (data.type === 'answer') {
      games[data.code].teacher.send(JSON.stringify({ type: 'answer', answer: data.answer }));
    } else if (data.type === 'candidate') {
      if (data.role === 'teacher') {
        games[data.code].student.send(JSON.stringify({ type: 'candidate', candidate: data.candidate }));
      } else {
        games[data.code].teacher.send(JSON.stringify({ type: 'candidate', candidate: data.candidate }));
      }
    }
  });
});

function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

console.log('WebSocket server running on ws://localhost:8080');
