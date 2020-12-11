import { linesAsStrings } from "./helpers";
import path from "path";

/**
 * Finds the number of occupied neighbors a seat has.
 */
const neighbors = (row: number, col: number, board: string[][]): number => {
  let neighbors = 0;
  for (let r of [-1, 0, 1]) {
    for (let c of [-1, 0, 1]) {
      if (
        !(r === 0 && c === 0) &&
        board[row + r] !== undefined &&
        board[row + r][col + c] === "#"
      ) {
        neighbors++;
      }
    }
  }
  return neighbors;
};

/**
 * Of all the seats visible in each of the 8 directions from a particular seat,
 * how many are occupied?
 */
const visibleNeighbors = (
  row: number,
  col: number,
  board: string[][]
): number => {
  let neighbors = 0;
  for (let rDelta of [-1, 0, 1]) {
    for (let cDelta of [-1, 0, 1]) {
      if (rDelta === 0 && cDelta === 0) continue;
      // walk the line until we find a seat or the edge
      let r = row + rDelta;
      let c = col + cDelta;
      while (board[r] !== undefined && board[r][c] === ".") {
        r += rDelta;
        c += cDelta;
      }
      if (board[r] !== undefined && board[r][c] === "#") {
        neighbors++;
      }
    }
  }
  return neighbors;
};

/**
 * Runs one iteration of the game of life and returns the new board and whether
 * or not the board changed.
 */
const iterate = (
  board: string[][],
  crowdedThreshhold = 4,
  neighborFunc = neighbors
): [boolean, string[][]] => {
  const newBoard = new Array<string[]>(board.length);
  for (let i = 0; i < newBoard.length; ++i) {
    newBoard[i] = new Array<string>(board[0].length);
  }
  let changed = false;
  for (let row = 0; row < board.length; ++row) {
    for (let col = 0; col < board[row].length; ++col) {
      const n = neighborFunc(row, col, board);
      if (board[row][col] === "L" && n === 0) {
        newBoard[row][col] = "#";
        changed = true;
      } else if (board[row][col] === "#" && n >= crowdedThreshhold) {
        newBoard[row][col] = "L";
        changed = true;
      } else {
        newBoard[row][col] = board[row][col];
      }
    }
  }
  return [changed, newBoard];
};

/**
 * Finds the total number of occupied seats in the board.
 */
const numOccupied = (board: string[][]): number =>
  board
    .map((row) => row.reduce((sum, seat) => sum + +(seat === "#"), 0))
    .reduce((accumulator, rowSum) => accumulator + rowSum, 0);

(async () => {
  const input = await linesAsStrings(path.join(".", "inputs", "day11.txt"));
  const initialBoard: string[][] = input.map((line) => line.split(""));
  let changed = false;
  let board = initialBoard;
  do {
    [changed, board] = iterate(board);
  } while (changed);
  console.log(`Part 1: ${numOccupied(board)}`);

  changed = false;
  board = initialBoard;
  do {
    [changed, board] = iterate(board, 5, visibleNeighbors);
  } while (changed);
  console.log(`Part 2: ${numOccupied(board)}`);
})();
