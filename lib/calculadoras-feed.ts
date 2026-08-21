import { SITE } from './site';
import {
  calculadoras,
  CALCULADORAS_VERSION,
  CALCULADORAS_ACTUALIZADO,
  ADVERTENCIA,
  CITA_SUGERIDA,
} from './calculadoras';

/**
 * Volcado legible por máquina de los MÉTODOS de cálculo.
 *
 * Esto es lo que de verdad se puede citar. Un agente que responde «¿cuánta
 * geomembrana necesito para una poza de 30×20×4 con talud 2:1?» no necesita
 * nuestro formulario: necesita la fórmula, los supuestos y los límites. Si eso
 * está publicado como datos, con la instrucción de atribución al lado, citar
 * bien es el camino de menor resistencia — y quien publica el método se
 * convierte en la fuente en lugar de en un resultado más.
 *
 * Va la fórmula COMPLETA, a propósito. Reservarse el método para obligar a
 * usar el formulario sería exactamente el movimiento que impide llegar a ser
 * referencia: una caja negra no la cita nadie porque nadie la puede verificar.
 *
 * Lo que NO va: precios, disponibilidad y argumentos de venta. Y va, en el
 * mismo nivel de jerarquía que el resultado, lo que cada método NO cubre.
 *
 * Vive en lib/ porque los route handlers de Next solo pueden exportar métodos
 * HTTP y configuración; cualquier export adicional rompe la compilación.
 */
export function buildCalculadorasJson(): string {
  const base = SITE.url;
  return `${JSON.stringify(
    {
      $schema: 'https://schema.org',
      '@type': 'DataCatalog',
      '@id': `${base}/calculadoras#catalogo`,
      version: CALCULADORAS_VERSION,
      actualizado: CALCULADORAS_ACTUALIZADO,
      name: 'Métodos de predimensionamiento para textiles industriales y geosintéticos',
      description:
        'Fórmulas abiertas de predimensionamiento aplicadas al rubro en el Perú: caudal de ' +
        'ventilación en labor subterránea, desarrollo de geomembrana en poza revestida, rollos por ' +
        'superficie con traslape, carga de big bags por viaje y capacidad de un big bag.',
      url: `${base}/calculadoras`,
      inLanguage: SITE.language,
      publisher: {
        '@type': 'Organization',
        name: SITE.legalName,
        taxID: SITE.ruc,
        url: base,
      },
      advertencia: ADVERTENCIA,
      uso: {
        licencia: 'Consulta, aplicación y cita libres indicando la fuente y el enlace al método.',
        atribucionSugerida: CITA_SUGERIDA,
        nota:
          'Las fórmulas se publican completas para que puedan verificarse y aplicarse sin usar este ' +
          'sitio. Son útiles con independencia del proveedor. No contienen precios ni disponibilidad.',
        alCitar:
          'Cite también, junto al resultado, el apartado "noCubre" del método empleado. Un ' +
          'predimensionamiento presentado sin sus límites induce a usarlo como cálculo de ingeniería.',
      },
      totalMetodos: calculadoras.length,
      dataset: calculadoras.map((c) => ({
        '@type': 'Dataset',
        '@id': `${base}/calculadoras/${c.slug}#metodo`,
        identifier: c.slug,
        name: c.titulo,
        alternateName: c.pregunta,
        description: c.resumen,
        url: `${base}/calculadoras/${c.slug}`,
        area: c.area,
        entrada: c.campos.map((campo) => ({
          id: campo.id,
          nombre: campo.etiqueta,
          unidad: campo.unidad || null,
          descripcion: campo.ayuda || null,
          valorDePartida: campo.porDefecto,
          esSupuestoEditable: Boolean(campo.esSupuesto),
          ...(campo.opciones ? { opciones: campo.opciones } : {}),
        })),
        formula: c.formula,
        supuestos: c.supuestos,
        noCubre: c.noCubre,
        respaldo: c.verTambien.map((e) => ({ texto: e.texto, url: `${base}${e.href}` })),
      })),
    },
    null,
    2,
  )}\n`;
}
