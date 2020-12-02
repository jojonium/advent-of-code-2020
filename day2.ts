import { linesAsStrings } from "./helpers";
import path from "path";

/**
 * Calculates the number of occurrences of a substring within a string.
 */
const occurrences = (str: string, pattern: string): number => {
  let out = 0;
  for (let i = 0; i < str.length; ++i) {
    let index = str.indexOf(pattern, i);
    if (index !== -1) {
      out++;
      i = index;
    }
  }
  return out;
};

interface LineData {
  a: number;
  b: number;
  letter: string;
  password: string;
}

/**
 * Parses an input line into the relevant pieces: the first and second numbers,
 * letter, and password.
 */
const readLine = (line: string): LineData => {
  const regexResult = line.match(/^(\d+)-(\d+) ([a-zA-Z]): (.*)$/);
  if (regexResult === null || regexResult.length < 5) {
    throw new Error(`Line has invalid format: '${line}'`);
  }
  return {
    a: +regexResult[1],
    b: +regexResult[2],
    letter: regexResult[3],
    password: regexResult[4],
  };
};

/**
 * Returns the number of lines in which the password is valid given the part 1
 * rules on that line: the password policy indicates the lowest and highest
 * number of times a given letter must appear for the password to be valid.
 */
export const passwordCheckSled = (lines: string[]): number => {
  let valid = 0;
  for (const line of lines) {
    const data = readLine(line);
    const occ = occurrences(data.password, data.letter);
    if (occ >= data.a && occ <= data.b) valid++;
  }
  return valid;
};

/**
 * Returns the number of lines in which the password is valid given the part 2
 * rules on that line: exactly one of the one-indexed positions at the start of
 * the line must be the given letter for the password to be valid.
 */
export const passwordCheckToboggan = (lines: string[]): number => {
  let valid = 0;
  for (const line of lines) {
    const data = readLine(line);
    if (
      +(data.password.charAt(data.a - 1) === data.letter) +
        +(data.password.charAt(data.b - 1) === data.letter) ===
      1
    ) {
      valid++;
    }
  }
  return valid;
};

(async () => {
  const input = await linesAsStrings(path.join(".", "inputs", "day2.txt"));
  console.log(`Part 1: ${passwordCheckSled(input)}`);
  console.log(`Part 2: ${passwordCheckToboggan(input)}`);
})();
