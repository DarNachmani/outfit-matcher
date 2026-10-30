// Outfit Matcher UI logic. Color data and rules live in colors.js.

const PIECES = ["shirt", "pants", "jacket"];
const LABELS = { shirt: "Shirt", pants: "Pants", jacket: "Jacket" };
const byId = Object.fromEntries(COLORS.map((c) => [c.id, c]));

const state = {
  outfit: { shirt: null, pants: null, jacket: null },
  jacketSkipped: false,
  editing: null, // which piece is being picked right now
};

// --- Matching ---------------------------------------------------------------

// 2 = great, 1 = safe, 0 = doesn't match
function pairScore(a, b) {
  if (a === b) return SAME_COLOR_OK.includes(a) ? 1 : 0;
  if (AVOID.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return 0;
  if (GREAT[a]?.includes(b) || GREAT[b]?.includes(a)) return 2;
  if (NEUTRALS.includes(a) || NEUTRALS.includes(b)) return 1;
  return 0;
}

// Colors for `piece` that match every other piece already chosen, best first.
function suggestionsFor(piece) {
  const chosen = PIECES.filter((p) => p !== piece && state.outfit[p]).map((p) => state.outfit[p]);
  return COLORS.filter((c) => c.roles.includes(piece))
    .map((c) => {
      const scores = chosen.map((o) => pairScore(c.id, o));
      const ok = scores.every((s) => s > 0);
      const great = scores.every((s) => s === 2);
      return { color: c, ok, great, total: scores.reduce((a, b) => a + b, 0) };
    })
    .filter((s) => s.ok)
    .sort((a, b) => b.great - a.great || b.total - a.total);
}

function outfitTip() {
  const ids = PIECES.map((p) => state.outfit[p]).filter(Boolean);
  if (ids.length < 2) return null;
  const pairs = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) pairs.push(pairScore(ids[i], ids[j]));
  const allGreat = pairs.every((s) => s === 2);
  const bold = ids.filter((id) => BOLD.includes(id));
  const earthy = ids.filter((id) => EARTH_TONES.includes(id));

  let tip;
  if (ids.every((id) => NEUTRALS.includes(id))) tip = "Classic and clean — at home almost anywhere.";
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
    const el = $(`.blk-${piece}`);
    el.style.fill = id ? byId[id].hex : "";
    el.classList.toggle("empty", !id);
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
    // First piece: show every color so he can find the item he owns.
    panel.innerHTML = `<p class="label">Step 1 · ${LABELS[piece]}</p><h2>What color is the ${lower(piece)}?</h2><p class="lede">Pick the closest shade.</p>`;
    panel.appendChild(swatchGrid(COLORS, current));
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
      render();
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

// --- Actions ----------------------------------------------------------------

function nextPiece() {
  if (!state.outfit.shirt) return "shirt";
  if (!state.outfit.pants) return "pants";
  if (!state.outfit.jacket && !state.jacketSkipped) return "jacket";
  return null;
}

function startEditing(piece) {
  state.editing = piece;
  render();
  $("#panel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function choose(id) {
  const piece = state.editing;
  state.outfit[piece] = id;
  if (piece === "jacket") state.jacketSkipped = false;
  state.editing = nextPiece();
  render();
}

function reset() {
  state.outfit = { shirt: null, pants: null, jacket: null };
  state.jacketSkipped = false;
  state.editing = null;
  render();
}

$("#reset").onclick = reset;
document.querySelectorAll("[data-piece]").forEach((el) => {
  el.addEventListener("click", () => startEditing(el.dataset.piece));
});
render();
