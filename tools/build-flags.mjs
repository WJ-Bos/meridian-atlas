// Shrinks data/flags.json by optimising each SVG (rounded coordinates, no metadata). Usage: node tools/build-flags.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { optimize } from 'svgo';
const file = new URL('../data/flags.json', import.meta.url);
const flags = JSON.parse(await readFile(file, 'utf8'));
const before = JSON.stringify(flags).length;
for (const [id, svg] of Object.entries(flags)) {
  try {
    flags[id] = optimize(svg, { multipass: true, floatPrecision: 3, plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }] }).data;
  } catch (e) { console.warn('kept original', id, e.message); }
}
await writeFile(file, JSON.stringify(flags));
console.log(`flags: ${(before / 1e6).toFixed(2)} MB -> ${(JSON.stringify(flags).length / 1e6).toFixed(2)} MB`);
