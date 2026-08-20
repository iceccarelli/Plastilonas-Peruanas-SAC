import type { Informe } from './informes';
import { fuenteDe } from './informes';
import { SITE } from './site';
import {
  bullets, callout, finishDoc, heading, note, paragraph, specTable, startDoc,
  subheading, type Ctx,
} from './pdf-kit';

/**
 * INFORME DEL SECTOR EN PDF.
 *
 * Es el documento que se adjunta a una presentación interna o a un comité de
 * inversión. Por eso el orden importa: resumen ejecutivo primero, límites
 * ANTES de las fuentes y no escondidos al final, y cada cifra con su organismo
 * y su fecha de verificación al lado.
 *
 * El gráfico no se dibuja en el PDF: se vuelca como tabla. Una barra sin ejes
 * legibles en A4 informa menos que la columna de números, y la tabla se puede
 * copiar a una hoja de cálculo, que es lo que hace quien recibe el documento.
 */

export async function buildInformePdf(i: Informe, generatedAt: string): Promise<Uint8Array> {
  const ctx: Ctx = await startDoc({
    title: `Informe - ${i.titulo}`,
    subject: i.metaDescription,
    keywords: ['informe', 'sector', 'minería', 'agroexportación', 'Perú', 'geosintéticos'],
    h1: i.titulo,
    kicker: `Informe v${i.version}  |  ${i.fecha}  |  ${i.fuentes.length} fuentes oficiales`,
  });

  paragraph(ctx, i.subtitulo, 10.5);

  callout(
    ctx,
    'Cómo leer este informe',
    'Toda cifra lleva el organismo que la publica y la fecha en que la verificamos. Lo marcado como lectura de Plastilonas Peruanas es interpretación técnica nuestra, no dato del organismo. Este informe NO estima el tamaño del mercado de textiles industriales: no existe estadística pública verificable de ese mercado.',
  );

  heading(ctx, 'Resumen ejecutivo');
  bullets(ctx, i.resumenEjecutivo);

  for (const s of i.secciones) {
    heading(ctx, s.heading);
    if (s.cuerpo) for (const p of s.cuerpo) paragraph(ctx, p);

    if (s.indicadores?.length) {
      subheading(ctx, 'Indicadores');
      specTable(
        ctx,
        s.indicadores.map((ind) => {
          const f = fuenteDe(i, ind.fuenteId);
          const variacion = ind.variacion
            ? `  (${ind.variacion.pct > 0 ? '+' : ''}${ind.variacion.pct} % vs ${ind.variacion.base})`
            : '';
          return {
            label: ind.etiqueta,
            value: `${ind.valor}${ind.unidad ? ` ${ind.unidad}` : ''}${variacion}  —  ${ind.periodo}. Fuente: ${f?.organismo ?? 'no declarada'}`,
          };
        }),
      );
    }

    if (s.grafico) {
      // Tabla y no barra: en A4 la columna de números informa más, y se puede
      // copiar a una hoja de cálculo, que es lo que hace quien recibe esto.
      subheading(ctx, s.grafico.titulo);
      note(ctx, `${s.grafico.unidad}. Fuente: ${fuenteDe(i, s.grafico.fuenteId)?.organismo ?? ''}`);
      ctx.y -= 4;
      specTable(
        ctx,
        s.grafico.datos.map((d) => ({
          label: d.etiqueta,
          value: `${d.valor > 0 && s.grafico!.tipo === 'divergente' ? '+' : ''}${d.valor}`,
        })),
      );
      note(ctx, s.grafico.nota);
    }

    if (s.implicacion) {
      callout(ctx, `Lo que implica · lectura de ${SITE.name}`, s.implicacion);
    }
  }

  heading(ctx, 'Qué NO afirma este informe');
  note(ctx, 'Un estudio que no declara sus límites es publicidad con formato de estudio.');
  ctx.y -= 4;
  bullets(ctx, i.limitaciones);

  heading(ctx, 'Fuentes');
  specTable(
    ctx,
    i.fuentes.map((f) => ({
      label: f.organismo,
      value: `${f.titulo}. ${f.respalda}  —  Publicado ${f.publicado}, verificado el ${f.consultado}. ${f.url}`,
    })),
  );

  heading(ctx, 'Cómo aplicarlo a un proyecto');
  paragraph(
    ctx,
    `Si quiere que llevemos estos criterios a un caso concreto, envíe emplazamiento, aplicación, dimensiones y plazo por WhatsApp al ${SITE.phoneWhatsApp}, en ${SITE.url}/cotizacion o a ${SITE.email}.`,
  );
  note(
    ctx,
    `Marco de Especificación: ${SITE.url}/marco  ·  Glosario técnico: ${SITE.url}/glosario  ·  Versión en línea de este informe, con gráficos: ${SITE.url}/informes/${i.slug}`,
  );

  return finishDoc(ctx, `${SITE.url}/informes/${i.slug}`, generatedAt);
}
