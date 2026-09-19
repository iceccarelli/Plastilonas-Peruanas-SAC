import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  emptyLona,
  llevaOjales,
  lonaDesdeParams,
  lonaOjalesResumen,
  lonaSummary,
  LONA_BORDE,
  LONA_CANTIDAD,
  LONA_CONFECCION,
  LONA_MEDIDAS,
  LONA_OJALES,
  LONA_OJALES_CANTIDAD,
  LONA_OJALES_DISTANCIA,
  LONA_TRATAMIENTO,
  LONA_GRAMAJE,
  LONA_PREGUNTAS,
  LONA_USO,
  type LonaSpec,
} from '@/lib/lona-config';

/**
 * EL CONFIGURADOR DE LONA NO PONE PRECIO NI INVENTA UN SELLO.
 *
 * El resumen que sale de aquí no se queda en pantalla: viaja dentro de
 * `?notas=` hasta el formulario de cotización y de ahí al correo de un
 * comprador que está homologando proveedor. Es texto que la empresa firma sin
 * haberlo leído dos veces, así que se audita en cada ejecución de `npm test`.
 *
 * Tres cosas se comprueban y ninguna es cosmética:
 *   1. El serializador dice lo que el comprador eligió, en texto plano.
 *   2. Ese texto sobrevive a `encodeURIComponent` y vuelve idéntico.
 *   3. Ni el resumen ni la copia del configurador mencionan un importe ni una
 *      certificación propia.
 */

const raiz = process.cwd();
const leer = (r: string) => readFileSync(join(raiz, r), 'utf8');

const MUESTRA: LonaSpec = {
  material: 'pvc',
  color: 'verde',
  gramaje: '500-700',
  ancho: '4.0',
  textura: 'mate',
  confeccion: ['hf'],
  tratamientos: ['uv', 'ignifugo'],
  ojales: 'con',
  ojalesCantidad: '8',
  ojalesDistancia: '50',
  ojalesBorde: 'dobladillo-reforzado',
  medidas: '6x12',
  cantidad: '6-10',
  uso: 'obra',
};

describe('lonaSummary — el resumen que viaja al RFQ', () => {
  it('nombra cada elección con su etiqueta legible, no con su valor interno', () => {
    const t = lonaSummary(MUESTRA);
    expect(t).toContain('Configuración de lona a medida (preliminar, sin precio)');
    expect(t).toContain('Material: PVC plastificado');
    expect(t).toContain('Gramaje pedido: 500 – 700 g/m²');
    expect(t).toContain('Ancho: Hasta 4.0 m en una pieza');
    expect(t).toContain('Color: Verde');
    expect(t).toContain('Acabado: Mate');
    expect(t).toContain('Confección: Soldadura HF');
    expect(t).toContain('Tratamientos: Anti-UV, Ignífugo');
    expect(t).toContain(
      'Ojales: 8 ojales, cada 50 cm entre ojales, borde en dobladillo reforzado con cinta o soga.',
    );
    expect(t).toContain('Medidas del paño: 6 × 12 m');
    expect(t).toContain('Cantidad: 6 – 10 paños');
    expect(t).toContain('Uso previsto: Cobertura de obra/almacén');
    // Lo que se promete es una confirmación escrita, no un plazo ni un monto.
    expect(t).toContain('se confirman por escrito en la cotización');
  });

  it('omite las líneas vacías en lugar de mandar campos en blanco', () => {
    const t = lonaSummary(emptyLona());
    expect(t).not.toMatch(/Medidas del paño:\s*$/m);
    expect(t).not.toMatch(/Cantidad:\s*$/m);
    expect(t).not.toMatch(/Uso previsto:\s*$/m);
  });

  it('medidas, cantidad y uso viajan con su etiqueta legible, no con el valor interno', () => {
    // Eran tres campos de texto libre. Ahora son enums, así que el RFQ recibe
    // «6 × 12 m» y no `6x12`: el valor interno no es para leerlo una persona.
    const t = lonaSummary(emptyLona());
    expect(t).toContain('Medidas del paño: 4 × 8 m');
    expect(t).toContain('Cantidad: 2 – 5 paños');
    expect(t).toContain('Uso previsto: Tolderas/cobertores de camión');
    expect(t).not.toContain('4x8');
    expect(t).not.toContain('mas-50');
  });

  it('sin confección elegida lo dice, no lo calla', () => {
    expect(lonaSummary({ ...MUESTRA, confeccion: [] })).toContain('Confección: a definir');
  });

  it('el gramaje no sale del rango real de la ficha: 200 a 900 g/m²', () => {
    const numeros = LONA_GRAMAJE.flatMap((o) => [...o.label.matchAll(/(\d{3})/g)].map((m) => +m[1]));
    expect(numeros.length).toBeGreaterThan(0);
    for (const n of numeros) {
      expect(n).toBeGreaterThanOrEqual(200);
      expect(n).toBeLessThanOrEqual(900);
    }
  });

  it('los tratamientos son exactamente los cuatro de la ficha', () => {
    expect(LONA_TRATAMIENTO.map((t) => t.id)).toEqual([
      'uv',
      'ignifugo',
      'antiestatico',
      'antibacteriano',
    ]);
  });
});

describe('ojales: un bloque propio, una sola fuente de verdad', () => {
  it('«ojales» ya NO es una opción de la fila de confección', () => {
    // Dos controles capaces de discrepar sobre si el paño lleva ojales es el
    // defecto que este bloque cierra. Si alguien lo devuelve a la multiselección
    // habrá otra vez dos verdades, y esto lo dice antes de que pase.
    expect(LONA_CONFECCION.map((c) => c.id)).not.toContain('ojales');
    expect(LONA_OJALES.map((o) => o.value)).toEqual(['sin', 'con']);
  });

  it('«Sin ojales» borra el sub-pliego entero del RFQ, no lo manda a medias', () => {
    const sin = { ...MUESTRA, ojales: 'sin' };
    expect(llevaOjales(sin)).toBe(false);
    expect(lonaOjalesResumen(sin)).toBe('');
    const t = lonaSummary(sin);
    expect(t).not.toMatch(/^Ojales:/m);
    // Y tampoco se cuela un «Ojales: no» ni una cantidad huérfana.
    expect(t).not.toContain('8 ojales');
    expect(t).not.toContain('cada 50 cm');
  });

  it('las tres filas de detalle llegan enteras al resumen', () => {
    for (const c of LONA_OJALES_CANTIDAD) {
      for (const d of LONA_OJALES_DISTANCIA) {
        for (const b of LONA_BORDE) {
          const linea = lonaOjalesResumen({
            ...MUESTRA,
            ojalesCantidad: c.value,
            ojalesDistancia: d.value,
            ojalesBorde: b.value,
          });
          expect(linea.startsWith('Ojales: ')).toBe(true);
          expect(linea.endsWith('.')).toBe(true);
          // Cada una de las tres decisiones deja huella; «a definir» también.
          expect(linea.split(',')).toHaveLength(3);
          expect(lonaSummary({
            ...MUESTRA,
            ojalesCantidad: c.value,
            ojalesDistancia: d.value,
            ojalesBorde: b.value,
          })).toContain(linea);
        }
      }
    }
  });

  it('«a definir» se dice con palabras, no con un valor interno', () => {
    const linea = lonaOjalesResumen({
      ...MUESTRA,
      ojalesCantidad: 'definir',
      ojalesDistancia: 'definir',
      ojalesBorde: 'definir',
    });
    expect(linea).toBe(
      'Ojales: cantidad a definir en cotización, paso a definir en cotización, acabado de borde a definir en cotización.',
    );
    expect(linea).not.toContain('definir,');
  });

  it('ni el enum ni el resumen declaran herraje: sin diámetro, marca ni SKU', () => {
    const todo = [
      ...LONA_OJALES_CANTIDAD,
      ...LONA_OJALES_DISTANCIA,
      ...LONA_BORDE,
    ].map((o) => o.label).join(' | ') + ' | ' + lonaSummary(MUESTRA);
    expect(todo).not.toMatch(/\bmm\b|\bpulgad/i);
    expect(todo).not.toMatch(/latón|lat[oó]n|inox|acero|bronce/i);
    expect(todo).not.toMatch(/\bSKU\b|\bref\.?\s*\d/i);
  });
});

describe('ninguna fila nueva acepta texto libre', () => {
  const base = emptyLona();

  it('cada valor real de cada fila nueva se acepta tal cual', () => {
    for (const o of LONA_OJALES) expect(lonaDesdeParams({ ojales: o.value }).ojales).toBe(o.value);
    for (const o of LONA_OJALES_CANTIDAD) {
      expect(lonaDesdeParams({ ojales_cantidad: o.value }).ojalesCantidad).toBe(o.value);
    }
    for (const o of LONA_OJALES_DISTANCIA) {
      expect(lonaDesdeParams({ ojales_distancia: o.value }).ojalesDistancia).toBe(o.value);
    }
    for (const o of LONA_BORDE) {
      expect(lonaDesdeParams({ ojales_borde: o.value }).ojalesBorde).toBe(o.value);
    }
    for (const o of LONA_MEDIDAS) expect(lonaDesdeParams({ medidas: o.value }).medidas).toBe(o.value);
    for (const o of LONA_CANTIDAD) {
      expect(lonaDesdeParams({ cantidad: o.value }).cantidad).toBe(o.value);
    }
    for (const o of LONA_USO) expect(lonaDesdeParams({ uso: o.value }).uso).toBe(o.value);
  });

  it('una cadena tecleada NO llega al RFQ: cae al valor por defecto', () => {
    const sucio = lonaDesdeParams({
      ojales: 'quizá',
      ojales_cantidad: '9999',
      ojales_distancia: 'cada tanto',
      ojales_borde: '<script>alert(1)</script>',
      medidas: '6 por 12 más o menos',
      cantidad: 'varios',
      uso: 'para el camión del jefe',
    });
    expect(sucio.ojales).toBe(base.ojales);
    expect(sucio.ojalesCantidad).toBe(base.ojalesCantidad);
    expect(sucio.ojalesDistancia).toBe(base.ojalesDistancia);
    expect(sucio.ojalesBorde).toBe(base.ojalesBorde);
    expect(sucio.medidas).toBe(base.medidas);
    expect(sucio.cantidad).toBe(base.cantidad);
    expect(sucio.uso).toBe(base.uso);
    // Y nada de lo tecleado sobrevive en el texto que viaja al correo.
    const t = lonaSummary(sucio);
    expect(t).not.toContain('<script>');
    expect(t).not.toContain('del jefe');
    expect(t).not.toContain('9999');
  });

  it('el configurador no tiene un solo <input> de texto', () => {
    // Se miran los dos rastros que deja un campo de texto y que un comentario
    // no puede producir: el elemento con atributos y el lector del teclado.
    const src = leer('components/LonaConfigurador.tsx');
    expect(src, 'volvió un campo de texto libre al configurador').not.toMatch(
      /<input[\s\n][^>]*\bvalue=/,
    );
    expect(src, 'algo vuelve a leer lo que el comprador teclea').not.toContain('e.target.value');
    expect(src).toContain('FilaEnum');
  });

  it('los valores por defecto son los declarados, y son valores de enum', () => {
    expect(base.ojales).toBe('con');
    expect(base.ojalesDistancia).toBe('50');
    expect(base.ojalesBorde).toBe('dobladillo');
    expect(base.ojalesCantidad).toBe('definir');
    expect(base.medidas).toBe(LONA_MEDIDAS[0].value);
    expect(base.cantidad).toBe('2-5');
    expect(base.uso).toBe('tolderas');
    for (const [enumerado, valor] of [
      [LONA_OJALES, base.ojales],
      [LONA_OJALES_CANTIDAD, base.ojalesCantidad],
      [LONA_OJALES_DISTANCIA, base.ojalesDistancia],
      [LONA_BORDE, base.ojalesBorde],
      [LONA_MEDIDAS, base.medidas],
      [LONA_CANTIDAD, base.cantidad],
      [LONA_USO, base.uso],
    ] as const) {
      expect((enumerado as readonly { value: string }[]).some((o) => o.value === valor)).toBe(true);
    }
  });

  it('ningún valor de enum lleva un «+» que la URL decodifique como espacio', () => {
    for (const o of [...LONA_MEDIDAS, ...LONA_CANTIDAD, ...LONA_USO, ...LONA_OJALES_CANTIDAD]) {
      expect(o.value, `${o.value} no sobrevive a una query string`).not.toContain('+');
      expect(o.value).toBe(o.value.toLowerCase());
    }
  });
});

describe('el resumen sobrevive al viaje por la URL', () => {
  it('encodeURIComponent va y vuelve sin perder un carácter', () => {
    const resumen = lonaSummary(MUESTRA);
    const url = `/cotizacion?producto=lona-plastificada-rafia-polytarp&origen=configurador-lona&notas=${encodeURIComponent(resumen)}`;
    const leido = new URLSearchParams(url.slice(url.indexOf('?') + 1));
    expect(leido.get('notas')).toBe(resumen);
    expect(leido.get('producto')).toBe('lona-plastificada-rafia-polytarp');
    expect(leido.get('origen')).toBe('configurador-lona');
    // Saltos de línea y «²» dentro de un query string rompen si se concatenan
    // sin codificar: por eso esto se comprueba y no se confía.
    expect(url).not.toContain('\n');
  });

  it('el producto que se manda existe en el catálogo', () => {
    expect(leer('lib/products.ts')).toContain("slug: 'lona-plastificada-rafia-polytarp'");
  });
});

describe('ni precio ni certificado propio en ninguna superficie de la lona', () => {
  const FUENTES = [
    'lib/lona-config.ts',
    // La traducción de especificación a dibujo y los pictogramas compartidos
    // también son superficie pública: si un sello o un importe se cuela, se
    // cuela por el texto de una capa igual que por el de una píldora.
    'lib/lona-visual.ts',
    'components/LonaConfigurador.tsx',
    'components/LonaExploded.tsx',
    'components/LonaIconos.tsx',
    'app/(es)/configurador/lona/page.tsx',
  ];

  it('el resumen generado no contiene importes ni normas como credencial', () => {
    const t = lonaSummary(MUESTRA);
    expect(t).not.toMatch(/\bISO\b|\bASTM\b|\bUL\b/);
    expect(t).not.toMatch(/certificad/i);
    expect(t).not.toMatch(/S\/|USD|\$|\bprecio\s+(de|desde|unitario)/i);
  });

  it('la copia del configurador tampoco', () => {
    for (const f of FUENTES) {
      const src = leer(f);
      expect(src, `${f} cita una norma como credencial propia`).not.toMatch(/\bISO\s*\d/);
      expect(src, `${f} habla de certificación`).not.toMatch(/certificad[oa]s?\b/i);
      // «precio» sólo se admite para NEGARLO, como en el configurador de FIBC.
      for (const m of src.matchAll(/precio/gi)) {
        const ventana = src.slice(Math.max(0, m.index - 40), m.index + 10);
        expect(ventana, `${f} menciona precio sin negarlo`).toMatch(
          /sin\s+precio|no\s+calcula\s+precio|no\s+es\s+un\s+motor\s+de\s+precio/i,
        );
      }
    }
  });

  it('las cuatro preguntas al proveedor son verificables, no eslóganes', () => {
    expect(LONA_PREGUNTAS).toHaveLength(4);
    for (const p of LONA_PREGUNTAS) {
      expect(p.pregunta).toContain('¿');
      expect(p.porque.length).toBeGreaterThan(30);
      expect(p.porque).not.toMatch(/\bISO\b|certificad/i);
    }
  });
});

describe('el configurador de FIBC sigue intacto', () => {
  it('lib/fibc.ts y su página no se tocaron para meter el de lona', () => {
    expect(leer('lib/fibc.ts')).toContain('export function fibcSummary');
    const pagina = leer('app/(es)/configurador/page.tsx');
    expect(pagina).toContain('origen=configurador&');
    expect(pagina).toContain('fibcSummary(spec)');
  });
});
