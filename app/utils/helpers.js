import { VALUES, SUITES} from '../config/constants';

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