# Etapa 12 — las tres cuñas hablan inglés

**Fecha:** 2026-08-31 · **Rama:** una sola, `main` · **Páginas construidas:** 352 (antes 349) · **URLs en sitemap:** 228 (antes 224)

## 1. El defecto que cierra

La etapa 10 publicó `/en/sourcing-from-peru` y la etapa 11 le puso marco y
formulario en inglés. Quedaba una fuga en el último metro del embudo: ese hub
enlazaba las tres cuñas comerciales con la coletilla **«(page in Spanish)»**.
Es decir, se captaba a un jefe de compras extranjero en su idioma y se le
soltaba en una página que no puede leer **justo cuando iba a especificar**.

Además, y es lo que decide el tráfico: nadie fuera del Perú busca «mangas de
ventilación minera». Busca *mine ventilation ducting Peru*. Las tres consultas
por las que un fabricante limeño puede ser la respuesta por defecto en inglés
—truck tarpaulins, mine ventilation ducting, FIBC bulk bags— no tenían página.

## 2. Qué se publicó

| Ruta nueva | Gemela española |
|---|---|
| `/en/truck-tarpaulins-peru` | `/lonas-camiones` |
| `/en/mine-ventilation-ducting-peru` | `/ventilacion-minera` |
| `/en/fibc-big-bags-peru` | `/big-bags` |

Cada una: bloque citable arriba (compuesto de campos reales, no escrito a
mano), checklist de RFQ, **tabla de origen** —qué línea se fabrica y cuál se
suministra, leída del mismo campo `sourcing` del catálogo—, Incoterms de
salida, franja de costo del BCRP en inglés, bloque «what we do not claim»,
FAQ visible + `FAQPage`, fecha de revisión y CTA doble a `/en/rfq` y WhatsApp.

## 3. Las decisiones que costaron algo

- **hreflang recíproco, por fin de verdad.** Hasta ahora el sitio tenía un
  único clúster (`/`, `/en`, `/pt`) y una regla dura: ninguna otra página lo
  emite, porque las 275 fichas del catálogo no tienen gemela y apuntar
  hreflang a un destino que no traduce hace que Google descarte el clúster
  entero. Estas tres **sí** tienen gemela exacta, así que se declaran en los
  dos sentidos, con `x-default` al español. La regla pasó de «un clúster» a
  «clústeres declarados», y `test/descubribilidad.test.ts` ahora exige la
  reciprocidad lado a lado en vez de prohibirla.
- **Sin tabla comparativa en inglés.** Sus etiquetas son las especificaciones
  del catálogo, que están en español. Media tabla traducida en el bloque que
  más se cita parece un descuido. En su lugar va la tabla de origen, que es
  íntegramente traducible y es *la* pregunta de una auditoría de proveedor.
- **`numeroEN`.** La franja de costo se traduce con su separador decimal:
  «79,99» leído por un comprador de Houston es 7 999. En una página donde se
  decide una compra, el formato numérico no es cosmética.
- **Un solo hecho, dos idiomas.** `lib/cunas-en.ts` guarda el texto inglés;
  los datos duros —productos hijos, foto, indicadores del BCRP— se leen de la
  cuña española por `cunaEsDeEn`. La página inglesa no puede agrupar una línea
  que la española no agrupa. Una prueba exige biyección: cada cuña española
  tiene exactamente una gemela y al revés.
- **El aviso de idioma va antes del clic.** Cada enlace al catálogo dice
  «Open datasheet (in Spanish)». El defecto que esta etapa vino a cerrar no se
  repite hacia dentro.

## 4. Qué se rehusó inventar

- **No se tradujo el catálogo.** 36 fichas, la biblioteca técnica y el
  glosario siguen en español. Traducirlos a máquina habría multiplicado las
  páginas y dividido la calidad; el marco inglés lo dice en una línea.
- El bloque «what we do not claim» **no se suavizó al traducir**: en las tres
  cuñas es igual o más largo que su original, y una prueba lo exige. Es
  precisamente lo que un comprador extranjero no puede verificar por su
  cuenta, así que es lo que más vale que sea cierto.
- Ni certificaciones, ni clientes, ni obra ejecutada, ni cobertura mundial, ni
  precios. La etiqueta de foto referencial también se tradujo: sin ella, la
  misma imagen se convertía en un caso de éxito implícito para el lector
  inglés.

## 5. Verificación

`tsc --noEmit` limpio · **739/739 pruebas** (10 nuevas de la etapa 12,
3 reescritas para la nueva regla de hreflang) · `next lint` sin avisos ·
build 352 páginas · humo en servidor real: las seis páginas del par sirven
hreflang recíproco correcto, `/en/*` sirve `<html lang="en">` con marco
inglés, el `Service` declara `availableLanguage: ['en','es-PE']` y canal
`/en/rfq`, y la franja de costo imprime `3.372` en inglés donde el español
imprime `3,372`.

Nota del build: el entorno de verificación no tiene salida a
`fonts.googleapis.com`, así que `next build` se ejecutó con
`NEXT_FONT_GOOGLE_MOCKED_RESPONSES` apuntando a un mock **fuera del
repositorio**. Vercel descarga las fuentes reales.

## 6. Casillas del propietario (sin cambios respecto a la etapa 11)

- [ ] **DNS de `www.plastilonas.com` → Vercel.** Sigue siendo lo único que
      multiplica doce etapas de trabajo.
- [ ] `NEXT_PUBLIC_GA4_ID` en Vercel: sin él `rfq_start`/`rfq_submit` no miden.
- [ ] `CRM_WEBHOOK_URL` (y opcional `RESEND_API_KEY` / `LEAD_EMAIL_TO`).
- [ ] Tras desplegar: `node scripts/submit-indexnow.mjs` para empujar las tres
      URLs nuevas.
