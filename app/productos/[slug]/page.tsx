import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Phone } from 'lucide-react';
import { products } from '@/lib/products';
import CotizacionModal from '@/components/CotizacionModal';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  
  if (!product) return { title: 'Producto no encontrado' };

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.sector.some(s => product.sector.includes(s))))
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-8 text-gray-500">
        <Link href="/productos" className="hover:text-[#059669]">Productos</Link>
        <span>/</span>
        <span className="text-[#0A2540]">{product.category}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-x-14 gap-y-10">
        {/* Gallery / Image */}
        <div>
          <div className="aspect-[16/11] bg-gray-100 rounded-3xl overflow-hidden relative mb-4 border border-gray-100">
            <div className="absolute inset-0 flex items-center justify-center text-[120px] opacity-5">
              {product.category.includes('Big') && '📦'}
              {product.category.includes('Geo') && '💧'}
              {product.category.includes('Carpa') && '🏗️'}
              {product.category.includes('Manta') && '🧥'}
              {product.category.includes('Malla') && '🌿'}
              {!['Big', 'Geo', 'Carpa', 'Manta', 'Malla'].some(k => product.category.includes(k)) && '🛠️'}
            </div>
          </div>
          <div className="text-xs text-center text-gray-400">Imágenes de alta resolución disponibles bajo solicitud • Reemplazar con fotos reales del cliente</div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="badge bg-emerald-100 text-emerald-700">{product.category}</span>
            {product.popular && <span className="badge bg-amber-100 text-amber-700">Más vendido</span>}
          </div>

          <h1 className="text-5xl tracking-tighter font-semibold text-[#0A2540] leading-none mb-5">{product.name}</h1>
          
          <p className="text-xl text-gray-600 leading-snug mb-8">{product.shortDescription}</p>

          <div className="flex flex-wrap gap-3 mb-9">
            <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 bg-[#0A2540] hover:bg-[#059669] text-white px-9 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.985]">
              Solicitar Cotización para este producto <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="https://wa.me/51946085270" target="_blank" className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 border border-gray-200 hover:bg-gray-50 px-7 py-4 rounded-2xl font-medium text-sm">
              <Phone className="w-4 h-4" /> Consultar por WhatsApp
            </a>
          </div>

          {/* Quick Specs */}
          <div className="bg-gray-50 rounded-3xl p-7 text-sm">
            <div className="font-semibold tracking-tight mb-4 text-[#0A2540]">Especificaciones clave</div>
            <div className="grid grid-cols-1 gap-y-3">
              {product.specifications.slice(0, 5).map((spec, i) => (
                <div key={i} className="flex justify-between border-b border-gray-100 pb-3 last:border-none last:pb-0">
                  <span className="text-gray-500">{spec.label}</span>
                  <span className="font-medium text-right text-[#0A2540]">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Description */}
      <div className="mt-14 max-w-4xl">
        <h2 className="font-semibold text-2xl tracking-tight mb-5">Descripción completa</h2>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {product.description}
        </div>
      </div>

      {/* Specifications Table */}
      <div className="mt-14">
        <h2 className="font-semibold text-2xl tracking-tight mb-6">Especificaciones técnicas</h2>
        <div className="overflow-x-auto">
          <table className="specs-table w-full border-collapse">
            <tbody>
              {product.specifications.map((spec, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-none">
                  <td className="py-4 pr-8 font-medium text-gray-600 w-64 align-top">{spec.label}</td>
                  <td className="py-4 text-[#0A2540] font-medium">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applications & Benefits */}
      <div className="grid md:grid-cols-2 gap-8 mt-14">
        <div>
          <h3 className="font-semibold tracking-tight text-xl mb-5 flex items-center gap-2">Aplicaciones principales</h3>
          <ul className="space-y-3 text-gray-700">
            {product.applications.map((app, i) => (
              <li key={i} className="flex gap-3"><span className="text-[#059669] mt-1">→</span> {app}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold tracking-tight text-xl mb-5 flex items-center gap-2">Beneficios clave</h3>
          <ul className="space-y-3 text-gray-700">
            {product.benefits.map((ben, i) => (
              <li key={i} className="flex gap-3"><span className="text-[#059669] mt-1">→</span> {ben}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold tracking-tight text-2xl">Productos relacionados</h3>
            <Link href="/productos" className="text-sm text-[#059669] flex items-center gap-1 hover:underline">Ver todo <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map(p => (
              <Link key={p.id} href={`/productos/${p.slug}`} className="group block border border-gray-100 rounded-3xl p-6 hover:border-[#059669]/40 transition-all">
                <div className="font-semibold tracking-tight mb-2 group-hover:text-[#059669]">{p.name}</div>
                <p className="text-sm text-gray-600 line-clamp-2">{p.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="mt-16 bg-[#0A2540] text-white rounded-3xl p-10 text-center">
        <h3 className="text-3xl tracking-tight font-semibold mb-3">¿Este producto se adapta a su proyecto?</h3>
        <p className="text-white/80 mb-7 max-w-md mx-auto">Nuestro equipo técnico está listo para asesorarlo y entregarle una cotización personalizada en menos de 2 horas.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="inline-flex items-center justify-center bg-white text-[#0A2540] hover:bg-white/90 px-10 py-3.5 rounded-2xl font-semibold">Solicitar Cotización Personalizada</Link>
          <a href="https://wa.me/51946085270" target="_blank" className="inline-flex items-center justify-center border border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-2xl font-medium">Hablar con un especialista</a>
        </div>
      </div>
    </div>
  );
}
