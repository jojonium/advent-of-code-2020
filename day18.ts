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
 * Looks ahead to get the right side argument of a high-priority operator.
 * @param index the index right after the operator
 */
const lookAheadHigh = (
  line: string,
  index: number,
  p2Mode: boolean
): {nextVal: number, nextI: number} => {
  for (let i = index; i < line.length; ++i) {
    if (/\d/.test(line.charAt(i))) {
      const n = parseInt(line.charAt(i));
      return {nextVal: n, nextI: i + 1};
    } else if (line.charAt(i) === "(") {
      const closingIndex = closingParenIndex(line, i);
      const n = evaluate(line.substring(i + 1, closingIndex), p2Mode);
      return {
        nextVal: n,
        nextI: closingIndex + 1
      }
    }
  }
  throw new Error("Shouldn't have gotten here (plus)");
};

/**
 * Looks ahead to get the right side argument of a low-priority operator.
 * @param index the index right after the operator
 */
const lookAheadLow = (
  line: string,
  timesIndex: number,
  p2Mode: boolean
): {nextVal: number, nextI: number} => {
  for (let i = timesIndex; i < line.length; ++i) {
    if (/\d/.test(line.charAt(i)) || line.charAt(i) === "(") {
      const closingIndex = nextMultiplierIndex(line, i - 1);
      const n = evaluate(line.substring(i, closingIndex), p2Mode);
      return {
        nextVal: n,
        nextI: closingIndex - 1
      };
    } else if (line.charAt(i) === "(") {
      const closingIndex = closingParenIndex(line, i);
      const n = evaluate(line.substring(i + 1, closingIndex), p2Mode);
      return {
        nextVal: n,
        nextI: closingIndex + 1
      };
    }
  }
  throw new Error("Shouldn't have gotten here (times)");
};

/**
 * Evaluates a line containing addition, multiplication, and parenthesis
 * according to the precedence rules of the problem.
 * @param p2Mode whether to consider + as higher operator priority than *
 */
const evaluate = (line: string, p2Mode = false): number => {
  let {nextVal: val, nextI: i} = lookAheadHigh(line, 0, p2Mode);
  for (; i < line.length; ++i) {
    if (line.charAt(i) === "+") {
      const ahead = lookAheadHigh(line, i + 1, p2Mode);
      val += ahead.nextVal;
      i = ahead.nextI;
    } else if (line.charAt(i) === "*") {
      const ahead = p2Mode
        ? lookAheadLow(line, i + 1, p2Mode)
        : lookAheadHigh(line, i + 1, p2Mode);
      val *= ahead.nextVal;
      i = ahead.nextI;
    }
  }
  return val;
};

(async () => {
  const input = await linesAsStrings(path.join(".", "inputs", "day18.txt"));
  const part1 = input.reduce((prev, cur) => prev + evaluate(cur), 0);
  console.log(`Part 1: ${part1}`);
  const part2 = input.reduce((prev, cur) => prev + evaluate(cur, true), 0);
  console.log(`Part 2: ${part2}`);
  /*
   * Tests
  console.log(evaluate("2 * 3 + (4 * 5)") === 26);
  console.log(evaluate("5 + (8 * 3 + 9 + 3 * 4 * 3)") === 437);
  console.log(evaluate("5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))") === 12240);
  console.log(evaluate("((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2") === 13632);
  console.log(evaluate("1 + (2 * 3) + (4 * (5 + 6))", true) === 51);
  console.log(evaluate("2 * 3 + (4 * 5)", true) === 46);
  console.log(evaluate("5 + (8 * 3 + 9 + 3 * 4 * 3)", true) === 1445);
  console.log(evaluate("5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))", true) === 669060);
  console.log(evaluate("((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2", true) === 23340);
  console.log(evaluate("(5 * (4 * 7) + 6)", true) === 170);
   */
})();
