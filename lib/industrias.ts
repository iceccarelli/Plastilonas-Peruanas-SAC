import { products } from './products';
import { solutions } from './solutions';
import { articles } from './articles';
import { tituloAjustado, descripcionAjustada } from './meta';
import type { Product } from './types';

/**
 * HUBS DE INDUSTRIA (/industria y /industria/[sector]).
 *
 * EL HUECO QUE LLENA. El catálogo ya clasifica cada producto por sector
 * —`sector: ['Minería', 'Construcción']` en lib/products.ts— y las
 * arquitecturas de referencia también. Esa clasificación existe desde el
 * principio, se usa para filtrar en cliente… y no tiene una sola URL propia.
 * Es decir: el sitio SABE qué vende a minería y no lo dice en ninguna página
 * indexable. Quien busca «mangas de ventilación para minería» aterriza, con
 * suerte, en una ficha suelta.
 *
 * POR QUÉ NO ES OTRA CAPA DE LO MISMO. Ya existen cuatro ejes:
 *   /productos/familia/*  → «¿qué línea me sirve?» (por material)
 *   /soluciones/*         → «¿cómo se arma el conjunto?» (por obra)
 *   /marco                → «¿qué tengo que definir?» (por criterio)
 *   /local/*              → «¿llegan a mi ciudad?» (por geografía)
 * Falta el eje por el que de verdad busca un jefe de compras: SU INDUSTRIA.
 * Nadie en una minera busca «geosintéticos»; busca resolver una poza.
 *
 * REGLA DE NO DERIVA — la que hace que esta capa no envejezca. Los productos
 * de cada hub NO se escriben a mano: se derivan de las etiquetas de sector que
 * ya lleva el catálogo. Una lista de slugs copiada aquí quedaría desfasada el
 * día que alguien añada un producto o le cambie el sector, y nadie se
 * enteraría. Lo único escrito a mano es lo que ningún dato puede dar: el
 * problema de compra, el criterio y la logística. Los `ancla` son un orden de
 * presentación, y test/industrias.test.ts verifica que cada uno exista Y lleve
 * la etiqueta del sector.
 *
 * POR QUÉ NO HAY HUB «INDUSTRIAL». Es la etiqueta con más productos (19) y la
 * peor candidata a página: nadie teclea «industrial» como intención de compra.
 * Un hub que no responde a una búsqueda real es contenido de relleno con
 * aspecto de estrategia.
 *
 * REGLA DE HONESTIDAD, la misma del resto del repositorio: ni una obra
 * ejecutada, ni un cliente, ni un volumen, ni una certificación que no se
 * pueda respaldar con un documento. El texto habla de criterios y de lo que se
 * fabrica, que es verificable.
 */

export interface Industria {
  slug: string;
  /** Nombre del sector, tal como lo llama el comprador. */
  nombre: string;
  /** Etiquetas de `Product.sector` que este hub absorbe. Fuente de la derivación. */
  etiquetas: string[];
  /**
   * Base del <title> cuando el nombre completo no deja sitio al complemento.
   * «Construcción e infraestructura» son 30 de los 51 caracteres disponibles:
   * el nombre entero gana el encabezado y pierde el resultado de búsqueda.
   */
  tituloBase?: string;
  /**
   * Complemento del <title>. Está escrito PARA CABER: lib/meta.ts lo suelta
   * entero si no entra, y un título que se queda en «Transporte y logística»
   * desperdicia veintinueve caracteres de espacio de clic.
   */
  complementoTitulo: string;
  /** Frases de la descripción, en orden de importancia. */
  frasesDescripcion: string[];
  /** Párrafo de apertura, marcado como speakable. */
  intro: string;
  /** Qué se rompe cuando se compra sin criterio en este sector. */
  problemas: { titulo: string; detalle: string }[];
  /** Orden de presentación. Deben existir y llevar la etiqueta (lo verifica el test). */
  ancla: string[];
  /** Departamentos donde este sector concentra demanda. */
  regiones: string[];
  /** Nota logística real: se despacha desde Chorrillos. */
  logistica: string;
  faqs: { q: string; a: string }[];
  /** Fotografía ilustrativa del sector. Referencial: la etiqueta lo declara. */
  foto: { src: string; alt: string };
}

export const INDUSTRIAS: Industria[] = [
  {
    slug: 'mineria',
    nombre: 'Minería',
    etiquetas: ['Minería'],
    complementoTitulo: 'mangas de ventilación y geomembranas',
    frasesDescripcion: [
      'Mangas de ventilación para túneles, geomembranas para pozas y cobertores de alta resistencia, fabricados a medida en Chorrillos.',
      'Despacho a los corredores mineros del país.',
    ],
    intro:
      'En minería el material no se elige por catálogo: se elige por pérdida de carga en el ducto, por compatibilidad química de la lámina con lo que va a contener y por si el conjunto se puede instalar en un frente a 4 000 metros sin volver a bajar por una pieza que faltó. Fabricamos e instalamos mangas de ventilación, geomembranas y cobertores contra especificación, no contra un catálogo cerrado.',
    problemas: [
      {
        titulo: 'La manga se especifica por diámetro y nada más',
        detalle:
          'El diámetro es el dato fácil. Lo que decide el consumo del ventilador durante toda la vida del frente es la rugosidad interior, la calidad de las uniones y cuántas fugas tiene el tramo. Una manga barata con uniones flojas se paga en energía todos los días del año.',
      },
      {
        titulo: 'El espesor de la geomembrana se copia de otra obra',
        detalle:
          'El espesor no se hereda: depende del líquido contenido, del punzonamiento de la subrasante y de la vida de diseño. Copiar el número de una poza de agua limpia a una de solución es el camino corto a una filtración que después se atribuye al material.',
      },
      {
        titulo: 'El cobertor se compra por precio por metro cuadrado',
        detalle:
          'A radiación de sierra alta, un cobertor mal especificado no dura la campaña. El costo real no es el metro cuadrado: es reponerlo dos veces y parar el acopio mientras tanto.',
      },
      {
        titulo: 'El plazo de importación no entra en el cronograma',
        detalle:
          'Cuando la pieza viene de fuera, el cronograma de avance queda atado a un contenedor. Fabricar en Lima cambia el plazo de semanas a días y permite corregir una medida sin repetir el ciclo completo.',
      },
    ],
    ancla: [
      'mangas-ventilacion-minas-tuneles',
      'geomembranas-pvc',
      'geomembrana-pe-fortificada',
      'big-bags-bolsones-polipropileno',
    ],
    regiones: ['Arequipa', 'Cajamarca', 'Pasco', 'Moquegua', 'Áncash', 'Junín'],
    logistica:
      'Fabricación en Chorrillos y despacho a los corredores mineros del sur, centro y norte. Las medidas, uniones y accesorios se cierran antes del corte: rectificar en planta cuesta horas y rectificar en campamento cuesta días.',
    faqs: [
      {
        q: '¿Qué espesor de geomembrana se necesita para una poza en minería?',
        a: 'No hay un número único y desconfíe de quien lo dé por teléfono. El espesor sale de tres datos: qué contiene la poza, qué punzonamiento tiene la subrasante y cuántos años debe durar. En contención de agua industrial se suele trabajar en el rango de 1.0 a 1.5 mm con geotextil de protección; en soluciones agresivas manda la compatibilidad química del polímero antes que el espesor. Lo definimos en la cotización con la ficha del material.',
      },
      {
        q: '¿Fabrican mangas de ventilación en diámetros no estándar?',
        a: 'Sí. Diámetro, longitud de tramo, tipo de unión y refuerzos se confeccionan según el diseño de ventilación del frente. Es el caso normal, no la excepción: el estándar de otro no suele coincidir con su sección.',
      },
      {
        q: '¿Instalan en operaciones fuera de Lima?',
        a: 'Fabricamos en Chorrillos y despachamos a todo el país. La instalación de geomembranas y estructuras se coordina contra el cronograma de la obra, no contra el nuestro.',
      },
    ],
    foto: {
      src: '/images/hero/hero-12.webp',
      alt: 'Acopio minero cubierto con lona en altura.',
    },
  },
  {
    slug: 'agroexportacion',
    nombre: 'Agroexportación',
    etiquetas: ['Agricultura'],
    complementoTitulo: 'mallas antiáfidas y cobertores',
    frasesDescripcion: [
      'Mallas antiáfidas y de sombra, cobertores agrícolas y envases para campaña, fabricados a medida para valles de la costa peruana.',
      'Despacho a Ica, Piura y La Libertad.',
    ],
    intro:
      'La malla no se compra por rollo: se compra por trama, por gramaje y por cuántas campañas tiene que aguantar bajo la radiación del valle. Una malla antiáfida con la trama equivocada deja pasar al vector que iba a detener, y el ahorro por metro se pierde en una sola aplicación fitosanitaria de emergencia.',
    problemas: [
      {
        titulo: 'La trama se elige por precio y no por la plaga',
        detalle:
          'Una malla antiáfida se define por el número de hilos que la cruzan, que es lo que fija el tamaño de paso. Si el paso es mayor que el insecto que se quiere excluir, la malla es una sombra cara.',
      },
      {
        titulo: 'El cobertor no llega al final de la campaña',
        detalle:
          'La radiación de la costa peruana degrada un material sin estabilización adecuada en meses. El costo se mide por campaña cubierta, no por metro comprado.',
      },
      {
        titulo: 'El ancho útil no coincide con el módulo del campo',
        detalle:
          'Comprar el ancho de rollo que había en stock obliga a traslapar o a cortar. Ambas cosas se pagan en merma y en horas de instalación.',
      },
    ],
    ancla: [
      'mallas-antiafidas',
      'malla-raschel-sombra',
      'malla-anti-pajaro-anti-granizo',
      'cobertores-agricolas-multimaterial',
    ],
    regiones: ['Ica', 'Piura', 'La Libertad', 'Lambayeque', 'Áncash', 'Arequipa'],
    logistica:
      'Los volúmenes de campaña se programan con anticipación desde Lima hacia los valles de la costa. El ancho de rollo y la confección se definen contra el módulo del campo para reducir traslape y merma.',
    faqs: [
      {
        q: '¿Cómo se elige la trama de una malla antiáfida?',
        a: 'Por el insecto que se quiere excluir. La trama fija el tamaño de paso: para áfidos se trabajan tramas cerradas y para exclusión más gruesa se puede abrir, ganando ventilación. Cerrar de más también tiene costo, porque reduce el intercambio de aire y sube la temperatura bajo la malla. Se decide con el cultivo y la presión de plaga sobre la mesa.',
      },
      {
        q: '¿Entregan por volumen de campaña a Ica o Piura?',
        a: 'Sí. Es el caso habitual: se programa el volumen contra la fecha de instalación y se despacha desde Lima. Cuanto antes se cierre el ancho útil, menos merma queda en campo.',
      },
    ],
    foto: {
      src: '/images/hero/hero-06.webp',
      alt: 'Malla de sombra y anti-granizo sobre un cultivo.',
    },
  },
  {
    slug: 'transporte-logistica',
    nombre: 'Transporte y logística',
    etiquetas: ['Transporte', 'Logística'],
    tituloBase: 'Transporte',
    complementoTitulo: 'toldos, siders y lonas de carga',
    frasesDescripcion: [
      'Toldos y tolderas para camión, siders, lonas de carga y films de unitización, confeccionados a la medida real de la unidad.',
      'Despacho nacional desde Lima.',
    ],
    intro:
      'Un toldo no falla por la lona: falla por el ojal, por la costura y por el refuerzo que no se puso donde tira la soga. Confeccionamos toldos, tolderas y siders sobre la medida real de la caja —no sobre una tabla de medidas estándar— porque una unidad fuera de plano deja el toldo corto justo donde importa.',
    problemas: [
      {
        titulo: 'Se compra por gramaje y se rompe por el ojal',
        detalle:
          'La lona rara vez es el punto débil. El punto débil es la concentración de esfuerzo en el amarre. Sin refuerzo local, un material excelente se rasga desde el ojal en pocas rutas.',
      },
      {
        titulo: 'Medida estándar sobre una caja que no lo es',
        detalle:
          'Las carrocerías se modifican. Un toldo cortado contra tabla y no contra la unidad queda corto en un lado y sobra en el otro, que es donde el viento lo agarra.',
      },
      {
        titulo: 'Lona plastificada, rafia y polytarp usados como sinónimos',
        detalle:
          'Son tres materiales con vidas útiles y costos distintos. Elegir mal no se nota el primer mes: se nota en el ciclo de reposición.',
      },
    ],
    ancla: [
      'mantas-cobertores-toldos-camiones',
      'siders-tolderas-camiones',
      'lona-plastificada-rafia-polytarp',
      'films-termocontraibles-shrink',
    ],
    regiones: ['Lima', 'Callao', 'La Libertad', 'Arequipa', 'Piura', 'Ica'],
    logistica:
      'Planta en Chorrillos, sobre el eje Lima–Callao. Se toma medida sobre la unidad o se trabaja contra plano de caja, con refuerzos definidos según el sistema de amarre que ya usa la flota.',
    faqs: [
      {
        q: '¿Cuál es la diferencia entre lona plastificada, rafia y polytarp?',
        a: 'La lona plastificada de PVC es impermeable y aguanta exposición continua: es la de mayor vida útil y la de mayor costo. La rafia de polipropileno es liviana y económica, buena para cobertura temporal o carga poco exigente. El polytarp queda en medio: bajo peso con buena resistencia al desgarro. La elección la deciden el tipo de carga, la ruta y cada cuánto está dispuesto a reponer.',
      },
      {
        q: '¿Confeccionan sobre la medida exacta de la carrocería?',
        a: 'Sí, y es lo que recomendamos. Trabajamos con medida tomada sobre la unidad o con plano de caja, incluyendo refuerzos en las zonas de amarre según el sistema de fijación que ya tiene el camión.',
      },
    ],
    foto: {
      src: '/images/hero/hero-16.webp',
      alt: 'Patio logístico con cargas paletizadas y embaladas.',
    },
  },
  {
    slug: 'construccion',
    nombre: 'Construcción e infraestructura',
    etiquetas: ['Construcción', 'Infraestructura'],
    tituloBase: 'Construcción',
    complementoTitulo: 'carpas, cobertores y biombos',
    frasesDescripcion: [
      'Carpas con estructura, cobertores de obra, biombos de soldadura y geosintéticos para movimiento de tierras, con fabricación e instalación propias.',
    ],
    intro:
      'En obra el textil industrial protege tres cosas distintas —el personal, el material y el proceso— y cada una tiene su criterio. Una carpa se dimensiona por la luz que debe salvar y el viento de la zona; un biombo de soldadura, por lo que debe contener; un geotextil, por la función que cumple bajo tierra. Fabricamos e instalamos las tres con un solo responsable.',
    problemas: [
      {
        titulo: 'La carpa se pide por metros cuadrados',
        detalle:
          'El área no dimensiona nada. Lo que dimensiona es la luz libre, la carga de viento de la zona y qué va debajo. Una estructura elegida por área es una estructura elegida al azar.',
      },
      {
        titulo: 'El geosintético se elige por nombre y no por función',
        detalle:
          'Separar, filtrar, drenar, proteger y reforzar son cinco funciones distintas con cinco criterios de especificación distintos. «Geotextil» a secas no es una especificación.',
      },
      {
        titulo: 'Lona por un lado, estructura por otro, instalación por un tercero',
        detalle:
          'Con tres proveedores, la responsabilidad se reparte hasta desaparecer: cada uno cumplió su parte y el conjunto igual falla. Un solo responsable es lo que hace reclamable el resultado.',
      },
    ],
    ancla: [
      'carpas-lona-estructuras-metalicas',
      'coberturas-tensionadas-arquitectura-textil',
      'geotextiles',
      'biombos-protectores-soldadura',
    ],
    regiones: ['Lima', 'Callao', 'Arequipa', 'La Libertad', 'Cusco', 'Piura'],
    logistica:
      'Fabricación en Chorrillos e instalación con equipo propio en Lima, coordinada a nivel nacional. Estructura y lona se dimensionan juntas contra la luz y el uso real: almacén temporal, taller o cobertura de losa no son el mismo problema.',
    faqs: [
      {
        q: '¿Fabrican e instalan, o solo suministran?',
        a: 'Las dos cosas, y esa es la razón de ser de la empresa. Fabricamos la lona, dimensionamos la estructura e instalamos con equipo propio, de modo que hay un solo responsable del resultado y no tres partes explicando por qué la falla es de otro.',
      },
      {
        q: '¿Qué diferencia hay entre un geotextil de separación y uno de refuerzo?',
        a: 'La función y, por lo tanto, la propiedad que gobierna. En separación importa la retención de finos y la permeabilidad; en refuerzo importa la resistencia a la tracción y la deformación a la que se alcanza. Especificar solo el gramaje deja fuera lo que decide el desempeño en ambos casos.',
      },
    ],
    foto: {
      src: '/images/hero/hero-04.webp',
      alt: 'Geotextil y geomalla en una obra de movimiento de tierras.',
    },
  },
  {
    slug: 'saneamiento-y-agua',
    nombre: 'Saneamiento y agua',
    etiquetas: ['Saneamiento'],
    tituloBase: 'Saneamiento',
    complementoTitulo: 'geomembranas y biodigestores',
    frasesDescripcion: [
      'Geomembranas para lagunas y canales, tanques flexibles, biodigestores y tubería HDPE para proyectos de agua y saneamiento en el Perú.',
    ],
    intro:
      'En agua y saneamiento la obra se juzga por una sola pregunta: si contiene o si filtra. La lámina es apenas una de las piezas que deciden la respuesta; las otras son la subrasante aceptada, el geotextil de protección, la zanja de anclaje, los detalles de penetración y el ensayo de costura que demuestra que lo instalado es lo especificado.',
    problemas: [
      {
        titulo: 'Se compra la lámina y se olvida el conjunto',
        detalle:
          'Una laguna revestida no es una geomembrana: es subrasante, protección, lámina, anclaje, penetraciones y ensayos. Suministrar solo la lámina y callar el resto produce exactamente las filtraciones que después se le atribuyen al material.',
      },
      {
        titulo: 'Sin ensayo de costura no hay nada que reclamar',
        detalle:
          'La costura es donde falla un revestimiento. Si no queda registro del ensayo, no hay forma de distinguir un defecto de instalación de un defecto de material cuando aparece la filtración.',
      },
      {
        titulo: 'El almacenamiento temporal se improvisa',
        detalle:
          'Un tanque flexible dimensionado sin considerar la superficie de apoyo y el llenado real termina siendo un problema de seguridad, no una solución de almacenamiento.',
      },
    ],
    ancla: [
      'geomembrana-polietileno-pe-hdpe',
      'geotextiles',
      'tanques-flexibles-bladders',
      'biodigestores',
    ],
    regiones: ['Lima', 'Arequipa', 'Cusco', 'Piura', 'Junín', 'Cajamarca'],
    logistica:
      'Suministro e instalación coordinados con el avance de la obra civil. La aceptación de subrasante manda: instalar sobre una superficie no aceptada compromete el revestimiento antes de que entre el agua.',
    faqs: [
      {
        q: '¿Entregan registro de los ensayos de costura?',
        a: 'Sí, y conviene exigirlo a cualquier instalador. Sin registro de ensayo no hay forma de demostrar qué se instaló, y cuando aparece una filtración la discusión se vuelve una cuestión de palabra contra palabra.',
      },
      {
        q: '¿Qué se especifica primero, la geomembrana o el geotextil?',
        a: 'Primero el contenido y la subrasante, que son los que mandan. De ahí sale qué polímero resiste el líquido y qué protección necesita la lámina contra el punzonamiento. Elegir la lámina primero y buscarle protección después es hacerlo al revés.',
      },
    ],
    foto: {
      src: '/images/hero/hero-07.webp',
      alt: 'Tanque flexible para almacenamiento de agua en operación remota.',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Derivación desde el catálogo — nada de listas paralelas             */
/* ------------------------------------------------------------------ */

export function industriaBySlug(slug: string): Industria | undefined {
  return INDUSTRIAS.find((i) => i.slug === slug);
}

/** Todos los productos etiquetados con alguna etiqueta del hub. */
export function productosDe(ind: Industria): Product[] {
  return products.filter((p) => p.sector.some((s) => ind.etiquetas.includes(s)));
}

/**
 * Productos en orden de presentación: primero los `ancla` (en su orden), luego
 * el resto del sector. Los `ancla` que no existan se ignoran en silencio aquí
 * porque el test ya los declara fallo: no hace falta romper la página en
 * producción por un dato que la integración continua debía haber atajado.
 */
export function productosOrdenados(ind: Industria): Product[] {
  const delSector = productosDe(ind);
  const porSlug = new Map(delSector.map((p) => [p.slug, p]));
  const ancla = ind.ancla.map((s) => porSlug.get(s)).filter(Boolean) as Product[];
  const anclaSlugs = new Set(ancla.map((p) => p.slug));
  return [...ancla, ...delSector.filter((p) => !anclaSlugs.has(p.slug))];
}

/** Arquitecturas de referencia que declaran este sector. */
export function solucionesDe(ind: Industria) {
  return solutions.filter((s) => s.sectores.some((x) => ind.etiquetas.includes(x)));
}

/** Guías técnicas de /recursos que declaran este sector. */
export function guiasDe(ind: Industria) {
  return articles.filter((a) => a.sectors.some((x) => ind.etiquetas.includes(x)));
}

/** Enlace al catálogo ya filtrado: la lista larga vive donde siempre vivió. */
export function catalogoHref(ind: Industria): string {
  return `/productos?sector=${encodeURIComponent(ind.etiquetas[0])}`;
}

/* ------------------------------------------------------------------ */
/* Metadatos dentro del presupuesto (lib/meta.ts)                      */
/* ------------------------------------------------------------------ */

/** <title> del hub, con el complemento solo si cabe entero. */
export function tituloIndustria(ind: Industria): string {
  return tituloAjustado(ind.tituloBase ?? ind.nombre, ind.complementoTitulo);
}

/** Meta description armada con frases completas hasta el límite. */
export function descripcionIndustria(ind: Industria): string {
  return descripcionAjustada(ind.frasesDescripcion);
}
