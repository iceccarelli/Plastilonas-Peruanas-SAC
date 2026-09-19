import type { TipoImagen } from './imagenes';
import { LEYENDA_CINE } from './leyendas';

/**
 * LA TRILOGÍA — fuente única de las tres piezas de cine editorial.
 *
 * Qué son. Tres piezas cortas, numeradas I, II y III, que miran el mismo
 * negocio desde tres distancias: el catálogo entero de un vistazo, el material
 * a un palmo, y el material trabajando. No son un anuncio: no hay oferta, no
 * hay precio, no hay una llamada a comprar dentro del vídeo. Por eso el sitio
 * no las llama «vídeo comercial» en ninguna parte, y por eso viven en una sala
 * —/oficio— y no en un carrusel de portada.
 *
 * Por qué dos tomas por pieza. De cada película llegaron dos montajes: uno
 * hablado, que es el master publicado, y uno sin locución. El hablado es el que
 * se ofrece para ver; el mudo existe para el único uso en que un navegador
 * permite que algo arranque solo —un bucle de fondo, silencioso— y se declara
 * aquí para que ese uso NO pueda coger por error la pista con voz.
 * `components/CinePlayer.tsx` lee `srcMudo` y nunca `src` en modo fondo.
 *
 * REGLA DE HONESTIDAD, la misma del resto del sitio. Lo que se ve es producto
 * y oficio, no una obra ejecutada para un cliente nombrado: `lib/projects.ts`
 * no publica ninguna ficha con `verificado: true`, así que ninguna imagen de
 * este sitio —fija o en movimiento— puede presentarse como evidencia de un
 * trabajo entregado. El pie lo dice, y el JSON-LD lo repite.
 *
 * `familias` y `productos` NO son una lista de deseos de posicionamiento: son
 * lo que de verdad se ve en cada montaje. Están repartidos sin solaparse entre
 * las tres piezas, de modo que una página de familia o de ficha no puede
 * heredar dos películas — y la regla de «como mucho un vídeo por página» se
 * cumple por construcción y no por vigilancia.
 *
 * `durationSec` sale de ffprobe sobre el archivo publicado, no de una
 * estimación: es el dato que viaja al VideoObject, y una duración inventada es
 * lo primero que un rastreador puede desmentir descargando el archivo.
 */

export interface Pieza {
  /** Identificador estable. Es también el nombre del archivo. */
  id: string;
  /** Número de la pieza dentro de la trilogía, en romano, como se rotula. */
  n: 'I' | 'II' | 'III';
  /** Título rotulado en la propia película. No se parafrasea. */
  titulo: string;
  /** Bajada rotulada en la propia película, debajo del título. */
  antetitulo: string;
  /** Qué se ve. Descriptivo, no publicitario. */
  sinopsis: string;
  /** Master hablado. El que se publica. */
  src: string;
  /** Toma sin locución. Única apta para un contexto que arranque solo. */
  srcMudo: string;
  /** Fotograma de cartel, extraído del propio master. */
  poster: string;
  /** Duración real del master hablado, en segundos (ffprobe). */
  durationSec: number;
  /**
   * Pie de honestidad. Sale de `lib/leyendas.ts`, que es donde vive la
   * redacción: el campo existe para que una pieza pueda llevar un pie más
   * específico el día que haga falta, no para reescribir la regla.
   */
  pie: string;
  /** Familias cuyo material aparece de verdad en el montaje. */
  familias: string[];
  /** Fichas de producto cuyo material aparece de verdad en el montaje. */
  productos: string[];
  /** Rutas donde la pieza se muestra incrustada (no sólo enlazada). */
  paginas: string[];
}

/** Ruta de la sala. Se importa; no se escribe a mano en ninguna página. */
export const RUTA_CINE = '/oficio';

/**
 * Fecha de publicación de las tres piezas en este sitio. Es lo que declara el
 * `uploadDate` del VideoObject, y es comprobable contra el historial de git.
 */
export const CINE_PUBLICADO = '2026-09-19';

export const TRILOGIA: Pieza[] = [
  {
    id: 'el-oficio',
    n: 'I',
    titulo: 'El oficio',
    antetitulo: 'Una lectura de Plastilonas Peruanas',
    sinopsis:
      'El catálogo entero en un solo recorrido: manga de ventilación, ducto en un frente de mina, rollo de geomembrana, lona aluminizada con sus ojales, cobertor sobre fardos, silo bolsa, cubierta tensada, poza revestida. Es la pieza que contesta «qué hace esta empresa» sin listar nada.',
    src: '/videos/el-oficio.mp4',
    srcMudo: '/videos/el-oficio-mudo.mp4',
    poster: '/videos/posters/el-oficio.jpg',
    durationSec: 74,
    pie: LEYENDA_CINE.es,
    // Recorre las once líneas sin detenerse en ninguna: no es la película de
    // una familia, es la de la empresa. Atribuirla a una familia concreta
    // sería decir que ese material protagoniza un montaje que no protagoniza.
    familias: [],
    productos: [],
    paginas: ['/', RUTA_CINE, '/nosotros'],
  },
  {
    id: 'la-materia',
    n: 'II',
    titulo: 'La materia',
    antetitulo: 'El producto, visto de cerca',
    sinopsis:
      'A un palmo del material: el ojal embutido sobre el tejido aluminizado, la costura que lo rodea, el nervio del polipropileno rafia, el hilo de la trama, el rollo de geomembrana de canto y la pila de lonas dobladas por color. Nada se mueve salvo la cámara; lo que se juzga es el acabado.',
    src: '/videos/la-materia.mp4',
    srcMudo: '/videos/la-materia-mudo.mp4',
    poster: '/videos/posters/la-materia.jpg',
    durationSec: 60,
    pie: LEYENDA_CINE.es,
    familias: ['lonas-cobertores', 'geosinteticos'],
    productos: ['lona-plastificada-rafia-polytarp'],
    paginas: [RUTA_CINE],
  },
  {
    id: 'el-gesto',
    n: 'III',
    titulo: 'El gesto',
    antetitulo: 'El producto, trabajando',
    sinopsis:
      'El mismo material, ya instalado y en servicio: el ducto de ventilación colgado en el túnel con el frente al fondo, el cobertor amarrado sobre los fardos, la cubierta sobre el patio de vehículos, la malla de sombra sobre el paso peatonal, el bolsón lleno, el biombo que aísla el corte. Aparece gente porque el producto sólo se entiende usándolo.',
    src: '/videos/el-gesto.mp4',
    srcMudo: '/videos/el-gesto-mudo.mp4',
    poster: '/videos/posters/el-gesto.jpg',
    durationSec: 55,
    pie: LEYENDA_CINE.es,
    familias: [
      'ventilacion-industrial',
      'estructuras-arquitectura-textil',
      'envases-embalaje',
      'seguridad-industrial',
    ],
    productos: [
      'mangas-ventilacion-minas-tuneles',
      'carpas-lona-estructuras-metalicas',
      'big-bags-bolsones-polipropileno',
      'biombos-protectores-soldadura',
    ],
    paginas: [RUTA_CINE],
  },
];

/** La pieza que abre la trilogía. Es la institucional, y la única de portada. */
export const PIEZA_PORTADA = TRILOGIA[0];

/**
 * La película de una familia, si la hay. Devuelve UNA o ninguna: los repartos
 * de `familias` no se solapan, así que la página no tiene que elegir.
 */
export const cineDeFamilia = (slug: string): Pieza | undefined =>
  TRILOGIA.find((p) => p.familias.includes(slug));

/** Lo mismo para una ficha de producto. */
export const cineDeProducto = (slug: string): Pieza | undefined =>
  TRILOGIA.find((p) => p.productos.includes(slug));

export const piezaPorId = (id: string): Pieza | undefined =>
  TRILOGIA.find((p) => p.id === id);

/**
 * Duración en ISO 8601, que es el formato que schema.org espera en
 * `VideoObject.duration`. Se deriva de `durationSec`: no hay una segunda cifra
 * escrita a mano que pueda contradecir a la primera.
 */
export function duracionIso(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `PT${m ? `${m}M` : ''}${s}S`;
}

/** «1:14». La misma cifra, para leerla junto al cartel. */
export function duracionLegible(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Los tres carteles, como ranuras del registro de imágenes. Son fotogramas
 * REALES extraídos del master publicado —no un encargo pendiente— y por eso
 * entran como `tipo: 'foto'` y sin prompt de generación: el «encargo» es el
 * comando de extracción, que está escrito en la entrega.
 */
export function ranurasCine(): {
  id: string;
  ruta: string;
  ancho: number;
  alto: number;
  alt: string;
  tipo: TipoImagen;
  contexto: string;
  prompt: string;
}[] {
  return TRILOGIA.map((p) => ({
    id: `cine:${p.id}`,
    ruta: p.poster,
    ancho: 1920,
    alto: 1080,
    alt: `${p.n} · ${p.titulo} — ${p.antetitulo.toLowerCase()}`,
    tipo: 'foto' as TipoImagen,
    contexto: `Cartel de la pieza ${p.n} en ${RUTA_CINE}`,
    prompt:
      `NO SE ENCARGA: es un fotograma del propio master ${p.src}, extraído con ` +
      `ffmpeg a los 10 s y escalado a 1920×1080. Si la película cambia, se ` +
      `vuelve a extraer del archivo nuevo; no se sustituye por una imagen generada.`,
  }));
}
