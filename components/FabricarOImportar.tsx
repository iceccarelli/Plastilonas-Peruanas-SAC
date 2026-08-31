import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';
import {
  MATRIZ,
  COSTO_IMPORTACION,
  NO_NOS_COMPRE,
  NO_NOS_COMPRE_EN,
  CUANDO_SI,
  CUANDO_SI_EN,
  FAQS_FABRICAR,
  FAQS_FABRICAR_EN,
  FABRICAR_ACTUALIZADO,
  RUTA_ES,
  RUTA_EN,
} from '@/lib/fabricar-o-importar';
import { SITE, HORARIO } from '@/lib/site';
import { PRODUCT_COUNT, FABRICACION_PROPIA_COUNT } from '@/lib/facts';
import { cunas } from '@/lib/cunas';
import { CUNAS_EN } from '@/lib/cunas-en';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';
import WhatsAppLink from '@/components/WhatsAppLink';
import CostoEnVivo from '@/components/CostoEnVivo';

/**
 * LA PÁGINA QUE DECIDE LA COMPRA, en los dos idiomas del par.
 *
 * Un solo componente y no dos plantillas: la estructura es idéntica y todo el
 * texto vive en lib/fabricar-o-importar.ts. Dos plantillas serían dos verdades
 * y esta página existe precisamente porque afirma cosas que nos perjudican —el
 * día que una de las dos las suavizara, el argumento entero se cae.
 *
 * El bloque de tipo de cambio no es decoración: la exposición cambiaria es una
 * de las diez filas de la matriz, y aquí el lector la ve con su fecha.
 */

const T = {
  es: {
    marca: 'DECISIÓN DE ABASTECIMIENTO · SIN LETRA CHICA',
    h1: '¿Fabricar en Lima o importar?',
    verMigas: [
      { name: 'Inicio', url: `${SITE.url}/` },
      { name: '¿Fabricar en Lima o importar?', url: `${SITE.url}${RUTA_ES}` },
    ],
    intro: [
      'Es la decisión que se toma antes de elegir proveedor, y casi nunca se toma con la tabla completa a la vista: se compara un precio FOB contra un precio de planta, que son dos números que no significan lo mismo.',
      'Abajo está la comparación entera, incluidas las filas que gana la importación —el precio unitario a volumen, el formato estándar disponible mañana, la variedad de configuraciones ya desarrolladas y la certificación propia de producto—. Las publicamos porque usted ya las conoce, y porque un proveedor que las esconde no gana ese lote: pierde la credibilidad de todo lo demás que afirma.',
    ],
    h2matriz: '¿En qué gana cada opción?',
    pmatriz: (total: number, importar: number) =>
      `${total} criterios, y tres columnas: qué pasa si importa, qué pasa si manda fabricar y quién gana la fila. ${importar} de los ${total} los gana la importación, y están escritos igual que los demás.`,
    thCriterio: 'Criterio',
    thImportar: 'Importar',
    thFabricar: 'Fabricar en Lima',
    thGana: 'Gana',
    ganaEtiqueta: { importar: 'Importar', fabricar: 'Fabricar', depende: 'Depende' },
    h2costo: '¿Qué cuesta de verdad una importación?',
    pcosto:
      'El FOB es el único componente que aparece en el correo del proveedor. Éstos son los demás. No publicamos la tasa que le toca a su mercancía: depende de su subpartida nacional de 10 dígitos y la confirma SUNAT o su agente de aduana, no nosotros.',
    h2cuando: '¿Cuándo conviene cada uno?',
    hNo: 'Cuándo NO nos compre',
    hSi: 'Cuándo sí',
    h2cambio: 'El dato cambiario, con su fecha',
    h2faq: 'Preguntas frecuentes',
    h2frentes: 'Los tres frentes donde fabricamos',
    revisada: (f: string) => `Página revisada el ${f}. Los nombres y rangos de los tributos de importación provienen de SUNAT y de ADEX; la tasa aplicable a una subpartida concreta se confirma con SUNAT o con un agente de aduana.`,
    ctaH: 'Haga la comparación con números suyos',
    ctaP: `Envíe producto, medidas o cantidad, ciudad de entrega y fecha. Respondemos en horario comercial (${HORARIO.corto}) con ficha técnica, y si su caso es de los que gana la importación, se lo decimos.`,
    ctaBoton: 'Solicitar cotización',
    ctaWa: 'WhatsApp comercial',
    waMsg:
      'Hola, estoy comparando fabricar en Lima contra importar. Producto: ___. Cantidad y medidas: ___. Ciudad de entrega: ___.',
    rfq: '/cotizacion',
    otroIdioma: { href: RUTA_EN, label: 'Read this page in English' },
  },
  en: {
    marca: 'SOURCING DECISION · NO SMALL PRINT',
    h1: 'Manufacture in Peru, or import?',
    verMigas: [
      { name: 'Home', url: `${SITE.url}/` },
      { name: 'English', url: `${SITE.url}/en` },
      { name: 'Manufacture in Peru, or import?', url: `${SITE.url}${RUTA_EN}` },
    ],
    intro: [
      'This is the decision taken before a supplier is chosen, and it is almost never taken with the full table in view: an FOB price gets compared against an ex-works price, and those two numbers do not mean the same thing.',
      'The whole comparison is below, including the rows importing wins — unit price at volume, a standard format available tomorrow, the range of already-developed configurations, and manufacturer-issued product certification. We publish them because you already know them, and because a supplier who hides them does not win that lot — they lose the credibility of everything else they claim.',
    ],
    h2matriz: 'Where does each option win?',
    pmatriz: (total: number, importar: number) =>
      `${total} criteria and three columns: what happens if you import, what happens if you have it made, and which one wins the row. Importing wins ${importar} of the ${total}, written up exactly like the rest.`,
    thCriterio: 'Criterion',
    thImportar: 'Import',
    thFabricar: 'Manufacture in Lima',
    thGana: 'Winner',
    ganaEtiqueta: { importar: 'Import', fabricar: 'Manufacture', depende: 'Depends' },
    h2costo: 'What does an import actually cost?',
    pcosto:
      'FOB is the only component that appears in the supplier’s email. These are the others. We do not publish the rate that applies to your goods: it depends on your 10-digit national tariff subheading, and SUNAT or your customs broker confirms it — not us.',
    h2cuando: 'When does each one make sense?',
    hNo: 'When NOT to buy from us',
    hSi: 'When to buy from us',
    h2cambio: 'The exchange-rate reading, with its date',
    h2faq: 'Frequently asked',
    h2frentes: 'The three lines we manufacture',
    revisada: (f: string) => `Page reviewed on ${f}. The names and ranges of Peruvian import duties come from SUNAT and ADEX; the rate applying to a specific subheading is confirmed with SUNAT or a customs broker.`,
    ctaH: 'Run the comparison with your own numbers',
    ctaP: `Send product, dimensions or quantity, delivery city or port, and the date you need it. We reply within business hours (${HORARIO.corto}, Lima time) with a datasheet — and if yours is one of the cases importing wins, we will say so.`,
    ctaBoton: 'Request a quotation',
    ctaWa: 'WhatsApp sales',
    waMsg:
      'Hello, I am comparing manufacturing in Lima against importing. Product: ___. Quantity and dimensions: ___. Destination city or port: ___.',
    rfq: '/en/rfq',
    otroIdioma: { href: RUTA_ES, label: 'Leer esta página en español' },
  },
} as const;

export default async function FabricarOImportar({ idioma }: { idioma: 'es' | 'en' }) {
  const t = T[idioma];
  const en = idioma === 'en';
  const url = `${SITE.url}${en ? RUTA_EN : RUTA_ES}`;
  const faqs = en ? FAQS_FABRICAR_EN : FAQS_FABRICAR;
  const noNosCompre = en ? NO_NOS_COMPRE_EN : NO_NOS_COMPRE;
  const cuandoSi = en ? CUANDO_SI_EN : CUANDO_SI;
  const frentes = en
    ? CUNAS_EN.map((c) => ({ href: `/en/${c.slug}`, label: c.titulo }))
    : cunas.map((c) => ({ href: `/${c.slug}`, label: c.titulo }));

  const ganaImportar = MATRIZ.filter((f) => f.gana === 'importar').length;

  const respuestaDirecta = en
    ? `Importing wins on unit price for large lots of standard sizes; manufacturing in Lima wins on minimum quantity, replacement lead time, non-standard dimensions, working capital and recourse. ` +
      `The honest comparison is not FOB against ex-works price but landed cost: FOB plus freight and insurance, ad valorem duty on CIF (SUNAT publishes 0%, 6% and 11% by subheading), IGV 16% plus IPM 2%, the IGV advance perception of 3.5%, 5% or 10%, clearance, storage and days of financing. ` +
      `${SITE.legalName} (RUC ${SITE.ruc}) cuts and sews ${FABRICACION_PROPIA_COUNT} of ${PRODUCT_COUNT} catalogue lines at its own plant in Chorrillos, Lima, Peru, and states on this page the ${ganaImportar} criteria where importing is the better choice.`
    : `Importar gana en precio unitario con lotes grandes de medida estándar; fabricar en Lima gana en cantidad mínima, plazo de reposición, medida fuera de estándar, capital de trabajo y recurso ante un defecto. ` +
      `La comparación honesta no es FOB contra precio de planta sino costo puesto en operación: FOB más flete y seguro, ad valorem sobre CIF (SUNAT publica 0 %, 6 % y 11 % según subpartida), IGV 16 % más IPM 2 %, percepción del IGV de 3,5 %, 5 % o 10 %, despacho, almacenaje y días de financiamiento. ` +
      `${SITE.legalName} (RUC ${SITE.ruc}) confecciona ${FABRICACION_PROPIA_COUNT} de ${PRODUCT_COUNT} líneas del catálogo en su planta de Chorrillos, Lima, y declara en esta página los ${ganaImportar} criterios en los que conviene importar.`;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: t.h1,
            description: respuestaDirecta,
            speakable: ['.respuesta-directa'],
          }),
          breadcrumbSchema([...t.verMigas], `${url}#breadcrumb`),
          faqSchema([...faqs], url),
        ]}
      />

      <nav className="mb-8 text-sm text-gray-500">
        <Link href={t.otroIdioma.href} className="hover:text-[#059669]">
          {t.otroIdioma.label}
        </Link>
      </nav>

      <div className="max-w-3xl">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-[#047857]">
          {t.marca}
        </div>
        <h1 className="mb-6 text-3xl font-semibold leading-tight tracking-tighter text-[#0A2540] dark:text-inherit md:text-5xl">
          {t.h1}
        </h1>

        <p className="respuesta-directa mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-[15px] leading-relaxed text-[#0A2540]">
          {respuestaDirecta}
        </p>

        {t.intro.map((p) => (
          <p key={p.slice(0, 24)} className="mb-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {p}
          </p>
        ))}
      </div>

      {/* LA MATRIZ. Varias filas las gana la importación —el recuento sale del
          dato, nunca del teclado: la primera versión de esta página afirmaba
          un recuento fijo que ya no correspondía, y lo detectó una prueba, no
          una lectura—. Si fueran cero, esta tabla sería publicidad
          con forma de tabla y nadie la citaría. */}
      <section className="mt-14">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight">{t.h2matriz}</h2>
        <p className="mb-6 max-w-3xl text-gray-600 dark:text-gray-400">
          {t.pmatriz(MATRIZ.length, ganaImportar)}
        </p>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={t.h2matriz}>
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">{t.h2matriz}</caption>
            <thead>
              <tr className="border-b border-gray-200 dark:border-[var(--border)]">
                <th scope="col" className="py-3 pr-6 text-left font-medium text-gray-500">{t.thCriterio}</th>
                <th scope="col" className="py-3 pr-6 text-left font-medium text-gray-500">{t.thImportar}</th>
                <th scope="col" className="py-3 pr-6 text-left font-medium text-gray-500">{t.thFabricar}</th>
                <th scope="col" className="py-3 text-left font-medium text-gray-500">{t.thGana}</th>
              </tr>
            </thead>
            <tbody>
              {MATRIZ.map((f) => (
                <tr key={f.criterio} className="border-b border-gray-100 align-top last:border-none dark:border-[var(--border)]">
                  <th scope="row" className="py-3 pr-6 text-left font-medium text-[#0A2540] dark:text-inherit">
                    {en ? f.criterioEn : f.criterio}
                  </th>
                  <td className="py-3 pr-6 text-gray-600 dark:text-gray-400">{en ? f.importarEn : f.importar}</td>
                  <td className="py-3 pr-6 text-gray-600 dark:text-gray-400">{en ? f.fabricarEn : f.fabricar}</td>
                  <td className="py-3">
                    <span
                      className={
                        f.gana === 'fabricar'
                          ? 'inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-[#047857]'
                          : f.gana === 'importar'
                            ? 'inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700'
                            : 'inline-block rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500'
                      }
                    >
                      {t.ganaEtiqueta[f.gana]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Componentes del costo. Nombres y rangos oficiales; ninguna tasa
          atribuida a una subpartida concreta. */}
      <section className="mt-14">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight">{t.h2costo}</h2>
        <p className="mb-6 max-w-3xl text-gray-600 dark:text-gray-400">{t.pcosto}</p>
        <dl className="grid gap-3 sm:grid-cols-2">
          {COSTO_IMPORTACION.map((c) => (
            <div key={c.nombre} className="rounded-2xl border border-gray-100 p-4 dark:border-[var(--border)]">
              <dt className="font-semibold text-[#0A2540] dark:text-inherit">{en ? c.nombreEn : c.nombre}</dt>
              <dd className="mt-1 text-sm text-gray-600 dark:text-gray-400">{en ? c.detalleEn : c.detalle}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* El bloque que ningún competidor publica. */}
      <section className="mt-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">{t.h2cuando}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-gray-50/60 p-7 dark:border-[var(--border)] dark:bg-white/5">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold tracking-tight">
              <XCircle className="h-5 w-5 text-gray-400" /> {t.hNo}
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              {noNosCompre.map((x) => (
                <li key={x.slice(0, 24)} className="flex gap-2">
                  <span className="text-gray-400">—</span> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-7">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold tracking-tight">
              <CheckCircle2 className="h-5 w-5 text-[#059669]" /> {t.hSi}
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {cuandoSi.map((x) => (
                <li key={x.slice(0, 24)} className="flex gap-2">
                  <span className="text-[#059669]">→</span> {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* La exposición cambiaria es una fila de la matriz: aquí se ve fechada. */}
      <CostoEnVivo codigos={['PD04640PD', 'PN01660XM']} idioma={idioma} titulo={t.h2cambio} />

      <section className="mt-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">{t.h2frentes}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {frentes.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40 dark:border-[var(--border)]"
            >
              <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669] dark:text-inherit">
                {f.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14 border-t pt-10 dark:border-[var(--border)]">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">{t.h2faq}</h2>
        <dl className="max-w-3xl space-y-6">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540] dark:text-inherit">{f.q}</dt>
              <dd className="mt-1 leading-relaxed text-gray-700 dark:text-gray-300">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-12 text-sm text-gray-500">{t.revisada(FABRICAR_ACTUALIZADO)}</p>

      <div className="mt-14 rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">{t.ctaH}</h2>
        <p className="mx-auto mb-7 max-w-xl text-white/80">{t.ctaP}</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={t.rfq}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            {t.ctaBoton}
          </Link>
          <WhatsAppLink
            context={`fabricar-o-importar:${idioma}`}
            message={t.waMsg}
            className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            {t.ctaWa}
          </WhatsAppLink>
        </div>
      </div>
    </div>
  );
}
