import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { products, productFamilies } from '@/lib/products';
import { articles } from '@/lib/articles';
import { terminos } from '@/lib/glosario';
import { solutions } from '@/lib/solutions';
import { SITE } from '@/lib/site';
import { cunas } from '@/lib/cunas';
import WhatsAppLink from '@/components/WhatsAppLink';

/**
 * Página 404 propia.
 *
 * El 404 de Next dice "This page could not be found" en inglés, sin navegación,
 * sin marca y sin salida. Era el único punto del sitio donde un visitante en
 * español se encontraba con una pantalla en blanco de otro idioma, y el único
 * donde alguien que llegó desde un enlace roto de un tercero se iba sin nada.
 *
 * Un 404 útil no pide disculpas: ofrece los cinco caminos que cubren casi toda
 * la intención posible, y lo hace con los conteos reales del sitio.
 *
 * `noindex`: la página no debe indexarse, pero SÍ debe ser útil a quien llegue.
 */

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false, follow: true },
};

/** Los cinco caminos que cubren casi toda la intención posible, con los
 *  conteos reales: un 404 que dice "12 guías" es un 404 que retiene. */
const destinos = () => [
  {
    href: '/productos',
    titulo: 'Catálogo completo',
    detalle: `${products.length} líneas de producto en ${productFamilies.length} familias`,
  },
  {
    href: '/glosario',
    titulo: 'Glosario técnico',
    detalle: `${terminos.length} términos del rubro definidos con precisión`,
  },
  {
    href: '/recursos',
    titulo: 'Guías de especificación',
    detalle: `${articles.length} guías con sus fuentes citadas`,
  },
  {
    href: '/soluciones',
    titulo: 'Arquitecturas de referencia',
    detalle: `${solutions.length} configuraciones completas con su lista de materiales`,
  },
  {
    href: '/descargas',
    titulo: 'Centro de documentación',
    detalle: 'Fichas, guías y datos abiertos en PDF y JSON, sin registro',
  },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <p className="mb-3 font-mono text-sm text-[#059669]">Error 404</p>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Esta página no existe
      </h1>

      <p className="mb-8 text-lg text-gray-700">
        Puede que el enlace esté mal escrito o que la página haya cambiado de dirección.
        Todo el contenido técnico del sitio es de acceso libre; desde acá llega a
        cualquier parte.
      </p>

      {/* Búsqueda: la salida más corta cuando se sabe qué se busca. Un GET a
          /productos?q= — funciona sin JavaScript. */}
      <form action="/productos" method="get" role="search" className="mb-8 flex gap-2">
        <label htmlFor="busqueda-404" className="sr-only">Buscar en el catálogo</label>
        <input
          id="busqueda-404"
          type="search"
          name="q"
          placeholder="Buscar en el catálogo (p. ej. «manga 800» o «big bag 2 t»)"
          className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#059669]"
        />
        <button
          type="submit"
          className="rounded-2xl bg-[#0A2540] px-6 py-3 text-sm font-semibold text-white hover:bg-[#059669]"
        >
          Buscar
        </button>
      </form>

      {/* Los tres frentes: si el visitante venía por lo que más se cotiza,
          uno de estos tres lo recoge. */}
      <div className="mb-10 grid gap-3 sm:grid-cols-3">
        {cunas.map((c) => (
          <Link
            key={c.slug}
            href={`/${c.slug}`}
            className="group rounded-2xl border border-gray-100 p-4 transition-colors hover:border-[#059669]/40"
          >
            <span className="block text-sm font-semibold text-[#0A2540] group-hover:text-[#059669]">
              {c.titulo}
            </span>
          </Link>
        ))}
      </div>

      <ul className="mb-12 space-y-3">
        {destinos().map((d) => (
          <li key={d.href}>
            <Link
              href={d.href}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
            >
              <span>
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {d.titulo}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{d.detalle}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#059669]" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="rounded-3xl border border-gray-100 p-8">
        <p className="mb-5 text-gray-700">
          ¿Buscaba algo concreto y no lo encuentra? Escríbanos y le decimos si existe y
          dónde está.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <WhatsAppLink
            context="404"
            message="Hola, buscaba una página en su sitio y no existe. Busco: "
            className="inline-flex items-center justify-center rounded-2xl bg-[#0A2540] px-8 py-3 font-semibold text-white hover:bg-[#059669]"
          >
            Preguntar por WhatsApp
          </WhatsAppLink>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-8 py-3 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
          >
            Contacto
          </Link>
          <a
            href={`mailto:${SITE.email}`}
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-8 py-3 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
          >
            {SITE.email}
          </a>
        </div>
      </div>
    </div>
  );
}
