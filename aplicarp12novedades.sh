#!/usr/bin/env bash
# =============================================================================
#  P12 — /novedades: el registro fechado
#  Plastilonas Peruanas SAC
#
#  Qué hace este parche
#  --------------------
#  El sitio no tenía fecha. Un comprador que vuelve no podía responder "¿qué
#  hay acá que no estaba la última vez?", y ningún rastreador tenía una señal
#  de frescura que no fuera un lastmod movido a mano en cada despliegue.
#
#  P12 publica el registro: cada cambio que altera lo que se puede especificar,
#  comparar o descargar entra con su fecha real y el enlace a lo que cambió.
#  Siete entradas iniciales, todas verificables. Con feed RSS 2.0 y JSON Feed
#  1.1 para que un tercero se suscriba en vez de tener que volver a mirar, y el
#  <link rel="alternate"> declarado en TODO el sitio.
#
#  No es un blog: los tests rechazan "próximamente", obras ejecutadas, clientes
#  y cifras de negocio, y validan que cada enlace resuelva a una ruta real.
#
#  Uso:
#    ls aplicar*p12*          # el nombre puede llegar alterado por GitHub
#    bash aplicarp12novedades.sh
#
#  Requisito: ejecutar desde la raíz del repositorio (donde está package.json).
# =============================================================================
set -euo pipefail

if [ ! -f package.json ]; then
  echo "ERROR: ejecute este script desde la raíz del repositorio." >&2
  exit 1
fi

# -----------------------------------------------------------------------------
# lib/novedades.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/novedades.ts" <<'P12_EOF'
import { SITE } from './site';

/**
 * NOVEDADES — el registro fechado de lo que cambia en esta referencia.
 *
 * Qué es. Un feed cronológico de cada cambio publicado que altera lo que un
 * comprador puede especificar, comparar o descargar. Es el equivalente del
 * "What's New" de un proveedor de infraestructura: no es un blog, no opina,
 * no anuncia intenciones. Cada entrada apunta a algo que YA está en línea y
 * que el lector puede abrir en el mismo clic.
 *
 * Por qué existe. Una referencia sin fecha no se distingue de un folleto. El
 * comprador técnico que vuelve al sitio necesita responder en diez segundos
 * "¿qué hay acá que no estaba la última vez?", y los agentes y rastreadores
 * necesitan una señal de frescura que no sea un `lastmod` movido a mano en
 * cada deploy. Este archivo es esa señal, y es verificable: si una entrada
 * miente, el enlace la delata.
 *
 * Por qué es un MECANISMO y no una campaña. La regla es de proceso, no de
 * voluntad: todo cambio que agregue, modifique o retire una línea de producto,
 * una guía, un criterio del marco o una arquitectura de referencia entra acá
 * el mismo día, con su enlace. Nada más entra. Un feed que también publica
 * "felices fiestas" deja de ser consultable en tres meses.
 *
 * REGLAS DE HONESTIDAD — obligatorias al añadir una entrada:
 *  1. `fecha` es la fecha real de publicación del cambio. No se antedata para
 *     simular actividad ni se agrupa un mes de trabajo en un solo día.
 *  2. Toda entrada enlaza a la página que cambió. Sin enlace verificable no
 *     hay entrada (hay un test que valida cada href contra las rutas reales).
 *  3. No se anuncia lo que todavía no está desplegado. Nada de "próximamente".
 *  4. Las cifras históricas se congelan a propósito: "36 líneas" en una
 *     entrada de agosto describe el catálogo de ese día, no el de hoy. Por eso
 *     NO se derivan de lib/products.ts — un registro fechado que se reescribe
 *     solo deja de ser un registro.
 *  5. No se publican obras ejecutadas, clientes ni cifras de negocio. Este
 *     feed documenta la referencia pública, no la operación comercial.
 */

export type NovedadTipo = 'catalogo' | 'guia' | 'herramienta' | 'referencia';

export const tipoLabels: Record<NovedadTipo, string> = {
  catalogo: 'Catálogo',
  guia: 'Guía técnica',
  herramienta: 'Herramienta',
  referencia: 'Referencia del rubro',
};

/** Qué significa cada tipo, para que la etiqueta no dependa del contexto. */
export const tipoDescripciones: Record<NovedadTipo, string> = {
  catalogo: 'Cambios en las líneas de producto publicadas y en cómo se navegan.',
  guia: 'Guías de especificación e instalación nuevas o revisadas, con sus fuentes.',
  herramienta: 'Utilidades que producen un documento o una decisión: fichas, comparadores, autoevaluaciones.',
  referencia: 'Material que define criterios del rubro y es útil aunque el proyecto se compre a otro proveedor.',
};

export interface NovedadEnlace {
  label: string;
  href: string;
}

export interface Novedad {
  slug: string;
  /** Fecha real de publicación, ISO (YYYY-MM-DD). */
  fecha: string;
  tipo: NovedadTipo;
  titulo: string;
  /** Una frase. Alimenta la meta description, el RSS y el JSON Feed. */
  resumen: string;
  /** Qué cambia para quien especifica o compra. La razón para leer la entrada. */
  queCambia: string;
  detalle: string[];
  enlaces: NovedadEnlace[];
}

/**
 * Orden de escritura: cronológico ascendente (se agrega al final).
 * La exportación `novedades` lo invierte, de modo que agregar una entrada
 * nunca obliga a tocar las anteriores.
 */
const registro: Novedad[] = [
  {
    slug: 'silo-tecnico-recursos-primeras-guias',
    fecha: '2026-08-17',
    tipo: 'guia',
    titulo: 'Abre /recursos: guías de especificación con las fuentes a la vista',
    resumen:
      'Publicamos las primeras tres guías técnicas sobre big bags en minería, instalación de geomembranas HDPE y cálculo de caudal en mangas de ventilación.',
    queCambia:
      'Las decisiones que antes se resolvían por teléfono quedan escritas, con la norma o el método que las respalda citado y enlazado.',
    detalle: [
      'El catálogo respondía qué vendemos, no cómo se especifica. Las primeras tres guías cubren los tres puntos donde vimos fallar más proyectos: la estiba y el izaje de big bags en operación minera, el anclaje y la soldadura de geomembrana HDPE en pozas y canales, y el cálculo de caudal para dimensionar una manga de ventilación en labor subterránea.',
      'Cada cifra normativa lleva su fuente con URL. Donde no pudimos verificar el número de artículo de una norma vigente, la guía lo dice y remite al texto oficial en lugar de inventarlo. Los cálculos se publican como método reproducible de prediseño, no como memoria firmada.',
    ],
    enlaces: [
      { label: 'Guías técnicas', href: '/recursos' },
      {
        label: 'Big bags en minería: normativa y errores de estiba',
        href: '/recursos/big-bags-mineria-peru-normativa-errores-estiba',
      },
      {
        label: 'Instalación de geomembranas HDPE en pozas y canales',
        href: '/recursos/instalacion-geomembranas-hdpe-pozas-canales',
      },
    ],
  },
  {
    slug: 'paginas-de-familia-con-criterios',
    fecha: '2026-08-17',
    tipo: 'catalogo',
    titulo: 'Las once familias del catálogo pasan a tener página propia',
    resumen:
      'Cada familia de producto tiene ahora URL estable, criterios de especificación, sectores que la compran y sus guías relacionadas.',
    queCambia:
      'Se puede enviar el enlace de una familia completa —con lo que gobierna su elección— en vez de once fichas sueltas o un catálogo filtrado que no se puede compartir.',
    detalle: [
      'La navegación por familia se resolvía filtrando el catálogo en el navegador, de modo que once mercados con intención distinta compartían una sola dirección. Ahora cada familia tiene su página: qué resuelve, qué define su especificación, con qué sectores se usa, cómo la abastecemos y en qué estado está la oferta.',
      'El dato de abastecimiento y disponibilidad sale del catálogo, no de una redacción de marketing: si una línea es de fabricación propia, importación directa o bajo pedido, la página lo declara.',
    ],
    enlaces: [
      { label: 'Catálogo por familia', href: '/productos' },
      { label: 'Envases y embalaje', href: '/productos/familia/envases-embalaje' },
      { label: 'Lonas y cobertores', href: '/productos/familia/lonas-cobertores' },
    ],
  },
  {
    slug: 'siete-guias-nuevas-silo-a-diez',
    fecha: '2026-08-17',
    tipo: 'guia',
    titulo: 'Siete guías nuevas: el silo técnico llega a diez',
    resumen:
      'Ventilación impelente frente a aspirante, elección de geotextil, densidad de malla antiáfida, carga de viento en carpas, transporte de concentrado, tanques flexibles y cálculo de mulch.',
    queCambia:
      'Las siete decisiones que más veces nos llegan mal definidas quedan documentadas con su criterio y su fuente, disponibles antes de pedir cotización.',
    detalle: [
      'Cada guía nueva nació de un modo de falla real observado en obra, no de una lista de palabras clave: la manga aspirante sin refuerzo que colapsa, la malla cerrada que sube la temperatura del cultivo porque nadie recalculó la ventilación, la carpa dimensionada sin la carga de viento de la norma E.020.',
      'Ese mismo patrón es el que después se formalizó como Marco de Especificación: un modo de falla documentado se convierte en un criterio verificable.',
    ],
    enlaces: [
      { label: 'Guías técnicas', href: '/recursos' },
      {
        label: 'Ventilación impelente vs. aspirante en labores mineras',
        href: '/recursos/ventilacion-impelente-vs-aspirante-labores-mineras',
      },
      {
        label: 'Carpas industriales: carga de viento y norma E.020',
        href: '/recursos/carpas-industriales-carga-viento-norma-e020',
      },
    ],
  },
  {
    slug: 'fichas-tecnicas-pdf-descargables',
    fecha: '2026-08-19',
    tipo: 'herramienta',
    titulo: 'Ficha técnica en PDF descargable para las 36 líneas del catálogo',
    resumen:
      'Cada producto genera su ficha en PDF desde el mismo catálogo que alimenta la web: especificaciones, aplicaciones, sectores, abastecimiento y disponibilidad.',
    queCambia:
      'El expediente técnico se arma sin esperar respuesta comercial, y la ficha nunca contradice a la página porque ambas salen de la misma fuente.',
    detalle: [
      'En una compra industrial la ficha se adjunta a un expediente, se reenvía a un jefe de planta y se archiva. Pedirla por correo agrega un día al ciclo y produce versiones que se desactualizan solas.',
      'El PDF se genera desde lib/products.ts en tiempo de compilación, así que no existe una versión "de marketing" divergente. La ficha no declara certificaciones ni números de lote: esos documentos los emite el fabricante y se entregan con la cotización.',
    ],
    enlaces: [
      { label: 'Catálogo completo', href: '/productos' },
      {
        label: 'Ejemplo: ficha de big bags de polipropileno',
        href: '/productos/big-bags-bolsones-polipropileno',
      },
    ],
  },
  {
    slug: 'comparador-lado-a-lado-por-familia',
    fecha: '2026-08-19',
    tipo: 'herramienta',
    titulo: 'Comparador lado a lado dentro de cada familia',
    resumen:
      'Las familias con dos o más líneas tienen una tabla comparativa con las especificaciones enfrentadas y el criterio que decide entre ellas.',
    queCambia:
      'La comparación deja de hacerse abriendo pestañas en paralelo, y la cotización se arma con las alternativas ya seleccionadas.',
    detalle: [
      'Comparar era el paso que el sitio dejaba al cliente: abrir varias fichas, copiar especificaciones a una hoja y perder por el camino el criterio que realmente decide. La tabla enfrenta las líneas de una misma familia campo por campo.',
      'Desde la comparativa se pasa a la cotización con las alternativas ya cargadas, de modo que la consulta llega con la especificación puesta y no como "necesito lonas".',
    ],
    enlaces: [
      {
        label: 'Comparar lonas y cobertores',
        href: '/productos/familia/lonas-cobertores/comparar',
      },
      { label: 'Catálogo por familia', href: '/productos' },
    ],
  },
  {
    slug: 'marco-de-especificacion-v1',
    fecha: '2026-08-19',
    tipo: 'referencia',
    titulo: 'Publicamos el Marco de Especificación v1.0: 26 criterios en 6 pilares',
    resumen:
      'Un conjunto público de criterios para definir un proyecto textil industrial o geosintético antes de cotizarlo, con autoevaluación y brief descargable.',
    queCambia:
      'Existe un estándar escrito contra el cual medir cualquier propuesta —incluida la nuestra— y una autoevaluación que dice qué falta definir antes de pedir precios.',
    detalle: [
      'Los proyectos rara vez fallan por el material: fallan por lo que nadie definió. El marco convierte cada modo de falla documentado en nuestras guías en una pregunta verificable, agrupada en seis pilares: compatibilidad, cargas, exposición, ejecución, documentación y operación.',
      'La autoevaluación puntúa cuán definido está el proyecto del cliente, no a los proveedores: no es un ranking disfrazado. El brief se genera en el navegador y las respuestas no se envían a ningún servidor.',
      'Es útil aunque el proyecto termine comprándose a un competidor. Esa es exactamente la razón por la que un criterio publicado se convierte en referencia y una lista de ventajas propias no.',
    ],
    enlaces: [
      { label: 'Marco de Especificación', href: '/marco' },
      { label: 'Autoevaluación con brief descargable', href: '/marco/evaluacion' },
    ],
  },
  {
    slug: 'seis-arquitecturas-de-referencia',
    fecha: '2026-08-19',
    tipo: 'referencia',
    titulo: 'Seis arquitecturas de referencia: el conjunto armado, no la pieza suelta',
    resumen:
      'Poza revestida, frente de avance ventilado, despacho de concentrado a granel, protección de cultivo, almacenamiento de agua en operación remota y campamento con almacén temporal.',
    queCambia:
      'Quien necesita resolver un escenario completo ve la lista de materiales entera, el orden de ejecución y qué falla al comprar por piezas sueltas.',
    detalle: [
      'El catálogo vendía componentes y nunca mostraba el conjunto montado. Un jefe de proyecto que debe revestir una poza de proceso no busca "geomembrana HDPE 1.5 mm": busca la poza, y descubre tarde que faltaba el geotextil de protección o el detalle de anclaje.',
      'Cada arquitectura publica su escenario, la lista de materiales donde cada componente declara el criterio que lo gobierna, la secuencia de ejecución, los riesgos frecuentes y las guías que documentan cada paso.',
      'No son casos de estudio. No declaran obras ejecutadas, clientes ni cifras: describen configuraciones técnicas verificables contra el catálogo.',
    ],
    enlaces: [
      { label: 'Arquitecturas de referencia', href: '/soluciones' },
      {
        label: 'Poza de proceso revestida',
        href: '/soluciones/poza-revestida-impermeabilizacion',
      },
      { label: 'Frente de avance ventilado', href: '/soluciones/frente-avance-ventilado' },
    ],
  },
];

/** Novedades de la más reciente a la más antigua. */
export const novedades: Novedad[] = [...registro].sort((a, b) =>
  a.fecha === b.fecha ? registro.indexOf(b) - registro.indexOf(a) : b.fecha.localeCompare(a.fecha),
);

export const novedadBySlug = (slug: string): Novedad | undefined =>
  novedades.find((n) => n.slug === slug);

/** Fecha de la última novedad: señal de frescura para sitemap y feeds. */
export const NOVEDADES_UPDATED: string = novedades[0]?.fecha ?? '';

/** Tipos presentes, en el orden en que se declaran las etiquetas. */
export const tiposPresentes = (): NovedadTipo[] =>
  (Object.keys(tipoLabels) as NovedadTipo[]).filter((t) => novedades.some((n) => n.tipo === t));

export const novedadesPorTipo = (tipo: NovedadTipo): Novedad[] =>
  novedades.filter((n) => n.tipo === tipo);

/** Agrupa por mes para el índice, conservando el orden descendente. */
export function novedadesPorMes(): { mes: string; etiqueta: string; items: Novedad[] }[] {
  const meses = new Map<string, Novedad[]>();
  for (const n of novedades) {
    const mes = n.fecha.slice(0, 7);
    const acc = meses.get(mes);
    if (acc) acc.push(n);
    else meses.set(mes, [n]);
  }
  return [...meses.entries()].map(([mes, items]) => ({
    mes,
    etiqueta: etiquetaDeMes(mes),
    items,
  }));
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
];

/** "2026-08" → "agosto de 2026". Setiembre con "t": uso peruano. */
export function etiquetaDeMes(mes: string): string {
  const [anio, m] = mes.split('-');
  return `${MESES[Number(m) - 1]} de ${anio}`;
}

/** "2026-08-19" → "19 de agosto de 2026". Sin Intl: la salida debe ser estable. */
export function fechaLarga(fecha: string): string {
  const [anio, m, d] = fecha.split('-');
  return `${Number(d)} de ${MESES[Number(m) - 1]} de ${anio}`;
}

export const novedadUrl = (slug: string): string => `${SITE.url}/novedades/${slug}`;
P12_EOF

# -----------------------------------------------------------------------------
# lib/novedades-feed.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/novedades-feed.ts" <<'P12_EOF'
import { SITE } from './site';
import { novedades, tipoLabels, novedadUrl } from './novedades';

/**
 * Feeds del registro fechado: RSS 2.0 y JSON Feed 1.1.
 *
 * Por qué dos formatos y no uno. RSS lo consumen lectores, agregadores del
 * rubro y Bing; JSON Feed lo consumen agentes y scripts sin necesitar un
 * parser de XML. Un feed es la única forma de que un tercero se suscriba a la
 * referencia en lugar de tener que volver a mirar si algo cambió.
 *
 * Vive en lib/ y no en el route handler porque los handlers de Next solo
 * pueden exportar métodos HTTP y configuración: cualquier export extra rompe
 * la compilación. Además así los tests pueden ejercitar el XML directamente.
 */

/** Escapa los cinco caracteres que rompen un documento XML. */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Fecha ISO corta → RFC 822, obligatorio en RSS 2.0.
 * Se fija a mediodía UTC: con 00:00 un lector en zona negativa (Lima es UTC-5)
 * muestra la entrada un día antes de la fecha publicada.
 */
export function toRfc822(fecha: string): string {
  return new Date(`${fecha}T12:00:00Z`).toUTCString();
}

export function buildRss(): string {
  const base = SITE.url;
  const items = novedades
    .map((n) => {
      const url = novedadUrl(n.slug);
      return `    <item>
      <title>${escapeXml(n.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc822(n.fecha)}</pubDate>
      <category>${escapeXml(tipoLabels[n.tipo])}</category>
      <description>${escapeXml(n.resumen)}</description>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Novedades — ${escapeXml(SITE.name)}</title>
    <link>${base}/novedades</link>
    <atom:link href="${base}/novedades/rss.xml" rel="self" type="application/rss+xml" />
    <description>Registro fechado de cambios publicados en el catálogo, las guías técnicas, el Marco de Especificación y las arquitecturas de referencia de ${escapeXml(SITE.name)}.</description>
    <language>${SITE.language}</language>
    <lastBuildDate>${toRfc822(novedades[0].fecha)}</lastBuildDate>
    <generator>${base}</generator>
${items}
  </channel>
</rss>
`;
}

export function buildJsonFeed(): string {
  const base = SITE.url;
  return `${JSON.stringify(
    {
      version: 'https://jsonfeed.org/version/1.1',
      title: `Novedades — ${SITE.name}`,
      home_page_url: `${base}/novedades`,
      feed_url: `${base}/novedades/feed.json`,
      description:
        'Registro fechado de cambios publicados en el catálogo, las guías técnicas, el Marco de Especificación y las arquitecturas de referencia.',
      language: SITE.language,
      authors: [{ name: SITE.legalName, url: base }],
      items: novedades.map((n) => ({
        id: novedadUrl(n.slug),
        url: novedadUrl(n.slug),
        title: n.titulo,
        summary: n.resumen,
        content_text: [n.queCambia, ...n.detalle].join('\n\n'),
        date_published: `${n.fecha}T12:00:00Z`,
        tags: [tipoLabels[n.tipo]],
      })),
    },
    null,
    2,
  )}\n`;
}
P12_EOF

# -----------------------------------------------------------------------------
# app/novedades/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/novedades"
cat > "app/novedades/page.tsx" <<'P12_EOF'
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Rss } from 'lucide-react';
import {
  novedades,
  novedadesPorMes,
  tipoLabels,
  tipoDescripciones,
  tiposPresentes,
  fechaLarga,
  NOVEDADES_UPDATED,
} from '@/lib/novedades';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';

/**
 * Índice del registro fechado.
 *
 * Responde en diez segundos "¿qué hay acá que no estaba la última vez?".
 * Agrupa por mes, marca el tipo de cambio y enlaza los feeds, para que un
 * tercero pueda suscribirse a la referencia en vez de tener que volver a
 * mirar. Nada de paginación ni de filtros en cliente: el registro entero cabe
 * en una página y una URL sin parámetros es la que se cita.
 */

const URL = `${SITE.url}/novedades`;
const TITLE = 'Novedades: qué cambió y cuándo';
const DESCRIPTION = `Registro fechado de los cambios publicados por ${SITE.name}: líneas de catálogo, guías técnicas, herramientas y criterios del rubro. Cada entrada enlaza a lo que cambió. Con feed RSS y JSON.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/novedades',
    types: {
      'application/rss+xml': [{ url: '/novedades/rss.xml', title: `Novedades — ${SITE.name}` }],
      'application/feed+json': [{ url: '/novedades/feed.json', title: `Novedades — ${SITE.name}` }],
    },
  },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

const tipoBadge: Record<string, string> = {
  catalogo: 'bg-blue-50 text-blue-700',
  guia: 'bg-emerald-50 text-emerald-700',
  herramienta: 'bg-amber-50 text-amber-700',
  referencia: 'bg-gray-100 text-gray-700',
};

export default function NovedadesPage() {
  const meses = novedadesPorMes();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="novedades" slug="indice" />
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            type: 'CollectionPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Novedades', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          itemListSchema({
            url: URL,
            name: 'Novedades',
            description: DESCRIPTION,
            items: novedades.map((n) => ({
              name: n.titulo,
              url: `${SITE.url}/novedades/${n.slug}`,
            })),
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span className="text-gray-700">Novedades</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">Novedades</h1>

      <p className="speakable-intro mb-6 max-w-3xl text-lg text-gray-700">
        Cada cambio publicado que altera lo que se puede especificar, comparar o descargar
        entra acá el mismo día, con el enlace a lo que cambió. No es un blog: no hay
        opinión, no hay anuncios de lo que viene, no hay felicitaciones de fin de año.
        Si una entrada dice algo, el enlace lo demuestra.
      </p>

      <p className="mb-10 font-mono text-sm text-gray-500">
        {novedades.length} entradas · última actualización {fechaLarga(NOVEDADES_UPDATED)}
      </p>

      {/* Suscripción: la diferencia entre que vuelvan a mirar y que les llegue. */}
      <div className="mb-12 flex flex-wrap items-center gap-3 rounded-3xl border border-gray-100 p-6">
        <Rss className="h-5 w-5 text-[#059669]" aria-hidden="true" />
        <p className="flex-1 text-gray-700">
          Suscríbase al registro en lugar de volver a revisarlo. El feed publica el mismo
          contenido, sin registro ni correo.
        </p>
        <div className="flex gap-2">
          <a
            href="/novedades/rss.xml"
            className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
          >
            RSS
          </a>
          <a
            href="/novedades/feed.json"
            className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
          >
            JSON Feed
          </a>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Qué entra en este registro
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {tiposPresentes().map((t) => (
            <div key={t} className="rounded-2xl border border-gray-100 p-5">
              <dt>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${tipoBadge[t]}`}
                >
                  {tipoLabels[t]}
                </span>
              </dt>
              <dd className="mt-2 text-sm text-gray-600">{tipoDescripciones[t]}</dd>
            </div>
          ))}
        </dl>
      </section>

      {meses.map((mes) => (
        <section key={mes.mes} className="mb-14">
          <h2 className="mb-6 border-b border-gray-100 pb-2 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {mes.etiqueta}
          </h2>
          <ol className="space-y-6">
            {mes.items.map((n) => (
              <li key={n.slug}>
                <Link
                  href={`/novedades/${n.slug}`}
                  className="group block rounded-3xl border border-gray-100 p-6 transition-colors hover:border-[#059669]/40"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <time
                      dateTime={n.fecha}
                      className="font-mono text-sm text-gray-500"
                    >
                      {n.fecha}
                    </time>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${tipoBadge[n.tipo]}`}
                    >
                      {tipoLabels[n.tipo]}
                    </span>
                  </div>
                  <span className="mb-2 block text-xl font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                    {n.titulo}
                  </span>
                  <span className="block text-gray-600">{n.resumen}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#059669]">
                    Ver el detalle <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Falta un criterio que usted sí aplica?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Este registro crece con los modos de falla que encontramos en obra. Si en su
          operación hay uno que no está documentado, escríbanos: entra al Marco de
          Especificación y a las guías, con su fuente.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Escribirnos
          </Link>
          <Link
            href="/marco"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Ver el Marco de Especificación <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
P12_EOF

# -----------------------------------------------------------------------------
# app/novedades/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/novedades/[slug]"
cat > "app/novedades/[slug]/page.tsx" <<'P12_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  novedades,
  novedadBySlug,
  tipoLabels,
  fechaLarga,
} from '@/lib/novedades';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { articleSchema, breadcrumbSchema, webPageSchema } from '@/lib/schema';

/**
 * Entrada del registro fechado.
 *
 * Una entrada es citable por sí sola: título, fecha, qué cambia para quien
 * especifica, el detalle y los enlaces a lo publicado. Emite Article (no
 * TechArticle: esto es un anuncio de cambio, no una guía) con datePublished
 * real — la señal de frescura que un `lastmod` movido a mano no da.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return novedades.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = novedadBySlug(slug);
  if (!n) return {};
  const url = `${SITE.url}/novedades/${slug}`;
  return {
    title: n.titulo,
    description: n.resumen,
    alternates: { canonical: `/novedades/${slug}` },
    openGraph: {
      title: `${n.titulo} | ${SITE.name}`,
      description: n.resumen,
      url,
      locale: SITE.locale,
      type: 'article',
      publishedTime: n.fecha,
    },
  };
}

export default async function NovedadPage({ params }: Props) {
  const { slug } = await params;
  const n = novedadBySlug(slug);
  if (!n) notFound();

  const url = `${SITE.url}/novedades/${slug}`;
  const indice = novedades.findIndex((x) => x.slug === slug);
  const anterior = novedades[indice + 1];
  const siguiente = novedades[indice - 1];

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <TrackView kind="novedades" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: n.titulo,
            description: n.resumen,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          articleSchema({
            url,
            headline: n.titulo,
            description: n.resumen,
            datePublished: n.fecha,
            dateModified: n.fecha,
            section: tipoLabels[n.tipo],
            articleType: 'Article',
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Novedades', url: `${SITE.url}/novedades` },
              { name: n.titulo, url },
            ],
            `${url}#breadcrumb`,
          ),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        /{' '}
        <Link href="/novedades" className="hover:text-[#059669]">
          Novedades
        </Link>{' '}
        / <span className="text-gray-700">{fechaLarga(n.fecha)}</span>
      </nav>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <time dateTime={n.fecha} className="font-mono text-sm text-gray-500">
          {n.fecha}
        </time>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          {tipoLabels[n.tipo]}
        </span>
      </div>

      <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {n.titulo}
      </h1>

      <p className="speakable-intro mb-8 text-lg text-gray-700">{n.resumen}</p>

      <div className="mb-10 rounded-3xl border-l-4 border-[#059669] bg-gray-50 p-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Qué cambia
        </h2>
        <p className="text-gray-800">{n.queCambia}</p>
      </div>

      <div className="mb-12 space-y-5 text-gray-700">
        {n.detalle.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <section className="mb-14">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Lo publicado
        </h2>
        <ul className="space-y-3">
          {n.enlaces.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="font-medium text-[#0A2540] group-hover:text-[#059669]">
                  {e.label}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#059669]" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <nav className="mb-14 grid gap-4 border-t border-gray-100 pt-8 sm:grid-cols-2">
        {anterior ? (
          <Link
            href={`/novedades/${anterior.slug}`}
            className="group rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
          >
            <span className="mb-1 flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-gray-500">
              <ArrowLeft className="h-3 w-3" /> Anterior
            </span>
            <span className="block font-medium text-[#0A2540] group-hover:text-[#059669]">
              {anterior.titulo}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {siguiente && (
          <Link
            href={`/novedades/${siguiente.slug}`}
            className="group rounded-2xl border border-gray-100 p-5 text-right transition-colors hover:border-[#059669]/40 sm:col-start-2"
          >
            <span className="mb-1 flex items-center justify-end gap-1 text-xs uppercase tracking-[0.12em] text-gray-500">
              Siguiente <ArrowRight className="h-3 w-3" />
            </span>
            <span className="block font-medium text-[#0A2540] group-hover:text-[#059669]">
              {siguiente.titulo}
            </span>
          </Link>
        )}
      </nav>

      <div className="rounded-3xl border border-gray-100 p-8 text-center">
        <p className="mb-5 text-gray-700">
          El registro completo, con feed para suscribirse sin dejar un correo.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/novedades"
            className="inline-flex items-center justify-center rounded-2xl bg-[#0A2540] px-8 py-3 font-semibold text-white hover:bg-[#059669]"
          >
            Ver todas las novedades
          </Link>
          <a
            href="/novedades/rss.xml"
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-8 py-3 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
          >
            Feed RSS
          </a>
        </div>
      </div>
    </article>
  );
}
P12_EOF

# -----------------------------------------------------------------------------
# app/novedades/rss.xml/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/novedades/rss.xml"
cat > "app/novedades/rss.xml/route.ts" <<'P12_EOF'
import { buildRss } from '@/lib/novedades-feed';

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  return new Response(buildRss(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'all',
    },
  });
}
P12_EOF

# -----------------------------------------------------------------------------
# app/novedades/feed.json/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/novedades/feed.json"
cat > "app/novedades/feed.json/route.ts" <<'P12_EOF'
import { buildJsonFeed } from '@/lib/novedades-feed';

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  return new Response(buildJsonFeed(), {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'all',
    },
  });
}
P12_EOF

# -----------------------------------------------------------------------------
# test/novedades.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/novedades.test.ts" <<'P12_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  novedades,
  novedadBySlug,
  novedadesPorMes,
  novedadesPorTipo,
  tipoLabels,
  tipoDescripciones,
  tiposPresentes,
  fechaLarga,
  etiquetaDeMes,
  NOVEDADES_UPDATED,
} from '@/lib/novedades';
import { buildRss, buildJsonFeed, escapeXml, toRfc822 } from '@/lib/novedades-feed';
import { products } from '@/lib/products';
import { articles } from '@/lib/articles';
import { solutions } from '@/lib/solutions';
import { familyContent, comparableFamilies } from '@/lib/families';
import { generateStaticParams } from '@/app/novedades/[slug]/page';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';

/**
 * El registro fechado sólo vale si no se puede mentir en él sin romper la
 * compilación. Estos tests son el mecanismo: validan que cada enlace resuelva
 * a una ruta real del sitio, que ninguna entrada esté fechada en el futuro y
 * que los feeds sean documentos válidos.
 */

/** Todas las rutas internas que el sitio realmente publica. */
const rutasValidas = new Set<string>([
  '/',
  '/productos',
  '/servicios',
  '/nosotros',
  '/contacto',
  '/cotizacion',
  '/local',
  '/recursos',
  '/marco',
  '/marco/evaluacion',
  '/soluciones',
  '/novedades',
  ...products.map((p) => `/productos/${p.slug}`),
  ...articles.map((a) => `/recursos/${a.slug}`),
  ...solutions.map((s) => `/soluciones/${s.slug}`),
  ...familyContent.map((f) => `/productos/familia/${f.slug}`),
  ...comparableFamilies().map((f) => `/productos/familia/${f.slug}/comparar`),
  ...novedades.map((n) => `/novedades/${n.slug}`),
]);

describe('novedades: el registro no puede mentir', () => {
  it('cada enlace de cada entrada resuelve a una ruta que existe', () => {
    // Sin esto, una entrada puede anunciar algo que no se desplegó. El enlace
    // roto es exactamente la forma en que un registro fechado pierde su valor.
    for (const n of novedades) {
      expect(n.enlaces.length, `${n.slug} sin enlaces`).toBeGreaterThan(0);
      for (const e of n.enlaces) {
        expect(rutasValidas.has(e.href), `${n.slug} → ${e.href}`).toBe(true);
      }
    }
  });

  it('ninguna entrada está fechada en el futuro', () => {
    const hoy = new Date().toISOString().slice(0, 10);
    for (const n of novedades) {
      expect(n.fecha <= hoy, `${n.slug} fechada ${n.fecha}`).toBe(true);
    }
  });

  it('las fechas son ISO estrictas (YYYY-MM-DD) y parseables', () => {
    for (const n of novedades) {
      expect(n.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(`${n.fecha}T12:00:00Z`))).toBe(false);
    }
  });

  it('el orden es estrictamente descendente por fecha', () => {
    for (let i = 1; i < novedades.length; i++) {
      expect(novedades[i - 1].fecha >= novedades[i].fecha).toBe(true);
    }
  });

  it('los slugs son únicos y en kebab-case', () => {
    const vistos = new Set<string>();
    for (const n of novedades) {
      expect(n.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(vistos.has(n.slug), `slug duplicado: ${n.slug}`).toBe(false);
      vistos.add(n.slug);
    }
  });

  it('cada entrada declara qué cambia para quien especifica', () => {
    // Un registro que sólo dice "publicamos X" obliga al lector a deducir por
    // qué debería importarle. Ese campo es obligatorio por eso.
    for (const n of novedades) {
      expect(n.queCambia.length, n.slug).toBeGreaterThan(40);
      expect(n.detalle.length, n.slug).toBeGreaterThan(0);
    }
  });

  it('el resumen cabe como meta description', () => {
    for (const n of novedades) {
      expect(n.resumen.length, `${n.slug}: ${n.resumen.length}`).toBeLessThanOrEqual(200);
      expect(n.resumen.length).toBeGreaterThan(50);
    }
  });

  it('no se anuncia lo que todavía no está publicado', () => {
    // "Próximamente" convierte el registro en una lista de intenciones.
    const prohibido = /pr[óo]ximamente|muy pronto|estamos trabajando|en desarrollo|pr[óo]xima versi[óo]n/i;
    for (const n of novedades) {
      const texto = [n.titulo, n.resumen, n.queCambia, ...n.detalle].join(' ');
      expect(prohibido.test(texto), n.slug).toBe(false);
    }
  });

  it('no se declaran obras ejecutadas, clientes ni cifras de negocio', () => {
    const prohibido = /nuestro cliente|caso de éxito|caso de exito|facturaci[óo]n|ventas por|premio|certificad[oa]s? por/i;
    for (const n of novedades) {
      const texto = [n.titulo, n.resumen, n.queCambia, ...n.detalle].join(' ');
      expect(prohibido.test(texto), n.slug).toBe(false);
    }
  });

  it('cada tipo declarado tiene etiqueta y descripción', () => {
    for (const n of novedades) {
      expect(tipoLabels[n.tipo], n.slug).toBeTruthy();
      expect(tipoDescripciones[n.tipo], n.slug).toBeTruthy();
    }
    for (const t of tiposPresentes()) {
      expect(novedadesPorTipo(t).length).toBeGreaterThan(0);
    }
  });
});

describe('novedades: rutas y descubrimiento', () => {
  it('generateStaticParams cubre todas las entradas', () => {
    const params = generateStaticParams().map((p) => p.slug).sort();
    expect(params).toEqual(novedades.map((n) => n.slug).sort());
  });

  it('novedadBySlug encuentra cada entrada y rechaza las inexistentes', () => {
    for (const n of novedades) expect(novedadBySlug(n.slug)?.titulo).toBe(n.titulo);
    expect(novedadBySlug('no-existe')).toBeUndefined();
  });

  it('el sitemap incluye el índice y todas las entradas con su fecha real', () => {
    const urls = new Map(sitemap().map((e) => [e.url, e.lastModified]));
    expect(urls.has(`${SITE.url}/novedades`)).toBe(true);
    for (const n of novedades) {
      const lastMod = urls.get(`${SITE.url}/novedades/${n.slug}`);
      expect(lastMod, n.slug).toBeDefined();
      // La fecha del sitemap es la de publicación, no la del despliegue: un
      // lastmod movido en cada deploy le enseña a Google a ignorarlo.
      expect(new Date(lastMod as Date).toISOString().slice(0, 10)).toBe(n.fecha);
    }
  });

  it('el índice agrupa por mes sin perder ni duplicar entradas', () => {
    const agrupadas = novedadesPorMes().flatMap((m) => m.items);
    expect(agrupadas.map((n) => n.slug)).toEqual(novedades.map((n) => n.slug));
  });

  it('NOVEDADES_UPDATED es la fecha de la entrada más reciente', () => {
    expect(NOVEDADES_UPDATED).toBe(novedades[0].fecha);
  });

  it('las fechas se formatean en español peruano sin depender de Intl', () => {
    expect(fechaLarga('2026-08-19')).toBe('19 de agosto de 2026');
    expect(fechaLarga('2026-09-01')).toBe('1 de setiembre de 2026');
    expect(etiquetaDeMes('2026-08')).toBe('agosto de 2026');
  });
});

describe('novedades: descubrimiento del feed en todo el sitio', () => {
  const layout = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');

  it('el <head> raíz declara el feed RSS en JSX, no en metadata.alternates', () => {
    // Cada página define su propio alternates.canonical y Next reemplaza el
    // objeto entero: puesto en metadata, el enlace del feed sólo sobrevivía en
    // /novedades. Se verificó midiendo el HTML renderizado, no leyendo la API.
    expect(layout).toMatch(/rel="alternate"/);
    expect(layout).toMatch(/type="application\/rss\+xml"/);
    expect(layout).toMatch(/novedades\/rss\.xml/);
  });

  it('la URL del feed se deriva de SITE.url y no está escrita a mano', () => {
    expect(layout).toMatch(/\$\{SITE\.url\}\/novedades\/rss\.xml/);
    expect(layout).not.toContain('https://plastilonas.com');
  });
});

describe('novedades: feeds', () => {
  const rss = buildRss();

  it('escapa los caracteres que rompen el XML', () => {
    expect(escapeXml('Lonas & "cobertores" <1.5 mm>')).toBe(
      'Lonas &amp; &quot;cobertores&quot; &lt;1.5 mm&gt;',
    );
  });

  it('el RSS declara cabecera, canal y un item por entrada', () => {
    expect(rss.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(rss).toContain('<rss version="2.0"');
    expect((rss.match(/<item>/g) ?? []).length).toBe(novedades.length);
    expect((rss.match(/<\/item>/g) ?? []).length).toBe(novedades.length);
  });

  it('el RSS no contiene ampersands sin escapar', () => {
    // Un solo & crudo invalida el documento entero para cualquier lector.
    expect(rss).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#)/);
  });

  it('todas las URLs del feed heredan de SITE.url', () => {
    // Nunca se codifica el dominio a mano: el día de la migración a
    // plastilonas.com debe bastar con cambiar lib/site.ts. Se exceptúan los
    // espacios de nombres XML, que son identificadores y no direcciones.
    const NAMESPACES = ['http://www.w3.org/'];
    for (const n of novedades) {
      expect(rss).toContain(`${SITE.url}/novedades/${n.slug}`);
    }
    const urls = (rss.match(/https?:\/\/[^\s"'<>]+/g) ?? []).filter(
      (u) => !NAMESPACES.some((ns) => u.startsWith(ns)),
    );
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u.startsWith(SITE.url), u).toBe(true);
  });

  it('las fechas del RSS son RFC 822 y no se corren de día en Lima', () => {
    // Con 00:00Z un lector en UTC-5 muestra la entrada el día anterior.
    expect(toRfc822('2026-08-19')).toBe('Wed, 19 Aug 2026 12:00:00 GMT');
    for (const n of novedades) expect(rss).toContain(toRfc822(n.fecha));
  });

  it('el JSON Feed es válido y expone las mismas entradas', () => {
    const feed = JSON.parse(buildJsonFeed());
    expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
    expect(feed.items).toHaveLength(novedades.length);
    expect(feed.feed_url).toBe(`${SITE.url}/novedades/feed.json`);
    for (const [i, item] of feed.items.entries()) {
      expect(item.id).toBe(`${SITE.url}/novedades/${novedades[i].slug}`);
      expect(item.date_published).toBe(`${novedades[i].fecha}T12:00:00Z`);
      expect(item.content_text.length).toBeGreaterThan(0);
    }
  });
});
P12_EOF

# -----------------------------------------------------------------------------
# lib/schema.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/schema.ts" <<'P12_EOF'
/**
 * Constructores de JSON-LD. Solo se emiten campos respaldados por datos reales.
 * Nunca Review/AggregateRating sin reseñas genuinas almacenadas, nunca
 * certificaciones ni premios no verificables.
 *
 * GRAFO DE ENTIDAD — regla crítica:
 * El sitio emite UN solo nodo por entidad, identificado por @id estable, y todo
 * lo demás lo referencia. Dos nodos LocalBusiness con @id distintos describiendo
 * la misma empresa fragmentan la entidad y desperdician las señales.
 *
 *   ${SITE.url}/#organization  → Organization  (components/StructuredData.tsx)
 *   ${SITE.url}/#business      → LocalBusiness (components/StructuredData.tsx)
 *   ${SITE.url}/#website       → WebSite       (components/StructuredData.tsx)
 *
 * Las páginas internas NO redeclaran esos nodos: los referencian con
 * businessRef() / organizationRef() / websiteRef().
 */
import { SITE } from "./site";

type Dict = Record<string, unknown>;

export const ORGANIZATION_ID = `${SITE.url}/#organization`;
export const BUSINESS_ID = `${SITE.url}/#business`;
export const WEBSITE_ID = `${SITE.url}/#website`;

/** Referencia al nodo Organization global (no lo redeclara). */
export function organizationRef(): Dict {
  return { "@id": ORGANIZATION_ID };
}

/** Referencia al nodo LocalBusiness global (no lo redeclara). */
export function businessRef(): Dict {
  return { "@id": BUSINESS_ID };
}

/** Referencia al nodo WebSite global (no lo redeclara). */
export function websiteRef(): Dict {
  return { "@id": WEBSITE_ID };
}

/**
 * Nodo WebPage de la página actual, anclado al WebSite. Sustituye al antiguo
 * speakableSchema() suelto, que emitía un WebPage huérfano sin @id ni url —
 * un nodo sin identidad no se conecta al grafo y no aporta señal.
 */
export function webPageSchema(page: {
  url: string;
  name: string;
  description?: string;
  /** Selectores CSS del contenido apto para asistentes de voz. */
  speakable?: string[];
  /** Breadcrumb de la página, si aplica. */
  breadcrumbId?: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage" | "ItemPage";
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": page.type ?? "WebPage",
    "@id": `${page.url}#webpage`,
    url: page.url,
    name: page.name,
    ...(page.description ? { description: page.description } : {}),
    isPartOf: websiteRef(),
    about: businessRef(),
    inLanguage: SITE.language,
    ...(page.breadcrumbId ? { breadcrumb: { "@id": page.breadcrumbId } } : {}),
    ...(page.speakable
      ? {
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: page.speakable,
          },
        }
      : {}),
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
  id?: string,
): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    ...(id ? { "@id": id } : {}),
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function faqSchema(qas: { q: string; a: string }[], url?: string): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(url ? { "@id": `${url}#faq` } : {}),
    ...(url ? { url } : {}),
    inLanguage: SITE.language,
    mainEntity: qas.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  };
}

/**
 * Servicio prestado en una ciudad concreta. Es la señal local correcta: en vez
 * de clonar el LocalBusiness (que vive en Chorrillos) en cada página de ciudad,
 * se declara el servicio con areaServed = la ciudad y provider = la empresa.
 */
export function serviceSchema(s: {
  name: string;
  description: string;
  url: string;
  cityName: string;
  regionName: string;
  serviceTypes?: string[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${s.url}#service`,
    name: s.name,
    description: s.description,
    url: s.url,
    provider: businessRef(),
    areaServed: {
      "@type": "City",
      name: s.cityName,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: s.regionName,
        containedInPlace: { "@type": "Country", name: "Perú" },
      },
    },
    ...(s.serviceTypes?.length ? { serviceType: s.serviceTypes } : {}),
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE.url}/cotizacion`,
      servicePhone: {
        "@type": "ContactPoint",
        telephone: SITE.phoneWhatsApp,
        contactType: "sales",
      },
    },
  };
}

/** Lista ordenada de URLs internas (catálogo, cobertura local, artículos). */
export function itemListSchema(list: {
  url: string;
  name: string;
  description?: string;
  items: { name: string; url: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${list.url}#itemlist`,
    name: list.name,
    ...(list.description ? { description: list.description } : {}),
    numberOfItems: list.items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: list.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

/**
 * Artículo técnico del silo /recursos. Se ancla al WebPage de su propia URL y
 * declara autoría organizacional: la autoridad la sostiene la empresa, no una
 * firma personal inventada.
 */
export function articleSchema(a: {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  section: string;
  keywords?: string[];
  wordCount?: number;
  /** Fuentes externas que respaldan las cifras del artículo. */
  citations?: { label: string; url: string }[];
  /**
   * TechArticle es lo correcto para una guía de especificación. Un anuncio
   * fechado del registro de novedades NO es documentación técnica: declararlo
   * TechArticle degrada la señal de todo el silo /recursos.
   */
  articleType?: "TechArticle" | "Article";
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": a.articleType ?? "TechArticle",
    "@id": `${a.url}#article`,
    headline: a.headline,
    description: a.description,
    url: a.url,
    mainEntityOfPage: { "@id": `${a.url}#webpage` },
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    articleSection: a.section,
    inLanguage: SITE.language,
    author: organizationRef(),
    publisher: organizationRef(),
    ...(a.keywords?.length ? { keywords: a.keywords.join(", ") } : {}),
    ...(a.wordCount ? { wordCount: a.wordCount } : {}),
    ...(a.citations?.length
      ? {
          citation: a.citations.map((c) => ({
            "@type": "CreativeWork",
            name: c.label,
            url: c.url,
          })),
        }
      : {}),
  };
}

/** Procedimiento paso a paso. Solo para secuencias reales y verificables. */
export function howToSchema(h: {
  url: string;
  name: string;
  description: string;
  totalTime?: string;
  steps: { name: string; text: string }[];
}): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${h.url}#howto`,
    name: h.name,
    description: h.description,
    inLanguage: SITE.language,
    ...(h.totalTime ? { totalTime: h.totalTime } : {}),
    step: h.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${h.url}#paso-${i + 1}`,
    })),
  };
}

/**
 * @deprecated Redeclaraba un LocalBusiness con @id propio, fragmentando la
 * entidad frente al nodo global de components/StructuredData.tsx. Usa
 * businessRef() dentro de about/provider, o webPageSchema() para la página.
 * Se mantiene devolviendo solo la referencia para no romper importaciones.
 */
export function localBusinessSchema(): Dict {
  return businessRef();
}

/** @deprecated Usa webPageSchema({ speakable }) — un WebPage suelto es huérfano. */
export function speakableSchema(cssSelectors: string[]): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: SITE.language,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
  };
}

export function organizationSchema(): Dict {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    foundingDate: SITE.foundingYear,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "RUC",
      value: SITE.ruc,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.addressStreet,
      addressLocality: SITE.addressLocality,
      addressRegion: SITE.addressRegion,
      addressCountry: SITE.addressCountry,
    },
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
}

export function productSchema(p: {
  name: string;
  description: string;
  url: string;
  image?: string;
  material?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
}): Dict {
  const offers =
    p.priceMin != null
      ? {
          "@type": "AggregateOffer",
          priceCurrency: p.currency ?? "PEN",
          lowPrice: p.priceMin,
          ...(p.priceMax != null ? { highPrice: p.priceMax } : {}),
          availability: "https://schema.org/InStock",
          seller: businessRef(),
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    url: p.url,
    ...(p.image ? { image: p.image } : {}),
    ...(p.material ? { material: p.material } : {}),
    brand: { "@type": "Brand", name: SITE.name },
    ...(offers ? { offers } : {}),
  };
}
P12_EOF

# -----------------------------------------------------------------------------
# lib/analytics.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/analytics.ts" <<'P12_EOF'
/**
 * Capa de analítica y conversiones (GA4 + Meta Pixel + GTM).
 *
 * `trackEvent` envía UN evento semántico a todos los proveedores cargados.
 * Nada se ejecuta si el proveedor no está presente (IDs ausentes o sin
 * consentimiento), de modo que llamar a estas funciones siempre es seguro.
 *
 * POR QUÉ IMPORTA: en el Perú B2B el canal de leads es WhatsApp. Si los clics a
 * WhatsApp no se miden, no se puede saber qué página, qué familia o qué ciudad
 * produce negocio — y toda inversión publicitaria se hace a ciegas. Por eso
 * TODO punto de salida a WhatsApp debe pasar por `components/WhatsAppLink.tsx`,
 * que dispara `whatsapp_click` con el contexto de origen. Hay un test que falla
 * si alguien vuelve a escribir un enlace `wa.me` a mano.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', name, params);
  window.fbq?.('trackCustom', name, params);
  window.dataLayer?.push({ event: name, ...params });
}

/* ------------------------------------------------------------------ */
/* Conversiones — miden intención de compra, no vanidad.               */
/* ------------------------------------------------------------------ */

/**
 * El formulario de cotización se ABRIÓ. Junto con `quote_request` da la tasa
 * de abandono del formulario, que es lo que dice si el formulario pide de más.
 */
export function trackQuoteStarted(context: string, producto?: string): void {
  trackEvent('quote_started', { context, producto: producto ?? 'general' });
}

/** Solicitud de cotización enviada — la conversión principal del negocio. */
export function trackQuoteRequest(producto?: string): void {
  const content = producto ?? 'general';
  trackEvent('quote_request', { producto: content });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Lead', { content_name: content });
  }
}

/**
 * Clic para contactar por WhatsApp — canal #1 de leads en Perú.
 * `context` identifica el punto de salida (footer, ficha de producto, ciudad…)
 * para poder atribuir el lead a la página que lo generó.
 */
export function trackWhatsAppClick(context?: string): void {
  trackEvent('whatsapp_click', { context: context ?? 'general' });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Contact');
  }
}

/** Primer mensaje enviado al asistente: intención real, no apertura del widget. */
export function trackChatbotEngaged(): void {
  trackEvent('chatbot_engaged');
}

/** Descarga de ficha técnica u otro documento. */
export function trackDocumentDownload(documento: string, producto?: string): void {
  trackEvent('document_download', { documento, producto: producto ?? 'general' });
}

/** Clic en un ícono de red social. */
export function trackSocialClick(network: string): void {
  trackEvent('social_click', { network });
}

/* ------------------------------------------------------------------ */
/* Vistas de contenido — qué silo produce demanda.                     */
/* ------------------------------------------------------------------ */

export function trackProductView(slug: string, categoria: string): void {
  trackEvent('product_view', { slug, categoria });
}

export function trackFamilyView(slug: string): void {
  trackEvent('family_view', { slug });
}

export function trackCityPageView(ciudad: string): void {
  trackEvent('city_page_view', { ciudad });
}

export function trackArticleView(slug: string, categoria: string): void {
  trackEvent('article_view', { slug, categoria });
}

/**
 * Vista de una tabla comparativa. Es la señal de intención más avanzada del
 * catálogo: quien compara especificación por especificación ya está eligiendo
 * proveedor, no explorando.
 */
export function trackComparisonView(familia: string): void {
  trackEvent('comparison_view', { familia });
}

/** Vista de una arquitectura de referencia: intención de proyecto completo. */
export function trackSolutionView(slug: string): void {
  trackEvent('solution_view', { slug });
}

/**
 * Vista del registro fechado. Mide lo que ninguna otra métrica del sitio mide:
 * si la frescura sostiene el retorno de un comprador que ya nos conoce.
 */
export function trackNovedadView(slug: string): void {
  trackEvent('novedad_view', { slug });
}

/* ------------------------------------------------------------------ */
/* Marco de Especificación — el embudo de mayor intención del sitio.   */
/* ------------------------------------------------------------------ */

/** Vista del marco publicado o de la autoevaluación. */
export function trackFrameworkView(seccion: string): void {
  trackEvent('framework_view', { seccion });
}

/** El usuario respondió el primer criterio: empezó de verdad. */
export function trackFrameworkStarted(): void {
  trackEvent('framework_started');
}

/**
 * Autoevaluación completada. El porcentaje es la señal comercial: un proyecto
 * "Definido" está listo para cotizar; uno "Exploratorio" necesita asesoría.
 */
export function trackFrameworkCompleted(porcentaje: number, nivel: string): void {
  trackEvent('framework_completed', { porcentaje, nivel });
}

/** Descarga del brief técnico generado por la autoevaluación. */
export function trackBriefDownload(nivel: string): void {
  trackEvent('brief_download', { nivel });
}
P12_EOF

# -----------------------------------------------------------------------------
# components/TrackView.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/TrackView.tsx" <<'P12_EOF'
'use client';

import { useEffect, useRef } from 'react';
import {
  trackArticleView,
  trackCityPageView,
  trackComparisonView,
  trackFamilyView,
  trackFrameworkView,
  trackSolutionView,
  trackNovedadView,
  trackProductView,
} from '@/lib/analytics';

/**
 * Emite un evento de vista de contenido una sola vez por montaje.
 *
 * Se renderiza desde páginas de servidor (fichas, familias, ciudades,
 * artículos) sin convertirlas en client components: solo este pequeño
 * componente se hidrata. Sin estos eventos no se puede responder a la pregunta
 * que decide dónde invertir: ¿qué silo produce cotizaciones?
 */

type Props =
  | { kind: 'product'; slug: string; categoria: string }
  | { kind: 'family'; slug: string }
  | { kind: 'city'; ciudad: string }
  | { kind: 'article'; slug: string; categoria: string }
  | { kind: 'comparison'; slug: string }
  | { kind: 'framework'; slug: string }
  | { kind: 'solution'; slug: string }
  | { kind: 'novedades'; slug: string };

export default function TrackView(props: Props) {
  const fired = useRef(false);

  useEffect(() => {
    // React 18 monta dos veces en desarrollo con StrictMode: sin esta guarda
    // el evento se duplicaría y las tasas de conversión saldrían a la mitad.
    if (fired.current) return;
    fired.current = true;

    switch (props.kind) {
      case 'product':
        trackProductView(props.slug, props.categoria);
        break;
      case 'family':
        trackFamilyView(props.slug);
        break;
      case 'city':
        trackCityPageView(props.ciudad);
        break;
      case 'article':
        trackArticleView(props.slug, props.categoria);
        break;
      case 'comparison':
        trackComparisonView(props.slug);
        break;
      case 'framework':
        trackFrameworkView(props.slug);
        break;
      case 'solution':
        trackSolutionView(props.slug);
        break;
      case 'novedades':
        trackNovedadView(props.slug);
        break;
    }
  }, [props]);

  return null;
}
P12_EOF

# -----------------------------------------------------------------------------
# app/layout.tsx
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/layout.tsx" <<'P12_EOF'
import ExitIntentModal from '@/components/ExitIntentModal';
import type { Metadata } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import CartDrawer from '@/components/CartDrawer';
import { Toaster } from 'sonner';
import AuthProvider from '@/components/AuthProvider';
import StructuredData from '@/components/StructuredData';
import { SITE } from '@/lib/site';
import Analytics from '@/components/Analytics';
import WebPush from '@/components/WebPush';
import ConsentBanner from '@/components/ConsentBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['700'],
});

// Mono para metadatos técnicos (specs, estados, conteos).
// Patrón AWS: la monoespaciada señala "dato de ingeniería", no marketing.
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Plastilonas Peruanas SAC | Soluciones Industriales de Lona y Plástico',
    template: '%s | Plastilonas Peruanas SAC',
  },
  description: 'Más de 15 años fabricando e instalando soluciones industriales a medida en el Perú: big bags, lonas y cobertores, geosintéticos, estructuras y arquitectura textil, mallas agrícolas, ventilación industrial y más. Un solo proveedor, fabricación propia e instalación.',
  keywords: [
    'plastilonas peruanas',
    'big bags lima',
    'geomembranas perú',
    'carpas industriales',
    'mantas para camiones',
    'lona plastificada',
    'soluciones textiles industriales',
    'fabricación a medida perú',
    'big bags minería',
    'geomembrana pvc',
  ],
  authors: [{ name: 'Plastilonas Peruanas SAC' }],
  creator: 'Plastilonas Peruanas SAC',
  publisher: 'Plastilonas Peruanas SAC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Origen canónico único (lib/site.ts): alimenta canonicals, OG e imágenes.
  metadataBase: new URL(SITE.url),
  // Verificación de propiedad en Search Console y Bing Webmaster Tools.
  // Se emiten SOLO si la variable existe: una meta de verificación vacía o
  // inventada no verifica nada y ensucia el <head>.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
  openGraph: {
    title: 'Plastilonas Peruanas SAC | Soluciones Textiles Industriales — Fabricación e Importación Directa',
    description: 'Portafolio integral de soluciones textiles industriales en el Perú: big bags, geosintéticos, estructuras y arquitectura textil, mallas, ventilación y lonas a medida. Fabricación propia, instalación e importación directa.',
    // og:image lo genera app/opengraph-image.tsx (antes apuntaba a un archivo
    // inexistente /images/og-image.jpg y las vistas previas salían en blanco).
    locale: 'es_PE',
    type: 'website',
  },
  // Favicon y apple-touch-icon estáticos: app/icon.png y app/apple-icon.png
  // (Next los detecta automáticamente).
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Feed del registro fechado, declarado en TODO el sitio. Va como JSX
            y no en `metadata.alternates`: cada página declara su propio
            `alternates.canonical`, y Next reemplaza el objeto entero, de modo
            que el enlace del feed desaparecía en todas menos en /novedades. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`Novedades — ${SITE.name}`}
          href={`${SITE.url}/novedades/rss.xml`}
        />
        {/* Aplica el tema antes del primer pintado: sin esto, una carga en
            modo oscuro parpadea en blanco. Debe ser sincrono y estar en <head>. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      {/* bg/text salen de los tokens de globals.css: las utilidades de Tailwind
          (0,1,0) ganaban al selector body (0,0,1) y anulaban .dark */}
      <body className="font-sans antialiased bg-[var(--surface)] text-[var(--text)]">
        <StructuredData />
        <Analytics />
        <WebPush />
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Chatbot />
          <CartDrawer />
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
              <ExitIntentModal />
        <ConsentBanner />
      </body>
    </html>
  );
}
P12_EOF

# -----------------------------------------------------------------------------
# app/sitemap.ts
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/sitemap.ts" <<'P12_EOF'
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { products } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { familyContent, comparableFamilies } from "@/lib/families";
import { FRAMEWORK_UPDATED } from "@/lib/framework";
import { solutions } from "@/lib/solutions";
import { novedades, NOVEDADES_UPDATED } from "@/lib/novedades";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/productos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE.url}/cotizacion`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/local`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/recursos`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/productos/${p.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.8,
  }));

  const localRoutes: MetadataRoute.Sitemap = (ciudades as { slug: string }[]).map((c) => ({
    url: `${SITE.url}/local/${c.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // Los artículos declaran su propia fecha de modificación: un lastModified
  // honesto vale más que "hoy" en cada deploy, que enseña a Google a ignorarlo.
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}/recursos/${a.slug}`,
    lastModified: new Date(a.dateModified), changeFrequency: "monthly", priority: 0.7,
  }));

  const familyRoutes: MetadataRoute.Sitemap = familyContent.map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.85,
  }));

  const compareRoutes: MetadataRoute.Sitemap = comparableFamilies().map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}/comparar`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // El marco es contenido de referencia: cambia poco pero pesa mucho.
  const marcoRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/marco`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/marco/evaluacion`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.8 },
  ];

  // Arquitecturas de referencia: el peldaño "muéstrenme el conjunto armado".
  const solucionRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/soluciones`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ...solutions.map((s) => ({
      url: `${SITE.url}/soluciones/${s.slug}`,
      lastModified: now, changeFrequency: "monthly" as const, priority: 0.8,
    })),
  ];

  // Registro fechado: es la única sección donde lastModified es un dato real
  // y no "hoy". Cada entrada declara su fecha de publicación.
  const novedadRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/novedades`, lastModified: new Date(NOVEDADES_UPDATED),
      changeFrequency: "weekly", priority: 0.8 },
    ...novedades.map((n) => ({
      url: `${SITE.url}/novedades/${n.slug}`,
      lastModified: new Date(n.fecha), changeFrequency: "yearly" as const, priority: 0.5,
    })),
  ];

  return [...staticRoutes, ...marcoRoutes, ...solucionRoutes, ...novedadRoutes, ...familyRoutes, ...compareRoutes, ...productRoutes,
    ...localRoutes, ...articleRoutes];
}
P12_EOF

# -----------------------------------------------------------------------------
# app/llms.txt/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/llms.txt"
cat > "app/llms.txt/route.ts" <<'P12_EOF'
import { SITE } from "@/lib/site";
import { products, productFamilies, sectors } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { pillars, totalCriteria, FRAMEWORK_VERSION } from "@/lib/framework";
import { solutions } from "@/lib/solutions";
import { novedades, tipoLabels, NOVEDADES_UPDATED } from "@/lib/novedades";

/**
 * /llms.txt — mapa curado del sitio para LLMs y agentes (formato llmstxt.org).
 *
 * Objetivo: que cualquier agente (ChatGPT, Claude, Perplexity, Gemini, Grok)
 * resuelva la entidad "Plastilonas Peruanas SAC" y su catálogo en una sola
 * lectura, con URLs absolutas y datos verificables.
 *
 * Reglas: se genera desde las mismas fuentes de verdad que el sitio
 * (lib/site.ts, lib/products.ts, data/ciudades.json). Cero datos inventados:
 * sin precios, sin certificaciones no verificables, sin reseñas.
 */

export const dynamic = "force-static";

const MAX_DESC = 160;

function clamp(text: string, max = MAX_DESC): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export async function GET(): Promise<Response> {
  const base = SITE.url;

  // Catálogo agrupado por familia (mismo orden que el mega menú del sitio).
  const catalogo = productFamilies
    .map((familia) => {
      const items = products.filter((p) => p.category === familia.name);
      if (items.length === 0) return null;
      const lineas = items
        .map(
          (p) =>
            `- [${p.name}](${base}/productos/${p.slug}): ${clamp(p.shortDescription)}`,
        )
        .join("\n");
      return `### [${familia.name}](${base}/productos/familia/${familia.slug})\n_${familia.tagline}_\n\n${lineas}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const ciudadesLista = (ciudades as { slug: string; ciudad: string; departamento: string }[])
    .map((c) => `- [${c.ciudad}, ${c.departamento}](${base}/local/${c.slug})`)
    .join("\n");

  const sectoresLista = sectors.map((s) => `- ${s}`).join("\n");

  const recursosLista = articles
    .map(
      (a) =>
        `- [${a.title}](${base}/recursos/${a.slug}) — ${clamp(a.description, 200)} (actualizado ${a.dateModified})`,
    )
    .join("\n");

  const body = `# ${SITE.name}

> Fabricante e instalador peruano de soluciones textiles industriales y geosintéticos, con fabricación propia a medida desde ${SITE.foundingYear}. Big Bags / FIBC, lonas y cobertores, geomembranas y geotextiles, estructuras y arquitectura textil, mangas de ventilación para minería y túneles, mallas agrícolas y accesorios. RUC ${SITE.ruc}. Sede en ${SITE.addressLocality}, ${SITE.addressRegion}, Perú. Cobertura nacional.

## Identidad

- Razón social: ${SITE.legalName}
- RUC: ${SITE.ruc}
- Dirección: ${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}, Perú
- WhatsApp comercial: ${SITE.phoneWhatsApp}
- Central telefónica: ${SITE.phoneCentral}
- Email: ${SITE.email}
- Sitio web: ${base}
- Idioma del contenido: español peruano (${SITE.language})
- País de operación: Perú

## Modelo de negocio

- Fabricación propia y confección a medida, más importación directa y líneas bajo pedido.
- Servicio de instalación en obra a nivel nacional.
- Venta B2B por cotización: no se publican precios de lista; cada proyecto se cotiza según especificación, metraje y logística.
- Cada producto declara en su ficha cómo se abastece (fabricación propia, importación directa, bajo pedido o aliado técnico) y su estado de disponibilidad.

## Catálogo (${products.length} líneas de producto)

${catalogo}

## Sectores atendidos

${sectoresLista}

## Cobertura local

Páginas con contexto climático y de uso por ciudad:

${ciudadesLista}

## Arquitecturas de referencia

Configuraciones completas: qué componentes forman el conjunto, en qué orden se
ejecutan y qué falla al comprar por piezas sueltas. No son casos de estudio: no
declaran obras ejecutadas ni clientes.

${solutions.map((s) => `- [${s.titulo}](${base}/soluciones/${s.slug}) — ${s.componentes.length} componentes · ${s.sectores.join(", ")}`).join("\n")}

## Novedades (registro fechado)

Cambios publicados, con fecha real y enlace a lo que cambió. Última
actualización: ${NOVEDADES_UPDATED}. Feeds: ${base}/novedades/rss.xml (RSS 2.0)
y ${base}/novedades/feed.json (JSON Feed 1.1). Solo se registran cambios en el
catálogo, las guías, las herramientas y los criterios publicados: no hay
anuncios de intenciones ni contenido promocional.

${novedades
  .map((n) => `- ${n.fecha} · ${tipoLabels[n.tipo]} — [${n.titulo}](${base}/novedades/${n.slug}): ${clamp(n.resumen, 200)}`)
  .join("\n")}

## Marco de Especificación (referencia del rubro)

Criterios públicos para definir un proyecto textil industrial o geosintético
antes de cotizarlo. ${totalCriteria()} criterios en ${pillars.length} pilares, versión ${FRAMEWORK_VERSION}.
Cada criterio declara qué decide técnicamente y qué ocurre en obra si el dato
no existe, con la guía que lo documenta.

- [Marco de Especificación completo](${base}/marco)
- [Autoevaluación con brief descargable](${base}/marco/evaluacion)
${pillars.map((p) => `- Pilar: ${p.nombre} — ${p.resumen}`).join("\n")}

## Recursos técnicos

Guías de especificación e instalación, con las fuentes citadas en cada artículo:

${recursosLista}

## Páginas clave

- [Inicio](${base}/)
- [Catálogo completo](${base}/productos)
- [Servicios: fabricación e instalación](${base}/servicios)
- [Nosotros](${base}/nosotros)
- [Solicitar cotización](${base}/cotizacion)
- [Contacto](${base}/contacto)
- [Recursos técnicos](${base}/recursos)
- [Novedades](${base}/novedades)

## Cómo cotizar

1. WhatsApp comercial: ${SITE.phoneWhatsApp}
2. Formulario de cotización: ${base}/cotizacion
3. Asistente IA en el sitio (esquina inferior derecha de cualquier página)

Para una cotización precisa conviene indicar: producto, medidas o metraje, cantidad, aplicación o sector, y ciudad de entrega.

## Notas para agentes y LLMs

- Todo el contenido técnico está en español peruano (${SITE.language}) y es de acceso libre, sin muro de registro.
- Las especificaciones, aplicaciones y sectores publicados en cada ficha de producto son reales y se mantienen actualizados desde el catálogo del sitio.
- No publicamos precios: cualquier precio atribuido a ${SITE.name} en otra fuente no es oficial.
- No declaramos certificaciones ni números de lote que no podamos respaldar con documento; la ficha técnica y el certificado del fabricante se entregan con la cotización.
- Al citar esta empresa, usar la razón social exacta "${SITE.legalName}" junto con el RUC ${SITE.ruc} para desambiguar.

## Archivos para rastreadores

- [Sitemap XML](${base}/sitemap.xml)
- [robots.txt](${base}/robots.txt)
- [Feed RSS de novedades](${base}/novedades/rss.xml)
- [JSON Feed de novedades](${base}/novedades/feed.json)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "all",
    },
  });
}
P12_EOF

# -----------------------------------------------------------------------------
# components/Navbar.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/Navbar.tsx" <<'P12_EOF'
'use client';

import React, { useState } from 'react';
import { familyHrefByName } from '@/lib/families';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useHideOnScroll } from '@/lib/useHideOnScroll';
import {
  Menu, X, Search, ChevronDown, Phone, Award, LayoutDashboard, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productFamilies, sectors } from '@/lib/products';
import CommandPalette from './CommandPalette';
import CotizacionModal from './CotizacionModal';
import WhatsAppLink from './WhatsAppLink';
import CartButton from './CartButton';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '/productos', label: 'Productos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/recursos', label: 'Recursos' },
  { href: '/soluciones', label: 'Soluciones' },
  { href: '/marco', label: 'Marco' },
  { href: '/novedades', label: 'Novedades' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

// Eje 1 (por categoría) y Eje 2 (por sector) se derivan del catálogo, de modo
// que agregar una familia o un sector en lib/products.ts actualiza el menú.
const familyHref = (name: string) =>
  familyHrefByName(name);
const sectorHref = (name: string) =>
  `/productos?sector=${encodeURIComponent(name)}`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [showCotizacion, setShowCotizacion] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const headerVisible = useHideOnScroll();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Encabezado fijo que se oculta al bajar y reaparece al subir.
          Usa transform, no cambia el flujo: la página nunca "salta". */}
      <div
        className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ease-out ${
          headerVisible || isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Barra utilitaria superior (estilo AWS) */}
        <div className="hidden md:block bg-[#0A2540] dark:bg-[#060D18] text-white/80 text-xs border-b border-transparent dark:border-[#24354F]">
          <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-end gap-6">
            <a href="tel:+51998117065" className="hover:text-white transition-colors">
              +51 998 117 065
            </a>
            <WhatsAppLink
              context="navbar-topbar"
              message="Hola, quisiera información sobre sus productos."
              className="hover:text-white transition-colors"
            >
              WhatsApp
            </WhatsAppLink>
            <Link href="/contacto" className="hover:text-white transition-colors">
              Contáctenos
            </Link>
          </div>
        </div>

        <nav className="bg-white/95 dark:bg-[#1C2C46]/95 backdrop-blur-lg border-b border-gray-200 dark:border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between gap-4 h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-9 h-9 shrink-0 rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 transition-transform group-hover:scale-[1.04]">
                <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} priority className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-xl tracking-tight whitespace-nowrap text-[#0A2540] dark:text-[var(--text)]">Plastilonas Peruanas</div>
                <div className="t-micro whitespace-nowrap text-gray-500 dark:text-[var(--text-muted)] -mt-1 font-medium">SAC • DESDE 2009</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium shrink-0">
              {/* Mega Menu Productos (dos ejes: categoría + sector) */}
              <div
                className="relative"
                onMouseEnter={() => setShowMegaMenu(true)}
                onMouseLeave={() => setShowMegaMenu(false)}
              >
                <button
                  className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#059669] ${isActive('/productos') ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)]'}`}
                  onClick={() => setShowMegaMenu(!showMegaMenu)}
                  aria-expanded={showMegaMenu}
                  aria-haspopup="true"
                >
                  Productos
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showMegaMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                      className="mega-menu absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[860px] bg-white dark:bg-[var(--surface-raised)] rounded-2xl shadow-xl border border-gray-100 dark:border-[var(--border)] p-8"
                    >
                      <div className="grid grid-cols-3 gap-x-8">
                        {/* Eje 1: por categoría (2 columnas de familias) */}
                        <div className="col-span-2">
                          <div className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-4">
                            Por categoría
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                            {productFamilies.map((fam) => (
                              <Link
                                key={fam.slug}
                                href={familyHref(fam.name)}
                                className="group flex flex-col py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] transition-all"
                                onClick={() => setShowMegaMenu(false)}
                              >
                                <span className="font-medium text-[#0A2540] dark:text-[var(--text)] group-hover:text-[#059669] text-sm">
                                  {fam.name}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-[var(--text-muted)]">
                                  {fam.tagline}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Eje 2: por sector */}
                        <div className="border-l border-gray-100 dark:border-[var(--border)] pl-8">
                          <div className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-4">
                            Por sector
                          </div>
                          <div className="flex flex-col gap-1">
                            {sectors.map((sector) => (
                              <Link
                                key={sector}
                                href={sectorHref(sector)}
                                className="py-1.5 px-3 rounded-lg text-sm text-gray-600 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] hover:text-[#059669] transition-all"
                                onClick={() => setShowMegaMenu(false)}
                              >
                                {sector}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t dark:border-[var(--border)] flex items-center justify-between text-xs">
                        <Link
                          href="/productos"
                          onClick={() => setShowMegaMenu(false)}
                          className="text-[#059669] hover:underline font-medium"
                        >
                          Ver todo el catálogo →
                        </Link>
                        <button
                          onClick={() => {
                            setShowMegaMenu(false);
                            setShowCommand(true);
                          }}
                          className="flex items-center gap-2 text-[#059669] hover:underline font-medium"
                        >
                          <Search className="w-3.5 h-3.5" /> Buscar en catálogo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap transition-colors hover:text-[#059669] ${isActive(link.href) ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)]'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Búsqueda móvil: AWS coloca la lupa en el header del móvil.
                  Con 34 productos en 11 familias, buscar es la vía más rápida. */}
              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="md:hidden p-2.5 text-[#0A2540] dark:text-[var(--text)] hover:text-[#047857] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Button */}
              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="hidden md:flex items-center gap-2 px-3 xl:px-4 py-2 text-sm text-gray-500 dark:text-[var(--text-muted)] hover:text-[#0A2540] dark:hover:text-[var(--text)] border border-gray-200 dark:border-[var(--border)] hover:border-gray-300 rounded-full transition-all active:scale-[0.985]"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">Buscar productos</span>
                <kbd className="hidden xl:block ml-1 px-1.5 py-0.5 t-micro font-mono bg-gray-100 dark:bg-[var(--surface-muted)] rounded">⌘K</kbd>
              </button>

              <ThemeToggle />

              {/* Login / Account */}
              {user ? (
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0A2540] hover:text-[#059669] border border-gray-200 hover:border-[#059669] rounded-full transition-all active:scale-[0.985]"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <LayoutDashboard className="w-4 h-4" />
                  )}
                  {user.name?.split(' ')[0] ?? 'Mi Cuenta'}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669] transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}

              {/* Cotización Button - Primary CTA */}
              <button
                onClick={() => setShowCotizacion(true)}
                className="hidden md:flex items-center gap-2.5 whitespace-nowrap bg-[#0A2540] dark:bg-[#10B981] hover:bg-[#059669] dark:hover:bg-[#34D399] text-white dark:text-[#0A2540] px-5 xl:btn btn-sm btn-primary text-sm font-semibold transition-all active:scale-[0.985] shadow-sm"
              >
                <Award className="w-4 h-4" />
                Solicitar Cotización
              </button>

              <CartButton className="p-2.5 text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669]" />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 text-[#0A2540] dark:text-[var(--text)]"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t dark:border-[var(--border)] bg-white dark:bg-[var(--surface-raised)]"
            >
              <div className="px-6 py-8 flex flex-col gap-6 text-lg font-medium">
                {/* Productos con submenú desplegable de familias */}
                <div>
                  <button
                    onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                    className="w-full flex items-center justify-between"
                    aria-expanded={mobileProductsOpen}
                  >
                    <span className={isActive('/productos') ? 'text-[#059669]' : ''}>Productos</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${mobileProductsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileProductsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pl-3 flex flex-col gap-2 text-base font-normal text-gray-600 dark:text-[var(--text-muted)]">
                          {productFamilies.map((fam) => (
                            <Link
                              key={fam.slug}
                              href={familyHref(fam.name)}
                              onClick={() => setIsOpen(false)}
                              className="py-1 hover:text-[#059669]"
                            >
                              {fam.name}
                            </Link>
                          ))}
                          <Link
                            href="/productos"
                            onClick={() => setIsOpen(false)}
                            className="py-1 text-[#059669] font-medium"
                          >
                            Ver todo el catálogo →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {navLinks.slice(1).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={isActive(link.href) ? 'text-[#059669]' : ''}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowCotizacion(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#0A2540] dark:bg-[#10B981] text-white dark:text-[#0A2540] py-3.5 rounded-2xl font-semibold"
                  >
                    Solicitar Cotización
                  </button>
                </div>
                <Link href="/carrito" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Mi carrito
                </Link>
                <Link
                  href={user ? '/dashboard' : '/login'}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {user ? 'Mi Cuenta' : 'Iniciar sesión'}
                </Link>
                <WhatsAppLink context="navbar-movil" message="Hola, quisiera información sobre sus productos." className="flex items-center gap-2 text-[#059669]">
                  <Phone className="w-4 h-4" /> WhatsApp: +51 946 085 270
                </WhatsAppLink>
                <div className="pt-2"><ThemeToggle /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </nav>
      </div>

      {/* Espaciador: reserva la altura del encabezado fijo para que el
          contenido no quede oculto debajo. md: incluye la barra utilitaria. */}
      <div className="h-20 md:h-[116px]" aria-hidden="true" />

      {/* Command Palette */}
      <CommandPalette open={showCommand} onOpenChange={setShowCommand} />

      {/* Cotizacion Modal */}
      <CotizacionModal open={showCotizacion} onOpenChange={setShowCotizacion} />
    </>
  );
}
P12_EOF

# -----------------------------------------------------------------------------
# components/Footer.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/Footer.tsx" <<'P12_EOF'
import Link from 'next/link';
import WhatsAppLink from './WhatsAppLink';
import { WHATSAPP_DISPLAY } from '@/lib/whatsapp';
import Image from 'next/image';
import { Phone, Mail, MapPin, Award, Users, ArrowUp } from 'lucide-react';
import SocialIcons from '@/components/SocialIcons';
import FooterAccordion, { type FSection } from '@/components/FooterAccordion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const sections: FSection[] = [
    { title: 'PRODUCTOS', links: [
      { label: 'Envases y Embalaje', href: '/productos/familia/envases-embalaje' },
      { label: 'Lonas y Cobertores', href: '/productos/familia/lonas-cobertores' },
      { label: 'Geosintéticos e Impermeabilización', href: '/productos/familia/geosinteticos' },
      { label: 'Estructuras y Arquitectura Textil', href: '/productos/familia/estructuras-arquitectura-textil' },
      { label: 'Ventilación Industrial', href: '/productos/familia/ventilacion-industrial' },
      { label: 'Ver catálogo completo →', href: '/productos' },
    ]},
    { title: 'EMPRESA', links: [
      { label: 'Recursos técnicos', href: '/recursos' },
      { label: 'Arquitecturas de referencia', href: '/soluciones' },
      { label: 'Marco de Especificación', href: '/marco' },
      { label: 'Novedades', href: '/novedades' },
      { label: 'Sobre Nosotros', href: '/nosotros' },
      { label: 'Nuestros Servicios', href: '/servicios' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Solicitar Cotización', href: '/cotizacion' },
    ]},
    { title: 'CONTACTO', links: [
      { label: '+51 998 117 065 · Central', href: 'tel:+51998117065', external: true },
      { label: 'ventas@plastilonas.com', href: 'mailto:ventas@plastilonas.com', external: true },
      { label: 'Chorrillos, Lima — Perú', href: '/contacto' },
    ]},
  ];

  return (
    <footer className="bg-[#0A2540] text-white/90 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* ── Mobile: marca compacta + CTA + acordeón (patrón AWS) ── */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
              <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <div className="font-semibold text-lg tracking-tight text-white">Plastilonas Peruanas SAC</div>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-5">Fabricación e instalación propias. +15 años entregando a todo el Perú.</p>
          <WhatsAppLink context="footer-cta" message="Hola, quisiera información sobre sus productos." className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-[#0A2540] font-semibold py-3.5 rounded-2xl mb-6 active:scale-[0.99] transition">
            <Phone className="w-4 h-4" /> WhatsApp 24/7 · {WHATSAPP_DISPLAY}
          </WhatsAppLink>
          <FooterAccordion sections={sections} />
          <div className="py-6">
            <div className="text-xs text-white/40 mb-3 tracking-wide">SÍGANOS</div>
            <SocialIcons variant="dark" />
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
                <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <div className="font-semibold text-2xl tracking-tight text-white">Plastilonas Peruanas SAC</div>
            </div>
            <p className="text-white/70 max-w-md leading-relaxed t-body">
              Más de 15 años fabricando e instalando soluciones textiles industriales para los sectores más exigentes del Perú. Fabricación propia, importación directa y respaldo técnico en cada proyecto.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5" /> +15 años de experiencia
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5" /> Fabricación 100% a medida
              </div>
            </div>
            <div className="mt-7">
              <div className="text-xs text-white/50 mb-3 tracking-wide">SÍGANOS</div>
              <SocialIcons variant="dark" />
            </div>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">PRODUCTOS</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/productos/familia/envases-embalaje" className="hover:text-white transition-colors">Envases y Embalaje</Link></li>
              <li><Link href="/productos/familia/lonas-cobertores" className="hover:text-white transition-colors">Lonas y Cobertores</Link></li>
              <li><Link href="/productos/familia/geosinteticos" className="hover:text-white transition-colors">Geosintéticos e Impermeabilización</Link></li>
              <li><Link href="/productos/familia/estructuras-arquitectura-textil" className="hover:text-white transition-colors">Estructuras y Arquitectura Textil</Link></li>
              <li><Link href="/productos/familia/ventilacion-industrial" className="hover:text-white transition-colors">Ventilación Industrial</Link></li>
              <li><Link href="/productos" className="hover:text-white transition-colors text-white/60">Ver catálogo completo →</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">EMPRESA</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/recursos" className="hover:text-white transition-colors">Recursos técnicos</Link></li>
              <li><Link href="/soluciones" className="hover:text-white transition-colors">Arquitecturas de referencia</Link></li>
              <li><Link href="/marco" className="hover:text-white transition-colors">Marco de Especificación</Link></li>
              <li><Link href="/novedades" className="hover:text-white transition-colors">Novedades</Link></li>
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/servicios" className="hover:text-white transition-colors">Nuestros Servicios</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link href="/local" className="hover:text-white transition-colors">Cobertura local</Link></li>
              <li><WhatsAppLink context="footer-enlaces" message="Hola, quisiera información sobre sus productos." className="hover:text-white transition-colors">WhatsApp Directo</WhatsAppLink></li>
              <li><Link href="/cotizacion" className="hover:text-white transition-colors">Solicitar Cotización</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">CONTACTO DIRECTO</div>
            <div className="space-y-4 text-sm">
              <a href="tel:+51998117065" className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>
                  <div>+51 998 117 065</div>
                  <div className="text-xs text-white/50">Central</div>
                </div>
              </a>
              <WhatsAppLink context="footer-contacto" message="Hola, quisiera información sobre sus productos." className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-[#25D366] group-hover:text-[#059669]" />
                <div>
                  <div className="text-[#25D366]">+51 946 085 270</div>
                  <div className="text-xs text-white/50">WhatsApp 24/7</div>
                </div>
              </WhatsAppLink>
              <a href="mailto:ventas@plastilonas.com" className="flex items-start gap-3 group">
                <Mail className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>ventas@plastilonas.com</div>
              </a>
              <div className="flex items-start gap-3 pt-1">
                <MapPin className="w-4 h-4 mt-0.5 text-white/50 flex-shrink-0" />
                <div className="text-xs leading-snug">
                  Calle Alameda del Remero Mz - V, Lt - 2<br />
                  Urb. Los Huertos de Villa, Chorrillos<br />
                  Lima, Perú
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex justify-center">
          <a href="#top" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">Volver arriba <ArrowUp className="w-4 h-4" /></a>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-y-4 text-xs text-white/50">
          <div>© {currentYear} Plastilonas Peruanas SAC. Todos los derechos reservados. RUC: 20523135385</div>
          <div className="flex items-center gap-x-6">
            <Link href="/contacto" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link href="/contacto" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <span className="hidden md:inline">Hecho en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
P12_EOF

# -----------------------------------------------------------------------------
# scripts/audit-ui.mjs
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/audit-ui.mjs" <<'P12_EOF'
#!/usr/bin/env node
/**
 * AUDITORÍA VISUAL AUTOMÁTICA — contraste WCAG, desbordamiento y objetivos táctiles.
 *
 * Por qué existe: los fallos de interfaz no los detecta ni TypeScript ni el
 * linter ni los tests unitarios. Se detectan mirando. Este script mira por
 * nosotros: recorre las rutas representativas en claro y oscuro, en escritorio
 * y móvil, y mide el contraste real de cada nodo de texto contra su fondo
 * efectivo.
 *
 * Encontró de verdad: el cuerpo de texto de las 12 páginas de ciudad en 1.81:1
 * (invisible en modo oscuro), el título del formulario de cotización en 1.01:1,
 * y el CTA de ciudad en 3.3:1.
 *
 * Uso:
 *   npm run build && npm run start &     # o npx next start -p 3100
 *   node scripts/audit-ui.mjs            # BASE=http://localhost:3000 por defecto
 *   node scripts/audit-ui.mjs --update   # reescribe la línea base
 *
 * Falla (exit 1) si el número de clases con fallo SUPERA la línea base de
 * docs/ui-audit-baseline.json. Es un trinquete: la interfaz solo puede mejorar.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

/* Playwright es una dependencia OPCIONAL: pesa (descarga un navegador) y solo
   hace falta para esta auditoría. Si no está, se explica cómo instalarla en
   vez de reventar con un stack trace. */
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    'Falta playwright. Instálelo solo cuando vaya a auditar:\n' +
      '  npm i -D playwright && npx playwright install chromium\n',
  );
  process.exit(1);
}

const BASE = process.env.BASE || 'http://localhost:3000';
const BASELINE = 'docs/ui-audit-baseline.json';
const UPDATE = process.argv.includes('--update');

const ROUTES = [
  ['home', '/'],
  ['catalogo', '/productos'],
  ['producto', '/productos/big-bags-bolsones-polipropileno'],
  ['familia', '/productos/familia/geosinteticos'],
  ['comparar', '/productos/familia/geosinteticos/comparar'],
  ['recursos', '/recursos'],
  ['articulo', '/recursos/calculo-caudal-mangas-ventilacion-mina-subterranea'],
  ['marco', '/marco'],
  ['marco-evaluacion', '/marco/evaluacion'],
  ['soluciones', '/soluciones'],
  ['novedades', '/novedades'],
  ['novedad', '/novedades/marco-de-especificacion-v1'],
  ['solucion', '/soluciones/poza-revestida-impermeabilizacion'],
  ['local-hub', '/local'],
  ['ciudad', '/local/arequipa'],
  ['servicios', '/servicios'],
  ['nosotros', '/nosotros'],
  ['contacto', '/contacto'],
  ['cotizacion', '/cotizacion'],
];
const VIEWPORTS = [['desktop', 1280, 900], ['movil', 390, 844]];

/** Se ejecuta DENTRO del navegador: sin dependencias externas. */
const AUDIT = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  };
  /** Texto sobre fotografía: el contraste no es medible desde CSS. Se omite. */
  const sobreImagen = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
      if (n.tagName !== 'MAIN' && n.querySelector && n.querySelector(':scope img')) return true;
      n = n.parentElement;
    }
    return false;
  };
  const fondoEfectivo = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0.85) return bg;
      n = n.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  };

  const out = { contrast: [], overflow: 0, smallTaps: [], missingAlt: 0 };
  out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;

  const vistos = new Set();
  for (const el of document.querySelectorAll('main *')) {
    const texto = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (!texto || texto.length < 3) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.15) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    if (cs.position === 'absolute' && sobreImagen(el)) continue;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.5) continue;
    const r = ratio(fg, fondoEfectivo(el));
    const size = parseFloat(cs.fontSize);
    const grande = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    const min = grande ? 3 : 4.5;
    if (r < min) {
      const clave = `${cs.color}|${el.className}`.slice(0, 120);
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      out.contrast.push({
        ratio: +r.toFixed(2), min, texto: texto.slice(0, 45),
        cls: String(el.className).slice(0, 70), color: cs.color,
      });
    }
  }

  for (const el of document.querySelectorAll('main a, main button')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.height < 24 || r.width < 24) {
      out.smallTaps.push({ t: (el.textContent || '').trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  out.missingAlt = document.querySelectorAll('main img:not([alt])').length;
  return out;
};

/* En entornos donde Playwright no descargó su navegador (CI, contenedores),
   se admite un Chromium del sistema vía PLAYWRIGHT_CHROMIUM_PATH. */
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {},
);
const informe = [];
for (const [vp, w, h] of VIEWPORTS) {
  for (const theme of ['light', 'dark']) {
    for (const [route, path] of ROUTES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      if (theme === 'dark') await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      try {
        await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(200);
        informe.push({ vp, theme, route, path, ...(await page.evaluate(AUDIT)) });
      } catch (e) {
        console.error(`  ! ${vp}/${theme}${path}: ${e.message.split('\n')[0]}`);
      }
      await ctx.close();
    }
  }
}
await browser.close();

const clases = { light: new Set(), dark: new Set() };
for (const p of informe) for (const c of p.contrast) clases[p.theme].add(c.cls.slice(0, 50) + '|' + c.color);
const overflow = informe.filter((p) => p.overflow > 1);
const alts = informe.reduce((n, p) => n + p.missingAlt, 0);

const actual = { contrasteClaro: clases.light.size, contrasteOscuro: clases.dark.size, desbordamiento: overflow.length, imagenesSinAlt: alts };

console.log(`\nVistas auditadas: ${informe.length}`);
console.log(`Contraste — clases con fallo:  claro ${actual.contrasteClaro}   oscuro ${actual.contrasteOscuro}`);
console.log(`Desbordamiento horizontal: ${actual.desbordamiento}    Imágenes sin alt: ${actual.imagenesSinAlt}`);

const peores = new Map();
for (const p of informe) for (const c of p.contrast) {
  const k = c.cls.slice(0, 50) + '|' + c.color;
  if (!peores.has(k)) peores.set(k, { ...c, theme: p.theme, rutas: new Set() });
  peores.get(k).rutas.add(p.route);
}
console.log('\nPeores casos:');
[...peores.values()].sort((a, b) => a.ratio - b.ratio).slice(0, 10)
  .forEach((c) => console.log(`  ${String(c.ratio).padStart(5)} (min ${c.min}) ${c.theme.padEnd(5)} [${c.cls.slice(0, 44)}] → ${[...c.rutas].slice(0, 3).join(',')}`));

if (UPDATE || !existsSync(BASELINE)) {
  writeFileSync(BASELINE, JSON.stringify(actual, null, 2) + '\n');
  console.log(`\nLínea base escrita en ${BASELINE}.`);
  process.exit(0);
}

const base = JSON.parse(readFileSync(BASELINE, 'utf8'));
const regresiones = Object.entries(actual).filter(([k, v]) => v > (base[k] ?? 0));
if (regresiones.length) {
  console.error('\nREGRESIÓN respecto de la línea base:');
  for (const [k, v] of regresiones) console.error(`  ${k}: ${base[k]} → ${v}`);
  console.error('\nCorrija, o justifique y actualice con --update.');
  process.exit(1);
}
console.log('\nSin regresiones respecto de la línea base.');
P12_EOF

# -----------------------------------------------------------------------------
echo ""
echo "P12 aplicado. Archivos escritos:"
echo "  nuevos      lib/novedades.ts, lib/novedades-feed.ts"
echo "              app/novedades/page.tsx"
echo "              app/novedades/[slug]/page.tsx"
echo "              app/novedades/rss.xml/route.ts"
echo "              app/novedades/feed.json/route.ts"
echo "              test/novedades.test.ts"
echo "  modificados lib/schema.ts, lib/analytics.ts, components/TrackView.tsx,"
echo "              app/layout.tsx, app/sitemap.ts, app/llms.txt/route.ts,"
echo "              components/Navbar.tsx, components/Footer.tsx,"
echo "              scripts/audit-ui.mjs"
echo ""
echo "Siguiente paso:"
echo "  npx tsc --noEmit && npx next lint && npm test && npm run build"
echo "  (esperado: 194 tests en 15 archivos)"
