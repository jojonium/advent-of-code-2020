import fs from "fs";
const fsPromises = fs.promises;

/**
 * Reads in a file and returns each non-empty line as a string.
 */
export const linesAsStrings = async (filename: string): Promise<string[]> =>
  (await fsPromises.readFile(filename))
    .toString()
    .trim()
    .split("\n");

/**
 * Reads in a file and returns a list of paragraphs. A paragraph is any number
 * of lines followed by a blank line ("\n\n")
 */
export const paragraphsAsStrings = async (
  filename: string
): Promise<string[]> =>
  (await fsPromises.readFile(filename))
    .toString()
    .trim()
    .split("\n\n");

/**
 * Reads in a file where each line is a number and returns it as an array of
 * numbers
 */
export const linesAsNumbers = async (filename: string): Promise<number[]> => {
  return (await linesAsStrings(filename)).map((s) => +s);
};

/**
 * Returns a file's contents as one big string.
 */
export const fileToString = async (filename: string): Promise<string> =>
  (await fsPromises.readFile(filename)).toString();
