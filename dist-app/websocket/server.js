"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.httpServer = void 0;

var _socketio = require("../config/socketio");

var _express = _interopRequireDefault(require("express"));

var _http = _interopRequireDefault(require("http"));

var _socket = _interopRequireDefault(require("socket.io"));

var _cors = require("../middlewares/cors");

var _room = _interopRequireDefault(require("./room"));

var _chat = _interopRequireDefault(require("./chat"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express.default)();

var httpServer = _http.default.createServer(app);

exports.httpServer = httpServer;
var io = (0, _socket.default)(httpServer, {
  cors: {
    origin: _cors.allowedOrigins
  }
});

var onConnection = function onConnection(socket) {
  (0, _room.default)(io, socket);
  (0, _chat.default)(io, socket);
};

io.on("connection", onConnection);