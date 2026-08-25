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
 * Apoyos que NO dicen nada sobre parentesco.
 *
 * Casi todos los clústeres apoyan en /marco, /calidad o su hub sectorial: son
 * páginas transversales, y por eso mismo no significan «estas dos cosas se
 * parecen». La primera versión del riel emparejaba por apoyos compartidos sin
 * distinguir, y el resultado se veía en la ficha de big bags, que proponía
 * «geomembrana HDPE», «mangas de ventilación» y «módulos para campamentos»: todo
 * lo que toca minería es vecino de todo lo que toca minería. Un riel así no
 * ayuda a nadie y reparte autoridad al azar.
 */
const APOYOS_TRANSVERSALES = [
  '/marco',
  '/marco/evaluacion',
  '/calidad',
  '/confianza',
  '/compras',
  '/servicios',
  '/contacto',
  '/cotizacion',
  '/productos',
  '/local',
];

const esSectorial = (ruta: string) => ruta.startsWith('/industria/');
const esTransversal = (ruta: string) => APOYOS_TRANSVERSALES.includes(ruta);

/** La familia de producto a la que pertenece un clúster, si es que pertenece a una. */
export function familiaDe(c: Cluster): string | null {
  if (c.canonica.startsWith('/productos/familia/')) return c.canonica;
  return c.apoyos.find((a) => a.startsWith('/productos/familia/')) ?? null;
}

/**
 * Cuánto se parecen dos clústeres, para decidir si merecen enlazarse de lado.
 *
 * La escala no es estética: separa las tres razones por las que un comprador
 * salta de una página a otra, en orden de fuerza real.
 *   5  misma familia de producto — «ya sé qué línea necesito, no cuál de ellas»
 *   3  comparten una guía, una calculadora, un término o una aplicación — es la
 *      misma decisión técnica vista desde dos productos
 *   1  comparten sector — es el vínculo más débil y por sí solo no basta
 * Un vínculo de sólo sector (puntaje 1) NO entra en el riel: es la puerta por
 * la que se colaban los vecinos absurdos.
 */
function afinidad(a: Cluster, b: Cluster): number {
  let puntos = 0;

  const fa = familiaDe(a);
  const fb = familiaDe(b);
  if (fa && fb && fa === fb) puntos += 5;

  for (const apoyo of a.apoyos) {
    if (esTransversal(apoyo) || apoyo.startsWith('/productos/familia/')) continue;
    if (!b.apoyos.includes(apoyo) && b.canonica !== apoyo) continue;
    puntos += esSectorial(apoyo) ? 1 : 3;
  }

  // La canónica de uno figurando entre los apoyos del otro es parentesco
  // declarado a mano, y pesa como una familia.
  if (a.apoyos.includes(b.canonica) || b.apoyos.includes(a.canonica)) puntos += 5;

  return puntos;
}

/** Puntaje por debajo del cual dos páginas no se enlazan de lado. */
const UMBRAL_RIEL = 3;

/**
 * Vecinos que conviene enlazar desde una página.
 *
 * Dos caminos, y los dos importan:
 *   · si la ruta es CANÓNICA de un clúster, sus vecinos son los clústeres con
 *     afinidad suficiente — misma familia o misma decisión técnica;
 *   · si la ruta es un APOYO (una guía, una calculadora, un término), sus
 *     vecinos son las canónicas a las que sirve, siempre, porque ése es
 *     justamente el trabajo de una página de apoyo: devolver a la comercial.
 */
export function rielPara(ruta: string, limite = 6): Cluster[] {
  const propio = clusterDeRuta(ruta);
  const puntuados = new Map<string, { c: Cluster; puntos: number }>();

  if (propio) {
    for (const c of clusters) {
      if (c.id === propio.id) continue;
      const puntos = afinidad(propio, c);
      if (puntos >= UMBRAL_RIEL) puntuados.set(c.id, { c, puntos });
    }
  }

  /**
   * Una página de apoyo devuelve a las canónicas a las que sirve. Si la ruta es
   * SÓLO apoyo —una guía, una calculadora, un término— ése es todo su trabajo en
   * el grafo y va con prioridad máxima.
   *
   * Si además es canónica de su propio clúster, se incluye igual pero ordenada
   * por afinidad real. Sin ese matiz, la ficha de geomembrana HDPE abría con
   * «biodigestores» —que la declara como apoyo— por delante de su propia
   * familia, que es la salida que de verdad busca quien está en esa página.
   */
  for (const c of clustersApoyadosPor(ruta)) {
    const puntos = propio ? Math.max(afinidad(propio, c), UMBRAL_RIEL) : 99;
    puntuados.set(c.id, { c, puntos });
  }

  const orden: Record<Intencion, number> = {
    comercial: 0, sector: 1, decision: 2, calculo: 3, transaccional: 4, local: 5, entidad: 6,
  };

  const ordenados = [...puntuados.values()]
    .filter(({ c }) => c.canonica !== ruta)
    .sort(
      (x, y) =>
        y.puntos - x.puntos ||
        orden[x.c.intencion] - orden[y.c.intencion] ||
        x.c.termino.localeCompare(y.c.termino),
    )
    .map(({ c }) => c);

  /**
   * LA FAMILIA NUNCA SE QUEDA FUERA.
   *
   * El orden lo decide la afinidad, y a veces gana un vecino más específico:
   * desde la ficha de invernaderos, la malla raschel puntúa por encima de la
   * familia de estructuras, y es razonable —quien especifica un invernadero mira
   * la malla—. Lo que no puede pasar es que la familia se caiga del corte, porque
   * es la única salida que sirve cuando el vecino específico no era el que el
   * lector buscaba: es el peldaño hacia arriba del catálogo.
   *
   * Así que si no entró por puntaje, entra por derecho, ocupando el último sitio.
   */
  const familia = propio ? familiaDe(propio) : null;
  const recorte = ordenados.slice(0, limite);
  if (familia && familia !== ruta && !recorte.some((c) => c.canonica === familia)) {
    const suya = clusterDeRuta(familia);
    if (suya) recorte.splice(Math.max(0, limite - 1), 1, suya);
  }
  return recorte;
}

/** La afinidad entre dos clústeres, expuesta para que las pruebas la comprueben. */
export function afinidadEntre(a: Cluster, b: Cluster): number {
  return afinidad(a, b);
}

/** El umbral por debajo del cual dos páginas no se enlazan. */
export { UMBRAL_RIEL };

/** Cuenta total de términos cubiertos. Se usa en /llms.txt y en la auditoría. */
export const TOTAL_TERMINOS = clusters.reduce((n, c) => n + terminosDe(c).length, 0);

/** Cuenta total de preguntas conversacionales cubiertas. */
export const TOTAL_PREGUNTAS = clusters.reduce((n, c) => n + c.preguntas.length, 0);

/** Clústeres por intención, en el orden en que se anuncian a un agente. */
export function clustersPorIntencion(intencion: Intencion): Cluster[] {
  return clusters.filter((c) => c.intencion === intencion);
}
