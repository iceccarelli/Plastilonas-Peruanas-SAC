# Fundación SEO y de citabilidad — estado y operación

Documento operativo. Describe **lo que el repositorio hace hoy**, no un plan.
Si algo aquí deja de ser cierto, corrija el documento en el mismo commit.

## Principio que gobierna todo

`lib/site.ts` es la única fuente de verdad del dominio. `robots.ts`, `sitemap.ts`,
`/llms.txt`, `metadataBase`, todos los canonicals, las imágenes Open Graph y cada
bloque JSON-LD derivan de `SITE.url`. **Nunca** se escribe un dominio a mano.

Cuando el DNS de `plastilonas.com` apunte a este proyecto de Vercel, se cambia
esa única línea y todo lo demás se reajusta solo. Añada además las redirecciones
301 desde el sitio antiguo para no perder el historial de enlaces.

## Qué existe hoy

| Superficie | Ruta | Origen del contenido |
|---|---|---|
| Catálogo | `/productos` + 36 fichas | `lib/products.ts` |
| Familias | `/productos/familia/[slug]` (11) | `lib/families.ts` + `productFamilies` |
| Cobertura local | `/local` + 12 ciudades | `data/ciudades.json` |
| Guías técnicas | `/recursos` + 10 artículos | `lib/articles.ts` |
| Mapa para agentes | `/llms.txt` | `app/llms.txt/route.ts` (derivado) |
| Rastreo | `/robots.txt`, `/sitemap.xml` | `app/robots.ts`, `app/sitemap.ts` |
| Propiedad IndexNow | `/indexnow-key.txt` | `INDEXNOW_KEY` del entorno |

Grafo de entidad JSON-LD, con un solo nodo por entidad y todo lo demás
referenciándolo por `@id`:

- `${SITE.url}/#organization` — Organization
- `${SITE.url}/#business` — LocalBusiness
- `${SITE.url}/#website` — WebSite con SearchAction

Las páginas internas **no** redeclaran esos nodos: los referencian
(`lib/schema.ts` → `organizationRef`, `businessRef`, `websiteRef`).

## Variables de entorno

Configúrelas en Vercel → Project → Settings → Environment Variables.
Todas son opcionales: si faltan, la funcionalidad correspondiente se desactiva
de forma limpia en lugar de publicar datos de relleno.

| Variable | Para qué | Si falta |
|---|---|---|
| `INDEXNOW_KEY` | Prueba de propiedad en `/indexnow-key.txt` y envíos a IndexNow | La ruta responde 404 y el script aborta antes de enviar |
| `GOOGLE_SITE_VERIFICATION` | Meta de verificación de Search Console | No se emite la meta |
| `BING_SITE_VERIFICATION` | Meta `msvalidate.01` de Bing Webmaster Tools | No se emite la meta |
| `NEXT_PUBLIC_SITE_URL` | Origen de las URLs de retorno de Stripe | Se usa `SITE.url` (nunca localhost en producción) |

`INDEXNOW_KEY` debe cumplir la especificación: entre 8 y 128 caracteres, solo
letras, números y guiones. Genérela así:

```bash
node -e "console.log(crypto.randomUUID())"
```

## Puesta en marcha — checklist del operador

Una sola vez, unos diez minutos:

1. **Generar y configurar la clave de IndexNow.** Cree la variable
   `INDEXNOW_KEY` en Vercel y despliegue. Verifique:
   `curl -s https://<sitio>/indexnow-key.txt` debe devolver exactamente la clave.
2. **Google Search Console.** Añada la propiedad, elija verificación por
   etiqueta HTML, copie el valor `content` a `GOOGLE_SITE_VERIFICATION` en
   Vercel, despliegue y pulse Verificar. Después envíe `/sitemap.xml`.
3. **Bing Webmaster Tools.** Igual, con `BING_SITE_VERIFICATION`. Bing permite
   importar la propiedad desde Search Console, lo que ahorra el paso manual.
4. **GitHub.** En Settings → Secrets and variables → Actions:
   variable `SITE_URL` con la URL de producción y secreto `INDEXNOW_KEY` con la
   misma clave. Sin la variable, el workflow no se ejecuta.
5. **Primer envío manual**, para comprobar la cadena completa:
   ```bash
   INDEXNOW_KEY=... SITE_URL=https://<sitio> node scripts/submit-indexnow.mjs --dry-run
   INDEXNOW_KEY=... SITE_URL=https://<sitio> node scripts/submit-indexnow.mjs
   ```

A partir de ahí, `.github/workflows/seo-maintenance.yml` envía todas las URLs
del sitemap tras cada push a `main`, más una pasada semanal de seguridad.

## Qué NO se hace, y por qué

- **Google no participa en IndexNow.** Para Google el canal es el sitemap con
  `lastmod` honesto y Search Console. Cualquier servicio que prometa
  "indexación instantánea en Google" vía IndexNow está vendiendo humo.
- **No se usa la Indexing API de Google.** Está restringida a `JobPosting` y
  `BroadcastEvent`; usarla para páginas normales arriesga perder el acceso.
- **No se generan estáticos que compitan con rutas.** `/llms.txt` se sirve desde
  `app/llms.txt/route.ts`. Un `public/llms.txt` sombrearía esa ruta con una
  versión autogenerada y más pobre; hay un test que falla si reaparece.
- **No se inventan datos.** Ni precios, ni reseñas, ni calificaciones, ni
  certificaciones propias, ni perfiles sociales que no existan. Un `sameAs`
  vacío es mejor que uno falso: el perfil inventado rompe la reconciliación de
  entidad. Las cifras normativas de los artículos llevan su fuente citada, y
  cuando un dato no se pudo verificar contra el texto oficial, se dice.
- **No se generan páginas doorway.** `/local/[ciudad]` y `/recursos/[slug]`
  usan `dynamicParams = false`: solo existen las URLs curadas.

## Invariantes cubiertos por tests

`npm test` falla si alguien:

- reintroduce un dominio escrito a mano en el sitemap;
- quita un crawler de IA de `robots.ts` o expone una ruta privada a alguno;
- publica un producto o una familia sin su contraparte editorial;
- escribe una FAQ de producto que afirma un precio, un plazo o una
  documentación que el catálogo no declara;
- publica un artículo sin fuente, con fuente sin URL absoluta, o con un
  `relatedProducts` que apunta a un SKU inexistente;
- duplica un `metaTitle` entre familias o entre artículos;
- deja el sitemap con URLs repetidas o con una entrada que no existe;
- reintroduce `public/llms.txt` o el generador estático paralelo;
- hace que las URLs de retorno de Stripe caigan a `localhost` en producción.

## Siguientes pasos legítimos de mayor palanca

1. Verificar en Search Console qué páginas reciben impresiones y reescribir los
   títulos de las que aparecen pero no se pulsan.
2. Google Business Profile con NAP idéntico al de `lib/site.ts` (nombre,
   dirección y teléfono exactamente iguales, carácter por carácter).
3. Fotografías reales en los 7 productos que aún no tienen galería.
4. Casos de estudio con números y fotos autorizadas por el cliente.
5. Migrar el dominio y añadir las redirecciones 301 desde el sitio antiguo.
