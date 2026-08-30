import type { Metadata } from "next";
import { tituloAjustado, descripcionAjustada } from '@/lib/meta';
import { notFound } from "next/navigation";
import Link from "next/link";
import ciudades from "@/data/ciudades.json";
import { SITE } from "@/lib/site";
import { products } from "@/lib/products";
import Image from "next/image";
import { breadcrumbSchema, faqSchema, serviceSchema, webPageSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { ENLACES_CUNAS } from "@/lib/cunas";
import WhatsAppLink from "@/components/WhatsAppLink";
import TrackView from "@/components/TrackView";

type Corredor = { nombre: string; contexto: string };
type Ciudad = { slug: string; ciudad: string; departamento: string; region: string;
  clima: string; contextoLocal: string; usosPrincipales: string[]; sectoresDemanda: string[];
  /**
   * Corredores industriales dentro de la misma ciudad. Sólo Lima los declara.
   *
   * Por qué van aquí y no en tres páginas propias: Villa El Salvador, Ate y
   * Lurín comparten el clima de Lima al detalle, de modo que tres páginas de
   * ciudad se diferenciarían únicamente en el nombre del distrito. Eso es una
   * doorway page, y lib/search/topic-map.ts ya lo prohíbe por escrito: «añadir
   * un término no autoriza a fabricar una página delgada de producto × ciudad».
   * Una sola página fuerte responde a las tres consultas; tres páginas débiles
   * se reparten la señal y no posicionan ninguna.
   */
  corredores?: Corredor[]; };
const CIUDADES = ciudades as Ciudad[];

export const revalidate = 86400;   // ISR: daily
export const dynamicParams = false; // only curated cities exist — no thin doorway pages

export function generateStaticParams() { return CIUDADES.map((c) => ({ ciudad: c.slug })); }
function get(slug: string) { return CIUDADES.find((c) => c.slug === slug); }

export async function generateMetadata({ params }: { params: Promise<{ ciudad: string }> }): Promise<Metadata> {
  const { ciudad } = await params; const c = get(ciudad); if (!c) return {};
  // Sin ` | ${SITE.name}`: la plantilla de app/layout.tsx ya añade la marca, y
  // ponerla aquí producía «… | Plastilonas Peruanas SAC | Plastilonas» en las
  // doce páginas de ciudad. La marca la pone la plantilla, una sola vez.
  const title = tituloAjustado(`Plastilonas y lonas en ${c.ciudad}`, 'fabricación y despacho');
  const description = descripcionAjustada([
    `Fabricación y despacho de plastilonas, lonas, cobertores e impermeabilización en ${c.ciudad}, ${c.departamento}.`,
    `${c.usosPrincipales.slice(0, 2).join(", ")}.`,
    'Cotice por WhatsApp.',
  ]);
  const url = `${SITE.url}/local/${c.slug}`;
  return { title, description, alternates: { canonical: url },
    openGraph: { title, description, url, locale: "es_PE", type: "website" } };
}

function faqsFor(c: Ciudad) {
  return [
    { q: `¿Venden plastilonas y cobertores en ${c.ciudad}?`,
      a: `Sí. Atendemos pedidos en ${c.ciudad} y todo ${c.departamento} con despacho nacional. Escríbenos por WhatsApp para cotizar medidas y cantidades.` },
    { q: `¿Qué productos se usan más en ${c.ciudad}?`,
      a: `Predominan usos como ${c.usosPrincipales.join(", ").toLowerCase()}. Contexto local: ${c.clima.toLowerCase()}` },
    ...(c.corredores?.length
      ? [{
          q: `¿Atienden los corredores industriales de ${c.ciudad}?`,
          a: `Sí. Despachamos desde la planta de ${SITE.addressLocality} a ${c.corredores
            .map((k) => k.nombre)
            .join(', ')}. No tenemos local en cada uno: la fabricación y las oficinas están en ${SITE.addressLocality}.`,
        }]
      : []),
    { q: `¿Hacen medidas a pedido?`,
      a: `Sí, fabricamos a medida. Las especificaciones exactas (espesor, color, resistencia UV) se confirman por cotización según disponibilidad.` },
  ];
}

export default async function CiudadPage({ params }: { params: Promise<{ ciudad: string }> }) {
  const { ciudad } = await params; const c = get(ciudad); if (!c) notFound();
  const url = `${SITE.url}/local/${c.slug}`; const faqs = faqsFor(c);
  // Enlazado interno real: productos cuyos sectores coinciden con la demanda
  // documentada de la ciudad. Sin coincidencia se cae a los destacados.
  const porSector = products.filter((p) => p.sector.some((s) => c.sectoresDemanda.includes(s)));
  const relacionados = (porSector.length ? porSector : products.filter((p) => p.featured)).slice(0, 6);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <TrackView kind="city" ciudad={c.ciudad} />
      <JsonLd data={[
        // Un solo nodo LocalBusiness vive en components/StructuredData.tsx; aquí
        // se referencia. Antes se redeclaraba con @id propio (#localbusiness),
        // fragmentando la entidad. La señal local correcta es Service+areaServed.
        webPageSchema({ url, name: `Plastilonas, lonas y cobertores en ${c.ciudad}`,
          description: c.contextoLocal, speakable: [".speakable-intro"],
          breadcrumbId: `${url}#breadcrumb` }),
        serviceSchema({
          name: `Fabricación y despacho de soluciones textiles industriales en ${c.ciudad}`,
          description: `Plastilonas, lonas, cobertores, geosintéticos y mallas fabricados a medida y despachados a ${c.ciudad}, ${c.departamento}. ${c.contextoLocal}`,
          url, cityName: c.ciudad, regionName: c.departamento,
          serviceTypes: c.usosPrincipales,
        }),
        breadcrumbSchema([{ name: "Inicio", url: `${SITE.url}/` },
          { name: "Cobertura local", url: `${SITE.url}/local` }, { name: c.ciudad, url }],
          `${url}#breadcrumb`),
        faqSchema(faqs, url),
      ]} />
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link> /{" "}
        <Link href="/local" className="hover:text-[#059669]">Cobertura local</Link> /{" "}
        <span>{c.ciudad}</span>
      </nav>
      <h1 className="mb-4 text-3xl font-bold">Plastilonas, lonas y cobertores en {c.ciudad}</h1>
      <p className="speakable-intro mb-6 text-lg">{SITE.name} fabrica y suministra plastilonas, mantas
        plásticas, cobertores e impermeabilización para {c.ciudad}, {c.departamento}. {c.contextoLocal}</p>
      <section className="mb-8"><h2 className="mb-3 text-2xl font-semibold">Usos más frecuentes en {c.ciudad}</h2>
        <ul className="list-disc space-y-1 pl-6">{c.usosPrincipales.map((u) => <li key={u}>{u}</li>)}</ul></section>
      {c.corredores && c.corredores.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-2xl font-semibold">Corredores industriales de {c.ciudad}</h2>
          <p className="mb-4 text-neutral-600">
            La demanda no se reparte igual por toda la ciudad. Éstos son los ejes
            desde los que llegan la mayoría de los requerimientos, con lo que pide cada uno.
          </p>
          <dl className="space-y-4">
            {c.corredores.map((k) => (
              <div key={k.nombre} className="rounded-2xl border border-neutral-200 p-4">
                <dt className="font-semibold text-[#0A2540]">{k.nombre}</dt>
                <dd className="mt-1 text-neutral-700">{k.contexto}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      <section className="mb-8"><h2 className="mb-3 text-2xl font-semibold">Sectores que atendemos</h2>
        <p>{c.sectoresDemanda.join(" · ")}</p><p className="mt-2 text-neutral-600">Clima local: {c.clima}</p></section>
      <section className="mb-8"><h2 className="mb-3 text-2xl font-semibold">Preguntas frecuentes</h2>
        <dl className="space-y-4">{faqs.map((f) => (<div key={f.q}>
          <dt className="font-semibold">{f.q}</dt><dd className="text-neutral-700">{f.a}</dd></div>))}</dl></section>
      {relacionados.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-2xl font-semibold">Productos más solicitados en {c.ciudad}</h2>
          <p className="mb-4 text-neutral-600">
            Seleccionados por los sectores que concentran la demanda local
            ({c.sectoresDemanda.join(", ")}). Todos se fabrican a medida y se despachan a {c.departamento}.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {relacionados.map((p) => (
              <li key={p.slug}>
                <Link href={`/productos/${p.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-neutral-200 transition-colors hover:border-[#059669]/40">
                  {/* Las doce páginas de ciudad servían HTML sin una sola
                      imagen de producto. Es la misma fotografía de catálogo
                      que ya publica la ficha: no se encarga nada nuevo y el
                      rastreador deja de ver una página de solo texto. */}
                  {p.image && (
                    <span className="relative block h-36 w-full bg-neutral-50">
                      <Image src={p.image} alt="" fill sizes="(min-width: 640px) 320px, 100vw" className="object-cover" />
                    </span>
                  )}
                  <span className="block p-4">
                    <span className="font-medium text-[#0A2540] group-hover:text-[#059669]">{p.name}</span>
                    <span className="mt-1 line-clamp-2 block text-sm text-neutral-600">{p.shortDescription}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {/* Las tres cuñas, enlazadas desde cada ciudad. No se afirma demanda
          local que no esté medida: se declara lo único cierto —que se fabrica
          en Chorrillos y se despacha a esta ciudad— y se deja que el comprador
          entre por el frente que le corresponde. */}
      <section className="mb-10">
        <h2 className="mb-3 text-2xl font-semibold">Lo que más se despacha a {c.ciudad}</h2>
        <p className="mb-4 text-neutral-700">
          Se fabrica en la planta de Chorrillos y se despacha a {c.ciudad}. Estas tres páginas
          traen el checklist de especificación de cada frente:
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {ENLACES_CUNAS.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="group block rounded-2xl border border-gray-100 p-4 transition-colors hover:border-[#059669]/40"
            >
              <span className="block text-sm font-semibold text-[#0A2540] group-hover:text-[#059669]">{e.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <WhatsAppLink context={`ciudad:${c.slug}`}
          message={`Hola, necesito una cotización de plastilonas en ${c.ciudad}.`}
          className="inline-flex items-center justify-center rounded-2xl bg-[#0A2540] px-6 py-3 font-semibold text-white hover:bg-[#059669]">
          Cotizar por WhatsApp
        </WhatsAppLink>
        <Link href="/local" className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-6 py-3 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]">
          Ver las {CIUDADES.length} ciudades
        </Link>
      </div>
    </main>
  );
}
