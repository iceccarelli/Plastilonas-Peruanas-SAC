import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cunas } from '@/lib/cunas';
import { CUNAS_EN, cunaEsDeEn } from '@/lib/cunas-en';
import {
  MATRIZ,
  COSTO_IMPORTACION,
  NO_NOS_COMPRE,
  NO_NOS_COMPRE_EN,
  FAQS_FABRICAR,
  FAQS_FABRICAR_EN,
  RUTA_ES,
  RUTA_EN,
} from '@/lib/fabricar-o-importar';
import { products } from '@/lib/products';
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

describe('etapa 9 — citabilidad y señal de costo', () => {
  /**
   * Los datos de 2026 sobre citación por motores de respuesta mandan aquí:
   * el 44 % de las citas sale del primer 30 % del contenido, y lo que se
   * recupera son bloques autocontenidos, tablas y fechas de revisión.
   */
  it('cada cuña abre con un bloque citable, antes de la prosa', () => {
    const hub = leer('components/CunaHub.tsx');
    expect(hub).toContain('respuestaDirectaCuna');
    expect(hub).toContain("speakable: ['.respuesta-directa']");
    // La rampa va ANTES de la prosa de introducción, no después.
    expect(hub.indexOf('respuesta-directa text-')).toBeLessThan(hub.indexOf('cuna.intro.map'));
  });

  it('la respuesta directa se compone de campos reales, sin texto libre', () => {
    const src = leer('lib/respuesta-directa.ts');
    expect(src).toContain('export function respuestaDirectaCuna');
    // Se arma con razón social, RUC, año y checklist: nada tecleado a mano.
    for (const campo of ['SITE.legalName', 'SITE.ruc', 'SITE.foundingYear', 'cuna.checklist']) {
      expect(src, `la respuesta directa no deriva de ${campo}`).toContain(campo);
    }
  });

  it('la matriz de comparación tiene UNA implementación', () => {
    const lib = leer('lib/comparativa.ts');
    expect(lib).toContain('export function construirComparativa');
    expect(lib).toContain('No declarado');
    // Ni la página de comparar ni las cuñas la reimplementan.
    for (const f of [
      'app/(es)/productos/familia/[slug]/comparar/page.tsx',
      'components/CunaHub.tsx',
    ]) {
      expect(leer(f), `${f} no usa la matriz común`).toContain('construirComparativa');
    }
  });

  it('la señal de costo declara fecha, respaldo y que no es un pronóstico', () => {
    const src = leer('components/CostoEnVivo.tsx');
    expect(src).toContain('leerIndicadores');
    expect(src).toContain('No es un pronóstico de precio');
    expect(src).toContain('sinConexion');
    // Cada serie explica qué significa para una cotización.
    expect(leer('lib/indicadores.ts')).toContain('export const SIGNIFICADO');
  });

  it('cada cuña declara qué indicadores mueven SU costo', () => {
    for (const c of cunas) {
      expect(c.indicadores.length, c.slug).toBeGreaterThanOrEqual(2);
      // Crudo y tipo de cambio entran en los tres: resina y facturación.
      expect(c.indicadores, c.slug).toContain('PN01660XM');
      expect(c.indicadores, c.slug).toContain('PD04640PD');
    }
  });
});

describe('etapa 10 — el comprador extranjero', () => {
  it('el hub en inglés existe, entra al sitemap y lo enlaza /en', () => {
    expect(() => leer('app/(en)/en/sourcing-from-peru/page.tsx')).not.toThrow();
    const urls = new Set(sitemap().map((e) => e.url));
    expect(urls.has(`${SITE.url}/en/sourcing-from-peru`)).toBe(true);
    expect(leer('app/(en)/en/page.tsx')).toContain('/en/sourcing-from-peru');
  });

  it('NO emite hreflang: no es traducción de ninguna página', () => {
    // El clúster recíproco son tres páginas (/, /en, /pt). Declarar hreflang
    // hacia un destino que no corresponde hace que Google descarte el clúster
    // entero, incluido el caso en que sí corresponde.
    expect(leer('app/(en)/en/sourcing-from-peru/page.tsx')).not.toContain('languages:');
  });

  it('los mercados se declaran UNA vez, en los dos idiomas', () => {
    // Que la página en español y la inglesa afirmen coberturas distintas es el
    // peor defecto posible en una empresa exportadora.
    const lib = leer('lib/exportacion.ts');
    expect(lib).toContain('export const MERCADOS');
    expect(leer('app/(es)/exportacion/page.tsx')).toContain('MERCADOS');
    expect(leer('app/(en)/en/sourcing-from-peru/page.tsx')).toContain('MERCADOS');
    // Y ninguna reimplementa la tabla a mano.
    expect(leer('app/(es)/exportacion/page.tsx')).not.toContain('const MARKETS');
  });

  it('el hub en inglés publica los mismos límites que /confianza', () => {
    const en = leer('app/(en)/en/sourcing-from-peru/page.tsx');
    expect(en).toContain('NO_AFIRMAMOS_EN');
    expect(en).toContain('What we do not claim');
    const lib = leer('lib/exportacion.ts');
    // Los dos límites que un comprador extranjero verifica primero.
    expect(lib).toContain('Worldwide shipping');
    expect(lib).toContain('List prices on made-to-measure lines');
  });

  it('el hub en inglés no promete envío mundial ni publica precios', () => {
    const en = leer('app/(en)/en/sourcing-from-peru/page.tsx');
    // Las dos negaciones explícitas, en las palabras del comprador.
    expect(en).toContain('no automatic worldwide shipping');
    expect(en).toContain('no price list in any currency');
    // Y ninguna cifra monetaria en la página: ni dólares ni soles.
    expect(en).not.toMatch(/US\$\s?\d/);
    expect(en).not.toMatch(/S\/\s?\d/);
  });

  it('el guion de entrega existe y no usa el glob del shell', () => {
    const sh = leer('scripts/aplicar-entrega.sh');
    expect(sh).toContain('git ls-files -z');
    // El glob del shell incluye parches SIN versionar y hace abortar git rm.
    expect(sh).not.toContain('git rm -q -- *.patch');
    expect(sh).toContain('set -euo pipefail');
  });
});

describe('etapa 11 — el camino en inglés se cierra', () => {
  it('el grupo (en) usa su propia cabecera y pie, no los españoles', () => {
    const layout = leer('app/(en)/layout.tsx');
    expect(layout).toContain('HeaderEn');
    expect(layout).toContain('FooterEn');
    expect(layout).not.toContain("from '@/components/Navbar'");
    expect(layout).not.toContain("from '@/components/Footer'");
  });

  it('el pie en inglés repite el NAP EXACTO del sitio en español', () => {
    // Un NAP que cambia entre idiomas rompe el SEO local y la verificación.
    const chrome = leer('components/ChromeEn.tsx');
    expect(chrome).toContain('DIRECCION_COMPLETA');
    expect(chrome).toContain('TELEFONOS');
    expect(chrome).toContain('SITE.ruc');
    // Y no reescribe la dirección a mano.
    expect(chrome).not.toMatch(/Alameda del Remero/);
  });

  it('el marco en inglés avisa de que el catálogo está en español', () => {
    // Decirlo ANTES del clic, no después.
    expect(leer('components/ChromeEn.tsx')).toContain('published in');
  });

  it('el RFQ en inglés reutiliza el MISMO formulario, no uno paralelo', () => {
    const rfq = leer('app/(en)/en/rfq/page.tsx');
    expect(rfq).toContain("from '@/components/CotizacionForm'");
    expect(rfq).toContain('idioma="en"');
    // La lección de CotizacionModal: dos formularios son dos verdades.
    expect(rfq).not.toContain('useForm');
  });

  it('el formulario traduce sin tocar una coma del camino en español', () => {
    const form = leer('components/CotizacionForm.tsx');
    expect(form).toContain("idioma = 'es'");
    // El SLA en español sigue literal, y el inglés dice lo mismo.
    expect(form).toContain(
      'Respondemos en horario comercial en ≤2 horas hábiles con ficha técnica o con las preguntas que falten.',
    );
    expect(form).toContain('≤2 working hours');
    // El placeholder inglés tampoco es un número de la empresa.
    expect(form).not.toContain('946 085 270');
  });

  it('el lead declara su idioma, campo que /api/lead aceptaba y nunca recibía', () => {
    expect(leer('components/CotizacionForm.tsx')).toContain('language: idioma');
    expect(leer('app/api/lead/route.ts')).toContain("language: z.enum(['es', 'en', 'pt'])");
  });

  it('las páginas en inglés están en el sitemap y enlazadas entre sí', () => {
    const urls = new Set(sitemap().map((e) => e.url));
    for (const p of ['/en', '/en/sourcing-from-peru', '/en/rfq']) {
      expect(urls.has(`${SITE.url}${p}`), `${p} falta en el sitemap`).toBe(true);
    }
    expect(leer('app/(en)/en/page.tsx')).toContain('/en/rfq');
    expect(leer('app/(en)/en/sourcing-from-peru/page.tsx')).toContain('/en/rfq');
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

describe('etapa 12 — las tres cuñas hablan inglés', () => {
  it('cada cuña española tiene exactamente una gemela inglesa, y al revés', () => {
    // Biyección. Sin esto, la cuarta cuña nacería coja: española y muda para
    // el comprador extranjero, que es justo a quien esta etapa vino a servir.
    expect(CUNAS_EN).toHaveLength(cunas.length);
    expect(CUNAS_EN.map((c) => c.slugEs).sort()).toEqual(cunas.map((c) => c.slug).sort());
    expect(new Set(CUNAS_EN.map((c) => c.slug)).size).toBe(CUNAS_EN.length);
    // La gemela resuelve a su original sin lanzar.
    for (const c of CUNAS_EN) expect(() => cunaEsDeEn(c), c.slug).not.toThrow();
  });

  it('la gemela inglesa no contradice a su original en ningún dato duro', () => {
    // El contenido se escribe dos veces; los HECHOS se leen una sola. Los
    // productos, la foto y los indicadores del BCRP salen de la cuña
    // española, así que no pueden divergir aunque alguien lo intente.
    for (const c of CUNAS_EN) {
      const es = cunaEsDeEn(c);
      expect(es.productSlugs.length, c.slug).toBeGreaterThan(0);
      // El checklist inglés cubre lo mismo que el español: mismo número de
      // datos exigidos. Un RFQ inglés más corto sería un RFQ peor atendido.
      expect(c.checklist.length, c.slug).toBe(es.checklist.length);
    }
  });

  it('el bloque de honestidad no se suaviza al traducir', () => {
    for (const c of CUNAS_EN) {
      const es = cunaEsDeEn(c);
      expect(c.queHacemos.length, c.slug).toBeGreaterThanOrEqual(2);
      // Lo que NO se afirma nunca puede encoger en el idioma en que el
      // comprador tiene menos forma de verificarlo por su cuenta.
      expect(c.queNoAfirmamos.length, c.slug).toBeGreaterThanOrEqual(es.queNoAfirmamos.length);
      expect(c.faqs.length, c.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it('cada gemela tiene ruta, entra al sitemap y se anuncia en llms.txt', () => {
    const urls = new Set(sitemap().map((e) => e.url));
    const llms = leer('app/llms.txt/route.ts');
    for (const c of CUNAS_EN) {
      expect(() => leer(`app/(en)/en/${c.slug}/page.tsx`), c.slug).not.toThrow();
      expect(urls.has(`${SITE.url}/en/${c.slug}`), `${c.slug} falta en el sitemap`).toBe(true);
      expect(llms, `${c.slug} falta en llms.txt`).toContain(`/en/${c.slug}`);
    }
  });

  it('el hub de compra ya no suelta al comprador en una página que no lee', () => {
    // El defecto que esta etapa vino a cerrar: /en/sourcing-from-peru
    // enlazaba las tres cuñas con la coletilla «(page in Spanish)».
    const hub = leer('app/(en)/en/sourcing-from-peru/page.tsx');
    expect(hub).not.toContain('(page in Spanish)');
    // Las tres salen de la fuente y el enlace se compone: si mañana cambia un
    // slug, cambia solo. Por eso se comprueba el patrón, no tres literales.
    expect(hub).toContain("from '@/lib/cunas-en'");
    expect(hub).toContain('CUNAS_EN.map');
    expect(hub).toContain('href={`/en/${c.slug}`}');
    // Y la portada inglesa también las enlaza.
    const portada = leer('app/(en)/en/page.tsx');
    expect(portada).toContain('CUNAS_EN.map');
    expect(portada).toContain('href={`/en/${c.slug}`}');
    // El pie inglés les da peso interno desde todas las páginas del grupo.
    expect(leer('components/ChromeEn.tsx')).toContain('ENLACES_CUNAS_EN');
  });

  it('la plantilla inglesa reusa el catálogo, no lo reescribe', () => {
    const tpl = leer('components/CunaHubEn.tsx');
    expect(tpl).toContain('cunaEsDeEn');
    expect(tpl).toContain("from '@/lib/products'");
    expect(tpl).toContain('sourcingLabelsEn');
    // Canal declarado: el formulario que contesta en inglés (etapa 11).
    expect(tpl).toContain("serviceUrl: `${SITE.url}/en/rfq`");
    expect(tpl).toContain("availableLanguage: ['en', 'es-PE']");
    // Y avisa del idioma de la ficha ANTES del clic, no después.
    expect(tpl).toContain('Open datasheet (in Spanish)');
  });

  it('el aviso de foto referencial sobrevive a la traducción', () => {
    // /confianza promete no publicar obra ejecutada. Una etiqueta que sólo
    // existe en español convierte la misma foto en un caso de éxito implícito
    // para el lector inglés.
    const foto = leer('components/FotoReferencial.tsx');
    expect(foto).toContain('does not document a project delivered');
    expect(leer('components/CunaHubEn.tsx')).toContain('idioma="en"');
  });

  it('la franja de costo se traduce con su separador decimal', () => {
    // «79,99» leído por un comprador anglosajón es 7 999. El formato numérico
    // no es cosmética en una página donde se decide una compra.
    const costo = leer('components/CostoEnVivo.tsx');
    expect(costo).toContain('numeroEN');
    expect(costo).toContain('SIGNIFICADO_EN');
    expect(costo).toContain('SERIE_EN');
    expect(leer('lib/format.ts')).toContain('export function numeroEN');
  });

  it('las etiquetas de origen inglesas cubren todos los modos del catálogo', () => {
    const modos = new Set(products.map((p) => p.sourcing).filter(Boolean) as string[]);
    const src = leer('lib/products.ts');
    const bloque = src.slice(src.indexOf('sourcingLabelsEn'));
    for (const m of modos) {
      expect(bloque.slice(0, 400), `sourcingLabelsEn no traduce «${m}»`).toContain(m);
    }
  });

  it('ninguna página inglesa inventa un teléfono ni una cobertura mundial', () => {
    for (const c of CUNAS_EN) {
      const texto = [...c.intro, ...c.queHacemos, ...c.queNoAfirmamos, ...c.faqs.map((f) => f.a)].join(' ');
      expect(texto.toLowerCase(), c.slug).not.toContain('worldwide shipping to');
      expect(texto, c.slug).not.toMatch(/ISO\s?9001/);
      expect(texto, c.slug).not.toMatch(/998\s?117\s?065|946\s?085\s?270/);
    }
  });
});

describe('etapa 13 — fabricar en Lima o importar', () => {
  it('la matriz reconoce que la importación gana algunas filas', () => {
    /**
     * EL CRITERIO DE SALIDA MÁS IMPORTANTE DE ESTA ETAPA. Si ninguna fila la
     * gana la importación, la tabla no es una comparación: es publicidad con
     * forma de tabla, nadie la cita y el comprador la descarta en diez
     * segundos. Se exige al menos dos, y que la fila del precio unitario a
     * volumen —la que el comprador ya sabe— sea una de ellas.
     */
    const importar = MATRIZ.filter((f) => f.gana === 'importar');
    expect(importar.length, 'una comparación sin derrotas no es una comparación').toBeGreaterThanOrEqual(2);
    expect(MATRIZ.length).toBeGreaterThanOrEqual(8);
    const precio = MATRIZ.find((f) => /precio unitario/i.test(f.criterio));
    expect(precio?.gana, 'la fila del precio a volumen no puede darse por ganada').toBe('importar');
    /**
     * Y la concesión no puede ser sólo la obvia. Conceder el precio y nada más
     * es la concesión que hace todo el mundo; lo que hace citable a esta tabla
     * es admitir también disponibilidad, variedad de configuraciones y
     * certificación propia de producto —que es justo lo que /confianza declara
     * que esta empresa NO emite—.
     */
    expect(
      importar.filter((f) => !/precio unitario/i.test(f.criterio)).length,
      'conceder sólo el precio es la concesión de todos: no distingue',
    ).toBeGreaterThanOrEqual(2);
    expect(importar.some((f) => /certificaci/i.test(f.criterio))).toBe(true);
  });

  it('el recuento de la tabla se deriva de la tabla, no se escribe a mano', () => {
    // La primera versión afirmaba «tres de las diez» con una sola fila
    // concedida. Lo detectó una prueba, no una lectura. Ahora el número sale
    // del dato y no puede volver a mentir.
    const tpl = leer('components/FabricarOImportar.tsx');
    expect(tpl).toContain('t.pmatriz(MATRIZ.length, ganaImportar)');
    expect(tpl).not.toMatch(/tres de las diez|three of the ten/i);
  });

  it('cada fila está escrita en los dos idiomas', () => {
    // Una fila a medio traducir en la tabla que más se cita es peor que
    // ninguna tabla.
    for (const f of MATRIZ) {
      for (const campo of ['criterio', 'importar', 'fabricar'] as const) {
        expect(f[campo].length, `${f.criterio}.${campo}`).toBeGreaterThan(10);
        expect(f[`${campo}En` as const].length, `${f.criterio}.${campo}En`).toBeGreaterThan(10);
      }
    }
  });

  it('no se inventa la tasa de ninguna subpartida', () => {
    /**
     * Los rangos oficiales de SUNAT (0/6/11 ad valorem, IGV 16, IPM 2,
     * percepción 3,5/5/10) SÍ se publican, con su fuente. Lo prohibido es
     * atribuirle una tasa a una partida concreta —«los big bags pagan 6 %»—,
     * que es el dato que este repositorio no puede verificar y que quedaría
     * obsoleto sin que nadie se entere.
     */
    const texto = [
      ...COSTO_IMPORTACION.flatMap((c) => [c.detalle, c.detalleEn]),
      ...FAQS_FABRICAR.map((f) => f.a),
      ...FAQS_FABRICAR_EN.map((f) => f.a),
    ].join(' ');
    expect(texto).not.toMatch(/\b6305[.\d]*\s*(paga|pays|es del|is)\b/i);
    expect(texto).not.toMatch(/(big bags?|bulk bags?)[^.]{0,40}\b(pagan?|pays?)\b[^.]{0,20}%/i);
    // Y se dice de quién es la última palabra.
    expect(texto).toMatch(/SUNAT/);
    expect(texto.toLowerCase()).toMatch(/agente de aduana|customs broker/);
  });

  it('el bloque «cuándo NO nos compre» existe en los dos idiomas y no se suaviza', () => {
    expect(NO_NOS_COMPRE.length).toBeGreaterThanOrEqual(3);
    expect(NO_NOS_COMPRE_EN.length).toBe(NO_NOS_COMPRE.length);
    // La concesión concreta —a volumen, importar gana en precio unitario—
    // tiene que estar escrita, no insinuada.
    expect(NO_NOS_COMPRE.join(' ')).toMatch(/precio unitario/i);
    expect(NO_NOS_COMPRE_EN.join(' ')).toMatch(/unit price/i);
  });

  it('el par se publica, entra al sitemap y se anuncia a las máquinas', () => {
    const urls = new Set(sitemap().map((e) => e.url));
    for (const [ruta, archivo] of [
      [RUTA_ES, 'app/(es)/fabricar-o-importar/page.tsx'],
      [RUTA_EN, 'app/(en)/en/manufacture-in-peru-or-import/page.tsx'],
    ] as const) {
      expect(() => leer(archivo), archivo).not.toThrow();
      expect(urls.has(`${SITE.url}${ruta}`), `${ruta} falta en el sitemap`).toBe(true);
      expect(leer('app/llms.txt/route.ts'), `${ruta} falta en llms.txt`).toContain(ruta);
    }
  });

  it('una sola plantilla sirve los dos idiomas', () => {
    // Dos plantillas serían dos verdades, y esta página afirma cosas que nos
    // perjudican: el día que una de las dos las suavizara, el argumento entero
    // se cae. La lección la pagó CotizacionModal.
    const tpl = leer('components/FabricarOImportar.tsx');
    expect(tpl).toContain("idioma }: { idioma: 'es' | 'en' }");
    expect(leer('app/(es)/fabricar-o-importar/page.tsx')).toContain('idioma="es"');
    expect(leer('app/(en)/en/manufacture-in-peru-or-import/page.tsx')).toContain('idioma="en"');
    // El RFQ de cada idioma va al formulario de ese idioma (etapa 11).
    expect(tpl).toContain("rfq: '/cotizacion'");
    expect(tpl).toContain("rfq: '/en/rfq'");
  });

  it('la página se enlaza donde se decide, no sólo desde el sitemap', () => {
    for (const f of ['components/CunaHub.tsx', 'app/(en)/en/sourcing-from-peru/page.tsx']) {
      expect(leer(f), `${f} no enlaza la decisión de abastecimiento`).toContain('fabricar-o-importar');
    }
    expect(leer('components/CunaHubEn.tsx')).toContain('RUTA_EN');
  });
});
