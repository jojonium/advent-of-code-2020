import {paragraphsAsStrings} from "./helpers";
import path from "path";

/**
 * INCOMPLETE
 */

interface Sides {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

const flipX = (input: Sides): Sides => {
  return {
    top: input.top.split('').reverse().join(''),
    right: input.left.split('').join(''),
    bottom: input.bottom.split('').reverse().join(''),
    left: input.right.split('').join(''),
  };
};

const flipY = (input: Sides): Sides => {
  return {
    top: input.bottom.split('').join(''),
    right: input.right.split('').reverse().join(''),
    bottom: input.top.split('').join(''),
    left: input.left.split('').reverse().join(''),
  };
};

// Clockwise
const rotate = (input: Sides, n = 1): Sides => {
  let t = input
  for (let i = 0; i < n; ++i) {
    t = {
      top: t.left.split('').reverse().join(''),
      right: t.top.split('').join(''),
      bottom: t.right.split('').reverse().join(''),
      left: t.bottom.split('').join(''),
    };
  }
  return t;
};

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
    sides: Sides,
    above?: Tile,
    toRight?: Tile,
    below?: Tile,
    toLeft?: Tile
  ): boolean {
    return (above === undefined || sides.top === above.bottom) &&
      (toRight === undefined || sides.right === toRight.left) &&
      (below === undefined || sides.bottom === below.top) &&
      (toLeft === undefined || sides.left === toLeft.right);
  }

  public fit(above?: Tile, toRight?: Tile, below?: Tile, toLeft?: Tile): Tile | false {
    let temp: Sides = {
      top: this.top,
      right: this.right,
      bottom: this.bottom,
      left: this.left,
    };
    for (let n = 0; n <= 3; ++n) {
      let rotated = rotate(temp, n);
      if (this.try(rotated, above, toRight, below, toLeft)) {
        return this.rotate(n);
      }
      if (this.try(flipX(rotated), above, toRight, below, toLeft)) {
        return this.rotate(n).flipX();
      }
      if (this.try(flipY(rotated), above, toRight, below, toLeft)) {
        return this.rotate(n).flipY();
      }
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

const solve = (tiles: Tile[]): (Tile | undefined)[][] => {
  const sorted = sort(tiles);
  const dimensions = Math.sqrt(tiles.length);
  const image = new Array<(Tile | undefined)[]>(dimensions);
  for (let i = 0; i < dimensions; ++i) {
    image[i] = new Array<Tile | undefined>(dimensions);
    image[i].fill(undefined);
  }
  // Rotate a corner piece until its unique sides are top and left
  const {t: tile, tu, ru, bu, lu} = sorted.corners.shift()!!;
  if (bu && lu) tile.rotate(1);
  else if (ru && bu) tile.rotate(2);
  else if (tu && ru) tile.rotate(3);
  image[0][0] = tile;

  // Fill in the left edge of the puzzle
  for (let y = 1; y < dimensions - 1; y++) {
    for (let e = sorted.edges.length - 1; e >= 0; e--) {
      const fit = sorted.edges[e].fit(image[0][y - 1]);
      if (fit !== false) {
        image[0][y] = fit;
        sorted.edges.splice(e, 1);
        break;
      }
    }
  }

  // Fill in bottom left corner
  for (let c = sorted.corners.length - 1; c >= 0; c--) {
    const fit = sorted.corners[c].t.fit(image[0][dimensions - 2]);
    if (fit !== false) {
      image[0][dimensions - 1] = fit;
      sorted.corners.splice(c, 1);
      break;
    }
  }

  // Fill in the top edge of the puzzle
  for (let x = 1; x < dimensions - 1; x++) {
    for (let e = sorted.edges.length - 1; e >= 0; e--) {
      const fit = sorted.edges[e].fit(undefined, undefined, undefined, image[x - 1][0]);
      if (fit !== false) {
        image[x][0] = fit;
        sorted.edges.splice(e, 1);
        break;
      }
    }
  }

  // Fill in top right corner
  for (let c = sorted.corners.length - 1; c >= 0; c--) {
    const fit = sorted.corners[c].t
      .fit(undefined, undefined, undefined, image[dimensions - 2][0]);
    if (fit !== false) {
      image[dimensions - 1][0] = fit;
      sorted.corners.splice(c, 1);
      break;
    }
  }

  // Fill in the right edge of the puzzle
  for (let y = 1; y < dimensions - 1; y++) {
    let x = dimensions - 1;
    for (let e = sorted.edges.length - 1; e >= 0; e--) {
      const fit = sorted.edges[e].fit(image[x][y - 1]);
      if (fit !== false) {
        image[x][y] = fit;
        sorted.edges.splice(e, 1);
        break;
      }
    }
  }

  // Last corner piece belongs in the bottom right
  const fit = sorted.corners.shift()!!.t
    .fit(image[dimensions - 1][dimensions - 2]);
  if (fit === false) {
    console.error("Last corner piece doesn't fit!");
  } else {
    image[dimensions - 1][dimensions - 1] = fit;
  }

  // Fill in the bottom edge of the puzzle
  for (let x = 1; x < dimensions - 1; x++) {
    for (let e = sorted.edges.length - 1; e >= 0; e--) {
      let y = dimensions - 1;
      const fit = sorted.edges[e].fit(undefined, image[x + 1][y], undefined, image[x - 1][y]);
      if (fit !== false) {
        image[x][y] = fit;
        sorted.edges.splice(e, 1);
        break;
      }
    }
  }

  return image;
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
