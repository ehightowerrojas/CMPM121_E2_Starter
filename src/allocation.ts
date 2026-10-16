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

// --- DOM ---------------------------------------------------------------
const canvas = document.querySelector<HTMLCanvasElement>("#allocation-canvas")!;
const ctx = canvas.getContext("2d")!;
const readout = document.querySelector<HTMLParagraphElement>(
  "#allocation-readout",
)!;

let producerCount = initialProducerCount;

// --- Pure calculations -------------------------------------------------
function suppliesProduced(producers: number): number {
  return producers * suppliesPerProducer;
}

function communityNeed(): number {
  return communitySize * suppliesNeededPerMember;
}

function formatSigned(value: number): string {
  return `${value > 0 ? "+" : ""}${value}`;
}

// --- Rendering ---------------------------------------------------------
function drawCommunityMembers(producers: number): void {
  ctx.font = "16px system-ui";
  for (let member = 0; member < communitySize; member++) {
    const isProducing = member < producers;
    const x = leftMargin + member * memberTileSpacing;
    ctx.fillStyle = isProducing ? colors.producer : colors.member;
    ctx.fillRect(x, 16, memberTileSize, memberTileSize);
    ctx.fillStyle = isProducing ? colors.producerLabel : colors.text;
    ctx.fillText(String(member + 1), x + 13, 40);
  }
}

function drawSupplyBar(
  label: string,
  amount: number,
  labelY: number,
  barColor: string,
): void {
  ctx.fillStyle = colors.text;
  ctx.fillText(`${label}: ${amount}`, leftMargin, labelY);
  ctx.fillStyle = barColor;
  ctx.fillRect(leftMargin, labelY + 8, amount * barPixelsPerSupply, 20);
}

function render(): void {
  const produced = suppliesProduced(producerCount);
  const needed = communityNeed();
  const balance = produced - needed;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCommunityMembers(producerCount);

  ctx.font = "14px system-ui";
  ctx.fillStyle = colors.text;
  ctx.fillText(
    `Producers: ${producerCount} / ${communitySize}`,
    leftMargin,
    76,
  );
  drawSupplyBar("Production", produced, 102, colors.producer);
  drawSupplyBar("Consumption", needed, 154, colors.need);

  readout.textContent =
    `Assigned: ${producerCount}/${communitySize} · Production: ${produced} · ` +
    `Consumption: ${needed} · Balance: ${formatSigned(balance)}`;
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
