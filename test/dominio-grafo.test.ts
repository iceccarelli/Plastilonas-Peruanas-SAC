import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

/**
 * EL GRAFO ENTERO SE MUEVE CON UNA VARIABLE — y el mapa legado apunta a rutas reales.
 *
 * Con el host canónico en www, ninguna superficie de descubrimiento (robots,
 * sitemaps, llms.txt, ai.txt, entidad.json, JSON-LD) puede nombrar el host de
 * Vercel; con la variable vacía, ninguna puede nombrar www.
 */
const WWW = 'https://www.plastilonas.com';
const VERCEL = 'https://plastilonas-peruanas-sac.vercel.app';

async function superficies() {
  vi.resetModules();
  const [{ default: robots }, sitemaps, llms, ai, entidad, schema, indice] = await Promise.all([
    import('../app/robots'),
    import('../lib/sitemaps'),
    import('../app/llms.txt/route'),
    import('../app/ai.txt/route'),
    import('../app/entidad.json/route'),
    import('../lib/schema'),
    import('../app/sitemap.xml/route'),
  ]);
  const r = robots();
  const cuerpo = async (res: Response) => res.text();
  return {
    robots: JSON.stringify(r),
    indice: await cuerpo(await indice.GET()),
    paginas: sitemaps.xmlDeSeccion('pages' as never),
    productos: sitemaps.xmlDeSeccion('productos' as never),
    llms: await cuerpo(await llms.GET()),
    ai: await cuerpo(await ai.GET()),
    entidad: await cuerpo(await entidad.GET()),
    org: JSON.stringify(schema.organizationSchema()),
    web: JSON.stringify(
      schema.webPageSchema({ name: 'x', description: 'y', path: '/productos/mantas-cobertoras' } as never),
    ),
  };
}

describe('grafo de descubrimiento con el canónico en www', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_CANONICAL_HOST', WWW);
  });
  afterEach(() => vi.unstubAllEnvs());

  it('ninguna superficie nombra el host de Vercel y todas nombran www', async () => {
    const s = await superficies();
    for (const [nombre, texto] of Object.entries(s)) {
      expect(texto, nombre).not.toContain(VERCEL);
      expect(texto, nombre).toContain(WWW);
    }
  });

  it('robots declara Sitemap y Host sobre www', async () => {
    const s = await superficies();
    expect(s.robots).toContain(`${WWW}/sitemap.xml`);
  });

  it('el sitemap lista URLs absolutas https sobre www, sin parámetros', async () => {
    const s = await superficies();
    const locs = [...s.productos.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(10);
    for (const l of locs) {
      expect(l.startsWith(`${WWW}/`), l).toBe(true);
      expect(l).not.toMatch(/[?#]/);
    }
  });
});

describe('grafo con la mudanza pendiente (producción hoy)', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('nada nombra www como origen: el host vigente sigue siendo Vercel', async () => {
    vi.stubEnv('NEXT_PUBLIC_CANONICAL_HOST', '');
    vi.stubEnv('CANONICAL_ORIGIN', '');
    const s = await superficies();
    for (const [nombre, texto] of Object.entries({ robots: s.robots, indice: s.indice, productos: s.productos, entidad: s.entidad, org: s.org })) {
      expect(texto, nombre).toContain(VERCEL);
      expect(texto, nombre).not.toContain(`${WWW}/`);
    }
  });
  it('un apex mal configurado NO mueve el grafo', async () => {
    vi.stubEnv('NEXT_PUBLIC_CANONICAL_HOST', 'https://plastilonas.com');
    const s = await superficies();
    expect(s.indice).toContain(VERCEL);
    expect(s.indice).not.toContain('https://plastilonas.com/');
  });
});

describe('mapa del sitio antiguo (redirecciones legadas)', () => {
  it('cada redirección es permanente, relativa, sin cadenas ni bucles, y apunta a una ruta que existe', async () => {
    const { default: cfg } = await import('../next.config');
    const reglas = (await cfg.redirects!()) as { source: string; destination: string; permanent: boolean }[];
    const { products } = await import('../lib/products');
    const { INDUSTRIAS } = await import('../lib/industrias');
    const slugsProducto = new Set(products.map((p) => p.slug));
    const slugsIndustria = new Set(INDUSTRIAS.map((i) => i.slug));
    const fuentes = new Set(reglas.map((r) => r.source));

    const legado = reglas.filter((r) => r.source.startsWith('/default/') || r.source === '/index.html');
    expect(legado.length).toBeGreaterThanOrEqual(11);

    for (const r of reglas) {
      expect(r.permanent, r.source).toBe(true);
      expect(r.destination.startsWith('/'), r.source).toBe(true); // conserva el host canónico
      expect(r.destination, r.source).not.toBe(r.source);
      expect(fuentes.has(r.destination), `${r.source} → ${r.destination} forma una cadena`).toBe(false);
      const p = r.destination.match(/^\/productos\/([^/]+)$/);
      if (p) expect(slugsProducto.has(p[1]), `${r.source}: producto ${p[1]} no existe`).toBe(true);
      const i = r.destination.match(/^\/industria\/([^/]+)$/);
      if (i) expect(slugsIndustria.has(i[1]), `${r.source}: industria ${i[1]} no existe`).toBe(true);
    }
  });

  it('las páginas antiguas con una ficha equivalente NO caen en la portada ni en el listado genérico', async () => {
    const { default: cfg } = await import('../next.config');
    const reglas = (await cfg.redirects!()) as { source: string; destination: string }[];
    const finas = reglas.filter((r) => /^\/default\/[^:*]+\.html$/.test(r.source));
    const genericos = finas.filter((r) => r.destination === '/' || r.destination === '/productos');
    expect(genericos).toEqual([]);
  });
});
