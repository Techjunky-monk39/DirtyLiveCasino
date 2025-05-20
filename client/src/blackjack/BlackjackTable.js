import React, { useState } from 'react';
import Card from '../common/Card';
import './BlackjackTable.css';

function BlackjackTable({ onBack }) {
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [message, setMessage] = useState('');
  const [gameActive, setGameActive] = useState(false);
  const [playerStands, setPlayerStands] = useState(false);
  const [bet, setBet] = useState(0.1);
  const [account, setAccount] = useState(100.0); // Example starting balance

  // Helper to calculate hand value
  function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;
    for (let card of hand) {
      if (['J', 'Q', 'K'].includes(card.rank)) value += 10;
      else if (card.rank === 'A') {
        value += 11;
        aces += 1;
      } else value += Number(card.rank); // Ensure rank is treated as a number
    }
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
    return value;
  }

  // Start a new game
  async function startGame() {
    const res = await fetch('/api/blackjack/deal', { method: 'POST' });
    const data = await res.json();
    setPlayerHand(data.player);
    setDealerHand(data.dealer);
    setMessage('Game started!');
    setGameActive(true);
    setPlayerStands(false);
  }

  // Player hits
  async function hit() {
    const res = await fetch('/api/blackjack/hit', { method: 'POST' });
    const data = await res.json();
    setPlayerHand(data.player);
    setMessage(data.message);
    if (data.bust) {
      setGameActive(false);
      setMessage('Bust! Dealer wins.');
    }
  }

  // Player stands
  async function stand() {
    const res = await fetch('/api/blackjack/stand', { method: 'POST' });
    const data = await res.json();
    setDealerHand(data.dealer);
    setMessage(data.message);
    setGameActive(false);
    setPlayerStands(true);
  }

  // Player doubles
  async function double() {
    if (account < bet * 2) return;
    setBet(bet * 2);
    setAccount(account - bet); // Deduct extra bet
    // Optionally, call backend for double logic
    await hit();
    setPlayerStands(true); // Player stands after double
    setGameActive(false); // End round, dealer reveals hand
  }

  // Bet controls
  const minBet = 0.1;
  const maxBet = 10.0;
  const betStep = 0.1;
  const canDouble = gameActive && playerHand.length === 2 && account >= bet; // Only allow double on first move

  function increaseBet() {
    setBet(b => Math.min(maxBet, Math.round((b + betStep) * 100) / 100));
  }
  function decreaseBet() {
    setBet(b => Math.max(minBet, Math.round((b - betStep) * 100) / 100));
  }

  return (
    <div className="blackjack-table" style={{position:'relative', paddingTop:'2.5rem'}}>
      {/* Account Info (top right) */}
      <div style={{position:'absolute',top:10,right:20,display:'flex',flexDirection:'column',alignItems:'flex-end',zIndex:2}}>
        <div style={{fontWeight:'bold',color:'#222',background:'#e0e0e0',padding:'0.3rem 1rem',borderRadius:'8px'}}>Account: <span style={{color:'#1565c0'}}>${account.toFixed(2)}</span></div>
      </div>
      <button className="back-btn" onClick={onBack} style={{marginBottom:'1rem'}}>Back to Blackjack Lobby</button>
      <h2>Blackjack Table</h2>
      <div className="blackjack-hands">
        <div>
          <h3>Dealer</h3>
          <div>
            {dealerHand.map((card, i) => (
              <Card
                key={i}
                rank={card.rank}
                suit={card.suit}
                faceDown={i === 1 && gameActive && !playerStands}
              />
            ))}
          </div>
          <div>
            Value: {playerStands || !gameActive ? calculateHandValue(dealerHand) : (dealerHand.length > 0 ? calculateHandValue([dealerHand[0]]) + ' + ?' : '?')}
          </div>
        </div>
        <div>
          <h3>Player</h3>
          <div>{playerHand.map((card, i) => <Card key={i} rank={card.rank} suit={card.suit} />)}</div>
          <div>Value: {calculateHandValue(playerHand)}</div>
        </div>
      </div>
      <div className="blackjack-controls" style={{display:'flex',justifyContent:'center',gap:'2.5rem',marginTop:'2.5rem',alignItems:'center'}}>
        {/* X2/Double button */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
          <button style={{background:'#d32f2f',color:'#fff',fontWeight:'bold',borderRadius:'8px',padding:'0.7rem 1.5rem',fontSize:'1.1rem',marginBottom:'0.5rem'}} onClick={canDouble ? double : undefined} disabled={!canDouble}>Double</button>
          <span style={{color:'#d32f2f',fontWeight:'bold'}}>X2</span>
        </div>
        {/* Hit/Stand and Bet controls */}
        <div style={{display:'flex',flexDirection:'row',alignItems:'center',gap:'1.2rem'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem'}}>
            <button onClick={hit} disabled={!gameActive}>Hit</button>
            <button onClick={stand} disabled={!gameActive}>Stand</button>
          </div>
          {/* Bet controls next to Hit button */}
          <div style={{display:'flex',alignItems:'center',background:'#fff',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.08)',padding:'0.4rem 1.1rem',marginLeft:'0.7rem',gap:'0.5rem',minWidth:'120px'}}>
            <span style={{fontWeight:'bold',color:'#222'}}>Bet</span>
            <button onClick={decreaseBet} disabled={gameActive || bet <= minBet} style={{fontSize:'1.2rem',padding:'0.2rem 0.7rem',background:'#f5f5f5',color:'#222',border:'none',borderRadius:'5px',fontWeight:'bold'}}>–</button>
            <span style={{fontWeight:'bold',fontSize:'1.1rem',color:'#222',minWidth:'52px',textAlign:'center'}}>${bet.toFixed(2)}</span>
            <button onClick={increaseBet} disabled={gameActive || bet >= maxBet || bet+betStep>account} style={{fontSize:'1.2rem',padding:'0.2rem 0.7rem',background:'#f5f5f5',color:'#222',border:'none',borderRadius:'5px',fontWeight:'bold'}}>+</button>
          </div>
        </div>
        {/* New Game button in NEW box */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
          <button style={{background:'#e53935',color:'#fff',fontWeight:'bold',borderRadius:'8px',padding:'0.7rem 1.5rem',fontSize:'1.1rem',marginBottom:'0.5rem'}} onClick={startGame} disabled={gameActive}>Deal</button>
          <span style={{color:'#e53935',fontWeight:'bold'}}>DEAL</span>
        </div>
      </div>
      <div className="blackjack-message">{message}</div>
    </div>
  );
}

export default BlackjackTable;
