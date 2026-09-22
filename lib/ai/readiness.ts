/**
 * CHECKLIST DE COMPLETITUD DE RFQ — Sprint B.
 *
 * Sin porcentajes ni puntajes inventados: cada campo es simplemente
 * conocido/desconocido, y "conocido" significa exactamente una cosa —
 * ya llegó de una tool real (`lib/ai/tools.ts`) por la conversación, o del
 * contexto de página ya resuelto en el servidor (`lib/ai/context.ts`). Nunca
 * se intenta adivinar un campo leyendo texto libre del chat con regex: eso
 * sería inventar una señal que no existe.
 *
 * SEÑALES REALES DISPONIBLES HOY:
 *  - producto: `buildRFQ` (payload.producto/slug) o cualquier tarjeta de
 *    producto derivada de `getProduct`/`searchProducts`, o el producto de la
 *    página desde la que se abrió `/asistente` (`PageContext.product`).
 *  - cantidad: `buildRFQ` (payload.cantidad) — el único lugar del esquema
 *    actual que registra una cantidad o medida.
 *  - ciudad: `buildRFQ` (payload.ciudad, ver `RFQPayloadSchema` en
 *    lib/ai/tools.ts) — solo cuando el usuario la dijo explícitamente en el
 *    chat. Sigue sin inferirse de `mensaje` con regex: eso sería leer texto
 *    libre y arriesgar un dato equivocado; la única fuente es el campo
 *    estructurado que la tool ya valida.
 *  - aplicacion: `getApplication` cuando la tool encontró un hub real
 *    (`found: true`) — el nombre del hub es la señal, no una suposición.
 *  - contacto: `buildRFQ` (payload.nombre + payload.telefono/email).
 *
 * SPRINT E.2 — CUATRO FUENTES, UNA SOLA FUSIÓN.
 * Leer sólo el último `buildRFQ` dejaba el bucle a medias: bastaba con que
 * el modelo no volviera a llamar la tool en el turno siguiente para que un
 * chip ya resuelto (la ciudad, por ejemplo) volviera a "desconocido" y
 * "Listo para cotizar" no encendiera nunca. `mergeReadinessSignals` funde
 * las cuatro fuentes reales —borrador del proyecto, `buildRFQ`, resultados
 * de tools y contexto de página— en un único juego de señales, con una
 * precedencia explícita y sin ninguna llamada al modelo de por medio (por
 * eso es probable con fixtures: ver test/ai-readiness-merge.test.ts).
 */

export type ReadinessFieldId = 'producto' | 'cantidad' | 'ciudad' | 'aplicacion' | 'contacto';

export interface ReadinessField {
  id: ReadinessFieldId;
  /** Etiqueta corta para el chip. */
  label: string;
  known: boolean;
  /** Valor real mostrado cuando `known === true` (nunca un placeholder). */
  detail?: string;
  /** Pregunta concreta a insertar en el chat cuando el campo está desconocido. */
  question: string;
}

/** Señales estructuradas reales disponibles en el cliente para armar el checklist. */
export interface ReadinessSignals {
  /** Nombre del producto/familia, si algún origen real ya lo dio. */
  productName?: string | null;
  /** Cantidad o medidas, tal como las armó `buildRFQ`. */
  cantidad?: string | null;
  /** Ciudad de entrega, tal como la armó `buildRFQ` (ver comentario arriba). */
  ciudad?: string | null;
  /** Nombre del hub de aplicación que `getApplication` encontró de verdad. */
  aplicacion?: string | null;
  nombre?: string | null;
  telefono?: string | null;
  email?: string | null;
}

export function buildReadinessChecklist(signals: ReadinessSignals): ReadinessField[] {
  const contactoConocido = Boolean(signals.nombre && (signals.telefono || signals.email));

  return [
    {
      id: 'producto',
      label: 'Producto o familia',
      known: Boolean(signals.productName),
      detail: signals.productName ?? undefined,
      question: '¿Qué producto o familia necesita cotizar?',
    },
    {
      id: 'cantidad',
      label: 'Cantidad o medidas',
      known: Boolean(signals.cantidad),
      detail: signals.cantidad ?? undefined,
      question: '¿Qué cantidad o medidas necesita (m², rollos, unidades)?',
    },
    {
      id: 'ciudad',
      label: 'Ciudad / entrega',
      known: Boolean(signals.ciudad),
      detail: signals.ciudad ?? undefined,
      question: '¿A qué ciudad debe llegar el pedido?',
    },
    {
      id: 'aplicacion',
      label: 'Uso o aplicación',
      known: Boolean(signals.aplicacion),
      detail: signals.aplicacion ?? undefined,
      question: '¿Para qué aplicación o uso lo necesita (por ejemplo: cobertura, ventilación, cultivo)?',
    },
    {
      id: 'contacto',
      label: 'Contacto',
      known: contactoConocido,
      detail: contactoConocido ? signals.nombre ?? undefined : undefined,
      question: 'Para enviarle la cotización, ¿me confirma su nombre y un teléfono o email de contacto?',
    },
  ];
}

/** "Listo para cotizar" solo cuando TODOS los campos requeridos son conocidos. */
export function isReadyToQuote(fields: ReadinessField[]): boolean {
  return fields.every((f) => f.known);
}

// ---------------------------------------------------------------------------
// FUSIÓN DE SEÑALES — Sprint E.2
// ---------------------------------------------------------------------------

/** Recorte de `buildRFQ` que interesa al checklist (lib/ai/tools.ts#RFQPayloadSchema). */
export interface RFQSignalPayload {
  producto?: string | null;
  slug?: string | null;
  cantidad?: string | null;
  ciudad?: string | null;
  nombre?: string | null;
  telefono?: string | null;
  email?: string | null;
}

/** Datos que una tool devolvió de verdad (nunca una suposición sobre el texto). */
export interface ToolSignals {
  /** Nombre de producto de `getProduct`/`searchProducts`, ya resuelto contra el catálogo. */
  productName?: string | null;
  productSlug?: string | null;
  /** Nombre del hub que `getApplication` encontró con `found: true`. */
  aplicacion?: string | null;
}

/** Contexto de página ya resuelto en el servidor (lib/ai/context.ts). */
export interface PageContextSignals {
  product?: { name?: string | null; slug?: string | null } | null;
}

/**
 * Borrador del proyecto — estructuralmente `ProjectDraft`
 * (lib/ai/project-draft.ts). Se declara aquí como shape en vez de importar
 * el módulo para que este archivo siga siendo lógica pura, sin nada que
 * toque `window`: así el test de fixtures corre sin DOM y sin modelo.
 */
export interface ProjectDraftSignals {
  productoSlug?: string;
  productName?: string;
  cantidad?: string;
  ciudad?: string;
  aplicacion?: string;
  nombre?: string;
  telefono?: string;
  email?: string;
}

export interface ReadinessSources {
  /** Lo que la persona confirmó en la UI (y lo que el borrador ya absorbió de las otras fuentes). */
  draft?: ProjectDraftSignals | null;
  /** Último payload de `buildRFQ` de la conversación. */
  rfq?: RFQSignalPayload | null;
  tools?: ToolSignals | null;
  pageContext?: PageContextSignals | null;
}

/** Primer valor no vacío. Una cadena de espacios no es un dato. */
function primero(...valores: Array<string | null | undefined>): string | null {
  for (const valor of valores) {
    if (typeof valor === 'string' && valor.trim()) return valor.trim();
  }
  return null;
}

/**
 * PRECEDENCIA, de más a menos directo:
 *
 *   1. `draft`       — la persona lo escribió y pulsó "Confirmar", o el
 *                      borrador ya absorbió un `buildRFQ` posterior. Es la
 *                      afirmación más directa que existe.
 *   2. `rfq`         — el modelo transcribió al esquema algo que la persona
 *                      dijo en el chat. Real, pero de segunda mano.
 *   3. `tools`       — un dato exacto del catálogo (slug/hub reales).
 *   4. `pageContext` — de dónde venía la persona. La señal más débil: pasar
 *                      por una ficha no es lo mismo que pedir ese producto.
 *
 * Ninguna capa inventa: si las cuatro están vacías para un campo, el campo
 * queda `null` y su chip se queda en "desconocido". Es la respuesta correcta.
 */
export function mergeReadinessSignals(sources: ReadinessSources): ReadinessSignals {
  const { draft, rfq, tools, pageContext } = sources;

  return {
    productName: primero(
      draft?.productName,
      rfq?.producto,
      tools?.productName,
      pageContext?.product?.name,
    ),
    cantidad: primero(draft?.cantidad, rfq?.cantidad),
    ciudad: primero(draft?.ciudad, rfq?.ciudad),
    aplicacion: primero(draft?.aplicacion, tools?.aplicacion),
    nombre: primero(draft?.nombre, rfq?.nombre),
    telefono: primero(draft?.telefono, rfq?.telefono),
    email: primero(draft?.email, rfq?.email),
  };
}

/**
 * Slug del producto para precargar /cotizacion. Misma precedencia que
 * `mergeReadinessSignals`, en su propia función porque el slug NO es una
 * señal del checklist (el chip de producto se enciende con el nombre) pero
 * sí es el dato que no se puede perder: sin slug, /cotizacion no puede
 * preseleccionar el producto y el comprador vuelve a elegirlo a mano.
 */
export function resolveProductSlug(sources: ReadinessSources): string | null {
  const { draft, rfq, tools, pageContext } = sources;
  return primero(draft?.productoSlug, rfq?.slug, tools?.productSlug, pageContext?.product?.slug);
}
