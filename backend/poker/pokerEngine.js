// Core Texas Hold'em Poker engine for CasinoLive39
// Handles deck, dealing, hand evaluation, and game state

class PokerDeck {
  constructor() {
    this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    this.ranks = [
      '2', '3', '4', '5', '6', '7', '8', '9', '10',
      'J', 'Q', 'K', 'A'
    ];
    this.reset();
  }

  reset() {
    this.cards = [];
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        this.cards.push({ suit, rank });
      }
    }
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(num) {
    return this.cards.splice(0, num);
  }
}

// Helper: create a new shuffled deck
function createDeck() {
  const deck = new PokerDeck();
  deck.shuffle();
  return deck;
}

// Helper: deal hands to players
function dealHands(deck, players, numCards) {
  const hands = {};
  for (const player of players) {
    hands[player.id] = deck.deal(numCards).map(card => `${card.rank}${card.suit[0].toUpperCase()}`);
  }
  return { hands, deck };
}

// Export the PokerDeck class for use in game logic
module.exports = {
  PokerDeck,
  createDeck,
  dealHands
};
