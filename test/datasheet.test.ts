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
