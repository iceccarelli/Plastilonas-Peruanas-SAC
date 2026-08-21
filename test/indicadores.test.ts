import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseValor, periodoAIso, ultimasLecturas, urlSerie, type SerieBCRP } from '@/lib/bcrp';
import { SERIES, SERIE_TIPO_CAMBIO, RESPALDO, PORQUE, leerIndicadores } from '@/lib/indicadores';
import { informes } from '@/lib/informes';

/**
 * Una integración "en vivo" falla siempre por lo mismo: qué hace cuando el
 * dato llega mal. Estos tests ejercitan exactamente esos caminos, porque el
 * camino feliz se prueba solo el día que funciona.
 */

const serieFalsa: SerieBCRP = {
  codigo: 'X', etiqueta: 'x', unidad: 'u', rango: [10, 100], decimales: 2,
};

describe('BCRP: interpretación de la respuesta', () => {
  it('"n.d." es ausencia de dato, no cero', () => {
    // Fines de semana y feriados vienen así en las series diarias. Leerlo como
    // cero haría caer el tipo de cambio a cero cada sábado.
    expect(parseValor('n.d.')).toBeNull();
    expect(parseValor('N.D.')).toBeNull();
    expect(parseValor('nd')).toBeNull();
    expect(parseValor('')).toBeNull();
    expect(parseValor(null)).toBeNull();
    expect(parseValor('3.372')).toBe(3.372);
  });

  it('convierte los periodos del BCRP a fecha ISO', () => {
    expect(periodoAIso('Jul.2026')).toBe('2026-07');
    expect(periodoAIso('Ene.2026')).toBe('2026-01');
    expect(periodoAIso('20.Ago.26')).toBe('2026-08-20');
    // Preferimos no fechar a fechar mal.
    expect(periodoAIso('vaya usted a saber')).toBeNull();
  });

  it('toma la última lectura válida, saltando los huecos', () => {
    const r = { periods: [
      { name: 'A', values: ['50'] },
      { name: 'B', values: ['60'] },
      { name: 'C', values: ['n.d.'] },
    ] };
    expect(ultimasLecturas(r, [serieFalsa])).toEqual([
      { codigo: 'X', periodo: 'B', valor: 60 },
    ]);
  });

  it('descarta valores fuera del rango plausible y cae al anterior', () => {
    // Una API que devuelve basura no es una hipótesis: pasa. Y publicar basura
    // con nuestro nombre encima destruye lo que todo el sitio construyó.
    const r = { periods: [
      { name: 'A', values: ['50'] },
      { name: 'B', values: ['999999'] },
    ] };
    expect(ultimasLecturas(r, [serieFalsa])).toEqual([
      { codigo: 'X', periodo: 'A', valor: 50 },
    ]);
  });

  it('devuelve la serie vacía si ningún valor es utilizable', () => {
    const r = { periods: [{ name: 'A', values: ['n.d.'] }, { name: 'B', values: ['0'] }] };
    expect(ultimasLecturas(r, [serieFalsa])).toEqual([]);
  });

  it('reparte las columnas en el orden declarado al pedir varias series', () => {
    const otra: SerieBCRP = { ...serieFalsa, codigo: 'Y' };
    const r = { periods: [{ name: 'A', values: ['20', '80'] }] };
    expect(ultimasLecturas(r, [serieFalsa, otra])).toEqual([
      { codigo: 'X', periodo: 'A', valor: 20 },
      { codigo: 'Y', periodo: 'A', valor: 80 },
    ]);
  });

  it('arma la URL con los códigos unidos por guion', () => {
    expect(urlSerie(['A', 'B'], '2026-1', '2026-8')).toBe(
      'https://estadisticas.bcrp.gob.pe/estadisticas/series/api/A-B/json/2026-1/2026-8/esp',
    );
  });
});

describe('indicadores: falla cerrada', () => {
  it('sin red, sirve el respaldo y lo declara como tal', async () => {
    // Se fuerza el fallo sustituyendo fetch: es el escenario que importa.
    const original = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new Error('sin red');
    }) as typeof fetch;
    try {
      const estado = await leerIndicadores(new Date('2026-08-20T12:00:00Z'));
      expect(estado.sinConexion).toBe(true);
      expect(estado.indicadores.length).toBe(SERIES.length + 1);
      for (const i of estado.indicadores) {
        expect(i.deRespaldo, i.serie.codigo).toBe(true);
        // Y aun así cada uno trae su periodo: el dato viejo se muestra fechado.
        expect(i.periodo.length, i.serie.codigo).toBeGreaterThan(0);
      }
    } finally {
      globalThis.fetch = original;
    }
  }, 20000);

  it('una respuesta 200 con forma inesperada se trata como fallo', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ mensaje: 'hola' }), { status: 200 })) as typeof fetch;
    try {
      const estado = await leerIndicadores(new Date('2026-08-20T12:00:00Z'));
      expect(estado.sinConexion).toBe(true);
    } finally {
      globalThis.fetch = original;
    }
  }, 20000);

  it('el respaldo cubre todas las series y con valores plausibles', () => {
    const todas = [SERIE_TIPO_CAMBIO, ...SERIES];
    for (const s of todas) {
      const fria = RESPALDO.lecturas.find((l) => l.codigo === s.codigo);
      expect(fria, `falta respaldo de ${s.codigo}`).toBeDefined();
      expect(fria!.valor, s.codigo).toBeGreaterThan(s.rango[0]);
      expect(fria!.valor, s.codigo).toBeLessThan(s.rango[1]);
    }
  });

  it('el respaldo declara cuándo se verificó', () => {
    expect(RESPALDO.verificado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const hoy = new Date().toISOString().slice(0, 10);
    expect(RESPALDO.verificado <= hoy).toBe(true);
  });
});

describe('indicadores: cada número explica por qué importa', () => {
  it('toda serie declara qué decide en una cotización', () => {
    // Un número grande sin explicación al lado es decoración, no información.
    for (const s of [SERIE_TIPO_CAMBIO, ...SERIES]) {
      const p = PORQUE[s.codigo];
      expect(p, `falta el porqué de ${s.codigo}`).toBeDefined();
      expect(p.texto.length).toBeGreaterThan(80);
    }
  });

  it('cada indicador enlaza a un informe que existe', () => {
    const slugs = new Set(informes.map((i) => i.slug));
    for (const [codigo, p] of Object.entries(PORQUE)) {
      expect(slugs.has(p.informe), `${codigo} → ${p.informe}`).toBe(true);
    }
  });

  it('el rango plausible de cada serie es estrecho y con sentido', () => {
    for (const s of [SERIE_TIPO_CAMBIO, ...SERIES]) {
      expect(s.rango[0], s.codigo).toBeGreaterThan(0);
      expect(s.rango[1], s.codigo).toBeGreaterThan(s.rango[0]);
      // Un rango de cero a infinito no valida nada.
      expect(s.rango[1] / s.rango[0], s.codigo).toBeLessThan(200);
    }
  });
});

describe('indicadores: el cliente no puede tumbar el sitio', () => {
  const src = readFileSync(join(process.cwd(), 'lib/bcrp.ts'), 'utf8');

  it('la consulta nunca lanza', () => {
    expect(src).toMatch(/catch \{\s*\n\s*return null;/);
  });

  it('la petición lleva tiempo límite', () => {
    // Sin esto, una API lenta cuelga la compilación entera.
    expect(src).toMatch(/AbortController/);
    expect(src).toMatch(/timeoutMs/);
  });
});
