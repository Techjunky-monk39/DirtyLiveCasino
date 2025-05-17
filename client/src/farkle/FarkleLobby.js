import React, { useEffect, useState } from 'react';
import './FarkleLobby.css';

function getLocalFarkleTables() {
  return JSON.parse(localStorage.getItem('farkleTables') || '[]');
}
function saveLocalFarkleTables(tables) {
  localStorage.setItem('farkleTables', JSON.stringify(tables));
}

function FarkleLobby({ onStartTable, onBack, onJoinTable }) {
  const [tables, setTables] = useState(getLocalFarkleTables());

  useEffect(() => {
    setTables(getLocalFarkleTables());
  }, []);

  function handleCreateTable() {
    const id = Math.floor(Math.random() * 900 + 100);
    const newTable = {
      id,
      name: `Farkle Table ${id}`,
      players: [],
      scores: [],
      winner: null,
      created: Date.now(),
    };
    const updated = [...tables, newTable];
    setTables(updated);
    saveLocalFarkleTables(updated);
  }

  function handleJoin(table) {
    if (onJoinTable) onJoinTable(table);
  }

  function handleDeleteTable(id) {
    const updated = tables.filter(t => t.id !== id);
    setTables(updated);
    saveLocalFarkleTables(updated);
  }

  return (
    <div className="farkle-lobby">
      <h2>Farkle (10,000) Lobby</h2>
      <button className="back-btn" onClick={onBack}>Back to Dice Lobby</button>
      <button className="back-btn" style={{marginLeft:'1rem'}} onClick={handleCreateTable}>Create New Table</button>
      {tables.length === 0 ? (
        <div className="no-tables">No Farkle tables yet.</div>
      ) : (
        <div className="farkle-table-list">
          {tables.map(table => (
            <div key={table.id} className="farkle-table-card" onClick={() => handleJoin(table)}>
              <div className="table-label">{table.name}</div>
              <div className="table-info">Players: {table.players.length || 0}</div>
              <div className="table-info">Last Winner: {table.winner || '---'}</div>
              <button className="back-btn" style={{marginTop:'0.7rem'}} onClick={e => {e.stopPropagation();handleDeleteTable(table.id);}}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FarkleLobby;
