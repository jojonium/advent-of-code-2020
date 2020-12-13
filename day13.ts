import {linesAsStrings} from "./helpers";
import path from "path";

const timeToWait = (earliestDeparture: number, buses: number[]): number =>
  buses.reduce((out, bus) => {
    const arrival = earliestDeparture + bus - (earliestDeparture % bus)
    if (arrival < out.wait) {
      return {
        id: bus,
        wait: arrival,
        answer: (arrival - earliestDeparture) * bus
      };
    }
    return out;
  }, {id: 0, wait: Infinity, answer: 0}).answer;

/**
 * @param buses the bus ID's, with "x"s expressed as 0's
 */
const subsequentDepartures = (buses: number[]) => {
  const mods: {value: number, index: number}[] = [];
  buses.forEach((b, i) => {
    if (b !== 0) {
      mods.push({value: b, index: i});
    }
  });
  mods.sort((a, b) => b.value - a.value);
  let answer = mods[0].value + mods[0].index;
  let increment = mods[0].value;
  for (const mod of mods.slice(1)) {
    answer = helper(mod.value, mod.index, answer, increment);
    increment *= mod.value;
  }
  return increment - answer + buses[0];
}

const helper = (num: number, index: number, start: number, increment: number): number => {
  console.log(`Helper: num=${num}, index=${index}, start=${start}, increment=${increment}`);
  if (start % num === index) return start;
  let acc = start;
  while (acc % num !== index) acc += increment;
  console.log(acc);
  return acc;
}

/*
const tester = (start: number) => {
  let num = start;
  while (true) {
    num += 17;
    if (num % 17 === 0 && num % 13 === 2 && num % 19 === 3) {
      break;
    }
  }
  return num;
}
*/


(async () => {
  const input = await linesAsStrings(path.join(".", "inputs", "day13.txt"));
  const earliestDeparture = +input[0];
  const buses = input[1].split(",").filter(s => s !== "x").map(s => parseInt(s))
  console.log(`Part 1: ${timeToWait(earliestDeparture, buses)}`);
  const busesPart2 = input[1].split(",").map(s => s === "x" ? 0 : parseInt(s));
  if (busesPart2[0] === -1) { // TODO delete this
    return;
  }
  console.log("Tests");
  // console.log(subsequentDepartures([7, 13, 0, 0, 59, 0, 31, 19]) === 1068788);
  console.log(subsequentDepartures([17, 0, 13, 19]) === 3417 + 17);
  /*
  console.log(subsequentDepartures([67, 7, 59, 61]) === 754018 + 67);
  console.log(subsequentDepartures([67, 0, 7, 59, 61]) === 779210 + 67);
  console.log(subsequentDepartures([67, 7, 0, 59, 61]) === 1261476 + 67);
  console.log(subsequentDepartures([1789, 37, 47, 1889]) === 1202161486 + 1789);
  */

  // console.log(`Part 2: ${subsequentDepartures(busesPart2)}`);
  /*
  let k = 3417;
  for (let i = 0; i < 5; ++i) {
    k = tester(k);
    console.log(k);
  }
 */
})();
