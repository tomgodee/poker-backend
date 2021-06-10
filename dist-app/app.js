"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.string.iterator.js");

require("core-js/modules/es.weak-map.js");

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.object.get-own-property-descriptor.js");

require("core-js/modules/es.symbol.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.symbol.iterator.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.array.join.js");

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _cors = _interopRequireWildcard(require("./middlewares/cors"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _morgan = _interopRequireDefault(require("morgan"));

var _requestTime = _interopRequireDefault(require("./middlewares/requestTime"));

var _UserRouter = _interopRequireDefault(require("./routes/user/UserRouter"));

var _PingRouter = _interopRequireDefault(require("./routes/ping/PingRouter"));

var _room = _interopRequireDefault(require("./routes/room"));

var _http = _interopRequireDefault(require("http"));

var _socket = _interopRequireDefault(require("socket.io"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express.default)();

var httpServer = _http.default.createServer(app);

var ioServer = (0, _socket.default)(httpServer, {
  cors: {
    origin: _cors.allowedOrigins
  }
});
ioServer.on("connection", function (socket) {
  // console.log('socket', socket.id);
  var room;
  socket.on('join room', function (data) {
    // console.log('User', data.username, 'joins room ', data.roomId);
    room = "room ".concat(data.roomId);
    1;
    socket.join(room);
  });
  socket.on('client sends message', function (message, sendAcknowledgement) {
    ioServer.to(room).emit('server sends message', message);
    sendAcknowledgement(message);
  });
});
httpServer.listen(3000); // Default middlewares

app.use((0, _morgan.default)('dev'));
app.use(_express.default.json());
app.use(_express.default.urlencoded({
  extended: false
}));
app.use((0, _cookieParser.default)()); // Library middlewares

app.use(_cors.default); // enable pre-flight request 
// TODO: app.use(cors) might solve this already so might need to check this in the future to see if we need this line

app.options('/', _cors.default); // Hand-written middlewares

app.use(_requestTime.default);
app.get('/', function (req, res) {
  var responseText = 'Hello World!<br>';
  responseText += '<small>Requested at: ' + req.requestTime + '</small>';
  res.send(responseText);
});
app.use('/ping', _PingRouter.default);
app.use('/user', _UserRouter.default);
app.use('/room', _room.default);
var _default = app;
exports.default = _default;