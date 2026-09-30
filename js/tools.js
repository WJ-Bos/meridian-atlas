// Time and distance tools: local times from IANA zones, and the two-click distance measurer.
(function (GA) {
  const { data: D, esc } = GA;

  // ----- local time -----
  const fmtCache = {};
  function fmt(tz, opts) {
    const k = tz + JSON.stringify(opts);
    try { return (fmtCache[k] ||= new Intl.DateTimeFormat('en-GB', { timeZone: tz, ...opts })); } catch { return null; }
  }
  // minutes ahead of UTC right now (handles daylight saving)
  function offsetMin(tz, date = new Date()) {
    const f = fmt(tz, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });
    if (!f) return null;
    const p = Object.fromEntries(f.formatToParts(date).map(x => [x.type, x.value]));
    const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
    return Math.round((asUtc - Math.floor(date.getTime() / 60000) * 60000) / 60000);
  }
  function offsetLabel(min) {
    if (min == null) return '';
    const s = min < 0 ? '−' : '+', a = Math.abs(min), h = Math.floor(a / 60), m = a % 60;
    return `UTC${s}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`;
  }
  function clock(tz) { return fmt(tz, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })?.format(new Date()) ?? null; }
  function weekday(tz) { return fmt(tz, { weekday: 'short' })?.format(new Date()) ?? ''; }
  const near = (zones, lat, lng) => zones.reduce((b, z) => (Math.hypot(z[1] - lat, (z[2] - lng) * Math.cos(lat * Math.PI / 180)) < Math.hypot(b[1] - lat, (b[2] - lng) * Math.cos(lat * Math.PI / 180)) ? z : b));
  // the zone for a point inside a country: its nearest zone city
  function zoneAt(countryId, lat, lng) {
    const c = D.byId[countryId]; if (!c?.zones?.length) return null;
    return c.zones.length === 1 ? c.zones[0][0] : near(c.zones, lat, lng)[0];
  }
  // distinct UTC offsets a country uses right now, e.g. ["UTC−10", …, "UTC−4"]
  function spans(c) {
    const offs = [...new Set((c.zones || []).map(z => offsetMin(z[0])).filter(x => x != null))].sort((a, b) => a - b);
    return offs;
  }
  GA.time = { clock, weekday, offsetMin, offsetLabel, zoneAt, spans };

  // ----- measuring distances -----
  const m = { on: false, a: null, b: null };
  const card = () => GA.$('#measureCard');
  const btn = () => GA.$('#measureBtn');
  function placeOf(lat, lng, id, props) {
    const c = id && D.byId[id];
    let name = 'Open sea', tz = null;
    if (c) {
      const r = props?.admin ? D.adminLoaded(id)?.byK[props.k] : null;
      name = r ? `${r.name}, ${c.name}` : c.name;
      tz = zoneAt(id, lat, lng);
    }
    // at sea, clocks follow nautical time: one hour per 15° of longitude
    const off = tz ? offsetMin(tz) : Math.round(lng / 15) * 60;
    return { lat, lng, name, tz, off };
  }
  const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  function bearing(a, b) {
    const r = x => x * Math.PI / 180, f1 = r(a.lat), f2 = r(b.lat), dl = r(b.lng - a.lng);
    const y = Math.sin(dl) * Math.cos(f2), x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }
  function localAt(p) {
    if (p.tz) return `${clock(p.tz)} ${weekday(p.tz)}`;
    const d = new Date(Date.now() + p.off * 60000);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} ${d.toUTCString().slice(0, 3)}`;
  }
  function render() {
    const el = card();
    el.hidden = !m.on;
    if (!m.on) return;
    if (!m.a) { el.innerHTML = `<p class="mc-title">Measure a distance</p><p class="mc-sub">Click the first place on the globe, on land or sea.</p>${actions(false)}`; wire(); return; }
    if (!m.b) { el.innerHTML = `<p class="mc-title">From ${esc(m.a.name)}</p><p class="mc-sub">Now click the second place.</p>${actions(true)}`; wire(); return; }
    const { a, b } = m, km = GA.haversine([a.lat, a.lng], [b.lat, b.lng]);
    const hours = km / 850 + (km > 300 ? 0.5 : 0.25), h = Math.floor(hours), min = Math.round((hours - h) * 60 / 5) * 5;
    const br = bearing(a, b), diff = b.off - a.off;
    const dh = diff === 0 ? 'same time' : `${diff > 0 ? '+' : '−'}${Math.abs(diff) % 60 ? (Math.abs(diff) / 60).toFixed(1) : Math.abs(diff) / 60} h`;
    el.innerHTML = `
      <p class="mc-route">${esc(a.name)} <span aria-hidden="true">to</span> ${esc(b.name)}</p>
      <p class="mc-big num">${GA.fmtInt(Math.round(km))} km</p>
      <dl class="mc-facts">
        <dt>Miles</dt><dd class="num">${GA.fmtInt(Math.round(km * 0.621371))}</dd>
        <dt>By plane</dt><dd>about ${h ? h + ' h ' : ''}${min} min</dd>
        <dt>Heading</dt><dd class="num">${Math.round(br)}° ${COMPASS[Math.round(br / 22.5) % 16]}</dd>
        <dt>Local time</dt><dd class="num">${esc(localAt(a))} → ${esc(localAt(b))} <span class="faint">(${dh})</span></dd>
      </dl>
      <p class="mc-sub">Shortest route over the Earth's surface (a great circle). Flight time assumes 850 km/h plus take-off and landing.</p>
      ${actions(true)}`;
    wire();
  }
  const actions = clear => `<div class="btn-row">${clear ? '<button class="btn" id="mcClear">Start again</button>' : ''}<button class="btn btn-quiet" id="mcDone">Done</button></div>`;
  function wire() {
    const c = GA.$('#mcClear'); if (c) c.onclick = () => { m.a = m.b = null; draw(); render(); };
    GA.$('#mcDone').onclick = () => stop();
  }
  function draw() {
    const pts = [m.a, m.b].filter(Boolean);
    GA.globe.setMarkers(pts.map((p, i) => ({ lat: p.lat, lng: p.lng, label: (i ? 'B: ' : 'A: ') + p.name })));
    GA.globe.setArcs(m.a && m.b ? [{ startLat: m.a.lat, startLng: m.a.lng, endLat: m.b.lat, endLng: m.b.lng }] : []);
  }
  function onClick(id, coords, props) {
    if (!coords) return;
    const p = placeOf(coords.lat, coords.lng, id, props);
    if (!m.a || m.b) { m.a = p; m.b = null; } else m.b = p;
    draw(); render();
  }
  function start() {
    m.on = true; m.a = m.b = null;
    btn().setAttribute('aria-pressed', 'true');
    GA.globe.setSpin(false);
    GA.globe.setInteraction({ tooltips: true, onClick });
    draw(); render();
  }
  function stop() {
    if (!m.on) return;
    m.on = false; m.a = m.b = null;
    btn().setAttribute('aria-pressed', 'false');
    GA.globe.setInteraction(); GA.globe.setArcs([]); GA.globe.setMarkers([]);
    render();
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && m.on) stop(); });
  GA.measure = { start, stop, toggle: () => (m.on ? stop() : start()), get on() { return m.on; } };
})(window.GA);
