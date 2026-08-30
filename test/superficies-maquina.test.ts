import { describe, it, expect } from 'vitest';
import { GET as mapaConsultas } from '@/app/mapa-consultas.json/route';
import { GET as llmsFull } from '@/app/llms-full.txt/route';
import { GET as espejoProducto } from '@/app/(es)/productos/[slug]/contenido.md/route';
import { GET as llms } from '@/app/llms.txt/route';
import { SITE } from '@/lib/site';
import { products } from '@/lib/products';
import { clusters, TOTAL_TERMINOS } from '@/lib/search/topic-map';
import { productoMarkdown, corpusCompleto } from '@/lib/markdown-espejo';

/**
 * LAS SUPERFICIES PARA MÁQUINAS TIENEN QUE CUMPLIR DOS COSAS A LA VEZ, Y SON
 * CONTRARIAS.
 *
 * 1. Ser legibles: texto plano, CORS abierto, sin marcado, con las URLs
 *    absolutas para que un agente que copia el contenido a su índice conserve
 *    de dónde salió.
 * 2. NO ser indexables: son el mismo texto que las páginas HTML. Dos copias
 *    del mismo contenido compitiendo en el índice se restan, y si el buscador
 *    elige la copia en .md el usuario aterriza en un archivo de texto en vez
 *    de en la página que cotiza.
 *
 * Las dos se declaran explícitamente —`X-Robots-Tag` y `Link: rel="canonical"`—
 * porque dejarlas a la interpretación del rastreador es exactamente cómo se
 * pierde tráfico sin que nadie sepa por qué. Estas pruebas comprueban que
 * siguen declaradas, que es lo que se olvida al refactorizar una cabecera.
 */

async function texto(res: Response): Promise<string> {
  return await res.text();
}

describe('/mapa-consultas.json', () => {
  it('responde 200 con JSON y CORS abierto', async () => {
    const res = await mapaConsultas();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('SÍ es indexable: es contenido propio, no una copia de otra página', async () => {
    const res = await mapaConsultas();
    expect(res.headers.get('X-Robots-Tag')).toBe('all');
  });

  it('declara una canónica absoluta por clúster, y ninguna repetida', async () => {
    const doc = JSON.parse(await texto(await mapaConsultas()));
    expect(doc.clusters.length).toBe(clusters.length);
    const canonicas = doc.clusters.map((c: { canonica: string }) => c.canonica);
    expect(new Set(canonicas).size).toBe(canonicas.length);
    for (const c of canonicas) expect(c.startsWith(`${SITE.url}/`)).toBe(true);
  });

  it('trae la entidad con RUC: un agente que lo copie no pierde de quién es', async () => {
    const doc = JSON.parse(await texto(await mapaConsultas()));
    expect(doc.entidad.ruc).toBe(SITE.ruc);
    expect(doc.entidad.nombre).toBe(SITE.legalName);
  });

  it('el total de términos coincide con el mapa vivo', async () => {
    const doc = JSON.parse(await texto(await mapaConsultas()));
    expect(doc.totales.terminos).toBe(TOTAL_TERMINOS);
  });
});

describe('/llms-full.txt', () => {
  it('responde 200 en texto plano', async () => {
    const res = await llmsFull();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
  });

  it('NO es indexable y apunta su canónica al índice curado', async () => {
    const res = await llmsFull();
    expect(res.headers.get('X-Robots-Tag')).toContain('noindex');
    expect(res.headers.get('Link')).toBe(`<${SITE.url}/llms.txt>; rel="canonical"`);
  });

  it('contiene el catálogo entero, no una muestra', async () => {
    const cuerpo = await texto(await llmsFull());
    const ausentes = products.filter((p) => !cuerpo.includes(p.name)).map((p) => p.slug);
    expect(ausentes).toEqual([]);
  });

  it('repite los límites declarados: son contenido, no pie de página', async () => {
    const cuerpo = (await texto(await llmsFull())).replace(/\s+/g, ' ');
    for (const limite of [
      'NO operamos un e-commerce mundial',
      'no declaramos ISO, ASTM, CE ni UL propias',
      'NINGUNA es fotografía de una obra ejecutada',
    ]) {
      expect(cuerpo, `el corpus dejó de declarar: ${limite}`).toContain(limite);
    }
  });

  it('no publica precio ni plazo, porque el catálogo no los tiene', () => {
    const cuerpo = corpusCompleto();
    expect(/precio de lista/i.test(cuerpo)).toBe(true); // lo NIEGA explícitamente
    expect(/S\/\s?\d/.test(cuerpo), 'apareció un precio en soles en el corpus').toBe(false);
    expect(/USD\s?\d/.test(cuerpo), 'apareció un precio en dólares en el corpus').toBe(false);
  });
});

describe('espejos en Markdown de las fichas de producto', () => {
  const slug = 'big-bags-bolsones-polipropileno';

  it('responde 200 como text/markdown', async () => {
    const res = await espejoProducto(new Request('http://x'), { params: Promise.resolve({ slug }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/markdown');
  });

  it('NO es indexable y su canónica es la ficha HTML', async () => {
    const res = await espejoProducto(new Request('http://x'), { params: Promise.resolve({ slug }) });
    expect(res.headers.get('X-Robots-Tag')).toContain('noindex');
    expect(res.headers.get('Link')).toBe(`<${SITE.url}/productos/${slug}>; rel="canonical"`);
  });

  it('un slug inexistente devuelve 404, no una página en blanco', async () => {
    const res = await espejoProducto(new Request('http://x'), {
      params: Promise.resolve({ slug: 'producto-que-no-existe' }),
    });
    expect(res.status).toBe(404);
  });

  it('CADA producto del catálogo genera un espejo con sus especificaciones', () => {
    const rotos: string[] = [];
    for (const p of products) {
      const md = productoMarkdown(p);
      if (!md.includes(p.name)) rotos.push(`${p.slug}: sin nombre`);
      if (!md.includes(`${SITE.url}/productos/${p.slug}`)) rotos.push(`${p.slug}: sin canónica`);
      if (!md.includes('## Hechos citables')) rotos.push(`${p.slug}: sin bloque de citación`);
      if (p.specifications.length && !md.includes(p.specifications[0].label)) {
        rotos.push(`${p.slug}: sin especificaciones`);
      }
    }
    expect(rotos).toEqual([]);
  });

  it('el bloque de hechos citables lleva RUC, ubicación y fecha de verificación', () => {
    const md = productoMarkdown(products.find((p) => p.slug === slug)!);
    expect(md).toContain(SITE.ruc);
    expect(md).toContain(SITE.addressLocality);
    expect(md).toMatch(/verificado \d{4}-\d{2}-\d{2}/);
  });

  it('no filtra a la ficha los conteos internos del sitio', () => {
    const md = productoMarkdown(products.find((p) => p.slug === slug)!);
    expect(md).not.toContain('clusters-consulta');
  });
});

describe('/llms.txt anuncia el mapa de consultas antes que el catálogo', () => {
  it('la sección del mapa aparece ANTES de la del catálogo', async () => {
    const cuerpo = await texto(await llms());
    const iMapa = cuerpo.indexOf('## Mapa de consultas comerciales');
    const iCatalogo = cuerpo.indexOf('## Catálogo (');
    expect(iMapa, 'llms.txt dejó de declarar el mapa de consultas').toBeGreaterThan(-1);
    expect(iCatalogo).toBeGreaterThan(-1);
    expect(
      iMapa,
      'el mapa va antes: un agente decide con la tabla, no leyendo las 36 fichas',
    ).toBeLessThan(iCatalogo);
  });

  it('cada clúster aparece con su canónica absoluta', async () => {
    const cuerpo = await texto(await llms());
    const ausentes = clusters
      .filter((c) => !cuerpo.includes(`${SITE.url}${c.canonica}`))
      .map((c) => c.id);
    expect(ausentes).toEqual([]);
  });

  /**
   * PRESUPUESTO DE TAMAÑO — un índice que no cabe deja de ser un índice.
   *
   * La primera versión del bloque del mapa volcaba en llms.txt las 647
   * variantes, las 155 preguntas y todos los apoyos de cada clúster: 58 KB, que
   * llevaban el archivo de 56 a 113 KB. Varios clientes truncan estos ficheros
   * por tamaño, así que el bloque añadido al principio se comía justo el
   * catálogo que venía a introducir. El detalle vive ahora en
   * /mapa-consultas.json, que se pide cuando hace falta.
   */
  it('el bloque del mapa no se come el archivo', async () => {
    const cuerpo = await texto(await llms());
    const i = cuerpo.indexOf('## Mapa de consultas comerciales');
    const j = cuerpo.indexOf('## Catálogo (');
    const kbMapa = Buffer.byteLength(cuerpo.slice(i, j), 'utf8') / 1024;
    const kbTotal = Buffer.byteLength(cuerpo, 'utf8') / 1024;
    expect(kbMapa, `el bloque del mapa pesa ${kbMapa.toFixed(0)} KB: mueva el detalle a /mapa-consultas.json`).toBeLessThan(20);
    expect(kbTotal, `llms.txt pesa ${kbTotal.toFixed(0)} KB y varios agentes lo truncarían`).toBeLessThan(90);
  });

  it('anuncia las dos superficies nuevas para máquinas', async () => {
    const cuerpo = await texto(await llms());
    expect(cuerpo).toContain(`${SITE.url}/mapa-consultas.json`);
    expect(cuerpo).toContain(`${SITE.url}/llms-full.txt`);
  });
});
