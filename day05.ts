import { linesAsStrings } from "./helpers";
import path from "path";

/**
 * Follows the given specification to find the specified row and column and
 * returns the seat ID.
 * @param spec remaining instructions
 */
const binarySearch = (
  spec: string,
  lowerRow = 0,
  upperRow = 127,
  lowerCol = 0,
  upperCol = 7
): number => {
  // base case
  if (spec.length === 0) {
    return lowerRow * 8 + lowerCol;
  }

  // recursion
  const next = spec.charAt(0);
  if (spec.length > 3) {
    // next instruction should be for a row
    const midPoint = lowerRow + Math.floor((upperRow - lowerRow) / 2);
    if (next === "F") upperRow = midPoint;
    else if (next === "B") lowerRow = midPoint + 1;
    else throw new Error(`Got illegal character '${next}' in spec '${spec}'`);
  } else {
    // next instruction should be for a column
    const midPoint = lowerCol + Math.floor((upperCol - lowerCol) / 2);
    if (next === "L") upperCol = midPoint;
    else if (next === "R") lowerCol = midPoint + 1;
    else throw new Error(`Got illegal character '${next}' in spec '${spec}'`);
  }
  return binarySearch(spec.substr(1), lowerRow, upperRow, lowerCol, upperCol);
};

/**
 * This approach finds the same result as the recusive function above, but it
 * is a bit smarter and realizes that the binary search specification is the
 * same way numbers are expressed in binary.
 */
const binarySearchFaster = (spec: string): number =>
  parseInt(
    spec
      .substr(0, 7)
      .replace(/F/g, "0")
      .replace(/B/g, "1"),
    2
  ) *
    8 +
  parseInt(
    spec
      .substr(7, 3)
      .replace(/L/g, "0")
      .replace(/R/g, "1"),
    2
  );

/**
 * Finds the missing number in a list of seat IDs. We don't know the list's min
 * or max, but we know the ID immediately preceding and following the missing ID
 * are present in the list.
 */
const findMySeat = (seats: number[]): number => {
  seats = seats.sort((a, b) => a - b);
  for (let i = 0; i < seats.length - 2; ++i) {
    if (seats[i + 1] - seats[i] === 2) {
      return seats[i] + 1;
    }
  }
  throw new Error("Couldn't find it!");
};

(async () => {
  const input = await linesAsStrings(path.join(".", "inputs", "day5.txt"));
  const seats = input.map((line) => binarySearchFaster(line));
  console.log(`Part 1: ${Math.max(...seats)}`);
  console.log(`Part 2: ${findMySeat(seats)}`);
})();
