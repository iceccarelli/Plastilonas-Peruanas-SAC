import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE } from '@/lib/site';
import { guides } from '@/lib/guides';
import { applications } from '@/lib/applications';
import { INDUSTRIAS } from '@/lib/industrias';
import { projects, projectsPublicados } from '@/lib/projects';
import { GET as llms } from '@/app/llms.txt/route';
import sitemap from '@/app/sitemap';

/**
 * SI NO ESTÁ DECLARADO, NO EXISTE.
 *
 * Este sitio se escribe para dos lectores: una persona que busca y un agente
 * que lee. La persona llega por el menú; el agente llega por tres archivos —
 * sitemap.xml, llms.txt y el grafo JSON-LD— y solo ve lo que esos tres
 * declaran. Una sección publicada y no declarada es una sección que, para el
 * segundo lector, no se construyó.
 *
 * Y pasó. Se publicaron trece plantillas nuevas —biblioteca, aplicaciones,
 * hubs sectoriales, exportación, compradores, calidad, confianza, compras,
 * socios, distribuidores, configurador, proyectos— y llms.txt siguió
 * anunciando el sitio anterior. El menú las enlazaba, el sitemap casi todas,
 * y el archivo que existe precisamente para decirle a un agente qué contiene
 * este sitio no mencionaba ninguna.
 *
 * El fallo no fue olvidarse: fue que olvidarse no rompía nada. Ahora rompe.
 */

const raiz = process.cwd();

/**
 * Rutas de primer nivel que NO deben anunciarse, con el motivo. Cada exclusión
 * es una decisión, no un descuido: por eso lleva su razón escrita al lado.
 */
const NO_PUBLICAS: Record<string, string> = {
  api: 'endpoints, no páginas',
  carrito: 'estado del comprador, no contenido',
  checkout: 'estado del comprador, no contenido',
  dashboard: 'tras autenticación',
  login: 'tras autenticación',
  en: 'se anuncia por hreflang desde la portada, no como sección',
  pt: 'se anuncia por hreflang desde la portada, no como sección',
  privacidad: 'aviso legal: va en el sitemap, no en el mapa para agentes',
  terminos: 'aviso legal: va en el sitemap, no en el mapa para agentes',
};

function seccionesPublicas(): string[] {
  return readdirSync(join(raiz, 'app'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('[') && !e.name.startsWith('_'))
    .map((e) => e.name)
    .filter((n) => existsSync(join(raiz, 'app', n, 'page.tsx')))
    .filter((n) => !(n in NO_PUBLICAS))
    .sort();
}

async function textoLlms(): Promise<string> {
  return await (await llms()).text();
}

describe('llms.txt anuncia el sitio que existe', () => {
  it('menciona cada sección pública de primer nivel', async () => {
    const texto = await textoLlms();
    const ausentes = seccionesPublicas().filter((s) => !texto.includes(`${SITE.url}/${s}`));
    expect(
      ausentes,
      'secciones publicadas que llms.txt no anuncia; declárelas o añádalas a NO_PUBLICAS con su motivo',
    ).toEqual([]);
  });

  it('menciona cada guía de la biblioteca y cada hub de aplicación', async () => {
    const texto = await textoLlms();
    const ausentes = [
      ...guides.map((g) => `/biblioteca/${g.slug}`),
      ...applications.map((a) => `/aplicaciones/${a.slug}`),
      ...INDUSTRIAS.map((i) => `/industria/${i.slug}`),
    ].filter((r) => !texto.includes(`${SITE.url}${r}`));
    expect(ausentes).toEqual([]);
  });

  it('publica la lista de datos que pedimos para cotizar, no un FAQ inventado', async () => {
    const texto = await textoLlms();
    // Son preguntas SIN respuesta publicada: la respuesta depende del proyecto
    // de quien pregunta. Si algún día se emiten como FAQPage habrá que
    // inventarles respuesta, y ahí empieza la ficción.
    for (const g of guides) expect(texto).toContain(g.questions[0]);
    for (const a of applications) expect(texto).toContain(a.questions[0]);
  });

  it('publica lo que cada aplicación NO afirma', async () => {
    const texto = await textoLlms();
    for (const a of applications) {
      expect(a.notClaimed.length, `${a.slug} no declara límites`).toBeGreaterThan(0);
      for (const l of a.notClaimed) expect(texto).toContain(l);
    }
  });

  it('declara los límites, no sólo la oferta', async () => {
    const texto = (await textoLlms()).replace(/\s+/g, ' ');
    /**
     * Se comprueba la PRESENCIA de los desmentidos, no la ausencia de
     * palabras. Buscar "ISO" y romper el build es inservible: el sitio cita
     * normas ajenas con toda legitimidad —ISO 21898 la exige el puerto del
     * Callao, y decirlo informa—. Lo que importa es que estos cuatro
     * desmentidos sigan escritos, porque son lo que impide que un agente
     * rellene el hueco con lo que suele ser cierto en el rubro.
     */
    for (const desmentido of [
      'NO operamos un e-commerce mundial',
      'no declaramos ISO, ASTM, CE ni UL propias',
      'no atribuya a esta empresa obras, clientes ni referencias',
      'NINGUNA es fotografía de una obra ejecutada',
    ]) {
      expect(texto, `llms.txt dejó de declarar: ${desmentido}`).toContain(desmentido);
    }
  });

  it('el conteo de casos de obra sale de los datos, no de una cifra escrita', async () => {
    const texto = (await textoLlms()).replace(/\s+/g, ' ');
    // Cinco fichas redactadas, ninguna confirmada. El día que se confirme una,
    // este texto tiene que cambiar solo.
    expect(texto).toContain(
      `Hay ${projects.length} fichas de proyecto redactadas y ${projectsPublicados.length} publicadas`,
    );
  });
});

describe('el sitemap declara lo mismo que el sitio publica', () => {
  const urls = new Set(sitemap().map((e) => e.url));

  it('incluye cada sección pública de primer nivel', () => {
    const ausentes = seccionesPublicas().filter((s) => !urls.has(`${SITE.url}/${s}`));
    expect(ausentes).toEqual([]);
  });

  it('incluye cada guía y cada aplicación, derivadas de su fuente', () => {
    const ausentes = [
      ...guides.map((g) => `${SITE.url}/biblioteca/${g.slug}`),
      ...applications.map((a) => `${SITE.url}/aplicaciones/${a.slug}`),
    ].filter((u) => !urls.has(u));
    expect(ausentes, 'derive el sitemap de lib/, no de una lista escrita a mano').toEqual([]);
  });

  it('incluye las dos páginas de idioma, que es donde apunta el hreflang', () => {
    expect(urls.has(`${SITE.url}/en`)).toBe(true);
    expect(urls.has(`${SITE.url}/pt`)).toBe(true);
  });
});

describe('hreflang: un clúster recíproco y pequeño', () => {
  const PAGINAS = ['app/page.tsx', 'app/en/page.tsx', 'app/pt/page.tsx'];

  it('las tres páginas de entrada se declaran entre sí', () => {
    for (const p of PAGINAS) {
      const src = readFileSync(join(raiz, p), 'utf8');
      expect(src, `${p} no declara alternates.languages`).toContain('languages: ALTERNOS');
      for (const clave of ["'es-PE': '/'", "en: '/en'", "'pt-BR': '/pt'", "'x-default': '/'"]) {
        expect(src, `${p} no declara ${clave}`).toContain(clave);
      }
    }
  });

  it('ninguna otra página emite hreflang', () => {
    /**
     * /en y /pt son una página de identidad y RFQ por idioma, no una
     * traducción del catálogo. Declarar hreflang en una ficha de producto
     * apuntaría a una portada en inglés que no la traduce, y Google descarta
     * el clúster entero cuando el destino no corresponde: se perdería también
     * el caso en que sí corresponde.
     */
    const culpables: string[] = [];
    const recorrer = (dir: string) => {
      for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
        const rel = `${dir}/${e.name}`;
        if (e.isDirectory()) recorrer(rel);
        else if (e.name === 'page.tsx' && !PAGINAS.includes(rel)) {
          if (/languages\s*:/.test(readFileSync(join(raiz, rel), 'utf8'))) culpables.push(rel);
        }
      }
    };
    recorrer('app');
    expect(culpables).toEqual([]);
  });

  it('las páginas en otro idioma lo declaran en el marcado', () => {
    // El <html> del sitio dice lang="es". Sin un lang propio, el inglés de
    // /en se indexa como español y un lector de pantalla lo pronuncia así.
    expect(readFileSync(join(raiz, 'app/en/page.tsx'), 'utf8')).toContain('lang="en"');
    expect(readFileSync(join(raiz, 'app/pt/page.tsx'), 'utf8')).toContain('lang="pt-BR"');
  });
});
