# CANCHA · Sport Store (demo)

Tienda deportiva mobile-first para fútbol, tenis, vóley y hockey, con un **probador virtual 2D** ("Armá tu outfit") y 10% OFF por outfit completo. Hecha con Next.js 16 (App Router, Cache Components), Tailwind CSS 4, Motion y Zustand. Lista para Vercel.

## Correr en local

```bash
npm install
npm run dev
```

Abrí http://localhost:3000.

## Publicar en Vercel

1. Subí la carpeta a un repositorio de GitHub.
2. En vercel.com → **Add New → Project** → importá el repo. Vercel detecta Next.js solo; no hace falta configurar nada.
3. Deploy. La URL queda como `https://<proyecto>.vercel.app`.

(O con la CLI: `npx vercel` y después `npx vercel --prod`.)

No usa base de datos ni variables de entorno: el catálogo es JSON estático. 255 páginas se generan en el build y el resto de las fichas de producto se generan en la primera visita y quedan cacheadas.

## Qué cambiar para el cliente

- `src/lib/site.ts`: nombre de la tienda, WhatsApp (el carrito termina el pedido por WhatsApp), Instagram, ciudad, cuotas, envío gratis y % de descuento por outfit.
- `src/components/layout/Logo.tsx`: logo.
- `public/banners/`: fotos de campaña (hoy son de nike.com.ar, ver abajo).

## Estructura

| Ruta | Qué es |
| --- | --- |
| `/` | Home: carrusel con las 3 barras animadas, probador, deportes, categorías, rieles de productos, banda de hockey |
| `/hombre`, `/mujer` | Landing por género con subcategorías |
| `/hombre/ropa`, `/mujer/calzado/running`… | Listados con filtros (deporte, talle, color), orden, vista grilla/lista y scroll infinito |
| `/deportes`, `/deportes/hockey`… | Equipamiento por deporte, combos listos por posición y todo lo del deporte |
| `/armar-outfit` | El probador a pantalla completa |
| `/producto/[slug]` | Ficha con galería, talles, "Probalo en el maniquí" y "Completá el outfit" |
| `/buscar?q=` | Resultados de búsqueda |

### El probador ("Armá tu outfit")

- `src/components/outfit/figure.ts` tiene toda la geometría: dos esqueletos (hombre/mujer) hechos de filas de torso y líneas centrales de brazos y piernas. **Cada prenda se calcula a partir del mismo esqueleto**, por eso nunca se desalinea, en ningún tamaño de pantalla: todo vive en un único SVG (`viewBox 0 0 400 1000`) que escala entero.
- Cada producto trae `gs: [slot, forma]` (p. ej. `["shoes","cleats"]`) y su color (`hx`, `hx2`) derivado del nombre de color de Nike (`scripts/colors.mjs`). El maniquí dibuja la forma con esos colores.
- Escritorio: maniquí a la izquierda, panel de prendas y carrito del outfit a la derecha. Celular: se toca la parte del cuerpo y se abre un panel con las prendas y el maniquí haciendo zoom a esa zona.
- "Outfit por deporte": 4 preguntas (deporte, posición, colores, uso) → 3 combos (`src/components/outfit/quiz.ts`).
- Para revisar la alineación sin abrir el navegador: `node scripts/preview-figure.ts salida.png` genera una lámina con todos los conjuntos.

## Datos

- `data/nike-raw.json`: el relevamiento de nike.com.ar (2.683 productos de Hombre, Mujer, Unisex y Accesorios).
- `scripts/build-data.mjs` lo normaliza a la taxonomía de la tienda y genera:
  - `src/data/products.json` (catálogo completo, solo servidor)
  - `public/data/l/*.json`, `public/data/s/*.json`, `public/data/outfit/*.json`, `public/data/search.json` (listas livianas que carga el navegador)
- `scripts/store-line.mjs`: la "Línea CANCHA" (palos y bochas de hockey, bucal, palero, raquetas, pelotas de tenis, pelota y rodilleras de vóley), equipamiento que Nike AR no vende. Las imágenes son SVG propias (`scripts/build-gear-svgs.mjs` → `public/gear/`).
- `scripts/build-banners.mjs`: pasa las fotos de campaña a WebP en `public/banners/`.

Para actualizar el catálogo: abrí nike.com.ar en el navegador, pegá `scripts/scrape-nike.browser.js` en la consola, mové el archivo descargado a `data/nike-raw.json` y corré `node scripts/build-data.mjs`.

## Importante antes de publicar en serio

Los productos, precios, descripciones, fotos de producto (servidas desde el CDN de Nike) y banners son de **nike.com.ar** y se usan solo como contenido de demostración. Para salir a producción hay que reemplazarlos por el catálogo y las fotos propias del cliente, o contar con autorización para usarlos.
