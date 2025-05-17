import React from 'react';
import './Dealer.css';

// Poker chips and tray (lightweight SVG/CSS)
function ChipsTray() {
  return (
    <div className="chips-tray">
      <div className="chip chip-red" />
      <div className="chip chip-green" />
      <div className="chip chip-black" />
      <div className="chip chip-blue" />
      <div className="tray" />
    </div>
  );
}

/**
 * Universal Dealer component
 * Props:
 * - gameType: string (e.g. 'poker', 'blackjack')
 * - tableId: string|number (unique table identifier)
 * - armPosition: 'rest' | 'deal' | 'return' (animation state)
 * - onDeal: function (callback to trigger dealing action)
 * - children: ReactNode (optional, for overlays or custom content)
 */
function Dealer({ gameType, tableId, armPosition = 'rest', onDeal, children }) {
  // armPosition: 'rest', 'deal', 'return'
  // Dealer is stateless: all logic is handled by parent (Table)
  return (
    <div className={`dealer-figure dealer-arm-${armPosition}`}> 
      <div className="dealer-body">
        <div className="dealer-head" />
        <div className="dealer-arm-left" />
        <div className="dealer-arm-right" />
        <div className="dealer-torso" />
      </div>
      <ChipsTray />
      {/* Optionally show table/game info for debugging or UI */}
      {/* <div className="dealer-info">{gameType} | Table {tableId}</div> */}
      {/* Dealer action button for demo/testing (remove in prod) */}
      {onDeal && (
        <button className="dealer-deal-btn" onClick={onDeal} style={{position:'absolute',top:0,right:0,zIndex:10}}>
          Deal
        </button>
      )}
      <div className="dealer-children">{children}</div>
    </div>
  );
}

export default Dealer;
