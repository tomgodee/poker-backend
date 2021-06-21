import { VALUES, SUITES, TEXAS_HANDS } from '../config/constants';

export const randomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
}

export const createDeck = () => {
  let deck = [];
  for (const [number, numberValue] of Object.entries(VALUES)) {
    for (const [suite, suiteValue] of Object.entries(SUITES)) {
      deck.push({
        number: numberValue,
        suite: suiteValue
      });
    }
  }
  return deck;
}

export const shuffle = (array) => {
  var currentIndex = array.length, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

export const findAllCombinations = (array, combinationLength, result, startingIndex, user) => {
  if (combinationLength === 0) {
    user.allPossibleHands.push(result);
    return result;
  }
  for (let i = startingIndex; i < array.length && i - startingIndex <= TEXAS_HANDS; i += 1) {
    const innerResult = [...result];
    innerResult.push(array[i]);
    findAllCombinations(array, combinationLength - 1, innerResult, i + 1, user);
  }
};

export const transformCard = (cards) => {
  return cards.map((card) => {
    let number, suite;
    switch (card.number) {
      case VALUES.ACE:
        number = 'A';
        break;
      case VALUES.TEN:
        number = 'T';
        break;
      case VALUES.JACK:
        number = 'J';
        break;
      case VALUES.QUEEN:
        number = 'Q';
        break;
      case VALUES.KING:
        number = 'K';
        break;
      default:
        number = String(card.number);
        break;
    }
    switch (card.suite) {
      case SUITES.HEARTS:
        suite = 'h';
        break;
      case SUITES.DIAMONDS:
        suite = 'd';
        break;
      case SUITES.CLUBS:
        suite = 'c';
        break;
      case SUITES.SPADES:
        suite = 's';
        break;
      default:
        suite = 'h';
        break;
    }
    return `${number}${suite}`;
  });
};
