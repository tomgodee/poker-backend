"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _requestTime = _interopRequireDefault(require("../../middlewares/requestTime"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var userRouter = _express["default"].Router();

userRouter.use(_requestTime["default"]);
userRouter.get('/', function (req, res) {
  res.json({
    user: 'tom',
    requestTime: req.requestTime
  });
});
var _default = userRouter;
exports["default"] = _default;