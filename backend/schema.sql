-- Casino Platform SQL Schema
-- Compatible with PostgreSQL (Supabase), AWS RDS, Azure SQL

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tables (game tables, e.g. Poker Table 1)
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    game_type VARCHAR(32) NOT NULL, -- e.g. 'poker', 'blackjack'
    status VARCHAR(16) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Player-Table relationship (many-to-many)
CREATE TABLE player_table (
    user_id INTEGER REFERENCES users(id),
    table_id INTEGER REFERENCES tables(id),
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, table_id)
);

-- Games (an instance of a game at a table)
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    table_id INTEGER REFERENCES tables(id),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    result JSONB -- store winner, payouts, etc.
);

-- Hands (for card games)
CREATE TABLE hands (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    user_id INTEGER REFERENCES users(id),
    cards VARCHAR(32), -- e.g. 'AS,KH' (Ace of Spades, King of Hearts)
    hand_result JSONB
);

-- Bets
CREATE TABLE bets (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    user_id INTEGER REFERENCES users(id),
    amount NUMERIC(10,2) NOT NULL,
    bet_type VARCHAR(32), -- e.g. 'call', 'raise', 'blackjack', etc.
    placed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_games_table_id ON games(table_id);
CREATE INDEX idx_hands_game_id ON hands(game_id);
CREATE INDEX idx_bets_game_id ON bets(game_id);
