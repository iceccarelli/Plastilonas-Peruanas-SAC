import { pillars, totalCriteria, FRAMEWORK_VERSION, FRAMEWORK_UPDATED } from './framework';
import { articles } from './articles';
import { SITE } from './site';
import {
  callout, finishDoc, heading, note, paragraph, specTable, startDoc, subheading,
  type Ctx,
} from './pdf-kit';

/**
 * MARCO DE ESPECIFICACIÓN EN PDF.
 *
 * Por qué es el documento más importante que produce este sitio. Publicar el
 * estándar contra el que se comparan las propuestas cambia la posición de quien
 * lo publica: deja de ser un participante en la comparación y pasa a ser el eje
 * sobre el que se hace. Ese efecto solo ocurre si el documento circula, y los
 * documentos circulan en PDF: se adjunta a un requerimiento, se reparte en una
 * reunión de proyecto, se usa para evaluar a tres proveedores a la vez.
 *
 * REGLA DE HONESTIDAD, la que sostiene todo lo anterior: ningún criterio
 * insinúa que solo nosotros podemos cumplirlo. El marco es útil aunque el
 * proyecto se compre a un competidor — es exactamente por eso que se convierte
 * en referencia y no en un folleto con forma de norma.
 */

export async function buildMarcoPdf(generatedAt: string): Promise<Uint8Array> {
  const ctx: Ctx = await startDoc({
    title: 'Marco de Especificación',
    subject: `Criterios públicos para definir un proyecto textil industrial o geosintético antes de cotizarlo. ${totalCriteria()} criterios en ${pillars.length} pilares.`,
    keywords: ['marco de especificación', 'criterios', 'textiles industriales', 'geosintéticos', 'Perú'],
    h1: 'Marco de Especificación',
    kicker: `Versión ${FRAMEWORK_VERSION}  |  ${totalCriteria()} criterios en ${pillars.length} pilares  |  Actualizado ${FRAMEWORK_UPDATED}`,
  });

  paragraph(
    ctx,
    'Los proyectos textiles industriales y geosintéticos rara vez fallan por el material: fallan por lo que nadie definió. Este marco convierte cada modo de falla documentado en obra en una pregunta verificable, agrupada en seis pilares.',
    10.5,
  );

  callout(
    ctx,
    'Cómo usar este documento',
    'Recorra los criterios antes de pedir cotizaciones y anote cuáles no puede responder con un dato. Los que queden en blanco son el trabajo que falta hacer, no una carencia del proveedor. El marco es de consulta libre y sirve para evaluar cualquier propuesta, incluida la nuestra.',
  );

  note(
    ctx,
    'Ningún criterio insinúa que solo un proveedor pueda satisfacerlo. La autoevaluación puntúa cuán definido está el proyecto del cliente, no a los proveedores: no es un ranking disfrazado.',
  );

  for (const p of pillars) {
    heading(ctx, `Pilar: ${p.nombre}  (${p.criterios.length} criterios)`);
    paragraph(ctx, p.resumen);
    for (const c of p.criterios) {
      subheading(ctx, c.pregunta);
      const filas: { label: string; value: string }[] = [
        { label: 'Qué decide', value: c.porQue },
        { label: 'Qué ocurre si falta', value: c.riesgo },
        { label: 'Peso', value: c.peso === 2 ? 'Crítico (cuenta doble)' : 'Estándar' },
      ];
      // `evidencia` es el slug de la guía que respalda el criterio. Se resuelve
      // al título real: un slug suelto en un PDF impreso no le sirve a nadie.
      const guia = c.evidencia ? articles.find((a) => a.slug === c.evidencia) : undefined;
      if (guia) {
        filas.push({
          label: 'Guía que lo documenta',
          value: `${guia.title} — ${SITE.url}/recursos/${guia.slug}`,
        });
      }
      specTable(ctx, filas);
    }
  }

  heading(ctx, 'Autoevaluación');
  paragraph(
    ctx,
    `La versión en línea incluye una autoevaluación que puntúa cuán definido está su proyecto y genera un brief descargable con lo que falta cerrar: ${SITE.url}/marco/evaluacion. Se ejecuta enteramente en su navegador: las respuestas no se envían a ningún servidor.`,
  );

  heading(ctx, 'Cómo aplicarlo con nosotros');
  paragraph(
    ctx,
    `Si prefiere que revisemos su caso contra estos criterios, envíe lo que tenga definido por WhatsApp al ${SITE.phoneWhatsApp}, en ${SITE.url}/cotizacion o a ${SITE.email}. Devolvemos qué falta cerrar antes de poder cotizar con precisión.`,
  );
  note(
    ctx,
    `Glosario técnico del rubro: ${SITE.url}/glosario  ·  Arquitecturas de referencia: ${SITE.url}/soluciones`,
  );

  return finishDoc(ctx, `${SITE.url}/marco`, generatedAt);
}
