import {paragraphsAsStrings} from "./helpers";
import path from "path";

class Tile {
  public readonly id: number;
  public top = '';
  public right = '';
  public bottom = '';
  public left = '';
  public contents: string[][]
  constructor(contents: string) {
    const [idLine, ...lines] = contents.split("\n");
    this.contents = lines.map(s => s.trim().split(''));
    this.id = +idLine.split(":")[0].split(" ")[1];
    this.updateSides();
  }

  private updateSides(): Tile {
    this.top = this.contents[0].join('');
    this.bottom = this.contents[this.contents.length - 1].join('');
    this.right = this.contents.map(l => l[l.length - 1]).join('');
    this.left = this.contents.map(l => l[0]).join('');
    return this;
  }

  public flipX(): Tile {
    this.contents = this.contents.map(l => l.reverse());
    this.updateSides();
    return this;
  }

  public flipY(): Tile {
    this.contents = this.contents.reverse();
    this.updateSides();
    return this;
  }

  public rotate(n = 1): Tile {
    if (n === 0) return this;
    for (let turns = 0; turns < n; turns++) {
      this.contents =
        this.contents.map((_, i) => this.contents.map(x => x[i]).reverse())
    }
    this.updateSides();
    return this;
  }

  public prettyPrint(): String {
    return this.contents.map(s => s.join('')).join('\n');
  }

  private try(
    above?: Tile,
    toRight?: Tile,
    below?: Tile,
    toLeft?: Tile
  ): boolean {
    return (above === undefined || this.top === above.bottom) &&
      (toRight === undefined || this.right === toRight.left) &&
      (below === undefined || this.bottom === below.top) &&
      (toLeft === undefined || this.left === toLeft.right);
  }

  public fit(
    full: (Tile | undefined)[][],
    x: number,
    y: number
  ): Tile | false {
    const above = (full[x] ?? [])[y - 1];
    const toRight = (full[x + 1] ?? [])[y];
    const below = (full[x] ?? [])[y + 1];
    const toLeft = (full[x - 1] ?? [])[y];
    for (let n = 0; n <= 3; ++n) {
      this.rotate(1);
      // Normal
      if (this.try(above, toRight, below, toLeft)) {
        return this;
      }

      // Flipped X
      this.flipX();
      if (this.try(above, toRight, below, toLeft)) {
        return this;
      }

      // Flipped Y
      this.flipX();
      this.flipY();
      if (this.try(above, toRight, below, toLeft)) {
        return this;
      }

      // Flipped X and Y
      this.flipX();
      if (this.try(above, toRight, below, toLeft)) {
        return this;
      }
      this.flipX();
      this.flipY();
    }
    return false;
  }
}

const sort = (tiles: Tile[]): {
  corners: {t: Tile, tu: boolean, ru: boolean, bu: boolean, lu: boolean}[],
  edges: Tile[],
  middle: Tile[]
} => {
  const corners: {t: Tile, tu: boolean, ru: boolean, bu: boolean, lu: boolean}[] = [];
  const edges: Tile[] = [];
  const middle: Tile[] = [];
  for (const tile of tiles) {
    const others = tiles.filter(x => x !== tile).map(t => [
      t.top, t.top.split('').reverse().join(''),
      t.right, t.right.split('').reverse().join(''),
      t.bottom, t.bottom.split('').reverse().join(''),
      t.left, t.left.split('').reverse().join(''),
    ]);
    let topAppearances = 0;
    let rightAppearances = 0;
    let bottomAppearances = 0;
    let leftAppearances = 0;
    for (const other of others) {
      if (other.includes(tile.top)) topAppearances++;
      if (other.includes(tile.right)) rightAppearances++;
      if (other.includes(tile.bottom)) bottomAppearances++;
      if (other.includes(tile.left)) leftAppearances++;
    }
    let c = 0;
    if (topAppearances === 0) c++;
    if (rightAppearances === 0) c++;
    if (bottomAppearances === 0) c++;
    if (leftAppearances === 0) c++;
    if (c === 2) {
      corners.push({
        t: tile,
        tu: topAppearances === 0,
        ru: rightAppearances === 0,
        bu: bottomAppearances === 0,
        lu: leftAppearances === 0
      });
    }
    else if (c === 1) edges.push(tile);
    else if (c === 0) middle.push(tile);
    else console.error("That's not supposed to happen! " + c);
  }
  return {corners, edges, middle}
}

const solve = (tiles: Tile[]): Tile[][] => {
  const sorted = sort(tiles);
  const dimensions = Math.sqrt(tiles.length);
  const image = new Array<(Tile | undefined)[]>(dimensions);
  for (let i = 0; i < dimensions; ++i) {
    image[i] = new Array<Tile | undefined>(dimensions);
    image[i].fill(undefined);
  }
  // Rotate a corner piece until its unique sides are top and left
  const {t: tile, tu, ru, bu, lu} = sorted.corners.shift()!!;
  let rotations = 0;
  if (bu && lu) rotations = 1;
  else if (ru && bu) rotations = 2;
  else if (tu && ru) rotations = 3;
  for (let r = 0; r < rotations; r++) {
    tile.rotate();
  }
  image[0][0] = tile;

  const slotIn = (
    x: number, y: number, pool: Tile[]
  ): Tile => {
    for (let e = pool.length - 1; e >= 0; e--) {
      const fit = pool[e].fit(image, x, y);
      if (fit !== false) {
        image[x][y] = fit;
        return fit;
      }
    }
    throw new Error(`Nothing fits in ${x},${y}`);
  }

  // Fill in the left edge of the puzzle
  for (let y = 1; y < dimensions - 1; y++) {
    const slot = slotIn(0, y, sorted.edges);
    sorted.edges = sorted.edges.filter(e => e !== slot);
  }

  // Fill in bottom left corner
  let slot = slotIn(0, dimensions - 1, sorted.corners.map(c => c.t));
  sorted.corners = sorted.corners.filter(c => c.t !== slot);

  // Fill in the bottom edge of the puzzle
  for (let x = 1; x < dimensions - 1; x++) {
    const slot = slotIn(x, dimensions - 1, sorted.edges);
    sorted.edges = sorted.edges.filter(e => e !== slot);
  }

  // Fill in bottom right corner
  slot = slotIn(dimensions - 1, dimensions - 1, sorted.corners.map(c => c.t));
  sorted.corners = sorted.corners.filter(c => c.t !== slot);

  // Fill in the right edge of the puzzle
  for (let y = dimensions - 2; y > 0; y--) {
    const slot = slotIn(dimensions - 1, y, sorted.edges);
    sorted.edges = sorted.edges.filter(e => e !== slot);
  }

  // Fill in top right corner
  slot = slotIn(dimensions - 1, 0, sorted.corners.map(c => c.t));
  sorted.corners = sorted.corners.filter(c => c.t !== slot);

  // Fill in the top edge of the puzzle
  for (let x = dimensions - 2; x > 0; x--) {
    const slot = slotIn(x, 0, sorted.edges);
    sorted.edges = sorted.edges.filter(e => e !== slot);
  }

  // Fill in the center of the puzzle in a spiral
  for (let o = 1; o < dimensions / 2; o++) {
    for (let x = o; x < dimensions - o; x++) {
      slot = slotIn(x, o, sorted.middle);
      sorted.middle = sorted.middle.filter(e => e !== slot);
    }
    for (let y = o + 1; y < dimensions - o; y++) {
      const x = dimensions - o - 1;
      slot = slotIn(x, y, sorted.middle);
      sorted.middle = sorted.middle.filter(e => e !== slot);
    }
    for (let x = dimensions - o - 2; x >= o; x--) {
      const y = dimensions - o - 1;
      slot = slotIn(x, y, sorted.middle);
      sorted.middle = sorted.middle.filter(e => e !== slot);
    }
    for (let y = dimensions - o - 2; y > o; y--) {
      slot = slotIn(o, y, sorted.middle);
      sorted.middle = sorted.middle.filter(e => e !== slot);
    }
  }

  return image as Tile[][];
};

const printImage = (image: (Tile | undefined)[][]): string => {
  let str = '';
  for (let y = 0; y < image[0].length; ++y) {
    for (let l = 0; l < 10; ++l) {
      for (let x = 0; x < image.length; ++x) {
        let temp = (image[x][y] === undefined)
          ? ' '.repeat(10)
          : image[x][y]?.contents[l].join('')
        str += temp + ' ';
      }
      str += '\n';
    }
    str += '\n';
  }
  return str;
}

(async () => {
  const input = await paragraphsAsStrings(
    path.join(".", "inputs", "day20.txt")
  );
  const tiles = input.map((para) => new Tile(para));
  const part1 = sort(tiles).corners.reduce((acc, curr) => acc * curr.t.id, 1);
  console.log("Part 1: " + part1);
  const image = solve(tiles);
  //console.log(image);
  console.log(printImage(image));
})();
