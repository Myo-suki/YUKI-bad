const zone = document.querySelector("#button-zone");
const button = document.querySelector("#escape-button");
const attemptsEl = document.querySelector("#attempts");
const escapesEl = document.querySelector("#escapes");
const reliabilityEl = document.querySelector("#reliability");
const buttonStatusEl = document.querySelector("#button-status");
const globalStatusEl = document.querySelector("#global-status");
const secureLabel = document.querySelector("#secure-label");
const instruction = document.querySelector("#instruction");
const log = document.querySelector("#log");
const grid = document.querySelector("#incident-grid");
const modal = document.querySelector("#result-modal");
const finalAttempts = document.querySelector("#final-attempts");
const finalEscapes = document.querySelector("#final-escapes");

const MAX_ESCAPES = 10;
const GRID_SIZE = 104;
const pad = value => String(value).padStart(2, "0");

let attempts = 0;
let escapes = 0;
let compromised = false;
let moving = false;
let currentCell = 0;

const eventMessages = [
  ["WARN", "Cursor threat detected"],
  ["INFO", "Proximity threshold exceeded"],
  ["OK", "Emergency relocation completed"],
  ["OK", "Button integrity preserved"],
  ["WARN", "Unauthorized intent remains unresolved"],
  ["INFO", "Predictive evasion model recalibrated"],
  ["WARN", "User persistence exceeds expectations"],
  ["CRITICAL", "Patience resources approaching depletion"],
  ["CRITICAL", "Containment protocol destabilizing"],
  ["CRITICAL", "Final defensive position engaged"]
];

function timestamp() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

function addLog(level, message) {
  const line = document.createElement("div");
  line.className = "log-line";
  const className = level === "CRITICAL" ? "log-critical" :
    level === "WARN" ? "log-warn" :
    level === "OK" ? "log-ok" : "log-info";

  line.innerHTML = `<time>${timestamp()}</time><span class="${className}">${level}</span><p>${message}</p>`;
  log.appendChild(line);

  while (log.children.length > 13) {
    log.removeChild(log.firstElementChild);
  }
  log.scrollTop = log.scrollHeight;
}

function buildGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < GRID_SIZE; i += 1) {
    const cell = document.createElement("i");
    cell.className = "incident-cell";
    cell.setAttribute("aria-hidden", "true");
    grid.appendChild(cell);
  }
}

function activateIncident() {
  const cells = [...grid.children];
  if (!cells.length) return;

  const index = currentCell % cells.length;
  const level = attempts >= 9 ? 3 : attempts >= 5 ? 2 : 1;
  cells[index].classList.add(`active-${level}`);
  currentCell += Math.floor(Math.random() * 4) + 1;
}

function updateMetrics() {
  attemptsEl.textContent = pad(attempts);
  escapesEl.textContent = pad(escapes);
  const reliability = attempts === 0 ? 100 : Math.round((escapes / attempts) * 100);
  reliabilityEl.textContent = `${reliability}%`;
}

function randomPosition() {
  const zoneRect = zone.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  const horizontalMargin = 18;
  const verticalMargin = 25;
  const maxLeft = Math.max(horizontalMargin, zoneRect.width - buttonRect.width - horizontalMargin);
  const maxTop = Math.max(verticalMargin, zoneRect.height - buttonRect.height - 64);

  const left = horizontalMargin + Math.random() * (maxLeft - horizontalMargin);
  const top = verticalMargin + Math.random() * (maxTop - verticalMargin);

  button.style.left = `${left}px`;
  button.style.top = `${top}px`;
  button.style.transform = "translate(0, 0)";
}

function failContainment() {
  compromised = true;
  button.classList.add("compromised");
  button.textContent = "CLICK IF YOU MUST";
  buttonStatusEl.textContent = "EXPOSED";
  globalStatusEl.textContent = "SYSTEM DEGRADED";
  secureLabel.textContent = "COMPROMISED";
  secureLabel.style.color = "var(--gold)";
  instruction.textContent = "Containment has failed. The button is now vulnerable.";
  addLog("CRITICAL", "All avoidance protocols exhausted");
  addLog("WARN", "Click authorization reluctantly granted");
}

function evade() {
  if (compromised || moving) return;

  moving = true;
  attempts += 1;
  escapes += 1;
  updateMetrics();
  activateIncident();
  randomPosition();

  const [level, message] = eventMessages[Math.min(escapes - 1, eventMessages.length - 1)];
  addLog(level, message);

  if (escapes === 3) instruction.textContent = "Threat pattern recognized. Increasing relocation entropy.";
  if (escapes === 6) instruction.textContent = "Your persistence has been logged and quietly judged.";
  if (escapes === 9) instruction.textContent = "One defensive relocation remains.";

  if (escapes >= MAX_ESCAPES) {
    window.setTimeout(failContainment, 180);
  }

  window.setTimeout(() => { moving = false; }, 180);
}

function nearby(pointerX, pointerY) {
  if (compromised) return false;
  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return Math.hypot(pointerX - centerX, pointerY - centerY) < 105;
}

zone.addEventListener("pointermove", event => {
  if (event.pointerType === "mouse" && nearby(event.clientX, event.clientY)) evade();
});

button.addEventListener("pointerdown", event => {
  if (!compromised) {
    event.preventDefault();
    evade();
  }
});

button.addEventListener("focus", () => {
  if (!compromised) evade();
});

button.addEventListener("click", () => {
  if (!compromised) return;

  attempts += 1;
  updateMetrics();
  buttonStatusEl.textContent = "DEFEATED";
  globalStatusEl.textContent = "SYSTEM COMPROMISED";
  finalAttempts.textContent = pad(attempts);
  finalEscapes.textContent = pad(escapes);
  addLog("CRITICAL", "Button integrity lost");
  modal.hidden = false;
  document.body.style.overflow = "hidden";

  const previousBest = Number(localStorage.getItem("buttonOpsBest") || 0);
  if (!previousBest || attempts < previousBest) {
    localStorage.setItem("buttonOpsBest", String(attempts));
  }
});

document.querySelector("#clear-log").addEventListener("click", () => {
  log.innerHTML = "";
  addLog("INFO", "Operational log cleared by user");
});

function resetSystem() {
  attempts = 0;
  escapes = 0;
  compromised = false;
  moving = false;
  currentCell = 0;
  button.classList.remove("compromised");
  button.textContent = "DO NOT CLICK";
  button.removeAttribute("style");
  buttonStatusEl.textContent = "PROTECTED";
  globalStatusEl.textContent = "SYSTEM OPERATIONAL";
  secureLabel.textContent = "SECURE";
  secureLabel.removeAttribute("style");
  instruction.textContent = "Move your cursor into the containment zone.";
  modal.hidden = true;
  document.body.style.overflow = "";
  buildGrid();
  updateMetrics();
  log.innerHTML = "";
  addLog("INFO", "ButtonOps restored");
  addLog("OK", "Containment perimeter re-established");
  addLog("OK", "Button integrity verified");
}

document.querySelector("#reset-system").addEventListener("click", resetSystem);
document.querySelector("#restart").addEventListener("click", resetSystem);

modal.addEventListener("click", event => {
  if (event.target === modal) resetSystem();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modal.hidden) resetSystem();
});

document.querySelector("#year").textContent = new Date().getFullYear();
buildGrid();
updateMetrics();
