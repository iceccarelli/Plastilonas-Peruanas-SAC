'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Download, FileText, RotateCcw } from 'lucide-react';
import { pillars, totalCriteria } from '@/lib/framework';
import { scoreAnswers, type Answer, type Answers } from '@/lib/framework-score';
import {
  trackBriefDownload,
  trackFrameworkCompleted,
  trackFrameworkStarted,
} from '@/lib/analytics';
import WhatsAppLink from '@/components/WhatsAppLink';

/**
 * Autoevaluación contra el Marco de Especificación.
 *
 * Decisión de diseño deliberada: NO pide datos personales y NO envía nada a un
 * servidor. El PDF se genera en el navegador. Un comprador técnico responde con
 * franqueza sobre lo que su proyecto todavía no tiene definido solo si sabe que
 * esa confesión no se convierte en una lista de llamadas.
 *
 * El resultado comercial llega igual, y mejor: quien termina la evaluación y
 * escribe por WhatsApp lo hace con su brief en la mano.
 */

const CRITERIOS = pillars.flatMap((p) => p.criterios.map((c) => ({ ...c, pilar: p })));

const OPCIONES: { valor: Answer; etiqueta: string; ayuda: string }[] = [
  { valor: 'si', etiqueta: 'Sí, está definido', ayuda: 'Tengo el dato o la decisión tomada' },
  { valor: 'no', etiqueta: 'No, aún no', ayuda: 'Falta definirlo' },
  { valor: 'nose', etiqueta: 'No lo sé', ayuda: 'Habría que averiguarlo' },
];

export default function EvaluacionPage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [proyecto, setProyecto] = useState('');
  const [terminado, setTerminado] = useState(false);
  const [generando, setGenerando] = useState(false);
  const empezado = useRef(false);

  const respondidos = Object.keys(answers).length;
  const resultado = useMemo(() => scoreAnswers(answers), [answers]);

  const responder = (id: string, valor: Answer) => {
    if (!empezado.current) {
      empezado.current = true;
      trackFrameworkStarted();
    }
    setAnswers((prev) => ({ ...prev, [id]: valor }));
  };

  const finalizar = () => {
    setTerminado(true);
    trackFrameworkCompleted(resultado.porcentaje, resultado.nivel.etiqueta);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const descargar = async () => {
    setGenerando(true);
    try {
      const fecha = new Date().toISOString().slice(0, 10);
      // Carga diferida: pdf-lib pesa ~210 kB y solo hace falta si el usuario
      // decide descargar. Sin esto viajaba en la carga inicial de la página.
      const { buildBriefPdf } = await import('@/lib/framework-brief');
      const bytes = await buildBriefPdf(resultado, proyecto, fecha);
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brief-especificacion-${fecha}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      trackBriefDownload(resultado.nivel.etiqueta);
    } finally {
      setGenerando(false);
    }
  };

  const reiniciar = () => {
    setAnswers({});
    setTerminado(false);
    empezado.current = false;
  };

  const mensajeWhatsApp =
    `Hola, completé la autoevaluación del Marco de Especificación. ` +
    `Nivel: ${resultado.nivel.etiqueta} (${resultado.porcentaje}%).` +
    (proyecto.trim() ? ` Proyecto: ${proyecto.trim()}.` : '') +
    ` Quisiera revisar los criterios que me faltan.`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link>{' '}
        / <Link href="/marco" className="hover:text-[#059669]">Marco de Especificación</Link>{' '}
        / <span className="text-gray-700">Evaluación</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Evalúe la definición de su proyecto
      </h1>
      <p className="mb-2 text-lg text-gray-700">
        {totalCriteria()} criterios en seis pilares. Mide cuánta información existe para
        especificar sin adivinar — no evalúa proveedores ni productos.
      </p>
      <p className="mb-8 text-sm text-gray-500">
        No pedimos datos personales y sus respuestas no se envían a ningún servidor: el
        brief se genera en su propio navegador.
      </p>

      {terminado && (
        <div className="mb-10 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-7">
          <div className="mb-1 text-sm font-semibold uppercase tracking-[0.12em] text-[#059669]">
            Nivel de definición
          </div>
          <div className="mb-3 text-3xl font-semibold tracking-tight text-[#0A2540]">
            {resultado.nivel.etiqueta} · {resultado.porcentaje}%
          </div>
          <p className="mb-6 text-gray-800">{resultado.nivel.detalle}</p>

          <div className="mb-6 space-y-2">
            {resultado.porPilar.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-56 shrink-0 text-sm text-gray-700">{p.nombre}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <span
                    className={`block h-full rounded-full ${p.porcentaje >= 60 ? 'bg-[#059669]' : 'bg-amber-500'}`}
                    style={{ width: `${p.porcentaje}%` }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right text-sm font-medium text-gray-600">
                  {p.porcentaje}%
                </span>
              </div>
            ))}
          </div>

          <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="proyecto">
            Nombre del proyecto (opcional, solo aparece en su PDF)
          </label>
          <input
            id="proyecto"
            value={proyecto}
            onChange={(e) => setProyecto(e.target.value)}
            placeholder="Ej.: Poza de proceso — Unidad Arequipa"
            className="form-input mb-5 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-[#059669]"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={descargar}
              disabled={generando}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0A2540] px-7 py-3.5 font-semibold text-white hover:bg-[#059669] disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {generando ? 'Generando…' : 'Descargar brief (PDF)'}
            </button>
            <WhatsAppLink
              context={`marco:${resultado.nivel.etiqueta.toLowerCase()}`}
              message={mensajeWhatsApp}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-7 py-3.5 font-medium text-gray-700 hover:border-[#059669]/40 hover:text-[#059669]"
            >
              Revisar los pendientes con un especialista
            </WhatsAppLink>
            <button
              onClick={reiniciar}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-500 hover:text-[#059669]"
            >
              <RotateCcw className="h-4 w-4" /> Reiniciar
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gray-100 p-4">
        <FileText className="h-5 w-5 shrink-0 text-[#059669]" />
        <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
          <span
            className="block h-full rounded-full bg-[#059669] transition-all"
            style={{ width: `${Math.round((respondidos / CRITERIOS.length) * 100)}%` }}
          />
        </span>
        <span className="shrink-0 text-sm font-medium text-gray-600">
          {respondidos} / {CRITERIOS.length}
        </span>
      </div>

      {pillars.map((p, i) => (
        <section key={p.id} className="mb-10">
          <h2 className="mb-1 text-2xl font-semibold tracking-tight text-[#0A2540]">
            {i + 1}. {p.nombre}
          </h2>
          <p className="mb-5 text-sm text-gray-600">{p.resumen}</p>

          <div className="space-y-4">
            {p.criterios.map((c) => (
              <div key={c.id} className="rounded-2xl border border-gray-100 p-5">
                <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-medium text-[#0A2540]">{c.pregunta}</h3>
                  {c.peso === 2 && (
                    <span className="shrink-0 rounded-full bg-[#059669]/10 px-2.5 py-0.5 text-xs font-semibold text-[#059669]">
                      Crítico
                    </span>
                  )}
                </div>
                <p className="mb-4 text-sm text-gray-600">{c.porQue}</p>
                <div className="flex flex-wrap gap-2">
                  {OPCIONES.map((o) => {
                    const activo = answers[c.id] === o.valor;
                    return (
                      <button
                        key={o.valor}
                        onClick={() => responder(c.id, o.valor)}
                        title={o.ayuda}
                        aria-pressed={activo}
                        className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2 text-sm transition-colors ${
                          activo
                            ? 'border-[#059669] bg-[#059669]/10 font-medium text-[#047857]'
                            : 'border-gray-200 text-gray-700 hover:border-[#059669]/40'
                        }`}
                      >
                        {activo && <Check className="h-3.5 w-3.5" />}
                        {o.etiqueta}
                      </button>
                    );
                  })}
                </div>
                {answers[c.id] && answers[c.id] !== 'si' && (
                  <p className="mt-3 border-l-2 border-amber-400 pl-3 text-sm text-gray-600">
                    {c.riesgo}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">
          {respondidos === CRITERIOS.length
            ? 'Listo: ya respondió los ' + CRITERIOS.length + ' criterios'
            : `Respondidos ${respondidos} de ${CRITERIOS.length}`}
        </h2>
        <p className="mx-auto mb-7 max-w-md text-white/80">
          Puede calcular el resultado en cualquier momento; los criterios sin responder
          cuentan como no definidos.
        </p>
        <button
          onClick={finalizar}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
        >
          Ver resultado y generar brief <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
