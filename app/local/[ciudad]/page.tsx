import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ciudades from "@/data/ciudades.json";
import { SITE } from "@/lib/site";
import { breadcrumbSchema, faqSchema, localBusinessSchema, speakableSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";

type Ciudad = { slug: string; ciudad: string; departamento: string; region: string;
  clima: string; contextoLocal: string; usosPrincipales: string[]; sectoresDemanda: string[]; };
const CIUDADES = ciudades as Ciudad[];

export const revalidate = 86400;   // ISR: daily
export const dynamicParams = false; // only curated cities exist — no thin doorway pages

export function generateStaticParams() { return CIUDADES.map((c) => ({ ciudad: c.slug })); }
function get(slug: string) { return CIUDADES.find((c) => c.slug === slug); }

export async function generateMetadata({ params }: { params: Promise<{ ciudad: string }> }): Promise<Metadata> {
  const { ciudad } = await params; const c = get(ciudad); if (!c) return {};
  const title = `Plastilonas y mantas plásticas en ${c.ciudad} | ${SITE.name}`;
  const description = `Fabricación y venta de plastilonas, lonas, cobertores e impermeabilización en ${c.ciudad}, ${c.departamento}. ${c.usosPrincipales.slice(0,2).join(", ")} y más. Cotiza por WhatsApp.`;
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
    { q: `¿Hacen medidas a pedido?`,
      a: `Sí, fabricamos a medida. Las especificaciones exactas (espesor, color, resistencia UV) se confirman por cotización según disponibilidad.` },
  ];
}

export default async function CiudadPage({ params }: { params: Promise<{ ciudad: string }> }) {
  const { ciudad } = await params; const c = get(ciudad); if (!c) notFound();
  const url = `${SITE.url}/local/${c.slug}`; const faqs = faqsFor(c);
  const wa = `https://wa.me/${SITE.phoneWhatsApp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hola, necesito una cotización de plastilonas en ${c.ciudad}.`)}`;
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <JsonLd data={[
        localBusinessSchema(),
        breadcrumbSchema([{ name: "Inicio", url: SITE.url },
          { name: "Cobertura local", url: `${SITE.url}/local` }, { name: c.ciudad, url }]),
        faqSchema(faqs), speakableSchema([".speakable-intro"]),
      ]} />
      <nav className="mb-4 text-sm text-neutral-500"><Link href="/">Inicio</Link> / <span>{c.ciudad}</span></nav>
      <h1 className="mb-4 text-3xl font-bold">Plastilonas, lonas y cobertores en {c.ciudad}</h1>
      <p className="speakable-intro mb-6 text-lg">{SITE.name} fabrica y suministra plastilonas, mantas
        plásticas, cobertores e impermeabilización para {c.ciudad}, {c.departamento}. {c.contextoLocal}</p>
      <section className="mb-8"><h2 className="mb-3 text-2xl font-semibold">Usos más frecuentes en {c.ciudad}</h2>
        <ul className="list-disc space-y-1 pl-6">{c.usosPrincipales.map((u) => <li key={u}>{u}</li>)}</ul></section>
      <section className="mb-8"><h2 className="mb-3 text-2xl font-semibold">Sectores que atendemos</h2>
        <p>{c.sectoresDemanda.join(" · ")}</p><p className="mt-2 text-neutral-600">Clima local: {c.clima}</p></section>
      <section className="mb-8"><h2 className="mb-3 text-2xl font-semibold">Preguntas frecuentes</h2>
        <dl className="space-y-4">{faqs.map((f) => (<div key={f.q}>
          <dt className="font-semibold">{f.q}</dt><dd className="text-neutral-700">{f.a}</dd></div>))}</dl></section>
      <a href={wa} className="inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white">Cotizar por WhatsApp</a>
    </main>
  );
}
