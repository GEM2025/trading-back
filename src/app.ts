import "dotenv/config";

import express from "express";
import cors from "cors";
import http from 'http';
import { Server } from 'socket.io';

import { router } from "./routes";
import db from "./config/mongo";

// src
const PORT = process.env.PORT || 3001; // buscar el puerto en .env  variable de entorno de lo contrario 3001
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors:
    {
        // handling CORS in socket.io v4.0 - https://socket.io/docs/v4/handling-cors/
        origin: process.env.CORS_REMOTE_HOST,
        allowedHeaders: ["authorization"],
        credentials: true,
    }
});

// REST - Enable CORS for all REST routes
app.use(cors());
app.use(express.json()); // para poder recibir datos REST en formato JSON por el Body
app.use(router); 

// MongoDB
db().then(() => console.log("MongoDB Connection Ready"));

// Socket.IO - Define the connection handler
io.on('connection', (socket) => {

    const idHandShake = socket.id;
    const { nameRoom } = socket.handshake.query;
    const origin = socket.handshake.headers.origin;
    const authorization = socket.handshake.headers.authorization;

    console.log(`Connection origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom} authorization ${authorization}`);

    // for admin and interac purposes,  notify the rest of the users who accessed
    socket.broadcast.emit('Connection', `origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);

    socket.on('disconnect', () => {
        // for admin and interac purposes,  notify the rest of the users who accessed
        console.log(`Disconnect ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);
        socket.broadcast.emit('Disconnect', `origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);
    });

});

// Socket.IO - Send the heartbeat message to all connected clients
setInterval(() => {
    io.emit('Heartbeat', new Date);    
}, 1000);

// Puro REST: app.listen(PORT, () => console.log(`Port ready ${PORT}`)); pero para REST + SOCKETIO
httpServer.listen(PORT, () => console.log(`Port ready ${PORT}`));

