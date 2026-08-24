import mapa from '@/data/topic-map.json';

/**
 * MAPA DE CONSULTAS → PÁGINA CANÓNICA.
 *
 * EL PROBLEMA QUE RESUELVE. Un catálogo de 36 productos en 11 familias, cinco
 * hubs sectoriales, cinco guías, cinco calculadoras y 43 términos de glosario
 * produce, sin quererlo, varias páginas que hablan de lo mismo. «Geomembrana»
 * aparece en la familia, en cuatro fichas de producto, en una guía, en una
 * calculadora, en dos términos y en un artículo. Cuando un buscador —o un
 * modelo— tiene que elegir cuál contesta la consulta «geomembranas Perú»,
 * elige por su cuenta, y cuando hay ocho candidatas parecidas suele repartir la
 * señal entre todas y no posicionar ninguna. Eso es canibalización, y no se
 * arregla escribiendo más: se arregla decidiendo.
 *
 * LA DECISIÓN. Cada clúster de consulta tiene UNA página canónica que lo
 * contesta y una lista de apoyos que lo refuerzan enlazando hacia ella. Los
 * apoyos no compiten: aportan profundidad —el cálculo, la definición, el caso
 * sectorial— y devuelven al lector a la canónica.
 *
 * LO QUE ESTE ARCHIVO NO ES. No es una lista de páginas por crear. Todos los
 * términos apuntan a rutas que YA existen y que ya tienen contenido propio y
 * verificado. Añadir un término aquí no autoriza a fabricar una página delgada
 * de «producto × ciudad»: esas páginas no responden mejor a nada, y el propio
 * mapa las haría fallar por canibalización con la familia que sí responde.
 *
 * LO QUE HACE FALLAR EL BUILD (test/mapa-consultas.test.ts):
 *   · un término que aparece en dos clústeres (dos páginas compitiendo)
 *   · una canónica declarada por dos clústeres
 *   · una ruta —canónica o apoyo— que no existe en app/
 *   · un producto, familia o sector sin clúster que lo tenga por canónica
 *   · un clúster sin apoyos (una página aislada del grafo interno)
 */

export type Intencion =
  | 'comercial'
  | 'sector'
  | 'decision'
  | 'calculo'
  | 'transaccional'
  | 'entidad'
  | 'local';

export interface Cluster {
  /** Identificador estable. No aparece en ninguna URL. */
  id: string;
  /** La única página que contesta este clúster. */
  canonica: string;
  intencion: Intencion;
  /** El término tal y como se escribiría en una búsqueda. */
  termino: string;
  /** Variantes reales: plural, orden invertido, sinónimo del rubro, forma local. */
  variantes: string[];
  /**
   * Erratas y formas sin tilde que la gente teclea de verdad. Viven aquí y no
   * en una página: una página por errata es una doorway page, y además una
   * errata no necesita página propia — necesita que la página buena la cubra.
   */
  erratas: string[];
  /** Consulta conversacional, tal como se le hace a un asistente. */
  preguntas: string[];
  /** Páginas que refuerzan la canónica y enlazan hacia ella. Nunca compiten. */
  apoyos: string[];
}

interface MapaDoc {
  version: string;
  revisado: string;
  nota: string;
  intenciones: Record<string, string>;
  clusters: Cluster[];
}

const doc = mapa as unknown as MapaDoc;

export const TOPIC_MAP_VERSION = doc.version;
export const TOPIC_MAP_REVISADO = doc.revisado;
export const clusters: Cluster[] = doc.clusters;
export const intenciones = doc.intenciones;

/** Todos los términos de un clúster: el principal, las variantes y las erratas. */
export function terminosDe(c: Cluster): string[] {
  return [c.termino, ...c.variantes, ...c.erratas];
}

/**
 * Forma comparable de un término: minúsculas, sin tildes, sin espacios dobles.
 * Es la forma en que se comprueba la unicidad — «Malla Raschel» y «malla
 * raschel» son el mismo término, y tenerlos en dos clústeres sería el mismo
 * error aunque se escriban distinto.
 */
export function normalizar(termino: string): string {
  return termino
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const porTermino = new Map<string, Cluster>();
for (const c of clusters) for (const t of terminosDe(c)) porTermino.set(normalizar(t), c);

/** El clúster que responde a una consulta exacta, si lo hay. */
export function clusterDeTermino(consulta: string): Cluster | undefined {
  return porTermino.get(normalizar(consulta));
}

const porCanonica = new Map<string, Cluster>(clusters.map((c) => [c.canonica, c]));

/** El clúster del que esta ruta es la página canónica. */
export function clusterDeRuta(ruta: string): Cluster | undefined {
  return porCanonica.get(ruta);
}

/** Clústeres a los que esta ruta da apoyo (sin ser su canónica). */
export function clustersApoyadosPor(ruta: string): Cluster[] {
  return clusters.filter((c) => c.apoyos.includes(ruta));
}

/**
 * Las rutas hermanas que conviene enlazar desde una página: la canónica de su
 * propio clúster —si la página es un apoyo— y las canónicas de los clústeres a
 * los que apoya. Es lo que alimenta el riel de términos comerciales.
 */
export function rielPara(ruta: string, limite = 6): Cluster[] {
  const propio = clusterDeRuta(ruta);
  const vecinos = new Map<string, Cluster>();

  // 1. Si la ruta ES canónica, sus vecinos son los clústeres que comparten
  //    apoyos con ella: el lector que llegó buscando «geomembrana HDPE» tiene
  //    a un clic «geotextiles» y «geomallas», que es lo siguiente que compra.
  if (propio) {
    for (const c of clusters) {
      if (c.id === propio.id) continue;
      const comparte = c.apoyos.some((a) => propio.apoyos.includes(a) || a === propio.canonica);
      if (comparte) vecinos.set(c.id, c);
    }
  }

  // 2. Si la ruta es un APOYO, los vecinos son las canónicas a las que sirve.
  for (const c of clustersApoyadosPor(ruta)) vecinos.set(c.id, c);

  const orden: Record<Intencion, number> = {
    comercial: 0, sector: 1, decision: 2, calculo: 3, transaccional: 4, local: 5, entidad: 6,
  };
  return [...vecinos.values()]
    .filter((c) => c.canonica !== ruta)
    .sort((a, b) => orden[a.intencion] - orden[b.intencion] || a.termino.localeCompare(b.termino))
    .slice(0, limite);
}

/** Cuenta total de términos cubiertos. Se usa en /llms.txt y en la auditoría. */
export const TOTAL_TERMINOS = clusters.reduce((n, c) => n + terminosDe(c).length, 0);

/** Cuenta total de preguntas conversacionales cubiertas. */
export const TOTAL_PREGUNTAS = clusters.reduce((n, c) => n + c.preguntas.length, 0);

/** Clústeres por intención, en el orden en que se anuncian a un agente. */
export function clustersPorIntencion(intencion: Intencion): Cluster[] {
  return clusters.filter((c) => c.intencion === intencion);
}
