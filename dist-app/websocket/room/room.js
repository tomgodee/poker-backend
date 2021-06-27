"use strict";

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

require("core-js/modules/es.array.find-index.js");

require("core-js/modules/es.array.includes.js");

require("core-js/modules/es.string.includes.js");

require("core-js/modules/es.array.filter.js");

require("core-js/modules/es.array.concat.js");

require("core-js/modules/es.array.map.js");

require("core-js/modules/es.array.join.js");

require("core-js/modules/es.function.name.js");

var _lodash = require("lodash");

var _socketio = require("../../config/socketio");

var _helpers = require("../../utils/helpers");

var _constants = require("../../config/constants");

var _phe = require("phe");

var _User = _interopRequireDefault(require("../../models/User"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var getNextRoundName = function getNextRoundName(round) {
  if (round === _constants.ROUNDS.PRE_FLOP) return _constants.ROUNDS.FLOP;
  if (round === _constants.ROUNDS.FLOP) return _constants.ROUNDS.TURN;
  if (round === _constants.ROUNDS.TURN) return _constants.ROUNDS.RIVER;
  if (round === _constants.ROUNDS.RIVER) return _constants.ROUNDS.SHOWDOWN;
};

var getTotalMoneyFromPreviousPots = function getTotalMoneyFromPreviousPots(pots) {
  if (pots.length === 1) return pots[0].limit;else if (pots.length > 1) return pots.reduce(function (prevPot, currentPot) {
    return {
      limit: prevPot.limit + currentPot.limit
    };
  }, {
    limit: 0
  }).limit;else return 0;
};

var getInactionedPlayingPlayer = function getInactionedPlayingPlayer(player) {
  return !player.user.hasActioned && player.user.status === _constants.PLAYER_STATUS.PLAYING;
};

var getPlayingPlayer = function getPlayingPlayer(player) {
  return player.user.status === _constants.PLAYER_STATUS.PLAYING;
};

var getInHandPlayer = function getInHandPlayer(player) {
  return player.user.status === _constants.PLAYER_STATUS.PLAYING || player.user.status === _constants.PLAYER_STATUS.ALL_IN;
};

var getActivePlayer = function getActivePlayer(player) {
  return player.user.status === _constants.PLAYER_STATUS.PLAYING || player.user.status === _constants.PLAYER_STATUS.ALL_IN || player.user.status === _constants.PLAYER_STATUS.FOLD;
};

var getSittingOutPlayer = function getSittingOutPlayer(player) {
  return player.user.status === _constants.PLAYER_STATUS.SIT_OUT;
};

var byStatusAndMoney = function byStatusAndMoney(playerA, playerB) {
  return playerA.user.status.localeCompare(playerB.user.status) || playerA.user.bet - playerB.user.bet;
};

var bySeat = function bySeat(playerA, playerB) {
  return playerA.user.seat - playerB.user.seat;
};

var allPlayersHaveActioned = function allPlayersHaveActioned(roundBet, players) {
  return (0, _lodash.every)(players, function (player) {
    return player.user.bet === roundBet && player.user.hasActioned && player.user.status === _constants.PLAYER_STATUS.PLAYING || player.user.status === _constants.PLAYER_STATUS.FOLD || player.user.status === _constants.PLAYER_STATUS.ALL_IN || player.user.status === _constants.PLAYER_STATUS.SIT_OUT;
  });
};

var getNextPlayerToAction = function getNextPlayerToAction(players, index) {
  if (index === 0) {
    return players.slice(1).find(getInactionedPlayingPlayer);
  } else {
    var playersBehind = players.slice(0, index);
    var playersAhead = players.slice(index + 1);
    return playersAhead.find(getInactionedPlayingPlayer) || playersBehind.find(getInactionedPlayingPlayer);
  }
};

var getUTGPlayerIndex = function getUTGPlayerIndex(players) {
  var bbPlayerIndex = players.findIndex(function (player) {
    return player.user.role.includes(_constants.ROLES.BB);
  });
  if (bbPlayerIndex === players.length - 1) return 0;else return bbPlayerIndex + 1;
};

var getFirstPlayerToAction = function getFirstPlayerToAction(players) {
  var playingPlayers = players.filter(getPlayingPlayer);
  if (playingPlayers.length < 2) return null;
  var sbPlayerIndex = players.findIndex(function (player) {
    return player.user.role.includes(_constants.ROLES.SB);
  });
  if (players[sbPlayerIndex].user.status === _constants.PLAYER_STATUS.PLAYING) return players[sbPlayerIndex]; // TODO: slice(0, 0) returns []

  var playersBehind = players.slice(0, sbPlayerIndex);
  var playersAhead = players.slice(sbPlayerIndex + 1);
  var allPlayers = playersBehind.concat(playersAhead);
  return allPlayers.find(getInactionedPlayingPlayer);
};

var calculateMultiplePots = function calculateMultiplePots(players, pots, betMoney) {
  // All-in players are sorted first then sorted by money from lowest to highest
  players.sort(byStatusAndMoney); // If there isnt an all-in player

  if (players[0].user.status !== _constants.PLAYER_STATUS.ALL_IN) {
    pots[0].amount += betMoney;
  } else if (players[0].user.status === _constants.PLAYER_STATUS.ALL_IN) {
    // If there is an all-in player then recalculate all pots from the start
    pots = [];
    players.map(function (player, index) {
      if (player.user.status === _constants.PLAYER_STATUS.ALL_IN) {
        // All previous pots are side pot
        pots = pots.map(function (pot) {
          pot.sidePot = true;
          pot.amount += pot.limit;
          return pot;
        });
        var totalMoneyFromAllPreviousPots = getTotalMoneyFromPreviousPots(pots); // Create the all-in pot (possibly side pot if another players raises)

        pots.push({
          id: index + 2,
          amount: player.user.bet - totalMoneyFromAllPreviousPots,
          limit: player.user.bet - totalMoneyFromAllPreviousPots,
          bestHandStrength: _constants.DEFAULT_BEST_HAND_STRENGTH,
          winners: [],
          sidePot: false,
          excludedPlayers: [player.socketId]
        });
      } else if (player.user.status === _constants.PLAYER_STATUS.PLAYING) {
        // If a player has either called a previous bet or is either SB or BB then that money he/she put in goes to the side pot(s) first
        var money = player.user.bet;
        pots = pots.map(function (pot) {
          if (pot.limit < player.user.bet) {
            pot.amount += pot.limit;
            money -= pot.limit;
          } else {
            pot.amount += money;
            money = 0;
          }

          return pot;
        });
      }
    });
  }

  players.sort(bySeat);
  return pots;
};

var assignHeadsUpRolesContinuosGame = function assignHeadsUpRolesContinuosGame(players, bigBlind) {
  var sbPlayer = players.find(function (player) {
    return player.user.role.includes(_constants.ROLES.SB);
  });
  var bbPlayer = players.find(function (player) {
    return player.user.role.includes(_constants.ROLES.BB);
  }); // if both of them aren't SB and BB

  if (!sbPlayer || !bbPlayer) {
    players[0].user.role = _constants.ROLES.BB;
    players[0].user.bet = bigBlind;
    players[0].user.currentMoney -= bigBlind;
    players[0].user.actions = [_socketio.CHECK, _socketio.BET];
    players[0].user.isActing = false;
    players[1].user.role = [_constants.ROLES.SB, _constants.ROLES.D];
    players[1].user.bet = bigBlind / 2;
    players[1].user.currentMoney -= bigBlind / 2;
    players[1].user.actions = [_socketio.CALL, _socketio.BET, _socketio.FOLD];
    players[1].user.isActing = true;
  } else if (sbPlayer && bbPlayer) {
    // if both players are SB and BB
    players = players.map(function (player) {
      if (player.user.role.includes(_constants.ROLES.SB)) {
        player.user.role = _constants.ROLES.BB;
        player.user.bet = bigBlind;
        player.user.currentMoney -= bigBlind;
        player.user.actions = [_socketio.CHECK, _socketio.BET];
        player.user.isActing = false;
      } else if (player.user.role.includes(_constants.ROLES.BB)) {
        player.user.role = [_constants.ROLES.SB, _constants.ROLES.D];
        player.user.bet = bigBlind / 2;
        player.user.currentMoney -= bigBlind / 2;
        player.user.actions = [_socketio.CALL, _socketio.BET, _socketio.FOLD];
        player.user.isActing = true;
      }

      return player;
    });
  }

  return players;
};

var assignRolesContinuousGame = function assignRolesContinuousGame(players, bigBlind) {
  // Shift players' roles by 1 seat forwards
  var temporaryRole = '';
  return players.map(function (player, index, playersArray) {
    player.user.hasActioned = false;
    player.user.status = _constants.PLAYER_STATUS.PLAYING;
    player.user.actions = [_socketio.FOLD, _socketio.CALL, _socketio.BET];
    player.user.bet = 0;

    if (index === 0) {
      temporaryRole = player.user.role;
      player.user.role = playersArray[playersArray.length - 1].user.role;
    } else {
      var placeholderRole = player.user.role;
      player.user.role = temporaryRole;
      temporaryRole = placeholderRole;
    }

    if (player.user.role.includes(_constants.ROLES.SB)) {
      player.user.bet = bigBlind / 2;
      player.user.currentMoney -= bigBlind / 2;
    }

    if (player.user.role.includes(_constants.ROLES.BB)) {
      player.user.bet = bigBlind;
      player.user.currentMoney -= bigBlind;
      player.user.actions = [_socketio.CHECK, _socketio.BET];
    }

    return player;
  });
};

var assignHeadsUpRoles = function assignHeadsUpRoles(players, bigBlind) {
  players[0].user.role = [_constants.ROLES.SB, _constants.ROLES.D];
  players[0].user.bet = bigBlind / 2;
  players[0].user.currentMoney -= bigBlind / 2;
  players[0].user.actions = [_socketio.FOLD, _socketio.CALL, _socketio.BET];
  players[0].user.hasActioned = false;
  players[0].user.isActing = true;
  players[0].user.status = _constants.PLAYER_STATUS.PLAYING;
  players[1].user.role = _constants.ROLES.BB;
  players[1].user.bet = bigBlind;
  players[1].user.currentMoney -= bigBlind;
  players[1].user.actions = [_socketio.CHECK, _socketio.BET];
  players[1].user.hasActioned = false;
  players[1].user.isActing = false;
  players[1].user.status = _constants.PLAYER_STATUS.PLAYING;
  return players;
};

var assignRoles = function assignRoles(players, bigBlind) {
  return players.map(function (player, index, playersArray) {
    if (index === 0) {
      player.user.role = _constants.ROLES.SB;
      player.user.bet = bigBlind / 2;
      player.user.currentMoney -= bigBlind / 2;
      player.user.actions = [_socketio.FOLD, _socketio.CALL, _socketio.BET];
    } else if (index === 1) {
      player.user.role = _constants.ROLES.BB;
      player.user.bet = bigBlind;
      player.user.currentMoney -= bigBlind;
      player.user.actions = [_socketio.CHECK, _socketio.BET];
    } else if (index === playersArray.length - 1) {
      player.user.role = _constants.ROLES.D;
      player.user.isActing = true;
      player.user.actions = [_socketio.FOLD, _socketio.CALL, _socketio.BET];
    } else {
      player.user.actions = [_socketio.FOLD, _socketio.CALL, _socketio.BET];
    }

    player.user.hasActioned = false;
    player.user.status = _constants.PLAYER_STATUS.PLAYING;
    return player;
  });
};

var resetPlayer = function resetPlayer(player) {
  player.user.cards = [];
  player.user.actions = [];
  player.user.isActing = false;
  player.user.bet = 0;
  player.user.role = [];
  return player;
};

var dealCards = function dealCards(players, deck) {
  // roundNumber helps knowing the if it's the first dealing round or the second dealing round
  // TODO: Cards should be dealt from the SB not from the first seat
  var numberOfPlayers = players.length;
  var numberOfCardDealt = players.length * 2;
  var playerIndex = 0;
  var cardDealtIndex = 0;
  var roundNumber = 0;

  while (cardDealtIndex < numberOfCardDealt) {
    players[playerIndex].user.cards[roundNumber] = deck[cardDealtIndex];
    cardDealtIndex += 1;
    playerIndex += 1;

    if (cardDealtIndex === numberOfPlayers) {
      playerIndex = 0;
      roundNumber = 1;
    }
  }

  return players;
};

var awardMoney = function awardMoney(players, pots) {
  return players.map(function (player) {
    if (player.user.status === _constants.PLAYER_STATUS.PLAYING || player.user.status === _constants.PLAYER_STATUS.ALL_IN) {
      pots.map(function (pot) {
        if (pot.winners.includes(player.socketId)) player.user.currentMoney += Math.floor(pot.amount / pot.winners.length);
      });

      if (player.user.currentMoney === 0) {
        player.user.status = _constants.PLAYER_STATUS.SIT_OUT; // UserModel.updateMoneyByName(player.user.name, 0);
      } else player.user.status = _constants.PLAYER_STATUS.PLAYING;
    }

    return player;
  });
};

var dealCommunityCards = function dealCommunityCards(communityCards, deck, numberOfCard) {
  return communityCards.concat(deck.slice(0, numberOfCard));
};

function roomHandler(io, socket, store) {
  var getCurrentPlayerIndex = function getCurrentPlayerIndex(players) {
    return (0, _lodash.findIndex)(players, function (player) {
      return player.socketId === socket.id;
    });
  };

  var runToShowdown = function runToShowdown(room, data) {
    var intervalId = setInterval(function () {
      if (room.round === _constants.ROUNDS.PRE_FLOP || room.round === _constants.ROUNDS.FLOP) {
        room.communityCards = dealCommunityCards(room.communityCards, room.deck, 3);
        room.deck = room.deck.slice(3);
        room.round = _constants.ROUNDS.TURN;
      } else if (room.round === _constants.ROUNDS.TURN) {
        room.communityCards = dealCommunityCards(room.communityCards, room.deck, 1);
        room.deck = room.deck.slice(1);
        room.round = _constants.ROUNDS.RIVER;
      } else if (room.round === _constants.ROUNDS.RIVER) {
        room.communityCards = dealCommunityCards(room.communityCards, room.deck, 1);
        room.deck = room.deck.slice(1);
        room.round = _constants.ROUNDS.SHOWDOWN; // Calculate best hand for each pot

        var excludedPlayers = [];
        room.players = room.players.map(function (player) {
          player.user.handStrength = (0, _phe.evaluateCards)((0, _helpers.transformCard)(player.user.cards.concat(room.communityCards)));
          room.pots = room.pots.map(function (pot) {
            if (player.user.handStrength < pot.bestHandStrength && !excludedPlayers.includes(player.socketId) && (player.user.status === _constants.PLAYER_STATUS.PLAYING || player.user.status === _constants.PLAYER_STATUS.ALL_IN)) {
              pot.bestHandStrength = player.user.handStrength;
            }

            if (player.socketId === pot.excludedPlayers[0]) {
              excludedPlayers.push(pot.excludedPlayers[0]);
            }

            return pot;
          });
          return player;
        });
      } else if (room.round === _constants.ROUNDS.SHOWDOWN) {
        clearInterval(intervalId);
        setUpShowdown(room, data);
      }

      if (room.round !== _constants.ROUNDS.SHOWDOWN) {
        store.rooms.set(data.roomId, room);
        io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
          communityCards: room.communityCards,
          players: room.players,
          bigBlind: room.bigBlind,
          roundBet: 0,
          pots: room.pots,
          round: room.round
        });
      }
    }, 2000);
  };

  var setUpFlop = function setUpFlop(room, data) {
    var nextPlayer = getFirstPlayerToAction(room.players);

    if (!nextPlayer) {
      runToShowdown(room, data);
    } else if (nextPlayer) {
      room.players = room.players.map(function (player) {
        player.user.actions = [_socketio.CHECK, _socketio.BET];

        if (nextPlayer.socketId === player.socketId) {
          player.user.isActing = true;
        }

        return player;
      });
      room.roundBet = 0;
      room.round = _constants.ROUNDS.FLOP;
      room.communityCards = dealCommunityCards(room.communityCards, room.deck, 3);
      room.deck = room.deck.slice(3);
      store.rooms.set(data.roomId, room);
      io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
        communityCards: room.communityCards,
        players: room.players,
        bigBlind: room.bigBlind,
        roundBet: 0,
        pots: room.pots,
        round: room.round
      });
    }
  };

  var setUpTurn = function setUpTurn(room, data) {
    var nextPlayer = getFirstPlayerToAction(room.players);

    if (!nextPlayer) {
      runToShowdown(room, data);
    } else if (nextPlayer) {
      room.players = room.players.map(function (player) {
        player.user.actions = [_socketio.CHECK, _socketio.BET];

        if (nextPlayer.socketId === player.socketId) {
          player.user.isActing = true;
        }

        return player;
      });
      room.roundBet = 0;
      room.round = _constants.ROUNDS.TURN;
      room.communityCards = dealCommunityCards(room.communityCards, room.deck, 1);
      room.deck = room.deck.slice(1);
      store.rooms.set(data.roomId, room);
      io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
        communityCards: room.communityCards,
        players: room.players,
        bigBlind: room.bigBlind,
        roundBet: 0,
        pots: room.pots,
        round: room.round
      });
    }
  };

  var setUpRiver = function setUpRiver(room, data) {
    var nextPlayer = getFirstPlayerToAction(room.players);

    if (!nextPlayer) {
      runToShowdown(room, data);
    } else if (nextPlayer) {
      // Room settings
      room.round = _constants.ROUNDS.RIVER;
      room.roundBet = 0; // Deal cards

      room.communityCards = dealCommunityCards(room.communityCards, room.deck, 1);
      room.deck = room.deck.slice(1); // Players settings
      // TODO: Don't need to assign actions to not in-hand players

      room.players = room.players.map(function (player) {
        player.user.actions = [_socketio.CHECK, _socketio.BET];
        player.user.handStrength = (0, _phe.evaluateCards)((0, _helpers.transformCard)(player.user.cards.concat(room.communityCards)));
        var excludedPlayers = [];
        room.pots = room.pots.map(function (pot) {
          if (player.user.handStrength < pot.bestHandStrength && !excludedPlayers.includes(player.socketId) && (player.user.status === _constants.PLAYER_STATUS.PLAYING || player.user.status === _constants.PLAYER_STATUS.ALL_IN)) {
            pot.bestHandStrength = player.user.handStrength;
          }

          excludedPlayers.push(pot.excludedPlayers[0]);
          return pot;
        });
        if (nextPlayer.socketId === player.socketId) player.user.isActing = true;
        return player;
      }); // Save and emit

      store.rooms.set(data.roomId, room);
      io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
        communityCards: room.communityCards,
        players: room.players,
        bigBlind: room.bigBlind,
        roundBet: 0,
        pots: room.pots,
        round: room.round
      });
    }
  };

  var setUpShowdown = function setUpShowdown(room, data) {
    // Find the winners for each pot
    room.players = room.players.map(function (player) {
      player.user.bet = 0;
      player.user.hasActioned = false;
      player.user.actions = [];
      room.pots = room.pots.map(function (pot) {
        if (player.user.handStrength === pot.bestHandStrength) {
          player.user.isWinner = true;
          pot.winners.push(player.socketId);
        } else {
          player.user.isWinner = false;
        }

        return pot;
      });
      return player;
    });
    room.players = awardMoney(room.players, room.pots);
    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: 0,
      pots: room.pots,
      round: room.round
    }); // Wait for 2s to start the new round

    setTimeout(function () {
      var playingPlayers = room.players.filter(getPlayingPlayer);

      if (playingPlayers.length >= 2) {
        gameStart({
          roomId: data.roomId
        }, {
          continuous: true
        });
      } else {
        resetTable(data);
      }
    }, 2000);
  };

  var resetTable = function resetTable(data) {
    var room = store.rooms.get(data.roomId);
    room.communityCards = [];
    room.pots = [];
    room.players = room.players.map(resetPlayer);
    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      pots: room.pots
    });
  };

  var setupTable = function setupTable(room, data) {
    room.players = room.players.map(function (player) {
      player.user.bet = 0;
      player.user.hasActioned = false;
      return player;
    });
    if (room.round === _constants.ROUNDS.PRE_FLOP || room.round === _constants.ROUNDS.FLOP) setUpFlop(room, data);
    if (room.round === _constants.ROUNDS.TURN) setUpTurn(room, data);
    if (room.round === _constants.ROUNDS.RIVER) setUpRiver(room, data);
    if (room.round === _constants.ROUNDS.SHOWDOWN) setUpShowdown(room, data);
  };

  var joinRoom = function joinRoom(data) {
    socket.join(data.roomId);

    var room = store.rooms.get(data.roomId) || _constants.DEFAULT_ROOM;

    var isFirstPlayer = io.sockets.adapter.rooms.get(data.roomId).size < 2;

    if (isFirstPlayer) {
      room.players = [];
      room.players.push({
        socketId: socket.id,
        user: {
          seat: 1,
          name: data.user.name,
          currentMoney: data.user.currentMoney,
          totalMoney: data.user.currentMoney,
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
    } else if (!isFirstPlayer) {
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
          currentMoney: data.user.currentMoney,
          totalMoney: data.user.currentMoney,
          bet: 0,
          hasActioned: false,
          isActing: false,
          actions: [],
          role: '',
          cards: [],
          allPossibleHands: [],
          status: _constants.PLAYER_STATUS.PLAYING
        }
      });
      room.players.sort(bySeat);
    }

    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(_socketio.UPDATE_PLAYERS, room.players);
  };

  var gameStart = function gameStart(data, config) {
    var room = store.rooms.get(data.roomId);
    var playingPlayers = room.players.filter(getActivePlayer).map(function (player) {
      player.user.status = _constants.PLAYER_STATUS.PLAYING;
      return player;
    });
    var sittingOutPlayers = room.players.filter(getSittingOutPlayer).map(function (player) {
      player.user.role = [];
      player.user.cards = [];
      player.user.handStrength = _constants.DEFAULT_BEST_HAND_STRENGTH;
      player.user.isWinner = false;
      return player;
    }); // Assign roles

    if (config.continuous) {
      if (playingPlayers.length === 2) {
        playingPlayers = assignHeadsUpRolesContinuosGame(playingPlayers, room.bigBlind);
      } else if (playingPlayers.length > 2) {
        playingPlayers = assignRolesContinuousGame(playingPlayers, room.bigBlind);
        var utgPlayerIndex = getUTGPlayerIndex(playingPlayers);
        playingPlayers[utgPlayerIndex].user.isActing = true;
      }
    } else if (!config.continuous) {
      if (playingPlayers.length === 2) playingPlayers = assignHeadsUpRoles(playingPlayers, room.bigBlind);else playingPlayers = assignRoles(playingPlayers, room.bigBlind);
    } // Pot Settings


    room.pots = [{
      id: 1,
      amount: 300,
      bestHandStrength: _constants.DEFAULT_BEST_HAND_STRENGTH,
      limit: 0,
      winners: [],
      sidePot: false,
      excludedPlayers: []
    }];
    room.roundBet = room.bigBlind;
    room.deck = (0, _helpers.shuffle)((0, _helpers.createDeck)());
    room.communityCards = [];
    room.round = _constants.ROUNDS.PRE_FLOP; // Deal cards to players

    playingPlayers = dealCards(playingPlayers, room.deck); // Merge all players

    room.players = [].concat(_toConsumableArray(sittingOutPlayers), _toConsumableArray(playingPlayers));
    room.players.sort(bySeat);
    room.deck = room.deck.slice(playingPlayers.length * 2); // Save and emit

    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      round: room.round,
      pots: room.pots
    });
  };

  var check = function check(data) {
    var room = store.rooms.get(data.roomId);
    var currentPlayerIndex = getCurrentPlayerIndex(room.players);
    room.players[currentPlayerIndex].user.hasActioned = true;
    room.players[currentPlayerIndex].user.isActing = false;
    var canGoToNextRound = allPlayersHaveActioned(room.roundBet, room.players);

    if (canGoToNextRound) {
      room.round = getNextRoundName(room.round);
      setupTable(room, data);
    } else if (!canGoToNextRound) {
      var nextPlayer = getNextPlayerToAction(room.players, currentPlayerIndex);
      room.players = room.players.map(function (player) {
        if (nextPlayer.socketId === player.socketId) player.user.isActing = true;
        return player;
      });
      io.to(data.roomId).emit(_socketio.UPDATE_PLAYERS, room.players);
    }

    store.rooms.set(data.roomId, room);
  };

  var call = function call(data) {
    var room = store.rooms.get(data.roomId); // Calculate current player's information

    room.players = room.players.map(function (player) {
      if (player.socketId === socket.id) {
        player.user.currentMoney -= data.calledMoney;
        player.user.hasActioned = true;
        player.user.isActing = false;

        if (player.user.currentMoney === 0) {
          player.user.status = _constants.PLAYER_STATUS.ALL_IN;
          player.user.bet += data.calledMoney;
          player.user.actions = [];
        } else {
          player.user.status = _constants.PLAYER_STATUS.PLAYING;
          player.user.bet = room.roundBet;
        }
      }

      return player;
    }); // Calculate pot(s)

    room.pots = calculateMultiplePots(room.players, room.pots, data.calledMoney);
    var canGoToNextRound = allPlayersHaveActioned(room.roundBet, room.players);

    if (canGoToNextRound) {
      room.round = getNextRoundName(room.round);
      setupTable(room, data);
    } else if (!canGoToNextRound) {
      var currentPlayerIndex = getCurrentPlayerIndex(room.players);
      var nextPlayer = getNextPlayerToAction(room.players, currentPlayerIndex);
      room.players = room.players.map(function (player) {
        if (player.socketId === nextPlayer.socketId) player.user.isActing = true;
        return player;
      });
    }

    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      pots: room.pots
    });
  };

  var bet = function bet(data) {
    var room = store.rooms.get(data.roomId);
    var currentPlayerIndex = getCurrentPlayerIndex(room.players);
    var betMoney;
    room.players = room.players.map(function (player, index) {
      if (player.socketId === socket.id) {
        // Calculate current player's currentMoney
        betMoney = data.betMoney - player.user.bet;
        player.user.hasActioned = true;
        player.user.isActing = false;
        player.user.currentMoney -= betMoney;
        player.user.bet = data.betMoney;
        room.roundBet = data.betMoney;

        if (player.user.currentMoney === 0) {
          player.user.status = _constants.PLAYER_STATUS.ALL_IN;
          player.user.actions = [];
        } else {
          player.user.status = _constants.PLAYER_STATUS.PLAYING;
        }
      } else {
        // Reset other players' actions
        if (player.user.status === _constants.PLAYER_STATUS.PLAYING) {
          player.user.hasActioned = false;
          player.user.actions = [_socketio.CALL, _socketio.BET, _socketio.FOLD];
        }
      }

      return player;
    }); // Calculate pot(s)

    room.pots = calculateMultiplePots(room.players, room.pots, betMoney); // Find the next player to act

    var nextPlayer = getNextPlayerToAction(room.players, currentPlayerIndex);

    if (nextPlayer) {
      room.players = room.players.map(function (player) {
        if (nextPlayer.socketId === player.socketId) player.user.isActing = true;
        return player;
      });
    } else if (!nextPlayer) {
      setupTable(room, data);
    } // Save and emit


    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(_socketio.UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      pots: room.pots
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
    var winWithoutShowdown = room.players.filter(getInHandPlayer).length === 1;

    if (winWithoutShowdown) {
      // Award money to the winner
      room.players = room.players.map(function (player) {
        if (player.user.status === _constants.PLAYER_STATUS.PLAYING || player.user.status === _constants.PLAYER_STATUS.ALL_IN) {
          player.user.currentMoney += room.pots[0].amount;
        }

        return player;
      });
      setTimeout(function () {
        gameStart({
          roomId: data.roomId
        }, {
          continuous: true
        });
      }, 2000);
    } else if (!winWithoutShowdown) {
      var canGoToNextRound = allPlayersHaveActioned(room.roundBet, room.players);

      if (canGoToNextRound) {
        room.round = getNextRoundName(room.round);
        setupTable(room, data);
      } else if (!canGoToNextRound) {
        var currentPlayerIndex = getCurrentPlayerIndex(room.players);
        var nextPlayer = getNextPlayerToAction(room.players, currentPlayerIndex);
        room.players = room.players.map(function (player) {
          if (nextPlayer.socketId === player.socketId) player.user.isActing = true;
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
      pots: room.pots
    });
  };

  socket.on(_socketio.JOIN_ROOM, joinRoom);
  socket.on(_socketio.GAME_START, function (data) {
    return gameStart(data, {
      continuous: false
    });
  });
  socket.on(_socketio.CHECK, check);
  socket.on(_socketio.CALL, call);
  socket.on(_socketio.BET, bet);
  socket.on(_socketio.FOLD, fold);
}