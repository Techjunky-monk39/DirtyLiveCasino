import React, { useState } from 'react';

const FarkleGame = () => {
  const [selectedIndices, setSelectedIndices] = useState([]);

  const handleSetAside = () => {
    // selectedIndices should be an array of all currently selected dice indices
    fetch('/api/farkle/setAside', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ indices: selectedIndices }),
    })
      .then(res => res.json())
      .then(data => {
        // ...handle response...
      });
  };

  return (
    <div>
      {/* ...existing code... */}
      <button onClick={handleSetAside}>Set Aside</button>
      {/* ...existing code... */}
    </div>
  );
};

export default FarkleGame;