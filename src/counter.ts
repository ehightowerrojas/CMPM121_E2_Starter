export {};

const canvas = document.querySelector<HTMLCanvasElement>("#counter-canvas")!;
const ctx = canvas.getContext("2d")!;
const readout = document.querySelector<HTMLParagraphElement>(
  "#counter-readout",
)!;
const host = document.querySelector<HTMLDivElement>("#counter-panel-host")!;
const diagnostic = document.querySelector<HTMLParagraphElement>(
  "#counter-diagnostic",
)!;
const shieldCapacity = 10;
let count = 0;
let panel: HTMLParagraphElement | null = null;
let panelUpdates = 0;

// --- Shield snapshot (no DOM, no canvas) -------------------------------
type ShieldSnapshot = {
  charge: number;
  capacity: number;
  missing: number;
};

function takeShieldSnapshot(charge: number): ShieldSnapshot {
  return {
    charge,
    capacity: shieldCapacity,
    missing: shieldCapacity - charge,
  };
}

// --- Change announcements ----------------------------------------------
// Fired after the charge has actually changed. The event carries the
// snapshot so listeners never read the global count themselves.
const shieldChanged = "shield-changed";
type ShieldChangedEvent = CustomEvent<ShieldSnapshot>;
const shieldEvents = new EventTarget();

function announceShieldChange(shield: ShieldSnapshot): void {
  shieldEvents.dispatchEvent(
    new CustomEvent<ShieldSnapshot>(shieldChanged, { detail: shield }),
  );
}

// --- HUD view ----------------------------------------------------------
function drawMeter(shield: ShieldSnapshot): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < shield.capacity; i++) {
    ctx.fillStyle = i < shield.charge ? "#27766b" : "#c9d2c9";
    ctx.fillRect(12 + i * 28, 24, 24, 48);
  }
  ctx.fillStyle = "#233e43";
  ctx.font = "16px system-ui";
  ctx.fillText(`${shield.charge} / ${shield.capacity} shield`, 12, 100);
  readout.textContent = `Shield charge: ${shield.charge} / ${shield.capacity}`;
}

// --- Inspector view ----------------------------------------------------
function renderStats(shield: ShieldSnapshot): void {
  if (!panel) return;
  panel.textContent =
    `Shield charge: ${shield.charge} · Missing charge: ${shield.missing}`;
}

// Named so the same reference can be removed on close. Counts every
// delivery it receives, panel or not, so a leaked subscription would
// show up in the diagnostic.
function onInspectorDelivery(event: Event): void {
  panelUpdates++;
  diagnostic.textContent = `Inspector deliveries: ${panelUpdates}`;
  renderStats((event as ShieldChangedEvent).detail);
}

function openInspector(): void {
  if (panel) return;
  panel = document.createElement("p");
  host.append(panel);
  renderStats(takeShieldSnapshot(count));
  shieldEvents.addEventListener(shieldChanged, onInspectorDelivery);
}

function closeInspector(): void {
  if (!panel) return;
  shieldEvents.removeEventListener(shieldChanged, onInspectorDelivery);
  panel.remove();
  panel = null;
}

// --- State changes -----------------------------------------------------
function setCount(next: number) {
  const bounded = Math.max(0, Math.min(shieldCapacity, next));
  if (bounded === count) return;
  count = bounded;
  announceShieldChange(takeShieldSnapshot(count));
}

// --- Display wiring ----------------------------------------------------
shieldEvents.addEventListener(shieldChanged, (event) => {
  drawMeter((event as ShieldChangedEvent).detail);
});

// --- Controls ----------------------------------------------------------
document.querySelector<HTMLButtonElement>("#counter-less")!.onclick = () => {
  setCount(count - 1);
};
document.querySelector<HTMLButtonElement>("#counter-more")!.onclick = () => {
  setCount(count + 1);
};
document.querySelector<HTMLButtonElement>("#counter-reset")!.onclick = () => {
  setCount(0);
};
document.querySelector<HTMLButtonElement>("#counter-open")!.onclick =
  openInspector;
document.querySelector<HTMLButtonElement>("#counter-close")!.onclick =
  closeInspector;
drawMeter(takeShieldSnapshot(count));
