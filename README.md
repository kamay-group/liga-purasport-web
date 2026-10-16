# Liga PuraSport — sitio web (liga.pura-sport.com)

Sitio promocional estático de la Liga PuraSport. HTML + CSS + JavaScript puros (Tailwind compilado), sin frameworks ni dependencias en el navegador.

## Estructura
```
site.config.json      ← ÚNICO archivo de configuración (pixel, WhatsApp, endpoint de formularios, categorías, fechas)
build.mjs             ← une componentes + configuración → dist/
src/
  pages/              ← páginas: index, inscripcion/, gracias/, privacidad/, 404
  partials/           ← componentes reutilizables (head, header, footer, form, form-contacto, pixel, cookie)
  styles/site.css     ← estilos (Tailwind) + fuentes locales
  assets/             ← logo, gotas, fuentes, imagen OG, js/site.js
dist/                 ← salida publicable (no se versiona)
```

## Comandos
```
npm install
npm run build     # genera dist/
```
Para ver localmente: `npx serve dist` (o cualquier servidor estático).

## Hosting
- **Hoy (temporal):** Netlify, conectado a este repositorio. `netlify.toml` define build y carpeta `dist`.
- **Después:** servidor IIS de Kamay Group. Se publica el contenido de `dist/` tal cual. Las rutas son relativas.

## Formularios (pre-registro)
Tres formularios separados, solo datos de adultos (de los menores: año de nacimiento y sexo):
| name | Para |
|---|---|
| `preregistro-entrenadores` | equipos, clubes, colegios |
| `preregistro-familias` | padres/madres (hasta 5 hijos: `hijoN_anio`, `hijoN_sexo`) + `categorias_calculadas` |
| `preregistro-arbitros` | árbitros y oficiales de mesa |

Todos incluyen `whatsapp`, `correo`, `como_se_entero`, `consentimiento_datos`, `acepta_novedades`, `utm_source/utm_campaign/utm_content`.

- En Netlify se envían con `fetch` (POST urlencoded a `/`) y Netlify Forms los guarda.
- **Al migrar:** cambiar `formEndpoint` en `site.config.json` por la URL de la API de SIAMP 2.0. El cuerpo es `application/x-www-form-urlencoded` con el campo `form-name`. Si la API prefiere JSON, el cambio está en un solo lugar: `src/assets/js/site.js` (bloque "Envío").
- `/inscripcion` es hoy una página "Próximamente" con el pre-registro; se reemplaza por la app Blazor de inscripción.

## Medición
- Meta Pixel `metaPixelId` en `site.config.json`. Eventos: `PageView`, `Lead` (envío de formulario), `Contact` (clic a WhatsApp), personalizados `EligeTipoRegistro`, `CalculoCategoria`, `CompartirLiga`.

## Marca
Ver Manual de Marca Liga PuraSport v1.1. Azul #00A8E3, Negro Liga #0E1116, Inter Tight 800/900 + Inter (fuentes locales en `assets/fonts`).
