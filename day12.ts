import { linesAsStrings } from "./helpers";
import path from "path";

/**
 * Follows the instructions according to part 1's rules and returns the
 * Manhattan distance between the ship's starting location and its ending
 * location.
 */
const steer = (instructions: string[]): number => {
  let heading = 90; // initially facing east
  let x = 0;
  let y = 0;
  for (const ins of instructions) {
    const action = ins.substr(0, 1);
    const value = +ins.substr(1);
    if (action === "N") y += value;
    if (action === "S") y -= value;
    if (action === "E") x += value;
    if (action === "W") x -= value;
    if (action === "R") heading = (heading + value + 360) % 360;
    if (action === "L") heading = (heading - value + 360) % 360;
    if (action === "F") {
      if (heading === 0) y += value;
      if (heading === 90) x += value;
      if (heading === 180) y -= value;
      if (heading === 270) x -= value;
    }
  }
  return Math.abs(x) + Math.abs(y);
};

/**
 * Follows the instructions according to part 2's rules and returns the
 * Manhattan distance between the ship's starting location and its ending
 * location.
 */
const steerToWaypoint = (instructions: string[]): number => {
  let shipX = 0;
  let shipY = 0;
  let waypointX = 10; // relative to ship
  let waypointY = 1; // relative to ship
  for (const ins of instructions) {
    const action = ins.substr(0, 1);
    const value = +ins.substr(1);
    if (action === "N") waypointY += value;
    if (action === "S") waypointY -= value;
    if (action === "E") waypointX += value;
    if (action === "W") waypointX -= value;
    if ((action === "L" && value === 90) || (action === "R" && value === 270)) {
      let [oldX, oldY] = [waypointX, waypointY];
      waypointX = -1 * oldY;
      waypointY = oldX;
    }
    if (value === 180) {
      let [oldX, oldY] = [waypointX, waypointY];
      waypointX = -1 * oldX;
      waypointY = -1 * oldY;
    }
    if ((action === "R" && value === 90) || (action === "L" && value === 270)) {
      let [oldX, oldY] = [waypointX, waypointY];
      waypointX = oldY;
      waypointY = -1 * oldX;
    }
    if (action === "F") {
      shipX += value * waypointX;
      shipY += value * waypointY;
    }
  }
  return Math.abs(shipX) + Math.abs(shipY);
};

(async () => {
  const input = await linesAsStrings(path.join(".", "inputs", "day12.txt"));
  console.log(`Part 1: ${steer(input)}`);
  console.log(`Part 2: ${steerToWaypoint(input)}`);
})();
