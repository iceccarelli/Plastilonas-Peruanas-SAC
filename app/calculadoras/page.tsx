import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator, FileJson } from 'lucide-react';
import { calculadoras, areasDeCalculo, ADVERTENCIA } from '@/lib/calculadoras';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, itemListSchema, webPageSchema, faqSchema } from '@/lib/schema';
import MiniaturaRanura from '@/components/MiniaturaRanura';
import { ranurasCalculadora } from '@/lib/imagenes';

/**
 * Índice de calculadoras.
 *
 * Por qué existe esta sección. El catálogo responde «¿qué venden?», las guías
 * «¿cómo se hace?» y el glosario «¿qué significa?». Falta la pregunta con la
 * que la gente realmente llega: «¿cuánto necesito?». Hoy en el rubro esa
 * pregunta se responde por teléfono, una vez, y se pierde. Publicada con su
 * fórmula a la vista, se puede verificar, aplicar y citar.
 */

const URL = `${SITE.url}/calculadoras`;
const TITLE = 'Calculadoras de predimensionamiento';
const DESCRIPTION = `${calculadoras.length} métodos abiertos de predimensionamiento: ventilación, geomembrana, rollos por superficie, big bags por viaje y capacidad. Con la fórmula a la vista.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/calculadoras' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

const PREGUNTAS = [
  {
    q: '¿Estas calculadoras reemplazan una memoria de cálculo?',
    a: 'No. Son de predimensionamiento: sirven para llegar a la cotización con un número propio y para ver qué variable manda. No sustituyen una memoria firmada ni autorizan a ejecutar nada. Cada calculadora declara además, por escrito, qué no cubre.',
  },
  {
    q: '¿Se envían a algún servidor los datos que escribo?',
    a: 'No. Todo el cálculo ocurre en su navegador y nada se transmite. Las medidas de un proyecto son información de su cliente; pedirlas a cambio de un resultado convertiría una herramienta pública en un formulario de captación.',
  },
  {
    q: '¿De dónde salen los criterios normativos?',
    a: 'Los criterios de aire por persona según altitud, los 3 m³/min por HP diésel y las velocidades del aire proceden de la guía publicada en este sitio, que cita a Revista Seguridad Minera y al D.S. N.° 024-2016-EM. El resto es geometría. No se publican densidades de materiales, medidas de contenedores ni cargas útiles: esos datos los aporta quien calcula, desde su ficha o desde la placa del contenedor.',
  },
  {
    q: '¿Puedo usar estas fórmulas fuera de este sitio?',
    a: `Sí. Están publicadas completas en ${SITE.url}/calculadoras/formulas.json para que puedan verificarse y aplicarse sin usar este sitio, indicando la fuente. Al citar un resultado, cite también el apartado de límites del método: un predimensionamiento sin sus límites induce a usarlo como cálculo de ingeniería.`,
  },
];

export default function CalculadorasPage() {
  const areas = areasDeCalculo();
  const geometrias = ranurasCalculadora();

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
              { name: 'Calculadoras', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          itemListSchema({
            name: 'Calculadoras de predimensionamiento',
            description: DESCRIPTION,
            url: URL,
            items: calculadoras.map((c) => ({
              name: c.titulo,
              url: `${URL}/${c.slug}`,
            })),
          }),
          faqSchema(PREGUNTAS, URL),
        ]}
      />

      <nav aria-label="Ruta" className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Calculadoras</span>
      </nav>

      <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
        ¿Cuánto necesito?
      </h1>
      <p className="speakable-intro mt-5 max-w-3xl text-lg text-gray-600">
        {calculadoras.length} calculadoras de predimensionamiento con la fórmula a la vista. Cada una
        declara sus supuestos, deja cambiarlos y dice por escrito qué no cubre. Nada se envía a
        ningún servidor: el cálculo ocurre en su navegador.
      </p>

      <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">{ADVERTENCIA}</div>

      {areas.map((area) => (
        <section key={area} className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{area}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {calculadoras
              .filter((c) => c.area === area)
              .map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/calculadoras/${c.slug}`}
                    className="group flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:ring-gray-300"
                  >
                    {/* El esquema de geometría del método. Un índice de
                        calculadoras sin figura obliga a entrar en cinco para
                        saber cuál mide lo que uno necesita. */}
                    <MiniaturaRanura
                      ranura={geometrias.find((r) => r.id === `calculadora:${c.slug}`)}
                      className="mb-4 w-full"
                      sizes="(min-width: 640px) 420px, 100vw"
                    />
                    <Calculator className="h-5 w-5 text-[#059669]" aria-hidden="true" />
                    <h3 className="mt-3 text-lg font-semibold text-gray-900">{c.titulo}</h3>
                    <p className="mt-2 text-sm text-gray-600">{c.pregunta}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#059669]">
                      Abrir
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Preguntas</h2>
        <dl className="mt-5 space-y-5">
          {PREGUNTAS.map((p) => (
            <div key={p.q}>
              <dt className="font-medium text-gray-900">{p.q}</dt>
              <dd className="mt-1 text-gray-600">{p.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14 rounded-3xl bg-gray-50 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <FileJson className="h-5 w-5" aria-hidden="true" /> Los métodos, como datos
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          Las fórmulas, los supuestos y los límites de las {calculadoras.length} calculadoras están
          publicados en un solo archivo legible por máquina, con la atribución sugerida al lado. Se
          publican completos a propósito: una caja negra no la cita nadie, porque nadie la puede
          verificar.
        </p>
        <a
          href="/calculadoras/formulas.json"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#059669] hover:underline"
        >
          /calculadoras/formulas.json
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}
