// Farkle (10,000) game logic starter
// TODO: Implement full game logic per rules
class FarkleGame {
  constructor(players = []) {
    this.players = players;
    this.scores = Array(players.length).fill(0);
    this.currentPlayer = 0;
    this.turnScore = 0;
    this.dice = [1,2,3,4,5,6];
    // ...other state as needed
  }

  // Calculate score for a given set of dice
  calculateScore(dice) {
    // Sort dice for easier straight detection
    const sorted = [...dice].sort((a, b) => a - b);
    // Check for straight (1-2-3-4-5-6)
    if (sorted.length === 6 && sorted.every((val, idx) => val === idx + 1)) {
      return 1500;
    }
    // Count occurrences of each die value
    const counts = {};
    for (const die of dice) {
      counts[die] = (counts[die] || 0) + 1;
    }
    // Two triplets
    if (sorted.length === 6 && Object.values(counts).filter(c => c === 3).length === 2) {
      return 2500;
    }
    // Six of a kind (auto-win)
    if (Object.values(counts).includes(6)) {
      return 10000;
    }
    let score = 0;
    // Handle four of a kind as three of a kind + extra
    for (let i = 1; i <= 6; i++) {
      if (counts[i] >= 3) {
        // Three of a kind
        if (i === 1) {
          score += 1000;
        } else {
          score += i * 100;
        }
        counts[i] -= 3;
        // If four of a kind, add extra die value
        if (counts[i] > 0) {
          score += i * 100 * counts[i];
          counts[i] = 0;
        }
      }
    }
    // Three pairs (only if not already counted as triplets)
    if (sorted.length === 6 && Object.values(counts).filter(c => c === 2).length === 3) {
      return 1000;
    }
    // Single 1s and 5s (not part of triplet+)
    score += (counts[1] || 0) * 100;
    score += (counts[5] || 0) * 50;
    return score;
  }

  // Validate a set-aside move: indices must be valid, and if claiming a triplet, must be 3 of a kind
  validateSetAside(currentDice, indices) {
    if (!Array.isArray(indices) || indices.length === 0) return { valid: false, reason: 'No dice selected' };
    const selectedDice = indices.map(i => currentDice[i]);
    const counts = {};
    for (const die of selectedDice) counts[die] = (counts[die] || 0) + 1;

    // Special combos (must use all 6 dice)
    if (indices.length === 6) {
      const sorted = [...selectedDice].sort((a, b) => a - b);
      // Straight (1-2-3-4-5-6)
      if (sorted.every((val, idx) => val === idx + 1)) {
        return { valid: true, breakdown: [{ type: 'straight', dice: [...selectedDice] }] };
      }
      // Two triplets (e.g., 2-2-2-5-5-5)
      if (Object.values(counts).filter(c => c === 3).length === 2) {
        return { valid: true, breakdown: [{ type: 'twoTriplets', dice: [...selectedDice] }] };
      }
      // Three pairs (e.g., 1-1-2-2-3-3)
      if (Object.values(counts).filter(c => c === 2).length === 3) {
        return { valid: true, breakdown: [{ type: 'threePairs', dice: [...selectedDice] }] };
      }
      // Six of a kind
      if (Object.values(counts).includes(6)) {
        return { valid: true, breakdown: [{ type: 'sixOfAKind', value: selectedDice[0], dice: [...selectedDice] }] };
      }
    }

    // Partition dice into valid scoring groups
    let tempCounts = { ...counts };
    let breakdown = [];
    // Six, five, four, three of a kind
    for (let n = 6; n >= 3; n--) {
      for (let v = 1; v <= 6; v++) {
        if (tempCounts[v] >= n) {
          if (n === 6) breakdown.push({ type: 'sixOfAKind', value: v, dice: Array(6).fill(v) });
          else if (n === 5) breakdown.push({ type: 'fiveOfAKind', value: v, dice: Array(5).fill(v) });
          else if (n === 4) breakdown.push({ type: 'fourOfAKind', value: v, dice: Array(4).fill(v) });
          else if (n === 3) breakdown.push({ type: 'triplet', value: v, dice: Array(3).fill(v) });
          tempCounts[v] -= n;
        }
      }
    }
    // Singles (1s and 5s)
    for (let v of [1, 5]) {
      if (tempCounts[v] > 0) {
        for (let i = 0; i < tempCounts[v]; i++) {
          breakdown.push({ type: 'single', value: v, dice: [v] });
        }
        tempCounts[v] = 0;
      }
    }
    // If any dice remain, selection is invalid
    const leftovers = Object.values(tempCounts).reduce((a, b) => a + b, 0);
    if (leftovers > 0) {
      return { valid: false, reason: 'Selected dice include non-scoring dice' };
    }
    return { valid: breakdown.length > 0, breakdown };
  }

  // Roll dice (server-authoritative)
  rollDice(num) {
    return Array.from({ length: num }, () => Math.floor(Math.random() * 6) + 1);
  }

  // Process a set-aside request from a player
  setAsideDice(indices) {
    // Validate indices
    if (!Array.isArray(indices) || indices.some(i => i < 0 || i >= this.dice.length)) {
      return { success: false, error: 'Invalid dice indices' };
    }
    const validation = this.validateSetAside(this.dice, indices);
    if (!validation.valid) {
      return { success: false, error: validation.reason };
    }
    // Remove selected dice from current dice
    this.dice = this.dice.filter((_, i) => !indices.includes(i));
    // Update turn score based on breakdown
    for (const group of validation.breakdown) {
      switch (group.type) {
        case 'straight':
          this.turnScore += 1500;
          break;
        case 'twoTriplets':
          this.turnScore += 2500;
          break;
        case 'threePairs':
          this.turnScore += 1000;
          break;
        case 'sixOfAKind':
          this.turnScore += 10000;
          break;
        case 'fiveOfAKind':
          this.turnScore += (group.value === 1 ? 1000 : group.value * 100) + (group.value === 1 ? 200 : group.value * 200);
          break;
        case 'fourOfAKind':
          this.turnScore += (group.value === 1 ? 1000 : group.value * 100) + (group.value === 1 ? 100 : group.value * 100);
          break;
        case 'triplet':
          this.turnScore += group.value === 1 ? 1000 : group.value * 100;
          break;
        case 'single':
          this.turnScore += group.value === 1 ? 100 : 50;
          break;
        default:
          break;
      }
    }
    // Hot Dice: if all dice are set aside, roll all 6 again
    if (this.dice.length === 0) {
      this.dice = this.rollDice(6);
      return { success: true, hotDice: true, turnScore: this.turnScore, dice: this.dice };
    }
    return { success: true, turnScore: this.turnScore, dice: this.dice };
  }

  // Server-authoritative roll (e.g., after Hot Dice or player chooses to roll)
  playerRoll() {
    let rolledDice;
    if (this.dice.length === 0) {
      rolledDice = this.rollDice(6);
      this.dice = rolledDice;
    } else {
      rolledDice = this.rollDice(this.dice.length);
      this.dice = rolledDice;
    }
    // Check for Hot Dice with last two dice as a pair
    if (this.dice.length === 2 && this.dice[0] === this.dice[1]) {
      this.dice = this.rollDice(6);
      return { hotDice: true, dice: this.dice, turnScore: this.turnScore };
    }
    // Check for Farkle
    if (this.calculateScore(this.dice) === 0) {
      this.turnScore = 0;
      // Return the dice that were just rolled, even after Farkle
      const farkleDice = this.dice;
      this.dice = [];
      return { farkle: true, dice: farkleDice, turnScore: 0 };
    }
    return { dice: this.dice, turnScore: this.turnScore };
  }

  nextPlayer() {
    // Advance to next player
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    this.turnScore = 0;
    this.dice = this.rollDice(6);
    return {
      currentPlayer: this.currentPlayer,
      dice: this.dice,
      turnScore: this.turnScore,
      scores: this.scores
    };
  }
}

module.exports = FarkleGame;

