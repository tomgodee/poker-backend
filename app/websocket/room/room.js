import { difference, every, findIndex } from 'lodash';
import {
  JOIN_ROOM,
  UPDATE_PLAYERS,
  GAME_START,
  UPDATE_TABLE,
  CHECK,
  CALL,
  BET,
  FOLD,
 } from '../../config/socketio';
import {
  randomElement,
  createDeck,
  shuffle,
  transformCard,
} from '../../utils/helpers';
import {
  ROUNDS, PLAYER_STATUS,
  ROLES,
  DEFAULT_BEST_HAND_STRENGTH,
  DEFAULT_POT,
  DEFAULT_ROOM,
} from '../../config/constants';
import { evaluateCards } from 'phe';
import UserModel from '../../models/User';

const getNextRoundName = (round) => {
  if (round === ROUNDS.PRE_FLOP) return ROUNDS.FLOP;
  if (round === ROUNDS.FLOP) return ROUNDS.TURN;
  if (round === ROUNDS.TURN) return ROUNDS.RIVER;
  if (round === ROUNDS.RIVER) return ROUNDS.SHOWDOWN;
}

const getTotalMoneyFromPreviousPots = (pots) => {
  if (pots.length === 1) return pots[0].limit;
  else if (pots.length > 1) return pots.reduce((prevPot, currentPot) => ({ limit: prevPot.limit + currentPot.limit }), { limit : 0 }).limit;
  else return 0;
}

const getInactionedPlayingPlayer = (player) => !player.user.hasActioned && player.user.status === PLAYER_STATUS.PLAYING;

const getPlayingPlayer = (player) => player.user.status === PLAYER_STATUS.PLAYING;

const getInHandPlayer = (player) => player.user.status === PLAYER_STATUS.PLAYING || player.user.status === PLAYER_STATUS.ALL_IN;

const getActivePlayer = (player) => player.user.status === PLAYER_STATUS.PLAYING || player.user.status === PLAYER_STATUS.ALL_IN || player.user.status === PLAYER_STATUS.FOLD;

const getSittingOutPlayer = (player) => player.user.status === PLAYER_STATUS.SIT_OUT;

const byStatusAndMoney = (playerA, playerB) => playerA.user.status.localeCompare(playerB.user.status) || playerA.user.bet - playerB.user.bet;

const bySeat = (playerA, playerB) => playerA.user.seat - playerB.user.seat;

const allPlayersHaveActioned = (roundBet, players) => {
  return every(players, (player) => {
    return player.user.bet === roundBet && player.user.hasActioned && player.user.status === PLAYER_STATUS.PLAYING
        || player.user.status === PLAYER_STATUS.FOLD
        || player.user.status === PLAYER_STATUS.ALL_IN
        || player.user.status === PLAYER_STATUS.SIT_OUT;
  });
}

const getNextPlayerToAction = (players, index) => {
  if (index === 0) {
    return players.slice(1).find(getInactionedPlayingPlayer);
  } else {
    const playersBehind = players.slice(0, index);
    const playersAhead = players.slice(index + 1);
    return playersAhead.find(getInactionedPlayingPlayer) || playersBehind.find(getInactionedPlayingPlayer);
  }
}

const getUTGPlayerIndex = (players) => {
  const bbPlayerIndex = players.findIndex((player) => player.user.role.includes(ROLES.BB));
  if (bbPlayerIndex === players.length - 1) return 0;
  else return bbPlayerIndex + 1;
}

const getFirstPlayerToAction = (players) => {
  const playingPlayers = players.filter(getPlayingPlayer);
  if (playingPlayers.length < 2) return null;

  const sbPlayerIndex = players.findIndex((player) => player.user.role.includes(ROLES.SB));
  if (players[sbPlayerIndex].user.status === PLAYER_STATUS.PLAYING) return players[sbPlayerIndex];

  // TODO: slice(0, 0) returns []
  const playersBehind = players.slice(0, sbPlayerIndex);
  const playersAhead = players.slice(sbPlayerIndex + 1);
  const allPlayers = playersBehind.concat(playersAhead);
  return allPlayers.find(getInactionedPlayingPlayer);
}

const calculateMultiplePots = (players, pots, betMoney) => {
  // All-in players are sorted first then sorted by money from lowest to highest
  players.sort(byStatusAndMoney);

  // If there isnt an all-in player
  if (players[0].user.status !== PLAYER_STATUS.ALL_IN) {
    pots[0].amount += betMoney;
  } else if (players[0].user.status === PLAYER_STATUS.ALL_IN) {
    // If there is an all-in player then recalculate all pots from the start
    pots = [];
    players.map((player, index) => {
    if (player.user.status === PLAYER_STATUS.ALL_IN) {
      // All previous pots are side pot
      pots = pots.map((pot) => {
        pot.sidePot = true;
        pot.amount += pot.limit;
        return pot;
      });

      let totalMoneyFromAllPreviousPots = getTotalMoneyFromPreviousPots(pots);
      // Create the all-in pot (possibly side pot if another players raises)
      pots.push({
        id: index + 2,
        amount: player.user.bet - totalMoneyFromAllPreviousPots,
        limit: player.user.bet - totalMoneyFromAllPreviousPots,
        bestHandStrength: DEFAULT_BEST_HAND_STRENGTH,
        winners: [],
        sidePot: false,
        excludedPlayers: [player.socketId],
      });
    } else if (player.user.status === PLAYER_STATUS.PLAYING) {
      // If a player has either called a previous bet or is either SB or BB then that money he/she put in goes to the side pot(s) first
        let money = player.user.bet;
        pots = pots.map((pot) => {
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
}

const assignHeadsUpRolesContinuosGame = (players, bigBlind) => {
  const sbPlayer = players.find((player) => player.user.role.includes(ROLES.SB));
  const bbPlayer = players.find((player) => player.user.role.includes(ROLES.BB));
  // if both of them aren't SB and BB
  if (!sbPlayer || !bbPlayer) {
    players[0].user.role = ROLES.BB;
    players[0].user.bet = bigBlind;
    players[0].user.currentMoney -= bigBlind;
    players[0].user.actions = [CHECK, BET];
    players[0].user.isActing = false;
    players[1].user.role = [ROLES.SB, ROLES.D];
    players[1].user.bet = bigBlind / 2;
    players[1].user.currentMoney -= bigBlind / 2;
    players[1].user.actions = [CALL, BET, FOLD];
    players[1].user.isActing = true;
  } else if (sbPlayer && bbPlayer) {
    // if both players are SB and BB
    players = players.map((player) => {
      if (player.user.role.includes(ROLES.SB)) {
        player.user.role = ROLES.BB;
        player.user.bet = bigBlind;
        player.user.currentMoney -= bigBlind;
        player.user.actions = [CHECK, BET];
        player.user.isActing = false;
      } else if (player.user.role.includes(ROLES.BB)){
        player.user.role = [ROLES.SB, ROLES.D];
        player.user.bet = bigBlind / 2;
        player.user.currentMoney -= bigBlind / 2;
        player.user.actions = [CALL, BET, FOLD];
        player.user.isActing = true;
      }
      return player;
    });
  }
  return players;
}

const assignRolesContinuousGame = (players, bigBlind) => {
  // Shift players' roles by 1 seat forwards
  let temporaryRole = '';
  return players.map((player, index, playersArray) => {
    player.user.hasActioned = false;
    player.user.status = PLAYER_STATUS.PLAYING;
    player.user.actions = [FOLD, CALL, BET];
    player.user.bet = 0;
    if (index === 0) {
      temporaryRole = player.user.role;
      player.user.role = playersArray[playersArray.length - 1].user.role;
    } else {
      const placeholderRole = player.user.role;
      player.user.role = temporaryRole;
      temporaryRole = placeholderRole;
    }

    if (player.user.role.includes(ROLES.SB)) {
      player.user.bet = bigBlind / 2;
      player.user.currentMoney -= bigBlind /2;
    }
    if (player.user.role.includes(ROLES.BB)) {
      player.user.bet = bigBlind;
      player.user.currentMoney -= bigBlind;
      player.user.actions = [CHECK, BET];
    }
    return player;
  });
}

const assignHeadsUpRoles = (players, bigBlind) => {
  players[0].user.role = [ROLES.SB, ROLES.D];
  players[0].user.bet = bigBlind / 2;
  players[0].user.currentMoney -= bigBlind / 2;
  players[0].user.actions = [FOLD, CALL, BET];
  players[0].user.hasActioned = false;
  players[0].user.isActing = true;
  players[0].user.status = PLAYER_STATUS.PLAYING;
  players[1].user.role = ROLES.BB;
  players[1].user.bet = bigBlind;
  players[1].user.currentMoney -= bigBlind;
  players[1].user.actions = [CHECK, BET];
  players[1].user.hasActioned = false;
  players[1].user.isActing = false;
  players[1].user.status = PLAYER_STATUS.PLAYING;
  return players;
}

const assignRoles = (players, bigBlind) => {
  return players.map((player, index, playersArray) => {
    if (index === 0) {
      player.user.role = ROLES.SB;
      player.user.bet = bigBlind / 2;
      player.user.currentMoney -= bigBlind / 2;
      player.user.actions = [FOLD, CALL, BET];
    }
    else if (index === 1) {
      player.user.role = ROLES.BB;
      player.user.bet = bigBlind;
      player.user.currentMoney -= bigBlind;
      player.user.actions = [CHECK, BET];
    }
    else if (index === playersArray.length - 1) {
      player.user.role = ROLES.D;
      player.user.isActing = true;
      player.user.actions = [FOLD, CALL, BET];
    }
    else {
      player.user.actions = [FOLD, CALL, BET];
    }
    player.user.hasActioned = false;
    player.user.status = PLAYER_STATUS.PLAYING;
    return player;
  });
}

const resetPlayer = (player) => {
  player.user.cards = [];
  player.user.actions = [];
  player.user.isActing = false;
  player.user.bet = 0;
  player.user.role = [];
  return player;
}

const dealCards = (players, deck) => {
  // roundNumber helps knowing the if it's the first dealing round or the second dealing round
  // TODO: Cards should be dealt from the SB not from the first seat
  const numberOfPlayers = players.length;
  const numberOfCardDealt = players.length * 2;
  let playerIndex = 0;
  let cardDealtIndex = 0;
  let roundNumber = 0;
  
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
}

const awardMoney = (players, pots) => {
  return players.map((player) => {
    if (player.user.status === PLAYER_STATUS.PLAYING || player.user.status === PLAYER_STATUS.ALL_IN) {
      pots.map((pot) => {
        if (pot.winners.includes(player.socketId)) player.user.currentMoney += Math.floor(pot.amount / pot.winners.length);
      });
      if (player.user.currentMoney === 0) {
        player.user.status = PLAYER_STATUS.SIT_OUT;
        // UserModel.updateMoneyByName(player.user.name, 0);
      }
      else player.user.status = PLAYER_STATUS.PLAYING;
    }
    return player;
  });
}

const dealCommunityCards = (communityCards, deck, numberOfCard) => {
  return communityCards.concat(deck.slice(0, numberOfCard));
}

export default function roomHandler(io, socket, store) {
  const getCurrentPlayerIndex = (players) => findIndex(players, ((player) => player.socketId === socket.id));
 
  const runToShowdown = (room, data) => {
    const intervalId = setInterval(() => {
      if (room.round === ROUNDS.PRE_FLOP || room.round === ROUNDS.FLOP) {
        room.communityCards = dealCommunityCards(room.communityCards, room.deck, 3);
        room.deck = room.deck.slice(3);
        room.round = ROUNDS.TURN;
      } else if (room.round === ROUNDS.TURN) {
        room.communityCards = dealCommunityCards(room.communityCards, room.deck, 1);
        room.deck = room.deck.slice(1);
        room.round = ROUNDS.RIVER;
      } else if (room.round === ROUNDS.RIVER) {
        room.communityCards = dealCommunityCards(room.communityCards, room.deck, 1);
        room.deck = room.deck.slice(1);
        room.round = ROUNDS.SHOWDOWN;

        // Calculate best hand for each pot
        const excludedPlayers = [];
        room.players = room.players.map((player) => {
          player.user.handStrength = evaluateCards(transformCard(player.user.cards.concat(room.communityCards)));
          room.pots = room.pots.map((pot) => {
            if (player.user.handStrength < pot.bestHandStrength
              && !excludedPlayers.includes(player.socketId)
              && (player.user.status === PLAYER_STATUS.PLAYING || player.user.status === PLAYER_STATUS.ALL_IN)) {
              pot.bestHandStrength = player.user.handStrength;
            }
            if (player.socketId === pot.excludedPlayers[0]) {
              excludedPlayers.push(pot.excludedPlayers[0]);
            }
            return pot;
          });
          return player;
        });
      } else if (room.round === ROUNDS.SHOWDOWN) {
        clearInterval(intervalId);
        setUpShowdown(room, data);
      }

      if (room.round !== ROUNDS.SHOWDOWN) {
        store.rooms.set(data.roomId, room);
        io.to(data.roomId).emit(UPDATE_TABLE, {
          communityCards: room.communityCards,
          players: room.players,
          bigBlind: room.bigBlind,
          roundBet: 0,
          pots: room.pots,
          round: room.round,
        });
      }
    }, 2000);
  }

  const setUpFlop = (room, data) => {
    const nextPlayer = getFirstPlayerToAction(room.players);
    if (!nextPlayer) {
      runToShowdown(room, data);
    } else if (nextPlayer) {
      room.players = room.players.map((player) => {
        player.user.actions = [CHECK, BET];
        if (nextPlayer.socketId === player.socketId) {
          player.user.isActing = true;
        }
        return player;
      });

      room.roundBet = 0;
      room.round = ROUNDS.FLOP;
      room.communityCards = dealCommunityCards(room.communityCards, room.deck, 3);
      room.deck = room.deck.slice(3);
      
      store.rooms.set(data.roomId, room);
      io.to(data.roomId).emit(UPDATE_TABLE, {
        communityCards: room.communityCards,
        players: room.players,
        bigBlind: room.bigBlind,
        roundBet: 0,
        pots: room.pots,
        round: room.round,
      });
    }
  };
  
  const setUpTurn = (room, data) => {
    const nextPlayer = getFirstPlayerToAction(room.players);
    if (!nextPlayer) {
      runToShowdown(room, data);
    } else if (nextPlayer) {
      room.players = room.players.map((player) => {
        player.user.actions = [CHECK, BET];
        if (nextPlayer.socketId === player.socketId) {
          player.user.isActing = true;
        }
        return player;
      });

      room.roundBet = 0;
      room.round = ROUNDS.TURN;
      room.communityCards = dealCommunityCards(room.communityCards, room.deck, 1);
      room.deck = room.deck.slice(1);
    
      store.rooms.set(data.roomId, room);
      io.to(data.roomId).emit(UPDATE_TABLE, {
        communityCards: room.communityCards,
        players: room.players,
        bigBlind: room.bigBlind,
        roundBet: 0,
        pots: room.pots,
        round: room.round,
      });
    }
  };

  const setUpRiver = (room, data) => {
    const nextPlayer = getFirstPlayerToAction(room.players);
    if (!nextPlayer) {
      runToShowdown(room, data);
    } else if (nextPlayer) {
      // Room settings
      room.round = ROUNDS.RIVER;
      room.roundBet = 0;
    
      // Deal cards
      room.communityCards = dealCommunityCards(room.communityCards, room.deck, 1);
      room.deck = room.deck.slice(1);

      // Players settings
      // TODO: Don't need to assign actions to not in-hand players
      room.players = room.players.map((player) => {
        player.user.actions = [CHECK, BET];
        player.user.handStrength = evaluateCards(transformCard(player.user.cards.concat(room.communityCards)));

        const excludedPlayers = [];
        room.pots = room.pots.map((pot) => {
          if (player.user.handStrength < pot.bestHandStrength
            && !excludedPlayers.includes(player.socketId)
            && (player.user.status === PLAYER_STATUS.PLAYING || player.user.status === PLAYER_STATUS.ALL_IN)) {
            pot.bestHandStrength = player.user.handStrength;
          }
          excludedPlayers.push(pot.excludedPlayers[0]);
          return pot;
        });

        if (nextPlayer.socketId === player.socketId) player.user.isActing = true;
        return player;
      });

      // Save and emit
      store.rooms.set(data.roomId, room);
      io.to(data.roomId).emit(UPDATE_TABLE, {
        communityCards: room.communityCards,
        players: room.players,
        bigBlind: room.bigBlind,
        roundBet: 0,
        pots: room.pots,
        round: room.round,
      });
    }
  };

  const setUpShowdown = (room, data) => {
    // Find the winners for each pot
    room.players = room.players.map((player) => {
      player.user.bet = 0;
      player.user.hasActioned = false;
      player.user.actions = [];
      room.pots = room.pots.map((pot) => {
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
    io.to(data.roomId).emit(UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: 0,
      pots: room.pots,
      round: room.round,
    });

    // Wait for 2s to start the new round
    setTimeout(() => {
      const playingPlayers = room.players.filter(getPlayingPlayer)
      if (playingPlayers.length >= 2) {
        gameStart({ roomId: data.roomId }, { continuous: true });
      } else {
        resetTable(data);
      }
    }, 2000);
  };

  const resetTable = (data) => {
    const room = store.rooms.get(data.roomId);

    room.communityCards = [];
    room.pots = [];
    room.players = room.players.map(resetPlayer);

    store.rooms.set(data.roomId, room);

    io.to(data.roomId).emit(UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      pots: room.pots,
    });
  }
  
  const setupTable = (room, data) => {
    room.players = room.players.map((player) => {
      player.user.bet = 0;
      player.user.hasActioned = false;
      return player;
    });
    if (room.round === ROUNDS.PRE_FLOP || room.round === ROUNDS.FLOP) setUpFlop(room, data);
    if (room.round === ROUNDS.TURN) setUpTurn(room, data);
    if (room.round === ROUNDS.RIVER) setUpRiver(room, data);
    if (room.round === ROUNDS.SHOWDOWN) setUpShowdown(room, data);
  }

  const joinRoom = (data) => {
    socket.join(data.roomId);
    const room = store.rooms.get(data.roomId) || DEFAULT_ROOM;
    const isFirstPlayer = io.sockets.adapter.rooms.get(data.roomId).size < 2;

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
          status: PLAYER_STATUS.PLAYING,
        }
      });
    } else if (!isFirstPlayer) {
      const seats = []; 
      for (let i = 1; i <= data.max_number_of_player; i += 1) {
        seats.push(i);
      }
      const occupiedSeats = room.players.map((player) => player.user.seat);
      const availableSeats = difference(seats, occupiedSeats);
      room.players.push({
        socketId: socket.id,
        user: {
          seat: data.random_seat ? randomElement(availableSeats) : Math.min(availableSeats),
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
          status: PLAYER_STATUS.PLAYING,
        }
      });

      room.players.sort(bySeat);
    }

    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(UPDATE_PLAYERS, room.players);
  }

  const gameStart = (data, config) => {
    const room = store.rooms.get(data.roomId)
    
    let playingPlayers = room.players.filter(getActivePlayer).map((player) => {
      player.user.status = PLAYER_STATUS.PLAYING;
      return player;
    });
    const sittingOutPlayers = room.players.filter(getSittingOutPlayer).map((player) => {
      player.user.role = [];
      player.user.cards = [];
      player.user.handStrength = DEFAULT_BEST_HAND_STRENGTH;
      player.user.isWinner = false;
      return player;
    });

    // Assign roles
    if (config.continuous) {
      if (playingPlayers.length === 2) {
        playingPlayers = assignHeadsUpRolesContinuosGame(playingPlayers, room.bigBlind);
      } else if (playingPlayers.length > 2) {
        playingPlayers = assignRolesContinuousGame(playingPlayers, room.bigBlind);
        const utgPlayerIndex = getUTGPlayerIndex(playingPlayers);
        playingPlayers[utgPlayerIndex].user.isActing = true;
      }
    } else if (!config.continuous) {
      if (playingPlayers.length === 2) playingPlayers = assignHeadsUpRoles(playingPlayers, room.bigBlind);
      else playingPlayers = assignRoles(playingPlayers, room.bigBlind);
    }

    // Pot Settings
    room.pots = [{
      id: 1,
      amount: 300,
      bestHandStrength: DEFAULT_BEST_HAND_STRENGTH,
      limit: 0,
      winners: [],
      sidePot: false,
      excludedPlayers: [],
    }];
    room.roundBet = room.bigBlind;
    room.deck = shuffle(createDeck());
    room.communityCards = [];
    room.round = ROUNDS.PRE_FLOP;

    // Deal cards to players
    playingPlayers = dealCards(playingPlayers, room.deck);

    // Merge all players
    room.players = [...sittingOutPlayers, ...playingPlayers];
    room.players.sort(bySeat);
    room.deck = room.deck.slice(playingPlayers.length * 2);

    // Save and emit
    store.rooms.set(data.roomId, room)
    io.to(data.roomId).emit(UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      round: room.round,
      pots: room.pots,
    });
  }

  const check = (data) => {
    const room = store.rooms.get(data.roomId);
    const currentPlayerIndex = getCurrentPlayerIndex(room.players);
    room.players[currentPlayerIndex].user.hasActioned = true;
    room.players[currentPlayerIndex].user.isActing = false;

    const canGoToNextRound = allPlayersHaveActioned(room.roundBet, room.players);
    if (canGoToNextRound) {
      room.round = getNextRoundName(room.round);
      setupTable(room, data);
    } else if (!canGoToNextRound) {
      const nextPlayer = getNextPlayerToAction(room.players, currentPlayerIndex);
      room.players = room.players.map((player) => {
        if (nextPlayer.socketId === player.socketId) player.user.isActing = true;
        return player;
      });
      io.to(data.roomId).emit(UPDATE_PLAYERS, room.players);
    }

    store.rooms.set(data.roomId, room);
  }

  const call = (data) => {
    const room = store.rooms.get(data.roomId);

    // Calculate current player's information
    room.players = room.players.map((player) => {
      if (player.socketId === socket.id) {
        player.user.currentMoney -= data.calledMoney;
        player.user.hasActioned = true;
        player.user.isActing = false;
        if (player.user.currentMoney === 0) {
          player.user.status = PLAYER_STATUS.ALL_IN;
          player.user.bet += data.calledMoney;
          player.user.actions = [];
        } else {
          player.user.status = PLAYER_STATUS.PLAYING;
          player.user.bet = room.roundBet;
        }
      }
      return player;
    });

    // Calculate pot(s)
    room.pots = calculateMultiplePots(room.players, room.pots, data.calledMoney);
    
    const canGoToNextRound = allPlayersHaveActioned(room.roundBet, room.players);
    if (canGoToNextRound) {
      room.round = getNextRoundName(room.round);
      setupTable(room, data);
    } else if (!canGoToNextRound) {
      const currentPlayerIndex = getCurrentPlayerIndex(room.players);
      const nextPlayer = getNextPlayerToAction(room.players, currentPlayerIndex);
      room.players = room.players.map((player) => {
        if (player.socketId === nextPlayer.socketId) player.user.isActing = true;
        return player;
      });
    }

    store.rooms.set(data.roomId, room);

    io.to(data.roomId).emit(UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      pots: room.pots,
    });
  }

  const bet = (data) => {
    const room = store.rooms.get(data.roomId);
    const currentPlayerIndex = getCurrentPlayerIndex(room.players);
    let betMoney;
    room.players = room.players.map((player, index) => {
      if (player.socketId === socket.id) {
        // Calculate current player's currentMoney
        betMoney = data.betMoney - player.user.bet;
        player.user.hasActioned = true;
        player.user.isActing = false;
        player.user.currentMoney -= betMoney;
        player.user.bet = data.betMoney;
        room.roundBet = data.betMoney;
        if (player.user.currentMoney === 0) {
          player.user.status = PLAYER_STATUS.ALL_IN;
          player.user.actions = []; 
        } else {
          player.user.status = PLAYER_STATUS.PLAYING;
        }
      } else {
        // Reset other players' actions
        if (player.user.status === PLAYER_STATUS.PLAYING) {
          player.user.hasActioned = false;
          player.user.actions = [CALL, BET, FOLD];
        }
      }
      return player;
    });

    // Calculate pot(s)
    room.pots = calculateMultiplePots(room.players, room.pots, betMoney);

    // Find the next player to act
    const nextPlayer = getNextPlayerToAction(room.players, currentPlayerIndex);
    if (nextPlayer) {
      room.players = room.players.map((player) => {
        if (nextPlayer.socketId === player.socketId) player.user.isActing = true;
        return player;
      });
    } else if (!nextPlayer) {
      setupTable(room, data);
    }

    // Save and emit
    store.rooms.set(data.roomId, room);

    io.to(data.roomId).emit(UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      pots: room.pots,
    });
  }

  const fold = (data) => {
    const room = store.rooms.get(data.roomId);

    room.players = room.players.map((player) => {
      if (player.socketId === socket.id) {
        player.user.cards = [];
        player.user.bet = 0;
        player.user.actions = [];
        player.user.hasActioned = true;
        player.user.isActing = false;
        player.user.status = PLAYER_STATUS.FOLD;
      }
      return player;
    });

    const winWithoutShowdown = room.players.filter(getInHandPlayer).length === 1;
    if (winWithoutShowdown) {
      // Award money to the winner
      room.players = room.players.map((player) => {
        if (player.user.status === PLAYER_STATUS.PLAYING || player.user.status === PLAYER_STATUS.ALL_IN) {
          player.user.currentMoney += room.pots[0].amount;
        }
        return player;
      });
      setTimeout(() => {
        gameStart({ roomId: data.roomId }, { continuous: true });
      }, 2000);
    } else if (!winWithoutShowdown) {
      const canGoToNextRound = allPlayersHaveActioned(room.roundBet, room.players);
      if (canGoToNextRound) {
        room.round = getNextRoundName(room.round);
        setupTable(room, data);
      } else if (!canGoToNextRound) {
        const currentPlayerIndex = getCurrentPlayerIndex(room.players);
        const nextPlayer = getNextPlayerToAction(room.players, currentPlayerIndex);
        room.players = room.players.map((player) => {
          if (nextPlayer.socketId === player.socketId) player.user.isActing = true;
          return player;
        });
      }
    }

    store.rooms.set(data.roomId, room);

    io.to(data.roomId).emit(UPDATE_TABLE, {
      communityCards: room.communityCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      pots: room.pots,
    });
  }

  socket.on(JOIN_ROOM, joinRoom);
  socket.on(GAME_START, (data) => gameStart(data, { continuous: false }));
  socket.on(CHECK, check);
  socket.on(CALL, call);
  socket.on(BET, bet);
  socket.on(FOLD, fold);
}
