// Clothing colors and the rules for which ones go together.
// Edit this file to add colors or change what matches.
//
// Rules were checked against these menswear guides (Oct 2026):
// - Effortless Gent, "What Color Clothes Go Together?"
//   https://effortlessgent.com/clothing-color-combos/
//   (neutrals always match; khaki, grey and denim pants go with any shirt;
//   avoid outfits where pieces are the same color or very close in shade)
// - Ape to Gentleman, "5 Chino Colours Every Man Should Own"
//   https://www.apetogentleman.com/best-chino-colours-how-to-wear/
// - FashionBeans, "Combining Colours"
//   https://www.fashionbeans.com/2011/mens-fashion-basics-part-43-combining-colours
// - The Modest Man, "Outdated Style Rules"
//   https://www.themodestman.com/12-outdated-style-rules-guys-should-break-now/
//   (black with navy and black with brown are fine when the shades contrast)

// roles: which pieces this color is suggested for (shoes come in fewer colors).
const COLORS = [
  { id: "white",     name: "White",       hex: "#f7f7f5", roles: ["shirt", "pants", "shoes"] },
  { id: "black",     name: "Black",       hex: "#1c1c1c", roles: ["shirt", "pants", "jacket", "shoes"] },
  { id: "grey",      name: "Grey",        hex: "#9a9da1", roles: ["shirt", "pants", "jacket", "shoes"] },
  { id: "charcoal",  name: "Charcoal",    hex: "#45484d", roles: ["shirt", "pants", "jacket"] },
  { id: "navy",      name: "Navy",        hex: "#1f2a44", roles: ["shirt", "pants", "jacket", "shoes"] },
  { id: "lightblue", name: "Light Blue",  hex: "#a9c8e8", roles: ["shirt"] },
  { id: "denim",     name: "Denim Blue",  hex: "#4a6b8f", roles: ["shirt", "pants", "jacket"] },
  { id: "olive",     name: "Olive",       hex: "#6b6b3a", roles: ["shirt", "pants", "jacket"] },
  { id: "khaki",     name: "Khaki",       hex: "#c8b88a", roles: ["shirt", "pants", "jacket"] },
  { id: "tan",       name: "Tan",         hex: "#b08a5e", roles: ["shirt", "pants", "jacket", "shoes"] },
  { id: "brown",     name: "Brown",       hex: "#5c3e2b", roles: ["shirt", "pants", "jacket", "shoes"] },
  { id: "burgundy",  name: "Burgundy",    hex: "#6d1f2c", roles: ["shirt", "pants", "jacket", "shoes"] },
  { id: "forest",    name: "Forest Green",hex: "#2f4a35", roles: ["shirt", "pants", "jacket"] },
  { id: "sage",      name: "Sage",        hex: "#a3b19a", roles: ["shirt", "jacket"] },
  { id: "mustard",   name: "Mustard",     hex: "#d0a23a", roles: ["shirt", "jacket"] },
  { id: "rust",      name: "Rust",        hex: "#a4502c", roles: ["shirt", "jacket"] },
  { id: "cream",     name: "Cream",       hex: "#efe6d2", roles: ["shirt", "pants", "jacket"] },
  { id: "pink",      name: "Pink",        hex: "#e8b4bc", roles: ["shirt"] },
  { id: "red",       name: "Red",         hex: "#b3262e", roles: ["shirt"] },
  { id: "lavender",  name: "Lavender",    hex: "#b9a9d6", roles: ["shirt"] },
];

// Neutrals go with almost anything ("safe") unless listed in AVOID.
const NEUTRALS = ["white", "black", "grey", "charcoal", "navy", "denim", "khaki", "cream"];

// "Great" pairings. Order doesn't matter: navy→white also means white→navy.
const GREAT = {
  white:     ["navy", "denim", "khaki", "black", "charcoal", "olive", "grey", "tan", "burgundy", "forest", "brown", "rust", "lightblue"],
  black:     ["white", "grey", "charcoal", "cream", "burgundy", "olive", "mustard", "red", "denim"],
  grey:      ["navy", "black", "white", "burgundy", "pink", "lightblue", "lavender", "charcoal", "denim"],
  charcoal:  ["white", "lightblue", "pink", "burgundy", "grey", "lavender", "cream"],
  navy:      ["white", "khaki", "grey", "tan", "lightblue", "cream", "olive", "burgundy", "mustard", "pink", "rust", "brown"],
  lightblue: ["navy", "khaki", "grey", "charcoal", "tan", "white", "denim", "brown"],
  denim:     ["white", "grey", "olive", "brown", "rust", "mustard", "burgundy", "cream", "lightblue", "pink", "forest", "red"],
  olive:     ["white", "cream", "navy", "khaki", "tan", "denim", "black", "rust", "brown", "mustard", "burgundy"],
  khaki:     ["navy", "white", "lightblue", "olive", "forest", "burgundy", "denim", "brown", "rust", "pink", "grey"],
  tan:       ["navy", "white", "lightblue", "olive", "forest", "cream", "denim", "brown"],
  brown:     ["cream", "white", "lightblue", "navy", "olive", "khaki", "denim", "sage", "mustard", "tan"],
  burgundy:  ["grey", "navy", "khaki", "white", "charcoal", "black", "denim", "cream", "olive", "lightblue"],
  forest:    ["khaki", "tan", "cream", "white", "navy", "denim", "brown", "grey"],
  sage:      ["white", "cream", "navy", "khaki", "brown", "tan", "denim"],
  mustard:   ["navy", "denim", "grey", "olive", "brown", "charcoal", "white"],
  rust:      ["denim", "navy", "olive", "cream", "khaki", "white", "brown"],
  cream:     ["navy", "olive", "brown", "forest", "burgundy", "charcoal", "black", "denim", "sage", "rust", "tan"],
  pink:      ["navy", "grey", "khaki", "charcoal", "denim", "white", "forest"],
  red:       ["navy", "denim", "white", "black", "grey"],
  lavender:  ["grey", "navy", "charcoal", "white", "denim"],
};

// Pairs that are better avoided, even though one of them is a neutral:
// shades this close look like a near-miss rather than a choice.
// (Black with navy/brown/tan used to be "rules" — guides now call them fine.)
const AVOID = [
  ["cream", "white"], ["khaki", "tan"],
];

// Same color on two pieces is skipped, except these.
const SAME_COLOR_OK = ["black"];

// A jacket the same color as the pants makes a suit — a great match in these
// classic suit colors. (Same-color denim is left out: matching double denim
// tends to look like a uniform.)
const SUIT_COLORS = ["navy", "grey", "charcoal", "black", "brown", "tan", "olive", "khaki", "cream", "burgundy", "forest"];

const EARTH_TONES = ["olive", "khaki", "tan", "brown", "forest", "sage", "mustard", "rust", "cream"];
const BOLD = ["red", "mustard", "rust", "pink", "burgundy", "lavender"];

// Shoes are matched to the pants only — the shirt and jacket don't really
// affect which shoes work. Shoe color → pants colors.
// Sources: Bespoke Unit trouser/shoe coordination guide, FashionBeans shoe
// colour guide, John White chinos guide (brown/tan suit navy, grey, khaki,
// olive and jeans; brown with black trousers doesn't work; black shoes suit
// black, charcoal and grey; white sneakers go with almost anything casual).
const SHOES = {
  white: {
    great: ["navy", "denim", "khaki", "olive", "grey", "charcoal", "black", "tan", "brown", "cream", "forest", "burgundy"],
    safe:  ["white"],
  },
  black: {
    great: ["black", "charcoal", "grey"],
    safe:  ["navy", "denim", "white", "burgundy"],
  },
  brown: {
    great: ["navy", "grey", "khaki", "olive", "denim", "tan", "cream", "white", "burgundy", "forest"],
    safe:  ["charcoal", "brown"],
  },
  tan: {
    great: ["navy", "denim", "grey", "olive", "white", "cream", "forest"],
    safe:  ["khaki", "charcoal", "brown", "burgundy"],
  },
  burgundy: {
    great: ["navy", "grey", "charcoal", "khaki", "denim", "olive"],
    safe:  ["tan", "cream", "white", "black"],
  },
  grey: {
    great: ["navy", "denim", "black", "charcoal", "white"],
    safe:  ["grey", "khaki", "olive", "burgundy"],
  },
  navy: {
    great: ["grey", "khaki", "white", "cream", "tan"],
    safe:  ["denim", "navy", "olive", "brown"],
  },
};
