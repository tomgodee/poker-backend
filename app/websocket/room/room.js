import { JOIN_ROOM } from '../../config/socketio';

export default function roomHandler(io, socket) {
  const joinRoom = (data) => {
      socket.join(data.roomId);
    }

  socket.on(JOIN_ROOM, joinRoom);
}
