import { linesAsStrings } from "./helpers";
import path from "path";

/**
 * Calculates the number of trees (1s) you'd encounter starting in the top left
 * corner of the map [0, 0] and traveling at the given slope to the bottom of
 * the map.
 * @param map a 2D array of 0 (empty) and 1 (tree). Index as map[row][column].
 */
const tobogganRoute = (
  map: number[][],
  slopeRight = 3,
  slopeDown = 1
): number => {
  let col = 0;
  let row = 0;
  const height = map.length;
  const width = map[0].length;
  let trees = 0;
  while (row < height) {
    if (map[row][col] === 1) trees++;
    col = (col + slopeRight) % width;
    row = row + slopeDown;
  }
  return trees;
};

/**
 * Converts the string lines of the input file to a map of numbers where 0
 * represents empty and 1 represents tree, indexed as map[row][column].
 */
const linesToMap = (lines: string[]): number[][] =>
  lines.map((line) =>
    line
      .trim()
      .split("")
      .map((letter) => (letter === "#" ? 1 : 0))
  );

(async () => {
  const input = await linesAsStrings(path.join(".", "inputs", "day03.txt"));
  const map = linesToMap(input);
  console.log(`Part 1: ${tobogganRoute(map)}`);
  const part2 =
    tobogganRoute(map, 1, 1) *
    tobogganRoute(map, 3, 1) *
    tobogganRoute(map, 5, 1) *
    tobogganRoute(map, 7, 1) *
    tobogganRoute(map, 1, 2);
  console.log(`Part 2: ${part2}`);
})();
