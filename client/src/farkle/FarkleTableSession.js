import React, { useState } from 'react';
import './FarkleTableSession.css';

function FarkleTableSession({ table, onBack }) {
  const [players, setPlayers] = useState(
    table && table.players && table.players.length > 0
      ? table.players
      : [
          { name: 'Player 1', score: 0 },
          { name: 'Player 2', score: 0 }
        ]
  );
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [dice, setDice] = useState([]);
  const [setAside, setSetAside] = useState([]);
  const [turnScore, setTurnScore] = useState(0);
  const [message, setMessage] = useState('');
  const [canRoll, setCanRoll] = useState(true);
  const [farkle, setFarkle] = useState(false);
  const [winner, setWinner] = useState(table && table.winner ? table.winner : null);
  const [hasHotDice, setHasHotDice] = useState(false);
  const [hasGotOnBoard, setHasGotOnBoard] = useState(players.map(() => false));
  const [canStay, setCanStay] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [playerCount, setPlayerCount] = useState(2);

  // Save scores and winner to localStorage for this table
  function saveTableResult(winnerName) {
    const tables = JSON.parse(localStorage.getItem('farkleTables') || '[]');
    const idx = tables.findIndex(t => t.id === table.id);
    if (idx !== -1) {
      tables[idx].winner = winnerName;
      tables[idx].scores = players;
      localStorage.setItem('farkleTables', JSON.stringify(tables));
    }
  }

  // Backend-driven roll
  async function handleRoll() {
    if (!canRoll || winner) return;
    const res = await fetch('/api/farkle/roll', { method: 'POST' });
    const data = await res.json();
    setDice(data.dice);
    setSetAside([]);
    setSelectedIndices([]);
    setTurnScore(data.turnScore);
    setFarkle(!!data.farkle);
    setHasHotDice(!!data.hotDice);
    setMessage(data.farkle ? 'Farkle! No scoring dice. Turn ends.' : (data.hotDice ? 'Hot Dice! You may roll all 6 dice again.' : 'Select scoring dice to set aside.'));
    setCanRoll(!data.farkle);
    setCanStay(false);
  }

  // Toggle selection of a die
  function toggleSelectDie(idx) {
    if (!canRoll || winner) return;
    setSelectedIndices(selectedIndices =>
      selectedIndices.includes(idx)
        ? selectedIndices.filter(i => i !== idx)
        : [...selectedIndices, idx]
    );
  }

  // Backend-driven set aside for selected dice
  async function handleSetAside() {
    if (!canRoll || winner || selectedIndices.length === 0) return;
    const res = await fetch('/api/farkle/setAside', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ indices: selectedIndices })
    });
    const data = await res.json();
    if (!data.success) {
      setMessage(data.error || 'Invalid set-aside selection.');
      return;
    }
    setDice(data.dice);
    setSetAside([...setAside, ...selectedIndices.map(i => dice[i])]);
    setSelectedIndices([]);
    setTurnScore(data.turnScore);
    setHasHotDice(!!data.hotDice);
    // Show breakdown summary if available
    if (data.breakdown && Array.isArray(data.breakdown)) {
      const summary = data.breakdown.map(group => {
        let label = group.type;
        if (group.type === 'triplet') label = `Triplet (${group.value})`;
        if (group.type === 'fourOfAKind') label = `Four of a Kind (${group.value})`;
        if (group.type === 'fiveOfAKind') label = `Five of a Kind (${group.value})`;
        if (group.type === 'sixOfAKind') label = `Six of a Kind (${group.value})`;
        if (group.type === 'single') label = `Single ${group.value}`;
        if (group.type === 'threePairs') label = 'Three Pairs';
        if (group.type === 'twoTriplets') label = 'Two Triplets';
        if (group.type === 'straight') label = 'Straight';
        return `${label}: ${group.dice ? group.dice.join(',') : ''}`;
      }).join(' | ');
      setMessage((data.hotDice ? 'Hot Dice! ' : '') + 'Set aside: ' + summary);
    } else {
      setMessage(data.hotDice ? 'Hot Dice! You may roll all 6 dice again.' : 'Die set aside. Roll again, stay, or bank points.');
    }
    setCanStay(data.dice.length <= 2 && !data.hotDice);
    setCanRoll(true);
  }

  function handleStay() {
    if (dice.length > 2) {
      setMessage('You can only stay with two dice or less.');
      return;
    }
    const playerIdx = currentPlayer;
    const gotOnBoard = hasGotOnBoard[playerIdx];
    const minScore = gotOnBoard ? 750 : 1000;
    if (turnScore < minScore) {
      setMessage(`You must score at least ${minScore} to stay.`);
      return;
    }
    const updatedPlayers = players.map((p, i) =>
      i === currentPlayer ? { ...p, score: p.score + turnScore } : p
    );
    setPlayers(updatedPlayers);
    setMessage(`${players[currentPlayer].name} stayed and banked ${turnScore} points!`);
    setCanRoll(false);
    setCanStay(false);
    if (!gotOnBoard && turnScore >= 1000) {
      const newGotOnBoard = [...hasGotOnBoard];
      newGotOnBoard[playerIdx] = true;
      setHasGotOnBoard(newGotOnBoard);
    }
    if (updatedPlayers[currentPlayer].score >= 10000) {
      setWinner(updatedPlayers[currentPlayer].name);
      saveTableResult(updatedPlayers[currentPlayer].name);
    }
  }

  function handleBank() {
    const playerIdx = currentPlayer;
    const gotOnBoard = hasGotOnBoard[playerIdx];
    const minScore = gotOnBoard ? 750 : 1000;
    if (turnScore < minScore) {
      setMessage(`You must score at least ${minScore} to bank points.`);
      return;
    }
    const updatedPlayers = players.map((p, i) =>
      i === currentPlayer ? { ...p, score: p.score + turnScore } : p
    );
    setPlayers(updatedPlayers);
    setMessage(`${players[currentPlayer].name} banked ${turnScore} points!`);
    setCanRoll(false);
    setCanStay(false);
    if (!gotOnBoard && turnScore >= 1000) {
      const newGotOnBoard = [...hasGotOnBoard];
      newGotOnBoard[playerIdx] = true;
      setHasGotOnBoard(newGotOnBoard);
    }
    if (updatedPlayers[currentPlayer].score >= 10000) {
      setWinner(updatedPlayers[currentPlayer].name);
      saveTableResult(updatedPlayers[currentPlayer].name);
    }
  }

  async function handleNextPlayer() {
    setDice([]);
    setSetAside([]);
    setTurnScore(0);
    setMessage('');
    setCanRoll(true);
    setFarkle(false);
    setHasHotDice(false);
    setCanStay(false);
    setSelectedIndices([]);
    const nextPlayer = (currentPlayer + 1) % players.length;
    setCurrentPlayer(nextPlayer);
    // Roll all six dice for the new player
    const res = await fetch('/api/farkle/roll', { method: 'POST' });
    const data = await res.json();
    setDice(data.dice);
    setTurnScore(data.turnScore || 0);
    setFarkle(!!data.farkle);
    setHasHotDice(!!data.hotDice);
    setMessage('New turn! Select scoring dice to set aside.');
    setCanRoll(!data.farkle);
    setCanStay(false);
  }

  async function handleNewGame() {
    const resetPlayers = players.map(p => ({ ...p, score: 0 }));
    setPlayers(resetPlayers);
    setCurrentPlayer(0);
    setSetAside([]);
    setTurnScore(0);
    setMessage('');
    setCanRoll(true);
    setFarkle(false);
    setWinner(null);
    setHasHotDice(false);
    setCanStay(false);
    setHasGotOnBoard(players.map(() => false));
    setSelectedIndices([]);
    setDice([]);
    await fetch('/api/farkle/newGame', { method: 'POST' });
    const tables = JSON.parse(localStorage.getItem('farkleTables') || '[]');
    const idx = tables.findIndex(t => t.id === table.id);
    if (idx !== -1) {
      tables[idx].winner = null;
      tables[idx].scores = resetPlayers;
      localStorage.setItem('farkleTables', JSON.stringify(tables));
    }
  }

  // Add this function above the return statement
  function handleAddPlayers() {
    const newPlayers = Array.from({ length: playerCount }, (_, i) => ({ name: `Player ${i + 1}`, score: 0 }));
    setPlayers(newPlayers);
    setHasGotOnBoard(Array(playerCount).fill(false));
    setCurrentPlayer(0);
    setSetAside([]);
    setTurnScore(0);
    setMessage('');
    setCanRoll(true);
    setFarkle(false);
    setHasHotDice(false);
    setCanStay(false);
    setSelectedIndices([]);
    setWinner(null);
    setDice([]);
    // Optionally persist to localStorage
    if (table && table.id) {
      const tables = JSON.parse(localStorage.getItem('farkleTables') || '[]');
      const idx = tables.findIndex(t => t.id === table.id);
      if (idx !== -1) {
        tables[idx].players = newPlayers;
        tables[idx].scores = newPlayers;
        tables[idx].winner = null;
        localStorage.setItem('farkleTables', JSON.stringify(tables));
      }
    }
    // Roll 6 dice for the first player
    fetch('/api/farkle/roll', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setDice(data.dice);
        setTurnScore(data.turnScore || 0);
        setFarkle(!!data.farkle);
        setHasHotDice(!!data.hotDice);
        setMessage('Game start! Select scoring dice to set aside.');
        setCanRoll(!data.farkle);
        setCanStay(false);
      });
  }

  // Helper to format numbers as points
  function formatPoints(amount) {
    return amount.toLocaleString();
  }

  return (
    <div className="farkle-table-session">
      <div className="farkle-table-layout">
        <div className="farkle-table-main">
          <h2>{table ? table.name : 'Farkle Table'}</h2>
          {/* Show player count dropdown and add button only if game not started */}
          {players.length <= 2 && players.every(p => p.score === 0) && !winner && (
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="playerCount">Number of Players: </label>
              <select id="playerCount" value={playerCount} onChange={e => setPlayerCount(Number(e.target.value))}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <button style={{ marginLeft: '1rem' }} onClick={handleAddPlayers}>Add Players</button>
              <button style={{ marginLeft: '1rem' }} onClick={() => {
                setPlayerCount(2);
                setPlayers([
                  { name: 'Player 1', score: 0 },
                  { name: 'Player 2', score: 0 }
                ]);
                setHasGotOnBoard([false, false]);
                setCurrentPlayer(0);
                setSetAside([]);
                setTurnScore(0);
                setMessage('');
                setCanRoll(true);
                setFarkle(false);
                setHasHotDice(false);
                setCanStay(false);
                setSelectedIndices([]);
                setWinner(null);
                setDice([]);
              }}>Reset Player Count</button>
            </div>
          )}
          <div className="farkle-scoreboard">
            {players.map((p, i) => (
              <div key={i} className={i === currentPlayer ? 'active-player' : ''}>
                {p.name}: {formatPoints(p.score)} {i === currentPlayer && <b>&larr; Your Turn</b>}
              </div>
            ))}
          </div>
          {winner && (
            <div className="farkle-winner">Winner: {winner} 🎉</div>
          )}
          <div className="farkle-dice-row">
            {dice.map((d, i) => {
              const isSelected = selectedIndices.includes(i);
              return (
                <span
                  key={i}
                  className={`farkle-die farkle-die-${d} ${canRoll ? 'scoring' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSelectDie(i)}
                  style={{ cursor: canRoll ? 'pointer' : 'default', border: isSelected ? '2px solid #f90' : '' }}
                >
                  {d}
                </span>
              );
            })}
          </div>
          <div className="farkle-set-aside">
            Set Aside: {setAside.join(', ')}
          </div>
          <div className="farkle-turn-score">Turn Score: {formatPoints(turnScore)}</div>
          <div className="farkle-message">{message}</div>
          <div className="farkle-controls">
            <button onClick={handleRoll} disabled={!canRoll || farkle || winner}>Roll (Current Dice)</button>
            <button onClick={handleSetAside} disabled={!canRoll || selectedIndices.length === 0 || winner}>Set Aside</button>
            <button onClick={handleStay} disabled={!canStay || winner}>Stay</button>
            <button onClick={handleBank} disabled={!canRoll || farkle || turnScore === 0 || winner}>Bank Points</button>
            <button onClick={handleNextPlayer} disabled={canRoll || winner}>Next Player Roll (All 6 Dice)</button>
            <button onClick={handleNewGame}>New Game</button>
            <button className="back-btn" onClick={onBack}>Back to Dice Lobby</button>
          </div>
        </div>
        <div className="farkle-scoring-info">
          <h3>Scoring Combos</h3>
          <ul>
            <li>Straight (1-2-3-4-5-6): <b>1,500 points</b></li>
            <li>Two Triplets: <b>2,500 points</b></li>
            <li>Six of a Kind: <b>10,000 points (Auto-Win)</b></li>
            <li>Three 1s: <b>1,000 points</b></li>
            <li>Three 2s: <b>200 points</b></li>
            <li>Three 3s: <b>300 points</b></li>
            <li>Three 4s: <b>400 points</b></li>
            <li>Three 5s: <b>500 points</b></li>
            <li>Three 6s: <b>600 points</b></li>
            <li>Four of a Kind: <b>Three of a kind + extra die (e.g., four 6s = 600 + 600 = 1,200 points; four 1s = 1,000 + 1,000 = 2,000 points)</b></li>
            <li>Five of a Kind: <b>Three of a kind + two extra dice (e.g., five 6s = 600 + 600 + 600 = 1,800 points)</b></li>
            <li>Three Pairs (any pairs): <b>1,000 points (e.g., 2-2, 3-3, 4-4)</b></li>
            <li>Each 1 (not in triplet+): <b>100 points</b></li>
            <li>Each 5 (not in triplet+): <b>50 points</b></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FarkleTableSession;
