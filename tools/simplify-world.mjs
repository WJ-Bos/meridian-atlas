// Simplifies data/world.json (country outlines) for speed. The globe triangulates every outline on load and
// the cost grows with the number of points, so keeping ~25% of them cuts the startup freeze several-fold.
// Uses spherical simplification: planar tools (e.g. mapshaper) turn shapes that cross the 180° line or a pole
// (Russia, Fiji, Antarctica) inside out. Keeps the original as world.full.json the first time.
// Usage: node tools/simplify-world.mjs [keepFraction=0.25]   (build-data.mjs runs it)
import { readFile, writeFile, access, copyFile } from 'node:fs/promises';
import * as topojson from 'topojson-client';
import * as ts from 'topojson-simplify';
import { geoArea } from 'd3-geo';

const file = new URL('../data/world.json', import.meta.url), full = new URL('../data/world.full.json', import.meta.url);
const keep = +(process.argv[2] || 0.25);
try { await access(full); } catch { await copyFile(file, full); }

const src = JSON.parse(await readFile(full, 'utf8'));
const pre = ts.presimplify(src, ts.sphericalTriangleArea);
const minWeight = ts.quantile(pre, keep); // weight that retains `keep` of the points
// keep points above the weight threshold (arc endpoints have infinite weight), drop the weight coordinate
pre.arcs = pre.arcs.map(arc => arc.filter(p => p[2] >= minWeight).map(p => [p[0], p[1]]));
// Islands under ~300 km² are dropped: each piece costs draw calls every frame, and tiny countries
// are drawn as clickable dots anyway.
const q = topojson.quantize(pre, 1e5);
const out = ts.filter(q, ts.filterWeight(q, 300 / 6371 ** 2, ts.sphericalRingArea));

// guard: no country may cover more than half the sphere (a sign it was turned inside out)
const bad = topojson.feature(out, out.objects.countries).features.filter(f => geoArea(f) > 2 * Math.PI).map(f => f.properties.name);
if (bad.length) throw new Error('inside-out shapes after simplifying: ' + bad.join(', '));

await writeFile(file, JSON.stringify(out));
const pts = t => t.arcs.reduce((s, a) => s + a.length, 0);
console.log(`world outlines: ${pts(src)} -> ${pts(out)} points, ${(JSON.stringify(src).length / 1e3).toFixed(0)} KB -> ${(JSON.stringify(out).length / 1e3).toFixed(0)} KB`);
