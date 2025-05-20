import React, { useState } from 'react';
import TexasHoldemTable from './Table';

function TexasLobby({ onBack }) {
  const [inTable, setInTable] = useState(false);

  const handleJoinTable = () => setInTable(true);
  const handleLeaveTable = () => setInTable(false);

  if (inTable) {
    return <TexasHoldemTable onBack={handleLeaveTable} />;
  }

  return (
    <div>
      <h2>Texas Hold'em Lobby</h2>
      <div style={{margin:'2rem 0'}}>
        <button onClick={handleJoinTable}>Join Table</button>
      </div>
      {/* Add Texas Hold'em lobby logic here: list of tables, create table, etc. */}
      <button className="back-btn" onClick={onBack} style={{ marginTop: '2rem' }}>Back to Poker Lobby</button>
    </div>
  );
}

export default TexasLobby;
