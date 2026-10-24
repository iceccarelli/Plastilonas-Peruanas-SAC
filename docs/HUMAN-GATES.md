# HUMAN GATES — lo que el código dejó listo y una persona debe destrabar

Cada punto está **stubeado**: el sitio compila y funciona sin él, y al
completarlo se activa sin tocar código (o con el cambio mínimo indicado).
Buscar `TODO(HUMAN)` en el repositorio localiza el punto exacto.

## 1. Dominio (Etapa 4)

- [ ] **DNS + SSL de `www.plastilonas.com`** apuntando al proyecto de Vercel
      (Settings → Domains). Hasta entonces el sitio vive en el host de Vercel.
- [ ] Poner `NEXT_PUBLIC_CANONICAL_HOST=https://www.plastilonas.com` en Vercel.
      Retargetea canonicals, sitemaps, OG, JSON-LD y superficies de agentes en
      un solo deploy (lib/site.ts).
- [ ] Confirmado lo anterior EN PRODUCCIÓN, poner `ENFORCE_BRAND_DOMAIN=true`:
      activa el 308 duro vercel.app/apex → www (middleware.ts). **No activar
      antes de que el certificado de www funcione.**
- [ ] **Antes de tocar cualquiera de las variables de arriba**, ejecutar el
      checklist de corte: `docs/mudanza-plastilonas-com.md` §6. Lleva los
      nombres reales de las cuatro variables que el código lee hoy y el orden
      en que se aplican (DNS -> SSL -> variable -> redeploy -> `ENFORCE_BRAND_DOMAIN`).
      El canónico es `www` (decidido en §6.2: el apex se rechaza en código).
- [ ] Completar el inventario de URLs del Apache legado en
      `docs/redirects-legado-apache.md` y cargar las redirecciones página a
      página.
- [ ] Search Console + Bing Webmaster: alta de la propiedad www, envío de
      `/sitemap.xml`, y (tras verificar redirecciones) «Cambio de dirección».
      Variables `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` ya
      soportadas en el layout.

## 2.0 RFQ en producción — estado verificado el 2026-10-24 y acciones solo del propietario

Verificado con la API de Vercel (nombres de variables, sin leer valores): el
proyecto de producción tiene solo `NEXT_PUBLIC_API_URL` y `ANTHROPIC_API_KEY`.
**No hay** `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`,
`STAFF_EMAILS`, `CRM_WEBHOOK_URL` ni `RESEND_API_KEY`; y la organización de
Supabase conectada no tiene ningún proyecto de Plastilonas. Consecuencia:
`/api/lead` responde 503 `not_persisted` (honesto: el comprador es enviado a
WhatsApp) salvo que un canal externo confirme. No se envió ningún lead sintético.

- [ ] Crear el proyecto Supabase de Plastilonas y aplicar, en orden, `schema.sql` y las tres migraciones (ver abajo).
- [ ] En Vercel (Production): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` (aleatorio, ≥32 caracteres), `STAFF_EMAILS`, y al menos un canal: `CRM_WEBHOOK_URL` o `RESEND_API_KEY`.
- [ ] En GitHub (Settings → Secrets → Actions): `CRON_SECRET` (el mismo) y `SITE_ORIGIN` (el origen de producción). Activa `.github/workflows/lead-retry.yml`: reintenta cada 15 min y **falla —con aviso por correo de GitHub— si hay entregas en dead-letter o el endpoint no responde**. El cron diario de `vercel.json` queda de respaldo (Hobby no admite más).
- [ ] Tras configurar: `GET /api/health?deep=1` con el token de diagnóstico debe listar base, almacenamiento y migraciones en verde antes de anunciar el formulario.

## 2.1 Cotización al cliente — qué falta fuera del código

Implementado y probado (vitest sobre Postgres real, recorrido en navegador con
proveedor de correo local): borrador con partidas e impuestos explícitos,
emisión con instantánea inmutable, PDF reproducible, enlace seguro `/oferta/<token>`
(hash en base, vence con la vigencia, se revoca al reemplazar), aceptar/rechazar
una sola vez, entrega con estados `queued / blocked / sent / confirmed / failed / dead`.
**No está conectado ni verificado en producción** hasta completar:

- [ ] Aplicar la migración `20261024000000_quotation_customer_journey.sql` (después de las anteriores). `/api/health?deep=1` marca `migration_quote_journey` en rojo mientras falte.
- [ ] Vercel (Production): `QUOTE_LINK_SECRET` (≥32 caracteres aleatorios; rotarlo invalida los enlaces ya enviados) y `RESEND_API_KEY` con un remitente de **dominio verificado** en Resend (`LEAD_EMAIL_FROM`). Sin ellas, emitir funciona pero la entrega queda **bloqueada** y `/staff` lo dice.
- [ ] Resend → Webhooks: apuntar a `<origen>/api/webhooks/resend` (eventos `email.delivered`, `email.bounced`, `email.complained`) y poner el secreto `whsec_…` en `RESEND_WEBHOOK_SECRET`. Sin esto una entrega nunca pasa de «enviada» a «confirmada».
- [ ] **Confirmar los datos legales que salen en el PDF**: razón social, RUC 20523135385 y domicilio de `lib/site.ts`, antes de emitir la primera oferta real. El PDF no incluye ninguna cifra, plazo, garantía ni impuesto que el personal no haya escrito.
- [ ] Prueba controlada con una dirección propia (no de un cliente): emitir una oferta de ensayo, comprobar la llegada, abrir el enlace, rechazarla con motivo «prueba».

## 2.2 Operación: alertas, estado y migraciones

**Estado del código (implementado y probado; no conectado a producción):**
`/api/health` = vivacidad · `/api/ready?function=rfq|quote|upload` = si el sitio PUEDE servir esa función ahora (escribe en la base, mira el esquema, el bucket y el latido; público y solo con estados) · `/api/health?deep=1` (Bearer `CRON_SECRET`) = detalle: migraciones, bucket privado, entregas muertas/bloqueadas, integridad de ofertas, latido del cron, destino de alertas. El cron deja un latido y evalúa condiciones; las alertas salen **una vez**, se repiten tras 6 h y avisan la recuperación una sola vez.

- [ ] `ALERT_WEBHOOK_URL` (Vercel, Production): Slack/Teams/n8n entrante (https y público; las URL internas se rechazan). Sin él nadie recibe aviso salvo el correo del flujo de GitHub.
- [ ] Probar el canal: GitHub → Actions → «RFQ — reintentos y vigilancia» → Run workflow → marcar *probar_alerta* (o `POST /api/ops/alert-test` con el Bearer). Debe llegar un mensaje rotulado «Prueba».
- [ ] Opcional pero recomendable: un *log drain* de Vercel hacia el sistema de logs que se use; las tasas de error y la latencia por ruta salen de ahí (el sitio emite eventos JSON sin datos personales: `lead_not_accepted`, `delivery_failed`, `oferta_decision_rejected`, `staff_denied`…). El código no mide percentiles de latencia por sí mismo.
- [ ] Tras configurar todo: `EXIGIR_LISTO=1 npm run verify:deploy` debe pasar; sin esa variable `/api/ready` solo se informa.

**Migraciones — orden y despliegue seguro** (todas son aditivas e idempotentes; se aplican en este orden):
`schema.sql` → `20261023000000_rfq_durable_pipeline` → `20261023010000_rfq_attachments_staff` → `20261023020000_rfq_quotations` → `20261024000000_quotation_customer_journey` → `20261024010000_ops_observability` → `20261024020000_commercial_funnel` (solo lectura: habilita `/staff/embudo`).

1. **Antes de aplicar**: backup (Supabase → Database → Backups; con PITR, anotar la hora) y, si hay datos, ensayar en una *branch* de Supabase.
2. **Migrar primero, desplegar después.** El código nuevo exige las funciones nuevas; las migraciones nunca borran columnas ni datos (la única sustitución de funciones —`lead_quote_create/issue`— conserva la llamada antigua válida por parámetros con valor por defecto).
3. Aplicar de una en una en el SQL editor o con `supabase db push`; comprobar `GET /api/health?deep=1`: cada migración tiene su sonda (`migration_*`) y debe pasar a verde.
4. Si algo falla a medias: cada archivo es idempotente, se corrige y se vuelve a ejecutar completo. No hay *down*: el retroceso es restaurar el backup.
5. La CI aplica **todas** las migraciones sobre una base vacía y, aparte, sobre una base con datos del esquema anterior (`test/oferta-ciclo.test.ts`, `test/ops-observabilidad.test.ts`).

**Restauración (ensayo recomendado una vez al configurar y tras cada cambio grande):** restaurar el backup en un proyecto/branch *nuevo*, apuntar un despliegue de *preview* a él y comprobar: `GET /api/health?deep=1` (todo verde), `select public.quote_integrity_report();` → `hashMismatch = 0` e `issuedWithoutSnapshot = 0` (toda oferta emitida conserva su huella; las emitidas antes de la migración de cotizaciones aparecerán en `issuedWithoutSnapshot` y es esperado), y abrir un enlace de oferta de prueba. Un ensayo equivalente con datos sintéticos corre en CI (`restauración…` en `test/ops-observabilidad.test.ts`); **no sustituye** el ensayo real con el backup de Supabase, que no se ha hecho (no existe aún el proyecto).

## 2. Adjuntos del formulario RFQ (Etapa 2) y fotos de /asistente (Sprint C)

- [ ] Aplicar en Supabase, en orden, `supabase/schema.sql`,
      `supabase/migrations/20261023000000_rfq_durable_pipeline.sql` y
      `supabase/migrations/20261023010000_rfq_attachments_staff.sql` y
      `supabase/migrations/20261023020000_rfq_quotations.sql` (cotizaciones
      versionadas, funciones `lead_quote_*`) y
      `supabase/migrations/20261024000000_quotation_customer_journey.sql`
      (partidas, instantánea inmutable con SHA-256, enlaces seguros, entrega de
      cotizaciones y límite de tasa compartido). La segunda
      **crea el bucket privado `rfq-adjuntos`** (20 MB, sin políticas anónimas).
      Los navegadores suben con URLs firmadas que emite `/api/lead/upload-url`;
      ya no se necesita ninguna política RLS de INSERT anónimo. Sin la
      migración el formulario manda los adjuntos como «adjuntar por correo».
- [ ] **Antivirus / análisis de contenido de adjuntos: NO existe.** Hoy cada adjunto solo pasa por tipo, tamaño (20 MB) y comprobación de la cabecera contra la extensión (pdf/jpg/png/dwg/dxf), y el personal lo descarga como archivo (URL firmada de 5 min), nunca en línea; `/staff` lo marca «no verificado». Nada en el sitio dice que un archivo fue escaneado. Si se quiere escaneo, hace falta un servicio externo (p. ej. ClamAV en un worker o un API de pago) con credenciales del propietario; hasta entonces no se debe afirmar lo contrario.
- [ ] Vercel: `STAFF_EMAILS` (correos del personal, separados por coma) y
      credenciales de Google en Auth.js. `/staff` solo admite esos correos con
      login Google; sin la variable nadie entra.
- [ ] **MISMO bucket**, prefijo `asistente/` — no se creó un segundo bucket.
      Las fotos que se suben en /asistente (components/ai/AsistenteWorkspace.tsx,
      lib/ai/vision-upload.ts#archiveVisionImage) intentan una copia
      best-effort ahí con el MISMO patrón (`supabaseBrowser`, nunca
      `supabaseAdmin`). A diferencia del formulario de RFQ, el análisis de la
      foto (`/api/vision`) NO depende de que esta copia tenga éxito: la foto
      viaja en base64 directo al endpoint, así que el análisis funciona
      aunque el bucket siga sin existir — lo único que falta sin el bucket es
      quedarse con una copia de la foto para revisión posterior.

## 3. Operación comercial (Etapa 5)

- [ ] `CRM_WEBHOOK_URL` (o el heredado `N8N_WEBHOOK_URL`): endpoint que recibe
      cada lead en JSON. Sin la variable, el lead queda en Supabase (si está
      configurado) y en WhatsApp. **Cómo filtrar por superficie de origen
      (`configurador-lona`, `chat`, `calculadora`, `industria:<slug>`) dentro
      del flujo de n8n: `docs/origen-de-los-leads.md`.**
- [ ] `RESEND_API_KEY` + `LEAD_EMAIL_TO` (opcional): copia de cada RFQ por
      correo a ventas. Sin las variables no se envía nada y nada falla.
- [ ] `ANTHROPIC_API_KEY` para el asistente del sitio (ya soportado; sin la
      clave el widget ofrece WhatsApp).

## 4. Evidencia visual y de proyectos (Etapas 3 y 6)

- [ ] **Fotografía de planta real** para reemplazar las imágenes referenciales
      del hero (components/HeroImagen.tsx muestra hoy la leyenda «imagen
      referencial»). Encargos y ranuras pendientes: `docs/encargo-imagenes.md`.
- [ ] **Fichas de proyecto autorizadas**: lib/projects.ts tiene 5 borradores
      con `verificado: false`. Publicar una exige autorización escrita del
      cliente; al poner `verificado: true` la ficha aparece en /proyectos sin
      tocar la página. **Las cinco fichas, una a una, con la lista de lo que el
      área comercial debe confirmar antes de ese cambio:
      `docs/verificacion-proyectos-pendientes.md`.**
- [ ] **Google Business Profile** de la planta de Chorrillos (dueño humano);
      cuando exista, añadir su URL a `SITE.sameAs`.
- [ ] Limpiar el Instagram antes de añadirlo a `sameAs` (regla del encargo:
      Facebook + LinkedIn solamente, por ahora).

## 5. WhatsApp Business (fuera de alcance del agente)

- [ ] Verificación / API de WhatsApp Business para el +51 924 875 632. El
      sitio usa enlaces `wa.me`, que funcionan sin la API.

## 6. Datos a verificar (marcados VERIFY en el código)

- [ ] `SITE.isicV4 = 2220` contra la ficha RUC real (lib/site.ts).
- [ ] Año de constitución 2009 contra la escritura (lib/site.ts, `foundingYear`).

## 7. IA, buscadores y medición — decisiones que son del propietario

- [ ] **Rastreadores de entrenamiento de IA.** Hoy `robots.txt` permite TODOS (19 agentes), como estaba. El código separa dos clases (`lib/ai-crawlers.ts`): *búsqueda/respuesta* (Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Applebot) y *entrenamiento* (GPTBot, ClaudeBot, anthropic-ai, Google-Extended, Applebot-Extended, Amazonbot, Bytespider, CCBot, cohere-ai, Meta-ExternalAgent). **Recomendación** (comercial, revisable): dejar permitidos los de búsqueda; permitir también GPTBot, ClaudeBot y Google-Extended mientras el catálogo público no tenga precios ni datos de clientes (hoy no los tiene) para que los modelos describan bien a la empresa; y excluir Bytespider, CCBot, cohere-ai y Meta-ExternalAgent, que no devuelven visitas a un proveedor industrial peruano. Para excluir **todos** los de entrenamiento: `AI_TRAINING_CRAWLERS=block` en Vercel (sin redeploy de código). Para la recomendación mixta, editar las dos listas. `robots.txt` es una petición, no un control: un rastreador que la ignora solo se frena en el cortafuegos de Vercel.
- [ ] **Medir al asistente antes de tocar su prompt, modelo o catálogo:** `ANTHROPIC_API_KEY=… npx next start -p 4000` y `npm run evaluar:asistente -- http://localhost:4000` (24 preguntas reales: selección de las cuatro líneas, especificaciones, RFQ, precio, plazo, certificaciones, producto no soportado, obras inventadas, inyección de prompt, datos sensibles, comparación con competidores). Cuesta centavos; no corre en CI. Mide a NUESTRO asistente, no si ChatGPT o Gemini nos recomiendan: eso solo se comprueba preguntando a mano (`npm run seo:prompts` genera el banco) y anotando fecha y resultado.
- [ ] **Perfiles oficiales y enlaces de seguimiento:** el repositorio enumera Facebook y LinkedIn como oficiales (`SITE.sameAs`); desde este entorno no se pudo comprobar que sigan existiendo ni que coincidan nombre, dirección y teléfono (egress bloqueado a redes sociales). Verificarlo a mano y, si falta algún perfil, añadirlo a `SITE.sameAs` solo cuando el propietario confirme que es suyo. No se publica en redes por API sin credenciales oficiales del propietario.
- [ ] **Search Console y Bing Webmaster:** sin acceso desde aquí. Cuando existan, las cifras de impresiones/clics se leen ahí; este repositorio **no** estima posiciones ni indexación.
- [ ] **Analítica:** `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_GTM_ID` no están en Vercel (verificado el 2026-10-24: solo `NEXT_PUBLIC_API_URL` y `ANTHROPIC_API_KEY`). Hoy no se carga ningún script de analítica y, por tanto, `rfq_start` no llega a ningún proveedor. El embudo de servidor (`/staff/embudo`) no depende de ellos.
