"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = chatHandler;

var _socketio = require("../../config/socketio");

function chatHandler(io, socket, room) {
  var messageSent = function messageSent(message, sendAcknowledgement) {
    io.to(message.roomId).emit(_socketio.MESSAGE_SENT, message);
    sendAcknowledgement(message);
  };

  socket.on(_socketio.MESSAGE_SENT, messageSent);
}