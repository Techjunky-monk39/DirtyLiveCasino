// BlackjackShoe.js - Models a casino-style Blackjack shoe with multiple decks, cut card, and discard pile

class BlackjackShoe {
  constructor(numDecks = 6, penetration = 0.75) {
    this.numDecks = numDecks;
    this.penetration = penetration; // e.g., 0.75 means cut card at 75% of the way through
    this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    this.ranks = [
      '2', '3', '4', '5', '6', '7', '8', '9', '10',
      'J', 'Q', 'K', 'A'
    ];
    this.initializeShoe();
  }

  initializeShoe() {
    // Create combined decks
    this.shoe = [];
    for (let d = 0; d < this.numDecks; d++) {
      for (const suit of this.suits) {
        for (const rank of this.ranks) {
          this.shoe.push({ suit, rank });
        }
      }
    }
    this.shuffle(this.shoe);
    this.discardPile = [];
    // Place cut card
    this.cutCardPosition = Math.floor(this.shoe.length * this.penetration);
    this.reshuffleNeeded = false;
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  dealCard() {
    if (this.shoe.length === 0) throw new Error('Shoe is empty!');
    // Check if cut card is reached
    if (this.shoe.length === this.shoe.length - this.cutCardPosition) {
      this.reshuffleNeeded = true;
    }
    return this.shoe.shift();
  }

  discard(cards) {
    if (Array.isArray(cards)) {
      this.discardPile.push(...cards);
    } else {
      this.discardPile.push(cards);
    }
  }

  shouldReshuffle() {
    // If the cut card is exposed (i.e., next card to be dealt is at or past cut position)
    return this.shoe.length <= (this.shoe.length - this.cutCardPosition) || this.reshuffleNeeded;
  }

  reshuffleShoe() {
    // Combine shoe and discard pile, shuffle, and re-insert cut card
    this.shoe = this.shoe.concat(this.discardPile);
    this.shuffle(this.shoe);
    this.discardPile = [];
    this.cutCardPosition = Math.floor(this.shoe.length * this.penetration);
    this.reshuffleNeeded = false;
  }

  getShoeSize() {
    return this.shoe.length;
  }

  getDiscardSize() {
    return this.discardPile.length;
  }
}

module.exports = { BlackjackShoe };
