import { SITE } from './site';
import { products } from './products';
import { articles } from './articles';
import { solutions } from './solutions';
import { terminos } from './glosario';
import { totalCriteria, pillars, FRAMEWORK_VERSION } from './framework';
import { informes } from './informes';

/**
 * CENTRO DE DOCUMENTACIÓN — el inventario de todo lo descargable.
 *
 * Por qué existe como página y no solo como enlaces sueltos. Los documentos
 * estaban repartidos: la ficha en cada producto, el brief dentro de la
 * autoevaluación, los feeds mencionados en llms.txt. Quien llega con la
 * intención "necesito documentación para armar el expediente" no tenía dónde
 * aterrizar, y un agente no tenía forma de saber que existían.
 *
 * Por qué se DERIVA de las fuentes. Un inventario escrito a mano miente en
 * cuanto se agrega un producto. Acá los conteos y las URLs salen del catálogo,
 * de las guías, de las arquitecturas y del glosario: si mañana hay 40 líneas,
 * la página dice 40 sin que nadie la toque.
 *
 * REGLA: solo entra lo que existe y responde. Un enlace de descarga roto en la
 * página de descargas es la forma más rápida de perder a un comprador técnico.
 */

export type FormatoDescarga = 'pdf' | 'json' | 'rss' | 'txt' | 'xml';

export interface Descarga {
  titulo: string;
  descripcion: string;
  /** Para quién es y en qué momento se usa. */
  paraQuien: string;
  href: string;
  formato: FormatoDescarga;
  /** "36 documentos", "43 términos": el volumen real, derivado. */
  volumen: string;
  /** Página de origen, para volver al contenido en línea. */
  origen?: string;
}

export interface GrupoDescargas {
  id: string;
  titulo: string;
  intro: string;
  items: Descarga[];
}

export const formatoLabels: Record<FormatoDescarga, string> = {
  pdf: 'PDF',
  json: 'JSON',
  rss: 'RSS',
  txt: 'Texto',
  xml: 'XML',
};

export function grupos(): GrupoDescargas[] {
  return [
    {
      id: 'documentos',
      titulo: 'Documentos técnicos en PDF',
      intro:
        'Se generan desde las mismas fuentes que alimentan el sitio, de modo que la versión descargada y la publicada nunca divergen. Ninguno declara precio, certificaciones ni ensayos que el catálogo no contenga.',
      items: [
        {
          titulo: 'Marco de Especificación completo',
          descripcion:
            'Los criterios públicos para definir un proyecto antes de cotizarlo, con qué decide cada uno y qué ocurre en obra si el dato no existe.',
          paraQuien:
            'Para adjuntar a un requerimiento de compra o evaluar varias propuestas con el mismo rasero.',
          href: '/marco/marco.pdf',
          formato: 'pdf',
          volumen: `${totalCriteria()} criterios · ${pillars.length} pilares · v${FRAMEWORK_VERSION}`,
          origen: '/marco',
        },
        {
          titulo: 'Informes del sector',
          descripcion:
            'Estadística oficial peruana de los sectores que compran estos productos, con la fuente de cada cifra y qué implica técnicamente para especificar.',
          paraQuien:
            'Para sustentar una decisión ante un comité o justificar por qué una especificación cambia según el emplazamiento.',
          href: '/informes',
          formato: 'pdf',
          volumen: `${informes.length} ${informes.length === 1 ? 'informe' : 'informes'}`,
          origen: '/informes',
        },
        {
          titulo: 'Glosario técnico completo',
          descripcion:
            'El vocabulario del rubro: qué significa cada término, en qué unidad se mide y qué decide en obra.',
          paraQuien:
            'Para repartir al equipo técnico o dejar impreso en la oficina de obra, donde no hay señal.',
          href: '/glosario/glosario.pdf',
          formato: 'pdf',
          volumen: `${terminos.length} términos`,
          origen: '/glosario',
        },
        {
          titulo: 'Fichas técnicas de producto',
          descripcion:
            'Una por línea de catálogo: especificaciones, aplicaciones, sectores, origen de suministro y disponibilidad.',
          paraQuien: 'Para el expediente técnico y para circular dentro de su empresa.',
          href: '/productos',
          formato: 'pdf',
          volumen: `${products.length} fichas`,
          origen: '/productos',
        },
        {
          titulo: 'Guías de especificación e instalación',
          descripcion:
            'Cada guía con su desarrollo completo, sus tablas, sus preguntas frecuentes y las fuentes citadas con URL.',
          paraQuien: 'Para llevar el criterio al frente de trabajo, donde el enlace no sirve.',
          href: '/recursos',
          formato: 'pdf',
          volumen: `${articles.length} guías`,
          origen: '/recursos',
        },
        {
          titulo: 'Arquitecturas de referencia',
          descripcion:
            'Lista de materiales completa con el criterio que gobierna cada componente, secuencia de ejecución y modos de falla.',
          paraQuien: 'Para pedir presupuesto interno de un conjunto, no de piezas sueltas.',
          href: '/soluciones',
          formato: 'pdf',
          volumen: `${solutions.length} configuraciones`,
          origen: '/soluciones',
        },
      ],
    },
    {
      id: 'datos',
      titulo: 'Datos abiertos para agentes e integraciones',
      intro:
        'Publicados en formatos estándar, con instrucción explícita de atribución dentro del propio archivo y acceso permitido desde otros orígenes. Ninguno contiene precios ni existencias: la disponibilidad se declara como modo de suministro, que es un dato estable, y el precio se establece en cada cotización.',
      items: [
        {
          titulo: 'Catálogo completo',
          descripcion:
            'Todas las líneas con sus especificaciones, aplicaciones, sectores, modo de suministro, ficha en PDF, términos del glosario que las gobiernan y arquitecturas donde encajan.',
          paraQuien: 'Para integraciones, comparadores y agentes que necesiten el catálogo entero.',
          href: '/productos/catalogo.json',
          formato: 'json',
          volumen: `${products.length} productos`,
          origen: '/productos',
        },
        {
          titulo: 'Glosario técnico',
          descripcion:
            'El vocabulario como conjunto de términos definidos, con URL canónica por concepto y cita sugerida.',
          paraQuien: 'Para resolver definiciones del rubro y atribuirlas correctamente.',
          href: '/glosario/terminos.json',
          formato: 'json',
          volumen: `${terminos.length} términos`,
          origen: '/glosario',
        },
        {
          titulo: 'Mapa del sitio para modelos de lenguaje',
          descripcion:
            'La entidad, el catálogo, la cobertura, el marco, las arquitecturas y el registro fechado en un solo documento legible de una lectura.',
          paraQuien: 'Para que un agente resuelva la empresa y su catálogo sin rastrear el sitio.',
          href: '/llms.txt',
          formato: 'txt',
          volumen: 'Documento único',
        },
        {
          titulo: 'Novedades — feed RSS',
          descripcion: 'Registro fechado de cada cambio publicado, con enlace a lo que cambió.',
          paraQuien: 'Para suscribirse a la referencia en lugar de tener que volver a mirar.',
          href: '/novedades/rss.xml',
          formato: 'rss',
          volumen: 'Actualizado por cambio',
          origen: '/novedades',
        },
        {
          titulo: 'Novedades — JSON Feed',
          descripcion: 'El mismo registro en formato de datos, sin necesitar un lector de XML.',
          paraQuien:
            'Para agentes y scripts que sigan los cambios sin necesitar un lector de XML.',
          href: '/novedades/feed.json',
          formato: 'json',
          volumen: 'Actualizado por cambio',
          origen: '/novedades',
        },
        {
          titulo: 'Mapa del sitio XML',
          descripcion: 'Todas las URLs indexables con su fecha de última modificación real.',
          paraQuien:
            'Para rastreadores y para comprobar qué URLs publica el sitio y cuándo cambió cada una.',
          href: '/sitemap.xml',
          formato: 'xml',
          volumen: 'Todas las rutas públicas',
        },
      ],
    },
  ];
}

/** Todas las descargas en una lista plana: para el sitemap y los tests. */
export const todasLasDescargas = (): Descarga[] => grupos().flatMap((g) => g.items);

/** URL absoluta de una descarga, heredada de SITE.url. */
export const descargaUrl = (d: Descarga): string => `${SITE.url}${d.href}`;
