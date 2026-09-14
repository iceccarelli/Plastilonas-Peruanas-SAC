import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { superficiesDeDatos, bloqueApi, REGLAS, LO_QUE_EJECUTA, RUTA_INTEGRACIONES } from '@/lib/integraciones';
import { SUPERFICIES_INDEXABLES } from '@/lib/superficies-maquina';
import { webApiSchema } from '@/lib/schema';
import { HERRAMIENTAS_MCP } from '@/lib/api-publica';

/**
 * LA PUERTA DE LOS PROGRAMAS Y LOS AGENTES.
 *
 * El comprador de este rubro ya no busca sólo con los ojos: pregunta a un
 * asistente, y su empresa carga catálogos en un ERP. `/integraciones` existe
 * para esos dos, y tiene una tentación evidente: prometer capacidades que
 * todavía no responden. Estas pruebas la cierran.
 */

const raiz = process.cwd();
const leer = (rel: string) => readFileSync(join(raiz, rel), 'utf8');
const anterior = process.env.NEXT_PUBLIC_API_URL;

beforeEach(() => { delete process.env.NEXT_PUBLIC_API_URL; });
afterEach(() => {
  if (anterior === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = anterior;
});

describe('la página existe y no cuelga de nada', () => {
  it('la plantilla está donde dice la ruta canónica', () => {
    expect(RUTA_INTEGRACIONES).toBe('/integraciones');
    expect(existsSync(join(raiz, 'app/(es)/integraciones/page.tsx'))).toBe(true);
  });

  it('está enlazada desde el pie, en el sitemap y en las dos superficies de texto', () => {
    // Una página que sólo existe en el sitemap es una página que nadie visita
    // y que ningún agente encuentra navegando.
    expect(leer('components/Footer.tsx')).toContain("href: '/integraciones'");
    expect(leer('lib/sitemaps.ts')).toContain('RUTA_INTEGRACIONES');
    expect(leer('app/llms.txt/route.ts')).toContain('/integraciones');
    expect(leer('app/ai.txt/route.ts')).toContain('/integraciones');
  });
});

describe('lo que la página promete es lo que el sitio publica', () => {
  it('describe TODAS las superficies indexables, ninguna más y ninguna menos', () => {
    /**
     * La lista no se escribe a mano: se deriva de `SUPERFICIES_INDEXABLES`, la
     * misma que alimenta el sitemap y robots.txt. Publicar una novena superficie
     * y olvidarse de describirla aquí es entonces imposible.
     */
    const rutas = superficiesDeDatos().map((s) => s.ruta);
    expect(rutas).toEqual([...SUPERFICIES_INDEXABLES]);
    for (const s of superficiesDeDatos()) {
      expect(s.que, `${s.ruta} sin descripción`).not.toBe('');
      expect(s.paraQue, `${s.ruta} sin motivo`).not.toBe('');
    }
  });

  it('cada superficie descrita se sirve de verdad', () => {
    // Prometer un JSON que devuelve 404 es peor que no prometerlo.
    for (const { ruta } of superficiesDeDatos()) {
      const enGrupo = `app/(es)${ruta}/route.ts`;
      const enRaiz = `app${ruta}/route.ts`;
      expect(
        existsSync(join(raiz, enGrupo)) || existsSync(join(raiz, enRaiz)),
        `no hay manejador para ${ruta}`,
      ).toBe(true);
    }
  });
});

describe('no se promete un servicio que todavía no responde', () => {
  it('sin la variable de entorno no hay bloque ejecutable', () => {
    expect(bloqueApi()).toBeNull();
  });

  it('con ella, los ejemplos apuntan al origen declarado', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://plastilonas-api.fly.dev';
    const api = bloqueApi();
    expect(api?.mcp).toBe('https://plastilonas-api.fly.dev/mcp');
    expect(api?.ejemploCurl).toContain('https://plastilonas-api.fly.dev/v1/calculos/geomembrana-poza');
    expect(api?.ejemploMcp).toContain('tools/list');
    expect(api?.herramientas).toEqual(HERRAMIENTAS_MCP);
  });

  it('el nodo WebAPI del grafo sólo se emite con la API declarada', () => {
    // Declarar en el grafo de la empresa un servicio que devuelve un error es
    // la misma mentira que declararlo en /ai.txt, indexada.
    const pagina = leer('app/(es)/integraciones/page.tsx');
    expect(pagina).toContain('...(api');
    expect(pagina).toContain('webApiSchema');
  });
});

describe('el nodo WebAPI usa tipos que schema.org define', () => {
  it('es WebAPI, cuelga de la organización y declara sus puntos de entrada', () => {
    const nodo = webApiSchema({
      url: 'https://sitio/integraciones',
      origen: 'https://api',
      documentacion: 'https://api/openapi.json',
      mcp: 'https://api/mcp',
      nombre: 'x',
      descripcion: 'y',
      herramientas: [{ nombre: 'h', paraQue: 'z' }],
    }) as Record<string, unknown>;

    expect(nodo['@type'], 'WebAPI es subtipo de Service y existe; inventar un tipo ensucia el grafo').toBe('WebAPI');
    expect(nodo.provider).toBeTruthy();
    expect(nodo.isAccessibleForFree).toBe(true);
    const acciones = nodo.potentialAction as { target: { urlTemplate: string; httpMethod: string } }[];
    expect(acciones).toHaveLength(2);
    expect(acciones.map((a) => a.target.httpMethod).sort()).toEqual(['GET', 'POST']);
    expect(acciones.some((a) => a.target.urlTemplate === 'https://api/mcp')).toBe(true);
  });

  it('no inventa AggregateRating, Review ni Offer con precio', () => {
    const texto = JSON.stringify(
      webApiSchema({
        url: 'u', origen: 'o', documentacion: 'd', mcp: 'm', nombre: 'n', descripcion: 'x',
        herramientas: [],
      }),
    );
    for (const prohibido of ['aggregateRating', 'review', 'price', 'offers']) {
      expect(texto.toLowerCase(), `el nodo no puede declarar ${prohibido}`).not.toContain(prohibido.toLowerCase());
    }
  });
});

describe('las reglas que limitan lo que se dice viajan con la página', () => {
  it('las tres están escritas, y la primera es que no hay precios', () => {
    expect(REGLAS).toHaveLength(3);
    expect(REGLAS[0]!.regla).toMatch(/[Ss]in precios/);
    for (const r of REGLAS) expect(r.porque.length, `«${r.regla}» sin motivo`).toBeGreaterThan(60);
  });

  it('la página publica la advertencia de predimensionamiento', () => {
    // Sin ella, un integrador puede tomar el número por un cálculo de ingeniería.
    const p = leer('app/(es)/integraciones/page.tsx');
    expect(p).toContain('predimensionamiento');
    expect(p).toMatch(/no autorizan a construir/);
  });

  it('nada de lo que la página promete ejecutar incluye un precio', () => {
    const texto = JSON.stringify(LO_QUE_EJECUTA);
    expect(texto.toLowerCase()).not.toMatch(/\bprecio|\bcosto|\btarifa/);
  });
});
