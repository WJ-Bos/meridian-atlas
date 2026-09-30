// Fills in Wikipedia summaries for states/provinces in data/admin1 that have none.
// Titles come from each region's Wikidata id (Natural Earth) or, for merged regions, a Wikipedia search.
// Usage: node tools/fill-admin1-text.mjs   (run after build-admin1.mjs; reuses its temp files)
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as topojson from 'topojson-client';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'data', 'admin1');
const SPLIT = join(tmpdir(), 'meridian-admin1', 'split');
const UA = { 'User-Agent': 'GeolearnAtlas/1.0 (personal study app)' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(60000) });
      if (r.status === 429) { await sleep(3000 * (i + 1)); continue; }
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (e) { if (i === tries - 1) return null; await sleep(1000 * (i + 1)); }
  }
}
async function pool(items, n, fn) { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } })); }

const countries = JSON.parse(await readFile(join(ROOT, 'data', 'countries.json'), 'utf8'));
const cname = Object.fromEntries(countries.map(c => [c.id, c.name]));
const byA3 = new Set(countries.map(c => c.id));
const ALIAS = { SDS: 'SSD', KOS: 'UNK', SAH: 'ESH', PSX: 'PSE', SOL: 'SOM', CYN: 'CYP' };

// Wikidata ids by country + region name, from the simplified Natural Earth split files
const wdOf = {};
for (const f of await readdir(SPLIT)) {
  const topo = JSON.parse(await readFile(join(SPLIT, f), 'utf8'));
  for (const ft of topojson.feature(topo, Object.values(topo.objects)[0]).features) {
    const p = ft.properties, id = ALIAS[p.adm0_a3] || (byA3.has(p.adm0_a3) ? p.adm0_a3 : null);
    if (id && p.wd) wdOf[id + '|' + p.dname] = p.wd;
  }
}

const files = (await readdir(DIR)).filter(f => f !== 'index.json');
const data = {}, need = [];
for (const f of files) {
  const id = f.replace('.json', ''); data[id] = JSON.parse(await readFile(join(DIR, f), 'utf8'));
  for (const r of data[id].regions) if (!r.text && r.name !== 'Unnamed area') need.push({ id, r, wd: wdOf[id + '|' + r.name] });
}
console.log('regions without text:', need.length);

// titles known to defeat the search
const TITLE = { 'GBR|England': 'England', 'GBR|Wales': 'Wales', 'GBR|Northern Ireland': 'Northern Ireland', 'GBR|Scotland': 'Scotland' };
for (const x of need) if (TITLE[x.id + '|' + x.r.name]) x.title = TITLE[x.id + '|' + x.r.name];

// titles: Wikidata sitelinks (50 ids per request), else search
const withWd = need.filter(x => x.wd && !x.title);
for (let i = 0; i < withWd.length; i += 50) {
  const part = withWd.slice(i, i + 50);
  const j = await get(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=sitelinks&sitefilter=enwiki&ids=${part.map(x => x.wd).join('|')}`);
  for (const x of part) x.title = j?.entities?.[x.wd]?.sitelinks?.enwiki?.title || null;
}
await pool(need.filter(x => !x.title), 3, async x => {
  const q = `${x.r.name.replace(/\s*\(.*?\)\s*/g, ' ')} ${x.r.type === 'Country' ? '' : x.r.type} ${cname[x.id]}`;
  const j = await get(`https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&list=search&srlimit=1&srsearch=${encodeURIComponent(q)}`);
  x.title = j?.query?.search?.[0]?.title || null; x.searched = true;
});

// intros in small batches, following continuation so long articles are not dropped
const titles = [...new Set(need.map(x => x.title).filter(Boolean))];
const intro = {};
const chunks = []; for (let i = 0; i < titles.length; i += 10) chunks.push(titles.slice(i, i + 10));
await pool(chunks, 3, async chunk => {
  let cont = '';
  for (let guard = 0; guard < 10; guard++) {
    const j = await get('https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=extracts&exintro=1&explaintext=1&redirects=1&exlimit=10&titles=' + encodeURIComponent(chunk.join('|')) + cont);
    if (!j) return;
    const alias = new Map(chunk.map(t => [t, t]));
    for (const n of j.query.normalized || []) alias.set(n.from, n.to);
    const redir = new Map((j.query.redirects || []).map(x => [x.from, x.to]));
    const pages = new Map((j.query.pages || []).map(p => [p.title, p]));
    for (const t of chunk) {
      let k = alias.get(t) || t; k = redir.get(k) || k;
      const p = pages.get(k);
      if (p?.extract && !intro[t]) intro[t] = { title: p.title, text: p.extract.split(/\n+/).map(s => s.trim()).filter(s => s.length > 40).slice(0, 2).map(s => (s.length > 900 ? s.slice(0, s.lastIndexOf('. ', 900) + 1) : s)) };
    }
    if (!j.continue?.excontinue) break;
    cont = '&excontinue=' + j.continue.excontinue;
  }
});

// A summary must be about this place: its article title or opening lines have to share a word with the
// region's name (or a word stem, so Cataluña matches Catalonia). This rejects hits like "Flag of the Cook
// Islands" or a whole-country article attached to one of its districts.
const fold = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const words = t => fold(t).replace(/\(.*?\)/g, ' ').split(/[^a-z]+/).filter(w => w.length > 2 && !['the', 'and', 'of', 'saint', 'province', 'region', 'district', 'state', 'county', 'islands', 'island'].includes(w));
function matches(r, w) {
  const nw = words(r.name); if (!nw.length) return true;
  const tw = words(w.title), head = fold((w.text?.[0] || '').slice(0, 300));
  return nw.some(n => tw.includes(n) || head.includes(n) || tw.some(t => t.slice(0, 3) === n.slice(0, 3)));
}

let filled = 0;
for (const x of need) {
  const w = x.title && intro[x.title];
  if (!w || !w.text.length || !matches(x.r, w)) continue;
  x.r.title = w.title; x.r.text = w.text; filled++;
}
// re-check summaries from earlier passes with the same rule
let dropped = 0;
for (const d of Object.values(data)) for (const r of d.regions) if (r.text && !matches(r, r)) { r.text = null; r.title = null; dropped++; }
console.log('dropped mismatched summaries:', dropped);
for (const id of Object.keys(data)) await writeFile(join(DIR, id + '.json'), JSON.stringify(data[id]));
const total = Object.values(data).reduce((s, d) => s + d.regions.length, 0), withText = Object.values(data).reduce((s, d) => s + d.regions.filter(r => r.text).length, 0);
console.log(`filled ${filled}; now ${withText} of ${total} regions have text`);
