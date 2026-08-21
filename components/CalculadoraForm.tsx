'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Sigma } from 'lucide-react';
import { calculadoraPorSlug, valoresIniciales, ADVERTENCIA } from '@/lib/calculadoras';
import { numeroPE } from '@/lib/format';
import { trackEvent } from '@/lib/analytics';
import WhatsAppLink from '@/components/WhatsAppLink';

/**
 * Formulario de una calculadora de predimensionamiento.
 *
 * Tres decisiones que no son estéticas:
 *
 * 1. NO ENVÍA NADA A NINGÚN SERVIDOR. Todo se calcula en el navegador. Las
 *    medidas de una poza de relaves o la potencia diésel de una labor son
 *    información del proyecto de un tercero; pedirlas a cambio de un resultado
 *    convertiría una herramienta pública en un formulario de captación, y nadie
 *    con un proyecto real la usaría dos veces.
 *
 * 2. EL RESULTADO SE RECALCULA AL TECLEAR, sin botón. Ver el número moverse al
 *    cambiar el talud es la mitad del valor de la herramienta: enseña qué
 *    variable manda. Un botón «Calcular» esconde justamente eso.
 *
 * 3. LOS SUPUESTOS SE MARCAN Y SE PUEDEN CAMBIAR. Un traslape o un desperdicio
 *    presentados como si fueran datos del proyecto son una mentira silenciosa.
 *    Aquí llevan etiqueta y se editan.
 *
 * `numeroPE` en lugar de toLocaleString: el ICU reducido de algunos contenedores
 * devolvía formato inglés, y el mismo código imprimía «1,141.3» en producción y
 * «1 141,3» en local. Un número mal formateado en una memoria de cálculo se lee
 * como un error de cálculo.
 *
 * POR QUÉ RECIBE UN `slug` Y NO LA CALCULADORA ENTERA. Una `Calculadora` lleva
 * dentro su método `calcular`, y una función NO CRUZA la frontera entre un
 * componente de servidor y uno de cliente: React serializa las props, y una
 * función no se serializa. El build falla en el prerenderizado con «Functions
 * cannot be passed directly to Client Components», no antes: ni el chequeo de
 * tipos ni las pruebas unitarias pueden verlo, porque en TypeScript la prop es
 * perfectamente válida.
 *
 * Así que aquí se recibe el identificador y el propio cliente resuelve la
 * calculadora contra el registro, que es TypeScript puro sin nada de servidor
 * dentro. El registro viaja al navegador, y está bien que viaje: es el mismo
 * método que publicamos abierto en /calculadoras/formulas.json.
 */

export default function CalculadoraForm({ slug }: { slug: string }) {
  const calc = calculadoraPorSlug(slug);
  if (!calc) return null;
  return <Formulario calc={calc} />;
}

/**
 * El cuerpo va aparte porque los hooks no pueden colgar de un `return` previo:
 * la comprobación del slug tiene que ocurrir ANTES del primer useState, y las
 * reglas de los hooks prohíben ambas cosas en la misma función.
 */
function Formulario({ calc }: { calc: NonNullable<ReturnType<typeof calculadoraPorSlug>> }) {
  const inicial = useMemo(() => valoresIniciales(calc), [calc]);
  const [valores, setValores] = useState<Record<string, number>>(inicial);
  const [tocado, setTocado] = useState(false);

  const salida = useMemo(() => calc.calcular(valores), [calc, valores]);

  const cambiar = (id: string, bruto: string) => {
    const n = Number(bruto);
    setValores((v) => ({ ...v, [id]: Number.isFinite(n) ? n : 0 }));
    if (!tocado) {
      setTocado(true);
      trackEvent('calculadora_usada', { calculadora: calc.slug });
    }
  };

  const reiniciar = () => {
    setValores(inicial);
    setTocado(false);
  };

  const datos = calc.campos.filter((c) => !c.esSupuesto);
  const supuestos = calc.campos.filter((c) => c.esSupuesto);

  const resumenParaCotizar = [
    `Consulta desde la calculadora "${calc.titulo}".`,
    ...calc.campos.map((c) => `${c.etiqueta}: ${numeroPE(valores[c.id] ?? 0)} ${c.unidad}`.trim()),
    ...(salida.invalido
      ? []
      : salida.principales.map((p) => `→ ${p.etiqueta}: ${numeroPE(p.valor, p.decimales)} ${p.unidad}`)),
  ].join('\n');

  const campoInput = (c: (typeof calc.campos)[number]) => (
    <label key={c.id} className="block">
      <span className="block text-sm font-medium text-gray-800">
        {c.etiqueta}
        {c.unidad && <span className="ml-1 font-normal text-gray-500">({c.unidad})</span>}
      </span>
      {c.tipo === 'opcion' && c.opciones ? (
        <select
          value={valores[c.id]}
          onChange={(e) => cambiar(c.id, e.target.value)}
          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900"
        >
          {c.opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="number"
          inputMode="decimal"
          value={valores[c.id]}
          min={c.min}
          max={c.max}
          step={c.paso}
          onChange={(e) => cambiar(c.id, e.target.value)}
          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900"
        />
      )}
      {c.ayuda && <span className="mt-1 block text-xs text-gray-500">{c.ayuda}</span>}
    </label>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* ---------------- Entradas ---------------- */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Datos del proyecto
          </legend>
          {datos.map(campoInput)}
        </fieldset>

        {supuestos.length > 0 && (
          <fieldset className="space-y-4 rounded-2xl bg-gray-50 p-4">
            <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Supuestos — cámbielos
            </legend>
            <p className="text-xs text-gray-600">
              Estos valores son un punto de partida, no una recomendación de diseño. El resultado
              depende de ellos, así que van a la vista y no escondidos en el código.
            </p>
            {supuestos.map(campoInput)}
          </fieldset>
        )}

        <button
          type="button"
          onClick={reiniciar}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Volver a los valores de partida
        </button>
      </form>

      {/* ---------------- Resultado ---------------- */}
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100" aria-live="polite">
          {salida.invalido ? (
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B45309]" aria-hidden="true" />
              <p className="text-sm text-gray-800">{salida.invalido}</p>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {salida.principales.map((p) => (
                  <div key={p.etiqueta}>
                    <p className="text-sm text-gray-600">{p.etiqueta}</p>
                    <p className="mt-0.5 text-3xl font-semibold tracking-tight text-gray-900">
                      {numeroPE(p.valor, p.decimales)}{' '}
                      <span className="text-lg font-normal text-gray-500">{p.unidad}</span>
                    </p>
                    {p.nota && <p className="mt-1 text-xs text-gray-500">{p.nota}</p>}
                  </div>
                ))}
              </div>

              <hr className="my-5 border-gray-100" />

              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Cómo sale ese número
              </h3>
              <dl className="mt-3 space-y-2">
                {salida.desglose.map((d) => (
                  <div key={d.etiqueta} className="flex flex-wrap items-baseline justify-between gap-2">
                    <dt className="text-sm text-gray-600">
                      {d.etiqueta}
                      {d.nota && <span className="block text-xs text-gray-400">{d.nota}</span>}
                    </dt>
                    <dd className="text-sm font-medium tabular-nums text-gray-900">
                      {numeroPE(d.valor, d.decimales)} {d.unidad}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>

        {salida.avisos.length > 0 && (
          <ul className="space-y-3">
            {salida.avisos.map((a) => (
              <li key={a} className="flex gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="flex items-start gap-2 text-xs text-gray-600">
            <Sigma className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{ADVERTENCIA}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <WhatsAppLink
            context={`calculadora:${calc.slug}`}
            message={resumenParaCotizar}
            className="inline-flex items-center gap-2 rounded-full bg-[#059669] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#047857]"
          >
            Revisar este resultado con un especialista
          </WhatsAppLink>
          <Link
            href="/cotizacion"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 hover:border-gray-400"
          >
            Pedir cotización
          </Link>
        </div>
        <p className="text-xs text-gray-500">
          Nada de lo que escriba aquí sale de su navegador. El resumen solo viaja si usted pulsa el
          botón de WhatsApp.
        </p>
      </div>
    </div>
  );
}
