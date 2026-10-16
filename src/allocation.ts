export {};

// --- Community model ---------------------------------------------------
// Everyone in the community draws from the shared supply, whether or not
// they are currently assigned to produce. Need is per person; production
// is per producer.
const communitySize = 6;
const suppliesPerProducer = 3;
const suppliesNeededPerMember = 1;
const initialProducerCount = 2;

// --- Drawing constants ---------------------------------------------------
const colors = {
  producer: "#27766b",
  member: "#c9d2c9",
  producerLabel: "#ffffff",
  text: "#233e43",
  need: "#a44d23",
} as const;
const memberTileSize = 36;
const memberTileSpacing = 45;
const barPixelsPerSupply = 14;
const leftMargin = 18;
const firstSupplyRowY = 102;
const supplyRowSpacing = 52;

// --- DOM ---------------------------------------------------------------
const canvas = document.querySelector<HTMLCanvasElement>("#allocation-canvas")!;
const ctx = canvas.getContext("2d")!;
const readout = document.querySelector<HTMLParagraphElement>(
  "#allocation-readout",
)!;

let producerCount = initialProducerCount;

// --- Shift calculation (no DOM, no canvas) -----------------------------
type ShiftResult = {
  producers: number;
  communitySize: number;
  produced: number;
  needed: number;
  balance: number;
};

function suppliesProduced(producers: number): number {
  return producers * suppliesPerProducer;
}

function communityNeed(): number {
  return communitySize * suppliesNeededPerMember;
}

function calculateShift(producers: number): ShiftResult {
  const produced = suppliesProduced(producers);
  const needed = communityNeed();
  return {
    producers,
    communitySize,
    produced,
    needed,
    balance: produced - needed,
  };
}

// --- Supply report rows ------------------------------------------------
// Each row says what to show and how to color it. The amount is read
// from the calculated shift, so the provisioning rules live only in
// calculateShift(). Order in this list decides vertical position.
type SupplyRow = {
  label: string;
  amountFrom: (shift: ShiftResult) => number;
  barColor: string;
};

const supplyRows: SupplyRow[] = [
  {
    label: "Production",
    amountFrom: (shift) => shift.produced,
    barColor: colors.producer,
  },
  {
    label: "Consumption",
    amountFrom: (shift) => shift.needed,
    barColor: colors.need,
  },
];

// --- Canvas renderer ---------------------------------------------------
function drawCommunityMembers(shift: ShiftResult): void {
  ctx.font = "16px system-ui";
  for (let member = 0; member < shift.communitySize; member++) {
    const isProducing = member < shift.producers;
    const x = leftMargin + member * memberTileSpacing;
    ctx.fillStyle = isProducing ? colors.producer : colors.member;
    ctx.fillRect(x, 16, memberTileSize, memberTileSize);
    ctx.fillStyle = isProducing ? colors.producerLabel : colors.text;
    ctx.fillText(String(member + 1), x + 13, 40);
  }
}

function drawSupplyRows(shift: ShiftResult): void {
  supplyRows.forEach((row, index) => {
    const labelY = firstSupplyRowY + index * supplyRowSpacing;
    const amount = row.amountFrom(shift);
    ctx.fillStyle = colors.text;
    ctx.fillText(`${row.label}: ${amount}`, leftMargin, labelY);
    ctx.fillStyle = row.barColor;
    ctx.fillRect(leftMargin, labelY + 8, amount * barPixelsPerSupply, 20);
  });
}

function drawShift(shift: ShiftResult): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCommunityMembers(shift);

  ctx.font = "14px system-ui";
  ctx.fillStyle = colors.text;
  ctx.fillText(
    `Producers: ${shift.producers} / ${shift.communitySize}`,
    leftMargin,
    76,
  );
  drawSupplyRows(shift);
}

// --- Readout renderer --------------------------------------------------
function formatSigned(value: number): string {
  return `${value > 0 ? "+" : ""}${value}`;
}

function writeReadout(shift: ShiftResult): void {
  readout.textContent =
    `Assigned: ${shift.producers}/${shift.communitySize} · ` +
    `Production: ${shift.produced} · Consumption: ${shift.needed} · ` +
    `Balance: ${formatSigned(shift.balance)}`;
}

// --- Update cycle ------------------------------------------------------
function render(): void {
  const shift = calculateShift(producerCount);
  drawShift(shift);
  writeReadout(shift);
}

// --- Controls ----------------------------------------------------------
function setProducerCount(next: number): void {
  producerCount = Math.max(0, Math.min(communitySize, next));
  render();
}

document.querySelector<HTMLButtonElement>("#allocation-less")!.onclick = () =>
  setProducerCount(producerCount - 1);
document.querySelector<HTMLButtonElement>("#allocation-more")!.onclick = () =>
  setProducerCount(producerCount + 1);
document.querySelector<HTMLButtonElement>("#allocation-reset")!.onclick = () =>
  setProducerCount(initialProducerCount);

render();
