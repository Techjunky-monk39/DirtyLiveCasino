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
    setMessage(data.hotDice ? 'Hot Dice! You may roll all 6 dice again.' : 'Die set aside. Roll again, stay, or bank points.');
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

  function handleNextPlayer() {
    setDice([]);
    setSetAside([]);
    setTurnScore(0);
    setMessage('');
    setCanRoll(true);
    setFarkle(false);
    setHasHotDice(false);
    setCanStay(false);
    setSelectedIndices([]);
    setCurrentPlayer((currentPlayer + 1) % players.length);
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

  return (
    <div className="farkle-table-session">
      <div className="farkle-table-layout">
        <div className="farkle-table-main">
          <h2>{table ? table.name : 'Farkle Table'}</h2>
          <div className="farkle-scoreboard">
            {players.map((p, i) => (
              <div key={i} className={i === currentPlayer ? 'active-player' : ''}>
                {p.name}: {p.score} {i === currentPlayer && <b>&larr; Your Turn</b>}
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
          <div className="farkle-turn-score">Turn Score: {turnScore}</div>
          <div className="farkle-message">{message}</div>
          <div className="farkle-controls">
            <button onClick={handleRoll} disabled={!canRoll || farkle || winner}>Roll</button>
            <button onClick={handleSetAside} disabled={!canRoll || selectedIndices.length === 0 || winner}>Set Aside</button>
            <button onClick={handleStay} disabled={!canStay || winner}>Stay</button>
            <button onClick={handleBank} disabled={!canRoll || farkle || turnScore === 0 || winner}>Bank Points</button>
            <button onClick={handleNextPlayer} disabled={canRoll || winner}>Next Player</button>
            <button onClick={handleNewGame}>New Game</button>
            <button className="back-btn" onClick={onBack}>Back to Farkle Lobby</button>
          </div>
        </div>
        <div className="farkle-scoring-info">
          <h3>Scoring Combos</h3>
          <ul>
            <li>Straight (1-2-3-4-5-6): <b>1500</b></li>
            <li>Two Triplets: <b>2500</b></li>
            <li>Six of a Kind: <b>10,000 (Auto-Win)</b></li>
            <li>Three 1s: <b>1000</b></li>
            <li>Three 2s: <b>200</b></li>
            <li>Three 3s: <b>300</b></li>
            <li>Three 4s: <b>400</b></li>
            <li>Three 5s: <b>500</b></li>
            <li>Three 6s: <b>600</b></li>
            <li>Four of a Kind: <b>Three of a kind + extra die (e.g., four 4s = 400 + 400 = 800)</b></li>
            <li>Three Pairs: <b>1000</b></li>
            <li>Each 1 (not in triplet+): <b>100</b></li>
            <li>Each 5 (not in triplet+): <b>50</b></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FarkleTableSession;
