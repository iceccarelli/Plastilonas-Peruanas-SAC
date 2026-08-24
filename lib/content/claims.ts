import { SITE } from '@/lib/site';
import { YEARS_OPERATING, YEARS_STATEMENT, PRODUCT_COUNT, FAMILY_COUNT, COUNT_STATEMENT } from '@/lib/facts';
import { INDUSTRIAS } from '@/lib/industrias';
import { projects, projectsPublicados } from '@/lib/projects';
import { terminos } from '@/lib/glosario';
import { guides } from '@/lib/guides';
import { clusters, TOTAL_TERMINOS } from '@/lib/search/topic-map';

/**
 * REGISTRO DE AFIRMACIONES — una cifra, un origen, una fecha de verificación.
 *
 * POR QUÉ EXISTE, ADEMÁS DE afirmaciones.test.ts. Esa prueba es una lista
 * negra: persigue seis formas conocidas de mentir («más de 500 empresas»,
 * «líderes del mercado», «certificados ISO»). Funciona para lo que ya salió
 * mal una vez. No dice nada de la cifra nueva que alguien escriba mañana en
 * una página nueva, porque una lista negra sólo conoce el pasado.
 *
 * Esto es la lista blanca. Cada número o fecha que este sitio puede publicar
 * sobre sí mismo está aquí, con tres cosas al lado:
 *
 *   valor()        de dónde sale AHORA, calculado, no copiado
 *   fuente         qué documento o archivo lo sostiene
 *   verificadoEl   cuándo lo comprobó una persona contra ese documento
 *
 * Las tres importan por separado. `valor()` impide que la cifra se desincronice
 * —el conteo de productos se deriva del catálogo, así que añadir un producto lo
 * actualiza en todas partes—. `fuente` impide que una cifra derivada de la nada
 * pase por dato. `verificadoEl` impide que un dato de registro —el RUC, la
 * dirección, el año de constitución— se quede años sin que nadie lo confirme
 * contra la ficha real.
 *
 * QUÉ NO ENTRA AQUÍ, y es lo más importante: nada que no se pueda comprobar.
 * No hay recuento de clientes, ni de obras, ni de metros instalados, ni de
 * toneladas, ni de años de garantía, ni de plazos de entrega genéricos. No
 * porque suenen mal, sino porque esta empresa no tiene un sistema del que
 * salgan, y un número sin sistema detrás es un número inventado por mucho que
 * se parezca al del competidor.
 *
 * CÓMO SE AÑADE UNA. Se añade la entrada aquí, con su fuente y su fecha, y se
 * publica la cifra leyéndola de `afirmacion('id').valor()`. Escribirla a mano
 * en una página hace fallar `test/registro-afirmaciones.test.ts`.
 */

export type Comprobabilidad =
  /** Un tercero puede verificarlo contra un documento público o registral. */
  | 'registral'
  /** Se calcula desde una fuente de verdad de este repositorio. */
  | 'derivado'
  /** Es una descripción del propio sitio: se comprueba abriéndolo. */
  | 'observable';

export interface Afirmacion {
  id: string;
  /** Qué se afirma, en una línea, para quien audite el registro. */
  que: string;
  valor: () => string;
  /** Frase publicable ya redactada, cuando la hay. Si no, se compone en la página. */
  frase?: () => string;
  fuente: string;
  comprobabilidad: Comprobabilidad;
  /** Fecha ISO en que una persona comprobó el valor contra la fuente. */
  verificadoEl: string;
  /**
   * Dónde puede aparecer. 'global' = cualquier página. Una lista de prefijos de
   * ruta restringe el uso: un dato que sólo tiene sentido en su contexto no
   * debe acabar de adorno en la portada.
   */
  contextos: 'global' | string[];
}

/**
 * FECHA DE VERIFICACIÓN DE LOS DATOS REGISTRALES.
 *
 * Es una sola constante a propósito: los datos de registro —RUC, razón social,
 * domicilio fiscal, año de constitución, CIIU— se comprueban en el mismo acto,
 * abriendo la ficha RUC en SUNAT. Tenerlos con fechas distintas fingiría una
 * diligencia que no ocurrió así.
 *
 * AL REVISARLOS: abra la ficha RUC, confirme los cinco campos contra
 * lib/site.ts, y ponga aquí la fecha de ese día.
 */
export const VERIFICADO_REGISTRAL = '2026-08-24';

/** Fecha en que se revisó por última vez la estructura del sitio. */
export const VERIFICADO_ESTRUCTURA = '2026-08-24';

export const afirmaciones: Afirmacion[] = [
  // ── Identidad registral ───────────────────────────────────────────────────
  {
    id: 'razon-social',
    que: 'Razón social exacta de la empresa',
    valor: () => SITE.legalName,
    fuente: 'Ficha RUC (SUNAT) → lib/site.ts › SITE.legalName',
    comprobabilidad: 'registral',
    verificadoEl: VERIFICADO_REGISTRAL,
    contextos: 'global',
  },
  {
    id: 'ruc',
    que: 'RUC de 11 dígitos',
    valor: () => SITE.ruc,
    fuente: 'Ficha RUC (SUNAT) → lib/site.ts › SITE.ruc',
    comprobabilidad: 'registral',
    verificadoEl: VERIFICADO_REGISTRAL,
    contextos: 'global',
  },
  {
    id: 'domicilio',
    que: 'Domicilio de la planta',
    valor: () => `${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}`,
    fuente: 'Ficha RUC (SUNAT) → lib/site.ts › SITE.address*',
    comprobabilidad: 'registral',
    verificadoEl: VERIFICADO_REGISTRAL,
    contextos: 'global',
  },
  {
    id: 'anio-fundacion',
    que: 'Año de constitución de la empresa',
    valor: () => SITE.foundingYear,
    frase: () => YEARS_STATEMENT,
    fuente: 'Escritura de constitución → lib/site.ts › SITE.foundingYear',
    comprobabilidad: 'registral',
    verificadoEl: VERIFICADO_REGISTRAL,
    contextos: 'global',
  },
  {
    id: 'anios-operando',
    que: 'Años transcurridos desde la constitución',
    valor: () => String(YEARS_OPERATING),
    frase: () => YEARS_STATEMENT,
    fuente: 'lib/facts.ts › YEARS_OPERATING (año actual − SITE.foundingYear)',
    comprobabilidad: 'derivado',
    verificadoEl: VERIFICADO_REGISTRAL,
    contextos: 'global',
  },
  {
    id: 'ciiu',
    que: 'Clasificación industrial CIIU/ISIC Rev.4',
    valor: () => SITE.isicV4,
    fuente: 'Ficha RUC (SUNAT) → lib/site.ts › SITE.isicV4',
    comprobabilidad: 'registral',
    verificadoEl: VERIFICADO_REGISTRAL,
    contextos: ['/nosotros', '/calidad', '/confianza', '/exportacion', '/compradores'],
  },

  // ── Tamaño del catálogo ───────────────────────────────────────────────────
  {
    id: 'productos',
    que: 'Líneas de producto publicadas en el catálogo',
    valor: () => String(PRODUCT_COUNT),
    frase: () => COUNT_STATEMENT,
    fuente: 'lib/facts.ts › PRODUCT_COUNT (cuenta lib/products.ts)',
    comprobabilidad: 'derivado',
    verificadoEl: VERIFICADO_ESTRUCTURA,
    contextos: 'global',
  },
  {
    id: 'familias',
    que: 'Familias de producto',
    valor: () => String(FAMILY_COUNT),
    frase: () => COUNT_STATEMENT,
    fuente: 'lib/facts.ts › FAMILY_COUNT (cuenta lib/families.ts)',
    comprobabilidad: 'derivado',
    verificadoEl: VERIFICADO_ESTRUCTURA,
    contextos: 'global',
  },
  {
    id: 'sectores',
    que: 'Hubs sectoriales publicados',
    valor: () => String(INDUSTRIAS.length),
    fuente: 'lib/industrias.ts › INDUSTRIAS',
    comprobabilidad: 'derivado',
    verificadoEl: VERIFICADO_ESTRUCTURA,
    contextos: 'global',
  },
  {
    id: 'glosario',
    que: 'Términos técnicos definidos',
    valor: () => String(terminos.length),
    fuente: 'lib/glosario.ts › terminos',
    comprobabilidad: 'derivado',
    verificadoEl: VERIFICADO_ESTRUCTURA,
    contextos: ['/glosario', '/biblioteca', '/descargas', '/llms.txt'],
  },
  {
    id: 'guias',
    que: 'Guías de especificación publicadas',
    valor: () => String(guides.length),
    fuente: 'lib/guides.ts › guides',
    comprobabilidad: 'derivado',
    verificadoEl: VERIFICADO_ESTRUCTURA,
    contextos: ['/biblioteca', '/recursos', '/descargas', '/llms.txt'],
  },

  // ── Evidencia de obra ─────────────────────────────────────────────────────
  {
    id: 'proyectos-redactados',
    que: 'Fichas de proyecto escritas (publicadas o no)',
    valor: () => String(projects.length),
    fuente: 'lib/projects.ts › projects',
    comprobabilidad: 'derivado',
    verificadoEl: VERIFICADO_ESTRUCTURA,
    contextos: ['/proyectos', '/llms.txt'],
  },
  {
    id: 'proyectos-publicados',
    que: 'Fichas de proyecto CONFIRMADAS por el área comercial y visibles',
    valor: () => String(projectsPublicados.length),
    fuente: 'lib/projects.ts › verificado: true (una por una, con el área comercial)',
    comprobabilidad: 'registral',
    verificadoEl: VERIFICADO_ESTRUCTURA,
    contextos: ['/proyectos', '/llms.txt'],
  },

  // ── Estructura de descubribilidad ─────────────────────────────────────────
  {
    id: 'clusters-consulta',
    que: 'Clústeres de consulta con página canónica asignada',
    valor: () => String(clusters.length),
    fuente: 'data/topic-map.json (validado por test/mapa-consultas.test.ts)',
    comprobabilidad: 'derivado',
    verificadoEl: VERIFICADO_ESTRUCTURA,
    contextos: ['/llms.txt', '/descargas'],
  },
  {
    id: 'terminos-mapeados',
    que: 'Términos de búsqueda con una única página que los contesta',
    valor: () => String(TOTAL_TERMINOS),
    fuente: 'data/topic-map.json (validado por test/mapa-consultas.test.ts)',
    comprobabilidad: 'derivado',
    verificadoEl: VERIFICADO_ESTRUCTURA,
    contextos: ['/llms.txt', '/descargas'],
  },
];

const porId = new Map(afirmaciones.map((a) => [a.id, a]));

/** La afirmación registrada con este id. Lanza si no existe: eso es el punto. */
export function afirmacion(id: string): Afirmacion {
  const a = porId.get(id);
  if (!a) {
    throw new Error(
      `Afirmación no registrada: «${id}». Toda cifra publicable vive en lib/content/claims.ts con su fuente y su fecha de verificación.`,
    );
  }
  return a;
}

/** El valor actual de una afirmación registrada. */
export function valorDe(id: string): string {
  return afirmacion(id).valor();
}

/** ¿Puede esta afirmación aparecer en esta ruta? */
export function permitidaEn(id: string, ruta: string): boolean {
  const { contextos } = afirmacion(id);
  return contextos === 'global' || contextos.some((c) => ruta === c || ruta.startsWith(`${c}/`));
}

/** Todas las afirmaciones utilizables en una ruta. Alimenta el bloque de citación. */
export function afirmacionesPara(ruta: string): Afirmacion[] {
  return afirmaciones.filter((a) => permitidaEn(a.id, ruta));
}

/**
 * BLOQUE DE HECHOS CITABLES.
 *
 * Lo que un agente necesita para citar esta página sin adivinar: quién lo dice,
 * con qué RUC, desde dónde, desde cuándo, y cuándo se comprobó por última vez.
 * Se emite como datos, no como prosa, porque la prosa se resume y los datos se
 * copian.
 */
export function hechosCitables(ruta: string, canonical: string) {
  return {
    entidad: SITE.legalName,
    ruc: SITE.ruc,
    ubicacion: `${SITE.addressLocality}, ${SITE.addressRegion}, Perú`,
    desde: SITE.foundingYear,
    metodologia:
      'Fabricación a medida e instalación con equipo propio. Especificación confirmada en cotización; ficha técnica con cada propuesta.',
    canonical,
    afirmaciones: afirmacionesPara(ruta).map((a) => ({
      id: a.id,
      valor: a.valor(),
      fuente: a.fuente,
      verificadoEl: a.verificadoEl,
    })),
  };
}
