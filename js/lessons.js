// Course content. Each section may carry a `globe` instruction that runs when you scroll to it:
//   view: [lat, lng, altitude]   highlight: [country ids]   markers: [{lat, lng, label}]
//   guides: [{lat|lng, name}]    plates: true               lens: 'population' etc.
// Figures are rounded and current as of 2025–26.
window.GA = window.GA || {};
GA.lessons = [
  // ───────────────────────────── Part 1: the physical world
  {
    id: 'grid', part: 1, title: 'Reading the globe', minutes: 12,
    summary: 'Latitude, longitude, the great circles, time zones, and why flat maps lie.',
    sections: [
      {
        h: 'An address for every point on Earth',
        body: [
          'Every place on Earth can be pinned with two numbers. Latitude says how far north or south you are, from 0° at the equator to 90° at each pole. Longitude says how far east or west you are, from 0° at the prime meridian to 180° on the opposite side of the planet.',
          'Lines of latitude run east to west and are called parallels, because they never meet. Lines of longitude run from pole to pole and are called meridians. They are furthest apart at the equator and squeeze together at the poles.',
          'One degree of latitude is always about 111 km. A degree of longitude is also 111 km at the equator, but shrinks to zero at the poles. That is why a country far north, like Norway, looks stretched on most flat maps.',
        ],
        callout: 'Paris sits at about <b>48.9° N, 2.4° E</b>. Buenos Aires is at about <b>34.6° S, 58.4° W</b>. Every country page in this atlas shows its coordinates in the same form.',
        globe: { view: [20, 0, 2.6], guides: [{ lat: 0, name: 'Equator (0°)' }, { lng: 0, name: 'Prime meridian (0°)' }], markers: [{ lat: 48.86, lng: 2.35, label: 'Paris 48.9° N' }, { lat: -34.6, lng: -58.4, label: 'Buenos Aires 34.6° S' }] },
      },
      {
        h: 'The five lines worth memorising',
        body: [
          'The equator (0°) splits the Northern and Southern Hemispheres. It crosses 13 countries, including Ecuador, which is named after it, Brazil, the Democratic Republic of the Congo, Kenya and Indonesia.',
          'The Tropic of Cancer (23.4° N) and the Tropic of Capricorn (23.4° S) mark the furthest points where the Sun is ever directly overhead. They exist because Earth is tilted about 23.4° on its axis. The band between them is "the tropics".',
          'The Arctic Circle (66.6° N) and Antarctic Circle (66.6° S) mark where, for at least one day a year, the Sun never sets in summer and never rises in winter.',
        ],
        globe: { view: [10, 20, 2.8], guides: [{ lat: 0, name: 'Equator' }, { lat: 23.44, name: 'Tropic of Cancer', dash: 2 }, { lat: -23.44, name: 'Tropic of Capricorn', dash: 2 }, { lat: 66.56, name: 'Arctic Circle', dash: 1 }, { lat: -66.56, name: 'Antarctic Circle', dash: 1 }], highlight: ['ECU', 'COL', 'BRA', 'GAB', 'COG', 'COD', 'UGA', 'KEN', 'SOM', 'MDV', 'IDN', 'KIR', 'STP'] },
      },
      {
        h: 'Why the prime meridian runs through London',
        body: [
          'The equator is set by nature: it is halfway between the poles. The prime meridian is a human choice. In 1884, delegates from 25 countries met in Washington and chose the meridian through the Royal Observatory at Greenwich, London, largely because most of the world\'s sea charts already used it.',
          'On the other side of the world, at about 180°, runs the International Date Line. It zigzags to avoid splitting countries. In 1995 Kiribati moved it so all its islands share one date, and in 2011 Samoa skipped 30 December entirely to move to the west side of the line, closer to its trading partners Australia and New Zealand.',
        ],
        globe: { view: [30, 0, 2.2], guides: [{ lng: 0, name: 'Prime meridian, Greenwich' }, { lng: 180, name: 'Around 180°: the International Date Line', dash: 2 }], markers: [{ lat: 51.48, lng: 0, label: 'Greenwich' }, { lat: -13.8, lng: -172.1, label: 'Samoa' }, { lat: 1.87, lng: -157.4, label: 'Kiribati' }] },
      },
      {
        h: 'Time zones',
        body: [
          'Earth turns 360° in 24 hours, which is 15° an hour. So in theory each 15° slice of longitude is one hour apart. In practice, governments draw time zones to follow borders and politics.',
          'China spans about five theoretical time zones but uses one: Beijing time. At the western edge in Xinjiang, the sun can rise after 9 a.m. by the clock. Russia uses 11 time zones. France, thanks to its overseas territories scattered across the oceans, uses 12, more than any other country.',
        ],
        globe: { view: [40, 95, 2.4], highlight: ['CHN', 'RUS'] },
      },
      {
        h: 'Every flat map is wrong somewhere',
        body: [
          'You cannot flatten the skin of a sphere without stretching or tearing it. Every map projection chooses what to distort. The Mercator projection, made in 1569 for sailors, keeps angles and shapes correct locally, so a straight line on it is a constant compass bearing. The price is size: land gets hugely inflated towards the poles.',
          'On a Mercator map, Greenland looks about as big as Africa. In reality Africa is about 14 times larger. Africa could hold the United States, China, India and most of Europe with room to spare. This is one of the best reasons to learn geography on a globe.',
        ],
        callout: 'Area check: <b>Africa</b> 30.4 million km², <b>Greenland</b> 2.2 million km². Rotate the globe and compare them at the same zoom.',
        globe: { view: [30, -10, 2.6], highlight: ['GRL', 'DZA', 'LBY', 'EGY', 'SDN', 'TCD', 'NER', 'MLI', 'MRT', 'COD', 'ETH', 'NGA', 'ZAF', 'AGO', 'NAM', 'BWA', 'ZMB', 'TZA', 'KEN', 'SOM', 'MOZ', 'MDG', 'CMR', 'CAF', 'SSD', 'ZWE', 'GAB', 'COG', 'GHA', 'CIV', 'BFA', 'GIN', 'SEN', 'MAR', 'TUN', 'ESH', 'ERI', 'UGA', 'MWI', 'LBR', 'SLE', 'TGO', 'BEN', 'GNB', 'GMB', 'RWA', 'BDI', 'LSO', 'SWZ', 'DJI', 'GNQ'] },
      },
    ],
    terms: [
      { t: 'Latitude', d: 'Angle north or south of the equator, 0° to 90°. Lines of latitude are called parallels.' },
      { t: 'Longitude', d: 'Angle east or west of the prime meridian, 0° to 180°. Lines of longitude are called meridians.' },
      { t: 'Hemisphere', d: 'Half the globe: Northern/Southern (split by the equator) or Eastern/Western (split by the prime meridian and 180°).' },
      { t: 'Tropics', d: 'The band between 23.4° N and 23.4° S where the Sun can be directly overhead.' },
      { t: 'Map projection', d: 'A method of flattening the globe onto a plane. Each one distorts area, shape, distance or direction.' },
    ],
    check: [
      { q: 'What does latitude measure?', a: ['Distance north or south of the equator', 'Distance east or west of Greenwich', 'Height above sea level', 'Time difference from London'], explain: 'Latitude runs from 0° at the equator to 90° at the poles.' },
      { q: 'Why do the Tropics sit at about 23.4°?', a: ['Earth\'s axis is tilted by about 23.4°', 'They were set by treaty in 1884', 'That is where deserts begin', 'It is one quarter of the way to the pole'], explain: 'The tilt decides how far from the equator the Sun can be directly overhead.' },
      { q: 'On a Mercator map Greenland looks as big as Africa. In reality Africa is about…', a: ['14 times larger', 'The same size', 'Twice as large', '100 times larger'], explain: 'Africa is about 30.4 million km², Greenland about 2.2 million km².' },
      { q: 'How many degrees of longitude does Earth turn in one hour?', a: ['15°', '24°', '1°', '30°'], explain: '360° divided by 24 hours is 15° per hour.' },
      { q: 'How many official time zones does China use?', a: ['One', 'Five', 'Three', 'Eleven'], explain: 'All of China runs on Beijing time, even though it spans about five theoretical zones.' },
    ],
  },
  {
    id: 'continents', part: 1, title: 'Continents and oceans', minutes: 10,
    summary: 'The big pieces: seven continents, five oceans, and the narrow places that join them.',
    sections: [
      {
        h: 'Seven continents, by convention',
        body: [
          'The usual English-language model has seven continents: Asia, Africa, North America, South America, Antarctica, Europe and Australia (often grouped with the Pacific islands as Oceania). Other traditions count six or five, joining the Americas, or Europe and Asia.',
          'Continents are partly geology and partly culture. Europe and Asia sit on one landmass, Eurasia. The border between them is a historical convention: the Ural Mountains and Ural River, the Caspian Sea, the Caucasus Mountains and the Bosporus strait in Istanbul. That makes Russia, Kazakhstan, Turkey, Georgia, Azerbaijan and Egypt (through Sinai) transcontinental countries.',
        ],
        globe: { view: [45, 55, 2.3], highlight: ['RUS', 'KAZ', 'TUR', 'GEO', 'AZE', 'EGY'], markers: [{ lat: 60, lng: 59.5, label: 'Ural Mountains' }, { lat: 41.1, lng: 29.05, label: 'Bosporus' }, { lat: 42.5, lng: 44.5, label: 'Caucasus' }] },
      },
      {
        h: 'Asia: most land, most people',
        body: [
          'Asia covers about 30% of Earth\'s land and holds roughly 60% of its people, about 4.8 billion. It contains the highest point on land (Everest), the lowest (the Dead Sea shore), the two most populous countries (India and China) and the largest country (Russia, which spans Europe and Asia).',
        ],
        globe: { view: [30, 90, 2.3], highlight: ['IND', 'CHN', 'IDN', 'PAK', 'BGD', 'JPN'], lens: 'population', markers: [{ lat: 27.99, lng: 86.93, label: 'Mount Everest 8,849 m' }, { lat: 31.5, lng: 35.5, label: 'Dead Sea −430 m' }] },
      },
      {
        h: 'Africa: the second giant',
        body: [
          'Africa is the second-largest continent, with 54 recognised countries and about 1.5 billion people. It is also the youngest continent: the median age is under 20, and its population is growing faster than anywhere else. By around 2050, roughly one in four people on Earth is projected to be African.',
          'Algeria is Africa\'s largest country by area. Nigeria is its most populous, with over 220 million people.',
        ],
        globe: { view: [3, 20, 2.1], highlight: ['DZA', 'NGA', 'EGY', 'ETH', 'COD'] },
      },
      {
        h: 'The Americas, Europe and Oceania',
        body: [
          'North and South America are joined by the narrow Isthmus of Panama. North America includes Central America and the Caribbean. Canada, the United States and Mexico take up most of it; Brazil takes up almost half of South America.',
          'Europe is small, with about 7% of Earth\'s land, but divided into more than 40 countries. Oceania is the smallest by land. Australia makes up most of it; the rest is scattered across thousands of Pacific islands grouped as Melanesia, Micronesia and Polynesia.',
        ],
        globe: { view: [15, -80, 2.4], highlight: ['CAN', 'USA', 'MEX', 'BRA', 'PAN'], markers: [{ lat: 9.08, lng: -79.68, label: 'Isthmus of Panama' }] },
      },
      {
        h: 'One world ocean, five names',
        body: [
          'Water covers about 71% of Earth\'s surface. The oceans are really one connected body, but are named in five parts. The Pacific is by far the largest, at about 165 million km², more than all the land on Earth combined. Then come the Atlantic, the Indian, the Southern Ocean around Antarctica, and the Arctic, the smallest.',
          'The deepest point in any ocean is the Challenger Deep in the Mariana Trench in the western Pacific, nearly 11,000 m down. Mount Everest would fit inside it with about 2 km of water to spare.',
        ],
        globe: { view: [0, -160, 2.8], markers: [{ lat: 11.35, lng: 142.2, label: 'Challenger Deep ~10,900 m' }, { lat: 0, lng: -140, label: 'Pacific Ocean' }, { lat: 15, lng: -40, label: 'Atlantic Ocean' }, { lat: -20, lng: 80, label: 'Indian Ocean' }, { lat: -62, lng: 20, label: 'Southern Ocean' }, { lat: 85, lng: 0, label: 'Arctic Ocean' }] },
      },
      {
        h: 'Straits and canals: the joints of the world',
        body: [
          'A few narrow waterways connect the seas, and much of the world\'s trade squeezes through them. The Strait of Gibraltar joins the Mediterranean to the Atlantic. The Suez Canal in Egypt, opened in 1869, joins the Mediterranean to the Red Sea. The Panama Canal, opened in 1914, joins the Atlantic and Pacific.',
          'You will meet these places again in the lesson on the world economy, because whoever controls a chokepoint has leverage over everyone who needs it.',
        ],
        globe: { view: [30, 10, 2.6], markers: [{ lat: 35.97, lng: -5.5, label: 'Strait of Gibraltar' }, { lat: 30.6, lng: 32.33, label: 'Suez Canal' }, { lat: 9.08, lng: -79.68, label: 'Panama Canal' }, { lat: 41.12, lng: 29.07, label: 'Bosporus' }] },
      },
    ],
    terms: [
      { t: 'Continent', d: 'One of the large landmasses. The count (5, 6 or 7) depends on convention.' },
      { t: 'Eurasia', d: 'The single landmass carrying Europe and Asia.' },
      { t: 'Transcontinental country', d: 'A country with territory on more than one continent, such as Russia, Turkey or Egypt.' },
      { t: 'Isthmus', d: 'A narrow strip of land joining two larger areas, such as Panama or Suez.' },
      { t: 'Strait', d: 'A narrow sea passage joining two larger bodies of water.' },
    ],
    check: [
      { q: 'Which ocean is the largest?', a: ['Pacific', 'Atlantic', 'Indian', 'Southern'], explain: 'The Pacific covers about 165 million km², more than all land combined.' },
      { q: 'Roughly what share of the world\'s people live in Asia?', a: ['About 60%', 'About 25%', 'About 40%', 'About 80%'], explain: 'About 4.8 billion of roughly 8.2 billion people.' },
      { q: 'What is the conventional land border between Europe and Asia?', a: ['The Ural Mountains and Ural River', 'The Alps', 'The Danube', 'The Himalayas'], explain: 'Along with the Caspian Sea, the Caucasus and the Bosporus.' },
      { q: 'Which is Africa\'s most populous country?', a: ['Nigeria', 'Egypt', 'Ethiopia', 'South Africa'], explain: 'Nigeria has over 220 million people.' },
      { q: 'The Suez Canal connects the Mediterranean with…', a: ['The Red Sea', 'The Black Sea', 'The Persian Gulf', 'The Atlantic'], explain: 'It runs through Egypt and opened in 1869.' },
    ],
  },
  {
    id: 'plates', part: 1, title: 'The restless surface', minutes: 12,
    summary: 'Plate tectonics explains mountains, volcanoes, earthquakes and the shape of the continents.',
    sections: [
      {
        h: 'A cracked shell that moves',
        body: [
          'Earth\'s outer shell is broken into about 15 major plates and many small ones. They float on hotter, softer rock below and move a few centimetres a year, about as fast as your fingernails grow. Over millions of years, that adds up to whole oceans opening and closing.',
          'Around 300 million years ago almost all land was joined in one supercontinent, Pangaea. It began breaking apart about 200 million years ago. You can still see the fit: the bulge of Brazil tucks into the Gulf of Guinea in West Africa.',
        ],
        callout: 'The red lines on the globe are plate boundaries. Turn on "Tectonic plates" any time from the map controls.',
        globe: { view: [0, -20, 2.5], plates: true, highlight: ['BRA', 'NGA', 'CMR', 'GAB', 'GHA', 'CIV', 'LBR'] },
      },
      {
        h: 'Where plates pull apart',
        body: [
          'At divergent boundaries, plates separate and molten rock rises to fill the gap. Most are under the sea. The Mid-Atlantic Ridge runs down the middle of the Atlantic, which widens by about 2–5 cm a year. Iceland sits right on top of it, which is why it has so many volcanoes and hot springs.',
          'On land, the East African Rift is splitting the African plate in two. In tens of millions of years, eastern Africa, including much of Ethiopia, Kenya and Tanzania, may become a separate landmass.',
        ],
        globe: { view: [30, -20, 2.4], plates: true, highlight: ['ISL', 'ETH', 'KEN', 'TZA'], markers: [{ lat: 64.9, lng: -18.5, label: 'Iceland on the Mid-Atlantic Ridge' }, { lat: 1, lng: 36.5, label: 'East African Rift' }] },
      },
      {
        h: 'Where plates collide',
        body: [
          'When an ocean plate meets a continental plate, the denser ocean plate dives underneath. This is subduction. It builds volcanic mountain chains and deep trenches. The Nazca plate sliding under South America built the Andes, the longest mountain range on land, about 7,000 km.',
          'When two continents collide, neither sinks, so the crust crumples upward. India broke from Africa, drifted north and struck Asia about 50 million years ago. The collision is still going on, pushing up the Himalayas and the Tibetan Plateau. Everest rises a few millimetres a year.',
        ],
        globe: { view: [15, 30, 3], plates: true, highlight: ['CHL', 'PER', 'ECU', 'COL', 'BOL', 'ARG', 'IND', 'NPL', 'BTN', 'CHN'], markers: [{ lat: -32.65, lng: -70.01, label: 'Aconcagua 6,961 m' }, { lat: 27.99, lng: 86.93, label: 'Everest 8,849 m' }] },
      },
      {
        h: 'Where plates slide past each other',
        body: [
          'At transform boundaries, plates grind sideways. They lock, build up strain, then slip suddenly, which is an earthquake. The San Andreas Fault in California is the famous example; San Francisco was devastated by it in 1906. The North Anatolian Fault across Turkey is another, and it has produced a long series of deadly earthquakes.',
        ],
        globe: { view: [37, -100, 2.2], plates: true, highlight: ['USA', 'TUR'], markers: [{ lat: 37.77, lng: -122.42, label: 'San Andreas Fault' }] },
      },
      {
        h: 'The Ring of Fire',
        body: [
          'Around the edge of the Pacific, subduction zones form a horseshoe about 40,000 km long. It holds about three-quarters of the world\'s active volcanoes and produces about 90% of its earthquakes. Japan, Indonesia, the Philippines, New Zealand, Chile and the west coast of the Americas all sit on it.',
          'The 2011 Tōhoku earthquake off Japan was magnitude 9.0–9.1, one of the most powerful ever recorded. Its tsunami killed nearly 20,000 people and caused the Fukushima nuclear disaster. Indonesia, with about 130 active volcanoes, has more than any other country.',
        ],
        globe: { view: [10, 160, 3], plates: true, highlight: ['JPN', 'IDN', 'PHL', 'NZL', 'CHL', 'PER', 'ECU', 'MEX', 'USA', 'CAN', 'PNG', 'GTM', 'SLV', 'NIC', 'CRI', 'SLB', 'VUT', 'TON'], markers: [{ lat: 38.3, lng: 142.4, label: 'Tōhoku 2011' }, { lat: 35.36, lng: 138.73, label: 'Mount Fuji' }] },
      },
    ],
    terms: [
      { t: 'Plate tectonics', d: 'The theory that Earth\'s outer shell is split into moving plates whose interactions shape the surface.' },
      { t: 'Subduction', d: 'One plate sinking beneath another, producing trenches, volcanoes and big earthquakes.' },
      { t: 'Rift', d: 'A place where a plate is pulling apart, forming a valley that may become an ocean.' },
      { t: 'Pangaea', d: 'The supercontinent that began breaking up about 200 million years ago.' },
      { t: 'Ring of Fire', d: 'The belt of volcanoes and earthquakes around the Pacific Ocean.' },
    ],
    check: [
      { q: 'What formed the Himalayas?', a: ['India colliding with Asia', 'A volcanic hotspot', 'Glaciers carving rock', 'The Pacific plate sinking under Asia'], explain: 'The collision began about 50 million years ago and continues today.' },
      { q: 'Why does Iceland have so many volcanoes?', a: ['It sits on the Mid-Atlantic Ridge where plates pull apart', 'It is on the Ring of Fire', 'It is being subducted', 'It sits on a transform fault'], explain: 'Magma rises where the North American and Eurasian plates separate.' },
      { q: 'What share of the world\'s earthquakes happen on the Ring of Fire?', a: ['About 90%', 'About 25%', 'About 50%', 'Almost none'], explain: 'It also holds about three-quarters of active volcanoes.' },
      { q: 'The Andes were built by…', a: ['The Nazca plate subducting under South America', 'Two continents colliding', 'The East African Rift', 'Erosion'], explain: 'Ocean-continent subduction builds volcanic ranges.' },
      { q: 'How fast do plates typically move?', a: ['A few centimetres a year', 'A few metres a year', 'A few millimetres a century', 'A kilometre a year'], explain: 'About the speed your fingernails grow.' },
    ],
  },
  {
    id: 'climate', part: 1, title: 'Climate and biomes', minutes: 13,
    summary: 'Why rainforests hug the equator, why deserts sit at 30°, and how oceans and mountains bend the pattern.',
    sections: [
      {
        h: 'The Sun sets the pattern',
        body: [
          'Near the equator, sunlight hits almost straight down, so each square metre gets more energy. Towards the poles, the same sunlight is spread at a low angle over a larger area. That simple geometry is why the tropics are hot and the poles are cold.',
          'Weather is what happens today. Climate is the average pattern over 30 years or more. Geographers often use the Köppen system, which sorts climates into five main groups: A tropical, B dry, C temperate, D continental and E polar.',
        ],
        globe: { view: [10, 0, 2.6], guides: [{ lat: 0, name: 'Equator' }, { lat: 23.44, name: 'Tropic of Cancer', dash: 2 }, { lat: -23.44, name: 'Tropic of Capricorn', dash: 2 }] },
      },
      {
        h: 'Rain at the equator, deserts at 30°',
        body: [
          'Hot air at the equator rises, cools and drops heavy rain almost every day. That feeds the great rainforests: the Amazon (about 60% of it in Brazil), the Congo Basin and the forests of Southeast Asia and Indonesia.',
          'That air, now dry, flows towards the poles and sinks again around 30° north and south. Sinking air warms and stops clouds forming. So a belt of deserts wraps the globe at those latitudes: the Sahara, the Arabian Desert, the Thar in India and Pakistan, the Kalahari, and the Australian deserts. The Sahara alone is about the size of the United States.',
        ],
        callout: 'This loop of rising and sinking air is called a <b>Hadley cell</b>. It is the single most useful idea for guessing a place\'s climate from its latitude.',
        globe: { view: [15, 20, 2.7], highlight: ['BRA', 'COD', 'COG', 'GAB', 'CMR', 'IDN', 'MYS', 'PNG', 'DZA', 'LBY', 'EGY', 'NER', 'MLI', 'MRT', 'TCD', 'SDN', 'SAU', 'OMN', 'YEM', 'ARE', 'NAM', 'BWA', 'AUS'], guides: [{ lat: 30, name: '30° N desert belt', dash: 2 }, { lat: -30, name: '30° S desert belt', dash: 2 }, { lat: 0, name: 'Equator' }] },
      },
      {
        h: 'Oceans move heat',
        body: [
          'Ocean currents carry heat around the planet. The Gulf Stream carries warm water from the Caribbean across the Atlantic, keeping northwest Europe far milder than places at the same latitude in Canada or Russia. London, at 51.5° N, is further north than Calgary in Canada, yet its winters are much gentler.',
          'Cold currents do the opposite. The cold Humboldt Current off Peru and Chile cools the air so little rain forms. Together with the Andes blocking moisture from the east, it makes the Atacama Desert in Chile the driest non-polar place on Earth. Some weather stations there have never recorded rain.',
        ],
        globe: { view: [30, -40, 2.8], highlight: ['GBR', 'IRL', 'NOR', 'FRA', 'CAN', 'CHL', 'PER'], markers: [{ lat: 36, lng: -65, label: 'Gulf Stream' }, { lat: -24.5, lng: -69.25, label: 'Atacama Desert' }, { lat: 51.5, lng: -0.13, label: 'London 51.5° N' }, { lat: 51.05, lng: -114.07, label: 'Calgary 51.0° N' }] },
      },
      {
        h: 'Monsoons',
        body: [
          'A monsoon is a seasonal reversal of the wind. In summer, the land of South Asia heats faster than the Indian Ocean, so moist ocean air is pulled inland and dumps rain. India gets roughly three-quarters of its annual rainfall between June and September. Farming, food prices and the economy of over a billion people depend on the monsoon arriving on time.',
          'Mountains squeeze the rain out. Moist air forced up the Himalayas cools and rains on the southern slopes, while the land to the north, in the Tibetan Plateau, stays dry. This is a rain shadow.',
        ],
        globe: { view: [22, 82, 1.9], highlight: ['IND', 'BGD', 'NPL', 'PAK', 'LKA', 'MMR'], markers: [{ lat: 25.3, lng: 91.7, label: 'Meghalaya: one of the wettest places on Earth' }] },
      },
      {
        h: 'Biomes: the living map',
        body: [
          'Climate decides what grows, and what grows decides how people live. Tropical rainforest near the equator gives way to savanna grassland, then desert around 30°. In the middle latitudes you find Mediterranean scrub, temperate forest and grassland prairies and steppes. Further north comes the taiga, the huge conifer forest across Canada, Scandinavia and Russia, which is the largest land biome on Earth. Then tundra, then ice.',
          'The Mediterranean climate, with hot dry summers and mild wet winters, turns up wherever latitude and a western coast line up: around the Mediterranean Sea itself, and also in California, central Chile, the area around Cape Town and southwest Australia. That is why all of them grow wine grapes.',
        ],
        globe: { view: [40, 10, 2.9], highlight: ['CAN', 'RUS', 'FIN', 'SWE', 'NOR', 'ESP', 'ITA', 'GRC', 'CHL', 'ZAF'] },
      },
    ],
    terms: [
      { t: 'Climate', d: 'The long-term average weather of a place, usually over 30 years.' },
      { t: 'Hadley cell', d: 'The loop of air rising at the equator and sinking around 30°, which creates rainforests and desert belts.' },
      { t: 'Monsoon', d: 'A seasonal wind reversal that brings a wet season, most famously to South Asia.' },
      { t: 'Rain shadow', d: 'A dry area on the downwind side of mountains.' },
      { t: 'Biome', d: 'A large community of plants and animals shaped by climate, such as taiga or savanna.' },
    ],
    check: [
      { q: 'Why are many of the world\'s great deserts near 30° latitude?', a: ['Dry air sinks there and stops clouds forming', 'They are furthest from the ocean', 'The Sun is strongest there', 'Mountains block the rain'], explain: 'Air that rose and rained at the equator descends around 30°.' },
      { q: 'What keeps northwest Europe mild for its latitude?', a: ['The Gulf Stream', 'The monsoon', 'The Humboldt Current', 'The Alps'], explain: 'Warm Atlantic water carries heat from the Caribbean.' },
      { q: 'What is the largest land biome on Earth?', a: ['Taiga (boreal forest)', 'Tropical rainforest', 'Desert', 'Savanna'], explain: 'It stretches across Canada, Scandinavia and Russia.' },
      { q: 'Which country holds about 60% of the Amazon rainforest?', a: ['Brazil', 'Peru', 'Colombia', 'Venezuela'], explain: 'Seven other countries and French Guiana share the rest.' },
      { q: 'A rain shadow forms…', a: ['On the downwind side of mountains', 'Along the equator', 'Near cold ocean currents only', 'In the middle of oceans'], explain: 'Air loses its moisture climbing the mountains.' },
    ],
  },
  {
    id: 'water', part: 1, title: 'Rivers, lakes and high ground', minutes: 11,
    summary: 'The great rivers and mountains, and why civilisations began beside water.',
    sections: [
      {
        h: 'Civilisation began on river banks',
        body: [
          'The first cities grew where rivers flooded and left fertile soil: the Tigris and Euphrates in Mesopotamia (today Iraq), the Nile in Egypt, the Indus in Pakistan and the Yellow River in China. Rivers gave water, food, transport and a reason to organise labour and keep records.',
          'Egypt shows how strong that pull still is. About 95% of its roughly 115 million people live on roughly 5% of its land, along the Nile valley and delta. From space, it is a green ribbon through the desert.',
        ],
        globe: { view: [28, 45, 2], highlight: ['IRQ', 'EGY', 'PAK', 'CHN', 'SYR'], markers: [{ lat: 33, lng: 44, label: 'Mesopotamia' }, { lat: 26, lng: 32.7, label: 'Nile valley' }, { lat: 27.3, lng: 68.1, label: 'Indus valley' }, { lat: 35, lng: 113, label: 'Yellow River' }] },
      },
      {
        h: 'The longest and the largest',
        body: [
          'The Nile, at about 6,650 km, is usually ranked the longest river, flowing north to the Mediterranean from a basin shared by 11 countries. The Amazon is close in length and by far the largest by volume: it carries about a fifth of all the river water that reaches the world\'s oceans.',
          'The Yangtze, about 6,300 km, is the longest river in Asia and the heart of China\'s economy; the Three Gorges Dam on it is the largest power station in the world. The Mississippi–Missouri system drains most of the central United States. The Congo is the deepest river, over 220 m in places.',
        ],
        globe: { view: [5, 10, 3], highlight: ['EGY', 'SDN', 'SSD', 'ETH', 'UGA', 'BRA', 'CHN', 'USA', 'COD'], markers: [{ lat: 31.4, lng: 31, label: 'Nile delta' }, { lat: 0, lng: -50, label: 'Amazon mouth' }, { lat: 30.8, lng: 111, label: 'Three Gorges Dam' }, { lat: 29.1, lng: -89.3, label: 'Mississippi delta' }] },
      },
      {
        h: 'Rivers that cross borders',
        body: [
          'The Danube flows through or along 10 countries, more than any other river: Germany, Austria, Slovakia, Hungary, Croatia, Serbia, Romania, Bulgaria, Moldova and Ukraine. Four capitals sit on it: Vienna, Bratislava, Budapest and Belgrade.',
          'Shared rivers create shared problems. Ethiopia\'s giant dam on the Blue Nile, finished in 2025, has caused years of tension with Egypt and Sudan downstream. The Mekong runs from China through Myanmar, Laos, Thailand, Cambodia and Vietnam, and dams upstream affect fish and farms far downstream.',
        ],
        globe: { view: [30, 60, 2.8], highlight: ['DEU', 'AUT', 'SVK', 'HUN', 'HRV', 'SRB', 'ROU', 'BGR', 'MDA', 'UKR', 'ETH', 'LAO', 'KHM', 'VNM', 'THA'], markers: [{ lat: 11.2, lng: 35.1, label: 'Grand Ethiopian Renaissance Dam' }] },
      },
      {
        h: 'Lakes',
        body: [
          'The Caspian Sea, bordered by Russia, Kazakhstan, Turkmenistan, Iran and Azerbaijan, is the largest lake on Earth by area. Lake Baikal in Siberia is the deepest (about 1,640 m) and oldest (about 25 million years). It holds more fresh water than all five North American Great Lakes combined.',
          'The Dead Sea, between Jordan and Israel and the West Bank, has the lowest shoreline on land, about 430 m below sea level. It is so salty that you float without effort.',
        ],
        globe: { view: [45, 70, 2.5], highlight: ['RUS', 'KAZ', 'TKM', 'IRN', 'AZE', 'JOR', 'ISR'], markers: [{ lat: 41.9, lng: 50.7, label: 'Caspian Sea' }, { lat: 53.5, lng: 108, label: 'Lake Baikal' }, { lat: 31.5, lng: 35.5, label: 'Dead Sea' }, { lat: 45, lng: -84, label: 'Great Lakes' }] },
      },
      {
        h: 'The roof of the world',
        body: [
          'All 14 mountains above 8,000 m are in the Himalaya and Karakoram ranges of Nepal, China, Pakistan and India. Everest (8,849 m) is on the Nepal–China border; K2 (8,611 m), on the Pakistan–China border, is considered harder to climb.',
          'The Tibetan Plateau behind them averages over 4,500 m. It holds so much ice it is called the Third Pole, and it feeds the Yangtze, Yellow, Mekong, Indus, Ganges–Brahmaputra and other rivers that together supply water to well over a billion people.',
          'Outside Asia, the highest peaks are Aconcagua in Argentina (6,961 m), Denali in Alaska (6,190 m) and Kilimanjaro in Tanzania (5,895 m).',
        ],
        globe: { view: [30, 86, 1.6], highlight: ['NPL', 'CHN', 'PAK', 'IND', 'BTN'], markers: [{ lat: 27.99, lng: 86.93, label: 'Everest 8,849 m' }, { lat: 35.88, lng: 76.51, label: 'K2 8,611 m' }, { lat: 32, lng: 88, label: 'Tibetan Plateau' }] },
      },
    ],
    terms: [
      { t: 'Delta', d: 'Land built of sediment where a river enters the sea, such as the Nile or Ganges delta.' },
      { t: 'Drainage basin', d: 'All the land that drains into one river system.' },
      { t: 'Fertile Crescent', d: 'The arc of farmland from Egypt through the Levant to Mesopotamia where farming began about 11,000 years ago.' },
      { t: 'Plateau', d: 'A large, high, relatively flat area, such as Tibet.' },
    ],
    check: [
      { q: 'Which river carries the most water?', a: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], explain: 'About a fifth of all river water reaching the oceans.' },
      { q: 'Which river flows through the most countries?', a: ['Danube', 'Nile', 'Rhine', 'Mekong'], explain: 'Ten countries, and four capitals.' },
      { q: 'What is the deepest lake on Earth?', a: ['Lake Baikal', 'Caspian Sea', 'Lake Superior', 'Lake Victoria'], explain: 'About 1,640 m deep, in Siberia.' },
      { q: 'Roughly what share of Egypt\'s people live along the Nile?', a: ['About 95%', 'About 50%', 'About 30%', 'About 70%'], explain: 'On about 5% of the country\'s land.' },
      { q: 'Where are all 14 peaks above 8,000 m?', a: ['Himalaya and Karakoram', 'Andes', 'Alps and Caucasus', 'Rocky Mountains'], explain: 'In Nepal, China, Pakistan and India.' },
    ],
  },

  // ───────────────────────────── Part 2: the human world
  {
    id: 'people', part: 2, title: 'Where people live', minutes: 11,
    summary: 'Eight billion people, very unevenly spread: cities, crowded valleys, empty interiors and ageing nations.',
    sections: [
      {
        h: 'Eight billion, unevenly spread',
        body: [
          'The world passed 8 billion people in November 2022 and is now about 8.2 billion. They are packed into a few areas. Six countries hold about half of humanity: India, China, the United States, Indonesia, Pakistan and Nigeria. In 2023 India overtook China as the most populous country; both have over 1.4 billion people.',
          'Switch the map to population and you see two giant blocs: South Asia and East Asia. Together they hold roughly half the world\'s people.',
        ],
        globe: { view: [25, 95, 2.3], lens: 'population', highlight: ['IND', 'CHN', 'USA', 'IDN', 'PAK', 'NGA'] },
      },
      {
        h: 'Crowded edges, empty middles',
        body: [
          'People cluster along coasts, rivers and fertile plains, and avoid deserts, ice, high mountains and dense jungle. Most Canadians live within a couple of hundred kilometres of the US border. Most Australians live on the east and southeast coasts. Russia\'s people are concentrated in the west, while Siberia is vast and sparse.',
          'Density lets you compare. Bangladesh fits about 175 million people into an area only slightly larger than Greece, which has about 10 million. Mongolia, the least densely populated sovereign country, has about 2 people per km².',
        ],
        globe: { view: [35, 60, 3], lens: 'density', highlight: ['BGD', 'MNG', 'CAN', 'AUS', 'RUS', 'SGP', 'MCO'] },
      },
      {
        h: 'A planet of cities',
        body: [
          'Since about 2007, more people have lived in towns and cities than in the countryside. Today the figure is close to 58% and still rising, fastest in Africa and South Asia.',
          'Which city is biggest depends on where you draw the edge. On most measures, the largest urban areas include Tokyo, Jakarta, Delhi, Dhaka, Shanghai, Guangzhou, Cairo, Manila, Kolkata, Seoul, Mumbai, São Paulo and Mexico City. Lagos and Kinshasa are among the fastest-growing big cities on Earth.',
        ],
        globe: { view: [20, 90, 3.2], markers: [{ lat: 35.68, lng: 139.69, label: 'Tokyo' }, { lat: -6.2, lng: 106.85, label: 'Jakarta' }, { lat: 28.61, lng: 77.21, label: 'Delhi' }, { lat: 23.81, lng: 90.41, label: 'Dhaka' }, { lat: 31.23, lng: 121.47, label: 'Shanghai' }, { lat: 30.04, lng: 31.24, label: 'Cairo' }, { lat: 6.52, lng: 3.38, label: 'Lagos' }, { lat: -4.44, lng: 15.27, label: 'Kinshasa' }, { lat: -23.55, lng: -46.63, label: 'São Paulo' }, { lat: 19.43, lng: -99.13, label: 'Mexico City' }] },
      },
      {
        h: 'Young countries and old countries',
        body: [
          'As countries get richer, they tend to pass through the same stages, called the demographic transition. First death rates fall because of clean water, vaccines and food. Birth rates stay high for a while, so the population booms. Then, as more children survive and more women are educated and work, families shrink.',
          'About 2.1 births per woman keeps a population stable. Niger has one of the highest rates, around 6, and half its people are under 16. South Korea has the lowest in the world, well under 1, and Japan, Italy and much of Europe are shrinking or ageing fast. In Japan almost 30% of people are 65 or older.',
        ],
        callout: 'Switch the map to <b>Births per woman</b> to see the pattern: high across much of Africa, low across East Asia, Europe and the Americas.',
        globe: { view: [20, 20, 3], lens: 'fertility', highlight: ['NER', 'TCD', 'SOM', 'KOR', 'JPN', 'ITA', 'ESP'] },
      },
      {
        h: 'People on the move',
        body: [
          'Migration also reshapes the map. About 300 million people, roughly 1 in 27, live outside the country they were born in. The United States has the largest number of immigrants. In the Gulf states, such as the United Arab Emirates and Qatar, foreign workers make up the large majority of the population.',
          'Many more people are forced to move. War in Syria, Ukraine and Sudan, and conflict in places like the Democratic Republic of the Congo and Myanmar, have displaced tens of millions.',
        ],
        globe: { view: [25, 40, 2.6], highlight: ['USA', 'ARE', 'QAT', 'SAU', 'DEU', 'SYR', 'UKR', 'SDN', 'COD', 'MMR'] },
      },
    ],
    terms: [
      { t: 'Population density', d: 'People per square kilometre.' },
      { t: 'Urbanisation', d: 'The growing share of people living in towns and cities.' },
      { t: 'Fertility rate', d: 'The average number of children born per woman. About 2.1 is replacement level.' },
      { t: 'Demographic transition', d: 'The shift from high birth and death rates to low ones as countries develop.' },
    ],
    check: [
      { q: 'Which country became the most populous in 2023?', a: ['India', 'China', 'Indonesia', 'United States'], explain: 'India overtook China; both have over 1.4 billion people.' },
      { q: 'About how many births per woman keep a population stable?', a: ['2.1', '1.0', '3.5', '5'], explain: 'Called replacement level.' },
      { q: 'Since about 2007, most people on Earth live…', a: ['In towns and cities', 'In villages', 'On coasts only', 'In Europe'], explain: 'Now close to 58% urban.' },
      { q: 'Which is the least densely populated sovereign country?', a: ['Mongolia', 'Canada', 'Russia', 'Australia'], explain: 'About 2 people per km².' },
      { q: 'Which country has the lowest fertility rate in the world?', a: ['South Korea', 'Japan', 'Italy', 'Germany'], explain: 'Well under one birth per woman.' },
    ],
  },
  {
    id: 'history', part: 2, title: 'How today\'s map was drawn', minutes: 15,
    summary: 'Empires, colonies, world wars and break-ups: the five centuries that produced today\'s borders.',
    sections: [
      {
        h: 'Before nation-states',
        body: [
          'For most of history, the map was made of empires, kingdoms and city-states with blurry frontiers, not neat lines. The Roman, Persian, Chinese, Mongol, Mali, Inca and Ottoman empires ruled many peoples and languages at once.',
          'The idea that the world is divided into sovereign states, each with fixed borders and no higher authority, grew in Europe. It is often traced to the Peace of Westphalia in 1648, which ended the Thirty Years\' War. Europe then exported that model to the rest of the world, mostly by force.',
        ],
        globe: { view: [45, 20, 2.2], highlight: ['DEU', 'NLD', 'FRA', 'SWE', 'AUT', 'CZE', 'ESP', 'CHE'], markers: [{ lat: 51.96, lng: 7.63, label: 'Münster: Peace of Westphalia 1648' }] },
      },
      {
        h: 'The age of European empires',
        body: [
          'From the 1490s, Spain and Portugal conquered most of the Americas. The Treaty of Tordesillas (1494) even split the non-European world between them along a line through the Atlantic, which is why Brazil speaks Portuguese and the rest of South America speaks Spanish.',
          'Britain, France, the Netherlands and Russia followed. By the early 1900s European powers and their offshoots controlled most of the world\'s land. Britain ruled about a quarter of it, including India, Canada, Australia and large parts of Africa.',
        ],
        globe: { view: [0, -30, 3], highlight: ['BRA', 'ARG', 'MEX', 'PER', 'COL', 'IND', 'CAN', 'AUS', 'ZAF', 'NGA', 'EGY', 'KEN'] },
      },
      {
        h: 'The Americas break free',
        body: [
          'The United States declared independence from Britain in 1776. Haiti followed in 1804 after the only successful slave revolt to found a nation. Between 1810 and 1825, most of Spanish America won independence in wars led by figures such as Simón Bolívar and José de San Martín. Brazil broke away from Portugal in 1822 with far less bloodshed, becoming an empire under a Portuguese prince.',
          'That is why most borders in the Americas are two centuries old, much older than most in Africa and Asia.',
        ],
        globe: { view: [0, -70, 2.6], highlight: ['USA', 'HTI', 'MEX', 'COL', 'VEN', 'ECU', 'PER', 'BOL', 'CHL', 'ARG', 'BRA', 'PRY', 'URY'] },
      },
      {
        h: 'The scramble for Africa',
        body: [
          'In 1884–85, European powers met in Berlin to set the rules for dividing Africa. No Africans were invited. Within 30 years almost the whole continent was colonised; only Ethiopia and Liberia stayed independent.',
          'Many of Africa\'s borders were drawn with rulers on maps in European capitals. Look at the straight lines through the Sahara, in Egypt, Libya, Sudan, Chad, Algeria, Mali and Mauritania. They cut across ethnic groups, trade routes and grazing lands, and divided peoples between different colonial languages.',
        ],
        globe: { view: [15, 15, 2.2], highlight: ['EGY', 'LBY', 'SDN', 'TCD', 'DZA', 'MLI', 'MRT', 'NER', 'ETH', 'LBR'], markers: [{ lat: 52.52, lng: 13.4, label: 'Berlin Conference 1884–85' }] },
      },
      {
        h: 'World wars redraw Europe and the Middle East',
        body: [
          'The First World War (1914–18) destroyed four empires: the German, Austro-Hungarian, Russian and Ottoman. New countries appeared, including Poland, Czechoslovakia, Yugoslavia, Finland, Estonia, Latvia and Lithuania.',
          'The Ottoman lands in the Middle East were split between Britain and France, following the secret Sykes–Picot agreement of 1916. The borders of Iraq, Syria, Lebanon and Jordan come from that division. After the Second World War, Germany was split in two until 1990, Korea was divided in 1945, and Israel was founded in 1948.',
        ],
        globe: { view: [42, 30, 2.2], highlight: ['POL', 'CZE', 'SVK', 'FIN', 'EST', 'LVA', 'LTU', 'IRQ', 'SYR', 'LBN', 'JOR', 'ISR', 'TUR', 'AUT', 'HUN'] },
      },
      {
        h: 'Decolonisation',
        body: [
          'After 1945 the European empires collapsed quickly. India and Pakistan became independent in 1947, in a partition that displaced about 15 million people; East Pakistan became Bangladesh in 1971. Indonesia broke from the Netherlands in 1945–49.',
          '1960 is called the Year of Africa: 17 African countries became independent that year, including Nigeria, the Democratic Republic of the Congo and most of French West Africa. The United Nations grew from 51 members in 1945 to over 150 by the 1980s.',
        ],
        globe: { view: [10, 40, 3], highlight: ['IND', 'PAK', 'BGD', 'IDN', 'NGA', 'COD', 'SEN', 'MLI', 'CIV', 'NER', 'BFA', 'TCD', 'CMR', 'MDG', 'SOM', 'TGO', 'BEN', 'GAB', 'COG', 'CAF', 'MRT'] },
      },
      {
        h: 'The last big break-ups',
        body: [
          'In 1991 the Soviet Union dissolved into 15 countries, including Russia, Ukraine, Belarus, Kazakhstan, Georgia and the Baltic states. Yugoslavia broke apart through the 1990s in a series of wars, producing Slovenia, Croatia, Bosnia and Herzegovina, Serbia, Montenegro, North Macedonia and Kosovo. Czechoslovakia split peacefully in 1993.',
          'Eritrea separated from Ethiopia in 1993, East Timor from Indonesia in 2002, and South Sudan from Sudan in 2011. South Sudan is the newest country widely recognised and the most recent member of the UN.',
        ],
        globe: { view: [48, 50, 2.6], highlight: ['RUS', 'UKR', 'BLR', 'MDA', 'EST', 'LVA', 'LTU', 'GEO', 'ARM', 'AZE', 'KAZ', 'UZB', 'TKM', 'KGZ', 'TJK', 'SVN', 'HRV', 'BIH', 'SRB', 'MNE', 'MKD', 'UNK', 'CZE', 'SVK', 'ERI', 'TLS', 'SSD'] },
      },
    ],
    terms: [
      { t: 'Sovereignty', d: 'Supreme authority over a territory, with no higher power above the state.' },
      { t: 'Colonialism', d: 'One country taking control of another territory and its people, usually to extract resources.' },
      { t: 'Decolonisation', d: 'The process by which colonies became independent, mostly between 1945 and 1975.' },
      { t: 'Partition', d: 'Splitting a territory into separate states, as with India and Pakistan in 1947.' },
    ],
    check: [
      { q: 'Why does Brazil speak Portuguese while most of South America speaks Spanish?', a: ['The Treaty of Tordesillas split the Americas between Portugal and Spain', 'Brazil was colonised later', 'Portugal bought Brazil from Spain', 'Brazilian independence leaders chose it'], explain: 'The 1494 line gave Portugal the eastern bulge of South America.' },
      { q: 'Which two African countries stayed independent during the scramble for Africa?', a: ['Ethiopia and Liberia', 'Egypt and Morocco', 'Nigeria and Ghana', 'Kenya and South Africa'], explain: 'Ethiopia defeated an Italian invasion at Adwa in 1896.' },
      { q: 'Into how many countries did the Soviet Union break in 1991?', a: ['15', '7', '10', '22'], explain: 'Russia plus 14 other republics.' },
      { q: 'What is the newest widely recognised country?', a: ['South Sudan (2011)', 'Kosovo (2008)', 'East Timor (2002)', 'Eritrea (1993)'], explain: 'It is also the UN\'s 193rd member.' },
      { q: 'The borders of Iraq, Syria and Jordan largely come from…', a: ['The Anglo-French division of Ottoman lands after 1916', 'The Berlin Conference', 'The Peace of Westphalia', 'The Soviet collapse'], explain: 'The Sykes–Picot agreement and the mandates that followed.' },
    ],
  },
  {
    id: 'states', part: 2, title: 'Countries, borders and power', minutes: 12,
    summary: 'What counts as a country, the places in dispute, and the alliances that group them.',
    sections: [
      {
        h: 'What makes a country a country?',
        body: [
          'A state needs a defined territory, a permanent population, a government and the ability to deal with other states. In practice, what matters most is recognition by other countries. There are 193 members of the United Nations, plus two observer states: the Holy See (Vatican City) and Palestine. That is why the usual answer to "how many countries are there?" is 195.',
          'A nation is different from a state: it is a people with a shared identity. Some nations have no state of their own, such as the Kurds, spread across Turkey, Iraq, Iran and Syria.',
        ],
        globe: { view: [36, 42, 2], highlight: ['TUR', 'IRQ', 'IRN', 'SYR', 'VAT', 'PSE'], markers: [{ lat: 36.5, lng: 43.5, label: 'Kurdistan region' }] },
      },
      {
        h: 'Places in dispute',
        body: [
          'Some territories are claimed by more than one government, or govern themselves without wide recognition. Taiwan runs its own affairs as the Republic of China, but only about a dozen countries formally recognise it, because China claims it. Kosovo declared independence from Serbia in 2008 and is recognised by about half the world.',
          'Western Sahara is mostly controlled by Morocco and claimed by the Sahrawi independence movement. Kashmir is divided between India, Pakistan and China. Northern Cyprus is recognised only by Turkey. Crimea, annexed by Russia in 2014, is recognised by most countries as part of Ukraine, as are other occupied areas since the 2022 invasion.',
        ],
        globe: { view: [30, 60, 3], highlight: ['TWN', 'UNK', 'SRB', 'ESH', 'MAR', 'IND', 'PAK', 'CYP', 'UKR'], markers: [{ lat: 34.5, lng: 76, label: 'Kashmir' }, { lat: 45.3, lng: 34.4, label: 'Crimea' }] },
      },
      {
        h: 'Giants and microstates',
        body: [
          'Russia is the largest country, at about 17.1 million km², some 70% larger than the next, Canada. Then come China and the United States at about 9.6–9.8 million km² each, then Brazil and Australia.',
          'At the other end, Vatican City covers under half a square kilometre. Monaco, Nauru, Tuvalu, San Marino and Liechtenstein are all tiny. San Marino claims to be the oldest surviving republic, dating to 301 AD. Some countries sit entirely inside another: Lesotho inside South Africa, and San Marino and Vatican City inside Italy.',
        ],
        globe: { view: [50, 60, 3], highlight: ['RUS', 'CAN', 'CHN', 'USA', 'BRA', 'AUS', 'LSO', 'ZAF'] },
      },
      {
        h: 'The clubs countries join',
        body: [
          'The UN Security Council has five permanent members with a veto: the United States, the United Kingdom, France, Russia and China. They are the victors of the Second World War.',
          'The European Union has 27 members that share a single market; 21 of them use the euro (Bulgaria became the 21st in 2026). NATO is a military alliance of 32 countries; Finland joined in 2023 and Sweden in 2024. The African Union has 55 members. ASEAN groups Southeast Asia and gained its 11th member, Timor-Leste, in 2025. The G7 brings together seven large advanced economies: the US, Japan, Germany, the UK, France, Italy and Canada.',
        ],
        globe: { view: [50, 10, 2], highlight: ['AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD', 'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE'] },
      },
      {
        h: 'Landlocked countries',
        body: [
          'About 44 countries have no coastline. Being landlocked makes trade more expensive, because goods must cross a neighbour to reach a port. Many of the world\'s poorest countries are landlocked, especially in Africa and Central Asia, but Switzerland and Austria show it is not destiny.',
          'Two countries are doubly landlocked, surrounded only by other landlocked countries: Liechtenstein and Uzbekistan. Kazakhstan is the largest landlocked country, and Bolivia has campaigned for over a century to regain the coastline it lost to Chile in the War of the Pacific (1879–84).',
        ],
        globe: { view: [30, 40, 3], highlight: 'landlocked' },
      },
    ],
    terms: [
      { t: 'State', d: 'A political unit with territory, population, government and sovereignty.' },
      { t: 'Nation', d: 'A people who share an identity, language or history. A nation may or may not have a state.' },
      { t: 'Enclave', d: 'A territory entirely surrounded by another, such as Lesotho.' },
      { t: 'Veto', d: 'The power of each permanent Security Council member to block a resolution alone.' },
    ],
    check: [
      { q: 'How many members does the United Nations have?', a: ['193', '195', '180', '206'], explain: 'Plus two observer states: the Holy See and Palestine.' },
      { q: 'Which of these is a permanent member of the UN Security Council?', a: ['France', 'Germany', 'Japan', 'India'], explain: 'The five are the US, UK, France, Russia and China.' },
      { q: 'Which country is entirely surrounded by South Africa?', a: ['Lesotho', 'Eswatini', 'Botswana', 'Namibia'], explain: 'Lesotho is an enclave.' },
      { q: 'Which two countries are doubly landlocked?', a: ['Liechtenstein and Uzbekistan', 'Switzerland and Austria', 'Mongolia and Nepal', 'Bolivia and Paraguay'], explain: 'Each is surrounded only by landlocked neighbours.' },
      { q: 'Which country joined NATO in 2024?', a: ['Sweden', 'Finland', 'Ukraine', 'Austria'], explain: 'Finland joined in 2023, Sweden in 2024.' },
    ],
  },
  {
    id: 'economy', part: 2, title: 'The world economy and its chokepoints', minutes: 12,
    summary: 'Who is rich and why, where resources are, and the narrow sea lanes the world depends on.',
    sections: [
      {
        h: 'Measuring an economy',
        body: [
          'Gross domestic product (GDP) is the value of everything a country produces in a year. The United States has the largest GDP, near $30 trillion, followed by China. Adjusted for what money buys locally, called purchasing power parity (PPP), China is larger.',
          'GDP per person is a better guide to living standards. Small, wealthy places such as Luxembourg, Ireland, Switzerland, Norway, Singapore and Qatar top the list. Many countries in the Sahel and Central Africa, such as Burundi, the Central African Republic and South Sudan, are at the bottom.',
        ],
        callout: 'Switch the map to <b>Income per person</b>. The difference between the richest and poorest countries is more than a hundredfold.',
        globe: { view: [25, 10, 3], lens: 'gdpPc', highlight: ['USA', 'CHN', 'LUX', 'IRL', 'CHE', 'NOR', 'SGP', 'QAT', 'BDI', 'CAF', 'SSD'] },
      },
      {
        h: 'Resources are unevenly spread',
        body: [
          'Venezuela has the largest proven oil reserves, followed by Saudi Arabia, Iran, Canada and Iraq. Russia, Iran and Qatar hold the most natural gas. The Persian Gulf region as a whole holds roughly half the world\'s proven oil.',
          'The energy transition has created a new map of critical minerals. The Democratic Republic of the Congo mines about 70% of the world\'s cobalt, used in batteries. Chile, Argentina and Bolivia form the "lithium triangle"; Australia is the largest lithium miner. China dominates rare earth elements, refining around 90% of them.',
        ],
        globe: { view: [10, 20, 3.2], highlight: ['VEN', 'SAU', 'IRN', 'CAN', 'IRQ', 'RUS', 'QAT', 'COD', 'CHL', 'ARG', 'BOL', 'AUS', 'CHN'] },
      },
      {
        h: 'The Strait of Hormuz',
        body: [
          'Between Iran and Oman, this strait is about 33 km wide at its narrowest point. Around a fifth of the world\'s oil consumption passes through it, along with much of Qatar\'s liquefied natural gas. Every time tension rises between Iran and its neighbours or the United States, oil prices react to it.',
        ],
        globe: { view: [26, 55, 1], highlight: ['IRN', 'OMN', 'ARE', 'SAU', 'QAT', 'KWT', 'IRQ', 'BHR'], markers: [{ lat: 26.57, lng: 56.25, label: 'Strait of Hormuz' }] },
      },
      {
        h: 'Malacca, Suez, Bab-el-Mandeb, Panama',
        body: [
          'The Strait of Malacca, between Malaysia, Singapore and Indonesia, is the shortest sea route between the Indian Ocean and the Pacific. Much of the oil for China, Japan and South Korea passes through it, which is one reason Singapore became one of the world\'s great ports.',
          'Ships heading from Asia to Europe pass Bab-el-Mandeb at the south end of the Red Sea, then the Suez Canal. Before 2024, around 12% of world trade used Suez. Attacks on shipping by Yemen\'s Houthi movement forced many ships to go the long way around Africa\'s Cape of Good Hope instead.',
          'The Panama Canal carries about 5% of world seaborne trade. Its locks run on fresh water from a lake, so the drought of 2023–24 forced it to cut traffic, a reminder that climate and trade are linked.',
        ],
        globe: { view: [15, 60, 3.2], highlight: ['MYS', 'SGP', 'IDN', 'EGY', 'YEM', 'DJI', 'PAN', 'ZAF'], markers: [{ lat: 2.5, lng: 101.5, label: 'Strait of Malacca' }, { lat: 12.58, lng: 43.33, label: 'Bab-el-Mandeb' }, { lat: 30.6, lng: 32.33, label: 'Suez Canal' }, { lat: 9.08, lng: -79.68, label: 'Panama Canal' }, { lat: -34.36, lng: 18.47, label: 'Cape of Good Hope' }] },
      },
      {
        h: 'Who makes what',
        body: [
          'China is the world\'s largest manufacturer, making close to a third of all manufactured goods. Taiwan makes the large majority of the world\'s most advanced computer chips, which is one reason its security matters so much to everyone else.',
          'Some countries depend on one product. Oil and gas make up the bulk of exports for Saudi Arabia, Iraq, Angola and Nigeria. Côte d\'Ivoire and Ghana grow about 60% of the world\'s cocoa. Countries that rely on a single commodity boom and bust with its price.',
        ],
        globe: { view: [15, 50, 3.2], highlight: ['CHN', 'TWN', 'SAU', 'IRQ', 'AGO', 'NGA', 'CIV', 'GHA'] },
      },
    ],
    terms: [
      { t: 'GDP', d: 'Gross domestic product: the total value of goods and services a country produces in a year.' },
      { t: 'PPP', d: 'Purchasing power parity: adjusting figures for what money actually buys in each country.' },
      { t: 'Chokepoint', d: 'A narrow passage on a major trade route, such as the Strait of Hormuz.' },
      { t: 'Commodity dependence', d: 'When a country relies on one or two raw materials for most of its exports.' },
    ],
    check: [
      { q: 'Which country has the largest proven oil reserves?', a: ['Venezuela', 'Saudi Arabia', 'Russia', 'United States'], explain: 'Mostly heavy oil in the Orinoco belt.' },
      { q: 'About how much of the world\'s oil consumption passes through the Strait of Hormuz?', a: ['About a fifth', 'About half', 'About 2%', 'Almost all'], explain: 'Between Iran and Oman.' },
      { q: 'Which country mines about 70% of the world\'s cobalt?', a: ['Democratic Republic of the Congo', 'Chile', 'Australia', 'China'], explain: 'Cobalt is used in lithium-ion batteries.' },
      { q: 'Which strait links the Indian Ocean and the Pacific next to Singapore?', a: ['Strait of Malacca', 'Strait of Hormuz', 'Bosporus', 'Bab-el-Mandeb'], explain: 'One of the busiest shipping lanes on Earth.' },
      { q: 'Which two countries grow about 60% of the world\'s cocoa?', a: ['Côte d\'Ivoire and Ghana', 'Brazil and Ecuador', 'Indonesia and Malaysia', 'Nigeria and Cameroon'], explain: 'Both in West Africa\'s Gulf of Guinea.' },
    ],
  },
  {
    id: 'culture', part: 2, title: 'Languages and beliefs', minutes: 11,
    summary: 'The families of languages, the reach of the great religions, and how empires spread both.',
    sections: [
      {
        h: 'Seven thousand languages',
        body: [
          'About 7,000 languages are spoken today, but they are very unevenly shared. Around 40% are endangered, and half the world speaks one of just two dozen languages. Papua New Guinea alone has over 800 languages, more than any other country.',
          'By number of native speakers, the largest are Mandarin Chinese, Spanish, English, Hindi and Arabic. Counting people who speak it as a second language, English has the most speakers of all, around 1.5 billion.',
        ],
        globe: { view: [0, 145, 1.6], highlight: ['PNG', 'IDN', 'NGA', 'IND', 'CMR'] },
      },
      {
        h: 'Language families',
        body: [
          'Languages descend from common ancestors, like branches of a tree. The Indo-European family is spoken by nearly half of humanity and runs from Iceland to India: English, Spanish, Russian, Hindi, Persian and Bengali are all related. The Sino-Tibetan family includes Chinese and Burmese.',
          'Niger–Congo has the most languages of any family, over 1,500, including Swahili, Yoruba and Zulu. Afro-Asiatic includes Arabic, Hebrew, Amharic and Hausa. The Austronesian family spread by canoe from Taiwan more than halfway around the globe, from Madagascar to Hawaii and Easter Island. Some languages have no known relatives at all, such as Basque, spoken in Spain and France.',
        ],
        globe: { view: [-5, 90, 3.5], highlight: ['MDG', 'IDN', 'PHL', 'MYS', 'TWN', 'NZL', 'FJI', 'WSM', 'TON'], markers: [{ lat: -27.1, lng: -109.35, label: 'Easter Island' }, { lat: 19.9, lng: -155.6, label: 'Hawaii' }, { lat: 43.1, lng: -2.3, label: 'Basque Country' }] },
      },
      {
        h: 'Empires spread languages',
        body: [
          'Colonial empires left their languages behind. Spanish is the main language of 18 countries in the Americas. Brazil is by far the largest Portuguese-speaking country, with more speakers than Portugal many times over. French is an official language in over 20 African countries; Kinshasa is one of the largest French-speaking cities in the world. English is official in India, Nigeria, South Africa and dozens more.',
          'Earlier empires did the same. Arabic spread with Islam from the 7th century across North Africa and the Middle East. Russian spread across Central Asia under the Tsars and the Soviet Union.',
        ],
        globe: { view: [5, -30, 3.3], highlight: ['MEX', 'COL', 'ARG', 'PER', 'VEN', 'CHL', 'ECU', 'GTM', 'CUB', 'BOL', 'DOM', 'HND', 'PRY', 'SLV', 'NIC', 'CRI', 'PAN', 'URY', 'BRA', 'PRT', 'ESP', 'AGO', 'MOZ'] },
      },
      {
        h: 'The great religions',
        body: [
          'Christianity is the largest religion, with about 2.3 billion followers. It is spread across every continent, and sub-Saharan Africa now has more Christians than Europe. Islam, with about 2 billion, is the fastest growing major religion. The country with the most Muslims is Indonesia, followed by Pakistan and India, not a country in the Arab world.',
          'Hinduism has about 1.2 billion followers, about 95% of them in India, with Nepal also Hindu-majority. Buddhism has around 320 million and is the main religion in Thailand, Myanmar, Sri Lanka, Cambodia, Laos and Bhutan. About a quarter of people are religiously unaffiliated, especially in China, Japan, and parts of Europe. Israel is the only Jewish-majority state.',
        ],
        globe: { view: [15, 80, 2.8], highlight: ['IDN', 'PAK', 'IND', 'BGD', 'NPL', 'THA', 'MMR', 'LKA', 'KHM', 'LAO', 'BTN', 'ISR', 'SAU'] },
      },
      {
        h: 'Holy places on the map',
        body: [
          'Some small places carry huge weight. Jerusalem is sacred to Judaism, Christianity and Islam. Mecca and Medina in Saudi Arabia are the holiest sites of Islam, and millions make the pilgrimage to Mecca each year. Varanasi on the Ganges is among the holiest cities in Hinduism. Bodh Gaya in India is where the Buddha is said to have reached enlightenment. Vatican City, the smallest country on Earth, is the centre of the Catholic Church.',
        ],
        globe: { view: [27, 50, 2.2], markers: [{ lat: 31.78, lng: 35.23, label: 'Jerusalem' }, { lat: 21.42, lng: 39.83, label: 'Mecca' }, { lat: 24.47, lng: 39.61, label: 'Medina' }, { lat: 25.32, lng: 83.01, label: 'Varanasi' }, { lat: 24.7, lng: 84.99, label: 'Bodh Gaya' }, { lat: 41.9, lng: 12.45, label: 'Vatican City' }] },
      },
    ],
    terms: [
      { t: 'Language family', d: 'A group of languages descended from a common ancestor, such as Indo-European.' },
      { t: 'Language isolate', d: 'A language with no known relatives, such as Basque.' },
      { t: 'Lingua franca', d: 'A shared language used between people with different first languages, such as English or Swahili.' },
      { t: 'Official language', d: 'A language given legal status for government use. Many countries have several.' },
    ],
    check: [
      { q: 'Which country has the most Muslims?', a: ['Indonesia', 'Saudi Arabia', 'Egypt', 'Iran'], explain: 'Followed by Pakistan and India.' },
      { q: 'Which country has the most languages?', a: ['Papua New Guinea', 'India', 'Nigeria', 'China'], explain: 'Over 800 languages.' },
      { q: 'Which language family includes English, Hindi and Persian?', a: ['Indo-European', 'Sino-Tibetan', 'Afro-Asiatic', 'Austronesian'], explain: 'Spoken by nearly half of humanity.' },
      { q: 'The Austronesian family stretches from Madagascar to…', a: ['Easter Island', 'Japan', 'Chile\'s mainland', 'Alaska'], explain: 'Spread by ocean voyagers from Taiwan.' },
      { q: 'About what share of Hindus live in India?', a: ['About 95%', 'About 50%', 'About 70%', 'About 30%'], explain: 'Nepal is the other Hindu-majority country.' },
    ],
  },
];

