"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pgPromise = _interopRequireDefault(require("pg-promise"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = (0, _pgPromise.default)()('postgres://postgres:zxc321@localhost:5432/tom');
var _default = db;
exports.default = _default;