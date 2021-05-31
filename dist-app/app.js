"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _morgan = _interopRequireDefault(require("morgan"));

var _requestTime = _interopRequireDefault(require("./middlewares/requestTime"));

var _UserRouter = _interopRequireDefault(require("./routes/user/UserRouter"));

var _PingRouter = _interopRequireDefault(require("./routes/ping/PingRouter"));

var _pgPromise = _interopRequireDefault(require("pg-promise"));

var _ping = _interopRequireDefault(require("./routes/ping"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// var pgp = require('pg-promise')(/* options */)
var db = (0, _pgPromise["default"])()('postgres://postgres:zxc321@localhost:5432/tom');
var app = (0, _express["default"])();
app.use((0, _morgan["default"])('dev'));
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: false
}));
app.use((0, _cookieParser["default"])());
app.use(_requestTime["default"]);
app.get('/', function (req, res) {
  var responseText = 'Hello World!<br>';
  responseText += '<small>Requested at: ' + req.requestTime + '</small>';
  res.send(responseText);
});
app.use('/ping', _PingRouter["default"]);
app.use('/user', _UserRouter["default"]);
var _default = app;
exports["default"] = _default;