"use strict";

var db = pgp()('postgres://postgres:zxc321@localhost:5432/tom');
db.one('SELECT $1 AS name', 'tom').then(function (data) {
  console.log('DATA:', data);
  console.log('env2', process.env.NAME);
})["catch"](function (error) {
  console.log('ERROR:', error);
});

var requestTime = function requestTime(req, res, next) {
  req.requestTime = Date.now();
  next();
};