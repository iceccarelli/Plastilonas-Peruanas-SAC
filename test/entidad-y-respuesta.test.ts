import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SITE } from '@/lib/site';
import { buildEntidadJson, INCOTERMS_SALIDA } from '@/lib/entidad-feed';
import { products } from '@/lib/products';
import { applications } from '@/lib/applications';
import {
  respuestaDirectaProducto,
  respuestaDirectaAplicacion,
  contarPalabras,
  rfqWhatsAppProducto,
} from '@/lib/respuesta-directa';
import ciudades from '@/data/ciudades.json';
import { todasLasRanurasConPublicadas } from '@/lib/imagenes';
import { machinery } from '@/lib/machinery';
import { readdirSync, statSync } from 'node:fs';

/**
 * LA ENTIDAD SE CIERRA, Y LA RESPUESTA DIRECTA NO INVENTA.
 *
 * Estas pruebas nacen de un defecto concreto y de un riesgo concreto.
 *
 * EL DEFECTO. El sitio servía `public/entidad.json`, un archivo estático que
 * declaraba `"@id": "https://plastilonas.com/#organization"` mientras el sitio
 * se rastreaba desde el host de Vercel, y `areaServed: ["PE","CL","CO","EC","BO"]`
 * mientras /confianza publicaba que la cobertura continental NO se afirma. No lo
 * cazó nadie porque estaba en `public/`, que era el único directorio servido que
 * ni test/afirmaciones.ts ni test/dominio.ts miraban. Ahora lo miran las dos, y
 * además la tarjeta se genera de lib/ en vez de copiarse a mano.
 *
 * EL RIESGO. La «respuesta directa» es un párrafo pensado para que un motor de
 * respuestas lo cite entero. Es, por construcción, el texto de este sitio con
 * más probabilidad de ser repetido por una máquina delante de un comprador. Si
 * algún día alguien lo convierte en un campo de texto libre, será la puerta por
 * la que vuelva a entrar una cifra que nadie puede sostener. Se comprueba que
 * siga siendo compuesto, sin precio, y que respete el límite de las líneas bajo
 * pedido.
 */

describe('la tarjeta de entidad cierra la entidad en vez de partirla', () => {
  const doc = JSON.parse(buildEntidadJson());
  const nodos: Record<string, unknown>[] = doc['@graph'];
  const org = nodos.find((n) => n['@type'] === 'Organization') as Record<string, unknown>;

  it('el archivo estático que declaraba otro dominio ya no existe', () => {
    expect(
      existsSync(join(process.cwd(), 'public/entidad.json')),
      'public/entidad.json volvió: era una copia a mano que declaraba otro host',
    ).toBe(false);
  });

  it('el @id de la organización vive en el origen que se rastrea', () => {
    expect(org['@id']).toBe(`${SITE.url}/#organization`);
    expect(org.url).toBe(SITE.url);
  });

  it('no escribe el host de marca en ninguna parte mientras no sea el canónico', () => {
    const sinCorreos = buildEntidadJson().replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g, '');
    if (new URL(SITE.url).host !== SITE.brandHost) {
      expect(sinCorreos).not.toContain(SITE.brandHost);
    }
  });

  it('declara una sola área de servicio: donde se fabrica', () => {
    expect(org.areaServed).toEqual({ '@type': 'Country', name: 'Perú' });
    const texto = JSON.stringify(doc);
    for (const pais of ['Chile', 'Ecuador', 'Bolivia', 'Brasil', 'México']) {
      expect(
        texto,
        `${pais} aparece como área de servicio: /confianza declara que la cobertura continental no se afirma`,
      ).not.toContain(`"${pais}"`);
    }
  });

  it('la identidad sale de lib/site.ts y no de una copia', () => {
    expect(org.taxID).toBe(SITE.ruc);
    expect(org.email).toBe(SITE.email);
    expect((org.address as Record<string, string>).streetAddress).toBe(SITE.addressStreet);
    expect(org.foundingDate).toBe(SITE.foundingYear);
  });

  it('no usa vocabulario inventado en el nodo raíz', () => {
    // El archivo anterior traía `disclaimer`, que no existe en schema.org.
    expect(Object.keys(org)).not.toContain('disclaimer');
  });

  it('la exportación se declara como servicio evaluado, no como cobertura', () => {
    const servicio = nodos.find((n) => n['@type'] === 'Service') as Record<string, unknown>;
    expect(servicio, 'falta el nodo de suministro internacional').toBeDefined();
    expect(servicio.areaServed).toEqual({ '@type': 'Country', name: 'Perú' });
    expect(String(servicio.description)).toMatch(/eval[úu]a|evaluada|por operaci[óo]n/i);
    expect(INCOTERMS_SALIDA.length).toBeGreaterThanOrEqual(2);
  });

  it('no publica precio en ninguna forma', () => {
    const texto = buildEntidadJson();
    expect(texto).not.toMatch(/"price"\s*:/);
    expect(texto).not.toMatch(/S\/\s?\d|USD\s?\d/);
  });
});

describe('la respuesta directa se compone, no se escribe', () => {
  it('ninguna respuesta de producto publica un precio', () => {
    const culpables = products
      .filter((p) => /S\/\s?\d|USD\s?\d|\bprecio de\s+\d/i.test(respuestaDirectaProducto(p)))
      .map((p) => p.slug);
    expect(culpables, 'la venta es B2B por cotización').toEqual([]);
  });

  it('las líneas bajo pedido no reciben especificaciones numéricas', () => {
    // La regla es de lib/products.ts y la obedece también el chatbot: en esas
    // líneas la ficha la emite el fabricante, no este repositorio.
    const culpables = products
      .filter((p) => (p.availability ?? 'a_medida') === 'bajo_pedido')
      .filter((p) => !/se definen por proyecto/i.test(respuestaDirectaProducto(p)))
      .map((p) => p.slug);
    expect(culpables, 'una línea bajo pedido no publica su especificación aquí').toEqual([]);
  });

  it('cada respuesta cabe en un fragmento citable', () => {
    for (const p of products) {
      const n = contarPalabras(respuestaDirectaProducto(p));
      expect(n, `${p.slug}: ${n} palabras`).toBeLessThanOrEqual(56);
      expect(n, `${p.slug}: demasiado corta para contestar nada`).toBeGreaterThanOrEqual(20);
    }
    for (const a of applications) {
      expect(contarPalabras(respuestaDirectaAplicacion(a))).toBeLessThanOrEqual(56);
    }
  });

  it('el RFQ de WhatsApp lleva el SKU que identifica la ficha', () => {
    for (const p of products.slice(0, 8)) {
      const m = rfqWhatsAppProducto(p);
      expect(m).toContain(p.slug);
      expect(m).toContain(p.id);
      expect(m).toContain('Ciudad de entrega');
    }
  });

  it('la ficha y el hub de aplicación marcan el párrafo como speakable', () => {
    for (const ruta of ['app/productos/[slug]/page.tsx', 'app/aplicaciones/[slug]/page.tsx']) {
      const src = readFileSync(join(process.cwd(), ruta), 'utf8');
      expect(src, `${ruta} no declara speakable`).toContain("speakable: ['.respuesta-directa']");
      expect(src, `${ruta} no pinta el párrafo citable`).toContain('respuesta-directa');
    }
  });
});

describe('la cobertura geográfica describe sitios reales, no páginas de relleno', () => {
  type Ciudad = {
    slug: string; ciudad: string; departamento: string; clima: string;
    contextoLocal: string; usosPrincipales: string[]; sectoresDemanda: string[];
    corredores?: { nombre: string; contexto: string }[];
  };
  const CIUDADES = ciudades as Ciudad[];

  it('ninguna ciudad se repite y ninguna comparte nombre con otra', () => {
    const slugs = CIUDADES.map((c) => c.slug);
    expect(slugs.filter((s, i) => slugs.indexOf(s) !== i)).toEqual([]);
    const nombres = CIUDADES.map((c) => c.ciudad.toLowerCase());
    expect(
      nombres.filter((n, i) => nombres.indexOf(n) !== i),
      'dos páginas sobre la misma ciudad compiten entre sí',
    ).toEqual([]);
  });

  it('cada ciudad trae contexto propio y suficiente para justificar su página', () => {
    for (const c of CIUDADES) {
      expect(c.clima.length, `${c.slug}: clima demasiado breve`).toBeGreaterThan(40);
      expect(c.contextoLocal.length, `${c.slug}: contexto demasiado breve`).toBeGreaterThan(120);
      expect(c.usosPrincipales.length, `${c.slug}: sin usos`).toBeGreaterThanOrEqual(3);
      expect(c.sectoresDemanda.length, `${c.slug}: sin sectores`).toBeGreaterThanOrEqual(2);
    }
  });

  it('ningún contexto local es copia de otro', () => {
    const vistos = new Map<string, string>();
    const choques: string[] = [];
    for (const c of CIUDADES) {
      const clave = c.contextoLocal.slice(0, 80).toLowerCase();
      const previo = vistos.get(clave);
      if (previo) choques.push(`${previo} ≈ ${c.slug}`);
      else vistos.set(clave, c.slug);
    }
    expect(choques, 'contexto duplicado: eso es una doorway page').toEqual([]);
  });

  it('toda ciudad cae en una región que /local sabe agrupar', () => {
    /**
     * /local agrupa por la división clásica del Perú —costa, sierra, selva— y
     * recorre REGION_ORDER para pintar los grupos. Una ciudad con una región
     * fuera de esa lista genera su página, entra en el sitemap… y no la enlaza
     * NADIE, porque no cae en ningún grupo. Pasó al añadir Moquegua como
     * «costa y sierra» y Puno como «altiplano»: dos huérfanas que sólo cazó
     * `npm run auditar` sobre el HTML servido. Aquí se caza antes.
     */
    const src = readFileSync(join(process.cwd(), 'app/local/page.tsx'), 'utf8');
    const declaradas = /const REGION_ORDER = \[([^\]]+)\]/.exec(src)?.[1] ?? '';
    const validas = new Set(
      declaradas.split(',').map((r) => r.trim().replace(/^["']|["']$/g, '')).filter(Boolean),
    );
    expect(validas.size, 'no se pudo leer REGION_ORDER de app/local/page.tsx').toBeGreaterThan(0);
    const fuera = CIUDADES.filter((c) => !validas.has(c.region)).map((c) => `${c.slug} (${c.region})`);
    expect(
      fuera,
      `estas ciudades no caen en ningún grupo de /local y quedarían huérfanas: ${fuera.join(', ')}`,
    ).toEqual([]);
  });

  it('los corredores viven dentro de su ciudad y no como páginas propias', () => {
    const conCorredores = CIUDADES.filter((c) => c.corredores?.length);
    for (const c of conCorredores) {
      for (const k of c.corredores!) {
        expect(k.contexto.length, `${c.slug}/${k.nombre}: corredor sin contexto`).toBeGreaterThan(60);
        expect(
          CIUDADES.some((o) => o.ciudad.toLowerCase() === k.nombre.toLowerCase()),
          `${k.nombre} tiene además página propia: elija una de las dos`,
        ).toBe(false);
      }
    }
  });
});

describe('ninguna imagen del repositorio se queda sin mostrar', () => {
  /**
   * TODA IMAGEN EN public/ SE VE EN ALGUNA PÁGINA.
   *
   * lib/imagenes.ts parte de que la ranura se declara ANTES de que exista el
   * archivo: por eso una ranura pendiente no es un error y la página degrada
   * sola. La consecuencia es que el sentido contrario —un archivo que existe
   * y que nadie declara— no lo detectaba nada. `auditar:imagenes` comprueba
   * que toda ruta citada tenga archivo, que es la otra dirección.
   *
   * Se coló así una fotografía real de manta agrotextil: entró en el lote de
   * conversión a webp, se perdió al reestructurar las galerías y siguió
   * ocupando disco sin que ninguna página la mostrara. Un archivo que no se
   * ve es peso muerto en el despliegue y, peor, contenido bueno perdido.
   */
  it('no queda ningún archivo en public/images que ninguna página muestre', () => {
    const enDisco: string[] = [];
    const recorrer = (d: string) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const ruta = `${d}/${e.name}`;
        if (e.isDirectory()) recorrer(ruta);
        else enDisco.push(ruta.replace(/^public/, ''));
      }
    };
    recorrer('public/images');

    const citadas = new Set<string>();
    for (const r of todasLasRanurasConPublicadas()) citadas.add(r.ruta);
    for (const p of products) {
      if (p.image) citadas.add(p.image);
      for (const g of p.gallery ?? []) citadas.add(g);
    }
    for (const m of machinery) for (const v of m.views) { citadas.add(v.webp); citadas.add(v.thumb); }
    // Rutas escritas directamente en el código: heros, /servicios, /en, /pt.
    // Se ignoran las que llevan interpolación: ésas ya salen del registro.
    const recorrerFuentes = (d: string) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
        const ruta = `${d}/${e.name}`;
        if (e.isDirectory()) recorrerFuentes(ruta);
        else if (/\.(ts|tsx|mjs|json)$/.test(e.name) && statSync(ruta).size < 3_000_000) {
          for (const m of readFileSync(ruta, 'utf8')
            .matchAll(/["'`](\/images\/[^"'`${]+\.(?:webp|jpg|jpeg|png|svg|avif))["'`]/g)) {
            citadas.add(m[1]);
          }
        }
      }
    };
    for (const d of ['app', 'components', 'lib', 'data']) recorrerFuentes(d);

    // Tomas alternas: -2, -3, -4 sobre cualquier ruta ya citada.
    for (const c of [...citadas]) for (const n of [2, 3, 4]) citadas.add(c.replace(/(\.\w+)$/, `-${n}$1`));

    const huerfanas = enDisco.filter((f) => !citadas.has(f)).sort();
    expect(
      huerfanas,
      `archivos que ocupan disco y no se ven en ninguna página. Conéctelos a la ` +
        `galería o ranura que les corresponda, o retírelos: ${huerfanas.join(', ')}`,
    ).toEqual([]);
  });
});
