# Outfit Matcher

A simple phone-friendly web app that helps pick clothing colors that go together:
shirt, pants and shoes, with an optional jacket.

## How to use

1. Tap the piece you're starting with — **Shirt**, **Pants**, **Shoes** or **Jacket**.
2. Pick its color.
3. The app shows matching colors for the other pieces ("Great match" first, then "Also works").
   Each choice narrows down the suggestions for the rest.
4. Tap any piece at the top to change it. Skip the jacket with "No jacket today".

On a phone: open the site in Safari/Chrome → Share → **Add to Home Screen** to use it like an app.

## Run locally

No install or build needed — just open `index.html` in a browser:

```sh
open index.html
```

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page layout and outfit preview drawing |
| `style.css` | Look and feel (light & dark mode) |
| `colors.js` | **The color list and matching rules — edit this to tweak suggestions** |
| `app.js` | App logic: matching, screens, buttons |
| `manifest.json`, `icon*` | Home-screen app name and icon |

## Changing the color rules

All rules are in `colors.js`:

- `COLORS` — each color's name, hex value, and which pieces it's suggested for (`roles`).
- `GREAT` — pairs that look great together. Listing a pair once is enough (it works both ways).
- `NEUTRALS` — colors that are "safe" with almost anything.
- `AVOID` — pairs to never suggest, even if one is a neutral.
- `SUIT_COLORS` — colors where a jacket matching the pants (a suit) is suggested.
- `SHOES` — shoe colors and which pants they go with (shoes are matched to the pants only).

### Where the rules come from

The pairings follow common menswear advice and were checked against
[Effortless Gent](https://effortlessgent.com/clothing-color-combos/),
[Ape to Gentleman](https://www.apetogentleman.com/best-chino-colours-how-to-wear/),
[FashionBeans](https://www.fashionbeans.com/2011/mens-fashion-basics-part-43-combining-colours) and
[The Modest Man](https://www.themodestman.com/12-outdated-style-rules-guys-should-break-now/).
They're guidelines, not laws — change them to taste.

## Ideas for later

- More shoe colors: sand/beige suede (desert boots), off-white sneakers, olive,
  and splitting brown into dark brown (dressier, works with charcoal) and
  medium brown/cognac (casual). Maybe bold sneakers (green, red) too.
- Pick a color from a photo of the clothing item
- Accessories (belt, watch)
- Save favorite outfits
- Occasion filter (work / casual / date night)
