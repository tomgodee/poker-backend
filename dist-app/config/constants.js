"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DEFAULT_ROOM = exports.DEFAULT_POT = exports.DEFAULT_PLAYER = exports.DEFAULT_BEST_HAND_STRENGTH = exports.ROLES = exports.PLAYER_STATUS = exports.ROUNDS = exports.SUITES = exports.VALUES = exports.TEXAS_HANDS = exports.SALT_ROUNDS = void 0;
var SALT_ROUNDS = 10;
exports.SALT_ROUNDS = SALT_ROUNDS;
var TEXAS_HANDS = 5;
exports.TEXAS_HANDS = TEXAS_HANDS;
var VALUES = {
  ACE: 14,
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
  ALL_IN: 'all-in',
  FOLD: 'fold',
  SIT_OUT: 'sit-out'
};
exports.PLAYER_STATUS = PLAYER_STATUS;
var ROLES = {
  SB: 'SB',
  BB: 'BB',
  D: 'D'
}; // https://github.com/HenryRLee/PokerHandEvaluator/blob/master/Documentation/Algorithm.md
// The worst hand possibly is 2-3-4-5 and 6-7 off suite results in a hand strength of 7462
// Need to investigate this number further

exports.ROLES = ROLES;
var DEFAULT_BEST_HAND_STRENGTH = 7462;
exports.DEFAULT_BEST_HAND_STRENGTH = DEFAULT_BEST_HAND_STRENGTH;
var DEFAULT_PLAYER = {
  socketId: '',
  user: {
    seat: 0,
    name: '',
    currentMoney: 0,
    totalMoney: 0,
    bet: 0,
    hasActioned: false,
    actions: [],
    isActing: false,
    role: '',
    cards: [],
    status: ''
  }
};
exports.DEFAULT_PLAYER = DEFAULT_PLAYER;
var DEFAULT_POT = {
  id: 1,
  amount: 300,
  bestHandStrength: DEFAULT_BEST_HAND_STRENGTH,
  limit: 0,
  winners: [],
  sidePot: false,
  excludedPlayers: []
};
exports.DEFAULT_POT = DEFAULT_POT;
var DEFAULT_ROOM = {
  players: [DEFAULT_PLAYER],
  deck: [],
  communityCards: [],
  bigBlind: 200,
  roundBet: 0,
  pots: [DEFAULT_POT],
  round: ROUNDS.PRE_FLOP
};
exports.DEFAULT_ROOM = DEFAULT_ROOM;
var _default = {
  SALT_ROUNDS: SALT_ROUNDS,
  VALUES: VALUES,
  SUITES: SUITES,
  ROUNDS: ROUNDS,
  PLAYER_STATUS: PLAYER_STATUS,
  DEFAULT_BEST_HAND_STRENGTH: DEFAULT_BEST_HAND_STRENGTH,
  DEFAULT_PLAYER: DEFAULT_PLAYER,
  DEFAULT_POT: DEFAULT_POT,
  DEFAULT_ROOM: DEFAULT_ROOM
};
exports.default = _default;