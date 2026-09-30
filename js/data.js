// Loads the bundled country data and derives rankings, neighbours and colour scales.
(function (GA) {
  const D = GA.data = { countries: [], byId: {}, byN3: {}, features: [], texts: null, history: null, flags: null, plates: null };

  // world-atlas shapes without an ISO numeric code, matched by name
  const SHAPE_NAME = { 'Kosovo': 'UNK', 'Somaliland': 'SOM', 'N. Cyprus': 'CYP' };

  async function fetchJson(url, opts) {
    const r = await fetch(url, opts);
    if (!r.ok) throw new Error(`Could not load ${url} (${r.status})`);
    return r.json();
  }

  // ----- browser cache -----
  // Data files are kept in IndexedDB after the first visit, tagged with the build version from
  // data/manifest.json. Later visits read them locally; a new build changes the version and refreshes them.
  // Any storage failure (private window, blocked storage) silently falls back to the network.
  const IDB = { name: 'meridian-atlas', store: 'files' };
  let dbP = null;
  function db() {
    if (dbP) return dbP;
    dbP = new Promise(res => {
      try {
        const r = indexedDB.open(IDB.name, 1);
        r.onupgradeneeded = () => r.result.createObjectStore(IDB.store);
        r.onsuccess = () => res(r.result);
        r.onerror = r.onblocked = () => res(null);
      } catch { res(null); }
      setTimeout(() => res(null), 2000); // never let a stuck database hold up the app
    });
    return dbP;
  }
  async function cacheGet(key) {
    const d = await db(); if (!d) return null;
    return new Promise(res => {
      try { const r = d.transaction(IDB.store).objectStore(IDB.store).get(key); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); }
      catch { res(null); }
    });
  }
  async function cachePut(key, value) {
    const d = await db(); if (!d) return;
    try { d.transaction(IDB.store, 'readwrite').objectStore(IDB.store).put(value, key); } catch { }
  }
  const versionP = fetchJson('data/manifest.json', { cache: 'no-cache' }).then(m => m.version).catch(() => null);

  async function json(url) {
    const [version, hit] = await Promise.all([versionP, cacheGet(url)]);
    if (hit && (version == null || hit.version === version)) { D.cacheHits.push(url); return hit.data; }
    const data = await fetchJson(url);
    if (version) cachePut(url, { version, data });
    return data;
  }
  D.cacheHits = [];

  D.load = async function (onStep) {
    onStep?.('Loading 250 countries');
    const [countries, world] = await Promise.all([json('data/countries.json'), json('data/world.json')]);
    D.countries = countries;
    for (const c of countries) {
      D.byId[c.id] = c; if (c.n3) D.byN3[c.n3] = c;
      c.sovereign = c.independent;
      c.density = c.population && c.area ? c.population / c.area : null;
      c.searchKey = GA.norm([c.name, c.official, ...c.capital, ...c.alt].join(' '));
    }
    // Kosovo id used by the dataset
    if (!D.byId.UNK) { const k = countries.find(c => c.name === 'Kosovo'); if (k) D.byId.UNK = k; }
    rank('population'); rank('area'); rank('density');
    for (const key of ['gdp', 'gdpPc', 'lifeExp', 'urban', 'fertility', 'internet', 'forest', 'co2pc', 'popGrowth', 'medianAgeProxy']) rankStat(key);

    onStep?.('Drawing the coastlines');
    const fc = topojson.feature(world, world.objects.countries);
    D.features = fc.features.map(f => {
      const c = D.byN3[f.id] || D.byId[SHAPE_NAME[f.properties.name]];
      f.properties.id = c ? c.id : null;
      f.properties.disputedName = c && c.name !== f.properties.name && SHAPE_NAME[f.properties.name] && c.id !== 'UNK' ? f.properties.name : null;
      return f;
    }).filter(f => f.properties.id);
    const shaped = new Set(D.features.map(f => f.properties.id));
    D.shapeless = countries.filter(c => !shaped.has(c.id) && c.latlng?.length);
    D.tiny = countries.filter(c => c.area != null && c.area < 1200 && c.latlng?.length);
  };

  // Heavier files load in the background after the globe is up.
  const pending = {};
  D.lazy = function (key) {
    if (D[key]) return Promise.resolve(D[key]);
    const file = { texts: 'data/texts.json', history: 'data/history.json', flags: 'data/flags.json', plates: 'data/plates.json' }[key];
    return (pending[key] ||= json(file).then(v => (D[key] = v)));
  };
  // ----- states and provinces (one small file per country, loaded when first needed) -----
  D.adminIndex = null;
  D.loadAdminIndex = () => D.adminIndex ? Promise.resolve(D.adminIndex)
    : json('data/admin1/index.json').then(v => (D.adminIndex = v)).catch(() => (D.adminIndex = {}));
  const adminCache = {}, adminPending = {};
  D.adminLoaded = id => adminCache[id] || null;
  D.admin = id => {
    if (adminCache[id]) return Promise.resolve(adminCache[id]);
    return (adminPending[id] ||= json(`data/admin1/${id}.json`).then(raw => {
      // build new objects: `raw` may still be on its way into the browser cache
      const features = topojson.feature(raw.topo, raw.topo.objects.r).features.map(f => {
        const k = f.properties.k;
        return { type: 'Feature', geometry: f.geometry, properties: { id, admin: true, k, key: id + ':' + k } };
      });
      const regions = raw.regions.map(r => ({ ...r }));
      return (adminCache[id] = { id, regions, features, byK: Object.fromEntries(regions.map(r => [r.k, r])) });
    }).finally(() => delete adminPending[id]));
  };
  const PLURAL = { Country: 'Countries', County: 'Counties', Municipality: 'Municipalities', Parish: 'Parishes', 'Autonomous community': 'Autonomous communities', 'Autonomous region': 'Autonomous regions' };
  D.plural = t => PLURAL[t] || (/[^aeiou]y$/.test(t) ? t.slice(0, -1) + 'ies' : /(s|sh|ch|x)$/.test(t) ? t + 'es' : t + 's');

  // After the globe is up, pull the remaining files into memory (and the cache) one by one,
  // so opening a country, its history, or a flag quiz is instant later.
  D.prefetch = async function () {
    for (const key of ['flags', 'texts', 'history', 'plates']) {
      await new Promise(r => (window.requestIdleCallback || setTimeout)(r, { timeout: 1500 }));
      try { await D.lazy(key); } catch { }
    }
  };

  function rank(key) {
    const list = D.countries.filter(c => c.sovereign && c[key] != null).sort((a, b) => b[key] - a[key]);
    list.forEach((c, i) => ((c.ranks ||= {})[key] = i + 1));
    D['count_' + key] = list.length;
  }
  function rankStat(key) {
    const list = D.countries.filter(c => c.sovereign && c.stats[key]).sort((a, b) => b.stats[key].v - a.stats[key].v);
    list.forEach((c, i) => ((c.ranks ||= {})[key] = i + 1));
    D['count_' + key] = list.length;
    const vals = list.map(c => c.stats[key].v).sort((a, b) => a - b);
    D['dist_' + key] = { min: vals[0], max: vals[vals.length - 1], median: vals[vals.length >> 1], n: vals.length, sorted: vals };
  }
  D.dist = key => {
    if (D['dist_' + key]) return D['dist_' + key];
    const vals = D.countries.filter(c => c.sovereign && c[key] != null).map(c => c[key]).sort((a, b) => a - b);
    return (D['dist_' + key] = { min: vals[0], max: vals[vals.length - 1], median: vals[vals.length >> 1], n: vals.length, sorted: vals });
  };
  D.value = (c, key) => (c.stats[key] ? c.stats[key].v : c[key] ?? null);

  // Flags become data URLs once flags.json arrives; until then a neutral placeholder.
  const flagCache = {};
  const BLANK = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="3" height="2" fill="#e6ebe9"/></svg>');
  D.flag = id => {
    if (flagCache[id]) return flagCache[id];
    if (!D.flags || !D.flags[id]) return BLANK;
    return (flagCache[id] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(D.flags[id]));
  };
  D.flagImg = (id, cls = 'flag') => `<img class="${cls}" data-flag="${id}" src="${D.flag(id)}" alt="Flag of ${GA.esc(D.byId[id]?.name || id)}" loading="lazy">`;
  // swap in real flags on anything rendered before the flag file finished loading
  D.refreshFlags = (root = document) => GA.$$('img[data-flag]', root).forEach(img => { img.src = D.flag(img.dataset.flag); });

  D.regions = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
  D.subregions = () => {
    const m = new Map();
    for (const c of D.countries) if (c.subregion && c.sovereign) {
      if (!m.has(c.subregion)) m.set(c.subregion, { name: c.subregion, region: c.region, ids: [] });
      m.get(c.subregion).ids.push(c.id);
    }
    return [...m.values()].sort((a, b) => a.region.localeCompare(b.region) || a.name.localeCompare(b.name));
  };

  D.search = q => {
    q = GA.norm(q); if (!q) return [];
    const scored = [];
    for (const c of D.countries) {
      const n = GA.norm(c.name);
      let s = n === q ? 100 : n.startsWith(q) ? 80 : c.capital.some(k => GA.norm(k).startsWith(q)) ? 60 : c.searchKey.includes(q) ? 40 : 0;
      if (s) scored.push([s + (c.sovereign ? 5 : 0) + Math.log10((c.population || 1) + 1) / 10, c]);
    }
    return scored.sort((a, b) => b[0] - a[0]).slice(0, 8).map(x => x[1]);
  };
})(window.GA);
