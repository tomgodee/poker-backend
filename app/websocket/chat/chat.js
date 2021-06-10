import { MESSAGE_SENT } from '../../config/socketio';

export default function chatHandler(io, socket, room) {
  const messageSent = (message, sendAcknowledgement) => {
    io.to(message.roomId).emit(MESSAGE_SENT, message);
    sendAcknowledgement(message);
  }

  socket.on(MESSAGE_SENT, messageSent);
}
