import { fileToString } from "./helpers";
import path from "path";

/** Calculates a deck's final score. */
const calcScore = (deck: number[]): number =>
  deck.reduceRight((prev, cur, i) => prev + cur * (deck.length - i), 0);

/** Parses input into two decks. */
const parse = (input: string): number[][] =>
  input
    .trim()
    .split("\n\n")
    .map((paragraph) =>
      paragraph
        .split("\n")
        .slice(1)
        .map((s) => parseInt(s))
    );

/** Play one round of Combat, modifying the decks in place. */
const combatRound = (p1Deck: number[], p2Deck: number[]): void => {
  const [winnerDeck, loserDeck] =
    p1Deck[0] > p2Deck[0] ? [p1Deck, p2Deck] : [p2Deck, p1Deck];
  winnerDeck.push(winnerDeck.shift()!, loserDeck.shift()!);
};

/** Plays Combat on two decks until one wins and returns the winning deck. */
const combatToEnd = (p1Deck: number[], p2Deck: number[]): number[] => {
  do combatRound(p1Deck, p2Deck);
  while (p1Deck.length !== 0 && p2Deck.length !== 0);
  return p1Deck.length === 0 ? p2Deck : p1Deck;
};

/**
 * Play a round of Recursive Combat, modifying the decks and set of previously
 * seen hands in place.
 */
const recCombatRound = (
  p1Deck: number[],
  p2Deck: number[],
  prevRounds: Set<string>
): void => {
  const key = `${p1Deck.join(",")};${p2Deck.join(",")}`;
  if (prevRounds.has(key)) {
    // game instantly ends with a win for player 1
    throw new Error("Repeating round!");
  }
  prevRounds.add(key);
  let winnerDeck: number[];
  let loserDeck: number[];
  if (p1Deck[0] > p1Deck.length - 1 || p2Deck[0] > p2Deck.length - 1) {
    // not enough cards to recurse
    [winnerDeck, loserDeck] =
      p1Deck[0] > p2Deck[0] ? [p1Deck, p2Deck] : [p2Deck, p1Deck];
  } else {
    // play sub-game
    const sub1 = p1Deck.slice(1, p1Deck[0] + 1);
    const sub2 = p2Deck.slice(1, p2Deck[0] + 1);
    [winnerDeck, loserDeck] =
      recCombatToEnd(sub1, sub2) === sub1 ? [p1Deck, p2Deck] : [p2Deck, p1Deck];
  }
  winnerDeck.push(winnerDeck.shift()!, loserDeck.shift()!);
};

/** Play Recursive Combat until someone wins and returns the winning deck. */
const recCombatToEnd = (p1Deck: number[], p2Deck: number[]): number[] => {
  let prevRounds = new Set<string>();
  try {
    do recCombatRound(p1Deck, p2Deck, prevRounds);
    while (p1Deck.length !== 0 && p2Deck.length !== 0);
  } catch (e) {
    // repeated round, p1 wins instantly
    return p1Deck;
  }
  return p1Deck.length === 0 ? p2Deck : p1Deck;
};

(async () => {
  const input = await fileToString(path.join(".", "inputs", "day22.txt"));
  let [p1Deck, p2Deck] = parse(input);
  console.log(`Part 1: ${calcScore(combatToEnd(p1Deck, p2Deck))}`);
  [p1Deck, p2Deck] = parse(input);
  console.log(`Part 2: ${calcScore(recCombatToEnd(p1Deck, p2Deck))}`);
})();
