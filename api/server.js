const express = require('express');
const { Server } = require('socket.io');
const { createServer } = require('http');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware to log request details
app.use((req, res, next) => {
    res.on('finish', () => {
        if (res.statusCode === 400) {
            console.error(`Bad Request: ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)} - Query: ${JSON.stringify(req.query)} - Headers: ${JSON.stringify(req.headers)}`);
        }
    });
    next();
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// Serve a simple route for testing
app.get('/', (req, res) => {
  res.send('Socket.IO server is running.');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('message', (data) => {
    console.log('Received message:', data);
    const receivedMessage = data.message;
    const receivedExtra = data.extra;

    if (receivedMessage == "Request") {
      console.log('Request', data);
      const requestMess = {
        message: receivedMessage,
        extra: socket.id
      };
      socket.broadcast.emit('message', requestMess);

    } else if (receivedMessage == "AcceptingTheRequest") {
      const acceptMess = {
        message: receivedMessage,
        extra: socket.id
      };
      io.to(receivedExtra).emit('message', acceptMess);

    } else if (receivedMessage == "CancelRequest") {
      const cancelMess = {
        message: receivedMessage,
        extra: socket.id
      };
      socket.broadcast.emit('message', cancelMess);

    } else if (receivedMessage == "DenyRequest") {
      const acceptMess = {
        message: receivedMessage,
        extra: socket.id
      };
      io.to(receivedExtra).emit('message', acceptMess);

    } else if (receivedMessage == "Disconnect") {
      const acceptMess = {
        message: receivedMessage,
        extra: socket.id
      };
      io.to(receivedExtra).emit('message', acceptMess);
      io.to(socket.id).emit('message', acceptMess);

    } else if (receivedMessage == "Spin") {
      const acceptMess = {
        message: receivedMessage,
        extra: receivedExtra
      };
      io.emit('message', acceptMess);

    } else {
      io.emit('message', data);
      const answerData = { answer: 'This is the answer from the server' };
      socket.emit('answer', answerData);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

module.exports = (req, res) => {
  server.emit('request', req, res);
};
