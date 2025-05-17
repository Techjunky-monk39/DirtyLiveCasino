import React, { useState } from 'react';
import Dealer from '../common/Dealer';

/**
 * PokerTable component manages the state for a single poker table instance.
 * It interacts with the universal Dealer and the poker game logic.
 */
function PokerTable({ tableId }) {
  const [players, setPlayers] = useState([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]);
  const [hands, setHands] = useState({});
  const [dealerArm, setDealerArm] = useState('rest');

  // Example: Deal two cards to each player
  const handleDeal = async () => {
    setDealerArm('deal');
    try {
      const res = await fetch(`/api/poker/${tableId}/deal`, { method: 'POST' });
      const data = await res.json();
      setTimeout(() => {
        setHands(data.hands);
        setDealerArm('return');
      }, 800);
    } catch (err) {
      console.error('Failed to deal cards:', err);
    }
  };

  return (
    <div className="poker-table">
      <Dealer
        gameType="poker"
        tableId={tableId}
        armPosition={dealerArm}
        onDeal={handleDeal}
      >
        {/* Render player hands for demo */}
        <div className="hands-info">
          {players.map(p => (
            <div key={p.id}>
              {p.name}: {hands[p.id] ? hands[p.id].join(', ') : '--'}
            </div>
          ))}
        </div>
      </Dealer>
    </div>
  );
}

export default PokerTable;

export function TexasHoldemDemo({ tableId }) {
  const [dealResult, setDealResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDeal = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/texas_holdem/${tableId}/deal`, { method: 'POST' });
      const data = await res.json();
      setDealResult(data);
    } catch (err) {
      setDealResult({ error: 'Failed to deal cards.' });
    }
    setLoading(false);
  };

  return (
    <div>
      <Dealer
        gameType="texas_holdem"
        tableId={tableId}
        armPosition={loading ? 'deal' : 'rest'}
        onDeal={handleDeal}
      />
      {dealResult && (
        <div className="deal-result">
          {dealResult.error ? (
            <div style={{color:'red'}}>{dealResult.error}</div>
          ) : (
            <>
              <div><b>Community Cards:</b> {dealResult.community && dealResult.community.map((c,i) => `${c.rank}${c.suit}`).join(' ')}</div>
              <div><b>Player Hands:</b></div>
              <ul>
                {dealResult.playerHands && Object.entries(dealResult.playerHands).map(([player, cards]) => (
                  <li key={player}>{player}: {cards.map(c => `${c.rank}${c.suit}`).join(' ')}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
