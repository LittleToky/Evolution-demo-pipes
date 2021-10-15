export type Vector2 = [number, number];

export interface Cell {
  self: string;
  image: string;
  rotate: number;
  turnTo: string;
  connections: Vector2[];
  coords: Vector2 | any;
}

export const CELLS: (key: string) => Cell = {
  "┛": {
    self: "┛",
    image: "angle",
    rotate: 0,
    turnTo: "┗",
    connections: [
      [0, 1],
      [-1, 0],
    ],
  },
  "┗": {
    self: "┗",
    image: "angle",
    rotate: 90,
    turnTo: "┏",
    connections: [
      [0, 1],
      [1, 0],
    ],
  },
  "┏": {
    self: "┏",
    image: "angle",
    rotate: 180,
    turnTo: "┓",
    connections: [
      [0, -1],
      [1, 0],
    ],
  },
  "┓": {
    self: "┓",
    image: "angle",
    rotate: 270,
    turnTo: "┛",
    connections: [
      [0, -1],
      [-1, 0],
    ],
  },

  "┃": {
    self: "┃",
    image: "two_sides",
    rotate: 0,
    turnTo: "━",
    connections: [
      [0, 1],
      [0, -1],
    ],
  },
  "━": {
    self: "━",
    image: "two_sides",
    rotate: 90,
    turnTo: "┃",
    connections: [
      [1, 0],
      [-1, 0],
    ],
  },

  "╻": {
    self: "╻",
    image: "one_side",
    rotate: 0,
    turnTo: "╸",
    connections: [[0, -1]],
  },
  "╸": {
    self: "╸",
    image: "one_side",
    rotate: 90,
    turnTo: "╹",
    connections: [[-1, 0]],
  },
  "╹": {
    self: "╹",
    image: "one_side",
    rotate: 180,
    turnTo: "╺",
    connections: [[0, 1]],
  },
  "╺": {
    self: "╺",
    image: "one_side",
    rotate: 270,
    turnTo: "╻",
    connections: [[1, 0]],
  },

  "┫": {
    self: "┫",
    image: "three_sides",
    rotate: 0,
    turnTo: "┻",
    connections: [
      [0, 1],
      [0, -1],
      [-1, 0],
    ],
  },
  "┻": {
    self: "┻",
    image: "three_sides",
    rotate: 90,
    turnTo: "┣",
    connections: [
      [0, 1],
      [1, 0],
      [-1, 0],
    ],
  },
  "┣": {
    self: "┣",
    image: "three_sides",
    rotate: 180,
    turnTo: "┳",
    connections: [
      [0, 1],
      [1, 0],
      [0, -1],
    ],
  },
  "┳": {
    self: "┳",
    image: "three_sides",
    rotate: 270,
    turnTo: "┫",
    connections: [
      [1, 0],
      [0, -1],
      [-1, 0],
    ],
  },

  "╋": {
    self: "╋",
    image: "four_sides",
    rotate: 0,
    turnTo: "╋",
    connections: [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ],
  },
};

// I tried to define special entity (both type and enum) but had some TS problems with dict processing
// (as I tried to navigate using CellChars as keys). I decided not to spend time for it during test task.
// enum CellChar {
//   '┛' = '┛',
//   '┗' = '┗',
//   '┏' = '┏',
//   '┓' = '┓',
//   '┃' = '┃',
//   '━' = '━',
//   '╻' = '╻',
//   '╸' = '╸',
//   '╹' = '╹',
//   '╺' = '╺',
//   '┫' = '┫',
//   '┻' = '┻',
//   '┣' = '┣',
//   '┳' = '┳',
//   '╋' ='╋'};
// enum CellChar = '┛' | '┗' | '┏' | '┓' | '┃' | '━' | '╻' | '╸' | '╹' | '╺' | '┫' | '┻' | '┣' | '┳' | '╋';

export const dataToCell = (i: number, j: number, key: string) => {
  const cell = CELLS[key];
  return { ...cell, coords: [j, i] };
};

export const getNeighbourCellData = (
  coords: Vector2,
  data: Cell[][],
  liveData: Boolean[][],
  direction: Vector2
) => {
  // coords - of current node, direction - from current node to neighbour
  const [x, y] = direction;
  const [newX, newY] = [coords[0] + x, coords[1] - y]; // neighbour cell coords
  const neighbourLine = data[newY];
  const neighbourCell = neighbourLine && neighbourLine[newX];
  const responsing = neighbourCell // (neighbour cell exists)
    ? !!neighbourCell.connections.find(
        ([xTemp, yTemp]) => xTemp === -x && yTemp === -y
      ) // check if it has responsive connection to the current cell
    : false; // not existing cell does not respose

  return {
    neighbourCell,
    alive: neighbourCell ? liveData[newY][newX] : false,
    responsing,
    neighbourCoords: [newX, newY],
  };
};
