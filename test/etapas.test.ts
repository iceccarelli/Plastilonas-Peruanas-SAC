import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cunas } from '@/lib/cunas';
import { STATS, FABRICACION_PROPIA_COUNT } from '@/lib/facts';
import sitemap from '@/lib/sitemaps';
import { SITE } from '@/lib/site';

/**
 * Criterios de salida de las etapas 0–3 del encargo de descubribilidad,
 * fijados como pruebas para que una edición futura no los deshaga sin
 * enterarse. Cada aserción corresponde a un «Exit» del plan.
 */

const raiz = process.cwd();
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

describe('etapa 0 — constantes únicas', () => {
  it('las cifras 18/36/11/17 derivan del dato, no del teclado', () => {
    expect(STATS.fabricacionPropia).toBe(FABRICACION_PROPIA_COUNT);
    expect(STATS.productos).toBeGreaterThan(30);
    expect(STATS.familias).toBe(11);
    expect(STATS.anios).toBe(new Date().getFullYear() - Number(SITE.foundingYear));
  });

  it('ningún componente vuelve a escribir un teléfono a mano', () => {
    for (const f of ['components/Navbar.tsx', 'components/Footer.tsx', 'app/(es)/contacto/page.tsx']) {
      const src = leer(f);
      expect(src, `${f} lleva un número a mano`).not.toMatch(/998\s?117\s?065|946\s?085\s?270/);
    }
  });
});

describe('etapa 1 — descubribilidad', () => {
  it('no se emite <meta name="keywords"> en ninguna metadata', () => {
    for (const f of [
      'app/(es)/layout.tsx',
      'app/(es)/productos/[slug]/page.tsx',
      'app/(es)/recursos/[slug]/page.tsx',
      'app/(es)/glosario/[slug]/page.tsx',
    ]) {
      const src = leer(f);
      // `keywords:` dentro de JSON-LD (articleSchema) es otra cosa y se permite.
      expect(src, f).not.toMatch(/^\s{2,4}keywords: \[/m);
    }
  });

  it('la ficha de producto usa la plantilla «a medida en Perú»', () => {
    expect(leer('app/(es)/productos/[slug]/page.tsx')).toContain(
      'a medida en Perú | Plastilonas Peruanas SAC',
    );
  });

  it('el sitemap declara lastmod con más de una fecha distinta', () => {
    const fechas = new Set(sitemap().map((e) => e.lastModified.toISOString().slice(0, 10)));
    expect(fechas.size).toBeGreaterThan(3);
  });

  it('el índice de sitemaps y sus cuatro secciones existen como rutas', () => {
    for (const p of [
      'app/sitemap.xml/route.ts',
      'app/sitemaps/pages.xml/route.ts',
      'app/sitemaps/productos.xml/route.ts',
      'app/sitemaps/industrias.xml/route.ts',
      'app/sitemaps/recursos.xml/route.ts',
    ]) {
      expect(() => leer(p), p).not.toThrow();
    }
  });
});

describe('etapa 2 — alcanzabilidad', () => {
  it('la portada sirve el H1 estático y la copia de soporte literal', () => {
    const home = leer('app/(es)/page.tsx');
    expect(home).toContain('Fabricamos en Chorrillos desde 2009. Cotización con ficha técnica.');
    expect(home).toContain('Diga producto, medidas y ciudad. Respondemos en horario L–V 8:00–18:00.');
    expect(home).not.toContain('CountUp');
  });

  it('no hay «Iniciar sesión» público ni carrito sin bandera', () => {
    const nav = leer('components/Navbar.tsx');
    expect(nav).not.toContain('Iniciar sesión');
    expect(nav).toContain('CART_ENABLED');
    expect(leer('app/(es)/layout.tsx')).toContain('CART_ENABLED && <CartDrawer');
  });

  it('el formulario de RFQ pide ciudad, fecha es-PE y adjuntos con límites', () => {
    const form = leer('components/CotizacionForm.tsx');
    expect(form).toContain('ciudadEntrega');
    expect(form).toContain('type="date"');
    expect(form).toContain('.pdf,.jpg,.jpeg,.png,.dwg,.dxf');
    expect(form).toContain('20 * 1024 * 1024');
    expect(form).toContain(
      'Respondemos en horario comercial en ≤2 horas hábiles con ficha técnica o con las preguntas que falten.',
    );
    // El placeholder del teléfono no puede ser el número de la empresa.
    expect(form).not.toContain('998 117 065');
  });

  it('los eventos del embudo se llaman rfq_start / rfq_submit / whatsapp_click', () => {
    const analytics = leer('lib/analytics.ts');
    expect(analytics).toContain("trackEvent('rfq_start'");
    expect(analytics).toContain("trackEvent('rfq_submit'");
    expect(analytics).toContain("trackEvent('whatsapp_click'");
    expect(analytics).not.toContain("trackEvent('quote_started'");
  });
});

describe('etapa 8 — aceleración', () => {
  it('el hero es next/image con prioridad y una sola descarga', () => {
    const hero = leer('components/HeroImagen.tsx');
    expect(hero).toContain("from 'next/image'");
    expect(hero).toContain('priority');
    // El sorteo de foto al montar descargaba una SEGUNDA imagen de ~150 KB
    // por visita y movía el elemento LCP después de la hidratación.
    expect(hero).not.toContain('Math.random');
  });

  it('el formulario de RFQ no arrastra el catálogo al navegador', () => {
    const form = leer('components/CotizacionForm.tsx');
    // 92 KB de fuente —descripciones, specs, galerías— para llenar un <select>
    // que solo necesita slug y nombre.
    expect(form).not.toContain("from '@/lib/products'");
    expect(form).toContain('opciones');
  });

  it('el RFQ entrega acuse de recibo y sobrevive a un bloqueador de ventanas', () => {
    const form = leer('components/CotizacionForm.tsx');
    expect(form).toContain('rfqId');
    expect(form).toContain('acuse');
    expect(leer('lib/whatsapp.ts')).toContain('export function openWhatsApp(message: string): boolean');
    expect(leer('lib/lead.ts')).toContain('LeadResultado');
  });

  it('no queda un segundo formulario de cotización divergente', () => {
    // El modal no tenía ciudad de entrega, ni SLA, ni adjuntos, y llevaba el
    // teléfono de la empresa como placeholder. Dos formularios son dos verdades.
    expect(() => leer('components/CotizacionModal.tsx')).toThrow();
  });

  it('las tres cuñas reciben enlaces internos desde el pie y las fichas', () => {
    expect(leer('components/Footer.tsx')).toContain('ENLACES_CUNAS');
    expect(leer('app/(es)/productos/[slug]/page.tsx')).toContain('cunaDeProducto');
    expect(leer('app/(es)/local/[ciudad]/page.tsx')).toContain('ENLACES_CUNAS');
  });

  it('cada cuña declara un Service de alcance nacional, no de una ciudad', () => {
    const hub = leer('components/CunaHub.tsx');
    expect(hub).toContain("'@type': 'Service'");
    expect(hub).toContain("areaServed: { '@type': 'Country', name: 'Perú' }");
  });
});

describe('etapa 3 — las tres cuñas', () => {
  it('cada cuña tiene página, entra al sitemap y aparece en llms.txt', () => {
    const urls = new Set(sitemap().map((e) => e.url));
    const llms = leer('app/llms.txt/route.ts');
    for (const c of cunas) {
      expect(() => leer(`app/(es)/${c.slug}/page.tsx`), c.slug).not.toThrow();
      expect(urls.has(`${SITE.url}/${c.slug}`), `${c.slug} falta en el sitemap`).toBe(true);
      expect(llms, `${c.slug} falta en llms.txt`).toContain(`/${c.slug}`);
    }
  });

  it('cada cuña declara su honestidad hacemos/no-afirmamos y su checklist', () => {
    for (const c of cunas) {
      expect(c.queHacemos.length, c.slug).toBeGreaterThanOrEqual(2);
      expect(c.queNoAfirmamos.length, c.slug).toBeGreaterThanOrEqual(2);
      expect(c.checklist.length, c.slug).toBeGreaterThanOrEqual(4);
      expect(c.faqs.length, c.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it('el 404 ofrece búsqueda, WhatsApp y los tres frentes', () => {
    const nf = leer('app/(es)/not-found.tsx');
    expect(nf).toContain('role="search"');
    expect(nf).toContain('WhatsAppLink');
    expect(nf).toContain('cunas');
  });
});
