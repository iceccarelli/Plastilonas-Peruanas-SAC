import type { Lectura, SerieBCRP } from './bcrp';
import { consultarBCRP, periodoAIso, ultimasLecturas } from './bcrp';

/**
 * INDICADORES EN VIVO.
 *
 * Qué son y por qué estos. No son "la bolsa": son los cuatro precios que de
 * verdad mueven una cotización de plastilonas, y cada uno está enlazado al
 * informe que explica POR QUÉ importa. Sin esa explicación al lado, un número
 * grande en una página es decoración.
 *
 *   Petróleo WTI   cabeza de la cadena de la resina. Sube el crudo, sube la
 *                  nafta, sube el polipropileno, sube la lona — con semanas de
 *                  desfase por inventario.
 *   Tipo de cambio la resina se compra en dólares y se factura en soles.
 *   Cobre LME      demanda de tajo abierto e hidrometalurgia: impermeabilización.
 *   Zinc LME       demanda subterránea: ventilación.
 *   Plomo LME      idem, suele acompañar al zinc en la misma operación.
 *
 * LA REGLA QUE GOBIERNA ESTA PÁGINA: cada número se muestra con la fecha de su
 * lectura, siempre. Un sitio que aparenta estar vivo mostrando un dato viejo
 * sin fecha es peor que uno estático honesto, porque el lector cotiza contra
 * él. Acá la frescura no se insinúa: se declara.
 *
 * RESPALDO EN FRÍO. Si el BCRP no responde, se sirven estos valores con SU
 * fecha y un aviso visible. Se actualizan a mano cuando corresponda; su razón
 * de ser es que ni la compilación ni la página se rompan por una caída ajena.
 * Fueron verificados contra la API el 2026-08-20.
 */

export const SERIES: SerieBCRP[] = [
  {
    codigo: 'PN01660XM',
    etiqueta: 'Petróleo WTI',
    unidad: 'US$ por barril',
    rango: [5, 400],
    decimales: 2,
  },
  {
    codigo: 'PN01652XM',
    etiqueta: 'Cobre LME',
    unidad: '¢US$ por libra',
    rango: [50, 2000],
    decimales: 2,
  },
  {
    codigo: 'PN01657XM',
    etiqueta: 'Zinc LME',
    unidad: '¢US$ por libra',
    rango: [10, 500],
    decimales: 2,
  },
  {
    codigo: 'PN01656XM',
    etiqueta: 'Plomo LME',
    unidad: '¢US$ por libra',
    rango: [10, 400],
    decimales: 2,
  },
];

/** El tipo de cambio va aparte: es serie diaria, con otro rango de fechas. */
export const SERIE_TIPO_CAMBIO: SerieBCRP = {
  codigo: 'PD04640PD',
  etiqueta: 'Tipo de cambio (venta)',
  unidad: 'soles por dólar',
  rango: [1.5, 8],
  decimales: 3,
};

/** Qué decide cada indicador en una cotización. Sin esto, es decoración. */
export const PORQUE: Record<string, { texto: string; informe: string }> = {
  PN01660XM: {
    texto:
      'Cabeza de la cadena de la resina: el crudo se transforma en nafta, la nafta en propileno y el propileno en el polipropileno que se teje. Llega a la cotización con semanas de desfase por inventario.',
    informe: 'formacion-de-precio-y-volatilidad-textiles-industriales',
  },
  PD04640PD: {
    texto:
      'La resina se compra en dólares y la venta se factura en soles. Un sol más fuerte amortigua un alza en dólares, y al revés.',
    informe: 'formacion-de-precio-y-volatilidad-textiles-industriales',
  },
  PN01652XM: {
    texto:
      'Termómetro de la minería de tajo abierto y de los procesos hidrometalúrgicos, que es donde se demanda impermeabilización: geomembrana, geotextil de protección y detalle de anclaje.',
    informe: 'sectores-compradores-textiles-industriales-peru',
  },
  PN01657XM: {
    texto:
      'El zinc concentra operación subterránea, y la operación subterránea demanda ventilación: mangas dimensionadas por caudal y por configuración impelente o aspirante.',
    informe: 'sectores-compradores-textiles-industriales-peru',
  },
  PN01656XM: {
    texto:
      'Suele extraerse en las mismas operaciones que el zinc, de modo que acompaña a la misma demanda de ventilación y de manejo de concentrado.',
    informe: 'sectores-compradores-textiles-industriales-peru',
  },
};

/**
 * Última lectura buena conocida. Es el respaldo en frío, no un valor vigente:
 * la página lo declara como tal cuando lo usa.
 */
export const RESPALDO: { lecturas: Lectura[]; verificado: string } = {
  verificado: '2026-08-20',
  lecturas: [
    { codigo: 'PN01660XM', periodo: 'Jul.2026', valor: 79.99 },
    { codigo: 'PN01652XM', periodo: 'Jul.2026', valor: 613.49 },
    { codigo: 'PN01657XM', periodo: 'Jul.2026', valor: 163.12 },
    { codigo: 'PN01656XM', periodo: 'Jul.2026', valor: 83.56 },
    { codigo: 'PD04640PD', periodo: '20.Ago.26', valor: 3.372 },
  ],
};

export interface IndicadorVivo {
  serie: SerieBCRP;
  valor: number | null;
  periodo: string;
  /** Fecha ISO del periodo, si se pudo interpretar. */
  fechaIso: string | null;
  /** true si el valor viene del respaldo en frío y no de la API. */
  deRespaldo: boolean;
}

export interface EstadoIndicadores {
  indicadores: IndicadorVivo[];
  /** true si TODO viene del respaldo: el BCRP no respondió. */
  sinConexion: boolean;
  /** Momento en que se intentó la lectura (ISO, sin hora). */
  consultadoEl: string;
}

const desdeMensual = (hoy: Date) =>
  `${hoy.getUTCFullYear() - 1}-${hoy.getUTCMonth() + 1}`;
const hastaMensual = (hoy: Date) =>
  `${hoy.getUTCFullYear()}-${hoy.getUTCMonth() + 1}`;
const iso = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Reúne el estado de todos los indicadores.
 *
 * @param ahora Fecha de referencia. Se inyecta para que los tests sean
 *   deterministas y para no depender del reloj dentro de la lógica.
 */
export async function leerIndicadores(ahora: Date): Promise<EstadoIndicadores> {
  const desde = new Date(ahora);
  desde.setUTCDate(desde.getUTCDate() - 30);

  const [mensual, diario] = await Promise.all([
    consultarBCRP(SERIES.map((s) => s.codigo), desdeMensual(ahora), hastaMensual(ahora)),
    consultarBCRP([SERIE_TIPO_CAMBIO.codigo], iso(desde), iso(ahora)),
  ]);

  const lecturas = new Map<string, Lectura>();
  if (mensual) for (const l of ultimasLecturas(mensual, SERIES)) lecturas.set(l.codigo, l);
  if (diario) {
    for (const l of ultimasLecturas(diario, [SERIE_TIPO_CAMBIO])) lecturas.set(l.codigo, l);
  }

  const todas = [SERIE_TIPO_CAMBIO, ...SERIES];
  const indicadores: IndicadorVivo[] = todas.map((serie) => {
    const viva = lecturas.get(serie.codigo);
    if (viva) {
      return {
        serie,
        valor: viva.valor,
        periodo: viva.periodo,
        fechaIso: periodoAIso(viva.periodo),
        deRespaldo: false,
      };
    }
    // Respaldo en frío. Un valor de 0 en el respaldo significa "nunca se
    // verificó": se muestra como sin dato antes que como un cero falso.
    const fria = RESPALDO.lecturas.find((l) => l.codigo === serie.codigo);
    return {
      serie,
      valor: fria && fria.valor > 0 ? fria.valor : null,
      periodo: fria?.periodo ?? '',
      fechaIso: fria ? periodoAIso(fria.periodo) : null,
      deRespaldo: true,
    };
  });

  return {
    indicadores,
    sinConexion: indicadores.every((i) => i.deRespaldo),
    consultadoEl: iso(ahora),
  };
}
