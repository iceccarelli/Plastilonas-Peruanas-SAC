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
  'carga-de-trabajo-segura',
  'factor-de-seguridad',
  'tipo-electrostatico-fibc',
  'liner-interior',
  'densidad-aparente',
  'gramaje',
  'lona-plastificada',
  'denier',
  'resistencia-al-desgarro',
  'estabilizacion-uv',
  'termosellado',
  'ojal',
  'geosintetico',
  'geomembrana',
  'hdpe',
  'geotextil',
  'no-tejido-punzonado',
  'resistencia-al-punzonamiento',
  'permitividad',
  'soldadura-por-cuna-caliente',
  'zanja-de-anclaje',
  'subrasante',
  'geomalla',
  'manga-de-ventilacion',
  'ventilacion-impelente',
  'ventilacion-aspirante',
  'refuerzo-espiral',
  'caudal',
  'perdida-de-carga',
  'factor-de-fuga',
  'malla-antiafida',
  'mesh',
  'porcentaje-de-sombra',
  'malla-raschel',
  'arquitectura-textil',
  'pretensado',
  'carga-de-viento',
  'altitud-y-radiacion',
  'certificado-de-lote',
  'as-built',
];

/**
 * Pista de composición por término.
 *
 * Por qué hace falta. El prompt genérico —definición corta más unidad de
 * medida— funciona para lo que tiene forma evidente: un ojal, una zanja de
 * anclaje. Falla en lo abstracto: "factor de seguridad" o "permitividad" no
 * tienen aspecto, y un generador al que se le pide dibujarlos devuelve una
 * ilustración vaga y decorativa, que es peor que ninguna porque ocupa el sitio
 * de la buena.
 *
 * Cada pista dice QUÉ COMPONER, no qué estilo usar: el estilo ya lo fija
 * ESTILO_DIAGRAMA. Están escritas para que el dibujo haga visible la relación
 * que el texto explica —dos escalas enfrentadas, dos estados del mismo objeto,
 * un corte que revela capas— y no para que quede bonito.
 *
 * DOS TÉRMINOS QUEDAN FUERA A PROPÓSITO: `fabricacion-a-medida` y
 * `fabricacion-a-medida-vs-importacion` describen un modo de aprovisionamiento
 * comercial. No tienen geometría, y cualquier imagen sería relleno. Una página
 * sin imagen es mejor que una imagen que no explica nada.
 */
export const PISTAS_VISUALES: Record<string, string> = {
  'big-bag-fibc':
    'Bolsón visto en tres cuartos con sus cuatro asas tensadas por el izaje, boca de carga arriba y boca de descarga abajo señaladas por su geometría. Un gancho de montacargas entrando en las asas.',
  'carga-de-trabajo-segura':
    'Dos escalas verticales enfrentadas sobre el mismo bolsón: la de la izquierda marca la carga de trabajo, la de la derecha la carga de rotura, mucho más alta. La distancia entre ambas es el margen, y debe leerse a simple vista.',
  'factor-de-seguridad':
    'Cinco bloques idénticos apilados junto a un bolsón que sostiene solo uno: la proporción 5:1 expresada como cantidad, no como número escrito.',
  'tipo-electrostatico-fibc':
    'Cuatro bolsones en fila, idénticos en forma y distintos en su tratamiento de la carga: uno liso, uno con paños de tejido de baja tensión, uno con hilos conductores y su cable a tierra conectado, uno con tejido disipativo sin cable. La diferencia debe estar en el tejido y en la presencia o ausencia del cable.',
  'liner-interior':
    'Corte del bolsón con la bolsa interior visible como una segunda piel separada del tejido exterior, conteniendo material fino que el tejido dejaría pasar.',
  'densidad-aparente':
    'Dos recipientes del mismo volumen lado a lado: uno con partículas gruesas y muchos huecos, otro con partículas finas y pocos huecos. Bajo cada uno, una balanza marcando pesos claramente distintos.',
  'gramaje':
    'Un cuadrado de un metro por un metro recortado de la lona, suspendido sobre el plato de una balanza. La superficie unitaria y la masa, nada más.',
  'lona-plastificada':
    'Corte transversal muy ampliado con las tres capas separadas y visibles: recubrimiento superior, tejido base con su trama de hilos cruzados, recubrimiento inferior.',
  'denier':
    'Tres hilos en paralelo, de grosor claramente creciente, y bajo ellos la misma longitud de referencia. El grosor es la variable.',
  'resistencia-al-desgarro':
    'Dos paños idénticos: en uno la fuerza tira de un borde intacto; en el otro, de un corte ya iniciado que se propaga. Las dos flechas de fuerza son del mismo tamaño y el resultado es distinto.',
  'estabilizacion-uv':
    'Dos fragmentos del mismo material bajo el mismo haz solar: en el de la izquierda las cadenas del polímero se mantienen; en el de la derecha aparecen fracturadas y el borde se resquebraja. La diferencia es el aditivo, representado como partículas dispersas en la masa del primero.',
  'termosellado':
    'Corte de dos láminas superpuestas: arriba una unión continua donde el material se fundió y es un solo cuerpo; abajo, para contraste, una costura con hilo que perfora ambas capas.',
  'ojal':
    'Corte del borde de una lona con el ojal instalado: refuerzo local de material bajo el anillo, y la cuerda tirando. El área sobre la que se reparte el esfuerzo debe ser evidente.',
  'geosintetico':
    'Corte de terreno con las distintas familias en su posición típica: geomalla trabando el árido arriba, geotextil separando capas, geomembrana como barrera, geocompuesto drenando. Cada una en su función, no en fila.',
  'geomembrana':
    'Corte de talud y fondo con la lámina continua sobre el terreno, mostrando los tres puntos donde se pierde la continuidad: unión, penetración y anclaje perimetral.',
  'hdpe':
    'Comparación de estructura molecular esquemática: cadenas lineales apretadas y ordenadas (alta densidad) frente a cadenas ramificadas y sueltas. Sin fórmulas.',
  'geotextil':
    'Dos paños ampliados lado a lado: uno de fibras entrelazadas al azar y gran espesor, otro de hilos cruzados en ángulo recto. La diferencia de construcción es todo el dibujo.',
  'no-tejido-punzonado':
    'Corte del velo de fibras con las agujas de púas descendiendo y arrastrando fibras de una capa a otra, dejando la estructura entrelazada y esponjosa.',
  'resistencia-al-punzonamiento':
    'Una piedra angulosa de la subrasante empujando desde abajo contra el geotextil y la geomembrana: se ve la deformación absorbida por el geotextil y la lámina intacta encima.',
  'permitividad':
    'Un mismo geotextil con dos flujos representados: uno atravesándolo perpendicularmente (permitividad) y otro corriendo dentro de su espesor a lo largo del plano (transmisividad).',
  'soldadura-por-cuna-caliente':
    'Corte de dos láminas solapadas con la cuña entrando entre ellas y los rodillos presionando: se ven las DOS pistas de soldadura y el canal de aire que queda entre ambas, con la aguja de presurización.',
  'zanja-de-anclaje':
    'Corte del borde superior del talud: la excavación perimetral con la lámina bajando dentro, doblada al fondo y cubierta con material compactado. La distancia a la corona del talud debe verse.',
  'subrasante':
    'Corte del terreno preparado: superficie perfilada y compactada, y junto a ella —tachados o apartados— los elementos que no deben quedar: piedra angulosa, raíz, encharcamiento.',
  'geomalla':
    'Corte de terreno con la geomalla tendida y el árido trabado dentro de sus aberturas: las partículas encajan en la retícula y el conjunto se comporta como un bloque.',
  'manga-de-ventilacion':
    'Labor subterránea en corte longitudinal con el ventilador en la bocamina, la manga tendida por el techo y el frente de trabajo al fondo.',
  'ventilacion-impelente':
    'Corte de labor: el ventilador empuja aire por la manga hasta el frente; el aire limpio barre el frente y retorna por la labor. Las flechas de ida van dentro de la manga y las de retorno por fuera.',
  'ventilacion-aspirante':
    'Corte de labor: la manga succiona desde el frente y la sección del ducto tiende a cerrarse por la depresión. Las flechas van en sentido contrario al caso impelente.',
  'refuerzo-espiral':
    'Tramo de manga en corte con el alambre helicoidal en su pared, y al lado la misma manga sin refuerzo mostrando la sección aplastada.',
  'caudal':
    'Una sección transversal de conducto con el volumen de aire que la atraviesa representado como un bloque que avanza en el tiempo.',
  'perdida-de-carga':
    'Ducto en corte longitudinal con la presión decreciendo a lo largo del recorrido, y las pérdidas localizadas marcadas en los codos y los acoples.',
  'factor-de-fuga':
    'Ducto tendido con pequeñas fugas escapando en cada unión a lo largo del recorrido, de modo que el flujo que llega al final es visiblemente menor que el que entró.',
  'malla-antiafida':
    'Ampliación de la trama con insectos de distinto tamaño frente a la abertura: uno queda fuera, otro pasa. La relación tamaño de abertura contra tamaño del insecto es el dibujo.',
  'mesh':
    'Una pulgada de referencia sobre la trama, con los hilos contados dentro de esa distancia. Dos tramas de distinta densidad para comparar.',
  'porcentaje-de-sombra':
    'Haz de radiación incidiendo sobre la malla: una parte se intercepta y otra pasa, representadas como dos fracciones claramente distintas del haz original.',
  'malla-raschel':
    'Ampliación de la estructura de tejido de urdimbre Raschel, mostrando el enlazado que impide que se deshilache, y un borde cortado que se mantiene íntegro.',
  'arquitectura-textil':
    'Superficie de membrana con doble curvatura opuesta —forma de silla de montar— anclada en sus puntos altos y bajos, con las líneas de tracción marcadas.',
  'pretensado':
    'La misma membrana en dos estados: floja y aleteando por el viento, y tensada y estable. El sistema de retensado visible en el anclaje.',
  'carga-de-viento':
    'Viento incidiendo sobre una cubierta ligera con las flechas de succión tirando hacia arriba mucho más marcadas que las de presión: el arrancamiento domina.',
  'altitud-y-radiacion':
    'Corte de la atmósfera con dos emplazamientos: uno al nivel del mar y otro en altura. El haz solar atraviesa mucho menos espesor atmosférico en el segundo y llega con más intensidad.',
  'certificado-de-lote':
    'Un rollo de material con su etiqueta de lote y, unido por una línea de trazabilidad, el documento que declara los ensayos de ESE lote. La correspondencia uno a uno es el mensaje.',
  'as-built':
    'Planta de una poza con el despiece real de paneles numerados, las líneas de unión marcadas y los puntos de reparación señalados en su posición.',
};

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
        (PISTAS_VISUALES[t.slug] ? `QUÉ COMPONER: ${PISTAS_VISUALES[t.slug]}\n` : '') +
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
