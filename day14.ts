import { linesAsStrings } from "./helpers";
import path from "path";

/**
 * JavaScript (and by extension TypeScript) has no concept of unsigned integers.
 * The 'number' type is always a 64-bit floating point value, and it converted
 * to a signed integer for bitwise operations and then converted back. To get
 * around this, we implement our own bitwise operations on strings of 1s and 0s.
 */
const bitwiseOr = (a: string, b: string): string => {
  let out = "";
  for (let i = 0; i < a.length; ++i) {
    if (a.charAt(i) === "1" || b.charAt(i) === "1") out += "1";
    else out += "0";
  }
  return out;
};

const bitwiseAnd = (a: string, b: string): string => {
  let out = "";
  for (let i = 0; i < a.length; ++i) {
    if (a.charAt(i) === "1" && b.charAt(i) === "1") out += "1";
    else out += "0";
  }
  return out;
};

/**
 * Combines a mask with an address for part 2, preserving X's in the mask.
 */
const combineX = (address: string, mask: string): string => {
  let out = "";
  for (let i = 0; i < address.length; ++i) {
    if (mask.charAt(i) === "1") out += "1";
    else if (mask.charAt(i) === "0") out += address.charAt(i);
    else out += "X";
  }
  return out;
};

/**
 * Sets memory at the provided addresses the masked values specified in the
 * input, then returns the sum of every non-zero value in memory.
 */
const part1 = (lines: string[]): number => {
  let oneMask = "000000000000000000000000000000000000";
  let zeroMask = "000000000000000000000000000000000000";
  const memory = new Map<number, number>();
  for (const line of lines) {
    if (line.startsWith("mask = ")) {
      const maskLine = line.substr(7);
      oneMask = maskLine.replace(/X/g, "0");
      zeroMask = maskLine.replace(/X/g, "1");
    } else {
      const m = line.match(/^mem\[(\d+)] = (\d+)$/);
      if (m === null || m.length < 3) throw new Error(`Weird line: '${line}'`);
      const address = +m[1];
      let value = parseInt(m[2])
        .toString(2)
        .padStart(36, "0");
      value = bitwiseOr(value, oneMask);
      value = bitwiseAnd(value, zeroMask);
      memory.set(address, parseInt(value, 2));
    }
  }
  let sum = 0;
  for (const v of memory.values()) sum += v;
  return sum;
};

/**
 * Sets memory at all addresses specified by the mask and address in the input
 * to the given value, and returns the sum of every non-zero value in memory.
 */
const part2 = (lines: string[]): number => {
  let mask = "000000000000000000000000000000000000";
  const memory = new Map<number, number>();
  for (const line of lines) {
    if (line.startsWith("mask = ")) {
      mask = line.substr(7);
    } else {
      const m = line.match(/^mem\[(\d+)] = (\d+)$/);
      if (m === null || m.length < 3) throw new Error(`Weird line: '${line}'`);
      const maskedAddress = combineX(
        parseInt(m[1])
          .toString(2)
          .padStart(36, "0"),
        mask
      );
      const value = parseInt(m[2])
        .toString(2)
        .padStart(36, "0");
      writePart2(maskedAddress, value, memory);
    }
  }
  let sum = 0;
  for (const v of memory.values()) sum += v;
  return sum;
};

/**
 * Helper for part 2 that writes a value to memory for all addresses expressed
 * by the combination of the mask and address.
 */
const writePart2 = (
  maskedAddress: string,
  value: string,
  memory: Map<number, number>
): void => {
  if (maskedAddress.indexOf("X") === -1) {
    memory.set(parseInt(maskedAddress, 2), parseInt(value, 2));
  } else {
    // recursively write every combination of values for X's
    writePart2(maskedAddress.replace("X", "0"), value, memory);
    writePart2(maskedAddress.replace("X", "1"), value, memory);
  }
};

(async () => {
  const input = await linesAsStrings(path.join(".", "inputs", "day14.txt"));
  console.log(`Part 1: ${part1(input)}`);
  console.log(`Part 2: ${part2(input)}`);
})();
