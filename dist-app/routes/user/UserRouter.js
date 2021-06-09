"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("regenerator-runtime/runtime.js");

require("core-js/modules/es.object.assign.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.split.js");

require("core-js/modules/es.function.name.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

var _express = _interopRequireDefault(require("express"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _constants = require("../../config/constants");

var _User = _interopRequireDefault(require("../../models/User"));

var _verifyToken = require("../../middlewares/verifyToken");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var userRouter = _express.default.Router();

var generateAccessToken = function generateAccessToken(userInfo) {
  return _jsonwebtoken.default.sign(userInfo, process.env.TOKEN_SECRET, {
    expiresIn: '1d'
  });
};

userRouter.post('/login', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var user;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _User.default.getUser(req.body.username);

          case 2:
            user = _context.sent;

            _bcrypt.default.compare(req.body.password, user.hashed_password, function (err, result) {
              if (result) {
                var token = generateAccessToken({
                  username: req.body.username,
                  role: user.role
                });
                res.json(Object.assign(user, {
                  accessToken: token
                }));
              } else {
                res.status(401).send({
                  status: 'error',
                  message: 'Can\'t authenticate'
                });
              }
            });

          case 4:
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
userRouter.get('/', function (req, res) {
  var accessToken = req.headers.authorization.split('Bearer ')[1];

  _jsonwebtoken.default.verify(accessToken, process.env.TOKEN_SECRET, /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(err, decoded) {
      var user;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!decoded) {
                _context2.next = 7;
                break;
              }

              _context2.next = 3;
              return _User.default.getUser(decoded.username);

            case 3:
              user = _context2.sent;
              res.json(Object.assign(user, {
                requestTime: req.requestTime
              }));
              _context2.next = 8;
              break;

            case 7:
              if (err) {
                res.status(401).send({
                  status: 'error',
                  message: 'Token is not verified'
                });
              }

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }());
});
userRouter.put('/', _verifyToken.verifyAdminToken);
userRouter.put('/', function (req, res) {
  _User.default.updateUser(req.body.id, req.body.role, req.body.money);

  res.json(req.body.name);
});
userRouter.post('/', function (req, res) {
  _bcrypt.default.hash(req.body.password, _constants.SALT_ROUNDS, function (err, hash) {
    // Store hash in your password DB.
    _User.default.createUser(req.body.name, hash);
  });

  res.json(req.body.name);
});
var _default = userRouter;
exports.default = _default;