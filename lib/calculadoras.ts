import { SITE } from './site';

/**
 * CALCULADORAS DE PREDIMENSIONAMIENTO.
 *
 * QUÉ SON Y QUÉ NO SON. Son herramientas de PREDIMENSIONAMIENTO: sirven para
 * llegar a una cotización con un número propio en la mano y para entender qué
 * variable manda. No son un cálculo de ingeniería, no reemplazan una memoria
 * firmada y no autorizan a construir nada.
 *
 * POR QUÉ EXISTEN. Un comprador que sabe cuántos metros necesita negocia
 * distinto que uno que pregunta «¿cuánto cuesta?». Y una pregunta como
 * «¿cuánta geomembrana necesito para una poza de 30×20×4?» no la responde hoy
 * nadie en el rubro en el Perú: se responde por teléfono, una vez, y se pierde.
 * Publicada con su fórmula a la vista, esa respuesta se puede citar.
 *
 * LAS CUATRO REGLAS QUE NINGUNA CALCULADORA PUEDE ROMPER
 *
 * 1. LA FÓRMULA SE PUBLICA. Cada calculadora muestra la expresión que usa. Una
 *    caja negra que escupe un número no es citable por nadie —ni por un
 *    ingeniero ni por un modelo de lenguaje— porque no se puede verificar.
 *
 * 2. NINGÚN DATO INVENTADO. Aquí no se publican densidades de materiales,
 *    medidas interiores de contenedores, cargas útiles ni anchos de rollo «de
 *    memoria»: los pone quien calcula, tomándolos de su ficha, de la placa del
 *    contenedor o del transportista. Lo que aportamos es el MÉTODO. Cuando un
 *    valor sí procede de norma o de fuente publicada —los criterios de aire por
 *    persona y por HP diésel— se cita el artículo del sitio que lo documenta
 *    con su fuente.
 *
 * 3. LOS SUPUESTOS SON EDITABLES Y ESTÁN DECLARADOS. Traslape, desperdicio,
 *    desarrollo de zanja y factor de fugas son puntos de partida, no
 *    recomendaciones de diseño. Cada uno se puede cambiar y cada uno dice de
 *    dónde sale.
 *
 * 4. SE DECLARA LO QUE EL CÁLCULO NO CUBRE. `noCubre` es obligatorio. Una
 *    herramienta que calla sus límites induce a usarla fuera de ellos, y en
 *    minería o en una poza de relaves eso no es un error de marketing.
 *
 * Sin precios. Nunca. Una calculadora que termina en un precio deja de ser
 * una referencia y pasa a ser un formulario de venta, que es exactamente lo
 * contrario de lo que la vuelve citable.
 */

export const CALCULADORAS_VERSION = '1.0';
/** Fecha de la última revisión del método. No se deriva del reloj. */
export const CALCULADORAS_ACTUALIZADO = '2026-08-21';

export type TipoCampo = 'numero' | 'opcion';

export interface OpcionCampo {
  valor: number;
  etiqueta: string;
}

export interface Campo {
  id: string;
  etiqueta: string;
  unidad: string;
  ayuda: string;
  tipo: TipoCampo;
  porDefecto: number;
  min?: number;
  max?: number;
  paso?: number;
  opciones?: OpcionCampo[];
  /** Marca los supuestos editables frente a los datos del proyecto. */
  esSupuesto?: boolean;
}

export interface Magnitud {
  etiqueta: string;
  valor: number;
  unidad: string;
  decimales: number;
  /** Explica qué decide este número, no cómo se llama. */
  nota?: string;
}

export interface Salida {
  /** Lo que la persona vino a buscar. Uno o dos números, no diez. */
  principales: Magnitud[];
  /** De dónde sale el principal: sin esto no se puede auditar. */
  desglose: Magnitud[];
  /** Condiciones que exigen mirar antes de usar el número. */
  avisos: string[];
  /** Si la geometría o los datos no cierran, el número no se emite. */
  invalido?: string;
}

export interface Enlace {
  texto: string;
  href: string;
}

export interface Calculadora {
  slug: string;
  titulo: string;
  /**
   * Título para el <title> y la pestaña: corto a propósito.
   *
   * Usar `pregunta` aquí daba títulos de 86 a 99 caracteres, y Google recorta
   * cerca de 60: el buscador veía «¿Cuántos metros cuadrados de geomembrana
   * neces…». La pregunta completa sigue siendo el <h1> de la página, que es
   * donde sí cabe y donde sí ayuda.
   */
  tituloSeo: string;
  /** La pregunta tal como la escribe quien busca. Es el encabezado real. */
  pregunta: string;
  resumen: string;
  /** Familia a la que pertenece, para agrupar el índice. */
  area: 'Ventilación minera' | 'Geosintéticos' | 'Envases y embalaje' | 'Coberturas';
  campos: Campo[];
  /** La expresión, en texto plano, tal como se aplica. Se publica. */
  formula: string[];
  supuestos: string[];
  noCubre: string[];
  verTambien: Enlace[];
  calcular: (v: Record<string, number>) => Salida;
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

const redondear = (n: number, d = 2): number => {
  const f = 10 ** d;
  return Math.round((n + Number.EPSILON) * f) / f;
};

const finito = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/**
 * CUÁNTAS PIEZAS ENTERAS CABEN EN UN ESPACIO — y por qué no basta con floor().
 *
 * En coma flotante, 2,4 ÷ 0,8 vale 2,9999999999999996. `Math.floor` devuelve
 * 2, y una fila entera de bolsones desaparece de cada viaje. No es un decimal
 * de más: es un error de flete que se paga en cada despacho, provocado por una
 * medida que en el papel encaja exactamente.
 *
 * La tolerancia es de 1e-9 sobre el COCIENTE, es decir, ruido de representación
 * y nada más. Una holgura real —2,399 m para piezas de 0,8 m— sigue dando 2,
 * que es la respuesta correcta.
 */
export function cuantosCaben(espacio: number, pieza: number): number {
  if (!(pieza > 0) || !(espacio > 0)) return 0;
  const bruto = espacio / pieza;
  const entero = Math.round(bruto);
  return Math.abs(bruto - entero) < 1e-9 ? entero : Math.floor(bruto);
}

/**
 * Cuántas unidades enteras hacen falta para cubrir un total. El mismo problema
 * al revés: 2,1 ÷ 0,3 vale 7,000000000000001 y `Math.ceil` compra un paño
 * entero de más que nadie va a usar.
 */
export function cuantosNecesarios(total: number, unidad: number): number {
  if (!(unidad > 0) || total <= 0) return 0;
  const bruto = total / unidad;
  const entero = Math.round(bruto);
  return Math.abs(bruto - entero) < 1e-9 ? entero : Math.ceil(bruto);
}

/**
 * Factor de solape por ancho útil. Es geometría exacta, no un porcentaje
 * inventado: si el rollo mide `ancho` y cada paño pisa `traslape` al vecino,
 * el ancho que efectivamente cubre es `ancho − traslape`, y hacen falta
 * `ancho / (ancho − traslape)` metros de material por cada metro cubierto.
 */
export function factorTraslape(ancho: number, traslape: number): number {
  const util = ancho - traslape;
  if (util <= 0) return Number.POSITIVE_INFINITY;
  return ancho / util;
}

/**
 * Aire por persona según altitud, en m³/min. Escala publicada en la guía del
 * sitio, que cita a Revista Seguridad Minera y al D.S. 024-2016-EM. No es un
 * criterio nuestro: es el criterio del rubro, y por eso se puede verificar.
 */
export function airePorPersona(altitudMsnm: number): number {
  if (altitudMsnm <= 1500) return 3;
  if (altitudMsnm <= 3000) return 4;
  if (altitudMsnm <= 4000) return 5;
  return 6;
}

/** m³/min por HP diésel operando simultáneamente. Mismo origen. */
export const AIRE_POR_HP_DIESEL = 3;

/** Velocidades del aire en la labor, en m/min. Mismo origen. */
export const VELOCIDAD_MINIMA = 20;
export const VELOCIDAD_MINIMA_ANFO = 25;
export const VELOCIDAD_MAXIMA = 250;

const GUIA_VENTILACION = '/recursos/calculo-caudal-mangas-ventilacion-mina-subterranea';
const GUIA_GEOMEMBRANA = '/recursos/instalacion-geomembranas-hdpe-pozas-canales';
const GUIA_GEOTEXTIL = '/recursos/como-elegir-geotextil-separacion-drenaje-refuerzo';
const GUIA_BIGBAGS = '/recursos/big-bags-mineria-peru-normativa-errores-estiba';

/* ================================================================== */
/* 1. Caudal de ventilación en labor subterránea                       */
/* ================================================================== */

const caudalVentilacion: Calculadora = {
  slug: 'caudal-ventilacion-mina',
  tituloSeo: 'Calculadora de caudal de ventilación minera',
  titulo: 'Caudal de ventilación para una labor subterránea',
  pregunta: '¿Cuánto aire necesita mi labor y qué caudal debe entregar el ventilador?',
  resumen:
    'Suma la demanda de aire del personal —corregida por altitud— y la del equipo diésel operando ' +
    'a la vez, comprueba la velocidad resultante en la sección de la labor y devuelve el caudal que ' +
    'el ventilador debe entregar para que ese aire llegue al frente pese a las fugas de la manga.',
  area: 'Ventilación minera',
  campos: [
    {
      id: 'personas',
      etiqueta: 'Personas en la labor',
      unidad: 'personas',
      ayuda: 'Máximo simultáneo, no el total del turno.',
      tipo: 'numero',
      porDefecto: 8,
      min: 0,
      max: 200,
      paso: 1,
    },
    {
      id: 'altitud',
      etiqueta: 'Altitud de la operación',
      unidad: 'msnm',
      ayuda: 'Decide el aire por persona: 3, 4, 5 o 6 m³/min según el tramo.',
      tipo: 'numero',
      porDefecto: 4200,
      min: 0,
      max: 5500,
      paso: 50,
    },
    {
      id: 'hpDiesel',
      etiqueta: 'Potencia diésel operando a la vez',
      unidad: 'HP',
      ayuda:
        'Solo los equipos que trabajan simultáneamente en la labor. Sumar la flota completa ' +
        'sobredimensiona el sistema; contar un solo equipo lo deja corto el día que entran dos.',
      tipo: 'numero',
      porDefecto: 250,
      min: 0,
      max: 5000,
      paso: 10,
    },
    {
      id: 'seccion',
      etiqueta: 'Sección de la labor',
      unidad: 'm²',
      ayuda: 'Área transversal libre. Sirve para comprobar la velocidad del aire.',
      tipo: 'numero',
      porDefecto: 16,
      min: 1,
      max: 200,
      paso: 0.5,
    },
    {
      id: 'anfo',
      etiqueta: '¿Se emplea ANFO u otro agente de voladura?',
      unidad: '',
      ayuda: 'Con ANFO la velocidad mínima exigida sube de 20 a 25 m/min.',
      tipo: 'opcion',
      porDefecto: 1,
      opciones: [
        { valor: 0, etiqueta: 'No' },
        { valor: 1, etiqueta: 'Sí' },
      ],
    },
    {
      id: 'fugas',
      etiqueta: 'Fugas estimadas de la instalación',
      unidad: '%',
      ayuda:
        'Punto de partida, NO una predicción. La fuga no se calcula en gabinete: depende de las ' +
        'uniones, del roce contra la caja y de la catenaria, y se audita midiendo caudal en el frente.',
      tipo: 'numero',
      porDefecto: 15,
      min: 0,
      max: 60,
      paso: 1,
      esSupuesto: true,
    },
  ],
  formula: [
    'aire_por_persona = 3 m³/min hasta 1500 msnm · 4 hasta 3000 · 5 hasta 4000 · 6 por encima',
    'Q_personal = personas × aire_por_persona',
    'Q_diesel   = HP_simultáneos × 3 m³/min por HP',
    'Q_frente   = Q_personal + Q_diesel',
    'velocidad  = Q_frente ÷ sección de la labor',
    'Q_ventilador = Q_frente ÷ (1 − fugas)',
  ],
  supuestos: [
    'Los criterios de aire por persona según altitud, los 3 m³/min por HP diésel y las velocidades ' +
      'mínima y máxima proceden de la guía publicada en este sitio, que cita a Revista Seguridad ' +
      'Minera y al D.S. N.° 024-2016-EM. Verifique el texto vigente del reglamento antes de emitir ' +
      'una memoria de cálculo.',
    'El factor de fugas es un supuesto que usted fija. No es una predicción del comportamiento de ' +
      'una manga concreta.',
    'La velocidad se comprueba contra 20 m/min (25 m/min con ANFO) como mínimo y 250 m/min como máximo.',
  ],
  noCubre: [
    'La dilución de gases de voladura. Es la tercera demanda del cálculo y en labores ciegas de ' +
      'avance suele GOBERNAR por encima de personal y diésel. Depende del tipo y la cantidad de ' +
      'explosivo y del tiempo de reingreso admitido, y no se resuelve con una fórmula general.',
    'La pérdida de carga por fricción y la selección del ventilador contra su curva.',
    'La verificación de oxígeno (mínimo 19,5 %) y de gases en el ambiente de trabajo.',
    'El diámetro de la manga: aquí se calcula caudal, no se selecciona el ducto.',
  ],
  verTambien: [
    { texto: 'Guía: cálculo de caudal y mangas de ventilación', href: GUIA_VENTILACION },
    { texto: 'Arquitectura: frente de avance ventilado', href: '/soluciones/frente-avance-ventilado' },
    { texto: 'Glosario: caudal', href: '/glosario/caudal' },
    { texto: 'Glosario: factor de fuga', href: '/glosario/factor-de-fuga' },
    { texto: 'Glosario: pérdida de carga', href: '/glosario/perdida-de-carga' },
  ],
  calcular: (v) => {
    const personas = v.personas ?? 0;
    const altitud = v.altitud ?? 0;
    const hp = v.hpDiesel ?? 0;
    const seccion = v.seccion ?? 0;
    const conAnfo = (v.anfo ?? 0) === 1;
    const fugas = v.fugas ?? 0;

    if (seccion <= 0) return { principales: [], desglose: [], avisos: [], invalido: 'La sección de la labor debe ser mayor que cero.' };
    if (fugas >= 100) return { principales: [], desglose: [], avisos: [], invalido: 'Con 100 % de fugas no llega aire al frente: revise el dato.' };

    const porPersona = airePorPersona(altitud);
    const qPersonal = personas * porPersona;
    const qDiesel = hp * AIRE_POR_HP_DIESEL;
    const qFrente = qPersonal + qDiesel;
    const velocidad = qFrente / seccion;
    const qVentilador = qFrente / (1 - fugas / 100);

    const vMin = conAnfo ? VELOCIDAD_MINIMA_ANFO : VELOCIDAD_MINIMA;
    const avisos: string[] = [];

    if (velocidad < vMin) {
      avisos.push(
        `La velocidad resultante (${redondear(velocidad, 1)} m/min) queda por debajo del mínimo de ` +
          `${vMin} m/min. Por debajo del mínimo el aire no barre la labor: el caudal no basta o la ` +
          `sección es demasiado grande para él.`,
      );
    }
    if (velocidad > VELOCIDAD_MAXIMA) {
      avisos.push(
        `La velocidad resultante (${redondear(velocidad, 1)} m/min) supera el máximo de ` +
          `${VELOCIDAD_MAXIMA} m/min. Por encima del máximo el aire levanta polvo y afecta la operación.`,
      );
    }
    if (qDiesel > qPersonal && qPersonal > 0) {
      avisos.push(
        'El equipo diésel domina la demanda, que es lo normal en labor mecanizada. Revise que la ' +
          'potencia declarada sea la que opera SIMULTÁNEAMENTE.',
      );
    }
    avisos.push(
      'Este resultado NO incluye la dilución de gases de voladura, que en labores ciegas de avance ' +
        'suele gobernar por encima de estas dos demandas.',
    );
    avisos.push(
      'La medición que vale es la del frente de trabajo, no la de la boca del ventilador. Declarar ' +
        'conforme un sistema midiendo en el ventilador es el error de auditoría más común.',
    );

    return {
      principales: [
        {
          etiqueta: 'Caudal requerido en el frente',
          valor: redondear(qFrente, 1),
          unidad: 'm³/min',
          decimales: 1,
          nota: 'Lo que debe llegar donde se trabaja.',
        },
        {
          etiqueta: 'Caudal que debe entregar el ventilador',
          valor: redondear(qVentilador, 1),
          unidad: 'm³/min',
          decimales: 1,
          nota: `Incluye ${redondear(fugas, 0)} % de fugas supuestas en la instalación.`,
        },
      ],
      desglose: [
        { etiqueta: 'Aire por persona a esa altitud', valor: porPersona, unidad: 'm³/min', decimales: 0 },
        { etiqueta: 'Demanda del personal', valor: redondear(qPersonal, 1), unidad: 'm³/min', decimales: 1 },
        { etiqueta: 'Demanda del equipo diésel', valor: redondear(qDiesel, 1), unidad: 'm³/min', decimales: 1 },
        { etiqueta: 'Velocidad del aire en la labor', valor: redondear(velocidad, 1), unidad: 'm/min', decimales: 1, nota: `Mínimo aplicable: ${vMin} m/min. Máximo: ${VELOCIDAD_MAXIMA} m/min.` },
        { etiqueta: 'Caudal perdido por fugas', valor: redondear(qVentilador - qFrente, 1), unidad: 'm³/min', decimales: 1, nota: 'Aire pagado que no llega al frente.' },
      ],
      avisos,
    };
  },
};

/* ================================================================== */
/* 2. Geomembrana para poza o laguna revestida                         */
/* ================================================================== */

const geomembranaPoza: Calculadora = {
  slug: 'geomembrana-poza',
  tituloSeo: 'Calculadora de geomembrana para poza',
  titulo: 'Geomembrana para una poza o laguna revestida',
  pregunta: '¿Cuántos metros cuadrados de geomembrana necesito para revestir una poza?',
  resumen:
    'Desarrolla la superficie de un vaso rectangular con taludes —fondo más los cuatro planos ' +
    'inclinados—, añade el desarrollo de la zanja de anclaje del perímetro, aplica el solape de ' +
    'soldadura según el ancho de rollo y devuelve área, metros lineales y capacidad del vaso.',
  area: 'Geosintéticos',
  campos: [
    { id: 'largo', etiqueta: 'Largo en la corona', unidad: 'm', ayuda: 'Medida en el borde superior, no en el fondo.', tipo: 'numero', porDefecto: 30, min: 1, max: 500, paso: 0.5 },
    { id: 'ancho', etiqueta: 'Ancho en la corona', unidad: 'm', ayuda: 'Medida en el borde superior.', tipo: 'numero', porDefecto: 20, min: 1, max: 500, paso: 0.5 },
    { id: 'profundidad', etiqueta: 'Profundidad', unidad: 'm', ayuda: 'Desde la corona hasta el fondo.', tipo: 'numero', porDefecto: 4, min: 0.2, max: 40, paso: 0.1 },
    {
      id: 'talud',
      etiqueta: 'Talud (H:V)',
      unidad: 'H por 1 V',
      ayuda: 'Metros en horizontal por cada metro en vertical. 2 significa 2H:1V.',
      tipo: 'numero',
      porDefecto: 2,
      min: 0,
      max: 6,
      paso: 0.25,
    },
    { id: 'anchoRollo', etiqueta: 'Ancho del rollo', unidad: 'm', ayuda: 'El de la ficha del material que va a usar. No lo suponemos por usted.', tipo: 'numero', porDefecto: 7, min: 0.5, max: 12, paso: 0.1 },
    {
      id: 'traslape',
      etiqueta: 'Traslape entre paños',
      unidad: 'm',
      ayuda: 'Punto de partida. El valor real lo fija el procedimiento de soldadura y la ficha del material.',
      tipo: 'numero',
      porDefecto: 0.1,
      min: 0,
      max: 1,
      paso: 0.01,
      esSupuesto: true,
    },
    {
      id: 'zanja',
      etiqueta: 'Desarrollo de la zanja de anclaje',
      unidad: 'm por metro de corona',
      ayuda: 'Metros de membrana que consume la zanja por cada metro de perímetro. Depende de su sección; póngalo 0 si no lleva zanja.',
      tipo: 'numero',
      porDefecto: 1.5,
      min: 0,
      max: 6,
      paso: 0.1,
      esSupuesto: true,
    },
    {
      id: 'desperdicio',
      etiqueta: 'Desperdicio por cortes y geometría',
      unidad: '%',
      ayuda: 'Punto de partida. Sube con esquinas, ingresos, tuberías pasantes y terreno irregular.',
      tipo: 'numero',
      porDefecto: 5,
      min: 0,
      max: 40,
      paso: 1,
      esSupuesto: true,
    },
  ],
  formula: [
    'fondo_largo = largo_corona − 2 × talud × profundidad     (ídem para el ancho)',
    'talud_desarrollado = profundidad × √(1 + talud²)',
    'área_fondo   = fondo_largo × fondo_ancho',
    'área_taludes = 2 × talud_desarrollado × (largo + ancho − 2 × talud × profundidad)',
    'área_zanja   = 2 × (largo + ancho) × desarrollo_de_zanja',
    'factor_solape = ancho_rollo ÷ (ancho_rollo − traslape)',
    'área_total = (área_fondo + área_taludes + área_zanja) × factor_solape × (1 + desperdicio)',
    'metros_lineales = área_total ÷ ancho_rollo',
    'capacidad = profundidad ÷ 6 × (A_corona + 4 × A_media + A_fondo)     (prismatoide, exacta)',
  ],
  supuestos: [
    'El vaso se trata como un tronco de pirámide rectangular con las cuatro caras planas y el mismo ' +
      'talud en todo el perímetro. Sobre esa geometría el desarrollo es exacto, no aproximado.',
    'El factor de solape es geometría, no un porcentaje: si el rollo mide 7 m y cada paño pisa 0,10 m ' +
      'al vecino, cubre 6,90 m y hacen falta 7 ÷ 6,90 metros de material por metro cubierto.',
    'Traslape, desarrollo de zanja y desperdicio son supuestos que usted fija. Los valores de partida ' +
      'no son una recomendación de diseño.',
  ],
  noCubre: [
    'La geomembrana no es el único material del paquete: bajo ella suele ir geotextil de protección ' +
      'y sobre ella puede ir una capa de cobertura. Aquí solo se desarrolla la membrana.',
    'Ingresos, salidas, tuberías pasantes, sumideros, rampas de acceso y bermas intermedias.',
    'La estabilidad del talud, la preparación de la subrasante y la comprobación de la subpresión.',
    'El espesor de la membrana y su selección, que dependen del contenido, del punzonamiento y de la vida de diseño.',
    'La longitud real de los paños según el despiece de obra: los metros lineales son un total, no un despiece.',
  ],
  verTambien: [
    { texto: 'Guía: instalación de geomembranas HDPE en pozas y canales', href: GUIA_GEOMEMBRANA },
    { texto: 'Arquitectura: poza revestida e impermeabilización', href: '/soluciones/poza-revestida-impermeabilizacion' },
    { texto: 'Glosario: zanja de anclaje', href: '/glosario/zanja-de-anclaje' },
    { texto: 'Glosario: soldadura por cuña caliente', href: '/glosario/soldadura-por-cuna-caliente' },
    { texto: 'Glosario: subrasante', href: '/glosario/subrasante' },
  ],
  calcular: (v) => {
    const L = v.largo ?? 0;
    const A = v.ancho ?? 0;
    const h = v.profundidad ?? 0;
    const n = v.talud ?? 0;
    const w = v.anchoRollo ?? 0;
    const t = v.traslape ?? 0;
    const z = v.zanja ?? 0;
    const d = v.desperdicio ?? 0;

    const fondoL = L - 2 * n * h;
    const fondoA = A - 2 * n * h;
    if (fondoL <= 0 || fondoA <= 0) {
      return {
        principales: [],
        desglose: [],
        avisos: [],
        invalido:
          `Con talud ${n}H:1V y ${h} m de profundidad, los taludes se cruzan antes de llegar al fondo ` +
          `(quedaría ${redondear(fondoL, 2)} × ${redondear(fondoA, 2)} m). Reduzca el talud o la ` +
          `profundidad, o amplíe la corona.`,
      };
    }
    const ft = factorTraslape(w, t);
    if (!finito(ft)) {
      return { principales: [], desglose: [], avisos: [], invalido: 'El traslape no puede igualar ni superar el ancho del rollo.' };
    }

    const s = h * Math.sqrt(1 + n * n);
    const areaFondo = fondoL * fondoA;
    const areaTaludes = 2 * s * (L + A - 2 * n * h);
    const perimetro = 2 * (L + A);
    const areaZanja = perimetro * z;
    const areaGeometrica = areaFondo + areaTaludes;
    const areaTotal = (areaGeometrica + areaZanja) * ft * (1 + d / 100);
    const metrosLineales = areaTotal / w;

    // Prismatoide: exacta para un tronco de pirámide.
    const aCorona = L * A;
    const aMedia = (L - n * h) * (A - n * h);
    const capacidad = (h / 6) * (aCorona + 4 * aMedia + areaFondo);

    const avisos: string[] = [];
    if (n === 0) {
      avisos.push('Talud 0 significa paredes verticales. Un vaso en tierra con paredes verticales no se sostiene: verifique el dato.');
    }
    if (z === 0) {
      avisos.push('Sin zanja de anclaje la membrana no tiene cómo resistir el viento ni la tracción del talud. Si su diseño usa otro anclaje, decláre­lo en la memoria.');
    }
    avisos.push('El resultado es el desarrollo de la membrana, no un despiece de paños. El despiece lo define el instalador con el plano de obra.');
    avisos.push('La capacidad calculada es la del vaso lleno hasta la corona, sin borde libre. El borde libre lo fija el diseño hidráulico.');

    return {
      principales: [
        { etiqueta: 'Geomembrana total', valor: redondear(areaTotal, 1), unidad: 'm²', decimales: 1, nota: 'Incluye solape, zanja y desperdicio.' },
        { etiqueta: 'Metros lineales de rollo', valor: redondear(metrosLineales, 1), unidad: 'm', decimales: 1, nota: `A ${w} m de ancho.` },
      ],
      desglose: [
        { etiqueta: 'Fondo', valor: redondear(fondoL, 2), unidad: `m × ${redondear(fondoA, 2)} m`, decimales: 2 },
        { etiqueta: 'Área del fondo', valor: redondear(areaFondo, 1), unidad: 'm²', decimales: 1 },
        { etiqueta: 'Talud desarrollado', valor: redondear(s, 2), unidad: 'm', decimales: 2, nota: 'Longitud sobre el plano inclinado, mayor que la profundidad.' },
        { etiqueta: 'Área de los taludes', valor: redondear(areaTaludes, 1), unidad: 'm²', decimales: 1 },
        { etiqueta: 'Área geométrica del vaso', valor: redondear(areaGeometrica, 1), unidad: 'm²', decimales: 1, nota: 'Sin solape ni zanja: la superficie real a cubrir.' },
        { etiqueta: 'Perímetro de la corona', valor: redondear(perimetro, 1), unidad: 'm', decimales: 1 },
        { etiqueta: 'Membrana en la zanja de anclaje', valor: redondear(areaZanja, 1), unidad: 'm²', decimales: 1 },
        { etiqueta: 'Factor de solape', valor: redondear(ft, 4), unidad: '×', decimales: 4, nota: `Rollo de ${w} m con ${t} m de traslape cubre ${redondear(w - t, 2)} m.` },
        { etiqueta: 'Capacidad del vaso hasta la corona', valor: redondear(capacidad, 1), unidad: 'm³', decimales: 1, nota: `Equivale a ${redondear(capacidad * 1000, 0)} litros.` },
      ],
      avisos,
    };
  },
};

/* ================================================================== */
/* 3. Rollos necesarios para cubrir una superficie plana               */
/* ================================================================== */

const rollosPorSuperficie: Calculadora = {
  slug: 'rollos-por-superficie',
  tituloSeo: 'Calculadora de rollos por superficie',
  titulo: 'Rollos necesarios para cubrir una superficie',
  pregunta: '¿Cuántos rollos necesito para cubrir una superficie, contando el traslape?',
  resumen:
    'Vale para geotextil, geomembrana en superficie plana, malla raschel, malla antiáfida, ' +
    'mulch y lona. Calcula cuántos paños entran a lo ancho, cuántos metros lineales suman y ' +
    'cuántos rollos hay que pedir, con el sobrante que queda.',
  area: 'Geosintéticos',
  campos: [
    { id: 'largo', etiqueta: 'Largo de la superficie', unidad: 'm', ayuda: 'Conviene orientar los paños en la dirección más larga: menos uniones.', tipo: 'numero', porDefecto: 100, min: 0.5, max: 5000, paso: 0.5 },
    { id: 'ancho', etiqueta: 'Ancho de la superficie', unidad: 'm', ayuda: '', tipo: 'numero', porDefecto: 40, min: 0.5, max: 5000, paso: 0.5 },
    { id: 'anchoRollo', etiqueta: 'Ancho del rollo', unidad: 'm', ayuda: 'De la ficha del material.', tipo: 'numero', porDefecto: 4, min: 0.2, max: 12, paso: 0.1 },
    { id: 'largoRollo', etiqueta: 'Largo del rollo', unidad: 'm', ayuda: 'De la ficha del material.', tipo: 'numero', porDefecto: 100, min: 1, max: 2000, paso: 1 },
    {
      id: 'traslape',
      etiqueta: 'Traslape entre paños',
      unidad: 'm',
      ayuda: 'Punto de partida. En geotextil de separación depende de la calidad de la subrasante; en malla, del sistema de unión.',
      tipo: 'numero',
      porDefecto: 0.3,
      min: 0,
      max: 2,
      paso: 0.05,
      esSupuesto: true,
    },
    {
      id: 'desperdicio',
      etiqueta: 'Desperdicio por cortes',
      unidad: '%',
      ayuda: 'Punto de partida. Sube con formas irregulares y obstáculos.',
      tipo: 'numero',
      porDefecto: 5,
      min: 0,
      max: 40,
      paso: 1,
      esSupuesto: true,
    },
  ],
  formula: [
    'ancho_útil_por_paño = ancho_rollo − traslape',
    'paños = techo(ancho_superficie ÷ ancho_útil_por_paño)',
    'metros_lineales = paños × largo_superficie × (1 + desperdicio)',
    'rollos = techo(metros_lineales ÷ largo_rollo)',
    'sobrante = rollos × largo_rollo × ancho_rollo − área_cubierta_efectiva',
  ],
  supuestos: [
    'Los paños corren en la dirección del largo y se traslapan entre sí a lo ancho.',
    'El número de paños se redondea SIEMPRE hacia arriba: medio paño no cubre.',
    'No se contempla empalmar retazos para completar un paño. Se puede, pero cada empalme es una ' +
      'unión más y en geotextil de separación las uniones son el punto débil.',
  ],
  noCubre: [
    'El traslape en los EXTREMOS de cada paño cuando el rollo no alcanza el largo completo. Si su ' +
      'largo supera el del rollo, añada ese traslape al desperdicio.',
    'La orientación óptima de los paños en una superficie irregular.',
    'El sistema de unión —cosido, soldado, solo traslapado— y lo que cada uno exige.',
  ],
  verTambien: [
    { texto: 'Guía: cómo elegir un geotextil', href: GUIA_GEOTEXTIL },
    { texto: 'Glosario: gramaje', href: '/glosario/gramaje' },
    { texto: 'Glosario: geotextil', href: '/glosario/geotextil' },
    { texto: 'Glosario: porcentaje de sombra', href: '/glosario/porcentaje-de-sombra' },
  ],
  calcular: (v) => {
    const L = v.largo ?? 0;
    const A = v.ancho ?? 0;
    const w = v.anchoRollo ?? 0;
    const lr = v.largoRollo ?? 0;
    const t = v.traslape ?? 0;
    const d = v.desperdicio ?? 0;

    const util = w - t;
    if (util <= 0) {
      return { principales: [], desglose: [], avisos: [], invalido: 'El traslape no puede igualar ni superar el ancho del rollo: no quedaría ancho útil.' };
    }
    if (lr <= 0) {
      return { principales: [], desglose: [], avisos: [], invalido: 'El largo del rollo debe ser mayor que cero.' };
    }

    const panos = cuantosNecesarios(A, util);
    const metrosLineales = panos * L * (1 + d / 100);
    const rollos = cuantosNecesarios(metrosLineales, lr);
    const areaSuperficie = L * A;
    const areaComprada = rollos * lr * w;
    const sobrante = areaComprada - areaSuperficie;
    const rendimiento = areaSuperficie / areaComprada;

    const avisos: string[] = [];
    if (L > lr) {
      avisos.push(
        `El largo de la superficie (${L} m) supera el del rollo (${lr} m): cada paño necesitará al ` +
          'menos un empalme a lo largo. Ese traslape adicional NO está contado aquí.',
      );
    }
    if (rendimiento < 0.75) {
      avisos.push(
        `Solo se aprovecha el ${redondear(rendimiento * 100, 0)} % del material comprado. Con otro ` +
          'ancho de rollo o girando la dirección de los paños suele mejorar bastante.',
      );
    }
    const restoUltimoPano = panos * util - A;
    if (restoUltimoPano > util * 0.6) {
      avisos.push(
        `El último paño sobra en ${redondear(restoUltimoPano, 2)} m de ancho. Comprobar si conviene ` +
          'repartir el exceso aumentando el traslape en lugar de recortar.',
      );
    }

    return {
      principales: [
        { etiqueta: 'Rollos a pedir', valor: rollos, unidad: 'rollos', decimales: 0, nota: `De ${w} × ${lr} m.` },
        { etiqueta: 'Metros lineales necesarios', valor: redondear(metrosLineales, 1), unidad: 'm', decimales: 1 },
      ],
      desglose: [
        { etiqueta: 'Ancho útil por paño', valor: redondear(util, 2), unidad: 'm', decimales: 2, nota: `${w} m de rollo menos ${t} m de traslape.` },
        { etiqueta: 'Paños a lo ancho', valor: panos, unidad: 'paños', decimales: 0 },
        { etiqueta: 'Superficie a cubrir', valor: redondear(areaSuperficie, 1), unidad: 'm²', decimales: 1 },
        { etiqueta: 'Material comprado', valor: redondear(areaComprada, 1), unidad: 'm²', decimales: 1 },
        { etiqueta: 'Sobrante', valor: redondear(sobrante, 1), unidad: 'm²', decimales: 1, nota: `Aprovechamiento del ${redondear(rendimiento * 100, 1)} %.` },
      ],
      avisos,
    };
  },
};

/* ================================================================== */
/* 4. Big bags por viaje                                               */
/* ================================================================== */

const bigBagsPorViaje: Calculadora = {
  slug: 'big-bags-por-viaje',
  tituloSeo: 'Calculadora de big bags por viaje',
  titulo: 'Big bags por contenedor o por viaje',
  pregunta: '¿Cuántos big bags entran en un contenedor o en una plataforma, y qué limita la carga?',
  resumen:
    'Compara las dos restricciones que gobiernan un despacho a granel —el espacio y la carga útil— ' +
    'y devuelve la que manda. Casi siempre manda el peso mucho antes que el volumen, y ese es ' +
    'justamente el error que se paga en flete.',
  area: 'Envases y embalaje',
  campos: [
    { id: 'bolsaA', etiqueta: 'Base del bolsón, lado A', unidad: 'm', ayuda: 'Medida del bolsón LLENO, que se ensancha respecto del plano.', tipo: 'numero', porDefecto: 1.05, min: 0.3, max: 3, paso: 0.05 },
    { id: 'bolsaB', etiqueta: 'Base del bolsón, lado B', unidad: 'm', ayuda: '', tipo: 'numero', porDefecto: 1.05, min: 0.3, max: 3, paso: 0.05 },
    { id: 'bolsaH', etiqueta: 'Altura del bolsón lleno', unidad: 'm', ayuda: 'Con el bolsón asentado, no izado.', tipo: 'numero', porDefecto: 1.2, min: 0.3, max: 3, paso: 0.05 },
    { id: 'pesoLleno', etiqueta: 'Peso del bolsón lleno', unidad: 'kg', ayuda: 'Contenido más envase.', tipo: 'numero', porDefecto: 1000, min: 1, max: 5000, paso: 10 },
    { id: 'espacioL', etiqueta: 'Largo interior del espacio de carga', unidad: 'm', ayuda: 'De la placa del contenedor o de la ficha del transportista. No lo publicamos de memoria: varía por fabricante.', tipo: 'numero', porDefecto: 5.9, min: 1, max: 30, paso: 0.01 },
    { id: 'espacioA', etiqueta: 'Ancho interior', unidad: 'm', ayuda: 'Misma fuente.', tipo: 'numero', porDefecto: 2.35, min: 0.5, max: 5, paso: 0.01 },
    { id: 'espacioH', etiqueta: 'Altura interior', unidad: 'm', ayuda: 'Misma fuente.', tipo: 'numero', porDefecto: 2.39, min: 0.5, max: 5, paso: 0.01 },
    { id: 'cargaUtil', etiqueta: 'Carga útil admisible', unidad: 'kg', ayuda: 'De la placa CSC del contenedor o del límite de peso por eje de la ruta. Es un dato del transporte, no del bolsón.', tipo: 'numero', porDefecto: 26000, min: 100, max: 60000, paso: 100 },
    {
      id: 'apilable',
      etiqueta: '¿Los bolsones son apilables?',
      unidad: '',
      ayuda: 'No todos los FIBC lo son. Apilar uno que no está diseñado para ello es un modo de falla, no una decisión de carga.',
      tipo: 'opcion',
      porDefecto: 0,
      opciones: [
        { valor: 0, etiqueta: 'No: un solo piso' },
        { valor: 1, etiqueta: 'Sí, según su ficha' },
      ],
    },
  ],
  formula: [
    'por_piso = máximo entre  ⌊L÷a⌋ × ⌊A÷b⌋  y  ⌊L÷b⌋ × ⌊A÷a⌋      (se prueban las dos orientaciones)',
    'pisos = apilable ? ⌊altura_interior ÷ altura_bolsón⌋ : 1',
    'límite_por_espacio = por_piso × pisos',
    'límite_por_peso    = ⌊carga_útil ÷ peso_del_bolsón⌋',
    'bolsones = mínimo(límite_por_espacio, límite_por_peso)',
  ],
  supuestos: [
    'Los bolsones se acomodan en retícula ortogonal, todos en la misma orientación. Es como se carga ' +
      'en la práctica y es lo que permite estibar y trincar.',
    'Todas las medidas del espacio de carga y la carga útil las aporta usted. No publicamos medidas ' +
      'interiores de contenedores ni cargas útiles: varían por fabricante, por naviera y por la ruta.',
    'La altura del bolsón es la del bolsón LLENO y asentado, que no es la del plano.',
  ],
  noCubre: [
    'La distribución del peso sobre los ejes y el centro de gravedad de la carga. Que quepan no ' +
      'significa que la carga esté bien repartida.',
    'El trincado, los separadores y la sujeción, que son obligatorios y consumen espacio.',
    'Los límites de peso por eje de la ruta peruana, que suelen ser más restrictivos que la placa ' +
      'del contenedor.',
    'La compatibilidad del bolsón con el material: tipo electrostático, liner interior y ' +
      'permeabilidad no se deciden por espacio.',
  ],
  verTambien: [
    { texto: 'Guía: big bags en minería, normativa y errores de estiba', href: GUIA_BIGBAGS },
    { texto: 'Arquitectura: despacho de concentrado a granel', href: '/soluciones/despacho-concentrado-granel' },
    { texto: 'Glosario: big bag (FIBC)', href: '/glosario/big-bag-fibc' },
    { texto: 'Glosario: carga de trabajo segura', href: '/glosario/carga-de-trabajo-segura' },
    { texto: 'Glosario: tipo electrostático (FIBC)', href: '/glosario/tipo-electrostatico-fibc' },
  ],
  calcular: (v) => {
    const a = v.bolsaA ?? 0;
    const b = v.bolsaB ?? 0;
    const hB = v.bolsaH ?? 0;
    const peso = v.pesoLleno ?? 0;
    const L = v.espacioL ?? 0;
    const A = v.espacioA ?? 0;
    const H = v.espacioH ?? 0;
    const util = v.cargaUtil ?? 0;
    const apilable = (v.apilable ?? 0) === 1;

    if (a <= 0 || b <= 0 || hB <= 0 || peso <= 0) {
      return { principales: [], desglose: [], avisos: [], invalido: 'Las medidas y el peso del bolsón deben ser mayores que cero.' };
    }
    const orientacion1 = cuantosCaben(L, a) * cuantosCaben(A, b);
    const orientacion2 = cuantosCaben(L, b) * cuantosCaben(A, a);
    const porPiso = Math.max(orientacion1, orientacion2);
    const pisosPorAltura = cuantosCaben(H, hB);
    const pisos = apilable ? Math.max(1, pisosPorAltura) : 1;
    const porEspacio = porPiso * pisos;
    const porPeso = cuantosCaben(util, peso);
    const cantidad = Math.min(porEspacio, porPeso);

    if (porPiso === 0) {
      return { principales: [], desglose: [], avisos: [], invalido: 'No entra ni un bolsón en el piso: revise las medidas del bolsón y del espacio de carga.' };
    }

    const limitante = porPeso < porEspacio ? 'peso' : porPeso > porEspacio ? 'espacio' : 'ambas';
    const pesoTotal = cantidad * peso;
    const ocupacionPiso = (porPiso * a * b) / (L * A);

    const avisos: string[] = [];
    if (limitante === 'peso') {
      avisos.push(
        `Manda el PESO: por espacio caben ${porEspacio} bolsones, pero la carga útil solo admite ` +
          `${porPeso}. Quedan ${porEspacio - cantidad} huecos. Un bolsón de menor capacidad —o el ` +
          'mismo bolsón llenado a menos— aprovecha mejor el flete.',
      );
    }
    if (limitante === 'espacio') {
      avisos.push(
        `Manda el ESPACIO: la carga útil admitiría ${porPeso} bolsones pero solo entran ${porEspacio}. ` +
          `Quedan ${redondear(util - pesoTotal, 0)} kg de carga útil sin usar.`,
      );
    }
    if (apilable && pisos > 1) {
      avisos.push(
        `Se están apilando ${pisos} pisos. Apilar exige que el bolsón esté DISEÑADO para apilamiento ` +
          'y que el contenido lo permita: compruébelo en la ficha antes de contar con esta cifra.',
      );
    }
    if (!apilable && pisosPorAltura > 1) {
      avisos.push(
        `Por altura cabrían ${pisosPorAltura} pisos, pero se está calculando con uno solo porque ` +
          'los bolsones se declararon no apilables. Ahí hay capacidad disponible si la ficha lo admite.',
      );
    }
    avisos.push('El trincado y los separadores son obligatorios y consumen espacio: este cálculo no los descuenta.');

    return {
      principales: [
        { etiqueta: 'Bolsones por viaje', valor: cantidad, unidad: 'bolsones', decimales: 0, nota: `Limita: ${limitante === 'ambas' ? 'espacio y peso por igual' : `el ${limitante}`}.` },
        { etiqueta: 'Peso cargado', valor: redondear(pesoTotal, 0), unidad: 'kg', decimales: 0, nota: `Sobre ${redondear(util, 0)} kg admisibles.` },
      ],
      desglose: [
        { etiqueta: 'Bolsones por piso', valor: porPiso, unidad: 'bolsones', decimales: 0, nota: `Mejor de las dos orientaciones (${orientacion1} contra ${orientacion2}).` },
        { etiqueta: 'Pisos', valor: pisos, unidad: 'pisos', decimales: 0 },
        { etiqueta: 'Límite por espacio', valor: porEspacio, unidad: 'bolsones', decimales: 0 },
        { etiqueta: 'Límite por carga útil', valor: porPeso, unidad: 'bolsones', decimales: 0 },
        { etiqueta: 'Ocupación del piso', valor: redondear(ocupacionPiso * 100, 1), unidad: '%', decimales: 1, nota: 'Superficie del piso realmente ocupada por las bases.' },
        { etiqueta: 'Carga útil sin usar', valor: redondear(Math.max(0, util - pesoTotal), 0), unidad: 'kg', decimales: 0 },
      ],
      avisos,
    };
  },
};

/* ================================================================== */
/* 5. Capacidad de un big bag                                          */
/* ================================================================== */

const capacidadBigBag: Calculadora = {
  slug: 'capacidad-big-bag',
  tituloSeo: 'Calculadora de capacidad de big bag',
  titulo: 'Capacidad de un big bag según el material',
  pregunta: '¿Cuánto material entra en un big bag de estas medidas, y cuánto va a pesar?',
  resumen:
    'Convierte las medidas del bolsón en volumen y, con la densidad aparente del material que usted ' +
    'mide o toma de su ficha, en peso. Después compara ese peso con la carga de trabajo segura del ' +
    'bolsón, que es la comprobación que decide si el envase sirve.',
  area: 'Envases y embalaje',
  campos: [
    { id: 'bolsaA', etiqueta: 'Base, lado A', unidad: 'm', ayuda: 'Del bolsón lleno.', tipo: 'numero', porDefecto: 0.9, min: 0.2, max: 3, paso: 0.05 },
    { id: 'bolsaB', etiqueta: 'Base, lado B', unidad: 'm', ayuda: '', tipo: 'numero', porDefecto: 0.9, min: 0.2, max: 3, paso: 0.05 },
    { id: 'bolsaH', etiqueta: 'Altura útil de llenado', unidad: 'm', ayuda: 'Hasta donde llega el material, no la altura total del bolsón.', tipo: 'numero', porDefecto: 1.1, min: 0.2, max: 3, paso: 0.05 },
    {
      id: 'densidad',
      etiqueta: 'Densidad aparente del material',
      unidad: 't/m³',
      ayuda:
        'La del material suelto, no la del sólido. Se mide llenando un recipiente de volumen conocido ' +
        'y pesándolo. No la publicamos: cambia con la humedad, la granulometría y el asentamiento.',
      tipo: 'numero',
      porDefecto: 1.6,
      min: 0.05,
      max: 6,
      paso: 0.05,
      esSupuesto: true,
    },
    {
      id: 'llenado',
      etiqueta: 'Grado de llenado',
      unidad: '%',
      ayuda: 'Punto de partida. Llenar al 100 % del volumen geométrico deja el bolsón sin forma para izar ni estibar.',
      tipo: 'numero',
      porDefecto: 90,
      min: 10,
      max: 100,
      paso: 1,
      esSupuesto: true,
    },
    {
      id: 'swl',
      etiqueta: 'Carga de trabajo segura del bolsón (SWL)',
      unidad: 'kg',
      ayuda: 'De la etiqueta del bolsón. Es el dato que decide si el envase sirve para este material.',
      tipo: 'numero',
      porDefecto: 1000,
      min: 50,
      max: 5000,
      paso: 50,
    },
  ],
  formula: [
    'volumen_geométrico = A × B × altura_útil',
    'volumen_llenado    = volumen_geométrico × grado_de_llenado',
    'peso_del_contenido = volumen_llenado × densidad_aparente × 1000',
    'comprobación: peso_del_contenido ≤ carga_de_trabajo_segura',
  ],
  supuestos: [
    'El bolsón se trata como un prisma recto. Un bolsón lleno se abomba, así que el volumen real es ' +
      'algo mayor y el prisma queda del lado conservador para el volumen — pero del lado optimista ' +
      'para la altura, porque el abombamiento reduce la altura que alcanza el material.',
    'La densidad aparente la aporta usted. Cambia con la humedad, la granulometría y el asentamiento ' +
      'durante el transporte, y por eso no se publica de memoria.',
    'El grado de llenado es un supuesto editable, no una recomendación.',
  ],
  noCubre: [
    'El factor de seguridad del bolsón (5:1 o 6:1 según el uso). La SWL de la etiqueta ya lo incorpora; ' +
      'no se aplica dos veces.',
    'La compatibilidad química ni la necesidad de liner interior.',
    'El tipo electrostático exigido por el material y por la atmósfera del punto de llenado.',
    'El asentamiento durante el transporte, que cambia la altura y el centro de gravedad.',
  ],
  verTambien: [
    { texto: 'Guía: big bags en minería, normativa y errores de estiba', href: GUIA_BIGBAGS },
    { texto: 'Glosario: densidad aparente', href: '/glosario/densidad-aparente' },
    { texto: 'Glosario: carga de trabajo segura', href: '/glosario/carga-de-trabajo-segura' },
    { texto: 'Glosario: factor de seguridad', href: '/glosario/factor-de-seguridad' },
    { texto: 'Glosario: liner interior', href: '/glosario/liner-interior' },
  ],
  calcular: (v) => {
    const a = v.bolsaA ?? 0;
    const b = v.bolsaB ?? 0;
    const h = v.bolsaH ?? 0;
    const dens = v.densidad ?? 0;
    const llenado = v.llenado ?? 0;
    const swl = v.swl ?? 0;

    if (a <= 0 || b <= 0 || h <= 0 || dens <= 0) {
      return { principales: [], desglose: [], avisos: [], invalido: 'Medidas y densidad deben ser mayores que cero.' };
    }

    const volGeom = a * b * h;
    const volLleno = volGeom * (llenado / 100);
    const pesoContenido = volLleno * dens * 1000;
    const holgura = swl - pesoContenido;

    const avisos: string[] = [];
    if (pesoContenido > swl) {
      avisos.push(
        `El contenido pesaría ${redondear(pesoContenido, 0)} kg y la carga de trabajo segura declarada ` +
          `es de ${redondear(swl, 0)} kg. El bolsón NO sirve para este material a este llenado: hay que ` +
          'bajar el llenado, reducir el bolsón o subir la SWL.',
      );
    } else if (holgura < swl * 0.05) {
      avisos.push(
        `Queda menos del 5 % de holgura contra la SWL (${redondear(holgura, 0)} kg). Con un material ` +
          'que se asienta o que llega más húmedo, ese margen desaparece.',
      );
    }
    if (llenado >= 98) {
      avisos.push('Con el bolsón lleno al ras no queda material de cuello para cerrar ni forma para izar. Revise el grado de llenado.');
    }
    avisos.push('La densidad aparente cambia con la humedad y la granulometría: mídala sobre el material que va a envasar, no sobre una referencia genérica.');

    return {
      principales: [
        { etiqueta: 'Peso del contenido', valor: redondear(pesoContenido, 0), unidad: 'kg', decimales: 0, nota: pesoContenido > swl ? 'Supera la carga de trabajo segura declarada.' : `Holgura de ${redondear(holgura, 0)} kg contra la SWL.` },
        { etiqueta: 'Volumen de llenado', valor: redondear(volLleno, 3), unidad: 'm³', decimales: 3, nota: `Equivale a ${redondear(volLleno * 1000, 0)} litros.` },
      ],
      desglose: [
        { etiqueta: 'Volumen geométrico', valor: redondear(volGeom, 3), unidad: 'm³', decimales: 3, nota: `${a} × ${b} × ${h} m.` },
        { etiqueta: 'Grado de llenado', valor: redondear(llenado, 0), unidad: '%', decimales: 0 },
        { etiqueta: 'Densidad aparente usada', valor: redondear(dens, 2), unidad: 't/m³', decimales: 2 },
        { etiqueta: 'Carga de trabajo segura declarada', valor: redondear(swl, 0), unidad: 'kg', decimales: 0 },
        { etiqueta: 'Holgura contra la SWL', valor: redondear(holgura, 0), unidad: 'kg', decimales: 0 },
      ],
      avisos,
    };
  },
};

/* ================================================================== */
/* Registro                                                            */
/* ================================================================== */

export const calculadoras: Calculadora[] = [
  caudalVentilacion,
  geomembranaPoza,
  rollosPorSuperficie,
  bigBagsPorViaje,
  capacidadBigBag,
];

export const calculadoraPorSlug = (slug: string): Calculadora | undefined =>
  calculadoras.find((c) => c.slug === slug);

/**
 * Calculadoras que se apoyan en una página concreta (una guía, una
 * arquitectura, un término). Se DERIVA de `verTambien` en lugar de declararse
 * aparte: un enlace declarado dos veces se queda a medias el día que alguien
 * renombra un slug, y el síntoma es una guía que promete una calculadora que
 * ya no la enlaza. Aquí el enlace inverso no puede divergir porque no existe:
 * se calcula.
 */
export function calculadorasQueEnlazan(href: string): Calculadora[] {
  return calculadoras.filter((c) => c.verTambien.some((e) => e.href === href));
}

export const areasDeCalculo = (): string[] => [...new Set(calculadoras.map((c) => c.area))];

/** Valores de partida de una calculadora, listos para el estado del formulario. */
export function valoresIniciales(c: Calculadora): Record<string, number> {
  const v: Record<string, number> = {};
  for (const campo of c.campos) v[campo.id] = campo.porDefecto;
  return v;
}

/**
 * La advertencia que acompaña a TODA salida, en el sitio y en el volcado JSON.
 * Una sola frase, escrita una sola vez, imposible de olvidar en una página.
 */
export const ADVERTENCIA =
  'Predimensionamiento, no cálculo de ingeniería. Sirve para llegar a la cotización con un número ' +
  'propio y para ver qué variable manda. No sustituye una memoria de cálculo firmada ni autoriza a ' +
  'ejecutar nada. Verifique todo valor normativo contra el texto vigente.';

export const CITA_SUGERIDA = `${SITE.legalName} — Calculadoras de predimensionamiento, ${SITE.url}/calculadoras`;
