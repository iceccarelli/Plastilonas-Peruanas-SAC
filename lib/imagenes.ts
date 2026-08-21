import { products, productFamilies } from './products';
import { articles } from './articles';
import { solutions } from './solutions';
import { terminos } from './glosario';

/**
 * REGISTRO DE IMÁGENES.
 *
 * Qué resuelve. El catálogo ya declara 155 rutas de imagen con una convención
 * estable —/images/galeria/{slug}-{variante}.jpg— y 116 de esos archivos ya
 * existen. Lo que faltaba no era una convención: era saber CUÁLES faltan y
 * poder pedirlas sin que el nombre se desvíe.
 *
 * Por qué el registro genera los prompts en vez de guardarlos aparte. Si la
 * lista de encargos vive en un documento suelto, el día que alguien renombre
 * un producto la imagen encargada deja de encajar y nadie se entera hasta que
 * la página sale con un hueco. Acá el nombre del archivo se DERIVA del slug
 * real, y el prompt se emite desde la misma fuente: no pueden divergir.
 *
 * REGLA DE HONESTIDAD, la misma de todo el sitio. Una imagen generada no es
 * una fotografía de nuestro producto. Se declara `tipo` en cada ranura y las
 * ilustraciones se marcan como referenciales al mostrarse. Un comprador que
 * especifica contra una imagen que no corresponde al material real es un
 * problema mucho más caro que una página sin foto — y en minería, una imagen
 * técnicamente incorrecta destruye la credibilidad que todo lo demás construyó.
 *
 * Prioridad: las fotografías reales SIEMPRE reemplazan a una ilustración. El
 * registro está hecho para que esa sustitución sea cambiar un archivo.
 */

export type TipoImagen = 'foto' | 'ilustracion' | 'diagrama';

export interface RanuraImagen {
  /** Identificador estable. */
  id: string;
  /** Ruta pública, tal como la sirve el sitio. */
  ruta: string;
  ancho: number;
  alto: number;
  /**
   * Texto alternativo. Describe lo que se ve, no lo que queremos posicionar:
   * un alt con palabras clave amontonadas es spam y lo penalizan.
   */
  alt: string;
  tipo: TipoImagen;
  /** Dónde se usa, para poder revisarlo. */
  contexto: string;
  /** Encargo para generarla. Se emite con el script de prompts. */
  prompt: string;
}

/* ------------------------------------------------------------------ */
/* Estilo de casa: lo que hace que 71 imágenes parezcan una sola serie */
/* ------------------------------------------------------------------ */

/**
 * Un catálogo con imágenes de estilos distintos se ve improvisado por mucho
 * que cada una sea buena por separado. Estas dos bases se anteponen a cada
 * encargo, y son la razón por la que el conjunto se lee como un sistema.
 */
export const ESTILO_FOTO =
  'Fotografía industrial documental, realista. Luz natural de día, sin flash ni destellos. ' +
  'Encuadre limpio y ordenado, profundidad de campo moderada. Gradación de color neutra y sobria: ' +
  'sin saturación exagerada, sin HDR, sin brillos de catálogo publicitario. ' +
  'Contexto peruano creíble. Sin personas identificables ni rostros. ' +
  'Sin logotipos, marcas ni texto legible de ningún tipo. ' +
  'Sin marcas de agua. Proporción 3:2 horizontal.';

export const ESTILO_DIAGRAMA =
  'Diagrama técnico en vector plano, vista isométrica o corte transversal según convenga. ' +
  'Paleta sobria: azul profundo #0A2540 para estructura, verde #059669 solo para el elemento que se explica, ' +
  'grises neutros para el contexto. Fondo blanco liso. Líneas limpias de grosor uniforme. ' +
  'Sin texto ni etiquetas de ningún idioma dentro de la imagen: las leyendas las pone la página. ' +
  'Sin logotipos ni marcas de agua. Estilo de manual de ingeniería, no de infografía comercial.';

/** Variantes de galería que el catálogo ya espera para cada producto. */
export const VARIANTES = [
  {
    clave: 'general',
    que: 'vista general del producto completo en su contexto de uso',
  },
  {
    clave: 'detalle',
    que: 'primer plano del detalle constructivo que define su calidad (costura, refuerzo, acabado de borde o unión)',
  },
  {
    clave: 'instalacion',
    que: 'el producto durante su instalación o puesta en servicio, mostrando el proceso',
  },
  {
    clave: 'escala',
    que: 'el producto junto a un elemento que dé escala clara de su tamaño real, sin rostros',
  },
] as const;

const rutaGaleria = (slug: string, variante: string) =>
  `/images/galeria/${slug}-${variante}.jpg`;

/* ------------------------------------------------------------------ */
/* Ranuras derivadas de los datos reales                              */
/* ------------------------------------------------------------------ */

/** Productos a los que les falta la galería de cuatro variantes. */
export function ranurasProducto(): RanuraImagen[] {
  const completos = new Set(
    products
      .filter((p) =>
        VARIANTES.every((v) =>
          (p.gallery ?? []).some((g) => g.includes(`/galeria/${p.slug}-${v.clave}`)),
        ),
      )
      .map((p) => p.slug),
  );

  return products
    .filter((p) => !completos.has(p.slug))
    .flatMap((p) =>
      VARIANTES.map((v) => ({
        id: `producto:${p.slug}:${v.clave}`,
        ruta: rutaGaleria(p.slug, v.clave),
        ancho: 1920,
        alto: 1280,
        alt: `${p.name} — ${v.que}`,
        tipo: 'ilustracion' as TipoImagen,
        contexto: `Galería de /productos/${p.slug}`,
        prompt:
          `${ESTILO_FOTO}\n\nTEMA: ${p.name}. ${p.shortDescription}\n` +
          `ENCUADRE: ${v.que}.\n` +
          `USO REAL: ${(p.applications ?? []).slice(0, 3).join('; ') || p.category}.\n` +
          `SECTORES: ${(p.sector ?? []).join(', ')}.\n` +
          `IMPORTANTE: el producto debe verse técnicamente correcto para un ingeniero del rubro; ` +
          `preferir la exactitud del material y su montaje antes que la belleza de la composición.`,
      })),
    );
}

/** Portada de cada familia: once páginas indexables hoy sin imagen. */
export function ranurasFamilia(): RanuraImagen[] {
  return productFamilies.map((f) => {
    const items = products.filter((p) => p.category === f.name);
    return {
      id: `familia:${f.slug}`,
      ruta: `/images/familias/${f.slug}.jpg`,
      ancho: 1920,
      alto: 1080,
      alt: `${f.name}: ${f.tagline}`,
      tipo: 'ilustracion' as TipoImagen,
      contexto: `Portada de /productos/familia/${f.slug}`,
      prompt:
        `${ESTILO_FOTO.replace('Proporción 3:2 horizontal.', 'Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.')}\n\n` +
        `TEMA: familia de producto "${f.name}". ${f.tagline}\n` +
        `DEBE SUGERIR EL CONJUNTO, no un solo artículo: ${items.slice(0, 4).map((p) => p.name).join('; ')}.\n` +
        `ENCUADRE: escena de trabajo real donde esta familia se usa, con varios de sus elementos visibles a distinta distancia.`,
    };
  });
}

/**
 * Arquitecturas de referencia: acá el diagrama vale más que la foto.
 * Una poza revestida fotografiada se ve como un hoyo con plástico; dibujada en
 * corte se ven las cinco capas y por qué cada una está.
 */
export function ranurasSolucion(): RanuraImagen[] {
  return solutions.map((s) => ({
    id: `solucion:${s.slug}`,
    ruta: `/images/soluciones/${s.slug}.png`,
    ancho: 1600,
    alto: 900,
    alt: `Esquema de la arquitectura de referencia: ${s.titulo}`,
    tipo: 'diagrama' as TipoImagen,
    contexto: `Encabezado de /soluciones/${s.slug}`,
    prompt:
      `${ESTILO_DIAGRAMA}\n\n` +
      `TEMA: corte o vista isométrica de esta configuración: ${s.titulo}.\n` +
      `ESCENARIO: ${s.escenario}\n` +
      `COMPONENTES QUE DEBEN DISTINGUIRSE, en su posición relativa correcta:\n` +
      s.componentes
        .map((c, i) => `  ${i + 1}. ${c.producto.replace(/-/g, ' ')} — ${c.funcion}`)
        .join('\n') +
      `\nIMPORTANTE: la posición de cada capa debe ser técnicamente correcta; ` +
      `el valor del dibujo es que un ingeniero pueda verificar el orden de montaje.`,
  }));
}

/** Encabezado de cada guía técnica. */
export function ranurasGuia(): RanuraImagen[] {
  return articles.map((a) => ({
    id: `guia:${a.slug}`,
    ruta: `/images/recursos/${a.slug}.jpg`,
    ancho: 1920,
    alto: 1080,
    // El título de una guía puede ser largo; el alt se acota para no
      // convertirse en un párrafo, que es cuando deja de ayudar a quien usa
      // lector de pantalla y empieza a parecer relleno de palabras clave.
      alt: `Apertura de la guía: ${a.title.length > 120 ? `${a.title.slice(0, 117)}…` : a.title}`,
    tipo: 'ilustracion' as TipoImagen,
    contexto: `Encabezado de /recursos/${a.slug}`,
    prompt:
      `${ESTILO_FOTO.replace('Proporción 3:2 horizontal.', 'Proporción 16:9 horizontal.')}\n\n` +
      `TEMA: ${a.title}\n` +
      `DE QUÉ TRATA: ${a.description}\n` +
      `ENCUADRE: la situación de obra concreta que la guía enseña a resolver, ` +
      `en el momento en que la decisión técnica se toma. Nada de gente posando ni de oficinas.`,
  }));
}

/**
 * Términos del glosario que ganan con un dibujo. No todos: "fabricación a
 * medida" no se dibuja, y una imagen decorativa junto a una definición
 * distrae en lugar de explicar. Se eligen los que describen una GEOMETRÍA o un
 * PROCEDIMIENTO, que es donde el dibujo hace un trabajo que el texto no hace.
 */
export const TERMINOS_ILUSTRABLES = [
  'big-bag-fibc',
  'tipo-electrostatico-fibc',
  'liner-interior',
  'ojal',
  'termosellado',
  'denier',
  'geomembrana',
  'geotextil',
  'no-tejido-punzonado',
  'soldadura-por-cuna-caliente',
  'zanja-de-anclaje',
  'subrasante',
  'geomalla',
  'manga-de-ventilacion',
  'ventilacion-impelente',
  'ventilacion-aspirante',
  'refuerzo-espiral',
  'mesh',
  'arquitectura-textil',
  'pretensado',
];

export function ranurasGlosario(): RanuraImagen[] {
  return terminos
    .filter((t) => TERMINOS_ILUSTRABLES.includes(t.slug))
    .map((t) => ({
      id: `glosario:${t.slug}`,
      ruta: `/images/glosario/${t.slug}.png`,
      ancho: 1200,
      alto: 900,
      alt: `Esquema explicativo del término ${t.termino}`,
      tipo: 'diagrama' as TipoImagen,
      contexto: `Definición en /glosario/${t.slug}`,
      prompt:
        `${ESTILO_DIAGRAMA.replace('Proporción', 'Proporción')}\n\n` +
        `TÉRMINO: ${t.termino}\n` +
        `QUÉ SIGNIFICA: ${t.definicionCorta}\n` +
        (t.comoSeMide ? `CÓMO SE MIDE: ${t.comoSeMide}\n` : '') +
        `EL DIBUJO DEBE HACER EVIDENTE justamente eso y nada más: una sola idea por imagen. ` +
        `La representación tiene que ser técnicamente correcta: la geometría, las proporciones ` +
        `y el orden de los elementos deben resistir la mirada de alguien que instala esto a diario. ` +
        `Un esquema bonito y equivocado hace más daño que ninguno. ` +
        `Proporción 4:3 horizontal.`,
    }));
}

/** Todas las ranuras pendientes, en orden de prioridad de publicación. */
export function todasLasRanuras(): RanuraImagen[] {
  return [
    ...ranurasSolucion(),
    ...ranurasFamilia(),
    ...ranurasProducto(),
    ...ranurasGlosario(),
    ...ranurasGuia(),
  ];
}

/** Busca la ranura de una página concreta. */
export const ranuraPorId = (id: string): RanuraImagen | undefined =>
  todasLasRanuras().find((r) => r.id === id);
