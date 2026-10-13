// Draws the product photos for the store's own gear line as SVG "studio shots".
//   node scripts/build-gear-svgs.mjs
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '../public/gear');
fs.mkdirSync(OUT, { recursive: true });

const frame = (body, shadow = '<ellipse cx="300" cy="520" rx="190" ry="20" fill="#000" opacity=".12"/>') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
<defs>
  <radialGradient id="bg" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#FAFBFC"/><stop offset="1" stop-color="#E7EAEF"/></radialGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".45" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<rect width="600" height="600" fill="url(#bg)"/>
${shadow}
${body}
</svg>`;

// ---------- hockey stick ----------
const stick = (main, accent, grip = '#1b1b1f') => frame(`
<g transform="rotate(28 300 300)">
  <path d="M300 40 L300 430 C300 500 268 532 226 532 C190 532 176 502 196 484 C214 470 238 486 250 470" fill="none" stroke="${main}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M300 40 L300 430 C300 500 268 532 226 532 C190 532 176 502 196 484" fill="none" stroke="url(#sheen)" stroke-width="30" stroke-linecap="round"/>
  <rect x="285" y="34" width="30" height="150" rx="15" fill="${grip}"/>
  ${Array.from({ length: 9 }, (_, i) => `<path d="M285 ${52 + i * 15} L315 ${44 + i * 15}" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>`).join('')}
  <rect x="285" y="210" width="30" height="16" fill="${accent}"/>
  <rect x="285" y="236" width="30" height="6" fill="${accent}"/>
  <path d="M285 300 L315 360 L315 392 L285 332 Z" fill="${accent}"/>
  <path d="M300 410 C300 480 276 512 236 516" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>
  <text x="300" y="300" transform="rotate(-90 300 300)" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-style="italic" font-size="21" fill="${accent === main ? '#111' : accent}" letter-spacing="2">CANCHA</text>
</g>`, '<ellipse cx="300" cy="540" rx="210" ry="18" fill="#000" opacity=".12"/>');

// ---------- hockey ball ----------
const bocha = (fill, dimples) => frame(`
<circle cx="300" cy="290" r="170" fill="${fill}"/>
${dimples
    ? Array.from({ length: 60 }, (_, i) => {
        const a = i * 2.39996, r = 150 * Math.sqrt((i + 0.5) / 60);
        const x = 300 + r * Math.cos(a), y = 290 + r * Math.sin(a), s = 13 * (1 - (r / 170) ** 2 * 0.55);
        return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${s.toFixed(1)}" ry="${(s * 0.85).toFixed(1)}" fill="#000" opacity=".08"/>`;
      }).join('')
    : ''}
<circle cx="300" cy="290" r="170" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="4"/>
<ellipse cx="240" cy="210" rx="60" ry="38" fill="#fff" opacity=".55" transform="rotate(-30 240 210)"/>`);

// ---------- shin guards ----------
const shin = (main, accent) => {
  const one = (x) => `<g transform="translate(${x} 0)">
    <path d="M0 110 C0 80 30 64 70 64 C110 64 140 80 140 110 L132 360 C130 384 114 398 92 400 L48 400 C26 398 10 384 8 360 Z" fill="${main}"/>
    <path d="M20 120 C40 100 100 100 120 120" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
    <path d="M70 160 L70 330" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>
    <path d="M18 410 C18 470 122 470 122 410 L122 400 L18 400 Z" fill="${main}" opacity=".85"/>
    <circle cx="70" cy="440" r="18" fill="${accent}" opacity=".9"/>
    <path d="M10 130 C14 220 14 300 16 360" stroke="#fff" stroke-opacity=".25" stroke-width="6" fill="none"/>
  </g>`;
  return frame(one(140) + one(320), '<ellipse cx="300" cy="530" rx="210" ry="16" fill="#000" opacity=".12"/>');
};

// ---------- hockey glove ----------
const glove = (main, accent) => frame(`
<path d="M190 470 L190 300 C190 270 200 250 214 240 L214 150 C214 128 246 128 246 150 L246 230 L256 230 L256 120 C256 96 290 96 290 120 L290 228 L300 228 L300 116 C300 92 334 92 334 116 L334 232 L344 232 L344 140 C344 118 376 118 376 140 L376 300 C376 330 400 330 420 300 L440 270 C454 250 482 264 470 290 L420 400 C404 436 380 470 340 470 Z" fill="${main}"/>
${[150, 140, 136, 156].map((y, i) => `<rect x="${218 + i * 42}" y="${y + 8}" width="24" height="70" rx="12" fill="${accent}" opacity=".9"/>`).join('')}
<rect x="190" y="440" width="190" height="40" rx="10" fill="${accent}"/>
<path d="M214 300 C260 320 330 320 376 300" stroke="#fff" stroke-opacity=".2" stroke-width="8" fill="none"/>`);

// ---------- mouthguard ----------
const mouthguard = frame(`
<path d="M160 230 C160 160 220 120 300 120 C380 120 440 160 440 230 L440 330 C440 360 410 370 390 350 C360 320 340 300 300 300 C260 300 240 320 210 350 C190 370 160 360 160 330 Z" fill="#D9FF1E" opacity=".85"/>
<path d="M190 230 C190 175 240 150 300 150 C360 150 410 175 410 230" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="12" stroke-linecap="round"/>
<path d="M200 300 C230 270 260 262 300 262 C340 262 370 270 400 300" fill="none" stroke="#15161A" stroke-width="6" opacity=".35"/>
<rect x="240" y="400" width="120" height="70" rx="20" fill="#15161A"/>
<text x="300" y="444" text-anchor="middle" font-family="Arial Black, Arial" font-size="18" fill="#D9FF1E" font-style="italic">CANCHA</text>`);

// ---------- stick bag ----------
const palero = frame(`
<g transform="rotate(-24 300 300)">
  <rect x="70" y="240" width="460" height="120" rx="58" fill="#1A2445"/>
  <rect x="70" y="240" width="460" height="40" rx="20" fill="#fff" opacity=".08"/>
  <path d="M100 300 L500 300" stroke="#D9FF1E" stroke-width="5" stroke-dasharray="14 8"/>
  <rect x="380" y="250" width="120" height="100" rx="30" fill="#0f1730"/>
  <path d="M200 240 C200 170 380 170 380 240" fill="none" stroke="#15161A" stroke-width="16" stroke-linecap="round"/>
  <text x="250" y="342" text-anchor="middle" font-family="Arial Black, Arial" font-size="30" font-style="italic" fill="#D9FF1E">CANCHA</text>
</g>`);

// ---------- tennis racket ----------
const racket = (main, accent) => frame(`
<g transform="rotate(-32 300 300)">
  <clipPath id="face"><ellipse cx="300" cy="215" rx="100" ry="130"/></clipPath>
  <ellipse cx="300" cy="215" rx="112" ry="142" fill="none" stroke="${main}" stroke-width="22"/>
  <ellipse cx="300" cy="215" rx="112" ry="142" fill="none" stroke="${accent}" stroke-width="5" stroke-dasharray="60 240" stroke-dashoffset="40"/>
  <g clip-path="url(#face)" stroke="#9AA0A8" stroke-width="2.4">
    ${Array.from({ length: 16 }, (_, i) => `<line x1="${200 + i * 13.3}" y1="80" x2="${200 + i * 13.3}" y2="350"/>`).join('')}
    ${Array.from({ length: 19 }, (_, i) => `<line x1="190" y1="${90 + i * 13.5}" x2="410" y2="${90 + i * 13.5}"/>`).join('')}
  </g>
  <path d="M244 336 L284 420 L316 420 L356 336" fill="none" stroke="${main}" stroke-width="20" stroke-linejoin="round"/>
  <rect x="284" y="410" width="32" height="44" fill="${main}"/>
  <rect x="280" y="450" width="40" height="120" rx="8" fill="#15161A"/>
  ${Array.from({ length: 7 }, (_, i) => `<path d="M280 ${462 + i * 15} L320 ${452 + i * 15}" stroke="${accent}" stroke-opacity=".45" stroke-width="3"/>`).join('')}
  <rect x="278" y="566" width="44" height="12" rx="4" fill="${accent}"/>
</g>`, '<ellipse cx="300" cy="545" rx="190" ry="16" fill="#000" opacity=".12"/>');

// ---------- tennis balls ----------
const tball = (cx, cy, r) => `<g>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#D9FF1E"/>
  <path d="M${cx - r * 0.95} ${cy - r * 0.3} C${cx - r * 0.3} ${cy - r * 0.2} ${cx - r * 0.3} ${cy + r * 0.9} ${cx - r * 0.1} ${cy + r}" fill="none" stroke="#fff" stroke-width="${r * 0.09}" stroke-linecap="round"/>
  <path d="M${cx + r * 0.95} ${cy + r * 0.3} C${cx + r * 0.3} ${cy + r * 0.2} ${cx + r * 0.3} ${cy - r * 0.9} ${cx + r * 0.1} ${cy - r}" fill="none" stroke="#fff" stroke-width="${r * 0.09}" stroke-linecap="round"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#000" stroke-opacity=".06" stroke-width="3"/>
</g>`;
const tennisBalls = frame(tball(305, 225, 100) + tball(215, 380, 100) + tball(395, 380, 100));

// ---------- volleyball ----------
const volleyball = frame(`
<clipPath id="vb"><circle cx="300" cy="290" r="175"/></clipPath>
<circle cx="300" cy="290" r="175" fill="#FFD31A"/>
<g clip-path="url(#vb)">
  <path d="M300 290 C220 250 180 160 200 100 L120 140 C110 220 160 300 300 290 Z" fill="#2449C9"/>
  <path d="M300 290 C380 260 450 300 470 360 L470 450 C420 380 360 330 300 290 Z" fill="#2449C9"/>
  <path d="M300 290 C300 380 250 450 180 470 L300 480 C330 430 330 360 300 290 Z" fill="#F3F3F1"/>
  <path d="M300 290 C340 220 420 190 480 200 L470 140 C400 140 330 200 300 290 Z" fill="#F3F3F1"/>
  <g fill="none" stroke="#15161A" stroke-opacity=".25" stroke-width="4">
    <path d="M300 290 C220 250 180 160 200 100"/><path d="M300 290 C380 260 450 300 470 360"/>
    <path d="M300 290 C300 380 250 450 180 470"/><path d="M300 290 C340 220 420 190 480 200"/>
  </g>
</g>
<ellipse cx="240" cy="200" rx="60" ry="34" fill="#fff" opacity=".4" transform="rotate(-30 240 200)"/>`);

// ---------- knee pads ----------
const kneepads = frame([170, 330].map((x) => `<g transform="translate(${x} 110)">
  <path d="M0 30 C0 10 20 0 50 0 L50 0 C80 0 100 10 100 30 L104 330 C104 350 90 360 50 360 C10 360 -4 350 -4 330 Z" fill="#15161A"/>
  <ellipse cx="50" cy="180" rx="56" ry="78" fill="#23252b"/>
  <ellipse cx="50" cy="180" rx="56" ry="78" fill="none" stroke="#D9FF1E" stroke-width="4" stroke-dasharray="10 8"/>
  <rect x="-4" y="30" width="108" height="10" fill="#D9FF1E" opacity=".9"/>
  <rect x="-4" y="320" width="108" height="10" fill="#D9FF1E" opacity=".9"/>
</g>`).join(''));

const files = {
  'stick-volt': stick('#15161A', '#D9FF1E'),
  'stick-cyan': stick('#1A2445', '#00E5FF'),
  'stick-magenta': stick('#15161A', '#FF2D87'),
  'stick-white': stick('#F3F3F1', '#F39BC0', '#2a2a30'),
  'bocha-white': bocha('#F7F7F5', true),
  'bocha-orange': bocha('#FF6A1A', false),
  'shin-cyan': shin('#15161A', '#00E5FF'),
  'glove-volt': glove('#15161A', '#D9FF1E'),
  mouthguard,
  palero,
  'racket-volt': racket('#15161A', '#D9FF1E'),
  'racket-cyan': racket('#2449C9', '#00E5FF'),
  'racket-magenta': racket('#F3F3F1', '#FF2D87'),
  'tennis-balls': tennisBalls,
  volleyball,
  kneepads,
};

for (const [name, svg] of Object.entries(files)) fs.writeFileSync(path.join(OUT, `${name}.svg`), svg);
console.log(Object.keys(files).length, 'gear images');
