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
  if (ids.length < 2) return "";
  const pairs = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) pairs.push(pairScore(ids[i], ids[j]));
  const allGreat = pairs.every((s) => s === 2);
  const bold = ids.filter((id) => BOLD.includes(id));
  const earthy = ids.filter((id) => EARTH_TONES.includes(id));

  let tip;
  if (ids.every((id) => NEUTRALS.includes(id))) tip = "Classic and clean — works almost anywhere.";
  else if (bold.length === 1) tip = `One pop of color (${byId[bold[0]].name.toLowerCase()}) with calm basics — nice balance.`;
  else if (earthy.length >= 2) tip = "Earth tones — warm and relaxed, great for fall.";
  else tip = "These colors work well together.";
  return (allGreat ? "👍 Great match! " : "👌 Safe match. ") + tip;
}

// --- Rendering --------------------------------------------------------------

const $ = (sel) => document.querySelector(sel);

function paintPreview() {
  for (const piece of PIECES) {
    const id = state.outfit[piece];
    document.querySelectorAll(`.svg-${piece}`).forEach((el) => {
      el.style.fill = id ? byId[id].hex : "transparent";
      el.classList.toggle("empty", !id);
    });
  }
  $("#jacket-layer").style.display = state.outfit.jacket ? "" : "none";
}

function renderChips() {
  const wrap = $("#chips");
  wrap.innerHTML = "";
  for (const piece of PIECES) {
    const id = state.outfit[piece];
    const btn = document.createElement("button");
    btn.className = "chip" + (state.editing === piece ? " active" : "");
    btn.innerHTML = id
      ? `<span class="dot" style="background:${byId[id].hex}"></span><span><small>${LABELS[piece]}</small>${byId[id].name}</span>`
      : `<span class="dot add">+</span><span><small>${LABELS[piece]}</small>${piece === "jacket" && state.jacketSkipped ? "None" : "Choose"}</span>`;
    btn.onclick = () => startEditing(piece);
    wrap.appendChild(btn);
  }
}

function swatchButton(color) {
  const btn = document.createElement("button");
  btn.className = "swatch";
  btn.innerHTML = `<span class="sw" style="background:${color.hex}"></span><span class="name">${color.name}</span>`;
  btn.onclick = () => choose(color.id);
  return btn;
}

function renderPanel() {
  const panel = $("#panel");
  panel.innerHTML = "";
  const anyChosen = PIECES.some((p) => state.outfit[p]);

  // Step 1: nothing chosen yet — ask where to start.
  if (!state.editing && !anyChosen) {
    panel.innerHTML = `<h2>What are you starting with?</h2><p class="hint">Pick the piece you already know you want to wear.</p>`;
    const row = document.createElement("div");
    row.className = "start-row";
    for (const piece of PIECES) {
      const b = document.createElement("button");
      b.className = "big";
      b.textContent = LABELS[piece];
      b.onclick = () => startEditing(piece);
      row.appendChild(b);
    }
    panel.appendChild(row);
    return;
  }

  // Done: show the result.
  if (!state.editing) {
    panel.innerHTML = `<h2>Your outfit</h2><p class="tip">${outfitTip()}</p><p class="hint">Tap any piece above to change it.</p>`;
    const again = document.createElement("button");
    again.className = "secondary";
    again.textContent = "Start over";
    again.onclick = reset;
    panel.appendChild(again);
    return;
  }

  // Picking a color for one piece.
  const piece = state.editing;
  const others = PIECES.filter((p) => p !== piece && state.outfit[p]);
  const title = others.length
    ? `${LABELS[piece]} colors that go with your ${others.map((p) => byId[state.outfit[p]].name.toLowerCase() + " " + LABELS[p].toLowerCase()).join(" and ")}`
    : `What color is the ${LABELS[piece].toLowerCase()}?`;
  panel.innerHTML = `<h2>${title}</h2>`;

  // For the first piece show every color so he can find the item he owns.
  const fullList = others.length ? suggestionsFor(piece) : COLORS.map((c) => ({ color: c }));

  const great = fullList.filter((s) => s.great);
  const safe = fullList.filter((s) => s.great === false);
  const grid = (items) => {
    const g = document.createElement("div");
    g.className = "grid";
    items.forEach((s) => g.appendChild(swatchButton(s.color)));
    return g;
  };

  if (!others.length) {
    panel.appendChild(grid(fullList));
  } else if (!fullList.length) {
    panel.insertAdjacentHTML("beforeend", `<p class="hint">Nothing matches this combo well — try changing one of the other pieces.</p>`);
  } else {
    if (great.length) {
      panel.insertAdjacentHTML("beforeend", `<h3>Great match</h3>`);
      panel.appendChild(grid(great));
    }
    if (safe.length) {
      panel.insertAdjacentHTML("beforeend", `<h3>Also works</h3>`);
      panel.appendChild(grid(safe));
    }
  }

  if (piece === "jacket") {
    const skip = document.createElement("button");
    skip.className = "secondary";
    skip.textContent = state.outfit.jacket ? "Remove jacket" : "No jacket today";
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
  paintPreview();
  renderChips();
  renderPanel();
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
