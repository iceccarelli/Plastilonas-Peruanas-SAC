import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  anchoMetros,
  capasDeLona,
  fraccionAncho,
  fraccionGramaje,
  gramajeMedio,
  specToVisualState,
  GRAMAJE_MAX,
  GRAMAJE_MIN,
} from '@/lib/lona-visual';
import {
  emptyLona,
  LONA_ANCHO,
  LONA_COLOR,
  LONA_GRAMAJE,
  LONA_MATERIAL,
  LONA_TEXTURA,
  LONA_TRATAMIENTO,
  type LonaSpec,
} from '@/lib/lona-config';

/**
 * QUE MOVER UNA PÍLDORA MUEVA ALGO.
 *
 * La queja que originó esta pasada fue «el dibujo no está vivo»: se cambiaba
 * el gramaje y sólo cambiaba una leyenda. La corrección es que la
 * especificación se traduzca a GEOMETRÍA, y una corrección así hay que poder
 * demostrarla sin abrir un navegador.
 *
 * Por eso la traducción vive en `lib/lona-visual.ts` como función pura y se
 * interroga aquí: nada de framer-motion, nada de jsdom, nada de medir un
 * atributo de un SVG renderizado. Si alguien vuelve a empatar dos gramajes al
 * mismo espesor, esta prueba lo dice con nombre y línea.
 */

const raiz = process.cwd();
const leer = (r: string) => readFileSync(join(raiz, r), 'utf8');

const con = (parcial: Partial<LonaSpec>): LonaSpec => ({ ...emptyLona(), ...parcial });

describe('specToVisualState — cada campo mueve algo distinto', () => {
  it('el gramaje ENGORDA la capa 3: más g/m², más espesor y más trama', () => {
    const espesores = LONA_GRAMAJE.filter((o) => o.value !== 'definir').map(
      (o) => specToVisualState(con({ gramaje: o.value })).espesorNucleo,
    );
    // Monótono creciente y sin empates: dos rangos distintos no pueden dibujarse
    // igual, porque entonces el gramaje seguiría siendo sólo texto.
    for (let i = 1; i < espesores.length; i++) {
      expect(espesores[i], `${espesores[i]} debería superar a ${espesores[i - 1]}`).toBeGreaterThan(
        espesores[i - 1],
      );
    }
    const finas = specToVisualState(con({ gramaje: '200-350' }));
    const gruesas = specToVisualState(con({ gramaje: '700-900' }));
    expect(gruesas.opacidadTrama).toBeGreaterThan(finas.opacidadTrama);
  });

  it('el ancho ENSANCHA el paño: el semiancho en px crece con los metros', () => {
    const anchos = ['1.5', '2.0', '3.0', '4.0'].map(
      (v) => specToVisualState(con({ ancho: v })).medioAncho,
    );
    for (let i = 1; i < anchos.length; i++) {
      expect(anchos[i]).toBeGreaterThan(anchos[i - 1]);
    }
    // «Más de 4.0 m» es el tope de una pieza, y además se dibuja la unión.
    const union = specToVisualState(con({ ancho: 'union' }));
    expect(union.medioAncho).toBe(anchos[anchos.length - 1]);
    expect(union.unionSoldada).toBe(true);
    expect(specToVisualState(con({ ancho: '4.0' })).unionSoldada).toBe(false);
  });

  it('cada material da una cara distinta, y sólo los tejidos llevan trama', () => {
    const caras = LONA_MATERIAL.map((o) => specToVisualState(con({ material: o.value })).cara);
    expect(new Set(caras).size).toBe(LONA_MATERIAL.length);
    expect(specToVisualState(con({ material: 'rafia' })).patronMaterial).toBe('lona-trama-rafia');
    expect(specToVisualState(con({ material: 'algodon' })).patronMaterial).toBe('lona-trama-lienzo');
    expect(specToVisualState(con({ material: 'pvc' })).patronMaterial).toBeNull();
    expect(specToVisualState(con({ material: 'polytarp' })).patronMaterial).toBeNull();
  });

  it('el color de la cara es el swatch del catálogo, no uno inventado', () => {
    for (const o of LONA_COLOR) {
      const v = specToVisualState(con({ color: o.value }));
      expect(v.colorCara).toBe(o.hex || '#94A3B8');
    }
  });

  it('los tres acabados se dibujan distinto: plano, con brillo y punteado', () => {
    expect(specToVisualState(con({ textura: 'mate' })).brillo).toBe(0);
    expect(specToVisualState(con({ textura: 'brillante' })).brillo).toBeGreaterThan(0.4);
    expect(specToVisualState(con({ textura: 'esmerilado' })).estipulado).toBe(true);
    expect(specToVisualState(con({ textura: 'mate' })).estipulado).toBe(false);
    // No aparece un cuarto acabado por la puerta de atrás.
    expect(LONA_TEXTURA).toHaveLength(3);
  });

  it('la confección entra y sale como pictograma, en el orden del catálogo', () => {
    const v = specToVisualState(con({ confeccion: ['cremallera', 'ojales'] }));
    expect(v.pictogramas).toEqual(['ojales', 'cremallera']);
    expect(specToVisualState(con({ confeccion: [] })).pictogramas).toEqual([]);
  });

  it('cada tratamiento suma capa, y los cuatro no borran el color', () => {
    const ninguno = specToVisualState(con({ tratamientos: [] }));
    const uno = specToVisualState(con({ tratamientos: ['uv'] }));
    const cuatro = specToVisualState(
      con({ tratamientos: LONA_TRATAMIENTO.map((t) => t.id) }),
    );
    expect(ninguno.opacidadTratamiento).toBe(0);
    expect(uno.opacidadTratamiento).toBeGreaterThan(0);
    expect(cuatro.opacidadTratamiento).toBeGreaterThan(uno.opacidadTratamiento);
    expect(cuatro.opacidadTratamiento).toBeLessThan(0.4);
    expect(cuatro.tratamientos).toHaveLength(4);
  });

  it('es determinista: la misma especificación da el mismo dibujo', () => {
    expect(specToVisualState(emptyLona())).toEqual(specToVisualState(emptyLona()));
  });
});

describe('ningún número se sale de la ficha real', () => {
  it('el gramaje medio de cada opción cae dentro de 200 – 900 g/m²', () => {
    for (const o of LONA_GRAMAJE) {
      const g = gramajeMedio(o.value);
      expect(g).toBeGreaterThanOrEqual(GRAMAJE_MIN);
      expect(g).toBeLessThanOrEqual(GRAMAJE_MAX);
    }
    // «A definir» no inventa un valor: cae en el centro del rango declarado.
    expect(gramajeMedio('definir')).toBe((GRAMAJE_MIN + GRAMAJE_MAX) / 2);
  });

  it('ningún ancho supera los 4.0 m de una sola pieza', () => {
    for (const o of LONA_ANCHO) {
      expect(anchoMetros(o.value)).toBeLessThanOrEqual(4);
    }
  });

  it('las fracciones de las barras de las píldoras van de 0 a 1', () => {
    for (const o of LONA_GRAMAJE) {
      expect(fraccionGramaje(o.value)).toBeGreaterThanOrEqual(0);
      expect(fraccionGramaje(o.value)).toBeLessThanOrEqual(1);
    }
    for (const o of LONA_ANCHO) {
      expect(fraccionAncho(o.value)).toBeGreaterThanOrEqual(0);
      expect(fraccionAncho(o.value)).toBeLessThanOrEqual(1);
    }
  });
});

describe('capasDeLona — la lista dice lo que el comprador eligió', () => {
  it('nombra los tratamientos y la confección elegidos, no un genérico', () => {
    const capas = capasDeLona(
      con({ tratamientos: ['uv', 'ignifugo'], confeccion: ['ojales'], ancho: '4.0' }),
    );
    expect(capas).toHaveLength(4);
    expect(capas[0].texto).toContain('Anti-UV');
    expect(capas[0].texto).toContain('Ignífugo');
    expect(capas[3].texto).toContain('Ojales');
    expect(capas[3].texto).toContain('hasta 4.0 m en una pieza');
  });

  it('sin nada elegido explica el abanico en lugar de quedarse en blanco', () => {
    const capas = capasDeLona(con({ tratamientos: [], confeccion: [] }));
    expect(capas[0].texto).toContain('se piden uno a uno');
    expect(capas[3].texto.length).toBeGreaterThan(30);
  });
});

describe('el dibujo se mueve, y se calla cuando se lo piden', () => {
  const exploded = leer('components/LonaExploded.tsx');

  it('las cuatro capas flotan con periodos distintos, no en bloque', () => {
    const duraciones = [...exploded.matchAll(/duracion:\s*([\d.]+)/g)].map((m) => Number(m[1]));
    expect(duraciones.length).toBe(4);
    expect(new Set(duraciones).size).toBe(4);
  });

  it('el bucle infinito se apaga con prefers-reduced-motion', () => {
    expect(exploded).toContain('useMovimiento');
    // El `repeat: Infinity` sólo se emite dentro del ternario de `mover`.
    for (const m of exploded.matchAll(/repeat: Infinity/g)) {
      const ventana = exploded.slice(Math.max(0, m.index - 220), m.index);
      expect(ventana, 'un bucle infinito sin guardia de movimiento').toContain('mover');
    }
  });

  it('no hay un bucle de requestAnimationFrame pintando el SVG a mano', () => {
    expect(exploded).not.toMatch(/requestAnimationFrame\s*\(/);
  });

  it('las capas y sus bloques son componentes del módulo, no del render', () => {
    // Definidos dentro del render serían un TIPO nuevo en cada pulsación:
    // React desmontaría las cuatro capas y la animación arrancaría de cero.
    expect(exploded).toMatch(/^function Capa\(/m);
    expect(exploded).toMatch(/^function Bloque\(/m);
  });
});

describe('la maquetación móvil pone el dibujo antes que la pared de píldoras', () => {
  const conf = leer('components/LonaConfigurador.tsx');

  it('el despiece es el primer hijo del formulario y queda pegado arriba', () => {
    const iDibujo = conf.indexOf('<LonaExploded');
    const iOpciones = conf.indexOf('<Fila titulo="Material"');
    expect(iDibujo).toBeGreaterThan(-1);
    expect(iDibujo, 'las píldoras vuelven a ir antes que el dibujo').toBeLessThan(iOpciones);
    expect(conf).toMatch(/sticky top-20/);
  });

  it('color, gramaje y ancho se recorren de lado con anclaje en móvil', () => {
    expect(conf).toContain('snap-x snap-mandatory');
    expect(conf).toContain('overflow-x-auto');
    expect((conf.match(/scroller\n/g) ?? conf.match(/ scroller>/g) ?? []).length).toBeGreaterThan(0);
  });

  it('cada píldora es un botón con estado y con 44 px de objetivo táctil', () => {
    expect(conf).toContain('aria-pressed={activa}');
    expect(conf).toContain('min-h-[44px]');
    expect(conf).toContain('whileTap');
  });

  it('la barra fija de la página completa se sienta ENCIMA de la de contacto', () => {
    // `components/BarraMovilContacto.tsx` mide 48px + área segura y vive en
    // z-[80]. Solaparse con ella robaría el toque a «Llamar» y «WhatsApp».
    expect(conf).toContain("bottom: 'calc(48px + env(safe-area-inset-bottom))'");
    expect(conf).toContain('z-[70]');
    expect(leer('components/BarraMovilContacto.tsx')).toContain('z-[80]');
  });
});

describe('el atajo al configurador completo se ve también en un teléfono', () => {
  it('ya no está escondido tras md:flex en la portada', () => {
    const portada = leer('app/(es)/page.tsx');
    const i = portada.indexOf('Abrir el configurador completo');
    expect(i).toBeGreaterThan(-1);
    const bloque = portada.slice(Math.max(0, i - 400), i);
    expect(bloque, 'el enlace vuelve a ocultarse en móvil').not.toContain('hidden md:flex');
  });
});
