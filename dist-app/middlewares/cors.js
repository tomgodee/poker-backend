"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _cors = _interopRequireDefault(require("cors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var allowlist = ['http://localhost:3001', 'http://localhost:3002'];

var corsOptionsDelegate = function corsOptionsDelegate(req, callback) {
  var corsOptions;

  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = {
      origin: allowlist
    };
  } else {
    corsOptions = {
      origin: false
    }; // disable CORS for this request
  }

  callback(null, corsOptions); // callback expects two parameters: error and options
};

var _default = (0, _cors.default)(corsOptionsDelegate);

exports.default = _default;