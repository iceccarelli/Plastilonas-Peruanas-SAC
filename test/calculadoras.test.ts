import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  calculadoras,
  calculadoraPorSlug,
  calculadorasQueEnlazan,
  valoresIniciales,
  factorTraslape,
  cuantosCaben,
  cuantosNecesarios,
  airePorPersona,
  AIRE_POR_HP_DIESEL,
  ADVERTENCIA,
  CALCULADORAS_ACTUALIZADO,
} from '@/lib/calculadoras';
import { buildCalculadorasJson } from '@/lib/calculadoras-feed';
import { terminos } from '@/lib/glosario';
import { articles } from '@/lib/articles';
import { solutions } from '@/lib/solutions';

/* ==================================================================
   1. La aritmética. Es el producto: si el número está mal, todo lo
      demás —el diseño, el schema, el JSON— es decoración de un error.
   ================================================================== */

describe('geomembrana para poza: contra geometría comprobable a mano', () => {
  const calc = calculadoraPorSlug('geomembrana-poza')!;
  const base = {
    largo: 30, ancho: 20, profundidad: 4, talud: 2,
    anchoRollo: 7, traslape: 0, zanja: 0, desperdicio: 0,
  };

  it('con talud 0 el vaso es una caja y el desarrollo es exacto', () => {
    // Caja de 10 × 10 × 2: fondo 100 m², cuatro paredes de 10 × 2 = 80 m².
    const r = calc.calcular({ ...base, largo: 10, ancho: 10, profundidad: 2, talud: 0 });
    const area = r.principales[0].valor;
    expect(area).toBeCloseTo(100 + 80, 4);
  });

  it('coincide con el volumen de una pirámide cuando el fondo se cierra', () => {
    // L = A = 2·n·h hace que el fondo valga cero: el vaso ES una pirámide
    // invertida, cuyo volumen es (1/3)·base·altura. Es el caso límite que
    // detecta un prismatoide mal escrito.
    const n = 2, h = 3;
    const lado = 2 * n * h; // 12
    const r = calc.calcular({ ...base, largo: lado + 0.0001, ancho: lado + 0.0001, profundidad: h, talud: n });
    const capacidad = r.desglose.find((d) => d.etiqueta.startsWith('Capacidad'))!.valor;
    expect(capacidad).toBeCloseTo((1 / 3) * lado * lado * h, 1);
  });

  it('el talud desarrollado es la hipotenusa, no la profundidad', () => {
    // Confundirlos es el error clásico: subestima el material justo en la
    // superficie más grande del vaso.
    const r = calc.calcular(base);
    const s = r.desglose.find((d) => d.etiqueta === 'Talud desarrollado')!.valor;
    expect(s).toBeCloseTo(4 * Math.sqrt(5), 2);
    expect(s).toBeGreaterThan(4);
  });

  it('se niega a calcular cuando los taludes se cruzan antes del fondo', () => {
    // 20 m de ancho con talud 3H:1V y 4 m de profundidad da un fondo de −4 m.
    // Emitir un área a partir de eso sería devolver un número sin significado.
    const r = calc.calcular({ ...base, ancho: 20, profundidad: 4, talud: 3 });
    expect(r.invalido).toBeTruthy();
    expect(r.principales).toHaveLength(0);
  });

  it('el traslape no puede tragarse el ancho del rollo', () => {
    const r = calc.calcular({ ...base, anchoRollo: 4, traslape: 4 });
    expect(r.invalido).toBeTruthy();
  });

  it('la zanja y el desperdicio SUMAN, nunca restan', () => {
    const sin = calc.calcular(base).principales[0].valor;
    const con = calc.calcular({ ...base, zanja: 1.5, desperdicio: 5 }).principales[0].valor;
    expect(con).toBeGreaterThan(sin);
  });
});

describe('conteo de piezas enteras: coma flotante que cuesta dinero', () => {
  it('una medida que encaja exacto no pierde una pieza por redondeo binario', () => {
    // 2,4 ÷ 0,8 vale 2,9999999999999996 en coma flotante. Con Math.floor a
    // secas, cada viaje perdía una fila entera de bolsones.
    expect(2.4 / 0.8).toBeLessThan(3); // se documenta el ruido, no se supone
    expect(cuantosCaben(2.4, 0.8)).toBe(3);
    expect(cuantosCaben(2.4, 1.2)).toBe(2);
    expect(cuantosCaben(12, 4)).toBe(3);
  });

  it('una holgura REAL sigue sin contar de más', () => {
    // La tolerancia es ruido de representación, no una manga ancha.
    expect(cuantosCaben(2.399, 0.8)).toBe(2);
    expect(cuantosCaben(2.3, 0.8)).toBe(2);
    expect(cuantosCaben(0.5, 0.8)).toBe(0);
  });

  it('el redondeo hacia arriba tampoco compra de más por ruido', () => {
    // 2,1 ÷ 0,3 vale 7,000000000000001: Math.ceil compraba un paño entero
    // que nadie iba a usar.
    expect(2.1 / 0.3).toBeGreaterThan(7);
    expect(cuantosNecesarios(2.1, 0.3)).toBe(7);
    expect(cuantosNecesarios(2.2, 0.3)).toBe(8);
    expect(cuantosNecesarios(0, 3.7)).toBe(0);
  });

  it('no divide por cero ni devuelve infinitos', () => {
    expect(cuantosCaben(5, 0)).toBe(0);
    expect(cuantosNecesarios(5, 0)).toBe(0);
  });
});

describe('factor de solape: geometría, no un porcentaje inventado', () => {
  it('un rollo de 7 m con 0,1 m de traslape cubre 6,9 m', () => {
    expect(factorTraslape(7, 0.1)).toBeCloseTo(7 / 6.9, 10);
  });
  it('sin traslape el factor es exactamente 1', () => {
    expect(factorTraslape(4, 0)).toBe(1);
  });
  it('un traslape igual o mayor que el ancho no deja ancho útil', () => {
    expect(Number.isFinite(factorTraslape(4, 4))).toBe(false);
    expect(Number.isFinite(factorTraslape(4, 5))).toBe(false);
  });
});

describe('caudal de ventilación: la escala por altitud es escalonada', () => {
  it('cada tramo devuelve el valor publicado en la guía del sitio', () => {
    expect(airePorPersona(0)).toBe(3);
    expect(airePorPersona(1500)).toBe(3);
    expect(airePorPersona(1501)).toBe(4);
    expect(airePorPersona(3000)).toBe(4);
    expect(airePorPersona(3001)).toBe(5);
    expect(airePorPersona(4000)).toBe(5);
    expect(airePorPersona(4001)).toBe(6);
  });

  it('nunca baja al subir: una escala que no es monótona está mal transcrita', () => {
    let previo = 0;
    for (let m = 0; m <= 5500; m += 50) {
      const v = airePorPersona(m);
      expect(v).toBeGreaterThanOrEqual(previo);
      previo = v;
    }
  });

  it('suma personal y diésel, y el ventilador entrega más que el frente', () => {
    const calc = calculadoraPorSlug('caudal-ventilacion-mina')!;
    const r = calc.calcular({ personas: 10, altitud: 4200, hpDiesel: 100, seccion: 16, anfo: 0, fugas: 20 });
    const frente = r.principales[0].valor;
    const ventilador = r.principales[1].valor;
    expect(frente).toBeCloseTo(10 * 6 + 100 * AIRE_POR_HP_DIESEL, 4);
    expect(ventilador).toBeCloseTo(frente / 0.8, 1);
    expect(ventilador).toBeGreaterThan(frente);
  });

  it('avisa cuando la velocidad no llega al mínimo, y el mínimo sube con ANFO', () => {
    const calc = calculadoraPorSlug('caudal-ventilacion-mina')!;
    // Caudal bajo en sección grande: la velocidad cae por debajo del mínimo.
    const base = { personas: 1, altitud: 0, hpDiesel: 0, seccion: 30, anfo: 0, fugas: 0 };
    expect(calc.calcular(base).avisos.join(' ')).toMatch(/por debajo del mínimo de 20/);
    expect(calc.calcular({ ...base, anfo: 1 }).avisos.join(' ')).toMatch(/por debajo del mínimo de 25/);
  });

  it('SIEMPRE declara que no incluye la dilución de voladura', () => {
    // Es la demanda que gobierna en labores ciegas de avance. Un caudal
    // presentado sin esa salvedad se usa como si fuera el total.
    const calc = calculadoraPorSlug('caudal-ventilacion-mina')!;
    for (const fugas of [0, 15, 40]) {
      const r = calc.calcular({ personas: 5, altitud: 3500, hpDiesel: 200, seccion: 16, anfo: 1, fugas });
      expect(r.avisos.join(' ')).toMatch(/dilución de gases de voladura/);
    }
  });
});

describe('rollos por superficie: redondeo hacia arriba, siempre', () => {
  const calc = calculadoraPorSlug('rollos-por-superficie')!;

  it('medio paño no cubre: se sube al entero', () => {
    // 40 m de ancho con paños útiles de 3,7 m son 10,81 paños → 11.
    const r = calc.calcular({ largo: 100, ancho: 40, anchoRollo: 4, largoRollo: 100, traslape: 0.3, desperdicio: 0 });
    expect(r.desglose.find((d) => d.etiqueta === 'Paños a lo ancho')!.valor).toBe(11);
  });

  it('el material comprado nunca es menor que la superficie', () => {
    for (const ancho of [1, 7.5, 40, 133]) {
      const r = calc.calcular({ largo: 60, ancho, anchoRollo: 4, largoRollo: 50, traslape: 0.3, desperdicio: 0 });
      const superficie = r.desglose.find((d) => d.etiqueta === 'Superficie a cubrir')!.valor;
      const comprado = r.desglose.find((d) => d.etiqueta === 'Material comprado')!.valor;
      expect(comprado, `ancho ${ancho}`).toBeGreaterThanOrEqual(superficie);
    }
  });

  it('avisa cuando el paño necesita un empalme que no está contado', () => {
    const r = calc.calcular({ largo: 300, ancho: 10, anchoRollo: 4, largoRollo: 100, traslape: 0.3, desperdicio: 0 });
    expect(r.avisos.join(' ')).toMatch(/empalme/);
  });
});

describe('big bags por viaje: manda la restricción más apretada', () => {
  const calc = calculadoraPorSlug('big-bags-por-viaje')!;
  const base = {
    bolsaA: 1, bolsaB: 1, bolsaH: 1.2, pesoLleno: 1000,
    espacioL: 6, espacioA: 2.4, espacioH: 2.4, cargaUtil: 26000, apilable: 0,
  };

  it('con material denso manda el peso y lo dice', () => {
    const r = calc.calcular({ ...base, pesoLleno: 1500, cargaUtil: 9000 });
    expect(r.principales[0].valor).toBe(6);
    expect(r.avisos.join(' ')).toMatch(/Manda el PESO/);
  });

  it('con material ligero manda el espacio y lo dice', () => {
    const r = calc.calcular({ ...base, pesoLleno: 200 });
    expect(r.principales[0].valor).toBe(12); // 6 × 2 en el piso
    expect(r.avisos.join(' ')).toMatch(/Manda el ESPACIO/);
  });

  it('prueba las dos orientaciones y se queda con la mejor', () => {
    // 1,2 × 0,8 en 2,4 de ancho: en una orientación entran 2 filas, en la otra 3.
    const r = calc.calcular({ ...base, bolsaA: 1.2, bolsaB: 0.8, espacioL: 2.4, espacioA: 2.4, pesoLleno: 1 });
    expect(r.desglose.find((d) => d.etiqueta === 'Bolsones por piso')!.valor).toBe(6);
  });

  it('no apila salvo que se declare apilable, y avisa de la capacidad dormida', () => {
    const sinApilar = calc.calcular(base);
    expect(sinApilar.desglose.find((d) => d.etiqueta === 'Pisos')!.valor).toBe(1);
    expect(sinApilar.avisos.join(' ')).toMatch(/no apilables/);

    const apilando = calc.calcular({ ...base, apilable: 1, pesoLleno: 100 });
    expect(apilando.desglose.find((d) => d.etiqueta === 'Pisos')!.valor).toBe(2);
    expect(apilando.avisos.join(' ')).toMatch(/DISEÑADO para apilamiento/);
  });

  it('nunca devuelve más bolsones de los que admite la carga útil', () => {
    for (const peso of [50, 300, 900, 1500, 2000]) {
      const r = calc.calcular({ ...base, pesoLleno: peso });
      const cargados = r.principales[0].valor * peso;
      expect(cargados, `peso ${peso}`).toBeLessThanOrEqual(base.cargaUtil);
    }
  });
});

describe('capacidad de big bag: la SWL manda sobre el volumen', () => {
  const calc = calculadoraPorSlug('capacidad-big-bag')!;

  it('avisa cuando el contenido supera la carga de trabajo segura', () => {
    // Un metro cúbico de mineral denso pasa holgadamente de 1000 kg. Es el
    // error real del rubro: se especifica el bolsón por volumen y se compra
    // uno que no sostiene el contenido.
    const r = calc.calcular({ bolsaA: 1, bolsaB: 1, bolsaH: 1, densidad: 1.8, llenado: 100, swl: 1000 });
    expect(r.principales[0].valor).toBeCloseTo(1800, 0);
    expect(r.avisos.join(' ')).toMatch(/NO sirve/);
  });

  it('no avisa cuando hay holgura suficiente', () => {
    const r = calc.calcular({ bolsaA: 0.9, bolsaB: 0.9, bolsaH: 1, densidad: 0.8, llenado: 90, swl: 1000 });
    expect(r.avisos.join(' ')).not.toMatch(/NO sirve/);
  });

  it('el peso escala linealmente con volumen, densidad y llenado', () => {
    const uno = calc.calcular({ bolsaA: 1, bolsaB: 1, bolsaH: 1, densidad: 1, llenado: 100, swl: 5000 });
    const doble = calc.calcular({ bolsaA: 1, bolsaB: 1, bolsaH: 2, densidad: 1, llenado: 100, swl: 5000 });
    expect(doble.principales[0].valor).toBeCloseTo(uno.principales[0].valor * 2, 0);
  });
});

/* ==================================================================
   2. Invariantes de todo el conjunto.
   ================================================================== */

describe('todas las calculadoras: reglas que ninguna puede romper', () => {
  it('los slugs son únicos', () => {
    const slugs = calculadoras.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('cada una publica su fórmula, sus supuestos y sus límites', () => {
    // `noCubre` es obligatorio: una herramienta que calla sus límites induce
    // a usarla fuera de ellos.
    for (const c of calculadoras) {
      expect(c.formula.length, `${c.slug}: sin fórmula`).toBeGreaterThan(0);
      expect(c.supuestos.length, `${c.slug}: sin supuestos`).toBeGreaterThan(0);
      expect(c.noCubre.length, `${c.slug}: sin límites declarados`).toBeGreaterThan(0);
      expect(c.pregunta.endsWith('?'), `${c.slug}: la pregunta no es una pregunta`).toBe(true);
    }
  });

  it('cada calcular() solo lee campos que la calculadora declara', () => {
    // Un identificador mal escrito dentro de calcular() no rompe nada: lee
    // undefined, aplica el `?? 0` y devuelve un número plausible y falso.
    // Este test lo caza usando un Proxy que anota qué claves se leyeron.
    for (const c of calculadoras) {
      const declarados = new Set(c.campos.map((campo) => campo.id));
      const leidos = new Set<string>();
      const espia = new Proxy(valoresIniciales(c), {
        get(obj, clave) {
          if (typeof clave === 'string') leidos.add(clave);
          return Reflect.get(obj, clave);
        },
      });
      c.calcular(espia);
      for (const clave of leidos) {
        expect(declarados.has(clave), `${c.slug}: calcular() lee "${clave}", que no es un campo`).toBe(true);
      }
      // Y al revés: un campo que nadie lee es un control que no hace nada.
      for (const id of declarados) {
        expect(leidos.has(id), `${c.slug}: el campo "${id}" no lo usa nadie`).toBe(true);
      }
    }
  });

  it('los valores de partida producen un resultado, no un error', () => {
    for (const c of calculadoras) {
      const r = c.calcular(valoresIniciales(c));
      expect(r.invalido, `${c.slug}: los valores de partida no calculan`).toBeUndefined();
      expect(r.principales.length, `${c.slug}: sin resultado principal`).toBeGreaterThan(0);
      for (const p of r.principales) {
        expect(Number.isFinite(p.valor), `${c.slug}: ${p.etiqueta} no es finito`).toBe(true);
      }
    }
  });

  it('los valores de partida respetan los límites del propio campo', () => {
    for (const c of calculadoras) {
      for (const campo of c.campos) {
        if (campo.min !== undefined) expect(campo.porDefecto, `${c.slug}.${campo.id}`).toBeGreaterThanOrEqual(campo.min);
        if (campo.max !== undefined) expect(campo.porDefecto, `${c.slug}.${campo.id}`).toBeLessThanOrEqual(campo.max);
        if (campo.tipo === 'opcion') {
          expect(campo.opciones?.some((o) => o.valor === campo.porDefecto), `${c.slug}.${campo.id}`).toBe(true);
        }
      }
    }
  });

  it('ningún enlace de respaldo apunta a una ruta que no existe', () => {
    // Un enlace muerto en la sección que dice "de dónde sale esto" destruye
    // exactamente la credibilidad que la sección existe para construir.
    const vivas = new Set<string>([
      '/cotizacion',
      ...terminos.map((t) => `/glosario/${t.slug}`),
      ...articles.map((a) => `/recursos/${a.slug}`),
      ...solutions.map((s) => `/soluciones/${s.slug}`),
    ]);
    for (const c of calculadoras) {
      for (const e of c.verTambien) {
        expect(vivas.has(e.href), `${c.slug} enlaza a ${e.href}, que no existe`).toBe(true);
      }
    }
  });

  it('el enlace inverso se deriva y coincide con el directo', () => {
    for (const c of calculadoras) {
      for (const e of c.verTambien) {
        expect(calculadorasQueEnlazan(e.href).map((x) => x.slug)).toContain(c.slug);
      }
    }
    expect(calculadorasQueEnlazan('/no/existe')).toHaveLength(0);
  });

  it('no aparece ni un precio, ni una moneda, ni una promesa comercial', () => {
    // Una calculadora que termina en un precio deja de ser una referencia.
    const texto = calculadoras
      .map((c) => [c.titulo, c.pregunta, c.resumen, ...c.formula, ...c.supuestos, ...c.noCubre].join(' '))
      .join(' ');
    expect(texto).not.toMatch(/S\/\s?\d|US\$|USD|\bprecio\b|\bcotización de\b|\bdescuento\b/i);
  });

  it('la fecha de revisión del método no está en el futuro', () => {
    // Ya ocurrió antes en este repositorio: una fecha adelantada hace que el
    // informe de vigilancia diga "verificada hace −1 días".
    const hoy = new Date().toISOString().slice(0, 10);
    expect(CALCULADORAS_ACTUALIZADO <= hoy, `${CALCULADORAS_ACTUALIZADO} es futura`).toBe(true);
  });
});

/* ==================================================================
   3. Publicación: schema, volcado, sitemap, llms.txt y privacidad.
   ================================================================== */

describe('los métodos publicados como datos', () => {
  const json = JSON.parse(buildCalculadorasJson());

  it('publica la fórmula COMPLETA de cada método', () => {
    // Reservarse el método para obligar a usar el formulario es exactamente
    // el movimiento que impide llegar a ser referencia.
    expect(json.totalMetodos).toBe(calculadoras.length);
    for (const d of json.dataset) {
      const calc = calculadoraPorSlug(d.identifier)!;
      expect(d.formula).toEqual(calc.formula);
      expect(d.noCubre).toEqual(calc.noCubre);
      expect(d.entrada.length).toBe(calc.campos.length);
    }
  });

  it('dice cómo citarlo y exige citar también los límites', () => {
    expect(json.uso.atribucionSugerida).toContain('Plastilonas');
    expect(json.uso.alCitar).toMatch(/noCubre/);
    expect(json.advertencia).toBe(ADVERTENCIA);
  });

  it('marca qué entradas son supuestos editables y cuáles son datos', () => {
    const geo = json.dataset.find((d: { identifier: string }) => d.identifier === 'geomembrana-poza');
    const traslape = geo.entrada.find((e: { id: string }) => e.id === 'traslape');
    const largo = geo.entrada.find((e: { id: string }) => e.id === 'largo');
    expect(traslape.esSupuestoEditable).toBe(true);
    expect(largo.esSupuestoEditable).toBe(false);
  });

  it('las URLs de respaldo son absolutas', () => {
    for (const d of json.dataset) {
      for (const r of d.respaldo) expect(r.url).toMatch(/^https?:\/\//);
    }
  });

  it('no publica precios ni disponibilidad', () => {
    expect(JSON.stringify(json)).not.toMatch(/"precio"|"price"|"stock"|"disponibilidad"/i);
  });
});

describe('integración con el resto del sitio', () => {
  const raiz = process.cwd();

  it('todas las calculadoras están en el sitemap', () => {
    const src = readFileSync(join(raiz, 'app/sitemap.ts'), 'utf8');
    expect(src).toMatch(/calculadoraRoutes/);
    expect(src).toMatch(/\.\.\.calculadoraRoutes/);
    // La fecha es la de revisión del método, no "hoy": declarar cambios
    // diarios en una fórmula que no cambia enseña al rastreador a desconfiar.
    expect(src).toMatch(/new Date\(CALCULADORAS_ACTUALIZADO\)/);
    expect(src).not.toMatch(/calculadoras\.map[\s\S]{0,200}lastModified: now/);
  });

  it('llms.txt declara la sección, el volcado y la regla de cita', () => {
    const src = readFileSync(join(raiz, 'app/llms.txt/route.ts'), 'utf8');
    expect(src).toMatch(/## Calculadoras de predimensionamiento/);
    expect(src).toMatch(/calculadoras\/formulas\.json/);
    expect(src).toMatch(/noCubre/);
  });

  it('la página emite HowTo y SoftwareApplication', () => {
    const src = readFileSync(join(raiz, 'app/(es)/calculadoras/[slug]/page.tsx'), 'utf8');
    expect(src).toMatch(/howToSchema\(/);
    expect(src).toMatch(/softwareApplicationSchema\(/);
    // Los límites viajan dentro del nodo, no solo en el HTML.
    expect(src).toMatch(/limitaciones: calc\.noCubre/);
  });

  it('los límites se muestran DESPUÉS del resultado', () => {
    // Puestos arriba, donde nadie los ha necesitado todavía, no los lee nadie.
    const src = readFileSync(join(raiz, 'app/(es)/calculadoras/[slug]/page.tsx'), 'utf8');
    expect(src.indexOf('<CalculadoraForm')).toBeLessThan(src.indexOf('Qué NO cubre'));
  });

  it('el formulario no envía NADA a ningún servidor', () => {
    // Pedir las medidas de un proyecto ajeno a cambio de un resultado
    // convierte una herramienta pública en un formulario de captación.
    const src = readFileSync(join(raiz, 'components/CalculadoraForm.tsx'), 'utf8');
    expect(src).not.toMatch(/\bfetch\s*\(/);
    expect(src).not.toMatch(/XMLHttpRequest|navigator\.sendBeacon/);
    expect(src).not.toMatch(/<form[^>]*action=/);
  });

  it('el formulario formatea con numeroPE, no con toLocaleString', () => {
    // El ICU reducido de algunos contenedores devolvía formato inglés: el
    // mismo código imprimía "1,141.3" en producción y "1 141,3" en local.
    const src = readFileSync(join(raiz, 'components/CalculadoraForm.tsx'), 'utf8');
    expect(src).toMatch(/numeroPE/);
    // Se afirma sobre la LLAMADA, no sobre la palabra: el comentario de este
    // mismo test la menciona para explicar por qué no se usa.
    expect(src).not.toMatch(/\.toLocaleString\s*\(/);
  });

  it('las guías y arquitecturas enlazan de vuelta a sus calculadoras', () => {
    for (const ruta of ['app/(es)/recursos/[slug]/page.tsx', 'app/(es)/soluciones/[slug]/page.tsx']) {
      const src = readFileSync(join(raiz, ruta), 'utf8');
      expect(src, ruta).toMatch(/calculadorasQueEnlazan\(/);
    }
  });
});
