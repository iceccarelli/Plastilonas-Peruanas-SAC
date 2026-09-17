import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  products,
  PRODUCTOS_PRIORITARIOS,
  productosPrioritarios,
  esProductoPrioritario,
} from '@/lib/products';
import { GET as llmsTxt } from '@/app/llms.txt/route';
import { GET as aiTxt } from '@/app/ai.txt/route';
import { buildCatalogoJson } from '@/lib/catalogo-feed';

/**
 * LAS CUATRO LÍNEAS PRIORITARIAS SON UN CONTRATO, NO UNA LISTA SUELTA.
 *
 * `lib/products.ts#PRODUCTOS_PRIORITARIOS` es la única fuente: portada, mega
 * menú, ficha de producto, chatbot y superficies para agentes derivan de
 * ella. Estas pruebas comprueban que la lista es válida en sí misma (slugs
 * reales, sin duplicados, orden determinístico) y que las superficies que
 * dicen consumirla la consumen de verdad.
 */

const raiz = process.cwd();
const leer = (rel: string) => readFileSync(join(raiz, rel), 'utf8');
const textoLlms = async () => (await llmsTxt()).text();
const textoAi = async () => (await aiTxt()).text();

describe('PRODUCTOS_PRIORITARIOS: la lista en sí misma', () => {
  it('declara exactamente las cuatro líneas comerciales de foco', () => {
    expect(PRODUCTOS_PRIORITARIOS).toHaveLength(4);
  });

  it('cada slug prioritario existe de verdad en el catálogo', () => {
    for (const pp of PRODUCTOS_PRIORITARIOS) {
      const producto = products.find((p) => p.slug === pp.slug);
      expect(producto, `slug prioritario sin ficha: ${pp.slug}`).toBeDefined();
    }
  });

  it('no hay slugs duplicados', () => {
    const slugs = PRODUCTOS_PRIORITARIOS.map((pp) => pp.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('el orden es único y determinístico (1..N sin huecos)', () => {
    const ordenes = [...PRODUCTOS_PRIORITARIOS.map((pp) => pp.orden)].sort((a, b) => a - b);
    expect(ordenes).toEqual([1, 2, 3, 4]);
  });

  it('productosPrioritarios() resuelve contra el catálogo real y respeta el orden', () => {
    const resueltos = productosPrioritarios();
    expect(resueltos).toHaveLength(4);
    for (let i = 1; i < resueltos.length; i++) {
      expect(resueltos[i].orden).toBeGreaterThan(resueltos[i - 1].orden);
    }
    for (const r of resueltos) {
      const producto = products.find((p) => p.slug === r.slug);
      expect(r.name).toBe(producto?.name);
      expect(r.availability).toBe(producto?.availability);
    }
  });

  it('esProductoPrioritario distingue las cuatro líneas del resto del catálogo', () => {
    for (const pp of PRODUCTOS_PRIORITARIOS) {
      expect(esProductoPrioritario(pp.slug)).toBe(true);
    }
    const noPrioritario = products.find((p) => !PRODUCTOS_PRIORITARIOS.some((pp) => pp.slug === p.slug));
    expect(noPrioritario).toBeDefined();
    expect(esProductoPrioritario(noPrioritario!.slug)).toBe(false);
  });

  it('ninguna posicionamiento afirma inventario perpetuo ("siempre en stock")', () => {
    for (const pp of PRODUCTOS_PRIORITARIOS) {
      expect(pp.posicionamiento.toLowerCase()).not.toMatch(/siempre en stock/);
    }
  });
});

describe('las cuatro líneas aparecen en la portada', () => {
  it('la portada importa y renderiza productosPrioritarios()', () => {
    const portada = leer('app/(es)/page.tsx');
    expect(portada).toContain('productosPrioritarios');
    expect(portada).toContain('prioritarios.map');
  });
});

describe('las cuatro líneas son first-class en la navegación', () => {
  it('el mega menú y el menú móvil consumen productosPrioritarios()', () => {
    const navbar = leer('components/Navbar.tsx');
    const ocurrencias = navbar.split('productosPrioritarios()').length - 1;
    expect(ocurrencias).toBeGreaterThanOrEqual(2);
  });
});

describe('las cuatro líneas están en las superficies para agentes', () => {
  it('/llms.txt referencia las cuatro URLs canónicas', async () => {
    const cuerpo = await textoLlms();
    expect(cuerpo).toContain('Productos prioritarios');
    for (const pp of PRODUCTOS_PRIORITARIOS) {
      expect(cuerpo).toContain(`/productos/${pp.slug}`);
    }
  });

  it('/ai.txt referencia las cuatro URLs canónicas', async () => {
    const cuerpo = await textoAi();
    expect(cuerpo).toContain('Productos prioritarios');
    for (const pp of PRODUCTOS_PRIORITARIOS) {
      expect(cuerpo).toContain(`/productos/${pp.slug}`);
    }
  });

  it('/productos/catalogo.json publica la lista y marca cada producto', () => {
    const json = JSON.parse(buildCatalogoJson());
    expect(json.productosPrioritarios).toHaveLength(4);
    const slugs = json.productosPrioritarios.map((p: { slug: string }) => p.slug);
    for (const pp of PRODUCTOS_PRIORITARIOS) expect(slugs).toContain(pp.slug);

    for (const pp of PRODUCTOS_PRIORITARIOS) {
      const entry = json.dataset.find((d: { slug: string }) => d.slug === pp.slug);
      expect(entry.prioridadComercial).toBe(pp.orden);
    }
  });
});

describe('las cuatro líneas están en el contexto de recomendación del chatbot', () => {
  it('el prompt del asistente incluye la lista de productos prioritarios', () => {
    const rutaApi = leer('app/api/chat/route.ts');
    expect(rutaApi).toContain('PRODUCTOS PRIORITARIOS');
    expect(rutaApi).toContain('productosPrioritarios');
  });

  it('los cuatro chips de inicio del widget nombran las cuatro líneas', () => {
    const intents = leer('lib/chat/intents.ts');
    expect(intents).toContain('Mantas cobertoras');
    expect(intents).toContain('Mallas antiáfidas para granos');
    expect(intents).toContain('Mangas de ventilación');
    expect(intents).toContain('Carpas y techos con lonas');
  });
});
