"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pingRouter = _express.default.Router();

pingRouter.get('/', function (req, res) {
  res.send("pong at ".concat(req.requestTime));
});
var _default = pingRouter;
exports.default = _default;