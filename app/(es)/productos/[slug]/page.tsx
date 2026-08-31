import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Phone } from 'lucide-react';
import { products } from '@/lib/products';
import ProductGallery from '@/components/ProductGallery';
import { mapaDeTomas } from '@/lib/galeria';
import ProductBuyBox from '@/components/ProductBuyBox';
import ProductAvailability from '@/components/ProductAvailability';
import ProductStructuredData from '@/components/ProductStructuredData';
import { SITE } from '@/lib/site';
import { descripcionDeTexto } from '@/lib/meta';
import WhatsAppLink from '@/components/WhatsAppLink';
import TrackView from '@/components/TrackView';
import DatasheetButton from '@/components/DatasheetButton';
import { solutionsForProduct } from '@/lib/solutions';
import { terminosParaProducto } from '@/lib/glosario';
import { productFaqs } from '@/lib/product-faq';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';
import RielComercial from '@/components/RielComercial';
import { respuestaDirectaProducto, rfqWhatsAppProducto } from '@/lib/respuesta-directa';
import { familyHrefByName } from '@/lib/families';
import { INDUSTRIAS } from '@/lib/industrias';
import { guides } from '@/lib/guides';
import { cunaDeProducto } from '@/lib/cunas';
import DatosParaCotizar from '@/components/DatosParaCotizar';

interface Props {
  params: Promise<{ slug: string }>;
}

// ISR: las fichas cambian solo con el catálogo; un día de caché.
export const revalidate = 86400;

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  
  if (!product) return { title: 'Producto no encontrado' };

  // Las fotos reales ahora existen en /public/images: exponemos la imagen del
  // producto en Open Graph / Twitter para que al compartir la página (WhatsApp,
  // LinkedIn) se muestre la foto real del producto.
  const canonical = `/productos/${product.slug}`;
  const ogTitle = `${product.name} — Plastilonas Peruanas SAC`;
  const ogImage = product.image ? `${SITE.url}${product.image}` : undefined;
  return {
    // Plantilla de ficha de producto: «{Producto} a medida en Perú | Plastilonas
    // Peruanas SAC». Va como `absolute` para no heredar además el sufijo del
    // layout y terminar con la marca dos veces.
    title: { absolute: `${product.name} a medida en Perú | Plastilonas Peruanas SAC` },
    description: descripcionDeTexto(product.shortDescription),
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: product.shortDescription,
      url: canonical,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage, alt: product.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: product.shortDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const rutaProducto = `/productos/${product.slug}`;
  const respuestaDirecta = respuestaDirectaProducto(product);
  const rfq = rfqWhatsAppProducto(product);
  const faqs = productFaqs(product);
  const arquitecturas = solutionsForProduct(product.slug);
  const glosarioRel = terminosParaProducto(product.slug);
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.sector.some(s => product.sector.includes(s))))
    .slice(0, 3);
  // Enlaces laterales del grafo interno: familia, hub de industria y guía de
  // la biblioteca que gobiernan esta compra. Derivados del dato, no a mano.
  const familiaHref = familyHrefByName(product.category);
  const industriasRel = INDUSTRIAS.filter((i) =>
    i.etiquetas.some((e) => product.sector.includes(e)),
  ).slice(0, 3);
  const guiasRel = guides.filter((g) => g.relatedProductSlugs.includes(product.slug));
  // La cuña comercial que agrupa esta ficha, si alguna la agrupa: es la página
  // que debe concentrar la señal de «lona camión», «manga ventilación» o
  // «big bags», y sus propias fichas hijas son quienes mejor se la pasan.
  const cuna = cunaDeProducto(product.slug);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <TrackView kind="product" slug={product.slug} categoria={product.category} />
      <ProductStructuredData product={product} />
      {/* FAQPage derivado del catálogo (lib/product-faq.ts): cero respuestas
          inventadas — cada una sale de un campo real del producto. */}
      <JsonLd data={faqSchema(faqs, `${SITE.url}/productos/${product.slug}`)} />
      {/* WebPage + BreadcrumbList. Faltaban: la ficha pintaba una miga de pan
          visible —Productos / Familia / Producto— que ningún agente podía leer,
          porque no se emitía como datos. Es la página comercial más importante
          del sitio y era la única profunda sin jerarquía declarada. */}
      {/* `speakable` marca el párrafo que un asistente de voz puede leer en voz
          alta tal cual. Apunta a la respuesta directa —compuesta de campos
          reales del catálogo— y no al hero comercial, que no contesta nada. */}
      <JsonLd data={webPageSchema({
        url: `${SITE.url}${rutaProducto}`,
        name: product.name,
        description: respuestaDirecta,
        speakable: ['.respuesta-directa'],
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Inicio', url: `${SITE.url}/` },
        { name: 'Productos', url: `${SITE.url}/productos` },
        { name: product.category, url: `${SITE.url}${familiaHref}` },
        { name: product.name, url: `${SITE.url}${rutaProducto}` },
      ])} />
      {/* Breadcrumb: la familia enlaza a SU página, no de vuelta al catálogo.
          Es el mismo dato que declara el BreadcrumbList de arriba. */}
      <div className="flex items-center gap-2 text-sm mb-8 text-gray-500">
        <Link href="/productos" className="hover:text-[#059669]">Productos</Link>
        <span>/</span>
        <Link href={familiaHref} className="hover:text-[#059669]">{product.category}</Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-x-14 gap-y-10">
        {/* Gallery */}
        <div>
          <ProductGallery product={product} tomas={mapaDeTomas(product.gallery ?? [])} />
        </div>


        {/* Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="badge bg-emerald-100 text-emerald-700">{product.category}</span>
            {product.popular && <span className="badge bg-amber-100 text-amber-700">Más vendido</span>}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter font-semibold text-[#0A2540] leading-tight md:leading-none mb-5">{product.name}</h1>
          
          <p className="text-xl text-gray-600 leading-snug mb-6">{product.shortDescription}</p>

          {/* RESPUESTA DIRECTA. El fragmento que un motor de respuestas cita
              entero en lugar de resumir por su cuenta. Se compone en
              lib/respuesta-directa.ts a partir de campos reales: no hay texto
              libre que alguien pueda rellenar con una cifra inventada, y en las
              líneas bajo pedido dice de qué depende la especificación en vez de
              dar un número que este repositorio no puede sostener. */}
          <p className="respuesta-directa text-[15px] leading-relaxed text-[#0A2540] bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 mb-8">
            {respuestaDirecta}
          </p>

          <ProductAvailability product={product} />

          <ProductBuyBox product={product} />

          <div className="flex flex-wrap gap-3 mb-9">
            <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 bg-[#0A2540] hover:bg-[#059669] text-white px-9 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.985]">
              Solicitar Cotización para este producto <ArrowRight className="w-4 h-4" />
            </Link>
            {/* El mensaje llega con el SKU y con los campos que la cotización
                necesita, sacados de las etiquetas de especificación reales.
                Antes decía sólo «necesito una cotización de X» y el comercial
                tenía que pedir todo lo demás; cada ida y vuelta pierde gente. */}
            <WhatsAppLink
              context={`rfq-producto:${product.slug}`}
              message={rfq}
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 border border-gray-200 hover:bg-gray-50 px-7 py-4 rounded-2xl font-medium text-sm"
            >
              <Phone className="w-4 h-4" /> RFQ por WhatsApp
            </WhatsAppLink>
            <DatasheetButton slug={product.slug} nombre={product.name} />
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
        {/* `th scope="row"` no es decoración: convierte dos columnas de texto en
            pares clave/valor legibles para un lector de pantalla y para
            cualquier extractor de tablas. El mismo par viaja además como
            additionalProperty en el JSON-LD de ProductStructuredData. */}
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Especificaciones técnicas (se desplaza en horizontal)">
          <table className="specs-table w-full border-collapse">
            <caption className="sr-only">
              Especificaciones técnicas de {product.name} (SKU {product.id})
            </caption>
            <tbody>
              {product.specifications.map((spec, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-none">
                  <th scope="row" className="py-4 pr-8 text-left font-medium text-gray-600 w-64 align-top">{spec.label}</th>
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

      {/* Preguntas frecuentes — el contenido visible debe coincidir con el
          FAQPage emitido arriba; Google penaliza el schema sin contraparte visible. */}
      <div className="mt-16 pt-10 border-t">
        <h2 className="font-semibold tracking-tight text-2xl mb-6">Preguntas frecuentes sobre {product.name}</h2>
        <dl className="space-y-6 max-w-3xl">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Capa definicional: los términos que gobiernan esta especificación.
          Un comprador que no sabe qué es "factor de seguridad" no puede
          evaluar la ficha, por completa que esté. */}
      {glosarioRel.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          <h2 className="font-semibold tracking-tight text-2xl mb-2">
            Qué hay que entender antes de especificarlo
          </h2>
          <p className="text-gray-600 mb-6">
            Los términos que deciden esta compra, definidos con precisión y sin
            promoción. Sirven igual si termina comprándolo en otra parte.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {glosarioRel.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/glosario/${t.slug}`}
                  className="group block rounded-2xl border border-gray-100 p-4 transition-colors hover:border-[#059669]/40"
                >
                  <span className="block font-medium text-[#0A2540] group-hover:text-[#059669]">
                    {t.termino}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm text-gray-600">
                    {t.definicionCorta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {arquitecturas.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          <h2 className="font-semibold tracking-tight text-2xl mb-2">
            Dónde encaja este producto
          </h2>
          <p className="text-gray-600 mb-6">
            Rara vez se compra solo. Estas configuraciones muestran el conjunto completo
            del que forma parte, con su secuencia de ejecución.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {arquitecturas.map((s) => (
              <Link
                key={s.slug}
                href={`/soluciones/${s.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {s.titulo}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{s.escenario}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

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

      {/* Contexto de compra: familia, hub de sector y guía técnica. Cierra el
          triángulo ficha → familia → industria → biblioteca del grafo interno. */}
      {(cuna || industriasRel.length > 0 || guiasRel.length > 0) && (
        <div className="mt-16 pt-10 border-t">
          <h2 className="font-semibold tracking-tight text-2xl mb-6">Para seguir especificando</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cuna && (
              <Link href={`/${cuna.slug}`} className="group block rounded-2xl border border-[#059669]/30 bg-emerald-50/40 p-5 hover:border-[#059669] transition-colors">
                <span className="block text-xs uppercase tracking-wide text-[#047857] mb-1">Frente comercial</span>
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">{cuna.titulo}</span>
              </Link>
            )}
            <Link href={familiaHref} className="group block rounded-2xl border border-gray-100 p-5 hover:border-[#059669]/40 transition-colors">
              <span className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Familia</span>
              <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">{product.category}</span>
            </Link>
            {industriasRel.map((i) => (
              <Link key={i.slug} href={`/industria/${i.slug}`} className="group block rounded-2xl border border-gray-100 p-5 hover:border-[#059669]/40 transition-colors">
                <span className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Industria</span>
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">{i.nombre}</span>
              </Link>
            ))}
            {guiasRel.map((g) => (
              <Link key={g.slug} href={`/biblioteca/${g.slug}`} className="group block rounded-2xl border border-gray-100 p-5 hover:border-[#059669]/40 transition-colors">
                <span className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Guía técnica</span>
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">{g.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Checklist transversal: los mismos 4 datos que pide el formulario. */}
      <div className="mt-10">
        <DatosParaCotizar />
      </div>

      {/* Enlace lateral entre páginas comerciales: lo que le falta al grafo
          interno cuando todo enlaza hacia arriba y nada hacia el lado. */}
      <RielComercial ruta={rutaProducto} />

      {/* Final CTA */}
      <div className="mt-16 bg-[#0A2540] text-white rounded-3xl p-10 text-center">
        <h3 className="text-3xl tracking-tight font-semibold mb-3">¿Este producto se adapta a su proyecto?</h3>
        <p className="text-white/80 mb-7 max-w-md mx-auto">Nuestro equipo técnico está listo para asesorarlo y entregarle una cotización personalizada para su proyecto.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="inline-flex items-center justify-center bg-white text-[#0A2540] hover:bg-white/90 px-10 py-3.5 rounded-2xl font-semibold">Solicitar Cotización Personalizada</Link>
          <WhatsAppLink context={`producto-cta:${product.slug}`} message={`Hola, quisiera asesoría técnica sobre ${product.name}.`} className="inline-flex items-center justify-center border border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-2xl font-medium">Hablar con un especialista</WhatsAppLink>
        </div>
      </div>
    </div>
  );
}
