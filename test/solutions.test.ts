import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  solutions, solutionBySlug, solutionsForProduct,
  productExists, guideExists, pillarExists,
} from '@/lib/solutions';
import { products } from '@/lib/products';
import { generateStaticParams } from '@/app/(es)/soluciones/[slug]/page';
import sitemap from '@/lib/sitemaps';
import { SITE } from '@/lib/site';

describe('arquitecturas: referencias reales', () => {
  it('cada componente apunta a un SKU que existe en el catálogo', () => {
    // Una lista de materiales con piezas genéricas es una promesa que después
    // no se puede suministrar.
    for (const s of solutions) {
      for (const c of s.componentes) {
        expect(productExists(c.producto), `${s.slug} → ${c.producto}`).toBe(true);
      }
    }
  });

  it('cada guía citada existe en el silo de recursos', () => {
    for (const s of solutions) {
      for (const g of s.guias) expect(guideExists(g), `${s.slug} → ${g}`).toBe(true);
    }
  });

  it('cada pilar citado existe en el marco', () => {
    for (const s of solutions) {
      for (const p of s.pilaresClave) expect(pillarExists(p), `${s.slug} → ${p}`).toBe(true);
    }
  });

  it('los slugs y los metaTitle son únicos', () => {
    const slugs = solutions.map((s) => s.slug);
    const titles = solutions.map((s) => s.metaTitle);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(titles).size).toBe(titles.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it('toda arquitectura tiene componentes, secuencia, riesgos y FAQs', () => {
    for (const s of solutions) {
      expect(s.componentes.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.secuencia.length, s.slug).toBeGreaterThanOrEqual(4);
      expect(s.riesgos.length, s.slug).toBeGreaterThanOrEqual(2);
      expect(s.faqs.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.problema.length, s.slug).toBeGreaterThanOrEqual(1);
    }
  });

  it('cada arquitectura tiene al menos un componente no opcional', () => {
    // Si todo es "según el caso", no hay conjunto que mostrar.
    for (const s of solutions) {
      expect(s.componentes.some((c) => !c.opcional), s.slug).toBe(true);
    }
  });

  it('los pasos de la secuencia son accionables, no titulares', () => {
    for (const s of solutions) {
      for (const p of s.secuencia) {
        expect(p.paso.trim().length, s.slug).toBeGreaterThan(10);
        expect(p.detalle.trim().length, s.slug).toBeGreaterThan(80);
      }
    }
  });
});

describe('arquitecturas: honestidad', () => {
  it('no declaran obras ejecutadas, clientes ni volúmenes', () => {
    // Son configuraciones de referencia. Los casos reales irán aparte, con
    // cifras y con permiso del cliente.
    const texto = JSON.stringify(solutions).toLowerCase();
    for (const frase of ['ejecutamos para', 'nuestro cliente', 'caso de éxito', 'hemos instalado']) {
      expect(texto, frase).not.toContain(frase);
    }
  });

  it('no publican precios', () => {
    const texto = JSON.stringify(solutions);
    expect(texto).not.toMatch(/S\/\s?\d/);
    expect(texto).not.toMatch(/US\$\s?\d/);
  });

  it('el índice declara explícitamente que no son casos de estudio', () => {
    const page = readFileSync(join(process.cwd(), 'app/(es)/soluciones/page.tsx'), 'utf8');
    expect(page).toContain('no casos de estudio');
  });
});

describe('arquitecturas: integración', () => {
  it('generateStaticParams cubre todas', () => {
    expect(generateStaticParams().map((p) => p.slug).sort()).toEqual(
      solutions.map((s) => s.slug).sort(),
    );
  });

  it('el sitemap lista el índice y cada arquitectura, sin duplicados', () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE.url}/soluciones`);
    for (const s of solutions) expect(urls).toContain(`${SITE.url}/soluciones/${s.slug}`);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('solutionsForProduct enlaza la ficha con sus conjuntos', () => {
    const geomembrana = solutionsForProduct('geomembrana-polietileno-pe-hdpe');
    expect(geomembrana.length).toBeGreaterThan(0);
    expect(solutionsForProduct('no-existe')).toEqual([]);
  });

  it('la ficha de producto muestra dónde encaja', () => {
    const page = readFileSync(join(process.cwd(), 'app/(es)/productos/[slug]/page.tsx'), 'utf8');
    expect(page).toContain('solutionsForProduct');
    expect(page).toContain('Dónde encaja este producto');
  });

  it('al menos la mitad del catálogo participa en alguna arquitectura', () => {
    // Si casi ningún SKU aparece, la sección no está cumpliendo su función de
    // conectar catálogo con proyecto.
    const conArquitectura = products.filter((p) => solutionsForProduct(p.slug).length > 0);
    expect(conArquitectura.length).toBeGreaterThanOrEqual(10);
  });

  it('están en la navegación y en llms.txt', () => {
    const nav = readFileSync(join(process.cwd(), 'components/Navbar.tsx'), 'utf8');
    const llms = readFileSync(join(process.cwd(), 'app/llms.txt/route.ts'), 'utf8');
    expect(nav).toContain("href: '/soluciones'");
    expect(llms).toContain('Arquitecturas de referencia');
  });

  it('solutionBySlug resuelve y falla limpio', () => {
    expect(solutionBySlug(solutions[0].slug)?.titulo).toBe(solutions[0].titulo);
    expect(solutionBySlug('no-existe')).toBeUndefined();
  });
});
