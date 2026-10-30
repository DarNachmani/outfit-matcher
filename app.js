// Outfit Matcher UI logic. Color data and rules live in colors.js.

const PIECES = ["shirt", "pants", "shoes", "jacket"];
const LABELS = { shirt: "Shirt", pants: "Pants", shoes: "Shoes", jacket: "Jacket" };
const PLURAL = ["pants", "shoes"];
const EMPTY_OUTFIT = { shirt: null, pants: null, shoes: null, jacket: null };
const byId = Object.fromEntries(COLORS.map((c) => [c.id, c]));

const state = {
  outfit: { ...EMPTY_OUTFIT },
  jacketSkipped: false,
  editing: null, // which piece is being picked right now
};

// --- Matching ---------------------------------------------------------------

const isSuit = (a, b, pieceA, pieceB) =>
  a === b && SUIT_COLORS.includes(a) && [pieceA, pieceB].sort().join() === "jacket,pants";

// Shoes only need to suit the pants (see SHOES in colors.js).
function shoeScore(shoe, other, otherPiece) {
  if (otherPiece !== "pants") return 2;
  const rule = SHOES[shoe];
  if (!rule) return 0;
  return rule.great.includes(other) ? 2 : rule.safe.includes(other) ? 1 : 0;
}

// 2 = great, 1 = safe, 0 = doesn't match. Pieces are needed for the suit and shoe rules.
function pairScore(a, b, pieceA, pieceB) {
  if (pieceA === "shoes") return shoeScore(a, b, pieceB);
  if (pieceB === "shoes") return shoeScore(b, a, pieceA);
  if (isSuit(a, b, pieceA, pieceB)) return 2;
  if (a === b) return SAME_COLOR_OK.includes(a) ? 1 : 0;
  if (AVOID.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return 0;
  if (GREAT[a]?.includes(b) || GREAT[b]?.includes(a)) return 2;
  if (NEUTRALS.includes(a) || NEUTRALS.includes(b)) return 1;
  return 0;
}

// Colors for `piece` that match every other piece already chosen, best first.
function suggestionsFor(piece) {
  const chosen = PIECES.filter((p) => p !== piece && state.outfit[p]);
  return COLORS.filter((c) => c.roles.includes(piece))
    .map((c) => {
      const scores = chosen.map((p) => pairScore(c.id, state.outfit[p], piece, p));
      const ok = scores.every((s) => s > 0);
      const great = scores.every((s) => s === 2);
      return { color: c, ok, great, total: scores.reduce((a, b) => a + b, 0) };
    })
    .filter((s) => s.ok)
    .sort((a, b) => b.great - a.great || b.total - a.total);
}

function outfitTip() {
  const worn = PIECES.filter((p) => state.outfit[p]);
  const ids = worn.map((p) => state.outfit[p]);
  if (ids.length < 2) return null;
  const pairs = [];
  for (let i = 0; i < worn.length; i++)
    for (let j = i + 1; j < worn.length; j++) pairs.push(pairScore(ids[i], ids[j], worn[i], worn[j]));
  const allGreat = pairs.every((s) => s === 2);
  // The tip describes the clothes; shoes only affect whether it's a great match.
  const clothes = worn.filter((p) => p !== "shoes").map((p) => state.outfit[p]);
  const bold = clothes.filter((id) => BOLD.includes(id));
  const earthy = clothes.filter((id) => EARTH_TONES.includes(id));
  const { jacket, pants } = state.outfit;

  let tip;
  if (isSuit(jacket, pants, "jacket", "pants")) tip = `A ${byId[pants].name.toLowerCase()} suit — matching jacket and trousers, sharp and put-together.`;
  else if (clothes.every((id) => NEUTRALS.includes(id))) tip = "Classic and clean — at home almost anywhere.";
  else if (bold.length === 1) tip = `A single note of ${byId[bold[0]].name.toLowerCase()}, grounded by quiet basics.`;
  else if (earthy.length >= 2) tip = "Warm earth tones — relaxed, easy, made for autumn.";
  else tip = "A considered combination that sits well together.";
  return { label: allGreat ? "Excellent match" : "Works well", tip };
}

// --- Rendering --------------------------------------------------------------

const $ = (sel) => document.querySelector(sel);
const lower = (piece) => LABELS[piece].toLowerCase();

// Color-block composition: jacket frames the shirt, pants sit below.
function paintLook() {
  for (const piece of PIECES) {
    const id = state.outfit[piece];
    document.querySelectorAll(`.blk-${piece}`).forEach((el) => {
      el.style.fill = id ? byId[id].hex : "";
      el.classList.toggle("empty", !id);
    });
  }
  const shirt = $(".blk-shirt");
  const framed = Boolean(state.outfit.jacket);
  shirt.setAttribute("x", framed ? 38 : 0);
  shirt.setAttribute("width", framed ? 44 : 120);
}

function renderPieces() {
  const list = $("#pieces");
  list.innerHTML = "";
  for (const piece of PIECES) {
    const id = state.outfit[piece];
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "piece-row" + (state.editing === piece ? " active" : "");
    const name = id
      ? `<span class="piece-name"><span class="tile-sm" style="background:${byId[id].hex}"></span>${byId[id].name}</span>`
      : `<span class="piece-name placeholder">${piece === "jacket" && state.jacketSkipped ? "None" : "Not chosen"}</span>`;
    btn.innerHTML = `<span><span class="label">${LABELS[piece]}</span>${name}</span><span class="piece-action">${id ? "Change" : "Add"}</span>`;
    btn.onclick = () => startEditing(piece);
    li.appendChild(btn);
    list.appendChild(li);
  }
}

function swatchGrid(colors, current) {
  const grid = document.createElement("div");
  grid.className = "grid";
  for (const color of colors) {
    const btn = document.createElement("button");
    btn.className = "swatch" + (color.id === current ? " current" : "");
    btn.innerHTML = `<span class="tile" style="background-color:${color.hex}"></span><span class="name">${color.name}</span>`;
    btn.onclick = () => choose(color.id);
    grid.appendChild(btn);
  }
  return grid;
}

function groupHead(title, count) {
  return `<div class="group-head"><span class="label">${title}</span><span class="label">${count}</span></div>`;
}

function renderStart(panel) {
  panel.innerHTML = `<p class="label">Begin</p><h2>What are you <em>starting</em> with?</h2><p class="lede">Choose the piece you already know you’ll wear.</p>`;
  const list = document.createElement("ul");
  list.className = "start-list";
  for (const piece of PIECES) {
    const li = document.createElement("li");
    li.innerHTML = `<button>${LABELS[piece]}<span>→</span></button>`;
    li.firstChild.onclick = () => startEditing(piece);
    list.appendChild(li);
  }
  panel.appendChild(list);
}

function renderVerdict(panel) {
  const verdict = outfitTip();
  const ids = PIECES.filter((p) => state.outfit[p]);
  panel.innerHTML = `
    <div class="verdict">
      <p class="label">The verdict · ${verdict.label}</p>
      <p class="tip">${verdict.tip}</p>
      <div class="combo">${ids.map((p) => `<div style="background:${byId[state.outfit[p]].hex}"></div>`).join("")}</div>
      <div class="combo-names">${ids.map((p) => `<span>${byId[state.outfit[p]].name} ${lower(p)}</span>`).join("")}</div>
    </div>`;
  const again = document.createElement("button");
  again.className = "btn";
  again.textContent = "Start a new look";
  again.onclick = reset;
  panel.appendChild(again);
}

function renderPicker(panel) {
  const piece = state.editing;
  const others = PIECES.filter((p) => p !== piece && state.outfit[p]);
  const current = state.outfit[piece];

  if (!others.length) {
    // First piece: show every color so he can find the item he owns
    // (shoes only come in shoe colors).
    const verb = PLURAL.includes(piece) ? "are" : "is";
    panel.innerHTML = `<p class="label">Step 1 · ${LABELS[piece]}</p><h2>What color ${verb} the ${lower(piece)}?</h2><p class="lede">Pick the closest shade.</p>`;
    panel.appendChild(swatchGrid(piece === "shoes" ? COLORS.filter((c) => c.roles.includes("shoes")) : COLORS, current));
  } else {
    const withText = others.map((p) => `${byId[state.outfit[p]].name.toLowerCase()} ${lower(p)}`).join(" and ");
    panel.innerHTML = `<p class="label">Step ${others.length + 1} · ${LABELS[piece]}</p><h2>${LABELS[piece]} to wear with your <em>${withText}</em></h2>`;
    const matches = suggestionsFor(piece);
    const great = matches.filter((s) => s.great).map((s) => s.color);
    const safe = matches.filter((s) => !s.great).map((s) => s.color);
    if (!matches.length) {
      panel.insertAdjacentHTML("beforeend", `<p class="empty-note">Nothing sits well with this combination — try changing one of the other pieces.</p>`);
    }
    if (great.length) {
      panel.insertAdjacentHTML("beforeend", groupHead("Best match", great.length));
      panel.appendChild(swatchGrid(great, current));
    }
    if (safe.length) {
      panel.insertAdjacentHTML("beforeend", groupHead("Also works", safe.length));
      panel.appendChild(swatchGrid(safe, current));
    }
  }

  if (piece === "jacket") {
    const skip = document.createElement("button");
    skip.className = "btn ghost";
    skip.textContent = current ? "Remove jacket" : "No jacket today";
    skip.onclick = () => {
      state.outfit.jacket = null;
      state.jacketSkipped = true;
      state.editing = nextPiece();
      commit();
    };
    panel.appendChild(skip);
  }
}

function render() {
  paintLook();
  renderPieces();
  const panel = $("#panel");
  panel.innerHTML = "";
  const anyChosen = PIECES.some((p) => state.outfit[p]);
  if (state.editing) renderPicker(panel);
  else if (anyChosen) renderVerdict(panel);
  else renderStart(panel);
}

// --- History ----------------------------------------------------------------
// Each step is saved as a browser history entry, so the phone's Back button
// steps back through the outfit instead of closing the app.

function snapshot() {
  return { outfit: { ...state.outfit }, jacketSkipped: state.jacketSkipped, editing: state.editing };
}

function commit() {
  history.pushState(snapshot(), "");
  render();
}

window.addEventListener("popstate", (e) => {
  if (!e.state) return;
  state.outfit = { ...e.state.outfit };
  state.jacketSkipped = e.state.jacketSkipped;
  state.editing = e.state.editing;
  render();
});

// --- Theme color -------------------------------------------------------------
// Android colors the status and navigation bars from theme-color; keep it in
// sync with the page background in both light and dark mode.

const darkQuery = matchMedia("(prefers-color-scheme: dark)");
function syncThemeColor() {
  const paper = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
  $('meta[name="theme-color"]').setAttribute("content", paper);
}
darkQuery.addEventListener("change", syncThemeColor);
syncThemeColor();

// --- Actions ----------------------------------------------------------------

function nextPiece() {
  // Shoes only narrow down the pants, so pick those next.
  if (state.outfit.shoes && !state.outfit.pants) return "pants";
  if (!state.outfit.shirt) return "shirt";
  if (!state.outfit.pants) return "pants";
  if (!state.outfit.shoes) return "shoes";
  if (!state.outfit.jacket && !state.jacketSkipped) return "jacket";
  return null;
}

function startEditing(piece) {
  if (state.editing === piece) return;
  state.editing = piece;
  commit();
  $("#panel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function choose(id) {
  const piece = state.editing;
  state.outfit[piece] = id;
  if (piece === "jacket") state.jacketSkipped = false;
  state.editing = nextPiece();
  commit();
}

function reset() {
  state.outfit = { ...EMPTY_OUTFIT };
  state.jacketSkipped = false;
  state.editing = null;
  commit();
}

$("#reset").onclick = reset;
document.querySelectorAll("[data-piece]").forEach((el) => {
  el.addEventListener("click", () => startEditing(el.dataset.piece));
});
history.replaceState(snapshot(), "");
render();
