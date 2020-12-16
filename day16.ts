import {linesAsStrings} from "./helpers";
import path from "path";

interface TicketMetadata {
  rules: {
    name: string;
    range1a: number;
    range1b: number;
    range2a: number;
    range2b: number;
  }[];
  myTicket: number[],
  tickets: number[][]
}

/**
 * Parses input into a data structure.
 */
const parse = (lines: string[]): TicketMetadata => {
  let i = 0;
  const out: TicketMetadata = {
    rules: [],
    myTicket: [],
    tickets: new Array<number[]>()
  }

  // parse rules
  while (lines[i] !== "") {
    const m = lines[i].match(/^([\w ]+): (\d+)-(\d+) or (\d+)-(\d+)$/);
    if (m === null || m.length < 6) throw new Error(`Weird line: '${lines[i]}`);
    out.rules.push({
      name: m[1],
      range1a: +m[2],
      range1b: +m[3],
      range2a: +m[4],
      range2b: +m[5],
    });
    ++i;
  }

  // parse your ticket
  i += 2;
  out.myTicket = lines[i].split(",").map(s => parseInt(s));

  // parse other tickets
  i += 3
  while (i < lines.length) {
    out.tickets.push(lines[i].split(",").map(s => parseInt(s)));
    ++i;
  }

  return out;
}

/**
 * Finds tickets that containa number for which no rule is valid and removes
 * them. Then returns the error rate and the new list of tickets with invalids
 * removed.
 */
const detectInvalid = (data: TicketMetadata): {
  errorRate: number,
  filteredTickets: number[][]
} => {
  let numInvalid = 0;
  const filtered = [];
  for (const ticket of data.tickets) {
    let goodTicket = true;
    for (const val of ticket) {
      let goodVal = false;
      for (const rule of data.rules) {
        if ((val >= rule.range1a && val <= rule.range1b) ||
          (val >= rule.range2a && val <= rule.range2b)) {
          goodVal = true;
        }
      }
      if (!goodVal) {
        numInvalid += val;
        goodTicket = false;
      }
    }
    if (goodTicket) {
      filtered.push(ticket);
    }
  }

  return {
    errorRate: numInvalid,
    filteredTickets: filtered
  }
};

/**
 * Figures out which field corresponds to which value in the tickets based on
 * the input, then returns the product of every field on my ticket that starts
 * with "departure" multiplied together.
 */
const fitFields = (data: TicketMetadata): number => {
  const possible = new Array<Set<string>>(data.myTicket.length);
  const impossible = new Array<Set<string>>(data.myTicket.length);
  for (let i = 0; i < possible.length; ++i) {
    possible[i] = new Set<string>();
    impossible[i] = new Set<string>();
  }
  for (const ticket of data.tickets) {
    ticket.forEach((val, index) => {
      for (const rule of data.rules) {
        if ((val >= rule.range1a && val <= rule.range1b) ||
          (val >= rule.range2a && val <= rule.range2b)) {
          // this value could belong to the rule
          if (!impossible[index].has(rule.name)) {
            possible[index].add(rule.name);
          }
        } else {
          // this value can NOT belong to the rule
          impossible[index].add(rule.name)
          possible[index].delete(rule.name);
        }
      }
    });
  }
  // remove duplicate possibilities, keeping them only in the index with the
  // fewest possibilities
  return possible
    .map((v, i) => {return {set: v, index: i}})
    .sort((a, b) => a.set.size - b.set.size)
    .map((op, i, arr) => {
      if (op.set.size !== 1) throw new Error("Multiple possibilities!");
      let ruleName = "ERROR";
      // janky way to get the only element in the possibilities set
      for (const n of op.set.values()) {
        ruleName = n;
        break;
      }
      // remove this possibility from other indices
      for (let j = i + 1; j < arr.length; ++j) {
        arr[j].set.delete(ruleName);
      }
      return {index: op.index, name: ruleName}
    }).reduce((prev, cur) =>
      // multiply together all the values on my ticket whose field starts with
      // the word "departure"
      (cur.name.startsWith("departure"))
        ? prev * data.myTicket[cur.index]
        : prev,
      1
    );
};

(async () => {
  const input = (await linesAsStrings(path.join(".", "inputs", "day16.txt")));
  const ticketMetadata = parse(input);
  const {errorRate, filteredTickets} = detectInvalid(ticketMetadata);
  console.log(`Part 1: ${errorRate}`);
  ticketMetadata.tickets = filteredTickets;
  console.log(`Part 2: ${fitFields(ticketMetadata)}`);

})();
