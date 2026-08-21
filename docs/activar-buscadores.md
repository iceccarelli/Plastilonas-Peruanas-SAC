# Activar la distribución: 12 minutos de consola

Este documento existe porque el sitio tiene hoy **un problema de distribución,
no de contenido**. Están publicadas 160 URLs, ocho tipos de documento
descargable, tres volcados JSON y un `llms.txt` curado. Y nada de eso le está
diciendo a ningún buscador que existe.

El código ya está escrito y desplegado. Está **apagado por diseño**: sin las
variables de entorno, `/indexnow-key.txt` responde 404 —a propósito, porque
publicar una clave de relleno haría fallar la verificación con un 403— y el
flujo de trabajo de GitHub Actions no se ejecuta.

Son cuatro pasos. Ninguno toca el código.

---

## 1. IndexNow — avisar a Bing, Yandex, Seznam, Naver y Yep

IndexNow es el canal por el que un sitio anuncia una URL nueva o modificada y
el buscador la rastrea en horas en lugar de en semanas. Google **no**
participa: su canal es el sitemap más Search Console (paso 3).

**Clave generada para este sitio** (32 caracteres hexadecimales, formato
válido según `lib/indexnow.ts`):

```
6d402a6b3ada2a71c74f9b5e449bc8a9
```

No es secreta en el sentido criptográfico —se publica en
`/indexnow-key.txt`, que es justamente cómo se demuestra el control del
dominio—, pero sí es la que ata este sitio a sus envíos: si cambia, hay que
cambiarla en los dos sitios a la vez.

### 1a. En Vercel

`Project → Settings → Environment Variables → Add New`

| Campo | Valor |
|---|---|
| Key | `INDEXNOW_KEY` |
| Value | `6d402a6b3ada2a71c74f9b5e449bc8a9` |
| Environments | Production, Preview, Development |

Después **redespliegue** (`Deployments → … → Redeploy`). Una variable de
entorno nueva no entra en un build ya hecho.

Comprobación:

```bash
curl -s https://plastilonas-peruanas-sac.vercel.app/indexnow-key.txt
# debe imprimir la clave. Si imprime "Not found", la variable no llegó al build.
```

### 1b. En GitHub

`Settings → Secrets and variables → Actions`

- Pestaña **Variables** → `New repository variable`
  - Name: `SITE_URL`
  - Value: `https://plastilonas-peruanas-sac.vercel.app`
- Pestaña **Secrets** → `New repository secret`
  - Name: `INDEXNOW_KEY`
  - Value: `6d402a6b3ada2a71c74f9b5e449bc8a9`

El flujo `.github/workflows/seo-maintenance.yml` está condicionado a
`vars.SITE_URL != ''`: sin la variable no se ejecuta, y con ella envía todas
las URLs del sitemap tras cada push a `main` y los lunes a las 06:00 UTC.

Comprobación: `Actions → SEO Maintenance → Run workflow`. Debe terminar en
verde y decir cuántas URLs envió.

---

## 2. Bing Webmaster Tools

`https://www.bing.com/webmasters` → Add a site → método **Meta tag**. Copie el
valor del atributo `content` (no la etiqueta entera).

En Vercel: `BING_SITE_VERIFICATION` = ese valor. Redespliegue. Vuelva a Bing y
pulse Verify.

Después, en `Sitemaps`, envíe:

```
https://plastilonas-peruanas-sac.vercel.app/sitemap.xml
```

---

## 3. Google Search Console

`https://search.google.com/search-console` → Add property → **URL prefix** →
`https://plastilonas-peruanas-sac.vercel.app` → método **HTML tag**. Copie el
valor de `content`.

En Vercel: `GOOGLE_SITE_VERIFICATION` = ese valor. Redespliegue. Verifique.

Después, en `Sitemaps`, envíe `sitemap.xml`.

Y en `Inspección de URL`, pida indexación manual de estas cinco, que son las
que abren cada silo:

```
/                          → la entidad
/calculadoras              → el silo de intención transaccional
/glosario                  → el vocabulario del rubro
/marco                     → el estándar
/informes                  → la evidencia con fuente
```

---

## 4. Comprobar que quedó encendido

```bash
npm run verify:deploy

curl -s https://plastilonas-peruanas-sac.vercel.app/indexnow-key.txt
# la clave, no "Not found"

curl -s https://plastilonas-peruanas-sac.vercel.app/ \
  | grep -oE '<meta name="(google-site-verification|msvalidate.01)"[^>]*>'
# las dos etiquetas
```

---

## Por qué esto es lo más urgente del proyecto

Todo lo demás que se ha construido —el grafo de entidad, los PDF
deterministas, el glosario como `DefinedTermSet`, los indicadores en vivo, los
métodos de cálculo publicados como datos— está diseñado para que un rastreador
lo encuentre, lo entienda y lo cite.

Un rastreador que no sabe que el sitio cambió no llega a nada de eso. Doce
minutos de consola valen hoy más que cualquier página nueva.
