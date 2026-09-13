import { SITE } from './site';

/**
 * ACCIONES COMERCIALES — un solo vocabulario para los botones que cierran.
 *
 * EL PROBLEMA, MEDIDO. El mismo botón —el que lleva al RFQ— estaba escrito de
 * ocho maneras distintas repartidas por el sitio: «Solicitar cotización»,
 * «Solicitar Cotización», «Cotizar ahora», «Solicitar Cotización Personalizada»,
 * «Solicitar Cotización para este producto», «Solicitar cotización técnica».
 * Cada página lo maquetaba a mano, con sus clases y su orden, y ninguno de esos
 * bloques ofrecía WhatsApp —el canal por el que entra la mayoría de las
 * consultas en el Perú— ni declaraba contexto de atribución.
 *
 * Para un comprador industrial que recorre cinco páginas antes de escribir, eso
 * no es variedad: es una puerta distinta en cada habitación. Y para quien mide,
 * son seis eventos que no se pueden sumar.
 *
 * LA REGLA. El texto de una acción comercial vive aquí y sólo aquí. La página
 * decide QUÉ acciones ofrece y con qué destino; no decide cómo se llaman ni
 * cómo se agrupan. test/acciones.test.ts hace fallar el build si una página
 * vuelve a escribir uno de estos botones a mano.
 *
 * LO QUE NO ENTRA: ninguna promesa. Ni plazo de respuesta, ni precio, ni
 * «respuesta inmediata». El SLA que el sitio sí publica vive en su página.
 */

export type IdiomaAccion = 'es' | 'en';

export interface Accion {
  /** Texto visible del botón. Único en todo el sitio para esta acción. */
  label: string;
  /** Destino. Siempre una ruta que existe. */
  href: string;
}

export const ACCIONES = {
  /** La acción principal del sitio: abrir el RFQ. */
  cotizar: { label: 'Solicitar cotización', href: '/cotizacion' },
  /** El RFQ con un producto ya seleccionado. El href lo completa la página. */
  cotizarProducto: { label: 'Solicitar cotización de este producto', href: '/cotizacion' },
  /** El RFQ de una configuración o de un conjunto de productos. */
  cotizarConjunto: { label: 'Cotizar esta configuración', href: '/cotizacion' },
  /** Cuando lo que corresponde es hablar antes de cotizar. */
  escribir: { label: 'Escribirnos', href: '/contacto' },
  /** Autoevaluación del Marco: sale con un brief descargable. */
  evaluar: { label: 'Comenzar la evaluación', href: '/marco/evaluacion' },
  /** El catálogo completo. */
  catalogo: { label: 'Ver catálogo', href: '/productos' },
} as const satisfies Record<string, Accion>;

export const ACCIONES_EN = {
  rfq: { label: 'RFQ form (in English)', href: '/en/rfq' },
} as const satisfies Record<string, Accion>;

/** Etiqueta del botón de WhatsApp, por idioma. Un solo texto por idioma. */
export const WHATSAPP_LABEL: Record<IdiomaAccion, string> = {
  es: 'Consultar por WhatsApp',
  en: 'WhatsApp sales',
};

/**
 * Mensaje con el que se abre WhatsApp. Lleva los cuatro datos que una
 * cotización necesita —qué, medidas, cantidad, ciudad— en blanco, porque un
 * mensaje que ya los pregunta se responde mucho más completo que un «Hola».
 */
export function mensajeWhatsApp(contexto: string, idioma: IdiomaAccion = 'es'): string {
  return idioma === 'en'
    ? `Hello ${SITE.name}. Enquiry from ${contexto}. Product: ___. Dimensions: ___. Quantity: ___. Destination: ___.`
    : `Hola ${SITE.name}. Consulta desde ${contexto}. Producto: ___. Medidas: ___. Cantidad: ___. Ciudad de entrega: ___.`;
}

/** Etiqueta canónica de una acción, para las pruebas y para los espejos. */
export const ETIQUETAS_CANONICAS: string[] = [
  ...Object.values(ACCIONES).map((a) => a.label),
  ...Object.values(ACCIONES_EN).map((a) => a.label),
  ...Object.values(WHATSAPP_LABEL),
];
