import { SITE } from './site';

/**
 * AVISOS LEGALES — descripción factual del comportamiento real del sitio.
 *
 * REGLA QUE GOBIERNA ESTE ARCHIVO: cada afirmación describe algo que el código
 * hace hoy y que se puede verificar leyéndolo. No se declara ninguna práctica
 * de tratamiento que el sitio no ejecute, ningún plazo de garantía, ninguna
 * política de devolución y ninguna certificación. Inventar una cláusula de
 * privacidad es peor que no tenerla: promete un tratamiento que nadie
 * implementó.
 *
 * Origen de cada dato declarado, para que la revisión sea posible:
 *  - Formulario de cotización → components/CotizacionModal.tsx y lib/lead.ts
 *  - Reenvío del lead          → app/api/lead/route.ts (webhook n8n)
 *  - Pago con tarjeta          → app/api/checkout/stripe/route.ts y lib/peru.ts
 *  - Analítica y consentimiento→ components/Analytics.tsx, ConsentBanner.tsx
 *  - Asistente de IA           → app/api/chat/route.ts
 *  - Autoevaluación del marco  → lib/framework-brief.ts (se genera en el navegador)
 *
 * LEY APLICABLE citada: Ley N.º 29733, Ley de Protección de Datos Personales
 * (Perú), y su reglamento. Se cita la norma, no un número de artículo que no
 * pudiéramos respaldar.
 *
 * FECHA: se actualiza a mano cuando cambia el tratamiento, no en cada
 * despliegue. Un aviso legal con fecha automática no acredita nada.
 */

export const LEGAL_UPDATED = '2026-08-19';

export interface LegalSection {
  heading: string;
  body?: string[];
  list?: string[];
}

export const privacidad: LegalSection[] = [
  {
    heading: 'Quién trata sus datos',
    body: [
      `${SITE.legalName}, con RUC ${SITE.ruc} y domicilio en ${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}, Perú, es responsable del tratamiento de los datos personales que usted proporcione a través de este sitio.`,
      `Cualquier consulta sobre este aviso o sobre sus datos se atiende en ${SITE.email} o en el ${SITE.phoneCentral}.`,
    ],
  },
  {
    heading: 'Qué datos recogemos y para qué',
    body: [
      'Este sitio no exige registro para leer nada. El catálogo, las guías técnicas, las fichas en PDF, el Marco de Especificación y las arquitecturas de referencia son de acceso libre y no piden ningún dato.',
      'Los datos se recogen únicamente en tres momentos, y en cada uno usted decide entregarlos:',
    ],
    list: [
      'Solicitud de cotización: nombre, empresa, correo electrónico, teléfono, producto de interés, cantidad y el mensaje que usted escriba. Se usan para preparar y enviarle la cotización solicitada.',
      'Compra con pago en línea: nombre, correo, teléfono, RUC si lo indica, dirección, distrito, provincia, departamento y las referencias de entrega que agregue. Se usan para emitir el comprobante y despachar el pedido.',
      'Conversación con el asistente del sitio: el texto que usted escriba en el chat, para responder su consulta durante esa sesión.',
    ],
  },
  {
    heading: 'Qué NO recogemos',
    list: [
      'No pedimos ni almacenamos números de tarjeta. El pago se procesa íntegramente en la plataforma de Stripe: los datos de la tarjeta se introducen en su entorno y este sitio nunca los recibe.',
      'La autoevaluación del Marco de Especificación se ejecuta enteramente en su navegador. Sus respuestas y el brief que descarga no se envían a ningún servidor, ni al nuestro ni a terceros.',
      'No compramos, vendemos ni alquilamos bases de datos de contactos.',
    ],
  },
  {
    heading: 'Con quién se comparten',
    body: [
      'Los datos se comparten únicamente con los proveedores necesarios para prestar el servicio que usted pidió, y solo con ese fin:',
    ],
    list: [
      'La solicitud de cotización se reenvía a nuestro sistema interno de gestión de pedidos para que un asesor la atienda.',
      'El pago con tarjeta se procesa en Stripe, que actúa como pasarela de pago y aplica sus propias condiciones.',
      'La conversación del asistente se procesa mediante un modelo de lenguaje de Anthropic para generar la respuesta.',
      'El sitio se aloja en la infraestructura de Vercel, que registra datos técnicos de conexión propios de cualquier servidor web.',
      'Si usted nos escribe por WhatsApp, esa conversación ocurre dentro de WhatsApp y se rige por las condiciones de esa plataforma, no por este aviso.',
    ],
  },
  {
    heading: 'Analítica y cookies',
    body: [
      'El sitio puede cargar herramientas de medición de tráfico (Google Analytics, Meta Pixel, Google Tag Manager) para entender qué contenido es útil. Estas herramientas usan cookies e identificadores del navegador.',
      'Cuando el sitio opera con banner de consentimiento activo, ninguna de estas herramientas se carga hasta que usted acepta: su decisión se guarda en el almacenamiento local de su navegador y puede revocarla borrando los datos del sitio.',
      'La preferencia de tema claro u oscuro también se guarda en su navegador y no se envía a ningún servidor.',
    ],
  },
  {
    heading: 'Cuánto tiempo se conservan',
    body: [
      'Las solicitudes de cotización y los datos de pedidos se conservan mientras dure la relación comercial y por el plazo que exige la normativa tributaria y contable peruana para el sustento de operaciones.',
      'Si desea que dejemos de tratar sus datos antes de ese plazo, escríbanos y le indicaremos qué información estamos obligados a conservar y por qué.',
    ],
  },
  {
    heading: 'Sus derechos',
    body: [
      'La Ley N.º 29733, Ley de Protección de Datos Personales, le reconoce los derechos de acceso, rectificación, cancelación y oposición sobre sus datos personales.',
      `Para ejercerlos escriba a ${SITE.email} indicando su nombre y el dato al que se refiere. Le responderemos por el mismo medio. Si considera que su solicitud no fue atendida adecuadamente, puede acudir a la Autoridad Nacional de Protección de Datos Personales.`,
    ],
  },
  {
    heading: 'Cambios en este aviso',
    body: [
      'Si cambia la forma en que tratamos los datos, actualizamos este aviso y su fecha. La fecha se modifica solo cuando cambia el tratamiento: un aviso legal cuya fecha se mueve en cada despliegue no acredita nada.',
    ],
  },
];

export const terminos: LegalSection[] = [
  {
    heading: 'Qué son estas condiciones',
    body: [
      `Estas condiciones describen cómo funciona la relación comercial con ${SITE.legalName} (RUC ${SITE.ruc}) a través de este sitio. No sustituyen a la cotización: lo que se pacta por escrito en cada cotización prevalece sobre cualquier texto general de esta página.`,
    ],
  },
  {
    heading: 'Venta por cotización',
    body: [
      'La mayor parte del catálogo es fabricación a medida y venta entre empresas. Por eso no publicamos precios de lista: cada proyecto se cotiza según especificación, metraje, cantidad y logística de entrega.',
      'El precio, el plazo de entrega, las condiciones de pago y el alcance de la garantía son los que consten en la cotización escrita que reciba. Ninguna cifra publicada en este sitio, en un buscador o en un tercero constituye una oferta de precio.',
    ],
  },
  {
    heading: 'Especificaciones técnicas',
    body: [
      'Las especificaciones, aplicaciones y sectores publicados en cada ficha se mantienen actualizados desde nuestro catálogo y son referenciales para preseleccionar. La especificación definitiva de su proyecto se confirma en la cotización.',
      'Las guías técnicas, el Marco de Especificación y las arquitecturas de referencia son material de consulta: describen criterios de ingeniería y métodos de prediseño reproducibles. No son una memoria de cálculo firmada ni sustituyen la revisión de un profesional responsable de la obra.',
      'Las fichas técnicas y los certificados del fabricante correspondientes al lote suministrado se entregan con la cotización o con el despacho, según corresponda.',
    ],
  },
  {
    heading: 'Compra en línea',
    body: [
      'Las líneas que admiten compra directa se pagan a través de Stripe. La confirmación del pedido y el comprobante se emiten a nombre de los datos que usted registre en el proceso de compra.',
      'Para pedidos a medida, por volumen o con requisitos de entrega en obra, el canal correcto es la cotización, no el carrito.',
    ],
  },
  {
    heading: 'Contenido del sitio',
    body: [
      'Los textos, guías, fichas, criterios y arquitecturas publicados son propiedad de la empresa y pueden citarse indicando la fuente y el enlace. Su reproducción íntegra con fines comerciales requiere autorización escrita.',
      'El Marco de Especificación es de consulta pública y libre, incluso para evaluar propuestas de otros proveedores. Esa es su razón de ser.',
    ],
  },
  {
    heading: 'Disponibilidad del sitio',
    body: [
      'Procuramos que el sitio esté disponible de forma continua, pero no garantizamos ausencia de interrupciones por mantenimiento o por causas ajenas a nuestro control. El canal comercial siempre disponible es el WhatsApp y la central telefónica publicados.',
    ],
  },
  {
    heading: 'Ley aplicable',
    body: [
      'Estas condiciones se rigen por la legislación peruana. Cualquier controversia se somete a los jueces y tribunales del distrito judicial de Lima, salvo pacto distinto en la cotización o el contrato correspondiente.',
    ],
  },
];
