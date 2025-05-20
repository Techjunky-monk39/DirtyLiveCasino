import React, { useState } from 'react';
import '../Pineapple/Table.css';

function getShuffledDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
  let deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function TexasHoldemTable({ onBack }) {
  const [stage, setStage] = useState('preflop'); // preflop, flop, turn, river, showdown
  const [deck, setDeck] = useState(getShuffledDeck());
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);
  const [pot, setPot] = useState(0);
  const [bet, setBet] = useState(0);
  const [message, setMessage] = useState('');

  // Deal initial hands
  const dealPreflop = () => {
    const newDeck = [...deck];
    const player = [newDeck.pop(), newDeck.pop()];
    const dealer = [newDeck.pop(), newDeck.pop()];
    setPlayerCards(player);
    setDealerCards(dealer);
    setDeck(newDeck);
    setStage('flop');
    setMessage('Flop: Place your bet and reveal the first 3 community cards.');
  };

  // Reveal flop
  const dealFlop = () => {
    const newDeck = [...deck];
    const flop = [newDeck.pop(), newDeck.pop(), newDeck.pop()];
    setCommunityCards(flop);
    setDeck(newDeck);
    setStage('turn');
    setMessage('Turn: Place your bet and reveal the 4th community card.');
  };

  // Reveal turn
  const dealTurn = () => {
    const newDeck = [...deck];
    const turn = newDeck.pop();
    setCommunityCards([...communityCards, turn]);
    setDeck(newDeck);
    setStage('river');
    setMessage('River: Place your bet and reveal the 5th community card.');
  };

  // Reveal river
  const dealRiver = () => {
    const newDeck = [...deck];
    const river = newDeck.pop();
    setCommunityCards([...communityCards, river]);
    setDeck(newDeck);
    setStage('showdown');
    setMessage('Showdown: Reveal hands and determine the winner.');
  };

  // Simple bet handler
  const handleBet = (amount) => {
    setBet(amount);
    setPot(pot + amount);
  };

  // Showdown logic (placeholder)
  const handleShowdown = () => {
    setMessage('Showdown! (Hand evaluation logic to be implemented)');
  };

  // Reset table
  const handleReset = () => {
    setStage('preflop');
    setDeck(getShuffledDeck());
    setPlayerCards([]);
    setDealerCards([]);
    setCommunityCards([]);
    setPot(0);
    setBet(0);
    setMessage('');
  };

  return (
    <div className="pineapple-table">
      <h2>Texas Hold'em Table</h2>
      <button onClick={onBack} className="back-btn">Back to Lobby</button>
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
            {stage === 'showdown'
              ? dealerCards.map((card, i) => (
                  <span key={i} className="card">{card.rank}{card.suit}</span>
                ))
              : dealerCards.map((_, i) => (
                  <span key={i} className="card back">🂠</span>
                ))}
          </div>
        </div>
      </div>
      <div className="community-cards">
        <h3>Community Cards</h3>
        <div className="card-row">
          {communityCards.map((card, i) => (
            <span key={i} className="card">{card.rank}{card.suit}</span>
          ))}
        </div>
      </div>
      <div className="betting-controls">
        <div>Pot: ${pot}</div>
        <div>
          <label>Bet: </label>
          <input type="number" min="0" value={bet} onChange={e => handleBet(Number(e.target.value))} />
        </div>
      </div>
      <div className="action-row">
        {stage === 'preflop' && <button onClick={dealPreflop}>Deal Preflop</button>}
        {stage === 'flop' && <button onClick={dealFlop}>Deal Flop</button>}
        {stage === 'turn' && <button onClick={dealTurn}>Deal Turn</button>}
        {stage === 'river' && <button onClick={dealRiver}>Deal River</button>}
        {stage === 'showdown' && <button onClick={handleShowdown}>Showdown</button>}
        <button onClick={handleReset}>Reset Table</button>
      </div>
      <div className="result-message">{message}</div>
      <div className="rules-section">
        <h4>Texas Hold'em Flow</h4>
        <ul>
          <li>Preflop: Deal 2 cards to each player</li>
          <li>Flop: Reveal 3 community cards</li>
          <li>Turn: Reveal 4th community card</li>
          <li>River: Reveal 5th community card</li>
          <li>Showdown: Reveal hands and determine winner</li>
        </ul>
      </div>
    </div>
  );
}

export default TexasHoldemTable;
