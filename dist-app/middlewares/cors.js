"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.allowedOrigins = void 0;

var _cors = _interopRequireDefault(require("cors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var allowedOrigins = ['http://localhost:3001', 'http://localhost:3002', 'http://tom-poker-frontend.s3-website-ap-southeast-1.amazonaws.com'];
exports.allowedOrigins = allowedOrigins;

var corsOptionsDelegate = function corsOptionsDelegate(req, callback) {
  var corsOptions;

  if (allowedOrigins.indexOf(req.header('Origin')) !== -1) {
    corsOptions = {
      origin: allowedOrigins
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