import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { bloqueAiTxt, bloqueLlmsTxt, apiPublica, HERRAMIENTAS_MCP, RECURSOS_MCP, INSTRUCCIONES_MCP } from '@/lib/api-publica';

/**
 * LA API PÚBLICA Y EL SERVIDOR MCP.
 *
 * `servicio/` expone como REST y como herramientas de agente lo que este sitio
 * ya publica: el catálogo, los cinco cálculos de predimensionamiento y el buzón
 * de cotizaciones. Se despliega en Fly.io, aparte de Vercel.
 *
 * Dos cosas pueden estropear eso, y ninguna daría la cara en el build:
 *
 *   1. ANUNCIAR LO QUE NO RESPONDE. Un agente que lee en /ai.txt que existe un
 *      servidor MCP, lo llama y recibe un error, aprende que esta empresa
 *      promete cosas que no cumple. El anuncio está detrás de una variable de
 *      entorno por eso, y estas pruebas lo mantienen ahí.
 *   2. QUE EL ANUNCIO Y EL SERVICIO SE SEPAREN. Publicar cinco herramientas y
 *      servir cuatro es la misma clase de mentira, más difícil de ver. Aquí se
 *      comparan los nombres anunciados contra los que registra el servicio.
 */

const raiz = process.cwd();
const leer = (rel: string) => readFileSync(join(raiz, rel), 'utf8');
const anterior = process.env.NEXT_PUBLIC_API_URL;

beforeEach(() => { delete process.env.NEXT_PUBLIC_API_URL; });
afterEach(() => {
  if (anterior === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = anterior;
});

describe('no se anuncia una API que todavía no responde', () => {
  it('sin la variable de entorno, ni /ai.txt ni /llms.txt la mencionan', () => {
    expect(apiPublica()).toBeNull();
    expect(bloqueAiTxt()).toBe('');
    expect(bloqueLlmsTxt()).toBe('');
  });

  it('un origen sin https no se anuncia', () => {
    // Un agente que sigue un http:// acaba en un aviso del navegador, y eso
    // vale menos que no anunciar nada.
    process.env.NEXT_PUBLIC_API_URL = 'http://plastilonas-api.fly.dev';
    expect(apiPublica()).toBeNull();
  });

  it('un valor que no es una URL no tumba la superficie', () => {
    // /ai.txt lo sirve una ruta estática: una excepción aquí deja al sitio sin
    // política de citación para agentes.
    process.env.NEXT_PUBLIC_API_URL = 'esto no es una url';
    expect(() => bloqueAiTxt()).not.toThrow();
    expect(bloqueAiTxt()).toBe('');
  });
});

describe('cuando sí responde, se anuncia con sus reglas', () => {
  beforeEach(() => { process.env.NEXT_PUBLIC_API_URL = 'https://plastilonas-api.fly.dev'; });

  it('anuncia las tres primitivas, no sólo las herramientas', () => {
    const txt = bloqueAiTxt();
    expect(txt).toMatch(/Herramientas \(las invoca el modelo\)/);
    expect(txt).toMatch(/Recursos \(los lee el cliente/);
    expect(txt).toMatch(/Instrucciones \(las elige la persona/);
    expect(txt).toContain('plastilonas://limites');
    expect(bloqueLlmsTxt()).toContain('instrucciones:');
  });

  it('publica el MCP, el contrato OpenAPI y la consola', () => {
    const api = apiPublica();
    expect(api?.mcp).toBe('https://plastilonas-api.fly.dev/mcp');
    expect(api?.openapi).toBe('https://plastilonas-api.fly.dev/openapi.json');
    const txt = bloqueAiTxt();
    expect(txt).toContain('/mcp');
    expect(txt).toContain('/openapi.json');
  });

  it('el anuncio repite las tres reglas que sostienen la confianza', () => {
    const txt = bloqueAiTxt();
    expect(txt, 'la API no devuelve precios y hay que decirlo donde el agente lo lea').toMatch(/NO devuelve precios/);
    expect(txt, 'el número sin sus límites se usa fuera de ellos').toMatch(/limites/);
    expect(txt, 'un RFQ se registra con consentimiento explícito, no de oficio').toMatch(
      /consentimiento expl[ií]cito de la persona/,
    );
  });

  it('una barra final de más no produce URLs con doble barra', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://plastilonas-api.fly.dev/';
    expect(apiPublica()?.mcp).toBe('https://plastilonas-api.fly.dev/mcp');
  });
});

describe('el anuncio y el servicio no se separan', () => {
  it('las herramientas anunciadas son exactamente las que el servicio registra', () => {
    const fuente = leer('servicio/src/mcp.ts');
    const registradas = [...fuente.matchAll(/^\s{4}name: '([a-z_]+)',$/gm)].map((m) => m[1]).sort();
    const anunciadas = HERRAMIENTAS_MCP.map((h) => h.nombre).sort();
    expect(registradas.length, 'no se encontraron herramientas en servicio/src/mcp.ts').toBeGreaterThan(0);
    expect(anunciadas).toEqual(registradas);
  });

  it('los recursos anunciados son exactamente los que el servicio sirve', () => {
    /**
     * Anunciar en /ai.txt un recurso que el servidor no tiene enseña a los
     * agentes que esta empresa promete cosas que no cumple — que es el único
     * activo que aquí no se puede reponer.
     */
    const fuente = leer('servicio/src/recursos.ts');
    const fijos = [...fuente.matchAll(/^\s{4}uri: '(plastilonas:\/\/[^']+)',$/gm)].map((m) => m[1]!);
    const plantillas = [...fuente.matchAll(/uriTemplate: '(plastilonas:\/\/[^']+)'/g)].map((m) => m[1]!);
    expect(fijos.length, 'no se encontraron recursos en servicio/src/recursos.ts').toBeGreaterThan(0);
    expect(RECURSOS_MCP.map((r) => r.nombre).sort()).toEqual([...fijos, ...plantillas].sort());
  });

  it('las instrucciones anunciadas son exactamente las que el servicio construye', () => {
    const fuente = leer('servicio/src/instrucciones.ts');
    const registradas = [...fuente.matchAll(/^\s{4}name: '([a-z-]+)',$/gm)].map((m) => m[1]!).sort();
    expect(registradas.length, 'no se encontraron instrucciones').toBeGreaterThan(0);
    expect(INSTRUCCIONES_MCP.map((i) => i.nombre).sort()).toEqual(registradas);
  });

  it('el recurso de límites se anuncia primero y con el motivo delante', () => {
    // Un cliente que adjunta «el primero» tiene que adjuntar el que evita que
    // el modelo invente una certificación.
    expect(RECURSOS_MCP[0]!.nombre).toBe('plastilonas://limites');
    expect(RECURSOS_MCP[0]!.paraQue).toMatch(/NO afirma/);
  });
});

describe('el servicio respeta las mismas reglas que el sitio', () => {
  it('no reimplementa el cálculo: importa el módulo del sitio', () => {
    /**
     * Una segunda implementación de la misma fórmula es la forma más cara de
     * equivocarse: los dos números existen, los dos parecen correctos y nadie
     * sabe cuál se cotizó.
     */
    expect(leer('servicio/src/calculos.ts')).toContain("from '../../lib/calculadoras'");
  });

  it('ninguna superficie del servicio contiene un importe', () => {
    /**
     * La regla no es «no escriba la palabra precio» —la API la escribe a
     * propósito, para decir que no los da—: es que no aparezca un IMPORTE. Un
     * número con moneda delante o detrás es una promesa que esta empresa no
     * puede sostener sin conocer material, medidas, cantidad, destino e
     * Incoterm, y una vez publicada la repite cualquier agente.
     */
    const importe = /(?:US\$|USD|S\/\.?|EUR|€|\$)\s?\d|\d\s?(?:soles|d[oó]lares|USD|EUR)\b/i;
    const culpables: string[] = [];
    for (const archivo of ['calculos.ts', 'cotizaciones.ts', 'mcp.ts', 'rutas.ts', 'contrato.ts', 'openapi.ts', 'consola.ts']) {
      const rel = `servicio/src/${archivo}`;
      leer(rel).split('\n').forEach((linea, i) => {
        if (importe.test(linea)) culpables.push(`${rel}:${i + 1}`);
      });
    }
    expect(culpables, 'esta API no publica importes').toEqual([]);
  });

  it('las cuatro superficies públicas dicen que no hay precios', () => {
    // Decirlo una vez no basta: quien integra lee el OpenAPI, quien usa un
    // agente lee las instrucciones MCP, y quien entra por el navegador lee la
    // consola. El que no lo lea lo va a preguntar por correo.
    expect(leer('servicio/src/openapi.ts')).toMatch(/NO DEVUELVE: precios/);
    expect(leer('servicio/src/mcp.ts')).toMatch(/NO devuelve precios/);
    expect(leer('servicio/src/consola.ts')).toMatch(/No devuelve/);
    expect(leer('servicio/src/contrato.ts')).toMatch(/no publica precios/);
  });

  it('el servicio tiene su propio gate y corre antes de desplegar', () => {
    // El sitio se protege con scripts/aplicar-entrega.sh; el servicio se
    // despliega por otra vía y necesita el suyo. Vive en el Dockerfile: si tsc
    // falla o una prueba se pone en rojo, la imagen no se construye.
    const docker = leer('servicio/Dockerfile');
    // La FORMA exacta del gate —patrón de archivos, comprobación del
    // ejecutable— la fija test/despliegue-servicio.test.ts, que es su sitio.
    // Aquí sólo se exige que exista: compilar y probar antes de publicar.
    expect(docker).toMatch(/npm run build/);
    expect(docker).toMatch(/node --test/);
    expect(existsSync(join(raiz, 'servicio/fly.toml'))).toBe(true);
    expect(existsSync(join(raiz, 'servicio/test/api.test.ts'))).toBe(true);
  });

  it('el servicio no se typechequea ni se lintea con las reglas del sitio', () => {
    // Es un servidor HTTP sin React: `next/core-web-vitals` no aplica, y el
    // tsconfig del sitio compila para el navegador.
    expect(JSON.parse(leer('tsconfig.json')).exclude).toContain('servicio');
    expect(leer('eslint.config.mjs')).toContain("'servicio/**'");
  });
});
