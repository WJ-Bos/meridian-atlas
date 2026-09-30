// Adds time zones to data/countries.json from the IANA tz database (zone.tab):
//   zones: [[ianaName, lat, lng], ...]  every zone in the country, with its reference city's position
//   tz: ianaName                         the zone of the capital (nearest zone to the capital)
// The browser turns zone names into local times with Intl, so daylight saving is handled automatically.
// Usage: node tools/build-timezones.mjs
import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../data/countries.json', import.meta.url);
const countries = JSON.parse(await readFile(file, 'utf8'));
const r = await fetch('https://raw.githubusercontent.com/eggert/tz/main/zone.tab', { headers: { 'User-Agent': 'GeolearnAtlas/1.0' } });
if (!r.ok) throw new Error('zone.tab ' + r.status);

// coordinates look like +4851+00220 or +404251-0740023 (degrees, minutes, optional seconds)
function dms(s) {
  const sign = s[0] === '-' ? -1 : 1, d = s.slice(1);
  const [deg, min, sec] = d.length <= 5 ? [d.slice(0, d.length - 2), d.slice(-2), 0] : [d.slice(0, d.length - 4), d.slice(-4, -2), d.slice(-2)];
  return sign * (+deg + +min / 60 + +sec / 3600);
}
// Xinjiang's local time is unofficial: China officially uses one zone
const UNOFFICIAL = new Set(['Asia/Urumqi']);
const byA2 = {};
for (const line of (await r.text()).split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const [cc, coord, tz] = line.split('\t');
  if (UNOFFICIAL.has(tz)) continue;
  const m = coord.match(/^([+-]\d+)([+-]\d+)$/); if (!m) continue;
  (byA2[cc] ||= []).push([tz, +dms(m[1]).toFixed(2), +dms(m[2]).toFixed(2)]);
}
const all = Object.values(byA2).flat();
const dist = (a, b) => Math.hypot(a[0] - b[0], (a[1] - b[1]) * Math.cos(a[0] * Math.PI / 180));
let n = 0;
for (const c of countries) {
  const zones = byA2[c.a2] || (c.id === 'UNK' ? [['Europe/Belgrade', 44.83, 20.5]] : null);
  const at = c.capLatLng || c.latlng;
  if (!at) continue;
  // countries without their own entry (rare) borrow the nearest zone anywhere
  const pool = zones || all;
  const near = pool.reduce((best, z) => (dist([z[1], z[2]], at) < dist([best[1], best[2]], at) ? z : best));
  c.zones = zones || [near];
  c.tz = near[0];
  n++;
}
await writeFile(file, JSON.stringify(countries));
const show = id => { const c = countries.find(x => x.id === id); return `${id} ${c.tz} (${c.zones.length} zones)`; };
console.log('time zones for', n, 'countries:', ['USA', 'RUS', 'CHN', 'IND', 'AUS', 'BRA', 'FRA', 'UNK'].map(show).join(', '));
