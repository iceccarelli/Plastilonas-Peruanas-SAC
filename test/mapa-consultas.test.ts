import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  clusters,
  terminosDe,
  normalizar,
  clusterDeRuta,
  clusterDeTermino,
  rielPara,
  afinidadEntre,
  familiaDe,
  UMBRAL_RIEL,
  TOTAL_TERMINOS,
  TOTAL_PREGUNTAS,
  intenciones,
} from '@/lib/search/topic-map';
import { products, productFamilies } from '@/lib/products';
import { INDUSTRIAS } from '@/lib/industrias';

/**
 * DOS PÁGINAS QUE COMPITEN POR EL MISMO TÉRMINO NO SUMAN: SE RESTAN.
 *
 * Este sitio publica 203 URLs sobre un rubro estrecho. «Geomembrana» aparece
 * en la familia, en cuatro fichas, en una guía, en una calculadora, en dos
 * términos de glosario y en un artículo. Todas esas páginas son buenas y todas
 * deben existir. Lo que no puede pasar es que ninguna DECIDA ser la que
 * contesta «geomembranas Perú», porque entonces decide el buscador, y con ocho
 * candidatas parecidas reparte la señal y no posiciona ninguna.
 *
 * data/topic-map.json es esa decisión, escrita. Estas pruebas comprueban que
 * la decisión sigue siendo coherente después de cada cambio del catálogo:
 * que ningún término tiene dos dueños, que ninguna canónica tiene dos
 * clústeres, que toda ruta citada existe de verdad, y que ningún producto,
 * familia o sector se queda fuera del mapa el día que se añada.
 *
 * LO QUE ESTA PRUEBA NO PERMITE, y es deliberado: que el mapa crezca
 * inventando rutas. Un término nuevo se cubre con una página que ya existe o
 * no se cubre. La alternativa —una página por término— es exactamente la
 * granja de páginas delgadas que Google lleva veinte años penalizando.
 */

const raiz = process.cwd();

/** ¿Existe esta ruta en app/, contando plantillas dinámicas? */
function rutaExiste(ruta: string): boolean {
  const partes = ruta.replace(/^\//, '').split('/').filter(Boolean);
  if (partes.length === 0) return existsSync(join(raiz, 'app/(es)/page.tsx'));

  // Ruta literal (el grupo (es) no aparece en la URL).
  if (existsSync(join(raiz, 'app', ...partes, 'page.tsx'))) return true;
  if (existsSync(join(raiz, 'app', '(es)', ...partes, 'page.tsx'))) return true;

  // Plantilla dinámica: /productos/foo → app/(es)/productos/[slug]/page.tsx, y el
  // slug tiene que existir además en su fuente de verdad.
  const dinamicas: Record<string, { plantilla: string; slugs: string[] }> = {
    productos: {
      plantilla: 'app/(es)/productos/[slug]/page.tsx',
      slugs: products.map((p) => p.slug),
    },
    industria: {
      plantilla: 'app/(es)/industria/[sector]/page.tsx',
      slugs: INDUSTRIAS.map((i) => i.slug),
    },
  };
  const [primero, ...resto] = partes;

  if (primero === 'productos' && resto[0] === 'familia' && resto.length === 2) {
    return (
      existsSync(join(raiz, 'app/(es)/productos/familia/[slug]/page.tsx')) &&
      productFamilies.some((f) => f.slug === resto[1])
    );
  }

  const d = dinamicas[primero];
  if (d && resto.length === 1) return existsSync(join(raiz, d.plantilla)) && d.slugs.includes(resto[0]);

  // Colecciones cuyo slug se valida contra su propia plantilla dinámica.
  const conPlantilla = ['biblioteca', 'aplicaciones', 'soluciones', 'calculadoras', 'glosario', 'recursos', 'informes', 'novedades'];
  if (conPlantilla.includes(primero) && resto.length === 1) {
    return (
      existsSync(join(raiz, 'app', primero, '[slug]/page.tsx')) ||
      existsSync(join(raiz, 'app', '(es)', primero, '[slug]/page.tsx'))
    );
  }
  return false;
}

describe('mapa de consultas: una consulta, una página', () => {
  it('hay clústeres y no están vacíos', () => {
    expect(clusters.length).toBeGreaterThanOrEqual(40);
    expect(TOTAL_TERMINOS).toBeGreaterThanOrEqual(400);
    expect(TOTAL_PREGUNTAS).toBeGreaterThanOrEqual(100);
  });

  it('NINGÚN término pertenece a dos clústeres', () => {
    const dueño = new Map<string, string>();
    const choques: string[] = [];
    for (const c of clusters) {
      for (const t of terminosDe(c)) {
        const n = normalizar(t);
        const previo = dueño.get(n);
        if (previo && previo !== c.id) choques.push(`«${t}» lo reclaman ${previo} y ${c.id}`);
        dueño.set(n, c.id);
      }
    }
    expect(choques, 'dos páginas compitiendo por el mismo término: decida cuál contesta').toEqual([]);
  });

  it('ninguna página canónica pertenece a dos clústeres', () => {
    const cuenta = new Map<string, string[]>();
    for (const c of clusters) cuenta.set(c.canonica, [...(cuenta.get(c.canonica) ?? []), c.id]);
    const repetidas = [...cuenta.entries()].filter(([, ids]) => ids.length > 1);
    expect(repetidas.map(([r, ids]) => `${r}: ${ids.join(', ')}`)).toEqual([]);
  });

  it('cada ruta canónica existe en app/', () => {
    const rotas = clusters.filter((c) => !rutaExiste(c.canonica)).map((c) => `${c.id} → ${c.canonica}`);
    expect(rotas, 'el mapa no autoriza a inventar rutas: apunte a una página que exista').toEqual([]);
  });

  it('cada ruta de apoyo existe en app/', () => {
    const rotas: string[] = [];
    for (const c of clusters) {
      for (const a of c.apoyos) if (!rutaExiste(a)) rotas.push(`${c.id} → ${a}`);
    }
    expect(rotas).toEqual([]);
  });

  it('ningún clúster se apoya en su propia canónica', () => {
    const culpables = clusters.filter((c) => c.apoyos.includes(c.canonica)).map((c) => c.id);
    expect(culpables).toEqual([]);
  });

  it('todo clúster tiene al menos dos apoyos y dos preguntas', () => {
    const pobres = clusters
      .filter((c) => c.apoyos.length < 2 || c.preguntas.length < 2)
      .map((c) => `${c.id} (${c.apoyos.length} apoyos, ${c.preguntas.length} preguntas)`);
    expect(pobres, 'una canónica sin apoyos es una página aislada del grafo interno').toEqual([]);
  });

  it('la intención declarada es una de las documentadas', () => {
    const raras = clusters.filter((c) => !(c.intencion in intenciones)).map((c) => `${c.id}: ${c.intencion}`);
    expect(raras).toEqual([]);
  });

  it('los términos no llevan espacios sobrantes ni están duplicados dentro de su clúster', () => {
    const sucios: string[] = [];
    for (const c of clusters) {
      const ts = terminosDe(c);
      for (const t of ts) if (t !== t.trim() || /\s{2,}/.test(t)) sucios.push(`${c.id}: «${t}»`);
      const normalizados = ts.map(normalizar);
      if (new Set(normalizados).size !== normalizados.length) sucios.push(`${c.id}: términos repetidos dentro del clúster`);
    }
    expect(sucios).toEqual([]);
  });
});

describe('cobertura: nada del catálogo se queda fuera del mapa', () => {
  it('cada producto del catálogo tiene un clúster que lo declara canónico', () => {
    const sinClúster = products
      .filter((p) => !clusterDeRuta(`/productos/${p.slug}`))
      .map((p) => p.slug);
    expect(
      sinClúster,
      'un producto sin clúster es un producto por el que nadie decidió competir',
    ).toEqual([]);
  });

  it('cada familia de producto tiene un clúster que la declara canónica', () => {
    const sinClúster = productFamilies
      .filter((f) => !clusterDeRuta(`/productos/familia/${f.slug}`))
      .map((f) => f.slug);
    expect(sinClúster).toEqual([]);
  });

  it('cada hub sectorial tiene un clúster que lo declara canónico', () => {
    const sinClúster = INDUSTRIAS.filter((i) => !clusterDeRuta(`/industria/${i.slug}`)).map((i) => i.slug);
    expect(sinClúster).toEqual([]);
  });

  it('los términos comerciales del rubro resuelven a una página', () => {
    /**
     * Esta lista NO es el mapa: es una muestra de control escrita a mano con
     * las consultas que de verdad mueven dinero en este rubro en el Perú. Si
     * alguien reorganiza el mapa y una de estas deja de resolver, la prueba lo
     * dice antes que Search Console, tres meses después.
     */
    const CONTROL = [
      'big bags', 'bolsones', 'FIBC', 'lona plastificada', 'rafia', 'polytarp',
      'geomembrana', 'geotextil', 'geomallas', 'malla raschel', 'malla antiáfida',
      'mangas de ventilación', 'carpas industriales', 'toldos para camiones',
      'estructura textil', 'invernadero', 'tanque flexible', 'mulch',
      'bigbag', 'malla sombra', 'geomembrana hdpe', 'mangas ventilacion',
    ];
    const huérfanos = CONTROL.filter((t) => !clusterDeTermino(t));
    expect(huérfanos, 'términos comerciales sin página que los conteste').toEqual([]);
  });

  it('las erratas resuelven al mismo sitio que el término correcto', () => {
    expect(clusterDeTermino('bigbag')?.id).toBe(clusterDeTermino('big bags')?.id);
    expect(clusterDeTermino('mangas ventilacion')?.id).toBe(clusterDeTermino('mangas de ventilación')?.id);
    expect(clusterDeTermino('geomembrana hdpe')?.id).toBe(clusterDeTermino('geomembrana HDPE')?.id);
  });
});

describe('riel de términos: enlaza hacia fuera, nunca hacia sí mismo', () => {
  it('la página de un producto propone vecinos y ninguno es ella misma', () => {
    const ruta = '/productos/big-bags-bolsones-polipropileno';
    const riel = rielPara(ruta);
    expect(riel.length).toBeGreaterThan(0);
    expect(riel.some((c) => c.canonica === ruta)).toBe(false);
  });

  it('una guía de apoyo devuelve a las canónicas a las que sirve', () => {
    const riel = rielPara('/biblioteca/seleccion-geomembrana');
    expect(riel.map((c) => c.canonica)).toContain('/productos/familia/geosinteticos');
  });

  it('cada canónica comercial tiene riel: ninguna queda sin salidas', () => {
    const secas = clusters
      .filter((c) => c.intencion === 'comercial')
      .filter((c) => rielPara(c.canonica).length === 0)
      .map((c) => c.id);
    expect(secas).toEqual([]);
  });

  /**
   * EL VECINO TIENE QUE SER UN VECINO, Y ESTO ES LO QUE FALLÓ.
   *
   * La primera versión del riel emparejaba por apoyos compartidos sin
   * distinguirlos. Como casi todos los clústeres apoyan en /marco, en /calidad
   * o en su hub sectorial, «todo lo que toca minería» acababa siendo vecino de
   * «todo lo que toca minería»: la ficha de big bags proponía geomembrana HDPE,
   * mangas de ventilación y módulos para campamentos. Ninguna de las tres es
   * lo siguiente que mira quien está comprando bolsones, y un riel así no
   * reparte autoridad: la dispersa.
   *
   * La regla ahora es explícita: un vínculo de sólo sector no basta. Hace falta
   * familia común, o una guía, calculadora, término o aplicación en común —es
   * decir, la misma decisión técnica vista desde dos productos—.
   */
  it('ningún vecino del riel entra sólo por compartir sector', () => {
    const colados: string[] = [];
    for (const c of clusters) {
      const propio = c;
      for (const vecino of rielPara(c.canonica)) {
        const declarado = propio.apoyos.includes(vecino.canonica) || vecino.apoyos.includes(propio.canonica);
        if (declarado) continue;
        if (afinidadEntre(propio, vecino) < UMBRAL_RIEL) {
          colados.push(`${propio.id} → ${vecino.id} (afinidad ${afinidadEntre(propio, vecino)})`);
        }
      }
    }
    expect(colados, 'vecinos sin parentesco real: compartir hub sectorial no es parentesco').toEqual([]);
  });

  /**
   * El ORDEN lo decide la afinidad, y a veces gana un vecino más específico que
   * la familia: desde invernaderos, la malla raschel puntúa por encima de las
   * estructuras textiles, y es razonable. Lo que no puede caerse del corte es la
   * familia, que es el peldaño hacia arriba cuando el vecino específico no era
   * lo que el lector buscaba.
   */
  it('la familia de un producto SIEMPRE está en su riel', () => {
    const perdidas: string[] = [];
    for (const c of clusters) {
      if (!c.canonica.startsWith('/productos/') || c.canonica.startsWith('/productos/familia/')) continue;
      const familia = familiaDe(c);
      if (!familia) continue;
      if (!rielPara(c.canonica).some((v) => v.canonica === familia)) {
        perdidas.push(`${c.id}: sin salida hacia ${familia}`);
      }
    }
    expect(perdidas).toEqual([]);
  });

  it('una página que SÓLO es apoyo devuelve a las canónicas a las que sirve', () => {
    // /glosario/hdpe define un concepto; no es canónica de ningún clúster
    // comercial. Todo su trabajo en el grafo es devolver a las páginas que lo
    // usan, así que su riel no puede contener nada más.
    const ruta = '/glosario/hdpe';
    expect(clusterDeRuta(ruta), `${ruta} no debería ser canónica de un clúster`).toBeUndefined();
    const riel = rielPara(ruta);
    expect(riel.length).toBeGreaterThan(0);
    for (const c of riel) {
      expect(c.apoyos.includes(ruta), `${c.id} aparece en el riel de una página que no lo apoya`).toBe(true);
    }
  });
});
