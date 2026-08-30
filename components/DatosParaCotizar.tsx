import Link from 'next/link';

/**
 * «4 datos para cotizar» — bloque transversal del sitio.
 *
 * La fricción real de un RFQ industrial no es el formulario: es que el
 * comprador no sabe qué datos le van a pedir. Decirlos ANTES de que escriba
 * convierte «solicite una cotización» (vago) en una lista que compras puede
 * completar en un minuto. El mismo checklist gobierna el formulario de
 * /cotizacion y el mensaje prellenado de WhatsApp: un solo guion, tres canales.
 */
export const DATOS_PARA_COTIZAR = [
  { dato: 'Producto', detalle: 'nombre o familia del catálogo' },
  { dato: 'Medidas / cantidad', detalle: 'dimensiones, metraje o unidades' },
  { dato: 'Ciudad de entrega', detalle: 'para plazo y flete' },
  { dato: 'Plazo', detalle: 'fecha en que lo necesita' },
] as const;

const DATOS = DATOS_PARA_COTIZAR;

export default function DatosParaCotizar({ compacto = false }: { compacto?: boolean }) {
  return (
    <section
      aria-label="Los 4 datos para cotizar"
      className={
        compacto
          ? 'rounded-2xl border border-gray-200 dark:border-[var(--border)] p-5'
          : 'rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-7'
      }
    >
      <div className="font-semibold tracking-tight text-[#0A2540] dark:text-inherit mb-3">
        4 datos para cotizar sin idas y vueltas
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 text-sm text-gray-700 dark:text-gray-300">
        {DATOS.map((d, i) => (
          <li key={d.dato} className="flex gap-2">
            <span className="font-mono text-[#059669]">{i + 1}.</span>
            <span>
              <span className="font-medium">{d.dato}</span>
              <span className="text-gray-500"> — {d.detalle}</span>
            </span>
          </li>
        ))}
      </ol>
      {!compacto && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Con esos cuatro datos respondemos con ficha técnica; sin ellos, con las
          preguntas que falten.{' '}
          <Link href="/cotizacion" className="text-[#047857] font-medium hover:underline">
            Ir a cotizar →
          </Link>
        </p>
      )}
    </section>
  );
}
