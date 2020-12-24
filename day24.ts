import {linesAsStrings} from './helpers';
import path from 'path';

interface Board {
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  blackTiles: Set<string>
}

/** Finds the [x, y] coordinate of a tile specified by a line of input. */
const toCoord = (line: string): [number, number] => {
  let [x, y] = [0, 0];
  for (let i = 0; i < line.length; ++i) {
    let dir = line.charAt(i);
    if (dir === 'n' || dir === 's') dir += line.charAt(++i);
    const [dx, dy] = {
      ne: [0, 1],
      e: [1, 0],
      se: [1, -1],
      sw: [0, -1],
      w: [-1, 0],
      nw: [-1, 1],
    }[dir as 'ne' | 'e' | 'se' | 'sw' | 'w' | 'nw'];
    x += dx;
    y += dy;
  }
  return [x, y];
};

/**
 * All tiles start out white. Flips the tile specified by each line, then
 * returns the state of the board afterward.
 */
const part1 = (lines: string[]): Board => {
  const output = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    blackTiles: new Set<string>()
  }
  for (const line of lines) {
    const [x, y] = toCoord(line);
    if (x < output.minX) output.minX = x;
    if (y < output.minY) output.minY = y;
    if (x > output.maxX) output.maxX = x;
    if (y > output.maxY) output.maxY = y;
    const key = `${x},${y}`;
    if (output.blackTiles.has(key)) output.blackTiles.delete(key);
    else output.blackTiles.add(key);
  }
  return output;
};

/**
 * Finds the number of black tiles immediately adjacent to a given tile.
 */
const neighbors = (x: number, y: number, blackTiles: Set<string>): number =>
  [
    [0, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1],
  ].reduce(
    (numNeighbors, [dx, dy]) =>
      blackTiles.has(`${x + dx},${y + dy}`) ? numNeighbors + 1 : numNeighbors,
    0
  );

/**
 * Runs one iteration of the flipping algorithm and returns the new set of
 * black tiles afterward
 */
const iterate = (board: Board): Board => {
  const newBoard = {
    minX: board.minX,
    minY: board.minY,
    maxX: board.maxX,
    maxY: board.maxY,
    blackTiles: new Set<string>(),
  }
  for (let x = board.minX - 1; x <= board.maxX + 1; ++x) {
    for (let y = board.minY - 1; y <= board.maxY + 1; ++y) {
      const n = neighbors(x, y, board.blackTiles)
      const key = `${x},${y}`
      if (board.blackTiles.has(key)) {
        if (n > 0 && n < 3) newBoard.blackTiles.add(key);
      } else {
        if (n === 2) {
          if (x < newBoard.minX) newBoard.minX = x;
          if (y < newBoard.minY) newBoard.minY = y;
          if (x > newBoard.maxX) newBoard.maxX = x;
          if (y > newBoard.maxY) newBoard.maxY = y;
          newBoard.blackTiles.add(key);
        }
      }
    }
  }
  return newBoard;
};

(async () => {
  const input = await linesAsStrings(path.join('.', 'inputs', 'day24.txt'));
  let board = part1(input);
  console.log(`Part 1: ${board.blackTiles.size}`);
  for (let i = 0; i < 100; ++i) board = iterate(board);
  console.log(`Part 2: ${board.blackTiles.size}`);
})();
