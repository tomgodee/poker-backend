export const SALT_ROUNDS = 10;

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
  FOLD: 'fold',
  SIT_OUT: 'sit out',
}

export const ROLES = {
  SB :'SB',
  BB: 'BB',
  D: 'D',
};

export default {
  SALT_ROUNDS,
  VALUES,
  SUITES,
  ROUNDS,
  PLAYER_STATUS,
};
