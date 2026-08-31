import type { Product } from './types';
import type { Application } from './applications';
import { SITE, HORARIO } from './site';

/**
 * RESPUESTA DIRECTA — el párrafo que un motor de respuestas puede citar entero.
 *
 * EL PROBLEMA. Un asistente que recibe «¿quién fabrica big bags para minería en
 * Lima?» no lee la página: extrae el fragmento más corto que conteste la
 * pregunta. Si el único texto citable es una descripción de marketing de 90
 * palabras, el asistente resume por su cuenta —y al resumir, redondea. Redondear
 * una especificación es exactamente el fallo que este sitio no puede permitirse.
 *
 * LA REGLA. Esta respuesta se COMPONE de campos reales del catálogo. No hay un
 * campo de texto libre que alguien pueda rellenar a mano, porque ése sería el
 * sitio por donde volvería a entrar una cifra inventada.
 *
 * EL LÍMITE QUE HEREDA. lib/products.ts declara que las líneas `bajo_pedido`
 * —geosintéticos importados, geomembranas, geotextiles, geomallas— NO publican
 * especificaciones numéricas concretas: se definen por proyecto y la ficha
 * técnica la emite el fabricante en la cotización. La misma regla gobierna el
 * prompt del chatbot (app/api/chat/route.ts). Aquí se aplica igual: si el
 * producto es bajo pedido, la respuesta directa dice de qué depende la
 * especificación en vez de dar un número que este repositorio no puede sostener.
 *
 * NUNCA aparece un precio: la venta es B2B por cotización.
 */

const SOURCING_FRASE: Record<string, string> = {
  fabricacion_propia: `Fabricación propia en la planta de ${SITE.addressLocality}, Lima`,
  importacion_directa: 'Importación directa bajo control de la empresa',
  bajo_pedido: 'Línea bajo pedido, producida contra orden',
  partner: 'Suministrado mediante aliado técnico especializado',
};

/** Corta a un número de palabras sin partir una palabra por la mitad. */
export function recortarPalabras(texto: string, maximo: number): string {
  const palabras = texto.trim().split(/\s+/);
  if (palabras.length <= maximo) return texto.trim();
  return `${palabras.slice(0, maximo).join(' ')}…`;
}

export function contarPalabras(texto: string): number {
  return texto.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Respuesta directa de un producto. Objetivo ~40 palabras: lo que cabe en un
 * fragmento destacado y en la respuesta hablada de un asistente.
 */
export function respuestaDirectaProducto(p: Product): string {
  const esBajoPedido = (p.availability ?? 'a_medida') === 'bajo_pedido';
  const origen = SOURCING_FRASE[p.sourcing ?? 'fabricacion_propia'] ?? SOURCING_FRASE.fabricacion_propia;

  const detalle = esBajoPedido
    ? 'Las especificaciones se definen por proyecto; la ficha técnica y el certificado de lote del fabricante se entregan con la cotización'
    : p.specifications
        .slice(0, 2)
        .map((s) => `${s.label}: ${s.value}`)
        .join('. ');

  const frase = `${p.name}: ${p.category.toLowerCase()} para ${p.sector
    .slice(0, 3)
    .join(', ')
    .toLowerCase()}. ${origen}. ${detalle}. Venta B2B por cotización, sin precio de lista.`;

  return recortarPalabras(frase.replace(/\s+/g, ' '), 55);
}

/** Respuesta directa de un hub de aplicación: el problema y qué decide el alcance. */
export function respuestaDirectaAplicacion(a: Application): string {
  const frase = `${a.name}: ${a.problem} Se resuelve a medida desde la planta de ${SITE.addressLocality}, Lima. Para cotizar definimos ${a.questions
    .slice(0, 3)
    .join(', ')
    .toLowerCase()}.`;
  return recortarPalabras(frase.replace(/\s+/g, ' '), 55);
}

/**
 * Mensaje de WhatsApp con el SKU y los campos que hay que definir.
 *
 * Antes decía «Hola, necesito una cotización de X». El comercial recibía un
 * nombre y tenía que pedir todo lo demás, y cada ida y vuelta pierde una parte
 * de los interesados. Ahora el propio mensaje trae el SKU —que es lo que
 * identifica la ficha sin ambigüedad— y la lista de datos que la cotización
 * necesita, sacada de las etiquetas de especificación reales del producto: el
 * comprador la completa antes de enviar y el primer mensaje ya sirve para
 * cotizar.
 */
export function rfqWhatsAppProducto(p: Product): string {
  // Primera línea: el guion de los «4 datos para cotizar», con los huecos a
  // la vista. El SKU sigue viajando debajo: identifica la ficha sin
  // ambigüedad y el comprador no tiene que escribirlo.
  return [
    `Hola, quiero cotizar ${p.name}. Medidas/cantidad: ___. Ciudad de entrega: ___.`,
    `SKU: ${p.id} — ${p.slug}`,
  ].join('\n');
}

/** El mismo mecanismo para un hub de aplicación: sus preguntas son el formulario. */
export function rfqWhatsAppAplicacion(a: Application): string {
  return [
    `*SOLICITUD DE COTIZACIÓN (RFQ)*`,
    `Aplicación: ${a.name}`,
    '',
    'Para definir el alcance necesito indicar:',
    ...a.questions.map((q) => `· ${q}: `),
    '· Ciudad de entrega: ',
  ].join('\n');
}


/**
 * RESPUESTA DIRECTA DE UNA CUÑA COMERCIAL.
 *
 * Va ARRIBA del hub, antes de la prosa, y no por estética: los datos de 2026
 * sobre qué citan los motores de respuesta muestran que el 44 % de las citas
 * sale del primer 30 % del contenido, y que lo que se recupera son bloques
 * autocontenidos, densos en entidades y en lenguaje definido. Este párrafo es
 * ese bloque.
 *
 * Se COMPONE de campos reales —cuántas líneas agrupa el frente, cuántas se
 * confeccionan en planta, la razón social, el RUC, el año, el checklist del
 * RFQ y el horario—, nunca de texto libre. Así no hay dónde escribir una cifra
 * inventada, y cuando el catálogo cambie, el párrafo cambia solo.
 */
export function respuestaDirectaCuna(
  cuna: { titulo: string; checklist: { dato: string }[] },
  hijos: Product[],
): string {
  const propias = hijos.filter((p) => p.sourcing === 'fabricacion_propia');
  const suministro = hijos.length - propias.length;

  const origen =
    suministro === 0
      ? `las ${hijos.length} se confeccionan en la planta de Chorrillos (Lima, Perú)`
      : `${propias.length} de ${hijos.length} se confeccionan en la planta de Chorrillos ` +
        `(Lima, Perú) y ${suministro === 1 ? 'la restante es' : 'las restantes son'} ` +
        `suministro declarado en su ficha`;

  const datos = cuna.checklist.map((c) => c.dato.toLowerCase()).join(', ');

  return (
    `${cuna.titulo}: ${origen}. ` +
    `${SITE.legalName}, RUC ${SITE.ruc}, fabrica textil industrial en el Perú desde ` +
    `${SITE.foundingYear}. Se cotiza contra especificación —${datos}— y no hay lista de ` +
    `precios en líneas a medida. La respuesta llega con ficha técnica dentro del horario ` +
    `comercial (${HORARIO.corto}, hora de Lima).`
  );
}
