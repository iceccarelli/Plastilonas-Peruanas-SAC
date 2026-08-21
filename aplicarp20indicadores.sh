#!/usr/bin/env bash
# =============================================================================
#  P20 — Datos en vivo: la API del BCRP, con honestidad de fecha
#  Plastilonas Peruanas SAC
#
#  EL SITIO YA LEE UNA API POR SU CUENTA
#  -------------------------------------
#  /indicadores consulta cada hora la API pública de series estadísticas del
#  Banco Central de Reserva del Perú y publica los cinco precios que de verdad
#  mueven una cotización de textiles industriales:
#
#    Tipo de cambio venta  PD04640PD  diaria    la resina se paga en dolares y
#                                               se factura en soles
#    Petroleo WTI          PN01660XM  mensual   cabeza de la cadena de la resina
#    Cobre LME             PN01652XM  mensual   tajo abierto -> impermeabilizacion
#    Zinc LME              PN01657XM  mensual   subterranea  -> ventilacion
#    Plomo LME             PN01656XM  mensual   acompana al zinc
#
#  Gratuita, oficial, sin clave y con licencia para reutilizar. Cada indicador
#  explica QUE DECIDE en una cotizacion y enlaza al informe que lo desarrolla:
#  un numero grande sin ese porque es decoracion, no informacion.
#
#  LA REGLA QUE GOBIERNA LA PAGINA
#  -------------------------------
#  Aca la frescura NO se insinua: se declara. Cada valor lleva la fecha de su
#  lectura, siempre. Un tablero que aparenta estar al dia mostrando una cifra de
#  hace tres semanas hace que alguien cotice mal y nos lo atribuya. La fecha al
#  lado del numero es lo que convierte un adorno en un dato utilizable.
#
#  TRES DECISIONES SOBRE QUE HACER CUANDO EL DATO LLEGA MAL
#  -------------------------------------------------------
#  Es donde falla practicamente toda integracion "en vivo".
#
#   1. FALLA CERRADA. Si la API no responde, se sirve la ultima lectura buena
#      CON SU FECHA y con un aviso visible que dice que no es de hoy. Nunca un
#      hueco, jamas un numero viejo disfrazado de fresco. Comprobado: este
#      parche se compilo entero en un entorno SIN acceso al BCRP y el build
#      paso, la pagina se genero y marco los cinco valores como respaldo.
#   2. RANGO PLAUSIBLE. Cada valor se compara contra un rango declarado antes
#      de aceptarse; fuera de el se descarta y se cae al periodo anterior. Una
#      API que devuelve basura no es una hipotesis: pasa.
#   3. "n.d." NO ES CERO. El BCRP marca asi fines de semana y feriados en las
#      series diarias. Leerlo como cero haria caer el tipo de cambio a cero
#      cada sabado.
#
#  Ademas: tiempo limite de 8 s en cada peticion (sin el, una API lenta cuelga
#  la compilacion), y la consulta NUNCA lanza.
#
#  QUE NO ENTRA, Y POR QUE
#  -----------------------
#  Precios de resina, nafta y flete NO se publican en vivo. Son producto
#  comercial de ICIS y Drewry: se pueden citar con atribucion, como se hace en
#  el informe de formacion de precio, pero no redistribuir. La pagina lo dice
#  en una seccion propia, en vez de dejar que el lector suponga que faltan por
#  descuido.
#
#  Tampoco hay pronosticos: son valores observados y fechados.
#
#  ADEMAS: LOS 52 PDF ERAN NO DETERMINISTAS
#  ----------------------------------------
#  Un test propio de determinismo fallaba una de cada dos veces en un clon
#  limpio. Un test intermitente casi siempre senala un defecto real, y este lo
#  senalaba: pdf-lib estampaba la hora del SISTEMA en CreationDate y ModDate,
#  de modo que los 52 PDF del sitio cambiaban de bytes en cada compilacion
#  aunque su contenido fuera identico. Los ETags se invalidaban solos, la cache
#  del CDN se rehacia sin motivo y un diff entre dos versiones no significaba
#  nada. El test pasaba unicamente cuando ambas generaciones caian dentro del
#  mismo segundo.
#
#  Corregido en el motor (lib/pdf-kit.ts): las fechas del documento se derivan
#  de `generatedAt`, no del reloj. Un solo cambio arregla las 36 fichas, las 10
#  guias, las 6 arquitecturas, el glosario, el marco y los informes.
#
#  Y los dos tests que lo encubrian, endurecidos: ahora cruzan un segundo a
#  proposito, y el de la ficha compara BYTES en vez de comparar longitudes
#  —un sello de tiempo mide siempre lo mismo, asi que comparar longitudes
#  pasaba siempre. Seis clones en frio seguidos: 317/317. Antes fallaban dos
#  de cada cuatro.
#
#  Uso:
#    ls aplicar*p20*
#    bash aplicarp20indicadores.sh
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
cat > "lib/bcrp.ts" <<'P20_EOF'
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
 * Consulta el BCRP. NUNCA lanza: devuelve null si algo sale mal, y quien la
 * llama decide qué mostrar. Un fallo de la API no puede tumbar una compilación
 * ni dejar una página en blanco.
 */
export async function consultarBCRP(
  codigos: string[],
  desde: string,
  hasta: string,
  opciones: { revalidate?: number; timeoutMs?: number } = {},
): Promise<RespuestaBCRP | null> {
  const { revalidate = 3600, timeoutMs = 8000 } = opciones;
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), timeoutMs);
  try {
    const res = await fetch(urlSerie(codigos, desde, hasta), {
      signal: control.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate },
    });
    if (!res.ok) return null;
    const datos = (await res.json()) as RespuestaBCRP;
    // Una respuesta 200 con forma inesperada es tan inservible como un 500.
    if (!Array.isArray(datos?.periods) || datos.periods.length === 0) return null;
    return datos;
  } catch {
    return null;
  } finally {
    clearTimeout(temporizador);
  }
}
P20_EOF

# -----------------------------------------------------------------------------
# lib/indicadores.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/indicadores.ts" <<'P20_EOF'
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
P20_EOF

# -----------------------------------------------------------------------------
# app/indicadores/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/indicadores"
cat > "app/indicadores/page.tsx" <<'P20_EOF'
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Activity, AlertTriangle } from 'lucide-react';
import { leerIndicadores, PORQUE } from '@/lib/indicadores';
import { numeroPE } from '@/lib/format';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, datasetSchema, webPageSchema } from '@/lib/schema';

/**
 * Indicadores en vivo.
 *
 * Se revalida cada hora: el sitio deja de ser una foto y pasa a leer el BCRP
 * por su cuenta. Pero la regla que gobierna la página es la contraria a la que
 * suele gobernar un tablero: acá la frescura NO se insinúa, se declara. Cada
 * número lleva la fecha de su lectura, y cuando el dato viene del respaldo en
 * frío la página lo dice con un aviso visible.
 *
 * Por qué esto importa más que el efecto de "sitio vivo": un tablero que
 * aparenta estar al día mostrando una cifra de hace tres semanas hace que
 * alguien cotice mal y nos lo atribuya. La fecha al lado del número es lo que
 * convierte un adorno en un dato utilizable.
 *
 * Y ningún indicador va solo: cada uno explica qué decide en una cotización y
 * enlaza al informe que lo desarrolla. Un número sin ese porqué es decoración.
 */

export const revalidate = 3600;

const URL = `${SITE.url}/indicadores`;
const TITLE = 'Indicadores que mueven el precio de una plastilona';
const DESCRIPTION = `Petróleo WTI, tipo de cambio, cobre, zinc y plomo, leídos de la API del Banco Central de Reserva del Perú. Cada valor con la fecha de su lectura y con la explicación de qué decide en una cotización de textiles industriales.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/indicadores' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default async function IndicadoresPage() {
  const estado = await leerIndicadores(new Date());

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="indicadores" slug="indice" />
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Indicadores', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          datasetSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            fecha: estado.consultadoEl,
            version: '1.0',
            fuentes: [
              {
                nombre: 'Banco Central de Reserva del Perú — API de series estadísticas',
                url: 'https://estadisticas.bcrp.gob.pe/estadisticas/series/api',
              },
            ],
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span className="text-gray-700">Indicadores</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Indicadores del rubro
      </h1>

      <p className="speakable-intro mb-6 max-w-3xl text-lg text-gray-700">
        Los cinco precios que mueven una cotización de textiles industriales, leídos
        directamente de la API de series estadísticas del Banco Central de Reserva del
        Perú. Cada uno con la fecha de su lectura y con lo que decide en la práctica.
      </p>

      <p className="mb-10 flex flex-wrap items-center gap-2 font-mono text-sm text-gray-500">
        <Activity className="h-4 w-4 text-[#059669]" aria-hidden="true" />
        Consultado el {estado.consultadoEl} · se relee cada hora ·{' '}
        <a
          href="/indicadores/datos.json"
          className="underline hover:text-[#059669]"
        >
          versión legible por máquina
        </a>
      </p>

      {/* Aviso, no silencio: si el BCRP no responde, el lector tiene derecho a
          saber que está viendo la última lectura buena y no la de hoy. */}
      {estado.sinConexion && (
        <div className="mb-10 flex gap-3 rounded-3xl bg-amber-50 p-6">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
          <div>
            <h2 className="mb-1 font-semibold text-amber-800">
              Mostrando la última lectura conocida
            </h2>
            <p className="text-gray-800">
              La API del BCRP no respondió en esta actualización. Los valores de abajo
              son los últimos verificados, con su fecha original: no son de hoy. Se
              reintenta automáticamente en la próxima relectura.
            </p>
          </div>
        </div>
      )}

      <div className="mb-14 space-y-5">
        {estado.indicadores.map((ind) => {
          const porque = PORQUE[ind.serie.codigo];
          return (
            <article
              key={ind.serie.codigo}
              className="rounded-3xl border border-gray-100 p-7"
            >
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#0A2540]">
                    {ind.serie.etiqueta}
                  </h2>
                  <p className="text-sm text-gray-500">{ind.serie.unidad}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-4xl font-semibold tracking-tight text-[#0A2540]">
                    {ind.valor === null
                      ? 'sin dato'
                      : numeroPE(ind.valor, ind.serie.decimales)}
                  </p>
                  {/* La fecha va pegada al número, siempre. Es lo que separa un
                      dato utilizable de un adorno. */}
                  <p className="mt-1 font-mono text-xs text-gray-500">
                    {ind.periodo || 'sin periodo'}
                    {ind.deRespaldo && ' · última lectura conocida'}
                  </p>
                </div>
              </div>

              {porque && (
                <>
                  <p className="mb-4 text-gray-700">{porque.texto}</p>
                  <Link
                    href={`/informes/${porque.informe}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#059669] hover:underline"
                  >
                    El informe que lo desarrolla <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}

              <p className="mt-4 border-t border-gray-100 pt-3 font-mono text-xs text-gray-500">
                BCRP · serie {ind.serie.codigo}
              </p>
            </article>
          );
        })}
      </div>

      <section className="mb-14 rounded-3xl border-l-4 border-[#059669] bg-gray-50 p-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Qué NO hay en esta página
        </h2>
        <p className="mb-3 text-gray-800">
          No hay precios de resina, de nafta ni de flete. Esas series son producto
          comercial de agencias especializadas: se pueden citar con atribución, como
          hacemos en el informe de formación de precio, pero no redistribuir. Acá solo
          aparece lo que una fuente pública y gratuita permite publicar.
        </p>
        <p className="text-gray-800">
          Tampoco hay pronósticos. Estos son valores observados y fechados; hacia dónde
          van lo decide usted con su propio criterio.
        </p>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Cómo se traduce esto en su proyecto?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Envíenos emplazamiento, aplicación, dimensiones y plazo, y le devolvemos la
          especificación técnica junto con la cotización, con su plazo de validez y la
          moneda declarados.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/informes/formacion-de-precio-y-volatilidad-textiles-industriales"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Por qué cambia el precio <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
P20_EOF

# -----------------------------------------------------------------------------
# app/indicadores/datos.json/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/indicadores/datos.json"
cat > "app/indicadores/datos.json/route.ts" <<'P20_EOF'
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
P20_EOF

# -----------------------------------------------------------------------------
# test/indicadores.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/indicadores.test.ts" <<'P20_EOF'
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
    expect(src).toMatch(/catch \{\s*\n\s*return null;/);
  });

  it('la petición lleva tiempo límite', () => {
    // Sin esto, una API lenta cuelga la compilación entera.
    expect(src).toMatch(/AbortController/);
    expect(src).toMatch(/timeoutMs/);
  });
});
P20_EOF

# -----------------------------------------------------------------------------
# lib/pdf-kit.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/pdf-kit.ts" <<'P20_EOF'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { SITE } from './site';
import { toWinAnsi } from './pdf-text';

/**
 * MOTOR DE DOCUMENTOS PDF.
 *
 * Por qué existe. La ficha técnica de producto llevaba su propio maquetador
 * privado. Al añadir guías, arquitecturas, glosario y marco, ese código se
 * habría copiado cuatro veces: cuatro cabeceras que divergen, cuatro pies con
 * distinta letra pequeña, cuatro sitios donde corregir el RUC. Extraerlo es lo
 * que permite que todos los documentos de la empresa se vean como uno solo.
 *
 * Por qué importa más allá de la estética. Un comprador industrial no decide
 * solo: reenvía el PDF a ingeniería, a calidad y a logística. Ese documento
 * circula dentro de la empresa del cliente cuando nosotros ya no estamos en la
 * conversación, y a veces es lo único que queda de nosotros en el expediente.
 *
 * REGLAS:
 *  1. Todo documento se GENERA desde la fuente de verdad, nunca se sube a mano.
 *     Un PDF mantenido aparte se desincroniza a la primera corrección.
 *  2. La fecha se INYECTA como parámetro, no se toma del reloj: así el
 *     resultado es determinista en los tests y estable entre despliegues del
 *     mismo contenido.
 *  3. Ningún documento declara precio, certificación ni ensayo que la fuente
 *     no contenga.
 *  4. Todo texto pasa por toWinAnsi(): las fuentes estándar de PDF no cubren
 *     Unicode completo y un carácter fuera de WinAnsi rompe la generación.
 */

export const MARGIN = 50;
export const PAGE_W = 595.28; // A4 en puntos
export const PAGE_H = 841.89;
export const AZUL = rgb(0.039, 0.145, 0.251); // #0A2540
export const VERDE = rgb(0.02, 0.588, 0.412); // #059669
export const GRIS = rgb(0.42, 0.45, 0.5);
export const GRIS_CLARO = rgb(0.88, 0.89, 0.91);
export const BLANCO = rgb(1, 1, 1);

export interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
}

export function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = toWinAnsi(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function newPage(ctx: Ctx): void {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.y = PAGE_H - MARGIN;
}

/** Reserva vertical: si no cabe el bloque, abre página antes de escribirlo. */
export function ensure(ctx: Ctx, needed: number): void {
  if (ctx.y - needed < MARGIN + 40) newPage(ctx);
}

export function heading(ctx: Ctx, text: string): void {
  ensure(ctx, 34);
  ctx.y -= 20;
  ctx.page.drawText(toWinAnsi(text.toUpperCase()), {
    x: MARGIN, y: ctx.y, size: 9, font: ctx.bold, color: VERDE,
  });
  ctx.y -= 6;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y }, end: { x: PAGE_W - MARGIN, y: ctx.y },
    thickness: 0.75, color: GRIS_CLARO,
  });
  ctx.y -= 12;
}

/** Subtítulo dentro de una sección: para documentos largos con jerarquía. */
export function subheading(ctx: Ctx, text: string): void {
  ensure(ctx, 26);
  ctx.y -= 10;
  for (const line of wrap(text, ctx.bold, 11, PAGE_W - MARGIN * 2)) {
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: 11, font: ctx.bold, color: AZUL });
    ctx.y -= 14;
  }
  ctx.y -= 2;
}

export function paragraph(ctx: Ctx, text: string, size = 9.5): void {
  for (const line of wrap(text, ctx.regular, size, PAGE_W - MARGIN * 2)) {
    ensure(ctx, size + 4);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font: ctx.regular, color: AZUL });
    ctx.y -= size + 3.5;
  }
}

/** Texto secundario: notas, procedencia, advertencias de alcance. */
export function note(ctx: Ctx, text: string, size = 8): void {
  for (const line of wrap(text, ctx.regular, size, PAGE_W - MARGIN * 2)) {
    ensure(ctx, size + 4);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size, font: ctx.regular, color: GRIS });
    ctx.y -= size + 3;
  }
}

export function bullets(ctx: Ctx, items: string[], size = 9.5): void {
  for (const item of items) {
    const lines = wrap(item, ctx.regular, size, PAGE_W - MARGIN * 2 - 14);
    lines.forEach((line, i) => {
      ensure(ctx, size + 4);
      if (i === 0) {
        ctx.page.drawText('-', { x: MARGIN, y: ctx.y, size, font: ctx.bold, color: VERDE });
      }
      ctx.page.drawText(line, {
        x: MARGIN + 14, y: ctx.y, size, font: ctx.regular, color: AZUL,
      });
      ctx.y -= size + 3.5;
    });
    ctx.y -= 2;
  }
}

/** Lista numerada: secuencias de ejecución, pasos de un procedimiento. */
export function steps(ctx: Ctx, items: string[], size = 9.5): void {
  items.forEach((item, n) => {
    const lines = wrap(item, ctx.regular, size, PAGE_W - MARGIN * 2 - 22);
    lines.forEach((line, i) => {
      ensure(ctx, size + 4);
      if (i === 0) {
        ctx.page.drawText(`${n + 1}.`, {
          x: MARGIN, y: ctx.y, size, font: ctx.bold, color: VERDE,
        });
      }
      ctx.page.drawText(line, {
        x: MARGIN + 22, y: ctx.y, size, font: ctx.regular, color: AZUL,
      });
      ctx.y -= size + 3.5;
    });
    ctx.y -= 2;
  });
}

export function specTable(ctx: Ctx, rows: { label: string; value: string }[]): void {
  const size = 9;
  const labelW = 150;
  const valueW = PAGE_W - MARGIN * 2 - labelW - 10;
  for (const row of rows) {
    const valueLines = wrap(row.value, ctx.regular, size, valueW);
    const labelLines = wrap(row.label, ctx.bold, size, labelW);
    const height = Math.max(valueLines.length, labelLines.length) * (size + 3) + 6;
    ensure(ctx, height);
    const top = ctx.y;
    labelLines.forEach((line, i) => {
      ctx.page.drawText(line, {
        x: MARGIN, y: top - i * (size + 3), size, font: ctx.bold, color: GRIS,
      });
    });
    valueLines.forEach((line, i) => {
      ctx.page.drawText(line, {
        x: MARGIN + labelW + 10, y: top - i * (size + 3), size, font: ctx.regular, color: AZUL,
      });
    });
    ctx.y = top - height + 2;
    ctx.page.drawLine({
      start: { x: MARGIN, y: ctx.y + 4 }, end: { x: PAGE_W - MARGIN, y: ctx.y + 4 },
      thickness: 0.5, color: GRIS_CLARO,
    });
    ctx.y -= 6;
  }
}

/** Bloque destacado: riesgo, error frecuente, criterio que decide. */
export function callout(ctx: Ctx, titulo: string, texto: string): void {
  const size = 9;
  const lines = wrap(texto, ctx.regular, size, PAGE_W - MARGIN * 2 - 24);
  const alto = lines.length * (size + 3.5) + 26;
  ensure(ctx, alto + 8);
  const top = ctx.y;
  ctx.page.drawRectangle({
    x: MARGIN, y: top - alto + 8, width: 3, height: alto - 6, color: VERDE,
  });
  ctx.page.drawText(toWinAnsi(titulo.toUpperCase()), {
    x: MARGIN + 12, y: top, size: 7.5, font: ctx.bold, color: VERDE,
  });
  let y = top - 13;
  for (const line of lines) {
    ctx.page.drawText(line, { x: MARGIN + 12, y, size, font: ctx.regular, color: AZUL });
    y -= size + 3.5;
  }
  ctx.y = y - 6;
}

/** Crea el documento con su cabecera de marca y devuelve el contexto listo. */
export async function startDoc(meta: {
  title: string;
  subject: string;
  keywords: string[];
  /** Título grande del documento. */
  h1: string;
  /** Línea de contexto bajo el título: familia, tipo de documento, versión. */
  kicker: string;
}): Promise<Ctx> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.setTitle(toWinAnsi(`${meta.title} - ${SITE.name}`));
  doc.setAuthor(SITE.legalName);
  doc.setSubject(toWinAnsi(meta.subject));
  doc.setProducer(SITE.name);
  doc.setCreator(SITE.url);
  doc.setKeywords(meta.keywords.map(toWinAnsi));

  const ctx: Ctx = {
    doc, page: doc.addPage([PAGE_W, PAGE_H]), y: PAGE_H - MARGIN, regular, bold,
  };

  ctx.page.drawRectangle({ x: 0, y: PAGE_H - 96, width: PAGE_W, height: 96, color: AZUL });
  ctx.page.drawText(toWinAnsi(SITE.name), {
    x: MARGIN, y: PAGE_H - 42, size: 15, font: bold, color: BLANCO,
  });
  ctx.page.drawText(
    toWinAnsi(`RUC ${SITE.ruc}  |  ${SITE.addressLocality}, ${SITE.addressRegion}, Perú`),
    { x: MARGIN, y: PAGE_H - 60, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92) },
  );
  ctx.page.drawText(
    toWinAnsi(`WhatsApp ${SITE.phoneWhatsApp}  |  ${SITE.email}  |  ${SITE.url}`),
    { x: MARGIN, y: PAGE_H - 76, size: 8.5, font: regular, color: rgb(0.85, 0.88, 0.92) },
  );
  ctx.y = PAGE_H - 130;

  for (const line of wrap(meta.h1, bold, 18, PAGE_W - MARGIN * 2)) {
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: 18, font: bold, color: AZUL });
    ctx.y -= 22;
  }
  ctx.page.drawText(toWinAnsi(meta.kicker), {
    x: MARGIN, y: ctx.y, size: 9, font: regular, color: GRIS,
  });
  ctx.y -= 8;

  return ctx;
}

/**
 * Cierra el documento: pie con procedencia y numeración en todas las páginas.
 *
 * La URL de origen en cada página no es decoración: cuando el PDF circula
 * dentro de la empresa del cliente, es lo único que permite volver a la fuente
 * y comprobar si el documento sigue vigente.
 */
export async function finishDoc(
  ctx: Ctx,
  sourceUrl: string,
  generatedAt: string,
): Promise<Uint8Array> {
  // Fechas del documento fijadas a partir de `generatedAt`, NO del reloj.
  //
  // pdf-lib estampa por defecto la hora del sistema en CreationDate y
  // ModDate. Con eso, los 52 PDF del sitio cambiaban de bytes en CADA
  // compilación aunque su contenido fuera idéntico: los ETags se invalidaban
  // solos, la caché del CDN se rehacía sin motivo y un diff entre dos
  // versiones no significaba nada.
  //
  // Lo delató un test propio de determinismo que fallaba una de cada dos veces
  // en un clon limpio: pasaba solo cuando las dos generaciones caían dentro
  // del mismo segundo. Un test intermitente casi siempre está señalando un
  // defecto real; este lo señalaba.
  //
  // Mediodía UTC y no medianoche: en zona negativa como la peruana, 00:00 UTC
  // retrocede la fecha un día.
  const fecha = new Date(`${generatedAt}T12:00:00Z`);
  if (!Number.isNaN(fecha.getTime())) {
    ctx.doc.setCreationDate(fecha);
    ctx.doc.setModificationDate(fecha);
  }

  const pages = ctx.doc.getPages();
  pages.forEach((page, i) => {
    page.drawLine({
      start: { x: MARGIN, y: MARGIN + 22 }, end: { x: PAGE_W - MARGIN, y: MARGIN + 22 },
      thickness: 0.5, color: GRIS_CLARO,
    });
    page.drawText(toWinAnsi(`${sourceUrl}  |  Documento generado el ${generatedAt}`), {
      x: MARGIN, y: MARGIN + 10, size: 7.5, font: ctx.regular, color: GRIS,
    });
    page.drawText(`${i + 1} / ${pages.length}`, {
      x: PAGE_W - MARGIN - 30, y: MARGIN + 10, size: 7.5, font: ctx.regular, color: GRIS,
    });
  });
  return ctx.doc.save();
}
P20_EOF

# -----------------------------------------------------------------------------
# test/informes.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/informes.test.ts" <<'P20_EOF'
import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  informes, informeBySlug, fuenteDe, fuentesUsadas, INFORMES_UPDATED,
} from '@/lib/informes';
import { buildInformePdf } from '@/lib/doc-informe';
import { generateStaticParams } from '@/app/informes/[slug]/page';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';

/**
 * El archivo más delicado del sitio. Una cifra sin fuente en un informe no es
 * un error aislado: contamina el glosario, el marco y las guías, porque todos
 * valen por la misma propiedad — nada de lo publicado es inventado. Y una vez
 * que un modelo citó el dato, ya se propagó.
 */

describe('informes: toda cifra tiene procedencia', () => {
  it('cada indicador y cada gráfico resuelven a una fuente declarada', () => {
    for (const i of informes) {
      for (const id of fuentesUsadas(i)) {
        expect(fuenteDe(i, id), `${i.slug} → ${id}`).toBeDefined();
      }
    }
  });

  it('no hay fuentes declaradas que nadie use', () => {
    // Una fuente sin uso es una cita decorativa: da apariencia de rigor sin
    // respaldar ninguna cifra concreta.
    for (const i of informes) {
      const usadas = new Set(fuentesUsadas(i));
      for (const f of i.fuentes) {
        expect(usadas.has(f.id), `${i.slug}: fuente ${f.id} declarada pero sin usar`).toBe(true);
      }
    }
  });

  it('cada fuente declara organismo, URL real, fechas y qué respalda', () => {
    for (const i of informes) {
      for (const f of i.fuentes) {
        expect(f.organismo.length, f.id).toBeGreaterThan(3);
        expect(f.url).toMatch(/^https:\/\//);
        expect(f.publicado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(f.consultado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        // Sin esto, "Fuente: MINEM" no dice qué número respalda.
        expect(f.respalda.length, f.id).toBeGreaterThan(40);
      }
    }
  });

  it('ninguna verificación está fechada en el futuro', () => {
    // Se coló: dos fuentes decían haberse verificado "mañana", y el reporte de
    // vigilancia lo delató imprimiendo "verificada hace -1 días". Afirmar una
    // comprobación que todavía no ocurrió es pequeño y es exactamente el tipo
    // de imprecisión que este archivo entero existe para impedir.
    const hoy = new Date().toISOString().slice(0, 10);
    for (const i of informes) {
      for (const f of i.fuentes) {
        expect(f.consultado <= hoy, `${f.id}: consultado ${f.consultado} > hoy ${hoy}`).toBe(true);
      }
      expect(i.fecha <= hoy, `${i.slug} fechado ${i.fecha}`).toBe(true);
    }
  });

  it('no se verifica una fuente antes de que exista', () => {
    for (const i of informes) {
      for (const f of i.fuentes) {
        expect(f.consultado >= f.publicado, `${f.id}: consultado ${f.consultado} < publicado ${f.publicado}`).toBe(true);
      }
    }
  });

  it('ningún indicador se publica sin periodo', () => {
    // Una cifra sin periodo no es una cifra: es una impresión.
    for (const i of informes) {
      for (const s of i.secciones) {
        for (const ind of s.indicadores ?? []) {
          expect(ind.periodo.length, `${i.slug}: ${ind.etiqueta}`).toBeGreaterThan(3);
          expect(ind.valor.length, `${i.slug}: ${ind.etiqueta}`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('informes: honestidad declarada', () => {
  it('cada informe declara qué NO afirma', () => {
    for (const i of informes) {
      expect(i.limitaciones.length, i.slug).toBeGreaterThanOrEqual(3);
      for (const l of i.limitaciones) expect(l.length).toBeGreaterThan(40);
    }
  });

  it('declara explícitamente que no estima el tamaño de su propio mercado', () => {
    // Es la invención más tentadora de un informe de sector y la más dañina:
    // no existe estadística pública verificable de este mercado.
    for (const i of informes) {
      const texto = i.limitaciones.join(' ').toLowerCase();
      expect(texto, i.slug).toMatch(/no estima|no cuantifica/);
      expect(texto, i.slug).toContain('mercado');
    }
  });

  it('no se publica un precio como si fuera vigente ni una lista propia', () => {
    // Un precio publicado que se queda viejo es peor que ninguno: el comprador
    // cotiza contra él, se equivoca, y nos lo atribuye con razón.
    for (const i of informes) {
      const texto = i.limitaciones.join(' ').toLowerCase();
      const hablaDePrecios = [...i.resumenEjecutivo, ...i.secciones.map((x) => x.heading)]
        .join(' ')
        .toLowerCase()
        .includes('precio');
      if (hablaDePrecios) {
        expect(texto, `${i.slug}: debe declarar que no publica precios vigentes`).toMatch(
          /no publica precios|no las use para cotizar|no publica.*lista/,
        );
      }
    }
  });

  it('las series de terceros se citan, no se redistribuyen', () => {
    // Las series de precios de resina son producto comercial de agencias.
    const conIcis = informes.filter((i) => i.fuentes.some((f) => /ICIS/i.test(f.organismo)));
    for (const i of conIcis) {
      expect(i.limitaciones.join(' ').toLowerCase(), i.slug).toMatch(
        /no se redistribuyen|producto comercial/,
      );
    }
  });

  it('ningún informe firma una previsión propia como si fuera un hecho', () => {
    // "Proyectamos que el mercado crecerá" es exactamente lo que no hacemos.
    const prohibido = /\b(proyectamos|estimamos que el mercado|prevemos que|nuestra proyección)\b/i;
    for (const i of informes) {
      const texto = [
        ...i.resumenEjecutivo,
        ...i.secciones.flatMap((s) => [...(s.cuerpo ?? []), s.implicacion ?? '']),
      ].join(' ');
      expect(prohibido.test(texto), i.slug).toBe(false);
    }
  });

  it('el resumen ejecutivo son frases autosuficientes y citables', () => {
    for (const i of informes) {
      expect(i.resumenEjecutivo.length).toBeGreaterThanOrEqual(3);
      for (const r of i.resumenEjecutivo) {
        expect(r.length, `${i.slug}: "${r.slice(0, 40)}"`).toBeGreaterThan(60);
        expect(r.trim().endsWith('.'), r.slice(0, 40)).toBe(true);
      }
    }
  });

  it('la lectura propia va separada del dato', () => {
    // `implicacion` existe justamente para que el lector distinga lo que dice
    // el organismo de lo que decimos nosotros.
    const conImplicacion = informes.flatMap((i) =>
      i.secciones.filter((s) => s.implicacion),
    );
    expect(conImplicacion.length).toBeGreaterThan(0);
    for (const s of conImplicacion) expect(s.implicacion!.length).toBeGreaterThan(80);
  });
});

describe('informes: gráficos', () => {
  const graficos = informes.flatMap((i) => i.secciones.map((s) => s.grafico).filter(Boolean));

  it('cada gráfico declara unidad, fuente y nota de alcance', () => {
    expect(graficos.length).toBeGreaterThan(0);
    for (const g of graficos) {
      expect(g!.unidad.length).toBeGreaterThan(3);
      expect(g!.fuenteId.length).toBeGreaterThan(0);
      // La nota dice qué NO muestra el gráfico: sin ella, una barra de
      // variación porcentual se lee como si fuera volumen.
      expect(g!.nota.length).toBeGreaterThan(60);
      expect(g!.datos.length).toBeGreaterThan(1);
    }
  });

  it('la serie temporal usa el componente de línea, no barras', () => {
    // La forma la decide el trabajo del dato: una trayectoria en barras obliga
    // a comparar alturas contiguas en vez de leer hacia dónde va.
    const page = readFileSync(join(process.cwd(), 'app/informes/[slug]/page.tsx'), 'utf8');
    expect(page).toMatch(/tipo === 'serie-temporal'/);
    expect(page).toMatch(/LineChart/);
  });

  it('la serie temporal declara en su nota que el eje no arranca en cero', () => {
    // Truncar el eje es correcto en una trayectoria y engañoso si no se dice.
    for (const g of graficos.filter((x) => x!.tipo === 'serie-temporal')) {
      expect(g!.nota.toLowerCase(), g!.titulo).toMatch(/no arranca en cero|no empieza en cero/);
    }
  });

  it('el gráfico de línea se renderiza en el servidor y trae tabla', () => {
    const src = readFileSync(join(process.cwd(), 'components/LineChart.tsx'), 'utf8');
    expect(src).not.toMatch(/^'use client'/m);
    expect(src).toMatch(/<table/);
    // Etiquetas sólo en los extremos: un número por punto es una tabla mal hecha.
    expect(src).toMatch(/datos\.length - 1/);
  });

  it('los gráficos de magnitud no llevan valores negativos', () => {
    for (const g of graficos) {
      if (g!.tipo === 'magnitud') {
        for (const d of g!.datos) expect(d.valor, `${g!.titulo}: ${d.etiqueta}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('el gráfico se renderiza en el servidor y sin JavaScript de cliente', () => {
    const src = readFileSync(join(process.cwd(), 'components/BarChart.tsx'), 'utf8');
    expect(src).not.toMatch(/^'use client'/m);
    expect(src).not.toMatch(/useState|useEffect/);
    // Tabla de respaldo: lector de pantalla, impresión y alto contraste.
    expect(src).toMatch(/<table/);
  });

  it('el eje divergente no depende solo del color', () => {
    // Cada barra lleva su valor con signo: la identidad nunca es color-solo.
    const src = readFileSync(join(process.cwd(), 'components/BarChart.tsx'), 'utf8');
    expect(src).toMatch(/signo/);
    expect(src).toMatch(/viz-barra-neg/);
  });
});

describe('informes: rutas, documento y descubrimiento', () => {
  it('generateStaticParams cubre todos los informes', () => {
    expect(generateStaticParams().map((p) => p.slug).sort()).toEqual(
      informes.map((i) => i.slug).sort(),
    );
  });

  it('informeBySlug encuentra cada informe y rechaza los inexistentes', () => {
    for (const i of informes) expect(informeBySlug(i.slug)?.titulo).toBe(i.titulo);
    expect(informeBySlug('no-existe')).toBeUndefined();
  });

  it('genera un PDF válido de cada informe, de forma determinista', async () => {
    // La espera entre las dos generaciones es el test. Sin ella esto pasaba
    // por accidente —cuando ambas caían en el mismo segundo— y encubría que
    // pdf-lib estampaba la hora del sistema en los metadatos, de modo que
    // cada compilación producía bytes distintos con el mismo contenido.
    for (const i of informes) {
      const a = await buildInformePdf(i, '2026-08-20');
      await new Promise((r) => setTimeout(r, 1100));
      const b = await buildInformePdf(i, '2026-08-20');
      expect(Buffer.from(a).equals(Buffer.from(b)), i.slug).toBe(true);
      const doc = await PDFDocument.load(a);
      expect(doc.getPageCount(), i.slug).toBeGreaterThan(1);
    }
  }, 30000);

  it('el sitemap publica el índice y cada informe con su fecha real', () => {
    const urls = new Map(sitemap().map((e) => [e.url, e.lastModified]));
    expect(urls.has(`${SITE.url}/informes`)).toBe(true);
    for (const i of informes) {
      const lastMod = urls.get(`${SITE.url}/informes/${i.slug}`);
      expect(lastMod, i.slug).toBeDefined();
      expect(new Date(lastMod as Date).toISOString().slice(0, 10)).toBe(i.fecha);
    }
  });

  it('INFORMES_UPDATED es la fecha del informe más reciente', () => {
    expect(INFORMES_UPDATED).toBe([...informes.map((i) => i.fecha)].sort().reverse()[0]);
  });
});

describe('vigilancia de fuentes: informa, no publica', () => {
  const src = readFileSync(join(process.cwd(), 'scripts/vigilancia-fuentes.mjs'), 'utf8');

  it('no escribe en ningún archivo del sitio', () => {
    // La línea que separa un mecanismo de vigilancia de una granja de
    // contenido: este script no publica nada, nunca.
    expect(src).not.toMatch(/writeFileSync|appendFileSync|createWriteStream/);
  });

  it('clasifica en cuatro estados, no en dos', () => {
    // Corregido dos veces con datos reales. Un 403 es un cortafuegos y un
    // fallo de red es indistinguible de una red local rota: ninguno prueba
    // que la cita murió. Contarlos como fallo llena el reporte de falsos
    // positivos hasta que nadie lo lee, que es cuando el mecanismo deja de
    // existir.
    for (const estado of ['ok', 'caida', 'bloqueado', 'revisar']) {
      expect(src, estado).toMatch(new RegExp(`'${estado}'`));
    }
  });

  it('solo 404 y 410 cuentan como cita rota', () => {
    // Son las dos únicas respuestas en que el servidor AFIRMA que el recurso
    // no existe. Todo lo demás es una conjetura sobre el estado de la cita.
    const fn = src.slice(src.indexOf('function clasificar'), src.indexOf('async function comprobar'));
    expect(fn).toMatch(/estado === 404 \|\| estado === 410\) return 'caida'/);
    expect(fn).not.toMatch(/return 'caida';\s*\n\}/);
  });

  it('un fallo de red no se declara caída', () => {
    // Un DNS que no resuelve y un dominio muerto dan exactamente el mismo
    // error. Se descubrió con una fuente que falló desde una red y cargó
    // desde otra.
    const captura = src.slice(src.indexOf('} catch (e)'), src.indexOf('} finally'));
    expect(captura).toMatch(/clase: 'revisar'/);
    expect(captura).not.toMatch(/clase: 'caida'/);
  });

  it('deduplica por URL antes de comprobar', () => {
    // Dos guías que citan la misma norma no son dos problemas: son uno.
    expect(src).toMatch(/porUrl/);
    expect(src).toMatch(/unicas/);
  });

  it('envía cabecera de navegador', () => {
    // Sin User-Agent, casi cualquier portal con cortafuegos responde 403 y el
    // reporte entero se vuelve ruido.
    expect(src).toMatch(/'User-Agent'/);
  });

  it('solo falla el proceso por caídas reales', () => {
    expect(src).toMatch(/process\.exit\(caidas \? 1 : 0\)/);
  });

  it('está enlazado como npm run vigilancia', () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    expect(pkg.scripts.vigilancia).toContain('vigilancia-fuentes.mjs');
  });
});
P20_EOF

# -----------------------------------------------------------------------------
# test/datasheet.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/datasheet.test.ts" <<'P20_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { products } from '@/lib/products';
import { buildDatasheetPdf } from '@/lib/datasheet';
import { toWinAnsi } from '@/lib/pdf-text';
import { generateStaticParams } from '@/app/productos/[slug]/ficha-tecnica.pdf/route';

const FECHA = '2026-08-18';

describe('ficha técnica: saneado de texto', () => {
  it('convierte los signos tipográficos que WinAnsi no admite', () => {
    // Sin esto, pdf-lib lanza excepción al primer guion largo y no hay ficha.
    expect(toWinAnsi('a—b')).toBe('a-b');
    expect(toWinAnsi('“cita”')).toBe('"cita"');
    expect(toWinAnsi('a → b')).toBe('a -> b');
    expect(toWinAnsi('2 m²')).toBe('2 m2');
    expect(toWinAnsi('uno · dos')).toBe('uno - dos');
  });

  it('conserva intactos los acentos y la eñe del español', () => {
    expect(toWinAnsi('Especificación de mañana en el Perú')).toBe(
      'Especificación de mañana en el Perú',
    );
  });

  it('elimina lo que no cabe en WinAnsi en vez de romper el documento', () => {
    expect(toWinAnsi('ok ✅ fin')).toBe('ok  fin');
  });
});

describe('ficha técnica: generación', () => {
  it('genera un PDF válido para CADA producto del catálogo', async () => {
    for (const p of products) {
      const bytes = await buildDatasheetPdf(p, FECHA);
      const header = Buffer.from(bytes.slice(0, 5)).toString('latin1');
      expect(header, p.slug).toBe('%PDF-');
      expect(bytes.length, p.slug).toBeGreaterThan(2000);
    }
  }, 60_000);

  it('es determinista para el mismo contenido y la misma fecha', async () => {
    // Comparaba solo la LONGITUD, y un sello de tiempo mide siempre lo mismo:
    // el test pasaba aunque los bytes difirieran en cada generación. Ahora
    // compara byte a byte y cruza un segundo a propósito, que es lo único que
    // detecta un reloj metido en los metadatos del PDF.
    const a = await buildDatasheetPdf(products[0], FECHA);
    await new Promise((r) => setTimeout(r, 1100));
    const b = await buildDatasheetPdf(products[0], FECHA);
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
  });

  it('la ruta prerenderiza una ficha por producto', () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(products.length);
    expect(params.map((p) => p.slug).sort()).toEqual(products.map((p) => p.slug).sort());
  });
});

describe('ficha técnica: honestidad del documento', () => {
  const route = readFileSync(
    join(process.cwd(), 'app/productos/[slug]/ficha-tecnica.pdf/route.ts'),
    'utf8',
  );
  const lib = readFileSync(join(process.cwd(), 'lib/datasheet.ts'), 'utf8');

  it('declara canonical hacia la ficha HTML, para no competir con ella', () => {
    expect(route).toContain('rel="canonical"');
    expect(route).toContain('/productos/${product.slug}');
  });

  it('no inventa documentación cuando el catálogo no la declara', () => {
    // El texto de respaldo dice que se entrega con la cotización; nunca afirma
    // un certificado concreto que no exista en el catálogo.
    expect(lib).toContain('product.documentation ??');
    expect(lib).toContain('se entregan con la cotización');
  });

  it('el PDF no publica precios: el negocio es por cotización', () => {
    expect(lib).not.toMatch(/S\/\s?\d/);
    expect(lib).toContain('No publicamos precio de lista');
  });

  it('la descarga emite el evento de conversión', () => {
    const btn = readFileSync(join(process.cwd(), 'components/DatasheetButton.tsx'), 'utf8');
    expect(btn).toContain('trackDocumentDownload');
    expect(btn).toContain('/ficha-tecnica.pdf');
  });
});
P20_EOF

# -----------------------------------------------------------------------------
# lib/analytics.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/analytics.ts" <<'P20_EOF'
/**
 * Capa de analítica y conversiones (GA4 + Meta Pixel + GTM).
 *
 * `trackEvent` envía UN evento semántico a todos los proveedores cargados.
 * Nada se ejecuta si el proveedor no está presente (IDs ausentes o sin
 * consentimiento), de modo que llamar a estas funciones siempre es seguro.
 *
 * POR QUÉ IMPORTA: en el Perú B2B el canal de leads es WhatsApp. Si los clics a
 * WhatsApp no se miden, no se puede saber qué página, qué familia o qué ciudad
 * produce negocio — y toda inversión publicitaria se hace a ciegas. Por eso
 * TODO punto de salida a WhatsApp debe pasar por `components/WhatsAppLink.tsx`,
 * que dispara `whatsapp_click` con el contexto de origen. Hay un test que falla
 * si alguien vuelve a escribir un enlace `wa.me` a mano.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', name, params);
  window.fbq?.('trackCustom', name, params);
  window.dataLayer?.push({ event: name, ...params });
}

/* ------------------------------------------------------------------ */
/* Conversiones — miden intención de compra, no vanidad.               */
/* ------------------------------------------------------------------ */

/**
 * El formulario de cotización se ABRIÓ. Junto con `quote_request` da la tasa
 * de abandono del formulario, que es lo que dice si el formulario pide de más.
 */
export function trackQuoteStarted(context: string, producto?: string): void {
  trackEvent('quote_started', { context, producto: producto ?? 'general' });
}

/** Solicitud de cotización enviada — la conversión principal del negocio. */
export function trackQuoteRequest(producto?: string): void {
  const content = producto ?? 'general';
  trackEvent('quote_request', { producto: content });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Lead', { content_name: content });
  }
}

/**
 * Clic para contactar por WhatsApp — canal #1 de leads en Perú.
 * `context` identifica el punto de salida (footer, ficha de producto, ciudad…)
 * para poder atribuir el lead a la página que lo generó.
 */
export function trackWhatsAppClick(context?: string): void {
  trackEvent('whatsapp_click', { context: context ?? 'general' });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Contact');
  }
}

/** Primer mensaje enviado al asistente: intención real, no apertura del widget. */
export function trackChatbotEngaged(): void {
  trackEvent('chatbot_engaged');
}

/** Descarga de ficha técnica u otro documento. */
export function trackDocumentDownload(documento: string, producto?: string): void {
  trackEvent('document_download', { documento, producto: producto ?? 'general' });
}

/** Clic en un ícono de red social. */
export function trackSocialClick(network: string): void {
  trackEvent('social_click', { network });
}

/* ------------------------------------------------------------------ */
/* Vistas de contenido — qué silo produce demanda.                     */
/* ------------------------------------------------------------------ */

export function trackProductView(slug: string, categoria: string): void {
  trackEvent('product_view', { slug, categoria });
}

export function trackFamilyView(slug: string): void {
  trackEvent('family_view', { slug });
}

export function trackCityPageView(ciudad: string): void {
  trackEvent('city_page_view', { ciudad });
}

export function trackArticleView(slug: string, categoria: string): void {
  trackEvent('article_view', { slug, categoria });
}

/**
 * Vista de una tabla comparativa. Es la señal de intención más avanzada del
 * catálogo: quien compara especificación por especificación ya está eligiendo
 * proveedor, no explorando.
 */
export function trackComparisonView(familia: string): void {
  trackEvent('comparison_view', { familia });
}

/** Vista de una arquitectura de referencia: intención de proyecto completo. */
export function trackSolutionView(slug: string): void {
  trackEvent('solution_view', { slug });
}

/**
 * Vista del registro fechado. Mide lo que ninguna otra métrica del sitio mide:
 * si la frescura sostiene el retorno de un comprador que ya nos conoce.
 */
export function trackNovedadView(slug: string): void {
  trackEvent('novedad_view', { slug });
}

/**
 * Vista de un término del glosario. Es el evento que revela intención
 * temprana: quien busca qué significa "geotextil" está especificando, no
 * comparando precios todavía.
 */
export function trackGlosarioView(slug: string): void {
  trackEvent('glosario_view', { slug });
}

/** Vista del centro de documentación: intención de armar expediente técnico. */
export function trackDescargasView(slug: string): void {
  trackEvent('descargas_view', { slug });
}

/** Vista de un informe del sector: la señal de autoridad, no de compra. */
export function trackInformeView(slug: string): void {
  trackEvent('informe_view', { slug });
}

/** Vista de los indicadores en vivo: intención de compra a corto plazo. */
export function trackIndicadoresView(slug: string): void {
  trackEvent('indicadores_view', { slug });
}

/* ------------------------------------------------------------------ */
/* Marco de Especificación — el embudo de mayor intención del sitio.   */
/* ------------------------------------------------------------------ */

/** Vista del marco publicado o de la autoevaluación. */
export function trackFrameworkView(seccion: string): void {
  trackEvent('framework_view', { seccion });
}

/** El usuario respondió el primer criterio: empezó de verdad. */
export function trackFrameworkStarted(): void {
  trackEvent('framework_started');
}

/**
 * Autoevaluación completada. El porcentaje es la señal comercial: un proyecto
 * "Definido" está listo para cotizar; uno "Exploratorio" necesita asesoría.
 */
export function trackFrameworkCompleted(porcentaje: number, nivel: string): void {
  trackEvent('framework_completed', { porcentaje, nivel });
}

/** Descarga del brief técnico generado por la autoevaluación. */
export function trackBriefDownload(nivel: string): void {
  trackEvent('brief_download', { nivel });
}
P20_EOF

# -----------------------------------------------------------------------------
# components/TrackView.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/TrackView.tsx" <<'P20_EOF'
'use client';

import { useEffect, useRef } from 'react';
import {
  trackArticleView,
  trackCityPageView,
  trackComparisonView,
  trackFamilyView,
  trackFrameworkView,
  trackSolutionView,
  trackNovedadView,
  trackGlosarioView,
  trackDescargasView,
  trackInformeView,
  trackIndicadoresView,
  trackProductView,
} from '@/lib/analytics';

/**
 * Emite un evento de vista de contenido una sola vez por montaje.
 *
 * Se renderiza desde páginas de servidor (fichas, familias, ciudades,
 * artículos) sin convertirlas en client components: solo este pequeño
 * componente se hidrata. Sin estos eventos no se puede responder a la pregunta
 * que decide dónde invertir: ¿qué silo produce cotizaciones?
 */

type Props =
  | { kind: 'product'; slug: string; categoria: string }
  | { kind: 'family'; slug: string }
  | { kind: 'city'; ciudad: string }
  | { kind: 'article'; slug: string; categoria: string }
  | { kind: 'comparison'; slug: string }
  | { kind: 'framework'; slug: string }
  | { kind: 'solution'; slug: string }
  | { kind: 'novedades'; slug: string }
  | { kind: 'glosario'; slug: string }
  | { kind: 'descargas'; slug: string }
  | { kind: 'informe'; slug: string }
  | { kind: 'indicadores'; slug: string };

export default function TrackView(props: Props) {
  const fired = useRef(false);

  useEffect(() => {
    // React 18 monta dos veces en desarrollo con StrictMode: sin esta guarda
    // el evento se duplicaría y las tasas de conversión saldrían a la mitad.
    if (fired.current) return;
    fired.current = true;

    switch (props.kind) {
      case 'product':
        trackProductView(props.slug, props.categoria);
        break;
      case 'family':
        trackFamilyView(props.slug);
        break;
      case 'city':
        trackCityPageView(props.ciudad);
        break;
      case 'article':
        trackArticleView(props.slug, props.categoria);
        break;
      case 'comparison':
        trackComparisonView(props.slug);
        break;
      case 'framework':
        trackFrameworkView(props.slug);
        break;
      case 'solution':
        trackSolutionView(props.slug);
        break;
      case 'novedades':
        trackNovedadView(props.slug);
        break;
      case 'glosario':
        trackGlosarioView(props.slug);
        break;
      case 'descargas':
        trackDescargasView(props.slug);
        break;
      case 'informe':
        trackInformeView(props.slug);
        break;
      case 'indicadores':
        trackIndicadoresView(props.slug);
        break;
    }
  }, [props]);

  return null;
}
P20_EOF

# -----------------------------------------------------------------------------
# app/sitemap.ts
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/sitemap.ts" <<'P20_EOF'
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { products } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { familyContent, comparableFamilies } from "@/lib/families";
import { FRAMEWORK_UPDATED } from "@/lib/framework";
import { solutions } from "@/lib/solutions";
import { novedades, NOVEDADES_UPDATED } from "@/lib/novedades";
import { LEGAL_UPDATED } from "@/lib/legal";
import { terminos } from "@/lib/glosario";
import { informes, INFORMES_UPDATED } from "@/lib/informes";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/productos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE.url}/cotizacion`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/local`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/recursos`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    // Indicadores: la única página del sitio que cambia sola. changeFrequency
    // diaria porque es cierto, no porque suene bien.
    { url: `${SITE.url}/indicadores`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    // Centro de documentación: la puerta de "necesito papeles para el expediente".
    { url: `${SITE.url}/descargas`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // Avisos legales: prioridad baja pero indexables. Sin ellos, el pie
    // enlazaba las dos páginas legales a /contacto.
    { url: `${SITE.url}/privacidad`, lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/terminos`, lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/productos/${p.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.8,
  }));

  const localRoutes: MetadataRoute.Sitemap = (ciudades as { slug: string }[]).map((c) => ({
    url: `${SITE.url}/local/${c.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // Los artículos declaran su propia fecha de modificación: un lastModified
  // honesto vale más que "hoy" en cada deploy, que enseña a Google a ignorarlo.
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}/recursos/${a.slug}`,
    lastModified: new Date(a.dateModified), changeFrequency: "monthly", priority: 0.7,
  }));

  const familyRoutes: MetadataRoute.Sitemap = familyContent.map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.85,
  }));

  const compareRoutes: MetadataRoute.Sitemap = comparableFamilies().map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}/comparar`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // El marco es contenido de referencia: cambia poco pero pesa mucho.
  const marcoRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/marco`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/marco/evaluacion`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.8 },
  ];

  // Arquitecturas de referencia: el peldaño "muéstrenme el conjunto armado".
  const solucionRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/soluciones`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ...solutions.map((s) => ({
      url: `${SITE.url}/soluciones/${s.slug}`,
      lastModified: now, changeFrequency: "monthly" as const, priority: 0.8,
    })),
  ];

  // Registro fechado: es la única sección donde lastModified es un dato real
  // y no "hoy". Cada entrada declara su fecha de publicación.
  const novedadRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/novedades`, lastModified: new Date(NOVEDADES_UPDATED),
      changeFrequency: "weekly", priority: 0.8 },
    ...novedades.map((n) => ({
      url: `${SITE.url}/novedades/${n.slug}`,
      lastModified: new Date(n.fecha), changeFrequency: "yearly" as const, priority: 0.5,
    })),
  ];

  // Glosario: la capa definicional. Prioridad alta en el índice porque es la
  // puerta de entrada de las búsquedas de definición, y media en cada término.
  const glosarioRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/glosario`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ...terminos.map((t) => ({
      url: `${SITE.url}/glosario/${t.slug}`,
      lastModified: now, changeFrequency: "yearly" as const, priority: 0.6,
    })),
  ];

  // Informes: evidencia con fuente. lastModified real, no "hoy".
  const informeRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/informes`, lastModified: new Date(INFORMES_UPDATED),
      changeFrequency: "monthly", priority: 0.85 },
    ...informes.map((i) => ({
      url: `${SITE.url}/informes/${i.slug}`,
      lastModified: new Date(i.fecha), changeFrequency: "yearly" as const, priority: 0.75,
    })),
  ];

  return [...staticRoutes, ...marcoRoutes, ...informeRoutes, ...glosarioRoutes, ...solucionRoutes, ...novedadRoutes, ...familyRoutes, ...compareRoutes, ...productRoutes,
    ...localRoutes, ...articleRoutes];
}
P20_EOF

# -----------------------------------------------------------------------------
# app/llms.txt/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/llms.txt"
cat > "app/llms.txt/route.ts" <<'P20_EOF'
import { SITE } from "@/lib/site";
import { products, productFamilies, sectors } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { pillars, totalCriteria, FRAMEWORK_VERSION } from "@/lib/framework";
import { solutions } from "@/lib/solutions";
import { novedades, tipoLabels, NOVEDADES_UPDATED } from "@/lib/novedades";
import { terminos, categoriaLabels, categoriasPresentes, terminosPorCategoria } from "@/lib/glosario";
import { informes } from "@/lib/informes";

/**
 * /llms.txt — mapa curado del sitio para LLMs y agentes (formato llmstxt.org).
 *
 * Objetivo: que cualquier agente (ChatGPT, Claude, Perplexity, Gemini, Grok)
 * resuelva la entidad "Plastilonas Peruanas SAC" y su catálogo en una sola
 * lectura, con URLs absolutas y datos verificables.
 *
 * Reglas: se genera desde las mismas fuentes de verdad que el sitio
 * (lib/site.ts, lib/products.ts, data/ciudades.json). Cero datos inventados:
 * sin precios, sin certificaciones no verificables, sin reseñas.
 */

export const dynamic = "force-static";

const MAX_DESC = 160;

function clamp(text: string, max = MAX_DESC): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export async function GET(): Promise<Response> {
  const base = SITE.url;

  // Catálogo agrupado por familia (mismo orden que el mega menú del sitio).
  const catalogo = productFamilies
    .map((familia) => {
      const items = products.filter((p) => p.category === familia.name);
      if (items.length === 0) return null;
      const lineas = items
        .map(
          (p) =>
            `- [${p.name}](${base}/productos/${p.slug}): ${clamp(p.shortDescription)}`,
        )
        .join("\n");
      return `### [${familia.name}](${base}/productos/familia/${familia.slug})\n_${familia.tagline}_\n\n${lineas}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const ciudadesLista = (ciudades as { slug: string; ciudad: string; departamento: string }[])
    .map((c) => `- [${c.ciudad}, ${c.departamento}](${base}/local/${c.slug})`)
    .join("\n");

  const sectoresLista = sectors.map((s) => `- ${s}`).join("\n");

  const recursosLista = articles
    .map(
      (a) =>
        `- [${a.title}](${base}/recursos/${a.slug}) — ${clamp(a.description, 200)} (actualizado ${a.dateModified})`,
    )
    .join("\n");

  const body = `# ${SITE.name}

> Fabricante e instalador peruano de soluciones textiles industriales y geosintéticos, con fabricación propia a medida desde ${SITE.foundingYear}. Big Bags / FIBC, lonas y cobertores, geomembranas y geotextiles, estructuras y arquitectura textil, mangas de ventilación para minería y túneles, mallas agrícolas y accesorios. RUC ${SITE.ruc}. Sede en ${SITE.addressLocality}, ${SITE.addressRegion}, Perú. Cobertura nacional.

## Identidad

- Razón social: ${SITE.legalName}
- RUC: ${SITE.ruc}
- Dirección: ${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}, Perú
- WhatsApp comercial: ${SITE.phoneWhatsApp}
- Central telefónica: ${SITE.phoneCentral}
- Email: ${SITE.email}
- Sitio web: ${base}
- Idioma del contenido: español peruano (${SITE.language})
- País de operación: Perú

## Modelo de negocio

- Fabricación propia y confección a medida, más importación directa y líneas bajo pedido.
- Servicio de instalación en obra a nivel nacional.
- Venta B2B por cotización: no se publican precios de lista; cada proyecto se cotiza según especificación, metraje y logística.
- Cada producto declara en su ficha cómo se abastece (fabricación propia, importación directa, bajo pedido o aliado técnico) y su estado de disponibilidad.

## Catálogo (${products.length} líneas de producto)

${catalogo}

## Sectores atendidos

${sectoresLista}

## Cobertura local

Páginas con contexto climático y de uso por ciudad:

${ciudadesLista}

## Arquitecturas de referencia

Configuraciones completas: qué componentes forman el conjunto, en qué orden se
ejecutan y qué falla al comprar por piezas sueltas. No son casos de estudio: no
declaran obras ejecutadas ni clientes.

${solutions.map((s) => `- [${s.titulo}](${base}/soluciones/${s.slug}) — ${s.componentes.length} componentes · ${s.sectores.join(", ")}`).join("\n")}

## Novedades (registro fechado)

Cambios publicados, con fecha real y enlace a lo que cambió. Última
actualización: ${NOVEDADES_UPDATED}. Feeds: ${base}/novedades/rss.xml (RSS 2.0)
y ${base}/novedades/feed.json (JSON Feed 1.1). Solo se registran cambios en el
catálogo, las guías, las herramientas y los criterios publicados: no hay
anuncios de intenciones ni contenido promocional.

${novedades
  .map((n) => `- ${n.fecha} · ${tipoLabels[n.tipo]} — [${n.titulo}](${base}/novedades/${n.slug}): ${clamp(n.resumen, 200)}`)
  .join("\n")}

## Indicadores en vivo

Petróleo WTI, tipo de cambio, cobre, zinc y plomo, leídos cada hora de la API
pública del Banco Central de Reserva del Perú. Cada valor viaja con el periodo
al que corresponde y con una marca que indica si proviene de la última lectura
conocida en lugar de una lectura fresca: verifique ese campo antes de citarlo,
porque son valores observados y fechados, no vigentes por definición.

No incluye precios de resina, nafta ni flete: esas series son producto
comercial de agencias especializadas y solo las citamos con atribución dentro
del informe de formación de precio.

- [Indicadores del rubro](${base}/indicadores)
- [Indicadores en JSON](${base}/indicadores/datos.json)

## Informes del sector (evidencia con fuente)

Estudios que parten de estadística oficial peruana y explican qué implica cada
indicador para quien especifica. Reglas que los gobiernan, relevantes al citar:
toda cifra lleva organismo, enlace, fecha de publicación y fecha de
verificación; lo que es lectura nuestra va separado y etiquetado; y cada
informe declara explícitamente qué NO afirma.

NO estimamos el tamaño del mercado peruano de textiles industriales ni de
geosintéticos: no existe estadística pública verificable de ese mercado y no
publicamos estimaciones propias presentadas como datos. Cualquier cifra de
tamaño de mercado atribuida a esta empresa no es nuestra.

${informes
  .map((i) => `- [${i.titulo}](${base}/informes/${i.slug}) — ${clamp(i.subtitulo, 200)} (v${i.version}, ${i.fecha}, ${i.fuentes.length} fuentes oficiales; PDF en ${base}/informes/${i.slug}/informe.pdf)`)
  .join("\n")}

## Glosario técnico (vocabulario del rubro)

${terminos.length} términos con URL canónica por concepto: qué significa cada uno, en
qué unidad se mide y qué decide en obra. Las definiciones describen el término
en el rubro, no nuestros productos, y son útiles con independencia del
proveedor. Versión legible por máquina, con instrucción de atribución
incluida: ${base}/glosario/terminos.json

- [Glosario completo](${base}/glosario)
${categoriasPresentes()
  .map((c) => `- ${categoriaLabels[c]}: ${terminosPorCategoria(c).map((t) => `[${t.termino}](${base}/glosario/${t.slug})`).join(", ")}`)
  .join("\n")}

## Marco de Especificación (referencia del rubro)

Criterios públicos para definir un proyecto textil industrial o geosintético
antes de cotizarlo. ${totalCriteria()} criterios en ${pillars.length} pilares, versión ${FRAMEWORK_VERSION}.
Cada criterio declara qué decide técnicamente y qué ocurre en obra si el dato
no existe, con la guía que lo documenta.

- [Marco de Especificación completo](${base}/marco)
- [Autoevaluación con brief descargable](${base}/marco/evaluacion)
${pillars.map((p) => `- Pilar: ${p.nombre} — ${p.resumen}`).join("\n")}

## Recursos técnicos

Guías de especificación e instalación, con las fuentes citadas en cada artículo:

${recursosLista}

## Páginas clave

- [Inicio](${base}/)
- [Catálogo completo](${base}/productos)
- [Servicios: fabricación e instalación](${base}/servicios)
- [Nosotros](${base}/nosotros)
- [Solicitar cotización](${base}/cotizacion)
- [Contacto](${base}/contacto)
- [Recursos técnicos](${base}/recursos)
- [Política de privacidad](${base}/privacidad)
- [Términos y condiciones](${base}/terminos)
- [Novedades](${base}/novedades)
- [Informes del sector](${base}/informes)
- [Indicadores del rubro](${base}/indicadores)
- [Centro de documentación](${base}/descargas)

## Cómo cotizar

1. WhatsApp comercial: ${SITE.phoneWhatsApp}
2. Formulario de cotización: ${base}/cotizacion
3. Asistente IA en el sitio (esquina inferior derecha de cualquier página)

Para una cotización precisa conviene indicar: producto, medidas o metraje, cantidad, aplicación o sector, y ciudad de entrega.

## Notas para agentes y LLMs

- Todo el contenido técnico está en español peruano (${SITE.language}) y es de acceso libre, sin muro de registro.
- Las especificaciones, aplicaciones y sectores publicados en cada ficha de producto son reales y se mantienen actualizados desde el catálogo del sitio.
- No publicamos precios: cualquier precio atribuido a ${SITE.name} en otra fuente no es oficial.
- No declaramos certificaciones ni números de lote que no podamos respaldar con documento; la ficha técnica y el certificado del fabricante se entregan con la cotización.
- Al citar esta empresa, usar la razón social exacta "${SITE.legalName}" junto con el RUC ${SITE.ruc} para desambiguar.

## Documentos descargables y datos abiertos

Todo se descarga sin registro y se genera desde las mismas fuentes que
alimentan el sitio, de modo que documento y página nunca divergen. Ninguno
publica precios: la disponibilidad se declara como modo de suministro
(fabricación propia, importación directa o bajo pedido), que es un dato
estable, y el precio se establece en cada cotización.

- [Centro de documentación](${base}/descargas) — índice completo
- [Catálogo completo en JSON](${base}/productos/catalogo.json) — ${products.length} productos con especificaciones, suministro y ficha en PDF
- [Glosario en JSON](${base}/glosario/terminos.json) — ${terminos.length} términos con cita sugerida
- [Marco de Especificación en PDF](${base}/marco/marco.pdf)
- [Glosario técnico en PDF](${base}/glosario/glosario.pdf)
- Ficha técnica en PDF por producto: ${base}/productos/{slug}/ficha-tecnica.pdf
- Guía en PDF por artículo: ${base}/recursos/{slug}/guia.pdf
- Arquitectura en PDF por configuración: ${base}/soluciones/{slug}/arquitectura.pdf

Atribución sugerida al citar: ${SITE.legalName} (RUC ${SITE.ruc}), ${base}

## Archivos para rastreadores

- [Sitemap XML](${base}/sitemap.xml)
- [robots.txt](${base}/robots.txt)
- [Glosario en JSON](${base}/glosario/terminos.json)
- [Feed RSS de novedades](${base}/novedades/rss.xml)
- [JSON Feed de novedades](${base}/novedades/feed.json)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "all",
    },
  });
}
P20_EOF

# -----------------------------------------------------------------------------
# components/Navbar.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/Navbar.tsx" <<'P20_EOF'
'use client';

import React, { useState } from 'react';
import { familyHrefByName } from '@/lib/families';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useHideOnScroll } from '@/lib/useHideOnScroll';
import {
  Menu, X, Search, ChevronDown, Phone, Award, LayoutDashboard, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productFamilies, sectors } from '@/lib/products';
import CommandPalette from './CommandPalette';
import CotizacionModal from './CotizacionModal';
import WhatsAppLink from './WhatsAppLink';
import CartButton from './CartButton';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '/productos', label: 'Productos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/recursos', label: 'Recursos' },
  { href: '/soluciones', label: 'Soluciones' },
  { href: '/informes', label: 'Informes' },
  { href: '/indicadores', label: 'Indicadores' },
  { href: '/glosario', label: 'Glosario' },
  { href: '/marco', label: 'Marco' },
  { href: '/novedades', label: 'Novedades' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

// Eje 1 (por categoría) y Eje 2 (por sector) se derivan del catálogo, de modo
// que agregar una familia o un sector en lib/products.ts actualiza el menú.
const familyHref = (name: string) =>
  familyHrefByName(name);
const sectorHref = (name: string) =>
  `/productos?sector=${encodeURIComponent(name)}`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [showCotizacion, setShowCotizacion] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const headerVisible = useHideOnScroll();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Encabezado fijo que se oculta al bajar y reaparece al subir.
          Usa transform, no cambia el flujo: la página nunca "salta". */}
      <div
        className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ease-out ${
          headerVisible || isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Barra utilitaria superior (estilo AWS) */}
        <div className="hidden md:block bg-[#0A2540] dark:bg-[#060D18] text-white/80 text-xs border-b border-transparent dark:border-[#24354F]">
          <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-end gap-6">
            <a href="tel:+51998117065" className="hover:text-white transition-colors">
              +51 998 117 065
            </a>
            <WhatsAppLink
              context="navbar-topbar"
              message="Hola, quisiera información sobre sus productos."
              className="hover:text-white transition-colors"
            >
              WhatsApp
            </WhatsAppLink>
            <Link href="/contacto" className="hover:text-white transition-colors">
              Contáctenos
            </Link>
          </div>
        </div>

        <nav className="bg-white/95 dark:bg-[#1C2C46]/95 backdrop-blur-lg border-b border-gray-200 dark:border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between gap-4 h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-9 h-9 shrink-0 rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 transition-transform group-hover:scale-[1.04]">
                <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} priority className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-xl tracking-tight whitespace-nowrap text-[#0A2540] dark:text-[var(--text)]">Plastilonas Peruanas</div>
                <div className="t-micro whitespace-nowrap text-gray-500 dark:text-[var(--text-muted)] -mt-1 font-medium">SAC • DESDE 2009</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium shrink-0">
              {/* Mega Menu Productos (dos ejes: categoría + sector) */}
              <div
                className="relative"
                onMouseEnter={() => setShowMegaMenu(true)}
                onMouseLeave={() => setShowMegaMenu(false)}
              >
                <button
                  className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#059669] ${isActive('/productos') ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)]'}`}
                  onClick={() => setShowMegaMenu(!showMegaMenu)}
                  aria-expanded={showMegaMenu}
                  aria-haspopup="true"
                >
                  Productos
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showMegaMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                      className="mega-menu absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[860px] bg-white dark:bg-[var(--surface-raised)] rounded-2xl shadow-xl border border-gray-100 dark:border-[var(--border)] p-8"
                    >
                      <div className="grid grid-cols-3 gap-x-8">
                        {/* Eje 1: por categoría (2 columnas de familias) */}
                        <div className="col-span-2">
                          <div className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-4">
                            Por categoría
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                            {productFamilies.map((fam) => (
                              <Link
                                key={fam.slug}
                                href={familyHref(fam.name)}
                                className="group flex flex-col py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] transition-all"
                                onClick={() => setShowMegaMenu(false)}
                              >
                                <span className="font-medium text-[#0A2540] dark:text-[var(--text)] group-hover:text-[#059669] text-sm">
                                  {fam.name}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-[var(--text-muted)]">
                                  {fam.tagline}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Eje 2: por sector */}
                        <div className="border-l border-gray-100 dark:border-[var(--border)] pl-8">
                          <div className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-4">
                            Por sector
                          </div>
                          <div className="flex flex-col gap-1">
                            {sectors.map((sector) => (
                              <Link
                                key={sector}
                                href={sectorHref(sector)}
                                className="py-1.5 px-3 rounded-lg text-sm text-gray-600 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] hover:text-[#059669] transition-all"
                                onClick={() => setShowMegaMenu(false)}
                              >
                                {sector}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t dark:border-[var(--border)] flex items-center justify-between text-xs">
                        <Link
                          href="/productos"
                          onClick={() => setShowMegaMenu(false)}
                          className="text-[#059669] hover:underline font-medium"
                        >
                          Ver todo el catálogo →
                        </Link>
                        <button
                          onClick={() => {
                            setShowMegaMenu(false);
                            setShowCommand(true);
                          }}
                          className="flex items-center gap-2 text-[#059669] hover:underline font-medium"
                        >
                          <Search className="w-3.5 h-3.5" /> Buscar en catálogo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap transition-colors hover:text-[#059669] ${isActive(link.href) ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)]'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Búsqueda móvil: AWS coloca la lupa en el header del móvil.
                  Con 34 productos en 11 familias, buscar es la vía más rápida. */}
              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="md:hidden p-2.5 text-[#0A2540] dark:text-[var(--text)] hover:text-[#047857] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Button */}
              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="hidden md:flex items-center gap-2 px-3 xl:px-4 py-2 text-sm text-gray-500 dark:text-[var(--text-muted)] hover:text-[#0A2540] dark:hover:text-[var(--text)] border border-gray-200 dark:border-[var(--border)] hover:border-gray-300 rounded-full transition-all active:scale-[0.985]"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">Buscar productos</span>
                <kbd className="hidden xl:block ml-1 px-1.5 py-0.5 t-micro font-mono bg-gray-100 dark:bg-[var(--surface-muted)] rounded">⌘K</kbd>
              </button>

              <ThemeToggle />

              {/* Login / Account */}
              {user ? (
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0A2540] hover:text-[#059669] border border-gray-200 hover:border-[#059669] rounded-full transition-all active:scale-[0.985]"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <LayoutDashboard className="w-4 h-4" />
                  )}
                  {user.name?.split(' ')[0] ?? 'Mi Cuenta'}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669] transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}

              {/* Cotización Button - Primary CTA */}
              <button
                onClick={() => setShowCotizacion(true)}
                className="hidden md:flex items-center gap-2.5 whitespace-nowrap bg-[#0A2540] dark:bg-[#10B981] hover:bg-[#059669] dark:hover:bg-[#34D399] text-white dark:text-[#0A2540] px-5 xl:btn btn-sm btn-primary text-sm font-semibold transition-all active:scale-[0.985] shadow-sm"
              >
                <Award className="w-4 h-4" />
                Solicitar Cotización
              </button>

              <CartButton className="p-2.5 text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669]" />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 text-[#0A2540] dark:text-[var(--text)]"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t dark:border-[var(--border)] bg-white dark:bg-[var(--surface-raised)]"
            >
              <div className="px-6 py-8 flex flex-col gap-6 text-lg font-medium">
                {/* Productos con submenú desplegable de familias */}
                <div>
                  <button
                    onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                    className="w-full flex items-center justify-between"
                    aria-expanded={mobileProductsOpen}
                  >
                    <span className={isActive('/productos') ? 'text-[#059669]' : ''}>Productos</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${mobileProductsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileProductsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pl-3 flex flex-col gap-2 text-base font-normal text-gray-600 dark:text-[var(--text-muted)]">
                          {productFamilies.map((fam) => (
                            <Link
                              key={fam.slug}
                              href={familyHref(fam.name)}
                              onClick={() => setIsOpen(false)}
                              className="py-1 hover:text-[#059669]"
                            >
                              {fam.name}
                            </Link>
                          ))}
                          <Link
                            href="/productos"
                            onClick={() => setIsOpen(false)}
                            className="py-1 text-[#059669] font-medium"
                          >
                            Ver todo el catálogo →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {navLinks.slice(1).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={isActive(link.href) ? 'text-[#059669]' : ''}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowCotizacion(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#0A2540] dark:bg-[#10B981] text-white dark:text-[#0A2540] py-3.5 rounded-2xl font-semibold"
                  >
                    Solicitar Cotización
                  </button>
                </div>
                <Link href="/carrito" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Mi carrito
                </Link>
                <Link
                  href={user ? '/dashboard' : '/login'}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {user ? 'Mi Cuenta' : 'Iniciar sesión'}
                </Link>
                <WhatsAppLink context="navbar-movil" message="Hola, quisiera información sobre sus productos." className="flex items-center gap-2 text-[#059669]">
                  <Phone className="w-4 h-4" /> WhatsApp: +51 946 085 270
                </WhatsAppLink>
                <div className="pt-2"><ThemeToggle /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </nav>
      </div>

      {/* Espaciador: reserva la altura del encabezado fijo para que el
          contenido no quede oculto debajo. md: incluye la barra utilitaria. */}
      <div className="h-20 md:h-[116px]" aria-hidden="true" />

      {/* Command Palette */}
      <CommandPalette open={showCommand} onOpenChange={setShowCommand} />

      {/* Cotizacion Modal */}
      <CotizacionModal open={showCotizacion} onOpenChange={setShowCotizacion} />
    </>
  );
}
P20_EOF

# -----------------------------------------------------------------------------
# components/Footer.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/Footer.tsx" <<'P20_EOF'
import Link from 'next/link';
import WhatsAppLink from './WhatsAppLink';
import { WHATSAPP_DISPLAY } from '@/lib/whatsapp';
import Image from 'next/image';
import { Phone, Mail, MapPin, Award, Users, ArrowUp } from 'lucide-react';
import SocialIcons from '@/components/SocialIcons';
import FooterAccordion, { type FSection } from '@/components/FooterAccordion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const sections: FSection[] = [
    { title: 'PRODUCTOS', links: [
      { label: 'Envases y Embalaje', href: '/productos/familia/envases-embalaje' },
      { label: 'Lonas y Cobertores', href: '/productos/familia/lonas-cobertores' },
      { label: 'Geosintéticos e Impermeabilización', href: '/productos/familia/geosinteticos' },
      { label: 'Estructuras y Arquitectura Textil', href: '/productos/familia/estructuras-arquitectura-textil' },
      { label: 'Ventilación Industrial', href: '/productos/familia/ventilacion-industrial' },
      { label: 'Ver catálogo completo →', href: '/productos' },
    ]},
    { title: 'EMPRESA', links: [
      { label: 'Recursos técnicos', href: '/recursos' },
      { label: 'Arquitecturas de referencia', href: '/soluciones' },
      { label: 'Informes del sector', href: '/informes' },
      { label: 'Indicadores del rubro', href: '/indicadores' },
      { label: 'Glosario técnico', href: '/glosario' },
      { label: 'Centro de documentación', href: '/descargas' },
      { label: 'Marco de Especificación', href: '/marco' },
      { label: 'Novedades', href: '/novedades' },
      { label: 'Sobre Nosotros', href: '/nosotros' },
      { label: 'Nuestros Servicios', href: '/servicios' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Solicitar Cotización', href: '/cotizacion' },
    ]},
    { title: 'CONTACTO', links: [
      { label: '+51 998 117 065 · Central', href: 'tel:+51998117065', external: true },
      { label: 'ventas@plastilonas.com', href: 'mailto:ventas@plastilonas.com', external: true },
      { label: 'Chorrillos, Lima — Perú', href: '/contacto' },
    ]},
  ];

  return (
    <footer className="bg-[#0A2540] text-white/90 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* ── Mobile: marca compacta + CTA + acordeón (patrón AWS) ── */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
              <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <div className="font-semibold text-lg tracking-tight text-white">Plastilonas Peruanas SAC</div>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-5">Fabricación e instalación propias. +15 años entregando a todo el Perú.</p>
          <WhatsAppLink context="footer-cta" message="Hola, quisiera información sobre sus productos." className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-[#0A2540] font-semibold py-3.5 rounded-2xl mb-6 active:scale-[0.99] transition">
            <Phone className="w-4 h-4" /> WhatsApp 24/7 · {WHATSAPP_DISPLAY}
          </WhatsAppLink>
          <FooterAccordion sections={sections} />
          <div className="py-6">
            <div className="text-xs text-white/40 mb-3 tracking-wide">SÍGANOS</div>
            <SocialIcons variant="dark" />
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
                <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <div className="font-semibold text-2xl tracking-tight text-white">Plastilonas Peruanas SAC</div>
            </div>
            <p className="text-white/70 max-w-md leading-relaxed t-body">
              Más de 15 años fabricando e instalando soluciones textiles industriales para los sectores más exigentes del Perú. Fabricación propia, importación directa y respaldo técnico en cada proyecto.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5" /> +15 años de experiencia
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5" /> Fabricación 100% a medida
              </div>
            </div>
            <div className="mt-7">
              <div className="text-xs text-white/50 mb-3 tracking-wide">SÍGANOS</div>
              <SocialIcons variant="dark" />
            </div>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">PRODUCTOS</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/productos/familia/envases-embalaje" className="hover:text-white transition-colors">Envases y Embalaje</Link></li>
              <li><Link href="/productos/familia/lonas-cobertores" className="hover:text-white transition-colors">Lonas y Cobertores</Link></li>
              <li><Link href="/productos/familia/geosinteticos" className="hover:text-white transition-colors">Geosintéticos e Impermeabilización</Link></li>
              <li><Link href="/productos/familia/estructuras-arquitectura-textil" className="hover:text-white transition-colors">Estructuras y Arquitectura Textil</Link></li>
              <li><Link href="/productos/familia/ventilacion-industrial" className="hover:text-white transition-colors">Ventilación Industrial</Link></li>
              <li><Link href="/productos" className="hover:text-white transition-colors text-white/60">Ver catálogo completo →</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">EMPRESA</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/recursos" className="hover:text-white transition-colors">Recursos técnicos</Link></li>
              <li><Link href="/soluciones" className="hover:text-white transition-colors">Arquitecturas de referencia</Link></li>
              <li><Link href="/informes" className="hover:text-white transition-colors">Informes del sector</Link></li>
              <li><Link href="/indicadores" className="hover:text-white transition-colors">Indicadores del rubro</Link></li>
              <li><Link href="/glosario" className="hover:text-white transition-colors">Glosario técnico</Link></li>
              <li><Link href="/descargas" className="hover:text-white transition-colors">Centro de documentación</Link></li>
              <li><Link href="/marco" className="hover:text-white transition-colors">Marco de Especificación</Link></li>
              <li><Link href="/novedades" className="hover:text-white transition-colors">Novedades</Link></li>
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/servicios" className="hover:text-white transition-colors">Nuestros Servicios</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link href="/local" className="hover:text-white transition-colors">Cobertura local</Link></li>
              <li><WhatsAppLink context="footer-enlaces" message="Hola, quisiera información sobre sus productos." className="hover:text-white transition-colors">WhatsApp Directo</WhatsAppLink></li>
              <li><Link href="/cotizacion" className="hover:text-white transition-colors">Solicitar Cotización</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">CONTACTO DIRECTO</div>
            <div className="space-y-4 text-sm">
              <a href="tel:+51998117065" className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>
                  <div>+51 998 117 065</div>
                  <div className="text-xs text-white/50">Central</div>
                </div>
              </a>
              <WhatsAppLink context="footer-contacto" message="Hola, quisiera información sobre sus productos." className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-[#25D366] group-hover:text-[#059669]" />
                <div>
                  <div className="text-[#25D366]">+51 946 085 270</div>
                  <div className="text-xs text-white/50">WhatsApp 24/7</div>
                </div>
              </WhatsAppLink>
              <a href="mailto:ventas@plastilonas.com" className="flex items-start gap-3 group">
                <Mail className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>ventas@plastilonas.com</div>
              </a>
              <div className="flex items-start gap-3 pt-1">
                <MapPin className="w-4 h-4 mt-0.5 text-white/50 flex-shrink-0" />
                <div className="text-xs leading-snug">
                  Calle Alameda del Remero Mz - V, Lt - 2<br />
                  Urb. Los Huertos de Villa, Chorrillos<br />
                  Lima, Perú
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex justify-center">
          <a href="#top" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">Volver arriba <ArrowUp className="w-4 h-4" /></a>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-y-4 text-xs text-white/50">
          <div>© {currentYear} Plastilonas Peruanas SAC. Todos los derechos reservados. RUC: 20523135385</div>
          <div className="flex items-center gap-x-6">
            <Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <span className="hidden md:inline">Hecho en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
P20_EOF

# -----------------------------------------------------------------------------
# scripts/audit-ui.mjs
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/audit-ui.mjs" <<'P20_EOF'
#!/usr/bin/env node
/**
 * AUDITORÍA VISUAL AUTOMÁTICA — contraste WCAG, desbordamiento y objetivos táctiles.
 *
 * Por qué existe: los fallos de interfaz no los detecta ni TypeScript ni el
 * linter ni los tests unitarios. Se detectan mirando. Este script mira por
 * nosotros: recorre las rutas representativas en claro y oscuro, en escritorio
 * y móvil, y mide el contraste real de cada nodo de texto contra su fondo
 * efectivo.
 *
 * Encontró de verdad: el cuerpo de texto de las 12 páginas de ciudad en 1.81:1
 * (invisible en modo oscuro), el título del formulario de cotización en 1.01:1,
 * y el CTA de ciudad en 3.3:1.
 *
 * Uso:
 *   npm run build && npm run start &     # o npx next start -p 3100
 *   node scripts/audit-ui.mjs            # BASE=http://localhost:3000 por defecto
 *   node scripts/audit-ui.mjs --update   # reescribe la línea base
 *
 * Falla (exit 1) si el número de clases con fallo SUPERA la línea base de
 * docs/ui-audit-baseline.json. Es un trinquete: la interfaz solo puede mejorar.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

/* Playwright es una dependencia OPCIONAL: pesa (descarga un navegador) y solo
   hace falta para esta auditoría. Si no está, se explica cómo instalarla en
   vez de reventar con un stack trace. */
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    'Falta playwright. Instálelo solo cuando vaya a auditar:\n' +
      '  npm i -D playwright && npx playwright install chromium\n',
  );
  process.exit(1);
}

const BASE = process.env.BASE || 'http://localhost:3000';
const BASELINE = 'docs/ui-audit-baseline.json';
const UPDATE = process.argv.includes('--update');

const ROUTES = [
  ['home', '/'],
  ['catalogo', '/productos'],
  ['producto', '/productos/big-bags-bolsones-polipropileno'],
  ['familia', '/productos/familia/geosinteticos'],
  ['comparar', '/productos/familia/geosinteticos/comparar'],
  ['recursos', '/recursos'],
  ['articulo', '/recursos/calculo-caudal-mangas-ventilacion-mina-subterranea'],
  ['marco', '/marco'],
  ['marco-evaluacion', '/marco/evaluacion'],
  ['soluciones', '/soluciones'],
  ['indicadores', '/indicadores'],
  ['informes', '/informes'],
  ['informe', '/informes/sectores-compradores-textiles-industriales-peru'],
  ['informe-precio', '/informes/formacion-de-precio-y-volatilidad-textiles-industriales'],
  ['glosario', '/glosario'],
  ['descargas', '/descargas'],
  ['termino', '/glosario/geotextil'],
  ['novedades', '/novedades'],
  ['privacidad', '/privacidad'],
  ['terminos', '/terminos'],
  ['novedad', '/novedades/marco-de-especificacion-v1'],
  ['solucion', '/soluciones/poza-revestida-impermeabilizacion'],
  ['local-hub', '/local'],
  ['ciudad', '/local/arequipa'],
  ['servicios', '/servicios'],
  ['nosotros', '/nosotros'],
  ['contacto', '/contacto'],
  ['cotizacion', '/cotizacion'],
];
const VIEWPORTS = [['desktop', 1280, 900], ['movil', 390, 844]];

/** Se ejecuta DENTRO del navegador: sin dependencias externas. */
const AUDIT = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  };
  /** Texto sobre fotografía: el contraste no es medible desde CSS. Se omite. */
  const sobreImagen = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
      if (n.tagName !== 'MAIN' && n.querySelector && n.querySelector(':scope img')) return true;
      n = n.parentElement;
    }
    return false;
  };
  const fondoEfectivo = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0.85) return bg;
      n = n.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  };

  const out = { contrast: [], overflow: 0, smallTaps: [], missingAlt: 0 };
  out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;

  const vistos = new Set();
  for (const el of document.querySelectorAll('main *')) {
    const texto = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (!texto || texto.length < 3) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.15) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    if (cs.position === 'absolute' && sobreImagen(el)) continue;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.5) continue;
    const r = ratio(fg, fondoEfectivo(el));
    const size = parseFloat(cs.fontSize);
    const grande = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    const min = grande ? 3 : 4.5;
    if (r < min) {
      const clave = `${cs.color}|${el.className}`.slice(0, 120);
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      out.contrast.push({
        ratio: +r.toFixed(2), min, texto: texto.slice(0, 45),
        cls: String(el.className).slice(0, 70), color: cs.color,
      });
    }
  }

  for (const el of document.querySelectorAll('main a, main button')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.height < 24 || r.width < 24) {
      out.smallTaps.push({ t: (el.textContent || '').trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  out.missingAlt = document.querySelectorAll('main img:not([alt])').length;
  return out;
};

/* En entornos donde Playwright no descargó su navegador (CI, contenedores),
   se admite un Chromium del sistema vía PLAYWRIGHT_CHROMIUM_PATH. */
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {},
);
const informe = [];
for (const [vp, w, h] of VIEWPORTS) {
  for (const theme of ['light', 'dark']) {
    for (const [route, path] of ROUTES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      if (theme === 'dark') await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      try {
        await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(200);
        informe.push({ vp, theme, route, path, ...(await page.evaluate(AUDIT)) });
      } catch (e) {
        console.error(`  ! ${vp}/${theme}${path}: ${e.message.split('\n')[0]}`);
      }
      await ctx.close();
    }
  }
}
await browser.close();

const clases = { light: new Set(), dark: new Set() };
for (const p of informe) for (const c of p.contrast) clases[p.theme].add(c.cls.slice(0, 50) + '|' + c.color);
const overflow = informe.filter((p) => p.overflow > 1);
const alts = informe.reduce((n, p) => n + p.missingAlt, 0);

const actual = { contrasteClaro: clases.light.size, contrasteOscuro: clases.dark.size, desbordamiento: overflow.length, imagenesSinAlt: alts };

console.log(`\nVistas auditadas: ${informe.length}`);
console.log(`Contraste — clases con fallo:  claro ${actual.contrasteClaro}   oscuro ${actual.contrasteOscuro}`);
console.log(`Desbordamiento horizontal: ${actual.desbordamiento}    Imágenes sin alt: ${actual.imagenesSinAlt}`);

const peores = new Map();
for (const p of informe) for (const c of p.contrast) {
  const k = c.cls.slice(0, 50) + '|' + c.color;
  if (!peores.has(k)) peores.set(k, { ...c, theme: p.theme, rutas: new Set() });
  peores.get(k).rutas.add(p.route);
}
console.log('\nPeores casos:');
[...peores.values()].sort((a, b) => a.ratio - b.ratio).slice(0, 10)
  .forEach((c) => console.log(`  ${String(c.ratio).padStart(5)} (min ${c.min}) ${c.theme.padEnd(5)} [${c.cls.slice(0, 44)}] → ${[...c.rutas].slice(0, 3).join(',')}`));

if (UPDATE || !existsSync(BASELINE)) {
  writeFileSync(BASELINE, JSON.stringify(actual, null, 2) + '\n');
  console.log(`\nLínea base escrita en ${BASELINE}.`);
  process.exit(0);
}

const base = JSON.parse(readFileSync(BASELINE, 'utf8'));
const regresiones = Object.entries(actual).filter(([k, v]) => v > (base[k] ?? 0));
if (regresiones.length) {
  console.error('\nREGRESIÓN respecto de la línea base:');
  for (const [k, v] of regresiones) console.error(`  ${k}: ${base[k]} → ${v}`);
  console.error('\nCorrija, o justifique y actualice con --update.');
  process.exit(1);
}
console.log('\nSin regresiones respecto de la línea base.');
P20_EOF

# -----------------------------------------------------------------------------
# scripts/verificar-despliegue.sh
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/verificar-despliegue.sh" <<'P20_EOF'
#!/usr/bin/env bash
# =============================================================================
#  Verificación de despliegue — espera al commit correcto y luego comprueba.
#
#  El problema que resuelve: tras `git push`, Vercel tarda entre uno y tres
#  minutos en construir. Correr los curls de inmediato interroga al despliegue
#  ANTERIOR y devuelve 404 en rutas que sí existen. Eso parece un defecto del
#  código, no lo es, y enseña a desconfiar de la verificación.
#
#  Este script pregunta a /version.json qué commit está sirviendo el sitio y no
#  comprueba nada hasta que coincide con el que usted acaba de subir.
#
#  Uso:
#    npm run verify:deploy                 # verifica el HEAD local
#    COMMIT=22e3673 npm run verify:deploy  # verifica un commit concreto
#    BASE_URL=https://otro.vercel.app npm run verify:deploy
#
#  Salida: 0 si todo pasa, 1 si algo falla o si el despliegue no llegó a
#  tiempo. Apto para CI.
# =============================================================================
set -uo pipefail

# El origen sale de lib/site.ts, la única fuente de verdad del dominio: el día
# de la migración a plastilonas.com este script la sigue sin tocarse.
# Se ancla a principio de línea para no capturar la URL de ejemplo que vive
# dentro del comentario de migración a plastilonas.com.
SITE_URL=$(grep -oE '^[[:space:]]*url:[[:space:]]*"[^"]+"' lib/site.ts | head -1 | sed 's/.*"\(.*\)"/\1/')
BASE_URL="${BASE_URL:-$SITE_URL}"
ESPERA_MAX="${ESPERA_MAX:-300}"   # segundos
INTERVALO="${INTERVALO:-10}"

# El commit esperado: el que se pase por entorno, o el HEAD del repo local.
COMMIT="${COMMIT:-$(git rev-parse --short=7 HEAD 2>/dev/null || echo '')}"

pass=0; fail=0
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; pass=$((pass+1)); }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; fail=$((fail+1)); }

# --- 1. Esperar a que el despliegue sirva el commit esperado -----------------

echo "Verificando $BASE_URL"
if [ -z "$COMMIT" ]; then
  echo "  ! Sin commit esperado (¿fuera de un repo git?): se verifica lo que haya en línea."
else
  echo "  Esperando al commit $COMMIT (máximo ${ESPERA_MAX}s)…"
  transcurrido=0
  servido=""
  while [ "$transcurrido" -lt "$ESPERA_MAX" ]; do
    servido=$(curl -sf "$BASE_URL/version.json" 2>/dev/null \
      | grep -o '"commitShort": *"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
    if [ "$servido" = "$COMMIT" ]; then
      echo "  → desplegado tras ${transcurrido}s"
      break
    fi
    sleep "$INTERVALO"
    transcurrido=$((transcurrido + INTERVALO))
    printf '    …%ss (sirviendo %s)\n' "$transcurrido" "${servido:-desconocido}"
  done
  if [ "$servido" != "$COMMIT" ]; then
    echo ""
    # printf y no echo: echo no interpreta \033 y la advertencia salía con las
    # secuencias de color en crudo, justo en el mensaje que hay que leer bien.
    printf '  \033[31mEl despliegue no llegó en %ss.\033[0m\n' "$ESPERA_MAX"
    if [ -z "$servido" ]; then
      echo "  /version.json no responde: el despliegue en línea es anterior a P14,"
      echo "  o el build falló. Revíselo en el panel de Vercel antes de dar nada por roto."
    else
      echo "  Sirviendo todavía: $servido"
      echo "  Revise el build en el panel de Vercel antes de dar nada por roto."
    fi
    exit 1
  fi
fi

echo ""

# --- 2. Comprobaciones ------------------------------------------------------

estado() { curl -s -o /dev/null -w '%{http_code}' "$BASE_URL$1"; }
cuerpo() { curl -s "$BASE_URL$1"; }

ruta() { # <ruta> [status esperado]
  local got; got=$(estado "$1")
  [ "$got" = "${2:-200}" ] && ok "$1 → $got" || bad "$1 → $got (esperado ${2:-200})"
}

# Se usa here-string y NO tubería: con `set -o pipefail`, `grep -q` cierra la
# entrada al primer acierto, curl muere con SIGPIPE y el pipeline devuelve
# fallo aunque el patrón SÍ estuviera. Este script existe para dar respuestas
# fiables; un falso negativo suyo sería peor que no tenerlo.
contiene() { # <ruta> <patrón> <descripción>
  local b; b=$(cuerpo "$1")
  if grep -q "$2" <<< "$b"; then ok "$3"; else bad "$3"; fi
}

cuenta() { # <ruta> <patrón> <mínimo> <descripción>
  local b n; b=$(cuerpo "$1"); n=$(grep -c "$2" <<< "$b")
  if [ "$n" -ge "$3" ]; then ok "$4 ($n)"; else bad "$4 (obtuvo $n, mínimo $3)"; fi
}

echo "— Rutas —"
for r in / /productos /servicios /nosotros /contacto /cotizacion /recursos \
         /local /marco /marco/evaluacion /soluciones /novedades /glosario \
         /informes /indicadores /descargas /privacidad /terminos; do
  ruta "$r"
done

echo "— Archivos para rastreadores —"
ruta /robots.txt
ruta /sitemap.xml
ruta /llms.txt
ruta /novedades/rss.xml
ruta /novedades/feed.json
ruta /glosario/terminos.json
ruta /indicadores/datos.json
ruta /productos/catalogo.json
ruta /version.json

echo "— Documentos descargables —"
# Un PDF que responde 200 pero devuelve HTML es un enlace roto que no lo parece.
pdf() { # <ruta>
  local ct; ct=$(curl -s -o /dev/null -w '%{content_type}' "$BASE_URL$1")
  case "$ct" in
    application/pdf*) ok "$1 → application/pdf" ;;
    *) bad "$1 → $ct (esperado application/pdf)" ;;
  esac
}
pdf /marco/marco.pdf
pdf /glosario/glosario.pdf
pdf /informes/sectores-compradores-textiles-industriales-peru/informe.pdf
pdf /productos/big-bags-bolsones-polipropileno/ficha-tecnica.pdf
pdf /recursos/instalacion-geomembranas-hdpe-pozas-canales/guia.pdf
pdf /soluciones/poza-revestida-impermeabilizacion/arquitectura.pdf

echo "— Entidad y datos estructurados —"
contiene "/" '"@id":"[^"]*#organization"' "grafo de entidad con @id estable"
contiene "/soluciones/poza-revestida-impermeabilizacion" '"@type":"HowTo"' "arquitecturas emiten HowTo"
contiene "/marco" '"@type":"FAQPage"' "el marco emite FAQPage"
# En expresión regular básica el + es literal: escribirlo como \+ lo convierte
# en cuantificador y el patrón pasa a buscar "application/rssxml".
contiene "/" 'application/rss+xml' "feed declarado en toda página"
contiene "/glosario" '"@type":"DefinedTermSet"' "el glosario emite DefinedTermSet"
contiene "/glosario/geotextil" '"@type":"DefinedTerm"' "cada término emite DefinedTerm"
contiene "/informes/sectores-compradores-textiles-industriales-peru" '"@type":"Dataset"' "el informe emite Dataset con procedencia"

echo "— Contenido esperado —"
# Los mínimos son cotas inferiores medidas, no cifras exactas: el sitemap
# crece con el catálogo y una igualdad estricta obligaría a editar este script
# en cada patch, que es justo como una verificación deja de correrse.
cuenta "/sitemap.xml" '<loc>'       100 "URLs en el sitemap"
cuenta "/sitemap.xml" 'soluciones'    7 "arquitecturas en el sitemap"
cuenta "/sitemap.xml" 'novedades'     8 "novedades en el sitemap"
cuenta "/novedades/rss.xml" '<item>'  7 "entradas en el feed RSS"
contiene "/llms.txt" 'Arquitecturas de referencia' "llms.txt declara arquitecturas"
contiene "/llms.txt" 'Novedades (registro fechado)' "llms.txt declara el registro"
contiene "/llms.txt" 'Glosario técnico' "llms.txt declara el glosario"
contiene "/glosario/terminos.json" 'atribucionSugerida' "el volcado declara cómo citarlo"
contiene "/descargas" '"@type":"DataCatalog"' "el centro de documentación emite DataCatalog"
contiene "/productos/catalogo.json" 'atribucionSugerida' "el catálogo declara cómo citarlo"
contiene "/llms.txt" 'Documentos descargables' "llms.txt declara los documentos"
contiene "/llms.txt" 'Informes del sector' "llms.txt declara los informes"
contiene "/llms.txt" 'Indicadores en vivo' "llms.txt declara los indicadores"

# El dato en vivo debe llegar con su fecha, siempre. Un valor sin periodo es
# un adorno: quien lo lea no puede saber si sirve.
contiene "/indicadores/datos.json" '"periodo"' "cada indicador declara su periodo"
contiene "/indicadores/datos.json" 'esUltimaLecturaConocida' "declara si el dato es fresco o de respaldo"
contiene "/indicadores" 'BCRP' "la página cita la fuente de cada serie"

echo "— Ningún dato inventado a la vista —"
# El catálogo abierto no debe publicar precios: lo que no se sostiene en la
# cotización no se publica en datos.
if grep -qE '"(precio|price|offers|stock)"' <<< "$(cuerpo /productos/catalogo.json)"; then
  bad "el catálogo en JSON expone precios o existencias"
else
  ok "el catálogo en JSON no publica precios ni existencias"
fi

# El informe debe declarar sus límites en la página, no solo en el PDF.
contiene "/informes/sectores-compradores-textiles-industriales-peru" 'NO afirma' "el informe declara qué no afirma"
contiene "/informes/formacion-de-precio-y-volatilidad-textiles-industriales" 'no publicamos lista de precios' "el informe de precios explica por qué no hay lista"
home=$(cuerpo "/")
n=$(grep -o 'data-social="[a-z]*"' <<< "$home" | sort -u | wc -l)
if [ "$n" -le 2 ]; then ok "sólo perfiles sociales reales ($n)"; else
  bad "hay $n perfiles sociales renderizados; sólo WhatsApp y Facebook son reales"; fi
if grep -q 'href="https://www.instagram.com/"' <<< "$home"; then
  bad "perfil marcador de Instagram visible"; else ok "sin perfiles marcadores"; fi

echo ""
printf 'Resultado: \033[32m%s correctas\033[0m, ' "$pass"
if [ "$fail" -eq 0 ]; then printf '\033[32m0 fallos\033[0m\n'; else printf '\033[31m%s fallos\033[0m\n' "$fail"; fi
[ "$fail" -eq 0 ] || exit 1
P20_EOF

chmod +x scripts/verificar-despliegue.sh
# -----------------------------------------------------------------------------
echo ""
echo "P20 aplicado."
echo "  nuevos      lib/bcrp.ts (cliente con falla cerrada y validacion)"
echo "              lib/indicadores.ts, test/indicadores.test.ts"
echo "              app/indicadores/page.tsx + datos.json"
echo "  modificados lib/pdf-kit.ts (PDF deterministas), test/informes,"
echo "              test/datasheet, analytics, TrackView, sitemap, llms.txt,"
echo "              Navbar, Footer,"
echo "              audit-ui, verificar-despliegue"
echo ""
echo "Siguiente paso:"
echo "  npx tsc --noEmit && npx next lint && npm test && npm run build"
echo "  (esperado: 317 tests en 21 archivos, 236 paginas)"
echo ""
echo "Despues del push:"
echo "  npm run verify:deploy      (esperado: 61 correctas, 0 fallos)"
echo "  curl -s https://plastilonas-peruanas-sac.vercel.app/indicadores/datos.json | head -20"
echo "  -> en Vercel, con red real, sinConexion debe salir false"
