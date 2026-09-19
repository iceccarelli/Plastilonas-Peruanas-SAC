import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  emptyLona,
  hrefConfiguradorLona,
  lonaDesdeParams,
  lonaSummary,
  LONA_ANCHO,
  LONA_CANTIDAD,
  LONA_CONFECCION,
  LONA_GRAMAJE,
  LONA_MATERIAL,
  LONA_MEDIDAS,
  LONA_TRATAMIENTO,
  LONA_USO,
  type LonaSpec,
} from '@/lib/lona-config';
import { CONFIGURADORES, configuradorDe } from '@/lib/configuradores';

/**
 * LA CADENA COMPLETA DEL CONFIGURADOR DE LONA, DE PUNTA A PUNTA.
 *
 * El defecto que esta prueba cierra es el de siempre en este repositorio: un
 * eslabón que se rompe en silencio. La configuración del comprador pasa por
 * cinco manos —enum → resumen → URL → /cotizacion → payload del lead— y
 * ninguna de ellas lanza cuando pierde el dato: simplemente llega vacía. El
 * comprador ve un formulario en blanco y vuelve a escribirlo, o no vuelve.
 *
 * Aquí se recorre la cadena entera con una especificación real y se comprueba
 * que lo que entra por un extremo sigue estando en el otro.
 */

const raiz = process.cwd();
const leer = (p: string) => readFileSync(join(raiz, p), 'utf8');

/** Especificación deliberadamente distinta de la de por defecto. */
const SPEC: LonaSpec = {
  material: 'polytarp',
  color: 'negro',
  gramaje: '700-900',
  ancho: 'union',
  textura: 'brillante',
  confeccion: ['costura', 'velcro'],
  tratamientos: ['ignifugo', 'antiestatico'],
  ojales: 'con',
  ojalesCantidad: '12',
  ojalesDistancia: '25',
  ojalesBorde: 'costura-doble',
  medidas: '8x18',
  cantidad: '11-20',
  uso: 'mineria',
};

describe('precarga del configurador por URL', () => {
  it('acepta cada valor real de cada fila', () => {
    for (const o of LONA_MATERIAL) {
      expect(lonaDesdeParams({ material: o.value }).material).toBe(o.value);
    }
    for (const o of LONA_GRAMAJE) {
      expect(lonaDesdeParams({ gramaje: o.value }).gramaje).toBe(o.value);
    }
    for (const o of LONA_ANCHO) {
      expect(lonaDesdeParams({ ancho: o.value }).ancho).toBe(o.value);
    }
  });

  it('un parámetro basura cae al valor por defecto y no rompe nada', () => {
    const base = emptyLona();
    const sucio = lonaDesdeParams({
      material: 'titanio',
      gramaje: '9999',
      ancho: '-1',
      color: '<script>',
      textura: '',
      confeccion: 'hf,NOEXISTE,hf',
      tratamientos: 'nada,de,esto,existe',
      ojales: 'quizá',
      ojales_cantidad: 'las que hagan falta',
      medidas: '6 por 12',
      cantidad: 'varios',
      uso: 'lo de siempre',
    });
    expect(sucio.material).toBe(base.material);
    expect(sucio.gramaje).toBe(base.gramaje);
    expect(sucio.ancho).toBe(base.ancho);
    expect(sucio.color).toBe(base.color);
    expect(sucio.textura).toBe(base.textura);
    // Los ids válidos sobreviven y los inventados desaparecen, sin repetidos.
    expect(sucio.confeccion).toEqual(['hf']);
    // Ninguno válido ⇒ se conserva la selección por defecto, no una fila vacía.
    expect(sucio.tratamientos).toEqual(base.tratamientos);
    // Y las filas nuevas —ojales y las tres que dejaron de ser texto libre—
    // tampoco dejan pasar nada tecleado.
    expect(sucio.ojales).toBe(base.ojales);
    expect(sucio.ojalesCantidad).toBe(base.ojalesCantidad);
    expect(sucio.medidas).toBe(base.medidas);
    expect(sucio.cantidad).toBe(base.cantidad);
    expect(sucio.uso).toBe(base.uso);
  });

  it('sin parámetros devuelve exactamente la especificación por defecto', () => {
    expect(lonaDesdeParams()).toEqual(emptyLona());
    expect(lonaDesdeParams({})).toEqual(emptyLona());
  });

  it('nunca produce un id que el configurador no sepa dibujar', () => {
    const s = lonaDesdeParams({ confeccion: 'hf,inventado', tratamientos: 'uv,inventado' });
    for (const id of s.confeccion) expect(LONA_CONFECCION.some((o) => o.id === id)).toBe(true);
    for (const id of s.tratamientos) expect(LONA_TRATAMIENTO.some((o) => o.id === id)).toBe(true);
  });

  it('el enlace precargado y el lector de la URL hablan el mismo enum', () => {
    const href = hrefConfiguradorLona({ material: 'rafia', gramaje: '200-350', ancho: '1.5' });
    const spec = lonaDesdeParams(
      Object.fromEntries(new URL(href, 'https://x.test').searchParams),
    );
    expect(spec.material).toBe('rafia');
    expect(spec.gramaje).toBe('200-350');
    expect(spec.ancho).toBe('1.5');
  });

  it('el generador de enlaces descarta una preselección inventada', () => {
    // El tipo es `string` a propósito —los enums son `as const` y la
    // preselección puede venir de datos—, así que el filtro es de ejecución.
    expect(hrefConfiguradorLona({ material: 'titanio' })).toBe('/configurador/lona');
    expect(hrefConfiguradorLona()).toBe('/configurador/lona');
  });

  it('la página del configurador declara leer esos parámetros', () => {
    const src = leer('app/(es)/configurador/lona/page.tsx');
    const bloque = src.match(/searchParams:\s*Promise<\{([\s\S]*?)\}>/);
    expect(bloque, 'la página dejó de leer searchParams').toBeTruthy();
    for (const p of ['material', 'gramaje', 'ancho', 'color', 'textura']) {
      expect(bloque![1], `/configurador/lona dejó de leer ?${p}=`).toContain(p);
    }
    expect(src, 'la precarga tiene que pasar por el validador').toContain('lonaDesdeParams');
  });
});

describe('la especificación llega entera hasta el RFQ', () => {
  const resumen = lonaSummary(SPEC);

  it('el resumen contiene lo que el comprador eligió, con etiquetas legibles', () => {
    expect(resumen).toContain('Polytarp PE');
    expect(resumen).toContain('700 – 900 g/m²');
    expect(resumen).toContain('Más de 4.0 m (unión soldada)');
    expect(resumen).toContain('Costura reforzada');
    expect(resumen).toContain('Ignífugo');
    expect(resumen).toContain('8 × 18 m');
    expect(resumen).toContain('11 – 20 paños');
    expect(resumen).toContain('Minería/campamento');
  });

  it('el sub-pliego de ojales sobrevive entero hasta las notas del RFQ', () => {
    // Las tres decisiones nuevas —cuántos, cada cuánto y con qué borde— son
    // exactamente el tipo de dato que antes se perdía entre eslabones.
    expect(resumen).toContain(
      'Ojales: 12 ojales, cada 25 cm entre ojales, borde en orilla con costura doble reforzada.',
    );
    const notas = new URL(
      `https://x.test/cotizacion?notas=${encodeURIComponent(resumen)}`,
    ).searchParams.get('notas')!;
    expect(notas).toContain('12 ojales');
    expect(notas).toContain('cada 25 cm');
    expect(notas).toContain('costura doble reforzada');
    expect(notas).toContain('8 × 18 m');
    expect(notas).toContain('11 – 20 paños');
    expect(notas).toContain('Minería/campamento');
  });

  it('«Sin ojales» llega al RFQ como ausencia, no como cantidad cero', () => {
    const sin = lonaSummary({ ...SPEC, ojales: 'sin' });
    expect(sin).not.toMatch(/^Ojales:/m);
    expect(sin).not.toContain('12 ojales');
    // El resto de la especificación no se resiente.
    expect(sin).toContain('Polytarp PE');
    expect(sin).toContain('8 × 18 m');
  });

  it('no filtra un precio ni una certificación por la puerta de atrás', () => {
    // Un importe de verdad —moneda + cifra— y cualquier sello ajeno. La
    // palabra «precio» sí aparece, y debe: el resumen declara que NO lo lleva.
    expect(resumen).not.toMatch(/(S\/\.?|USD|US\$|\$|€)\s*\d/);
    expect(resumen).not.toMatch(/\b(ISO|ASTM|CE|UL)\b/);
  });

  it('sobrevive a la ida y vuelta por la URL sin perder una línea', () => {
    const url = new URL(
      `https://x.test/cotizacion?producto=lona-plastificada-rafia-polytarp&origen=configurador-lona&notas=${encodeURIComponent(resumen)}`,
    );
    expect(url.searchParams.get('notas')).toBe(resumen);
    expect(url.searchParams.get('origen')).toBe('configurador-lona');
    // El recorte de /cotizacion son 1500 caracteres: el resumen más largo
    // posible tiene que caber entero o el comprador pierde el final.
    expect(resumen.length).toBeLessThan(1500);
  });

  it('el resumen más largo que este configurador puede producir sigue cabiendo', () => {
    const maximo = lonaSummary({
      material: 'algodon',
      color: 'traslucido',
      gramaje: 'definir',
      ancho: 'union',
      textura: 'esmerilado',
      confeccion: LONA_CONFECCION.map((o) => o.id),
      tratamientos: LONA_TRATAMIENTO.map((o) => o.id),
      ojales: 'con',
      ojalesCantidad: 'definir',
      ojalesDistancia: 'definir',
      // La etiqueta más larga de las cinco, con el sub-pliego entero puesto.
      ojalesBorde: 'dobladillo-reforzado',
      medidas: 'medida',
      cantidad: 'mas-50',
      uso: 'cerramiento',
    });
    expect(maximo.length).toBeLessThan(1500);
  });

  it('ya no hay resumen ilimitado: los tres campos libres eran la fuga', () => {
    // Antes medidas/cantidad/uso eran `<input>` y el tope de 1500 caracteres
    // de /cotizacion dependía de que nadie pegara un párrafo. Ahora el resumen
    // MÁS LARGO posible es finito y se puede calcular.
    let mayor = 0;
    for (const m of LONA_MEDIDAS) {
      for (const c of LONA_CANTIDAD) {
        for (const u of LONA_USO) {
          mayor = Math.max(
            mayor,
            lonaSummary({ ...SPEC, medidas: m.value, cantidad: c.value, uso: u.value }).length,
          );
        }
      }
    }
    expect(mayor).toBeLessThan(1500);
  });

  it('el CTA del configurador sigue mandando notas Y origen', () => {
    const src = leer('components/LonaConfigurador.tsx');
    expect(src).toContain('origen=configurador-lona');
    expect(src).toContain('notas=');
    expect(src).toContain('lonaSummary');
  });

  it('/cotizacion lee los dos y los mete en el formulario', () => {
    const src = leer('app/(es)/cotizacion/page.tsx');
    // `notas` acaba en el mensaje prellenado; `origen` viaja al lead.
    expect(src).toMatch(/params\.nota\s*\?\?\s*params\.notas/);
    expect(src).toContain('preselectedMessage');
    expect(src).toContain('origen={origen}');
  });

  it('el formulario mete ambos en el objeto que se envía a /api/lead', () => {
    const src = leer('components/CotizacionForm.tsx');
    // El mensaje prellenado (donde aterriza `notas`) es el valor inicial del
    // campo, y ese campo es el que viaja como `mensaje` en el payload.
    expect(src).toContain("mensaje: preselectedMessage || ''");
    expect(src).toContain('mensaje: data.mensaje');
    expect(src).toContain('origen,');
  });

  it('/api/lead no descarta el origen y lo reenvía al CRM', () => {
    const src = leer('app/api/lead/route.ts');
    expect(src, 'zod descarta en silencio lo que no declara').toMatch(/origen:\s*z\.string\(\)/);
    // El webhook recibe el lead entero (`...lead`) más la fuente compuesta.
    expect(src).toContain('...lead,');
    expect(src).toContain('source: fuenteDe(lead)');
    expect(src).toMatch(/lead\.origen\s*\?\s*` \(\$\{lead\.origen\}\)`/);
  });
});

describe('las páginas que alimentan el configurador', () => {
  it('cada destino declarado es una ruta de configurador que existe', () => {
    for (const [slug, destino] of Object.entries(CONFIGURADORES)) {
      expect(destino.href.startsWith('/configurador'), `${slug} apunta fuera`).toBe(true);
      expect(destino.label.length).toBeGreaterThan(8);
      expect(destino.detalle).not.toMatch(/(S\/\.?|USD|US\$|\$|€)\s*\d/);
    }
  });

  it('la ficha de la lona y la de big bags llevan al suyo', () => {
    expect(configuradorDe('lona-plastificada-rafia-polytarp')?.href).toContain(
      '/configurador/lona?',
    );
    expect(configuradorDe('big-bags-bolsones-polipropileno')?.href).toBe('/configurador');
    expect(configuradorDe('geotextiles')).toBeUndefined();
  });

  it('la preselección de la ficha de lona es válida hoy', () => {
    const href = configuradorDe('lona-plastificada-rafia-polytarp')!.href;
    const spec = lonaDesdeParams(
      Object.fromEntries(new URL(href, 'https://x.test').searchParams),
    );
    // Si alguien retira un valor del enum, la precarga cae al de por defecto:
    // esto lo detecta antes de que el enlace mienta sobre lo que preselecciona.
    expect(spec.material).toBe('pvc');
    expect(spec.gramaje).toBe('500-700');
    expect(spec.ancho).toBe('3.0');
  });

  it('la ficha del producto y el hub de cuña enseñan el desvío', () => {
    expect(leer('app/(es)/productos/[slug]/page.tsx')).toContain('configuradorDe');
    expect(leer('components/CunaHub.tsx')).toContain('configuradorDe');
  });

  it('la ficha técnica en PDF se ofrece desde el propio configurador', () => {
    const src = leer('components/LonaConfigurador.tsx');
    expect(src, 'el configurador dejó de ofrecer la ficha técnica').toContain('DatasheetButton');
    expect(src).toContain('lona-plastificada-rafia-polytarp');
  });
});
