import React, { useState, useEffect } from 'react';
import './App.css';
import PokerLobby from './poker/PokerLobby';
import PokerTableSession from './poker/PokerTableSession';
import FarkleLobby from './farkle/FarkleLobby';
import FarkleTableSession from './farkle/FarkleTableSession';
import BlackjackLobby from './blackjack/BlackjackLobby';
import Header from './common/Header';
import Footer from './common/Footer';
import LoginPlaceholder from './LoginPlaceholder';
import BlackjackTable from './blackjack/BlackjackTable';

function StickyNav({ onMain, onDice, onPoker, onRoulette, onBlackjack }) {
  return (
    <div style={{position:'sticky',top:0,zIndex:1000,background:'#222',color:'#fff',display:'flex',justifyContent:'center',gap:'2rem',padding:'0.7rem 0',fontWeight:'bold',fontSize:'1.1rem',letterSpacing:'0.1em'}}>
      <span style={{cursor:'pointer'}} onClick={onMain}>MAIN LOBBY</span>
      <span style={{cursor:'pointer'}} onClick={onDice}>DICE LOBBY</span>
      <span style={{cursor:'pointer'}} onClick={onPoker}>POKER LOBBY</span>
      <span style={{cursor:'pointer'}} onClick={onRoulette}>ROULETTE LOBBY</span>
      <span style={{cursor:'pointer'}} onClick={onBlackjack}>BLACKJACK LOBBY</span>
    </div>
  );
}

function MainLobby({ onDiceClick, onPokerClick, onBlackjackClick }) {
  return (
    <div className="main-lobby">
      <h1>Main Lobby</h1>
      <p>Welcome to the Main Lobby! Multiplayer features coming soon.</p>
      <div className="lobby-games">
        <div className="game-card clickable" onClick={onPokerClick}>Poker Lobby</div>
        <div className="game-card clickable" onClick={onBlackjackClick}>Blackjack Lobby</div>
        <div className="game-card">Roulette Lobby (Coming Soon)</div>
        <div className="game-card clickable" onClick={onDiceClick}>Dice Lobby</div>
      </div>
    </div>
  );
}

function DiceLobby({ onBack, onFarkle, onMainLobby }) {
  return (
    <div className="dice-lobby">
      <h1>Dice Lobby</h1>
      <p>Select a dice game to play:</p>
      <div className="dice-games">
        <div className="dice-game-card clickable" onClick={onFarkle}>Ten Thousand (10,000)</div>
        <div className="dice-game-card">456</div>
        <div className="dice-game-card">Craps</div>
        <div className="dice-game-card">Lucky 9</div>
      </div>
      <button className="back-btn" onClick={onMainLobby}>Back to Main Lobby</button>
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showDiceLobby, setShowDiceLobby] = useState(false);
  const [showPokerLobby, setShowPokerLobby] = useState(false);
  const [showFarkleLobby, setShowFarkleLobby] = useState(false);
  const [showFarkleTable, setShowFarkleTable] = useState(false);
  const [showBlackjackLobby, setShowBlackjackLobby] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedFarkleTable, setSelectedFarkleTable] = useState(null);
  // #2 setPlayer: Will be used to store the current player's name or ID for multiplayer
  // const [player, setPlayer] = useState(''); // #2 (uncomment and use when ready)
  // #3 resultMessage: Will be used to display game results/messages to the user
  // const [resultMessage, setResultMessage] = useState(''); // #3 (uncomment and use when ready)
  // #4 handleRecordResult: Will be used to record the outcome of a blackjack game
  // const handleRecordResult = () => {}; // #4 (uncomment and implement when ready)

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

  const handleBlackjackClick = () => {
    setTransitionDirection('left');
    setTransitioning(true);
    setTimeout(() => {
      setShowBlackjackLobby(true);
      setShowPokerLobby(false);
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
      setShowBlackjackLobby(false);
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

  const handleBlackjackBack = () => {
    setTransitionDirection('up');
    setTransitioning(true);
    setTimeout(() => {
      setShowBlackjackLobby(false);
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

  const handleBet = (amount) => {
    if (!selectedTable) return;
    // POST to backend (implement endpoint later)
    fetch(`/api/tables/${selectedTable.id}/bet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    })
      .then(res => res.json())
      .then(data => {
        // Optionally update UI with bet info
      });
  };

  return (
    <div className={`App${transitioning ? ' transitioning' : ''} ${transitionDirection}`}>
      <StickyNav
        onMain={handleBack}
        onDice={() => { setShowDiceLobby(true); setShowPokerLobby(false); setShowFarkleLobby(false); setShowBlackjackLobby(false); }}
        onPoker={() => { setShowPokerLobby(true); setShowDiceLobby(false); setShowFarkleLobby(false); setShowBlackjackLobby(false); }}
        onRoulette={() => {}} // Placeholder
        onBlackjack={() => { setShowBlackjackLobby(true); setShowPokerLobby(false); setShowDiceLobby(false); setShowFarkleLobby(false); }}
      />
      <Header />
      <main style={{ minHeight: 'calc(100vh - 140px)' }}>
        {!loggedIn ? (
          <LoginPlaceholder onLogin={() => setLoggedIn(true)} />
        ) : showBlackjackLobby ? (
          selectedTable ? (
            <BlackjackTable onBack={handleBlackjackBack} />
          ) : (
            <BlackjackLobby onBack={handleBlackjackBack} />
          )
        ) : showFarkleLobby ? (
          showFarkleTable && selectedFarkleTable ? (
            <FarkleTableSession table={selectedFarkleTable} onBack={handleFarkleTableBack} />
          ) : (
            <FarkleLobby onStartTable={() => {}} onBack={handleFarkleBack} onJoinTable={handleFarkleTable} />
          )
        ) : showDiceLobby ? (
          <DiceLobby onBack={handleBack} onFarkle={handleFarkleClick} onMainLobby={handleBack} />
        ) : showPokerLobby ? (
          selectedTable ? (
            <PokerTableSession
              table={selectedTable}
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
          <MainLobby onDiceClick={handleDiceClick} onPokerClick={handlePokerClick} onBlackjackClick={handleBlackjackClick} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
