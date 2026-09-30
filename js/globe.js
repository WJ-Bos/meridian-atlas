// The 3D globe: country shapes, colour lenses, selection, lesson highlights, quiz interaction,
// and states/provinces that appear when you select or zoom into a country.
(function (GA) {
  const { data: D, store } = GA;
  let G, el;
  const st = {
    lens: 'region', satellite: false, plates: false, capitals: false, spin: true,
    hovered: null,            // id of a country, or "ID:k" for a state/province
    selected: null,           // selected country id
    regionSel: null,          // selected state/province key "ID:k"
    highlight: null,          // Set of ids emphasised by a lesson or tour
    flashes: {},              // id or key -> colour, for quiz feedback
    tooltips: true, clickHandler: null, guides: [], markers: [],
    names: true, nameIds: '',
    split: new Set(),         // countries currently drawn as their states/provinces
    forceSplit: null,         // a country kept split regardless of zoom (state quiz)
  };
  let C, P; // colours from CSS tokens, and the palette for the current theme

  // Map palettes per theme. Region tints are softer on the dark ground so the globe doesn't glare.
  // Side walls must stay opaque: transparent ones make three.js re-check ~1,600 materials every frame.
  const PALETTES = {
    dark: {
      region: { Africa: '#b39068', Americas: '#7f9c6c', Asia: '#b07f8c', Europe: '#7489bd', Oceania: '#5f9d94', Antarctic: '#8c9aa0' },
      ramp: ['#1f3038', '#2b4a52', '#3a6566', '#548274', '#7f9f7d', '#b6b884', '#e9cf86'],
      mastery: { unseen: '#23343b', opened: '#35505a', shaky: '#b8624f', learning: '#c9a14a', known: '#45c095' },
      nodata: '#2a353a', stroke: 'rgba(6,12,15,0.8)', adminStroke: 'rgba(6,12,15,0.45)', side: '#0b1418',
      atmo: '#5f82a6', atmoAlt: 0.15, capital: 'rgba(230,236,234,0.9)',
    },
    light: {
      region: { Africa: '#e3b781', Americas: '#a9c68e', Asia: '#dfa6b3', Europe: '#9fb5e0', Oceania: '#83c3ba', Antarctic: '#eceeea' },
      ramp: ['#f2efd9', '#d7e4b5', '#a7cfa2', '#6fb29f', '#3f8c9a', '#2c5f94', '#22357f'],
      mastery: { unseen: '#e8eae4', opened: '#cbd6d4', shaky: '#e89e8c', learning: '#edc76b', known: '#5fb98d' },
      nodata: '#d9dcd8', stroke: 'rgba(19,32,39,0.42)', adminStroke: 'rgba(19,32,39,0.28)', side: '#9fb0b2',
      atmo: '#ffffff', atmoAlt: 0.12, capital: 'rgba(19,32,39,0.85)',
    },
  };
  const LENSES = {
    region: { title: 'Region' },
    population: { title: 'Population', key: 'population', log: true, fmt: GA.fmtShort },
    density: { title: 'People per km²', key: 'density', log: true, fmt: v => GA.fmtInt(v) },
    gdpPc: { title: 'GDP per person (US$)', key: 'gdpPc', log: true, fmt: v => '$' + GA.fmtShort(v) },
    lifeExp: { title: 'Life expectancy at birth (years)', key: 'lifeExp', fmt: v => v.toFixed(0) },
    fertility: { title: 'Births per woman', key: 'fertility', fmt: v => v.toFixed(1) },
    mastery: { title: 'What you know' },
  };

  function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mix(a, b, t) { const x = hexToRgb(a), y = hexToRgb(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
  function alpha(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
  function ramp(t) { const R = P.ramp; t = Math.max(0, Math.min(1, t)) * (R.length - 1); const i = Math.floor(t); return i >= R.length - 1 ? R[R.length - 1] : mix(R[i], R[i + 1], t - i); }
  const theme = () => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  function loadPalette() {
    const v = GA.cssVar;
    C = { accent: v('--accent'), good: v('--good'), bad: v('--bad'), sea: v('--sea'), ink: v('--ink'), card: v('--card'), paper: v('--paper') };
    Object.assign(C, { brass: C.accent, verdigris: C.good, signal: C.bad, ocean: C.sea }); // names used by callers
    P = PALETTES[theme()];
    C.land = P.nodata;
  }

  function lensColor(id) {
    const c = D.byId[id]; if (!c) return C.land;
    const L = LENSES[st.lens];
    if (st.lens === 'region') return P.region[c.region] || C.land;
    if (st.lens === 'mastery') {
      if (!store.practised(id)) return store.state.visited[id] ? P.mastery.opened : P.mastery.unseen;
      const m = store.mastery(id);
      return m < .5 ? mix(P.mastery.shaky, P.mastery.learning, m * 2) : mix(P.mastery.learning, P.mastery.known, (m - .5) * 2);
    }
    const v = D.value(c, L.key); if (v == null || v <= 0) return P.nodata;
    const d = D.dist(L.key);
    // position by rank (quantile) so skewed values still spread across the ramp
    return ramp(lowerBound(d.sorted, v) / Math.max(1, d.sorted.length - 1));
  }
  function lowerBound(arr, v) { let lo = 0, hi = arr.length; while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] < v) lo = m + 1; else hi = m; } return lo; }

  // neighbouring states get slightly different shades of their country's colour so borders read clearly
  const SHADE = [0, .08, .16, .04, .12];
  function shade(color, k) { return mix(color, k % 2 ? '#ffffff' : '#000000', SHADE[k % 5]); }
  const keyOf = f => f.properties.key || f.properties.id;

  function capColor(f) {
    const { id, admin, k } = f.properties, key = keyOf(f);
    if (st.flashes[key]) return st.flashes[key];
    if (st.flashes[id]) return admin ? shade(st.flashes[id], k) : st.flashes[id];
    let base;
    if (admin) base = key === st.regionSel ? mix(C.accent, C.ink, .45) : id === st.selected ? shade(C.accent, k) : shade(lensColor(id), k);
    else if (id === st.selected) base = C.accent;
    else base = lensColor(id);
    if (st.highlight && id !== st.selected) base = st.highlight.has(id) ? mix(base, C.accent, .28) : mix(base, C.sea, .65);
    if (key === st.hovered && key !== st.regionSel) base = mix(base, C.ink, .18);
    if (st.satellite) return alpha(base, key === st.hovered || id === st.selected || (st.highlight && st.highlight.has(id)) ? .7 : .12);
    return base;
  }
  function altitude(f) {
    const { id } = f.properties, key = keyOf(f);
    if (key === st.regionSel) return 0.042;
    if (id === st.selected || st.flashes[key] || st.flashes[id]) return 0.03;
    if (st.highlight && st.highlight.has(id)) return 0.018;
    return 0.006; // hover changes colour only: a new altitude means re-triangulating the whole shape
  }

  function tip(f) {
    if (!st.tooltips) return '';
    const p = f.properties || f, c = D.byId[p.id]; if (!c) return '';
    if (p.admin) {
      const r = D.adminLoaded(p.id)?.byK[p.k]; if (!r) return '';
      return `<div class="tip-name">${GA.esc(r.name)}</div><div class="tip-sub">${GA.esc(r.type)}, ${GA.esc(c.name)}${r.pop ? ' · ' + GA.fmtShort(r.pop) + ' people' : ''}</div>`;
    }
    return `<div class="tip-name">${GA.esc(c.name)}</div><div class="tip-sub">${GA.esc(c.capital[0] || c.subregion || c.region)}${c.population ? ' · ' + GA.fmtShort(c.population) + ' people' : ''}</div>`;
  }

  function solidTexture(color) {
    const cv = document.createElement('canvas'); cv.width = 4; cv.height = 2;
    const x = cv.getContext('2d'); x.fillStyle = color; x.fillRect(0, 0, 4, 2); return cv.toDataURL();
  }

  function init(container) {
    el = container;
    loadPalette();
    G = new Globe(el, { animateIn: !GA.reducedMotion() })
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl(solidTexture(C.sea))
      .showAtmosphere(true).atmosphereColor(P.atmo).atmosphereAltitude(P.atmoAlt)
      .showGraticules(true)
      .polygonsData(D.features)
      .polygonCapColor(capColor)
      .polygonSideColor(() => P.side)
      .polygonStrokeColor(f => st.satellite ? 'rgba(255,255,255,0.55)' : f.properties.admin ? P.adminStroke : P.stroke)
      .polygonAltitude(altitude)
      .polygonCapCurvatureResolution(3)
      .polygonsTransitionDuration(0) // animating altitude would rebuild a country's geometry every frame
      .polygonLabel(tip)
      .onPolygonHover(f => setHover(f ? keyOf(f) : null))
      .onPolygonClick((f, ev, coords) => handleClick(f.properties.id, coords, f.properties))
      .onGlobeClick(coords => handleClick(null, coords))
      // small states as dots so they can be clicked at all
      .pointsData(D.shapeless.concat(D.tiny.filter(c => !D.shapeless.includes(c))).map(c => (dotIds.add(c.id), c)))
      .pointLat(c => c.latlng[0]).pointLng(c => c.latlng[1])
      .pointAltitude(c => c.id === st.selected ? 0.03 : 0.008)
      .pointRadius(c => c.id === st.selected || c.id === st.hovered ? 0.5 : 0.32)
      .pointColor(c => st.flashes[c.id] || (c.id === st.selected ? C.accent : st.highlight && !st.highlight.has(c.id) ? mix(lensColor(c.id), C.sea, .65) : st.highlight ? C.accent : c.id === st.hovered ? C.ink : mix(lensColor(c.id), C.ink, .3)))
      .pointLabel(c => tip({ id: c.id }))
      .pointsTransitionDuration(0)
      .onPointHover(c => setHover(c ? c.id : null))
      .onPointClick((c, ev, coords) => handleClick(c.id, coords))
      // guides + plates
      .pathPoints('pts').pathPointLat(p => p[1]).pathPointLng(p => p[0])
      .pathColor(p => p.color).pathDashLength(p => p.dash || 1).pathDashGap(p => p.dash ? p.dash / 2 : 0)
      .pathDashAnimateTime(0).pathTransitionDuration(0)
      .pathLabel(p => p.name ? `<div class="tip-name">${GA.esc(p.name)}</div>` : '')
      // capitals
      .labelLat(l => l.lat).labelLng(l => l.lng).labelText(l => l.text)
      .labelSize(l => l.size || 0.32).labelDotRadius(l => l.dot || 0.14).labelColor(() => P.capital)
      .labelResolution(2).labelAltitude(0.012).labelIncludeDot(true)
      .labelLabel(l => l.tip ? `<div class="tip-name">${GA.esc(l.tip)}</div>` : '')
      // names and lesson markers as crisp HTML over the globe
      .htmlLat(m => m.lat).htmlLng(m => m.lng).htmlAltitude(m => m.type === 'marker' ? 0.02 : m.type === 'sub' ? 0.035 : 0.012)
      .htmlElement(m => m.el)
      .htmlTransitionDuration(0)
      .htmlElementVisibilityModifier((node, visible) => { node.style.opacity = visible ? '' : '0'; })
      .ringLat(r => r.lat).ringLng(r => r.lng).ringColor(() => t => alpha(C.accent, 1 - t))
      .ringMaxRadius(4).ringPropagationSpeed(3).ringRepeatPeriod(900);

    const mat = G.globeMaterial(); mat.shininess = 6;
    const ctrl = G.controls();
    ctrl.autoRotate = !GA.reducedMotion(); ctrl.autoRotateSpeed = 0.35; ctrl.enableDamping = true; ctrl.dampingFactor = 0.08;
    ctrl.addEventListener('start', () => { if (st.spin) setSpin(false, true); });
    ctrl.addEventListener('change', () => { updateReadout(); scheduleNames(); });
    G.pointOfView({ lat: 22, lng: 12, altitude: GA.isNarrow() ? 3.1 : 2.4 });
    new ResizeObserver(() => { G.width(el.clientWidth); G.height(el.clientHeight); }).observe(el);
    renderLegend();
    updateReadout();
    updateNames();
  }

  // ----- states and provinces -----
  // A country is drawn as its states/provinces when it is selected, when the view is zoomed in over it,
  // or while a state quiz runs for it. Files load on demand (and are cached like everything else).
  let boxes = null;
  function bbox(f) {
    let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const p of polys) for (const [x, y] of p[0]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return [x0, y0, x1, y1];
  }
  function inRing(x, y, r) {
    let inside = false;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i], [xj, yj] = r[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function countryAt(lat, lng) {
    boxes ||= D.features.map(f => [f, bbox(f)]);
    for (const [f, b] of boxes) {
      if (lng < b[0] || lng > b[2] || lat < b[1] || lat > b[3]) continue;
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      if (polys.some(p => inRing(lng, lat, p[0]) && !p.slice(1).some(h => inRing(lng, lat, h)))) return f.properties.id;
    }
    return null;
  }
  const hasAdmin = id => !!(D.adminIndex && D.adminIndex[id]);
  function wantedSplit() {
    const want = new Set();
    if (st.forceSplit) want.add(st.forceSplit);
    if (st.selected && hasAdmin(st.selected)) want.add(st.selected);
    const pov = G.pointOfView();
    if (pov.altitude < 1.25 && st.tooltips) {
      const id = countryAt(pov.lat, ((pov.lng + 540) % 360) - 180);
      if (id && hasAdmin(id)) want.add(id);
    }
    return want;
  }
  let splitSeq = 0;
  async function updateSplit() {
    const want = wantedSplit(), seq = ++splitSeq;
    await Promise.all([...want].map(id => D.admin(id).catch(() => null)));
    if (seq !== splitSeq) return; // a newer request superseded this one
    const ready = new Set([...want].filter(id => D.adminLoaded(id)));
    if (ready.size === st.split.size && [...ready].every(id => st.split.has(id))) return;
    st.split = ready;
    G.polygonsData(D.features.filter(f => !ready.has(f.properties.id)).concat(...[...ready].map(id => D.adminLoaded(id).features)));
    singlePass();
    st.nameIds = null; updateNames();
  }

  // ----- names on the globe -----
  // Country names appear by size: at a distance only large countries, more as you zoom in; bigger
  // places claim space first. State/province names join when a split country is close.
  // All names hide whenever tooltips are off (quizzes), so they never give an answer away.
  const nameEls = {};
  function labelItem(key, text, lat, lng, size, type) {
    if (nameEls[key]) return nameEls[key];
    const d = document.createElement('div');
    d.className = type === 'sub' ? 'clabel sub' : 'clabel';
    d.textContent = text; d.style.fontSize = size + 'px';
    return (nameEls[key] = { type, key, lat, lng, el: d, size, text });
  }
  const countryLabel = c => labelItem(c.id, c.name, c.labelLatLng[0], c.labelLatLng[1], Math.max(9.5, Math.min(19, 5.5 + Math.log10(Math.max(c.area || 1, 10)) * 1.6)), 'name');
  // map labels drop generic suffixes ("Aomori Prefecture" -> "Aomori"); panels keep the full name
  const SUFFIX = /\s+(Prefecture|Province|Oblast|Krai|Governorate|Department|County|Region|District|Municipality|Voivodeship)$/i;
  const regionLabel = (id, r) => labelItem(id + ':' + r.k, r.name.replace(SUFFIX, '') || r.name, r.lab[0], r.lab[1], Math.max(9, Math.min(13.5, 5 + Math.log10(Math.max(r.area || 1, 10)) * 1.3)), 'sub');
  function minAreaFor(alt) { return alt > 2.3 ? 1.2e6 : alt > 1.7 ? 3.5e5 : alt > 1.2 ? 9e4 : alt > 0.8 ? 2.5e4 : alt > 0.5 ? 5e3 : 0; }
  function angularDist(a, b) { return GA.haversine(a, b) / 6371; }
  function updateNames() {
    const show = st.names && st.tooltips;
    const pov = G.pointOfView(), min = minAreaFor(pov.altitude), centre = [pov.lat, pov.lng];
    const cands = [];
    if (show) {
      const selC = st.selected && D.byId[st.selected];
      if (st.regionSel) { const [id, k] = st.regionSel.split(':'); const r = D.adminLoaded(id)?.byK[k]; if (r) cands.push({ item: regionLabel(id, r), sel: true }); }
      if (selC?.labelLatLng && !(st.split.has(selC.id) && pov.altitude < 1.1)) cands.push({ item: countryLabel(selC), sel: !st.regionSel });
      D.countries.filter(c => c.labelLatLng && c.id !== st.selected && (c.area || 0) >= min && (c.sovereign || (c.area || 0) >= min * 4)
        && !(st.split.has(c.id) && pov.altitude < 1.1) && angularDist(c.labelLatLng, centre) < 1.35)
        .sort((a, b) => (b.area || 0) - (a.area || 0)).forEach(c => cands.push({ item: countryLabel(c) }));
      if (pov.altitude < 1.6) for (const id of st.split) {
        const list = D.adminLoaded(id)?.regions || [];
        list.filter(r => r.area >= min / 6 && id + ':' + r.k !== st.regionSel && angularDist(r.lab, centre) < 1.3)
          .sort((a, b) => b.area - a.area).forEach(r => cands.push({ item: regionLabel(id, r) }));
      }
    }
    const placed = [], list = [];
    const W = el.clientWidth, H = el.clientHeight;
    for (const { item, sel } of cands) {
      const p = G.getScreenCoords(item.lat, item.lng, 0.012);
      if (!p || p.x < 0 || p.y < 0 || p.x > W || p.y > H) continue;
      const w = item.text.length * item.size * 0.58 + 6, h = item.size + 4;
      const box = [p.x - w / 2, p.y - h / 2, p.x + w / 2, p.y + h / 2];
      if (!sel && (box[0] < 2 || box[2] > W - 2)) continue; // would be cut off at the edge
      if (!sel && placed.some(b => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue;
      placed.push(box); list.push(item);
      item.el.classList.toggle('sel', !!sel);
    }
    const key = list.map(i => i.key).join();
    if (key === st.nameIds) return;
    st.nameIds = key;
    G.htmlElementsData(list.concat(st.markers));
  }
  let namesTimer;
  function scheduleNames() { clearTimeout(namesTimer); namesTimer = setTimeout(() => { updateNames(); updateSplit(); }, 120); }
  function setNames(on) { st.names = on; st.nameIds = null; updateNames(); }

  // Hover repaints only what it must: the country shapes, plus the small-country dots only when
  // one of them is involved (re-applying dot styles rebuilds all their materials).
  const dotIds = new Set();
  let hoverRaf;
  function setHover(key) {
    if (st.hovered === key) return;
    const touchesDot = dotIds.has(st.hovered) || dotIds.has(key);
    st.hovered = key; el.style.cursor = key ? 'pointer' : '';
    cancelAnimationFrame(hoverRaf);
    hoverRaf = requestAnimationFrame(() => (touchesDot ? repaint() : repaintShapes()));
  }
  function handleClick(id, coords, props) {
    if (st.clickHandler) return st.clickHandler(id, coords, props);
    if (props?.admin) GA.app.openRegion(id, props.k);
    else if (id) GA.app.openCountry(id);
  }
  function repaintShapes() { G.polygonCapColor(capColor).polygonAltitude(altitude); }
  function repaint() {
    repaintShapes();
    G.pointColor(G.pointColor()).pointAltitude(G.pointAltitude()).pointRadius(G.pointRadius());
  }

  function updateReadout() {
    const pov = G.pointOfView(), r = GA.$('#readout');
    if (r) r.textContent = `View centre ${GA.dms(pov.lat, ((pov.lng + 540) % 360) - 180)} · ${Math.round(pov.altitude * 6371).toLocaleString('en-US')} km up`;
  }

  // ----- public controls -----
  function setLens(key) { st.lens = key; repaint(); renderLegend(); }
  function renderLegend() {
    const L = LENSES[st.lens], box = GA.$('#legend'); if (!box) return;
    if (st.lens === 'region') {
      box.innerHTML = `<div class="legend-swatches">${D.regions.map(r => `<span><i style="background:${P.region[r]}"></i>${r}</span>`).join('')}</div>`;
    } else if (st.lens === 'mastery') {
      const M = P.mastery;
      box.innerHTML = `<div class="legend-title">What you know</div><div class="legend-swatches">
        <span><i style="background:${M.unseen}"></i>Not seen</span><span><i style="background:${M.opened}"></i>Opened</span>
        <span><i style="background:${M.shaky}"></i>Shaky</span><span><i style="background:${M.learning}"></i>Learning</span><span><i style="background:${M.known}"></i>Known</span></div>`;
    } else {
      const d = D.dist(L.key);
      const note = D.countries.find(c => c.stats[L.key])?.stats[L.key].y;
      box.innerHTML = `<div class="legend-title">${L.title}${note ? ` <span class="faint">· World Bank, latest year</span>` : ''}</div>
        <div class="legend-ramp" style="background:linear-gradient(90deg,${P.ramp.join(',')})"></div>
        <div class="legend-ends"><span>${L.fmt(d.min)}</span><span>median ${L.fmt(d.median)}</span><span>${L.fmt(d.max)}</span></div>`;
    }
  }
  function select(id, { fly = true } = {}) {
    st.selected = id; st.regionSel = null; repaint(); updateNames(); updateSplit();
    const c = D.byId[id];
    G.ringsData(c && c.latlng ? [{ lat: c.latlng[0], lng: c.latlng[1] }] : []);
    if (id && fly) flyTo(id);
  }
  async function selectRegion(id, k, { fly = true } = {}) {
    st.selected = id; st.regionSel = id + ':' + k;
    G.ringsData([]);
    await updateSplit();
    repaint(); st.nameIds = null; updateNames();
    const r = D.adminLoaded(id)?.byK[k];
    if (r && fly) view(r.lab[0], r.lab[1], Math.max(0.3, Math.min(1.3, 0.2 + Math.sqrt(r.area) / 1100)), 1000);
  }
  function flyTo(id, alt) {
    const c = D.byId[id]; if (!c || !c.latlng) return;
    const size = Math.sqrt(c.area || 1000);
    const a = alt ?? Math.max(0.7, Math.min(2.2, 0.45 + size / 900));
    const at = c.labelLatLng || c.latlng;
    setSpin(false, true);
    G.pointOfView({ lat: at[0], lng: at[1], altitude: a }, GA.reducedMotion() ? 0 : 1100);
  }
  function view(lat, lng, altitude = 2, ms = 1200) { setSpin(false, true); G.pointOfView({ lat, lng, altitude }, GA.reducedMotion() ? 0 : ms); }
  function setHighlight(ids) { st.highlight = ids && ids.length ? new Set(ids) : null; repaint(); }
  function flash(key, color) { if (key) st.flashes[key] = C[color] || color; repaint(); }
  function clearFlashes() { st.flashes = {}; repaint(); }
  function setForceSplit(id) { st.forceSplit = id || null; return updateSplit(); }
  function setMarkers(list) {
    st.markers = (list || []).map(m => {
      const d = document.createElement('div'); d.className = 'marker';
      d.innerHTML = `<i></i><span>${GA.esc(m.label)}</span>`;
      return { type: 'marker', lat: m.lat, lng: m.lng, el: d };
    });
    st.nameIds = null; updateNames();
  }
  function setGuides(list) { st.guides = (list || []).map(g => guidePath(g)); updatePaths(); }
  function guidePath(g) {
    const pts = [];
    if (g.lat != null) for (let x = -180; x <= 180; x += 3) pts.push([x, g.lat]);
    else for (let y = -89; y <= 89; y += 3) pts.push([g.lng, y]);
    return { pts, color: g.color || alpha(C.accent, .9), name: g.name, dash: g.dash };
  }
  async function setPlates(on) {
    st.plates = on;
    if (on && !D.plates) { GA.toast('Loading plate boundaries'); await D.lazy('plates'); }
    updatePaths();
  }
  function updatePaths() {
    const plates = st.plates && D.plates ? D.plates.features.map(f => ({ pts: f.geometry.coordinates, color: alpha(C.bad, .9), name: f.properties.Name ? `Plate boundary: ${f.properties.Name}` : '' })) : [];
    G.pathsData(plates.concat(st.guides.map(g => ({ ...g, color: g.color.startsWith('rgba') ? alpha(C.accent, .9) : g.color }))));
  }
  function setCapitals(on) {
    st.capitals = on;
    const list = on ? D.countries.filter(c => c.sovereign && c.capLatLng).map(c => ({ lat: c.capLatLng[0], lng: c.capLatLng[1], text: c.capital[0], tip: `${c.capital[0]}, capital of ${c.name}` })) : [];
    G.labelsData(list);
  }
  // three.js renders see-through double-sided surfaces in two passes and flags each material for a
  // recompile check on every frame. Satellite mode uses see-through country fills, so opt them out.
  function singlePass() {
    requestAnimationFrame(() => G.scene().traverse(o => {
      const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of ms) if (m.side === 2 && !m.forceSinglePass) m.forceSinglePass = true;
    }));
  }
  function setSatellite(on) {
    st.satellite = on;
    G.globeImageUrl(on ? 'assets/earth-blue-marble.jpg' : solidTexture(C.sea)).bumpImageUrl(on ? 'assets/earth-topology.png' : null);
    G.showGraticules(!on);
    repaint(); singlePass();
  }
  // re-read colours after the light/dark toggle
  function setTheme() {
    loadPalette();
    if (!st.satellite) G.globeImageUrl(solidTexture(C.sea));
    G.atmosphereColor(P.atmo).atmosphereAltitude(P.atmoAlt);
    G.polygonSideColor(G.polygonSideColor()).polygonStrokeColor(G.polygonStrokeColor()).labelColor(G.labelColor());
    repaint(); renderLegend(); updatePaths();
    if (st.capitals) setCapitals(true);
  }
  function setSpin(on) {
    st.spin = on; G.controls().autoRotate = on && !GA.reducedMotion();
    const b = GA.$('#toggleSpin'); if (b) b.setAttribute('aria-pressed', String(on));
  }
  function setInteraction({ tooltips = true, onClick = null } = {}) {
    st.tooltips = tooltips; st.clickHandler = onClick;
    G.polygonLabel(G.polygonLabel()); G.pointLabel(G.pointLabel()); st.nameIds = null; updateNames();
  }
  function reset() {
    setHighlight(null); setMarkers([]); setGuides([]); clearFlashes(); setInteraction();
    st.selected = null; st.regionSel = null; G.ringsData([]); repaint(); updateSplit();
  }
  function lensInfo() { return LENSES; }

  GA.globe = {
    init, setNames, setLens, select, selectRegion, flyTo, view, setHighlight, flash, clearFlashes, setForceSplit,
    setMarkers, setGuides, setPlates, setCapitals, setSatellite, setSpin, setTheme, setInteraction, reset, repaint, lensInfo, hasAdmin,
    get state() { return st; }, _G: () => G,
  };
})(window.GA);
