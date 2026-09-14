import {
  calculadoras,
  calculadoraPorSlug,
  valoresIniciales,
  ADVERTENCIA,
  CALCULADORAS_VERSION,
  CALCULADORAS_ACTUALIZADO,
  type Calculadora,
  type Salida,
} from '../../lib/calculadoras';
import { SITIO } from './config';

/**
 * EL ACTIVO. Todo lo demás de esta API es catálogo; esto es lo que nadie más
 * publica en el rubro.
 *
 * Cinco preguntas que hoy se responden por teléfono, una vez, y se pierden:
 * cuánto aire necesita una labor, cuánta geomembrana entra en una poza, cuántos
 * rollos cubren una superficie, cuántos bolsones caben en un viaje y cuánto
 * carga un big bag con ese material. Un comprador que llega con su número
 * negocia distinto que uno que pregunta «¿cuánto cuesta?».
 *
 * NO SE REIMPLEMENTA NADA AQUÍ. Se importa `lib/calculadoras.ts`, el mismo
 * módulo que usa la web. Si la fórmula cambia, cambia en los dos sitios a la
 * vez o no cambia. Una segunda implementación del mismo cálculo es la forma
 * más cara de equivocarse: los dos números existen, los dos parecen correctos
 * y nadie sabe cuál se cotizó.
 */

export interface CalculoPedido {
  slug: string;
  valores: Record<string, number>;
}

export interface CalculoHecho {
  calculo: string;
  titulo: string;
  pregunta: string;
  area: string;
  version: string;
  revisado: string;
  entrada: Record<string, number>;
  /** Qué valores puso quien pregunta y cuáles quedaron por defecto. */
  supuestos_aplicados: { campo: string; valor: number; unidad: string; origen: 'recibido' | 'por defecto'; nota: string }[];
  resultado: Salida;
  formula: string[];
  no_cubre: string[];
}

export const descripcionDe = (c: Calculadora) => ({
  slug: c.slug,
  titulo: c.titulo,
  pregunta: c.pregunta,
  resumen: c.resumen,
  area: c.area,
  url: `${SITIO}/calculadoras/${c.slug}`,
  campos: c.campos.map((campo) => ({
    id: campo.id,
    etiqueta: campo.etiqueta,
    unidad: campo.unidad,
    tipo: campo.tipo,
    ayuda: campo.ayuda,
    por_defecto: campo.porDefecto,
    min: campo.min ?? null,
    max: campo.max ?? null,
    es_supuesto: campo.esSupuesto === true,
    opciones: campo.opciones?.map((o) => ({ valor: o.valor, etiqueta: o.etiqueta })) ?? null,
  })),
  formula: c.formula,
  supuestos: c.supuestos,
  no_cubre: c.noCubre,
});

export const catalogoDeCalculos = () => calculadoras.map(descripcionDe);

export class CalculoInvalido extends Error {
  constructor(public codigo: string, mensaje: string, public detalle?: unknown) {
    super(mensaje);
  }
}

/**
 * Valida y ejecuta. Devuelve el número CON su desglose y sus avisos, o no lo
 * devuelve. `lib/calculadoras.ts` marca `invalido` cuando la geometría no
 * cierra —un talud imposible, un traslape mayor que el ancho del rollo— y ese
 * caso se propaga como 422, no como un número silenciosamente absurdo.
 */
export function ejecutar(pedido: CalculoPedido): CalculoHecho {
  const calc = calculadoraPorSlug(pedido.slug);
  if (!calc) {
    throw new CalculoInvalido(
      'calculo_desconocido',
      `No existe el cálculo «${pedido.slug}».`,
      { disponibles: calculadoras.map((c) => c.slug) },
    );
  }

  const recibidos = pedido.valores ?? {};
  const desconocidos = Object.keys(recibidos).filter((k) => !calc.campos.some((c) => c.id === k));
  if (desconocidos.length) {
    throw new CalculoInvalido('campos_desconocidos', `Campos que este cálculo no acepta: ${desconocidos.join(', ')}.`, {
      aceptados: calc.campos.map((c) => c.id),
    });
  }

  const valores = valoresIniciales(calc);
  const supuestos: CalculoHecho['supuestos_aplicados'] = [];

  for (const campo of calc.campos) {
    const bruto = recibidos[campo.id];
    const recibido = bruto !== undefined && bruto !== null;
    if (recibido) {
      if (typeof bruto !== 'number' || !Number.isFinite(bruto)) {
        throw new CalculoInvalido('valor_no_numerico', `«${campo.id}» tiene que ser un número finito (${campo.unidad}).`);
      }
      if (campo.min !== undefined && bruto < campo.min) {
        throw new CalculoInvalido('fuera_de_rango', `«${campo.id}» no puede ser menor que ${campo.min} ${campo.unidad}.`);
      }
      if (campo.max !== undefined && bruto > campo.max) {
        throw new CalculoInvalido('fuera_de_rango', `«${campo.id}» no puede ser mayor que ${campo.max} ${campo.unidad}.`);
      }
      if (campo.tipo === 'opcion' && campo.opciones && !campo.opciones.some((o) => o.valor === bruto)) {
        throw new CalculoInvalido('opcion_invalida', `«${campo.id}» admite ${campo.opciones.map((o) => o.valor).join(', ')}.`, {
          opciones: campo.opciones,
        });
      }
      valores[campo.id] = bruto;
    }
    supuestos.push({
      campo: campo.id,
      valor: valores[campo.id] as number,
      unidad: campo.unidad,
      origen: recibido ? 'recibido' : 'por defecto',
      nota: campo.esSupuesto
        ? 'Supuesto editable: es un punto de partida declarado, no una recomendación de diseño.'
        : campo.ayuda,
    });
  }

  const resultado = calc.calcular(valores);
  if (resultado.invalido) {
    throw new CalculoInvalido('geometria_no_cierra', resultado.invalido, { entrada: valores });
  }

  return {
    calculo: calc.slug,
    titulo: calc.titulo,
    pregunta: calc.pregunta,
    area: calc.area,
    version: CALCULADORAS_VERSION,
    revisado: CALCULADORAS_ACTUALIZADO,
    entrada: valores,
    supuestos_aplicados: supuestos,
    resultado,
    formula: calc.formula,
    no_cubre: calc.noCubre,
  };
}

/** La advertencia que el sitio publica junto a toda calculadora. Viaja igual. */
export const ADVERTENCIA_CALCULO = ADVERTENCIA;

/**
 * El resumen en una línea que un agente puede leer en voz alta, y la nota que
 * viaja al formulario de cotización para que nadie repregunte lo que ya se
 * calculó.
 */
export function notaParaCotizacion(hecho: CalculoHecho): string {
  const principales = hecho.resultado.principales
    .map((m) => `${m.etiqueta}: ${m.valor.toFixed(m.decimales)} ${m.unidad}`)
    .join(' · ');
  const entradas = hecho.supuestos_aplicados
    .filter((s) => s.origen === 'recibido')
    .map((s) => `${s.campo}=${s.valor}${s.unidad ? ` ${s.unidad}` : ''}`)
    .join(', ');
  return [
    `Predimensionamiento «${hecho.titulo}» (${hecho.calculo}, método rev. ${hecho.revisado}).`,
    `Resultado: ${principales}.`,
    entradas ? `Datos del proyecto: ${entradas}.` : 'Calculado con los supuestos por defecto publicados.',
    'Cifra de predimensionamiento; requiere verificación con la ficha del material y las condiciones de obra.',
  ].join(' ');
}
