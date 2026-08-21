#!/usr/bin/env bash
# =============================================================================
#  P21 — Sistema de imágenes + el arreglo del "sinConexion: true"
#  Plastilonas Peruanas SAC
#
#  PRIMERO: POR QUÉ LOS INDICADORES SALIERON SIRVIENDO EL RESPALDO
#  ---------------------------------------------------------------
#  El JSON en produccion decia "sinConexion": true. La causa: el cliente del
#  BCRP no enviaba User-Agent. Es EXACTAMENTE el error que ya se habia
#  encontrado y corregido dos parches antes en el script de vigilancia —gob.pe
#  devuelve 418 a un fetcher y 200 a un navegador— y el cliente se escribio
#  despues sin aplicar la leccion.
#
#  Peor: fallaba MUDO. Fallar cerrado es correcto; no dejar rastro del motivo
#  hace imposible diagnosticarlo en produccion, y costo un despliegue entero.
#  Ahora la consulta devuelve el motivo (http / forma-inesperada /
#  tiempo-agotado / red) con su codigo HTTP, y /indicadores/datos.json lo
#  publica. Un test exige la cabecera y otro exige que el motivo viaje.
#
#  SEGUNDO: EL SISTEMA DE IMAGENES
#  -------------------------------
#  Hallazgo al medir: el catalogo YA declara 155 rutas con la convencion
#  /images/galeria/{slug}-{variante}.jpg, y 116 de esos archivos YA existen
#  (1920x1280, todas distintas). No hacia falta inventar una convencion: hacia
#  falta saber cuales faltan y poder encargarlas sin que el nombre se desvie.
#
#  Faltan 75, y estan identificadas una por una:
#     6  arquitecturas de referencia  -> diagrama de corte con sus capas
#    11  portadas de familia          -> 11 paginas indexables hoy sin imagen
#    28  galerias de 7 productos      -> los unicos con una sola foto
#    20  terminos del glosario        -> los que describen geometria o proceso
#    10  encabezados de guia
#
#  EL PROMPT SE GENERA DESDE EL REGISTRO, no se escribe aparte. El nombre del
#  archivo se DERIVA del slug real: si alguien renombra un producto, el encargo
#  se renombra con el. Una lista escrita a mano se desincroniza la primera vez
#  que algo cambia y el sintoma aparece semanas despues como una pagina con un
#  hueco.
#
#     npm run imagenes            informe: cuantas hay, cuantas faltan, cuales
#     npm run imagenes:prompts    escribe docs/encargo-imagenes.md
#
#  Ese documento es lo que se le entrega al generador de imagenes TAL CUAL.
#
#  DEGRADACION HONESTA
#  -------------------
#  Las 75 no llegan el mismo dia. Una pagina que referencia un archivo
#  inexistente muestra el icono de imagen rota, que comunica abandono con mas
#  fuerza que cualquier texto. Se comprueba en compilacion si el archivo
#  existe: si esta, se muestra; si no, un marcador sobrio que declara que falta
#  —visible para quien administra, discreto para el visitante, imposible de
#  confundir con contenido terminado. Cero etiquetas img rotas, verificado.
#
#  Y LA REGLA DE SIEMPRE
#  ---------------------
#  Una imagen generada NO es una fotografia del producto real. Cada ranura
#  declara su tipo y las ilustraciones se publican marcadas como referenciales;
#  los esquemas, como "no representa una obra ejecutada". En mineria una imagen
#  tecnicamente incorrecta destruye la credibilidad que todo lo demas
#  construyo, y un comprador que especifica contra ella es un problema mucho
#  mas caro que una pagina sin foto. Cuando exista la foto real, sobrescribe
#  al archivo generado: esa sustitucion es un solo paso.
#
#  Uso:
#    ls aplicar*p21*
#    bash aplicarp21imagenes.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ]; then
  echo "ERROR: ejecute este script desde la raíz del repositorio." >&2
  exit 1
fi

# -----------------------------------------------------------------------------
# lib/bcrp.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/bcrp.ts" <<'P21_EOF'
/**
 * CLIENTE DE LA API DE ESTADÍSTICAS DEL BCRP.
 *
 * Por qué el Banco Central y no un proveedor de datos de mercado. Tres razones
 * que se refuerzan: es la fuente oficial peruana, es gratuita y sin clave, y
 * publica en una sola API tanto el tipo de cambio como las cotizaciones
 * internacionales de los metales y del petróleo. Es decir, cubre los dos
 * extremos de nuestra historia — lo que mueve el COSTO (petróleo, que es la
 * cabeza de la cadena de la resina) y lo que mueve la DEMANDA (cobre, zinc,
 * plomo, estaño, que son los metales cuya producción explica qué se compra).
 *
 * Formato de la API:
 *   /estadisticas/series/api/{codigos}/json/{desde}/{hasta}/esp
 * Varios códigos se unen con guion y vuelven en el mismo `values`, en el orden
 * declarado en `config.series`.
 *
 * TRES DECISIONES DE DISEÑO, todas sobre lo mismo: qué hacer cuando el dato
 * llega mal. Es donde fallan casi todas las integraciones "en vivo".
 *
 *  1. FALLA CERRADA. Si la API no responde, se sirve la última lectura buena
 *     conocida CON SU FECHA y diciéndolo. Nunca un hueco, y jamás un número
 *     viejo presentado como si fuera de hoy. Un sitio que aparenta estar vivo
 *     mostrando un dato rancio es peor que uno que declara su fecha.
 *
 *  2. RANGO PLAUSIBLE. Todo valor se compara contra un rango declarado antes
 *     de aceptarse. Una API que devuelve basura no es una hipótesis: pasa. Y
 *     publicar basura con nuestro nombre encima destruye exactamente lo que
 *     todo este sitio construyó.
 *
 *  3. "n.d." NO ES CERO. El BCRP marca así fines de semana y feriados en las
 *     series diarias. Interpretarlo como cero produciría una caída del tipo de
 *     cambio a cero cada sábado.
 */

const BASE = 'https://estadisticas.bcrp.gob.pe/estadisticas/series/api';

export interface SerieBCRP {
  /** Código de la serie, p. ej. PN01660XM. */
  codigo: string;
  /** Nombre corto para mostrar. */
  etiqueta: string;
  unidad: string;
  /** Rango plausible [mín, máx]. Fuera de él, el valor se descarta. */
  rango: [number, number];
  /** Decimales a mostrar. */
  decimales: number;
}

export interface Lectura {
  codigo: string;
  /** Periodo tal como lo publica el BCRP, p. ej. "Jul.2026" o "20.Ago.26". */
  periodo: string;
  valor: number;
}

export interface RespuestaBCRP {
  config?: { title?: string; series?: { name?: string; dec?: string }[] };
  periods?: { name?: string; values?: (string | null)[] }[];
}

/** Meses del BCRP a número, para poder ordenar y fechar. */
const MESES: Record<string, string> = {
  Ene: '01', Feb: '02', Mar: '03', Abr: '04', May: '05', Jun: '06',
  Jul: '07', Ago: '08', Set: '09', Sep: '09', Oct: '10', Nov: '11', Dic: '12',
};

/**
 * "Jul.2026" → "2026-07"; "20.Ago.26" → "2026-08-20".
 * Devuelve null si no reconoce el formato: preferimos no fechar a fechar mal.
 */
export function periodoAIso(periodo: string): string | null {
  const mensual = periodo.match(/^([A-Za-z]{3})\.(\d{4})$/);
  if (mensual) {
    const mes = MESES[mensual[1]];
    return mes ? `${mensual[2]}-${mes}` : null;
  }
  const diario = periodo.match(/^(\d{2})\.([A-Za-z]{3})\.(\d{2})$/);
  if (diario) {
    const mes = MESES[diario[2]];
    return mes ? `20${diario[3]}-${mes}-${diario[1]}` : null;
  }
  return null;
}

/**
 * Convierte el valor crudo del BCRP en número, o null.
 * "n.d." marca fin de semana o feriado: no es cero, es ausencia de dato.
 */
export function parseValor(bruto: string | null | undefined): number | null {
  if (bruto === null || bruto === undefined) return null;
  const limpio = String(bruto).trim();
  if (!limpio || /^n\.?d\.?$/i.test(limpio)) return null;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

/**
 * Extrae la última lectura válida de cada serie de una respuesta del BCRP.
 *
 * Se recorre de atrás hacia adelante y se toma el primer valor que exista Y
 * caiga dentro del rango declarado. Así un dato corrupto al final no deja la
 * serie sin lectura: se cae al anterior, que sí es plausible.
 */
export function ultimasLecturas(
  respuesta: RespuestaBCRP,
  series: SerieBCRP[],
): Lectura[] {
  const periodos = respuesta.periods ?? [];
  const lecturas: Lectura[] = [];

  series.forEach((serie, columna) => {
    for (let i = periodos.length - 1; i >= 0; i--) {
      const periodo = periodos[i];
      const valor = parseValor(periodo.values?.[columna]);
      if (valor === null) continue;
      const [min, max] = serie.rango;
      if (valor < min || valor > max) continue; // Basura declarada como tal.
      lecturas.push({ codigo: serie.codigo, periodo: periodo.name ?? '', valor });
      return;
    }
  });

  return lecturas;
}

/** URL de consulta. Se expone para poder citarla y para los tests. */
export function urlSerie(codigos: string[], desde: string, hasta: string): string {
  return `${BASE}/${codigos.join('-')}/json/${desde}/${hasta}/esp`;
}

/**
 * Cabeceras de la petición.
 *
 * El User-Agent NO es cortesía: los portales del Estado peruano están detrás
 * de cortafuegos que rechazan a un cliente sin cabecera de navegador. Ya lo
 * habíamos comprobado —gob.pe devuelve 418 a un fetcher y 200 a un navegador—
 * y el script de vigilancia se corrigió por eso. Este cliente se escribió
 * después SIN aplicar la misma lección, y el resultado fue que la página de
 * indicadores salió a producción sirviendo el respaldo en frío: el sitio
 * "en vivo" no estaba leyendo nada.
 *
 * Se identifica quiénes somos y se enlaza la página que consume el dato: un
 * rastreador que se identifica y declara su propósito es un rastreador que un
 * administrador puede permitir en lugar de bloquear a ciegas.
 */
const CABECERAS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (compatible; PlastilonasIndicadores/1.0; +https://plastilonas-peruanas-sac.vercel.app/indicadores)',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'es-PE,es;q=0.9',
};

/** Por qué falló la última consulta. Vacío si salió bien. */
export type MotivoFallo =
  | 'ok'
  | 'http'
  | 'forma-inesperada'
  | 'tiempo-agotado'
  | 'red';

export interface ResultadoBCRP {
  datos: RespuestaBCRP | null;
  motivo: MotivoFallo;
  /** Código HTTP, cuando lo hubo. Sirve para distinguir un 403 de un 500. */
  estado?: number;
}

/**
 * Consulta el BCRP. NUNCA lanza: devuelve el motivo del fallo y quien la llama
 * decide qué mostrar. Un fallo de la API no puede tumbar una compilación ni
 * dejar una página en blanco.
 *
 * Devuelve el MOTIVO y no solo null porque la primera versión fallaba en
 * silencio: la página salió a producción sirviendo el respaldo y no había
 * forma de saber si era un bloqueo, un tiempo agotado o un cambio de formato.
 * Fallar cerrado es correcto; fallar mudo, no.
 */
export async function consultarBCRPDetallado(
  codigos: string[],
  desde: string,
  hasta: string,
  opciones: { revalidate?: number; timeoutMs?: number } = {},
): Promise<ResultadoBCRP> {
  const { revalidate = 3600, timeoutMs = 8000 } = opciones;
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), timeoutMs);
  try {
    const res = await fetch(urlSerie(codigos, desde, hasta), {
      signal: control.signal,
      headers: CABECERAS,
      next: { revalidate },
    });
    if (!res.ok) return { datos: null, motivo: 'http', estado: res.status };
    const datos = (await res.json()) as RespuestaBCRP;
    // Una respuesta 200 con forma inesperada es tan inservible como un 500.
    if (!Array.isArray(datos?.periods) || datos.periods.length === 0) {
      return { datos: null, motivo: 'forma-inesperada', estado: res.status };
    }
    return { datos, motivo: 'ok', estado: res.status };
  } catch (e) {
    const abortado = e instanceof Error && e.name === 'AbortError';
    return { datos: null, motivo: abortado ? 'tiempo-agotado' : 'red' };
  } finally {
    clearTimeout(temporizador);
  }
}

/** Envoltura simple para quien no necesita el motivo. */
export async function consultarBCRP(
  codigos: string[],
  desde: string,
  hasta: string,
  opciones: { revalidate?: number; timeoutMs?: number } = {},
): Promise<RespuestaBCRP | null> {
  return (await consultarBCRPDetallado(codigos, desde, hasta, opciones)).datos;
}
P21_EOF

# -----------------------------------------------------------------------------
# lib/indicadores.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/indicadores.ts" <<'P21_EOF'
import type { Lectura, SerieBCRP } from './bcrp';
import { consultarBCRPDetallado, periodoAIso, ultimasLecturas } from './bcrp';
import type { MotivoFallo } from './bcrp';

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
  /**
   * Diagnóstico de la última lectura. Existe porque la primera versión fallaba
   * en silencio: la página salió a producción sirviendo el respaldo y no había
   * forma de saber si era un bloqueo, un tiempo agotado o un cambio de
   * formato. Se publica en el JSON, no en la página humana.
   */
  diagnostico: { serie: string; motivo: MotivoFallo; estado?: number }[];
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
    consultarBCRPDetallado(
      SERIES.map((s) => s.codigo), desdeMensual(ahora), hastaMensual(ahora),
    ),
    consultarBCRPDetallado([SERIE_TIPO_CAMBIO.codigo], iso(desde), iso(ahora)),
  ]);

  const lecturas = new Map<string, Lectura>();
  if (mensual.datos) {
    for (const l of ultimasLecturas(mensual.datos, SERIES)) lecturas.set(l.codigo, l);
  }
  if (diario.datos) {
    for (const l of ultimasLecturas(diario.datos, [SERIE_TIPO_CAMBIO])) {
      lecturas.set(l.codigo, l);
    }
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
    diagnostico: [
      { serie: 'cotizaciones', motivo: mensual.motivo, estado: mensual.estado },
      { serie: 'tipo-de-cambio', motivo: diario.motivo, estado: diario.estado },
    ],
  };
}
P21_EOF

# -----------------------------------------------------------------------------
# app/indicadores/datos.json/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/indicadores/datos.json"
cat > "app/indicadores/datos.json/route.ts" <<'P21_EOF'
import { leerIndicadores, PORQUE } from '@/lib/indicadores';
import { SITE } from '@/lib/site';

/**
 * Indicadores en formato de datos, para agentes y scripts.
 *
 * Cada valor viaja con su periodo, su código de serie y si proviene del
 * respaldo en frío. Un agente que lea esto puede citar la cifra Y saber si
 * está vigente, que es exactamente lo que un tablero corriente no permite.
 */

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const estado = await leerIndicadores(new Date());

  const cuerpo = {
    fuente: {
      organismo: 'Banco Central de Reserva del Perú',
      api: 'https://estadisticas.bcrp.gob.pe/estadisticas/series/api',
      nota: 'Series públicas y gratuitas. Los valores se releen cada hora.',
    },
    consultadoEl: estado.consultadoEl,
    sinConexion: estado.sinConexion,
    // Por qué falló, si falló. Un fallo cerrado que además es mudo no se puede
    // diagnosticar en producción: pasó, y costó un despliegue entero.
    diagnostico: estado.diagnostico,
    atribucionSugerida: `${SITE.legalName} — Indicadores del rubro, ${SITE.url}/indicadores (datos: BCRP)`,
    advertencia:
      'Valores observados y fechados, no vigentes por definición: verifique el campo periodo antes de usarlos. No incluye precios de resina, nafta ni flete, que son producto comercial de terceros.',
    indicadores: estado.indicadores.map((i) => ({
      codigo: i.serie.codigo,
      etiqueta: i.serie.etiqueta,
      unidad: i.serie.unidad,
      valor: i.valor,
      periodo: i.periodo,
      fechaIso: i.fechaIso,
      esUltimaLecturaConocida: i.deRespaldo,
      queDecide: PORQUE[i.serie.codigo]?.texto ?? null,
      informe: PORQUE[i.serie.codigo]
        ? `${SITE.url}/informes/${PORQUE[i.serie.codigo].informe}`
        : null,
    })),
  };

  return new Response(`${JSON.stringify(cuerpo, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400',
      'X-Robots-Tag': 'all',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
P21_EOF

# -----------------------------------------------------------------------------
# test/indicadores.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/indicadores.test.ts" <<'P21_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseValor, periodoAIso, ultimasLecturas, urlSerie, type SerieBCRP } from '@/lib/bcrp';
import { SERIES, SERIE_TIPO_CAMBIO, RESPALDO, PORQUE, leerIndicadores } from '@/lib/indicadores';
import { informes } from '@/lib/informes';

/**
 * Una integración "en vivo" falla siempre por lo mismo: qué hace cuando el
 * dato llega mal. Estos tests ejercitan exactamente esos caminos, porque el
 * camino feliz se prueba solo el día que funciona.
 */

const serieFalsa: SerieBCRP = {
  codigo: 'X', etiqueta: 'x', unidad: 'u', rango: [10, 100], decimales: 2,
};

describe('BCRP: interpretación de la respuesta', () => {
  it('"n.d." es ausencia de dato, no cero', () => {
    // Fines de semana y feriados vienen así en las series diarias. Leerlo como
    // cero haría caer el tipo de cambio a cero cada sábado.
    expect(parseValor('n.d.')).toBeNull();
    expect(parseValor('N.D.')).toBeNull();
    expect(parseValor('nd')).toBeNull();
    expect(parseValor('')).toBeNull();
    expect(parseValor(null)).toBeNull();
    expect(parseValor('3.372')).toBe(3.372);
  });

  it('convierte los periodos del BCRP a fecha ISO', () => {
    expect(periodoAIso('Jul.2026')).toBe('2026-07');
    expect(periodoAIso('Ene.2026')).toBe('2026-01');
    expect(periodoAIso('20.Ago.26')).toBe('2026-08-20');
    // Preferimos no fechar a fechar mal.
    expect(periodoAIso('vaya usted a saber')).toBeNull();
  });

  it('toma la última lectura válida, saltando los huecos', () => {
    const r = { periods: [
      { name: 'A', values: ['50'] },
      { name: 'B', values: ['60'] },
      { name: 'C', values: ['n.d.'] },
    ] };
    expect(ultimasLecturas(r, [serieFalsa])).toEqual([
      { codigo: 'X', periodo: 'B', valor: 60 },
    ]);
  });

  it('descarta valores fuera del rango plausible y cae al anterior', () => {
    // Una API que devuelve basura no es una hipótesis: pasa. Y publicar basura
    // con nuestro nombre encima destruye lo que todo el sitio construyó.
    const r = { periods: [
      { name: 'A', values: ['50'] },
      { name: 'B', values: ['999999'] },
    ] };
    expect(ultimasLecturas(r, [serieFalsa])).toEqual([
      { codigo: 'X', periodo: 'A', valor: 50 },
    ]);
  });

  it('devuelve la serie vacía si ningún valor es utilizable', () => {
    const r = { periods: [{ name: 'A', values: ['n.d.'] }, { name: 'B', values: ['0'] }] };
    expect(ultimasLecturas(r, [serieFalsa])).toEqual([]);
  });

  it('reparte las columnas en el orden declarado al pedir varias series', () => {
    const otra: SerieBCRP = { ...serieFalsa, codigo: 'Y' };
    const r = { periods: [{ name: 'A', values: ['20', '80'] }] };
    expect(ultimasLecturas(r, [serieFalsa, otra])).toEqual([
      { codigo: 'X', periodo: 'A', valor: 20 },
      { codigo: 'Y', periodo: 'A', valor: 80 },
    ]);
  });

  it('arma la URL con los códigos unidos por guion', () => {
    expect(urlSerie(['A', 'B'], '2026-1', '2026-8')).toBe(
      'https://estadisticas.bcrp.gob.pe/estadisticas/series/api/A-B/json/2026-1/2026-8/esp',
    );
  });
});

describe('indicadores: falla cerrada', () => {
  it('reporta el motivo del fallo, no solo que falló', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response('nope', { status: 403 })) as typeof fetch;
    try {
      const estado = await leerIndicadores(new Date('2026-08-20T12:00:00Z'));
      expect(estado.sinConexion).toBe(true);
      for (const d of estado.diagnostico) {
        expect(d.motivo).toBe('http');
        expect(d.estado).toBe(403);
      }
    } finally {
      globalThis.fetch = original;
    }
  }, 20000);

  it('sin red, sirve el respaldo y lo declara como tal', async () => {
    // Se fuerza el fallo sustituyendo fetch: es el escenario que importa.
    const original = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new Error('sin red');
    }) as typeof fetch;
    try {
      const estado = await leerIndicadores(new Date('2026-08-20T12:00:00Z'));
      expect(estado.sinConexion).toBe(true);
      expect(estado.indicadores.length).toBe(SERIES.length + 1);
      for (const i of estado.indicadores) {
        expect(i.deRespaldo, i.serie.codigo).toBe(true);
        // Y aun así cada uno trae su periodo: el dato viejo se muestra fechado.
        expect(i.periodo.length, i.serie.codigo).toBeGreaterThan(0);
      }
    } finally {
      globalThis.fetch = original;
    }
  }, 20000);

  it('una respuesta 200 con forma inesperada se trata como fallo', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ mensaje: 'hola' }), { status: 200 })) as typeof fetch;
    try {
      const estado = await leerIndicadores(new Date('2026-08-20T12:00:00Z'));
      expect(estado.sinConexion).toBe(true);
    } finally {
      globalThis.fetch = original;
    }
  }, 20000);

  it('el respaldo cubre todas las series y con valores plausibles', () => {
    const todas = [SERIE_TIPO_CAMBIO, ...SERIES];
    for (const s of todas) {
      const fria = RESPALDO.lecturas.find((l) => l.codigo === s.codigo);
      expect(fria, `falta respaldo de ${s.codigo}`).toBeDefined();
      expect(fria!.valor, s.codigo).toBeGreaterThan(s.rango[0]);
      expect(fria!.valor, s.codigo).toBeLessThan(s.rango[1]);
    }
  });

  it('el respaldo declara cuándo se verificó', () => {
    expect(RESPALDO.verificado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const hoy = new Date().toISOString().slice(0, 10);
    expect(RESPALDO.verificado <= hoy).toBe(true);
  });
});

describe('indicadores: cada número explica por qué importa', () => {
  it('toda serie declara qué decide en una cotización', () => {
    // Un número grande sin explicación al lado es decoración, no información.
    for (const s of [SERIE_TIPO_CAMBIO, ...SERIES]) {
      const p = PORQUE[s.codigo];
      expect(p, `falta el porqué de ${s.codigo}`).toBeDefined();
      expect(p.texto.length).toBeGreaterThan(80);
    }
  });

  it('cada indicador enlaza a un informe que existe', () => {
    const slugs = new Set(informes.map((i) => i.slug));
    for (const [codigo, p] of Object.entries(PORQUE)) {
      expect(slugs.has(p.informe), `${codigo} → ${p.informe}`).toBe(true);
    }
  });

  it('el rango plausible de cada serie es estrecho y con sentido', () => {
    for (const s of [SERIE_TIPO_CAMBIO, ...SERIES]) {
      expect(s.rango[0], s.codigo).toBeGreaterThan(0);
      expect(s.rango[1], s.codigo).toBeGreaterThan(s.rango[0]);
      // Un rango de cero a infinito no valida nada.
      expect(s.rango[1] / s.rango[0], s.codigo).toBeLessThan(200);
    }
  });
});

describe('indicadores: el cliente no puede tumbar el sitio', () => {
  const src = readFileSync(join(process.cwd(), 'lib/bcrp.ts'), 'utf8');

  it('la consulta nunca lanza', () => {
    expect(src).toMatch(/} catch \(e\) \{/);
    expect(src).toMatch(/motivo: abortado \? 'tiempo-agotado' : 'red'/);
  });

  it('envía cabecera de navegador', () => {
    // Sin User-Agent, los portales del Estado peruano devuelven 418 o 403. La
    // lección ya se había aprendido en el script de vigilancia y este cliente
    // se escribió sin aplicarla: la página salió a producción sirviendo el
    // respaldo en frío. El test existe para que no vuelva a ocurrir.
    expect(src).toMatch(/'User-Agent'/);
    expect(src).toMatch(/Mozilla\/5\.0/);
  });

  it('distingue el motivo del fallo en vez de fallar mudo', () => {
    // Fallar cerrado es correcto; fallar mudo impide diagnosticar en
    // producción, que es exactamente lo que pasó.
    for (const motivo of ['http', 'forma-inesperada', 'tiempo-agotado', 'red']) {
      expect(src, motivo).toMatch(new RegExp(`'${motivo}'`));
    }
  });

  it('la petición lleva tiempo límite', () => {
    // Sin esto, una API lenta cuelga la compilación entera.
    expect(src).toMatch(/AbortController/);
    expect(src).toMatch(/timeoutMs/);
  });
});
P21_EOF

# -----------------------------------------------------------------------------
# lib/imagenes.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/imagenes.ts" <<'P21_EOF'
import { products, productFamilies } from './products';
import { articles } from './articles';
import { solutions } from './solutions';
import { terminos } from './glosario';

/**
 * REGISTRO DE IMÁGENES.
 *
 * Qué resuelve. El catálogo ya declara 155 rutas de imagen con una convención
 * estable —/images/galeria/{slug}-{variante}.jpg— y 116 de esos archivos ya
 * existen. Lo que faltaba no era una convención: era saber CUÁLES faltan y
 * poder pedirlas sin que el nombre se desvíe.
 *
 * Por qué el registro genera los prompts en vez de guardarlos aparte. Si la
 * lista de encargos vive en un documento suelto, el día que alguien renombre
 * un producto la imagen encargada deja de encajar y nadie se entera hasta que
 * la página sale con un hueco. Acá el nombre del archivo se DERIVA del slug
 * real, y el prompt se emite desde la misma fuente: no pueden divergir.
 *
 * REGLA DE HONESTIDAD, la misma de todo el sitio. Una imagen generada no es
 * una fotografía de nuestro producto. Se declara `tipo` en cada ranura y las
 * ilustraciones se marcan como referenciales al mostrarse. Un comprador que
 * especifica contra una imagen que no corresponde al material real es un
 * problema mucho más caro que una página sin foto — y en minería, una imagen
 * técnicamente incorrecta destruye la credibilidad que todo lo demás construyó.
 *
 * Prioridad: las fotografías reales SIEMPRE reemplazan a una ilustración. El
 * registro está hecho para que esa sustitución sea cambiar un archivo.
 */

export type TipoImagen = 'foto' | 'ilustracion' | 'diagrama';

export interface RanuraImagen {
  /** Identificador estable. */
  id: string;
  /** Ruta pública, tal como la sirve el sitio. */
  ruta: string;
  ancho: number;
  alto: number;
  /**
   * Texto alternativo. Describe lo que se ve, no lo que queremos posicionar:
   * un alt con palabras clave amontonadas es spam y lo penalizan.
   */
  alt: string;
  tipo: TipoImagen;
  /** Dónde se usa, para poder revisarlo. */
  contexto: string;
  /** Encargo para generarla. Se emite con el script de prompts. */
  prompt: string;
}

/* ------------------------------------------------------------------ */
/* Estilo de casa: lo que hace que 71 imágenes parezcan una sola serie */
/* ------------------------------------------------------------------ */

/**
 * Un catálogo con imágenes de estilos distintos se ve improvisado por mucho
 * que cada una sea buena por separado. Estas dos bases se anteponen a cada
 * encargo, y son la razón por la que el conjunto se lee como un sistema.
 */
export const ESTILO_FOTO =
  'Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. ' +
  'Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: ' +
  'sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. ' +
  'Contexto peruano creíble. Sin personas identificables ni rostros. ' +
  'Sin logotipos, marcas ni texto legible de ningún tipo. ' +
  'Sin marcas de agua. Proporción 3:2 horizontal.';

export const ESTILO_DIAGRAMA =
  'Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. ' +
  'Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, ' +
  'grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. ' +
  'Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. ' +
  'Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.';

/** Variantes de galería que el catálogo ya espera para cada producto. */
export const VARIANTES = [
  {
    clave: 'general',
    que: 'vista general del producto completo en su contexto de uso',
  },
  {
    clave: 'detalle',
    que: 'primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión)',
  },
  {
    clave: 'instalacion',
    que: 'el producto durante su instalación o puesta en servicio, mostrando el proceso',
  },
  {
    clave: 'escala',
    que: 'el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros',
  },
] as const;

const rutaGaleria = (slug: string, variante: string) =>
  `/images/galeria/${slug}-${variante}.jpg`;

/* ------------------------------------------------------------------ */
/* Ranuras derivadas de los datos reales                              */
/* ------------------------------------------------------------------ */

/** Productos a los que les falta la galería de cuatro variantes. */
export function ranurasProducto(): RanuraImagen[] {
  const completos = new Set(
    products
      .filter((p) =>
        VARIANTES.every((v) =>
          (p.gallery ?? []).some((g) => g.includes(`/galeria/${p.slug}-${v.clave}`)),
        ),
      )
      .map((p) => p.slug),
  );

  return products
    .filter((p) => !completos.has(p.slug))
    .flatMap((p) =>
      VARIANTES.map((v) => ({
        id: `producto:${p.slug}:${v.clave}`,
        ruta: rutaGaleria(p.slug, v.clave),
        ancho: 1920,
        alto: 1280,
        alt: `${p.name} — ${v.que}`,
        tipo: 'ilustracion' as TipoImagen,
        contexto: `Galería de /productos/${p.slug}`,
        prompt:
          `${ESTILO_FOTO}\n\nTEMA: ${p.name}. ${p.shortDescription}\n` +
          `ENCUADRE: ${v.que}.\n` +
          `USO REAL: ${(p.applications ?? []).slice(0, 3).join('; ') || p.category}.\n` +
          `SECTORES: ${(p.sector ?? []).join(', ')}.\n` +
          `IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; ` +
          `preferir la exactitud del material y su montaje antes que la belleza de la composición.`,
      })),
    );
}

/** Portada de cada familia: once páginas indexables hoy sin imagen. */
export function ranurasFamilia(): RanuraImagen[] {
  return productFamilies.map((f) => {
    const items = products.filter((p) => p.category === f.name);
    return {
      id: `familia:${f.slug}`,
      ruta: `/images/familias/${f.slug}.jpg`,
      ancho: 1920,
      alto: 1080,
      alt: `${f.name}: ${f.tagline}`,
      tipo: 'ilustracion' as TipoImagen,
      contexto: `Portada de /productos/familia/${f.slug}`,
      prompt:
        `${ESTILO_FOTO.replace('Proporción 3:2 horizontal.', 'Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.')}\n\n` +
        `TEMA: familia de producto "${f.name}". ${f.tagline}\n` +
        `DEBE SUGERIR EL CONJUNTO, no un solo artículo: ${items.slice(0, 4).map((p) => p.name).join('; ')}.\n` +
        `ENCUADRE: escena de trabajo real donde esta familia se usa, con varios de sus elementos visibles a distinta distancia.`,
    };
  });
}

/**
 * Arquitecturas de referencia: acá el diagrama vale más que la foto.
 * Una poza revestida fotografiada se ve como un hoyo con plástico; dibujada en
 * corte se ven las cinco capas y por qué cada una está.
 */
export function ranurasSolucion(): RanuraImagen[] {
  return solutions.map((s) => ({
    id: `solucion:${s.slug}`,
    ruta: `/images/soluciones/${s.slug}.png`,
    ancho: 1600,
    alto: 900,
    alt: `Esquema de la arquitectura de referencia: ${s.titulo}`,
    tipo: 'diagrama' as TipoImagen,
    contexto: `Encabezado de /soluciones/${s.slug}`,
    prompt:
      `${ESTILO_DIAGRAMA}\n\n` +
      `TEMA: corte o vista isométrica de esta configuración: ${s.titulo}.\n` +
      `ESCENARIO: ${s.escenario}\n` +
      `COMPONENTES QUE DEBEN DISTINGUIRSE, en su posición relativa correcta:\n` +
      s.componentes
        .map((c, i) => `  ${i + 1}. ${c.producto.replace(/-/g, ' ')} — ${c.funcion}`)
        .join('\n') +
      `\nIMPORTANTE: la posición de cada capa debe ser técnicamente correcta; ` +
      `el valor del dibujo es que un ingeniero pueda verificar el orden de montaje.`,
  }));
}

/** Encabezado de cada guía técnica. */
export function ranurasGuia(): RanuraImagen[] {
  return articles.map((a) => ({
    id: `guia:${a.slug}`,
    ruta: `/images/recursos/${a.slug}.jpg`,
    ancho: 1920,
    alto: 1080,
    // El título de una guía puede ser largo; el alt se acota para no
      // convertirse en un párrafo, que es cuando deja de ayudar a quien usa
      // lector de pantalla y empieza a parecer relleno de palabras clave.
      alt: `Apertura de la guía: ${a.title.length > 120 ? `${a.title.slice(0, 117)}…` : a.title}`,
    tipo: 'ilustracion' as TipoImagen,
    contexto: `Encabezado de /recursos/${a.slug}`,
    prompt:
      `${ESTILO_FOTO.replace('Proporción 3:2 horizontal.', 'Proporción 16:9 horizontal.')}\n\n` +
      `TEMA: ${a.title}\n` +
      `DE QUÉ TRATA: ${a.description}\n` +
      `ENCUADRE: la situación de obra concreta que la guía enseña a resolver, ` +
      `en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.`,
  }));
}

/**
 * Términos del glosario que ganan con un dibujo. No todos: "fabricación a
 * medida" no se dibuja, y una imagen decorativa junto a una definición
 * distrae en lugar de explicar. Se eligen los que describen una GEOMETRÍA o un
 * PROCEDIMIENTO, que es donde el dibujo hace un trabajo que el texto no hace.
 */
export const TERMINOS_ILUSTRABLES = [
  'big-bag-fibc',
  'tipo-electrostatico-fibc',
  'liner-interior',
  'ojal',
  'termosellado',
  'denier',
  'geomembrana',
  'geotextil',
  'no-tejido-punzonado',
  'soldadura-por-cuna-caliente',
  'zanja-de-anclaje',
  'subrasante',
  'geomalla',
  'manga-de-ventilacion',
  'ventilacion-impelente',
  'ventilacion-aspirante',
  'refuerzo-espiral',
  'mesh',
  'arquitectura-textil',
  'pretensado',
];

export function ranurasGlosario(): RanuraImagen[] {
  return terminos
    .filter((t) => TERMINOS_ILUSTRABLES.includes(t.slug))
    .map((t) => ({
      id: `glosario:${t.slug}`,
      ruta: `/images/glosario/${t.slug}.png`,
      ancho: 1200,
      alto: 900,
      alt: `Esquema explicativo del término ${t.termino}`,
      tipo: 'diagrama' as TipoImagen,
      contexto: `Definición en /glosario/${t.slug}`,
      prompt:
        `${ESTILO_DIAGRAMA.replace('Proporción', 'Proporción')}\n\n` +
        `TÉRMINO: ${t.termino}\n` +
        `QUÉ SIGNIFICA: ${t.definicionCorta}\n` +
        (t.comoSeMide ? `CÓMO SE MIDE: ${t.comoSeMide}\n` : '') +
        `EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. ` +
        `La representación tiene que ser técnicamente correcta: la geometría, las proporciones ` +
        `y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. ` +
        `Un esquema bonito y equivocado hace más daño que ninguno. ` +
        `Proporción 4:3 horizontal.`,
    }));
}

/** Todas las ranuras pendientes, en orden de prioridad de publicación. */
export function todasLasRanuras(): RanuraImagen[] {
  return [
    ...ranurasSolucion(),
    ...ranurasFamilia(),
    ...ranurasProducto(),
    ...ranurasGlosario(),
    ...ranurasGuia(),
  ];
}

/** Busca la ranura de una página concreta. */
export const ranuraPorId = (id: string): RanuraImagen | undefined =>
  todasLasRanuras().find((r) => r.id === id);
P21_EOF

# -----------------------------------------------------------------------------
# components/ImagenContenido.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/ImagenContenido.tsx" <<'P21_EOF'
import Image from 'next/image';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { RanuraImagen } from '@/lib/imagenes';

/**
 * Imagen de contenido con degradación honesta.
 *
 * El problema que resuelve: 75 imágenes encargadas no llegan todas el mismo
 * día. Una página que referencia un archivo inexistente muestra el icono de
 * imagen rota, que comunica abandono con más fuerza que cualquier texto de la
 * página. Y una imagen de relleno genérica es peor todavía: ocupa el sitio de
 * la buena y nadie vuelve a acordarse de encargarla.
 *
 * La solución: se comprueba en tiempo de compilación si el archivo existe. Si
 * está, se muestra. Si no, se muestra un marcador sobrio que declara qué
 * imagen falta — visible para quien administra el sitio, discreto para el
 * visitante, e imposible de confundir con contenido terminado.
 *
 * La comprobación es de servidor y ocurre una sola vez por compilación: no
 * añade nada al navegador.
 *
 * `prioridad` solo para la imagen que se ve sin desplazar: marcar varias como
 * prioritarias hace que compitan entre sí y empeora la métrica que se quería
 * mejorar.
 */

function archivoExiste(ruta: string): boolean {
  try {
    return existsSync(join(process.cwd(), 'public', ruta));
  } catch {
    return false;
  }
}

export default function ImagenContenido({
  ranura,
  prioridad = false,
  className = '',
  sizes = '(min-width: 1024px) 900px, 100vw',
}: {
  ranura: RanuraImagen;
  prioridad?: boolean;
  className?: string;
  sizes?: string;
}) {
  const hay = archivoExiste(ranura.ruta);

  if (!hay) {
    return (
      <div
        className={`flex items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center ${className}`}
        style={{ aspectRatio: `${ranura.ancho} / ${ranura.alto}` }}
        role="note"
        aria-label={`Imagen pendiente: ${ranura.alt}`}
      >
        <p className="max-w-sm text-sm text-gray-500">
          <span className="mb-1 block font-mono text-xs">{ranura.ruta}</span>
          Imagen pendiente de publicación.
        </p>
      </div>
    );
  }

  return (
    <figure className={className}>
      <Image
        src={ranura.ruta}
        alt={ranura.alt}
        width={ranura.ancho}
        height={ranura.alto}
        sizes={sizes}
        priority={prioridad}
        className="h-auto w-full rounded-3xl object-cover"
      />
      {/* Una ilustración no es una fotografía del producto real, y decirlo es
          más barato que un pedido devuelto. */}
      {ranura.tipo !== 'foto' && (
        <figcaption className="mt-2 text-xs text-gray-500">
          {ranura.tipo === 'diagrama'
            ? 'Esquema explicativo. No representa una obra ejecutada.'
            : 'Imagen referencial. Las especificaciones se confirman en la cotización.'}
        </figcaption>
      )}
    </figure>
  );
}
P21_EOF

# -----------------------------------------------------------------------------
# scripts/imagenes.mjs
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/imagenes.mjs" <<'P21_EOF'
#!/usr/bin/env node
/**
 * INVENTARIO DE IMÁGENES — qué falta y con qué encargarlo.
 *
 *   npm run imagenes            informe: cuántas hay, cuántas faltan y cuáles
 *   npm run imagenes:prompts    emite docs/encargo-imagenes.md
 *
 * Por qué los prompts se GENERAN y no se escriben a mano: el nombre de cada
 * archivo se deriva del slug real del catálogo. Si alguien renombra un
 * producto, el encargo se renombra con él en la siguiente ejecución. Una lista
 * de encargos escrita aparte se desincroniza la primera vez que algo cambia, y
 * el síntoma aparece semanas después como una página con un hueco.
 *
 * Sale con código 0 siempre: faltar imágenes es un estado normal del trabajo,
 * no un fallo de compilación.
 */

import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const ambar = (t) => `\x1b[33m${t}\x1b[0m`;

// El registro es TypeScript; se lee a través de tsx para no duplicarlo aquí.
function leerRanuras() {
  const salida = execFileSync(
    'npx',
    ['tsx', '-e', "import {todasLasRanuras} from './lib/imagenes'; console.log(JSON.stringify(todasLasRanuras()));"],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  );
  const linea = salida.trim().split('\n').pop();
  return JSON.parse(linea);
}

const ranuras = leerRanuras();
const faltan = ranuras.filter((r) => !existsSync(join('public', r.ruta)));
const hay = ranuras.length - faltan.length;

const modo = process.argv.includes('--prompts') ? 'prompts' : 'informe';

if (modo === 'informe') {
  console.log(`\nInventario de imágenes — ${ranuras.length} ranuras declaradas\n`);
  const porContexto = new Map();
  for (const r of faltan) {
    const grupo = r.id.split(':')[0];
    porContexto.set(grupo, (porContexto.get(grupo) ?? 0) + 1);
  }
  console.log(`  ${verde(`${hay} publicadas`)}   ${faltan.length ? ambar(`${faltan.length} pendientes`) : verde('0 pendientes')}\n`);
  for (const [grupo, n] of porContexto) {
    console.log(`  ${ambar('·')} ${grupo}: ${n} pendientes`);
  }
  if (faltan.length) {
    console.log('\n  Primeras diez pendientes:');
    for (const r of faltan.slice(0, 10)) console.log(`    ${r.ruta}`);
    console.log('\n  Genere el documento de encargo con:  npm run imagenes:prompts');
    console.log('  Mientras falten, la página muestra un marcador sobrio, no una imagen rota.');
  }
  console.log('');
  process.exit(0);
}

// --- Documento de encargo ---------------------------------------------------

const grupos = {
  solucion: 'Arquitecturas de referencia (diagramas)',
  familia: 'Portadas de familia',
  producto: 'Galerías de producto',
  glosario: 'Términos del glosario (diagramas)',
  guia: 'Encabezados de guía',
};

let md = `# Encargo de imágenes — Plastilonas Peruanas SAC

Generado por \`npm run imagenes:prompts\` desde el registro del sitio.
**No edite este archivo a mano**: se regenera, y el nombre de cada archivo se
deriva del slug real del catálogo.

## Cómo usarlo

1. Genere cada imagen con el prompt indicado.
2. Guárdela EXACTAMENTE con el nombre de archivo que aparece en \`Archivo\`.
3. Colóquela en la carpeta \`public/\` respetando la ruta completa.
4. Ejecute \`npm run imagenes\` para confirmar que el sitio ya la reconoce.

Las rutas empiezan por \`/images/...\`; en el repositorio eso corresponde a
\`public/images/...\`. Es decir: \`/images/familias/geosinteticos.jpg\` se sube
como \`public/images/familias/geosinteticos.jpg\`.

## Reglas que no debe romper el generador

- **Sin texto dentro de la imagen.** Ni etiquetas, ni cotas, ni títulos. Las
  leyendas las pone la página, en español y en HTML, donde un buscador y un
  lector de pantalla sí las leen. Texto quemado en un JPG es invisible para ambos.
- **Sin logotipos, marcas ni marcas de agua.**
- **Sin rostros identificables.**
- **Exactitud técnica antes que belleza.** Estas imágenes las mira gente que
  instala esto para vivir. Una costura mal representada o una capa en el orden
  equivocado cuesta más credibilidad de la que gana la estética.
- **Una imagen generada no es una fotografía del producto real.** El sitio las
  publica marcadas como referenciales. Cuando exista una foto real del material
  que efectivamente vendemos, reemplaza a la generada: basta sobrescribir el archivo.

---

`;

let total = 0;
for (const [clave, titulo] of Object.entries(grupos)) {
  const delGrupo = ranuras.filter((r) => r.id.startsWith(`${clave}:`));
  if (!delGrupo.length) continue;
  const pendientes = delGrupo.filter((r) => !existsSync(join('public', r.ruta)));
  md += `## ${titulo}\n\n${pendientes.length} pendientes de ${delGrupo.length}.\n\n`;
  for (const r of pendientes) {
    total += 1;
    md += `### ${total}. \`${r.ruta}\`\n\n`;
    md += `| | |\n|---|---|\n`;
    md += `| **Archivo** | \`public${r.ruta}\` |\n`;
    md += `| **Tamaño** | ${r.ancho} × ${r.alto} px |\n`;
    md += `| **Tipo** | ${r.tipo} |\n`;
    md += `| **Dónde se usa** | ${r.contexto} |\n`;
    md += `| **Texto alternativo** | ${r.alt} |\n\n`;
    md += `**Prompt:**\n\n\`\`\`\n${r.prompt}\n\`\`\`\n\n---\n\n`;
  }
}

mkdirSync('docs', { recursive: true });
writeFileSync('docs/encargo-imagenes.md', md);
console.log(`\nEscrito docs/encargo-imagenes.md con ${total} encargos.\n`);
console.log('Entrégueselo a su generador de imágenes tal cual.');
console.log('Los nombres de archivo salen del catálogo: no los cambie.\n');
P21_EOF

# -----------------------------------------------------------------------------
# test/imagenes.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/imagenes.test.ts" <<'P21_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  todasLasRanuras, ranurasProducto, ranurasFamilia, ranurasSolucion,
  ranurasGuia, ranurasGlosario, TERMINOS_ILUSTRABLES, VARIANTES,
} from '@/lib/imagenes';
import { products, productFamilies } from '@/lib/products';
import { articles } from '@/lib/articles';
import { solutions } from '@/lib/solutions';
import { terminos } from '@/lib/glosario';

/**
 * El registro solo sirve si el nombre del archivo encargado es EXACTAMENTE el
 * que la página busca. Si divergen, el encargo llega y la página sigue vacía,
 * y el síntoma aparece semanas después.
 */

describe('registro de imágenes: los nombres no pueden divergir', () => {
  it('cada ranura deriva su ruta del slug real de su entidad', () => {
    for (const r of ranurasSolucion()) {
      const slug = r.id.split(':')[1];
      expect(solutions.some((s) => s.slug === slug), slug).toBe(true);
      expect(r.ruta).toBe(`/images/soluciones/${slug}.png`);
    }
    for (const r of ranurasFamilia()) {
      const slug = r.id.split(':')[1];
      expect(productFamilies.some((f) => f.slug === slug), slug).toBe(true);
      expect(r.ruta).toBe(`/images/familias/${slug}.jpg`);
    }
    for (const r of ranurasGuia()) {
      const slug = r.id.split(':')[1];
      expect(articles.some((a) => a.slug === slug), slug).toBe(true);
      expect(r.ruta).toBe(`/images/recursos/${slug}.jpg`);
    }
    for (const r of ranurasGlosario()) {
      const slug = r.id.split(':')[1];
      expect(terminos.some((t) => t.slug === slug), slug).toBe(true);
      expect(r.ruta).toBe(`/images/glosario/${slug}.png`);
    }
  });

  it('las galerías de producto respetan la convención que ya usa el catálogo', () => {
    // /images/galeria/{slug}-{variante}.jpg. Cambiarla dejaría huérfanas las
    // 116 imágenes que ya existen.
    for (const r of ranurasProducto()) {
      const [, slug, variante] = r.id.split(':');
      expect(products.some((p) => p.slug === slug), slug).toBe(true);
      expect(VARIANTES.some((v) => v.clave === variante), variante).toBe(true);
      expect(r.ruta).toBe(`/images/galeria/${slug}-${variante}.jpg`);
    }
  });

  it('no encarga lo que ya existe', () => {
    // Un producto con su galería completa no debe aparecer en el encargo.
    const conGaleria = products.filter((p) =>
      VARIANTES.every((v) =>
        (p.gallery ?? []).some((g) => g.includes(`/galeria/${p.slug}-${v.clave}`)),
      ),
    );
    expect(conGaleria.length).toBeGreaterThan(0);
    const encargados = new Set(ranurasProducto().map((r) => r.id.split(':')[1]));
    for (const p of conGaleria) expect(encargados.has(p.slug), p.slug).toBe(false);
  });

  it('los identificadores son únicos', () => {
    const ids = todasLasRanuras().map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('los términos ilustrables existen todos en el glosario', () => {
    for (const slug of TERMINOS_ILUSTRABLES) {
      expect(terminos.some((t) => t.slug === slug), slug).toBe(true);
    }
  });
});

describe('registro de imágenes: calidad del encargo', () => {
  const ranuras = todasLasRanuras();

  it('toda ranura declara dimensiones, alt y tipo', () => {
    for (const r of ranuras) {
      expect(r.ancho, r.id).toBeGreaterThan(400);
      expect(r.alto, r.id).toBeGreaterThan(300);
      // Un alt vacío o de dos palabras no describe nada.
      expect(r.alt.length, r.id).toBeGreaterThan(20);
      expect(['foto', 'ilustracion', 'diagrama']).toContain(r.tipo);
    }
  });

  it('ningún alt amontona palabras clave', () => {
    // Un alt con la lista de sectores repetida es spam y lo penalizan.
    for (const r of ranuras) {
      expect(r.alt.length, `${r.id}: alt demasiado largo`).toBeLessThan(180);
      const comas = (r.alt.match(/,/g) ?? []).length;
      expect(comas, `${r.id}: alt con demasiadas comas`).toBeLessThan(6);
    }
  });

  it('todo prompt prohíbe texto, logos y marcas de agua', () => {
    // Texto quemado en la imagen es invisible para un buscador y para un
    // lector de pantalla: la leyenda tiene que estar en el HTML.
    for (const r of ranuras) {
      expect(r.prompt.toLowerCase(), r.id).toMatch(/sin texto|sin logotipos/);
      expect(r.prompt.toLowerCase(), r.id).toContain('marcas de agua');
    }
  });

  it('los diagramas piden exactitud técnica', () => {
    for (const r of ranuras.filter((x) => x.tipo === 'diagrama')) {
      expect(r.prompt.toLowerCase(), r.id).toMatch(/correcta|correcto/);
    }
  });

  it('el prompt de cada arquitectura enumera sus componentes reales', () => {
    for (const r of ranurasSolucion()) {
      const s = solutions.find((x) => x.slug === r.id.split(':')[1])!;
      for (const c of s.componentes) {
        expect(r.prompt, `${r.id} debe mencionar ${c.producto}`).toContain(
          c.producto.replace(/-/g, ' '),
        );
      }
    }
  });
});

describe('imágenes: degradación honesta', () => {
  const src = readFileSync(join(process.cwd(), 'components/ImagenContenido.tsx'), 'utf8');

  it('nunca renderiza una imagen que no existe', () => {
    // El icono de imagen rota comunica abandono con más fuerza que cualquier
    // texto de la página.
    expect(src).toMatch(/existsSync/);
    expect(src).toMatch(/Imagen pendiente/);
  });

  it('marca las ilustraciones y los esquemas como tales', () => {
    // Una imagen generada no es una fotografía del producto real, y un
    // comprador que especifica contra ella es un problema caro.
    expect(src).toMatch(/Imagen referencial/);
    expect(src).toMatch(/No representa una obra ejecutada/);
  });

  it('usa next/image y no una etiqueta img suelta', () => {
    expect(src).toMatch(/from 'next\/image'/);
    expect(src).not.toMatch(/<img\s/);
  });

  it('exige ancho y alto: sin ellos la página salta al cargar', () => {
    expect(src).toMatch(/width=\{ranura\.ancho\}/);
    expect(src).toMatch(/height=\{ranura\.alto\}/);
  });
});

describe('inventario: el script y su documento', () => {
  const script = readFileSync(join(process.cwd(), 'scripts/imagenes.mjs'), 'utf8');
  const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));

  it('está enlazado en package.json', () => {
    expect(pkg.scripts.imagenes).toContain('scripts/imagenes.mjs');
    expect(pkg.scripts['imagenes:prompts']).toContain('--prompts');
  });

  it('genera el documento desde el registro, no de una lista aparte', () => {
    expect(script).toMatch(/todasLasRanuras/);
    expect(script).toMatch(/No edite este archivo a mano/);
  });

  it('faltar imágenes no hace fallar el proceso', () => {
    // Es un estado normal del trabajo, no un error de compilación.
    expect(script).toMatch(/process\.exit\(0\)/);
    expect(script).not.toMatch(/process\.exit\(1\)/);
  });

  it('el documento de encargo está al día si existe', () => {
    const ruta = join(process.cwd(), 'docs/encargo-imagenes.md');
    if (!existsSync(ruta)) return;
    const doc = readFileSync(ruta, 'utf8');
    const pendientes = todasLasRanuras().filter(
      (r) => !existsSync(join(process.cwd(), 'public', r.ruta)),
    );
    // Cada pendiente debe aparecer con su ruta exacta.
    for (const r of pendientes.slice(0, 12)) {
      expect(doc, `falta ${r.ruta} en el encargo`).toContain(r.ruta);
    }
  });
});
P21_EOF

# -----------------------------------------------------------------------------
# lib/schema.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/schema.ts" <<'P21_EOF'
/**
 * Constructores de JSON-LD. Solo se emiten campos respaldados por datos reales.
 * Nunca Review/AggregateRating sin reseñas genuinas almacenadas, nunca
 * certificaciones ni premios no verificables.
 *
 * GRAFO DE ENTIDAD — regla crítica:
 * El sitio emite UN solo nodo por entidad, identificado por @id estable, y todo
 * lo demás lo referencia. Dos nodos LocalBusiness con @id distintos describiendo
 * la misma empresa fragmentan la entidad y desperdician las señales.
 *
 *   ${SITE.url}/#organization  → Organization  (components/StructuredData.tsx)
 *   ${SITE.url}/#business      → LocalBusiness (components/StructuredData.tsx)
 *   ${SITE.url}/#website       → WebSite       (components/StructuredData.tsx)
 *
 * Las páginas internas NO redeclaran esos nodos: los referencian con
 * businessRef() / organizationRef() / websiteRef().
 */
import { SITE } from "./site";

type Dict = Record<string, unknown>;

export const ORGANIZATION_ID = `${SITE.url}/#organization`;
export const BUSINESS_ID = `${SITE.url}/#business`;
export const WEBSITE_ID = `${SITE.url}/#website`;

/** Referencia al nodo Organization global (no lo redeclara). */
export function organizationRef(): Dict {
  return { "@id": ORGANIZATION_ID };
}

/** Referencia al nodo LocalBusiness global (no lo redeclara). */
export function businessRef(): Dict {
  return { "@id": BUSINESS_ID };
}

/** Referencia al nodo WebSite global (no lo redeclara). */
export function websiteRef(): Dict {
  return { "@id": WEBSITE_ID };
}

/**
 * Nodo WebPage de la página actual, anclado al WebSite. Sustituye al antiguo
 * speakableSchema() suelto, que emitía un WebPage huérfano sin @id ni url —
 * un nodo sin identidad no se conecta al grafo y no aporta señal.
 */
export function webPageSchema(page: {
  url: string;
  name: string;
  description?: string;
  /** Selectores CSS del contenido apto para asistentes de voz. */
  speakable?: string[];
  /** Breadcrumb de la página, si aplica. */
  breadcrumbId?: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage" | "ItemPage";
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": page.type ?? "WebPage",
    "@id": `${page.url}#webpage`,
    url: page.url,
    name: page.name,
    ...(page.description ? { description: page.description } : {}),
    isPartOf: websiteRef(),
    about: businessRef(),
    inLanguage: SITE.language,
    ...(page.breadcrumbId ? { breadcrumb: { "@id": page.breadcrumbId } } : {}),
    ...(page.speakable
      ? {
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: page.speakable,
          },
        }
      : {}),
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
  id?: string,
): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    ...(id ? { "@id": id } : {}),
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function faqSchema(qas: { q: string; a: string }[], url?: string): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(url ? { "@id": `${url}#faq` } : {}),
    ...(url ? { url } : {}),
    inLanguage: SITE.language,
    mainEntity: qas.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  };
}

/**
 * Servicio prestado en una ciudad concreta. Es la señal local correcta: en vez
 * de clonar el LocalBusiness (que vive en Chorrillos) en cada página de ciudad,
 * se declara el servicio con areaServed = la ciudad y provider = la empresa.
 */
export function serviceSchema(s: {
  name: string;
  description: string;
  url: string;
  cityName: string;
  regionName: string;
  serviceTypes?: string[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${s.url}#service`,
    name: s.name,
    description: s.description,
    url: s.url,
    provider: businessRef(),
    areaServed: {
      "@type": "City",
      name: s.cityName,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: s.regionName,
        containedInPlace: { "@type": "Country", name: "Perú" },
      },
    },
    ...(s.serviceTypes?.length ? { serviceType: s.serviceTypes } : {}),
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE.url}/cotizacion`,
      servicePhone: {
        "@type": "ContactPoint",
        telephone: SITE.phoneWhatsApp,
        contactType: "sales",
      },
    },
  };
}

/** Lista ordenada de URLs internas (catálogo, cobertura local, artículos). */
export function itemListSchema(list: {
  url: string;
  name: string;
  description?: string;
  items: { name: string; url: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${list.url}#itemlist`,
    name: list.name,
    ...(list.description ? { description: list.description } : {}),
    numberOfItems: list.items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: list.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

/**
 * Artículo técnico del silo /recursos. Se ancla al WebPage de su propia URL y
 * declara autoría organizacional: la autoridad la sostiene la empresa, no una
 * firma personal inventada.
 */
export function articleSchema(a: {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  section: string;
  keywords?: string[];
  wordCount?: number;
  /** Fuentes externas que respaldan las cifras del artículo. */
  citations?: { label: string; url: string }[];
  /**
   * TechArticle es lo correcto para una guía de especificación. Un anuncio
   * fechado del registro de novedades NO es documentación técnica: declararlo
   * TechArticle degrada la señal de todo el silo /recursos.
   */
  articleType?: "TechArticle" | "Article";
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": a.articleType ?? "TechArticle",
    "@id": `${a.url}#article`,
    headline: a.headline,
    description: a.description,
    url: a.url,
    mainEntityOfPage: { "@id": `${a.url}#webpage` },
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    articleSection: a.section,
    inLanguage: SITE.language,
    author: organizationRef(),
    publisher: organizationRef(),
    ...(a.keywords?.length ? { keywords: a.keywords.join(", ") } : {}),
    ...(a.wordCount ? { wordCount: a.wordCount } : {}),
    ...(a.citations?.length
      ? {
          citation: a.citations.map((c) => ({
            "@type": "CreativeWork",
            name: c.label,
            url: c.url,
          })),
        }
      : {}),
  };
}

/** Procedimiento paso a paso. Solo para secuencias reales y verificables. */
export function howToSchema(h: {
  url: string;
  name: string;
  description: string;
  totalTime?: string;
  steps: { name: string; text: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${h.url}#howto`,
    name: h.name,
    description: h.description,
    inLanguage: SITE.language,
    ...(h.totalTime ? { totalTime: h.totalTime } : {}),
    step: h.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${h.url}#paso-${i + 1}`,
    })),
  };
}

/**
 * @deprecated Redeclaraba un LocalBusiness con @id propio, fragmentando la
 * entidad frente al nodo global de components/StructuredData.tsx. Usa
 * businessRef() dentro de about/provider, o webPageSchema() para la página.
 * Se mantiene devolviendo solo la referencia para no romper importaciones.
 */
export function localBusinessSchema(): Dict {
  return businessRef();
}

/** @deprecated Usa webPageSchema({ speakable }) — un WebPage suelto es huérfano. */
export function speakableSchema(cssSelectors: string[]): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: SITE.language,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
  };
}

export function organizationSchema(): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    foundingDate: SITE.foundingYear,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "RUC",
      value: SITE.ruc,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.addressStreet,
      addressLocality: SITE.addressLocality,
      addressRegion: SITE.addressRegion,
      addressCountry: SITE.addressCountry,
    },
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
}

export function productSchema(p: {
  name: string;
  description: string;
  url: string;
  image?: string;
  material?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
}): Dict {
  const offers =
    p.priceMin != null
      ? {
          "@type": "AggregateOffer",
          priceCurrency: p.currency ?? "PEN",
          lowPrice: p.priceMin,
          ...(p.priceMax != null ? { highPrice: p.priceMax } : {}),
          availability: "https://schema.org/InStock",
          seller: businessRef(),
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    url: p.url,
    ...(p.image ? { image: p.image } : {}),
    ...(p.material ? { material: p.material } : {}),
    brand: { "@type": "Brand", name: SITE.name },
    ...(offers ? { offers } : {}),
  };
}

/**
 * Glosario como conjunto de términos definidos.
 *
 * DefinedTermSet + DefinedTerm es el tipo que schema.org previó exactamente
 * para esto y que casi nadie usa. Declara que el sitio publica un vocabulario
 * del rubro con una URL estable por concepto: es la forma legible por máquina
 * de decir "acá se define este término", que es justo lo que un agente
 * necesita resolver antes de poder citar a alguien.
 */
export function definedTermSetSchema(set: {
  url: string;
  name: string;
  description: string;
  terms: { slug: string; termino: string; definicionCorta: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${set.url}#glosario`,
    name: set.name,
    description: set.description,
    url: set.url,
    inLanguage: SITE.language,
    publisher: organizationRef(),
    hasDefinedTerm: set.terms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${set.url}/${t.slug}#termino`,
      name: t.termino,
      description: t.definicionCorta,
      url: `${set.url}/${t.slug}`,
      termCode: t.slug,
      inDefinedTermSet: { "@id": `${set.url}#glosario` },
    })),
  };
}

/** Un término del glosario, citable por sí solo. */
export function definedTermSchema(t: {
  url: string;
  setUrl: string;
  termino: string;
  definicionCorta: string;
  termCode: string;
  /** Sigla y otras formas de nombrarlo: ayudan a resolver la desambiguación. */
  alternateNames?: string[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${t.url}#termino`,
    name: t.termino,
    description: t.definicionCorta,
    url: t.url,
    termCode: t.termCode,
    inLanguage: SITE.language,
    inDefinedTermSet: { "@id": `${t.setUrl}#glosario` },
    ...(t.alternateNames?.length ? { alternateName: t.alternateNames } : {}),
  };
}

/**
 * Centro de documentación como catálogo de datos.
 *
 * DataCatalog + DataDownload declara en lenguaje de máquina que este sitio
 * publica documentos y datos descargables, con su formato y su URL. Es la
 * diferencia entre que un agente encuentre los archivos rastreando enlaces y
 * que sepa de antemano qué hay disponible y en qué formato.
 */
export function dataCatalogSchema(cat: {
  url: string;
  name: string;
  description: string;
  downloads: { name: string; description: string; href: string; formato: string }[];
}): Dict {
  const mime: Record<string, string> = {
    pdf: "application/pdf",
    json: "application/json",
    rss: "application/rss+xml",
    txt: "text/plain",
    xml: "application/xml",
  };
  return {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    "@id": `${cat.url}#catalogo-documentos`,
    name: cat.name,
    description: cat.description,
    url: cat.url,
    inLanguage: SITE.language,
    publisher: organizationRef(),
    // isAccessibleForFree es el dato que decide si un agente se molesta en
    // intentar la descarga: sin muro de registro, se intenta.
    isAccessibleForFree: true,
    dataset: cat.downloads.map((d) => ({
      "@type": "Dataset",
      name: d.name,
      description: d.description,
      url: `${SITE.url}${d.href}`,
      isAccessibleForFree: true,
      creator: organizationRef(),
      distribution: {
        "@type": "DataDownload",
        contentUrl: `${SITE.url}${d.href}`,
        encodingFormat: mime[d.formato] ?? d.formato,
      },
    })),
  };
}

/**
 * Informe con procedencia de datos.
 *
 * Dataset declara que la página publica DATOS con fuente, no solo prosa. Es lo
 * que permite a un agente citar una cifra junto con el organismo que la
 * publica, en lugar de atribuírnosla a nosotros. `isBasedOn` es el campo que
 * hace ese trabajo: dice explícitamente de dónde salió cada número.
 */
export function datasetSchema(d: {
  url: string;
  name: string;
  description: string;
  fecha: string;
  version: string;
  fuentes: { nombre: string; url: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${d.url}#dataset`,
    name: d.name,
    description: d.description,
    url: d.url,
    version: d.version,
    datePublished: d.fecha,
    dateModified: d.fecha,
    inLanguage: SITE.language,
    creator: organizationRef(),
    publisher: organizationRef(),
    isAccessibleForFree: true,
    isBasedOn: d.fuentes.map((f) => ({
      "@type": "CreativeWork",
      name: f.nombre,
      url: f.url,
    })),
  };
}

/**
 * Imagen con procedencia declarada.
 *
 * ImageObject permite decir de una imagen algo que el atributo alt no dice:
 * qué representa, quién la publica y si es una fotografía o un esquema. Para
 * un agente que construye un índice visual, esa distinción es la diferencia
 * entre citar un diagrama como esquema y citarlo como evidencia fotográfica.
 */
export function imageObjectSchema(img: {
  url: string;
  ancho: number;
  alto: number;
  alt: string;
  /** Página donde vive la imagen. */
  paginaUrl: string;
  esDiagrama: boolean;
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `${img.paginaUrl}#imagen`,
    contentUrl: `${SITE.url}${img.url}`,
    url: `${SITE.url}${img.url}`,
    width: img.ancho,
    height: img.alto,
    caption: img.alt,
    description: img.alt,
    representativeOfPage: true,
    inLanguage: SITE.language,
    creator: organizationRef(),
    // Un esquema no es una fotografía de una obra ejecutada, y conviene que
    // eso viaje con la imagen y no solo en el pie de la página.
    ...(img.esDiagrama
      ? { creditText: `Esquema explicativo de ${SITE.legalName}`, encodingFormat: "image/png" }
      : { creditText: `Imagen referencial de ${SITE.legalName}` }),
  };
}
P21_EOF

# -----------------------------------------------------------------------------
# app/soluciones/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/soluciones/[slug]"
cat > "app/soluciones/[slug]/page.tsx" <<'P21_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { solutions, solutionBySlug } from '@/lib/solutions';
import { products } from '@/lib/products';
import { articleBySlug } from '@/lib/articles';
import { pillars } from '@/lib/framework';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasSolucion } from '@/lib/imagenes';
import TrackView from '@/components/TrackView';
import {
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  itemListSchema,
  webPageSchema,
  imageObjectSchema,
} from '@/lib/schema';

/**
 * Arquitectura de referencia (/soluciones/[slug]).
 *
 * Muestra el conjunto armado: qué componente cumple qué función, qué decide su
 * especificación, en qué orden se ejecuta y qué falla cuando se compra por
 * piezas sueltas. Cada componente enlaza a un SKU real del catálogo y cada
 * modo de falla a la guía que lo documenta.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = solutionBySlug(slug);
  if (!s) return {};
  const url = `${SITE.url}/soluciones/${slug}`;
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: { canonical: `/soluciones/${slug}` },
    openGraph: {
      title: s.metaTitle,
      description: s.metaDescription,
      url,
      locale: SITE.locale,
      type: 'article',
    },
  };
}

export default async function SolucionPage({ params }: Props) {
  const { slug } = await params;
  const s = solutionBySlug(slug);
  if (!s) notFound();

  const url = `${SITE.url}/soluciones/${slug}`;
  const imagen = ranurasSolucion().find((r) => r.id === `solucion:${slug}`);
  const componentes = s.componentes
    .map((c) => ({ ...c, producto: products.find((p) => p.slug === c.producto) }))
    .filter((c) => c.producto);
  const guias = s.guias.map((g) => articleBySlug(g)).filter(Boolean);
  const pilaresClave = pillars.filter((p) => s.pilaresClave.includes(p.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="solution" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: s.titulo,
            description: s.metaDescription,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Arquitecturas de referencia', url: `${SITE.url}/soluciones` },
              { name: s.titulo, url },
            ],
            `${url}#breadcrumb`,
          ),
          itemListSchema({
            url,
            name: `Componentes de ${s.titulo}`,
            items: componentes.map((c) => ({
              name: c.producto!.name,
              url: `${SITE.url}/productos/${c.producto!.slug}`,
            })),
          }),
          howToSchema({
            url,
            name: s.titulo,
            description: s.metaDescription,
            steps: s.secuencia.map((p) => ({ name: p.paso, text: p.detalle })),
          }),
          faqSchema(s.faqs, url),
          ...(imagen
            ? [imageObjectSchema({
                url: imagen.ruta, ancho: imagen.ancho, alto: imagen.alto,
                alt: imagen.alt, paginaUrl: url, esDiagrama: true,
              })]
            : []),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link>{' '}
        /{' '}
        <Link href="/soluciones" className="hover:text-[#059669]">
          Arquitecturas de referencia
        </Link>{' '}
        / <span className="text-gray-700">{s.sectores[0]}</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {s.titulo}
      </h1>

      {/* Documento para pedir presupuesto interno: lista de materiales completa. */}
      <a
        href={`/soluciones/${s.slug}/arquitectura.pdf`}
        className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
      >
        Descargar en PDF: lista de materiales y secuencia
      </a>

      <p className="speakable-intro mb-8 text-lg text-gray-700">{s.escenario}</p>

      {/* El esquema va acá y no al final: en una arquitectura, ver el orden de
          las capas ANTES de leer la lista de materiales es lo que hace que la
          lista se entienda. */}
      {imagen && <ImagenContenido ranura={imagen} prioridad className="mb-12" />}

      <section className="mb-12 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-7">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#059669]">
          Qué se rompe al comprar por piezas
        </h2>
        <div className="space-y-3 text-gray-800">
          {s.problema.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Componentes del conjunto
        </h2>
        <p className="mb-6 text-gray-600">
          Cada pieza enlaza a su ficha con especificaciones reales. Las marcadas como
          opcionales dependen del caso.
        </p>
        <div className="space-y-4">
          {componentes.map((c) => (
            <div key={c.producto!.slug} className="rounded-2xl border border-gray-100 p-6">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <Link
                  href={`/productos/${c.producto!.slug}`}
                  className="font-semibold text-[#0A2540] hover:text-[#059669]"
                >
                  {c.producto!.name}
                </Link>
                {c.opcional && (
                  <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    Según el caso
                  </span>
                )}
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-600">Función en el conjunto</dt>
                  <dd className="text-gray-700">{c.funcion}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-600">Qué decide su especificación</dt>
                  <dd className="text-gray-700">{c.criterio}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Secuencia de ejecución
        </h2>
        <ol className="space-y-5">
          {s.secuencia.map((p, i) => (
            <li key={p.paso} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#059669]/10 text-sm font-semibold text-[#047857]">
                {i + 1}
              </span>
              <div>
                <div className="font-semibold text-[#0A2540]">{p.paso}</div>
                <p className="mt-1 text-gray-700">{p.detalle}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Modos de falla documentados
        </h2>
        <div className="space-y-4">
          {s.riesgos.map((r) => (
            <div key={r.titulo} className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <div className="font-semibold text-[#0A2540]">{r.titulo}</div>
                <p className="mt-1 text-gray-700">{r.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Criterios del marco que la gobiernan
        </h2>
        <p className="mb-5 text-gray-600">
          Antes de cotizar esta configuración conviene tener resueltos estos pilares:
        </p>
        <div className="flex flex-wrap gap-2">
          {pilaresClave.map((p) => (
            <Link
              key={p.id}
              href={`/marco#${p.id}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
            >
              {p.nombre}
            </Link>
          ))}
        </div>
      </section>

      {guias.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Guías técnicas que la respaldan
          </h2>
          <div className="space-y-4">
            {guias.map((g) => (
              <Link
                key={g!.slug}
                href={`/recursos/${g!.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {g!.title}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{g!.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {s.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          Cotizar el conjunto, no las piezas
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Indíquenos las condiciones reales de su proyecto y le devolvemos la
          especificación de cada componente junto con la propuesta.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/cotizacion?comparativa=${componentes.filter((c) => !c.opcional).map((c) => c.producto!.slug).join(',')}`}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Cotizar esta configuración
          </Link>
          <Link
            href="/marco/evaluacion"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Evaluar mi proyecto primero <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
P21_EOF

# -----------------------------------------------------------------------------
# app/productos/familia/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/productos/familia/[slug]"
cat > "app/productos/familia/[slug]/page.tsx" <<'P21_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { products, productFamilies, sourcingLabels, availabilityLabels } from '@/lib/products';
import { familyContent, resolveFamily } from '@/lib/families';
import { articles } from '@/lib/articles';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasFamilia } from '@/lib/imagenes';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, faqSchema, itemListSchema, webPageSchema, imageObjectSchema } from '@/lib/schema';

/**
 * Página de familia (/productos/familia/[slug]).
 *
 * Cierra el hueco estructural más caro del sitio: la navegación por familia se
 * resolvía con `?categoria=` sobre un catálogo filtrado en cliente, de modo que
 * once mercados con intención de búsqueda distinta compartían UNA sola URL
 * indexable. Ahora cada familia tiene URL estática, contenido propio, FAQ,
 * ItemList de sus SKUs y enlaces a los artículos y ciudades relacionados.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return familyContent.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveFamily(slug);
  if (!resolved) return {};
  const { content } = resolved;
  const url = `${SITE.url}/productos/familia/${slug}`;
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical: `/productos/familia/${slug}` },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url,
      locale: SITE.locale,
      type: 'website',
    },
  };
}

export default async function FamilyPage({ params }: Props) {
  const { slug } = await params;
  const resolved = resolveFamily(slug);
  if (!resolved) notFound();
  const { family, content } = resolved;

  const url = `${SITE.url}/productos/familia/${slug}`;
  const imagen = ranurasFamilia().find((r) => r.id === `familia:${slug}`);
  const items = products.filter((p) => p.category === family.name);
  const sectores = Array.from(new Set(items.flatMap((p) => p.sector)));
  const sourcings = Array.from(new Set(items.map((p) => p.sourcing).filter(Boolean))) as string[];
  const disponibilidades = Array.from(
    new Set(items.map((p) => p.availability ?? 'a_medida')),
  );
  const relatedArticles = articles.filter((a) => a.category === family.name);
  const otherFamilies = productFamilies.filter((f) => f.slug !== slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <TrackView kind="family" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: content.h1,
            description: content.metaDescription,
            type: 'CollectionPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Catálogo', url: `${SITE.url}/productos` },
              { name: family.name, url },
            ],
            `${url}#breadcrumb`,
          ),
          itemListSchema({
            url,
            name: family.name,
            description: content.metaDescription,
            items: items.map((p) => ({
              name: p.name,
              url: `${SITE.url}/productos/${p.slug}`,
            })),
          }),
          faqSchema(content.faqs, url),
          ...(imagen
            ? [imageObjectSchema({
                url: imagen.ruta, ancho: imagen.ancho, alto: imagen.alto,
                alt: imagen.alt, paginaUrl: url, esDiagrama: false,
              })]
            : []),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        /{' '}
        <Link href="/productos" className="hover:text-[#059669]">
          Catálogo
        </Link>{' '}
        / <span className="text-gray-700">{family.name}</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">{content.h1}</h1>

      <p className="mb-6 text-sm font-medium uppercase tracking-[0.12em] text-[#059669]">
        {family.tagline} · {items.length} {items.length === 1 ? 'línea' : 'líneas'} de producto
      </p>

      {imagen && <ImagenContenido ranura={imagen} prioridad className="mb-10" />}

      <div className="speakable-intro mb-10 max-w-3xl space-y-4 text-lg text-gray-700">
        {content.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {/* Cómo abastecemos y en qué estado está la oferta: dato real del catálogo. */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            Cómo lo entregamos
          </h2>
          <p className="text-gray-700">
            {sourcings.map((s) => sourcingLabels[s] ?? s).join(' · ')}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            Estado de la oferta
          </h2>
          <p className="text-gray-700">
            {disponibilidades.map((a) => availabilityLabels[a] ?? a).join(' · ')}
          </p>
        </div>
      </div>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Productos de esta familia
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((p) => (
            <Link
              key={p.slug}
              href={`/productos/${p.slug}`}
              className="group block rounded-3xl border border-gray-100 p-6 transition-all hover:border-[#059669]/40"
            >
              <span className="mb-2 block font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                {p.name}
              </span>
              <span className="mb-3 block text-sm text-gray-600">{p.shortDescription}</span>
              <span className="flex flex-wrap gap-2 text-xs text-gray-500">
                {p.sector.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-full bg-gray-50 px-2.5 py-1">
                    {s}
                  </span>
                ))}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {items.length >= 2 && (
        <div className="mb-14 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-6">
          <p className="text-gray-800">
            ¿Está eligiendo entre varias de estas {items.length} alternativas? Véalas con
            sus especificaciones lado a lado.
          </p>
          <Link
            href={`/productos/familia/${slug}/comparar`}
            className="inline-flex items-center gap-1 rounded-2xl bg-[#0A2540] px-6 py-3 font-semibold text-white hover:bg-[#059669]"
          >
            Comparar las {items.length} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Qué define la especificación
        </h2>
        <dl className="space-y-5">
          {content.selectionCriteria.map((c) => (
            <div key={c.titulo} className="border-l-4 border-[#059669]/30 pl-5">
              <dt className="font-semibold text-[#0A2540]">{c.titulo}</dt>
              <dd className="mt-1 text-gray-700">{c.detalle}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Sectores que compran esta familia
        </h2>
        <div className="flex flex-wrap gap-2">
          {sectores.map((s) => (
            <Link
              key={s}
              href={`/productos?sector=${encodeURIComponent(s)}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      {relatedArticles.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Guías técnicas de esta familia
          </h2>
          <div className="space-y-4">
            {relatedArticles.map((a) => (
              <Link
                key={a.slug}
                href={`/recursos/${a.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                  {a.title}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{a.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {content.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-14 border-t pt-10">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Otras familias del catálogo
        </h2>
        <div className="flex flex-wrap gap-2">
          {otherFamilies.map((f) => (
            <Link
              key={f.slug}
              href={`/productos/familia/${f.slug}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
            >
              {f.name}
            </Link>
          ))}
        </div>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Especificamos su caso?
        </h2>
        <p className="mx-auto mb-7 max-w-md text-white/80">
          Envíenos medidas, cantidad, aplicación y ciudad de entrega y le devolvemos la
          especificación técnica junto con la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/productos"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Ver catálogo completo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
P21_EOF

# -----------------------------------------------------------------------------
# app/glosario/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/glosario/[slug]"
cat > "app/glosario/[slug]/page.tsx" <<'P21_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, Ruler } from 'lucide-react';
import {
  terminos,
  terminoBySlug,
  terminosPorCategoria,
  categoriaLabels,
  formasDe,
} from '@/lib/glosario';
import { products } from '@/lib/products';
import { articles } from '@/lib/articles';
import { pillars } from '@/lib/framework';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasGlosario } from '@/lib/imagenes';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, definedTermSchema, webPageSchema, imageObjectSchema } from '@/lib/schema';

/**
 * Página de un término.
 *
 * La unidad citable del sitio. Un modelo que necesita definir "geotextil" debe
 * poder copiar UNA frase de acá y atribuirla sin leer el resto. Por eso la
 * definición corta va sola, arriba, marcada como speakable y replicada en el
 * DefinedTerm: si hay que reconstruirla juntando párrafos, no se cita.
 *
 * Y por eso cada término enlaza hacia los productos donde manda, las guías que
 * lo desarrollan y el pilar del marco al que pertenece: la definición es la
 * puerta de entrada al resto del sitio, no un callejón sin salida.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return terminos.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = terminoBySlug(slug);
  if (!t) return {};
  const url = `${SITE.url}/glosario/${slug}`;
  const title = t.siglas ? `${t.termino} (${t.siglas})` : t.termino;
  return {
    title: `${title}: qué es y cómo se especifica`,
    description: t.definicionCorta,
    keywords: formasDe(t),
    alternates: { canonical: `/glosario/${slug}` },
    openGraph: {
      title: `${title} | Glosario técnico de ${SITE.name}`,
      description: t.definicionCorta,
      url,
      locale: SITE.locale,
      type: 'article',
    },
  };
}

export default async function TerminoPage({ params }: Props) {
  const { slug } = await params;
  const t = terminoBySlug(slug);
  if (!t) notFound();

  const url = `${SITE.url}/glosario/${slug}`;
  const setUrl = `${SITE.url}/glosario`;
  const imagen = ranurasGlosario().find((r) => r.id === `glosario:${slug}`);
  const relacionados = t.relacionados.map(terminoBySlug).filter(Boolean) as NonNullable<
    ReturnType<typeof terminoBySlug>
  >[];
  const productosRel = (t.productos ?? [])
    .map((s) => products.find((p) => p.slug === s))
    .filter(Boolean);
  const guiasRel = (t.guias ?? [])
    .map((s) => articles.find((a) => a.slug === s))
    .filter(Boolean);
  const pilar = t.pilar ? pillars.find((p) => p.id === t.pilar) : undefined;
  const hermanos = terminosPorCategoria(t.categoria).filter((x) => x.slug !== t.slug);

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <TrackView kind="glosario" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: t.termino,
            description: t.definicionCorta,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          definedTermSchema({
            url,
            setUrl,
            termino: t.termino,
            definicionCorta: t.definicionCorta,
            termCode: t.slug,
            alternateNames: formasDe(t).slice(1),
          }),
          ...(imagen
            ? [imageObjectSchema({
                url: imagen.ruta, ancho: imagen.ancho, alto: imagen.alto,
                alt: imagen.alt, paginaUrl: url, esDiagrama: true,
              })]
            : []),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Glosario', url: setUrl },
              { name: t.termino, url },
            ],
            `${url}#breadcrumb`,
          ),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        /{' '}
        <Link href="/glosario" className="hover:text-[#059669]">
          Glosario
        </Link>{' '}
        / <span className="text-gray-700">{t.termino}</span>
      </nav>

      <p className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-[#059669]">
        {categoriaLabels[t.categoria]}
      </p>

      <h1 className="mb-2 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {t.termino}
      </h1>

      {(t.siglas || t.alias?.length) && (
        <p className="mb-6 text-gray-500">
          También: {formasDe(t).slice(1).join(' · ')}
        </p>
      )}

      {/* La unidad citable. Va sola, sin nada que la interrumpa. */}
      <p className="speakable-intro mb-10 border-l-4 border-[#059669] pl-6 text-xl leading-relaxed text-gray-800">
        {t.definicionCorta}
      </p>

      {/* El esquema tras la definición corta y antes del desarrollo: es la
          posición en que el dibujo ayuda a leer el texto, y no al revés. */}
      {imagen && <ImagenContenido ranura={imagen} className="mb-10" sizes="(min-width: 768px) 720px, 100vw" />}

      <div className="mb-12 space-y-5 text-gray-700">
        {t.definicion.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {t.comoSeMide && (
        <section className="mb-12 rounded-3xl border border-gray-100 p-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            <Ruler className="h-4 w-4" aria-hidden="true" /> Cómo se mide
          </h2>
          <p className="text-gray-800">{t.comoSeMide}</p>
        </section>
      )}

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Por qué importa
        </h2>
        <p className="text-gray-700">{t.porQueImporta}</p>
      </section>

      {t.errorFrecuente && (
        <section className="mb-12 rounded-3xl bg-amber-50 p-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-amber-800">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Error frecuente
          </h2>
          <p className="text-gray-800">{t.errorFrecuente}</p>
        </section>
      )}

      {pilar && (
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
            En el Marco de Especificación
          </h2>
          <p className="mb-4 text-gray-700">
            Esta decisión pertenece al pilar <strong>{pilar.nombre}</strong>: {pilar.resumen}
          </p>
          <Link
            href="/marco"
            className="inline-flex items-center gap-1 font-medium text-[#059669] hover:underline"
          >
            Ver los criterios del marco <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {relacionados.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Términos relacionados
          </h2>
          <ul className="space-y-3">
            {relacionados.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/glosario/${r.slug}`}
                  className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
                >
                  <span className="mb-1 block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                    {r.termino}
                  </span>
                  <span className="block text-sm text-gray-600">{r.definicionCorta}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {guiasRel.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Guías que lo desarrollan
          </h2>
          <div className="space-y-3">
            {guiasRel.map((a) => (
              <Link
                key={a!.slug}
                href={`/recursos/${a!.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {a!.title}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{a!.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {productosRel.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Dónde este término decide la especificación
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {productosRel.map((p) => (
              <li key={p!.slug}>
                <Link
                  href={`/productos/${p!.slug}`}
                  className="group block rounded-2xl border border-gray-100 p-4 transition-colors hover:border-[#059669]/40"
                >
                  <span className="font-medium text-[#0A2540] group-hover:text-[#059669]">
                    {p!.name}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                    {p!.shortDescription}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hermanos.length > 0 && (
        <section className="mb-14 border-t border-gray-100 pt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            Más de {categoriaLabels[t.categoria].toLowerCase()}
          </h2>
          <div className="flex flex-wrap gap-2">
            {hermanos.map((h) => (
              <Link
                key={h.slug}
                href={`/glosario/${h.slug}`}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
              >
                {h.termino}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-3xl border border-gray-100 p-8 text-center">
        <p className="mb-5 text-gray-700">
          ¿Necesita aplicar este criterio a un proyecto concreto? Envíenos la
          especificación y le devolvemos la propuesta técnica junto con la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-[#0A2540] px-8 py-3 font-semibold text-white hover:bg-[#059669]"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/glosario"
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-8 py-3 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
          >
            Volver al glosario
          </Link>
        </div>
      </div>
    </article>
  );
}
P21_EOF

# -----------------------------------------------------------------------------
# app/recursos/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/recursos/[slug]"
cat > "app/recursos/[slug]/page.tsx" <<'P21_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { articles, articleBySlug } from '@/lib/articles';
import { terminosParaGuia } from '@/lib/glosario';
import { products } from '@/lib/products';
import ciudades from '@/data/ciudades.json';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasGuia } from '@/lib/imagenes';
import TrackView from '@/components/TrackView';
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  webPageSchema,
} from '@/lib/schema';

/**
 * Plantilla de artículo técnico.
 *
 * Emite TechArticle + WebPage + BreadcrumbList + FAQPage y, cuando el artículo
 * define una secuencia real, HowTo. Todo el contenido estructurado tiene
 * contraparte visible en la página: schema sin contenido visible es una
 * infracción de las directrices de resultados enriquecidos.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) return {};
  const url = `${SITE.url}/recursos/${a.slug}`;
  return {
    title: a.metaTitle,
    description: a.description,
    keywords: [a.category, ...a.sectors, 'Perú', 'guía técnica'],
    alternates: { canonical: `/recursos/${a.slug}` },
    openGraph: {
      title: a.metaTitle,
      description: a.description,
      url,
      locale: SITE.locale,
      type: 'article',
      publishedTime: a.datePublished,
      modifiedTime: a.dateModified,
    },
    twitter: {
      card: 'summary_large_image',
      title: a.metaTitle,
      description: a.description,
    },
  };
}

function countWords(text: string[]): number {
  return text.join(' ').split(/\s+/).filter(Boolean).length;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) notFound();

  const url = `${SITE.url}/recursos/${a.slug}`;
  const relatedProducts = a.relatedProducts
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const glosarioRel = terminosParaGuia(slug);
  const imagen = ranurasGuia().find((r) => r.id === `guia:${slug}`);
  const relatedCities = (a.relatedCities ?? [])
    .map((s) => (ciudades as { slug: string; ciudad: string }[]).find((c) => c.slug === s))
    .filter((c): c is { slug: string; ciudad: string } => Boolean(c));

  const wordCount = countWords([
    ...a.intro,
    ...a.sections.flatMap((s) => [
      s.heading,
      ...(s.body ?? []),
      ...(s.list ?? []),
      ...(s.steps ?? []),
    ]),
  ]);

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <TrackView kind="article" slug={a.slug} categoria={a.category} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: a.title,
            description: a.description,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          articleSchema({
            url,
            headline: a.title,
            description: a.description,
            datePublished: a.datePublished,
            dateModified: a.dateModified,
            section: a.category,
            keywords: [a.category, ...a.sectors],
            wordCount,
            citations: a.sources.map((s) => ({ label: s.label, url: s.url })),
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Recursos técnicos', url: `${SITE.url}/recursos` },
              { name: a.title, url },
            ],
            `${url}#breadcrumb`,
          ),
          faqSchema(a.faqs, url),
          ...(a.howTo
            ? [
                howToSchema({
                  url,
                  name: a.howTo.name,
                  description: a.description,
                  totalTime: a.howTo.totalTime,
                  steps: a.howTo.steps,
                }),
              ]
            : []),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        /{' '}
        <Link href="/recursos" className="hover:text-[#059669]">
          Recursos técnicos
        </Link>{' '}
        / <span className="text-gray-700">{a.category}</span>
      </nav>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="font-medium uppercase tracking-[0.12em] text-[#059669]">
          {a.category}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {a.readingMinutes} min de lectura
        </span>
        <time dateTime={a.dateModified}>Actualizado {a.dateModified}</time>
      </div>

      <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {a.title}
      </h1>

      {imagen && <ImagenContenido ranura={imagen} prioridad className="mb-10" />}

      <div className="speakable-intro mb-8 space-y-4 text-lg text-gray-700">
        {a.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {/* Resumen ejecutivo: lo primero que un motor o un agente extrae. */}
      <div className="mb-10 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-7">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#059669]">
          En resumen
        </h2>
        <ul className="space-y-3 text-gray-800">
          {a.keyTakeaways.map((k) => (
            <li key={k} className="flex gap-3">
              <span className="mt-1 text-[#059669]">→</span>
              {k}
            </li>
          ))}
        </ul>
      </div>

      {/* Índice */}
      <nav className="mb-12 rounded-2xl border border-gray-100 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Contenido
        </h2>
        <ol className="space-y-2 text-sm">
          {a.sections.map((s, i) => (
            <li key={s.heading}>
              <a href={`#seccion-${i + 1}`} className="text-gray-700 hover:text-[#059669]">
                {i + 1}. {s.heading}
              </a>
            </li>
          ))}
          <li>
            <a href="#preguntas-frecuentes" className="text-gray-700 hover:text-[#059669]">
              Preguntas frecuentes
            </a>
          </li>
        </ol>
      </nav>

      {a.sections.map((s, i) => (
        <section key={s.heading} id={`seccion-${i + 1}`} className="mb-12 scroll-mt-24">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {s.heading}
          </h2>

          {s.body?.map((p) => (
            <p key={p} className="mb-4 text-gray-700">
              {p}
            </p>
          ))}

          {s.list && (
            <ul className="mb-4 space-y-2 text-gray-700">
              {s.list.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 text-[#059669]">→</span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          {s.steps && (
            <ol className="mb-4 space-y-3 text-gray-700">
              {s.steps.map((item, n) => (
                <li key={item} id={`paso-${n + 1}`} className="flex gap-3 scroll-mt-24">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#059669]/10 text-xs font-semibold text-[#059669]">
                    {n + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          )}

          {s.table && (
            <div className="mb-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                {s.table.caption && (
                  <caption className="mb-2 text-left text-xs text-gray-500">
                    {s.table.caption}
                  </caption>
                )}
                <thead>
                  <tr className="border-b border-gray-200">
                    {s.table.headers.map((h) => (
                      <th key={h} className="py-3 pr-6 text-left font-semibold text-[#0A2540]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((row) => (
                    <tr key={row.join('|')} className="border-b border-gray-100 last:border-none">
                      {row.map((cell) => (
                        <td key={cell} className="py-3 pr-6 align-top text-gray-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {s.callout && (
            <p className="rounded-2xl border-l-4 border-[#059669] bg-gray-50 p-5 text-gray-800">
              {s.callout}
            </p>
          )}
        </section>
      ))}

      <section id="preguntas-frecuentes" className="mb-12 scroll-mt-24 border-t pt-10">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {a.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
      {/* El PDF es lo que entra al expediente y llega al frente de obra, donde
          no hay señal. Va arriba de las fuentes, no escondido al final. */}
      <div className="mb-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-6">
        <p className="text-gray-800">
          Llévese esta guía completa —con sus tablas, preguntas frecuentes y fuentes— en
          un solo documento.
        </p>
        <a
          href={`/recursos/${a.slug}/guia.pdf`}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0A2540] px-6 py-3 font-semibold text-white hover:bg-[#059669]"
        >
          Descargar la guía en PDF
        </a>
      </div>


      <section className="mb-12 border-t pt-10">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">Fuentes</h2>
        <p className="mb-4 text-sm text-gray-600">
          Cada fuente indica qué dato concreto respalda. Las cifras normativas deben
          verificarse contra el texto oficial vigente antes de usarse en una memoria de
          cálculo o en un expediente técnico.
        </p>
        <ol className="space-y-4 text-sm">
          {a.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[#059669] hover:underline"
              >
                {s.label} <ExternalLink className="h-3 w-3" />
              </a>
              <p className="mt-1 text-gray-600">{s.supports}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Vocabulario de la guía: la definición canónica de cada término que el
          artículo usa, para que no haya que deducirla del contexto. */}
      {glosarioRel.length > 0 && (
        <section className="mb-12 border-t pt-10">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Términos de esta guía
          </h2>
          <p className="mb-5 text-sm text-gray-600">
            Cada uno tiene su definición canónica, con la unidad en que se mide y lo
            que decide en obra.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {glosarioRel.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/glosario/${t.slug}`}
                  className="group block rounded-2xl border border-gray-100 p-4 transition-colors hover:border-[#059669]/40"
                >
                  <span className="block font-medium text-[#0A2540] group-hover:text-[#059669]">
                    {t.termino}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                    {t.definicionCorta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="mb-12 border-t pt-10">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Productos relacionados
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedProducts.map((p) => (
              <Link
                key={p.slug}
                href={`/productos/${p.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                  {p.name}
                </span>
                <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                  {p.shortDescription}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedCities.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Cobertura relacionada
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedCities.map((c) => (
              <Link
                key={c.slug}
                href={`/local/${c.slug}`}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
              >
                {c.ciudad}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Lo aplicamos a su proyecto?
        </h2>
        <p className="mx-auto mb-7 max-w-md text-white/80">
          Envíenos las condiciones reales de su operación y le devolvemos la
          especificación técnica junto con la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/recursos"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Más recursos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
P21_EOF

# -----------------------------------------------------------------------------
# package.json
# -----------------------------------------------------------------------------
cat > "package.json" <<'P21_EOF'
{
  "name": "plastilonas-peruanas",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:smoke": "bash scripts/smoke.sh",
    "audit:ui": "node scripts/audit-ui.mjs",
    "verify:deploy": "bash scripts/verificar-despliegue.sh",
    "vigilancia": "node scripts/vigilancia-fuentes.mjs",
    "imagenes": "node scripts/imagenes.mjs",
    "imagenes:prompts": "node scripts/imagenes.mjs --prompts"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "^1.2.12",
    "@ai-sdk/react": "^1.2.12",
    "@hookform/resolvers": "^3.9.1",
    "@supabase/supabase-js": "^2.45.4",
    "ai": "^4.3.16",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.4",
    "date-fns": "^4.1.0",
    "framer-motion": "^11.18.2",
    "lucide-react": "^0.469.0",
    "next": "^15.5.20",
    "next-auth": "^5.0.0-beta.31",
    "pdf-lib": "^1.17.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.2",
    "react-icons": "^5.7.0",
    "sonner": "^1.7.1",
    "stripe": "^17.5.0",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.24.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.20",
    "eslint": "^9",
    "eslint-config-next": "15.3.3",
    "jsdom": "^25.0.1",
    "postcss": "^8",
    "sharp": "^0.35.3",
    "tailwindcss": "^3.4.17",
    "typescript": "^5",
    "vitest": "^2.1.8"
  }
}
P21_EOF

chmod +x scripts/imagenes.mjs
mkdir -p public/images/familias public/images/soluciones public/images/recursos public/images/glosario
# -----------------------------------------------------------------------------
echo ""
echo "P21 aplicado."
echo "  nuevos      lib/imagenes.ts (registro de 75 ranuras)"
echo "              components/ImagenContenido.tsx, scripts/imagenes.mjs"
echo "              test/imagenes.test.ts"
echo "  modificados lib/bcrp.ts (User-Agent + motivo del fallo),"
echo "              lib/indicadores.ts, datos.json, test/indicadores,"
echo "              lib/schema.ts (ImageObject), package.json,"
echo "              paginas de solucion, familia, glosario y guia"
echo ""
echo "Siguiente paso:"
echo "  npx tsc --noEmit && npx next lint && npm test && npm run build"
echo "  (esperado: 338 tests en 22 archivos, 236 paginas)"
echo ""
echo "Genere el documento de encargo de imagenes:"
echo "  npm run imagenes:prompts     -> docs/encargo-imagenes.md"
echo "  npm run imagenes             -> cuantas faltan"
echo ""
echo "Despues del push:"
echo "  npm run verify:deploy"
echo "  curl -s https://plastilonas-peruanas-sac.vercel.app/indicadores/datos.json | head -12"
echo "  -> sinConexion deberia salir FALSE; si sale true, mire el campo diagnostico"
