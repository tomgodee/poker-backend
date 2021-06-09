"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("regenerator-runtime/runtime.js");

var _DatabaseService = _interopRequireDefault(require("../services/DatabaseService"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var getUser = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(name) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _DatabaseService.default.one("SELECT * FROM public.user WHERE name = $(name)", {
              name: name
            }).then(function (data) {
              return data;
            }).catch(function (error) {
              console.log('ERROR:', error); // print error;

              // print error;
              return error;
            });

          case 2:
            return _context.abrupt("return", _context.sent);

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getUser(_x) {
    return _ref.apply(this, arguments);
  };
}();

var createUser = function createUser(name, hashedPassword) {
  return _DatabaseService.default.one('INSERT INTO public.user(name, hashed_password) VALUES($1, $2) RETURNING id', [name, hashedPassword]).then(function (data) {
    return data;
  }).catch(function (error) {
    console.log('ERROR:', error); // print error;
  });
};

var updateUser = function updateUser(id, role, money) {
  return _DatabaseService.default.one("UPDATE public.user\n          SET role = $(role),\n              money = $(money)\n          WHERE id = $(id)\n          RETURNING name, role, id, money", {
    role: role,
    id: id,
    money: money
  }).then(function (data) {
    console.log(data);
    return data;
  }).catch(function (error) {
    console.log('ERROR:', error);
  });
};

var _default = {
  getUser: getUser,
  createUser: createUser,
  updateUser: updateUser
};
exports.default = _default;