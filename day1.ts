import { linesAsNumbers } from "./helpers";
import path from "path";

/**
 * Find the two entries that sum to 2020 and then return the product of those
 * two numbers.
 */
const part1 = (nums: number[]): number => {
  for (let i = 0; i < nums.length; ++i) {
    for (let j = i + 1; j < nums.length; ++j) {
      if (nums[i] + nums[j] === 2020) return nums[i] * nums[j];
    }
  }
  throw new Error("No two of the numbers sum to 2020");
};

/**
 * Find the THREE entries that sum to 2020 and return their product.
 */
const part2 = (nums: number[]): number => {
  for (let i = 0; i < nums.length; ++i) {
    for (let j = i + 1; j < nums.length; ++j) {
      for (let k = j + 1; k < nums.length; ++k) {
        if (nums[i] + nums[j] + nums[k] === 2020)
          return nums[i] * nums[j] * nums[k];
      }
    }
  }
  throw new Error("No two of the numbers sum to 2020");
};

(async () => {
  const input = await linesAsNumbers(path.join(".", "inputs", "day1.txt"));
  console.log(`Part 1: ${part1(input)}`);
  console.log(`Part 2: ${part2(input)}`);
})();
