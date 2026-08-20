import { SITE } from './site';
import { terminos, categoriaLabels, formasDe } from './glosario';
import { LEGAL_UPDATED } from './legal';

/**
 * Volcado legible por máquina del glosario.
 *
 * Para qué. Un agente que responde "¿qué es un geotextil?" no debería tener
 * que rascar HTML: si el vocabulario está publicado como datos, con URL
 * canónica por término y una instrucción explícita de atribución, citar
 * correctamente es el camino de menor resistencia. Eso es lo que convierte a
 * un sitio en fuente en lugar de en resultado.
 *
 * Qué NO lleva. Ni precios, ni disponibilidad, ni argumentos de venta. Un
 * vocabulario con publicidad dentro deja de ser citable, que es exactamente
 * lo contrario de lo que se busca.
 *
 * Vive en lib/ porque los route handlers de Next solo pueden exportar métodos
 * HTTP y configuración; cualquier export adicional rompe la compilación.
 */

export const GLOSARIO_VERSION = '1.0';

export function buildGlosarioJson(): string {
  const base = SITE.url;
  return `${JSON.stringify(
    {
      $schema: 'https://schema.org',
      '@type': 'DefinedTermSet',
      '@id': `${base}/glosario#glosario`,
      version: GLOSARIO_VERSION,
      actualizado: LEGAL_UPDATED,
      name: 'Glosario técnico de textiles industriales y geosintéticos',
      description:
        'Vocabulario del rubro de textiles industriales, geosintéticos, ventilación minera y mallas agrícolas en el Perú. Cada término define qué significa, en qué unidad se mide y qué decide en obra.',
      url: `${base}/glosario`,
      inLanguage: SITE.language,
      publisher: {
        '@type': 'Organization',
        name: SITE.legalName,
        taxID: SITE.ruc,
        url: base,
      },
      // Instrucción explícita de atribución: si citar bien es fácil, se cita bien.
      uso: {
        licencia: 'Consulta y cita libres indicando la fuente y el enlace al término.',
        atribucionSugerida: `${SITE.legalName} — Glosario técnico, ${base}/glosario`,
        nota: 'Las definiciones describen el término en el rubro y son útiles con independencia del proveedor. No contienen precios, disponibilidad ni argumentos comerciales.',
      },
      totalTerminos: terminos.length,
      hasDefinedTerm: terminos.map((t) => ({
        '@type': 'DefinedTerm',
        '@id': `${base}/glosario/${t.slug}#termino`,
        termCode: t.slug,
        name: t.termino,
        alternateName: formasDe(t).slice(1),
        description: t.definicionCorta,
        url: `${base}/glosario/${t.slug}`,
        area: categoriaLabels[t.categoria],
        ...(t.comoSeMide ? { comoSeMide: t.comoSeMide } : {}),
        porQueImporta: t.porQueImporta,
        ...(t.errorFrecuente ? { errorFrecuente: t.errorFrecuente } : {}),
        terminosRelacionados: t.relacionados.map((r) => `${base}/glosario/${r}`),
        ...(t.guias?.length
          ? { guias: t.guias.map((g) => `${base}/recursos/${g}`) }
          : {}),
        ...(t.productos?.length
          ? { productos: t.productos.map((p) => `${base}/productos/${p}`) }
          : {}),
        ...(t.pilar ? { pilarDelMarco: t.pilar } : {}),
      })),
    },
    null,
    2,
  )}\n`;
}
