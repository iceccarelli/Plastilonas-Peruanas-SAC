import type { Article } from './articles';
import { SITE } from './site';
import {
  bullets, callout, finishDoc, heading, note, paragraph, specTable, startDoc, steps,
  subheading, type Ctx,
} from './pdf-kit';

/**
 * GUÍA TÉCNICA EN PDF.
 *
 * Por qué. Una guía leída en el navegador se consulta una vez; una guía en PDF
 * entra al expediente técnico, se reenvía al ingeniero residente y se archiva.
 * En una obra sin señal —que es donde se instala la mitad de lo que vendemos—
 * el PDF es la única forma de que el criterio llegue al frente de trabajo.
 *
 * Qué lleva y qué no. Lleva TODO el contenido de la guía, incluidas las
 * fuentes con su URL y la advertencia de alcance: un documento que circula
 * fuera del sitio tiene que poder defenderse solo. No lleva precios, ni
 * disponibilidad, ni argumentos comerciales; solo el criterio técnico y cómo
 * pedirnos una cotización si hace falta.
 */

export async function buildGuiaPdf(a: Article, generatedAt: string): Promise<Uint8Array> {
  const ctx: Ctx = await startDoc({
    title: `Guía técnica - ${a.title}`,
    subject: a.description,
    keywords: [a.category, 'guía técnica', 'especificación', 'Perú'],
    h1: a.title,
    kicker: `${a.category}  |  Guía técnica  |  Actualizada ${a.dateModified}`,
  });

  paragraph(ctx, a.description, 10.5);

  // El alcance va arriba, no en letra pequeña al final: quien recibe el PDF
  // reenviado tiene que saber en la primera página qué puede hacer con él.
  callout(
    ctx,
    'Alcance de este documento',
    'Los métodos y criterios publicados son de ingeniería reproducible y se presentan como orden de magnitud para prediseño. No constituyen una memoria de cálculo firmada. Las cifras normativas deben verificarse contra el texto oficial vigente antes de usarse en un expediente técnico.',
  );

  for (const s of a.sections) {
    subheading(ctx, s.heading);
    if (s.body) for (const p of s.body) paragraph(ctx, p);
    if (s.list) bullets(ctx, s.list);
    if (s.steps) steps(ctx, s.steps);
    if (s.table) {
      // Las tablas de la guía se vuelcan como pares etiqueta/valor: una
      // rejilla real en A4 se desborda con dos columnas de texto largo.
      if (s.table.caption) note(ctx, s.table.caption);
      specTable(
        ctx,
        s.table.rows.map((row) => ({
          label: row[0] ?? '',
          value: row
            .slice(1)
            .map((celda, i) => `${s.table!.headers[i + 1] ?? ''}: ${celda}`)
            .join('   |   '),
        })),
      );
    }
    if (s.callout) callout(ctx, 'Criterio', s.callout);
  }

  if (a.faqs?.length) {
    heading(ctx, 'Preguntas frecuentes');
    for (const f of a.faqs) {
      subheading(ctx, f.q);
      paragraph(ctx, f.a);
    }
  }

  if (a.sources?.length) {
    heading(ctx, 'Fuentes');
    note(ctx, 'Cada fuente indica qué dato concreto respalda.');
    ctx.y -= 4;
    specTable(
      ctx,
      a.sources.map((s) => ({ label: s.label, value: `${s.supports}  —  ${s.url}` })),
    );
  }

  heading(ctx, 'Cómo aplicarlo a su proyecto');
  paragraph(
    ctx,
    `Esta guía es de consulta libre y es útil aunque el proyecto se compre a otro proveedor. Si quiere que apliquemos estos criterios a un caso concreto, envíe medidas, cantidad, aplicación y ciudad de entrega por WhatsApp al ${SITE.phoneWhatsApp}, en ${SITE.url}/cotizacion o a ${SITE.email}.`,
  );
  note(
    ctx,
    `Marco de Especificación completo en ${SITE.url}/marco  ·  Glosario técnico en ${SITE.url}/glosario`,
  );

  return finishDoc(ctx, `${SITE.url}/recursos/${a.slug}`, generatedAt);
}
