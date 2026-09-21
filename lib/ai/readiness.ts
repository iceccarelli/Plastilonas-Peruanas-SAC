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
 * SEÑALES REALES DISPONIBLES HOY (y por qué el resto del checklist puede
 * quedar honestamente "desconocido" durante toda la conversación):
 *  - producto: `buildRFQ` (payload.producto/slug) o cualquier tarjeta de
 *    producto derivada de `getProduct`/`searchProducts`, o el producto de la
 *    página desde la que se abrió `/asistente` (`PageContext.product`).
 *  - cantidad: `buildRFQ` (payload.cantidad) — el único lugar del esquema
 *    actual que registra una cantidad o medida.
 *  - ciudad: NINGUNA tool ni `PageContext` capturan ciudad/entrega hoy
 *    (`RFQPayloadSchema` no tiene ese campo). Este campo queda desconocido
 *    hasta que exista una fuente real; no se infiere de `mensaje` porque eso
 *    sería leer texto libre y arriesgar un dato equivocado.
 *  - aplicacion: `getApplication` cuando la tool encontró un hub real
 *    (`found: true`) — el nombre del hub es la señal, no una suposición.
 *  - contacto: `buildRFQ` (payload.nombre + payload.telefono/email).
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
  /** Ciudad de entrega. Hoy no hay tool que la capture (ver comentario arriba). */
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
