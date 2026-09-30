// Builds data/admin1/<ID>.json: states/provinces for each country (shapes, label points, area, capital,
// population, Wikipedia intro) plus data/admin1/index.json. Source: Natural Earth 10m admin-1.
// Usage: node tools/build-admin1.mjs   (needs npm install; downloads ~40 MB once into the OS temp folder)
import { readFile, writeFile, mkdir, readdir, rm, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as topojson from 'topojson-client';
import { topology } from 'topojson-server';
import polylabel from 'polylabel';
import { geoArea } from 'd3-geo';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'data', 'admin1');
const TMP = join(tmpdir(), 'meridian-admin1');
const UA = { 'User-Agent': 'GeolearnAtlas/1.0 (personal study app)' };
await mkdir(TMP, { recursive: true });
await rm(OUT, { recursive: true, force: true }); await mkdir(OUT, { recursive: true });

const src = join(TMP, 'admin1.geojson');
try { await access(src); } catch {
  console.log('downloading Natural Earth admin-1…');
  const r = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson');
  await writeFile(src, Buffer.from(await r.arrayBuffer()));
}

// 1. Merge over-fine units into the level people learn, simplify, split per country (mapshaper).
const split = join(TMP, 'split'); await rm(split, { recursive: true, force: true }); await mkdir(split);
const DISSOLVE_REGION = ['FRA', 'ITA', 'ESP', 'PHL', 'SVN', 'MLT'];
console.log('simplifying…');
execFileSync(process.execPath, [join(ROOT, 'node_modules', 'mapshaper', 'bin', 'mapshaper'), '-i', src,
  '-filter-fields', 'name,name_en,type_en,adm0_a3,iso_a2,wikidataid,iso_3166_2,region,geonunit',
  '-each', `grpc = ${JSON.stringify(DISSOLVE_REGION)}.indexOf(adm0_a3) >= 0 && region ? 'region' : (adm0_a3 === 'GBR' ? 'geonunit' : '')`,
  '-each', `key = adm0_a3 + '|' + (grpc === 'region' ? region : grpc === 'geonunit' ? geonunit : (iso_3166_2 || name) + '|' + name)`,
  '-each', `dname = grpc === 'region' ? region : grpc === 'geonunit' ? geonunit : (name_en || name)`,
  '-each', `dtype = grpc === 'region' ? (adm0_a3 === 'ESP' ? 'Autonomous community' : adm0_a3 === 'SVN' ? 'Statistical region' : 'Region') : grpc === 'geonunit' ? 'Country' : type_en`,
  '-each', `wd = grpc ? '' : wikidataid`,
  '-dissolve', 'key', 'copy-fields=adm0_a3,iso_a2,dname,dtype,wd',
  '-simplify', '5%', 'weighted', 'keep-shapes',
  '-split', 'adm0_a3',
  '-o', split + '/', 'format=topojson', 'singles', 'quantization=100000'], { stdio: ['ignore', 'ignore', 'inherit'] });

// 2. Group per country in our ids.
const countries = JSON.parse(await readFile(join(ROOT, 'data', 'countries.json'), 'utf8'));
const ids = new Set(countries.map(c => c.id)), byA2 = Object.fromEntries(countries.map(c => [c.a2, c.id]));
const ALIAS = { SDS: 'SSD', KOS: 'UNK', SAH: 'ESH', PSX: 'PSE', SOL: 'SOM', CYN: 'CYP', KAS: null, ESB: null, WSB: null, ATC: null, BJN: null, SER: null, SCR: null, USG: null, CNM: null, KAB: null };
const groups = {};
for (const f of await readdir(split)) {
  const topo = JSON.parse(await readFile(join(split, f), 'utf8'));
  for (const feat of topojson.feature(topo, Object.values(topo.objects)[0]).features) {
    const a3 = feat.properties.adm0_a3;
    const id = a3 in ALIAS ? ALIAS[a3] : ids.has(a3) ? a3 : byA2[feat.properties.iso_a2];
    if (!id) continue;
    (groups[id] ||= []).push(feat);
  }
}

// 3. Geometry-derived facts.
const ringArea = r => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return Math.abs(a / 2); };
function labelPoint(g) {
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  const big = polys.reduce((a, b) => (ringArea(b[0]) > ringArea(a[0]) ? b : a));
  const k = Math.cos((big[0].reduce((s, q) => s + q[1], 0) / big[0].length) * Math.PI / 180) || 1;
  const pt = polylabel(big.map(r => r.map(([x, y]) => [x * k, y])), 0.02);
  return [+pt[1].toFixed(2), +(pt[0] / k).toFixed(2)];
}
const regions = {};
for (const [id, feats] of Object.entries(groups)) {
  if (feats.length < 2) continue;
  regions[id] = feats.map((f, i) => ({
    k: i, name: f.properties.dname || 'Unnamed area', type: f.properties.dtype || 'Region', wd: f.properties.wd || null,
    area: Math.round(geoArea(f) * 6371.0088 ** 2), lab: labelPoint(f.geometry), f,
  }));
}

// 4. Wikipedia titles: via Wikidata sitelinks where we have an id; otherwise search.
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url, opts = {}, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { ...opts, headers: { ...UA, ...(opts.headers || {}) }, signal: AbortSignal.timeout(60000) });
      if (r.status === 429) { await sleep(3000 * (i + 1)); continue; }
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (e) { if (i === tries - 1) throw e; await sleep(1000 * (i + 1)); }
  }
}
async function pool(items, n, fn) { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } })); }
const all = Object.entries(regions).flatMap(([id, list]) => list.map(r => ({ cid: id, r })));
const cname = id => countries.find(c => c.id === id).name;

console.log('searching titles for merged regions…');
await pool(all.filter(x => !x.r.wd && x.r.name !== 'Unnamed area'), 3, async ({ cid, r }) => {
  const q = `${r.name.replace(/\s*\(.*?\)\s*/g, ' ')} ${r.type === 'Country' ? '' : 'region'} ${cname(cid)}`;
  const j = await get(`https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&list=search&srlimit=1&srsearch=${encodeURIComponent(q)}`).catch(() => null);
  const hit = j?.query?.search?.[0]; if (hit) r.title = hit.title;
});

console.log('wikidata facts…');
const qids = [...new Set(all.map(x => x.r.wd).filter(Boolean))];
const facts = {};
for (let i = 0; i < qids.length; i += 100) {
  console.log(`  ${i}/${qids.length}`);
  const vals = qids.slice(i, i + 100).map(q => 'wd:' + q).join(' ');
  const sparql = `SELECT ?item ?article (MAX(?pop) AS ?population) (SAMPLE(?capLabel) AS ?capital) WHERE { VALUES ?item { ${vals} }
    OPTIONAL { ?article schema:about ?item; schema:isPartOf <https://en.wikipedia.org/> }
    OPTIONAL { ?item wdt:P1082 ?pop } OPTIONAL { ?item wdt:P36 ?cap. ?cap rdfs:label ?capLabel FILTER(lang(?capLabel) = "en") } } GROUP BY ?item ?article`;
  const j = await get('https://query.wikidata.org/sparql', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/sparql-results+json' }, body: 'query=' + encodeURIComponent(sparql) })
    .catch(e => { console.warn('  sparql chunk failed', e.message); return null; });
  for (const b of j?.results?.bindings || []) {
    const q = b.item.value.split('/').pop();
    facts[q] = { title: b.article ? decodeURIComponent(b.article.value.split('/wiki/')[1]).replace(/_/g, ' ') : null, pop: b.population ? Math.round(+b.population.value) : null, cap: b.capital?.value || null };
  }
}
for (const { r } of all) if (r.wd && facts[r.wd]) { const f = facts[r.wd]; r.title = f.title || r.title; r.pop = f.pop; r.cap = f.cap; }

console.log('wikipedia intros…');
const titles = [...new Set(all.map(x => x.r.title).filter(Boolean))];
const intro = {};
const chunks = []; for (let i = 0; i < titles.length; i += 20) chunks.push(titles.slice(i, i + 20));
let done = 0;
await pool(chunks, 3, async chunk => {
  if (++done % 40 === 0) console.log(`  ${done}/${chunks.length}`);
  const j = await get('https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=extracts&exintro=1&explaintext=1&redirects=1&exlimit=20&titles=' + encodeURIComponent(chunk.join('|'))).catch(() => null);
  if (!j) return;
  const alias = new Map(chunk.map(t => [t, t]));
  for (const n of j.query.normalized || []) alias.set(n.from, n.to);
  const redir = new Map((j.query.redirects || []).map(x => [x.from, x.to]));
  const pages = new Map((j.query.pages || []).map(p => [p.title, p]));
  for (const t of chunk) {
    let k = alias.get(t) || t; k = redir.get(k) || k;
    const p = pages.get(k);
    if (p?.extract) intro[t] = {
      title: p.title,
      text: p.extract.split(/\n+/).map(s => s.trim()).filter(s => s.length > 40).slice(0, 2).map(s => (s.length > 900 ? s.slice(0, s.lastIndexOf('. ', 900) + 1) : s)),
    };
  }
});

// 5. Write one file per country plus an index.
const index = {};
let nText = 0, nRegions = 0;
for (const [id, list] of Object.entries(regions)) {
  const cn = cname(id).toLowerCase().split(' ')[0];
  const fc = { type: 'FeatureCollection', features: list.map(r => ({ type: 'Feature', properties: { k: r.k }, geometry: r.f.geometry })) };
  const topo = topology({ r: fc }, 1e5);
  const out = list.map(r => {
    const w = r.title ? intro[r.title] : null;
    // a search hit is kept only if it plausibly describes this place
    const ok = w && (r.wd || r.type === 'Country' || w.text.join(' ').toLowerCase().includes(cn));
    if (ok) nText++;
    return { k: r.k, name: r.name, type: r.type, area: r.area, lab: r.lab, cap: r.cap || null, pop: r.pop || null, title: ok ? w.title : null, text: ok ? w.text : null };
  });
  nRegions += out.length;
  await writeFile(join(OUT, id + '.json'), JSON.stringify({ topo, regions: out }));
  const types = {}; out.forEach(r => (types[r.type] = (types[r.type] || 0) + 1));
  index[id] = { n: out.length, type: Object.entries(types).sort((a, b) => b[1] - a[1])[0][0] };
}
await writeFile(join(OUT, 'index.json'), JSON.stringify(index));
console.log(`admin-1: ${Object.keys(index).length} countries, ${nRegions} regions, ${nText} with Wikipedia text`);

// Long articles can drop out of batched requests; fill any gaps with a second, continuation-aware pass.
await import('./fill-admin1-text.mjs');
