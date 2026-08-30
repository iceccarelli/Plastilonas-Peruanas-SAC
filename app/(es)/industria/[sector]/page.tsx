import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, MapPin } from 'lucide-react';
import { SITE } from '@/lib/site';
import {
  INDUSTRIAS,
  industriaBySlug,
  productosOrdenados,
  productosDe,
  solucionesDe,
  guiasDe,
  catalogoHref,
  tituloIndustria,
  descripcionIndustria,
} from '@/lib/industrias';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import WhatsAppLink from '@/components/WhatsAppLink';
import ImagenContenido from '@/components/ImagenContenido';
import FotoReferencial from '@/components/FotoReferencial';
import RielComercial from '@/components/RielComercial';
import { ranurasErrorCompra } from '@/lib/imagenes';
import {
  breadcrumbSchema,
  faqSchema,
  imageObjectSchema,
  itemListSchema,
  serviceSchema,
  webPageSchema,
} from '@/lib/schema';

/**
 * Hub de sector (/industria/[sector]).
 *
 * Contenido propio arriba —problema de compra, criterio, logística—; listas
 * derivadas abajo. Los cuatro primeros productos son los `ancla` declarados en
 * lib/industrias.ts; el resto del sector vive en el catálogo ya filtrado, que
 * es donde siempre vivió. No se clona el catálogo aquí.
 */

type Props = { params: Promise<{ sector: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return INDUSTRIAS.map((i) => ({ sector: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sector } = await params;
  const ind = industriaBySlug(sector);
  if (!ind) return {};
  const url = `${SITE.url}/industria/${ind.slug}`;
  const title = tituloIndustria(ind);
  const description = descripcionIndustria(ind);
  return {
    title,
    description,
    alternates: { canonical: `/industria/${ind.slug}` },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description,
      url,
      locale: SITE.locale,
      type: 'website',
    },
  };
}

export default async function IndustriaPage({ params }: Props) {
  const { sector } = await params;
  const ind = industriaBySlug(sector);
  if (!ind) notFound();

  const url = `${SITE.url}/industria/${ind.slug}`;
  const todos = productosOrdenados(ind);
  const ancla = todos.slice(0, ind.ancla.length);
  const restantes = todos.length - ancla.length;
  const soluciones = solucionesDe(ind);
  const guias = guiasDe(ind);
  // Los diagramas de este sector, en el mismo orden que `problemas`.
  const diagramasError = ranurasErrorCompra().filter((r) => r.id.startsWith(`error:${ind.slug}:`));


  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="solution" slug={`industria:${ind.slug}`} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: tituloIndustria(ind),
            description: descripcionIndustria(ind),
            breadcrumbId: `${url}#breadcrumb`,
            speakable: ['.speakable-intro'],
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Industrias', url: `${SITE.url}/industria` },
              { name: ind.nombre, url },
            ],
            `${url}#breadcrumb`,
          ),
          /**
           * Service con areaServed = el sector y sus regiones. No se clona el
           * LocalBusiness (que vive en Chorrillos) en cada hub: eso sería
           * declarar sedes que no existen.
           */
          serviceSchema({
            name: `Fabricación e instalación para ${ind.nombre.toLowerCase()}`,
            description: ind.intro,
            url,
            cityName: ind.regiones[0],
            regionName: ind.regiones[0],
            serviceTypes: ancla.map((p) => p.name),
          }),
          itemListSchema({
            url,
            name: `Productos para ${ind.nombre.toLowerCase()}`,
            items: todos.map((p) => ({
              name: p.name,
              url: `${SITE.url}/productos/${p.slug}`,
            })),
          }),
          faqSchema(ind.faqs, url),
          /**
           * Los esquemas de error de compra son el contenido más específico de
           * la página: cada uno dibuja una compra que salió mal en este sector.
           * Se declaran todos, con `clave` distinta para que no colisionen en el
           * grafo, y sólo el primero es representativo de la página.
           */
          ...diagramasError.map((d, i) =>
            imageObjectSchema({
              url: d.ruta,
              ancho: d.ancho,
              alto: d.alto,
              alt: d.alt,
              paginaUrl: url,
              esDiagrama: true,
              clave: d.id.split(':').pop() ?? String(i),
              representativa: i === 0,
            }),
          ),
        ]}
      />

      {/* Las migas son enlaces reales y hay que poder acertarles: sin el
          relleno vertical su caja mide 17px de alto, por debajo del mínimo de
          24×24 de WCAG 2.5.8. En un móvil son dos objetivos pequeños y muy
          juntos, que es el peor caso posible. */}
      <nav className="mb-6 flex flex-wrap items-center gap-x-1 text-sm text-neutral-500">
        <Link href="/" className="inline-flex min-h-[24px] items-center py-1 hover:text-[#059669]">
          Inicio
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/industria" className="inline-flex min-h-[24px] items-center py-1 hover:text-[#059669]">
          Industrias
        </Link>
        <span aria-hidden="true">/</span>
        <span className="inline-flex min-h-[24px] items-center py-1">{ind.nombre}</span>
      </nav>

      <p className="mb-2 font-mono text-xs uppercase tracking-wider text-[#059669]">
        Sector comprador
      </p>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
        {ind.nombre}: {ind.complementoTitulo}
      </h1>
      <p className="speakable-intro mb-8 text-lg leading-relaxed text-gray-700">
        {ind.intro}
      </p>

      <FotoReferencial src={ind.foto.src} alt={ind.foto.alt} className="mb-12" />

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Lo que se rompe cuando se compra sin criterio
        </h2>
        <div className="space-y-5">
          {ind.problemas.map((p, i) => (
            <div
              key={p.titulo}
              className="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-5"
            >
              <div className="mb-2 flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <h3 className="font-semibold text-[#0A2540]">{p.titulo}</h3>
              </div>
              <p className="pl-7 text-sm leading-relaxed text-gray-700">{p.detalle}</p>

              {/* El dibujo del error, dentro de su propia tarjeta. Un «así no /
                  así sí» al lado del texto que lo describe es lo que convierte
                  una advertencia en algo que se recuerda al redactar el RFQ.
                  Ninguno lleva prioridad: el primero ya está muy por debajo del
                  pliegue y competirían entre sí por el LCP. */}
              {diagramasError[i] && (
                <ImagenContenido
                  ranura={diagramasError[i]}
                  className="mt-4 ml-7"
                  sizes="(min-width: 768px) 640px, 100vw"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Productos ancla del sector
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          Los que resuelven la mayor parte de los requerimientos de{' '}
          {ind.nombre.toLowerCase()}.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {ancla.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/productos/${p.slug}`}
                className="group block h-full rounded-2xl border border-neutral-200 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="font-medium text-[#0A2540] group-hover:text-[#059669]">
                  {p.name}
                </span>
                <span className="mt-1.5 block text-sm leading-relaxed text-neutral-600">
                  {p.shortDescription}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {restantes > 0 && (
          <Link
            href={catalogoHref(ind)}
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#059669] hover:underline"
          >
            Ver los {productosDe(ind).length} productos etiquetados para este sector
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </section>

      {soluciones.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-2 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Arquitecturas de referencia
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            El conjunto armado, no la pieza suelta: qué componente cumple qué
            función y en qué orden se ejecuta.
          </p>
          <ul className="space-y-2.5">
            {soluciones.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/soluciones/${s.slug}`}
                  className="group flex items-start gap-2 text-gray-700 hover:text-[#059669]"
                >
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#059669]" />
                  <span className="font-medium">{s.titulo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {guias.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Guías técnicas del sector
          </h2>
          <ul className="space-y-2.5">
            {guias.slice(0, 8).map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/recursos/${a.slug}`}
                  className="group flex items-start gap-2 text-gray-700 hover:text-[#059669]"
                >
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#059669]" />
                  <span>{a.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-14 rounded-3xl border border-gray-200 bg-gray-50 p-7">
        <div className="mb-3 flex items-center gap-2.5">
          <MapPin className="h-4 w-4 text-[#059669]" />
          <h2 className="text-xl font-semibold text-[#0A2540]">
            Despacho hacia su operación
          </h2>
        </div>
        <p className="mb-4 leading-relaxed text-gray-700">{ind.logistica}</p>
        <p className="text-sm text-gray-600">
          Regiones donde este sector concentra demanda:{' '}
          <strong className="text-[#0A2540]">{ind.regiones.join(' · ')}</strong>
        </p>
      </section>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas técnicas frecuentes
        </h2>
        <dl className="space-y-6">
          {ind.faqs.map((f) => (
            <div key={f.q}>
              <dt className="mb-1.5 font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="leading-relaxed text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <RielComercial ruta={`/industria/${ind.slug}`} className="mb-10" />

      <div className="flex flex-wrap gap-3">
        <WhatsAppLink
          context={`industria:${ind.slug}`}
          message={`Hola, necesito una cotización técnica para ${ind.nombre.toLowerCase()}.`}
          className="inline-flex items-center justify-center rounded-2xl bg-[#0A2540] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#059669]"
        >
          Cotización técnica por WhatsApp
        </WhatsAppLink>
        <Link
          href="/cotizacion"
          className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
        >
          Formulario de cotización
        </Link>
        <Link
          href="/industria"
          className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
        >
          Otros sectores
        </Link>
      </div>
    </div>
  );
}
