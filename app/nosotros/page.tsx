import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { COUNT_STATEMENT, YEARS_STATEMENT } from '@/lib/facts';
import Link from 'next/link';
import Image from 'next/image';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';

const URL_NOSOTROS = `${SITE.url}/nosotros`;

const TITLE = `Nosotros: fabricantes peruanos desde ${SITE.foundingYear}`;
const DESCRIPTION = `${SITE.legalName} (RUC ${SITE.ruc}) fabrica e instala soluciones textiles industriales desde su planta en ${SITE.addressLocality}, ${SITE.addressRegion}. Historia, capacidad de fabricación propia y forma de trabajo.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/nosotros' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: `${SITE.url}/nosotros`,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function NosotrosPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url: URL_NOSOTROS,
            name: TITLE,
            description: DESCRIPTION,
            type: 'AboutPage',
            breadcrumbId: `${URL_NOSOTROS}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Nosotros', url: URL_NOSOTROS },
            ],
            `${URL_NOSOTROS}#breadcrumb`,
          ),
        ]}
      />
      <div className="max-w-3xl">
        <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">DESDE 2009</div>
        <h1 className="t-display font-semibold text-[#0A2540]">{YEARS_STATEMENT}.</h1>
      </div>

      <div className="prose prose-lg max-w-3xl mt-10 text-gray-700">
        <p>Plastilonas Peruanas SAC nació en 2009 con una misión clara: fabricar productos textiles industriales a la medida exacta de cada proyecto, con precio directo de fabricante y respaldo técnico real.</p>
        
        <p>Hoy, con {COUNT_STATEMENT}, abastecemos a minería, agricultura, construcción, transporte e industria en todo el Perú. Fabricamos e instalamos con equipo propio: una sola responsabilidad, del diseño técnico a la obra.</p>
      </div>

      {/* La afirmación central de esta página es «fabricamos e instalamos con
          equipo propio». Estas dos fotografías son de planta y de obra: son
          la única parte de la página que la sostiene sin pedir confianza. */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {[
          { src: '/images/servicio-fabricacion.jpg', alt: 'Confección de textil técnico en la planta de Chorrillos.', pie: 'Fabricación en planta propia.' },
          { src: '/images/servicio-instalacion.jpg', alt: 'Personal propio montando una estructura textil en obra.', pie: 'Instalación en obra con equipo propio.' },
        ].map((f) => (
          <figure key={f.src}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gray-100">
              <Image src={f.src} alt={f.alt} fill sizes="(min-width: 640px) 480px, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-2 text-xs text-gray-500">{f.pie}</figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-14 grid md:grid-cols-3 gap-6">
        {[
          { title: "Misión", text: "Fabricar y comercializar soluciones textiles industriales de alta calidad que contribuyan al desarrollo productivo de nuestros clientes, buscando siempre el equilibrio entre calidad, precio y plazo de entrega." },
          { title: "Visión", text: "Ser el proveedor de referencia en soluciones textiles e industriales del Perú, respondiendo por cada pieza que fabricamos e instalamos." },
          { title: "Valores", text: "Calidad sin concesiones • Transparencia y honestidad • Compromiso con el cliente • Mejora continua • Responsabilidad social y ambiental." },
        ].map((v, i) => (
          <div key={i} className="bg-white border border-gray-100 p-8 rounded-3xl">
            <div className="font-semibold text-xl tracking-tight mb-4 text-[#0A2540]">{v.title}</div>
            <p className="text-gray-600 leading-relaxed t-body">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-[#0A2540] text-white rounded-3xl p-12 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="t-h2 font-semibold mb-4">¿Listo para trabajar con nosotros?</h3>
                    {/* Aquí decía «Únase a más de 500 empresas que ya confían en
              Plastilonas Peruanas». Esa cifra no sale de ningún sistema de
              esta empresa: no hay recuento de clientes publicable ni
              autorización de ninguno para contarlo. En una página que un
              comprador industrial abre precisamente para verificar quién es
              el proveedor, una cifra que no se puede sustentar es lo primero
              que se cae en una homologación. Lo que la sustituye es lo que sí
              consta: RUC, planta y años. */}
          <p className="text-white/80 mb-8">
            {SITE.legalName} · RUC {SITE.ruc} · planta en {SITE.addressLocality}, {SITE.addressRegion}.
            {' '}Escríbanos con la aplicación, las medidas y la ciudad de entrega.
          </p>
          <Link href="/contacto" className="inline-block bg-white text-[#0A2540] btn btn-lg btn-primary font-semibold hover:bg-white/90 transition-all">Contáctenos hoy</Link>
        </div>
      </div>
    </div>
  );
}
