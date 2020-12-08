import { linesAsStrings } from "./helpers";
import path from "path";

interface ProgramState {
  /** Accumulator */
  acc: number;
  /** Instruction pointer */
  ip: number;
  /** The set of instruction indices we've already executed */
  visited: Set<number>;
}

class Instruction {
  public name = "nop";
  constructor(public arg: number) {}
  /**
   * Takes the current program state, performs some action, and returns the new
   * state.
   */
  public execute(state: ProgramState): ProgramState {
    return { acc: state.acc, ip: state.ip + 1, visited: this.visit(state) };
  }
  protected visit(state: ProgramState): Set<number> {
    const v = new Set<number>(state.visited.keys());
    v.add(state.ip);
    return v;
  }
}

class AccInstruction extends Instruction {
  public name = "acc";
  constructor(public arg: number) {
    super(arg);
  }
  public execute(state: ProgramState): ProgramState {
    return {
      acc: state.acc + this.arg,
      ip: state.ip + 1,
      visited: this.visit(state),
    };
  }
}

class JmpInstruction extends Instruction {
  public name = "jmp";
  constructor(public arg: number) {
    super(arg);
  }
  public execute(state: ProgramState): ProgramState {
    return {
      acc: state.acc,
      ip: state.ip + this.arg,
      visited: this.visit(state),
    };
  }
}

/**
 * Converts lines of the input into instructions
 */
export const parse = (lines: string[]): Instruction[] =>
  lines.map((line) => {
    const [code, val] = line.split(" ");
    if (code === "jmp") {
      return new JmpInstruction(+val);
    } else if (code === "acc") {
      return new AccInstruction(+val);
    } else {
      return new Instruction(+val);
    }
  });

/**
 * Executes the given instructions until it reaches the end or starts looping.
 * @return the state right before the loop or end, the stack of previous
 * program states, and whether it exited beccause of looping.
 */
const run = (
  instructions: Instruction[],
  state: ProgramState
): { looped: boolean; cur: ProgramState; prev: Array<ProgramState> } => {
  let prev = new Array<ProgramState>();
  while (state.ip < instructions.length) {
    prev.push(state);
    state = instructions[state.ip].execute(state);
    // check if we're looping
    if (state.visited.has(state.ip)) {
      return { looped: true, cur: state, prev: prev };
    }
  }
  return { looped: false, cur: state, prev: prev };
};

/**
 * Fixes the infinite loop in the instructions by changing a single "nop" to a
 * "jmp" or vice versa. Returns the accumulator after the program reaches the
 * end of the instruction list.
 */
const fixLoop = (instructions: Instruction[]): number => {
  let state: ProgramState = { acc: 0, ip: 0, visited: new Set() };
  // run once to build previous state stack
  let { looped, cur, prev } = run(instructions, state);
  // walk back through previous instructions and try flipping each "nop" and
  // "jmp" until the program halts
  do {
    do {
      // roll back until we find the last "nop" or "jmp" instruction
      cur = prev.pop()!;
    } while (instructions[cur.ip].name === "acc");
    // change this instruction and run again from that point to see if we halt
    const newResult = run(
      instructions.map((val, index) => {
        if (index === cur.ip) {
          // flip instruction
          if (val.name === "jmp") return new Instruction(val.arg);
          else return new JmpInstruction(val.arg);
        } else {
          return val;
        }
      }),
      cur
    );
    looped = newResult.looped;
    state = newResult.cur;
  } while (looped);
  return state.acc;
};

(async () => {
  const input = await linesAsStrings(path.join(".", "inputs", "day08.txt"));
  const startingState = { acc: 0, ip: 0, visited: new Set<number>() };
  console.log(`Part 1: ${run(parse(input), startingState).cur.acc}`);
  console.log(`Part 2: ${fixLoop(parse(input))}`);
})();
