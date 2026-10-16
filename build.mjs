// Build estático de liga.pura-sport.com
// - Une componentes de src/partials en las páginas de src/pages (<!--@include nombre-->)
// - Reemplaza {{variable}} con valores de site.config.json
// - Copia src/assets y escribe dist/assets/config.js (configuración para el navegador)
// Salida: dist/  → se publica en Netlify hoy y en IIS después (HTML/CSS/JS puro).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync, rmSync } from "node:fs";
import { join, dirname, relative } from "node:path";

const cfg = JSON.parse(readFileSync("site.config.json", "utf8"));
const SRC = "src", OUT = "dist";
rmSync(OUT, { recursive: true, force: true });

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

const partial = (name) => readFileSync(join(SRC, "partials", `${name}.html`), "utf8");

// Bloques generados desde la configuración
const generated = {
  categoriasCards: cfg.categorias.map((c, i) => `
      <article class="cat-card" data-cat="${c.id}">
        <div class="flex items-center justify-between">
          <span class="whitespace-nowrap text-xs font-bold tracking-[.18em] text-brand uppercase">Categoría ${i + 1}</span>
          <span class="pill whitespace-nowrap">${c.ramas === "Mixto" ? "Mixto" : "Masc. · Fem."}</span>
        </div>
        <h3 class="mt-3 font-display text-4xl font-black">${c.nombre}</h3>
        <p class="mt-1 text-2xl font-bold text-brand">${c.anios[0]} – ${c.anios[1]}</p>
        <p class="mt-1 text-white/70">${c.edades}</p>
        <ul class="mt-5 space-y-2 text-sm text-white/80">
          <li>${c.aro}</li><li>${c.balon}</li><li>${c.cancha}</li>
        </ul>
      </article>`).join(""),
  yearOptions: (() => {
    const ys = [];
    for (let y = 2021; y >= 2012; y--) ys.push(`<option value="${y}">${y}</option>`);
    return ys.join("");
  })(),
  categoriasChecks: cfg.categorias.flatMap((c) =>
    c.ramas === "Mixto"
      ? [[`${c.nombre} (mixto)`, `${c.nombre} ${c.anios[0]}–${c.anios[1]} · mixto`]]
      : [[`${c.nombre} masculino`, `${c.nombre} ${c.anios[0]}–${c.anios[1]} · masculino`],
         [`${c.nombre} femenino`, `${c.nombre} ${c.anios[0]}–${c.anios[1]} · femenino`]]
  ).map(([v, label]) => `
            <label class="check"><input type="checkbox" name="categorias" value="${v}"><span>${label}</span></label>`).join(""),
};

const render = (html, depth, isNotFound = false) => {
  for (let i = 0; i < 5; i++) html = html.replace(/<!--@include ([\w-]+)-->/g, (_, n) => partial(n));
  html = html.replace(/\{\{@(\w+)\}\}/g, (_, k) => generated[k] ?? "");
  // rutas relativas para que funcione en cualquier servidor o subcarpeta
  const root = isNotFound ? "/" : depth === 0 ? "./" : "../".repeat(depth);
  html = html.replace(/\{\{ROOT\}\}/g, root);
  return html.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (typeof cfg[k] !== "string") throw new Error(`Falta "${k}" en site.config.json`);
    return cfg[k];
  });
};

for (const file of walk(join(SRC, "pages"))) {
  const rel = relative(join(SRC, "pages"), file);
  const depth = rel.split(/[\\/]/).length - 1;
  const out = join(OUT, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, render(readFileSync(file, "utf8"), depth, rel === "404.html"));
}

for (const file of walk(join(SRC, "assets"))) {
  const out = join(OUT, "assets", relative(join(SRC, "assets"), file));
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(file, out);
}

const browserCfg = {
  formEndpoint: cfg.formEndpoint, formMode: cfg.formMode, metaPixelId: cfg.metaPixelId,
  whatsappNumber: cfg.whatsappNumber, temporadaInicio: cfg.temporadaInicio,
  categorias: cfg.categorias.map(({ id, nombre, anios, ramas }) => ({ id, nombre, anios, ramas })),
};
writeFileSync(join(OUT, "assets", "config.js"), `window.LIGA_CONFIG = ${JSON.stringify(browserCfg, null, 2)};\n`);
console.log("✓ HTML listo en dist/");
