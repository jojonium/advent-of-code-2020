import { paragraphsAsStrings } from "./helpers";
import path from "path";

/**
 * Calculates the number of questions for which *anyone* in a a particular
 * group responded "yes" and sums them across all groups
 */
const anyYesAnswers = (groups: string[]): number =>
  groups
    .map(
      (group) =>
        group
          .split("")
          .filter(
            (value, index, array) =>
              value !== "\n" && array.indexOf(value) === index
          ).length
    )
    .reduce((prev, cur) => prev + cur);

/**
 * Calculates the number of questions for which *everyone* in a a particular
 * group responded "yes" and sums them across all groups
 */
const everyYesAnswers = (groups: string[]): number =>
  groups
    .map((group) => {
      // use a plain object as a map to track how many times each letter appears
      const counts: { [key: string]: number } = {};
      // there is one more member than newline
      ("\n" + group).split("").forEach((letter) => {
        counts[letter] = 1 + (counts[letter] ?? 0);
      });
      const members = counts["\n"];
      return Object.values(counts).filter((val) => val === members).length - 1;
    })
    .reduce((prev, cur) => prev + cur);

(async () => {
  const input = await paragraphsAsStrings(
    path.join(".", "inputs", "day06.txt")
  );
  console.log(`Part 1: ${anyYesAnswers(input)}`);
  console.log(`Part 2: ${everyYesAnswers(input)}`);
})();
