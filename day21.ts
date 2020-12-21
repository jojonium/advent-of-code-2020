import { linesAsStrings } from "./helpers";
import path from "path";

/**
 * Finds the intersection of multiple arrays.
 */
const intersect = <T>(arrs: T[][]): Set<T> =>
  arrs.reduce(
    (s: Set<T>, arr) => new Set(arr.filter((elem) => s.has(elem))),
    new Set(arrs[0])
  );

(async () => {
  const input = await linesAsStrings(path.join(".", "inputs", "day21.txt"));

  // map of allergen to ingredient lists that contain them
  const inListMap = new Map<string, string[]>();
  for (const line of input) {
    if (line.charAt(line.length - 1) !== ")") continue;
    const m = line.match(/^([\w ]+) \(contains ([\w ,]+)\)$/);
    if (m === null || m.length < 3) throw new Error(`Weird line '${line}'`);
    const allergens = m[2].split(", ");
    for (const allergen of allergens) {
      if (inListMap.has(allergen)) inListMap.get(allergen)!.push(m[1]);
      else inListMap.set(allergen, [m[1]]);
    }
  }

  // map of allergen to the ingredients that could contain it
  let allergenMap: { allergen: string; ingredients: Set<string> }[] = [];
  inListMap.forEach((iLists, allergen) => {
    const common = intersect(iLists.map((inList) => inList.split(" ")));
    allergenMap.push({ allergen: allergen, ingredients: common });
  });
  // map of ingredient to the allergen it contains
  const solvedIngredients = new Map<string, string>();
  for (let i = 0; i < allergenMap.length; ++i) {
    allergenMap = allergenMap.sort(
      (a, b) => a.ingredients.size - b.ingredients.size
    );
    const al = allergenMap[i];
    if (al.ingredients.size !== 1) throw new Error("Multiple possibile!");
    // janky way to get the only element in the set
    let ingredient = "ERROR";
    for (const n of al.ingredients.values()) {
      ingredient = n;
      break;
    }

    // remove the one possibile ingredient from all other allergens
    for (let j = i + 1; j < allergenMap.length; ++j) {
      allergenMap[j].ingredients.delete(ingredient);
    }

    // this ingredient is now solved
    solvedIngredients.set(ingredient, al.allergen);
  }

  // Part 1
  let part1 = 0;
  for (const line of input) {
    const words = line.split(" ");
    for (const word of words) {
      if (word.charAt(0) === "(") break;
      if (!solvedIngredients.has(word)) part1++;
    }
  }
  console.log(`Part 1: ${part1}`);

  // Part 2
  const dangerList = Array.from(solvedIngredients)
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map((val) => val[0])
    .join(",");
  console.log(`Part 2: ${dangerList}`);
})();
