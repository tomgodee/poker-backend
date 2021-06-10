import { MESSAGE_SENT, JOIN_ROOM } from '../config/socketio';
import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import { allowedOrigins } from '../middlewares/cors';
import roomHandler from './room';
import chatHandler from './chat';

var app = express();

const httpServer = http.createServer(app);

const io = socketio(httpServer, {
  cors: {
    origin: allowedOrigins,
  }
});

const onConnection = (socket) => {
  roomHandler(io, socket);
  chatHandler(io, socket);
}

io.on("connection", onConnection);

export {
  httpServer,
}; 
