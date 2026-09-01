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
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';
import { OG_IMAGEN } from '@/lib/meta';

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
const DESCRIPTION = `Registro fechado de lo que cambia en el catálogo, las guías y las herramientas. Cada entrada enlaza a lo que cambió. Con feed RSS y JSON.`;

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
    images: OG_IMAGEN,
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
  // Esquema de esta página. `ImagenContenido` degrada solo: mientras el
  // archivo no exista no se pinta nada roto, y en cuanto se publique
  // aparece aquí sin tocar esta página.
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:novedades-registro');
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
      {esquema && (
        <ImagenContenido ranura={esquema} className="mb-8 mt-6" sizes="(min-width: 1024px) 900px, 100vw" />
      )}

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
