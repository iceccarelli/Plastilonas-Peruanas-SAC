import React from 'react';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { faqSchema } from '@/lib/schema';
import { faqsDeRuta } from '@/lib/consultas-dinero';
import { SITE } from '@/lib/site';

/**
 * LAS PREGUNTAS DE COMPRA, VISIBLES Y MARCADAS, EN LA PÁGINA QUE LAS CONTESTA.
 *
 * lib/consultas-dinero.ts guarda las 22 consultas que preceden a una orden con
 * su respuesta citable y su límite. Hasta ahora vivían sólo en /llms.txt y en
 * /mapa-consultas.json: un agente las leía y una persona no.
 *
 * Las páginas que YA tenían un bloque de preguntas frecuentes las mezclan con
 * las suyas —una sola lista, un solo FAQPage—. Este componente es para las que
 * no lo tenían: publica el bloque visible y emite el FAQPage de esa ruta. Si la
 * ruta no tiene respuestas escritas, no pinta nada y no emite nada, que es lo
 * correcto: un FAQPage vacío es ruido en el grafo.
 *
 * REGLA QUE NO SE NEGOCIA: el marcado sólo describe lo que el visitante puede
 * leer. Emitir preguntas que la página no muestra es lo que un buscador
 * descarta, y con razón — sería decirle algo que su lector no puede comprobar.
 */

interface Props {
  /** Ruta canónica de la página, sin dominio. Ej.: '/nosotros'. */
  ruta: string;
  titulo?: string;
  /** Idioma de las preguntas, si no es el del sitio. */
  idioma?: string;
  /** Enlace del siguiente paso, si la página quiere cerrarlo aquí. */
  siguiente?: { href: string; label: string };
  className?: string;
}

export default function PreguntasDeCompra({
  ruta,
  titulo = 'Preguntas frecuentes',
  idioma,
  siguiente,
  className = '',
}: Props) {
  const faqs = faqsDeRuta(ruta);
  if (faqs.length === 0) return null;

  return (
    <section className={`mt-14 border-t pt-10 ${className}`.trim()}>
      <JsonLd data={faqSchema(faqs, `${SITE.url}${ruta}`, idioma)} />
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">{titulo}</h2>
      <dl className="max-w-3xl space-y-6">
        {faqs.map((f) => (
          <div key={f.q}>
            <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
            <dd className="mt-1 text-gray-700">{f.a}</dd>
          </div>
        ))}
      </dl>
      {siguiente ? (
        <Link
          href={siguiente.href}
          className="mt-6 inline-flex min-h-[44px] items-center text-sm font-medium text-[#059669] hover:underline"
        >
          {siguiente.label}
        </Link>
      ) : null}
    </section>
  );
}
