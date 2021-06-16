"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ROLES = exports.PLAYER_STATUS = exports.ROUNDS = exports.SUITES = exports.VALUES = exports.SALT_ROUNDS = void 0;
var SALT_ROUNDS = 10;
exports.SALT_ROUNDS = SALT_ROUNDS;
var VALUES = {
  ACE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
  NINE: 9,
  TEN: 10,
  JACK: 11,
  QUEEN: 12,
  KING: 13
};
exports.VALUES = VALUES;
var SUITES = {
  HEARTS: 'hearts',
  DIAMONDS: 'diamonds',
  CLUBS: 'clubs',
  SPADES: 'spades'
};
exports.SUITES = SUITES;
var ROUNDS = {
  PRE_FLOP: 'pre-flop',
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river',
  SHOWDOWN: 'showdown'
};
exports.ROUNDS = ROUNDS;
var PLAYER_STATUS = {
  PLAYING: 'playing',
  FOLD: 'fold',
  SIT_OUT: 'sit out'
};
exports.PLAYER_STATUS = PLAYER_STATUS;
var ROLES = {
  SB: 'SB',
  BB: 'BB',
  D: 'D'
};
exports.ROLES = ROLES;
var _default = {
  SALT_ROUNDS: SALT_ROUNDS,
  VALUES: VALUES,
  SUITES: SUITES,
  ROUNDS: ROUNDS,
  PLAYER_STATUS: PLAYER_STATUS
};
exports.default = _default;