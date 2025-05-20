import React from 'react';
import './Card.css';

/**
 * Card component for displaying a playing card (poker/blackjack style)
 * Props:
 * - rank: string (2-10, J, Q, K, A)
 * - suit: string (♠, ♥, ♣, ♦ or 'spades', 'hearts', 'clubs', 'diamonds')
 * - faceDown: boolean (optional, for hidden dealer card)
 */
const suitSymbols = {
  spades: '♠',
  hearts: '♥',
  clubs: '♣',
  diamonds: '♦',
  '♠': '♠',
  '♥': '♥',
  '♣': '♣',
  '♦': '♦',
};
const suitColors = {
  spades: 'black',
  clubs: 'black',
  '♠': 'black',
  '♣': 'black',
  hearts: 'red',
  diamonds: 'red',
  '♥': 'red',
  '♦': 'red',
};

function Card({ rank, suit, faceDown = false }) {
  if (faceDown) {
    return <span className="card card-back" title="Hidden card" />;
  }
  const symbol = suitSymbols[suit] || suit;
  const color = suitColors[suit] || 'black';
  return (
    <span className={`card card-${color}`} title={`${rank}${symbol}`}>
      <span className="card-rank">{rank}</span>
      <span className="card-suit">{symbol}</span>
    </span>
  );
}

export default Card;
