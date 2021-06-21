"use strict";

require("core-js/modules/es.symbol.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.symbol.iterator.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.string.iterator.js");

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.array.slice.js");

require("core-js/modules/es.function.name.js");

require("core-js/modules/es.array.from.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transformCard = exports.findAllCombinations = exports.shuffle = exports.createDeck = exports.randomElement = void 0;

require("core-js/modules/es.object.entries.js");

require("core-js/modules/es.array.map.js");

require("core-js/modules/es.array.concat.js");

var _constants = require("../config/constants");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var randomElement = function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
};

exports.randomElement = randomElement;

var createDeck = function createDeck() {
  var deck = [];

  for (var _i = 0, _Object$entries = Object.entries(_constants.VALUES); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        number = _Object$entries$_i[0],
        numberValue = _Object$entries$_i[1];

    for (var _i2 = 0, _Object$entries2 = Object.entries(_constants.SUITES); _i2 < _Object$entries2.length; _i2++) {
      var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          suite = _Object$entries2$_i[0],
          suiteValue = _Object$entries2$_i[1];

      deck.push({
        number: numberValue,
        suite: suiteValue
      });
    }
  }

  return deck;
};

exports.createDeck = createDeck;

var shuffle = function shuffle(array) {
  var currentIndex = array.length,
      randomIndex; // While there remain elements to shuffle...

  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--; // And swap it with the current element.

    var _ref = [array[randomIndex], array[currentIndex]];
    array[currentIndex] = _ref[0];
    array[randomIndex] = _ref[1];
  }

  return array;
};

exports.shuffle = shuffle;

var findAllCombinations = function findAllCombinations(array, combinationLength, result, startingIndex, user) {
  if (combinationLength === 0) {
    user.allPossibleHands.push(result);
    return result;
  }

  for (var i = startingIndex; i < array.length && i - startingIndex <= _constants.TEXAS_HANDS; i += 1) {
    var innerResult = _toConsumableArray(result);

    innerResult.push(array[i]);
    findAllCombinations(array, combinationLength - 1, innerResult, i + 1, user);
  }
};

exports.findAllCombinations = findAllCombinations;

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

exports.transformCard = transformCard;