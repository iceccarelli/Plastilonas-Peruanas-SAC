import { SITE } from '@/lib/site';
import {
  clusters,
  terminosDe,
  intenciones,
  idiomaDe,
  TOPIC_MAP_VERSION,
  TOPIC_MAP_REVISADO,
  TOTAL_TERMINOS,
  TOTAL_PREGUNTAS,
} from '@/lib/search/topic-map';
import { CONSULTAS_DINERO, consultasDeCluster } from '@/lib/consultas-dinero';

/**
 * /mapa-consultas.json — la tabla de decisión del sitio, legible por máquina.
 *
 * POR QUÉ NO VIVE EN /api/. robots.txt prohíbe rastrear /api/ entera, y con
 * razón: ahí están los endpoints de carrito, pago y sesión. Este archivo es lo
 * contrario de eso —existe precisamente para ser rastreado— así que vive en la
 * raíz, como sitemap.xml y llms.txt.
 *
 * QUÉ CONTIENE. Para cada clúster de consulta: el término, sus variantes reales
 * y sus erratas, la URL absoluta ÚNICA que lo contesta, las preguntas
 * conversacionales que esa página responde y las páginas que la refuerzan.
 * Absolutas y no relativas porque un agente que copia esto a su índice no
 * siempre conserva de dónde lo sacó.
 *
 * QUÉ NO CONTIENE: precios, plazos, certificados propios ni recuentos de obra.
 * Nada de eso existe en este repositorio, y un endpoint abierto es el peor
 * sitio para empezar a inventarlo.
 */

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  const base = SITE.url;

  const cuerpo = {
    entidad: {
      nombre: SITE.legalName,
      ruc: SITE.ruc,
      sitio: base,
      idioma: SITE.language,
      pais: 'PE',
    },
    version: TOPIC_MAP_VERSION,
    revisado: TOPIC_MAP_REVISADO,
    totales: {
      clusters: clusters.length,
      terminos: TOTAL_TERMINOS,
      preguntas: TOTAL_PREGUNTAS,
      consultasConRespuesta: CONSULTAS_DINERO.length,
    },
    intenciones,
    nota:
      'Una consulta, una página. Cada término tiene UNA URL canónica que lo contesta; ' +
      'las páginas de apoyo la refuerzan y enlazan hacia ella, nunca compiten con ella. ' +
      'Ningún término de este archivo autoriza a esperar una página propia: todos apuntan ' +
      'a páginas que ya existen y que ya tienen contenido verificado.',
    clusters: clusters.map((c) => {
      /**
       * `consultas` sólo aparece donde hay una respuesta escrita. No se
       * rellena con una plantilla para que ningún clúster quede «vacío»: un
       * párrafo generado para cubrir el hueco es exactamente la ficción que
       * este archivo existe para evitar. Cada respuesta trae su límite pegado,
       * porque un motor que cite la una sin el otro convierte una oferta en una
       * promesa que esta empresa no hizo.
       */
      const consultas = consultasDeCluster(c.id).map((q) => ({
        consulta: q.consulta,
        idioma: q.idioma,
        respuesta: q.respuesta,
        limite: q.limite,
        siguiente: `${base}${q.siguiente}`,
      }));
      return {
        id: c.id,
        intencion: c.intencion,
        idioma: idiomaDe(c),
        termino: c.termino,
        terminos: terminosDe(c),
        canonica: `${base}${c.canonica}`,
        preguntas: c.preguntas,
        apoyos: c.apoyos.map((a) => `${base}${a}`),
        ...(consultas.length ? { consultas } : {}),
      };
    }),
  };

  return new Response(`${JSON.stringify(cuerpo, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600',
      'X-Robots-Tag': 'all',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
