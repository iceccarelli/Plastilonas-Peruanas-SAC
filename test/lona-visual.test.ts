import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  amplitudGiro,
  anchoMetros,
  apartadoCapa,
  capasDeLona,
  fraccionAncho,
  fraccionGramaje,
  gramajeMedio,
  layerParaControl,
  numeroDeOjales,
  opacidadCapa,
  pasoTramaNucleo,
  specToVisualState,
  tinteAcabado,
  GIRO_GRADOS,
  GIRO_SEGUNDOS,
  GRAMAJE_MAX,
  GRAMAJE_MIN,
  OJALES_MAX,
  OPACIDAD_APAGADA,
  type Capa,
} from '@/lib/lona-visual';
import {
  emptyLona,
  LONA_CONFECCION,
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
    // El bucle de reposo vive en CSS (`.lona-flote`, `.lona-giro`,
    // `.lona-suelo`) y la clase SÓLO se pone si `mover`. Cualquier
    // `repeat: Infinity` que vuelva a aparecer tiene que llevar su guardia.
    for (const m of exploded.matchAll(/repeat: Infinity/g)) {
      const ventana = exploded.slice(Math.max(0, m.index - 220), m.index);
      expect(ventana, 'un bucle infinito sin guardia de movimiento').toContain('mover');
    }
    for (const clase of ['lona-flote', 'lona-giro', 'lona-suelo']) {
      const i = exploded.indexOf(`'${clase}'`);
      expect(i, `la clase ${clase} ya no se aplica`).toBeGreaterThan(-1);
      expect(
        exploded.slice(Math.max(0, i - 120), i),
        `${clase} se aplica sin preguntar si puede moverse`,
      ).toContain('mover ?');
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

/* ------------------------------------------------------------------ */
/* EL MATERIAL SE VE, NO SE LEE — lo que esta pasada añadió al mapa     */
/* ------------------------------------------------------------------ */

describe('cada material responde a la luz de otra manera', () => {
  it('los cuatro materiales piden CUATRO degradados distintos', () => {
    const luces = LONA_MATERIAL.map((o) => specToVisualState(con({ material: o.value })).gradienteCara);
    expect(new Set(luces).size).toBe(LONA_MATERIAL.length);
    // PVC y polytarp comparten «sin trama»: lo único que los separa es la luz.
    const pvc = specToVisualState(con({ material: 'pvc' }));
    const pe = specToVisualState(con({ material: 'polytarp' }));
    expect(pvc.patronMaterial).toBe(pe.patronMaterial);
    expect(pvc.gradienteCara).not.toBe(pe.gradienteCara);
  });

  it('el acabado mate APLANA el reflejo y los otros dos no', () => {
    expect(specToVisualState(con({ textura: 'mate' })).aplanado).toBe(true);
    expect(specToVisualState(con({ textura: 'brillante' })).aplanado).toBe(false);
    expect(specToVisualState(con({ textura: 'esmerilado' })).aplanado).toBe(false);
  });
});

describe('el gramaje también CIERRA la trama del núcleo', () => {
  it('más g/m², azulejo más pequeño: estrictamente decreciente y sin empates', () => {
    const pasos = LONA_GRAMAJE.filter((o) => o.value !== 'definir').map((o) => pasoTramaNucleo(o.value));
    expect(new Set(pasos).size).toBe(pasos.length);
    for (let i = 1; i < pasos.length; i++) {
      expect(pasos[i], `${pasos[i]} debería ser menor que ${pasos[i - 1]}`).toBeLessThan(pasos[i - 1]);
    }
  });

  it('el azulejo sigue siendo dibujable: ni cero ni una pared de píxeles', () => {
    for (const o of LONA_GRAMAJE) {
      const paso = pasoTramaNucleo(o.value);
      expect(paso).toBeGreaterThan(2);
      expect(paso).toBeLessThan(12);
    }
    // «A definir» cae en el centro del rango, igual que el gramaje medio: no
    // inventa un tejido ni se va al extremo abierto.
    const abierto = pasoTramaNucleo('200-350');
    const cerrado = pasoTramaNucleo('700-900');
    expect(pasoTramaNucleo('definir')).toBeLessThan(abierto);
    expect(pasoTramaNucleo('definir')).toBeGreaterThan(cerrado);
  });

  it('el estado visual arrastra el azulejo, no lo recalcula el SVG', () => {
    for (const o of LONA_GRAMAJE) {
      expect(specToVisualState(con({ gramaje: o.value })).pasoTramaNucleo).toBe(
        pasoTramaNucleo(o.value),
      );
    }
  });
});

describe('ojales: cuántos se DIBUJAN, que no es cuántos lleva el paño', () => {
  it('sin ojales pedidos no se dibuja ninguno', () => {
    expect(numeroDeOjales('4.0', false)).toBe(0);
    expect(specToVisualState(con({ confeccion: ['hf'] })).ojales).toBe(0);
  });

  it('más ancho, más ojales: creciente y sin empates dentro del rango', () => {
    const cuentas = ['1.5', '2.0', '3.0', '4.0'].map((v) => numeroDeOjales(v, true));
    for (let i = 1; i < cuentas.length; i++) {
      expect(cuentas[i]).toBeGreaterThan(cuentas[i - 1]);
    }
  });

  it('el número está TOPADO: es una ilustración, no un despiece de herrajes', () => {
    for (const o of LONA_ANCHO) {
      const n = numeroDeOjales(o.value, true);
      expect(n).toBeGreaterThanOrEqual(4);
      expect(n).toBeLessThanOrEqual(OJALES_MAX);
    }
    expect(OJALES_MAX).toBeLessThanOrEqual(10);
    // «Más de 4.0 m» no dispara el dibujo al infinito: se queda en el tope.
    expect(numeroDeOjales('union', true)).toBe(OJALES_MAX);
  });

  it('la confección elegida es la que decide, no el ancho por su cuenta', () => {
    const conOjales = specToVisualState(con({ confeccion: LONA_CONFECCION.map((c) => c.id) }));
    expect(conOjales.ojales).toBeGreaterThan(0);
    expect(specToVisualState(con({ confeccion: [] })).ojales).toBe(0);
  });
});

describe('el barniz de la capa 01 se tiñe con lo que se pidió', () => {
  it('cada tratamiento da un tinte propio y ninguno repite', () => {
    const tintes = LONA_TRATAMIENTO.map((t) => tinteAcabado([t.id]));
    expect(new Set(tintes).size).toBe(LONA_TRATAMIENTO.length);
    for (const t of tintes) expect(t).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('sin tratamientos hay un tinte neutro, no un color inventado', () => {
    const neutro = tinteAcabado([]);
    expect(neutro).toMatch(/^#[0-9A-F]{6}$/);
    for (const t of LONA_TRATAMIENTO) expect(tinteAcabado([t.id])).not.toBe(neutro);
  });

  it('dos tratamientos MEZCLAN: un paño lleva un acabado, no dos barnices', () => {
    const a = tinteAcabado(['uv']);
    const b = tinteAcabado(['antiestatico']);
    const mezcla = tinteAcabado(['uv', 'antiestatico']);
    expect(mezcla).not.toBe(a);
    expect(mezcla).not.toBe(b);
    // El orden no cambia una mezcla.
    expect(tinteAcabado(['antiestatico', 'uv'])).toBe(mezcla);
  });

  it('un id inventado no ensucia el tinte', () => {
    expect(tinteAcabado(['noexiste'])).toBe(tinteAcabado([]));
    expect(tinteAcabado(['uv', 'noexiste'])).toBe(tinteAcabado(['uv']));
  });

  it('el estado visual arrastra el tinte de los tratamientos elegidos', () => {
    expect(specToVisualState(con({ tratamientos: ['ignifugo'] })).tinteAcabado).toBe(
      tinteAcabado(['ignifugo']),
    );
  });
});

/* ------------------------------------------------------------------ */
/* AISLAR UNA CAPA — el mapa control → capa, sin renderizar nada        */
/* ------------------------------------------------------------------ */

describe('layerParaControl — qué capa enseña cada fila de píldoras', () => {
  it('cada control apunta a la capa que de verdad gobierna', () => {
    expect(layerParaControl('material')).toBe(2);
    expect(layerParaControl('color')).toBe(2);
    expect(layerParaControl('textura')).toBe(2);
    expect(layerParaControl('gramaje')).toBe(3);
    expect(layerParaControl('ancho')).toBe(4);
    expect(layerParaControl('confeccion')).toBe(4);
    expect(layerParaControl('tratamientos')).toBe(1);
  });

  it('un control desconocido no aísla nada en vez de aislar la capa 1', () => {
    expect(layerParaControl('inventado')).toBeNull();
    expect(layerParaControl('')).toBeNull();
  });

  it('las cuatro capas son alcanzables desde alguna fila', () => {
    const controles = ['material', 'color', 'textura', 'gramaje', 'ancho', 'confeccion', 'tratamientos'];
    const capas = new Set(controles.map(layerParaControl));
    expect(capas).toEqual(new Set([1, 2, 3, 4]));
  });

  it('cada fila del configurador declara un control que el mapa conoce', () => {
    const conf = leer('components/LonaConfigurador.tsx');
    for (const m of conf.matchAll(/<Fila[^>]*control="([^"]+)"/g)) {
      expect(layerParaControl(m[1]), `<Fila control="${m[1]}"> no apunta a ninguna capa`).not.toBeNull();
    }
    // Las siete filas están enganchadas, no tres.
    expect([...conf.matchAll(/<Fila[^>]*control="/g)]).toHaveLength(7);
  });
});

describe('aislar apaga las otras tres y no toca la selección', () => {
  const CAPAS: Capa[] = [1, 2, 3, 4];

  it('sin nada señalado todas las capas están a plena opacidad', () => {
    for (const n of CAPAS) expect(opacidadCapa(n, null)).toBe(1);
  });

  it('la señalada se queda entera y las otras caen al rango pedido', () => {
    for (const foco of CAPAS) {
      expect(opacidadCapa(foco, foco)).toBe(1);
      for (const n of CAPAS.filter((c) => c !== foco)) {
        expect(opacidadCapa(n, foco)).toBe(OPACIDAD_APAGADA);
      }
    }
    expect(OPACIDAD_APAGADA).toBeGreaterThanOrEqual(0.08);
    expect(OPACIDAD_APAGADA).toBeLessThanOrEqual(0.18);
  });

  it('las apagadas además se apartan, y la señalada no se mueve', () => {
    expect(apartadoCapa(3, 3)).toBe(0);
    expect(apartadoCapa(1, 3)).toBeLessThan(0);
    expect(apartadoCapa(4, 3)).toBeGreaterThan(0);
    for (const n of CAPAS) expect(apartadoCapa(n, null)).toBe(0);
  });
});

describe('giro de plataforma — se mira, no marea', () => {
  it('la guiñada aparente cae en el margen conservador pedido', () => {
    expect(GIRO_GRADOS).toBeGreaterThanOrEqual(6);
    expect(GIRO_GRADOS).toBeLessThanOrEqual(12);
  });

  it('el ciclo es lento: entre 12 y 20 segundos de ida y vuelta', () => {
    expect(GIRO_SEGUNDOS).toBeGreaterThanOrEqual(12);
    expect(GIRO_SEGUNDOS).toBeLessThanOrEqual(20);
  });

  it('el centro de la pila queda quieto y los extremos se abren al revés', () => {
    const a = ([1, 2, 3, 4] as Capa[]).map(amplitudGiro);
    expect(a[0]).toBeLessThan(0);
    expect(a[3]).toBeGreaterThan(0);
    expect(a[0]).toBe(-a[3]);
    expect(a[1]).toBe(-a[2]);
    // Creciente: si dos capas compartieran amplitud no habría giro, habría
    // traslación, y el conjunto volvería a moverse como un bloque.
    for (let i = 1; i < a.length; i++) expect(a[i]).toBeGreaterThan(a[i - 1]);
  });
});

/* ------------------------------------------------------------------ */
/* GUARDIAS DE CÓDIGO FUENTE — lo que no se puede probar sin navegador  */
/* ------------------------------------------------------------------ */

describe('el material se dibuja como material, no como hoja de cálculo', () => {
  const exploded = leer('components/LonaExploded.tsx');

  it('el tejido es un ENTRELAZADO, no dos líneas cruzadas', () => {
    // El ligamento tafetán se dibuja en tres pasadas con orden de pintado:
    // trama por debajo, urdimbre entera, trama por encima. Si alguien vuelve a
    // poner un <pattern> de dos <path> cruzados, esto se cae.
    expect(exploded).toMatch(/^function Tejido\(/m);
    expect(exploded).toContain('por debajo');
    expect(exploded).toContain('urdimbre');
    expect(exploded).toContain('por encima');
    for (const id of ['lona-trama-rafia', 'lona-trama-lienzo', 'lona-trama-nucleo']) {
      expect(exploded, `falta el tejido ${id}`).toContain(`id="${id}"`);
    }
    // El azulejo del núcleo sale del mapa puro, no de un número a mano.
    expect(exploded).toContain('paso={v.pasoTramaNucleo}');
  });

  it('los ojales son herraje metálico, no círculos oscuros', () => {
    expect(exploded).toMatch(/^function Ojal\(/m);
    expect(exploded).toContain('url(#lona-metal)');
    // Aro, barril, agujero y reflejo: cuatro trazos, no uno.
    expect((exploded.match(/<circle cx=\{x\}/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(exploded).toContain('v.ojales');
  });

  it('la confección se dibuja SOBRE la capa, no como insignia colgada', () => {
    expect(exploded).toMatch(/^function Confeccion\(/m);
    for (const id of LONA_CONFECCION) {
      expect(exploded, `${id.id} dejó de dibujarse`).toContain(`id === '${id.id}'`);
    }
  });

  it('ninguna capa vuelve a ser un relleno plano sin respuesta a la luz', () => {
    for (const id of ['lona-luz-gloss', 'lona-luz-mate', 'lona-luz-tejido', 'lona-luz-lienzo']) {
      expect(exploded, `falta el degradado ${id}`).toContain(`id="${id}"`);
    }
    expect(exploded).toContain('url(#lona-barniz)');
  });
});

describe('el aislado funciona con reduced-motion; los bucles NO', () => {
  const exploded = leer('components/LonaExploded.tsx');
  const conf = leer('components/LonaConfigurador.tsx');
  const css = leer('app/globals.css');

  it('hay un camino de aislado, y su transición depende de reduced-motion', () => {
    expect(exploded).toContain('opacidadCapa');
    expect(exploded).toContain('apartadoCapa');
    // La transición del aislado se elige con la MISMA respuesta que apaga los
    // bucles, pero al revés: con reduced-motion el aislado sigue existiendo y
    // lo que desaparece es la animación, que pasa a durar 0 ms.
    expect(exploded).toMatch(/const aislar = permiteMovimiento \? SUAVE : YA/);
    expect(exploded).toMatch(/const YA = '0ms'/);
    expect(exploded).toContain('transition: `opacity ${aislar}`');
    expect(exploded).toContain('transition: `transform ${aislar}`');
  });

  it('el aislado llega por ratón Y por teclado, sin tocar aria-pressed', () => {
    expect(exploded).toContain('onMouseEnter');
    expect(conf).toContain('onFocus:');
    expect(conf).toContain('onBlur:');
    expect(conf).toContain('onMouseEnter:');
    expect(conf).toContain('onMouseLeave:');
    // La señal visual no pasa nunca por el estado de selección.
    expect(conf).toContain('aria-pressed={activa}');
    expect(conf).not.toMatch(/aria-pressed=\{[^}]*aislada/);
  });

  it('los bucles de reposo se APAGAN con reduced-motion, no se ralentizan', () => {
    // `mover` es la conjunción: el permiso del usuario Y estar en pantalla.
    expect(exploded).toMatch(/const mover = permiteMovimiento && enVista/);
    expect(exploded).toContain('useMovimiento()');
    // Y en la hoja de estilo, la guardia de cinturón: `animation: none`, que
    // es apagar. Una duración más larga sería ralentizar, y no vale.
    const i = css.indexOf('@keyframes lona-flote');
    expect(i, 'los fotogramas del despiece desaparecieron de globals.css').toBeGreaterThan(-1);
    const bloque = css.slice(i);
    expect(bloque).toContain('@media (prefers-reduced-motion: reduce)');
    for (const clase of ['.lona-flote', '.lona-giro', '.lona-pulso', '.lona-suelo']) {
      expect(bloque, `${clase} no está en la guardia de reduced-motion`).toContain(clase);
    }
    expect(bloque).toMatch(/\.lona-suelo\s*\{\s*animation: none !important/);
  });

  it('el giro sale del mapa puro, no de un número escrito a mano en el SVG', () => {
    expect(exploded).toContain('GIRO_SEGUNDOS');
    expect(exploded).toContain('amplitudGiro(n)');
    expect(css).toContain('@keyframes lona-giro');
    // Va y VUELVE: hay tope a un lado y al otro, no un giro continuo.
    const giro = css.slice(css.indexOf('@keyframes lona-giro'));
    expect(giro).toContain('* -1px');
    expect(giro).toContain('* 1px');
  });

  it('el bucle se para también fuera de pantalla, con el observador de siempre', () => {
    expect(exploded).toContain('useInView');
    expect(exploded).toMatch(/const enVista = useInView\(/);
  });

  it('nada anima geometría por fotograma: sólo transform y opacity', () => {
    const css2 = css.slice(css.indexOf('@keyframes lona-flote'));
    // Un `@keyframes` que tocara `d`, `points`, `width` o `rx` obligaría a
    // recalcular la geometría del SVG en cada fotograma.
    expect(css2).not.toMatch(/\b(points|width|height|rx|ry|stroke-width)\s*:/);
    for (const m of css2.matchAll(/^\s*\d+%[^{]*\{([^}]*)\}/gm)) {
      for (const prop of m[1].split(';').map((x) => x.split(':')[0].trim()).filter(Boolean)) {
        expect(['transform', 'opacity'], `@keyframes anima «${prop}»`).toContain(prop);
      }
    }
  });
});
