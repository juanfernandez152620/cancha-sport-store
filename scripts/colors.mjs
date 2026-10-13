// Maps Nike AR colour names ("Negro/Azul Universitario", "Vela", "Gris Humo Oscuro"…) to hex values
// for painting garments on the outfit mannequin. Rules run in order: first match wins.
const RULES = [
  // compound names whose first word would otherwise hit the wrong family
  [/violeta platino|platino violeta|platino tinte|tinte platino/, '#D9D3E6'],
  [/particula lunar|particulas de luna|polvo de foton|polvo foton/, '#D7D9DC'],
  [/vidrio marino|cristal marino|sea glass/, '#BFE8D2'],
  [/coral marino|coral lavado/, '#FF7A6B'],
  [/tinte carmesi|carmesi claro|lt crimson|tinte melon/, '#F7A3A6'],
  [/magenta clar|magenta ligera|magenta de luz/, '#F28CC6'],
  [/rosa perla|perla suave/, '#F2D3D6'],
  [/fucsia/, '#E5258A'],
  [/cobre blanco|blanco perla/, '#ECE4D2'],
  // greys that contain other colour words must come before the chromatic families
  [/humo claro|gris claro|platino|plata|tiza|fantasma|phantom|niebla|polar|iglu|vapor|aluminio|cromo|peltre|gris perla|luz de calcio/, '#C9CCD1'],
  [/antracita|gris humo oscuro|gris oscuro|gris hierro|hierro|pizarra|punta de lapiz|grafito|carbon|metalico gris oscuro|gris trueno|gris pizarra|adoquin|ironstone|piedra de hierro/, '#3B3F46'],
  [/gris lobo|wolf|gris frio|gris neutro|gris vasto|gris azulado|gris aceite|ceniza|gris universitario|college grey|gris futbol|gris de futbol|gris humo|brezo|heather|jaspeado|gris taupo|gris niebla|gris de particulas|gris peltre|gris|tatuaje|tattoo|piedra enigma|mineral$/, '#8E9299'],
  [/off.?noir|fuera de noir|negro|black|negra|pulso negro|espuma negra|noche/, '#15161A'],
  // navy before generic blue
  [/marino|medianoche|midnight|navy|obsidiana|armada|ennegrecido|azul trueno|trueno azul|indigo|abismo|azul vacio|vacio azul|azul eclipse|azul profundo|marina|azul mistico|mistico marino|fechas misticas|tormenta/, '#1A2445'],
  [/universitario azul|azul universitario|university blue|celeste|celestin|azul difuso|hidrogeno|baltico|glacial|azul claro|foto azul claro|azul frio|azul ahumado|azul gris|cristal azul|azul armeria|armeria|azul cometa|lyon blue|denim turquesa|azul medio claro|tinte azul/, '#7FB2E5'],
  [/royal|real|hiperazul|azul racer|racer azul|azul carrera|azul brillante|azul senal|azul verdadero|azul frances|azul de corte|azul cancha|escuadron|lapislazuli|game royal|azul rayo|furia azul|obra azul|cubo oceano/, '#2449C9'],
  [/zafiro|azul|blue/, '#2F62D8'],
  [/turquesa|jade|aqua|cian/, '#1FB3AE'],
  [/menta|apenas verde|verde apenas|vidrio marino|cristal marino|sea glass|espuma de algas|verde ligero|pistacho|salvia|cardo|espuma menta/, '#BFE8D2'],
  [/volt|voltio|lima|limon|citric|citron|verde volt|relampago|lightning|amarillo sonico/, '#D9FF1E'],
  [/abeto|malaquita|verde pino|bosque|verde medianoche|jungla|secuoya|trebol|verde azulado mineral|verde mineral|verde de la suerte|estadio verde/, '#0F5A43'],
  [/oliva|olive|militar|alga|aura oliva|cargo|camuflaje|verde arcilla|marron verdoso|musgo|liquen|caqui oliva|espárrago|esparrago|verde vintage|cactus|aura de liquenes|pacific moss/, '#5E6440'],
  [/verde luminoso|verde intenso|verde esmaltado/, '#2DE06A'],
  [/verde|green/, '#1F9A4E'],
  [/amarillo|yellow|canario|maiz|maize|azufre/, '#FFD31A'],
  [/oro|dorado|gold|topacio|ambar|ocre/, '#C99A2E'],
  [/naranja|orange|seguridad|brasa|lava|melon|monarca|laser|resplandor de lava|cobre/, '#FF6A1A'],
  [/burdeos|bordo|burgundy|granate|remolacha|vino|oporto|pasa|uva|sombrio apagado|broche/, '#6B1D33'],
  [/coral|melocoton|agata|salmon/, '#FF7A6B'],
  [/magenta|fucsia|hiper ?rosa|rosa hiper|rayo rosa|flamenco|rosa enérgico|rosa energico|rosa alegre/, '#E5258A'],
  [/rosa|pink|peonia|hechizo|espuma rosa|particula|hortensia|orquidea|rosado|gelado|amanecer|junco/, '#F39BC0'],
  [/carmesi|crimson|rojo|red|gimnasio|chile|picante|pasion|fuego|sedimento|varsity|nebulosa|solar|copa/, '#D3202E'],
  [/lila|lavanda|bruma violeta|niebla violeta|violeta platino|platino violeta|mineral violeta|mineral de violeta|cardo/, '#BBA6E6'],
  [/violeta|morado|purpura|purple|amatista|cosmos|viotech|persa/, '#6E3FC4'],
  [/marron|cafe|chocolate|barroco|vison|terciopelo|aterciopelado|fauna|cueva|orewood|madera|nuez|avellana oscura|tierra|leyenda marron/, '#6A4632'],
  [/caqui|khaki|beige|arena|tostado|paracaidas|canamo|duna|desierto|trigo|malta|avellana|natural|hilo|lino|lienzo|camel/, '#C8B48E'],
  [/vela|sail|marfil|hueso|crema|leche de coco|muselina|blanco roto|cobre blanco|lila blanqueada/, '#ECE4D2'],
  [/blanco|white|blanca|cumbre|summit|cima|explosion blanca/, '#F3F3F1'],
];

const strip = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

/** Returns a hex for one colour name, or null when no rule matches. */
export function colorHex(name) {
  const n = strip(name || '');
  if (!n || /multi/.test(n)) return null;
  for (const [re, hex] of RULES) if (re.test(n)) return hex;
  return null;
}

/** Splits "Negro/Azul Universitario/Blanco" and resolves primary + accent colours. */
export function paletteFor(colorName) {
  const parts = (colorName || '')
    .split(/[\/,]| y | con /i)
    .map((s) => s.trim())
    .filter(Boolean);
  const hexes = parts.map(colorHex).filter(Boolean);
  const primary = hexes[0] ?? null;
  const accent = hexes.find((h) => h !== primary) ?? null;
  return { primary, accent, known: Boolean(primary) };
}

/** A broad family used for colour filters in listings and the outfit quiz. */
export function familyOf(hex) {
  const map = {
    '#D9D3E6': 'violeta', '#D7D9DC': 'gris', '#F7A3A6': 'rosa', '#F28CC6': 'rosa', '#F2D3D6': 'rosa',
    '#C9CCD1': 'gris', '#3B3F46': 'gris', '#8E9299': 'gris', '#15161A': 'negro', '#1A2445': 'azul',
    '#7FB2E5': 'celeste', '#2449C9': 'azul', '#2F62D8': 'azul', '#1FB3AE': 'verde', '#BFE8D2': 'verde',
    '#D9FF1E': 'fluor', '#0F5A43': 'verde', '#5E6440': 'verde', '#2DE06A': 'verde', '#1F9A4E': 'verde',
    '#FFD31A': 'amarillo', '#C99A2E': 'amarillo', '#FF6A1A': 'naranja', '#6B1D33': 'rojo', '#FF7A6B': 'naranja',
    '#E5258A': 'rosa', '#F39BC0': 'rosa', '#D3202E': 'rojo', '#BBA6E6': 'violeta', '#6E3FC4': 'violeta',
    '#6A4632': 'marron', '#C8B48E': 'beige', '#ECE4D2': 'blanco', '#F3F3F1': 'blanco',
  };
  return map[hex] ?? 'otros';
}
