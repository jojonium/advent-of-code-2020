import { fileToString } from "./helpers";
import path from "path";

/**
 * A data structure that combines a singly-linked list and a hash map for
 * efficient lookup, deletion, and insertion.
 */
class CrabList<T> {
  private head: CrabNode<T> | null;
  private tail: CrabNode<T> | null;
  /** Look up a node by its value. */
  private lookupTable: Map<T, CrabNode<T>>;
  constructor() {
    this.head = null;
    this.tail = null;
    this.lookupTable = new Map<T, CrabNode<T>>();
  }
  /** Add an element to the end of the list. */
  public push(element: T) {
    const newNode = new CrabNode(element, null);
    if (this.head === null || this.tail === null) {
      this.head = newNode;
      this.tail = newNode;
      this.head.next = this.tail;
      this.tail.next = this.head;
    } else {
      this.tail.next = newNode;
      newNode.next = this.head;
      this.tail = newNode;
    }
    if (this.lookupTable.has(element))
      throw new Error(`Duplicate value ${element}`);
    this.lookupTable.set(element, newNode);
  }
  /** Remove and return the first four elements in the list. */
  public pop4(): [T, T, T, T] {
    const a = this.head?.value;
    const b = this.head?.next?.value;
    const c = this.head?.next?.next?.value;
    const d = this.head?.next?.next?.next?.value;
    const newHead = this.head?.next?.next?.next?.next;
    if (newHead === undefined || newHead === null) {
      throw new Error("List isn't long enough!");
    }
    this.lookupTable.delete(a!);
    this.lookupTable.delete(b!);
    this.lookupTable.delete(c!);
    this.lookupTable.delete(d!);
    this.head = newHead;
    return [a!, b!, c!, d!];
  }
  /** Insert several elements after the one given. */
  public insertAfter(label: T, toInsert: T[]) {
    let cur = this.lookupTable.get(label);
    if (cur === null || cur === undefined)
      throw new Error(`No such element: ${label}`);
    const newTail = cur === this.tail;
    const temp = cur.next;
    for (const val of toInsert) {
      const newNode = new CrabNode(val, null);
      cur.next = newNode;
      if (this.lookupTable.has(val)) {
        throw new Error(`Duplicate value ${val}`);
      }
      this.lookupTable.set(val, newNode);
      cur = cur.next;
    }
    cur.next = temp;
    if (newTail) this.tail = cur;
  }
  /** Return the two elements that come after the one given. */
  public twoAfter(label: T): [T, T] {
    let cur = this.lookupTable.get(label);
    if (cur === null || cur === undefined)
      throw new Error(`No such element: ${label}`);
    const a = cur?.next?.value;
    const b = cur?.next?.next?.value;
    if (a === undefined || b === undefined)
      throw new Error("List isn't long enough!");
    return [a, b];
  }
  /** Return the contents of the list as an array. */
  public toArray(): T[] {
    let out = [];
    let cur = this.head;
    while (cur !== null) {
      out.push(cur.value);
      if (cur.next === this.head) break;
      cur = cur.next;
    }
    return out;
  }
}

/** One node in a crab list. Represents one cup. */
class CrabNode<T> {
  constructor(public value: T, public next: CrabNode<T> | null) {}
}

/**
 * Returns the labels of the cups in order clockwise from the cup labelled 1,
 * all concatenated together as a string.
 */
const allCupLabels = (cups: number[]): string => {
  const i = cups.indexOf(1);
  return cups.slice(i + 1).join("") + cups.slice(0, i).join("");
};

/**
 * Plays the game according to the rules of part 1 or 2 and returns the answer.
 */
const crabGame = (initialCups: number[], part2Mode = false): string => {
  const max = part2Mode ? 1_000_000 : Math.max(...initialCups);
  const min = 1;
  const iterations = part2Mode ? 10_000_000 : 100;
  const cups = new CrabList<number>();
  for (let i = 0; i < initialCups.length; ++i) {
    cups.push(initialCups[i]);
  }
  if (part2Mode) {
    // fill in additional cups
    for (let i = Math.max(...initialCups) + 1; i <= max; ++i) {
      cups.push(i);
    }
  }

  // play the game
  for (let i = 0; i < iterations; ++i) {
    if (i > 1 && i % 500_000 === 0) console.log(i / 100_000 + "% done...");
    let [curLabel, ...pickedUpLabels] = cups.pop4();
    let destLabel = curLabel;
    do {
      destLabel--;
      if (destLabel < min) destLabel = max;
    } while (pickedUpLabels.includes(destLabel));
    cups.insertAfter(destLabel, pickedUpLabels);
    cups.push(curLabel);
  }
  if (part2Mode) {
    const [a, b] = cups.twoAfter(1);
    return "" + a * b;
  } else {
    return allCupLabels(cups.toArray());
  }
};

(async () => {
  const input = await fileToString(path.join(".", "inputs", "day23.txt"));
  const initialCups = input
    .trim()
    .split("")
    .map((s) => parseInt(s));
  console.log(`Part 1: ${crabGame(initialCups)}`);
  console.log(`Part 2: ${crabGame(initialCups, true)}`);
})();
