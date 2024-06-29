//for starting type: "node server.js" or "npm start"
//const express = require('express'); //requires express module
//const socket = require('socket.io'); //requires socket.io module
//const fs = require('fs');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Create an HTTP server and integrate with Socket.IO
const server = http.createServer(app);
const io = socketIo(server);

// Define a port to listen on
//const PORT = process.env.PORT;
const PORT =3000
// Serve a simple route for testing
app.get('/', (req, res) => {
    res.send('Socket.IO server is running.');
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for 'message' events from clients
    socket.on('message', (data) => {
        console.log('Received message:', data);
        const receivedMessage = data.message;
        const receivedExtra = data.extra;
        if(receivedMessage=="Request"){
            console.log('Request', data); 
            const requestMess = {
                message: receivedMessage,
                extra: socket.id
            };
        // sending to all clients except sender  
        console.log('requestMess', requestMess); 
        socket.broadcast.emit('message', requestMess);  
        }else if(receivedMessage=="AcceptingTheRequest"){
            const acceptMess = {
                message: receivedMessage,
                extra: socket.id
            };
            console.log(receivedMessage, acceptMess); 
            io.to(receivedExtra).emit('message', acceptMess);

        }else if(receivedMessage=="CancelRequest"){
            const cancelMess = {
                message: receivedMessage,
                extra: socket.id
            };
            console.log(receivedMessage, cancelMess); 
          //  io.to(receivedExtra).emit('message', acceptMess);  
          //  io.to(socket.id).emit('message', acceptMess);  
            // sending to all clients except sender  
           socket.broadcast.emit('message', cancelMess);  
        }
        
        else if(receivedMessage=="DenyRequest"){
            const acceptMess = {
                message: receivedMessage,
                extra: socket.id
            };
            console.log(receivedMessage, acceptMess); 
            io.to(receivedExtra).emit('message', acceptMess);  

        }else if(receivedMessage=="Disconnect"){
            const acceptMess = {
                message: receivedMessage,
                extra: socket.id
            };
            console.log(receivedMessage, acceptMess); 
            io.to(receivedExtra).emit('message', acceptMess);
            io.to(socket.id).emit('message', acceptMess);
        }else if(receivedMessage=="Spin"){
            const acceptMess = {
                message: receivedMessage,
                extra: receivedExtra
            };
            console.log(receivedMessage, acceptMess); 
         //   io.to(receivedExtra).emit('message', acceptMess);
            io.emit('message', acceptMess);
         //socket.broadcast.emit('message', acceptMess);
        }
        
        else{   
        // Broadcast the message to all connected clients
        io.emit('message', data);
        console.log('Answer0:', data); 
        // Send an answer back to the specific client
        const answerData = { answer: 'This is the answer from the server' };
        console.log('Answer:', answerData);  
        socket.emit('answer', answerData);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
