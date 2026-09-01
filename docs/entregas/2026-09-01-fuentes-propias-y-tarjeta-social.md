# Etapa 15 — fuentes propias y la tarjeta que nunca se enviaba

**Fecha:** 2026-09-01 · **Páginas:** 354 · **Pruebas:** 769 (6 nuevas)

## 1. El hallazgo caro: 214 páginas se compartían sin imagen

`app/opengraph-image.tsx` genera desde hace etapas una tarjeta de 1200×630 con
el logo real, y un comentario en el layout daba por hecho que con eso bastaba.
**No bastaba.** Medido sobre el HTML servido:

```
/                                  → SIN og:image
/big-bags  /cotizacion  /productos → SIN og:image
/en  /pt                           → CON og:image
```

La causa es una regla de Next que es fácil no ver: cuando una página declara su
propio objeto `openGraph` —y las 43 del sitio lo declaran, para poner título,
descripción y URL— **ese objeto REEMPLAZA al del padre, imágenes incluidas**.
`/en` y `/pt` la conservaban justamente porque no declaran `openGraph`.

**Por qué importa más de lo que parece.** El canal comercial de esta empresa es
WhatsApp. Un enlace pegado en WhatsApp, LinkedIn o Slack sin imagen es una línea
de texto azul; con imagen es una tarjeta con logo, título y descripción. Es la
diferencia entre que un jefe de compras abra el enlace que le reenviaron o lo
ignore — y la imagen ya existía y ya se estaba generando.

**Corregido:** `OG_IMAGEN` en `lib/meta.ts` (url + `width` + `height` + `alt`,
ruta relativa para que `metadataBase` la resuelva al host del momento y el día
del corte a `www.plastilonas.com` no haya que tocar 43 archivos). Declarada en
los 41 archivos que la perdían y en el layout raíz.

| | Antes | Después |
|---|---|---|
| Páginas HTML con `og:image` | 8 de 222 | **222 de 222** |
| `twitter:card` | `summary` | **`summary_large_image`** |
| `og:image:width/height/alt` | ausentes | presentes |

Las fichas de producto conservan su propia fotografía, que es mejor tarjeta que
el logo genérico. La prueba `NINGÚN openGraph del sitio se queda sin imagen`
recorre `app/` entero y no una lista a mano.

## 2. Las fuentes dejan de ser de un tercero

Cada `next build` salía a `fonts.googleapis.com`. En Codespaces eso imprimía
**diecisiete «Retrying 1/3…»** y añadía cerca de un minuto; en un contenedor sin
salida a ese dominio la compilación fallaba, y hubo que inventar un
`NEXT_FONT_GOOGLE_MOCKED_RESPONSES` para poder verificar cada etapa. Una
compilación que depende de que un servicio ajeno responda no es reproducible:
es afortunada.

Ahora los seis subconjuntos latinos que el sitio usa de verdad —Inter
400/500/600/700, Playfair Display 700, JetBrains Mono 400, **148 kB**— viven en
`public/fonts/` y se sirven con hash desde `/_next/static/media/`. Vienen de los
paquetes `@fontsource`, que publican los mismos binarios con licencia SIL OFL.

Tres consecuencias, todas medidas:

- **La compilación es hermética.** Cero reintentos, cero mock, `next build`
  limpio sin ninguna variable de entorno.
- **Una conexión menos en la ruta crítica.** Las fuentes viajan por la misma
  conexión que el HTML: se ahorra la resolución DNS y el handshake TLS de un
  segundo dominio, que sobre una conexión móvil peruana se nota en el LCP.
  Verificado: **cero referencias a `fonts.*` en el HTML servido**.
- **La CSP se cierra.** `font-src` pasa de `'self' data: https://fonts.gstatic.com`
  a `'self' data:`.

Se conserva `adjustFontFallback` y `display: 'swap'`: sin el ajuste métrico de
la fuente de respaldo, auto-hospedar reintroduciría el salto de texto que la
auditoría de la etapa 14 acababa de dejar en cero.

## 3. El aviso de `metadataBase`, diagnosticado

Aparecía en cada compilación sin explicación. Ya la tiene, con evidencia: el
único artefacto que resuelve contra `http://localhost:3000` es
`.next/server/app/_not-found.html`, la página 404 interna de Next — **que es
inalcanzable**, porque `app/[...resto]` captura cualquier ruta no encontrada y
sirve `app/(es)/not-found.tsx`. Comprobado sobre las 222 páginas servidas:
**ninguna contiene `localhost`**. Se deja como está y se documenta, en lugar de
añadir un layout raíz sólo para callar un aviso.

## 4. Una observación honesta que NO se arregló

En una de 234 mediciones (`/cotizacion`, 375 px) apareció un error de
hidratación de React (#418). **No se reprodujo en 8 intentos** en las mismas
condiciones, `<html>` ya lleva `suppressHydrationWarning` por el guion de tema, y
la medición venía justo después de un contexto que manipulaba `localStorage.theme`.
Se registra aquí en vez de inventar un arreglo para un síntoma que no se puede
reproducir: si vuelve a aparecer, este párrafo es el punto de partida.

## 5. Verificación

`tsc --noEmit` limpio · **769/769 pruebas** · `next lint` sin avisos · build 354
páginas **sin variables de entorno ni mock** · axe-core **0 violaciones** (16
rutas × 4 modos) · enlaces internos rotos **0** · desborde horizontal **0** en
234 mediciones · interacción **23/23**.

## 6. Casillas del propietario (sin cambios)

- [ ] **DNS de `www.plastilonas.com` → Vercel.**
- [ ] `NEXT_PUBLIC_GA4_ID` · `CRM_WEBHOOK_URL`.
- [ ] Tras desplegar: `node scripts/submit-indexnow.mjs`.
- [ ] Comprobar la tarjeta con el depurador de enlaces de LinkedIn y con un
      envío real por WhatsApp una vez el dominio esté activo.
