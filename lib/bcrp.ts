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
