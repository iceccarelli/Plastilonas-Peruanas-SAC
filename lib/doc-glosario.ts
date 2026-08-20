import { terminos, terminosPorCategoria, categoriasPresentes, categoriaLabels, formasDe } from './glosario';
import { GLOSARIO_VERSION } from './glosario-feed';
import { SITE } from './site';
import {
  callout, finishDoc, heading, note, paragraph, specTable, startDoc, subheading,
  type Ctx,
} from './pdf-kit';

/**
 * GLOSARIO COMPLETO EN PDF.
 *
 * Por qué un solo documento y no cuarenta y tres. Un glosario se consulta
 * entero: se imprime, se deja en la oficina técnica, se reparte al equipo
 * nuevo. Trocearlo en un PDF por término lo volvería inútil justo en el uso
 * para el que sirve el papel.
 *
 * Por qué existe en PDF si ya está en la web. Porque circula distinto. El
 * documento que un jefe de planta reenvía a su equipo con "esto es lo que hay
 * que entender antes de pedir" es un adjunto, no un enlace. Y porque en obra,
 * sin señal, el enlace no existe.
 *
 * REGLA: mismas definiciones que la web, generadas de la misma fuente. Un
 * glosario impreso que diverge del publicado es peor que no tenerlo.
 */

export async function buildGlosarioPdf(generatedAt: string): Promise<Uint8Array> {
  const ctx: Ctx = await startDoc({
    title: 'Glosario técnico de textiles industriales y geosintéticos',
    subject: `${terminos.length} términos del rubro definidos con precisión: qué significan, cómo se miden y qué deciden en obra.`,
    keywords: ['glosario', 'textiles industriales', 'geosintéticos', 'ventilación minera', 'Perú'],
    h1: 'Glosario técnico',
    kicker: `${terminos.length} términos  |  Versión ${GLOSARIO_VERSION}  |  Textiles industriales, geosintéticos, ventilación y mallas`,
  });

  paragraph(
    ctx,
    'Antes de elegir un producto hay que entender qué se está pidiendo. Estos términos son el vocabulario con el que se especifica en este rubro: qué significa cada uno, en qué unidad se mide y qué decide en obra.',
    10.5,
  );

  callout(
    ctx,
    'Uso y cita',
    `Las definiciones describen el término en el rubro, no productos de un proveedor: son útiles aunque el proyecto se compre a otra empresa. Consulta y cita libres indicando la fuente. Cita sugerida: ${SITE.legalName} — Glosario técnico, ${SITE.url}/glosario`,
  );

  note(
    ctx,
    'Ninguna definición incluye cifras normativas. Cuando un número lo respalda una norma, el término remite a la guía que lo documenta con su fuente.',
  );

  for (const c of categoriasPresentes()) {
    const items = terminosPorCategoria(c);
    heading(ctx, `${categoriaLabels[c]}  (${items.length})`);
    for (const t of items) {
      subheading(ctx, t.siglas ? `${t.termino}  (${t.siglas})` : t.termino);
      const otras = formasDe(t).slice(1);
      if (otras.length) note(ctx, `También: ${otras.join(' · ')}`);
      paragraph(ctx, t.definicionCorta, 10);
      for (const p of t.definicion) paragraph(ctx, p, 9);
      const filas: { label: string; value: string }[] = [];
      if (t.comoSeMide) filas.push({ label: 'Cómo se mide', value: t.comoSeMide });
      filas.push({ label: 'Por qué importa', value: t.porQueImporta });
      if (t.errorFrecuente) filas.push({ label: 'Error frecuente', value: t.errorFrecuente });
      filas.push({ label: 'Definición en línea', value: `${SITE.url}/glosario/${t.slug}` });
      specTable(ctx, filas);
    }
  }

  heading(ctx, 'Sobre este glosario');
  paragraph(
    ctx,
    `Se genera desde la misma fuente que alimenta ${SITE.url}/glosario, de modo que la versión impresa y la publicada nunca divergen. Crece con las preguntas que llegan de obra: si en su operación hay un término que no está definido, escríbanos a ${SITE.email}.`,
  );
  note(
    ctx,
    `Versión legible por máquina, para integraciones y agentes: ${SITE.url}/glosario/terminos.json`,
  );

  return finishDoc(ctx, `${SITE.url}/glosario`, generatedAt);
}
