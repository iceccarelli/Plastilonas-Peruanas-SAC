import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { products, sourcingLabels, availabilityLabels } from '@/lib/products';
import { resolveFamily, comparableFamilies } from '@/lib/families';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';
import { descripcionDeTexto } from '@/lib/meta';

/**
 * Tabla comparativa por familia (/productos/familia/[slug]/comparar).
 *
 * Así es como decide de verdad un comprador técnico: pone las alternativas una
 * al lado de la otra y compara especificación por especificación. Hasta ahora
 * tenía que abrir seis pestañas y hacerlo a mano.
 *
 * REGLA DE HONESTIDAD: la matriz se construye con la UNIÓN de las etiquetas de
 * especificación declaradas por los productos de la familia. Donde un producto
 * no declara esa especificación se escribe "No declarado" — nunca se rellena
 * con un valor plausible ni se copia el del vecino.
 *
 * Solo se generan las familias con dos o más productos: una comparativa de un
 * solo elemento es una página vacía que no debe indexarse.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return comparableFamilies().map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveFamily(slug);
  if (!resolved) return {};
  const { family } = resolved;
  const items = products.filter((p) => p.category === family.name);
  const title = `Comparativa: ${items.length} alternativas de ${family.name.toLowerCase()}`;
  // Nombrar tres productos gastaba 120 de los 155 caracteres y dejaba fuera lo
  // único que distingue esta página: que las especificaciones están enfrentadas.
  const description = descripcionDeTexto(
    `${items.length} ${family.name.toLowerCase()} enfrentadas: especificación, origen y disponibilidad, lado a lado. Para elegir con criterio y no por catálogo.`,
  );
  return {
    title,
    description,
    alternates: { canonical: `/productos/familia/${slug}/comparar` },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description,
      url: `${SITE.url}/productos/familia/${slug}/comparar`,
      locale: SITE.locale,
      type: 'website',
    },
  };
}

export default async function CompararPage({ params }: Props) {
  const { slug } = await params;
  const resolved = resolveFamily(slug);
  if (!resolved) notFound();
  const { family } = resolved;

  const items = products.filter((p) => p.category === family.name);
  if (items.length < 2) notFound();

  const url = `${SITE.url}/productos/familia/${slug}/comparar`;

  // Unión de etiquetas, en el orden en que aparecen en el catálogo.
  const labels: string[] = [];
  for (const p of items) {
    for (const spec of p.specifications) {
      if (!labels.includes(spec.label)) labels.push(spec.label);
    }
  }

  // Una fila solo compara si al menos DOS productos declaran esa
  // especificación. Con la unión completa, una familia de siete productos
  // producía una tabla de mayoría "No declarado": técnicamente honesta pero
  // inservible para decidir, y que además hace parecer pobre al catálogo.
  const cuenta = (label: string) =>
    items.filter((p) => p.specifications.some((s) => s.label === label)).length;
  const sharedLabels = labels.filter((l) => cuenta(l) >= 2);

  // Lo exclusivo de cada producto no se descarta: se muestra debajo, donde
  // aporta como diferenciador en vez de como hueco en la matriz.
  const exclusivas = items
    .map((p) => ({
      producto: p,
      specs: p.specifications.filter((s) => cuenta(s.label) < 2),
    }))
    .filter((x) => x.specs.length > 0);

  const valueFor = (slugProducto: string, label: string): string => {
    const p = items.find((x) => x.slug === slugProducto);
    return p?.specifications.find((s) => s.label === label)?.value ?? 'No declarado';
  };

  const cotizarTodos = `/cotizacion?comparativa=${items.map((p) => p.slug).join(',')}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <TrackView kind="comparison" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: `Comparativa de ${family.name}`,
            description: `Especificaciones lado a lado de ${items.length} alternativas de ${family.name}.`,
            type: 'CollectionPage',
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Catálogo', url: `${SITE.url}/productos` },
              { name: family.name, url: `${SITE.url}/productos/familia/${slug}` },
              { name: 'Comparativa', url },
            ],
            `${url}#breadcrumb`,
          ),
          itemListSchema({
            url,
            name: `Comparativa de ${family.name}`,
            items: items.map((p) => ({ name: p.name, url: `${SITE.url}/productos/${p.slug}` })),
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link>{' '}
        / <Link href="/productos" className="hover:text-[#059669]">Catálogo</Link>{' '}
        /{' '}
        <Link href={`/productos/familia/${slug}`} className="hover:text-[#059669]">
          {family.name}
        </Link>{' '}
        / <span className="text-gray-700">Comparativa</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Comparativa: {items.length} alternativas de {family.name.toLowerCase()}
      </h1>

      <p className="mb-8 max-w-3xl text-lg text-gray-700">
        Especificaciones lado a lado, tal como las declara nuestro catálogo. Donde un
        producto no declara una especificación, la celda dice{' '}
        <strong>No declarado</strong>: preferimos el vacío honesto a un valor plausible
        que después no podamos sostener en la cotización.
      </p>

      <div className="mb-10 overflow-x-auto rounded-3xl border border-gray-100">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="sticky left-0 z-10 min-w-[190px] bg-gray-50 p-4 text-left font-semibold text-[#0A2540]">
                Especificación
              </th>
              {items.map((p) => (
                <th key={p.slug} className="min-w-[220px] p-4 text-left align-top">
                  {/* Comparar seis geomembranas por columnas de texto obliga a
                      recordar cuál es cuál mientras se baja por la tabla. La
                      miniatura ancla la columna. `alt=""` porque el nombre del
                      producto va justo debajo, dentro del mismo enlace. */}
                  {p.image && (
                    <Link href={`/productos/${p.slug}`} aria-hidden="true" tabIndex={-1}>
                      <span className="relative mb-3 block h-24 w-full overflow-hidden rounded-xl bg-white">
                        <Image
                          src={p.image}
                          alt=""
                          fill
                          sizes="220px"
                          className="object-cover"
                        />
                      </span>
                    </Link>
                  )}
                  <Link
                    href={`/productos/${p.slug}`}
                    className="font-semibold text-[#0A2540] hover:text-[#059669]"
                  >
                    {p.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <th className="sticky left-0 z-10 bg-white p-4 text-left font-medium text-gray-600">
                Origen
              </th>
              {items.map((p) => (
                <td key={p.slug} className="p-4 align-top text-gray-700">
                  {p.sourcing ? sourcingLabels[p.sourcing] ?? p.sourcing : 'No declarado'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100">
              <th className="sticky left-0 z-10 bg-white p-4 text-left font-medium text-gray-600">
                Disponibilidad
              </th>
              {items.map((p) => (
                <td key={p.slug} className="p-4 align-top text-gray-700">
                  {availabilityLabels[p.availability ?? 'a_medida'] ?? 'A medida'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100">
              <th className="sticky left-0 z-10 bg-white p-4 text-left font-medium text-gray-600">
                Sectores
              </th>
              {items.map((p) => (
                <td key={p.slug} className="p-4 align-top text-gray-700">
                  {p.sector.join(', ')}
                </td>
              ))}
            </tr>

            {sharedLabels.map((label) => (
              <tr key={label} className="border-b border-gray-100 last:border-none">
                <th className="sticky left-0 z-10 bg-white p-4 text-left font-medium text-gray-600">
                  {label}
                </th>
                {items.map((p) => {
                  const value = valueFor(p.slug, label);
                  return (
                    <td
                      key={p.slug}
                      className={`p-4 align-top ${
                        value === 'No declarado' ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}

            <tr>
              <th className="sticky left-0 z-10 bg-white p-4 text-left font-medium text-gray-600">
                Ficha técnica
              </th>
              {items.map((p) => (
                <td key={p.slug} className="p-4 align-top">
                  <a
                    href={`/productos/${p.slug}/ficha-tecnica.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#059669] hover:underline"
                  >
                    Descargar PDF
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {exclusivas.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-2 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Especificaciones exclusivas de cada alternativa
          </h2>
          <p className="mb-6 text-gray-600">
            Datos que solo declara uno de los productos: no entran en la tabla porque no
            hay con qué compararlos, pero suelen ser la razón por la que se elige uno u
            otro.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {exclusivas.map(({ producto, specs }) => (
              <div key={producto.slug} className="rounded-2xl border border-gray-100 p-5">
                <Link
                  href={`/productos/${producto.slug}`}
                  className="mb-3 block font-semibold text-[#0A2540] hover:text-[#059669]"
                >
                  {producto.name}
                </Link>
                <dl className="space-y-2 text-sm">
                  {specs.map((s) => (
                    <div key={s.label}>
                      <dt className="font-medium text-gray-600">{s.label}</dt>
                      <dd className="text-gray-700">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Cotizamos las alternativas que está evaluando?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Le enviamos precio y plazo de las {items.length} opciones para que compare con
          números reales. Indíquenos medidas, cantidad y ciudad de entrega.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={cotizarTodos}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Cotizar las {items.length} alternativas
          </Link>
          <Link
            href={`/productos/familia/${slug}`}
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Volver a {family.name} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
