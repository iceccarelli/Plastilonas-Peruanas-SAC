/**
 * EL LOTE DE FOTOGRAFÍAS DEL HERO — una sola lista, un solo sitio.
 *
 * Antes la portada servía una constante suelta dentro de
 * `components/HeroImagen.tsx`. Cuando se quiso rotar el lote hubo que elegir
 * entre dejar quince rutas literales dentro de un componente de cliente o
 * centralizarlas. Se centralizan aquí por dos motivos concretos:
 *
 *  1. `npm run auditar:imagenes` recorre `app/`, `components/` y `lib/` y
 *     exige que TODA ruta literal exista en `public/`. Teniéndolas en un solo
 *     archivo, el día que alguien borre o renombre una foto el fallo sale con
 *     nombre y línea, no como un 404 silencioso en producción.
 *  2. El texto alternativo se escribe una vez y describe LO QUE SE VE. No se
 *     repite entre archivos distintos: un alt copiado es un alt que miente en
 *     al menos una de las dos fotos.
 *
 * ORDEN. El primer elemento es el que se sirve en el HTML del servidor y es
 * el LCP de la portada. No se reordena a la ligera ni se sortea: ver el
 * bloque de comentarios de `components/HeroImagen.tsx`.
 *
 * QUÉ ENTRA. Solo fotografía de las tres cuñas de la portada —lonas y siders
 * de camión, carpas y toldos, revestimiento y cerramientos—. Todas son
 * imágenes REFERENCIALES de la aplicación: ninguna se presenta como obra
 * ejecutada, y el pie sobre la imagen lo dice en cada giro.
 */
export interface HeroImagen {
  src: string;
  alt: string;
}

export const HERO_IMAGENES: readonly HeroImagen[] = [
  {
    // Primera y por tanto LCP: corresponde a la primera cuña del H1.
    src: '/images/hero/hero-08.webp',
    alt: 'Camión con siders y tolderas de lona en una carretera peruana.',
  },
  {
    src: '/images/galeria/siders-tolderas-camiones-general.webp',
    alt: 'Semirremolque con sider de lona tensada visto de costado en playa de maniobras.',
  },
  {
    src: '/images/galeria/mantas-cobertores-toldos-camiones-instalacion.webp',
    alt: 'Operarios extendiendo una manta cobertora sobre la tolva cargada de un camión.',
  },
  {
    src: '/images/hero/hero-02.webp',
    alt: 'Rollos de lona plastificada apilados en el taller de confección.',
  },
  {
    src: '/images/galeria/carpas-lona-estructuras-metalicas-general.webp',
    alt: 'Carpa de lona montada sobre estructura metálica en un patio industrial.',
  },
  {
    src: '/images/galeria/lona-plastificada-rafia-polytarp-general.webp',
    alt: 'Paño de lona plastificada extendido antes del corte a medida.',
  },
  {
    src: '/images/hero/hero-04.webp',
    alt: 'Mesa de trabajo con lona y herramienta de corte en la planta de Chorrillos.',
  },
  {
    src: '/images/galeria/toldos-cerramientos-instalacion.webp',
    alt: 'Instalación de un toldo de cerramiento lateral sobre perfilería metálica.',
  },
  {
    src: '/images/galeria/revestimiento-vehicular-toldos-publicitarios-general.webp',
    alt: 'Toldo publicitario impreso montado sobre el lateral de una unidad de reparto.',
  },
  {
    src: '/images/hero/hero-06.webp',
    alt: 'Bobinas de rafia de polipropileno tejida listas para confección.',
  },
  {
    src: '/images/galeria/siders-tolderas-camiones-instalacion.webp',
    alt: 'Montaje de una toldera corrediza sobre el bastidor de un semirremolque.',
  },
  {
    src: '/images/galeria/carpas-lona-estructuras-metalicas-escala.webp',
    alt: 'Carpa industrial de gran luz con personas al pie para dar escala.',
  },
  {
    src: '/images/hero/hero-07.webp',
    alt: 'Detalle de costura reforzada y ojal metálico en el borde de una lona.',
  },
  {
    src: '/images/galeria/lona-plastificada-rafia-polytarp-instalacion.webp',
    alt: 'Colocación de una lona plastificada a medida sobre una cubierta metálica.',
  },
  {
    src: '/images/galeria/mantas-cobertores-toldos-camiones-general.webp',
    alt: 'Manta cobertora de lona encerada tensada sobre carga a granel.',
  },
  {
    src: '/images/hero/hero-09.webp',
    alt: 'Soldadura de alta frecuencia uniendo dos paños de lona de PVC.',
  },
  {
    src: '/images/galeria/toldos-cerramientos-general.webp',
    alt: 'Cerramiento de lona cerrando el vano de un almacén industrial.',
  },
  {
    src: '/images/galeria/revestimiento-vehicular-toldos-publicitarios-escala.webp',
    alt: 'Flota de unidades con revestimiento de lona vista a distancia en patio.',
  },
  {
    src: '/images/hero/hero-12.webp',
    alt: 'Nave de producción con paños de lona en proceso de confección.',
  },
  {
    src: '/images/hero/hero-16.webp',
    alt: 'Cobertura de lona tensada protegiendo material acopiado a la intemperie.',
  },
];

/** La que se sirve en el HTML del servidor. Es el LCP: no se sortea. */
export const HERO_PRIMERA: HeroImagen = HERO_IMAGENES[0];
