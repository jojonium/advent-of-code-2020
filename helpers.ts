import fs from "fs";
const fsPromises = fs.promises;

/**
 * Reads in a file and returns each non-empty line as a string.
 */
export const linesAsStrings = async (filename: string): Promise<string[]> => {
  return (await fsPromises.readFile(filename))
    .toString()
    .split("\n")
    .filter((s) => s.length > 0);
};

/**
 * Reads in a file where each line is a number and returns it as an array of
 * numbers
 */
export const linesAsNumbers = async (filename: string): Promise<number[]> => {
  return (await linesAsStrings(filename)).map((s) => +s);
};
