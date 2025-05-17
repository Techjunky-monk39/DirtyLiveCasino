import React, { useEffect, useState } from 'react';
import './PokerTableSession.css';
import Dealer from '../common/Dealer';
import '../common/Dealer.css';

const BET_STEPS = [
  0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,
  2,3,4,5,10,20,30,40,50,60,70,80,90,100
];

// Helper to create and shuffle a deck
function createDeck() {
  const suits = ['♠', '♥', '♣', '♦'];
  const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  const deck = [];
  for (const suit of suits) for (const rank of ranks) deck.push({ rank, suit });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Simple hand evaluator: highest card wins (for demo)
const rankOrder = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
function getBestCard(hand) {
  return hand.reduce((best, card) => {
    return rankOrder.indexOf(card.rank) > rankOrder.indexOf(best.rank) ? card : best;
  }, hand[0]);
}
function compareHands(playerHand, dealerHand, community) {
  const playerBest = getBestCard([...playerHand, ...community]);
  const dealerBest = getBestCard([...dealerHand, ...community]);
  const playerScore = rankOrder.indexOf(playerBest.rank);
  const dealerScore = rankOrder.indexOf(dealerBest.rank);
  if (playerScore > dealerScore) return 'win';
  if (playerScore < dealerScore) return 'lose';
  return 'tie';
}

// Confetti component (CSS only, shoots up from bottom)
function Confetti() {
  return (
    <div className="confetti-container">
      {[...Array(24)].map((_,i) => (
        <div key={i} className={`confetti confetti-${i%6}`}/>
      ))}
    </div>
  );
}

function PokerTableSession({ table, player, onBack, onBet, bets }) {
  const [betAmount, setBetAmount] = useState(0.1);
  const [betting, setBetting] = useState(false);
  const [showDealButton, setShowDealButton] = useState(true);
  const [dealing, setDealing] = useState(false);
  const [gameState, setGameState] = useState(null); // { playerHand, dealerHand, community }
  const [result, setResult] = useState(null); // 'win' | 'lose' | 'tie'
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowDealButton(true);
    setDealing(false);
    setGameState(null);
    setResult(null);
    setShowConfetti(false);
  }, [table]);

  const handleBet = () => {
    setBetting(true);
    onBet(betAmount);
    setTimeout(() => setBetting(false), 500);
  };

  const handleDeal = () => {
    setShowDealButton(false);
    setDealing(true);
    setResult(null);
    setShowConfetti(false);
    // Mock Texas Hold'em: 2 cards each, 5 community
    const deck = createDeck();
    const playerHand = [deck.pop(), deck.pop()];
    const dealerHand = [deck.pop(), deck.pop()];
    deck.pop();
    const flop = [deck.pop(), deck.pop(), deck.pop()];
    deck.pop();
    const turn = [deck.pop()];
    deck.pop();
    const river = [deck.pop()];
    const community = [...flop, ...turn, ...river];
    setTimeout(() => {
      setGameState({ playerHand, dealerHand, community });
      // Evaluate winner
      const outcome = compareHands(playerHand, dealerHand, community);
      setResult(outcome);
      if (outcome === 'win') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
      }
      setDealing(false);
    }, 900);
  };

  const handleDealAgain = () => {
    setGameState(null);
    setShowDealButton(false);
    setDealing(true);
    setResult(null);
    setShowConfetti(false);
    // Shuffle and deal a new round
    const deck = createDeck();
    const playerHand = [deck.pop(), deck.pop()];
    const dealerHand = [deck.pop(), deck.pop()];
    deck.pop();
    const flop = [deck.pop(), deck.pop(), deck.pop()];
    deck.pop();
    const turn = [deck.pop()];
    deck.pop();
    const river = [deck.pop()];
    const community = [...flop, ...turn, ...river];
    setTimeout(() => {
      setGameState({ playerHand, dealerHand, community });
      // Evaluate winner
      const outcome = compareHands(playerHand, dealerHand, community);
      setResult(outcome);
      if (outcome === 'win') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
      }
      setDealing(false);
    }, 900);
  };

  return (
    <div className="poker-table-session">
      {showConfetti && <Confetti />}
      <div className="poker-table-visual">
        <div className="wood-edge" />
        <div className="felt">
          {/* Player seat */}
          <div className="player-seat seat-1">
            <div className="player-label">{player || 'You'}</div>
            {gameState && (
              <div className="hand">
                {gameState.playerHand.map((card, i) => (
                  <span key={i} className="card">{card.rank}{card.suit}</span>
                ))}
              </div>
            )}
          </div>
          {/* Dealer seat (opposite side) */}
          <div className="player-seat seat-4">
            <div className="player-label">Dealer</div>
            {gameState && (
              <div className="hand">
                {gameState.dealerHand.map((card, i) => (
                  <span key={i} className="card">{card.rank}{card.suit}</span>
                ))}
              </div>
            )}
          </div>
          {/* Community cards in the center */}
          <div style={{position:'absolute',left:'50%',top:'48%',transform:'translate(-50%,-50%)',zIndex:5}}>
            {gameState && (
              <div className="hand">
                {gameState.community.map((card, i) => (
                  <span key={i} className="card">{card.rank}{card.suit}</span>
                ))}
              </div>
            )}
          </div>
          {/* Dealer cartoon in the center */}
          <div className="dealer-center">
            <Dealer
              gameType="texas_holdem"
              tableId={table.id}
              armPosition={dealing ? 'deal' : 'rest'}
              onDeal={showDealButton ? handleDeal : undefined}
            />
            {showDealButton && (
              <button className="deal-btn" onClick={handleDeal} title="Deal Cards">
                <span role="img" aria-label="deal">🂠</span> Deal
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Win/Loss Notification */}
      {result && (
        <div className={`winloss-banner ${result}`}>{
          result === 'win' ? 'You win! 🎉' : result === 'lose' ? 'Dealer wins!' : "It's a tie!"
        }</div>
      )}
      <div className="bet-controls">
        <span>Bet Amount: </span>
        <select value={betAmount} onChange={e => setBetAmount(Number(e.target.value))}>
          {BET_STEPS.map(v => (
            <option key={v} value={v}>{v < 1 ? `$${v.toFixed(2)}` : `$${v}`}</option>
          ))}
        </select>
        <button onClick={handleBet} disabled={betting}>Place Bet</button>
        {gameState && !dealing && (
          <button onClick={handleDealAgain} style={{marginLeft:'1.5rem'}}>Deal Again</button>
        )}
      </div>
      <button className="back-btn" onClick={onBack}>Back to Poker Lobby</button>
    </div>
  );
}

export default PokerTableSession;
