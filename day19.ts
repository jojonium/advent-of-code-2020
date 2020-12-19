import { linesAsStrings } from "./helpers";
import path from "path";

abstract class Rule {
  constructor() {}
  abstract validate(
    input: string,
    otherRules: Map<number, Rule>
  ): { valid: boolean; length: number };
  abstract output(otherRules: Map<number, Rule>, length: number): string;
}

class TerminalRule extends Rule {
  constructor(private template: string) {
    super();
  }
  validate(
    input: string,
    _otherRules: Map<number, Rule>
  ): { valid: boolean; length: number } {
    return {
      valid: input.startsWith(this.template),
      length: 1,
    };
  }
  output(): string {
    return this.template;
  }
}

let asdf = 0;

class SequenceRule extends Rule {
  constructor(private seq: number[]) {
    super();
  }
  validate(
    input: string,
    otherRules: Map<number, Rule>
  ): { valid: boolean; length: number } {
    let i = 0;
    let counter = 0;
    while (i < input.length && counter < this.seq.length) {
      const result = otherRules
        .get(this.seq[counter++])
        ?.validate(input.slice(i), otherRules);
      if (result === undefined) throw new Error("No rule " + this.seq[counter]);
      if (!result.valid) return result;
      i += result.length;
    }
    return {
      valid: true,
      length: i,
    };
  }
  output(otherRules: Map<number, Rule>, length: number): string {
    if (this.seq[0] === 42 && this.seq[1] === 8) {
      return (otherRules.get(42)?.output(otherRules, length) ?? "") + "+";
    } else if (this.seq[0] === 42 && this.seq[1] === 11 && this.seq[2] === 31) {
      if (asdf++ > 10)
        return (
          (otherRules.get(42)?.output(otherRules, length) ?? "") +
          (otherRules.get(31)?.output(otherRules, length) ?? "")
        );
    }

    return this.seq.reduce(
      (prev, cur) =>
        prev + otherRules.get(cur)?.output(otherRules, length + prev.length),
      ""
    );
  }
}

class BranchRule extends Rule {
  constructor(private left: SequenceRule, private right: SequenceRule) {
    super();
  }
  validate(
    input: string,
    otherRules: Map<number, Rule>
  ): { valid: boolean; length: number } {
    const l = this.left.validate(input, otherRules);
    if (l.valid) return l;
    else return this.right.validate(input, otherRules);
  }
  output(otherRules: Map<number, Rule>, length: number): string {
    const lo = this.left.output(otherRules, length);
    const ro = this.right.output(otherRules, length);
    if (lo === "") return ro;
    if (ro === "") return lo;
    return `(${lo}|${ro})`;
  }
}

/**
 * Parses text input into a map of Rule objects.
 */
const parseRules = (lines: string[]): Map<number, Rule> => {
  const rules = new Map<number, Rule>();
  for (const line of lines) {
    const pieces = line.split(" ");
    const index = parseInt(pieces[0].substring(0, pieces[0].length - 1));
    if (/^"[a-z]"$/.test(pieces[1])) {
      // terminal rule
      rules.set(index, new TerminalRule(pieces[1].substr(1, 1)));
    } else {
      let sawPipe = false;
      const left = new Array<number>();
      const right = new Array<number>();
      for (const piece of pieces.slice(1)) {
        if (piece === "|") {
          sawPipe = true;
        } else {
          const num = parseInt(piece);
          if (sawPipe) right.push(num);
          else left.push(num);
        }
      }
      if (right.length === 0) {
        // sequence rule
        rules.set(index, new SequenceRule(left));
      } else {
        // branch rule
        rules.set(
          index,
          new BranchRule(new SequenceRule(left), new SequenceRule(right))
        );
      }
    }
  }
  return rules;
};

/**
 * Validates a line of input starting with a given rule.
 */
const validate = (
  line: string,
  rule: Rule,
  otherRules: Map<number, Rule>
): boolean => {
  const result = rule.validate(line, otherRules);
  return result.valid && result.length === line.length;
};

(async () => {
  let input = await linesAsStrings(path.join(".", "inputs", "day19.txt"));
  /*
  input = [
    "42: 9 14 | 10 1",
    "9: 14 27 | 1 26",
    "10: 23 14 | 28 1",
    '1: "a"',
    "11: 42 31",
    "5: 1 14 | 15 1",
    "19: 14 1 | 14 14",
    "12: 24 14 | 19 1",
    "16: 15 1 | 14 14",
    "31: 14 17 | 1 13",
    "6: 14 14 | 1 14",
    "2: 1 24 | 14 4",
    "0: 8 11",
    "13: 14 3 | 1 12",
    "15: 1 | 14",
    "17: 14 2 | 1 7",
    "23: 25 1 | 22 14",
    "28: 16 1",
    "4: 1 1",
    "20: 14 14 | 1 15",
    "3: 5 14 | 16 1",
    "27: 1 6 | 14 18",
    '14: "b"',
    "21: 14 1 | 1 14",
    "25: 1 1 | 1 14",
    "22: 14 14",
    "8: 42",
    "26: 14 22 | 1 20",
    "18: 15 15",
    "7: 14 5 | 1 21",
    "24: 14 1",
    "",
    "abbbbbabbbaaaababbaabbbbabababbbabbbbbbabaaaa",
    "bbabbbbaabaabba",
    "babbbbaabbbbbabbbbbbaabaaabaaa",
    "aaabbbbbbaaaabaababaabababbabaaabbababababaaa",
    "bbbbbbbaaaabbbbaaabbabaaa",
    "bbbababbbbaaaaaaaabbababaaababaabab",
    "ababaaaaaabaaab",
    "ababaaaaabbbaba",
    "baabbaaaabbaaaababbaababb",
    "abbbbabbbbaaaababbbbbbaaaababb",
    "aaaaabbaabaaaaababaa",
    "aaaabbaaaabbaaa",
    "aaaabbaabbaaaaaaabbbabbbaaabbaabaaa",
    "babaaabbbaaabaababbaabababaaab",
    "aabbbbbaabbbaaaaaabbbbbababaaaaabbaaabba",
  ];
  */

  const blankLine = input.indexOf("");
  const rules = parseRules(input.slice(0, blankLine));
  const r0 = rules.get(0);
  if (r0 === undefined) throw new Error("No rule 0!");
  console.log(
    `Part 1: ${input
      .slice(blankLine + 1)
      .reduce((prev, cur) => (validate(cur, r0, rules) ? prev + 1 : prev), 0)}`
  );

  rules.set(
    8,
    new BranchRule(new SequenceRule([42]), new SequenceRule([42, 8]))
  );
  rules.set(
    11,
    new BranchRule(new SequenceRule([42, 31]), new SequenceRule([42, 11, 31]))
  );
  const re = new RegExp(`^${r0.output(rules, 0)}$`);
  console.log(re);
  console.log(
    `Part 2: ${input.slice(blankLine + 1).reduce((prev, cur) => {
      if (re.test(cur)) {
        console.log(cur);
        return prev + 1;
      } else {
        return prev;
      }
    }, 0)}`
  );
})();
