import { Server } from 'socket.io';
import { allowedOrigins } from '../middlewares/cors';
import roomHandler from './room';
import chatHandler from './chat';
import { UPDATE_PLAYERS } from '../config/socketio';
import httpServer from '../app';
import UserModel from '../models/User';

const io = new Server(httpServer, {
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
      const disconnectedPlayerIndex = room.players.findIndex((player) => player.socketId === socket.id);
      const disconnectedPlayer = room.players.splice(disconnectedPlayerIndex, 1)[0];

      if (disconnectedPlayer) {
        UserModel.updateMoneyByID(disconnectedPlayer.user.id, disconnectedPlayer.user.totalMoney + disconnectedPlayer.user.currentMoney);
      }
      store.rooms.set(room_id, room);
      io.to(room_id).emit(UPDATE_PLAYERS, room.players);
    }
    console.log("User has disconnected: " + socket.id + " because of " + reason);
  });
}

io.on("connection", onConnection);

export default httpServer;
