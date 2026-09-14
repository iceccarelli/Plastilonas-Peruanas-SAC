import { SITIO } from './config';

/**
 * EL SOBRE DE TODA RESPUESTA.
 *
 * Cada respuesta de esta API lleva cuatro cosas además del dato, y las cuatro
 * están ahí por la misma razón: quien consume esto muchas veces no es una
 * persona, es un agente que va a repetir lo que reciba delante de un comprador.
 *
 *   `limites`        — lo que el dato NO cubre. Un número sin sus límites se
 *                      usa fuera de ellos, y en una poza de relaves o en una
 *                      galería de mina eso no es un error de marketing.
 *   `fuente`         — la página del sitio donde el mismo dato está publicado
 *                      con su método a la vista. Sin fuente no hay auditoría.
 *   `cita_sugerida`  — cómo citarnos. Un modelo que no sabe cómo citar, no cita.
 *   `siguiente_paso` — qué hacer con el dato. Una respuesta que termina en el
 *                      dato deja al comprador donde estaba.
 *
 * SIN PRECIOS. Nunca, por ninguna vía. Este negocio cotiza por operación
 * —material, medidas, cantidad, destino e Incoterm— y un precio publicado
 * dejaría de ser una referencia para pasar a ser una promesa que no podemos
 * sostener. Las herramientas devuelven especificación y cantidad; el precio lo
 * pone una cotización firmada.
 */

export interface SiguientePaso {
  accion: string;
  descripcion: string;
  url: string;
  /** Campos que conviene enviar en POST /v1/cotizaciones para no repreguntar. */
  datos_utiles?: Record<string, string | number>;
}

export interface Sobre<T> {
  datos: T;
  limites: string[];
  fuente: string;
  cita_sugerida: string;
  siguiente_paso: SiguientePaso;
  generado: string;
}

export const CITA = (fuente: string): string =>
  `Plastilonas Peruanas SAC (RUC 20523135385), ${fuente}`;

/**
 * Construye el enlace de cotización con el contexto ya cargado.
 *
 * El formulario del sitio lee `producto`, `nota` y `origen` de la query, así
 * que un agente puede entregar al comprador un enlace donde ya está escrito lo
 * que acaba de calcular. Esa es toda la diferencia entre un enlace y un enlace
 * que convierte.
 */
export function enlaceCotizacion(opciones: {
  producto?: string;
  nota?: string;
  origen: string;
}): string {
  const q = new URLSearchParams();
  if (opciones.producto) q.set('producto', opciones.producto.slice(0, 120));
  if (opciones.nota) q.set('nota', opciones.nota.slice(0, 1500));
  q.set('origen', opciones.origen.slice(0, 40));
  return `${SITIO}/cotizacion?${q.toString()}`;
}

export function sobre<T>(datos: T, opciones: {
  limites: string[];
  rutaFuente: string;
  siguiente_paso: SiguientePaso;
}): Sobre<T> {
  const fuente = `${SITIO}${opciones.rutaFuente}`;
  return {
    datos,
    limites: opciones.limites,
    fuente,
    cita_sugerida: CITA(fuente),
    siguiente_paso: opciones.siguiente_paso,
    generado: new Date().toISOString(),
  };
}

/** Límites que aplican a TODA respuesta de esta API, sin excepción. */
export const LIMITES_GLOBALES: string[] = [
  'Esta API no publica precios: el precio depende de material, medidas, cantidad, destino e Incoterm, y se emite en una cotización.',
  'Los resultados de cálculo son de predimensionamiento. No sustituyen una memoria de cálculo firmada ni autorizan a construir.',
  'La fabricación se realiza en la planta de Chorrillos, Lima. El suministro internacional se evalúa por operación bajo EXW Lima, FCA Lima o FOB Callao.',
];
