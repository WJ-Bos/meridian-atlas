// Builds every data file the app needs into ../data so the app runs without live APIs.
// Usage: node tools/build-data.mjs
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const UA = { 'User-Agent': 'GeolearnAtlas/1.0 (personal study app; wjbosdev@gmail.com)' };
await mkdir(OUT, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url, type = 'json', tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (r.status === 429) { await sleep(2000 * (i + 1)); continue; }
      if (!r.ok) throw new Error(r.status + ' ' + url);
      return type === 'json' ? r.json() : r.text();
    } catch (e) { if (i === tries - 1) throw e; await sleep(800 * (i + 1)); }
  }
}
async function pool(items, n, fn) {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}
const save = (f, d) => writeFile(join(OUT, f), typeof d === 'string' ? d : JSON.stringify(d));

// ---------- 1. Base facts ----------
console.log('countries…');
const WC = 'https://cdn.jsdelivr.net/npm/world-countries@5.1.0';
const raw = await get(`${WC}/countries.json`);

// ---------- 2. World Bank indicators ----------
const IND = {
  population: 'SP.POP.TOTL', gdp: 'NY.GDP.MKTP.CD', gdpPc: 'NY.GDP.PCAP.CD',
  lifeExp: 'SP.DYN.LE00.IN', urban: 'SP.URB.TOTL.IN.ZS', popGrowth: 'SP.POP.GROW',
  fertility: 'SP.DYN.TFRT.IN', forest: 'AG.LND.FRST.ZS', internet: 'IT.NET.USER.ZS',
  medianAgeProxy: 'SP.POP.65UP.TO.ZS', co2pc: 'EN.GHG.CO2.PC.CE.AR5',
};
const wb = {};
for (const [key, code] of Object.entries(IND)) {
  console.log('worldbank', key);
  try {
    const j = await get(`https://api.worldbank.org/v2/country/all/indicator/${code}?format=json&per_page=500&mrnev=1`);
    for (const row of j[1] || []) {
      if (row.value == null) continue;
      (wb[row.countryiso3code] ??= {})[key] = { v: row.value, y: +row.date };
    }
  } catch (e) { console.warn('  skipped', key, e.message); }
}
// Places the World Bank does not report on (approximate, recent estimates)
const POP_FALLBACK = { TWN: 23400000, VAT: 800, ESH: 590000, FLK: 3700, GIB: 32700, AIA: 15900, MSR: 4400,
  COK: 15000, NIU: 1700, TKL: 1900, SHN: 5600, PCN: 50, WLF: 11500, SPM: 5800, BLM: 10500, GGY: 64000,
  JEY: 103000, GLP: 384000, MTQ: 350000, REU: 880000, MYT: 320000, GUF: 300000, NFK: 2200, CXR: 1700,
  CCK: 600, ATA: 1000, BVT: 0, HMD: 0, SGS: 20, IOT: 3000, UMI: 300, ATF: 150, SJM: 2600, ALA: 30500,
  BES: 30000, ERI: 3700000, XKX: 1600000, UNK: 1600000, KOS: 1600000 };

const countries = raw.map(c => {
  const w = wb[c.cca3] || (c.cca3 === 'UNK' ? wb.XKX : null) || {};
  const pop = w.population?.v ?? POP_FALLBACK[c.cca3] ?? null;
  return {
    id: c.cca3, a2: c.cca2, n3: c.ccn3 || null,
    name: c.name.common, official: c.name.official,
    capital: c.capital || [], region: c.region, subregion: c.subregion || '',
    languages: Object.values(c.languages || {}),
    currencies: Object.entries(c.currencies || {}).map(([k, v]) => ({ code: k, name: v.name, symbol: v.symbol })),
    borders: c.borders || [], area: c.area, latlng: c.latlng, landlocked: !!c.landlocked,
    independent: !!c.independent, un: !!c.unMember, demonym: c.demonyms?.eng?.m || '',
    tld: c.tld || [], calling: c.idd?.root ? c.idd.root + (c.idd.suffixes?.length === 1 ? c.idd.suffixes[0] : '') : '',
    population: pop, popYear: w.population?.y || null,
    stats: Object.fromEntries(Object.entries(w).filter(([k]) => k !== 'population')),
    alt: c.altSpellings || [],
  };
});

// ---------- 3. Flags (inline SVG text keyed by id) ----------
console.log('flags…');
const flags = {};
await pool(countries, 8, async c => {
  try { flags[c.id] = (await get(`${WC}/data/${c.id.toLowerCase()}.svg`, 'text')).trim(); }
  catch { console.warn('  no flag', c.id); }
});
await save('flags.json', flags);

// ---------- 4. Wikipedia ----------
const TITLE = {
  GEO: 'Georgia (country)', IRL: 'Republic of Ireland', COD: 'Democratic Republic of the Congo',
  COG: 'Republic of the Congo', FSM: 'Federated States of Micronesia', PSE: 'State of Palestine',
  MAF: 'Collectivity of Saint Martin', TLS: 'East Timor', CIV: 'Ivory Coast', UMI: 'United States Minor Outlying Islands',
  BES: 'Caribbean Netherlands', SGS: 'South Georgia and the South Sandwich Islands', MKD: 'North Macedonia',
  UNK: 'Kosovo', XKX: 'Kosovo', CPV: 'Cape Verde', STP: 'São Tomé and Príncipe', VAT: 'Vatican City',
  KOR: 'South Korea', PRK: 'North Korea', CHN: 'China', TWN: 'Taiwan', MMR: 'Myanmar', SWZ: 'Eswatini',
};
// History / Geography / … article naming exceptions
const TOPIC_SUBJECT = { IRL: 'the Republic of Ireland', GEO: 'Georgia (country)', COD: 'the Democratic Republic of the Congo',
  COG: 'the Republic of the Congo', PSE: 'Palestine', TLS: 'East Timor', CIV: 'Ivory Coast', VAT: 'Vatican City' };

async function intros(titles) {
  // returns Map(requestedTitle -> {title, text})
  const res = new Map();
  const chunks = []; for (let i = 0; i < titles.length; i += 20) chunks.push(titles.slice(i, i + 20));
  await pool(chunks, 3, async chunk => {
    const u = 'https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=extracts&exintro=1&explaintext=1&redirects=1&exlimit=20&titles='
      + encodeURIComponent(chunk.join('|'));
    const j = await get(u);
    const alias = new Map(chunk.map(t => [t, t]));
    for (const n of j.query.normalized || []) alias.set(n.from, n.to);
    const redir = new Map((j.query.redirects || []).map(r => [r.from, r.to]));
    const pages = new Map((j.query.pages || []).map(p => [p.title, p]));
    for (const t of chunk) {
      let k = alias.get(t) || t; k = redir.get(k) || k;
      const p = pages.get(k);
      if (p && !p.missing && p.extract) res.set(t, { title: p.title, text: tidy(p.extract, 3600) });
    }
  });
  return res;
}
function tidy(s, max) {
  let paras = s.split(/\n+/).map(p => p.trim()).filter(p => p.length > 40);
  let out = [], len = 0;
  for (const p of paras) { if (len + p.length > max && out.length) break; out.push(p); len += p.length; }
  return out;
}

console.log('wikipedia intros…');
const mainTitles = countries.map(c => TITLE[c.id] || c.name);
const main = await intros(mainTitles);
const TOPICS = ['Geography', 'Politics', 'Economy', 'Culture', 'Demographics'];
const topicReqs = [];
countries.forEach((c, i) => {
  const subj = TOPIC_SUBJECT[c.id] || main.get(mainTitles[i])?.title || c.name;
  for (const t of TOPICS) {
    const a = `${t} of ${subj}`, b = `${t} of the ${subj}`;
    topicReqs.push(a); if (!subj.startsWith('the ')) topicReqs.push(b);
  }
});
const topicRes = await intros([...new Set(topicReqs)]);

const texts = {};
countries.forEach((c, i) => {
  const m = main.get(mainTitles[i]);
  const subj = TOPIC_SUBJECT[c.id] || m?.title || c.name;
  const entry = { overview: m ? { title: m.title, text: m.text } : null };
  for (const t of TOPICS) {
    const r = topicRes.get(`${t} of ${subj}`) || topicRes.get(`${t} of the ${subj}`);
    if (r && r.title.toLowerCase().includes(t.toLowerCase().slice(0, 5))) entry[t.toLowerCase()] = { title: r.title, text: r.text };
  }
  texts[c.id] = entry;
});
await save('texts.json', texts);

console.log('wikipedia histories…');
const history = {};
const HIST = { IRL: 'History of Ireland', DEU: 'History of Germany', ATF: 'French Southern and Antarctic Lands',
  BES: 'History of the Caribbean Netherlands', SJM: 'History of Svalbard', UMI: 'United States Minor Outlying Islands' };
for (let pass = 0; pass < 3; pass++) await pool(countries.filter(c => !history[c.id]), 3, async c => {
  const i = countries.indexOf(c);
  const subj = TOPIC_SUBJECT[c.id] || main.get(mainTitles[i])?.title || c.name;
  const cands = HIST[c.id] ? [HIST[c.id]] : [`History of ${subj}`, `History of the ${subj}`];
  for (const t of cands) {
    const u = 'https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=extracts&explaintext=1&exsectionformat=wiki&redirects=1&titles=' + encodeURIComponent(t);
    try {
      const p = (await get(u)).query.pages[0];
      if (p.missing || !p.extract) continue;
      history[c.id] = { title: p.title, sections: sectionize(p.extract) };
      return;
    } catch (e) { console.warn('  history retry', c.id, e.message); }
  }
});
function sectionize(txt) {
  const parts = txt.split(/\n(?==+ )/);
  const out = [];
  const SKIP = /^(See also|References|Notes|Further reading|External links|Bibliography|Sources|Citations|Historiography|Primary sources|Secondary sources|Gallery|Footnotes|Explanatory notes|Works cited)$/i;
  for (const part of parts) {
    const m = part.match(/^(=+) (.+?) =+\n?([\s\S]*)$/);
    const level = m ? m[1].length : 1, head = m ? m[2].trim() : 'Introduction';
    if (SKIP.test(head)) continue;
    if (level > 4) continue;
    const body = tidy(m ? m[3] : part, level <= 2 ? 1100 : 600).slice(0, level <= 2 ? 2 : 1);
    if (!body.length && level > 2) continue; // empty level-2 headings are kept as era markers
    out.push({ h: head, l: level, p: body });
  }
  // Keep every era but trim detail evenly when an article is very long, so modern history is never cut off.
  const CAP = 36000;
  const size = arr => arr.reduce((t, s) => t + s.p.join('').length, 0);
  const cut = (x, n) => { if (x.length <= n) return x; const i = x.lastIndexOf('. ', n); return i > 80 ? x.slice(0, i + 1) : x.slice(0, n) + '…'; };
  let kept = out;
  if (size(kept) > CAP) kept = kept.filter(s => s.l <= 3 || s.p.length === 0);
  if (size(kept) > CAP) kept = kept.map(s => s.l >= 3 ? { ...s, p: s.p.map(x => cut(x, 380)) } : s);
  if (size(kept) > CAP) kept = kept.map(s => s.l <= 2 ? { ...s, p: s.p.slice(0, 1).map(x => cut(x, 700)) } : s);
  if (size(kept) > CAP) kept = kept.map(s => s.l >= 3 ? { ...s, p: s.p.map(x => cut(x, 220)) } : s);
  return kept;
}
await save('history.json', history);

// ---------- 5. Geometry ----------
console.log('geometry…');
await save('world.json', await get('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json', 'text'));
try {
  await save('plates.json', await get('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json', 'text'));
} catch (e) { console.warn('plates skipped', e.message); }

await save('countries.json', countries);
const count = k => Object.values(texts).filter(t => t[k]).length;
console.log('done:', countries.length, 'countries; overview', count('overview'), 'geography', count('geography'),
  'politics', count('politics'), 'economy', count('economy'), 'culture', count('culture'), 'history', Object.keys(history).length,
  'flags', Object.keys(flags).length, 'with population', countries.filter(c => c.population).length);

// Capital coordinates come from Wikidata in a second step.
await import('./build-capitals.mjs');
// Label points, flag compression, and a version stamp the app uses to invalidate its browser cache.
await import('./build-labels.mjs');
await import('./build-flags.mjs');
await import('./build-admin1.mjs');
await writeFile(join(OUT, 'manifest.json'), JSON.stringify({ version: new Date().toISOString() }));
