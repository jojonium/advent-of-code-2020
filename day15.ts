import { linesAsStrings } from "./helpers";
import path from "path";

/**
 * Returns the number that would be spoken on turn `end` given the provided
 * starting numbers.
 */
const memoryGame = (nums: number[], end = 2020): number => {
  // map of a number and the turn on which it was last spoken
  const prev = new Map<number, number>();
  nums.forEach((num, index) => prev.set(num, index + 1));
  let lastNum = nums[nums.length - 1];
  let nextNum = -1;
  for (let turn = nums.length + 1; turn <= end; ++turn) {
    // get next number
    const lastTimeSpoken = prev.get(lastNum);
    if (lastTimeSpoken === undefined) {
      nextNum = 0;
    } else {
      nextNum = turn - 1 - lastTimeSpoken;
    }
    prev.set(lastNum, turn - 1);
    lastNum = nextNum;
  }
  return nextNum;
};

(async () => {
  let input = (await linesAsStrings(path.join(".", "inputs", "day15.txt")))[0]
    .split(",")
    .map((s) => parseInt(s));
  console.log(`Part 1: ${memoryGame(input)}`);
  /**
   * Not sure if there's supposed to be a clever trick for this part, my naive
   * method ran in 5 seconds on my machine ¯\_(ツ)_/¯
   */
  console.log(`Part 2: ${memoryGame(input, 30000000)}`);
})();
