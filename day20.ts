import { paragraphsAsStrings } from "./helpers";
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
    top: input.top,
    right: input.left,
    bottom: input.bottom,
    left: input.right,
  };
};

const flipY = (input: Sides): Sides => {
  return {
    top: input.bottom,
    right: input.right,
    bottom: input.top,
    left: input.left,
  };
};

const rotate = (input: Sides): Sides => {
  return {
    top: [...input.left].reverse().join(""),
    right: input.top,
    bottom: [...input.right].reverse().join(""),
    left: input.bottom,
  };
};

const allCombos = (input: Sides): Sides[] => {
  const out = [];
  for (const s of [input, flipX(input), flipY(input)]) {
    for (const r of [1, 2, 3]) {
      out.push(s);
      for (let i = 0; i < r; ++i) {
        input = rotate(s);
      }
    }
  }
  return out;
};

class Tile {
  public readonly id: number;
  public top: string;
  public right: string;
  public bottom: string;
  public left: string;
  constructor(private contents: string) {
    const [idLine, ...lines] = this.contents.split("\n");
    this.id = +idLine.split(":")[0].split(" ")[1];
    this.top = lines[0];
    this.bottom = lines[lines.length - 1];
    this.right = lines.map((l) => l.charAt(l.length - 1)).join("");
    this.left = lines.map((l) => l.charAt(0)).join("");
  }

  public fit(above?: Tile, toRight?: Tile, below?: Tile, toLeft?: Tile): Tile {
    console.log("Trying to fit tile " + this.id);
    console.log(toLeft);
    let temp: Sides = {
      top: this.top,
      right: this.right,
      bottom: this.bottom,
      left: this.left,
    };
    for (const s of allCombos(temp)) {
      if (
        (above === undefined || s.top === above.bottom) &&
        (toRight === undefined || s.right === toRight.left) &&
        (below === undefined || s.bottom === below.top) &&
        (toLeft === undefined || s.left === toLeft.right)
      ) {
        this.top = s.top;
        this.right = s.right;
        this.bottom = s.bottom;
        this.left = s.left;
        return this;
      }
    }
    throw new Error(`Tile ${this.id} doesn't fit!`);
  }
}

const solve = (tiles: Tile[]): (Tile | undefined)[][] => {
  const usedTiles = new Set<Tile>();
  const dimensions = Math.sqrt(tiles.length);
  const image = new Array<(Tile | undefined)[]>(dimensions);
  for (let i = 0; i < dimensions; ++i) {
    image[i] = new Array<Tile | undefined>(dimensions);
    image[i].fill(undefined);
  }
  let x = 0;
  let y = 0;
  image[x][y] = tiles[Math.floor(Math.random() * tiles.length)];
  usedTiles.add(tiles[0]);
  let c = 0;
  while (c < dimensions * dimensions) {
    x = (x + 1) % dimensions;
    if (x >= dimensions) {
      x = 0;
      y++;
    }
    let gotTile = false;
    for (const tile of tiles) {
      if (usedTiles.has(tile)) continue;
      const above = y === 0 ? image[x][dimensions - 1] : image[x][y - 1];
      const toRight = x === dimensions - 1 ? image[0][y] : image[x + 1][y];
      const below = y === dimensions - 1 ? image[x][0] : image[x][y + 1];
      const toLeft = x === 0 ? image[dimensions - 1][y] : image[x - 1][y];
      try {
        const t = tile.fit(above, toRight, below, toLeft);
        usedTiles.add(t);
        image[x][y] = t;
        c++;
        gotTile = true;
        break;
      } catch (e) {
        console.log(e);
      }
    }
    if (!gotTile) {
      // no tile fits, try again with a different starting tile
      console.log(`Couldn't fit a tile at ${x}, ${y}!`);
      solve(tiles);
      break;
    }
  }
  return image;
};

(async () => {
  const input = await paragraphsAsStrings(
    path.join(".", "inputs", "day20.txt")
  );
  const tiles = input.map((para) => new Tile(para));
  const image = solve(tiles);
  console.log(image);
})();
