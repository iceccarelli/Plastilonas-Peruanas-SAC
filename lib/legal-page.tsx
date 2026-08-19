import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { SITE } from '@/lib/site';
import { LEGAL_UPDATED, type LegalSection } from '@/lib/legal';

/**
 * Plantilla compartida de los avisos legales.
 *
 * /privacidad y /terminos tienen la misma estructura; duplicar el marcado
 * garantiza que dentro de seis meses uno de los dos se quede sin la fecha de
 * actualización o sin el breadcrumb.
 */

export function LegalPage({
  path,
  h1,
  intro,
  sections,
  breadcrumbName,
}: {
  path: string;
  h1: string;
  intro: string;
  sections: LegalSection[];
  breadcrumbName: string;
}) {
  const url = `${SITE.url}${path}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: h1,
            description: intro,
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: breadcrumbName, url },
            ],
            `${url}#breadcrumb`,
          ),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span className="text-gray-700">{breadcrumbName}</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">{h1}</h1>

      <p className="mb-3 text-lg text-gray-700">{intro}</p>

      <p className="mb-12 font-mono text-sm text-gray-500">
        Última actualización: {LEGAL_UPDATED} · {SITE.legalName} · RUC {SITE.ruc}
      </p>

      <div className="space-y-12">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
              {s.heading}
            </h2>
            {s.body?.map((p) => (
              <p key={p} className="mb-4 text-gray-700">
                {p}
              </p>
            ))}
            {s.list && (
              <ul className="mt-2 space-y-3">
                {s.list.map((li) => (
                  <li key={li} className="border-l-4 border-[#059669]/30 pl-5 text-gray-700">
                    {li}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-16 rounded-3xl border border-gray-100 p-8">
        <p className="mb-5 text-gray-700">
          ¿Alguna consulta sobre este aviso, sobre sus datos o sobre las condiciones de
          una cotización? Escríbanos y le respondemos por el mismo medio.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-2xl bg-[#0A2540] px-8 py-3 font-semibold text-white hover:bg-[#059669]"
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
