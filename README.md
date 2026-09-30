# Meridian Atlas

An interactive geography study app: a 3D globe, a profile for all 250 countries and territories, a 10-lesson course, region tours and spaced-repetition practice.

## Run it

Double-click `start.bat` (needs Python). It serves the folder at http://localhost:8765 and opens your browser.
Opening `index.html` directly from disk will not work, because browsers block loading the data files that way.

## What's inside

- **Globe**: click any country for facts, rankings, World Bank indicators, and Wikipedia-sourced overview, history (by era), geography, politics, economy, people and culture. Colour the map by region, population, density, income, life expectancy, fertility or your own knowledge. Layers: country names, satellite imagery, tectonic plates, capitals. Zoom into (or select) a country to see its states or provinces; each has its own panel, and country profiles list them with a find-them quiz. Dark mode is the default; the moon/sun button switches to light.
- **Tools**: *Measure distance* draws the great-circle route between any two clicked places with km/miles, flight time, heading and the local time difference. *Day & night* shades the half of the Earth in darkness right now and marks where the Sun is overhead. Hovering a country shows the local time in its capital; profiles show local time and how many time zones a country spans (IANA tz data, daylight saving included).
- **Course**: 10 lessons (physical world, then human world). The globe follows the section you're reading. Each ends with key terms and a 5-question check. Then 22 region tours.
- **Practice**: find it on the globe, name the highlighted country, capitals, flags, bigger-or-smaller. Answers feed a Leitner spaced-repetition schedule.
- **Index**: sortable table of every country. **Progress**: mastery by continent and skill, activity, weak spots, home country, notes.

Progress is saved in your browser's localStorage.

## Rebuilding the data

Run `npm install` once, then `node tools/build-data.mjs`. It re-downloads everything into `data/` (world-countries dataset, World Bank API, Wikipedia, Wikidata capitals, world-atlas shapes, plate boundaries), computes where each country's name sits on the globe, builds the states/provinces files in `data/admin1/` (Natural Earth boundaries, Wikidata facts, Wikipedia intros; ), compresses the flags, and stamps `data/manifest.json` with a new version. Allow about 20 minutes; the states/provinces step is the slow part.

The app keeps the data files in the browser (IndexedDB) after the first visit. A new manifest version makes it fetch fresh copies.

Text from Wikipedia is CC BY-SA 4.0; each section links its source article.
