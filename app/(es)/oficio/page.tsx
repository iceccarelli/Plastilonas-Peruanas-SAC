import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, webPageSchema, videoObjectSchema } from '@/lib/schema';
import CinePlayer from '@/components/CinePlayer';
import CierreComercial from '@/components/CierreComercial';
import { ACCIONES } from '@/lib/acciones';
import {
  TRILOGIA,
  RUTA_CINE,
  CINE_PUBLICADO,
  duracionIso,
  duracionLegible,
} from '@/lib/cine';
import { productFamilies } from '@/lib/products';

/**
 * LA SALA.
 *
 * Una página, tres piezas, en el orden en que están numeradas. Sin rejilla de
 * miniaturas, sin reproducción encadenada y sin nada que arranque solo: cada
 * película ocupa su propio ancho y espera a que la pulsen.
 *
 * Por qué /oficio y no /videos ni /cine. La ruta es el nombre de la primera
 * pieza y el asunto de las tres: lo que se mira aquí es el oficio, no el
 * formato. «/videos» habría prometido una videoteca que no existe —son tres— y
 * habría chocado con la carpeta de los archivos.
 *
 * Por qué no está en el menú principal. Esto no vende: es material editorial
 * que alguien encuentra después de decidir que le interesa la empresa. Cuelga
 * de /nosotros y del pie, que es donde vive el resto del material de contexto.
 */

const TITULO = 'El oficio: tres piezas sobre el material';
// 155 caracteres es donde Google recorta (lib/meta.ts). La primera redacción
// tenía 164 y el auditor del HTML servido la cazó: lo que se recortaba era
// justamente la advertencia del final, que es lo que no puede faltar.
const DESCRIPCION =
  'Tres piezas cortas: el catálogo de un vistazo, el material de cerca y el material trabajando. Fotografía en movimiento, sin obras nominadas.';

const URL_CINE = `${SITE.url}${RUTA_CINE}`;

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: RUTA_CINE },
  openGraph: {
    // El cartel de la primera pieza, no el MP4: una tarjeta social sirve una
    // imagen, y ofrecerle un vídeo de 18 MB deja el enlace sin previsualización.
    images: [
      {
        url: TRILOGIA[0].poster,
        width: 1920,
        height: 1080,
        alt: `${TRILOGIA[0].titulo} — ${TRILOGIA[0].antetitulo}`,
      },
    ],
    title: `${TITULO} | ${SITE.name}`,
    description: DESCRIPCION,
    url: URL_CINE,
    locale: SITE.locale,
    type: 'website',
  },
};

export const revalidate = 3600;

/** Nombre legible de una familia, para enlazarla bajo su pieza. */
const nombreFamilia = (slug: string) =>
  productFamilies.find((f) => f.slug === slug)?.name ?? slug;

export default function OficioPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url: URL_CINE,
            name: TITULO,
            description: DESCRIPCION,
            type: 'CollectionPage',
            breadcrumbId: `${URL_CINE}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'El oficio', url: URL_CINE },
            ],
            `${URL_CINE}#breadcrumb`,
          ),
          ...TRILOGIA.map((p) =>
            videoObjectSchema({
              paginaUrl: URL_CINE,
              clave: p.id,
              name: `${p.n} · ${p.titulo} — ${p.antetitulo}`,
              description: p.sinopsis,
              contentUrl: p.src,
              thumbnailUrl: p.poster,
              duration: duracionIso(p.durationSec),
              uploadDate: CINE_PUBLICADO,
              pie: p.pie,
            }),
          ),
        ]}
      />

      <div className="max-w-2xl">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#059669]">
          Trilogía
        </div>
        <h1 className="t-display font-semibold text-[#0A2540]">El oficio</h1>
        <p className="mt-6 text-lg leading-relaxed text-gray-700">
          Tres piezas cortas, en orden. La primera mira el catálogo entero de un
          vistazo; la segunda se acerca al material hasta el ojal y la trama; la
          tercera lo deja trabajando, instalado y con gente alrededor.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
          Ninguna arranca sola y ninguna suena hasta que usted la pone. Son
          fotografía en movimiento del producto y del oficio: no documentan una
          obra entregada a un cliente, y por eso no hay ningún nombre propio en
          ellas. Lo que esta empresa sí puede sostener está en{' '}
          <Link href="/confianza" className="text-[#059669] underline underline-offset-4 hover:no-underline">
            el centro de confianza
          </Link>
          .
        </p>
      </div>

      <div className="mt-14 space-y-20">
        {TRILOGIA.map((p) => (
          <section key={p.id} id={p.id} className="scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-mono text-sm tabular-nums text-[#059669]">{p.n}</span>
              <h2 className="text-2xl font-semibold tracking-tight text-[#0A2540] md:text-3xl">
                {p.titulo}
              </h2>
              <span className="text-sm text-gray-500">{p.antetitulo}</span>
              <span className="ml-auto font-mono text-xs tabular-nums text-gray-400">
                {duracionLegible(p.durationSec)}
              </span>
            </div>

            <CinePlayer pieza={p} />

            <p className="mt-5 max-w-2xl leading-relaxed text-gray-700">{p.sinopsis}</p>

            {p.familias.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-gray-400">
                  Líneas que aparecen
                </span>
                {p.familias.map((f) => (
                  <Link
                    key={f}
                    href={`/productos/familia/${f}`}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
                  >
                    {nombreFamilia(f)}
                  </Link>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="mt-20">
        <CierreComercial
          contexto="oficio"
          titulo="¿Le sirve alguno de estos materiales?"
          principal={{ href: '/cotizacion', label: ACCIONES.cotizar.label }}
          secundaria={{ href: '/productos', label: ACCIONES.catalogo.label, flecha: true }}
          nota={
            <>
              {SITE.legalName} · RUC {SITE.ruc} · planta en {SITE.addressLocality}.
            </>
          }
        >
          Díganos qué vio, con qué medidas y para qué ciudad, y le devolvemos la
          especificación técnica junto con la cotización.
        </CierreComercial>
      </div>
    </div>
  );
}
