export const SALT_ROUNDS = 10;

export const TEXAS_HANDS = 5;

export const VALUES = {
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
  KING: 13,
}

export const SUITES = {
  HEARTS: 'hearts',
  DIAMONDS: 'diamonds',
  CLUBS: 'clubs',
  SPADES: 'spades',
}

export const ROUNDS = {
  PRE_FLOP: 'pre-flop',
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river',
  SHOWDOWN: 'showdown',
}

export const PLAYER_STATUS = {
  PLAYING: 'playing',
  ALL_IN: 'all-in',
  FOLD: 'fold',
  SIT_OUT: 'sit-out',
}

export const ROLES = {
  SB :'SB',
  BB: 'BB',
  D: 'D',
};

// https://github.com/HenryRLee/PokerHandEvaluator/blob/master/Documentation/Algorithm.md
// The worst hand possibly is 2-3-4-5 and 6-7 off suite results in a hand strength of 7462
// Need to investigate this number further
export const DEFAULT_BEST_HAND_STRENGTH = 7462;

export const DEFAULT_PLAYER = {
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
    status: '',
  }
};

export const DEFAULT_POT = {
  id: 1,
  amount: 0,
  bestHandStrength: DEFAULT_BEST_HAND_STRENGTH,
  limit: 0,
  winners: [],
  sidePot: false,
  excludedPlayers: [],
}

export const DEFAULT_ROOM = {
  players: [DEFAULT_PLAYER],
  deck: [],
  communityCards: [],
  bigBlind: 200,
  roundBet: 0,
  pots: [DEFAULT_POT],
  round: ROUNDS.PRE_FLOP,
}

export default {
  SALT_ROUNDS,
  VALUES,
  SUITES,
  ROUNDS,
  PLAYER_STATUS,
  DEFAULT_BEST_HAND_STRENGTH,
  DEFAULT_PLAYER,
  DEFAULT_POT,
  DEFAULT_ROOM,
};
