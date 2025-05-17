import React, { useState, useEffect } from 'react';
import './App.css';
import PokerLobby from './poker/PokerLobby';
import PokerTableSession from './poker/PokerTableSession';
import FarkleLobby from './farkle/FarkleLobby';
import FarkleTableSession from './farkle/FarkleTableSession';

function LoginPlaceholder({ onLogin }) {
  return (
    <div className="login-placeholder">
      <h2>Login</h2>
      <p>This is a placeholder for the login page.</p>
      <button onClick={onLogin}>Continue to Casino Lobby</button>
    </div>
  );
}

function CasinoLobby({ onDiceClick, onPokerClick }) {
  return (
    <div className="casino-lobby">
      <h1>Casino Live Game</h1>
      <p>Welcome to the Casino Lobby! Multiplayer features coming soon.</p>
      <div className="lobby-games">
        <div className="game-card clickable" onClick={onPokerClick}>Poker Table</div>
        <div className="game-card">Blackjack Table (Coming Soon)</div>
        <div className="game-card">Roulette Table (Coming Soon)</div>
        <div className="game-card clickable" onClick={onDiceClick}>Dice</div>
      </div>
    </div>
  );
}

function DiceLobby({ onBack, onFarkle }) {
  return (
    <div className="dice-lobby">
      <h1>Dice Games</h1>
      <p>Select a dice game to play:</p>
      <div className="dice-games">
        <div className="dice-game-card clickable" onClick={onFarkle}>Ten Thousand (10,000)</div>
        <div className="dice-game-card">456</div>
        <div className="dice-game-card">Craps</div>
        <div className="dice-game-card">Lucky 9</div>
      </div>
      <button className="back-btn" onClick={onBack}>Back to Lobby</button>
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showDiceLobby, setShowDiceLobby] = useState(false);
  const [showPokerLobby, setShowPokerLobby] = useState(false);
  const [showFarkleLobby, setShowFarkleLobby] = useState(false);
  const [showFarkleTable, setShowFarkleTable] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('');
  const [tables, setTables] = useState([]);
  const [player, setPlayer] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedFarkleTable, setSelectedFarkleTable] = useState(null);
  const [resultMessage, setResultMessage] = useState('');

  const handleDiceClick = () => {
    setTransitionDirection('down'); // Dice slides down
    setTransitioning(true);
    setTimeout(() => {
      setShowDiceLobby(true);
      setShowPokerLobby(false);
      setTransitioning(false);
    }, 700);
  };

  const handlePokerClick = () => {
    setTransitionDirection('left'); // Poker slides in from left
    setTransitioning(true);
    setTimeout(() => {
      setShowPokerLobby(true);
      setShowDiceLobby(false);
      setTransitioning(false);
    }, 700);
  };

  const handleFarkleClick = () => {
    setTransitionDirection('left');
    setTransitioning(true);
    setTimeout(() => {
      setShowFarkleLobby(true);
      setShowDiceLobby(false);
      setTransitioning(false);
    }, 700);
  };

  const handleBack = () => {
    setTransitionDirection('up'); // Back to lobby slides up
    setTransitioning(true);
    setTimeout(() => {
      setShowDiceLobby(false);
      setShowPokerLobby(false);
      setShowFarkleLobby(false);
      setTransitioning(false);
    }, 700);
  };

  const handlePokerBack = () => {
    setTransitionDirection('up');
    setTransitioning(true);
    setTimeout(() => {
      setShowPokerLobby(false);
      setTransitioning(false);
    }, 700);
  };

  const handleFarkleBack = () => {
    setTransitionDirection('up');
    setTransitioning(true);
    setTimeout(() => {
      setShowFarkleLobby(false);
      setTransitioning(false);
    }, 700);
  };

  const handleFarkleTable = (table) => {
    setSelectedFarkleTable(table);
    setShowFarkleTable(true);
  };

  const handleFarkleTableBack = () => {
    setShowFarkleTable(false);
    setSelectedFarkleTable(null);
  };

  useEffect(() => {
    if (showPokerLobby) {
      fetch('/api/tables')
        .then(res => res.json())
        .then(setTables);
    }
  }, [showPokerLobby]);

  const handleJoinTable = (table) => {
    setSelectedTable(table);
    setResultMessage('');
  };

  const handleCreateTable = () => {
    fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Table ${Math.floor(Math.random() * 900 + 100)}`,
        gameType: 'Texas Holdem',
        players: [],
      })
    })
      .then(res => res.json())
      .then(newTable => setTables(tables => [...tables, newTable]));
  };

  const handleRecordResult = () => {
    if (!player || !selectedTable) return;
    fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player, table: selectedTable.id, winner: player })
    })
      .then(res => res.json())
      .then(() => setResultMessage(`Result recorded: ${player} won table ${selectedTable.name}`));
  };

  const handleBet = (amount) => {
    if (!player || !selectedTable) return;
    // POST to backend (implement endpoint later)
    fetch(`/api/tables/${selectedTable.id}/bet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player, amount })
    })
      .then(res => res.json())
      .then(data => {
        // Optionally update UI with bet info
      });
  };

  return (
    <div className={`App${transitioning ? ' transitioning' : ''} ${transitionDirection}`}>
      {!loggedIn ? (
        <LoginPlaceholder onLogin={() => setLoggedIn(true)} />
      ) : showFarkleLobby ? (
        showFarkleTable && selectedFarkleTable ? (
          <FarkleTableSession table={selectedFarkleTable} onBack={handleFarkleTableBack} />
        ) : (
          <FarkleLobby onStartTable={() => {}} onBack={handleFarkleBack} onJoinTable={handleFarkleTable} />
        )
      ) : showDiceLobby ? (
        <DiceLobby onBack={handleBack} onFarkle={handleFarkleClick} />
      ) : showPokerLobby ? (
        selectedTable ? (
          <PokerTableSession
            table={selectedTable}
            player={player}
            onBack={() => setSelectedTable(null)}
            onBet={handleBet}
            bets={{}}
            cardsDealt={null}
            setCardsDealt={() => {}}
          />
        ) : (
          <PokerLobby tables={tables} onJoinTable={handleJoinTable} onCreateTable={handleCreateTable} onBack={handlePokerBack} />
        )
      ) : (
        <CasinoLobby onDiceClick={handleDiceClick} onPokerClick={handlePokerClick} />
      )}
    </div>
  );
}

export default App;
