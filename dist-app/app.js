"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _cors = _interopRequireDefault(require("./middlewares/cors"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _morgan = _interopRequireDefault(require("morgan"));

var _requestTime = _interopRequireDefault(require("./middlewares/requestTime"));

var _UserRouter = _interopRequireDefault(require("./routes/user/UserRouter"));

var _PingRouter = _interopRequireDefault(require("./routes/ping/PingRouter"));

var _room = _interopRequireDefault(require("./routes/room"));

var _server = require("./websocket/server");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express.default)(); // Websocket server

_server.httpServer.listen(3000); // Http server
// Default middlewares


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