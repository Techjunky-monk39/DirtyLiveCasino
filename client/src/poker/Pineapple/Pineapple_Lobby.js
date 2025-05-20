import React, { useState } from 'react';
import PineappleTable from './Table';

function PineappleLobby() {
  const [inTable, setInTable] = useState(false);

  // Demo: Table join handler
  const handleJoinTable = () => setInTable(true);
  const handleLeaveTable = () => setInTable(false);

  if (inTable) {
    return <PineappleTable onBack={handleLeaveTable} />;
  }

  return (
    <div>
      <h2>Three Card Poker (Pineapple) Lobby</h2>
      <div style={{margin:'2rem 0'}}>
        <button onClick={handleJoinTable}>Join Table</button>
      </div>
      {/* Add Pineapple lobby logic here: list of tables, create table, etc. */}
    </div>
  );
}

export default PineappleLobby;
