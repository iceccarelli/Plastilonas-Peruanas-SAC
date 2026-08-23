import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, FileJson, Sigma, ShieldAlert } from 'lucide-react';
import {
  calculadoras,
  calculadoraPorSlug,
  ADVERTENCIA,
  CITA_SUGERIDA,
  CALCULADORAS_ACTUALIZADO,
} from '@/lib/calculadoras';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import {
  breadcrumbSchema,
  howToSchema,
  imageObjectSchema,
  softwareApplicationSchema,
  webPageSchema,
} from '@/lib/schema';
import CalculadoraForm from '@/components/CalculadoraForm';
import ImagenContenido from '@/components/ImagenContenido';
import { ranurasCalculadora } from '@/lib/imagenes';

/**
 * Página de una calculadora.
 *
 * El orden de la página no es estético: pregunta → herramienta → fórmula →
 * supuestos → LÍMITES. Los límites van después del resultado y antes de los
 * enlaces, porque quien ya tiene un número en la mano es exactamente quien
 * necesita leer qué no incluye. Ponerlos arriba, donde nadie los ha necesitado
 * todavía, es una forma elegante de que no los lea nadie.
 */

export const revalidate = 86400;
/**
 * Solo existen las cinco calculadoras del registro. Cualquier otra ruta bajo
 * /calculadoras/ es un 404 real y no una página generada bajo demanda: un
 * slug inventado que devuelve una página "vacía pero 200" es exactamente lo
 * que un buscador clasifica como soft-404 y lo que erosiona la confianza en
 * el resto del silo.
 *
 * No afecta a /calculadoras/formulas.json: en el App Router un segmento
 * estático tiene precedencia sobre uno dinámico, igual que ya ocurre con
 * /productos/catalogo.json frente a /productos/[slug].
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return calculadoras.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const calc = calculadoraPorSlug(slug);
  if (!calc) return {};
  const url = `${SITE.url}/calculadoras/${calc.slug}`;
  return {
    // Título corto para el buscador; la pregunta completa es el <h1>.
    title: calc.tituloSeo,
    // El resumen completo llegaba a 280 caracteres y se recorta cerca de 155.
    // Se emite la pregunta, que es lo que el usuario reconoce en el resultado.
    description: `${calc.pregunta} Método abierto de predimensionamiento, con la fórmula a la vista y sus límites declarados.`,
    alternates: { canonical: `/calculadoras/${calc.slug}` },
    openGraph: {
      title: `${calc.titulo} | ${SITE.name}`,
      description: calc.resumen,
      url,
      locale: SITE.locale,
      type: 'website',
    },
  };
}

export default async function CalculadoraPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const calc = calculadoraPorSlug(slug);
  if (!calc) notFound();

  const url = `${SITE.url}/calculadoras/${calc.slug}`;
  const geometria = ranurasCalculadora().find((r) => r.id === `calculadora:${calc.slug}`);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: calc.pregunta,
            description: calc.resumen,
            type: 'ItemPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Calculadoras', url: `${SITE.url}/calculadoras` },
              { name: calc.titulo, url },
            ],
            `${url}#breadcrumb`,
          ),
          softwareApplicationSchema({
            url,
            name: calc.titulo,
            description: calc.resumen,
            limitaciones: calc.noCubre,
          }),
          howToSchema({
            url,
            name: calc.titulo,
            description: `${calc.resumen} ${ADVERTENCIA}`,
            steps: calc.formula.map((linea, i) => ({
              name: `Paso ${i + 1}`,
              text: linea,
            })),
          }),
          /**
           * El esquema de geometría es lo que un comprador mira antes de creerse
           * el número. Si no se declara, un agente que lea sólo el grafo ve la
           * fórmula sin la figura que define qué es cada letra.
           */
          ...(geometria
            ? [
                imageObjectSchema({
                  url: geometria.ruta,
                  ancho: geometria.ancho,
                  alto: geometria.alto,
                  alt: geometria.alt,
                  paginaUrl: url,
                  esDiagrama: true,
                }),
              ]
            : []),
        ]}
      />

      <nav aria-label="Ruta" className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link href="/calculadoras" className="hover:underline">
          Calculadoras
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{calc.titulo}</span>
      </nav>

      <p className="text-sm font-semibold uppercase tracking-wide text-[#059669]">{calc.area}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
        {calc.pregunta}
      </h1>
      <p className="speakable-intro mt-4 max-w-3xl text-lg text-gray-600">{calc.resumen}</p>

      {/* La geometría ANTES del formulario. Los campos piden magnitudes —largo
          desarrollado del talud, ancho útil frente a nominal— que solo se
          entienden viendo qué se está midiendo. Puesta después, el usuario ya
          habría escrito el número equivocado. */}
      {geometria && (
        <ImagenContenido ranura={geometria} prioridad className="mt-8" sizes="(min-width: 1024px) 900px, 100vw" />
      )}

      <div className="mt-10">
        <CalculadoraForm slug={calc.slug} />
      </div>

      {/* ---------------- Método ---------------- */}
      <section className="mt-16">
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-gray-900">
          <Sigma className="h-6 w-6 text-[#059669]" aria-hidden="true" /> La fórmula
        </h2>
        <p className="mt-2 max-w-3xl text-gray-600">
          Se publica completa. Una caja negra que devuelve un número no la puede verificar nadie —ni
          un ingeniero ni un modelo de lenguaje— y por eso no la cita nadie.
        </p>
        <ol className="mt-5 space-y-2">
          {calc.formula.map((linea, i) => (
            <li
              key={linea}
              id={`paso-${i + 1}`}
              className="overflow-x-auto rounded-2xl bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800"
            >
              {linea}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Supuestos</h2>
        <ul className="mt-4 space-y-3">
          {calc.supuestos.map((s) => (
            <li key={s} className="flex gap-3 text-gray-700">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#059669]" aria-hidden="true" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- Límites ---------------- */}
      <section className="mt-12 rounded-3xl bg-gray-50 p-6">
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-gray-900">
          <ShieldAlert className="h-6 w-6 text-[#B45309]" aria-hidden="true" /> Qué NO cubre este
          cálculo
        </h2>
        <p className="mt-2 max-w-3xl text-gray-700">
          Va después del resultado a propósito: quien ya tiene un número en la mano es exactamente
          quien necesita saber qué no incluye.
        </p>
        <ul className="mt-4 space-y-3">
          {calc.noCubre.map((n) => (
            <li key={n} className="flex gap-3 text-gray-800">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B45309]" aria-hidden="true" />
              <span>{n}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-gray-200 pt-4 text-sm text-gray-600">{ADVERTENCIA}</p>
      </section>

      {/* ---------------- Respaldo ---------------- */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
          De dónde sale y dónde seguir
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {calc.verTambien.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                className="group flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 hover:ring-gray-300"
              >
                <span className="text-sm font-medium text-gray-800">{e.texto}</span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-[#059669] transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-3xl bg-gray-50 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <FileJson className="h-5 w-5" aria-hidden="true" /> Cómo citar este método
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          Método revisado el {CALCULADORAS_ACTUALIZADO}. Fórmula, supuestos y límites están
          publicados como datos en{' '}
          <a href="/calculadoras/formulas.json" className="font-medium text-[#059669] hover:underline">
            /calculadoras/formulas.json
          </a>
          .
        </p>
        <p className="mt-3 rounded-2xl bg-white p-3 font-mono text-xs text-gray-800">
          {CITA_SUGERIDA} — {calc.titulo}, {url}
        </p>
        <p className="mt-3 text-sm text-gray-600">
          Al citar un resultado, cite también los límites del método. Un predimensionamiento
          presentado sin ellos induce a usarlo como cálculo de ingeniería.
        </p>
      </section>
    </div>
  );
}
