import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Activity, AlertTriangle } from 'lucide-react';
import { leerIndicadores, PORQUE } from '@/lib/indicadores';
import { numeroPE } from '@/lib/format';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasProceso } from '@/lib/imagenes';
import { breadcrumbSchema, datasetSchema, webPageSchema } from '@/lib/schema';
import { OG_IMAGEN } from '@/lib/meta';

/**
 * Indicadores en vivo.
 *
 * Se revalida cada hora: el sitio deja de ser una foto y pasa a leer el BCRP
 * por su cuenta. Pero la regla que gobierna la página es la contraria a la que
 * suele gobernar un tablero: acá la frescura NO se insinúa, se declara. Cada
 * número lleva la fecha de su lectura, y cuando el dato viene del respaldo en
 * frío la página lo dice con un aviso visible.
 *
 * Por qué esto importa más que el efecto de "sitio vivo": un tablero que
 * aparenta estar al día mostrando una cifra de hace tres semanas hace que
 * alguien cotice mal y nos lo atribuya. La fecha al lado del número es lo que
 * convierte un adorno en un dato utilizable.
 *
 * Y ningún indicador va solo: cada uno explica qué decide en una cotización y
 * enlaza al informe que lo desarrolla. Un número sin ese porqué es decoración.
 */

export const revalidate = 3600;

const URL = `${SITE.url}/indicadores`;
const TITLE = 'Indicadores que mueven el precio de una plastilona';
const DESCRIPTION = `Petróleo WTI, tipo de cambio, cobre, zinc y plomo, leídos del BCRP. Cada valor con la fecha de su lectura y qué decide en una cotización.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/indicadores' },
  openGraph: {
    images: OG_IMAGEN,
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default async function IndicadoresPage() {
  // Esquema de esta página. `ImagenContenido` degrada solo: mientras el
  // archivo no exista no se pinta nada roto, y en cuanto se publique
  // aparece aquí sin tocar esta página.
  const esquema = ranurasProceso().find((r) => r.id === 'proceso:indicadores-fuente');
  const estado = await leerIndicadores(new Date());

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="indicadores" slug="indice" />
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Indicadores', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          datasetSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            fecha: estado.consultadoEl,
            version: '1.0',
            fuentes: [
              {
                nombre: 'Banco Central de Reserva del Perú — API de series estadísticas',
                url: 'https://estadisticas.bcrp.gob.pe/estadisticas/series/api',
              },
            ],
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        / <span className="text-gray-700">Indicadores</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Indicadores del rubro
      </h1>
      {esquema && (
        <ImagenContenido ranura={esquema} className="mb-8 mt-6" sizes="(min-width: 1024px) 900px, 100vw" />
      )}

      <p className="speakable-intro mb-6 max-w-3xl text-lg text-gray-700">
        Los cinco precios que mueven una cotización de textiles industriales, leídos
        directamente de la API de series estadísticas del Banco Central de Reserva del
        Perú. Cada uno con la fecha de su lectura y con lo que decide en la práctica.
      </p>

      <p className="mb-10 flex flex-wrap items-center gap-2 font-mono text-sm text-gray-500">
        <Activity className="h-4 w-4 text-[#059669]" aria-hidden="true" />
        Consultado el {estado.consultadoEl} · se relee cada hora ·{' '}
        <a
          href="/indicadores/datos.json"
          className="underline hover:text-[#059669]"
        >
          versión legible por máquina
        </a>
      </p>

      {/* Aviso, no silencio: si el BCRP no responde, el lector tiene derecho a
          saber que está viendo la última lectura buena y no la de hoy. */}
      {estado.sinConexion && (
        <div className="mb-10 flex gap-3 rounded-3xl bg-amber-50 p-6">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
          <div>
            <h2 className="mb-1 font-semibold text-amber-800">
              Mostrando la última lectura conocida
            </h2>
            <p className="text-gray-800">
              La API del BCRP no respondió en esta actualización. Los valores de abajo
              son los últimos verificados, con su fecha original: no son de hoy. Se
              reintenta automáticamente en la próxima relectura.
            </p>
          </div>
        </div>
      )}

      <div className="mb-14 space-y-5">
        {estado.indicadores.map((ind) => {
          const porque = PORQUE[ind.serie.codigo];
          return (
            <article
              key={ind.serie.codigo}
              className="rounded-3xl border border-gray-100 p-7"
            >
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-[#0A2540]">
                    {ind.serie.etiqueta}
                  </h2>
                  <p className="text-sm text-gray-500">{ind.serie.unidad}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-4xl font-semibold tracking-tight text-[#0A2540]">
                    {ind.valor === null
                      ? 'sin dato'
                      : numeroPE(ind.valor, ind.serie.decimales)}
                  </p>
                  {/* La fecha va pegada al número, siempre. Es lo que separa un
                      dato utilizable de un adorno. */}
                  <p className="mt-1 font-mono text-xs text-gray-500">
                    {ind.periodo || 'sin periodo'}
                    {ind.deRespaldo && ' · última lectura conocida'}
                  </p>
                </div>
              </div>

              {porque && (
                <>
                  <p className="mb-4 text-gray-700">{porque.texto}</p>
                  <Link
                    href={`/informes/${porque.informe}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#059669] hover:underline"
                  >
                    El informe que lo desarrolla <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}

              <p className="mt-4 border-t border-gray-100 pt-3 font-mono text-xs text-gray-500">
                BCRP · serie {ind.serie.codigo}
              </p>
            </article>
          );
        })}
      </div>

      <section className="mb-14 rounded-3xl border-l-4 border-[#059669] bg-gray-50 p-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          Qué NO hay en esta página
        </h2>
        <p className="mb-3 text-gray-800">
          No hay precios de resina, de nafta ni de flete. Esas series son producto
          comercial de agencias especializadas: se pueden citar con atribución, como
          hacemos en el informe de formación de precio, pero no redistribuir. Acá solo
          aparece lo que una fuente pública y gratuita permite publicar.
        </p>
        <p className="text-gray-800">
          Tampoco hay pronósticos. Estos son valores observados y fechados; hacia dónde
          van lo decide usted con su propio criterio.
        </p>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Cómo se traduce esto en su proyecto?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Envíenos emplazamiento, aplicación, dimensiones y plazo, y le devolvemos la
          especificación técnica junto con la cotización, con su plazo de validez y la
          moneda declarados.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/informes/formacion-de-precio-y-volatilidad-textiles-industriales"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Por qué cambia el precio <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
