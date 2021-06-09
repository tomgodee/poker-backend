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

var getRoom = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(id) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _DatabaseService.default.one("SELECT * FROM public.room WHERE id = $(id)", {
              id: id
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

  return function getRoom(_x) {
    return _ref.apply(this, arguments);
  };
}();

var getAllRoom = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _DatabaseService.default.many("SELECT * FROM public.room").then(function (data) {
              return data;
            }).catch(function (error) {
              console.log('ERROR:', error); // print error;

              // print error;
              return error;
            });

          case 2:
            return _context2.abrupt("return", _context2.sent);

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function getAllRoom() {
    return _ref2.apply(this, arguments);
  };
}();

var createRoom = function createRoom(roomData) {
  return _DatabaseService.default.one("\n    INSERT INTO public.room(type, max_number_of_player, random_seat, seat_selectable)\n    VALUES($1, $2, $3, $4)\n    RETURNING id", [roomData.type, roomData.max_number_of_player, roomData.random_seat, roomData.seat_selectable]).then(function (data) {
    return data;
  }).catch(function (error) {
    console.log('ERROR:', error);
  });
};

var updateRoom = function updateRoom(id, roomData) {
  return _DatabaseService.default.one("UPDATE public.room\n          SET type = $(type)\n          WHERE id = $(id)\n          RETURNING *", {
    id: id,
    type: roomData.type
  }).then(function (data) {
    return data;
  }).catch(function (error) {
    console.log('ERROR:', error);
  });
};

var deleteRoom = function deleteRoom(id) {
  return _DatabaseService.default.one("DELETE FROM public.room\n          WHERE id = $(id)\n          RETURNING *", {
    id: id
  }).then(function (data) {
    return data;
  }).catch(function (error) {
    console.log('ERROR:', error);
  });
};

var _default = {
  getRoom: getRoom,
  getAllRoom: getAllRoom,
  createRoom: createRoom,
  updateRoom: updateRoom,
  deleteRoom: deleteRoom
};
exports.default = _default;