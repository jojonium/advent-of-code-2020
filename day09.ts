import { linesAsNumbers } from "./helpers";
import path from "path";

/**
 * Checks whether any two of the last few numbers sum to the current number.
 */
const check = (current: number, lastFew: Array<number>): boolean => {
  for (const x of lastFew) {
    for (const y of lastFew) {
      if (x + y === current) return true;
    }
  }
  return false;
};

/**
 * Finds the first number in the list that is not the sum of any two of the last
 * x numbers, where x is the preamble size.
 */
const firstInvalid = (data: Array<number>, preambleSize: number): number => {
  for (let i = preambleSize; i < data.length; ++i) {
    if (!check(data[i], data.slice(i - preambleSize, i))) return data[i];
  }
  throw new Error("All the numbers obey the rules!");
};

/**
 * Finds a contiguous range of numbers in the input list that sum to the target
 * number, and returns the sum of the minimum and maximum values in that range.
 */
const contiguousSum = (data: Array<number>, target: number): number => {
  for (let i = 0; i < data.length; ++i) {
    let sum = data[i];
    let j = i;
    while (sum < target) {
      sum += data[++j];
    }
    if (sum === target) {
      // got it
      const range = data.slice(i, j + 1);
      return Math.min(...range) + Math.max(...range);
    }
  }
  throw new Error("No matching range found!");
};

(async () => {
  const input = await linesAsNumbers(path.join(".", "inputs", "day09.txt"));
  const part1 = firstInvalid(input, 25);
  console.log(`Part 1: ${part1}`);
  console.log(`Part 1: ${contiguousSum(input, part1)}`);
})();
