import { linesAsNumbers } from "./helpers";
import path from "path";

/**
 * Uses all adapters to gradually step up from 0 to max(adapters) + 3, and
 * calculates the distribution of 1, 2, and 3-jolt jumps used to get there.
 * Big brain functional version.
 */
const distributions = (adapters: Array<number>): number[] =>
  adapters
    .sort((a, b) => a - b)
    .reduce(
      (prev, cur) => {
        const dists = prev.distributions;
        dists[cur - prev.joltage - 1]++;
        return { joltage: cur, distributions: dists };
      },
      // note that the number of 3 jolt differences starts at 1 to account for
      // the jump from the last adapter to the device
      { joltage: 0, distributions: [0, 0, 1] }
    ).distributions;

/**
 * Finds the number of unique combinations of adapters that can be used to step
 * all the way up to a joltage of max(adapters) + 3.
 * Small brain procedural version.
 */
const combinations = (adapters: Array<number>): number => {
  adapters = adapters.sort((a, b) => a - b);
  const target = adapters[adapters.length - 1];
  const cache = new Array<number>(target + 1).fill(0);
  cache[0] = 1; // choose none of the adapters to reach joltage 0
  for (const adapter of adapters) {
    for (let i = 1; i <= 3 && adapter - i >= 0; ++i) {
      cache[adapter] += cache[adapter - i];
    }
  }

  return cache[target];
};

(async () => {
  const input = await linesAsNumbers(path.join(".", "inputs", "day10.txt"));
  const dists = distributions(input);
  console.log(`Part 1: ${dists[0] * dists[2]}`);
  console.log(`Part 2: ${combinations(input)}`);
})();
