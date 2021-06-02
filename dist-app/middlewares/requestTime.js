"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var requestTime = function requestTime(req, res, next) {
  req.requestTime = (0, _moment.default)(Date.now()).format('hh:mm:ss DD/MM/YYYY');
  next();
};

var _default = requestTime;
exports.default = _default;