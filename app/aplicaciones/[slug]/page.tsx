import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { applications, applicationBySlug } from '@/lib/applications';
import { products } from '@/lib/products';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasAplicacion } from '@/lib/imagenes';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return applications.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = applicationBySlug(slug);
  if (!app) return {};
  return { title: app.name, description: app.problem, alternates: { canonical: `/aplicaciones/${slug}` } };
}

export default async function AplicacionPage({ params }: Props) {
  const { slug } = await params;
  const app = applicationBySlug(slug);
  if (!app) notFound();
  const list = products.filter((p) => app.productSlugs.includes(p.slug));
  const foto = ranurasAplicacion().find((r) => r.id === `aplicacion:${app.slug}`);

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <Link href="/aplicaciones" className="text-xs uppercase tracking-widest text-[#059669]">Aplicaciones</Link>
      <h1 className="t-display font-semibold text-[#0A2540] mt-3">{app.name}</h1>
      <p className="mt-4 text-gray-600 max-w-3xl leading-relaxed">{app.problem}</p>
      <p className="mt-4 text-gray-700 max-w-3xl leading-relaxed">{app.approach}</p>

      {/* La fotografía después del planteamiento: primero se nombra el problema
          con palabras, luego se enseña dónde ocurre. Prioritaria porque es la
          imagen que mide el LCP de esta página. */}
      {foto && <ImagenContenido ranura={foto} prioridad className="mt-8" sizes="(min-width: 1024px) 900px, 100vw" />}
      <Link href={`/cotizacion?notas=${encodeURIComponent('Aplicación: ' + app.name)}`} className="btn mt-8 inline-flex bg-[#0A2540] text-white px-5 py-3 rounded-2xl">RFQ de esta aplicación</Link>
      <h2 className="mt-12 text-xl font-semibold text-[#0A2540]">Qué preguntamos</h2>
      <ol className="mt-3 list-decimal pl-5 text-gray-700 space-y-1">
        {app.questions.map((q) => <li key={q}>{q}</li>)}
      </ol>
      <h2 className="mt-10 text-xl font-semibold text-[#0A2540]">Lo que no afirmamos</h2>
      <ul className="mt-3 list-disc pl-5 text-gray-600 space-y-1 text-sm">
        {app.notClaimed.map((q) => <li key={q}>{q}</li>)}
      </ul>
      <h2 className="mt-10 text-xl font-semibold text-[#0A2540]">Catálogo</h2>
      <ul className="mt-4 grid sm:grid-cols-2 gap-3">
        {list.map((p) => (
          <li key={p.slug}>
            <Link href={`/productos/${p.slug}`} className="block border border-gray-100 rounded-2xl p-4 hover:border-[#059669]/40">{p.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
