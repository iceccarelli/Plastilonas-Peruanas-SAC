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
      **Ojo:** §6.2 documenta que este archivo y ese runbook no coinciden en si
      el canónico es el apex o `www`; hay que decidirlo por escrito antes.
- [ ] Completar el inventario de URLs del Apache legado en
      `docs/redirects-legado-apache.md` y cargar las redirecciones página a
      página.
- [ ] Search Console + Bing Webmaster: alta de la propiedad www, envío de
      `/sitemap.xml`, y (tras verificar redirecciones) «Cambio de dirección».
      Variables `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` ya
      soportadas en el layout.

## 2. Adjuntos del formulario RFQ (Etapa 2)

- [ ] Crear en Supabase el bucket **`rfq-adjuntos`** (privado) con política
      RLS que permita `INSERT` anónimo y bloquee `SELECT` público. El
      formulario (components/CotizacionForm.tsx) ya sube ahí directo desde el
      navegador cuando `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      existen; sin bucket, el lead viaja con los nombres de archivo y la nota
      «adjuntar por correo».

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
