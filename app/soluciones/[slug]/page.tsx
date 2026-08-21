import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { solutions, solutionBySlug } from '@/lib/solutions';
import { products } from '@/lib/products';
import { articleBySlug } from '@/lib/articles';
import { pillars } from '@/lib/framework';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasSolucion } from '@/lib/imagenes';
import { calculadorasQueEnlazan } from '@/lib/calculadoras';
import TrackView from '@/components/TrackView';
import {
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  itemListSchema,
  webPageSchema,
  imageObjectSchema,
} from '@/lib/schema';

/**
 * Arquitectura de referencia (/soluciones/[slug]).
 *
 * Muestra el conjunto armado: qué componente cumple qué función, qué decide su
 * especificación, en qué orden se ejecuta y qué falla cuando se compra por
 * piezas sueltas. Cada componente enlaza a un SKU real del catálogo y cada
 * modo de falla a la guía que lo documenta.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = solutionBySlug(slug);
  if (!s) return {};
  const url = `${SITE.url}/soluciones/${slug}`;
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: { canonical: `/soluciones/${slug}` },
    openGraph: {
      title: s.metaTitle,
      description: s.metaDescription,
      url,
      locale: SITE.locale,
      type: 'article',
    },
  };
}

export default async function SolucionPage({ params }: Props) {
  const { slug } = await params;
  const s = solutionBySlug(slug);
  const calculadorasRel = calculadorasQueEnlazan(`/soluciones/${slug}`);
  if (!s) notFound();

  const url = `${SITE.url}/soluciones/${slug}`;
  const imagen = ranurasSolucion().find((r) => r.id === `solucion:${slug}`);
  const componentes = s.componentes
    .map((c) => ({ ...c, producto: products.find((p) => p.slug === c.producto) }))
    .filter((c) => c.producto);
  const guias = s.guias.map((g) => articleBySlug(g)).filter(Boolean);
  const pilaresClave = pillars.filter((p) => s.pilaresClave.includes(p.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="solution" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: s.titulo,
            description: s.metaDescription,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Arquitecturas de referencia', url: `${SITE.url}/soluciones` },
              { name: s.titulo, url },
            ],
            `${url}#breadcrumb`,
          ),
          itemListSchema({
            url,
            name: `Componentes de ${s.titulo}`,
            items: componentes.map((c) => ({
              name: c.producto!.name,
              url: `${SITE.url}/productos/${c.producto!.slug}`,
            })),
          }),
          howToSchema({
            url,
            name: s.titulo,
            description: s.metaDescription,
            steps: s.secuencia.map((p) => ({ name: p.paso, text: p.detalle })),
          }),
          faqSchema(s.faqs, url),
          ...(imagen
            ? [imageObjectSchema({
                url: imagen.ruta, ancho: imagen.ancho, alto: imagen.alto,
                alt: imagen.alt, paginaUrl: url, esDiagrama: true,
              })]
            : []),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link>{' '}
        /{' '}
        <Link href="/soluciones" className="hover:text-[#059669]">
          Arquitecturas de referencia
        </Link>{' '}
        / <span className="text-gray-700">{s.sectores[0]}</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {s.titulo}
      </h1>

      {/* Documento para pedir presupuesto interno: lista de materiales completa. */}
      <a
        href={`/soluciones/${s.slug}/arquitectura.pdf`}
        className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
      >
        Descargar en PDF: lista de materiales y secuencia
      </a>

      <p className="speakable-intro mb-8 text-lg text-gray-700">{s.escenario}</p>

      {/* El esquema va acá y no al final: en una arquitectura, ver el orden de
          las capas ANTES de leer la lista de materiales es lo que hace que la
          lista se entienda. */}
      {imagen && <ImagenContenido ranura={imagen} prioridad className="mb-12" />}

      <section className="mb-12 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-7">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#059669]">
          Qué se rompe al comprar por piezas
        </h2>
        <div className="space-y-3 text-gray-800">
          {s.problema.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Componentes del conjunto
        </h2>
        <p className="mb-6 text-gray-600">
          Cada pieza enlaza a su ficha con especificaciones reales. Las marcadas como
          opcionales dependen del caso.
        </p>
        <div className="space-y-4">
          {componentes.map((c) => (
            <div key={c.producto!.slug} className="rounded-2xl border border-gray-100 p-6">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <Link
                  href={`/productos/${c.producto!.slug}`}
                  className="font-semibold text-[#0A2540] hover:text-[#059669]"
                >
                  {c.producto!.name}
                </Link>
                {c.opcional && (
                  <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    Según el caso
                  </span>
                )}
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-600">Función en el conjunto</dt>
                  <dd className="text-gray-700">{c.funcion}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-600">Qué decide su especificación</dt>
                  <dd className="text-gray-700">{c.criterio}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Secuencia de ejecución
        </h2>
        <ol className="space-y-5">
          {s.secuencia.map((p, i) => (
            <li key={p.paso} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#059669]/10 text-sm font-semibold text-[#047857]">
                {i + 1}
              </span>
              <div>
                <div className="font-semibold text-[#0A2540]">{p.paso}</div>
                <p className="mt-1 text-gray-700">{p.detalle}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Modos de falla documentados
        </h2>
        <div className="space-y-4">
          {s.riesgos.map((r) => (
            <div key={r.titulo} className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <div className="font-semibold text-[#0A2540]">{r.titulo}</div>
                <p className="mt-1 text-gray-700">{r.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Criterios del marco que la gobiernan
        </h2>
        <p className="mb-5 text-gray-600">
          Antes de cotizar esta configuración conviene tener resueltos estos pilares:
        </p>
        <div className="flex flex-wrap gap-2">
          {pilaresClave.map((p) => (
            <Link
              key={p.id}
              href={`/marco#${p.id}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
            >
              {p.nombre}
            </Link>
          ))}
        </div>
      </section>

      {guias.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Guías técnicas que la respaldan
          </h2>
          <div className="space-y-4">
            {guias.map((g) => (
              <Link
                key={g!.slug}
                href={`/recursos/${g!.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {g!.title}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{g!.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Calculadoras que dimensionan esta arquitectura. El enlace se deriva de
          la propia calculadora: no hay una segunda lista que mantener. */}
      {calculadorasRel.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Póngale números
          </h2>
          <p className="mb-5 text-sm text-gray-600">
            Predimensione esta arquitectura con la fórmula a la vista y sus límites declarados. El
            cálculo ocurre en su navegador: no se envía nada.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {calculadorasRel.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/calculadoras/${c.slug}`}
                  className="flex h-full flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 hover:ring-gray-300"
                >
                  <span className="text-sm font-semibold text-[#0A2540]">{c.titulo}</span>
                  <span className="mt-1 text-xs text-gray-600">{c.pregunta}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {s.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          Cotizar el conjunto, no las piezas
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Indíquenos las condiciones reales de su proyecto y le devolvemos la
          especificación de cada componente junto con la propuesta.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/cotizacion?comparativa=${componentes.filter((c) => !c.opcional).map((c) => c.producto!.slug).join(',')}`}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Cotizar esta configuración
          </Link>
          <Link
            href="/marco/evaluacion"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Evaluar mi proyecto primero <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
