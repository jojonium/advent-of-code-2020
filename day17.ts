import {linesAsStrings} from "./helpers";
import path from "path";

/** All bounds are inclusive. */
interface Board {
  coords: Map<string, boolean>;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  minW: number;
  maxW: number;
}

const toMapKey = (x: number, y: number, z: number, w: number): string =>
  `${x},${y},${z},${w}`

/**
 * Parses input into a data structure that's easier to work with than text.
 */
const parse = (lines: string[]): Board => {
  const m = new Map<string, boolean>();
  lines.forEach((line, y) => {
    line.split("").forEach((char, x) => {
      m.set(toMapKey(x, y, 0, 0), (char === "#"));
    });
  });
  return {
    coords: m,
    minX: 0,
    maxX: lines[0].length,
    minY: 0,
    maxY: lines.length,
    minZ: 0,
    maxZ: 0,
    minW: 0,
    maxW: 0,
  }
};

/**
 * Returns the number of active neighbors the given cell has in 3D space.
 */
const neighbors3d = (
  x: number,
  y: number,
  z: number,
  w: number,
  coords: Map<string, boolean>,
): number => {
  let neighbors = 0;
  for (const dx of [-1, 0, 1]) {
    for (const dy of [-1, 0, 1]) {
      for (const dz of [-1, 0, 1]) {
        for (const dw of [-1, 0, 1]) {
          // a cell shouldn't consider itself a neighbor
          if (dx === 0 && dy === 0 && dz === 0 && dw === 0) continue;
          if (coords.get(toMapKey(x + dx, y + dy, z + dz, w + dw)) === true)
            neighbors++;
        }
      }
    }
  }
  return neighbors;
}

/**
 * Runs one simulation of the game of life on the given board and returns the
 * resultant board.
 * @param hypermode whether to run in 4-dimensional mode
 */
const iterate = (board: Board, hypermode = false): Board => {
  const out: Board = {
    coords: new Map<string, boolean>(),
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity,
    minW: Infinity,
    maxW: -Infinity
  }
  // in 3D mode we only care about coordinates where w = 0
  const startW = hypermode ? board.minW - 1 : 0;
  const endW = hypermode ? board.maxW + 1 : 0;
  for (let x = board.minX - 1; x <= board.maxX + 1; ++x) {
    for (let y = board.minY - 1; y <= board.maxY + 1; ++y) {
      for (let z = board.minZ - 1; z <= board.maxZ + 1; ++z) {
        for (let w = startW; w <= endW; ++w) {
          const n = neighbors3d(x, y, z, w, board.coords);
          let nowActive = false;
          if (board.coords.get(toMapKey(x, y, z, w)) === true) {
            if (n === 2 || n === 3) {
              nowActive = true;
            }
          } else {
            if (n === 3) {
              nowActive = true;
            }
          }
          if (nowActive) {
            out.coords.set(toMapKey(x, y, z, w), true);
            // check if the area containing active cells expanded
            out.minX = Math.min(out.minX, x);
            out.maxX = Math.max(out.maxX, x);
            out.minY = Math.min(out.minY, y);
            out.maxY = Math.max(out.maxY, y);
            out.minZ = Math.min(out.minZ, z);
            out.maxZ = Math.max(out.maxZ, z);
            out.minW = Math.min(out.minW, w);
            out.maxW = Math.max(out.maxW, w);
          }
        }
      }
    }
  }
  return out;
}

/**
 * Returns the number of active cells in the 3D or 4D space.
 */
const count = (board: Board): number => {
  let out = 0;
  for (let x = board.minX; x <= board.maxX; ++x) {
    for (let y = board.minY; y <= board.maxY; ++y) {
      for (let z = board.minZ; z <= board.maxZ; ++z) {
        for (let w = board.minW; w <= board.maxW; ++w) {
          if (board.coords.get(toMapKey(x, y, z, w)) === true) out++;
        }
      }
    }
  }
  return out;
}

(async () => {
  let input = await linesAsStrings(path.join(".", "inputs", "day17.txt"));
  let board = parse(input);
  // iterate 6 times
  for (let i = 0; i < 6; ++i) {
    board = iterate(board);
  }
  console.log(`Part 1: ${count(board)}`);

  let board4d = parse(input);
  // iterate 6 times
  for (let i = 0; i < 6; ++i) {
    board4d = iterate(board4d, true);
  }
  console.log(`Part 2: ${count(board4d)}`);
})();
