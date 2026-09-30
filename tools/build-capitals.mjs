// Adds capital coordinates (from Wikidata) to data/countries.json.  Usage: node tools/build-capitals.mjs
import { readFile, writeFile } from 'node:fs/promises';
const file = new URL('../data/countries.json', import.meta.url);
const countries = JSON.parse(await readFile(file, 'utf8'));
const q = `SELECT ?iso ?capLabel ?coord WHERE { ?c wdt:P298 ?iso. ?c wdt:P36 ?cap. ?cap wdt:P625 ?coord.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }`;
const r = await fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q),
  { headers: { 'User-Agent': 'GeolearnAtlas/1.0 (personal study app)', Accept: 'application/sparql-results+json' } });
const rows = (await r.json()).results.bindings;
const byIso = {};
for (const b of rows) {
  const [lng, lat] = b.coord.value.replace(/Point\(|\)/g, '').split(' ').map(Number);
  (byIso[b.iso.value] ||= []).push({ name: b.capLabel.value, lat, lng });
}
const norm = s => s.normalize('NFD').replace(/[^a-zA-Z]/g, '').toLowerCase().replace(/^saint/, 'st');
const MANUAL = { ATG: [17.121, -61.846], BES: [12.144, -68.266], ESH: [27.154, -13.203], GNQ: [3.752, 8.774],
  HKG: [22.281, 114.159], UNK: [42.663, 21.164], SJM: [78.223, 15.647], TKL: [-9.38, -171.25], YEM: [15.369, 44.191] };
let hit = 0; const miss = [];
for (const c of countries) {
  const cands = byIso[c.id] || (c.id === 'UNK' ? byIso.XKX : null) || [];
  const want = (c.capital[0] || '').toLowerCase();
  if (MANUAL[c.id]) { c.capLatLng = MANUAL[c.id]; hit++; continue; }
  const m = cands.find(x => norm(x.name) === norm(want)) || cands.find(x => norm(x.name).slice(0, 5) === norm(want).slice(0, 5)) || (cands.length === 1 ? cands[0] : null) || cands.find(x => want && (x.name.toLowerCase().includes(want) || want.includes(x.name.toLowerCase()))) || null;
  if (m && c.capital.length) { c.capLatLng = [+m.lat.toFixed(3), +m.lng.toFixed(3)]; hit++; }
  else if (c.capital.length) miss.push(c.id + ':' + c.capital[0] + ' [' + cands.map(x => x.name).join('|') + ']');
}
await writeFile(file, JSON.stringify(countries));
console.log('capitals located', hit, '\nmissing', miss.join('\n'));
