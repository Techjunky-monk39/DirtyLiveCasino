// Basic Express server setup for CasinoLive39 backend
const express = require('express');
const cors = require('cors');
const { PokerDeck } = require('./poker/pokerEngine');
const { BlackjackShoe } = require('./blackjack/BlackjackShoe');
const FarkleGame = require('./farkle/FarkleGame');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory tables and results (replace with DB as needed)
let pokerTables = [
  {
    id: 101,
    name: 'Table 101',
    hand: [ { rank: '1', suit: '♠' }, { rank: '0', suit: '♥' }, { rank: '1', suit: '♣' } ],
    players: [],
    gameType: 'poker',
  },
  {
    id: 102,
    name: 'Table 102',
    hand: [ { rank: '1', suit: '♠' }, { rank: '0', suit: '♥' }, { rank: '2', suit: '♣' } ],
    players: [],
    gameType: 'texas_holdem',
  },
  {
    id: 123,
    name: 'Table 123',
    hand: [ { rank: '1', suit: '♠' }, { rank: '2', suit: '♥' }, { rank: '3', suit: '♣' } ],
    players: [],
    gameType: 'Omaha',
  }
];
const results = [];

// In-memory Farkle game instance
let farkleGame = new FarkleGame();

// Health check endpoint
app.get('/', (req, res) => {
  res.send('CasinoLive39 Poker Backend is running!');
});

// Example endpoint: create and shuffle a deck
app.get('/api/poker/deck', (req, res) => {
  const deck = new PokerDeck();
  deck.shuffle();
  res.json({ deck: deck.cards });
});

// Fetch poker tables
app.get('/api/tables', (req, res) => {
  res.json(pokerTables);
});

// Create a new poker table
app.post('/api/tables', (req, res) => {
  const { name, gameType, players } = req.body;
  // Generate a unique 3-digit id and hand
  const id = Math.floor(Math.random() * 900 + 100);
  const digits = String(id).padStart(3, '0').split('');
  const suits = ['♠', '♥', '♣', '♦'];
  const hand = digits.map((digit, i) => ({ rank: digit, suit: suits[i % suits.length] }));
  const newTable = { id, name, hand, players: players || [], gameType: gameType || 'Texas Holdem' };
  pokerTables.push(newTable);
  res.status(201).json(newTable);
});

// Place a bet at a table
app.post('/api/tables/:id/bet', (req, res) => {
  const { id } = req.params;
  const { player, amount } = req.body;
  const table = pokerTables.find(t => t.id == id);
  if (!table) return res.status(404).json({ error: 'Table not found' });
  if (!player || !amount) return res.status(400).json({ error: 'Player and amount required' });
  // Store bets in table object (in-memory, for demo)
  if (!table.bets) table.bets = {};
  table.bets[player] = (table.bets[player] || 0) + Number(amount);
  res.json({ success: true, bets: table.bets });
});

// Save poker results
app.post('/api/results', (req, res) => {
  const { player, table, winner } = req.body;
  const date = new Date();
  results.push({ player, table, winner, date });
  res.status(201).json({ success: true });
});

// Texas Hold'em: Deal hole cards and community cards
app.post('/api/texas_holdem/:tableId/deal', (req, res) => {
  const { tableId } = req.params;
  const table = pokerTables.find(t => t.id == tableId && t.gameType.toLowerCase().includes('texas'));
  if (!table) return res.status(404).json({ error: 'Table not found' });

  // For demo: 6-max table, 2 hole cards per player, 5 community cards
  const numPlayers = table.players.length || 6;
  const PokerDeck = require('./poker/pokerEngine').PokerDeck;
  const deck = new PokerDeck();
  deck.shuffle();

  // Deal hole cards
  const playerHands = {};
  for (let i = 0; i < numPlayers; i++) {
    playerHands[`player${i+1}`] = deck.deal(2);
  }
  // Deal community cards (flop, turn, river)
  const burn1 = deck.deal(1); // burn
  const flop = deck.deal(3);
  const burn2 = deck.deal(1); // burn
  const turn = deck.deal(1);
  const burn3 = deck.deal(1); // burn
  const river = deck.deal(1);
  const community = [...flop, ...turn, ...river];

  // Save to table (in-memory for now)
  table.lastDeal = {
    playerHands,
    community,
    deck: deck.cards
  };
  res.json({ playerHands, community });
});

// Placeholder for poker game logic endpoints
// e.g., /api/poker/tables, /api/poker/action, etc.

// In-memory shoe instance (for demo; in production, use per-table/session management)
let blackjackShoe = new BlackjackShoe();

// Initialize or reshuffle the shoe
app.post('/api/blackjack/shoe/init', (req, res) => {
  const { numDecks, penetration } = req.body || {};
  blackjackShoe = new BlackjackShoe(numDecks || 6, penetration || 0.75);
  res.json({ message: 'Blackjack shoe initialized', shoeSize: blackjackShoe.getShoeSize() });
});

// Deal a card from the shoe
app.post('/api/blackjack/shoe/deal', (req, res) => {
  try {
    const card = blackjackShoe.dealCard();
    res.json({ card, shoeSize: blackjackShoe.getShoeSize(), reshuffleNeeded: blackjackShoe.shouldReshuffle() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Discard cards (expects array of cards in req.body.cards)
app.post('/api/blackjack/shoe/discard', (req, res) => {
  const { cards } = req.body || {};
  if (!cards) return res.status(400).json({ error: 'No cards provided' });
  blackjackShoe.discard(cards);
  res.json({ message: 'Cards discarded', discardSize: blackjackShoe.getDiscardSize() });
});

// Check if reshuffle is needed
app.get('/api/blackjack/shoe/should-reshuffle', (req, res) => {
  res.json({ reshuffleNeeded: blackjackShoe.shouldReshuffle() });
});

// Reshuffle the shoe
app.post('/api/blackjack/shoe/reshuffle', (req, res) => {
  blackjackShoe.reshuffleShoe();
  res.json({ message: 'Shoe reshuffled', shoeSize: blackjackShoe.getShoeSize() });
});

// In-memory Blackjack game state (single session for demo)
let blackjackState = {
  player: [],
  dealer: [],
  finished: false,
  message: '',
};

function getCardValue(card) {
  if (["J", "Q", "K"].includes(card.rank)) return 10;
  if (card.rank === "A") return 11;
  return parseInt(card.rank, 10);
}

function calculateHandValue(hand) {
  let value = 0;
  let aces = 0;
  for (const card of hand) {
    if (["J", "Q", "K"].includes(card.rank)) value += 10;
    else if (card.rank === "A") {
      value += 11;
      aces++;
    } else value += parseInt(card.rank, 10);
  }
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  return value;
}

// Start a new blackjack game (deal)
app.post('/api/blackjack/deal', (req, res) => {
  blackjackState.player = [blackjackShoe.dealCard(), blackjackShoe.dealCard()];
  blackjackState.dealer = [blackjackShoe.dealCard(), blackjackShoe.dealCard()];
  blackjackState.finished = false;
  blackjackState.message = '';
  res.json({ player: blackjackState.player, dealer: [blackjackState.dealer[0], { rank: '?', suit: '?' }], message: 'Game started!' });
});

// Player hits
app.post('/api/blackjack/hit', (req, res) => {
  if (blackjackState.finished) return res.json({ player: blackjackState.player, message: 'Game over.' });
  blackjackState.player.push(blackjackShoe.dealCard());
  const value = calculateHandValue(blackjackState.player);
  if (value > 21) {
    blackjackState.finished = true;
    return res.json({ player: blackjackState.player, message: 'Bust! Dealer wins.', bust: true });
  }
  res.json({ player: blackjackState.player, message: 'Hit!' });
});

// Player stands
app.post('/api/blackjack/stand', (req, res) => {
  if (blackjackState.finished) return res.json({ dealer: blackjackState.dealer, message: 'Game over.' });
  // Dealer reveals and plays
  let dealerValue = calculateHandValue(blackjackState.dealer);
  while (dealerValue < 17) {
    blackjackState.dealer.push(blackjackShoe.dealCard());
    dealerValue = calculateHandValue(blackjackState.dealer);
  }
  const playerValue = calculateHandValue(blackjackState.player);
  let message = '';
  if (dealerValue > 21 || playerValue > dealerValue) message = 'Player wins!';
  else if (dealerValue === playerValue) message = 'Push!';
  else message = 'Dealer wins!';
  blackjackState.finished = true;
  res.json({ dealer: blackjackState.dealer, message });
});

// Farkle: Roll dice
app.post('/api/farkle/roll', (req, res) => {
  const result = farkleGame.playerRoll();
  res.json(result);
});

// Farkle: Set aside dice
app.post('/api/farkle/setAside', (req, res) => {
  const { indices } = req.body;
  const result = farkleGame.setAsideDice(indices);
  res.json(result);
});

// Farkle: New game (reset state)
app.post('/api/farkle/newGame', (req, res) => {
  farkleGame = new FarkleGame();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`CasinoLive39 backend listening on port ${PORT}`);
});
