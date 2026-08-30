# Redirecciones del sitio Apache legado (plastilonas.com)

El dominio de marca sirve hoy un sitio comercial anterior sobre Apache. El día
de la mudanza, ese servidor deja de servir contenido y **cada URL antigua debe
responder 301/308 hacia su equivalente en el sitio nuevo**, no hacia la
portada: una redirección en masa a `/` desperdicia la autoridad acumulada y
frustra a quien llega desde un marcador.

## Estado

`TODO(HUMAN)`: falta el inventario real de URLs del sitio Apache (no tenemos
acceso al servidor legado desde este repositorio). Quien tenga acceso debe
exportar el listado (access log de 90 días o `sitemap.xml` del sitio viejo) y
completar la tabla de abajo antes de activar `ENFORCE_BRAND_DOMAIN`.

## Mapa de redirecciones propuesto (completar con las URLs reales)

| URL legada (Apache)                | Destino en el sitio nuevo            |
| ---------------------------------- | ------------------------------------ |
| `/index.php` · `/index.html`       | `/`                                  |
| `/productos.php` (o similar)       | `/productos`                         |
| `/big-bags*` · `/bolsones*`        | `/big-bags`                          |
| `/lonas*` · `/toldos*`             | `/lonas-camiones`                    |
| `/mangas*` · `/ventilacion*`       | `/ventilacion-minera`                |
| `/geomembranas*`                   | `/productos/familia/geosinteticos`   |
| `/contacto.php` · `/contactenos*`  | `/contacto`                          |
| `/nosotros*` · `/empresa*`         | `/nosotros`                          |
| _cualquier otra URL_               | `/` (última red de seguridad, 302)   |

## Implementación en el servidor Apache (referencia)

Si el legado sigue respondiendo el DNS durante una transición, un
`.htaccess` como este hace el trabajo (ajustar rutas reales):

```apache
RewriteEngine On
# Todo a HTTPS y al host canónico nuevo
RewriteCond %{HTTP_HOST} !^www\.plastilonas\.com$ [NC,OR]
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://www.plastilonas.com/$1 [R=308,L]

# Rutas legadas → rutas nuevas (ejemplos; completar con el inventario)
RedirectMatch 308 ^/productos\.php$        https://www.plastilonas.com/productos
RedirectMatch 308 ^/big-?bags.*$           https://www.plastilonas.com/big-bags
RedirectMatch 308 ^/contacto\.php$         https://www.plastilonas.com/contacto
```

Si el DNS pasa directo a Vercel (recomendado), las redirecciones de rutas
legadas se declaran en `next.config.ts` → `redirects()` con el mismo mapa;
el middleware ya cubre host → host.

## Verificación tras el cambio

1. `curl -sI https://plastilonas.com/productos.php | head -3` → `308` + `Location` correcto.
2. `node scripts/verify-domain-redirect.mjs` (ya existe en el repo).
3. Search Console: «Cambio de dirección» solo cuando el muestreo de URLs
   legadas redirija página a página.
