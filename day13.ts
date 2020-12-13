import { linesAsStrings } from "./helpers";
import path from "path";

/**
 * Finds the amount of time you have to wait between your earliest departure and
 * the next bus to arrive after.
 */
const timeToWait = (earliestDeparture: number, buses: number[]): number =>
  buses.reduce(
    (out, bus) => {
      const arrival = earliestDeparture + bus - (earliestDeparture % bus);
      if (arrival < out.wait) {
        return {
          id: bus,
          wait: arrival,
          answer: (arrival - earliestDeparture) * bus,
        };
      }
      return out;
    },
    { id: 0, wait: Infinity, answer: 0 }
  ).answer;

/**
 * Returns the modulo inverse of a with repect to m.
 */
const multInverse = (a: number, m: number): number => {
  const m0 = m;
  let x0 = 0;
  let x1 = 1;
  if (m === 1) return 0;
  // apply extended Euclid algorithm
  while (a > 1) {
    const q = Math.floor(a / m);
    let t = m;
    m = a % m;
    a = t;
    t = x0;
    x0 = x1 - q * x0;
    x1 = t;
  }
  if (x1 < 0) x1 += m0;
  return x1;
};

/**
 * Returns the smallest number x such that:
 *   x % nums[i] === remainders[i]
 * for all i in (0, nums.length).
 */
const chineseRemainderTheorem = (
  nums: number[],
  remainders: number[]
): number => {
  let sum = 0;
  const prod = nums.reduce((a, b) => a * b);
  for (let i = 0; i < nums.length; ++i) {
    const p = Math.floor(prod / nums[i]);
    sum += remainders[i] * multInverse(p, nums[i]) * p;
  }
  return sum % prod;
};

/**
 * Finds the earliest timestamp such that all the listed bus IDs depart at
 * offsets matching their positions in the list.
 * @param buses the bus ID's, with "x"s expressed as 0's
 */
const subsequentDepartures = (buses: number[]): number => {
  const nums = new Array<number>();
  const remainders = new Array<number>();
  buses.forEach((bus, index) => {
    if (bus !== 0) {
      const rem = bus - index;
      nums.push(bus);
      remainders.push(rem);
    }
  });
  const out = chineseRemainderTheorem(nums, remainders);
  return out;
};

(async () => {
  const input = await linesAsStrings(path.join(".", "inputs", "day13.txt"));
  const earliestDeparture = +input[0];
  const buses = input[1]
    .split(",")
    .filter((s) => s !== "x")
    .map((s) => parseInt(s));
  console.log(`Part 1: ${timeToWait(earliestDeparture, buses)}`);
  const busesPart2 = input[1]
    .split(",")
    .map((s) => (s === "x" ? 0 : parseInt(s)));
  console.log(`Part 2: ${subsequentDepartures(busesPart2)}`);
})();
