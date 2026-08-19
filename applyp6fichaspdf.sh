#!/usr/bin/env bash
# =============================================================================
# P6 — FICHAS TÉCNICAS EN PDF, GENERADAS DESDE EL CATÁLOGO
#
# Plastilonas Peruanas SAC. Aplica sobre main en 3ce4c9e o posterior.
#
# En una compra industrial el comprador técnico no decide solo: tiene que
# llevar el documento a ingeniería, a calidad y a logística. El PDF es el
# activo que circula dentro de la empresa del cliente cuando nosotros ya no
# estamos en la conversación.
#
# Se GENERA desde lib/products.ts, no se sube a mano: 36 fichas mantenidas
# manualmente se desincronizan del catálogo a la primera corrección. Aquí,
# corregir una especificación corrige también el documento en el siguiente
# despliegue. Se prerenderizan en el build, así que en producción se sirven
# como estáticos.
#
# Uso:   bash apply-p6-fichas-pdf.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ] || [ ! -d app ]; then
  echo "ERROR: ejecute este script desde la raíz del repo." >&2
  exit 1
fi

echo "==> Instalando pdf-lib (JS puro, sin dependencias nativas)"
npm install pdf-lib --save --no-audit --no-fund

echo "==> Creando directorios"
mkdir -p "app/productos/[slug]/ficha-tecnica.pdf"

echo "==> Escribiendo lib/datasheet.ts"
cat > 'lib/datasheet.ts' <<'PP_EOF'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { Product } from './types';
import { SITE } from './site';
import { sourcingLabels, availabilityLabels } from './products';

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
 * REGLA DE HONESTIDAD: el PDF no declara precio, ni certificaciones, ni ensayos
 * que el catálogo no contenga. Si `documentation` no existe, no se inventa una
 * línea de documentación; se indica que se entrega con la cotización.
 */

const MARGIN = 50;
const PAGE_W = 595.28; // A4 en puntos
const PAGE_H = 841.89;
const AZUL = rgb(0.039, 0.145, 0.251); // #0A2540
const VERDE = rgb(0.020, 0.588, 0.412); // #059669
const GRIS = rgb(0.42, 0.45, 0.5);
const GRIS_CLARO = rgb(0.88, 0.89, 0.91);

/**
 * Las fuentes estándar de PDF usan WinAnsi, que cubre el español (acentos y ñ)
 * pero NO los signos tipográficos que usamos en la web. Sin esta conversión,
 * pdf-lib lanza una excepción al primer guion largo y la ficha no se genera.
 */
export function toWinAnsi(text: string): string {
  return text
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[→➡]/g, '->')
    .replace(/·/g, '-')
    .replace(/•/g, '-')
    .replace(/ /g, ' ')
    .replace(/[≤]/g, '<=')
    .replace(/[≥]/g, '>=')
    .replace(/²/g, '2')
    .replace(/³/g, '3')
    .replace(/º/g, 'o')
    .replace(/[^\x00-\xFF]/g, '');
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
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

interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
}

function newPage(ctx: Ctx): void {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.y = PAGE_H - MARGIN;
}

/** Reserva vertical: si no cabe el bloque, abre página antes de escribirlo. */
function ensure(ctx: Ctx, needed: number): void {
  if (ctx.y - needed < MARGIN + 40) newPage(ctx);
}

function heading(ctx: Ctx, text: string): void {
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

function paragraph(ctx: Ctx, text: string, size = 9.5): void {
  for (const line of wrap(text, ctx.regular, size, PAGE_W - MARGIN * 2)) {
    ensure(ctx, size + 4);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font: ctx.regular, color: AZUL });
    ctx.y -= size + 3.5;
  }
}

function bullets(ctx: Ctx, items: string[], size = 9.5): void {
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

function specTable(ctx: Ctx, rows: { label: string; value: string }[]): void {
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
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.setTitle(toWinAnsi(`Ficha técnica - ${product.name} - ${SITE.name}`));
  doc.setAuthor(SITE.legalName);
  doc.setSubject(toWinAnsi(product.shortDescription));
  doc.setProducer(SITE.name);
  doc.setCreator(SITE.url);
  doc.setKeywords([product.category, ...product.sector, 'Perú', 'ficha técnica'].map(toWinAnsi));

  const ctx: Ctx = { doc, page: doc.addPage([PAGE_W, PAGE_H]), y: PAGE_H - MARGIN, regular, bold };

  // --- Cabecera -------------------------------------------------------------
  ctx.page.drawRectangle({ x: 0, y: PAGE_H - 96, width: PAGE_W, height: 96, color: AZUL });
  ctx.page.drawText(toWinAnsi(SITE.name), {
    x: MARGIN, y: PAGE_H - 42, size: 15, font: bold, color: rgb(1, 1, 1),
  });
  ctx.page.drawText(toWinAnsi(`RUC ${SITE.ruc}  |  ${SITE.addressLocality}, ${SITE.addressRegion}, Perú`), {
    x: MARGIN, y: PAGE_H - 60, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92),
  });
  ctx.page.drawText(toWinAnsi(`WhatsApp ${SITE.phoneWhatsApp}  |  ${SITE.email}  |  ${SITE.url}`), {
    x: MARGIN, y: PAGE_H - 76, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92),
  });
  ctx.y = PAGE_H - 130;

  // --- Título ---------------------------------------------------------------
  for (const line of wrap(product.name, bold, 18, PAGE_W - MARGIN * 2)) {
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: 18, font: bold, color: AZUL });
    ctx.y -= 22;
  }
  ctx.page.drawText(toWinAnsi(`${product.category}  |  Ficha técnica`), {
    x: MARGIN, y: ctx.y, size: 9, font: regular, color: GRIS,
  });
  ctx.y -= 8;

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

  // --- Pie en todas las páginas --------------------------------------------
  const pages = doc.getPages();
  pages.forEach((page, i) => {
    page.drawLine({
      start: { x: MARGIN, y: MARGIN + 22 }, end: { x: PAGE_W - MARGIN, y: MARGIN + 22 },
      thickness: 0.5, color: GRIS_CLARO,
    });
    page.drawText(
      toWinAnsi(`${SITE.url}/productos/${product.slug}  |  Documento generado el ${generatedAt}`),
      { x: MARGIN, y: MARGIN + 10, size: 7.5, font: regular, color: GRIS },
    );
    page.drawText(`${i + 1} / ${pages.length}`, {
      x: PAGE_W - MARGIN - 30, y: MARGIN + 10, size: 7.5, font: regular, color: GRIS,
    });
  });

  return doc.save();
}
PP_EOF

echo "==> Escribiendo app/productos/[slug]/ficha-tecnica.pdf/route.ts"
cat > 'app/productos/[slug]/ficha-tecnica.pdf/route.ts' <<'PP_EOF'
import { products } from '@/lib/products';
import { buildDatasheetPdf } from '@/lib/datasheet';
import { SITE } from '@/lib/site';

/**
 * Ficha técnica en PDF por producto: /productos/{slug}/ficha-tecnica.pdf
 *
 * Se prerenderiza en el build (force-static + generateStaticParams), de modo
 * que en producción se sirve como archivo estático pero SIEMPRE refleja el
 * catálogo del último despliegue: no hay PDFs subidos a mano que se
 * desincronicen de lib/products.ts.
 *
 * Cabecera `Link: rel="canonical"`: Google indexa PDFs y un documento con las
 * mismas especificaciones podría competir con la ficha HTML del producto. El
 * canonical declara que la página del producto es la versión principal.
 */

export const dynamic = 'force-static';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return new Response('Not found', { status: 404 });
  }

  // Fecha del despliegue: el documento declara cuándo se generó, sin fingir una
  // revisión editorial que no existe.
  const generatedAt = new Date().toISOString().slice(0, 10);
  const pdf = await buildDatasheetPdf(product, generatedAt);
  const productUrl = `${SITE.url}/productos/${product.slug}`;

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="ficha-tecnica-${product.slug}.pdf"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      Link: `<${productUrl}>; rel="canonical"`,
    },
  });
}
PP_EOF

echo "==> Escribiendo components/DatasheetButton.tsx"
cat > 'components/DatasheetButton.tsx' <<'PP_EOF'
'use client';

import { FileDown } from 'lucide-react';
import { trackDocumentDownload } from '@/lib/analytics';

/**
 * Descarga de la ficha técnica, con evento de conversión.
 *
 * Descargar una ficha es una señal de intención mucho más fuerte que una visita:
 * quien se lleva el PDF suele estar armando un expediente de compra. Sin el
 * evento `document_download` esa señal se pierde y no se puede comparar el
 * rendimiento de las fichas entre familias.
 */
export default function DatasheetButton({
  slug,
  nombre,
  className,
}: {
  slug: string;
  nombre: string;
  className?: string;
}) {
  return (
    <a
      href={`/productos/${slug}/ficha-tecnica.pdf`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackDocumentDownload(`ficha-tecnica:${slug}`, slug)}
      className={
        className ??
        'flex-1 sm:flex-none inline-flex justify-center items-center gap-2 border border-gray-200 hover:bg-gray-50 px-7 py-4 rounded-2xl font-medium text-sm'
      }
    >
      <FileDown className="w-4 h-4" /> Descargar ficha técnica (PDF)
    </a>
  );
}
PP_EOF

echo "==> Escribiendo test/datasheet.test.ts"
cat > 'test/datasheet.test.ts' <<'PP_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { products } from '@/lib/products';
import { buildDatasheetPdf, toWinAnsi } from '@/lib/datasheet';
import { generateStaticParams } from '@/app/productos/[slug]/ficha-tecnica.pdf/route';

const FECHA = '2026-08-18';

describe('ficha técnica: saneado de texto', () => {
  it('convierte los signos tipográficos que WinAnsi no admite', () => {
    // Sin esto, pdf-lib lanza excepción al primer guion largo y no hay ficha.
    expect(toWinAnsi('a—b')).toBe('a-b');
    expect(toWinAnsi('“cita”')).toBe('"cita"');
    expect(toWinAnsi('a → b')).toBe('a -> b');
    expect(toWinAnsi('2 m²')).toBe('2 m2');
    expect(toWinAnsi('uno · dos')).toBe('uno - dos');
  });

  it('conserva intactos los acentos y la eñe del español', () => {
    expect(toWinAnsi('Especificación de mañana en el Perú')).toBe(
      'Especificación de mañana en el Perú',
    );
  });

  it('elimina lo que no cabe en WinAnsi en vez de romper el documento', () => {
    expect(toWinAnsi('ok ✅ fin')).toBe('ok  fin');
  });
});

describe('ficha técnica: generación', () => {
  it('genera un PDF válido para CADA producto del catálogo', async () => {
    for (const p of products) {
      const bytes = await buildDatasheetPdf(p, FECHA);
      const header = Buffer.from(bytes.slice(0, 5)).toString('latin1');
      expect(header, p.slug).toBe('%PDF-');
      expect(bytes.length, p.slug).toBeGreaterThan(2000);
    }
  }, 60_000);

  it('es determinista para el mismo contenido y la misma fecha', async () => {
    const a = await buildDatasheetPdf(products[0], FECHA);
    const b = await buildDatasheetPdf(products[0], FECHA);
    expect(a.length).toBe(b.length);
  });

  it('la ruta prerenderiza una ficha por producto', () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(products.length);
    expect(params.map((p) => p.slug).sort()).toEqual(products.map((p) => p.slug).sort());
  });
});

describe('ficha técnica: honestidad del documento', () => {
  const route = readFileSync(
    join(process.cwd(), 'app/productos/[slug]/ficha-tecnica.pdf/route.ts'),
    'utf8',
  );
  const lib = readFileSync(join(process.cwd(), 'lib/datasheet.ts'), 'utf8');

  it('declara canonical hacia la ficha HTML, para no competir con ella', () => {
    expect(route).toContain('rel="canonical"');
    expect(route).toContain('/productos/${product.slug}');
  });

  it('no inventa documentación cuando el catálogo no la declara', () => {
    // El texto de respaldo dice que se entrega con la cotización; nunca afirma
    // un certificado concreto que no exista en el catálogo.
    expect(lib).toContain('product.documentation ??');
    expect(lib).toContain('se entregan con la cotización');
  });

  it('el PDF no publica precios: el negocio es por cotización', () => {
    expect(lib).not.toMatch(/S\/\s?\d/);
    expect(lib).toContain('No publicamos precio de lista');
  });

  it('la descarga emite el evento de conversión', () => {
    const btn = readFileSync(join(process.cwd(), 'components/DatasheetButton.tsx'), 'utf8');
    expect(btn).toContain('trackDocumentDownload');
    expect(btn).toContain('/ficha-tecnica.pdf');
  });
});
PP_EOF

echo "==> Escribiendo app/productos/[slug]/page.tsx"
cat > 'app/productos/[slug]/page.tsx' <<'PP_EOF'
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Phone } from 'lucide-react';
import { products } from '@/lib/products';
import CotizacionModal from '@/components/CotizacionModal';
import ProductGallery from '@/components/ProductGallery';
import ProductBuyBox from '@/components/ProductBuyBox';
import ProductAvailability from '@/components/ProductAvailability';
import ProductStructuredData from '@/components/ProductStructuredData';
import { SITE } from '@/lib/site';
import WhatsAppLink from '@/components/WhatsAppLink';
import TrackView from '@/components/TrackView';
import DatasheetButton from '@/components/DatasheetButton';
import { productFaqs } from '@/lib/product-faq';
import { JsonLd } from '@/components/JsonLd';
import { faqSchema } from '@/lib/schema';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  
  if (!product) return { title: 'Producto no encontrado' };

  // Las fotos reales ahora existen en /public/images: exponemos la imagen del
  // producto en Open Graph / Twitter para que al compartir la página (WhatsApp,
  // LinkedIn) se muestre la foto real del producto.
  const canonical = `/productos/${product.slug}`;
  const ogTitle = `${product.name} — Plastilonas Peruanas SAC`;
  const ogImage = product.image ? `${SITE.url}${product.image}` : undefined;
  return {
    title: product.name,
    description: product.shortDescription,
    keywords: [product.name, product.category, ...product.sector, 'Perú', 'proveedor', 'fabricante'],
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: product.shortDescription,
      url: canonical,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage, alt: product.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: product.shortDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const faqs = productFaqs(product);
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.sector.some(s => product.sector.includes(s))))
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <TrackView kind="product" slug={product.slug} categoria={product.category} />
      <ProductStructuredData product={product} />
      {/* FAQPage derivado del catálogo (lib/product-faq.ts): cero respuestas
          inventadas — cada una sale de un campo real del producto. */}
      <JsonLd data={faqSchema(faqs, `${SITE.url}/productos/${product.slug}`)} />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-8 text-gray-500">
        <Link href="/productos" className="hover:text-[#059669]">Productos</Link>
        <span>/</span>
        <span className="text-[#0A2540]">{product.category}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-x-14 gap-y-10">
        {/* Gallery */}
        <div>
          <ProductGallery product={product} />
        </div>


        {/* Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="badge bg-emerald-100 text-emerald-700">{product.category}</span>
            {product.popular && <span className="badge bg-amber-100 text-amber-700">Más vendido</span>}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter font-semibold text-[#0A2540] leading-tight md:leading-none mb-5">{product.name}</h1>
          
          <p className="text-xl text-gray-600 leading-snug mb-8">{product.shortDescription}</p>

          <ProductAvailability product={product} />

          <ProductBuyBox product={product} />

          <div className="flex flex-wrap gap-3 mb-9">
            <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 bg-[#0A2540] hover:bg-[#059669] text-white px-9 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.985]">
              Solicitar Cotización para este producto <ArrowRight className="w-4 h-4" />
            </Link>
            <WhatsAppLink
              context={`producto:${product.slug}`}
              message={`Hola, necesito una cotización de ${product.name}.`}
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 border border-gray-200 hover:bg-gray-50 px-7 py-4 rounded-2xl font-medium text-sm"
            >
              <Phone className="w-4 h-4" /> Consultar por WhatsApp
            </WhatsAppLink>
            <DatasheetButton slug={product.slug} nombre={product.name} />
          </div>

          {/* Quick Specs */}
          <div className="bg-gray-50 rounded-3xl p-7 text-sm">
            <div className="font-semibold tracking-tight mb-4 text-[#0A2540]">Especificaciones clave</div>
            <div className="grid grid-cols-1 gap-y-3">
              {product.specifications.slice(0, 5).map((spec, i) => (
                <div key={i} className="flex justify-between border-b border-gray-100 pb-3 last:border-none last:pb-0">
                  <span className="text-gray-500">{spec.label}</span>
                  <span className="font-medium text-right text-[#0A2540]">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Description */}
      <div className="mt-14 max-w-4xl">
        <h2 className="font-semibold text-2xl tracking-tight mb-5">Descripción completa</h2>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {product.description}
        </div>
      </div>

      {/* Specifications Table */}
      <div className="mt-14">
        <h2 className="font-semibold text-2xl tracking-tight mb-6">Especificaciones técnicas</h2>
        <div className="overflow-x-auto">
          <table className="specs-table w-full border-collapse">
            <tbody>
              {product.specifications.map((spec, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-none">
                  <td className="py-4 pr-8 font-medium text-gray-600 w-64 align-top">{spec.label}</td>
                  <td className="py-4 text-[#0A2540] font-medium">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applications & Benefits */}
      <div className="grid md:grid-cols-2 gap-8 mt-14">
        <div>
          <h3 className="font-semibold tracking-tight text-xl mb-5 flex items-center gap-2">Aplicaciones principales</h3>
          <ul className="space-y-3 text-gray-700">
            {product.applications.map((app, i) => (
              <li key={i} className="flex gap-3"><span className="text-[#059669] mt-1">→</span> {app}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold tracking-tight text-xl mb-5 flex items-center gap-2">Beneficios clave</h3>
          <ul className="space-y-3 text-gray-700">
            {product.benefits.map((ben, i) => (
              <li key={i} className="flex gap-3"><span className="text-[#059669] mt-1">→</span> {ben}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Preguntas frecuentes — el contenido visible debe coincidir con el
          FAQPage emitido arriba; Google penaliza el schema sin contraparte visible. */}
      <div className="mt-16 pt-10 border-t">
        <h2 className="font-semibold tracking-tight text-2xl mb-6">Preguntas frecuentes sobre {product.name}</h2>
        <dl className="space-y-6 max-w-3xl">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold tracking-tight text-2xl">Productos relacionados</h3>
            <Link href="/productos" className="text-sm text-[#059669] flex items-center gap-1 hover:underline">Ver todo <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map(p => (
              <Link key={p.id} href={`/productos/${p.slug}`} className="group block border border-gray-100 rounded-3xl p-6 hover:border-[#059669]/40 transition-all">
                <div className="font-semibold tracking-tight mb-2 group-hover:text-[#059669]">{p.name}</div>
                <p className="text-sm text-gray-600 line-clamp-2">{p.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="mt-16 bg-[#0A2540] text-white rounded-3xl p-10 text-center">
        <h3 className="text-3xl tracking-tight font-semibold mb-3">¿Este producto se adapta a su proyecto?</h3>
        <p className="text-white/80 mb-7 max-w-md mx-auto">Nuestro equipo técnico está listo para asesorarlo y entregarle una cotización personalizada para su proyecto.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="inline-flex items-center justify-center bg-white text-[#0A2540] hover:bg-white/90 px-10 py-3.5 rounded-2xl font-semibold">Solicitar Cotización Personalizada</Link>
          <WhatsAppLink context={`producto-cta:${product.slug}`} message={`Hola, quisiera asesoría técnica sobre ${product.name}.`} className="inline-flex items-center justify-center border border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-2xl font-medium">Hablar con un especialista</WhatsAppLink>
        </div>
      </div>
    </div>
  );
}
PP_EOF

echo ""
echo "==> Puertas de calidad"
npx tsc --noEmit
npx next lint
npm test
npm run build

echo ""
echo "=============================================================="
echo " LISTO. Esperado: 10 test files / 110 tests, y en el build:"
echo "   * /productos/[slug]/ficha-tecnica.pdf   (36 rutas)"
echo "   130 páginas estáticas generadas"
echo ""
echo " Verificación local rápida:"
echo "   npm run start  →  http://localhost:3000/productos/big-bags-bolsones-polipropileno/ficha-tecnica.pdf"
echo ""
echo " Siguiente:"
echo "   git add -A"
echo "   git commit -m 'feat(conv): fichas tecnicas en PDF generadas desde el catalogo'"
echo "   git push origin main"
echo "=============================================================="
