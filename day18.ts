import {linesAsStrings} from "./helpers";
import path from "path";

/**
 * Finds the index of the matching parenthesis that closes the opening
 * parenthesis at the given index.
 * @param line the string to search through
 * @param the index of the opening parenthesis
 */
const closingParenIndex = (line: string, start: number): number => {
  let parenCount = 1;
  for (let i = start + 1; i < line.length; ++i) {
    if (line.charAt(i) === "(") parenCount++;
    else if (line.charAt(i) === ")") {
      parenCount--;
      if (parenCount === 0) return i;
    }
  }
  throw new Error(`Couldn't find closing paren in line '${line}'`);
};

/**
 * Finds the index of the next multiplication operator at the same parenthetical
 * level, or the end of the string if there isn't one.
 * @param line the string to search through
 * @param start index to start searching from
 */
const nextMultiplierIndex = (line: string, start: number): number => {
  let parenCount = 0;
  let i;
  for (i = start + 1; i < line.length; ++i) {
    if (line.charAt(i) === "*" && parenCount <= 0) return i;
    if (line.charAt(i) === "(") parenCount++;
    else if (line.charAt(i) === ")") parenCount--;
  }
  return i;
};

/**
 * Evaluates a string of +, *, and parenthesis with left-to-right operator
 * precedence.
 * Assumptions: number literals are all exactly one digit.
 */
const evaluate = (line: string): number => {
  let val;
  let operator = "";
  for (let i = 0; i < line.length; ++i) {
    const char = line.charAt(i);
    if (char === " " || char === ")") {
      continue;
    } else if (char === "+" || char === "*") {
      operator = char;
    } else if (/\d/.test(char)) {
      // got a digit
      const nextVal = parseInt(char);
      if (val === undefined) val = nextVal;
      else if (operator === "+") val += nextVal;
      else if (operator === "*") val *= nextVal;
      else throw new Error(`Invalid operator: '${operator}', i=${i}`);
    } else if (char === "(") {
      // got start of parenthetical
      const closingIndex = closingParenIndex(line, i);
      const nextVal = evaluate(line.substring(i + 1, closingIndex));
      if (val === undefined) val = nextVal;
      else if (operator === "+") val += nextVal;
      else if (operator === "*") val *= nextVal;
      else val = nextVal;
      i = closingIndex + 1;
    } else {
      throw new Error(`Unexpected character: '${char}'`);
    }
  }
  if (val === undefined) throw new Error("Something went really wrong!");
  return val;
};

/**
 * @param index the index right after the +
 */
const lookAheadPlus = (
  line: string,
  index: number
): {nextVal: number, nextI: number} => {
  for (let i = index; i < line.length; ++i) {
    if (/\d/.test(line.charAt(i))) {
      const n = parseInt(line.charAt(i));
      // console.log(`lookAheadPlus... got ${n}`);
      return {nextVal: n, nextI: i + 1};
    } else if (line.charAt(i) === "(") {
      const closingIndex = closingParenIndex(line, i);
      const n = evaluateP2(line.substring(i + 1, closingIndex));
      // console.log(`lookAheadPlus... got ${n}`);
      return {
        nextVal: n,
        nextI: closingIndex + 1
      }
    }
  }
  throw new Error("Shouldn't have gotten here (plus)");
};

/**
 * @param index the index right after the *
 */
const lookAheadTimes = (
  line: string,
  timesIndex: number
): {nextVal: number, nextI: number} => {
  for (let i = timesIndex; i < line.length; ++i) {
    if (/\d/.test(line.charAt(i)) || line.charAt(i) === "(") {
      const closingIndex = nextMultiplierIndex(line, i - 1);
      const n = evaluateP2(line.substring(i, closingIndex));
      // console.log(`lookAheadTimes... got ${n}`);
      return {
        nextVal: n,
        nextI: closingIndex - 1
      };
    } else if (line.charAt(i) === "(") {
      const closingIndex = closingParenIndex(line, i);
      const n = evaluateP2(line.substring(i + 1, closingIndex));
      // console.log(`lookAheadTimes... got ${n}`);
      return {
        nextVal: n,
        nextI: closingIndex + 1
      };
    }
  }
  throw new Error("Shouldn't have gotten here (times)");
};

const evaluateP2 = (line: string): number => {
  // console.log(`Evaluating '${line}'`);
  let {nextVal: val, nextI: i} = lookAheadPlus(line, 0);
  for (; i < line.length; ++i) {
    const char = line.charAt(i);
    if (char === " " || char === ")") {
      continue;
    } else if (char === "+") {
      const ahead = lookAheadPlus(line, i + 1);
      val += ahead.nextVal;
      i = ahead.nextI;
    } else if (char === "*") {
      const ahead = lookAheadTimes(line, i + 1);
      val *= ahead.nextVal;
      i = ahead.nextI;
    }
  }
  // console.log(`Returning ${val}`);
  return val;
};

(async () => {
  const input = await linesAsStrings(path.join(".", "inputs", "day18.txt"));
  const part1 = input.reduce((prev, cur) => prev + evaluate(cur), 0);
  console.log(`Part 1: ${part1 === 5374004645253}`);
  const part2 = input.reduce((prev, cur) => prev + evaluateP2(cur), 0);
  console.log(`Part 2: ${part2}`);
  // Tests:
  /*
  console.log(evaluateP2("1 + (2 * 3) + (4 * (5 + 6))") === 51);
  console.log(evaluateP2("2 * 3 + (4 * 5)") === 46);
  console.log(evaluateP2("5 + (8 * 3 + 9 + 3 * 4 * 3)") === 1445);
  console.log(evaluateP2("5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))") === 669060);
  console.log(evaluateP2("((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2") === 23340);
  console.log(evaluateP2("(5 * (4 * 7) + 6)") === 170);
  */
})();
