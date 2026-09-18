import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  emptyLona,
  lonaSummary,
  LONA_TRATAMIENTO,
  LONA_GRAMAJE,
  LONA_PREGUNTAS,
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
  confeccion: ['ojales', 'hf'],
  tratamientos: ['uv', 'ignifugo'],
  medidas: '6 × 12 m',
  cantidad: '8 paños',
  uso: 'Cubierta de tolva',
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
    expect(t).toContain('Confección: Ojales, Soldadura HF');
    expect(t).toContain('Tratamientos: Anti-UV, Ignífugo');
    expect(t).toContain('Medidas del paño: 6 × 12 m');
    expect(t).toContain('Cantidad: 8 paños');
    expect(t).toContain('Uso previsto: Cubierta de tolva');
    // Lo que se promete es una confirmación escrita, no un plazo ni un monto.
    expect(t).toContain('se confirman por escrito en la cotización');
  });

  it('omite las líneas vacías en lugar de mandar campos en blanco', () => {
    const t = lonaSummary(emptyLona());
    expect(t).not.toMatch(/Medidas del paño:\s*$/m);
    expect(t).not.toMatch(/Cantidad:\s*$/m);
    expect(t).not.toMatch(/Uso previsto:\s*$/m);
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
    'components/LonaConfigurador.tsx',
    'components/LonaExploded.tsx',
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
