"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = roomHandler;

require("core-js/modules/es.array.join.js");

var _socketio = require("../../config/socketio");

function roomHandler(io, socket) {
  var joinRoom = function joinRoom(data) {
    socket.join(data.roomId);
  };

  socket.on(_socketio.JOIN_ROOM, joinRoom);
}