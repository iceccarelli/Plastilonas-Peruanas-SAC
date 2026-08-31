import Link from 'next/link';
import { leerIndicadores, SIGNIFICADO } from '@/lib/indicadores';
import { numeroPE } from '@/lib/format';

/**
 * QUÉ MUEVE EL PRECIO DE ESTE FRENTE, HOY.
 *
 * Por qué existe. La página /indicadores ya leía el BCRP en vivo, pero vivía
 * al final del menú: el dato de costo estaba en el sitio y no llegaba a la
 * página donde alguien decide comprar. Esta franja lo pone donde se decide.
 *
 * Las tres reglas que la hacen publicable —las mismas de /indicadores, aquí
 * heredadas de lib/bcrp.ts y no reimplementadas—:
 *  · cada número lleva SU periodo, siempre: un dato sin fecha invita a cotizar
 *    contra él;
 *  · si el BCRP no responde se sirve el respaldo en frío DICIÉNDOLO, nunca un
 *    hueco ni un número viejo disfrazado de actual;
 *  · se declara la dirección del efecto y su desfase, jamás una fórmula de
 *    traspaso a precio que no podríamos sostener.
 *
 * NO es un pronóstico y el bloque lo dice en su propio texto. Es el contexto
 * verificable que un jefe de compras usaría para decidir si adelanta su
 * pedido, y ningún competidor del rubro lo publica.
 */
export default async function CostoEnVivo({
  codigos,
  titulo = 'Qué mueve el precio de este frente, hoy',
}: {
  codigos: string[];
  titulo?: string;
}) {
  const estado = await leerIndicadores(new Date());
  const vistos = estado.indicadores.filter((i) => codigos.includes(i.serie.codigo));
  if (vistos.length === 0) return null;

  return (
    <section
      aria-label={titulo}
      className="mt-14 rounded-3xl border border-gray-200 dark:border-[var(--border)] p-7"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-1">
        <h2 className="font-semibold tracking-tight text-2xl text-[#0A2540] dark:text-inherit">
          {titulo}
        </h2>
        <Link href="/indicadores" className="text-sm font-medium text-[#047857] hover:underline">
          Ver los cinco indicadores y su método →
        </Link>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Series oficiales del Banco Central de Reserva del Perú. No es un pronóstico de precio:
        es el contexto de costo con el que se arma una cotización.
      </p>

      <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {vistos.map((i) => (
          <div key={i.serie.codigo} className="rounded-2xl bg-gray-50 dark:bg-white/5 p-5">
            <dt className="text-xs uppercase tracking-wide text-gray-500">{i.serie.etiqueta}</dt>
            <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#0A2540] dark:text-inherit">
              {i.valor === null
                ? 'sin dato'
                : numeroPE(i.valor, i.serie.decimales)}
            </dd>
            <dd className="text-xs text-gray-500">
              {i.serie.unidad}
              {i.periodo && ` · ${i.periodo}`}
              {i.deRespaldo && ' · última lectura conocida'}
            </dd>
            {SIGNIFICADO[i.serie.codigo] && (
              <dd className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {SIGNIFICADO[i.serie.codigo]}
              </dd>
            )}
          </div>
        ))}
      </dl>

      {estado.sinConexion && (
        <p className="mt-5 text-xs text-gray-500">
          El BCRP no respondió en la última consulta ({estado.consultadoEl}): arriba se muestran las
          últimas lecturas conocidas, con su fecha.
        </p>
      )}
    </section>
  );
}
