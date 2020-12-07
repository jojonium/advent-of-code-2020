import { linesAsStrings } from "./helpers";
import path from "path";

interface BagNode {
  color: string;
  outgoingEdges: Array<BagEdge>;
  incomingEdges: Array<BagEdge>;
}

interface BagEdge {
  parent: BagNode;
  child: BagNode;
  quantity: number;
}

/**
 * Converts a rule line into nodes and edges and stores them in the objects
 * passed as input. It modifies the map and array in place so does not return
 * anything.
 */
const parseRule = (
  line: string,
  nodes: Map<string, BagNode>,
  edges: Array<BagEdge>
): void => {
  const m = line.match(/^(\w+ \w+) bags contain (.*).$/);
  if (m === null || m.length < 3) throw new Error(`Weird rule line: '${line}'`);
  const color = m[1];
  if (!nodes.has(color)) {
    // haven't seen this color before, need to make new node
    nodes.set(color, {
      color: color,
      outgoingEdges: [],
      incomingEdges: [],
    });
  }
  const bagContains = m[2].split(",");
  if (bagContains.length === 1 && bagContains[0] === "no other bags") {
    return;
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
      });
    }
    const parent = nodes.get(color);
    const child = nodes.get(otherColor);
    if (parent === undefined || child === undefined) {
      throw new Error("Something went wrong!");
    }

    // add an edge to the parent, child, and list of edges
    const edge: BagEdge = {
      parent: parent,
      child: child,
      quantity: +num,
    };
    parent.outgoingEdges.push(edge);
    child.incomingEdges.push(edge);
    edges.push(edge);
  }
};

/**
 * Finds the number of nodes than can eventually reach the starting node.
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

(async () => {
  const input = await linesAsStrings(path.join(".", "inputs", "day07.txt"));
  const nodes = new Map<string, BagNode>();
  const edges = new Array<BagEdge>();
  for (const line of input) parseRule(line, nodes, edges);
  const myBag = nodes.get("shiny gold");
  if (myBag === undefined) throw new Error("No shiny gold bag exists in rules");
  console.log(`Part 1: ${canReach(myBag)}`);
})();
