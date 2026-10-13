// Refreshes data/nike-raw.json from nike.com.ar.
//
// nike.com.ar sits behind a bot check, so this runs where a person browses: open https://www.nike.com.ar
// in a normal browser, open DevTools → Console, paste this file and press Enter. It reads the store's
// public VTEX catalogue API (the same one the site uses), paced at ~3 requests per second, and downloads
// "nike-raw.json" when done (~2 minutes). Move that file to data/nike-raw.json and run:
//   node scripts/build-data.mjs
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const strip = (h) =>
    (h || "")
      .replace(/<li>/gi, "\n• ")
      .replace(/<\/p>|<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\n{2,}/g, "\n")
      .trim();
  // category tree ids: 48 hombre, 31 mujer, 63 unisex, 14 accesorios, 4 calzado, 5 ropa
  const roots = ["/2/48/", "/2/31/", "/2/63/", "/2/14/", "/2/4/", "/2/5/"];
  const products = {};
  for (const root of roots) {
    let from = 0;
    let total = Infinity;
    while (from < total && from < 2500) {
      const r = await fetch(`/api/catalog_system/pub/products/search?fq=C:${root}&_from=${from}&_to=${from + 49}`);
      total = parseInt((r.headers.get("resources") || "0/0").split("/")[1], 10);
      const arr = await r.json();
      for (const p of arr) {
        if (products[p.productId]) continue;
        const items = p.items || [];
        const sizes = [];
        const colors = new Set();
        let price = null;
        let listPrice = null;
        let avail = false;
        for (const it of items) {
          const off = it.sellers?.[0]?.commertialOffer || {};
          const a = (off.AvailableQuantity || 0) > 0;
          if (a) avail = true;
          (it.color || []).forEach((c) => colors.add(c));
          sizes.push({ s: (it.talle || it.Talle || [])[0] || it.name, a });
          if (off.Price && (price === null || (a && off.Price < price))) {
            price = off.Price;
            listPrice = off.ListPrice;
          }
        }
        products[p.productId] = {
          id: p.productId, ref: p.productReference, slug: p.linkText, name: p.productName,
          sub: items[0]?.complementName || "", brand: p.brand,
          gender: (p["Género"] || [])[0] || "", type: (p["Tipo de producto"] || [])[0] || "",
          cat: (p.categories || [])[0] || "", catIds: (p.categoriesIds || [])[0] || "", categoryId: p.categoryId,
          sport: p["Disciplina Extendida"] || [], coll: p["Colecciones"] || [], club: p["Clubes y Federaciones"] || [],
          colorName: (p["Color PDP"] || [])[0] || "", colors: [...colors], sizes, price, listPrice, avail,
          imgs: (items[0]?.images || []).slice(0, 6).map((im) => {
            const m = im.imageUrl.match(/ids\/(\d+)\/([^?]+)/);
            return m ? { id: m[1], f: m[2], l: im.imageLabel || "" } : null;
          }).filter(Boolean),
          desc: strip((p["Descripción Larga"] || [])[0] || p.description).slice(0, 900),
          release: p.releaseDate, clusters: Object.values(p.productClusters || {}), link: p.link,
        };
      }
      console.log(root, from, arr.length, "/", total);
      if (!arr.length) break;
      from += 50;
      await sleep(300);
    }
  }
  const data = JSON.stringify({ scrapedAt: new Date().toISOString(), source: "https://www.nike.com.ar", products: Object.values(products) });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
  a.download = "nike-raw.json";
  a.click();
  console.log("done:", Object.keys(products).length, "products");
})();
