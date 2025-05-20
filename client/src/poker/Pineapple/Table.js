import React, { useState } from 'react';
import './Table.css';

// Helper to generate a shuffled deck
function getShuffledDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
  let deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function PineappleTable({ onBack }) {
  const [stage, setStage] = useState('betting'); // 'betting', 'dealt', 'result'
  const [deck, setDeck] = useState(getShuffledDeck());
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [ante, setAnte] = useState(0);
  const [pairPlus, setPairPlus] = useState(0);
  const [playBet, setPlayBet] = useState(0);
  const [folded, setFolded] = useState(false);
  const [result, setResult] = useState(null);

  // Deal cards
  const dealCards = () => {
    const newDeck = [...deck];
    const player = [newDeck.pop(), newDeck.pop(), newDeck.pop()];
    const dealer = [newDeck.pop(), newDeck.pop(), newDeck.pop()];
    setPlayerCards(player);
    setDealerCards(dealer);
    setDeck(newDeck);
    setStage('dealt');
    setFolded(false);
    setResult(null);
  };

  // Handle bets
  const handleBet = (type, value) => {
    if (type === 'ante') setAnte(value);
    if (type === 'pairPlus') setPairPlus(value);
  };

  // Fold
  const handleFold = () => {
    setFolded(true);
    setStage('result');
    setResult('You folded. Ante lost.');
  };

  // Play bet
  const handlePlay = () => {
    setPlayBet(ante);
    setStage('result');
    // Evaluate hands
    const dealerQualifies = dealerCards.length && handValue(dealerCards).highCard >= 12; // Q or higher
    const playerHand = handValue(playerCards);
    const dealerHand = handValue(dealerCards);
    let outcome = '';
    if (!dealerQualifies) {
      outcome = 'Dealer does not qualify. Ante pays 1:1, Play bet returned.';
    } else if (playerHand.rank > dealerHand.rank || (playerHand.rank === dealerHand.rank && playerHand.highCard > dealerHand.highCard)) {
      outcome = 'You win! Ante and Play pay 1:1.';
    } else if (playerHand.rank === dealerHand.rank && playerHand.highCard === dealerHand.highCard) {
      outcome = 'Push. Bets returned.';
    } else {
      outcome = 'Dealer wins. You lose Ante and Play.';
    }
    setResult(outcome);
  };

  // Hand evaluation helper
  function handValue(cards) {
    // Returns {rank, highCard} for comparison
    // rank: 5=Straight Flush, 4=Trips, 3=Straight, 2=Flush, 1=Pair, 0=High Card
    // highCard: 14=Ace, 13=K, ...
    const values = cards.map(c => 'A,K,Q,J,10,9,8,7,6,5,4,3,2'.split(',').indexOf(c.rank) + 2).sort((a,b) => b-a);
    const suits = cards.map(c => c.suit);
    const isFlush = suits.every(s => s === suits[0]);
    const isStraight = values[0] - values[2] === 2 && new Set(values).size === 3;
    const isTrips = new Set(values).size === 1;
    const isPair = new Set(values).size === 2;
    if (isFlush && isStraight) return { rank: 5, highCard: values[0] };
    if (isTrips) return { rank: 4, highCard: values[0] };
    if (isStraight) return { rank: 3, highCard: values[0] };
    if (isFlush) return { rank: 2, highCard: values[0] };
    if (isPair) return { rank: 1, highCard: values[0] };
    return { rank: 0, highCard: values[0] };
  }

  // Reset table
  const handleReset = () => {
    setStage('betting');
    setAnte(0);
    setPairPlus(0);
    setPlayBet(0);
    setPlayerCards([]);
    setDealerCards([]);
    setFolded(false);
    setResult(null);
    setDeck(getShuffledDeck());
  };

  return (
    <div className="pineapple-table">
      <h2>Three Card Poker Table</h2>
      <button onClick={onBack} className="back-btn">Back to Lobby</button>
      {stage === 'betting' && (
        <div className="betting-controls">
          <div>
            <label>Ante Bet: </label>
            <input type="number" min="0" value={ante} onChange={e => handleBet('ante', Number(e.target.value))} />
          </div>
          <div>
            <label>Pair Plus Bet: </label>
            <input type="number" min="0" value={pairPlus} onChange={e => handleBet('pairPlus', Number(e.target.value))} />
          </div>
          <button disabled={ante <= 0} onClick={dealCards}>Deal Cards</button>
        </div>
      )}
      {stage === 'dealt' && (
        <div className="dealt-stage">
          <div className="cards-row">
            <div>
              <h3>Your Hand</h3>
              <div className="card-row">
                {playerCards.map((card, i) => (
                  <span key={i} className="card">{card.rank}{card.suit}</span>
                ))}
              </div>
            </div>
            <div>
              <h3>Dealer Hand</h3>
              <div className="card-row">
                {dealerCards.map((card, i) => (
                  <span key={i} className="card back">🂠</span>
                ))}
              </div>
            </div>
          </div>
          <div className="action-row">
            <button onClick={handleFold}>Fold</button>
            <button onClick={handlePlay}>Play</button>
          </div>
        </div>
      )}
      {stage === 'result' && (
        <div className="result-stage">
          <div className="cards-row">
            <div>
              <h3>Your Hand</h3>
              <div className="card-row">
                {playerCards.map((card, i) => (
                  <span key={i} className="card">{card.rank}{card.suit}</span>
                ))}
              </div>
            </div>
            <div>
              <h3>Dealer Hand</h3>
              <div className="card-row">
                {dealerCards.map((card, i) => (
                  <span key={i} className="card">{card.rank}{card.suit}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="result-message">{result}</div>
          <button onClick={handleReset}>Play Again</button>
        </div>
      )}
      <div className="rules-section">
        <h4>Hand Rankings</h4>
        <ul>
          <li>Straight Flush: 5:1</li>
          <li>Three of a Kind: 4:1</li>
          <li>Straight: 3:1</li>
          <li>Flush: 2:1</li>
          <li>Pair: 1:1</li>
        </ul>
      </div>
    </div>
  );
}

export default PineappleTable;
