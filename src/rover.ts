export {};

const canvas = document.querySelector<HTMLCanvasElement>("#rover-canvas")!;
const ctx = canvas.getContext("2d")!;
const readout = document.querySelector<HTMLParagraphElement>("#rover-readout")!;
let x = 2;
let y = 2;
let direction = 0;

// --- Compass -----------------------------------------------------------
// Ordered clockwise, so turning right means moving to the next record.
// Each record carries its name and how one step changes the position.
type Direction = {
  name: string;
  dx: number;
  dy: number;
};

const compass: Direction[] = [
  { name: "North", dx: 0, dy: -1 },
  { name: "East", dx: 1, dy: 0 },
  { name: "South", dx: 0, dy: 1 },
  { name: "West", dx: -1, dy: 0 },
];

// --- Movement rule -----------------------------------------------------
function clampToGrid(value: number): number {
  return Math.max(0, Math.min(4, value));
}

// --- Commands ----------------------------------------------------------
// A command knows how to carry itself out. The label is for display only;
// nothing decides behavior by reading it.
type Command = {
  label: string;
  execute: () => void;
};

const forward: Command = {
  label: "Forward",
  execute: () => {
    const heading = compass[direction];
    x = clampToGrid(x + heading.dx);
    y = clampToGrid(y + heading.dy);
  },
};

const turnRight: Command = {
  label: "Right",
  execute: () => {
    direction = (direction + 1) % compass.length;
  },
};

// --- Invoker -----------------------------------------------------------
function runCommand(command: Command): void {
  command.execute();
  drawRover();
}

// --- Rendering ---------------------------------------------------------
function drawRover() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#718881";
  for (let row = 0; row < 5; row++) {
    for (let column = 0; column < 5; column++) {
      ctx.strokeRect(10 + column * 56, 10 + row * 56, 56, 56);
    }
  }
  ctx.save();
  ctx.translate(38 + x * 56, 38 + y * 56);
  ctx.rotate(direction * Math.PI / 2);
  ctx.fillStyle = "#27766b";
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(17, 16);
  ctx.lineTo(-17, 16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  readout.textContent = `Position: (${x}, ${y}) · Facing: ${
    compass[direction].name
  }`;
}

// --- Controls ----------------------------------------------------------
document.querySelector<HTMLButtonElement>("#rover-forward")!.onclick = () =>
  runCommand(forward);
document.querySelector<HTMLButtonElement>("#rover-right")!.onclick = () =>
  runCommand(turnRight);
document.querySelector<HTMLButtonElement>("#rover-reset")!.onclick = () => {
  x = 2;
  y = 2;
  direction = 0;
  drawRover();
};
drawRover();
