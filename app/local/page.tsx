import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import ciudades from "@/data/ciudades.json";
import { SITE } from "@/lib/site";
import { productFamilies } from "@/lib/products";
import {
  breadcrumbSchema,
  itemListSchema,
  webPageSchema,
  faqSchema,
} from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';

/**
 * Índice de cobertura local (/local).
 *
 * Existía /local/[ciudad] pero no su página índice: el breadcrumb de cada
 * ciudad apuntaba a un 404 y el sitemap no podía listar el hub. Esta página
 * cierra el silo local — hub → 12 ciudades → catálogo — y concentra el enlazado
 * interno hacia las páginas de ciudad, que hasta ahora solo se alcanzaban desde
 * el sitemap.
 *
 * Regla de honestidad: no se declara oficina, sucursal ni almacén en ninguna
 * ciudad. La sede real es Chorrillos, Lima; el resto es despacho nacional.
 */

type Ciudad = {
  slug: string;
  ciudad: string;
  departamento: string;
  region: string;
  clima: string;
  contextoLocal: string;
  usosPrincipales: string[];
  sectoresDemanda: string[];
};

const CIUDADES = ciudades as Ciudad[];
const URL = `${SITE.url}/local`;

const REGION_LABEL: Record<string, string> = {
  costa: "Costa",
  sierra: "Sierra",
  selva: "Selva",
};

const REGION_ORDER = ["costa", "sierra", "selva"];

// Sin ` | ${SITE.name}`: la plantilla de app/layout.tsx ya añade la marca, y
// ponerla aquí servía «… | Plastilonas Peruanas SAC | Plastilonas».
const TITLE = `Cobertura nacional: ${CIUDADES.length} ciudades del Perú`;
const DESCRIPTION = `Fabricamos en ${SITE.addressLocality}, ${SITE.addressRegion} y despachamos a todo el Perú. Contexto climático, usos y sectores de demanda por ciudad: ${CIUDADES.slice(0, 6)
  .map((c) => c.ciudad)
  .join(", ")} y más.`;

const FAQS = [
  {
    q: "¿En qué ciudades del Perú entregan?",
    a: `Despachamos a todo el territorio nacional desde nuestra planta en ${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}. Publicamos páginas con contexto técnico local para ${CIUDADES.length} ciudades: ${CIUDADES.map((c) => c.ciudad).join(", ")}.`,
  },
  {
    q: "¿Tienen sucursales fuera de Lima?",
    a: `No. La fabricación y las oficinas están en ${SITE.addressLocality}, ${SITE.addressRegion}. La atención fuera de Lima es por despacho nacional coordinado con el cliente, con asesoría técnica previa por WhatsApp (${SITE.phoneWhatsApp}) o por el formulario de cotización.`,
  },
  {
    q: "¿El clima de cada región cambia el producto recomendado?",
    a: "Sí. La radiación UV de la sierra, la humedad y lluvia de la selva y la garúa costera determinan el gramaje, el tratamiento UV y el tipo de costura o termosellado. Cada página de ciudad indica el contexto climático y los usos más frecuentes de esa zona.",
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/local" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: "website",
  },
};

export default function LocalIndexPage() {
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:local-cobertura');
  const porRegion = REGION_ORDER.map((region) => ({
    region,
    label: REGION_LABEL[region] ?? region,
    ciudades: CIUDADES.filter((c) => c.region === region),
  })).filter((g) => g.ciudades.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            type: "CollectionPage",
            speakable: [".speakable-intro"],
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: "Inicio", url: `${SITE.url}/` },
              { name: "Cobertura local", url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          itemListSchema({
            url: URL,
            name: "Ciudades con cobertura documentada",
            description: DESCRIPTION,
            items: CIUDADES.map((c) => ({
              name: `${c.ciudad}, ${c.departamento}`,
              url: `${SITE.url}/local/${c.slug}`,
            })),
          }),
          faqSchema(FAQS, URL),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{" "}
        / <span className="text-gray-700">Cobertura local</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Cobertura en {CIUDADES.length} ciudades del Perú
      </h1>
      {/* Diagrama del registro. Degrada solo: sin archivo no se pinta nada,
          y en cuanto se publique aparece sin tocar esta página. */}
      {esquema && <ImagenContenido ranura={esquema} className="mb-8 mt-6" sizes="(min-width: 768px) 860px, 100vw" />}


      <p className="speakable-intro mb-10 max-w-3xl text-lg text-gray-700">
        {SITE.name} fabrica en {SITE.addressLocality}, {SITE.addressRegion} y despacha a
        todo el país. Cada página de ciudad documenta el contexto climático real, los
        usos más frecuentes y los sectores que concentran la demanda en esa zona — para
        que la especificación (gramaje, tratamiento UV, tipo de unión) se decida antes de
        cotizar, no después de instalar.
      </p>

      {porRegion.map((grupo) => (
        <section key={grupo.region} className="mb-12">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {grupo.label}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {grupo.ciudades.map((c) => (
              <Link
                key={c.slug}
                href={`/local/${c.slug}`}
                className="group block rounded-3xl border border-gray-100 p-6 transition-all hover:border-[#059669]/40"
              >
                <div className="mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#059669]" />
                  <span className="font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                    {c.ciudad}
                  </span>
                  <span className="text-sm text-gray-400">· {c.departamento}</span>
                </div>
                <p className="mb-3 line-clamp-2 text-sm text-gray-600">{c.clima}</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  {c.usosPrincipales.slice(0, 3).map((u) => (
                    <li key={u} className="flex gap-2">
                      <span className="text-[#059669]">→</span>
                      {u}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="mb-12 border-t pt-10">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Qué despachamos a cualquier ciudad
        </h2>
        <div className="flex flex-wrap gap-2">
          {productFamilies.map((f) => (
            <Link
              key={f.slug}
              href={`/productos/familia/${f.slug}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
            >
              {f.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes sobre cobertura
        </h2>
        <dl className="space-y-5">
          {FAQS.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Necesita entrega en su ciudad?
        </h2>
        <p className="mx-auto mb-7 max-w-md text-white/80">
          Indíquenos producto, medidas, cantidad y ciudad de entrega, y le enviamos la
          cotización con el despacho ya considerado.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/productos"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Ver catálogo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
