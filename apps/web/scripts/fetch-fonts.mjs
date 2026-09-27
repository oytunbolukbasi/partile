// Downloads the exact font faces the app uses into app/fonts/ so `next build` never talks to Google Fonts
// (Railway's builder blocks it intermittently). Run once, commit the files: `node scripts/fetch-fonts.mjs`.
// Uses an old-browser UA so Google serves one .woff per face that covers latin + latin-ext (Turkish glyphs).
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const UA = "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0";
const OUT = new URL("../app/fonts/", import.meta.url);

/** family → faces to keep: [weight, style] */
const WANT = {
  "Schibsted Grotesk": [[400, "normal"], [700, "normal"], [800, "normal"], [900, "normal"]],
  "Hanken Grotesk": [[400, "normal"], [500, "normal"], [600, "normal"], [700, "normal"], [800, "normal"]],
  Unbounded: [[800, "normal"]],
  Fraunces: [[800, "normal"], [800, "italic"]],
  "Pinyon Script": [[400, "normal"]],
  "Libre Baskerville": [[700, "normal"]],
  "Space Mono": [[700, "normal"]],
  "Cormorant Garamond": [[400, "italic"]],
};

const slug = (s) => s.toLowerCase().replace(/\s+/g, "-");
await mkdir(OUT, { recursive: true });

for (const [family, faces] of Object.entries(WANT)) {
  const weights = [...new Set(faces.map(([w]) => w))].sort((a, b) => a - b);
  const italic = faces.some(([, s]) => s === "italic");
  const axis = italic ? `ital,wght@${weights.map((w) => `0,${w}`).join(";")};${weights.map((w) => `1,${w}`).join(";")}` : `wght@${weights.join(";")}`;
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:${axis}&subset=latin,latin-ext`;
  const css = await (await fetch(url, { headers: { "User-Agent": UA } })).text();
  const blocks = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map((m) => m[1]);
  for (const [weight, style] of faces) {
    const block = blocks.find((b) => b.includes(`font-weight: ${weight}`) && b.includes(`font-style: ${style}`));
    const src = block && /url\((https:[^)]+)\)/.exec(block)?.[1];
    if (!src) throw new Error(`${family} ${weight} ${style}: face not found in\n${css}`);
    const bytes = new Uint8Array(await (await fetch(src)).arrayBuffer());
    const name = `${slug(family)}-${weight}${style === "italic" ? "-italic" : ""}.woff`;
    await writeFile(new URL(name, OUT), bytes);
    console.log(`${name}  ${(bytes.byteLength / 1024).toFixed(0)} KB`);
  }
}
console.log("done →", join(OUT.pathname));
