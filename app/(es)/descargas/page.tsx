import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Download, FileText } from 'lucide-react';
import { grupos, todasLasDescargas, formatoLabels } from '@/lib/descargas';
import { products } from '@/lib/products';
import { articles } from '@/lib/articles';
import { solutions } from '@/lib/solutions';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';
import { breadcrumbSchema, dataCatalogSchema, webPageSchema } from '@/lib/schema';
import { OG_IMAGEN } from '@/lib/meta';

/**
 * Centro de documentación.
 *
 * Responde una intención concreta que el sitio no atendía: "necesito
 * documentación para armar el expediente". Reúne todo lo descargable —los
 * documentos en PDF y los datos abiertos— en una sola URL, y lo declara en
 * DataCatalog + DataDownload para que un agente sepa que existe sin tener que
 * descubrirlo página por página.
 */

const URL = `${SITE.url}/descargas`;
const TITLE = 'Centro de documentación y datos abiertos';
const DESCRIPTION = `${products.length} fichas de producto, ${articles.length} guías, ${solutions.length} arquitecturas, el Marco y el glosario, en PDF. El catálogo completo, como datos. Sin registro.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/descargas' },
  openGraph: {
    images: OG_IMAGEN,
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

const formatoColor: Record<string, string> = {
  pdf: 'bg-red-50 text-red-700',
  json: 'bg-blue-50 text-blue-700',
  rss: 'bg-amber-50 text-amber-700',
  txt: 'bg-gray-100 text-gray-700',
  xml: 'bg-emerald-50 text-emerald-700',
};

export default function DescargasPage() {
  // Esquema de esta página. `ImagenContenido` degrada solo: mientras el
  // archivo no exista no se pinta nada roto, y en cuanto se publique
  // aparece aquí sin tocar esta página.
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:descargas-inventario');
  const bloques = grupos();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="descargas" slug="indice" />
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
              { name: 'Documentación', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          dataCatalogSchema({
            url: URL,
            name: 'Centro de documentación',
            description: DESCRIPTION,
            downloads: todasLasDescargas().map((d) => ({
              name: d.titulo,
              description: d.descripcion,
              href: d.href,
              formato: d.formato,
            })),
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span className="text-gray-700">Documentación</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Centro de documentación
      </h1>
      {esquema && (
        <ImagenContenido ranura={esquema} className="mb-8 mt-6" sizes="(min-width: 1024px) 900px, 100vw" />
      )}

      <p className="speakable-intro mb-6 max-w-3xl text-lg text-gray-700">
        Todo lo que se puede descargar de este sitio, en un solo lugar y sin dejar un
        correo. Los documentos se generan desde las mismas fuentes que alimentan las
        páginas: lo que descarga hoy es exactamente lo que está publicado hoy.
      </p>

      <p className="mb-12 font-mono text-sm text-gray-500">
        {products.length} fichas · {articles.length} guías · {solutions.length} arquitecturas ·
        marco · glosario · {todasLasDescargas().filter((d) => d.formato !== 'pdf').length} fuentes
        de datos
      </p>

      {bloques.map((g) => (
        <section key={g.id} id={g.id} className="mb-16 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {g.id === 'documentos' ? (
              <FileText className="h-5 w-5 text-[#059669]" aria-hidden="true" />
            ) : (
              <Download className="h-5 w-5 text-[#059669]" aria-hidden="true" />
            )}
            {g.titulo}
          </h2>
          <p className="mb-8 max-w-3xl text-gray-600">{g.intro}</p>

          <ul className="space-y-4">
            {g.items.map((d) => (
              <li
                key={d.href}
                className="rounded-3xl border border-gray-100 p-6 transition-colors hover:border-[#059669]/40"
              >
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 font-mono text-xs font-semibold ${formatoColor[d.formato]}`}
                  >
                    {formatoLabels[d.formato]}
                  </span>
                  <span className="font-mono text-xs text-gray-500">{d.volumen}</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold tracking-tight text-[#0A2540]">
                  {d.titulo}
                </h3>
                <p className="mb-2 text-gray-700">{d.descripcion}</p>
                <p className="mb-4 text-sm text-gray-500">{d.paraQuien}</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={d.href}
                    className="inline-flex items-center gap-1 rounded-2xl bg-[#0A2540] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#059669]"
                  >
                    {d.formato === 'pdf' && d.href.endsWith('.pdf')
                      ? 'Descargar PDF'
                      : d.formato === 'pdf'
                        ? 'Ver e ir a las descargas'
                        : 'Abrir'}{' '}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  {d.origen && d.origen !== d.href && (
                    <Link
                      href={d.origen}
                      className="inline-flex items-center rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
                    >
                      Ver en línea
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* Lo que un comprador y un agente necesitan saber antes de usar esto. */}
      <section className="mb-14 rounded-3xl border border-gray-100 p-8">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Condiciones de uso
        </h2>
        <dl className="space-y-5 text-gray-700">
          <div>
            <dt className="font-semibold text-[#0A2540]">Consulta y cita libres</dt>
            <dd className="mt-1">
              Puede citar y reenviar estos documentos indicando la fuente y el enlace. Cita
              sugerida: {SITE.legalName} (RUC {SITE.ruc}), {SITE.url}.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#0A2540]">Ningún documento publica precios</dt>
            <dd className="mt-1">
              Casi todo el catálogo es fabricación a medida: el precio se establece por
              cotización según especificación, metraje, cantidad y logística. Cualquier
              precio atribuido a esta empresa en otra fuente no es oficial.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#0A2540]">Alcance técnico</dt>
            <dd className="mt-1">
              Las guías publican métodos de ingeniería reproducibles como orden de magnitud
              para prediseño; no son memorias de cálculo firmadas. Las cifras normativas
              deben verificarse contra el texto oficial vigente. Las fichas técnicas y los
              certificados del fabricante correspondientes al lote suministrado se entregan
              con la cotización.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#0A2540]">Sin registro</dt>
            <dd className="mt-1">
              Nada de esto pide un correo ni crea una cuenta. Si descarga algo, no nos
              enteramos de quién es usted.
            </dd>
          </div>
        </dl>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Necesita un documento que no está acá?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Si su expediente exige un formato o un dato concreto, dígalo y se lo preparamos
          junto con la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Contacto <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
