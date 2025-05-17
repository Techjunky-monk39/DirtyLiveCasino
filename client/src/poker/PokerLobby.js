import React from 'react';
import './PokerLobby.css';
import { TexasHoldemDemo } from './PokerTable';

function PokerLobby({ tables = [], onJoinTable, onCreateTable, onBack }) {
  // Demo: Add sample tables if none exist
  const demoTables = tables.length === 0 ? [
    {
      id: 101,
      name: 'Table 101',
      gameType: 'poker',
      players: [],
      hand: [
        { rank: 'A', suit: '♠' },
        { rank: 'Q', suit: '♥' },
        { rank: 'J', suit: '♣' }
      ]
    },
    {
      id: 201,
      name: 'Table 201',
      gameType: 'texas_holdem',
      players: [],
      hand: [
        { rank: 'K', suit: '♠' },
        { rank: 'K', suit: '♥' },
        { rank: 'K', suit: '♣' }
      ]
    }
  ] : tables;

  // Normalize gameType for frontend columns
  const normalizedTables = demoTables.map(t => ({
    ...t,
    gameType: t.gameType.toLowerCase().replace(/\s|_/g, '_')
  }));

  // Split tables by type
  const pokerTables = normalizedTables.filter(t => t.gameType === 'poker');
  const holdemTables = normalizedTables.filter(t => t.gameType === 'texas_holdem');

  return (
    <div className="poker-lobby">
      <h1>Poker Lobby</h1>
      <button className="back-btn" onClick={onBack} style={{ float: 'right', marginBottom: '1rem' }}>Back</button>
      <button className="back-btn" onClick={onCreateTable} style={{ marginBottom: '1rem' }}>Create New Table</button>
      {(pokerTables.length === 0 && holdemTables.length === 0) ? (
        <div className="no-tables">No poker tables available. Create one!</div>
      ) : (
        <div className="lobby-background-row">
          {/* Poker block */}
          <div className="lobby-background-card">
            <div className="lobby-block-title">Poker</div>
            {pokerTables.length === 0 ? (
              <div className="no-tables">No Poker tables</div>
            ) : (
              pokerTables.map(table => (
                <div key={table.id} className="poker-table-card" onClick={() => onJoinTable(table)}>
                  <div className="hand">
                    {table.hand && table.hand.map((card, i) => (
                      <span key={i} className="card">{card.rank}{card.suit}</span>
                    ))}
                  </div>
                  <div className="table-label">Table {table.id}</div>
                  <div className="table-info">Players: {table.players ? table.players.length : 0}</div>
                </div>
              ))
            )}
          </div>
          {/* Green separator */}
          <div className="lobby-green-separator" />
          {/* Texas Hold'em block */}
          <div className="lobby-background-card">
            <div className="lobby-block-title">Texas Hold'em</div>
            {holdemTables.length === 0 ? (
              <div className="no-tables">No Texas Hold'em tables</div>
            ) : (
              holdemTables.map(table => (
                <div key={table.id} className="poker-table-card" onClick={() => onJoinTable(table)}>
                  <div className="hand">
                    {table.hand && table.hand.map((card, i) => (
                      <span key={i} className="card">{card.rank}{card.suit}</span>
                    ))}
                  </div>
                  <div className="table-label">Table {table.id}</div>
                  <div className="table-info">Players: {table.players ? table.players.length : 0}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PokerLobby;