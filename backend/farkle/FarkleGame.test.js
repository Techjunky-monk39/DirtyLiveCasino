const FarkleGame = require('./FarkleGame');

describe('FarkleGame.validateSetAside', () => {
  let game;
  beforeEach(() => {
    game = new FarkleGame(['A', 'B']);
  });

  test('detects straight (1-2-3-4-5-6)', () => {

    const dice = [1,2,3,4,5,6];
    expect(game.validateSetAside(dice, [0,1,2,3,4,5])).toEqual({
      valid: true,
      breakdown: [
        { type: 'straight', dice: [1,2,3,4,5,6] }
      ]
    });
  });

  test('detects two triplets', () => {
    const dice = [2,2,2,5,5,5];
    expect(game.validateSetAside(dice, [0,1,2,3,4,5])).toEqual({
      valid: true,
      breakdown: [
        { type: 'twoTriplets', dice: [2,2,2,5,5,5] }
      ]
    });
  });

  test('detects three pairs', () => {
    const dice = [1,1,2,2,3,3];
    expect(game.validateSetAside(dice, [0,1,2,3,4,5])).toEqual({
      valid: true,
      breakdown: [
        { type: 'threePairs', dice: [1,1,2,2,3,3] }
      ]
    });
  });

  test('detects six of a kind', () => {
    const dice = [4,4,4,4,4,4];
    expect(game.validateSetAside(dice, [0,1,2,3,4,5])).toEqual({
      valid: true,
      breakdown: [
        { type: 'sixOfAKind', value: 4, dice: [4,4,4,4,4,4] }
      ]
    });
  });

  test('detects five of a kind', () => {
    const dice = [3,3,3,3,3];
    expect(game.validateSetAside(dice, [0,1,2,3,4])).toEqual({
      valid: true,
      breakdown: [
        { type: 'fiveOfAKind', value: 3, dice: [3,3,3,3,3] }
      ]
    });
  });

  test('detects four of a kind', () => {
    const dice = [6,6,6,6];
    expect(game.validateSetAside(dice, [0,1,2,3])).toEqual({
      valid: true,
      breakdown: [
        { type: 'fourOfAKind', value: 6, dice: [6,6,6,6] }
      ]
    });
  });

  test('detects triplet', () => {
    const dice = [2,2,2];
    expect(game.validateSetAside(dice, [0,1,2])).toEqual({
      valid: true,
      breakdown: [
        { type: 'triplet', value: 2, dice: [2,2,2] }
      ]
    });
  });

  test('rejects non-triplet of three dice', () => {
    const dice = [2,2,3];
    expect(game.validateSetAside(dice, [0,1,2])).toEqual({ valid: false, reason: 'Selected dice include non-scoring dice' });
  });

  test('detects single 1', () => {
    const dice = [1];
    expect(game.validateSetAside(dice, [0])).toEqual({
      valid: true,
      breakdown: [
        { type: 'single', value: 1, dice: [1] }
      ]
    });
  });

  test('detects single 5', () => {
    const dice = [5];
    expect(game.validateSetAside(dice, [0])).toEqual({
      valid: true,
      breakdown: [
        { type: 'single', value: 5, dice: [5] }
      ]
    });
  });

  test('rejects single 2', () => {
    const dice = [2];
    expect(game.validateSetAside(dice, [0])).toEqual({ valid: false, reason: 'Selected dice include non-scoring dice' });
  });

  test('rejects mixed straight and other dice', () => {
    const dice = [1,2,3,4,5,6,1];
    expect(game.validateSetAside(dice, [0,1,2,3,4,5])).toEqual({
      valid: true,
      breakdown: [
        { type: 'straight', dice: [1,2,3,4,5,6] }
      ]
    });
    // But if you try to set aside 1-2-3-4-5-6-1, that's not a valid combo
    expect(game.validateSetAside(dice, [0,1,2,3,4,5,6])).toEqual({ valid: false, reason: 'Selected dice include non-scoring dice' });
  });

  test('rejects mixing special combos with other dice', () => {
    const dice = [1,2,3,4,5,6];
    // Try to set aside 1-2-3-4-5 (not a valid combo)
    expect(game.validateSetAside(dice, [0,1,2,3,4])).toEqual({ valid: false, reason: 'Selected dice include non-scoring dice' });
  });
});
