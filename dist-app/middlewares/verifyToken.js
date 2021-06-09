"use strict";

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyAdminToken = void 0;

require("regenerator-runtime/runtime.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.split.js");

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var verifyAdminToken = function verifyAdminToken(req, res, next) {
  var bearerToken = req.headers.authorization;

  if (!bearerToken) {
    res.status(401).send({
      status: 'error',
      message: 'Token is required'
    });
  }

  var accessToken = bearerToken.split('Bearer ')[1];

  _jsonwebtoken.default.verify(accessToken, process.env.TOKEN_SECRET, /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(err, decoded) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.log('decoded', decoded);

              if (decoded && decoded.role === 'admin') {
                next();
              } else {
                res.status(401).send({
                  status: 'error',
                  message: "You're not authorized to do this"
                });
              }

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};

exports.verifyAdminToken = verifyAdminToken;