// Normalises the Nike AR scrape (data/nike-raw.json) into the store's catalogue.
//   node scripts/build-data.mjs
// Outputs:
//   src/data/products.json        full catalogue, read only on the server
//   public/data/l/<gender>-<dept>.json, public/data/s/<sport>.json, public/data/outfit/<gender>.json,
//   public/data/search.json       compact lists the browser loads on demand
import fs from 'node:fs';
import path from 'node:path';
import { paletteFor, familyOf } from './colors.mjs';
import { STORE_LINE } from './store-line.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/nike-raw.json'), 'utf8'));
const scrapedAt = new Date(raw.scrapedAt);

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

// ---------- sports ----------
function mapSport(v) {
  const n = norm(v);
  if (!n || /americano|gridiron/.test(n)) return null;
  if (/futbol|soccer|futsal|^football$/.test(n)) return 'futbol';
  if (/tenis|tennis|padel|paddle|pickleball/.test(n)) return 'tenis';
  if (/voley|volley|voleibol/.test(n)) return 'voley';
  if (/hockey/.test(n)) return 'hockey';
  if (/running|correr|trail|atletismo|carrera|road racing|sendero|campo traviesa|caminata|caminar/.test(n)) return 'running';
  if (/basquet|basket|basquetbol/.test(n)) return 'basquet';
  if (/entrenamiento|training|gym|gimnas|crossfit|workout|ejercicio|funcional|hiit|fuerza|pesas|yoga|pilates|danza|baile|boxing|cheer|intervalos|young athletes/.test(n)) return 'training';
  if (/golf/.test(n)) return 'golf';
  if (/natacion|swim/.test(n)) return 'natacion';
  if (/rugby/.test(n)) return 'rugby';
  if (/acg|senderismo|explorar|outdoor/.test(n)) return 'outdoor';
  if (/skate|nike sb/.test(n)) return 'skate';
  if (/moda|estilo de vida|lifestyle|sportswear|jordan/.test(n)) return 'lifestyle';
  return null;
}

function sportsOf(p, typeKey) {
  const out = [];
  const add = (s) => s && !out.includes(s) && out.push(s);
  for (const v of p.sport) add(mapSport(v));
  const text = norm(`${p.name} ${p.sub} ${p.clusters.join(' ')} ${p.coll.join(' ')}`);
  if (typeKey === 'botines' || typeKey === 'canilleras' || /futbol|arquero|goalkeeper|clubes de futbol/.test(text)) add('futbol');
  if (/volleyball|voley/.test(text)) add('voley');
  if (/hockey/.test(text)) add('hockey');
  if (/nikecourt|tenis/.test(text)) add('tenis');
  if (typeKey === 'pelota' && !out.length) add('futbol');
  return out;
}

// ---------- taxonomy ----------
function genderOf(p) {
  const g = norm(p.gender);
  const c = norm(p.cat);
  if (/nin/.test(g) || /\/nin/.test(c)) return null; // kids are out of scope
  if (g === 'hombre' || g === 'mujer' || g === 'unisex') return g;
  if (c.includes('/hombre/')) return 'hombre';
  if (c.includes('/mujer/')) return 'mujer';
  return 'unisex';
}

function typeKeyOf(p) {
  const t = norm(p.type);
  if (t) return t;
  const seg = norm(p.cat).split('/').filter(Boolean).pop() ?? '';
  return seg.replace(/s$/, '');
}

const ROPA = {
  remera: 'remeras', musculosa: 'remeras', chomba: 'remeras', camisa: 'remeras', body: 'remeras',
  camiseta: 'camisetas',
  'tops-deportivos': 'tops-deportivos',
  'shorts-bermudas': 'shorts', boxer: 'shorts',
  'pollera-vestido': 'polleras-vestidos',
  pantalon: 'pantalones',
  calzas: 'calzas',
  buzo: 'buzos', conjunto: 'buzos',
  campera: 'camperas', chaleco: 'camperas',
  'traje de bano': 'trajes-de-bano',
  medias: 'medias',
  gorra: 'gorras', gorro: 'gorras', piluso: 'gorras',
};

const ACCESORIOS = {
  pelota: 'pelotas',
  guantes: 'guantes', 'guantes de entrenamiento': 'guantes',
  canilleras: 'canilleras',
  mochila: 'bolsos-mochilas', bolso: 'bolsos-mochilas', rinonera: 'bolsos-mochilas', bandolera: 'bolsos-mochilas',
  'bolso de mano': 'bolsos-mochilas', valijas: 'bolsos-mochilas',
  botellas: 'botellas',
  vinchas: 'vinchas-munequeras', munequeras: 'vinchas-munequeras', cuello: 'vinchas-munequeras', balaclava: 'vinchas-munequeras',
  rodilleras: 'proteccion', tobilleras: 'proteccion', manga: 'proteccion',
  antiparras: 'natacion', 'gorro de natacion': 'natacion', toallas: 'natacion',
  mat: 'entrenamiento', soga: 'entrenamiento', 'banda elastica': 'entrenamiento',
  'rodillo de recuperacion': 'entrenamiento', inflador: 'entrenamiento',
  billetera: 'otros', llavero: 'otros', 'funda de celular': 'otros', cinturon: 'otros', manta: 'otros',
};

function placeOf(typeKey, sports) {
  if (typeKey === 'calzado' || typeKey === 'botines' || typeKey === 'sandalias-ojotas') {
    let sub = 'urbanas';
    const primary = sports[0];
    if (typeKey === 'botines') sub = 'botines';
    else if (typeKey === 'sandalias-ojotas') sub = 'sandalias';
    else if (primary === 'running') sub = 'running';
    else if (primary === 'basquet') sub = 'basquet';
    else if (['futbol', 'tenis', 'voley', 'hockey', 'training', 'golf', 'outdoor', 'rugby'].includes(primary)) sub = 'deportivas';
    return { dept: 'calzado', sub };
  }
  if (ROPA[typeKey]) return { dept: 'ropa', sub: ROPA[typeKey] };
  if (ACCESORIOS[typeKey]) return { dept: 'accesorios', sub: ACCESORIOS[typeKey] };
  return null;
}

// ---------- outfit garments: [slot, shape] ----------
function garmentOf(typeKey, text, gender) {
  switch (typeKey) {
    case 'gorra':
      return /visera/.test(text) ? ['head', 'visor'] : ['head', 'cap'];
    case 'gorro':
    case 'piluso':
      return /piluso|bucket/.test(text) ? ['head', 'bucket'] : ['head', 'beanie'];
    case 'vinchas':
      return ['head', 'headband'];
    case 'remera':
      if (/manga larga|long.?sleeve|1\/2 cierre|medio cierre|half.?zip/.test(text)) return ['top', 'longsleeve'];
      if (/crop/.test(text)) return ['top', 'crop'];
      return ['top', 'tee'];
    case 'camiseta':
      return /manga larga|arquer|goalkeeper/.test(text) ? ['top', 'jerseyLong'] : ['top', 'jersey'];
    case 'musculosa':
      return ['top', 'tank'];
    case 'chomba':
    case 'camisa':
      return ['top', 'polo'];
    case 'tops-deportivos':
      return ['top', 'bra'];
    case 'buzo':
      if (/capucha|hoodie|hoody/.test(text)) return ['outer', 'hoodie'];
      if (/cierre|zip/.test(text)) return ['outer', 'halfzip'];
      return ['outer', 'crew'];
    case 'campera':
      if (/acolchad|puffer|pluma|relleno|parka/.test(text)) return ['outer', 'puffer'];
      if (/capucha|hood|rompeviento|windrunner|impermeable|repel/.test(text)) return ['outer', 'windbreaker'];
      return ['outer', 'jacket'];
    case 'chaleco':
      return ['outer', 'vest'];
    case 'shorts-bermudas':
      if (gender === 'mujer' && /nike pro|biker|ciclista|calza/.test(text)) return ['bottom', 'bikeshorts'];
      return ['bottom', 'shorts'];
    case 'pantalon':
      return /jogger|cargo|puno|tech fleece/.test(text) ? ['bottom', 'joggers'] : ['bottom', 'pants'];
    case 'calzas':
      return /corta|short|biker|ciclista|\d+ ?cm|\d+"/.test(text) ? ['bottom', 'bikeshorts'] : ['bottom', 'leggings'];
    case 'pollera-vestido':
      return /vestido/.test(text) ? null : ['bottom', 'skirt'];
    case 'medias':
      if (/invisible|no.?show|tobiller|cortas|low|ankle|quarter/.test(text)) return ['socks', 'ankle'];
      if (/futbol|soccer|matchfit|squad|strike|altas|largas|knee|over.?the.?calf|otc/.test(text)) return ['socks', 'high'];
      return ['socks', 'crew'];
    case 'calzado':
      return /\bhigh\b|\bmid\b|bota|boot/.test(text) ? ['shoes', 'hightop'] : ['shoes', 'sneaker'];
    case 'botines':
      return ['shoes', 'cleats'];
    case 'sandalias-ojotas':
      return ['shoes', 'slides'];
    case 'guantes':
      return /arquer|goalkeeper|\bgk\b|grip|match|portero|futbol/.test(text) ? ['hands', 'gkgloves'] : ['hands', 'gloves'];
    case 'guantes de entrenamiento':
      return ['hands', 'gloves'];
    case 'munequeras':
      return ['hands', 'wristband'];
    case 'canilleras':
      return ['protect', 'shinguards'];
    case 'rodilleras':
      return ['protect', 'kneepads'];
    case 'pelota':
      if (/volley|voley/.test(text)) return ['gear', 'volleyball'];
      if (/basket|basquet/.test(text)) return ['gear', 'basketball'];
      return ['gear', 'football'];
    default:
      return null;
  }
}

const TYPE_LABEL = {
  remera: 'Remera', musculosa: 'Musculosa', chomba: 'Chomba', camisa: 'Camisa', body: 'Body', camiseta: 'Camiseta',
  'tops-deportivos': 'Top deportivo', 'shorts-bermudas': 'Short', boxer: 'Boxer', 'pollera-vestido': 'Pollera',
  pantalon: 'Pantalón', calzas: 'Calza', buzo: 'Buzo', conjunto: 'Conjunto', campera: 'Campera', chaleco: 'Chaleco',
  'traje de bano': 'Traje de baño', medias: 'Medias', gorra: 'Gorra', gorro: 'Gorro', piluso: 'Piluso',
  calzado: 'Zapatillas', botines: 'Botines', 'sandalias-ojotas': 'Ojotas', pelota: 'Pelota', guantes: 'Guantes',
  'guantes de entrenamiento': 'Guantes', canilleras: 'Canilleras', mochila: 'Mochila', bolso: 'Bolso',
  rinonera: 'Riñonera', bandolera: 'Bandolera', 'bolso de mano': 'Bolso', valijas: 'Valija', botellas: 'Botella',
  vinchas: 'Vincha', munequeras: 'Muñequera', cuello: 'Cuello', balaclava: 'Balaclava', rodilleras: 'Rodilleras',
  tobilleras: 'Tobillera', manga: 'Manga', antiparras: 'Antiparras', 'gorro de natacion': 'Gorro de natación',
  toallas: 'Toalla', mat: 'Mat', soga: 'Soga', 'banda elastica': 'Banda elástica',
  'rodillo de recuperacion': 'Rodillo', inflador: 'Inflador', billetera: 'Billetera', llavero: 'Llavero',
  'funda de celular': 'Funda', cinturon: 'Cinturón', manta: 'Manta',
};

// ---------- sizes: the scrape lists them in SKU order (2XL, XL, L, M…) ----------
const LETTER = ['XXS', '2XS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'XXXL', '4XL', '1X', '2X', '3X'];
function sizeRank(s) {
  const u = String(s).toUpperCase().trim();
  const base = u.split(/[-/ ]/)[0];
  const k = LETTER.indexOf(base);
  if (k >= 0) return k + (u.length > base.length ? 0.5 : 0);
  const h = u.match(/^H\s*([\d.]+)/); // "H 8 / M 9.5" shoe sizes
  if (h) return 100 + parseFloat(h[1]);
  const n = parseFloat(u.replace(',', '.'));
  return Number.isNaN(n) ? 1000 : 100 + n;
}

// ---------- build ----------
const products = [];
const seenSlugs = new Set();
const unknownColors = {};

for (const p of raw.products) {
  if (!p.price || !p.imgs?.length || !p.avail) continue;
  const gender = genderOf(p);
  if (!gender) continue;
  if (/para nin|\bnin[oa]s?\b|infantil|bebe|kids/.test(norm(p.sub))) continue;
  const typeKey = typeKeyOf(p);
  const sports = sportsOf(p, typeKey);
  const place = placeOf(typeKey, sports);
  if (!place) continue;
  if (seenSlugs.has(p.slug)) continue;
  seenSlugs.add(p.slug);

  const text = norm(`${p.name} ${p.sub}`);
  const pal = paletteFor(p.colorName);
  if (!pal.known) unknownColors[p.colorName] = (unknownColors[p.colorName] ?? 0) + 1;
  const hx = pal.primary ?? '#8E9299';
  const hx2 = pal.accent ?? (hx === '#15161A' ? '#F3F3F1' : '#15161A');

  // one entry per size label, available if any SKU of that size is
  const sizes = [];
  for (const s of p.sizes) {
    const label = String(s.s).replace(/^Talle:\s*/i, '').split(' Color')[0].trim();
    const prev = sizes.find((x) => x.s === label);
    if (prev) prev.a = prev.a || s.a;
    else sizes.push({ s: label, a: s.a });
  }

  sizes.sort((a, b) => sizeRank(a.s) - sizeRank(b.s));

  const daysOld = (scrapedAt - new Date(p.release)) / 86400000;
  const clusters = p.clusters.map(norm);
  const flags = [];
  if (clusters.includes('lanzamientos') || clusters.includes('nueva coleccion') || daysOld < 60) flags.push('n');
  if (p.listPrice > p.price) flags.push('s');
  if (clusters.some((c) => /mas vendidos|lo mas buscado/.test(c))) flags.push('b');

  products.push({
    id: p.id,
    s: p.slug,
    n: p.name,
    t: p.sub.replace(/\s+/g, ' ').trim(),
    g: gender,
    d: place.dept,
    c: place.sub,
    ty: TYPE_LABEL[typeKey] ?? p.type,
    sp: sports,
    p: Math.round(p.price),
    lp: Math.round(p.listPrice || p.price),
    im: p.imgs.map((i) => `${i.id}/${i.f}`),
    cn: p.colorName,
    hx,
    hx2,
    fm: familyOf(hx),
    sz: sizes.map((x) => x.s),
    sa: sizes.map((x) => (x.a ? '1' : '0')).join(''),
    f: flags.join(''),
    gs: garmentOf(typeKey, text, gender),
    ref: p.ref,
    desc: p.desc,
    src: p.link,
  });
}

// the store's own line fills the gear Nike AR does not sell (hockey sticks, rackets, tennis balls…)
for (const item of STORE_LINE) products.push({ ...item, fm: familyOf(item.hx) });

// newest first is the default order everywhere
products.sort((a, b) => (b.f.includes('n') ? 1 : 0) - (a.f.includes('n') ? 1 : 0));

// ---------- write ----------
const write = (rel, data) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data));
  return fs.statSync(file).size;
};

// browser lists drop the long fields (description, reference, source link)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const card = ({ desc, ref, src, im, ...rest }) => ({ ...rest, im: im.slice(0, 3) });
const report = {};

// The dress-up only needs a curated slice: sport-tagged items first, then launches and best sellers.
const FOCUS = ['futbol', 'tenis', 'voley', 'hockey'];
const OUTFIT_EXTRAS = ['cl-hk-09', 'cl-hk-10'];
const CAP = { shoes: 140, top: 140, bottom: 110, outer: 70, head: 40, socks: 30, hands: 30, protect: 99, gear: 99 };
const score = (x) => (x.sp.some((s) => FOCUS.includes(s)) ? 4 : 0) + (x.f.includes('n') ? 2 : 0) + (x.f.includes('b') ? 1 : 0);
function outfitPick(list) {
  const bySlot = {};
  for (const x of list) (bySlot[x.gs?.[0] ?? 'extra'] ??= []).push(x);
  return Object.entries(bySlot).flatMap(([slot, xs]) => xs.sort((a, b) => score(b) - score(a)).slice(0, CAP[slot] ?? 60));
}
const outfitCard = (x) => ({ ...card(x), im: x.im.slice(0, 1) });

report['src/data/products.json'] = write('src/data/products.json', products);

for (const g of ['hombre', 'mujer']) {
  for (const d of ['ropa', 'calzado', 'accesorios']) {
    const list = products.filter((x) => (x.g === g || x.g === 'unisex') && x.d === d).map(card);
    report[`l/${g}-${d}`] = write(`public/data/l/${g}-${d}.json`, list);
  }
  const outfit = outfitPick(products.filter((x) => (x.gs || OUTFIT_EXTRAS.includes(x.id)) && (x.g === g || x.g === 'unisex'))).map(outfitCard);
  report[`outfit/${g}`] = write(`public/data/outfit/${g}.json`, outfit);
}

for (const sp of ['futbol', 'tenis', 'voley', 'hockey', 'running', 'training', 'basquet']) {
  const list = products.filter((x) => x.sp.includes(sp)).map(card);
  report[`s/${sp}`] = write(`public/data/s/${sp}.json`, list);
}

report['search'] = write(
  'public/data/search.json',
  products.map((x) => ({ s: x.s, n: x.n, t: x.t, g: x.g, ty: x.ty, p: x.p, lp: x.lp, im: x.im[0], cn: x.cn })),
);

const count = (fn) => {
  const m = {};
  for (const x of products) for (const k of [].concat(fn(x))) m[k] = (m[k] ?? 0) + 1;
  return m;
};
console.log('products', products.length);
console.log('by gender', count((x) => x.g));
console.log('by place', count((x) => `${x.d}/${x.c}`));
console.log('by sport', count((x) => x.sp));
console.log('garments', count((x) => (x.gs ? x.gs.join(':') : 'none')));
console.log('unknown colours', Object.keys(unknownColors).length, Object.entries(unknownColors).sort((a, b) => b[1] - a[1]).slice(0, 40));
console.log('files', Object.fromEntries(Object.entries(report).map(([k, v]) => [k, `${Math.round(v / 1024)} KB`])));
