// Adds a label point to each country in data/countries.json: the "pole of inaccessibility" of its largest
// polygon, i.e. the interior point furthest from the coast/border, which is where a map puts the name.
// Usage: node tools/build-labels.mjs
import { readFile, writeFile } from 'node:fs/promises';
import * as topojson from 'topojson-client';
import polylabel from 'polylabel';

const file = new URL('../data/countries.json', import.meta.url);
const countries = JSON.parse(await readFile(file, 'utf8'));
const world = JSON.parse(await readFile(new URL('../data/world.json', import.meta.url), 'utf8'));
const byN3 = Object.fromEntries(countries.filter(c => c.n3).map(c => [c.n3, c]));
const byName = { Kosovo: countries.find(c => c.name === 'Kosovo') };

// planar ring area in degrees² scaled by latitude so polar polygons don't win unfairly
const ringArea = r => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return Math.abs(a / 2); };
const polyArea = p => ringArea(p[0]) * Math.cos((p[0].reduce((s, q) => s + q[1], 0) / p[0].length) * Math.PI / 180);

let n = 0;
for (const f of topojson.feature(world, world.objects.countries).features) {
  const c = byN3[f.id] || byName[f.properties.name];
  if (!c || c.labelLatLng) continue;
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const big = polys.reduce((a, b) => (polyArea(b) > polyArea(a) ? b : a));
  // work in a latitude-corrected space so the chosen point is central on the globe, not just on the flat map
  const k = Math.cos((big[0].reduce((s, q) => s + q[1], 0) / big[0].length) * Math.PI / 180) || 1;
  const pt = polylabel(big.map(r => r.map(([x, y]) => [x * k, y])), 0.05);
  c.labelLatLng = [+pt[1].toFixed(2), +(pt[0] / k).toFixed(2)];
  n++;
}
// shapeless places fall back to their reference coordinates
for (const c of countries) if (!c.labelLatLng && c.latlng?.length) c.labelLatLng = c.latlng;
await writeFile(file, JSON.stringify(countries));
const show = id => { const c = countries.find(x => x.id === id); return id + ' ' + c.labelLatLng + ' (was ' + c.latlng + ')'; };
console.log('labels', n, '\n' + ['USA', 'CHL', 'HRV', 'RUS', 'NOR', 'FRA', 'CAN', 'IDN'].map(show).join('\n'));
