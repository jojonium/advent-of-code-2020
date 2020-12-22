import { paragraphsAsStrings } from "./helpers";
import path from "path";

/**
 * Calculates a deck's final score.
 */
const calcScore = (deck: number[]): number =>
  deck.reduceRight((prev, cur, i, arr) => prev + cur * (arr.length - i), 0);

/**
 * Play one round of Combat and return the decks after cards have been moved.
 */
const combatRound = (
  p1Deck: number[],
  p2Deck: number[]
): { p1Deck: number[]; p2Deck: number[] } => {
  const [winnerDeck, loserDeck] =
    p1Deck[0] > p2Deck[0] ? [p1Deck, p2Deck] : [p2Deck, p1Deck];
  winnerDeck.push(winnerDeck.shift()!, loserDeck.shift()!);
  return { p1Deck, p2Deck };
};

/**
 * Plays Combat on the two decks until someone wins, then returns the score of
 * the winner.
 */
const combatToEnd = (p1Deck: number[], p2Deck: number[]): number => {
  do ({ p1Deck, p2Deck } = combatRound(p1Deck, p2Deck));
  while (p1Deck.length !== 0 && p2Deck.length !== 0);
  return calcScore(p1Deck.length === 0 ? p2Deck : p1Deck);
};

/**
 * Helper function to save a visited set of decks as a string, so we can easily
 * check if we've seen this exact state before.
 */
const decksToString = (p1Deck: number[], p2Deck: number[]): string =>
  `${p1Deck.join(",")};${p2Deck.join(",")}`;

/**
 * Play a round of recursive Combat, returning the decks after the round and the
 * set of rounds we've seen before in this game.
 */
const recCombatRound = (
  p1Deck: number[],
  p2Deck: number[],
  prevRounds: Set<string>
): {
  p1Deck: number[];
  p2Deck: number[];
  prevRounds: Set<string>;
} => {
  if (prevRounds.has(decksToString(p1Deck, p2Deck))) {
    // game instantly ends with a win for player 1
    throw new Error("Repeating round!");
  }
  prevRounds.add(decksToString(p1Deck, p2Deck));
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
  return { p1Deck, p2Deck, prevRounds };
};

/**
 * Play a game of Recursive Combat until someone wins, then returns the winning
 * deck.
 */
const recCombatToEnd = (p1Deck: number[], p2Deck: number[]): number[] => {
  let prevRounds = new Set<string>();
  try {
    do {
      ({ p1Deck, p2Deck, prevRounds } = recCombatRound(
        p1Deck,
        p2Deck,
        prevRounds
      ));
    } while (p1Deck.length !== 0 && p2Deck.length !== 0);
  } catch (e) {
    // repeated round, p1 wins instantly
    return p1Deck;
  }
  const winner = p1Deck.length === 0 ? p2Deck : p1Deck;
  return winner;
};

(async () => {
  let input = await paragraphsAsStrings(path.join(".", "inputs", "day22.txt"));
  let [p1Deck, p2Deck] = input.map((para) =>
    para
      .split("\n")
      .slice(1)
      .map((s) => parseInt(s))
  );
  console.log(`Part 1: ${combatToEnd(p1Deck, p2Deck)}`);
  [p1Deck, p2Deck] = input.map((para) =>
    para
      .split("\n")
      .slice(1)
      .map((s) => parseInt(s))
  );
  console.log(`Part 2: ${calcScore(recCombatToEnd(p1Deck, p2Deck))}`);
})();
