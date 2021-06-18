"use strict";

require("core-js/modules/es.array.find-index.js");

require("core-js/modules/es.symbol.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.symbol.iterator.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.string.iterator.js");

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.array.from.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = roomHandler;

require("core-js/modules/es.array.find.js");

require("core-js/modules/es.array.slice.js");

require("core-js/modules/es.array.map.js");

require("core-js/modules/es.array.concat.js");

require("core-js/modules/es.array.includes.js");

require("core-js/modules/es.string.includes.js");

require("core-js/modules/es.array.join.js");

require("core-js/modules/es.function.name.js");

require("core-js/modules/es.array.filter.js");

var _lodash = require("lodash");

var _socketio = require("../../config/socketio");

var _helpers = require("../../utils/helpers");

var _constants = require("../../config/constants");

var _phe = require("phe");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var INIITAL_STATE = {
  players: [{
    socketId: '',
    user: {
      seat: 0,
      name: '',
      money: 0,
      bet: 0,
      hasActioned: false,
      actions: [],
      isActing: false,
      role: '',
      cards: [],
      status: ''
    }
  }],
  deck: [],
  communityCards: [],
  bigBlind: 200,
  roundBet: 0,
  pot: 0,
  round: _constants.ROUNDS.PRE_FLOP,
  bestHandStrength: 0,
  winners: []
};
var TEXAS_HANDS = 5;

var getNextRoundName = function getNextRoundName(round) {
  if (round === _constants.ROUNDS.PRE_FLOP) return _constants.ROUNDS.FLOP;
  if (round === _constants.ROUNDS.FLOP) return _constants.ROUNDS.TURN;
  if (round === _constants.ROUNDS.TURN) return _constants.ROUNDS.RIVER;
  if (round === _constants.ROUNDS.RIVER) return _constants.ROUNDS.SHOWDOWN;
};

var getNextPlayerToAction = function getNextPlayerToAction(players, index) {
  if (index === 0) {
    return players.slice(1).find(function (player) {
      return !player.user.hasActioned;
    });
  } else {
    var playersBehind = players.slice(0, index);
    var playersAhead = players.slice(index + 1);
    return playersAhead.find(function (player) {
      return !player.user.hasActioned;
    }) || playersBehind.find(function (player) {
      return !player.user.hasActioned;
    });
  }
};

var findAllCombinations = function findAllCombinations(array, combinationLength, result, startingIndex, user) {
  if (combinationLength === 0) {
    user.allPossibleHands.push(result);
    return result;
  }

  for (var i = startingIndex; i < array.length && i - startingIndex <= TEXAS_HANDS; i += 1) {
    var innerResult = _toConsumableArray(result);

    innerResult.push(array[i]);
    findAllCombinations(array, combinationLength - 1, innerResult, i + 1, user);
  }
};

var transformCard = function transformCard(cards) {
  return cards.map(function (card) {
    var number, suite;

    switch (card.number) {
      case _constants.VALUES.ACE:
        number = 'A';
        break;

      case _constants.VALUES.TEN:
        number = 'T';
        break;

      case _constants.VALUES.JACK:
        number = 'J';
        break;

      case _constants.VALUES.QUEEN:
        number = 'Q';
        break;

      case _constants.VALUES.KING:
        number = 'K';
        break;

      default:
        number = String(card.number);
        break;
    }

    switch (card.suite) {
      case _constants.SUITES.HEARTS:
        suite = 'h';
        break;

      case _constants.SUITES.DIAMONDS:
        suite = 'd';
        break;

      case _constants.SUITES.CLUBS:
        suite = 'c';
        break;

      case _constants.SUITES.SPADES:
        suite = 's';
        break;

      default:
        suite = 'h';
        break;
    }

    return "".concat(number).concat(suite);
  });
};

function roomHandler(io, socket, store) {
  var setUpFlop = function setUpFlop(room, data) {
    room.players.map(function (player) {
      player.user.bet = 0;
      player.user.hasActioned = false;
      player.user.actions = [_socketio.CHECK, _socketio.BET];

      if (player.user.role === _constants.ROLES.SB || player.user.role.includes(_constants.ROLES.SB)) {
        player.user.isActing = true;
      }
    }); // Setup room

    room.roundBet = 0;
    room.round = _constants.ROUNDS.FLOP; // Deal public cards

    room.communityCards = room.deck.slice(0, 3);
    room.deck = room.deck.slice(3);
    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: 0,
      pot: room.pot,
      round: room.round
    });
  };

  var setUpTurn = function setUpTurn(room, data) {
    room.players.map(function (player) {
      player.user.bet = 0;
      player.user.hasActioned = false;
      player.user.actions = [_socketio.CHECK, _socketio.BET];

      if (player.user.role === _constants.ROLES.SB || player.user.role.includes(_constants.ROLES.SB)) {
        player.user.isActing = true;
      }
    });
    room.roundBet = 0;
    room.round = _constants.ROUNDS.TURN; // Deal public cards

    room.communityCards = room.communityCards.concat(room.deck.slice(0, 1));
    room.deck = room.deck.slice(1);
    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: 0,
      pot: room.pot,
      round: room.round
    });
  };

  var setUpRiver = function setUpRiver(room, data) {
    // Room settings
    room.round = _constants.ROUNDS.RIVER;
    room.roundBet = 0; // Deal public cards

    room.communityCards = room.communityCards.concat(room.deck.slice(0, 1));
    room.deck = room.deck.slice(1); // Players settings

    room.players = room.players.map(function (player) {
      player.user.bet = 0;
      player.user.hasActioned = false;
      player.user.actions = [_socketio.CHECK, _socketio.BET];
      player.user.handStrength = (0, _phe.evaluateCards)(transformCard(player.user.cards.concat(room.communityCards)));

      if (player.user.handStrength < room.bestHandStrength && player.user.status === _constants.PLAYER_STATUS.PLAYING) {
        room.bestHandStrength = player.user.handStrength;
      }

      if (player.user.role === _constants.ROLES.SB || player.user.role.includes(_constants.ROLES.SB)) {
        player.user.isActing = true;
      }

      return player;
    }); // Save data to store

    store.rooms.set(data.roomId, room); // Emit data to clients

    io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: 0,
      pot: room.pot,
      round: room.round
    });
  };

  var setUpShowdown = function setUpShowdown(room, data) {
    room.players = room.players.map(function (player) {
      player.user.bet = 0;
      player.user.hasActioned = false;
      player.user.actions = [];

      if (player.user.handStrength === room.bestHandStrength) {
        player.user.isWinner = true;
        room.winners.push(player.socketId);
      } else {
        player.user.isWinner = false;
      }

      return player;
    });
    var winningMoney = room.pot / room.winners.length;
    room.players = room.players.map(function (player) {
      if (player.user.isWinner) {
        player.user.money += Math.floor(winningMoney);
      }

      return player;
    });
    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: 0,
      pot: room.pot,
      round: room.round
    });
    setTimeout(function () {
      gameStart({
        roomId: data.roomId
      }, true);
    }, 2000);
  };

  var setupTable = function setupTable(room, data) {
    if (room.round === _constants.ROUNDS.FLOP) setUpFlop(room, data);
    if (room.round === _constants.ROUNDS.TURN) setUpTurn(room, data);
    if (room.round === _constants.ROUNDS.RIVER) setUpRiver(room, data);
    if (room.round === _constants.ROUNDS.SHOWDOWN) setUpShowdown(room, data);
  };

  var joinRoom = function joinRoom(data) {
    socket.join(data.roomId);
    var room = store.rooms.get(data.roomId) || INIITAL_STATE;
    var isFirstPlayer = io.sockets.adapter.rooms.get(data.roomId).size < 2;

    if (isFirstPlayer) {
      room.players = [];
      room.players.push({
        socketId: socket.id,
        user: {
          seat: 1,
          name: data.user.name,
          money: data.user.money,
          bet: 0,
          hasActioned: false,
          actions: [],
          isActing: false,
          role: '',
          cards: [],
          allPossibleHands: [],
          status: _constants.PLAYER_STATUS.PLAYING
        }
      });
    } else {
      var seats = [];

      for (var i = 1; i <= data.max_number_of_player; i += 1) {
        seats.push(i);
      }

      var occupiedSeats = room.players.map(function (player) {
        return player.user.seat;
      });
      var availableSeats = (0, _lodash.difference)(seats, occupiedSeats);
      room.players.push({
        socketId: socket.id,
        user: {
          seat: data.random_seat ? (0, _helpers.randomElement)(availableSeats) : Math.min(availableSeats),
          name: data.user.name,
          money: data.user.money,
          bet: 0,
          hasActioned: false,
          actions: [],
          role: '',
          cards: [],
          allPossibleHands: [],
          status: ''
        }
      });
      room.players.sort(function (playerA, playerB) {
        return playerA.user.seat - playerB.user.seat;
      });
    }

    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(_socketio.UPDATE_PLAYERS, room.players);
  };

  var gameStart = function gameStart(data, continuous) {
    var room = store.rooms.get(data.roomId);
    room.deck = (0, _helpers.shuffle)((0, _helpers.createDeck)()); // Assign role, compute money and bet for each player

    if (continuous) {
      if (room.players.length === 2) {
        room.player = room.players.map(function (player) {
          if (player.user.role.includes(_constants.ROLES.SB)) {
            player.user.role = _constants.ROLES.BB;
            player.user.bet = room.bigBlind;
            6;
            player.user.money -= room.bigBlind;
            player.user.actions = [_socketio.CHECK, _socketio.BET];
            player.user.hasActioned = false;
            player.user.isActing = false;
          } else if (player.user.role.includes(_constants.ROLES.BB)) {
            player.user.role = [_constants.ROLES.SB, _constants.ROLES.D];
            player.user.bet = room.bigBlind / 2;
            player.user.money -= room.bigBlind / 2;
            player.user.actions = [_socketio.CALL, _socketio.BET, _socketio.FOLD];
            player.user.hasActioned = false;
            player.user.isActing = true;
          }

          player.user.status = _constants.PLAYER_STATUS.PLAYING;
          return player;
        });
      } else {
        room.players = room.players.map(function (player, index, players) {
          player.user.hasActioned = false;
          player.user.status = _constants.PLAYER_STATUS.PLAYING;

          if (index === 0) {
            player.user.role = players[players.length - 1].user.role;
          } else {
            player.user.role = players[index - 1].user.role;
          }

          if (player.user.role.includes(_constants.ROLES.SB)) {
            player.user.bet = room.bigBlind / 2;
            player.user.money -= room.bigBlind / 2;
          }

          if (player.user.role.includes(_constants.ROLES.B)) {
            player.user.bet = room.bigBlind;
            player.user.money -= room.bigBlind;

            if (index === 0) {
              players[players.length - 1].user.isActing = true;
              players[players.length - 1].user.actions = [_socketio.CALL, _socketio.BET, _socketio.FOLD];
            } else {
              players[index + 1].user.isActing = true;
              players[index + 1].user.actions = [_socketio.CALL, _socketio.BET, _socketio.FOLD];
            }
          }

          return player;
        });
      }
    } else {
      if (room.players.length === 2) {
        room.players[0].user.role = [_constants.ROLES.SB, _constants.ROLES.D];
        room.players[0].user.bet = room.bigBlind / 2;
        room.players[0].user.money -= room.bigBlind / 2;
        room.players[0].user.actions = [_socketio.CALL, _socketio.BET, _socketio.FOLD];
        room.players[0].user.hasActioned = false;
        room.players[0].user.isActing = true;
        room.players[0].user.status = _constants.PLAYER_STATUS.PLAYING;
        room.players[1].user.role = _constants.ROLES.BB;
        room.players[1].user.bet = room.bigBlind;
        room.players[1].user.money -= room.bigBlind;
        room.players[1].user.actions = [_socketio.CHECK, _socketio.BET];
        room.players[1].user.hasActioned = false;
        room.players[1].user.isActing = false;
        room.players[1].user.isActing = false;
        room.players[1].user.status = _constants.PLAYER_STATUS.PLAYING;
      } else {
        room.players = room.players.map(function (player, index, players) {
          if (index === 0) player.user.role = _constants.ROLES.SB;
          if (index === 1) player.user.role = _constants.ROLES.BB;
          if (index === players.length - 1) player.user.role = _constants.ROLES.D;
          player.user.status = _constants.PLAYER_STATUS.PLAYING;
          return player;
        });
      }
    } // Pot Settings


    room.roundBet = room.bigBlind;
    room.pot = room.bigBlind * 1.5;
    room.winners = []; // Room settings
    // https://github.com/HenryRLee/PokerHandEvaluator/blob/master/Documentation/Algorithm.md
    // The worst hand possibly is 2-3-4-5 and 6-7 off suite results in a hand strength of 7462
    // Need to investigate this number further

    room.bestHandStrength = 7462; // Deal cards to players
    // cardIndex helps knowing the if it's the first dealing round or the second round

    var numberOfPlayers = room.players.length;
    var numberOfCardDealt = room.players.length * 2;
    var playerIndex = 0;
    var cardDealtIndex = 0;
    var cardIndex = 0;

    while (cardDealtIndex < numberOfCardDealt) {
      room.players[playerIndex].user.cards[cardIndex] = room.deck[cardDealtIndex];
      cardDealtIndex += 1;
      playerIndex += 1;

      if (cardDealtIndex === numberOfPlayers) {
        playerIndex = 0;
        cardIndex = 1;
      }
    }

    room.deck = room.deck.slice(numberOfCardDealt);
    room.communityCards = [];
    room.round = _constants.ROUNDS.PRE_FLOP; // Save data to store

    store.rooms.set(data.roomId, room); // Emit data to clients

    io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      pot: room.pot
    });
  };

  var check = function check(data) {
    var room = store.rooms.get(data.roomId);
    var currentPlayerIndex = (0, _lodash.findIndex)(room.players, function (player) {
      return player.socketId === socket.id;
    });
    room.players[currentPlayerIndex].user.hasActioned = true;
    room.players[currentPlayerIndex].user.isActing = false;
    var canGoToNextRound = (0, _lodash.every)(room.players, function (player) {
      return player.user.bet === room.roundBet && player.user.hasActioned;
    });

    if (canGoToNextRound) {
      room.round = getNextRoundName(room.round);
      setupTable(room, data);
    } else {
      var nextPlayer = getNextPlayerToAction(room.players, currentPlayerIndex);
      room.players.map(function (player) {
        if (nextPlayer.socketId === player.socketId) {
          player.user.isActing = true;
        }
      });
      io.to(data.roomId).emit(_socketio.UPDATE_PLAYERS, room.players);
    }

    store.rooms.set(data.roomId, room);
  };

  var call = function call(data) {
    var room = store.rooms.get(data.roomId);
    room.players = room.players.map(function (player) {
      if (player.socketId === socket.id) {
        player.user.money -= data.calledMoney;
        room.pot += data.calledMoney;
        player.user.bet = room.roundBet;
        player.user.hasActioned = true;
        player.user.isActing = false;
        player.user.status = _constants.PLAYER_STATUS.PLAYING;
      }

      return player;
    });
    var canGoToNextRound = (0, _lodash.every)(room.players, function (player) {
      return player.user.bet === room.roundBet && player.user.hasActioned;
    });

    if (canGoToNextRound) {
      room.round = getNextRoundName(room.round);
      setupTable(room, data);
    } else {
      var currentPlayerIndex = (0, _lodash.findIndex)(room.players, function (player) {
        return player.socketId === socket.id;
      });
      var nextPlayer = getNextPlayerToAction(room.players, currentPlayerIndex);
      room.players = room.players.map(function (player, index, players) {
        if (player.socketId === nextPlayer.socketId) {
          player.user.isActing = true;
        }

        return player;
      });
    }

    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      pot: room.pot
    });
  };

  var bet = function bet(data) {
    var room = store.rooms.get(data.roomId);
    room.players = room.players.map(function (player) {
      if (player.socketId === socket.id) {
        room.pot = room.pot + (data.betMoney - player.user.bet);
        player.user.money = player.user.money - (data.betMoney - player.user.bet);
        player.user.bet = data.betMoney;
        player.user.hasActioned = true;
        player.user.isActing = false;
        player.user.status = _constants.PLAYER_STATUS.PLAYING;
      } else {
        player.user.hasActioned = false;
        player.user.actions = [_socketio.CALL, _socketio.BET, _socketio.FOLD];
      }

      return player;
    });
    var currentPlayerIndex = (0, _lodash.findIndex)(room.players, function (player) {
      return player.socketId === socket.id;
    });
    var nextPlayer = getNextPlayerToAction(room.players, currentPlayerIndex);
    room.players = room.players.map(function (player) {
      if (nextPlayer.socketId === player.socketId) {
        player.user.isActing = true;
      }

      return player;
    });
    room.roundBet = data.betMoney;
    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      pot: room.pot
    });
  };

  var fold = function fold(data) {
    var room = store.rooms.get(data.roomId);
    room.players = room.players.map(function (player) {
      if (player.socketId === socket.id) {
        player.user.cards = [];
        player.user.bet = 0;
        player.user.actions = [];
        player.user.hasActioned = true;
        player.user.isActing = false;
        player.user.status = _constants.PLAYER_STATUS.FOLD;
      }

      return player;
    });
    var winWithoutShowdown = room.players.filter(function (player) {
      return player.user.status === _constants.PLAYER_STATUS.PLAYING;
    }).length === 1;

    if (winWithoutShowdown) {
      // Award money to the winner
      room.players = room.players.map(function (player) {
        if (player.user.status === _constants.PLAYER_STATUS.PLAYING) {
          player.user.money += room.pot;
        }

        return player;
      });
      setTimeout(function () {
        gameStart({
          roomId: data.roomId
        }, true);
      }, 2000);
    } else {
      var canGoToNextRound = (0, _lodash.every)(room.players, function (player) {
        return player.user.hasActioned;
      });

      if (canGoToNextRound) {
        room.round = getNextRoundName(room.round);
        setupTable(room, data);
      } else {
        var currentPlayerIndex = (0, _lodash.findIndex)(room.players, function (player) {
          return player.socketId === socket.id;
        });
        var nextPlayer = getNextPlayerToAction(room.players, currentPlayerIndex);
        room.players = room.players.map(function (player) {
          if (nextPlayer.socketId === player.socketId) {
            player.user.isActing = true;
          }

          return player;
        });
      }
    }

    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      pot: room.pot
    });
  };

  socket.on(_socketio.JOIN_ROOM, joinRoom);
  socket.on(_socketio.GAME_START, gameStart);
  socket.on(_socketio.CHECK, check);
  socket.on(_socketio.CALL, call);
  socket.on(_socketio.BET, bet);
  socket.on(_socketio.FOLD, fold);
}