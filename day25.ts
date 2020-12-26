import {linesAsNumbers} from "./helpers";
import path from "path";

const part1 = (cardPublic: number, doorPublic: number): number => {
  let loopSize = 0;
  let val = 1;
  let subjectNumber = 7;
  let cardLoopSize = -1;
  let doorLoopSize = -1
  while (cardLoopSize === -1 || doorLoopSize === -1) {
    val = (val * subjectNumber) % 20201227
    loopSize++;
    if (val === cardPublic) {
      cardLoopSize = loopSize;
    }
    if (val === doorPublic) {
      doorLoopSize = loopSize;
    }
  }
  val = 1;
  subjectNumber = doorPublic;
  for (let i = 0; i < cardLoopSize; ++i) {
    val = (val * subjectNumber) % 20201227
  }
  return val;
};

(async () => {
  const input = await linesAsNumbers(path.join(".", "inputs", "day25.txt"));
  console.log(`Part 1: ${part1(input[0], input[1])}`);
})();
