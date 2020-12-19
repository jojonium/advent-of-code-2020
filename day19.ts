import { linesAsStrings } from "./helpers";
import path from "path";

abstract class Rule {
  /**
   * Returns a regular expression that validates this rule.
   * @param depth the number of times we've encountered rule 11 before.
   */
  abstract toRegex(otherRules: Map<number, Rule>, depth: number): string;
}

class TerminalRule extends Rule {
  constructor(private template: string) {
    super();
  }
  toRegex(): string {
    return this.template;
  }
}

class SequenceRule extends Rule {
  constructor(private seq: number[]) {
    super();
  }
  toRegex(otherRules: Map<number, Rule>, depth: number): string {
    // manually check the only two looping rules
    if (this.seq[0] === 42 && this.seq[1] === 8) {
      // this is a simple repetition that can be expressed with regex
      return (otherRules.get(42)?.toRegex(otherRules, depth) ?? "") + "+";
    } else if (this.seq[0] === 42 && this.seq[1] === 11 && this.seq[2] === 31) {
      /*
       * This one can't be expressed by regular expressions:
       * 11: 42 31 | 42 11 31
       * Instead we just stop expanding after seeing it more than 10 times,
       * because we know our input lines are shorter than that.
       */
      depth++;
      if (depth > 10) {
        return (
          (otherRules.get(42)?.toRegex(otherRules, depth) ?? "") +
          (otherRules.get(31)?.toRegex(otherRules, depth) ?? "")
        );
      }
    }
    return this.seq.reduce(
      (prev, cur) => prev + otherRules.get(cur)?.toRegex(otherRules, depth),
      ""
    );
  }
}

class BranchRule extends Rule {
  constructor(private left: SequenceRule, private right: SequenceRule) {
    super();
  }
  toRegex(otherRules: Map<number, Rule>, depth: number): string {
    const lo = this.left.toRegex(otherRules, depth);
    const ro = this.right.toRegex(otherRules, depth);
    if (lo === "") return ro;
    if (ro === "") return lo;
    return `(${lo}|${ro})`;
  }
}

/**
 * Takes in input rules and returns a regular expression that validates lines
 * according to the rules. Because of the change in part 2, the grammar is no
 * longer regular, so regex is not a valid general solution. However, there is a
 * limit to how long our input lines are so we can just stop expanding after a
 * exceeding that length.
 */
const parseRegex = (lines: string[]): RegExp => {
  const rules = new Map<number, Rule>();
  for (const line of lines) {
    const [index, rest] = line.split(": ");
    if (rest.charAt(0) === '"') {
      rules.set(+index, new TerminalRule(rest.charAt(1)));
    } else {
      const [left, right] = rest.split("|");
      if (right === undefined) {
        rules.set(
          +index,
          new SequenceRule(
            left
              .split(" ")
              .filter((s) => s.length > 0)
              .map((s) => parseInt(s))
          )
        );
      } else {
        rules.set(
          +index,
          new BranchRule(
            new SequenceRule(
              left
                .split(" ")
                .filter((s) => s.length > 0)
                .map((s) => parseInt(s))
            ),
            new SequenceRule(
              right
                .split(" ")
                .filter((s) => s.length > 0)
                .map((s) => parseInt(s))
            )
          )
        );
      }
    }
  }
  const r0 = rules.get(0);
  if (r0 === undefined) throw new Error("No rule 0!");
  return new RegExp(`^${r0.toRegex(rules, 0)}$`);
};

(async () => {
  let input = await linesAsStrings(path.join(".", "inputs", "day19.txt"));
  const blankLine = input.indexOf("");
  let regex = parseRegex(input.slice(0, blankLine));
  console.log(
    `Part 1: ${input
      .slice(blankLine + 1)
      .reduce((prev, cur) => (regex.test(cur) ? prev + 1 : prev), 0)}`
  );
  regex = parseRegex(
    input.slice(0, blankLine).concat(["8: 42 | 42 8", "11: 42 31 | 42 11 31"])
  );
  console.log(
    `Part 2: ${input
      .slice(blankLine + 1)
      .reduce((prev, cur) => (regex.test(cur) ? prev + 1 : prev), 0)}`
  );
})();
