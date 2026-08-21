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
