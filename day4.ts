import { fileToString } from "./helpers";
import path from "path";

/**
 * Splits up a batch of passport data into individual passports and then into
 * individual fields. Each element of the output is a single passport, which is
 * a list of key:value pairs.
 */
const toPassports = (batch: string): string[][] =>
  batch
    .split("\n\n")
    .map((passport) => passport.split(/[\n ]/).filter((e) => e.length > 0));

/**
 * Returns the number of passports that have every required field.
 */
const checkPassports = (passports: string[][]): number => {
  let numValid = 0;
  passportLoop: for (const passport of passports) {
    const passportKeys = passport
      .map((s) => s.substring(0, s.indexOf(":")))
      .sort();

    // both lists are sorted so we can step through them together
    let v = 0;
    let p = 0;
    while (v < rules.length) {
      if (passportKeys[p] === undefined || passportKeys[p] !== rules[v].key) {
        if (rules[v].required) {
          // missing required key, invalid passport
          continue passportLoop;
        } else {
          // missing optional key, move on to next field
          v++;
          continue;
        }
      }
      v++;
      p++;
    }
    numValid++;
  }
  return numValid;
};

/**
 * Returns the number of passports for which every required field is present
 * and the validator passes.
 */
const checkPassportsStrict = (passports: string[][]): number => {
  let numValid = 0;
  passportLoop: for (const passport of passports) {
    // split apart keys and values of each passport entry
    const entries = passport.sort().map((e) => {
      const pieces = e.split(":");
      return { key: pieces[0], value: pieces[1] };
    });

    // both lists are sorted by key so we can step through them together
    let v = 0;
    let e = 0;
    while (v < rules.length) {
      if (entries[e] === undefined || entries[e].key !== rules[v].key) {
        if (rules[v].required) {
          // missing required key, invalid passport
          continue passportLoop;
        } else {
          // missing optional key, move on to next field
          v++;
          continue;
        }
      }
      if (!rules[v].validator(entries[e].value)) {
        // invalid value
        continue passportLoop;
      }
      v++;
      e++;
    }
    // if we make it here all required fields are present and valid
    numValid++;
  }
  return numValid;
};

/** Rules about passport fields, sorted by key. */
const rules: {
  key: string;
  required: boolean;
  validator: (s: string) => boolean;
}[] = [
  {
    key: "byr",
    required: true,
    validator: (s: string) => s.length === 4 && +s >= 1920 && +s <= 2002,
  },
  {
    key: "iyr",
    required: true,
    validator: (s: string) => s.length === 4 && +s >= 2010 && +s <= 2020,
  },
  {
    key: "eyr",
    required: true,
    validator: (s: string) => s.length === 4 && +s >= 2020 && +s <= 2030,
  },
  {
    key: "hgt",
    required: true,
    validator: (s: string) => {
      const m = s.match(/^(\d+)(cm|in)$/);
      return (
        m !== null &&
        m.length === 3 &&
        ((m[2] === "cm" && +m[1] >= 150 && +m[1] <= 193) ||
          (m[2] === "in" && +m[1] >= 59 && +m[1] <= 76))
      );
    },
  },
  {
    key: "hcl",
    required: true,
    validator: (s: string) => /^#[0-9a-f]{6}$/.test(s),
  },
  {
    key: "ecl",
    required: true,
    validator: (s: string) => /^(amb|blu|brn|gry|grn|hzl|oth)$/.test(s),
  },
  {
    key: "pid",
    required: true,
    validator: (s: string) => /^\d{9}$/.test(s),
  },
  {
    key: "cid",
    required: false,
    validator: () => true,
  },
].sort((a, b) => a.key.localeCompare(b.key));

(async () => {
  const passports = toPassports(
    await fileToString(path.join(".", "inputs", "day4.txt"))
  );
  console.log(`Part 1: ${checkPassports(passports)}`);
  console.log(`Part 2: ${checkPassportsStrict(passports)}`);
})();
