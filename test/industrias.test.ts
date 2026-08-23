import { describe, it, expect } from 'vitest';
import {
  INDUSTRIAS,
  productosDe,
  productosOrdenados,
  solucionesDe,
  guiasDe,
  tituloIndustria,
  descripcionIndustria,
  catalogoHref,
} from '@/lib/industrias';
import { products } from '@/lib/products';
import { tituloCabe, MAX_DESCRIPCION } from '@/lib/meta';

describe('hubs de industria', () => {
  it('los slugs son únicos y con forma de URL', () => {
    const slugs = INDUSTRIAS.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it('cada etiqueta de sector existe de verdad en el catálogo', () => {
    const reales = new Set(products.flatMap((p) => p.sector));
    for (const ind of INDUSTRIAS) {
      for (const e of ind.etiquetas) {
        expect(reales, `etiqueta «${e}» de ${ind.slug} no existe en el catálogo`).toContain(e);
      }
    }
  });

  it('ningún hub queda delgado: mínimo cinco productos derivados', () => {
    for (const ind of INDUSTRIAS) {
      expect(productosDe(ind).length, `${ind.slug} tiene muy pocos productos`).toBeGreaterThanOrEqual(5);
    }
  });

  /**
   * La prueba que evita el fallo silencioso: un `ancla` mal escrito no rompe
   * la compilación ni la página —solo desaparece de la lista sin avisar—.
   */
  it('todo producto ancla existe y lleva la etiqueta de su sector', () => {
    for (const ind of INDUSTRIAS) {
      for (const slug of ind.ancla) {
        const p = products.find((x) => x.slug === slug);
        expect(p, `ancla «${slug}» de ${ind.slug} no existe en lib/products.ts`).toBeDefined();
        expect(
          p!.sector.some((s) => ind.etiquetas.includes(s)),
          `«${slug}» no lleva ninguna etiqueta de ${ind.slug} (${ind.etiquetas.join('/')})`,
        ).toBe(true);
      }
    }
  });

  it('los anclas encabezan el orden de presentación', () => {
    for (const ind of INDUSTRIAS) {
      const orden = productosOrdenados(ind).map((p) => p.slug);
      expect(orden.slice(0, ind.ancla.length)).toEqual(ind.ancla);
      expect(new Set(orden).size).toBe(orden.length);
      expect(orden.length).toBe(productosDe(ind).length);
    }
  });

  it('los títulos caben en el resultado de búsqueda, con la marca incluida', () => {
    for (const ind of INDUSTRIAS) {
      const t = tituloIndustria(ind);
      expect(tituloCabe(t), `«${t}» (${t.length}) no cabe con el sufijo de marca`).toBe(true);
      expect(t.length).toBeGreaterThanOrEqual(15);
    }
  });

  /**
   * Que quepa no basta: si el complemento se cae, el título queda en el nombre
   * del sector a secas y se desperdicia la mitad del espacio de clic. Esta
   * prueba obliga a escribir complementos que ENTREN, no a confiar en que
   * lib/meta.ts los suelte.
   */
  it('el complemento del título sobrevive: ninguno se cae por no caber', () => {
    for (const ind of INDUSTRIAS) {
      const t = tituloIndustria(ind);
      expect(t, `${ind.slug}: el complemento no cupo y se soltó entero`).toContain(':');
      expect(t).toContain(ind.complementoTitulo);
      // Y que quede espacio real usado: no un título de tres palabras.
      expect(t.length).toBeGreaterThanOrEqual(35);
    }
  });

  it('los títulos no se repiten entre sí', () => {
    const ts = INDUSTRIAS.map(tituloIndustria);
    expect(new Set(ts).size).toBe(ts.length);
  });

  it('las descripciones caben y no se quedan cortas', () => {
    for (const ind of INDUSTRIAS) {
      const d = descripcionIndustria(ind);
      expect(d.length).toBeLessThanOrEqual(MAX_DESCRIPCION);
      expect(d.length, `${ind.slug}: descripción de ${d.length} caracteres`).toBeGreaterThanOrEqual(70);
      expect(d.endsWith('…')).toBe(false); // nunca una frase partida
    }
  });

  it('las descripciones no se repiten entre sectores', () => {
    const ds = INDUSTRIAS.map(descripcionIndustria);
    expect(new Set(ds).size).toBe(ds.length);
  });

  it('cada hub aporta contenido propio, no una plantilla rellenada', () => {
    for (const ind of INDUSTRIAS) {
      expect(ind.problemas.length).toBeGreaterThanOrEqual(3);
      expect(ind.faqs.length).toBeGreaterThanOrEqual(2);
      expect(ind.intro.length).toBeGreaterThan(150);
      expect(ind.regiones.length).toBeGreaterThanOrEqual(4);
      for (const f of ind.faqs) expect(f.a.length).toBeGreaterThan(80);
    }
  });

  it('el enlace al catálogo filtrado va codificado (las etiquetas llevan tilde)', () => {
    for (const ind of INDUSTRIAS) {
      const href = catalogoHref(ind);
      expect(href.startsWith('/productos?sector=')).toBe(true);
      expect(href).not.toMatch(/[ áéíóúñÁÉÍÓÚÑ]/);
    }
  });

  it('las derivaciones de soluciones y guías no explotan si el sector no tiene ninguna', () => {
    for (const ind of INDUSTRIAS) {
      expect(Array.isArray(solucionesDe(ind))).toBe(true);
      expect(Array.isArray(guiasDe(ind))).toBe(true);
    }
  });
});

/**
 * Señal de fabricante. La tentación es declarar `"@type": ["Organization",
 * "Manufacturer"]`, que suena más fuerte y es vocabulario inventado: los
 * subtipos de Organization en schema.org son Airline, Corporation,
 * LocalBusiness, NGO y una veintena más, y «Manufacturer» no está entre ellos.
 * Un tipo inexistente en el nodo raíz de la empresa no refuerza nada: lo
 * ensucia. Lo que sí está tipado es naics, isicV4 y taxID en Organization, y
 * `manufacturer` como PROPIEDAD de Product.
 */
describe('señal de fabricante en JSON-LD', () => {
  it('la organización declara identificador fiscal y clasificación industrial', async () => {
    const { organizationSchema } = await import('@/lib/schema');
    const { SITE } = await import('@/lib/site');
    const org = organizationSchema();
    expect(org.taxID).toBe(SITE.ruc);
    expect(org.isicV4).toBe(SITE.isicV4);
    expect(org.naics).toBe(SITE.naics);
  });

  it('no se inventa un tipo «Manufacturer» que schema.org no define', async () => {
    const { organizationSchema, localBusinessSchema, productSchema } = await import('@/lib/schema');
    const nodos = [organizationSchema(), localBusinessSchema(), productSchema({
      name: 'x', description: 'y', url: 'https://example.test/x',
    })];
    for (const n of nodos) {
      const tipos = ([] as unknown[]).concat(n['@type'] as never);
      expect(tipos).not.toContain('Manufacturer');
      expect(JSON.stringify(n)).not.toContain('schema.org/Manufacturer');
    }
  });

  it('la fabricación se declara donde schema.org sí la modela: en el producto', async () => {
    const { productSchema } = await import('@/lib/schema');
    const p = productSchema({ name: 'x', description: 'y', url: 'https://example.test/x' });
    expect(p.manufacturer).toBeDefined();
    expect(JSON.stringify(p.manufacturer)).toContain('#business');
  });
});
