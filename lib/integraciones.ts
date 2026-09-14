import { SITE } from './site';
import { SUPERFICIES_INDEXABLES } from './superficies-maquina';
import { calculadoras, CALCULADORAS_ACTUALIZADO } from './calculadoras';
import { apiPublica, type HerramientaPublicada } from './api-publica';

/**
 * INTEGRACIONES — lo que este sitio ofrece a un programa y a un agente.
 *
 * DOS COSAS DISTINTAS, Y CONVIENE NO MEZCLARLAS.
 *
 *   LO QUE SIEMPRE ES CIERTO. El sitio publica ocho superficies en JSON y
 *   texto plano —catálogo, glosario, métodos de cálculo, identidad, mapa de
 *   consultas, indicadores— que cualquiera puede leer hoy, sin permiso, sin
 *   clave y sin que nadie tenga que desplegar nada. Existen desde hace etapas.
 *
 *   LO QUE DEPENDE DEL SERVICIO. La API y el servidor MCP (servicio/, en
 *   Fly.io) añaden lo que un archivo estático no puede: EJECUTAR. Calcular con
 *   los datos del comprador, buscar en el catálogo, traducir un problema en una
 *   especificación y registrar una solicitud de cotización.
 *
 * Esta página describe las dos, y la segunda sólo cuando responde de verdad
 * —`NEXT_PUBLIC_API_URL`—. Prometer a un integrador un endpoint que devuelve un
 * error es perder al integrador y al comprador que venía detrás.
 */

export const RUTA_INTEGRACIONES = '/integraciones';

export interface SuperficieDeDatos {
  ruta: string;
  que: string;
  paraQue: string;
}

/**
 * Las superficies que el sitio publica hoy. La lista de rutas NO se escribe
 * aquí: se toma de `SUPERFICIES_INDEXABLES`, que es la misma que alimenta el
 * sitemap y `robots.txt`. Publicar una novena y olvidarse de esta página es
 * entonces imposible: falta la descripción y la prueba lo dice.
 */
const QUE_ES: Record<string, { que: string; paraQue: string }> = {
  '/llms.txt': {
    que: 'Índice curado del sitio en texto plano: consulta → una sola URL.',
    paraQue: 'Que un agente encuentre la página canónica de cada pregunta en vez de adivinar entre veinte.',
  },
  '/ai.txt': {
    que: 'Identidad, política de citación y lo que esta empresa NO afirma.',
    paraQue: 'Que un modelo cite con atribución correcta y no rellene por su cuenta lo que no está publicado.',
  },
  '/entidad.json': {
    que: 'Grafo de la organización: razón social, RUC, domicilio, perfiles verificados.',
    paraQue: 'Resolver la entidad sin depender de directorios con datos viejos.',
  },
  '/mapa-consultas.json': {
    que: 'Mapa completo de consulta comercial a URL única, con intención declarada.',
    paraQue: 'Responder una consulta con la página que de verdad la contesta.',
  },
  '/productos/catalogo.json': {
    que: 'Catálogo de fabricación con especificaciones, aplicaciones, sectores y condiciones de suministro.',
    paraQue: 'Cargar el catálogo en un ERP o en un sistema de compras. Sin precios: se cotizan por operación.',
  },
  '/glosario/terminos.json': {
    que: 'Vocabulario del rubro: definición citable, en qué unidad se mide y qué decide en obra.',
    paraQue: 'Traducir lo que pide un pliego a lo que hay que especificar.',
  },
  '/calculadoras/formulas.json': {
    que: `Los ${calculadoras.length} métodos de predimensionamiento con su fórmula, sus supuestos y sus límites (revisión ${CALCULADORAS_ACTUALIZADO}).`,
    paraQue: 'Verificar un número antes de repetirlo. Una caja negra no la puede auditar nadie.',
  },
  '/indicadores/datos.json': {
    que: 'Indicadores del rubro con su fuente y su fecha.',
    paraQue: 'Contextualizar una cotización sin inventar una serie.',
  },
};

export function superficiesDeDatos(): SuperficieDeDatos[] {
  return SUPERFICIES_INDEXABLES.map((ruta) => {
    const d = QUE_ES[ruta];
    return { ruta, que: d?.que ?? '', paraQue: d?.paraQue ?? '' };
  });
}

/** Lo que la API añade sobre los archivos: ejecutar, no sólo leer. */
export const LO_QUE_EJECUTA = [
  {
    titulo: 'Calcular con los datos del comprador',
    detalle:
      'Los archivos publican la fórmula; la API la aplica. Una poza de 40 × 25 × 4 devuelve los metros cuadrados, el desglose que los produce, los avisos que correspondan y lo que el cálculo no cubre.',
  },
  {
    titulo: 'Encontrar el producto que corresponde',
    detalle:
      'Búsqueda sobre el catálogo con el texto del comprador —«bolsas para concentrado de cobre»—, ponderada por lo que distingue y no por lo que se repite.',
  },
  {
    titulo: 'Traducir un problema en una especificación',
    detalle:
      'De «poza de relaves a 4.100 msnm con contacto ácido» a qué familia corresponde, qué variables hay que fijar, qué preguntas faltan y qué cálculo aplica. Con la certeza declarada: cuando la descripción admite varias familias, lo dice.',
  },
  {
    titulo: 'Registrar una solicitud de cotización',
    detalle:
      'Un RFQ estructurado que entra por el mismo buzón que el formulario del sitio y devuelve su referencia.',
  },
] as const;

/** Las tres reglas que gobiernan todo lo que sale de esta puerta. */
export const REGLAS = [
  {
    regla: 'Sin precios, ni ahora ni después',
    porque:
      'El precio depende de material, medidas, cantidad, destino e Incoterm. Publicarlo dejaría de ser una referencia para pasar a ser una promesa que no se puede sostener.',
  },
  {
    regla: 'Cada dato viaja con sus límites',
    porque:
      'Toda respuesta trae el campo `limites`. Un número sin ellos se usa fuera de ellos, y en una poza de relaves o en una galería de mina eso no es un error de marketing.',
  },
  {
    regla: 'Cada dato viaja con su fuente',
    porque:
      'Toda respuesta trae la página de este sitio donde el mismo dato está publicado con su método a la vista, y la cita sugerida. Lo que no se puede verificar no se debería repetir.',
  },
] as const;

export interface BloqueApi {
  origen: string;
  mcp: string;
  openapi: string;
  herramientas: HerramientaPublicada[];
  /** Los lee el cliente y los adjunta al contexto: sin decisión del modelo. */
  recursos: HerramientaPublicada[];
  /** Las elige la persona; en un cliente MCP aparecen como comandos. */
  instrucciones: HerramientaPublicada[];
  ejemploCurl: string;
  ejemploMcp: string;
}

/** El bloque ejecutable, sólo cuando hay un servicio que responda. */
export function bloqueApi(): BloqueApi | null {
  const api = apiPublica();
  if (!api) return null;
  return {
    origen: api.origen,
    mcp: api.mcp,
    openapi: api.openapi,
    herramientas: api.herramientas,
    recursos: api.recursos,
    instrucciones: api.instrucciones,
    ejemploCurl: [
      `curl -s ${api.origen}/v1/calculos/geomembrana-poza \\`,
      `  -H 'content-type: application/json' \\`,
      `  -d '{"valores":{"largo":40,"ancho":25,"profundidad":4}}'`,
    ].join('\n'),
    ejemploMcp: [
      `curl -s ${api.mcp} \\`,
      `  -H 'content-type: application/json' \\`,
      `  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`,
    ].join('\n'),
  };
}

/** Enlace a esta página para las superficies de texto. Siempre existe. */
export const ENLACE_INTEGRACIONES = `${SITE.url}${RUTA_INTEGRACIONES}`;
