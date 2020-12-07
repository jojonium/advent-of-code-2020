import { linesAsStrings } from "./helpers";
import path from "path";

interface BagNode {
  color: string;
  outgoingEdges: Array<BagEdge>;
  incomingEdges: Array<BagEdge>;
  contents: number | undefined; // number of bags this bag must hold
}

interface BagEdge {
  parent: BagNode;
  child: BagNode;
  quantity: number;
}

/**
 * Converts a rule line into nodes and stores them in the map passed as input.
 * It modifies the map in place and returns the new node that was just created.
 * @param nodes a map to reuse between successive calls. It makes looking up a
 * node for a particular color much faster.
 */
const parseRule = (line: string, nodes: Map<string, BagNode>): BagNode => {
  const m = line.match(/^(\w+ \w+) bags contain (.*).$/);
  if (m === null || m.length < 3) throw new Error(`Weird rule line: '${line}'`);
  const color = m[1];
  if (!nodes.has(color)) {
    // haven't seen this color before, need to make new node
    nodes.set(color, {
      color: color,
      outgoingEdges: [],
      incomingEdges: [],
      contents: undefined,
    });
  }
  const thisNode = nodes.get(color);
  if (thisNode === undefined) throw new Error("Something weird happened!");
  const bagContains = m[2].split(",");
  if (bagContains.length === 1 && bagContains[0] === "no other bags") {
    return thisNode;
  }
  for (const cont of bagContains) {
    const m = cont.match(/^ ?(\d+) (\w+ \w+) bags?$/);
    if (m === null || m.length < 2) throw new Error(`Weird content: '${cont}'`);
    const num = m[1];
    const otherColor = m[2];
    if (!nodes.has(otherColor)) {
      // haven't seen this color before, need to make new node
      nodes.set(otherColor, {
        color: otherColor,
        outgoingEdges: [],
        incomingEdges: [],
        contents: undefined,
      });
    }
    const parent = thisNode;
    const child = nodes.get(otherColor);
    if (child === undefined) throw new Error("Something went wrong!");

    // add an edge to the parent and child
    const edge: BagEdge = {
      parent: parent,
      child: child,
      quantity: +num,
    };
    parent.outgoingEdges.push(edge);
    child.incomingEdges.push(edge);
  }
  return thisNode;
};

/**
 * Converts many rule lines into nodes and edges, and returns the node for the
 * one bag color we care most about (shiny gold).
 */
const parseAllRules = (lines: string[], myBagColor = "shiny gold"): BagNode => {
  const nodes = new Map<string, BagNode>();
  for (const line of lines) parseRule(line, nodes);
  const output = nodes.get(myBagColor);
  if (output === undefined) {
    throw new Error(`No rule concerns a bag with color '${myBagColor}'`);
  }
  return output;
};

/**
 * Finds the number of nodes than can eventually reach the starting node, using
 * depth-first search.
 */
const canReach = (start: BagNode): number => {
  const visited = new Set<string>();
  /** Recursive helper function for performing depth-first search. */
  const dfsRecurse = (n: BagNode): void => {
    visited.add(n.color);
    for (const iEdge of n.incomingEdges) {
      if (!visited.has(iEdge.parent.color)) {
        dfsRecurse(iEdge.parent);
      }
    }
  };
  dfsRecurse(start);
  // subtract one because we don't want to count the original start node
  return visited.size - 1;
};

/**
 * Finds the number of bags that must be contained by a bag with the same color
 * as the starting node, using depth-first search.
 */
const mustContain = (start: BagNode): number => {
  const visited = new Set<string>();
  /**
   * Recursive helper function for performing depth-first search.
   * This is different from above because we're searching DOWN instead of up,
   * and also we have to remember and accumulate the quantities.
   * @return the number of bags n must contain
   */
  const dfsRecurse = (n: BagNode): number => {
    visited.add(n.color);
    if (n.outgoingEdges.length === 0) {
      n.contents = 0;
    } else if (n.outgoingEdges.every((edge) => visited.has(edge.child.color))) {
      // all children have been visited already
      n.contents = n.outgoingEdges.reduce(
        // remember to add 1 to each child's count for the child bag itself!
        (acc, edge) => acc + edge.quantity * (edge.child.contents! + 1),
        0
      );
    } else {
      n.contents = n.outgoingEdges.reduce(
        // remember to add 1 to each child's count for the child bag itself!
        (acc, edge) => acc + edge.quantity * (dfsRecurse(edge.child) + 1),
        0
      );
    }
    return n.contents;
  };

  return dfsRecurse(start);
};

(async () => {
  const input = await linesAsStrings(path.join(".", "inputs", "day07.txt"));
  const myBag = parseAllRules(input, "shiny gold");
  console.log(`Part 1: ${canReach(myBag)}`);
  console.log(`Part 1: ${mustContain(myBag)}`);
})();
