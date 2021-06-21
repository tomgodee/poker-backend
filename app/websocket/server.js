import { MESSAGE_SENT, JOIN_ROOM } from '../config/socketio';
import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import { allowedOrigins } from '../middlewares/cors';
import roomHandler from './room';
import chatHandler from './chat';
import { UPDATE_PLAYERS } from '../config/socketio';

var app = express();

const httpServer = http.createServer(app);

const io = socketio(httpServer, {
  cors: {
    origin: allowedOrigins,
  }
});

// rooms is a map with room_id is the key 
// the value is an object which has the following shape
/*
  {
    players: [{
      socketId: string,
      user: {
        seat: number,
        name: string,
        currentMoney: number,
        totalMoney: number,
        bet: number,
        hasActioned: boolean,
        actions: string[],
        isActing: boolean,
        role: string,
        cards: [{
          number: number,
          suite: string,
        }],
        isWinner: boolean,
        status: string,
      }
      }],
    deck: string[],
    communityCards: [{
      number: number,
      suite: string,
    }],
    bigBlind: number;
    round: string;
    roundBet: number;
    pots: [{
      id: number;
      amount: number;
      limit: number;
      bestHandStrength: number;
      winners: string[];
      excludedPlayers: string[];
      sidePot: boolean;
    }];
  }
*/
var store = {
  rooms: new Map(),
};

const onConnection = (socket) => {
  roomHandler(io, socket, store);
  chatHandler(io, socket);
  socket.on('disconnect', function(reason) {
    const rooms = store.rooms;
    for (const [room_id, room] of rooms.entries()) {
      let updatedRoom = room;
      updatedRoom.players = room.players.filter((player) => player.socketId !== socket.id);
      store.rooms.set(room_id, updatedRoom);
      io.to(room_id).emit(UPDATE_PLAYERS, updatedRoom.players);
    }
    console.log("User has disconnected: " + socket.id + " because of " + reason);
  });
}

io.on("connection", onConnection);

export {
  httpServer,
}; 
