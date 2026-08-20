#!/usr/bin/env bash
# =============================================================================
#  P16 — Documentos y datos: que se nos pueda citar, descargar e integrar
#  Plastilonas Peruanas SAC
#
#  Huecos que cierra
#  -----------------
#  1. SOLO LAS FICHAS DE PRODUCTO ERAN DESCARGABLES. Un jefe de proyecto que
#     arma un expediente necesita también la guía, la lista de materiales del
#     conjunto y el criterio contra el que se evaluan las propuestas. Y en obra,
#     sin señal, el enlace no sirve: sirve el archivo. Ahora tienen PDF las 10
#     guías, las 6 arquitecturas, el glosario completo y el Marco.
#
#  2. NO HABÍA DÓNDE ATERRIZAR con la intención "necesito documentación".
#     /descargas reúne todo —PDF y datos— con DataCatalog + DataDownload, para
#     que un agente sepa qué hay y en qué formato sin descubrirlo página por
#     página.
#
#  3. EL CATÁLOGO NO ERA LEGIBLE POR MÁQUINA. /productos/catalogo.json publica
#     las 36 líneas con especificaciones, modo de suministro, ficha en PDF,
#     términos del glosario que las gobiernan y arquitecturas donde encajan.
#     SIN precios y SIN existencias, deliberadamente: un precio en datos
#     abiertos que la cotización no sostiene es la forma más rápida de perder
#     credibilidad ante un comprador y ante un modelo que nos cite.
#
#  4. EL 404 ERA EL DE NEXT, EN INGLÉS, SIN SALIDA. Único punto del sitio donde
#     un visitante en español encontraba una pantalla en blanco de otro idioma.
#
#  Además: el maquetador de PDF estaba embebido en la ficha de producto. Se
#  extrajo a lib/pdf-kit.ts ANTES de escribir el segundo documento — copiarlo
#  cinco veces habría dado cinco cabeceras que divergen y cinco sitios donde
#  corregir el RUC. Las 10 pruebas de la ficha existente siguen pasando.
#
#  20 tests nuevos: los PDF abren de verdad, la generación es determinista
#  (mismos bytes con la misma entrada), el catálogo no filtra precios, los
#  conteos del centro de documentación se derivan de las fuentes y el 404 no
#  es un callejón sin salida.
#
#  Uso:
#    ls aplicar*p16*
#    bash aplicarp16documentos.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ]; then
  echo "ERROR: ejecute este script desde la raíz del repositorio." >&2
  exit 1
fi

# -----------------------------------------------------------------------------
# lib/pdf-kit.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/pdf-kit.ts" <<'P16_EOF'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { SITE } from './site';
import { toWinAnsi } from './pdf-text';

/**
 * MOTOR DE DOCUMENTOS PDF.
 *
 * Por qué existe. La ficha técnica de producto llevaba su propio maquetador
 * privado. Al añadir guías, arquitecturas, glosario y marco, ese código se
 * habría copiado cuatro veces: cuatro cabeceras que divergen, cuatro pies con
 * distinta letra pequeña, cuatro sitios donde corregir el RUC. Extraerlo es lo
 * que permite que todos los documentos de la empresa se vean como uno solo.
 *
 * Por qué importa más allá de la estética. Un comprador industrial no decide
 * solo: reenvía el PDF a ingeniería, a calidad y a logística. Ese documento
 * circula dentro de la empresa del cliente cuando nosotros ya no estamos en la
 * conversación, y a veces es lo único que queda de nosotros en el expediente.
 *
 * REGLAS:
 *  1. Todo documento se GENERA desde la fuente de verdad, nunca se sube a mano.
 *     Un PDF mantenido aparte se desincroniza a la primera corrección.
 *  2. La fecha se INYECTA como parámetro, no se toma del reloj: así el
 *     resultado es determinista en los tests y estable entre despliegues del
 *     mismo contenido.
 *  3. Ningún documento declara precio, certificación ni ensayo que la fuente
 *     no contenga.
 *  4. Todo texto pasa por toWinAnsi(): las fuentes estándar de PDF no cubren
 *     Unicode completo y un carácter fuera de WinAnsi rompe la generación.
 */

export const MARGIN = 50;
export const PAGE_W = 595.28; // A4 en puntos
export const PAGE_H = 841.89;
export const AZUL = rgb(0.039, 0.145, 0.251); // #0A2540
export const VERDE = rgb(0.02, 0.588, 0.412); // #059669
export const GRIS = rgb(0.42, 0.45, 0.5);
export const GRIS_CLARO = rgb(0.88, 0.89, 0.91);
export const BLANCO = rgb(1, 1, 1);

export interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
}

export function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = toWinAnsi(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function newPage(ctx: Ctx): void {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.y = PAGE_H - MARGIN;
}

/** Reserva vertical: si no cabe el bloque, abre página antes de escribirlo. */
export function ensure(ctx: Ctx, needed: number): void {
  if (ctx.y - needed < MARGIN + 40) newPage(ctx);
}

export function heading(ctx: Ctx, text: string): void {
  ensure(ctx, 34);
  ctx.y -= 20;
  ctx.page.drawText(toWinAnsi(text.toUpperCase()), {
    x: MARGIN, y: ctx.y, size: 9, font: ctx.bold, color: VERDE,
  });
  ctx.y -= 6;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y }, end: { x: PAGE_W - MARGIN, y: ctx.y },
    thickness: 0.75, color: GRIS_CLARO,
  });
  ctx.y -= 12;
}

/** Subtítulo dentro de una sección: para documentos largos con jerarquía. */
export function subheading(ctx: Ctx, text: string): void {
  ensure(ctx, 26);
  ctx.y -= 10;
  for (const line of wrap(text, ctx.bold, 11, PAGE_W - MARGIN * 2)) {
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: 11, font: ctx.bold, color: AZUL });
    ctx.y -= 14;
  }
  ctx.y -= 2;
}

export function paragraph(ctx: Ctx, text: string, size = 9.5): void {
  for (const line of wrap(text, ctx.regular, size, PAGE_W - MARGIN * 2)) {
    ensure(ctx, size + 4);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font: ctx.regular, color: AZUL });
    ctx.y -= size + 3.5;
  }
}

/** Texto secundario: notas, procedencia, advertencias de alcance. */
export function note(ctx: Ctx, text: string, size = 8): void {
  for (const line of wrap(text, ctx.regular, size, PAGE_W - MARGIN * 2)) {
    ensure(ctx, size + 4);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font: ctx.regular, color: GRIS });
    ctx.y -= size + 3;
  }
}

export function bullets(ctx: Ctx, items: string[], size = 9.5): void {
  for (const item of items) {
    const lines = wrap(item, ctx.regular, size, PAGE_W - MARGIN * 2 - 14);
    lines.forEach((line, i) => {
      ensure(ctx, size + 4);
      if (i === 0) {
        ctx.page.drawText('-', { x: MARGIN, y: ctx.y, size, font: ctx.bold, color: VERDE });
      }
      ctx.page.drawText(line, {
        x: MARGIN + 14, y: ctx.y, size, font: ctx.regular, color: AZUL,
      });
      ctx.y -= size + 3.5;
    });
    ctx.y -= 2;
  }
}

/** Lista numerada: secuencias de ejecución, pasos de un procedimiento. */
export function steps(ctx: Ctx, items: string[], size = 9.5): void {
  items.forEach((item, n) => {
    const lines = wrap(item, ctx.regular, size, PAGE_W - MARGIN * 2 - 22);
    lines.forEach((line, i) => {
      ensure(ctx, size + 4);
      if (i === 0) {
        ctx.page.drawText(`${n + 1}.`, {
          x: MARGIN, y: ctx.y, size, font: ctx.bold, color: VERDE,
        });
      }
      ctx.page.drawText(line, {
        x: MARGIN + 22, y: ctx.y, size, font: ctx.regular, color: AZUL,
      });
      ctx.y -= size + 3.5;
    });
    ctx.y -= 2;
  });
}

export function specTable(ctx: Ctx, rows: { label: string; value: string }[]): void {
  const size = 9;
  const labelW = 150;
  const valueW = PAGE_W - MARGIN * 2 - labelW - 10;
  for (const row of rows) {
    const valueLines = wrap(row.value, ctx.regular, size, valueW);
    const labelLines = wrap(row.label, ctx.bold, size, labelW);
    const height = Math.max(valueLines.length, labelLines.length) * (size + 3) + 6;
    ensure(ctx, height);
    const top = ctx.y;
    labelLines.forEach((line, i) => {
      ctx.page.drawText(line, {
        x: MARGIN, y: top - i * (size + 3), size, font: ctx.bold, color: GRIS,
      });
    });
    valueLines.forEach((line, i) => {
      ctx.page.drawText(line, {
        x: MARGIN + labelW + 10, y: top - i * (size + 3), size, font: ctx.regular, color: AZUL,
      });
    });
    ctx.y = top - height + 2;
    ctx.page.drawLine({
      start: { x: MARGIN, y: ctx.y + 4 }, end: { x: PAGE_W - MARGIN, y: ctx.y + 4 },
      thickness: 0.5, color: GRIS_CLARO,
    });
    ctx.y -= 6;
  }
}

/** Bloque destacado: riesgo, error frecuente, criterio que decide. */
export function callout(ctx: Ctx, titulo: string, texto: string): void {
  const size = 9;
  const lines = wrap(texto, ctx.regular, size, PAGE_W - MARGIN * 2 - 24);
  const alto = lines.length * (size + 3.5) + 26;
  ensure(ctx, alto + 8);
  const top = ctx.y;
  ctx.page.drawRectangle({
    x: MARGIN, y: top - alto + 8, width: 3, height: alto - 6, color: VERDE,
  });
  ctx.page.drawText(toWinAnsi(titulo.toUpperCase()), {
    x: MARGIN + 12, y: top, size: 7.5, font: ctx.bold, color: VERDE,
  });
  let y = top - 13;
  for (const line of lines) {
    ctx.page.drawText(line, { x: MARGIN + 12, y, size, font: ctx.regular, color: AZUL });
    y -= size + 3.5;
  }
  ctx.y = y - 6;
}

/** Crea el documento con su cabecera de marca y devuelve el contexto listo. */
export async function startDoc(meta: {
  title: string;
  subject: string;
  keywords: string[];
  /** Título grande del documento. */
  h1: string;
  /** Línea de contexto bajo el título: familia, tipo de documento, versión. */
  kicker: string;
}): Promise<Ctx> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.setTitle(toWinAnsi(`${meta.title} - ${SITE.name}`));
  doc.setAuthor(SITE.legalName);
  doc.setSubject(toWinAnsi(meta.subject));
  doc.setProducer(SITE.name);
  doc.setCreator(SITE.url);
  doc.setKeywords(meta.keywords.map(toWinAnsi));

  const ctx: Ctx = {
    doc, page: doc.addPage([PAGE_W, PAGE_H]), y: PAGE_H - MARGIN, regular, bold,
  };

  ctx.page.drawRectangle({ x: 0, y: PAGE_H - 96, width: PAGE_W, height: 96, color: AZUL });
  ctx.page.drawText(toWinAnsi(SITE.name), {
    x: MARGIN, y: PAGE_H - 42, size: 15, font: bold, color: BLANCO,
  });
  ctx.page.drawText(
    toWinAnsi(`RUC ${SITE.ruc}  |  ${SITE.addressLocality}, ${SITE.addressRegion}, Perú`),
    { x: MARGIN, y: PAGE_H - 60, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92) },
  );
  ctx.page.drawText(
    toWinAnsi(`WhatsApp ${SITE.phoneWhatsApp}  |  ${SITE.email}  |  ${SITE.url}`),
    { x: MARGIN, y: PAGE_H - 76, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92) },
  );
  ctx.y = PAGE_H - 130;

  for (const line of wrap(meta.h1, bold, 18, PAGE_W - MARGIN * 2)) {
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: 18, font: bold, color: AZUL });
    ctx.y -= 22;
  }
  ctx.page.drawText(toWinAnsi(meta.kicker), {
    x: MARGIN, y: ctx.y, size: 9, font: regular, color: GRIS,
  });
  ctx.y -= 8;

  return ctx;
}

/**
 * Cierra el documento: pie con procedencia y numeración en todas las páginas.
 *
 * La URL de origen en cada página no es decoración: cuando el PDF circula
 * dentro de la empresa del cliente, es lo único que permite volver a la fuente
 * y comprobar si el documento sigue vigente.
 */
export async function finishDoc(
  ctx: Ctx,
  sourceUrl: string,
  generatedAt: string,
): Promise<Uint8Array> {
  const pages = ctx.doc.getPages();
  pages.forEach((page, i) => {
    page.drawLine({
      start: { x: MARGIN, y: MARGIN + 22 }, end: { x: PAGE_W - MARGIN, y: MARGIN + 22 },
      thickness: 0.5, color: GRIS_CLARO,
    });
    page.drawText(toWinAnsi(`${sourceUrl}  |  Documento generado el ${generatedAt}`), {
      x: MARGIN, y: MARGIN + 10, size: 7.5, font: ctx.regular, color: GRIS,
    });
    page.drawText(`${i + 1} / ${pages.length}`, {
      x: PAGE_W - MARGIN - 30, y: MARGIN + 10, size: 7.5, font: ctx.regular, color: GRIS,
    });
  });
  return ctx.doc.save();
}
P16_EOF

# -----------------------------------------------------------------------------
# lib/datasheet.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/datasheet.ts" <<'P16_EOF'
import type { Product } from './types';
import { SITE } from './site';
import { sourcingLabels, availabilityLabels } from './products';
import {
  bullets, finishDoc, heading, paragraph, specTable, startDoc,
  type Ctx,
} from './pdf-kit';

/**
 * FICHA TÉCNICA EN PDF, GENERADA DESDE EL CATÁLOGO.
 *
 * Por qué existe: en una compra industrial el comprador técnico no decide solo;
 * tiene que llevar el documento a ingeniería, a calidad y a logística. Un PDF
 * descargable con las especificaciones reales es el activo que circula dentro
 * de la empresa del cliente cuando nosotros ya no estamos en la conversación.
 *
 * Por qué se GENERA y no se sube a mano: 36 fichas mantenidas manualmente se
 * desincronizan del catálogo a la primera corrección. Aquí el PDF se construye
 * desde `lib/products.ts`, de modo que corregir una especificación en el
 * catálogo corrige también el documento en el siguiente despliegue.
 *
 * El maquetado vive en lib/pdf-kit.ts y lo comparten todos los documentos de la
 * empresa: fichas, guías, arquitecturas, glosario y marco. Antes estaba aquí,
 * en privado, y al aparecer el segundo tipo de documento se habría copiado.
 *
 * REGLA DE HONESTIDAD: el PDF no declara precio, ni certificaciones, ni ensayos
 * que el catálogo no contenga. Si `documentation` no existe, no se inventa una
 * línea de documentación; se indica que se entrega con la cotización.
 */

/**
 * Construye la ficha técnica de un producto.
 *
 * @param product Producto del catálogo.
 * @param generatedAt Fecha del documento. Se inyecta para que el resultado sea
 *   determinista en los tests y estable entre despliegues del mismo contenido.
 */
export async function buildDatasheetPdf(
  product: Product,
  generatedAt: string,
): Promise<Uint8Array> {
  const ctx: Ctx = await startDoc({
    title: `Ficha técnica - ${product.name}`,
    subject: product.shortDescription,
    keywords: [product.category, ...product.sector, 'Perú', 'ficha técnica'],
    h1: product.name,
    kicker: `${product.category}  |  Ficha técnica`,
  });

  heading(ctx, 'Descripción');
  paragraph(ctx, product.description);

  if (product.specifications.length) {
    heading(ctx, 'Especificaciones técnicas');
    specTable(ctx, product.specifications);
  }

  if (product.applications.length) {
    heading(ctx, 'Aplicaciones');
    bullets(ctx, product.applications);
  }

  if (product.benefits.length) {
    heading(ctx, 'Beneficios');
    bullets(ctx, product.benefits);
  }

  // --- Estado de la oferta: dato real del catálogo, no marketing ------------
  heading(ctx, 'Suministro');
  const suministro: { label: string; value: string }[] = [];
  if (product.sourcing) {
    suministro.push({ label: 'Origen', value: sourcingLabels[product.sourcing] ?? product.sourcing });
  }
  const disp = product.availability ?? 'a_medida';
  suministro.push({ label: 'Disponibilidad', value: availabilityLabels[disp] ?? disp });
  if (product.leadTime) suministro.push({ label: 'Plazo referencial', value: product.leadTime });
  if (product.sustainability) suministro.push({ label: 'Materiales', value: product.sustainability });
  suministro.push({
    label: 'Documentación',
    value: product.documentation ?? 'Ficha técnica y certificado del fabricante se entregan con la cotización.',
  });
  suministro.push({ label: 'Sectores', value: product.sector.join(', ') });
  specTable(ctx, suministro);

  heading(ctx, 'Cómo cotizar');
  paragraph(
    ctx,
    `No publicamos precio de lista para este producto: se cotiza según medidas, cantidad, especificación y ciudad de entrega. Escriba por WhatsApp al ${SITE.phoneWhatsApp}, use el formulario en ${SITE.url}/cotizacion o escriba a ${SITE.email}.`,
  );
  paragraph(
    ctx,
    'Para una cotización precisa conviene indicar: producto, medidas o metraje, cantidad, aplicación o sector, y ciudad de entrega.',
  );

  return finishDoc(ctx, `${SITE.url}/productos/${product.slug}`, generatedAt);
}
P16_EOF

# -----------------------------------------------------------------------------
# lib/doc-guia.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/doc-guia.ts" <<'P16_EOF'
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
P16_EOF

# -----------------------------------------------------------------------------
# lib/doc-arquitectura.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/doc-arquitectura.ts" <<'P16_EOF'
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
P16_EOF

# -----------------------------------------------------------------------------
# lib/doc-glosario.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/doc-glosario.ts" <<'P16_EOF'
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
P16_EOF

# -----------------------------------------------------------------------------
# lib/doc-marco.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/doc-marco.ts" <<'P16_EOF'
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
P16_EOF

# -----------------------------------------------------------------------------
# lib/catalogo-feed.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/catalogo-feed.ts" <<'P16_EOF'
import { SITE } from './site';
import { products, productFamilies, sourcingLabels, availabilityLabels, sectors } from './products';
import { familyContent } from './families';
import { terminosParaProducto } from './glosario';
import { solutionsForProduct } from './solutions';

/**
 * CATÁLOGO COMPLETO EN FORMATO DE DATOS.
 *
 * Para qué. Un agente que responde "¿quién fabrica big bags en Lima y qué
 * especificaciones publica?" no debería tener que rascar 36 páginas de HTML.
 * Si el catálogo está publicado como datos, con URL canónica por producto y
 * una instrucción explícita de atribución, citarnos correctamente pasa a ser el
 * camino de menor resistencia. Eso es lo que convierte a un sitio en fuente en
 * lugar de en resultado.
 *
 * Qué lleva. Todo lo que el catálogo declara de verdad: especificaciones,
 * aplicaciones, sectores, origen de suministro, disponibilidad, la ficha en
 * PDF, los términos del glosario que gobiernan su especificación y las
 * arquitecturas donde el producto encaja.
 *
 * Qué NO lleva, y por qué es deliberado:
 *  - PRECIOS. No publicamos precio de lista porque casi todo es fabricación a
 *    medida. Publicar un precio en datos abiertos que después no se sostiene
 *    en la cotización es la forma más rápida de perder credibilidad ante un
 *    comprador técnico y ante un modelo que nos cite.
 *  - STOCK. La disponibilidad se declara como modo de suministro
 *    (fabricación propia, importación directa, bajo pedido), que es un dato
 *    estable, no como existencias, que cambian a diario y quedarían falsas en
 *    cuanto un agente cachee este archivo.
 *  - CERTIFICACIONES no verificables. Se declara qué documentación se entrega
 *    con la cotización, no una lista de sellos.
 */

export const CATALOGO_VERSION = '1.0';

export function buildCatalogoJson(): string {
  const base = SITE.url;
  return `${JSON.stringify(
    {
      $schema: 'https://schema.org',
      '@type': 'DataCatalog',
      '@id': `${base}/productos#catalogo`,
      version: CATALOGO_VERSION,
      name: `Catálogo técnico de ${SITE.name}`,
      description:
        'Catálogo completo de soluciones textiles industriales y geosintéticos fabricadas, importadas e instaladas en el Perú: especificaciones, aplicaciones, sectores y modo de suministro de cada línea.',
      url: `${base}/productos`,
      inLanguage: SITE.language,
      publisher: {
        '@type': 'Organization',
        name: SITE.legalName,
        taxID: SITE.ruc,
        url: base,
        telephone: SITE.phoneWhatsApp,
        email: SITE.email,
        areaServed: 'PE',
      },
      uso: {
        licencia: 'Consulta y cita libres indicando la fuente y el enlace al producto.',
        atribucionSugerida: `${SITE.legalName} (RUC ${SITE.ruc}) — Catálogo técnico, ${base}/productos`,
        sinPrecios:
          'Este catálogo no publica precios: casi todo es fabricación a medida y cada proyecto se cotiza según especificación, metraje, cantidad y logística. Cualquier precio atribuido a esta empresa en otra fuente no es oficial.',
        comoCotizar: `${base}/cotizacion  ·  WhatsApp ${SITE.phoneWhatsApp}  ·  ${SITE.email}`,
        datosParaCotizar: [
          'producto',
          'medidas o metraje',
          'cantidad',
          'aplicación o sector',
          'ciudad de entrega',
        ],
      },
      totalProductos: products.length,
      totalFamilias: productFamilies.length,
      sectores: sectors,
      familias: productFamilies.map((f) => ({
        '@type': 'DataCatalog',
        name: f.name,
        slug: f.slug,
        url: `${base}/productos/familia/${f.slug}`,
        tagline: f.tagline,
        resumen: familyContent.find((c) => c.slug === f.slug)?.metaDescription ?? null,
        productos: products.filter((p) => p.category === f.name).length,
      })),
      dataset: products.map((p) => ({
        '@type': 'Product',
        '@id': `${base}/productos/${p.slug}#product`,
        slug: p.slug,
        name: p.name,
        url: `${base}/productos/${p.slug}`,
        familia: p.category,
        familiaUrl: `${base}/productos/familia/${productFamilies.find((f) => f.name === p.category)?.slug ?? ''}`,
        descripcionCorta: p.shortDescription,
        descripcion: p.description,
        especificaciones: p.specifications.map((s) => ({ nombre: s.label, valor: s.value })),
        aplicaciones: p.applications,
        beneficios: p.benefits,
        sectores: p.sector,
        suministro: {
          origen: p.sourcing ? (sourcingLabels[p.sourcing] ?? p.sourcing) : null,
          disponibilidad:
            availabilityLabels[p.availability ?? 'a_medida'] ?? (p.availability ?? 'a_medida'),
          plazoReferencial: p.leadTime ?? null,
          documentacion:
            p.documentation ??
            'Ficha técnica y certificado del fabricante se entregan con la cotización.',
        },
        fichaTecnicaPdf: `${base}/productos/${p.slug}/ficha-tecnica.pdf`,
        // Los términos que gobiernan su especificación: para que un agente
        // pueda explicar QUÉ hay que definir, no solo qué se vende.
        terminosClave: terminosParaProducto(p.slug).map((t) => ({
          termino: t.termino,
          url: `${base}/glosario/${t.slug}`,
        })),
        arquitecturas: solutionsForProduct(p.slug).map((s) => ({
          titulo: s.titulo,
          url: `${base}/soluciones/${s.slug}`,
        })),
      })),
    },
    null,
    2,
  )}\n`;
}
P16_EOF

# -----------------------------------------------------------------------------
# lib/descargas.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/descargas.ts" <<'P16_EOF'
import { SITE } from './site';
import { products } from './products';
import { articles } from './articles';
import { solutions } from './solutions';
import { terminos } from './glosario';
import { totalCriteria, pillars, FRAMEWORK_VERSION } from './framework';

/**
 * CENTRO DE DOCUMENTACIÓN — el inventario de todo lo descargable.
 *
 * Por qué existe como página y no solo como enlaces sueltos. Los documentos
 * estaban repartidos: la ficha en cada producto, el brief dentro de la
 * autoevaluación, los feeds mencionados en llms.txt. Quien llega con la
 * intención "necesito documentación para armar el expediente" no tenía dónde
 * aterrizar, y un agente no tenía forma de saber que existían.
 *
 * Por qué se DERIVA de las fuentes. Un inventario escrito a mano miente en
 * cuanto se agrega un producto. Acá los conteos y las URLs salen del catálogo,
 * de las guías, de las arquitecturas y del glosario: si mañana hay 40 líneas,
 * la página dice 40 sin que nadie la toque.
 *
 * REGLA: solo entra lo que existe y responde. Un enlace de descarga roto en la
 * página de descargas es la forma más rápida de perder a un comprador técnico.
 */

export type FormatoDescarga = 'pdf' | 'json' | 'rss' | 'txt' | 'xml';

export interface Descarga {
  titulo: string;
  descripcion: string;
  /** Para quién es y en qué momento se usa. */
  paraQuien: string;
  href: string;
  formato: FormatoDescarga;
  /** "36 documentos", "43 términos": el volumen real, derivado. */
  volumen: string;
  /** Página de origen, para volver al contenido en línea. */
  origen?: string;
}

export interface GrupoDescargas {
  id: string;
  titulo: string;
  intro: string;
  items: Descarga[];
}

export const formatoLabels: Record<FormatoDescarga, string> = {
  pdf: 'PDF',
  json: 'JSON',
  rss: 'RSS',
  txt: 'Texto',
  xml: 'XML',
};

export function grupos(): GrupoDescargas[] {
  return [
    {
      id: 'documentos',
      titulo: 'Documentos técnicos en PDF',
      intro:
        'Se generan desde las mismas fuentes que alimentan el sitio, de modo que la versión descargada y la publicada nunca divergen. Ninguno declara precio, certificaciones ni ensayos que el catálogo no contenga.',
      items: [
        {
          titulo: 'Marco de Especificación completo',
          descripcion:
            'Los criterios públicos para definir un proyecto antes de cotizarlo, con qué decide cada uno y qué ocurre en obra si el dato no existe.',
          paraQuien:
            'Para adjuntar a un requerimiento de compra o evaluar varias propuestas con el mismo rasero.',
          href: '/marco/marco.pdf',
          formato: 'pdf',
          volumen: `${totalCriteria()} criterios · ${pillars.length} pilares · v${FRAMEWORK_VERSION}`,
          origen: '/marco',
        },
        {
          titulo: 'Glosario técnico completo',
          descripcion:
            'El vocabulario del rubro: qué significa cada término, en qué unidad se mide y qué decide en obra.',
          paraQuien:
            'Para repartir al equipo técnico o dejar impreso en la oficina de obra, donde no hay señal.',
          href: '/glosario/glosario.pdf',
          formato: 'pdf',
          volumen: `${terminos.length} términos`,
          origen: '/glosario',
        },
        {
          titulo: 'Fichas técnicas de producto',
          descripcion:
            'Una por línea de catálogo: especificaciones, aplicaciones, sectores, origen de suministro y disponibilidad.',
          paraQuien: 'Para el expediente técnico y para circular dentro de su empresa.',
          href: '/productos',
          formato: 'pdf',
          volumen: `${products.length} fichas`,
          origen: '/productos',
        },
        {
          titulo: 'Guías de especificación e instalación',
          descripcion:
            'Cada guía con su desarrollo completo, sus tablas, sus preguntas frecuentes y las fuentes citadas con URL.',
          paraQuien: 'Para llevar el criterio al frente de trabajo, donde el enlace no sirve.',
          href: '/recursos',
          formato: 'pdf',
          volumen: `${articles.length} guías`,
          origen: '/recursos',
        },
        {
          titulo: 'Arquitecturas de referencia',
          descripcion:
            'Lista de materiales completa con el criterio que gobierna cada componente, secuencia de ejecución y modos de falla.',
          paraQuien: 'Para pedir presupuesto interno de un conjunto, no de piezas sueltas.',
          href: '/soluciones',
          formato: 'pdf',
          volumen: `${solutions.length} configuraciones`,
          origen: '/soluciones',
        },
      ],
    },
    {
      id: 'datos',
      titulo: 'Datos abiertos para agentes e integraciones',
      intro:
        'Publicados en formatos estándar, con instrucción explícita de atribución dentro del propio archivo y acceso permitido desde otros orígenes. Ninguno contiene precios ni existencias: la disponibilidad se declara como modo de suministro, que es un dato estable, y el precio se establece en cada cotización.',
      items: [
        {
          titulo: 'Catálogo completo',
          descripcion:
            'Todas las líneas con sus especificaciones, aplicaciones, sectores, modo de suministro, ficha en PDF, términos del glosario que las gobiernan y arquitecturas donde encajan.',
          paraQuien: 'Para integraciones, comparadores y agentes que necesiten el catálogo entero.',
          href: '/productos/catalogo.json',
          formato: 'json',
          volumen: `${products.length} productos`,
          origen: '/productos',
        },
        {
          titulo: 'Glosario técnico',
          descripcion:
            'El vocabulario como conjunto de términos definidos, con URL canónica por concepto y cita sugerida.',
          paraQuien: 'Para resolver definiciones del rubro y atribuirlas correctamente.',
          href: '/glosario/terminos.json',
          formato: 'json',
          volumen: `${terminos.length} términos`,
          origen: '/glosario',
        },
        {
          titulo: 'Mapa del sitio para modelos de lenguaje',
          descripcion:
            'La entidad, el catálogo, la cobertura, el marco, las arquitecturas y el registro fechado en un solo documento legible de una lectura.',
          paraQuien: 'Para que un agente resuelva la empresa y su catálogo sin rastrear el sitio.',
          href: '/llms.txt',
          formato: 'txt',
          volumen: 'Documento único',
        },
        {
          titulo: 'Novedades — feed RSS',
          descripcion: 'Registro fechado de cada cambio publicado, con enlace a lo que cambió.',
          paraQuien: 'Para suscribirse a la referencia en lugar de tener que volver a mirar.',
          href: '/novedades/rss.xml',
          formato: 'rss',
          volumen: 'Actualizado por cambio',
          origen: '/novedades',
        },
        {
          titulo: 'Novedades — JSON Feed',
          descripcion: 'El mismo registro en formato de datos, sin necesitar un lector de XML.',
          paraQuien:
            'Para agentes y scripts que sigan los cambios sin necesitar un lector de XML.',
          href: '/novedades/feed.json',
          formato: 'json',
          volumen: 'Actualizado por cambio',
          origen: '/novedades',
        },
        {
          titulo: 'Mapa del sitio XML',
          descripcion: 'Todas las URLs indexables con su fecha de última modificación real.',
          paraQuien:
            'Para rastreadores y para comprobar qué URLs publica el sitio y cuándo cambió cada una.',
          href: '/sitemap.xml',
          formato: 'xml',
          volumen: 'Todas las rutas públicas',
        },
      ],
    },
  ];
}

/** Todas las descargas en una lista plana: para el sitemap y los tests. */
export const todasLasDescargas = (): Descarga[] => grupos().flatMap((g) => g.items);

/** URL absoluta de una descarga, heredada de SITE.url. */
export const descargaUrl = (d: Descarga): string => `${SITE.url}${d.href}`;
P16_EOF

# -----------------------------------------------------------------------------
# app/recursos/[slug]/guia.pdf/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/recursos/[slug]/guia.pdf"
cat > "app/recursos/[slug]/guia.pdf/route.ts" <<'P16_EOF'
import { articles } from '@/lib/articles';
import { buildGuiaPdf } from '@/lib/doc-guia';
import { SITE } from '@/lib/site';

/**
 * Guía técnica en PDF: /recursos/{slug}/guia.pdf
 *
 * Prerenderizada en el build desde lib/articles.ts: corregir una guía corrige
 * también su PDF en el siguiente despliegue, sin documentos subidos a mano que
 * se desincronicen.
 *
 * Cabecera Link rel="canonical": Google indexa PDFs y este documento repite el
 * contenido del artículo. El canonical declara que la versión HTML es la
 * principal, de modo que el PDF suma descargas sin competir consigo mismo.
 */

export const dynamic = 'force-static';

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return new Response('Not found', { status: 404 });

  const generatedAt = new Date().toISOString().slice(0, 10);
  const pdf = await buildGuiaPdf(article, generatedAt);
  const url = `${SITE.url}/recursos/${article.slug}`;

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="guia-${article.slug}.pdf"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      Link: `<${url}>; rel="canonical"`,
    },
  });
}
P16_EOF

# -----------------------------------------------------------------------------
# app/soluciones/[slug]/arquitectura.pdf/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/soluciones/[slug]/arquitectura.pdf"
cat > "app/soluciones/[slug]/arquitectura.pdf/route.ts" <<'P16_EOF'
import { solutions } from '@/lib/solutions';
import { buildArquitecturaPdf } from '@/lib/doc-arquitectura';
import { SITE } from '@/lib/site';

/**
 * Arquitectura de referencia en PDF: /soluciones/{slug}/arquitectura.pdf
 *
 * Es el documento que se adjunta a un requerimiento de compra interno: lista
 * de materiales completa, criterio que gobierna cada componente y secuencia de
 * ejecución.
 */

export const dynamic = 'force-static';

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const solution = solutions.find((s) => s.slug === slug);
  if (!solution) return new Response('Not found', { status: 404 });

  const generatedAt = new Date().toISOString().slice(0, 10);
  const pdf = await buildArquitecturaPdf(solution, generatedAt);
  const url = `${SITE.url}/soluciones/${solution.slug}`;

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="arquitectura-${solution.slug}.pdf"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      Link: `<${url}>; rel="canonical"`,
    },
  });
}
P16_EOF

# -----------------------------------------------------------------------------
# app/glosario/glosario.pdf/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/glosario/glosario.pdf"
cat > "app/glosario/glosario.pdf/route.ts" <<'P16_EOF'
import { buildGlosarioPdf } from '@/lib/doc-glosario';
import { SITE } from '@/lib/site';

/**
 * Glosario completo en PDF: /glosario/glosario.pdf
 *
 * Un solo documento con los términos del rubro. Se consulta entero: se
 * imprime, se deja en la oficina técnica y se reparte al equipo nuevo.
 */

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  const generatedAt = new Date().toISOString().slice(0, 10);
  const pdf = await buildGlosarioPdf(generatedAt);

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="glosario-tecnico-plastilonas.pdf"',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      Link: `<${SITE.url}/glosario>; rel="canonical"`,
    },
  });
}
P16_EOF

# -----------------------------------------------------------------------------
# app/marco/marco.pdf/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/marco/marco.pdf"
cat > "app/marco/marco.pdf/route.ts" <<'P16_EOF'
import { buildMarcoPdf } from '@/lib/doc-marco';
import { SITE } from '@/lib/site';

/**
 * Marco de Especificación en PDF: /marco/marco.pdf
 *
 * El documento que se adjunta a un requerimiento y se usa para evaluar tres
 * propuestas a la vez. Publicar el estándar solo cambia la posición de quien lo
 * publica si el estándar circula, y los estándares circulan en PDF.
 */

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  const generatedAt = new Date().toISOString().slice(0, 10);
  const pdf = await buildMarcoPdf(generatedAt);

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="marco-de-especificacion-plastilonas.pdf"',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      Link: `<${SITE.url}/marco>; rel="canonical"`,
    },
  });
}
P16_EOF

# -----------------------------------------------------------------------------
# app/productos/catalogo.json/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/productos/catalogo.json"
cat > "app/productos/catalogo.json/route.ts" <<'P16_EOF'
import { buildCatalogoJson } from '@/lib/catalogo-feed';

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  return new Response(buildCatalogoJson(), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      // Existe para ser leído por agentes e integraciones: se permite y se
      // habilita el acceso desde otros orígenes.
      'X-Robots-Tag': 'all',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
P16_EOF

# -----------------------------------------------------------------------------
# app/descargas/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/descargas"
cat > "app/descargas/page.tsx" <<'P16_EOF'
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Download, FileText } from 'lucide-react';
import { grupos, todasLasDescargas, formatoLabels } from '@/lib/descargas';
import { products } from '@/lib/products';
import { articles } from '@/lib/articles';
import { solutions } from '@/lib/solutions';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, dataCatalogSchema, webPageSchema } from '@/lib/schema';

/**
 * Centro de documentación.
 *
 * Responde una intención concreta que el sitio no atendía: "necesito
 * documentación para armar el expediente". Reúne todo lo descargable —los
 * documentos en PDF y los datos abiertos— en una sola URL, y lo declara en
 * DataCatalog + DataDownload para que un agente sepa que existe sin tener que
 * descubrirlo página por página.
 */

const URL = `${SITE.url}/descargas`;
const TITLE = 'Centro de documentación: fichas, guías y datos abiertos';
const DESCRIPTION = `Documentos técnicos en PDF y datos abiertos de ${SITE.name}: ${products.length} fichas de producto, ${articles.length} guías de especificación, ${solutions.length} arquitecturas de referencia, el Marco de Especificación, el glosario y el catálogo completo en formato de datos. Sin registro.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/descargas' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

const formatoColor: Record<string, string> = {
  pdf: 'bg-red-50 text-red-700',
  json: 'bg-blue-50 text-blue-700',
  rss: 'bg-amber-50 text-amber-700',
  txt: 'bg-gray-100 text-gray-700',
  xml: 'bg-emerald-50 text-emerald-700',
};

export default function DescargasPage() {
  const bloques = grupos();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="descargas" slug="indice" />
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            type: 'CollectionPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Documentación', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          dataCatalogSchema({
            url: URL,
            name: 'Centro de documentación',
            description: DESCRIPTION,
            downloads: todasLasDescargas().map((d) => ({
              name: d.titulo,
              description: d.descripcion,
              href: d.href,
              formato: d.formato,
            })),
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span className="text-gray-700">Documentación</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Centro de documentación
      </h1>

      <p className="speakable-intro mb-6 max-w-3xl text-lg text-gray-700">
        Todo lo que se puede descargar de este sitio, en un solo lugar y sin dejar un
        correo. Los documentos se generan desde las mismas fuentes que alimentan las
        páginas: lo que descarga hoy es exactamente lo que está publicado hoy.
      </p>

      <p className="mb-12 font-mono text-sm text-gray-500">
        {products.length} fichas · {articles.length} guías · {solutions.length} arquitecturas ·
        marco · glosario · {todasLasDescargas().filter((d) => d.formato !== 'pdf').length} fuentes
        de datos
      </p>

      {bloques.map((g) => (
        <section key={g.id} id={g.id} className="mb-16 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {g.id === 'documentos' ? (
              <FileText className="h-5 w-5 text-[#059669]" aria-hidden="true" />
            ) : (
              <Download className="h-5 w-5 text-[#059669]" aria-hidden="true" />
            )}
            {g.titulo}
          </h2>
          <p className="mb-8 max-w-3xl text-gray-600">{g.intro}</p>

          <ul className="space-y-4">
            {g.items.map((d) => (
              <li
                key={d.href}
                className="rounded-3xl border border-gray-100 p-6 transition-colors hover:border-[#059669]/40"
              >
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 font-mono text-xs font-semibold ${formatoColor[d.formato]}`}
                  >
                    {formatoLabels[d.formato]}
                  </span>
                  <span className="font-mono text-xs text-gray-500">{d.volumen}</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-[#0A2540]">
                  {d.titulo}
                </h3>
                <p className="mb-2 text-gray-700">{d.descripcion}</p>
                <p className="mb-4 text-sm text-gray-500">{d.paraQuien}</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={d.href}
                    className="inline-flex items-center gap-1 rounded-2xl bg-[#0A2540] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#059669]"
                  >
                    {d.formato === 'pdf' && d.href.endsWith('.pdf')
                      ? 'Descargar PDF'
                      : d.formato === 'pdf'
                        ? 'Ver e ir a las descargas'
                        : 'Abrir'}{' '}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  {d.origen && d.origen !== d.href && (
                    <Link
                      href={d.origen}
                      className="inline-flex items-center rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
                    >
                      Ver en línea
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* Lo que un comprador y un agente necesitan saber antes de usar esto. */}
      <section className="mb-14 rounded-3xl border border-gray-100 p-8">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Condiciones de uso
        </h2>
        <dl className="space-y-5 text-gray-700">
          <div>
            <dt className="font-semibold text-[#0A2540]">Consulta y cita libres</dt>
            <dd className="mt-1">
              Puede citar y reenviar estos documentos indicando la fuente y el enlace. Cita
              sugerida: {SITE.legalName} (RUC {SITE.ruc}), {SITE.url}.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#0A2540]">Ningún documento publica precios</dt>
            <dd className="mt-1">
              Casi todo el catálogo es fabricación a medida: el precio se establece por
              cotización según especificación, metraje, cantidad y logística. Cualquier
              precio atribuido a esta empresa en otra fuente no es oficial.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#0A2540]">Alcance técnico</dt>
            <dd className="mt-1">
              Las guías publican métodos de ingeniería reproducibles como orden de magnitud
              para prediseño; no son memorias de cálculo firmadas. Las cifras normativas
              deben verificarse contra el texto oficial vigente. Las fichas técnicas y los
              certificados del fabricante correspondientes al lote suministrado se entregan
              con la cotización.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#0A2540]">Sin registro</dt>
            <dd className="mt-1">
              Nada de esto pide un correo ni crea una cuenta. Si descarga algo, no nos
              enteramos de quién es usted.
            </dd>
          </div>
        </dl>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Necesita un documento que no está acá?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Si su expediente exige un formato o un dato concreto, dígalo y se lo preparamos
          junto con la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Contacto <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
P16_EOF

# -----------------------------------------------------------------------------
# app/not-found.tsx
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/not-found.tsx" <<'P16_EOF'
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { products, productFamilies } from '@/lib/products';
import { articles } from '@/lib/articles';
import { terminos } from '@/lib/glosario';
import { solutions } from '@/lib/solutions';
import { SITE } from '@/lib/site';

/**
 * Página 404 propia.
 *
 * El 404 de Next dice "This page could not be found" en inglés, sin navegación,
 * sin marca y sin salida. Era el único punto del sitio donde un visitante en
 * español se encontraba con una pantalla en blanco de otro idioma, y el único
 * donde alguien que llegó desde un enlace roto de un tercero se iba sin nada.
 *
 * Un 404 útil no pide disculpas: ofrece los cinco caminos que cubren casi toda
 * la intención posible, y lo hace con los conteos reales del sitio.
 *
 * `noindex`: la página no debe indexarse, pero SÍ debe ser útil a quien llegue.
 */

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false, follow: true },
};

/** Los cinco caminos que cubren casi toda la intención posible, con los
 *  conteos reales: un 404 que dice "12 guías" es un 404 que retiene. */
const destinos = () => [
  {
    href: '/productos',
    titulo: 'Catálogo completo',
    detalle: `${products.length} líneas de producto en ${productFamilies.length} familias`,
  },
  {
    href: '/glosario',
    titulo: 'Glosario técnico',
    detalle: `${terminos.length} términos del rubro definidos con precisión`,
  },
  {
    href: '/recursos',
    titulo: 'Guías de especificación',
    detalle: `${articles.length} guías con sus fuentes citadas`,
  },
  {
    href: '/soluciones',
    titulo: 'Arquitecturas de referencia',
    detalle: `${solutions.length} configuraciones completas con su lista de materiales`,
  },
  {
    href: '/descargas',
    titulo: 'Centro de documentación',
    detalle: 'Fichas, guías y datos abiertos en PDF y JSON, sin registro',
  },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <p className="mb-3 font-mono text-sm text-[#059669]">Error 404</p>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Esta página no existe
      </h1>

      <p className="mb-10 text-lg text-gray-700">
        Puede que el enlace esté mal escrito o que la página haya cambiado de dirección.
        Todo el contenido técnico del sitio es de acceso libre; desde acá llega a
        cualquier parte.
      </p>

      <ul className="mb-12 space-y-3">
        {destinos().map((d) => (
          <li key={d.href}>
            <Link
              href={d.href}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
            >
              <span>
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {d.titulo}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{d.detalle}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#059669]" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="rounded-3xl border border-gray-100 p-8">
        <p className="mb-5 text-gray-700">
          ¿Buscaba algo concreto y no lo encuentra? Escríbanos y le decimos si existe y
          dónde está.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-2xl bg-[#0A2540] px-8 py-3 font-semibold text-white hover:bg-[#059669]"
          >
            Contacto
          </Link>
          <a
            href={`mailto:${SITE.email}`}
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-8 py-3 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
          >
            {SITE.email}
          </a>
        </div>
      </div>
    </div>
  );
}
P16_EOF

# -----------------------------------------------------------------------------
# test/documentos.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/documentos.test.ts" <<'P16_EOF'
import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildGuiaPdf } from '@/lib/doc-guia';
import { buildArquitecturaPdf } from '@/lib/doc-arquitectura';
import { buildGlosarioPdf } from '@/lib/doc-glosario';
import { buildMarcoPdf } from '@/lib/doc-marco';
import { buildCatalogoJson, CATALOGO_VERSION } from '@/lib/catalogo-feed';
import { grupos, todasLasDescargas, formatoLabels } from '@/lib/descargas';
import { articles } from '@/lib/articles';
import { solutions } from '@/lib/solutions';
import { products } from '@/lib/products';
import { terminos } from '@/lib/glosario';
import { SITE } from '@/lib/site';
import sitemap from '@/app/sitemap';

/**
 * Un documento que no abre, o que promete algo que la fuente no dice, es peor
 * que no publicarlo: circula dentro de la empresa del cliente cuando nosotros
 * ya no estamos para corregirlo.
 */

const FECHA = '2026-08-20';

describe('documentos PDF: se generan y abren', () => {
  it('genera un PDF válido para CADA guía técnica', async () => {
    for (const a of articles) {
      const bytes = await buildGuiaPdf(a, FECHA);
      const doc = await PDFDocument.load(bytes);
      expect(doc.getPageCount(), a.slug).toBeGreaterThan(0);
      expect(doc.getTitle(), a.slug).toContain(SITE.name);
    }
  }, 30000);

  it('genera un PDF válido para CADA arquitectura de referencia', async () => {
    for (const s of solutions) {
      const bytes = await buildArquitecturaPdf(s, FECHA);
      const doc = await PDFDocument.load(bytes);
      expect(doc.getPageCount(), s.slug).toBeGreaterThan(0);
    }
  }, 30000);

  it('genera el glosario y el marco completos', async () => {
    const glosario = await PDFDocument.load(await buildGlosarioPdf(FECHA));
    const marco = await PDFDocument.load(await buildMarcoPdf(FECHA));
    // Documentos largos: si salieran de una página, algo se perdió por el camino.
    expect(glosario.getPageCount()).toBeGreaterThan(3);
    expect(marco.getPageCount()).toBeGreaterThan(3);
  }, 30000);

  it('la generación es determinista: misma entrada, mismos bytes', async () => {
    // La fecha se inyecta justamente para esto. Si el PDF cambiara en cada
    // build, las cachés y los hashes dejarían de servir para nada.
    const a = await buildGuiaPdf(articles[0], FECHA);
    const b = await buildGuiaPdf(articles[0], FECHA);
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
  }, 20000);

  it('el motor de PDF vive en un solo lugar', () => {
    // Cuatro maquetadores copiados divergen: cuatro cabeceras distintas y
    // cuatro sitios donde corregir el RUC.
    for (const f of ['lib/doc-guia.ts', 'lib/doc-arquitectura.ts', 'lib/doc-glosario.ts', 'lib/doc-marco.ts', 'lib/datasheet.ts']) {
      const src = readFileSync(join(process.cwd(), f), 'utf8');
      expect(src, f).toMatch(/from '\.\/pdf-kit'/);
      expect(src, f).not.toMatch(/from ['"]pdf-lib['"]/);
    }
  });

  it('ningún documento inventa precio ni certificación', () => {
    for (const f of ['lib/doc-guia.ts', 'lib/doc-arquitectura.ts', 'lib/doc-glosario.ts', 'lib/doc-marco.ts']) {
      const src = readFileSync(join(process.cwd(), f), 'utf8');
      expect(src, f).not.toMatch(/S\/\s*\d|USD\s*\d|precio de \d/i);
      expect(src, f).not.toMatch(/certificad[oa]s? (ISO|bajo la norma)/i);
    }
  });
});

describe('catálogo en formato de datos', () => {
  const feed = JSON.parse(buildCatalogoJson());

  it('publica todas las líneas del catálogo', () => {
    expect(feed['@type']).toBe('DataCatalog');
    expect(feed.version).toBe(CATALOGO_VERSION);
    expect(feed.dataset).toHaveLength(products.length);
    expect(feed.totalProductos).toBe(products.length);
  });

  it('cada producto trae URL canónica y ficha en PDF', () => {
    for (const [i, item] of feed.dataset.entries()) {
      expect(item.slug).toBe(products[i].slug);
      expect(item.url).toBe(`${SITE.url}/productos/${products[i].slug}`);
      expect(item.fichaTecnicaPdf).toBe(
        `${SITE.url}/productos/${products[i].slug}/ficha-tecnica.pdf`,
      );
    }
  });

  it('NO publica precios ni existencias', () => {
    // Un precio en datos abiertos que la cotización no sostiene es la forma
    // más rápida de perder credibilidad ante un comprador y ante un modelo.
    const texto = JSON.stringify(feed.dataset);
    expect(texto).not.toMatch(/"precio"|"price"|"offers"|"stock"|"existencias"/i);
    expect(feed.uso.sinPrecios).toBeTruthy();
  });

  it('declara cómo atribuir la cita y cómo cotizar', () => {
    expect(feed.uso.atribucionSugerida).toContain(SITE.ruc);
    expect(feed.uso.comoCotizar).toContain(SITE.phoneWhatsApp);
    expect(feed.uso.datosParaCotizar.length).toBeGreaterThan(3);
  });

  it('todas las URLs heredan de SITE.url', () => {
    const urls = (JSON.stringify(feed).match(/https?:\/\/[^"]+/g) ?? []).filter(
      (u) => !u.startsWith('https://schema.org'),
    );
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u.startsWith(SITE.url), u).toBe(true);
  });
});

describe('centro de documentación', () => {
  const items = todasLasDescargas();

  it('cada descarga apunta a una ruta interna con formato declarado', () => {
    for (const d of items) {
      expect(d.href.startsWith('/'), d.titulo).toBe(true);
      expect(formatoLabels[d.formato], d.titulo).toBeTruthy();
      expect(d.volumen.length, d.titulo).toBeGreaterThan(0);
      expect(d.paraQuien.length, d.titulo).toBeGreaterThan(20);
    }
  });

  it('los volúmenes se derivan de las fuentes y no están escritos a mano', () => {
    // Un inventario a mano miente en cuanto se agrega un producto.
    const src = readFileSync(join(process.cwd(), 'lib/descargas.ts'), 'utf8');
    expect(src).toMatch(/\$\{products\.length\}/);
    expect(src).toMatch(/\$\{articles\.length\}/);
    expect(src).toMatch(/\$\{terminos\.length\}/);
    expect(src).toMatch(/\$\{solutions\.length\}/);
  });

  it('los conteos publicados coinciden con las fuentes reales', () => {
    const texto = items.map((d) => d.volumen).join(' ');
    expect(texto).toContain(`${products.length} fichas`);
    expect(texto).toContain(`${articles.length} guías`);
    expect(texto).toContain(`${terminos.length} términos`);
    expect(texto).toContain(`${solutions.length} configuraciones`);
  });

  it('no hay href duplicados entre grupos', () => {
    const hrefs = items.map((d) => d.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('declara los dos grupos: documentos y datos', () => {
    expect(grupos().map((g) => g.id)).toEqual(['documentos', 'datos']);
    for (const g of grupos()) expect(g.items.length).toBeGreaterThan(0);
  });

  it('el sitemap publica el centro de documentación', () => {
    const urls = new Set(sitemap().map((e) => e.url));
    expect(urls.has(`${SITE.url}/descargas`)).toBe(true);
  });
});

describe('404 útil', () => {
  const src = readFileSync(join(process.cwd(), 'app/not-found.tsx'), 'utf8');
  /**
   * Se asevera sobre el CÓDIGO, no sobre los comentarios: el comentario que
   * documenta el fallo original cita literalmente el texto que el test
   * prohíbe. Aseverar sobre prosa hace fallar al archivo por explicarse bien.
   */
  const codigo = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('existe una página propia y no el 404 en inglés de Next', () => {
    expect(codigo).toMatch(/Esta página no existe/);
    expect(codigo).not.toMatch(/This page could not be found/);
  });

  it('no se indexa pero sí deja seguir los enlaces', () => {
    expect(src).toMatch(/index: false/);
    expect(src).toMatch(/follow: true/);
  });

  it('ofrece salidas con conteos reales, no un callejón sin salida', () => {
    for (const destino of ['/productos', '/glosario', '/recursos', '/soluciones', '/descargas']) {
      expect(codigo, destino).toContain(`'${destino}'`);
    }
    expect(codigo).toMatch(/products\.length|terminos\.length/);
  });
});
P16_EOF

# -----------------------------------------------------------------------------
# lib/schema.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/schema.ts" <<'P16_EOF'
/**
 * Constructores de JSON-LD. Solo se emiten campos respaldados por datos reales.
 * Nunca Review/AggregateRating sin reseñas genuinas almacenadas, nunca
 * certificaciones ni premios no verificables.
 *
 * GRAFO DE ENTIDAD — regla crítica:
 * El sitio emite UN solo nodo por entidad, identificado por @id estable, y todo
 * lo demás lo referencia. Dos nodos LocalBusiness con @id distintos describiendo
 * la misma empresa fragmentan la entidad y desperdician las señales.
 *
 *   ${SITE.url}/#organization  → Organization  (components/StructuredData.tsx)
 *   ${SITE.url}/#business      → LocalBusiness (components/StructuredData.tsx)
 *   ${SITE.url}/#website       → WebSite       (components/StructuredData.tsx)
 *
 * Las páginas internas NO redeclaran esos nodos: los referencian con
 * businessRef() / organizationRef() / websiteRef().
 */
import { SITE } from "./site";

type Dict = Record<string, unknown>;

export const ORGANIZATION_ID = `${SITE.url}/#organization`;
export const BUSINESS_ID = `${SITE.url}/#business`;
export const WEBSITE_ID = `${SITE.url}/#website`;

/** Referencia al nodo Organization global (no lo redeclara). */
export function organizationRef(): Dict {
  return { "@id": ORGANIZATION_ID };
}

/** Referencia al nodo LocalBusiness global (no lo redeclara). */
export function businessRef(): Dict {
  return { "@id": BUSINESS_ID };
}

/** Referencia al nodo WebSite global (no lo redeclara). */
export function websiteRef(): Dict {
  return { "@id": WEBSITE_ID };
}

/**
 * Nodo WebPage de la página actual, anclado al WebSite. Sustituye al antiguo
 * speakableSchema() suelto, que emitía un WebPage huérfano sin @id ni url —
 * un nodo sin identidad no se conecta al grafo y no aporta señal.
 */
export function webPageSchema(page: {
  url: string;
  name: string;
  description?: string;
  /** Selectores CSS del contenido apto para asistentes de voz. */
  speakable?: string[];
  /** Breadcrumb de la página, si aplica. */
  breadcrumbId?: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage" | "ItemPage";
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": page.type ?? "WebPage",
    "@id": `${page.url}#webpage`,
    url: page.url,
    name: page.name,
    ...(page.description ? { description: page.description } : {}),
    isPartOf: websiteRef(),
    about: businessRef(),
    inLanguage: SITE.language,
    ...(page.breadcrumbId ? { breadcrumb: { "@id": page.breadcrumbId } } : {}),
    ...(page.speakable
      ? {
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: page.speakable,
          },
        }
      : {}),
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
  id?: string,
): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    ...(id ? { "@id": id } : {}),
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function faqSchema(qas: { q: string; a: string }[], url?: string): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(url ? { "@id": `${url}#faq` } : {}),
    ...(url ? { url } : {}),
    inLanguage: SITE.language,
    mainEntity: qas.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  };
}

/**
 * Servicio prestado en una ciudad concreta. Es la señal local correcta: en vez
 * de clonar el LocalBusiness (que vive en Chorrillos) en cada página de ciudad,
 * se declara el servicio con areaServed = la ciudad y provider = la empresa.
 */
export function serviceSchema(s: {
  name: string;
  description: string;
  url: string;
  cityName: string;
  regionName: string;
  serviceTypes?: string[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${s.url}#service`,
    name: s.name,
    description: s.description,
    url: s.url,
    provider: businessRef(),
    areaServed: {
      "@type": "City",
      name: s.cityName,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: s.regionName,
        containedInPlace: { "@type": "Country", name: "Perú" },
      },
    },
    ...(s.serviceTypes?.length ? { serviceType: s.serviceTypes } : {}),
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE.url}/cotizacion`,
      servicePhone: {
        "@type": "ContactPoint",
        telephone: SITE.phoneWhatsApp,
        contactType: "sales",
      },
    },
  };
}

/** Lista ordenada de URLs internas (catálogo, cobertura local, artículos). */
export function itemListSchema(list: {
  url: string;
  name: string;
  description?: string;
  items: { name: string; url: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${list.url}#itemlist`,
    name: list.name,
    ...(list.description ? { description: list.description } : {}),
    numberOfItems: list.items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: list.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

/**
 * Artículo técnico del silo /recursos. Se ancla al WebPage de su propia URL y
 * declara autoría organizacional: la autoridad la sostiene la empresa, no una
 * firma personal inventada.
 */
export function articleSchema(a: {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  section: string;
  keywords?: string[];
  wordCount?: number;
  /** Fuentes externas que respaldan las cifras del artículo. */
  citations?: { label: string; url: string }[];
  /**
   * TechArticle es lo correcto para una guía de especificación. Un anuncio
   * fechado del registro de novedades NO es documentación técnica: declararlo
   * TechArticle degrada la señal de todo el silo /recursos.
   */
  articleType?: "TechArticle" | "Article";
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": a.articleType ?? "TechArticle",
    "@id": `${a.url}#article`,
    headline: a.headline,
    description: a.description,
    url: a.url,
    mainEntityOfPage: { "@id": `${a.url}#webpage` },
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    articleSection: a.section,
    inLanguage: SITE.language,
    author: organizationRef(),
    publisher: organizationRef(),
    ...(a.keywords?.length ? { keywords: a.keywords.join(", ") } : {}),
    ...(a.wordCount ? { wordCount: a.wordCount } : {}),
    ...(a.citations?.length
      ? {
          citation: a.citations.map((c) => ({
            "@type": "CreativeWork",
            name: c.label,
            url: c.url,
          })),
        }
      : {}),
  };
}

/** Procedimiento paso a paso. Solo para secuencias reales y verificables. */
export function howToSchema(h: {
  url: string;
  name: string;
  description: string;
  totalTime?: string;
  steps: { name: string; text: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${h.url}#howto`,
    name: h.name,
    description: h.description,
    inLanguage: SITE.language,
    ...(h.totalTime ? { totalTime: h.totalTime } : {}),
    step: h.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${h.url}#paso-${i + 1}`,
    })),
  };
}

/**
 * @deprecated Redeclaraba un LocalBusiness con @id propio, fragmentando la
 * entidad frente al nodo global de components/StructuredData.tsx. Usa
 * businessRef() dentro de about/provider, o webPageSchema() para la página.
 * Se mantiene devolviendo solo la referencia para no romper importaciones.
 */
export function localBusinessSchema(): Dict {
  return businessRef();
}

/** @deprecated Usa webPageSchema({ speakable }) — un WebPage suelto es huérfano. */
export function speakableSchema(cssSelectors: string[]): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: SITE.language,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
  };
}

export function organizationSchema(): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    foundingDate: SITE.foundingYear,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "RUC",
      value: SITE.ruc,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.addressStreet,
      addressLocality: SITE.addressLocality,
      addressRegion: SITE.addressRegion,
      addressCountry: SITE.addressCountry,
    },
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
}

export function productSchema(p: {
  name: string;
  description: string;
  url: string;
  image?: string;
  material?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
}): Dict {
  const offers =
    p.priceMin != null
      ? {
          "@type": "AggregateOffer",
          priceCurrency: p.currency ?? "PEN",
          lowPrice: p.priceMin,
          ...(p.priceMax != null ? { highPrice: p.priceMax } : {}),
          availability: "https://schema.org/InStock",
          seller: businessRef(),
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    url: p.url,
    ...(p.image ? { image: p.image } : {}),
    ...(p.material ? { material: p.material } : {}),
    brand: { "@type": "Brand", name: SITE.name },
    ...(offers ? { offers } : {}),
  };
}

/**
 * Glosario como conjunto de términos definidos.
 *
 * DefinedTermSet + DefinedTerm es el tipo que schema.org previó exactamente
 * para esto y que casi nadie usa. Declara que el sitio publica un vocabulario
 * del rubro con una URL estable por concepto: es la forma legible por máquina
 * de decir "acá se define este término", que es justo lo que un agente
 * necesita resolver antes de poder citar a alguien.
 */
export function definedTermSetSchema(set: {
  url: string;
  name: string;
  description: string;
  terms: { slug: string; termino: string; definicionCorta: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${set.url}#glosario`,
    name: set.name,
    description: set.description,
    url: set.url,
    inLanguage: SITE.language,
    publisher: organizationRef(),
    hasDefinedTerm: set.terms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${set.url}/${t.slug}#termino`,
      name: t.termino,
      description: t.definicionCorta,
      url: `${set.url}/${t.slug}`,
      termCode: t.slug,
      inDefinedTermSet: { "@id": `${set.url}#glosario` },
    })),
  };
}

/** Un término del glosario, citable por sí solo. */
export function definedTermSchema(t: {
  url: string;
  setUrl: string;
  termino: string;
  definicionCorta: string;
  termCode: string;
  /** Sigla y otras formas de nombrarlo: ayudan a resolver la desambiguación. */
  alternateNames?: string[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${t.url}#termino`,
    name: t.termino,
    description: t.definicionCorta,
    url: t.url,
    termCode: t.termCode,
    inLanguage: SITE.language,
    inDefinedTermSet: { "@id": `${t.setUrl}#glosario` },
    ...(t.alternateNames?.length ? { alternateName: t.alternateNames } : {}),
  };
}

/**
 * Centro de documentación como catálogo de datos.
 *
 * DataCatalog + DataDownload declara en lenguaje de máquina que este sitio
 * publica documentos y datos descargables, con su formato y su URL. Es la
 * diferencia entre que un agente encuentre los archivos rastreando enlaces y
 * que sepa de antemano qué hay disponible y en qué formato.
 */
export function dataCatalogSchema(cat: {
  url: string;
  name: string;
  description: string;
  downloads: { name: string; description: string; href: string; formato: string }[];
}): Dict {
  const mime: Record<string, string> = {
    pdf: "application/pdf",
    json: "application/json",
    rss: "application/rss+xml",
    txt: "text/plain",
    xml: "application/xml",
  };
  return {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    "@id": `${cat.url}#catalogo-documentos`,
    name: cat.name,
    description: cat.description,
    url: cat.url,
    inLanguage: SITE.language,
    publisher: organizationRef(),
    // isAccessibleForFree es el dato que decide si un agente se molesta en
    // intentar la descarga: sin muro de registro, se intenta.
    isAccessibleForFree: true,
    dataset: cat.downloads.map((d) => ({
      "@type": "Dataset",
      name: d.name,
      description: d.description,
      url: `${SITE.url}${d.href}`,
      isAccessibleForFree: true,
      creator: organizationRef(),
      distribution: {
        "@type": "DataDownload",
        contentUrl: `${SITE.url}${d.href}`,
        encodingFormat: mime[d.formato] ?? d.formato,
      },
    })),
  };
}
P16_EOF

# -----------------------------------------------------------------------------
# lib/analytics.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/analytics.ts" <<'P16_EOF'
/**
 * Capa de analítica y conversiones (GA4 + Meta Pixel + GTM).
 *
 * `trackEvent` envía UN evento semántico a todos los proveedores cargados.
 * Nada se ejecuta si el proveedor no está presente (IDs ausentes o sin
 * consentimiento), de modo que llamar a estas funciones siempre es seguro.
 *
 * POR QUÉ IMPORTA: en el Perú B2B el canal de leads es WhatsApp. Si los clics a
 * WhatsApp no se miden, no se puede saber qué página, qué familia o qué ciudad
 * produce negocio — y toda inversión publicitaria se hace a ciegas. Por eso
 * TODO punto de salida a WhatsApp debe pasar por `components/WhatsAppLink.tsx`,
 * que dispara `whatsapp_click` con el contexto de origen. Hay un test que falla
 * si alguien vuelve a escribir un enlace `wa.me` a mano.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', name, params);
  window.fbq?.('trackCustom', name, params);
  window.dataLayer?.push({ event: name, ...params });
}

/* ------------------------------------------------------------------ */
/* Conversiones — miden intención de compra, no vanidad.               */
/* ------------------------------------------------------------------ */

/**
 * El formulario de cotización se ABRIÓ. Junto con `quote_request` da la tasa
 * de abandono del formulario, que es lo que dice si el formulario pide de más.
 */
export function trackQuoteStarted(context: string, producto?: string): void {
  trackEvent('quote_started', { context, producto: producto ?? 'general' });
}

/** Solicitud de cotización enviada — la conversión principal del negocio. */
export function trackQuoteRequest(producto?: string): void {
  const content = producto ?? 'general';
  trackEvent('quote_request', { producto: content });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Lead', { content_name: content });
  }
}

/**
 * Clic para contactar por WhatsApp — canal #1 de leads en Perú.
 * `context` identifica el punto de salida (footer, ficha de producto, ciudad…)
 * para poder atribuir el lead a la página que lo generó.
 */
export function trackWhatsAppClick(context?: string): void {
  trackEvent('whatsapp_click', { context: context ?? 'general' });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Contact');
  }
}

/** Primer mensaje enviado al asistente: intención real, no apertura del widget. */
export function trackChatbotEngaged(): void {
  trackEvent('chatbot_engaged');
}

/** Descarga de ficha técnica u otro documento. */
export function trackDocumentDownload(documento: string, producto?: string): void {
  trackEvent('document_download', { documento, producto: producto ?? 'general' });
}

/** Clic en un ícono de red social. */
export function trackSocialClick(network: string): void {
  trackEvent('social_click', { network });
}

/* ------------------------------------------------------------------ */
/* Vistas de contenido — qué silo produce demanda.                     */
/* ------------------------------------------------------------------ */

export function trackProductView(slug: string, categoria: string): void {
  trackEvent('product_view', { slug, categoria });
}

export function trackFamilyView(slug: string): void {
  trackEvent('family_view', { slug });
}

export function trackCityPageView(ciudad: string): void {
  trackEvent('city_page_view', { ciudad });
}

export function trackArticleView(slug: string, categoria: string): void {
  trackEvent('article_view', { slug, categoria });
}

/**
 * Vista de una tabla comparativa. Es la señal de intención más avanzada del
 * catálogo: quien compara especificación por especificación ya está eligiendo
 * proveedor, no explorando.
 */
export function trackComparisonView(familia: string): void {
  trackEvent('comparison_view', { familia });
}

/** Vista de una arquitectura de referencia: intención de proyecto completo. */
export function trackSolutionView(slug: string): void {
  trackEvent('solution_view', { slug });
}

/**
 * Vista del registro fechado. Mide lo que ninguna otra métrica del sitio mide:
 * si la frescura sostiene el retorno de un comprador que ya nos conoce.
 */
export function trackNovedadView(slug: string): void {
  trackEvent('novedad_view', { slug });
}

/**
 * Vista de un término del glosario. Es el evento que revela intención
 * temprana: quien busca qué significa "geotextil" está especificando, no
 * comparando precios todavía.
 */
export function trackGlosarioView(slug: string): void {
  trackEvent('glosario_view', { slug });
}

/** Vista del centro de documentación: intención de armar expediente técnico. */
export function trackDescargasView(slug: string): void {
  trackEvent('descargas_view', { slug });
}

/* ------------------------------------------------------------------ */
/* Marco de Especificación — el embudo de mayor intención del sitio.   */
/* ------------------------------------------------------------------ */

/** Vista del marco publicado o de la autoevaluación. */
export function trackFrameworkView(seccion: string): void {
  trackEvent('framework_view', { seccion });
}

/** El usuario respondió el primer criterio: empezó de verdad. */
export function trackFrameworkStarted(): void {
  trackEvent('framework_started');
}

/**
 * Autoevaluación completada. El porcentaje es la señal comercial: un proyecto
 * "Definido" está listo para cotizar; uno "Exploratorio" necesita asesoría.
 */
export function trackFrameworkCompleted(porcentaje: number, nivel: string): void {
  trackEvent('framework_completed', { porcentaje, nivel });
}

/** Descarga del brief técnico generado por la autoevaluación. */
export function trackBriefDownload(nivel: string): void {
  trackEvent('brief_download', { nivel });
}
P16_EOF

# -----------------------------------------------------------------------------
# components/TrackView.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/TrackView.tsx" <<'P16_EOF'
'use client';

import { useEffect, useRef } from 'react';
import {
  trackArticleView,
  trackCityPageView,
  trackComparisonView,
  trackFamilyView,
  trackFrameworkView,
  trackSolutionView,
  trackNovedadView,
  trackGlosarioView,
  trackDescargasView,
  trackProductView,
} from '@/lib/analytics';

/**
 * Emite un evento de vista de contenido una sola vez por montaje.
 *
 * Se renderiza desde páginas de servidor (fichas, familias, ciudades,
 * artículos) sin convertirlas en client components: solo este pequeño
 * componente se hidrata. Sin estos eventos no se puede responder a la pregunta
 * que decide dónde invertir: ¿qué silo produce cotizaciones?
 */

type Props =
  | { kind: 'product'; slug: string; categoria: string }
  | { kind: 'family'; slug: string }
  | { kind: 'city'; ciudad: string }
  | { kind: 'article'; slug: string; categoria: string }
  | { kind: 'comparison'; slug: string }
  | { kind: 'framework'; slug: string }
  | { kind: 'solution'; slug: string }
  | { kind: 'novedades'; slug: string }
  | { kind: 'glosario'; slug: string }
  | { kind: 'descargas'; slug: string };

export default function TrackView(props: Props) {
  const fired = useRef(false);

  useEffect(() => {
    // React 18 monta dos veces en desarrollo con StrictMode: sin esta guarda
    // el evento se duplicaría y las tasas de conversión saldrían a la mitad.
    if (fired.current) return;
    fired.current = true;

    switch (props.kind) {
      case 'product':
        trackProductView(props.slug, props.categoria);
        break;
      case 'family':
        trackFamilyView(props.slug);
        break;
      case 'city':
        trackCityPageView(props.ciudad);
        break;
      case 'article':
        trackArticleView(props.slug, props.categoria);
        break;
      case 'comparison':
        trackComparisonView(props.slug);
        break;
      case 'framework':
        trackFrameworkView(props.slug);
        break;
      case 'solution':
        trackSolutionView(props.slug);
        break;
      case 'novedades':
        trackNovedadView(props.slug);
        break;
      case 'glosario':
        trackGlosarioView(props.slug);
        break;
      case 'descargas':
        trackDescargasView(props.slug);
        break;
    }
  }, [props]);

  return null;
}
P16_EOF

# -----------------------------------------------------------------------------
# lib/novedades.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/novedades.ts" <<'P16_EOF'
import { SITE } from './site';

/**
 * NOVEDADES — el registro fechado de lo que cambia en esta referencia.
 *
 * Qué es. Un feed cronológico de cada cambio publicado que altera lo que un
 * comprador puede especificar, comparar o descargar. Es el equivalente del
 * "What's New" de un proveedor de infraestructura: no es un blog, no opina,
 * no anuncia intenciones. Cada entrada apunta a algo que YA está en línea y
 * que el lector puede abrir en el mismo clic.
 *
 * Por qué existe. Una referencia sin fecha no se distingue de un folleto. El
 * comprador técnico que vuelve al sitio necesita responder en diez segundos
 * "¿qué hay acá que no estaba la última vez?", y los agentes y rastreadores
 * necesitan una señal de frescura que no sea un `lastmod` movido a mano en
 * cada deploy. Este archivo es esa señal, y es verificable: si una entrada
 * miente, el enlace la delata.
 *
 * Por qué es un MECANISMO y no una campaña. La regla es de proceso, no de
 * voluntad: todo cambio que agregue, modifique o retire una línea de producto,
 * una guía, un criterio del marco o una arquitectura de referencia entra acá
 * el mismo día, con su enlace. Nada más entra. Un feed que también publica
 * "felices fiestas" deja de ser consultable en tres meses.
 *
 * REGLAS DE HONESTIDAD — obligatorias al añadir una entrada:
 *  1. `fecha` es la fecha real de publicación del cambio. No se antedata para
 *     simular actividad ni se agrupa un mes de trabajo en un solo día.
 *  2. Toda entrada enlaza a la página que cambió. Sin enlace verificable no
 *     hay entrada (hay un test que valida cada href contra las rutas reales).
 *  3. No se anuncia lo que todavía no está desplegado. Nada de "próximamente".
 *  4. Las cifras históricas se congelan a propósito: "36 líneas" en una
 *     entrada de agosto describe el catálogo de ese día, no el de hoy. Por eso
 *     NO se derivan de lib/products.ts — un registro fechado que se reescribe
 *     solo deja de ser un registro.
 *  5. No se publican obras ejecutadas, clientes ni cifras de negocio. Este
 *     feed documenta la referencia pública, no la operación comercial.
 */

export type NovedadTipo = 'catalogo' | 'guia' | 'herramienta' | 'referencia';

export const tipoLabels: Record<NovedadTipo, string> = {
  catalogo: 'Catálogo',
  guia: 'Guía técnica',
  herramienta: 'Herramienta',
  referencia: 'Referencia del rubro',
};

/** Qué significa cada tipo, para que la etiqueta no dependa del contexto. */
export const tipoDescripciones: Record<NovedadTipo, string> = {
  catalogo: 'Cambios en las líneas de producto publicadas y en cómo se navegan.',
  guia: 'Guías de especificación e instalación nuevas o revisadas, con sus fuentes.',
  herramienta: 'Utilidades que producen un documento o una decisión: fichas, comparadores, autoevaluaciones.',
  referencia: 'Material que define criterios del rubro y es útil aunque el proyecto se compre a otro proveedor.',
};

export interface NovedadEnlace {
  label: string;
  href: string;
}

export interface Novedad {
  slug: string;
  /** Fecha real de publicación, ISO (YYYY-MM-DD). */
  fecha: string;
  tipo: NovedadTipo;
  titulo: string;
  /** Una frase. Alimenta la meta description, el RSS y el JSON Feed. */
  resumen: string;
  /** Qué cambia para quien especifica o compra. La razón para leer la entrada. */
  queCambia: string;
  detalle: string[];
  enlaces: NovedadEnlace[];
}

/**
 * Orden de escritura: cronológico ascendente (se agrega al final).
 * La exportación `novedades` lo invierte, de modo que agregar una entrada
 * nunca obliga a tocar las anteriores.
 */
const registro: Novedad[] = [
  {
    slug: 'silo-tecnico-recursos-primeras-guias',
    fecha: '2026-08-17',
    tipo: 'guia',
    titulo: 'Abre /recursos: guías de especificación con las fuentes a la vista',
    resumen:
      'Publicamos las primeras tres guías técnicas sobre big bags en minería, instalación de geomembranas HDPE y cálculo de caudal en mangas de ventilación.',
    queCambia:
      'Las decisiones que antes se resolvían por teléfono quedan escritas, con la norma o el método que las respalda citado y enlazado.',
    detalle: [
      'El catálogo respondía qué vendemos, no cómo se especifica. Las primeras tres guías cubren los tres puntos donde vimos fallar más proyectos: la estiba y el izaje de big bags en operación minera, el anclaje y la soldadura de geomembrana HDPE en pozas y canales, y el cálculo de caudal para dimensionar una manga de ventilación en labor subterránea.',
      'Cada cifra normativa lleva su fuente con URL. Donde no pudimos verificar el número de artículo de una norma vigente, la guía lo dice y remite al texto oficial en lugar de inventarlo. Los cálculos se publican como método reproducible de prediseño, no como memoria firmada.',
    ],
    enlaces: [
      { label: 'Guías técnicas', href: '/recursos' },
      {
        label: 'Big bags en minería: normativa y errores de estiba',
        href: '/recursos/big-bags-mineria-peru-normativa-errores-estiba',
      },
      {
        label: 'Instalación de geomembranas HDPE en pozas y canales',
        href: '/recursos/instalacion-geomembranas-hdpe-pozas-canales',
      },
    ],
  },
  {
    slug: 'paginas-de-familia-con-criterios',
    fecha: '2026-08-17',
    tipo: 'catalogo',
    titulo: 'Las once familias del catálogo pasan a tener página propia',
    resumen:
      'Cada familia de producto tiene ahora URL estable, criterios de especificación, sectores que la compran y sus guías relacionadas.',
    queCambia:
      'Se puede enviar el enlace de una familia completa —con lo que gobierna su elección— en vez de once fichas sueltas o un catálogo filtrado que no se puede compartir.',
    detalle: [
      'La navegación por familia se resolvía filtrando el catálogo en el navegador, de modo que once mercados con intención distinta compartían una sola dirección. Ahora cada familia tiene su página: qué resuelve, qué define su especificación, con qué sectores se usa, cómo la abastecemos y en qué estado está la oferta.',
      'El dato de abastecimiento y disponibilidad sale del catálogo, no de una redacción de marketing: si una línea es de fabricación propia, importación directa o bajo pedido, la página lo declara.',
    ],
    enlaces: [
      { label: 'Catálogo por familia', href: '/productos' },
      { label: 'Envases y embalaje', href: '/productos/familia/envases-embalaje' },
      { label: 'Lonas y cobertores', href: '/productos/familia/lonas-cobertores' },
    ],
  },
  {
    slug: 'siete-guias-nuevas-silo-a-diez',
    fecha: '2026-08-17',
    tipo: 'guia',
    titulo: 'Siete guías nuevas: el silo técnico llega a diez',
    resumen:
      'Ventilación impelente frente a aspirante, elección de geotextil, densidad de malla antiáfida, carga de viento en carpas, transporte de concentrado, tanques flexibles y cálculo de mulch.',
    queCambia:
      'Las siete decisiones que más veces nos llegan mal definidas quedan documentadas con su criterio y su fuente, disponibles antes de pedir cotización.',
    detalle: [
      'Cada guía nueva nació de un modo de falla real observado en obra, no de una lista de palabras clave: la manga aspirante sin refuerzo que colapsa, la malla cerrada que sube la temperatura del cultivo porque nadie recalculó la ventilación, la carpa dimensionada sin la carga de viento de la norma E.020.',
      'Ese mismo patrón es el que después se formalizó como Marco de Especificación: un modo de falla documentado se convierte en un criterio verificable.',
    ],
    enlaces: [
      { label: 'Guías técnicas', href: '/recursos' },
      {
        label: 'Ventilación impelente vs. aspirante en labores mineras',
        href: '/recursos/ventilacion-impelente-vs-aspirante-labores-mineras',
      },
      {
        label: 'Carpas industriales: carga de viento y norma E.020',
        href: '/recursos/carpas-industriales-carga-viento-norma-e020',
      },
    ],
  },
  {
    slug: 'fichas-tecnicas-pdf-descargables',
    fecha: '2026-08-19',
    tipo: 'herramienta',
    titulo: 'Ficha técnica en PDF descargable para las 36 líneas del catálogo',
    resumen:
      'Cada producto genera su ficha en PDF desde el mismo catálogo que alimenta la web: especificaciones, aplicaciones, sectores, abastecimiento y disponibilidad.',
    queCambia:
      'El expediente técnico se arma sin esperar respuesta comercial, y la ficha nunca contradice a la página porque ambas salen de la misma fuente.',
    detalle: [
      'En una compra industrial la ficha se adjunta a un expediente, se reenvía a un jefe de planta y se archiva. Pedirla por correo agrega un día al ciclo y produce versiones que se desactualizan solas.',
      'El PDF se genera desde lib/products.ts en tiempo de compilación, así que no existe una versión "de marketing" divergente. La ficha no declara certificaciones ni números de lote: esos documentos los emite el fabricante y se entregan con la cotización.',
    ],
    enlaces: [
      { label: 'Catálogo completo', href: '/productos' },
      {
        label: 'Ejemplo: ficha de big bags de polipropileno',
        href: '/productos/big-bags-bolsones-polipropileno',
      },
    ],
  },
  {
    slug: 'comparador-lado-a-lado-por-familia',
    fecha: '2026-08-19',
    tipo: 'herramienta',
    titulo: 'Comparador lado a lado dentro de cada familia',
    resumen:
      'Las familias con dos o más líneas tienen una tabla comparativa con las especificaciones enfrentadas y el criterio que decide entre ellas.',
    queCambia:
      'La comparación deja de hacerse abriendo pestañas en paralelo, y la cotización se arma con las alternativas ya seleccionadas.',
    detalle: [
      'Comparar era el paso que el sitio dejaba al cliente: abrir varias fichas, copiar especificaciones a una hoja y perder por el camino el criterio que realmente decide. La tabla enfrenta las líneas de una misma familia campo por campo.',
      'Desde la comparativa se pasa a la cotización con las alternativas ya cargadas, de modo que la consulta llega con la especificación puesta y no como "necesito lonas".',
    ],
    enlaces: [
      {
        label: 'Comparar lonas y cobertores',
        href: '/productos/familia/lonas-cobertores/comparar',
      },
      { label: 'Catálogo por familia', href: '/productos' },
    ],
  },
  {
    slug: 'marco-de-especificacion-v1',
    fecha: '2026-08-19',
    tipo: 'referencia',
    titulo: 'Publicamos el Marco de Especificación v1.0: 26 criterios en 6 pilares',
    resumen:
      'Un conjunto público de criterios para definir un proyecto textil industrial o geosintético antes de cotizarlo, con autoevaluación y brief descargable.',
    queCambia:
      'Existe un estándar escrito contra el cual medir cualquier propuesta —incluida la nuestra— y una autoevaluación que dice qué falta definir antes de pedir precios.',
    detalle: [
      'Los proyectos rara vez fallan por el material: fallan por lo que nadie definió. El marco convierte cada modo de falla documentado en nuestras guías en una pregunta verificable, agrupada en seis pilares: compatibilidad, cargas, exposición, ejecución, documentación y operación.',
      'La autoevaluación puntúa cuán definido está el proyecto del cliente, no a los proveedores: no es un ranking disfrazado. El brief se genera en el navegador y las respuestas no se envían a ningún servidor.',
      'Es útil aunque el proyecto termine comprándose a un competidor. Esa es exactamente la razón por la que un criterio publicado se convierte en referencia y una lista de ventajas propias no.',
    ],
    enlaces: [
      { label: 'Marco de Especificación', href: '/marco' },
      { label: 'Autoevaluación con brief descargable', href: '/marco/evaluacion' },
    ],
  },
  {
    slug: 'seis-arquitecturas-de-referencia',
    fecha: '2026-08-19',
    tipo: 'referencia',
    titulo: 'Seis arquitecturas de referencia: el conjunto armado, no la pieza suelta',
    resumen:
      'Poza revestida, frente de avance ventilado, despacho de concentrado a granel, protección de cultivo, almacenamiento de agua en operación remota y campamento con almacén temporal.',
    queCambia:
      'Quien necesita resolver un escenario completo ve la lista de materiales entera, el orden de ejecución y qué falla al comprar por piezas sueltas.',
    detalle: [
      'El catálogo vendía componentes y nunca mostraba el conjunto montado. Un jefe de proyecto que debe revestir una poza de proceso no busca "geomembrana HDPE 1.5 mm": busca la poza, y descubre tarde que faltaba el geotextil de protección o el detalle de anclaje.',
      'Cada arquitectura publica su escenario, la lista de materiales donde cada componente declara el criterio que lo gobierna, la secuencia de ejecución, los riesgos frecuentes y las guías que documentan cada paso.',
      'No son casos de estudio. No declaran obras ejecutadas, clientes ni cifras: describen configuraciones técnicas verificables contra el catálogo.',
    ],
    enlaces: [
      { label: 'Arquitecturas de referencia', href: '/soluciones' },
      {
        label: 'Poza de proceso revestida',
        href: '/soluciones/poza-revestida-impermeabilizacion',
      },
      { label: 'Frente de avance ventilado', href: '/soluciones/frente-avance-ventilado' },
    ],
  },
  {
    slug: 'glosario-tecnico-del-rubro',
    fecha: '2026-08-20',
    tipo: 'referencia',
    titulo: 'Publicamos el glosario técnico: 43 términos con URL propia',
    resumen:
      'Vocabulario del rubro definido con precisión —qué significa cada término, en qué unidad se mide y qué decide en obra— con versión legible por máquina.',
    queCambia:
      'Deja de hacer falta deducir el vocabulario del contexto: cada término tiene su definición canónica, su unidad de medida y el enlace a las guías y productos donde manda.',
    detalle: [
      'El sitio respondía qué vendemos, qué línea sirve, cómo se especifica, cómo se arma el conjunto y qué cambió. No respondía la pregunta anterior a todas: qué significa esta palabra. Es la que alguien escribe en un buscador antes de poder pedir nada.',
      'Cada término declara su definición en una sola frase autosuficiente, su desarrollo, la magnitud y unidad con que se expresa, qué decide en obra y el error frecuente que resuelve. Los términos se enlazan entre sí, con las guías que los desarrollan y con los productos donde gobiernan la especificación.',
      'Las definiciones describen el término en el rubro, no nuestros productos: son útiles aunque el proyecto se compre a otro proveedor. Ninguna incluye cifras normativas — para eso están las guías, que citan su fuente.',
      'Se publica además en formato de datos, con instrucción explícita de atribución, para que citarlo correctamente sea el camino de menor resistencia.',
    ],
    enlaces: [
      { label: 'Glosario técnico', href: '/glosario' },
      { label: 'Geotextil', href: '/glosario/geotextil' },
      { label: 'Tipos electrostáticos de FIBC', href: '/glosario/tipo-electrostatico-fibc' },
      { label: 'Ventilación impelente', href: '/glosario/ventilacion-impelente' },
    ],
  },
  {
    slug: 'centro-de-documentacion-y-datos-abiertos',
    fecha: '2026-08-20',
    tipo: 'herramienta',
    titulo: 'Centro de documentación: todo descargable en PDF y en datos abiertos',
    resumen:
      'Guías, arquitecturas, glosario y Marco de Especificación pasan a tener versión en PDF, y el catálogo completo se publica en formato de datos con instrucción de atribución.',
    queCambia:
      'El expediente técnico se arma sin pedir nada por correo, y cualquier integración o agente puede leer el catálogo entero sin rastrear página por página.',
    detalle: [
      'Hasta ahora solo las fichas de producto eran descargables. Un jefe de proyecto que arma un expediente necesita también la guía, la lista de materiales del conjunto y el criterio contra el que se evalúan las propuestas — y en obra, sin señal, el enlace no sirve: sirve el archivo.',
      'Todos los documentos se generan desde las mismas fuentes que alimentan las páginas, de modo que la versión descargada y la publicada nunca divergen. Ninguno declara precio, certificaciones ni ensayos que el catálogo no contenga.',
      'El catálogo completo se publica además en formato de datos, con especificaciones, modo de suministro, ficha en PDF, términos del glosario que gobiernan cada línea y arquitecturas donde encaja. Sin precios y sin existencias: la disponibilidad se declara como modo de suministro, que es un dato estable, y el precio se establece en cada cotización.',
      'Todo se descarga sin registro: si usted descarga algo, no nos enteramos de quién es.',
    ],
    enlaces: [
      { label: 'Centro de documentación', href: '/descargas' },
      { label: 'Marco de Especificación', href: '/marco' },
      { label: 'Glosario técnico', href: '/glosario' },
      { label: 'Catálogo completo', href: '/productos' },
    ],
  },
];

/** Novedades de la más reciente a la más antigua. */
export const novedades: Novedad[] = [...registro].sort((a, b) =>
  a.fecha === b.fecha ? registro.indexOf(b) - registro.indexOf(a) : b.fecha.localeCompare(a.fecha),
);

export const novedadBySlug = (slug: string): Novedad | undefined =>
  novedades.find((n) => n.slug === slug);

/** Fecha de la última novedad: señal de frescura para sitemap y feeds. */
export const NOVEDADES_UPDATED: string = novedades[0]?.fecha ?? '';

/** Tipos presentes, en el orden en que se declaran las etiquetas. */
export const tiposPresentes = (): NovedadTipo[] =>
  (Object.keys(tipoLabels) as NovedadTipo[]).filter((t) => novedades.some((n) => n.tipo === t));

export const novedadesPorTipo = (tipo: NovedadTipo): Novedad[] =>
  novedades.filter((n) => n.tipo === tipo);

/** Agrupa por mes para el índice, conservando el orden descendente. */
export function novedadesPorMes(): { mes: string; etiqueta: string; items: Novedad[] }[] {
  const meses = new Map<string, Novedad[]>();
  for (const n of novedades) {
    const mes = n.fecha.slice(0, 7);
    const acc = meses.get(mes);
    if (acc) acc.push(n);
    else meses.set(mes, [n]);
  }
  return [...meses.entries()].map(([mes, items]) => ({
    mes,
    etiqueta: etiquetaDeMes(mes),
    items,
  }));
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
];

/** "2026-08" → "agosto de 2026". Setiembre con "t": uso peruano. */
export function etiquetaDeMes(mes: string): string {
  const [anio, m] = mes.split('-');
  return `${MESES[Number(m) - 1]} de ${anio}`;
}

/** "2026-08-19" → "19 de agosto de 2026". Sin Intl: la salida debe ser estable. */
export function fechaLarga(fecha: string): string {
  const [anio, m, d] = fecha.split('-');
  return `${Number(d)} de ${MESES[Number(m) - 1]} de ${anio}`;
}

export const novedadUrl = (slug: string): string => `${SITE.url}/novedades/${slug}`;
P16_EOF

# -----------------------------------------------------------------------------
# test/novedades.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/novedades.test.ts" <<'P16_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  novedades,
  novedadBySlug,
  novedadesPorMes,
  novedadesPorTipo,
  tipoLabels,
  tipoDescripciones,
  tiposPresentes,
  fechaLarga,
  etiquetaDeMes,
  NOVEDADES_UPDATED,
} from '@/lib/novedades';
import { buildRss, buildJsonFeed, escapeXml, toRfc822 } from '@/lib/novedades-feed';
import { products } from '@/lib/products';
import { articles } from '@/lib/articles';
import { solutions } from '@/lib/solutions';
import { familyContent, comparableFamilies } from '@/lib/families';
import { terminos } from '@/lib/glosario';
import { generateStaticParams } from '@/app/novedades/[slug]/page';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';

/**
 * El registro fechado sólo vale si no se puede mentir en él sin romper la
 * compilación. Estos tests son el mecanismo: validan que cada enlace resuelva
 * a una ruta real del sitio, que ninguna entrada esté fechada en el futuro y
 * que los feeds sean documentos válidos.
 */

/** Todas las rutas internas que el sitio realmente publica. */
const rutasValidas = new Set<string>([
  '/',
  '/productos',
  '/servicios',
  '/nosotros',
  '/contacto',
  '/cotizacion',
  '/local',
  '/recursos',
  '/marco',
  '/marco/evaluacion',
  '/soluciones',
  '/novedades',
  '/glosario',
  '/descargas',
  ...products.map((p) => `/productos/${p.slug}`),
  ...articles.map((a) => `/recursos/${a.slug}`),
  ...solutions.map((s) => `/soluciones/${s.slug}`),
  ...familyContent.map((f) => `/productos/familia/${f.slug}`),
  ...comparableFamilies().map((f) => `/productos/familia/${f.slug}/comparar`),
  ...novedades.map((n) => `/novedades/${n.slug}`),
  ...terminos.map((t) => `/glosario/${t.slug}`),
]);

describe('novedades: el registro no puede mentir', () => {
  it('cada enlace de cada entrada resuelve a una ruta que existe', () => {
    // Sin esto, una entrada puede anunciar algo que no se desplegó. El enlace
    // roto es exactamente la forma en que un registro fechado pierde su valor.
    for (const n of novedades) {
      expect(n.enlaces.length, `${n.slug} sin enlaces`).toBeGreaterThan(0);
      for (const e of n.enlaces) {
        expect(rutasValidas.has(e.href), `${n.slug} → ${e.href}`).toBe(true);
      }
    }
  });

  it('ninguna entrada está fechada en el futuro', () => {
    const hoy = new Date().toISOString().slice(0, 10);
    for (const n of novedades) {
      expect(n.fecha <= hoy, `${n.slug} fechada ${n.fecha}`).toBe(true);
    }
  });

  it('las fechas son ISO estrictas (YYYY-MM-DD) y parseables', () => {
    for (const n of novedades) {
      expect(n.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(`${n.fecha}T12:00:00Z`))).toBe(false);
    }
  });

  it('el orden es estrictamente descendente por fecha', () => {
    for (let i = 1; i < novedades.length; i++) {
      expect(novedades[i - 1].fecha >= novedades[i].fecha).toBe(true);
    }
  });

  it('los slugs son únicos y en kebab-case', () => {
    const vistos = new Set<string>();
    for (const n of novedades) {
      expect(n.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(vistos.has(n.slug), `slug duplicado: ${n.slug}`).toBe(false);
      vistos.add(n.slug);
    }
  });

  it('cada entrada declara qué cambia para quien especifica', () => {
    // Un registro que sólo dice "publicamos X" obliga al lector a deducir por
    // qué debería importarle. Ese campo es obligatorio por eso.
    for (const n of novedades) {
      expect(n.queCambia.length, n.slug).toBeGreaterThan(40);
      expect(n.detalle.length, n.slug).toBeGreaterThan(0);
    }
  });

  it('el resumen cabe como meta description', () => {
    for (const n of novedades) {
      expect(n.resumen.length, `${n.slug}: ${n.resumen.length}`).toBeLessThanOrEqual(200);
      expect(n.resumen.length).toBeGreaterThan(50);
    }
  });

  it('no se anuncia lo que todavía no está publicado', () => {
    // "Próximamente" convierte el registro en una lista de intenciones.
    const prohibido = /pr[óo]ximamente|muy pronto|estamos trabajando|en desarrollo|pr[óo]xima versi[óo]n/i;
    for (const n of novedades) {
      const texto = [n.titulo, n.resumen, n.queCambia, ...n.detalle].join(' ');
      expect(prohibido.test(texto), n.slug).toBe(false);
    }
  });

  it('no se declaran obras ejecutadas, clientes ni cifras de negocio', () => {
    const prohibido = /nuestro cliente|caso de éxito|caso de exito|facturaci[óo]n|ventas por|premio|certificad[oa]s? por/i;
    for (const n of novedades) {
      const texto = [n.titulo, n.resumen, n.queCambia, ...n.detalle].join(' ');
      expect(prohibido.test(texto), n.slug).toBe(false);
    }
  });

  it('cada tipo declarado tiene etiqueta y descripción', () => {
    for (const n of novedades) {
      expect(tipoLabels[n.tipo], n.slug).toBeTruthy();
      expect(tipoDescripciones[n.tipo], n.slug).toBeTruthy();
    }
    for (const t of tiposPresentes()) {
      expect(novedadesPorTipo(t).length).toBeGreaterThan(0);
    }
  });
});

describe('novedades: rutas y descubrimiento', () => {
  it('generateStaticParams cubre todas las entradas', () => {
    const params = generateStaticParams().map((p) => p.slug).sort();
    expect(params).toEqual(novedades.map((n) => n.slug).sort());
  });

  it('novedadBySlug encuentra cada entrada y rechaza las inexistentes', () => {
    for (const n of novedades) expect(novedadBySlug(n.slug)?.titulo).toBe(n.titulo);
    expect(novedadBySlug('no-existe')).toBeUndefined();
  });

  it('el sitemap incluye el índice y todas las entradas con su fecha real', () => {
    const urls = new Map(sitemap().map((e) => [e.url, e.lastModified]));
    expect(urls.has(`${SITE.url}/novedades`)).toBe(true);
    for (const n of novedades) {
      const lastMod = urls.get(`${SITE.url}/novedades/${n.slug}`);
      expect(lastMod, n.slug).toBeDefined();
      // La fecha del sitemap es la de publicación, no la del despliegue: un
      // lastmod movido en cada deploy le enseña a Google a ignorarlo.
      expect(new Date(lastMod as Date).toISOString().slice(0, 10)).toBe(n.fecha);
    }
  });

  it('el índice agrupa por mes sin perder ni duplicar entradas', () => {
    const agrupadas = novedadesPorMes().flatMap((m) => m.items);
    expect(agrupadas.map((n) => n.slug)).toEqual(novedades.map((n) => n.slug));
  });

  it('NOVEDADES_UPDATED es la fecha de la entrada más reciente', () => {
    expect(NOVEDADES_UPDATED).toBe(novedades[0].fecha);
  });

  it('las fechas se formatean en español peruano sin depender de Intl', () => {
    expect(fechaLarga('2026-08-19')).toBe('19 de agosto de 2026');
    expect(fechaLarga('2026-09-01')).toBe('1 de setiembre de 2026');
    expect(etiquetaDeMes('2026-08')).toBe('agosto de 2026');
  });
});

describe('novedades: descubrimiento del feed en todo el sitio', () => {
  const layout = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');

  it('el <head> raíz declara el feed RSS en JSX, no en metadata.alternates', () => {
    // Cada página define su propio alternates.canonical y Next reemplaza el
    // objeto entero: puesto en metadata, el enlace del feed sólo sobrevivía en
    // /novedades. Se verificó midiendo el HTML renderizado, no leyendo la API.
    expect(layout).toMatch(/rel="alternate"/);
    expect(layout).toMatch(/type="application\/rss\+xml"/);
    expect(layout).toMatch(/novedades\/rss\.xml/);
  });

  it('la URL del feed se deriva de SITE.url y no está escrita a mano', () => {
    expect(layout).toMatch(/\$\{SITE\.url\}\/novedades\/rss\.xml/);
    expect(layout).not.toContain('https://plastilonas.com');
  });
});

describe('novedades: feeds', () => {
  const rss = buildRss();

  it('escapa los caracteres que rompen el XML', () => {
    expect(escapeXml('Lonas & "cobertores" <1.5 mm>')).toBe(
      'Lonas &amp; &quot;cobertores&quot; &lt;1.5 mm&gt;',
    );
  });

  it('el RSS declara cabecera, canal y un item por entrada', () => {
    expect(rss.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(rss).toContain('<rss version="2.0"');
    expect((rss.match(/<item>/g) ?? []).length).toBe(novedades.length);
    expect((rss.match(/<\/item>/g) ?? []).length).toBe(novedades.length);
  });

  it('el RSS no contiene ampersands sin escapar', () => {
    // Un solo & crudo invalida el documento entero para cualquier lector.
    expect(rss).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#)/);
  });

  it('todas las URLs del feed heredan de SITE.url', () => {
    // Nunca se codifica el dominio a mano: el día de la migración a
    // plastilonas.com debe bastar con cambiar lib/site.ts. Se exceptúan los
    // espacios de nombres XML, que son identificadores y no direcciones.
    const NAMESPACES = ['http://www.w3.org/'];
    for (const n of novedades) {
      expect(rss).toContain(`${SITE.url}/novedades/${n.slug}`);
    }
    const urls = (rss.match(/https?:\/\/[^\s"'<>]+/g) ?? []).filter(
      (u) => !NAMESPACES.some((ns) => u.startsWith(ns)),
    );
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u.startsWith(SITE.url), u).toBe(true);
  });

  it('las fechas del RSS son RFC 822 y no se corren de día en Lima', () => {
    // Con 00:00Z un lector en UTC-5 muestra la entrada el día anterior.
    expect(toRfc822('2026-08-19')).toBe('Wed, 19 Aug 2026 12:00:00 GMT');
    for (const n of novedades) expect(rss).toContain(toRfc822(n.fecha));
  });

  it('el JSON Feed es válido y expone las mismas entradas', () => {
    const feed = JSON.parse(buildJsonFeed());
    expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
    expect(feed.items).toHaveLength(novedades.length);
    expect(feed.feed_url).toBe(`${SITE.url}/novedades/feed.json`);
    for (const [i, item] of feed.items.entries()) {
      expect(item.id).toBe(`${SITE.url}/novedades/${novedades[i].slug}`);
      expect(item.date_published).toBe(`${novedades[i].fecha}T12:00:00Z`);
      expect(item.content_text.length).toBeGreaterThan(0);
    }
  });
});
P16_EOF

# -----------------------------------------------------------------------------
# app/sitemap.ts
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/sitemap.ts" <<'P16_EOF'
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { products } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { familyContent, comparableFamilies } from "@/lib/families";
import { FRAMEWORK_UPDATED } from "@/lib/framework";
import { solutions } from "@/lib/solutions";
import { novedades, NOVEDADES_UPDATED } from "@/lib/novedades";
import { LEGAL_UPDATED } from "@/lib/legal";
import { terminos } from "@/lib/glosario";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/productos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE.url}/cotizacion`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/local`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/recursos`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    // Centro de documentación: la puerta de "necesito papeles para el expediente".
    { url: `${SITE.url}/descargas`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // Avisos legales: prioridad baja pero indexables. Sin ellos, el pie
    // enlazaba las dos páginas legales a /contacto.
    { url: `${SITE.url}/privacidad`, lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/terminos`, lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/productos/${p.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.8,
  }));

  const localRoutes: MetadataRoute.Sitemap = (ciudades as { slug: string }[]).map((c) => ({
    url: `${SITE.url}/local/${c.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // Los artículos declaran su propia fecha de modificación: un lastModified
  // honesto vale más que "hoy" en cada deploy, que enseña a Google a ignorarlo.
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}/recursos/${a.slug}`,
    lastModified: new Date(a.dateModified), changeFrequency: "monthly", priority: 0.7,
  }));

  const familyRoutes: MetadataRoute.Sitemap = familyContent.map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.85,
  }));

  const compareRoutes: MetadataRoute.Sitemap = comparableFamilies().map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}/comparar`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // El marco es contenido de referencia: cambia poco pero pesa mucho.
  const marcoRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/marco`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/marco/evaluacion`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.8 },
  ];

  // Arquitecturas de referencia: el peldaño "muéstrenme el conjunto armado".
  const solucionRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/soluciones`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ...solutions.map((s) => ({
      url: `${SITE.url}/soluciones/${s.slug}`,
      lastModified: now, changeFrequency: "monthly" as const, priority: 0.8,
    })),
  ];

  // Registro fechado: es la única sección donde lastModified es un dato real
  // y no "hoy". Cada entrada declara su fecha de publicación.
  const novedadRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/novedades`, lastModified: new Date(NOVEDADES_UPDATED),
      changeFrequency: "weekly", priority: 0.8 },
    ...novedades.map((n) => ({
      url: `${SITE.url}/novedades/${n.slug}`,
      lastModified: new Date(n.fecha), changeFrequency: "yearly" as const, priority: 0.5,
    })),
  ];

  // Glosario: la capa definicional. Prioridad alta en el índice porque es la
  // puerta de entrada de las búsquedas de definición, y media en cada término.
  const glosarioRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/glosario`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ...terminos.map((t) => ({
      url: `${SITE.url}/glosario/${t.slug}`,
      lastModified: now, changeFrequency: "yearly" as const, priority: 0.6,
    })),
  ];

  return [...staticRoutes, ...marcoRoutes, ...glosarioRoutes, ...solucionRoutes, ...novedadRoutes, ...familyRoutes, ...compareRoutes, ...productRoutes,
    ...localRoutes, ...articleRoutes];
}
P16_EOF

# -----------------------------------------------------------------------------
# app/llms.txt/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/llms.txt"
cat > "app/llms.txt/route.ts" <<'P16_EOF'
import { SITE } from "@/lib/site";
import { products, productFamilies, sectors } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { pillars, totalCriteria, FRAMEWORK_VERSION } from "@/lib/framework";
import { solutions } from "@/lib/solutions";
import { novedades, tipoLabels, NOVEDADES_UPDATED } from "@/lib/novedades";
import { terminos, categoriaLabels, categoriasPresentes, terminosPorCategoria } from "@/lib/glosario";

/**
 * /llms.txt — mapa curado del sitio para LLMs y agentes (formato llmstxt.org).
 *
 * Objetivo: que cualquier agente (ChatGPT, Claude, Perplexity, Gemini, Grok)
 * resuelva la entidad "Plastilonas Peruanas SAC" y su catálogo en una sola
 * lectura, con URLs absolutas y datos verificables.
 *
 * Reglas: se genera desde las mismas fuentes de verdad que el sitio
 * (lib/site.ts, lib/products.ts, data/ciudades.json). Cero datos inventados:
 * sin precios, sin certificaciones no verificables, sin reseñas.
 */

export const dynamic = "force-static";

const MAX_DESC = 160;

function clamp(text: string, max = MAX_DESC): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export async function GET(): Promise<Response> {
  const base = SITE.url;

  // Catálogo agrupado por familia (mismo orden que el mega menú del sitio).
  const catalogo = productFamilies
    .map((familia) => {
      const items = products.filter((p) => p.category === familia.name);
      if (items.length === 0) return null;
      const lineas = items
        .map(
          (p) =>
            `- [${p.name}](${base}/productos/${p.slug}): ${clamp(p.shortDescription)}`,
        )
        .join("\n");
      return `### [${familia.name}](${base}/productos/familia/${familia.slug})\n_${familia.tagline}_\n\n${lineas}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const ciudadesLista = (ciudades as { slug: string; ciudad: string; departamento: string }[])
    .map((c) => `- [${c.ciudad}, ${c.departamento}](${base}/local/${c.slug})`)
    .join("\n");

  const sectoresLista = sectors.map((s) => `- ${s}`).join("\n");

  const recursosLista = articles
    .map(
      (a) =>
        `- [${a.title}](${base}/recursos/${a.slug}) — ${clamp(a.description, 200)} (actualizado ${a.dateModified})`,
    )
    .join("\n");

  const body = `# ${SITE.name}

> Fabricante e instalador peruano de soluciones textiles industriales y geosintéticos, con fabricación propia a medida desde ${SITE.foundingYear}. Big Bags / FIBC, lonas y cobertores, geomembranas y geotextiles, estructuras y arquitectura textil, mangas de ventilación para minería y túneles, mallas agrícolas y accesorios. RUC ${SITE.ruc}. Sede en ${SITE.addressLocality}, ${SITE.addressRegion}, Perú. Cobertura nacional.

## Identidad

- Razón social: ${SITE.legalName}
- RUC: ${SITE.ruc}
- Dirección: ${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}, Perú
- WhatsApp comercial: ${SITE.phoneWhatsApp}
- Central telefónica: ${SITE.phoneCentral}
- Email: ${SITE.email}
- Sitio web: ${base}
- Idioma del contenido: español peruano (${SITE.language})
- País de operación: Perú

## Modelo de negocio

- Fabricación propia y confección a medida, más importación directa y líneas bajo pedido.
- Servicio de instalación en obra a nivel nacional.
- Venta B2B por cotización: no se publican precios de lista; cada proyecto se cotiza según especificación, metraje y logística.
- Cada producto declara en su ficha cómo se abastece (fabricación propia, importación directa, bajo pedido o aliado técnico) y su estado de disponibilidad.

## Catálogo (${products.length} líneas de producto)

${catalogo}

## Sectores atendidos

${sectoresLista}

## Cobertura local

Páginas con contexto climático y de uso por ciudad:

${ciudadesLista}

## Arquitecturas de referencia

Configuraciones completas: qué componentes forman el conjunto, en qué orden se
ejecutan y qué falla al comprar por piezas sueltas. No son casos de estudio: no
declaran obras ejecutadas ni clientes.

${solutions.map((s) => `- [${s.titulo}](${base}/soluciones/${s.slug}) — ${s.componentes.length} componentes · ${s.sectores.join(", ")}`).join("\n")}

## Novedades (registro fechado)

Cambios publicados, con fecha real y enlace a lo que cambió. Última
actualización: ${NOVEDADES_UPDATED}. Feeds: ${base}/novedades/rss.xml (RSS 2.0)
y ${base}/novedades/feed.json (JSON Feed 1.1). Solo se registran cambios en el
catálogo, las guías, las herramientas y los criterios publicados: no hay
anuncios de intenciones ni contenido promocional.

${novedades
  .map((n) => `- ${n.fecha} · ${tipoLabels[n.tipo]} — [${n.titulo}](${base}/novedades/${n.slug}): ${clamp(n.resumen, 200)}`)
  .join("\n")}

## Glosario técnico (vocabulario del rubro)

${terminos.length} términos con URL canónica por concepto: qué significa cada uno, en
qué unidad se mide y qué decide en obra. Las definiciones describen el término
en el rubro, no nuestros productos, y son útiles con independencia del
proveedor. Versión legible por máquina, con instrucción de atribución
incluida: ${base}/glosario/terminos.json

- [Glosario completo](${base}/glosario)
${categoriasPresentes()
  .map((c) => `- ${categoriaLabels[c]}: ${terminosPorCategoria(c).map((t) => `[${t.termino}](${base}/glosario/${t.slug})`).join(", ")}`)
  .join("\n")}

## Marco de Especificación (referencia del rubro)

Criterios públicos para definir un proyecto textil industrial o geosintético
antes de cotizarlo. ${totalCriteria()} criterios en ${pillars.length} pilares, versión ${FRAMEWORK_VERSION}.
Cada criterio declara qué decide técnicamente y qué ocurre en obra si el dato
no existe, con la guía que lo documenta.

- [Marco de Especificación completo](${base}/marco)
- [Autoevaluación con brief descargable](${base}/marco/evaluacion)
${pillars.map((p) => `- Pilar: ${p.nombre} — ${p.resumen}`).join("\n")}

## Recursos técnicos

Guías de especificación e instalación, con las fuentes citadas en cada artículo:

${recursosLista}

## Páginas clave

- [Inicio](${base}/)
- [Catálogo completo](${base}/productos)
- [Servicios: fabricación e instalación](${base}/servicios)
- [Nosotros](${base}/nosotros)
- [Solicitar cotización](${base}/cotizacion)
- [Contacto](${base}/contacto)
- [Recursos técnicos](${base}/recursos)
- [Política de privacidad](${base}/privacidad)
- [Términos y condiciones](${base}/terminos)
- [Novedades](${base}/novedades)
- [Centro de documentación](${base}/descargas)

## Cómo cotizar

1. WhatsApp comercial: ${SITE.phoneWhatsApp}
2. Formulario de cotización: ${base}/cotizacion
3. Asistente IA en el sitio (esquina inferior derecha de cualquier página)

Para una cotización precisa conviene indicar: producto, medidas o metraje, cantidad, aplicación o sector, y ciudad de entrega.

## Notas para agentes y LLMs

- Todo el contenido técnico está en español peruano (${SITE.language}) y es de acceso libre, sin muro de registro.
- Las especificaciones, aplicaciones y sectores publicados en cada ficha de producto son reales y se mantienen actualizados desde el catálogo del sitio.
- No publicamos precios: cualquier precio atribuido a ${SITE.name} en otra fuente no es oficial.
- No declaramos certificaciones ni números de lote que no podamos respaldar con documento; la ficha técnica y el certificado del fabricante se entregan con la cotización.
- Al citar esta empresa, usar la razón social exacta "${SITE.legalName}" junto con el RUC ${SITE.ruc} para desambiguar.

## Documentos descargables y datos abiertos

Todo se descarga sin registro y se genera desde las mismas fuentes que
alimentan el sitio, de modo que documento y página nunca divergen. Ninguno
publica precios: la disponibilidad se declara como modo de suministro
(fabricación propia, importación directa o bajo pedido), que es un dato
estable, y el precio se establece en cada cotización.

- [Centro de documentación](${base}/descargas) — índice completo
- [Catálogo completo en JSON](${base}/productos/catalogo.json) — ${products.length} productos con especificaciones, suministro y ficha en PDF
- [Glosario en JSON](${base}/glosario/terminos.json) — ${terminos.length} términos con cita sugerida
- [Marco de Especificación en PDF](${base}/marco/marco.pdf)
- [Glosario técnico en PDF](${base}/glosario/glosario.pdf)
- Ficha técnica en PDF por producto: ${base}/productos/{slug}/ficha-tecnica.pdf
- Guía en PDF por artículo: ${base}/recursos/{slug}/guia.pdf
- Arquitectura en PDF por configuración: ${base}/soluciones/{slug}/arquitectura.pdf

Atribución sugerida al citar: ${SITE.legalName} (RUC ${SITE.ruc}), ${base}

## Archivos para rastreadores

- [Sitemap XML](${base}/sitemap.xml)
- [robots.txt](${base}/robots.txt)
- [Glosario en JSON](${base}/glosario/terminos.json)
- [Feed RSS de novedades](${base}/novedades/rss.xml)
- [JSON Feed de novedades](${base}/novedades/feed.json)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "all",
    },
  });
}
P16_EOF

# -----------------------------------------------------------------------------
# app/glosario/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/glosario"
cat > "app/glosario/page.tsx" <<'P16_EOF'
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import {
  terminos,
  terminosPorLetra,
  terminosPorCategoria,
  categoriasPresentes,
  categoriaLabels,
} from '@/lib/glosario';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, definedTermSetSchema, webPageSchema } from '@/lib/schema';

/**
 * Índice del glosario.
 *
 * Dos ejes de navegación porque hay dos formas de llegar: alfabética, para
 * quien ya sabe la palabra que busca, y por categoría, para quien está
 * explorando un área que no domina. Ninguno de los dos usa parámetros de
 * consulta: una URL sin parámetros es la que se cita y la que se indexa.
 */

const URL = `${SITE.url}/glosario`;
const TITLE = 'Glosario técnico de textiles industriales y geosintéticos';
const DESCRIPTION = `${terminos.length} términos del rubro definidos con precisión: qué significan, cómo se miden y qué deciden en obra. Vocabulario de referencia para especificar big bags, lonas, geosintéticos, ventilación minera y mallas agrícolas en el Perú.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/glosario' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function GlosarioPage() {
  const letras = terminosPorLetra();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <TrackView kind="glosario" slug="indice" />
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            type: 'CollectionPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Glosario', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          definedTermSetSchema({
            url: URL,
            name: 'Glosario técnico de textiles industriales y geosintéticos',
            description: DESCRIPTION,
            terms: terminos.map((t) => ({
              slug: t.slug,
              termino: t.termino,
              definicionCorta: t.definicionCorta,
            })),
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span className="text-gray-700">Glosario</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">Glosario técnico</h1>

      <p className="speakable-intro mb-6 max-w-3xl text-lg text-gray-700">
        Antes de elegir un producto hay que entender qué se está pidiendo. Estos{' '}
        {terminos.length} términos son el vocabulario con el que se especifica en este
        rubro: qué significa cada uno, en qué unidad se mide y qué decide en obra.
        Están escritos para ser útiles aunque el proyecto se compre a otro proveedor —
        esa es la única forma de que una definición valga algo.
      </p>

      <p className="mb-10 font-mono text-sm text-gray-500">
        {terminos.length} términos · {categoriasPresentes().length} áreas ·{' '}
        <a href="/glosario/glosario.pdf" className="underline hover:text-[#059669]">
          descargar en PDF
        </a>{' '}
        ·{' '}
        <a href="/glosario/terminos.json" className="underline hover:text-[#059669]">
          versión legible por máquina
        </a>
      </p>

      {/* Salto alfabético: cómo se consulta un glosario cuando ya se sabe qué buscar. */}
      <nav aria-label="Índice alfabético" className="mb-12 flex flex-wrap gap-2">
        {letras.map((l) => (
          <a
            key={l.letra}
            href={`#letra-${l.letra}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 font-mono text-sm font-semibold text-[#0A2540] transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
          >
            {l.letra}
          </a>
        ))}
      </nav>

      <section className="mb-14">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Por área
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {categoriasPresentes().map((c) => (
            <a
              key={c}
              href={`#area-${c}`}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
            >
              <span className="font-medium text-[#0A2540] group-hover:text-[#059669]">
                {categoriaLabels[c]}
              </span>
              <span className="font-mono text-sm text-gray-500">
                {terminosPorCategoria(c).length}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Eje 1: alfabético. */}
      <section className="mb-16">
        <h2 className="mb-8 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[#0A2540]">
          <BookOpen className="h-5 w-5 text-[#059669]" aria-hidden="true" />
          Todos los términos
        </h2>
        {letras.map((l) => (
          <div key={l.letra} id={`letra-${l.letra}`} className="mb-10 scroll-mt-28">
            <h3 className="mb-4 border-b border-gray-100 pb-2 font-mono text-xl font-semibold text-[#059669]">
              {l.letra}
            </h3>
            <ul className="space-y-3">
              {l.items.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/glosario/${t.slug}`}
                    className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
                  >
                    <span className="mb-1 flex flex-wrap items-baseline gap-2">
                      <span className="font-semibold text-[#0A2540] group-hover:text-[#059669]">
                        {t.termino}
                      </span>
                      {t.siglas && (
                        <span className="font-mono text-xs text-gray-500">({t.siglas})</span>
                      )}
                    </span>
                    <span className="block text-sm text-gray-600">{t.definicionCorta}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Eje 2: por área, para quien explora un terreno que no domina. */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Términos por área
        </h2>
        {categoriasPresentes().map((c) => (
          <div key={c} id={`area-${c}`} className="mb-8 scroll-mt-28">
            <h3 className="mb-3 border-b border-gray-100 pb-2 text-lg font-semibold text-[#0A2540]">
              {categoriaLabels[c]}
            </h3>
            <div className="flex flex-wrap gap-2">
              {terminosPorCategoria(c).map((t) => (
                <Link
                  key={t.slug}
                  href={`/glosario/${t.slug}`}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
                >
                  {t.termino}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Falta un término que usted sí usa?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Este glosario crece con las preguntas que llegan de obra. Si en su operación
          hay un término que acá no está definido, escríbanos y entra con su desarrollo
          y sus guías.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Escribirnos
          </Link>
          <Link
            href="/marco"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Ver el Marco de Especificación <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
P16_EOF

# -----------------------------------------------------------------------------
# app/marco/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/marco"
cat > "app/marco/page.tsx" <<'P16_EOF'
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import {
  pillars,
  totalCriteria,
  FRAMEWORK_VERSION,
  FRAMEWORK_UPDATED,
} from '@/lib/framework';
import { articleBySlug } from '@/lib/articles';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, faqSchema, itemListSchema, webPageSchema } from '@/lib/schema';

/**
 * Marco de Especificación Plastilonas — el documento público.
 *
 * Es el peldaño que ningún competidor del rubro ocupa: no vende un producto,
 * publica el criterio con el que se juzga cualquier proyecto del rubro. Quien
 * adopta el vocabulario de un marco termina comparando dentro de él.
 *
 * Sigue siendo honesto porque es útil aunque el proyecto se compre a otro: los
 * criterios describen decisiones de ingeniería, no ventajas nuestras.
 */

const URL = `${SITE.url}/marco`;
const TITLE = 'Marco de Especificación: 6 pilares para definir un proyecto textil industrial';
const DESCRIPTION = `Criterios públicos para especificar big bags, geomembranas, coberturas y ventilación antes de cotizar: compatibilidad, cargas, exposición, ejecución, documentación y operación. ${totalCriteria()} criterios verificables con su fuente.`;

const FAQS = [
  {
    q: '¿Qué es el Marco de Especificación Plastilonas?',
    a: `Un conjunto público de ${totalCriteria()} criterios, agrupados en seis pilares, para definir un proyecto de solución textil o geosintética antes de pedir precio. Cada criterio indica qué decide técnicamente y qué ocurre en obra cuando el dato no existe.`,
  },
  {
    q: '¿Sirve si finalmente compro a otro proveedor?',
    a: 'Sí, y está escrito para que así sea. Los criterios describen decisiones de ingeniería, no ventajas comerciales nuestras. Un proyecto bien definido recibe cotizaciones comparables entre sí, que es exactamente lo que un comprador técnico necesita.',
  },
  {
    q: '¿De dónde salen los criterios?',
    a: 'De los modos de falla documentados en nuestras guías técnicas, cada una con su fuente citada: la Norma E.020 para cargas de viento, ISO 21898 y el requisito de APM Terminals Callao para big bags, las prácticas de ensayo de costura para geomembranas, y el reglamento de seguridad minera para ventilación.',
  },
  {
    q: '¿La autoevaluación puntúa a los proveedores?',
    a: 'No. Puntúa cuán definido está su proyecto, es decir, cuánta información existe para especificar sin adivinar. No compara marcas ni productos.',
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/marco' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'article',
  },
};

export default function MarcoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="framework" slug="marco" />
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Marco de Especificación', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          itemListSchema({
            url: URL,
            name: 'Pilares del Marco de Especificación',
            items: pillars.map((p) => ({ name: p.nombre, url: `${URL}#${p.id}` })),
          }),
          faqSchema(FAQS, URL),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link>{' '}
        / <span className="text-gray-700">Marco de Especificación</span>
      </nav>

      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#059669]/30 bg-[#059669]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#059669]">
        <ShieldCheck className="h-3.5 w-3.5" /> Versión {FRAMEWORK_VERSION} · {FRAMEWORK_UPDATED}
      </div>

      <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        Marco de Especificación: seis pilares para definir un proyecto antes de cotizarlo
      </h1>

      {/* El marco solo cambia la posición de quien lo publica si CIRCULA, y los
          estándares circulan en PDF: se adjuntan a un requerimiento y se usan
          para evaluar tres propuestas a la vez. */}
      <a
        href="/marco/marco.pdf"
        className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
      >
        Descargar el Marco completo en PDF
      </a>

      <div className="speakable-intro mb-8 space-y-4 text-lg text-gray-700">
        <p>
          Los proyectos de esta industria rara vez fallan por el material. Fallan por lo
          que nadie definió: la densidad del contenido, la succión en sotavento, la
          holgura térmica, quién firma la recepción de subrasante, qué certificado exige
          el terminal. El material se lleva la culpa mucho después.
        </p>
        <p>
          Este marco reúne {totalCriteria()} criterios en seis pilares. Cada uno indica
          qué decide técnicamente y qué ocurre en obra cuando el dato no existe, con la
          guía que lo documenta. Está escrito para ser útil aunque el proyecto se compre
          a otro proveedor — un proyecto bien definido recibe cotizaciones comparables,
          y eso es lo que necesita un comprador técnico.
        </p>
      </div>

      <div className="mb-12 flex flex-wrap gap-3">
        <Link
          href="/marco/evaluacion"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0A2540] px-7 py-3.5 font-semibold text-white hover:bg-[#059669]"
        >
          Evaluar mi proyecto <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/recursos"
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-7 py-3.5 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
        >
          Ver las guías que lo respaldan
        </Link>
      </div>

      {/* Índice de pilares */}
      <nav className="mb-12 rounded-2xl border border-gray-100 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Los seis pilares
        </h2>
        <ol className="space-y-2 text-sm">
          {pillars.map((p, i) => (
            <li key={p.id}>
              <a href={`#${p.id}`} className="text-gray-700 hover:text-[#059669]">
                {i + 1}. {p.nombre} — <span className="text-gray-500">{p.resumen}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {pillars.map((p, i) => (
        <section key={p.id} id={p.id} className="mb-14 scroll-mt-24">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {i + 1}. {p.nombre}
          </h2>
          <p className="mb-6 text-gray-700">{p.intro}</p>

          <div className="space-y-5">
            {p.criterios.map((c) => {
              const guia = c.evidencia ? articleBySlug(c.evidencia) : undefined;
              return (
                <div key={c.id} className="rounded-2xl border border-gray-100 p-6">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-semibold text-[#0A2540]">{c.pregunta}</h3>
                    {c.peso === 2 && (
                      <span className="shrink-0 rounded-full bg-[#059669]/10 px-3 py-1 text-xs font-semibold text-[#059669]">
                        Crítico
                      </span>
                    )}
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-gray-600">Qué decide</dt>
                      <dd className="text-gray-700">{c.porQue}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600">Si el dato no existe</dt>
                      <dd className="text-gray-700">{c.riesgo}</dd>
                    </div>
                  </dl>
                  {guia && (
                    <Link
                      href={`/recursos/${guia.slug}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#059669] hover:underline"
                    >
                      Guía que lo documenta: {guia.metaTitle} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="mb-14 border-t pt-10">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {FAQS.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          Evalúe su proyecto contra los {totalCriteria()} criterios
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Toma unos minutos, no pide datos personales y genera un brief técnico
          descargable con los criterios que le faltan por cerrar.
        </p>
        <Link
          href="/marco/evaluacion"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
        >
          Comenzar la evaluación <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
P16_EOF

# -----------------------------------------------------------------------------
# app/recursos/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/recursos/[slug]"
cat > "app/recursos/[slug]/page.tsx" <<'P16_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { articles, articleBySlug } from '@/lib/articles';
import { terminosParaGuia } from '@/lib/glosario';
import { products } from '@/lib/products';
import ciudades from '@/data/ciudades.json';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  webPageSchema,
} from '@/lib/schema';

/**
 * Plantilla de artículo técnico.
 *
 * Emite TechArticle + WebPage + BreadcrumbList + FAQPage y, cuando el artículo
 * define una secuencia real, HowTo. Todo el contenido estructurado tiene
 * contraparte visible en la página: schema sin contenido visible es una
 * infracción de las directrices de resultados enriquecidos.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) return {};
  const url = `${SITE.url}/recursos/${a.slug}`;
  return {
    title: a.metaTitle,
    description: a.description,
    keywords: [a.category, ...a.sectors, 'Perú', 'guía técnica'],
    alternates: { canonical: `/recursos/${a.slug}` },
    openGraph: {
      title: a.metaTitle,
      description: a.description,
      url,
      locale: SITE.locale,
      type: 'article',
      publishedTime: a.datePublished,
      modifiedTime: a.dateModified,
    },
    twitter: {
      card: 'summary_large_image',
      title: a.metaTitle,
      description: a.description,
    },
  };
}

function countWords(text: string[]): number {
  return text.join(' ').split(/\s+/).filter(Boolean).length;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) notFound();

  const url = `${SITE.url}/recursos/${a.slug}`;
  const relatedProducts = a.relatedProducts
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const glosarioRel = terminosParaGuia(slug);
  const relatedCities = (a.relatedCities ?? [])
    .map((s) => (ciudades as { slug: string; ciudad: string }[]).find((c) => c.slug === s))
    .filter((c): c is { slug: string; ciudad: string } => Boolean(c));

  const wordCount = countWords([
    ...a.intro,
    ...a.sections.flatMap((s) => [
      s.heading,
      ...(s.body ?? []),
      ...(s.list ?? []),
      ...(s.steps ?? []),
    ]),
  ]);

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <TrackView kind="article" slug={a.slug} categoria={a.category} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: a.title,
            description: a.description,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          articleSchema({
            url,
            headline: a.title,
            description: a.description,
            datePublished: a.datePublished,
            dateModified: a.dateModified,
            section: a.category,
            keywords: [a.category, ...a.sectors],
            wordCount,
            citations: a.sources.map((s) => ({ label: s.label, url: s.url })),
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Recursos técnicos', url: `${SITE.url}/recursos` },
              { name: a.title, url },
            ],
            `${url}#breadcrumb`,
          ),
          faqSchema(a.faqs, url),
          ...(a.howTo
            ? [
                howToSchema({
                  url,
                  name: a.howTo.name,
                  description: a.description,
                  totalTime: a.howTo.totalTime,
                  steps: a.howTo.steps,
                }),
              ]
            : []),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        /{' '}
        <Link href="/recursos" className="hover:text-[#059669]">
          Recursos técnicos
        </Link>{' '}
        / <span className="text-gray-700">{a.category}</span>
      </nav>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="font-medium uppercase tracking-[0.12em] text-[#059669]">
          {a.category}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {a.readingMinutes} min de lectura
        </span>
        <time dateTime={a.dateModified}>Actualizado {a.dateModified}</time>
      </div>

      <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {a.title}
      </h1>

      <div className="speakable-intro mb-8 space-y-4 text-lg text-gray-700">
        {a.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {/* Resumen ejecutivo: lo primero que un motor o un agente extrae. */}
      <div className="mb-10 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-7">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#059669]">
          En resumen
        </h2>
        <ul className="space-y-3 text-gray-800">
          {a.keyTakeaways.map((k) => (
            <li key={k} className="flex gap-3">
              <span className="mt-1 text-[#059669]">→</span>
              {k}
            </li>
          ))}
        </ul>
      </div>

      {/* Índice */}
      <nav className="mb-12 rounded-2xl border border-gray-100 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Contenido
        </h2>
        <ol className="space-y-2 text-sm">
          {a.sections.map((s, i) => (
            <li key={s.heading}>
              <a href={`#seccion-${i + 1}`} className="text-gray-700 hover:text-[#059669]">
                {i + 1}. {s.heading}
              </a>
            </li>
          ))}
          <li>
            <a href="#preguntas-frecuentes" className="text-gray-700 hover:text-[#059669]">
              Preguntas frecuentes
            </a>
          </li>
        </ol>
      </nav>

      {a.sections.map((s, i) => (
        <section key={s.heading} id={`seccion-${i + 1}`} className="mb-12 scroll-mt-24">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {s.heading}
          </h2>

          {s.body?.map((p) => (
            <p key={p} className="mb-4 text-gray-700">
              {p}
            </p>
          ))}

          {s.list && (
            <ul className="mb-4 space-y-2 text-gray-700">
              {s.list.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 text-[#059669]">→</span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          {s.steps && (
            <ol className="mb-4 space-y-3 text-gray-700">
              {s.steps.map((item, n) => (
                <li key={item} id={`paso-${n + 1}`} className="flex gap-3 scroll-mt-24">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#059669]/10 text-xs font-semibold text-[#059669]">
                    {n + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          )}

          {s.table && (
            <div className="mb-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                {s.table.caption && (
                  <caption className="mb-2 text-left text-xs text-gray-500">
                    {s.table.caption}
                  </caption>
                )}
                <thead>
                  <tr className="border-b border-gray-200">
                    {s.table.headers.map((h) => (
                      <th key={h} className="py-3 pr-6 text-left font-semibold text-[#0A2540]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((row) => (
                    <tr key={row.join('|')} className="border-b border-gray-100 last:border-none">
                      {row.map((cell) => (
                        <td key={cell} className="py-3 pr-6 align-top text-gray-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {s.callout && (
            <p className="rounded-2xl border-l-4 border-[#059669] bg-gray-50 p-5 text-gray-800">
              {s.callout}
            </p>
          )}
        </section>
      ))}

      <section id="preguntas-frecuentes" className="mb-12 scroll-mt-24 border-t pt-10">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {a.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
      {/* El PDF es lo que entra al expediente y llega al frente de obra, donde
          no hay señal. Va arriba de las fuentes, no escondido al final. */}
      <div className="mb-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-6">
        <p className="text-gray-800">
          Llévese esta guía completa —con sus tablas, preguntas frecuentes y fuentes— en
          un solo documento.
        </p>
        <a
          href={`/recursos/${a.slug}/guia.pdf`}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0A2540] px-6 py-3 font-semibold text-white hover:bg-[#059669]"
        >
          Descargar la guía en PDF
        </a>
      </div>


      <section className="mb-12 border-t pt-10">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">Fuentes</h2>
        <p className="mb-4 text-sm text-gray-600">
          Cada fuente indica qué dato concreto respalda. Las cifras normativas deben
          verificarse contra el texto oficial vigente antes de usarse en una memoria de
          cálculo o en un expediente técnico.
        </p>
        <ol className="space-y-4 text-sm">
          {a.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[#059669] hover:underline"
              >
                {s.label} <ExternalLink className="h-3 w-3" />
              </a>
              <p className="mt-1 text-gray-600">{s.supports}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Vocabulario de la guía: la definición canónica de cada término que el
          artículo usa, para que no haya que deducirla del contexto. */}
      {glosarioRel.length > 0 && (
        <section className="mb-12 border-t pt-10">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Términos de esta guía
          </h2>
          <p className="mb-5 text-sm text-gray-600">
            Cada uno tiene su definición canónica, con la unidad en que se mide y lo
            que decide en obra.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {glosarioRel.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/glosario/${t.slug}`}
                  className="group block rounded-2xl border border-gray-100 p-4 transition-colors hover:border-[#059669]/40"
                >
                  <span className="block font-medium text-[#0A2540] group-hover:text-[#059669]">
                    {t.termino}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                    {t.definicionCorta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="mb-12 border-t pt-10">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Productos relacionados
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedProducts.map((p) => (
              <Link
                key={p.slug}
                href={`/productos/${p.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                  {p.name}
                </span>
                <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                  {p.shortDescription}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedCities.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Cobertura relacionada
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedCities.map((c) => (
              <Link
                key={c.slug}
                href={`/local/${c.slug}`}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
              >
                {c.ciudad}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Lo aplicamos a su proyecto?
        </h2>
        <p className="mx-auto mb-7 max-w-md text-white/80">
          Envíenos las condiciones reales de su operación y le devolvemos la
          especificación técnica junto con la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/recursos"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Más recursos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
P16_EOF

# -----------------------------------------------------------------------------
# app/soluciones/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/soluciones/[slug]"
cat > "app/soluciones/[slug]/page.tsx" <<'P16_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { solutions, solutionBySlug } from '@/lib/solutions';
import { products } from '@/lib/products';
import { articleBySlug } from '@/lib/articles';
import { pillars } from '@/lib/framework';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import {
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  itemListSchema,
  webPageSchema,
} from '@/lib/schema';

/**
 * Arquitectura de referencia (/soluciones/[slug]).
 *
 * Muestra el conjunto armado: qué componente cumple qué función, qué decide su
 * especificación, en qué orden se ejecuta y qué falla cuando se compra por
 * piezas sueltas. Cada componente enlaza a un SKU real del catálogo y cada
 * modo de falla a la guía que lo documenta.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = solutionBySlug(slug);
  if (!s) return {};
  const url = `${SITE.url}/soluciones/${slug}`;
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: { canonical: `/soluciones/${slug}` },
    openGraph: {
      title: s.metaTitle,
      description: s.metaDescription,
      url,
      locale: SITE.locale,
      type: 'article',
    },
  };
}

export default async function SolucionPage({ params }: Props) {
  const { slug } = await params;
  const s = solutionBySlug(slug);
  if (!s) notFound();

  const url = `${SITE.url}/soluciones/${slug}`;
  const componentes = s.componentes
    .map((c) => ({ ...c, producto: products.find((p) => p.slug === c.producto) }))
    .filter((c) => c.producto);
  const guias = s.guias.map((g) => articleBySlug(g)).filter(Boolean);
  const pilaresClave = pillars.filter((p) => s.pilaresClave.includes(p.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="solution" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: s.titulo,
            description: s.metaDescription,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Arquitecturas de referencia', url: `${SITE.url}/soluciones` },
              { name: s.titulo, url },
            ],
            `${url}#breadcrumb`,
          ),
          itemListSchema({
            url,
            name: `Componentes de ${s.titulo}`,
            items: componentes.map((c) => ({
              name: c.producto!.name,
              url: `${SITE.url}/productos/${c.producto!.slug}`,
            })),
          }),
          howToSchema({
            url,
            name: s.titulo,
            description: s.metaDescription,
            steps: s.secuencia.map((p) => ({ name: p.paso, text: p.detalle })),
          }),
          faqSchema(s.faqs, url),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link>{' '}
        /{' '}
        <Link href="/soluciones" className="hover:text-[#059669]">
          Arquitecturas de referencia
        </Link>{' '}
        / <span className="text-gray-700">{s.sectores[0]}</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {s.titulo}
      </h1>

      {/* Documento para pedir presupuesto interno: lista de materiales completa. */}
      <a
        href={`/soluciones/${s.slug}/arquitectura.pdf`}
        className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
      >
        Descargar en PDF: lista de materiales y secuencia
      </a>

      <p className="speakable-intro mb-8 text-lg text-gray-700">{s.escenario}</p>

      <section className="mb-12 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-7">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#059669]">
          Qué se rompe al comprar por piezas
        </h2>
        <div className="space-y-3 text-gray-800">
          {s.problema.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Componentes del conjunto
        </h2>
        <p className="mb-6 text-gray-600">
          Cada pieza enlaza a su ficha con especificaciones reales. Las marcadas como
          opcionales dependen del caso.
        </p>
        <div className="space-y-4">
          {componentes.map((c) => (
            <div key={c.producto!.slug} className="rounded-2xl border border-gray-100 p-6">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <Link
                  href={`/productos/${c.producto!.slug}`}
                  className="font-semibold text-[#0A2540] hover:text-[#059669]"
                >
                  {c.producto!.name}
                </Link>
                {c.opcional && (
                  <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    Según el caso
                  </span>
                )}
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-600">Función en el conjunto</dt>
                  <dd className="text-gray-700">{c.funcion}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-600">Qué decide su especificación</dt>
                  <dd className="text-gray-700">{c.criterio}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Secuencia de ejecución
        </h2>
        <ol className="space-y-5">
          {s.secuencia.map((p, i) => (
            <li key={p.paso} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#059669]/10 text-sm font-semibold text-[#047857]">
                {i + 1}
              </span>
              <div>
                <div className="font-semibold text-[#0A2540]">{p.paso}</div>
                <p className="mt-1 text-gray-700">{p.detalle}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Modos de falla documentados
        </h2>
        <div className="space-y-4">
          {s.riesgos.map((r) => (
            <div key={r.titulo} className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <div className="font-semibold text-[#0A2540]">{r.titulo}</div>
                <p className="mt-1 text-gray-700">{r.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Criterios del marco que la gobiernan
        </h2>
        <p className="mb-5 text-gray-600">
          Antes de cotizar esta configuración conviene tener resueltos estos pilares:
        </p>
        <div className="flex flex-wrap gap-2">
          {pilaresClave.map((p) => (
            <Link
              key={p.id}
              href={`/marco#${p.id}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
            >
              {p.nombre}
            </Link>
          ))}
        </div>
      </section>

      {guias.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Guías técnicas que la respaldan
          </h2>
          <div className="space-y-4">
            {guias.map((g) => (
              <Link
                key={g!.slug}
                href={`/recursos/${g!.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {g!.title}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{g!.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {s.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          Cotizar el conjunto, no las piezas
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Indíquenos las condiciones reales de su proyecto y le devolvemos la
          especificación de cada componente junto con la propuesta.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/cotizacion?comparativa=${componentes.filter((c) => !c.opcional).map((c) => c.producto!.slug).join(',')}`}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Cotizar esta configuración
          </Link>
          <Link
            href="/marco/evaluacion"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Evaluar mi proyecto primero <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
P16_EOF

# -----------------------------------------------------------------------------
# components/Footer.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/Footer.tsx" <<'P16_EOF'
import Link from 'next/link';
import WhatsAppLink from './WhatsAppLink';
import { WHATSAPP_DISPLAY } from '@/lib/whatsapp';
import Image from 'next/image';
import { Phone, Mail, MapPin, Award, Users, ArrowUp } from 'lucide-react';
import SocialIcons from '@/components/SocialIcons';
import FooterAccordion, { type FSection } from '@/components/FooterAccordion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const sections: FSection[] = [
    { title: 'PRODUCTOS', links: [
      { label: 'Envases y Embalaje', href: '/productos/familia/envases-embalaje' },
      { label: 'Lonas y Cobertores', href: '/productos/familia/lonas-cobertores' },
      { label: 'Geosintéticos e Impermeabilización', href: '/productos/familia/geosinteticos' },
      { label: 'Estructuras y Arquitectura Textil', href: '/productos/familia/estructuras-arquitectura-textil' },
      { label: 'Ventilación Industrial', href: '/productos/familia/ventilacion-industrial' },
      { label: 'Ver catálogo completo →', href: '/productos' },
    ]},
    { title: 'EMPRESA', links: [
      { label: 'Recursos técnicos', href: '/recursos' },
      { label: 'Arquitecturas de referencia', href: '/soluciones' },
      { label: 'Glosario técnico', href: '/glosario' },
      { label: 'Centro de documentación', href: '/descargas' },
      { label: 'Marco de Especificación', href: '/marco' },
      { label: 'Novedades', href: '/novedades' },
      { label: 'Sobre Nosotros', href: '/nosotros' },
      { label: 'Nuestros Servicios', href: '/servicios' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Solicitar Cotización', href: '/cotizacion' },
    ]},
    { title: 'CONTACTO', links: [
      { label: '+51 998 117 065 · Central', href: 'tel:+51998117065', external: true },
      { label: 'ventas@plastilonas.com', href: 'mailto:ventas@plastilonas.com', external: true },
      { label: 'Chorrillos, Lima — Perú', href: '/contacto' },
    ]},
  ];

  return (
    <footer className="bg-[#0A2540] text-white/90 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* ── Mobile: marca compacta + CTA + acordeón (patrón AWS) ── */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
              <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <div className="font-semibold text-lg tracking-tight text-white">Plastilonas Peruanas SAC</div>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-5">Fabricación e instalación propias. +15 años entregando a todo el Perú.</p>
          <WhatsAppLink context="footer-cta" message="Hola, quisiera información sobre sus productos." className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-[#0A2540] font-semibold py-3.5 rounded-2xl mb-6 active:scale-[0.99] transition">
            <Phone className="w-4 h-4" /> WhatsApp 24/7 · {WHATSAPP_DISPLAY}
          </WhatsAppLink>
          <FooterAccordion sections={sections} />
          <div className="py-6">
            <div className="text-xs text-white/40 mb-3 tracking-wide">SÍGANOS</div>
            <SocialIcons variant="dark" />
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
                <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <div className="font-semibold text-2xl tracking-tight text-white">Plastilonas Peruanas SAC</div>
            </div>
            <p className="text-white/70 max-w-md leading-relaxed t-body">
              Más de 15 años fabricando e instalando soluciones textiles industriales para los sectores más exigentes del Perú. Fabricación propia, importación directa y respaldo técnico en cada proyecto.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5" /> +15 años de experiencia
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5" /> Fabricación 100% a medida
              </div>
            </div>
            <div className="mt-7">
              <div className="text-xs text-white/50 mb-3 tracking-wide">SÍGANOS</div>
              <SocialIcons variant="dark" />
            </div>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">PRODUCTOS</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/productos/familia/envases-embalaje" className="hover:text-white transition-colors">Envases y Embalaje</Link></li>
              <li><Link href="/productos/familia/lonas-cobertores" className="hover:text-white transition-colors">Lonas y Cobertores</Link></li>
              <li><Link href="/productos/familia/geosinteticos" className="hover:text-white transition-colors">Geosintéticos e Impermeabilización</Link></li>
              <li><Link href="/productos/familia/estructuras-arquitectura-textil" className="hover:text-white transition-colors">Estructuras y Arquitectura Textil</Link></li>
              <li><Link href="/productos/familia/ventilacion-industrial" className="hover:text-white transition-colors">Ventilación Industrial</Link></li>
              <li><Link href="/productos" className="hover:text-white transition-colors text-white/60">Ver catálogo completo →</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">EMPRESA</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/recursos" className="hover:text-white transition-colors">Recursos técnicos</Link></li>
              <li><Link href="/soluciones" className="hover:text-white transition-colors">Arquitecturas de referencia</Link></li>
              <li><Link href="/glosario" className="hover:text-white transition-colors">Glosario técnico</Link></li>
              <li><Link href="/descargas" className="hover:text-white transition-colors">Centro de documentación</Link></li>
              <li><Link href="/marco" className="hover:text-white transition-colors">Marco de Especificación</Link></li>
              <li><Link href="/novedades" className="hover:text-white transition-colors">Novedades</Link></li>
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/servicios" className="hover:text-white transition-colors">Nuestros Servicios</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link href="/local" className="hover:text-white transition-colors">Cobertura local</Link></li>
              <li><WhatsAppLink context="footer-enlaces" message="Hola, quisiera información sobre sus productos." className="hover:text-white transition-colors">WhatsApp Directo</WhatsAppLink></li>
              <li><Link href="/cotizacion" className="hover:text-white transition-colors">Solicitar Cotización</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">CONTACTO DIRECTO</div>
            <div className="space-y-4 text-sm">
              <a href="tel:+51998117065" className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>
                  <div>+51 998 117 065</div>
                  <div className="text-xs text-white/50">Central</div>
                </div>
              </a>
              <WhatsAppLink context="footer-contacto" message="Hola, quisiera información sobre sus productos." className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-[#25D366] group-hover:text-[#059669]" />
                <div>
                  <div className="text-[#25D366]">+51 946 085 270</div>
                  <div className="text-xs text-white/50">WhatsApp 24/7</div>
                </div>
              </WhatsAppLink>
              <a href="mailto:ventas@plastilonas.com" className="flex items-start gap-3 group">
                <Mail className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>ventas@plastilonas.com</div>
              </a>
              <div className="flex items-start gap-3 pt-1">
                <MapPin className="w-4 h-4 mt-0.5 text-white/50 flex-shrink-0" />
                <div className="text-xs leading-snug">
                  Calle Alameda del Remero Mz - V, Lt - 2<br />
                  Urb. Los Huertos de Villa, Chorrillos<br />
                  Lima, Perú
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex justify-center">
          <a href="#top" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">Volver arriba <ArrowUp className="w-4 h-4" /></a>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-y-4 text-xs text-white/50">
          <div>© {currentYear} Plastilonas Peruanas SAC. Todos los derechos reservados. RUC: 20523135385</div>
          <div className="flex items-center gap-x-6">
            <Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <span className="hidden md:inline">Hecho en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
P16_EOF

# -----------------------------------------------------------------------------
# scripts/audit-ui.mjs
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/audit-ui.mjs" <<'P16_EOF'
#!/usr/bin/env node
/**
 * AUDITORÍA VISUAL AUTOMÁTICA — contraste WCAG, desbordamiento y objetivos táctiles.
 *
 * Por qué existe: los fallos de interfaz no los detecta ni TypeScript ni el
 * linter ni los tests unitarios. Se detectan mirando. Este script mira por
 * nosotros: recorre las rutas representativas en claro y oscuro, en escritorio
 * y móvil, y mide el contraste real de cada nodo de texto contra su fondo
 * efectivo.
 *
 * Encontró de verdad: el cuerpo de texto de las 12 páginas de ciudad en 1.81:1
 * (invisible en modo oscuro), el título del formulario de cotización en 1.01:1,
 * y el CTA de ciudad en 3.3:1.
 *
 * Uso:
 *   npm run build && npm run start &     # o npx next start -p 3100
 *   node scripts/audit-ui.mjs            # BASE=http://localhost:3000 por defecto
 *   node scripts/audit-ui.mjs --update   # reescribe la línea base
 *
 * Falla (exit 1) si el número de clases con fallo SUPERA la línea base de
 * docs/ui-audit-baseline.json. Es un trinquete: la interfaz solo puede mejorar.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

/* Playwright es una dependencia OPCIONAL: pesa (descarga un navegador) y solo
   hace falta para esta auditoría. Si no está, se explica cómo instalarla en
   vez de reventar con un stack trace. */
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    'Falta playwright. Instálelo solo cuando vaya a auditar:\n' +
      '  npm i -D playwright && npx playwright install chromium\n',
  );
  process.exit(1);
}

const BASE = process.env.BASE || 'http://localhost:3000';
const BASELINE = 'docs/ui-audit-baseline.json';
const UPDATE = process.argv.includes('--update');

const ROUTES = [
  ['home', '/'],
  ['catalogo', '/productos'],
  ['producto', '/productos/big-bags-bolsones-polipropileno'],
  ['familia', '/productos/familia/geosinteticos'],
  ['comparar', '/productos/familia/geosinteticos/comparar'],
  ['recursos', '/recursos'],
  ['articulo', '/recursos/calculo-caudal-mangas-ventilacion-mina-subterranea'],
  ['marco', '/marco'],
  ['marco-evaluacion', '/marco/evaluacion'],
  ['soluciones', '/soluciones'],
  ['glosario', '/glosario'],
  ['descargas', '/descargas'],
  ['termino', '/glosario/geotextil'],
  ['novedades', '/novedades'],
  ['privacidad', '/privacidad'],
  ['terminos', '/terminos'],
  ['novedad', '/novedades/marco-de-especificacion-v1'],
  ['solucion', '/soluciones/poza-revestida-impermeabilizacion'],
  ['local-hub', '/local'],
  ['ciudad', '/local/arequipa'],
  ['servicios', '/servicios'],
  ['nosotros', '/nosotros'],
  ['contacto', '/contacto'],
  ['cotizacion', '/cotizacion'],
];
const VIEWPORTS = [['desktop', 1280, 900], ['movil', 390, 844]];

/** Se ejecuta DENTRO del navegador: sin dependencias externas. */
const AUDIT = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  };
  /** Texto sobre fotografía: el contraste no es medible desde CSS. Se omite. */
  const sobreImagen = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
      if (n.tagName !== 'MAIN' && n.querySelector && n.querySelector(':scope img')) return true;
      n = n.parentElement;
    }
    return false;
  };
  const fondoEfectivo = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0.85) return bg;
      n = n.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  };

  const out = { contrast: [], overflow: 0, smallTaps: [], missingAlt: 0 };
  out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;

  const vistos = new Set();
  for (const el of document.querySelectorAll('main *')) {
    const texto = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (!texto || texto.length < 3) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.15) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    if (cs.position === 'absolute' && sobreImagen(el)) continue;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.5) continue;
    const r = ratio(fg, fondoEfectivo(el));
    const size = parseFloat(cs.fontSize);
    const grande = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    const min = grande ? 3 : 4.5;
    if (r < min) {
      const clave = `${cs.color}|${el.className}`.slice(0, 120);
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      out.contrast.push({
        ratio: +r.toFixed(2), min, texto: texto.slice(0, 45),
        cls: String(el.className).slice(0, 70), color: cs.color,
      });
    }
  }

  for (const el of document.querySelectorAll('main a, main button')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.height < 24 || r.width < 24) {
      out.smallTaps.push({ t: (el.textContent || '').trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  out.missingAlt = document.querySelectorAll('main img:not([alt])').length;
  return out;
};

/* En entornos donde Playwright no descargó su navegador (CI, contenedores),
   se admite un Chromium del sistema vía PLAYWRIGHT_CHROMIUM_PATH. */
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {},
);
const informe = [];
for (const [vp, w, h] of VIEWPORTS) {
  for (const theme of ['light', 'dark']) {
    for (const [route, path] of ROUTES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      if (theme === 'dark') await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      try {
        await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(200);
        informe.push({ vp, theme, route, path, ...(await page.evaluate(AUDIT)) });
      } catch (e) {
        console.error(`  ! ${vp}/${theme}${path}: ${e.message.split('\n')[0]}`);
      }
      await ctx.close();
    }
  }
}
await browser.close();

const clases = { light: new Set(), dark: new Set() };
for (const p of informe) for (const c of p.contrast) clases[p.theme].add(c.cls.slice(0, 50) + '|' + c.color);
const overflow = informe.filter((p) => p.overflow > 1);
const alts = informe.reduce((n, p) => n + p.missingAlt, 0);

const actual = { contrasteClaro: clases.light.size, contrasteOscuro: clases.dark.size, desbordamiento: overflow.length, imagenesSinAlt: alts };

console.log(`\nVistas auditadas: ${informe.length}`);
console.log(`Contraste — clases con fallo:  claro ${actual.contrasteClaro}   oscuro ${actual.contrasteOscuro}`);
console.log(`Desbordamiento horizontal: ${actual.desbordamiento}    Imágenes sin alt: ${actual.imagenesSinAlt}`);

const peores = new Map();
for (const p of informe) for (const c of p.contrast) {
  const k = c.cls.slice(0, 50) + '|' + c.color;
  if (!peores.has(k)) peores.set(k, { ...c, theme: p.theme, rutas: new Set() });
  peores.get(k).rutas.add(p.route);
}
console.log('\nPeores casos:');
[...peores.values()].sort((a, b) => a.ratio - b.ratio).slice(0, 10)
  .forEach((c) => console.log(`  ${String(c.ratio).padStart(5)} (min ${c.min}) ${c.theme.padEnd(5)} [${c.cls.slice(0, 44)}] → ${[...c.rutas].slice(0, 3).join(',')}`));

if (UPDATE || !existsSync(BASELINE)) {
  writeFileSync(BASELINE, JSON.stringify(actual, null, 2) + '\n');
  console.log(`\nLínea base escrita en ${BASELINE}.`);
  process.exit(0);
}

const base = JSON.parse(readFileSync(BASELINE, 'utf8'));
const regresiones = Object.entries(actual).filter(([k, v]) => v > (base[k] ?? 0));
if (regresiones.length) {
  console.error('\nREGRESIÓN respecto de la línea base:');
  for (const [k, v] of regresiones) console.error(`  ${k}: ${base[k]} → ${v}`);
  console.error('\nCorrija, o justifique y actualice con --update.');
  process.exit(1);
}
console.log('\nSin regresiones respecto de la línea base.');
P16_EOF

# -----------------------------------------------------------------------------
# scripts/verificar-despliegue.sh
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/verificar-despliegue.sh" <<'P16_EOF'
#!/usr/bin/env bash
# =============================================================================
#  Verificación de despliegue — espera al commit correcto y luego comprueba.
#
#  El problema que resuelve: tras `git push`, Vercel tarda entre uno y tres
#  minutos en construir. Correr los curls de inmediato interroga al despliegue
#  ANTERIOR y devuelve 404 en rutas que sí existen. Eso parece un defecto del
#  código, no lo es, y enseña a desconfiar de la verificación.
#
#  Este script pregunta a /version.json qué commit está sirviendo el sitio y no
#  comprueba nada hasta que coincide con el que usted acaba de subir.
#
#  Uso:
#    npm run verify:deploy                 # verifica el HEAD local
#    COMMIT=22e3673 npm run verify:deploy  # verifica un commit concreto
#    BASE_URL=https://otro.vercel.app npm run verify:deploy
#
#  Salida: 0 si todo pasa, 1 si algo falla o si el despliegue no llegó a
#  tiempo. Apto para CI.
# =============================================================================
set -uo pipefail

# El origen sale de lib/site.ts, la única fuente de verdad del dominio: el día
# de la migración a plastilonas.com este script la sigue sin tocarse.
# Se ancla a principio de línea para no capturar la URL de ejemplo que vive
# dentro del comentario de migración a plastilonas.com.
SITE_URL=$(grep -oE '^[[:space:]]*url:[[:space:]]*"[^"]+"' lib/site.ts | head -1 | sed 's/.*"\(.*\)"/\1/')
BASE_URL="${BASE_URL:-$SITE_URL}"
ESPERA_MAX="${ESPERA_MAX:-300}"   # segundos
INTERVALO="${INTERVALO:-10}"

# El commit esperado: el que se pase por entorno, o el HEAD del repo local.
COMMIT="${COMMIT:-$(git rev-parse --short=7 HEAD 2>/dev/null || echo '')}"

pass=0; fail=0
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; pass=$((pass+1)); }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; fail=$((fail+1)); }

# --- 1. Esperar a que el despliegue sirva el commit esperado -----------------

echo "Verificando $BASE_URL"
if [ -z "$COMMIT" ]; then
  echo "  ! Sin commit esperado (¿fuera de un repo git?): se verifica lo que haya en línea."
else
  echo "  Esperando al commit $COMMIT (máximo ${ESPERA_MAX}s)…"
  transcurrido=0
  servido=""
  while [ "$transcurrido" -lt "$ESPERA_MAX" ]; do
    servido=$(curl -sf "$BASE_URL/version.json" 2>/dev/null \
      | grep -o '"commitShort": *"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
    if [ "$servido" = "$COMMIT" ]; then
      echo "  → desplegado tras ${transcurrido}s"
      break
    fi
    sleep "$INTERVALO"
    transcurrido=$((transcurrido + INTERVALO))
    printf '    …%ss (sirviendo %s)\n' "$transcurrido" "${servido:-desconocido}"
  done
  if [ "$servido" != "$COMMIT" ]; then
    echo ""
    # printf y no echo: echo no interpreta \033 y la advertencia salía con las
    # secuencias de color en crudo, justo en el mensaje que hay que leer bien.
    printf '  \033[31mEl despliegue no llegó en %ss.\033[0m\n' "$ESPERA_MAX"
    if [ -z "$servido" ]; then
      echo "  /version.json no responde: el despliegue en línea es anterior a P14,"
      echo "  o el build falló. Revíselo en el panel de Vercel antes de dar nada por roto."
    else
      echo "  Sirviendo todavía: $servido"
      echo "  Revise el build en el panel de Vercel antes de dar nada por roto."
    fi
    exit 1
  fi
fi

echo ""

# --- 2. Comprobaciones ------------------------------------------------------

estado() { curl -s -o /dev/null -w '%{http_code}' "$BASE_URL$1"; }
cuerpo() { curl -s "$BASE_URL$1"; }

ruta() { # <ruta> [status esperado]
  local got; got=$(estado "$1")
  [ "$got" = "${2:-200}" ] && ok "$1 → $got" || bad "$1 → $got (esperado ${2:-200})"
}

# Se usa here-string y NO tubería: con `set -o pipefail`, `grep -q` cierra la
# entrada al primer acierto, curl muere con SIGPIPE y el pipeline devuelve
# fallo aunque el patrón SÍ estuviera. Este script existe para dar respuestas
# fiables; un falso negativo suyo sería peor que no tenerlo.
contiene() { # <ruta> <patrón> <descripción>
  local b; b=$(cuerpo "$1")
  if grep -q "$2" <<< "$b"; then ok "$3"; else bad "$3"; fi
}

cuenta() { # <ruta> <patrón> <mínimo> <descripción>
  local b n; b=$(cuerpo "$1"); n=$(grep -c "$2" <<< "$b")
  if [ "$n" -ge "$3" ]; then ok "$4 ($n)"; else bad "$4 (obtuvo $n, mínimo $3)"; fi
}

echo "— Rutas —"
for r in / /productos /servicios /nosotros /contacto /cotizacion /recursos \
         /local /marco /marco/evaluacion /soluciones /novedades /glosario \
         /descargas /privacidad /terminos; do
  ruta "$r"
done

echo "— Archivos para rastreadores —"
ruta /robots.txt
ruta /sitemap.xml
ruta /llms.txt
ruta /novedades/rss.xml
ruta /novedades/feed.json
ruta /glosario/terminos.json
ruta /productos/catalogo.json
ruta /version.json

echo "— Documentos descargables —"
# Un PDF que responde 200 pero devuelve HTML es un enlace roto que no lo parece.
pdf() { # <ruta>
  local ct; ct=$(curl -s -o /dev/null -w '%{content_type}' "$BASE_URL$1")
  case "$ct" in
    application/pdf*) ok "$1 → application/pdf" ;;
    *) bad "$1 → $ct (esperado application/pdf)" ;;
  esac
}
pdf /marco/marco.pdf
pdf /glosario/glosario.pdf
pdf /productos/big-bags-bolsones-polipropileno/ficha-tecnica.pdf
pdf /recursos/instalacion-geomembranas-hdpe-pozas-canales/guia.pdf
pdf /soluciones/poza-revestida-impermeabilizacion/arquitectura.pdf

echo "— Entidad y datos estructurados —"
contiene "/" '"@id":"[^"]*#organization"' "grafo de entidad con @id estable"
contiene "/soluciones/poza-revestida-impermeabilizacion" '"@type":"HowTo"' "arquitecturas emiten HowTo"
contiene "/marco" '"@type":"FAQPage"' "el marco emite FAQPage"
# En expresión regular básica el + es literal: escribirlo como \+ lo convierte
# en cuantificador y el patrón pasa a buscar "application/rssxml".
contiene "/" 'application/rss+xml' "feed declarado en toda página"
contiene "/glosario" '"@type":"DefinedTermSet"' "el glosario emite DefinedTermSet"
contiene "/glosario/geotextil" '"@type":"DefinedTerm"' "cada término emite DefinedTerm"

echo "— Contenido esperado —"
# Los mínimos son cotas inferiores medidas, no cifras exactas: el sitemap
# crece con el catálogo y una igualdad estricta obligaría a editar este script
# en cada patch, que es justo como una verificación deja de correrse.
cuenta "/sitemap.xml" '<loc>'       100 "URLs en el sitemap"
cuenta "/sitemap.xml" 'soluciones'    7 "arquitecturas en el sitemap"
cuenta "/sitemap.xml" 'novedades'     8 "novedades en el sitemap"
cuenta "/novedades/rss.xml" '<item>'  7 "entradas en el feed RSS"
contiene "/llms.txt" 'Arquitecturas de referencia' "llms.txt declara arquitecturas"
contiene "/llms.txt" 'Novedades (registro fechado)' "llms.txt declara el registro"
contiene "/llms.txt" 'Glosario técnico' "llms.txt declara el glosario"
contiene "/glosario/terminos.json" 'atribucionSugerida' "el volcado declara cómo citarlo"
contiene "/descargas" '"@type":"DataCatalog"' "el centro de documentación emite DataCatalog"
contiene "/productos/catalogo.json" 'atribucionSugerida' "el catálogo declara cómo citarlo"
contiene "/llms.txt" 'Documentos descargables' "llms.txt declara los documentos"

echo "— Ningún dato inventado a la vista —"
# El catálogo abierto no debe publicar precios: lo que no se sostiene en la
# cotización no se publica en datos.
if grep -qE '"(precio|price|offers|stock)"' <<< "$(cuerpo /productos/catalogo.json)"; then
  bad "el catálogo en JSON expone precios o existencias"
else
  ok "el catálogo en JSON no publica precios ni existencias"
fi
home=$(cuerpo "/")
n=$(grep -o 'data-social="[a-z]*"' <<< "$home" | sort -u | wc -l)
if [ "$n" -le 2 ]; then ok "sólo perfiles sociales reales ($n)"; else
  bad "hay $n perfiles sociales renderizados; sólo WhatsApp y Facebook son reales"; fi
if grep -q 'href="https://www.instagram.com/"' <<< "$home"; then
  bad "perfil marcador de Instagram visible"; else ok "sin perfiles marcadores"; fi

echo ""
printf 'Resultado: \033[32m%s correctas\033[0m, ' "$pass"
if [ "$fail" -eq 0 ]; then printf '\033[32m0 fallos\033[0m\n'; else printf '\033[31m%s fallos\033[0m\n' "$fail"; fi
[ "$fail" -eq 0 ] || exit 1
P16_EOF

chmod +x scripts/verificar-despliegue.sh
# -----------------------------------------------------------------------------
echo ""
echo "P16 aplicado."
echo "  nuevos      lib/pdf-kit.ts (motor extraido)"
echo "              lib/doc-guia.ts, doc-arquitectura.ts, doc-glosario.ts, doc-marco.ts"
echo "              lib/catalogo-feed.ts, lib/descargas.ts"
echo "              4 rutas PDF nuevas + /productos/catalogo.json"
echo "              app/descargas/page.tsx, app/not-found.tsx"
echo "              test/documentos.test.ts"
echo "  modificados lib/datasheet.ts (usa el motor), lib/schema.ts (DataCatalog),"
echo "              analytics, TrackView, novedades, sitemap, llms.txt,"
echo "              glosario, marco, guia, arquitectura, Footer,"
echo "              audit-ui.mjs, verificar-despliegue.sh"
echo ""
echo "Siguiente paso:"
echo "  npx tsc --noEmit && npx next lint && npm test && npm run build"
echo "  (esperado: 262 tests en 19 archivos, 227 paginas)"
echo ""
echo "Y despues del push:"
echo "  npm run verify:deploy      (esperado: 49 correctas, 0 fallos)"
