# Entrega 2026-08-29 — Superficies para máquinas, permisos explícitos y runbook de mudanza

Rama: `observabilidad/ai-txt-robots-runbook` (6 commits sobre `main@4dbb23e`).
Operador: observabilidad y descubribilidad. Alcance: el primer ship que el
encargo define — `/ai.txt` 200, permisos explícitos en robots, `/confianza`
derivado de `SITE.url`, runbook de mudanza + mapa del folleto, y `llms.txt`
sin promesas rotas — más la higiene de entidad P0-7/P0-9 (horario único,
dirección sin duplicar) que esas superficies necesitaban para no emitir datos
contradictorios.

---

## 1. Evidencia de los dos hosts (verificado 2026-08-29)

Verificación hecha por fetch desde el entorno de trabajo (sin `curl -I`
directo; la matriz http/https × apex/www queda como comprobación del
propietario en el runbook, con el comando listo):

| URL | Resultado |
|---|---|
| `https://plastilonas-peruanas-sac.vercel.app/ai.txt?cb=84721` | **404** (antes de esta entrega) |
| `https://plastilonas-peruanas-sac.vercel.app/robots.txt?cb=19283` | 200. 19 agentes nombrados, `Host:` y `Sitemap:` sobre el host de Vercel. **Sin ningún `Allow` explícito** para /llms.txt, /ai.txt ni los JSON |
| `https://www.plastilonas.com/?cb=55712` | 200. Folleto 2010s («Lona Plastificada, Carpas de lona, cobertores…»), mismo RUC 20523135385, misma dirección de Chorrillos. Sin redirección al host de Vercel |
| `https://plastilonas-peruanas-sac.vercel.app/confianza?cb=90217` | 200. Imprimía **«Dominio canónico: plastilonas.com»** mientras robots declaraba el host de Vercel |

Consecuencia confirmada: dos grafos vivos para la misma entidad (falla S3, y
con ella S2).

## 2. Qué se embarcó

| # | Cambio | Antes | Después | Mueve |
|---|---|---|---|---|
| 1 | `/ai.txt` (`app/ai.txt/route.ts`) | 404 | 200: identidad completa, RUC, dos teléfonos, planta, horario, fundación 2009 con desmentido explícito del «2007» de terceros, qué dominio citar (sin declarar la mudanza como hecha), nueve URLs comerciales, perfiles verificados, lista sí-afirmamos / no-afirmamos, política de citación. Todo derivado de `lib/site.ts`, `lib/facts.ts`, `lib/products.ts` | **S2** (la ficha citable en un archivo corto), S3 |
| 2 | `app/robots.ts` | Las superficies para máquinas solo las salvaba `Allow: /` | `Allow` explícito de /llms.txt, /llms-full.txt, /ai.txt, /entidad.json, /mapa-consultas.json y los 4 catálogos JSON, para `*` y para los 19 agentes nombrados (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, etc.). Disallows intactos | **S2** |
| 3 | `app/sitemap.ts` | Sin superficies de máquina | Declara las 8 indexables; excluye a propósito `/llms-full.txt` (noindex) | S2 |
| 4 | `app/llms.txt/route.ts` | Sin horario, sin fundación, sin bloque de money URLs, sin las tres preguntas de especificador, sin anunciar /ai.txt | Identidad ampliada; «URLs comerciales canónicas» (las nueve); «Tres preguntas que este sitio responde mejor que un directorio» con URLs exactas (P1-2); /ai.txt anunciado en identidad y en «Archivos para rastreadores» | **S2** |
| 5 | `app/confianza/page.tsx` | «Dominio canónico: plastilonas.com» (falso hoy) | «Origen canónico vigente» derivado de `SITE.url` + «Dominio de marca» + párrafo que cuenta el estado real en ambos escenarios; el día de la mudanza cambia solo | **S3** |
| 6 | `lib/site.ts` (`HORARIO`) + Navbar, /contacto, portada, prompt del chat | Horario tecleado en 4 sitios, 4 redacciones | Una constante, cuatro consumidores + /llms.txt + /ai.txt | S3 |
| 7 | `components/Footer.tsx`, `app/contacto/page.tsx` | «Urb. Los Huertos de Villa» duplicada (venía en `addressStreet` y otra vez a mano) | Una sola urbanización, derivada | S3 (P0-9) |
| 8 | `next.config.ts` | Sin mapa del folleto | 14 rutas del folleto antiguo → 308 a su ficha equivalente + catch-all `/default/*` → /productos. Inertes hasta el día 0 | S3 post-mudanza |
| 9 | `docs/mudanza-plastilonas-com.md` | No existía | Runbook del propietario: días −7/−1/0/+1/+7, dos acciones del día 0 (DNS + `CANONICAL_ORIGIN`), verificaciones y tabla completa | S2/S3 (P0-1) |
| 10 | `lib/novedades.ts` | — | Entrada fechada 2026-08-29 del ship (regla del registro: todo cambio material, con fecha real) | S3 |
| 11 | `test/ai-txt.test.ts` | Sin cobertura | 14 pruebas: responder + estar anunciada + estar permitida, límites presentes, sin precios, URLs de producto vivas, sin hosts ajenos | guardia de todo lo anterior |

## 3. Tabla de superficies para máquinas

| Ruta | Estado | Anunciada en llms.txt | Allow explícito en robots | En sitemap |
|---|---|---|---|---|
| /llms.txt | 200 | sí (autorreferencia + robots.txt la lista) | **sí** | **sí** |
| /llms-full.txt | 200 (noindex, canónica → /llms.txt) | sí | **sí** | no (a propósito) |
| /ai.txt | **200 (nuevo)** | **sí** | **sí** | **sí** |
| /entidad.json | 200 | sí | **sí** | **sí** |
| /mapa-consultas.json | 200 | sí | **sí** | **sí** |
| /productos/catalogo.json | 200 | sí | **sí** | **sí** |
| /glosario/terminos.json | 200 | sí | **sí** | **sí** |
| /calculadoras/formulas.json | 200 | sí | **sí** | **sí** |
| /indicadores/datos.json | 200 | sí | **sí** | **sí** |

`test/ai-txt.test.ts` rompe el build si cualquiera pierde su route handler, su
anuncio o su permiso.

## 4. Puerta de verificación

Las siete pasan en local sobre la rama:

```
npx tsc --noEmit          ✓
npm test                  ✓ 46 archivos, 691 pruebas
npm run auditar:imagenes  ✓ 0 errores
npm run build             ✓ (ver nota)
npm run auditar           ✓ 0 errores (3 avisos preexistentes: huérfanas /carrito, /checkout, /checkout/exito)
npm run auditar:viewport  ✓ 0 errores (2 avisos táctiles preexistentes)
npm run auditar:navegacion ✓ 0 errores
npm run seo:all           ✓
```

Nota del build: el entorno de verificación no tiene salida a
`fonts.googleapis.com` (403 del proxy), así que `next build` se ejecutó con
`NEXT_FONT_GOOGLE_MOCKED_RESPONSES` apuntando a un mock local **fuera del
repositorio**. CI y Vercel descargan las fuentes reales; nada del mock se
versiona.

## 5. Qué se rehusó inventar

- Ningún perfil nuevo en `sameAs` (GBP, Instagram, Bing Places…): siguen solo
  Facebook y LinkedIn, los dos ya verificados. R13.
- Ningún `aggregateRating`, reseña ni testimonio. R5/R6.
- Ninguna certificación propia; ISO 21898 se cita solo como exigencia del
  comprador. R10.
- Ningún precio, banda ni tarifa. R15.
- Ningún cliente, obra ni ficha de `lib/projects.ts` publicada. R16.
- No se tocó `CANONICAL_ORIGIN` ni se declaró la mudanza como hecha en
  ninguna superficie. R12: `/ai.txt` y `/confianza` dicen explícitamente que
  el dominio de marca aún sirve el sitio anterior.
- No se creó ninguna página producto×ciudad ni un producto 37. R8.
- No se corrigió el CIIU sin ver la ficha RUC: sigue 2220 con su `VERIFY`. R19.

## 6. Casillas del propietario

- [ ] **DNS**: apuntar `plastilonas.com` y `www` al proyecto de Vercel (runbook §3, día 0).
- [ ] **CANONICAL_ORIGIN** = `https://plastilonas.com` en Vercel, solo tras el DNS.
- [ ] **GSC**: dar de alta la propiedad `plastilonas.com`; día +1, enviar sitemap y pedir indexación de las URLs comerciales.
- [ ] **Bing Webmaster**: ídem.
- [ ] **IndexNow**: tras desplegar esta rama, `node scripts/submit-indexnow.mjs`; repetir el día +1 de la mudanza.
- [ ] **LinkedIn**: corregir el año de fundación 2007 → 2009 (higiene de entidad fuera del sitio; el desmentido ya está publicado en /ai.txt).
- [ ] **Matriz curl**: correr la verificación previa del runbook §1 y archivar la salida.
