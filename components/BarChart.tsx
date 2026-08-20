import type { Grafico } from '@/lib/informes';
import { numeroPE, numeroConSigno } from '@/lib/format';

/**
 * Gráfico de barras en SVG, renderizado en el servidor.
 *
 * Por qué SVG en servidor y no una librería de gráficos. Tres razones que se
 * refuerzan: no añade un solo kilobyte de JavaScript a la página, se ve en el
 * primer pintado (un gráfico que aparece medio segundo después es un salto de
 * maquetación), y funciona con JavaScript desactivado y en el modo lector.
 *
 * DECISIONES DE COLOR, tomadas con el validador y no a ojo:
 *
 *  - Serie única (magnitud): UN solo color. La longitud de la barra ya codifica
 *    la magnitud; pintar cada barra de un color distinto sugiere que el color
 *    significa algo y no significa nada.
 *
 *  - Divergente (crecimiento y contracción): azul y naranja, NO verde y rojo.
 *    Verde/rojo es el par que la deuteranopia confunde: medido, se queda en
 *    ΔE 5–6 (el umbral es 8). Azul/naranja mide ΔE 25–28 en las tres formas de
 *    daltonismo. Además cada barra lleva su valor con signo, de modo que la
 *    identidad nunca depende solo del color.
 *
 *  - Los valores van en tinta de texto, nunca en el color de la serie: el color
 *    lo lleva la barra, que es quien porta la identidad.
 *
 * ACCESIBILIDAD: cada gráfico incluye su tabla de datos desplegable. Un
 * lorikeet de pantalla, una impresión en blanco y negro y el modo de alto
 * contraste leen la tabla; el SVG es la versión visual del mismo dato.
 */

const ALTO_BARRA = 30;
const SEPARACION = 12;
const ANCHO = 720;

export default function BarChart({ grafico }: { grafico: Grafico }) {
  const { datos, tipo } = grafico;
  const divergente = tipo === 'divergente';

  const maxAbs = Math.max(...datos.map((d) => Math.abs(d.valor)));
  const alto = datos.length * (ALTO_BARRA + SEPARACION);

  // Ancho reservado a la etiqueta de categoría y al valor. En divergente el
  // eje cero vive a la izquierda del área de trazado, no en el centro: con una
  // sola barra negativa, centrar el cero desperdicia la mitad del ancho.
  const ANCHO_ETIQUETA = 130;
  const ANCHO_VALOR = 74;
  const areaTrazado = ANCHO - ANCHO_ETIQUETA - ANCHO_VALOR;
  const negativos = datos.some((d) => d.valor < 0);
  const anchoNegativo = divergente && negativos ? areaTrazado * 0.16 : 0;
  const x0 = ANCHO_ETIQUETA + anchoNegativo;
  const escala = (areaTrazado - anchoNegativo) / maxAbs;

  return (
    <figure className="viz-root my-8">
      <figcaption className="mb-1 font-semibold tracking-tight text-[#0A2540]">
        {grafico.titulo}
      </figcaption>
      <p className="mb-4 text-sm text-gray-500">{grafico.unidad}</p>

      <svg
        viewBox={`0 0 ${ANCHO} ${alto}`}
        width="100%"
        role="img"
        aria-label={`${grafico.titulo}. ${grafico.unidad}. Los valores están en la tabla de datos que acompaña al gráfico.`}
        className="max-w-full"
      >
        {/* Línea base. En divergente marca el cero; en magnitud, el origen. */}
        <line
          x1={x0}
          y1={0}
          x2={x0}
          y2={alto - SEPARACION / 2}
          className="viz-eje"
          strokeWidth={1}
        />
        {datos.map((d, i) => {
          const y = i * (ALTO_BARRA + SEPARACION);
          const largo = Math.abs(d.valor) * escala;
          const negativo = d.valor < 0;
          const x = negativo ? x0 - largo : x0;
          // Formato explícito y no toLocaleString: el separador decimal no
          // puede depender de los datos ICU del contenedor que compiló.
          const texto = divergente ? numeroConSigno(d.valor) : numeroPE(d.valor);
          return (
            <g key={d.etiqueta}>
              <text
                x={ANCHO_ETIQUETA - 12}
                y={y + ALTO_BARRA / 2}
                textAnchor="end"
                dominantBaseline="central"
                className="viz-etiqueta"
                fontSize={13}
              >
                {d.etiqueta}
              </text>
              <rect
                x={x}
                y={y}
                width={Math.max(largo, 2)}
                height={ALTO_BARRA}
                rx={4}
                className={
                  divergente
                    ? negativo
                      ? 'viz-barra-neg'
                      : 'viz-barra-pos'
                    : 'viz-barra'
                }
              />
              {/* Etiqueta directa: la identidad del valor nunca depende del color. */}
              <text
                x={negativo ? x - 8 : x + largo + 8}
                y={y + ALTO_BARRA / 2}
                textAnchor={negativo ? 'end' : 'start'}
                dominantBaseline="central"
                className="viz-valor"
                fontSize={13}
              >
                {texto}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="mt-3 text-sm text-gray-500">{grafico.nota}</p>

      {/* La misma información en tabla: lector de pantalla, impresión en blanco
          y negro, alto contraste y quien simplemente prefiere el número. */}
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-[#059669] hover:underline">
          Ver los datos en tabla
        </summary>
        <table className="mt-3 w-full border-collapse text-sm">
          <caption className="sr-only">{grafico.titulo}</caption>
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th scope="col" className="py-2 pr-4 font-semibold text-[#0A2540]">
                Concepto
              </th>
              <th scope="col" className="py-2 font-semibold text-[#0A2540]">
                {grafico.unidad}
              </th>
            </tr>
          </thead>
          <tbody>
            {datos.map((d) => (
              <tr key={d.etiqueta} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-700">{d.etiqueta}</td>
                <td className="py-2 font-mono text-gray-700">
                  {grafico.tipo === 'divergente' ? numeroConSigno(d.valor) : numeroPE(d.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
