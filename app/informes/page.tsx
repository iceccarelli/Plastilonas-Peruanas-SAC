import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { informes } from '@/lib/informes';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';

/**
 * Índice de informes del sector.
 *
 * La página declara arriba lo que NO hace: no estima el tamaño del mercado de
 * textiles industriales. Decirlo en la portada del silo, y no escondido en una
 * nota al pie, es lo que distingue un estudio de un folleto con gráficos.
 */

const URL = `${SITE.url}/informes`;
const TITLE = 'Informes del sector con dato oficial';
const DESCRIPTION = `Estudios de ${SITE.name} sobre los indicadores que mueven la demanda de textiles industriales y geosintéticos en el Perú. Cada cifra con su fuente oficial, su fecha de consulta y lo que el informe NO afirma.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/informes' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function InformesPage() {
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:informes-metodo');
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="informe" slug="indice" />
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
              { name: 'Informes', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          itemListSchema({
            url: URL,
            name: 'Informes del sector',
            description: DESCRIPTION,
            items: informes.map((i) => ({
              name: i.titulo,
              url: `${SITE.url}/informes/${i.slug}`,
            })),
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span className="text-gray-700">Informes</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Informes del sector
      </h1>
      {/* Diagrama del registro. Degrada solo: sin archivo no se pinta nada,
          y en cuanto se publique aparece sin tocar esta página. */}
      {esquema && <ImagenContenido ranura={esquema} className="mb-8 mt-6" sizes="(min-width: 768px) 860px, 100vw" />}


      <p className="speakable-intro mb-6 max-w-3xl text-lg text-gray-700">
        Qué dicen los indicadores oficiales de los sectores que compran textiles
        industriales y geosintéticos en el Perú, y qué implica cada dato para quien
        tiene que redactar una especificación.
      </p>

      {/* Lo que NO hacemos, en la portada del silo y no en una nota al pie. */}
      <div className="mb-12 rounded-3xl border-l-4 border-[#059669] bg-gray-50 p-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Cómo se escriben estos informes
        </h2>
        <p className="mb-3 text-gray-800">
          Toda cifra lleva su fuente oficial, con organismo, enlace, fecha de
          publicación y fecha en que la verificamos. Lo que es lectura nuestra va
          separado y marcado como tal: el dato es del organismo, la consecuencia
          técnica es nuestra.
        </p>
        <p className="text-gray-800">
          <strong>No estimamos el tamaño de nuestro propio mercado.</strong> No existe
          una estadística pública verificable del mercado peruano de textiles
          industriales y geosintéticos, y una estimación propia presentada como dato
          sería inventar el número más importante del documento. Cada informe declara
          además, explícitamente, qué no afirma.
        </p>
      </div>

      <ul className="mb-16 space-y-5">
        {informes.map((i) => (
          <li key={i.slug}>
            <Link
              href={`/informes/${i.slug}`}
              className="group block rounded-3xl border border-gray-100 p-7 transition-colors hover:border-[#059669]/40"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <BarChart3 className="h-4 w-4 text-[#059669]" aria-hidden="true" />
                <time dateTime={i.fecha} className="font-mono text-sm text-gray-500">
                  {i.fecha}
                </time>
                <span className="font-mono text-xs text-gray-500">
                  v{i.version} · {i.fuentes.length} fuentes oficiales
                </span>
              </div>
              <span className="mb-2 block text-2xl font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                {i.titulo}
              </span>
              <span className="mb-4 block text-gray-600">{i.subtitulo}</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#059669]">
                Leer el informe <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Qué indicador le falta para decidir?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Estos informes crecen con las preguntas que llegan de operación. Si necesita
          un dato del sector que no está acá y es verificable, dígalo y lo buscamos con
          su fuente.
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
            Marco de Especificación <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
