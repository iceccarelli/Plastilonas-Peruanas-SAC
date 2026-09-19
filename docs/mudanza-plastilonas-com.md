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

---

## 6. Checklist de corte — la lista que se ejecuta el día 0

**Añadida el 2026-09-19.** Las secciones anteriores son el relato de la
mudanza; ésta es la lista de verificación que una persona marca, en orden, con
los **nombres reales** de las variables tal como las lee el código hoy. Nada de
esto lo ejecuta un agente ni un script: son acciones en el panel de DNS y en el
panel de Vercel.

### 6.1 Las cuatro variables que existen de verdad

Comprobado contra `lib/site.ts` y `middleware.ts` el 2026-09-19. **No hay
ninguna otra**; cualquier nombre distinto que aparezca en una nota antigua es
un error de memoria.

| Variable | Dónde se lee | Qué hace | Valor hoy |
|---|---|---|---|
| `NEXT_PUBLIC_CANONICAL_HOST` | `lib/site.ts` (`originFromEnv`) y `middleware.ts` (`hostCanonico`) | **El interruptor principal.** Mueve `SITE.url` y con él canonicals, sitemap, robots, OG, JSON-LD, `/ai.txt`, `/llms.txt`, `/entidad.json` y los espejos Markdown. Exige `https:`; con cualquier otro protocolo o una URL malformada se ignora y se vuelve al origen por defecto. | vacía |
| `CANONICAL_ORIGIN` | los mismos dos archivos, como **segunda opción** | Alias heredado del anterior. Se lee **sólo si `NEXT_PUBLIC_CANONICAL_HOST` está vacía**. Poner las dos con valores distintos es la forma más fácil de equivocarse: gana la primera. | vacía |
| `CANONICAL_HOST` | `middleware.ts` | Dominio de marca **sin** `www` contra el que se comprueba que el interruptor apunta de verdad a la marca. Por defecto `plastilonas.com`. No hace falta tocarla salvo que la marca cambie de dominio. | sin definir (usa el defecto) |
| `ENFORCE_BRAND_DOMAIN` | `middleware.ts` (`redireccionDuraActiva`) | Con el valor exacto `"true"` convierte la señal suave en **308 duro** desde `*.vercel.app` y desde la variante de marca no canónica hacia el host canónico. Sin efecto mientras el interruptor principal esté vacío. | sin definir |

`NEXT_PUBLIC_SITE_URL` **no interviene**: es sólo para las URLs de retorno de
Stripe. No tocarla creyendo que es del dominio.

### 6.2 Decisión previa: apex o www — hay que tomarla antes de escribir nada

El repositorio **no es unánime** y esto tiene que resolverlo una persona:

- `lib/site.ts` declara `HOST_OBJETIVO = "https://www.plastilonas.com"`.
- `docs/HUMAN-GATES.md` §1 pide `NEXT_PUBLIC_CANONICAL_HOST=https://www.plastilonas.com`.
- La §3 de este mismo runbook (día 0) dice `CANONICAL_ORIGIN = https://plastilonas.com` (apex).

`middleware.ts` acepta las dos —`migracionActiva()` compara ignorando el
`www.`— así que **ninguna de las dos falla un test**; simplemente eligen
grafos distintos, y el 308 de la §2 de este runbook (www → apex) sólo tiene
sentido si el canónico es el apex.

- [ ] **Decidir, por escrito, cuál es el host canónico definitivo.**
- [ ] Corregir el documento que quede desalineado (este runbook o HUMAN-GATES),
      para que el próximo lector no encuentre dos respuestas.
- [ ] Usar ese mismo host en DNS, en la variable y en Search Console. Cambiar
      de opinión después del día 0 cuesta una segunda migración.

### 6.3 Antes de tocar nada (día −1)

- [ ] **DNS preparado, no aplicado.** Registros escritos y revisados para
      `plastilonas.com` (A o ALIAS) y `www.plastilonas.com` (CNAME) apuntando al
      proyecto de Vercel, con el TTL bajado con antelación suficiente.
- [ ] **El correo no viaja con el sitio.** Confirmar que los registros MX de
      `plastilonas.com` (y `ventas@plastilonas.com`) **no** dependen de los
      A/AAAA/CNAME que van a cambiar.
- [ ] **Los dos dominios dados de alta en Vercel** → Settings → Domains, con el
      proyecto correcto seleccionado.
- [ ] **Certificado SSL emitido y válido** para el host que se eligió en §6.2
      **y** para su variante. Abrir `https://` en las dos y comprobar que el
      navegador no advierte nada. *El paso que más se salta y el que más caro
      sale: activar `ENFORCE_BRAND_DOMAIN` sin certificado deja el sitio
      inalcanzable.*
- [ ] Propiedades dadas de alta en Google Search Console y Bing Webmaster para
      el host nuevo, además de la del host de Vercel.
- [ ] Línea base registrada: `node scripts/verify-domain-redirect.mjs` y la
      matriz de `curl -sI` de la §1 de este documento, guardadas.
- [ ] `npm test` verde en el estado actual, con `test/dominio-migracion.test.ts`
      confirmando que el interruptor está **apagado**.

### 6.4 El corte (día 0), en este orden y no en otro

1. [ ] **Aplicar el DNS.** Esperar a que resuelva y a que Vercel marque los dos
       dominios como verificados. **Todavía no tocar ninguna variable.**
2. [ ] Comprobar que el host de marca ya sirve **este** proyecto:
       `curl -sI https://<host elegido>/` debe responder desde Vercel, no desde
       el folleto antiguo.
3. [ ] **Sólo entonces**, en Vercel → Settings → Environment Variables (Production):
       `NEXT_PUBLIC_CANONICAL_HOST = https://<host elegido>`.
       Dejar `CANONICAL_ORIGIN` **vacía** para que no haya dos fuentes de verdad.
4. [ ] **Redeploy.** La variable no se aplica sola: Next la hornea en el
       despliegue.
5. [ ] Verificar el resultado antes de endurecer nada:
       - `https://<host>/robots.txt` declara `Host:` y `Sitemap:` sobre el host nuevo.
       - `https://<host>/ai.txt`, `/llms.txt` y `/entidad.json` nombran el host nuevo.
       - `curl -sI https://plastilonas-peruanas-sac.vercel.app/` trae
         `X-Robots-Tag: noindex` y `Link: rel=canonical` al host nuevo.
6. [ ] **Con lo anterior confirmado en producción**, y no antes:
       `ENFORCE_BRAND_DOMAIN = true` → redeploy. Comprobar que las cuatro
       combinaciones http/https × apex/www terminan en el host canónico con una
       cadena corta de 308.

### 6.5 Después (el mismo día)

- [ ] `npm test` de nuevo. `test/dominio-migracion.test.ts` sigue siendo válido:
      comprueba la **función**, no el entorno de producción, así que debe pasar
      igual. Si falla, el cambio tocó código y no sólo configuración — revisar
      qué se movió.
- [ ] `node scripts/verify-domain-redirect.mjs` contra el estado nuevo y
      comparar con la línea base de §6.3.
- [ ] El resto del calendario de la §3 (día +1 y día +7): envío de sitemap,
      IndexNow, indexación manual de las URLs comerciales, seguimiento de
      cobertura.

### 6.6 Cómo se deshace

Si algo sale mal, **borrar `ENFORCE_BRAND_DOMAIN` primero** (quita las
redirecciones duras) y después `NEXT_PUBLIC_CANONICAL_HOST` (devuelve el grafo
al host de Vercel). Redeploy tras cada borrado. Los dos pasos son reversibles
sin tocar una línea de código; el DNS, en cambio, tarda lo que tarde el TTL que
se haya dejado puesto.
