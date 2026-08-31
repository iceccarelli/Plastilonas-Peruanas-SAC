import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { products, productFamilies } from '@/lib/products';
import { comparableFamilies } from '@/lib/families';
import { construirComparativa, NO_DECLARADO } from '@/lib/comparativa';
import type { Product } from '@/lib/types';
import { generateStaticParams } from '@/app/(es)/productos/familia/[slug]/comparar/page';
import sitemap from '@/lib/sitemaps';
import { SITE } from '@/lib/site';

const ROOT = process.cwd();

describe('comparativas: qué familias las tienen', () => {
  it('solo se generan familias con dos o más productos', () => {
    for (const f of comparableFamilies()) {
      const n = products.filter((p) => p.category === f.name).length;
      expect(n, f.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it('las familias de un solo producto quedan fuera: una comparativa vacía no se indexa', () => {
    const comparables = new Set(comparableFamilies().map((f) => f.slug));
    for (const f of productFamilies) {
      const n = products.filter((p) => p.category === f.name).length;
      if (n < 2) expect(comparables.has(f.slug), `${f.slug} no debería ser comparable`).toBe(false);
    }
  });

  it('generateStaticParams cubre exactamente las familias comparables', () => {
    const params = generateStaticParams().map((p) => p.slug).sort();
    expect(params).toEqual(comparableFamilies().map((f) => f.slug).sort());
  });

  it('el sitemap lista cada comparativa y sigue sin duplicados', () => {
    const urls = sitemap().map((e) => e.url);
    for (const f of comparableFamilies()) {
      expect(urls).toContain(`${SITE.url}/productos/familia/${f.slug}/comparar`);
    }
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe('comparativas: honestidad de la matriz', () => {
  const page = readFileSync(
    join(ROOT, 'app/(es)/productos/familia/[slug]/comparar/page.tsx'),
    'utf8',
  );

  /**
   * Estas pruebas afirmaban sobre el TEXTO de la página. Al extraer la matriz
   * a lib/comparativa.ts —para que la usen también las cuñas— se rompieron
   * las cuatro sin que nada estuviera mal: vigilaban una implementación, no
   * una garantía. Ahora ejercitan la función pura, así que sobreviven al
   * próximo refactor y siguen protegiendo lo que de verdad importa.
   */
  const ficha = (
    slug: string,
    specs: { label: string; value: string }[],
  ): Product => ({
    id: slug.toUpperCase(),
    slug,
    name: slug,
    category: 'Prueba',
    sector: ['Minería'],
    shortDescription: 'x',
    description: 'x',
    specifications: specs,
    applications: [],
    benefits: [],
    image: '/images/x.webp',
    gallery: [],
    featured: false,
    popular: false,
  });

  const muestra = [
    ficha('a', [{ label: 'Material', value: 'PVC' }, { label: 'Solo A', value: '1' }]),
    ficha('b', [{ label: 'Material', value: 'PE' }]),
    ficha('c', [{ label: 'Ancho', value: '2 m' }]),
  ];

  it('las celdas sin dato dicen "No declarado" y no se rellenan', () => {
    const m = construirComparativa(muestra);
    expect(m.valor('c', 'Material')).toBe(NO_DECLARADO);
    // La celda vacía nunca hereda el valor de otro producto.
    expect(m.valor('c', 'Material')).not.toBe('PVC');
    expect(m.valor('a', 'Material')).toBe('PVC');
  });

  it('la matriz usa la unión de etiquetas declaradas, no una lista fija', () => {
    // 'Material' lo declaran dos: entra. Nada se inventa fuera del catálogo.
    expect(construirComparativa(muestra).filas).toEqual(['Material']);
  });

  it('solo compara filas que al menos dos productos declaran', () => {
    // Con la unión completa, una familia de siete productos daba una tabla de
    // mayoría "No declarado": honesta pero inservible para decidir.
    const filas = construirComparativa(muestra).filas;
    expect(filas).not.toContain('Solo A');
    expect(filas).not.toContain('Ancho');
  });

  it('lo exclusivo de cada producto se muestra, no se descarta', () => {
    const exclusivas = construirComparativa(muestra).exclusivas;
    expect(exclusivas.map((e) => e.producto.slug).sort()).toEqual(['a', 'c']);
    expect(exclusivas.find((e) => e.producto.slug === 'a')?.specs[0].label).toBe('Solo A');
    expect(page).toContain('Especificaciones exclusivas de cada alternativa');
  });

  it('con el catálogo real, cada familia comparable produce filas', () => {
    for (const familia of comparableFamilies()) {
      const items = products.filter((p) => p.category === familia.name);
      const m = construirComparativa(items);
      expect(m.filas.length, `${familia.slug} no produce ninguna fila comparable`)
        .toBeGreaterThan(0);
    }
  });

  it('no publica precios: el negocio sigue siendo por cotización', () => {
    expect(page).not.toMatch(/S\/\s?\d/);
    expect(page).not.toContain('price');
  });
});

describe('deep link de cotización', () => {
  const page = readFileSync(join(ROOT, 'app/(es)/cotizacion/page.tsx'), 'utf8');
  const form = readFileSync(join(ROOT, 'components/CotizacionForm.tsx'), 'utf8');

  it('la página de cotización LEE el parámetro producto', () => {
    // Las 36 fichas enlazan con ?producto=; antes el parámetro se descartaba y
    // el comprador tenía que volver a escribir lo que acababa de mirar. Ahora
    // la página es un componente de servidor: lee `searchParams` como prop.
    expect(page).toContain('searchParams');
    expect(page).toContain('params.producto');
    expect(page).toContain('preselectedProduct');
  });

  it('acepta una comparativa por slugs y la traduce a nombres del catálogo', () => {
    expect(page).toContain('params.comparativa');
    expect(page).toContain('products.find((p) => p.slug === slug)');
  });

  it('el formulario aplica producto y mensaje preseleccionados', () => {
    expect(form).toContain('preselectedProduct');
    expect(form).toContain('preselectedMessage');
    expect(form).toContain("setValue('mensaje', preselectedMessage)");
  });

  it('el valor del <select> es el nombre del producto, que es lo que llega por la URL', () => {
    expect(form).toContain('value={p.name}');
  });

  it('cada ficha de producto enlaza a la cotización con su propio nombre', () => {
    const productPage = readFileSync(join(ROOT, 'app/(es)/productos/[slug]/page.tsx'), 'utf8');
    expect(productPage).toContain('/cotizacion?producto=${encodeURIComponent(product.name)}');
  });
});
