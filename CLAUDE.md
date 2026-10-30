# Outfit Matcher

Static site (plain HTML/CSS/JS, no build), hosted on GitHub Pages from `main`:
https://darnachmani.github.io/outfit-matcher/

## Releasing a change

GitHub Pages caches files for 10 minutes and phones (especially home-screen
apps) hold on to old copies. Whenever `style.css`, `colors.js` or `app.js`
changes, bump the `?v=N` number on all three links in `index.html` (keep them
the same number) so phones fetch the new files.

`sw.js` (service worker) fetches every file network-first with `no-cache`, so
once a phone has loaded it, updates show on the next open. Keep it
network-first — a cache-first worker would trap phones on old versions.
