import fs from "fs";
const fsPromises = fs.promises;

/**
 * Reads in a file where each line is a number and returns it as an array of
 * numbers
 */
export const linesAsNumbers = async (filename: string): Promise<number[]> => {
  return (await fsPromises.readFile(filename))
    .toString()
    .split("\n")
    .map((s) => +s);
};
