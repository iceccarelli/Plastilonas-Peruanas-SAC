import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guides, guideBySlug } from '@/lib/guides';
import { products } from '@/lib/products';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasBiblioteca } from '@/lib/imagenes';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) return {};
  return { title: g.title, description: g.summary, alternates: { canonical: `/biblioteca/${slug}` } };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) notFound();
  const related = products.filter((p) => g.relatedProductSlugs.includes(p.slug));
  // El diagrama de la ranura, si existe el archivo. ImagenContenido resuelve
  // solo el caso de que aún no esté publicado.
  const diagrama = ranurasBiblioteca().find((r) => r.id === `biblioteca:${g.slug}`);

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <Link href="/biblioteca" className="text-xs uppercase tracking-widest text-[#059669]">Biblioteca</Link>
      <h1 className="t-display font-semibold text-[#0A2540] mt-3">{g.title}</h1>
      <p className="mt-3 text-sm text-gray-500">{g.titleEn} · Revisión {g.revised} · {g.reviewer}</p>
      <p className="mt-5 text-lg text-gray-700">{g.summary}</p>

      {/* El dibujo va DESPUÉS del resumen y ANTES del desarrollo: quien llega
          buscando cómo especificar algo necesita ver la pieza completa antes de
          leer las partes, no al revés. */}
      {diagrama && (
        <ImagenContenido ranura={diagrama} prioridad className="mt-8" sizes="(min-width: 768px) 720px, 100vw" />
      )}

      {g.sections.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="text-xl font-semibold text-[#0A2540]">{s.heading}</h2>
          <p className="mt-3 text-gray-700 leading-relaxed">{s.body}</p>
        </section>
      ))}
      <h2 className="mt-10 text-xl font-semibold text-[#0A2540]">Para cotizar</h2>
      <ul className="mt-3 list-disc pl-5 text-sm text-gray-700">
        {g.questions.map((q) => <li key={q}>{q}</li>)}
      </ul>
      <p className="mt-6 text-sm text-gray-500">{g.disclaimer}</p>
      <Link href="/cotizacion" className="btn mt-8 inline-flex bg-[#0A2540] text-white px-5 py-3 rounded-2xl">Abrir RFQ</Link>
      <ul className="mt-8 space-y-2 text-sm">
        {related.map((p) => (
          <li key={p.slug}><Link href={`/productos/${p.slug}`} className="text-[#059669]">{p.name}</Link></li>
        ))}
      </ul>
    </div>
  );
}
