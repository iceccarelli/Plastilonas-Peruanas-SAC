import type { Grafico } from '@/lib/informes';
import { numeroPE } from '@/lib/format';

/**
 * Serie temporal en SVG, renderizada en el servidor.
 *
 * Cuándo esta forma y no barras: cuando lo que hay que leer es la TRAYECTORIA.
 * Una serie de diecinueve meses en barras obliga a comparar alturas contiguas;
 * la línea muestra de un vistazo hacia dónde va, que es la pregunta real
 * cuando se habla de volatilidad.
 *
 * Especificaciones tomadas de la guía de marcas, no improvisadas:
 *  - línea de 2 px, uniones y extremos redondeados;
 *  - rejilla de un paso respecto de la superficie, sólida y discreta — nunca
 *    punteada, que compite con el dato;
 *  - una sola serie: sin leyenda, el título la nombra;
 *  - se rotulan el primer y el último punto, no todos: un número sobre cada
 *    punto convierte el gráfico en una tabla mal maquetada;
 *  - los marcadores llevan anillo del color de la superficie para seguir
 *    legibles donde cruzan la línea;
 *  - el texto nunca lleva el color de la serie: el color lo porta la línea.
 *
 * El eje NO arranca en cero, y es deliberado: en un tipo de cambio que se
 * mueve entre 3,3 y 3,8 forzar el cero aplana la serie hasta volverla inútil.
 * La regla del cero obligatorio vale para magnitudes que se comparan por
 * área o longitud, no para una trayectoria. La nota al pie lo declara.
 */

const ANCHO = 720;
const ALTO = 260;
const M = { arriba: 24, derecha: 58, abajo: 34, izquierda: 52 };

export default function LineChart({ grafico }: { grafico: Grafico }) {
  const { datos, decimales = 2, cadaN = 3 } = grafico;
  const valores = datos.map((d) => d.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  // Margen del 8 % arriba y abajo para que la línea no toque los bordes.
  const holgura = (max - min) * 0.08 || 0.1;
  const lo = min - holgura;
  const hi = max + holgura;

  const anchoTrazado = ANCHO - M.izquierda - M.derecha;
  const altoTrazado = ALTO - M.arriba - M.abajo;
  const x = (i: number) => M.izquierda + (i / Math.max(datos.length - 1, 1)) * anchoTrazado;
  const y = (v: number) => M.arriba + (1 - (v - lo) / (hi - lo)) * altoTrazado;

  const linea = datos.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.valor)}`).join(' ');
  const primero = datos[0];
  const ultimo = datos[datos.length - 1];
  // Tres líneas de rejilla: suficientes para situar, pocas para no competir.
  const rejilla = [lo + (hi - lo) * 0.15, lo + (hi - lo) * 0.5, lo + (hi - lo) * 0.85];

  return (
    <figure className="viz-root my-8">
      <figcaption className="mb-1 font-semibold tracking-tight text-[#0A2540]">
        {grafico.titulo}
      </figcaption>
      <p className="mb-4 text-sm text-gray-500">{grafico.unidad}</p>

      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        width="100%"
        role="img"
        aria-label={`${grafico.titulo}. ${grafico.unidad}. Desde ${primero.etiqueta} (${numeroPE(primero.valor, decimales)}) hasta ${ultimo.etiqueta} (${numeroPE(ultimo.valor, decimales)}). Los valores están en la tabla de datos que acompaña al gráfico.`}
        className="max-w-full"
      >
        {rejilla.map((v) => (
          <g key={v}>
            <line
              x1={M.izquierda} y1={y(v)} x2={ANCHO - M.derecha} y2={y(v)}
              className="viz-eje" strokeWidth={1}
            />
            <text
              x={M.izquierda - 8} y={y(v)} textAnchor="end" dominantBaseline="central"
              className="viz-valor" fontSize={11}
            >
              {numeroPE(v, decimales)}
            </text>
          </g>
        ))}

        <path d={linea} fill="none" className="viz-linea" strokeWidth={2}
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Extremos: los dos puntos que cuentan la historia. */}
        {[{ i: 0, d: primero }, { i: datos.length - 1, d: ultimo }].map(({ i, d }) => (
          <g key={d.etiqueta}>
            <circle cx={x(i)} cy={y(d.valor)} r={5} className="viz-punto" strokeWidth={2} />
            <text
              x={i === 0 ? x(i) + 10 : x(i) - 10}
              y={y(d.valor) - 12}
              textAnchor={i === 0 ? 'start' : 'end'}
              className="viz-etiqueta" fontSize={12} fontWeight={600}
            >
              {numeroPE(d.valor, decimales)}
            </text>
          </g>
        ))}

        {/* Eje temporal: una etiqueta cada N, más la última siempre. */}
        {datos.map((d, i) =>
          i % cadaN === 0 || i === datos.length - 1 ? (
            <text
              key={d.etiqueta} x={x(i)} y={ALTO - 10}
              textAnchor={i === datos.length - 1 ? 'end' : i === 0 ? 'start' : 'middle'}
              className="viz-valor" fontSize={11}
            >
              {d.etiqueta}
            </text>
          ) : null,
        )}
      </svg>

      <p className="mt-3 text-sm text-gray-500">{grafico.nota}</p>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-[#059669] hover:underline">
          Ver los datos en tabla
        </summary>
        <table className="mt-3 w-full border-collapse text-sm">
          <caption className="sr-only">{grafico.titulo}</caption>
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th scope="col" className="py-2 pr-4 font-semibold text-[#0A2540]">Periodo</th>
              <th scope="col" className="py-2 font-semibold text-[#0A2540]">{grafico.unidad}</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((d) => (
              <tr key={d.etiqueta} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-700">{d.etiqueta}</td>
                <td className="py-2 font-mono text-gray-700">{numeroPE(d.valor, decimales)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
