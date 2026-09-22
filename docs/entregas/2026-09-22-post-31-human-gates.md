# Post-#31: abrir el caño de operación — runbook ejecutable

**Estado al 2026-09-22.** PR #31 mergeado, `main` en `29b2f95a`. El funnel
de producto ya está en verde (asistente → confirmación → `/cotizacion` →
WhatsApp). Esta entrega no toca ese código. Su único trabajo: dejar un
runbook que una persona sin contexto previo pueda ejecutar en una sola
sentada para que los leads lleguen a Storage y al CRM, y una tabla de
decisión honesta de lo que falta.

Nada aquí cambia `ProjectDraft`, la lógica de honestidad, ni ningún binario
de `public/`. No se tocó DNS ni `ENFORCE_BRAND_DOMAIN`. No se marcó ningún
`verificado: true`.

## Resumen ejecutivo (la tabla)

| Gate | Estado antes | Acción del dueño | Prueba después | Cómo bloquea caja |
|---|---|---|---|---|
| Remotos | `main`-only (confirmado) | — | `git ls-remote --heads origin` → solo `main` | confusión de ramas fantasma |
| RLS `rfq-adjuntos` | Bucket no provisionado en producción | SQL/clics en Supabase (abajo) | objeto sube desde `/cotizacion`; se ve en Storage | adjuntos + archivo de fotos del asistente se pierden |
| Webhook CRM | Sin `CRM_WEBHOOK_URL` (código ya lo lee) | Variable en Vercel → Production | `curl /api/lead` → `ok:true` + JSON llega al webhook | ventas ciega a leads web |
| Resend | Opcional, sin configurar | `RESEND_API_KEY` + `LEAD_EMAIL_TO` (opcional) | copia por correo del RFQ | — (no bloquea caja, es respaldo) |
| www vs apex | Indeciso (dos docs se contradicen) | Decisión por escrito, sin tocar nada aún | checklist firmado | riesgo SEO/DNS si se ejecuta sin decidir |
| `verificado` (proyectos) | Los 5 en `false` | Cartas de autorización comercial | siguen en `false` en esta entrega | honestidad — cero clientes/obras inventadas |
| CI `probar:dinero` | Script existe (`scripts/probar-dinero.sh`), no está en `ci.yml` | Decisión: cablear o no | Tramo 1 corre sin `ANTHROPIC_API_KEY` | evita regresiones en el camino del dinero |
| 32 WebP sin citar | Ya inventariados (entrega 2026-09-21) | Cablear o archivar, uno por uno | tabla de decisión abajo | ~1,6 MB de peso muerto, cero binarios tocados |
| Smoke de producción | — | — | **no ejecutado** — ver nota de red | verdad sobre lo que sí se probó |
| Árbol fantasma anidado | Ya borrado | Nunca re-clonar en la raíz del repo | `npx tsc --noEmit` sale limpio | falsos errores de tipos |

---

## 0. Verificación de lo ya construido (antes de tocar nada)

Todo lo siguiente se corrió en esta sesión, contra `main @ 29b2f95a`:

```
git rev-parse HEAD          → 29b2f95acd42c0617a7d9a348fae6ec9799390d6
git ls-remote --heads origin → solo refs/heads/main
```

- `app/(es)/page.tsx` importa `ExplorarCatalogo` (línea 9), **no**
  `FeaturedDeck` ni `FamilyCarousel`. Grep confirmado.
- No existe ningún directorio `./Plastilonas-Peruanas-SAC/` anidado.
- `unset ANTHROPIC_API_KEY && npx tsc --noEmit` → **sale limpio (exit 0)**.
  (Nota: `node_modules` no estaba instalado al abrir esta sesión — `npm
  install` primero, sin tocar `package.json`/`package-lock.json`.)
- `npx vitest run` → **78 archivos, 1234 pruebas, todas en verde.** Cero
  regresiones.
- `lib/ai/project-draft.ts`: la prioridad de `mergeReadinessSignals` está
  documentada en el propio código (líneas 22-28) como
  `pageContext → tool → rfq → confirmado`, coincide con lo pedido.
- `lib/projects.ts`: los 5 borradores (`ventilacion-contratista-minero-peru`,
  `malla-fundo-costa`, `toldos-flota-lima`, `almacen-temporal-infraestructura`,
  `exportacion-colombia-senal`) siguen con `verificado: false`.
- `AsistenteAiLink` está en biblioteca, novedades, recursos, productos,
  familia de productos e industria — confirmado por grep.

Nada de esto se tocó. Solo se verificó.

---

## 1. Higiene de remotos (confirmar, no ejecutar)

```
git ls-remote --heads origin
```

Resultado real de esta sesión: **una sola rama, `main`.** El dueño ya
ejecutó el borrado de ramas huérfanas antes de esta sesión; se confirma que
sigue así. Si alguna vez reaparece una rama zombie, el comando exacto para
borrarla es:

```
git push origin --delete <branch>
```

No hay atajos. No se ejecuta nada más en este gate.

---

## 2. Gate — bucket `rfq-adjuntos` en Supabase (el de más caja después de WhatsApp)

### Qué ya existe en el código (no tocar)

- **Un solo bucket**, `rfq-adjuntos`, privado. `components/CotizacionForm.tsx`
  (función `subirArchivos`, línea ~340) sube ahí los adjuntos del RFQ, sin
  prefijo.
- **Mismo bucket**, prefijo `asistente/` — `lib/ai/vision-upload.ts`
  (`archiveVisionImage`) sube ahí la copia de las fotos analizadas por
  `/api/vision`. El análisis de la foto **no depende** de que esta subida
  tenga éxito: viaja en base64 directo al endpoint. Sin bucket, el análisis
  sigue funcionando; solo no queda copia para revisión posterior.
- Ambos usan `supabaseBrowser()` (anon key), **nunca** `supabaseAdmin`, y
  ambos degradan en silencio (`try/catch`, `return null` o mensaje
  "adjuntar por correo") si Storage no está configurado o falla. El lead
  sigue llegando igual.

### Variables de entorno (cliente)

En Vercel → Settings → Environment Variables → Production:

```
NEXT_PUBLIC_SUPABASE_URL=<url del proyecto Supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key>
```

### Pasos exactos en el dashboard de Supabase

1. **Storage → New bucket**
   - Nombre: `rfq-adjuntos` (exacto, en minúsculas, con guion)
   - **Public bucket: NO** (privado)
2. **Storage → rfq-adjuntos → Policies → New policy** (o vía SQL Editor):

```sql
-- Permitir subida anónima (INSERT) a cualquiera
create policy "rfq-adjuntos anon insert"
on storage.objects for insert
to anon
with check (bucket_id = 'rfq-adjuntos');

-- Bloquear lectura pública (no crear política de SELECT para anon/public)
-- Sin política de SELECT, storage.objects deniega por defecto: correcto.
```

   Si el dashboard exige un policy explícito para "no acceso", **no crear
   ninguna política de `select` para el rol `anon` ni `public`** — la
   ausencia de política en Postgres RLS es denegación, no permiso. Confirmar
   que no existe una política preexistente de `select` para `anon` en ese
   bucket (Supabase a veces trae un template "Public read access" activado
   por defecto en buckets nuevos — desactivarlo si aparece).
3. Guardar. No hace falta redeploy en Vercel para que el bucket exista, pero
   si `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` se acaban
   de añadir, sí hace falta un redeploy para que el build las incluya.

### Prueba (el dueño la ejecuta, 5 minutos)

1. Abrir `/cotizacion` en producción, adjuntar un archivo pequeño (PDF o
   JPG), enviar.
2. Supabase → Storage → `rfq-adjuntos` → debe aparecer un objeto con ruta
   `web-<timestamp>/<timestamp>-<nombre>`.
3. Repetir sin credenciales de Supabase configuradas (o con el bucket
   inexistente) → el lead **debe seguir llegando** (degrade honesto); el
   adjunto queda listado como "adjuntar por correo" en vez de bloquear el
   envío.
4. Abrir `/asistente`, subir una foto de un producto → el análisis debe
   aparecer igual; si el bucket está sano, debe aparecer una copia bajo
   `asistente/<projectId>/...` en el mismo bucket.

### Lo que NO se hace en este gate

La subida de **documentos** en `/asistente` (más allá de fotos) sigue en
stub — no se está inventando un segundo stack de subida. Cuando ese gate se
abra, es el mismo bucket, el mismo patrón.

---

## 3. Gate — webhook CRM / n8n

`app/api/lead/route.ts` línea 140:

```ts
const webhook = process.env.CRM_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
```

Sin ninguna de las dos, el lead sigue llegando por WhatsApp (y a Supabase si
ese gate está abierto); lo que se pierde es la automatización de ventas —
nadie en el CRM ve el lead.

### Variable exacta en Vercel

Settings → Environment Variables → Production:

```
CRM_WEBHOOK_URL=<URL del webhook de n8n (o el sistema que reciba)>
```

Preferir `CRM_WEBHOOK_URL` sobre el heredado `N8N_WEBHOOK_URL` — el código
lee el primero con prioridad; si ambas existen, gana `CRM_WEBHOOK_URL`.

### Prueba de un solo lead

Vía UI: enviar `/cotizacion` con datos de prueba reales (marcar claramente
que es prueba en el campo de descripción).

Vía `curl` directo (más rápido, no necesita el navegador):

```bash
curl -sS -X POST https://plastilonas-peruanas-sac.vercel.app/api/lead \
  -H 'Content-Type: application/json' \
  -d '{
    "nombre": "Prueba Ops",
    "telefono": "+51900000000",
    "ciudad": "Lima",
    "descripcion": "Prueba de webhook CRM — ignorar",
    "origen": "prueba-ops"
  }'
```

Esperado: respuesta `{"ok":true,"rfqId":"..."}`. En el lado de n8n (o lo que
reciba `CRM_WEBHOOK_URL`), debe llegar un JSON que incluya `origen`,
`rfqId`, y el `source` compuesto (`plastilonas.com/cotizacion
(prueba-ops)`).

Para filtrar por superficie de origen dentro del flujo de n8n
(`configurador-lona`, `chat`, `calculadora`, `industria:<slug>`, etc.), la
tabla completa está en `docs/origen-de-los-leads.md` — no se repite aquí.

### Lo que NO se hace

No se construye una UI de CRM dentro del sitio. El CRM es el sistema
externo que recibe el webhook.

---

## 4. Gate — Resend (opcional)

Variables, ambas en Vercel → Production:

```
RESEND_API_KEY=<clave de Resend>
LEAD_EMAIL_TO=<correo de ventas que recibe la copia>
LEAD_EMAIL_FROM=<opcional — remitente; si se omite usa onboarding@resend.dev>
```

Sin `RESEND_API_KEY`, no se envía nada y nada falla (`app/api/lead/route.ts`
línea 165 en adelante hace el chequeo antes de intentar enviar).

**Prueba:** enviar un RFQ de prueba (igual que en el gate 3) y confirmar que
llega un correo a `LEAD_EMAIL_TO` con el contenido del lead. Si no llega,
revisar el log de Resend (dashboard) antes de tocar código — el fallo más
común es un dominio `from` no verificado.

Este gate es respaldo, no bloquea caja: WhatsApp y (si están activos)
Supabase + el webhook del CRM ya cubren la entrega del lead.

---

## 5. Gate — www vs apex (SOLO decisión escrita, cero DNS)

**Conflicto real, confirmado en esta sesión:**

- `docs/HUMAN-GATES.md` §1 dice: `NEXT_PUBLIC_CANONICAL_HOST=https://www.plastilonas.com`
  (canónico = **www**).
- `docs/mudanza-plastilonas-com.md` §6.2 (calendario "Día 0") dice:
  `CANONICAL_ORIGIN = https://plastilonas.com` (canónico = **apex**, sin
  www).
- `lib/site.ts` (líneas 69-74) lee **ambas** variables, con
  `NEXT_PUBLIC_CANONICAL_HOST` ganando si las dos están presentes;
  `CANONICAL_ORIGIN` se mantiene solo por compatibilidad hacia atrás.

Es decir: el código no fuerza una respuesta — puede servir cualquiera de
las dos. La decisión es puramente del dueño del negocio, y **antes de tocar
cualquier variable, DNS, o `ENFORCE_BRAND_DOMAIN`.**

### Checklist de decisión (para firmar antes de tocar nada)

- [ ] **¿El dominio canónico es `www.plastilonas.com` o `plastilonas.com`
      (apex)?** — Marcar uno. Implicaciones:
  - `www`: más común en configuraciones de CDN/SSL tradicionales; requiere
    un registro `A`/`ALIAS` en el apex redirigiendo a `www` (o el propio
    registrador resolviendo el apex).
  - Apex (sin www): más corto, más "moderno"; requiere que el proveedor DNS
    soporte `ALIAS`/`ANAME` en el apex hacia Vercel (no todos lo soportan
    igual que un `CNAME` en `www`).
- [ ] Confirmar cuál de los dos documentos (`HUMAN-GATES.md` §1 o
      `mudanza-plastilonas-com.md` §6.2) se actualiza para reflejar la
      decisión final — **el otro debe corregirse en el mismo cambio**, no
      quedar contradiciéndose.
- [ ] Confirmar que el registro `MX` de `ventas@plastilonas.com` (correo) no
      depende de los registros `A`/`AAAA`/`CNAME` del sitio web que van a
      cambiar (ya señalado en `mudanza-plastilonas-com.md`, Día −1).
- [ ] Orden de aplicación acordado (no se ejecuta en esta sesión):
      DNS → SSL emitido en Vercel → variable de entorno → redeploy →
      **solo entonces** `ENFORCE_BRAND_DOMAIN=true`.
- [ ] Firma / aprobación del dueño del negocio antes de que cualquier
      persona (humana o agente) toque `NEXT_PUBLIC_CANONICAL_HOST`,
      `CANONICAL_ORIGIN`, o `ENFORCE_BRAND_DOMAIN` en Vercel.

**Explícitamente no se hizo en esta sesión:** no se puso
`ENFORCE_BRAND_DOMAIN=true`, no se cambió `NEXT_PUBLIC_CANONICAL_HOST`, no
se tocó Vercel → Domains.

---

## 6. Gate — proyectos `verificado`

Los 5 borradores de `lib/projects.ts`, todos con `verificado: false` (sin
cambios en esta sesión):

| Slug | Título | Sector |
|---|---|---|
| `ventilacion-contratista-minero-peru` | Mangas de ventilación para tramos subterráneos | Minería |
| `malla-fundo-costa` | Malla de protección de cultivo en costa | Agroexportación |
| `toldos-flota-lima` | Toldos a medida para flota de carga | Transporte / logística |
| `almacen-temporal-infraestructura` | Almacén textil temporal de obra | Construcción |
| `exportacion-colombia-senal` | Suministro internacional con señal hacia Colombia | Exportación (minería) |

El proceso de autorización completo, ficha por ficha, con las cinco
preguntas que el área comercial debe responder por escrito antes de cambiar
una sola línea (`verificado: false` → `true`), está en
`docs/verificacion-proyectos-pendientes.md`. No se repite aquí porque ya
es ejecutable tal cual está. **Ninguna ficha se marcó verdadera en esta
sesión.**

---

## 7. CI — `probar:dinero` (decisión: no cablear todavía)

`scripts/probar-dinero.sh` + `scripts/camino-dinero.mjs` **ya existen** y
ya implementan exactamente el contrato pedido:

- Compila (o reutiliza `.next`), levanta `next start`, espera con polling a
  `/version.json`, mide, y apaga el proceso completo (grupo, no solo el
  padre) pase lo que pase.
- `camino-dinero.mjs` línea 40: `HAY_CLAVE = Boolean(process.env.ANTHROPIC_API_KEY)`
  — el propio script ya sabe correr en dos tramos: con clave (visión real) y
  sin clave (degrade a 503 + aviso en UI, línea ~244).

**Decisión de esta entrega: no añadir el paso a `ci.yml` todavía.** Razón:
el job `verificar` ya corre en serie `tsc → vitest → seo:all → next build →
auditar → facts → auditar:imagenes → auditar:viewport → navegacion`, y
`probar:dinero` levanta un servidor real, compila con `--build` opcional, y
puede tardar minutos adicionales — el mandato de esta sesión es "decidir,
no titubear", así que la decisión es: **el owner debe pegar el paso
manualmente si quiere ese costo de tiempo en cada push**, no que un agente
lo imponga sin que nadie mida el impacto en la duración del pipeline.

### Paso exacto para pegar (si el dueño decide que sí)

En `.github/workflows/ci.yml`, después del step "Build de producción" y
antes de "Auditar el HTML generado" (o después de todos los demás — el
único requisito real es que exista `.next/BUILD_ID`, que "Build de
producción" ya deja listo):

```yaml
      - name: Camino del dinero (Tramo 1 sin clave; Tramo 2 con clave si existe)
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: npm run probar:dinero
```

Cumple las tres condiciones pedidas sin cambios en el script:

- **Tramo 1 pasa con Anthropic sin definir** — `secrets.ANTHROPIC_API_KEY`
  vacío en GitHub Actions se traduce en una env var vacía, y
  `camino-dinero.mjs` ya trata `""` como "sin clave" (`Boolean('')` es
  `false`).
- **Tramo 2 (visión real) solo si el secret existe** — automático por el
  mismo `Boolean(...)`.
- **No depende de Supabase ni del webhook del CRM** — el script mide contra
  `localhost`, un servidor `next start` recién compilado en el runner, sin
  red externa salvo la llamada real a Anthropic en Tramo 2.

No se aplicó este diff en esta entrega — queda listo para pegar cuando el
dueño decida absorber el tiempo extra en CI.

---

## 8. Los 32 WebP sin citar — tabla de decisión (NO se borra nada)

Del inventario ya hecho en `docs/entregas/2026-09-21-asistente-listo-para-cotizar.md`
(`npm run auditar:imagenes`: 517 archivos, 201 rutas citadas, 0 errores, 0
avisos — reconfirmado en esta sesión, mismo resultado):

| Grupo | Archivos | Peso aprox. | Candidato a cablear | O archivar |
|---|---|---|---|---|
| `/images/industria/*` (variantes de ilustración no cableadas) | 17 | ~700 KB | Hubs de `/industria/<sector>` — cada sector ya tiene imágenes citadas; estas son variantes alternativas del mismo set editorial | Si no hay plan de rotar/A-B testear la ilustración por sector, archivar |
| `/images/proceso/*-2.webp` (segundas tomas no cableadas) | 12 | ~250 KB | Páginas de proceso (`/proceso/...` o equivalentes) que hoy usan solo la toma `-1`/principal — estas son la segunda toma del mismo evento | Si el diseño de esas páginas no tiene un slot para foto secundaria, archivar |
| `/images/galeria/geomembranas-pvc-*-2.webp` | 3 | ~500 KB | `/productos/.../geomembranas-pvc` o la galería de esa familia — son segundas tomas de detalle/escala/instalación ya usadas en su versión principal | Candidato fuerte a **cablear**: geomembranas PVC es línea de catálogo activa; una galería de 2 fotos por variante en vez de 1 mejora la página de producto sin inventar nada |

**Total: 32 archivos, ~1,6 MB.** Cero se borró, cero se re-codificó, cero se
renombró en esta sesión. La decisión de cablear o archivar cada grupo es
editorial — corresponde al dueño del contenido, no a este runbook. Si la
respuesta es **"YES ARCHIVE"** para alguno de los tres grupos, se abre un
PR separado que solo mueve esos archivos a una carpeta de archivo (o los
deja fuera del build de Next sin tocar el binario) — nunca en esta misma
entrega de docs/CI.

---

## 9. Smoke de producción — NO ejecutado (nota de red, no de funcionalidad)

**Intento real en esta sesión:** se preparó un script de Playwright
(`chromium` headless preinstalado en el entorno) para navegar
`https://plastilonas-peruanas-sac.vercel.app` y recorrer producto →
"Preguntar a Plastilonas AI" → `/asistente?producto=...` → chip-confirm →
`/cotizacion` prefilled.

**Resultado:** la política de red saliente de esta sesión en la nube
**rechaza** la conexión al host de producción:

```
gateway answered 403 to CONNECT (policy denial or upstream failure)
host: plastilonas-peruanas-sac.vercel.app:443
```

Confirmado contra el endpoint de diagnóstico del proxy
(`/__agentproxy/status`, `recentRelayFailures`). Esto es una restricción de
egress de esta sesión concreta, no un fallo del sitio — no se puede rodear
sin violar la política, y no se debe fingir un resultado que no se obtuvo.

**Lo que esto significa en la práctica:** el smoke de producción (mandato
sección I) queda **pendiente de ejecución manual** por el dueño, desde un
navegador o sesión con acceso normal a internet. Pasos exactos a seguir
(recomendado: hacerlo a mano en <10 minutos, o pedirle a un agente con
acceso de red sin restricción de host que corra el mismo script):

1. Abrir cualquier producto real en `https://plastilonas-peruanas-sac.vercel.app`.
2. Clic en "Preguntar a Plastilonas AI" → confirmar que aterriza en
   `/asistente?producto=<slug>`.
3. En el asistente: confirmar cantidad, ciudad, aplicación y contacto vía
   el chip de confirmación (no asumir que el LLM llena `buildRFQ` solo).
4. Confirmar que aparece "Listo para cotizar".
5. Confirmar que `/cotizacion` llega prellenado (producto + ciudad,
   `origen=asistente`).
6. Confirmar que el brief que se arma para WhatsApp coincide con lo
   confirmado, y que **no** aparece ningún precio.
7. Registrar pass/fail (capturas si es barato) — el lugar natural es
   añadir una sección a esta misma tabla, actualizando este archivo.

**Split honesto que sigue siendo cierto sin este smoke:** el camino del
comprador (asistente → `/cotizacion` → WhatsApp) ya está cubierto por 1234
pruebas automatizadas en verde y por la entrega del 2026-09-21, que sí lo
probó en navegador. Lo que falta probar aquí es específicamente la
build de producción actual, no la lógica.

---

## 10. Árbol fantasma anidado

Ya confirmado en la sección 0: no existe `./Plastilonas-Peruanas-SAC/`
dentro del checkout. **Regla permanente: nunca re-clonar este repositorio
dentro de su propia raíz** — fue la causa original de que `**/*.tsx` en
`tsconfig.json` recogiera un árbol de septiembre-20 con `FeaturedDeck` y
`FamilyCarousel` ya eliminados, produciendo errores de tipos falsos.

---

## Qué NO se hizo en esta entrega (por mandato, no por olvido)

- No se reabrió ningún sprint E–I, no se tocó `ProjectDraft`, readiness,
  honestidad de visión, ni el camino del dinero de `CotizacionForm`.
- No se restauró `FeaturedDeck` ni `FamilyCarousel`.
- No se cambió DNS, `ENFORCE_BRAND_DOMAIN`, ni `NEXT_PUBLIC_CANONICAL_HOST`.
- No se marcó ningún proyecto `verificado: true`.
- No se tocó ningún binario de `public/` (ni recodificado, ni borrado, ni
  renombrado) — los 32 WebP siguen exactamente donde estaban.
- No se creó un segundo CRM, segundo frontend, segundo bucket, ni se
  cableó Stripe/fine-tune/vector DB.
- No se ejecutó `npm run probar:dinero` dentro de `ci.yml` — el diff queda
  listo para pegar, decisión pendiente del dueño.

## Definición de hecho — checklist final

- [x] El dueño puede ejecutar Storage + webhook en <30 minutos solo con
      este documento (secciones 2 y 3, autocontenidas, con SQL y variables
      exactas).
- [x] Remotos confirmados `main`-only.
- [ ] Smoke de producción registrado — **bloqueado por política de red de
      esta sesión**, pendiente de ejecución manual (sección 9).
- [x] Cero mutaciones de binarios de media.
- [x] Cero reescritura de `ProjectDraft`/readiness.
- [x] Sin flips de DNS / sin flips de `verificado`.
