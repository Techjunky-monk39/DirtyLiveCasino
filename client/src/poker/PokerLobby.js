import React, { useState } from 'react';
import './PokerLobby.css';
import PineappleLobby from './Pineapple/Pineapple_Lobby';
import TexasLobby from './TexasHoldem/Texas_Lobby';

function PokerLobby({ onBack }) {
  const [selectedLobby, setSelectedLobby] = useState(null);

  if (selectedLobby === 'texas') {
    return <TexasLobby onBack={() => setSelectedLobby(null)} />;
  }
  if (selectedLobby === 'pineapple') {
    return <PineappleLobby onBack={() => setSelectedLobby(null)} />;
  }

  return (
    <div className="poker-lobby">
      <h1>Poker Lobby</h1>
      <div className="lobby-options">
        <div className="lobby-option-card" onClick={() => setSelectedLobby('texas')}>
          <h2>Texas Hold'em</h2>
          <p>Play classic Texas Hold'em Poker.</p>
        </div>
        <div className="lobby-option-card" onClick={() => setSelectedLobby('pineapple')}>
          <h2>Three Card Poker (Pineapple)</h2>
          <p>Try your luck at fast-paced Three Card Poker.</p>
        </div>
      </div>
      <button className="back-btn" onClick={onBack} style={{ marginTop: '2rem' }}>Back to Main Lobby</button>
    </div>
  );
}

export default PokerLobby;