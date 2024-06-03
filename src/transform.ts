import { Board } from './board.js';
import { Setup } from './setup.js';
import { SquareSet } from './squareSet.js';
import { COLORS, ROLES } from './types.js';
import { defined } from './util.js';

/**
* Flips a SquareSet vertically.
*
* @param {SquareSet} s The SquareSet to flip.
* @returns {SquareSet} The flipped SquareSet.
*/
export const flipVertical = (s: SquareSet): SquareSet => s.bswap64();

/**
* Flips a SquareSet horizontally.
*
* @param {SquareSet} s The SquareSet to flip.
* @returns {SquareSet} The flipped SquareSet.
*/
export const flipHorizontal = (s: SquareSet): SquareSet => {
  const k1 = new SquareSet(0x55555555, 0x55555555);
  const k2 = new SquareSet(0x33333333, 0x33333333);
  const k4 = new SquareSet(0x0f0f0f0f, 0x0f0f0f0f);
  s = s.shr64(1).intersect(k1).union(s.intersect(k1).shl64(1));
  s = s.shr64(2).intersect(k2).union(s.intersect(k2).shl64(2));
  s = s.shr64(4).intersect(k4).union(s.intersect(k4).shl64(4));
  return s;
};

/**
* Flips a SquareSet diagonally.
*
* @param {SquareSet} s The SquareSet to flip.
* @returns {SquareSet} The flipped SquareSet.
*/
export const flipDiagonal = (s: SquareSet): SquareSet => {
  let t = s.xor(s.shl64(28)).intersect(new SquareSet(0, 0x0f0f0f0f));
  s = s.xor(t.xor(t.shr64(28)));
  t = s.xor(s.shl64(14)).intersect(new SquareSet(0x33330000, 0x33330000));
  s = s.xor(t.xor(t.shr64(14)));
  t = s.xor(s.shl64(7)).intersect(new SquareSet(0x55005500, 0x55005500));
  s = s.xor(t.xor(t.shr64(7)));
  return s;
};

/**
* Rotates a SquareSet by 180 degrees.
*
* @param {SquareSet} s The SquareSet to rotate.
* @returns {SquareSet} The rotated SquareSet.
*/
export const rotate180 = (s: SquareSet): SquareSet => s.rbit64();

/**
* Transforms a Board by applying a transformation function to each SquareSet.
*
* @param {Board} board The Board to transform.
* @param {function(SquareSet): SquareSet} f The transformation function.
* @returns {Board} The transformed Board.
*/
export const transformBoard = (board: Board, f: (s: SquareSet) => SquareSet): Board => {
  const b = Board.empty();
  b.occupied = f(board.occupied);
  b.promoted = f(board.promoted);
  for (const color of COLORS) b[color] = f(board[color]);
  for (const role of ROLES) b[role] = f(board[role]);
  return b;
};

/**
* Transforms a Setup by applying a transformation function to each SquareSet.
*
* @param {Setup} setup The Setup to transform.
* @param {function(SquareSet): SquareSet} f The transformation function.
* @returns {Setup} The transformed Setup.
*/
export const transformSetup = (setup: Setup, f: (s: SquareSet) => SquareSet): Setup => ({
  board: transformBoard(setup.board, f),
  pockets: setup.pockets?.clone(),
  turn: setup.turn,
  castlingRights: f(setup.castlingRights),
  epSquare: defined(setup.epSquare) ? f(SquareSet.fromSquare(setup.epSquare)).first() : undefined,
  remainingChecks: setup.remainingChecks?.clone(),
  halfmoves: setup.halfmoves,
  fullmoves: setup.fullmoves,
});
