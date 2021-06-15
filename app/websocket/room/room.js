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
} from '../../utils/helpers';
import { ROUNDS, PLAYER_STATUS } from '../../config/constants';

const INIITAL_STATE = {
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
      status: '',
    }
    }],
  deck: [],
  publicCards: [],
  bigBlind: 200,
  roundBet: 0,
  pot: 0,
  round: ROUNDS.PRE_FLOP,
}

const DEFAULT_ROLES = {
  SB :'SB',
  BB: 'BB',
  D: 'D',
};

const getNextRoundName = (round) => {
  if (round === ROUNDS.PRE_FLOP) return ROUNDS.FLOP;
  if (round === ROUNDS.FLOP) return ROUNDS.TURN;
  if (round === ROUNDS.TURN) return ROUNDS.RIVER;
  if (round === ROUNDS.RIVER) return ROUNDS.SHOWDOWN;
}

const getNextPlayerToAction = (players, index) => {
  const playersBehind = players.slice(0, index);
  const playersAhead = players.slice(index);
  const nextPlayer = playersAhead.find(player => !player.user.hasActioned) || playersBehind.find(player => !player.user.hasActioned);
  return nextPlayer;
}

export default function roomHandler(io, socket, store) {
  const setUpFlop = (room, data) => {
    room.players.map((player) => {
      player.user.bet = 0;
      player.user.hasActioned = false;
      player.user.actions = [CHECK, BET];
      if (player.user.role === DEFAULT_ROLES.SB || player.user.role.includes(DEFAULT_ROLES.SB)) {
        player.user.isActing = true;
      }
    });
  
    // Deal public cards
    room.publicCards = room.deck.slice(0, 3);
    room.deck = room.deck.slice(3);
  
    io.to(data.roomId).emit(UPDATE_TABLE, {
      publicCards: room.publicCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: 0,
      pot: room.pot,
    });
  };
  
  const setUpTurn = () => {};
  const setUpRiver = () => {};
  const setUpShowdown = () => {};
  
  const setupTable = (room, data) => {
    if (room.round === ROUNDS.FLOP) setUpFlop(room, data);
    if (room.round === ROUNDS.TURN) setUpTurn(room, data);
    if (room.round === ROUNDS.RIVER) setUpRiver(room, data);
    if (room.round === ROUNDS.SHOWDOWN) setUpShowdown(room, data);
  }

  const joinRoom = (data) => {
    // console.log('data', data);
    socket.join(data.roomId);
    const room = store.rooms.get(data.roomId) || INIITAL_STATE;
    const isFirstPlayer = io.sockets.adapter.rooms.get(data.roomId).size < 2;

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
          status: '',
        }
      });
    } else {
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
          money: data.user.money,
          bet: 0,
          hasActioned: false,
          actions: [],
          role: '',
          cards: [],
          status: '',
        }
      });

      room.players.sort((playerA, playerB) => playerA.user.seat - playerB.user.seat);
    }
    store.rooms.set(data.roomId, room);
    io.to(data.roomId).emit(UPDATE_PLAYERS, room.players);
  }

  const gameStart = (data) => {
    const room = store.rooms.get(data.roomId)
    room.deck = shuffle(createDeck());

    // Assign role, compute money and bet for each player
    if (room.players.length === 2) {
      room.players[0].user.role = ['SB', 'D'];
      room.players[0].user.bet = room.bigBlind / 2;
      room.players[0].user.money -= room.bigBlind / 2;
      room.players[0].user.actions = [CALL, BET, FOLD];
      room.players[0].user.hasActioned = false;
      room.players[0].user.isActing = true;
      room.players[1].user.role = 'BB';
      room.players[1].user.bet = room.bigBlind;
      room.players[1].user.money -= room.bigBlind;
      room.players[1].user.actions = [CHECK, BET];
      room.players[1].user.hasActioned = false;
      room.players[1].user.isActing = false;
    } else {
      room.players = room.players.map((player, index, players) => {
        if (index === 0) player.user.role = 'SB';
        if (index === 1) player.user.role = 'BB';
        if (index === players.length - 1) player.user.role = 'D';
        return player;
      });
    }

    // Compute pot
    room.roundBet = room.bigBlind;
    room.pot = room.bigBlind * 1.5;


    // Deal cards to players
    // cardIndex helps knowing the if it's the first dealing round or the second round
    const numberOfPlayers = room.players.length;
    const numberOfCardDealt = room.players.length * 2;
    let playerIndex = 0;
    let cardDealtIndex = 0;
    let cardIndex = 0;
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
    room.round = ROUNDS.PRE_FLOP;

    // Save data to store
    store.rooms.set(data.roomId, room)

    io.to(data.roomId).emit(UPDATE_TABLE, {
      publicCards: room.publicCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      pot: room.pot,
    });
    // console.log('room', room);
  }

  const check = (data) => {
    const room = store.rooms.get(data.roomId);
    const currentPlayerIndex = findIndex(room.players, ((player) => player.socketId === socket.id));
    room.players[currentPlayerIndex].user.hasActioned = true;
    room.players[currentPlayerIndex].user.isActing = false;

    const canGoToNextRound = every(room.players, (player) => {
      return player.user.bet === room.roundBet && player.user.hasActioned;
    });
    if (canGoToNextRound) {
      room.round = getNextRoundName(room.round);
      setupTable(room, data);
    } else {
      const nextPlayer = getNextPlayerToAction(room.players, currentPlayerIndex);
      room.players.map((player) => {
        if (nextPlayer.socketId === player.socketId) {
          player.user.isActing = true;
        }
      });
      io.to(data.roomId).emit(UPDATE_PLAYERS, room.players);
    }

    store.rooms.set(data.roomId, room);
  }

  const call = (data) => {
    const room = store.rooms.get(data.roomId);
    room.players.map((player, index, players) => {
      if (player.socketId === socket.id) {
        player.user.money = data.currentPlayer.user.money - (room.roundBet - data.currentPlayer.user.bet);
        room.pot += room.roundBet - data.currentPlayer.user.bet;
        player.user.bet = room.roundBet;
        player.user.hasActioned = true;
        player.user.isActing = false;
        player.user.status = PLAYER_STATUS.PLAYING;
        players[index + 1].user.isActing = true;
      }
    });

    store.rooms.set(data.roomId, room);

    io.to(data.roomId).emit(UPDATE_TABLE, {
      publicCards: room.publicCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      pot: room.pot,
    });
  }

  const bet = (data) => {
    const room = store.rooms.get(data.roomId);
    const currentPlayerIndex = findIndex(room.players, ((player) => player.socketId === socket.id));
    const nextPlayer = getNextPlayerToAction(room.players, currentPlayerIndex);

    room.players.map((player) => {
      if (nextPlayer.socketId === player.socketId) {
        player.user.isActing = true;
      }
      if (player.socketId === socket.id) {
        player.user.money -= data.betMoney;
        player.user.bet = data.betMoney;
        room.pot += data.betMoney;
        player.user.hasActioned = true;
        player.user.isActing = false;
        player.user.status = PLAYER_STATUS.PLAYING;
      } else {
        player.user.hasActioned = false;
      }
    });

    store.rooms.set(data.roomId, room);

    io.to(data.roomId).emit(UPDATE_TABLE, {
      publicCards: room.publicCards,
      players: room.players,
      bigBlind: room.bigBlind,
      roundBet: room.roundBet,
      pot: room.pot,
    });
  }

  socket.on(JOIN_ROOM, joinRoom);
  socket.on(GAME_START, gameStart);
  socket.on(CHECK, check);
  socket.on(CALL, call);
  socket.on(BET, bet);
}

