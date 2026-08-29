# Runbook de mudanza: plastilonas.com → este proyecto

**Estado al 2026-08-29.** Este documento es el playbook del propietario para
el día en que el DNS de `plastilonas.com` apunte a este proyecto de Vercel.
Nada de lo que describe se ejecuta desde el código: la mudanza es **un cambio
de DNS + una variable de entorno**, y todo lo demás ya está preparado en el
repositorio.

---

## 1. Los dos hosts, hoy (verificado 2026-08-29)

| Host | Qué sirve | Evidencia |
|---|---|---|
| `https://plastilonas-peruanas-sac.vercel.app` | Este sitio Next.js completo. `robots.txt` declara `Host:` y `Sitemap:` sobre este origen. | Fetch 2026-08-29: robots.txt con los 19 agentes nombrados y Host de Vercel. |
| `https://www.plastilonas.com` | El folleto de los 2010s: título «Lona Plastificada, Carpas de lona, cobertores…», carrusel de productos, mismo RUC 20523135385 y misma dirección de Chorrillos. | Fetch 2026-08-29: responde 200 con el sitio antiguo. |
| `http(s)://plastilonas.com` (apex) | No redirige al host de Vercel. | El folleto sigue siendo el destino; no hay 301/308 hacia este proyecto. |

Consecuencia: dos grafos vivos para la misma entidad. Los rastreadores ven dos
Plastilonas, y esa ambigüedad es la razón principal por la que un motor de
respuesta no cita a ninguna de las dos. Cerrarla es el objetivo de este runbook.

**Verificación previa del propietario** (desde cualquier terminal):

```bash
for u in http://plastilonas.com https://plastilonas.com http://www.plastilonas.com https://www.plastilonas.com; do
  curl -sI "$u" | head -3; echo ---
done
```

Anote qué responde cada combinación http/https × apex/www antes del cambio,
para poder compararla después.

## 2. Qué ya está preparado en este repositorio

- **El interruptor.** `CANONICAL_ORIGIN` (vacío hoy, a propósito). Al ponerlo
  en `https://plastilonas.com`, `lib/site.ts` mueve `SITE.url` y con él
  sitemap, robots (`Host` y `Sitemap`), canonicals, Open Graph, JSON-LD,
  `/llms.txt`, `/llms-full.txt`, `/ai.txt`, `/entidad.json` y los espejos
  Markdown — en el mismo despliegue, sin tocar código.
- **www → apex con 308** y **noindex + `Link rel=canonical` en `*.vercel.app`**:
  ya escritos en `middleware.ts`, condicionados a `migracionActiva()`. Mientras
  la variable esté vacía, no degradan nada (incidente documentado en
  `test/dominio-migracion.test.ts`).
- **El mapa folleto → slug nuevo**: los 308 de cada ruta del sitio antiguo ya
  están en `next.config.ts` (sección «MAPA DEL FOLLETO ANTIGUO»). Hoy son
  inertes (esas rutas no existen en este host); el día 0 recogen cada enlace
  antiguo. La tabla completa está en §5.
- **`/confianza`** deriva el «origen canónico vigente» de `SITE.url`: el día 0
  cambia sola y deja de necesitar edición manual.
- **`/ai.txt`** declara qué dominio citar, en ambos estados, derivado de
  `SITE.url`.

## 3. Calendario

### Día −7

- [ ] Revisar que la tabla de §5 siga cubriendo el folleto vivo (`curl -sI` a
      cada ruta antigua; si apareció una ruta nueva, añadir su 308 a
      `next.config.ts`).
- [ ] Acceso confirmado a: panel DNS del dominio, Vercel (proyecto), Google
      Search Console, Bing Webmaster Tools.
- [ ] Dar de alta la propiedad `plastilonas.com` en GSC y Bing (además de la
      del host de Vercel, que ya existe o se da de alta ahora).
- [ ] Respaldo del folleto antiguo (wget espejo o copia del hosting), por si
      hay que consultar contenido o rutas después del apagado.

### Día −1

- [ ] Verificar en Vercel → Settings → Domains que se puede añadir
      `plastilonas.com` y `www.plastilonas.com` al proyecto.
- [ ] Confirmar que el correo `ventas@plastilonas.com` NO depende de los
      registros A/CNAME que van a cambiar (el MX no se toca; solo A/AAAA/CNAME
      del sitio web).
- [ ] `node scripts/verify-domain-redirect.mjs` en su estado previo, para
      dejar registrada la línea base.

### Día 0 — la mudanza (propietario; dos acciones)

1. [ ] **DNS**: apuntar `plastilonas.com` (A/ALIAS) y `www.plastilonas.com`
       (CNAME) al proyecto de Vercel; verificar el dominio en Settings → Domains.
2. [ ] **Variable**: en Vercel → Settings → Environment Variables:
       `CANONICAL_ORIGIN = https://plastilonas.com` → redeploy.

Con eso, automáticamente: `SITE.url` pasa al apex; www → apex con 308; el host
de Vercel emite `noindex` + canónica al apex; los 308 del folleto quedan
activos; `/confianza`, `/ai.txt`, `/llms.txt`, robots y sitemap cuentan la
misma historia nueva.

**Nadie más que el propietario ejecuta este paso.** Poner `CANONICAL_ORIGIN`
antes del DNS desindexa el único host vivo.

### Día +1

- [ ] `curl -sI` la matriz de §1: las cuatro combinaciones deben terminar en
      `https://plastilonas.com` (308 en cadena corta).
- [ ] `curl -sI https://plastilonas-peruanas-sac.vercel.app/` → debe traer
      `X-Robots-Tag: noindex` y `Link: rel=canonical` al apex.
- [ ] Enviar `https://plastilonas.com/sitemap.xml` en GSC y en Bing.
- [ ] `node scripts/submit-indexnow.mjs` (IndexNow con las URLs de dinero).
- [ ] Pedir indexación manual en GSC de: `/`, `/productos`, las nueve URLs
      comerciales de `/llms.txt` («URLs comerciales canónicas») y `/confianza`.
- [ ] Verificar `https://plastilonas.com/ai.txt`, `/llms.txt`, `/robots.txt`:
      deben declarar el apex, no el host de Vercel.

### Día +7

- [ ] Confirmar que el folleto antiguo ya no responde 200 en ninguna ruta
      (todas 308 → slug nuevo o /productos).
- [ ] GSC: revisar cobertura de la propiedad nueva; el host de Vercel debe ir
      cayendo del índice sin errores 404 masivos.
- [ ] Actualizar el año de fundación en LinkedIn (dice 2007; el oficial es
      2009) — higiene de entidad fuera del sitio, mismo dueño.

## 4. Qué NO se hace

- No se rellena `CANONICAL_ORIGIN` desde el código ni antes del DNS
  (`test/dominio-migracion.test.ts` protege el invariante).
- No se redirige el host de Vercel a `plastilonas.com` mientras ese dominio
  sirva el folleto: sería mandar el sitio bueno al sitio viejo.
- No se usa `NEXT_PUBLIC_SITE_URL` para nada relacionado con el origen (es
  solo para URLs de retorno de Stripe).
- No se declara en ninguna superficie que la mudanza ocurrió antes de que
  ocurra.

## 5. Tabla folleto antiguo → slug nuevo (ya codificada en next.config.ts)

| Ruta en plastilonas.com (2026-08-29) | Destino 308 |
|---|---|
| `/index.html` | `/` |
| `/default/index.html` | `/nosotros` |
| `/default/ubicacion.html` | `/contacto` |
| `/default/contacto.html` | `/contacto` |
| `/default/big-bags-bolsones-sacos-polipropileno.html` | `/productos/big-bags-bolsones-polipropileno` |
| `/default/biombos-cortinas-para-soldaduras.html` | `/productos/biombos-protectores-soldadura` |
| `/default/carpas-lona-cobertores-tensionadas.html` | `/productos/carpas-lona-estructuras-metalicas` |
| `/default/geomembranas-pvc-canales-pozas-agua.html` | `/productos/geomembranas-pvc` |
| `/default/mallas-antiafidas-antiafidos.html` | `/productos/mallas-antiafidas` |
| `/default/mangas-de-ventilacion-minas-tunel.html` | `/productos/mangas-ventilacion-minas-tuneles` |
| `/default/mantas-aislantes-termicas-acusticas-multiterm.html` | `/productos/mantas-aislantes-termicas-termoacusticas` |
| `/default/mantas-arpilleras-granjas-pollos-cerdos.html` | `/productos/mantas-arpilleras-granjas` |
| `/default/mantas-cobertores-lonas-rafia-polytarp-toldos.html` | `/productos/lona-plastificada-rafia-polytarp` |
| `/default/mulch-madera-picada-plantas-parques-jardines.html` | `/productos/mulch-madera-picada` |
| `/default/*` (resto) | `/productos` |

Criterio: cada ruta va a la ficha equivalente por intención de compra, nunca a
la portada por pereza; lo que no tiene equivalente claro cae al índice del
catálogo, que es la página que sabe repartir.
