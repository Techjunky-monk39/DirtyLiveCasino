import React, { useState } from 'react';
import BlackjackTable from './BlackjackTable';

function BlackjackLobby({ onBack }) {
  const [inTable, setInTable] = useState(false);

  return inTable ? (
    <BlackjackTable />
  ) : (
    <div className="blackjack-lobby">
      <h1>Blackjack Lobby</h1>
      <p>Welcome to the Blackjack Lobby! (WIP)</p>
      <button className="start-btn" onClick={() => setInTable(true)}>Start Blackjack Table</button>
      <button className="back-btn" onClick={onBack}>Back to Main Lobby</button>
    </div>
  );
}

export default BlackjackLobby;
