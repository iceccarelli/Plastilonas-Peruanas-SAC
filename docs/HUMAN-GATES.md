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

## 2. Adjuntos del formulario RFQ (Etapa 2) y fotos de /asistente (Sprint C)

- [ ] Aplicar en Supabase, en orden, `supabase/schema.sql`,
      `supabase/migrations/20261023000000_rfq_durable_pipeline.sql` y
      `supabase/migrations/20261023010000_rfq_attachments_staff.sql` y
      `supabase/migrations/20261023020000_rfq_quotations.sql` (cotizaciones
      versionadas, funciones `lead_quote_*`). La segunda
      **crea el bucket privado `rfq-adjuntos`** (20 MB, sin políticas anónimas).
      Los navegadores suben con URLs firmadas que emite `/api/lead/upload-url`;
      ya no se necesita ninguna política RLS de INSERT anónimo. Sin la
      migración el formulario manda los adjuntos como «adjuntar por correo».
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
