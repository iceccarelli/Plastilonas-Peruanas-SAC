import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import { solutions } from '@/lib/solutions';
import MiniaturaRanura from '@/components/MiniaturaRanura';
import { ranurasSolucion } from '@/lib/imagenes';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';

/**
 * Índice de arquitecturas de referencia.
 *
 * El catálogo responde "¿qué venden?" y las familias "¿qué línea me sirve?".
 * Esta sección responde la pregunta que hace un jefe de proyecto: "muéstrenme
 * el conjunto armado". Es el peldaño que separa a un proveedor de componentes
 * de un proveedor de soluciones.
 */

const URL = `${SITE.url}/soluciones`;
const TITLE = 'Arquitecturas de referencia';
const DESCRIPTION = `${solutions.length} configuraciones de referencia con su lista de componentes, la secuencia de ejecución y lo que falla al comprar las piezas por separado.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/soluciones' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function SolucionesPage() {
  const portadas = ranurasSolucion();
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
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
              { name: 'Arquitecturas de referencia', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          itemListSchema({
            url: URL,
            name: 'Arquitecturas de referencia',
            description: DESCRIPTION,
            items: solutions.map((s) => ({
              name: s.titulo,
              url: `${SITE.url}/soluciones/${s.slug}`,
            })),
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link>{' '}
        / <span className="text-gray-700">Arquitecturas de referencia</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Arquitecturas de referencia
      </h1>

      <p className="speakable-intro mb-10 max-w-3xl text-lg text-gray-700">
        Una poza revestida no es una geomembrana: es subrasante aceptada, protección,
        lámina, zanja de anclaje, detalles de penetración, ensayos de costura y un
        as-built. Estas {solutions.length} configuraciones muestran el conjunto armado —
        qué componente cumple qué función, en qué orden se ejecuta y qué falla cuando se
        compra por piezas.
      </p>

      <p className="mb-10 rounded-2xl border border-gray-100 p-5 text-sm text-gray-600">
        Son <strong>configuraciones de referencia</strong>, no casos de estudio: no
        declaran obras ejecutadas, clientes ni volúmenes. Cuando publiquemos casos
        reales, irán con cifras y con permiso del cliente, en su propia sección.
      </p>

      <div className="space-y-6">
        {solutions.map((s) => (
          <article
            key={s.slug}
            className="group overflow-hidden rounded-3xl border border-gray-100 transition-all hover:border-[#059669]/40"
          >
            {/* La misma portada que abre la arquitectura. Seis conjuntos
                descritos solo con texto se confunden entre sí en la lista. */}
            <Link href={`/soluciones/${s.slug}`} aria-hidden="true" tabIndex={-1}>
              <MiniaturaRanura
                ranura={portadas.find((r) => r.id === `solucion:${s.slug}`)}
                className="w-full rounded-none"
                sizes="(min-width: 768px) 760px, 100vw"
              />
            </Link>
            <div className="p-7">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5 font-medium uppercase tracking-[0.12em] text-[#059669]">
                <Layers className="h-3.5 w-3.5" />
                {s.componentes.length} componentes
              </span>
              <span>{s.sectores.join(' · ')}</span>
            </div>

            <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
              <Link href={`/soluciones/${s.slug}`} className="group-hover:text-[#059669]">
                {s.titulo}
              </Link>
            </h2>

            <p className="mb-4 text-gray-700">{s.escenario}</p>

            <Link
              href={`/soluciones/${s.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#059669] hover:underline"
            >
              Ver el conjunto completo <ArrowRight className="h-4 w-4" />
            </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-14 rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Su proyecto se parece a alguno de estos?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Evalúelo primero contra los criterios del marco: llegará a la cotización
          sabiendo qué le falta definir y recibirá propuestas comparables entre sí.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/marco/evaluacion"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Evaluar mi proyecto <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Solicitar cotización
          </Link>
        </div>
      </div>
    </div>
  );
}
