import type { Solution } from './solutions';
import { products } from './products';
import { articles } from './articles';
import { pillars } from './framework';
import { SITE } from './site';
import {
  bullets, callout, finishDoc, heading, note, paragraph, specTable, startDoc, steps,
  subheading, type Ctx,
} from './pdf-kit';

/**
 * ARQUITECTURA DE REFERENCIA EN PDF.
 *
 * Por qué. Es el documento que un jefe de proyecto necesita para pedir
 * presupuesto interno: la lista de materiales completa con el criterio que
 * gobierna cada pieza, la secuencia de ejecución y los modos de falla. En
 * papel se convierte en la base de un requerimiento de compra.
 *
 * REGLA: no son casos de estudio. El documento declara explícitamente que no
 * describe obras ejecutadas ni clientes. Una configuración técnica verificable
 * contra el catálogo vale más que un caso inventado, y sobrevive a la revisión.
 */

export async function buildArquitecturaPdf(
  s: Solution,
  generatedAt: string,
): Promise<Uint8Array> {
  const ctx: Ctx = await startDoc({
    title: `Arquitectura de referencia - ${s.titulo}`,
    subject: s.metaDescription,
    keywords: [...s.sectores, 'arquitectura de referencia', 'lista de materiales', 'Perú'],
    h1: s.titulo,
    kicker: `Arquitectura de referencia  |  ${s.componentes.length} componentes  |  ${s.sectores.join(', ')}`,
  });

  paragraph(ctx, s.escenario, 10.5);

  callout(
    ctx,
    'Qué es y qué no es este documento',
    'Describe una configuración técnica de referencia: qué componentes forman el conjunto, en qué orden se ejecutan y qué falla al comprar por piezas sueltas. No es un caso de estudio: no declara obras ejecutadas, clientes ni cifras de proyecto. Las cantidades y especificaciones definitivas se establecen en la cotización.',
  );

  if (s.problema.length) {
    heading(ctx, 'El problema');
    bullets(ctx, s.problema);
  }

  heading(ctx, 'Lista de materiales y criterio que gobierna cada componente');
  note(
    ctx,
    'Cada componente referencia una línea real del catálogo. El criterio es lo que decide su especificación: sin ese dato, la pieza no se puede pedir bien.',
  );
  ctx.y -= 4;
  for (const c of s.componentes) {
    const p = products.find((x) => x.slug === c.producto);
    subheading(ctx, `${p?.name ?? c.producto}${c.opcional ? '  (opcional)' : ''}`);
    specTable(ctx, [
      { label: 'Función', value: c.funcion },
      { label: 'Criterio que lo gobierna', value: c.criterio },
      { label: 'Ficha del producto', value: `${SITE.url}/productos/${c.producto}` },
    ]);
  }

  if (s.secuencia.length) {
    heading(ctx, 'Secuencia de ejecución');
    note(ctx, 'El orden no es una sugerencia: invertirlo es la causa de la mayor parte de las correcciones caras.');
    ctx.y -= 4;
    steps(ctx, s.secuencia.map((x) => `${x.paso}. ${x.detalle}`));
  }

  if (s.riesgos.length) {
    heading(ctx, 'Modos de falla frecuentes');
    for (const r of s.riesgos) callout(ctx, r.titulo, r.detalle);
  }

  if (s.pilaresClave.length) {
    heading(ctx, 'Pilares del Marco de Especificación que gobiernan este caso');
    specTable(
      ctx,
      s.pilaresClave.map((id) => {
        const pilar = pillars.find((x) => x.id === id);
        return { label: pilar?.nombre ?? id, value: pilar?.resumen ?? '' };
      }),
    );
    note(ctx, `Marco completo y autoevaluación en ${SITE.url}/marco`);
  }

  if (s.guias.length) {
    heading(ctx, 'Guías que documentan cada paso');
    specTable(
      ctx,
      s.guias.map((g) => {
        const a = articles.find((x) => x.slug === g);
        return { label: a?.title ?? g, value: `${SITE.url}/recursos/${g}` };
      }),
    );
  }

  if (s.faqs.length) {
    heading(ctx, 'Preguntas frecuentes');
    for (const f of s.faqs) {
      subheading(ctx, f.q);
      paragraph(ctx, f.a);
    }
  }

  heading(ctx, 'Cómo cotizar este conjunto');
  paragraph(
    ctx,
    `Envíe dimensiones, condiciones del emplazamiento y plazo por WhatsApp al ${SITE.phoneWhatsApp}, en ${SITE.url}/cotizacion o a ${SITE.email}. Devolvemos la especificación de cada componente junto con la cotización.`,
  );
  note(ctx, `Versión en línea con enlaces activos: ${SITE.url}/soluciones/${s.slug}`);

  return finishDoc(ctx, `${SITE.url}/soluciones/${s.slug}`, generatedAt);
}
