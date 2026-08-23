/**
 * AJUSTE DE TÍTULOS Y DESCRIPCIONES AL ESPACIO QUE EXISTE DE VERDAD.
 *
 * El problema, medido sobre el HTML generado: 100 de 167 títulos pasaban de 65
 * caracteres, que es donde Google recorta. Un título recortado no penaliza el
 * posicionamiento — pierde el clic, que es peor, porque lo que se recorta es
 * siempre el final, justo donde estaba lo específico.
 *
 * LA TENTACIÓN QUE ESTE ARCHIVO EVITA es truncar: cortar a 60 caracteres y
 * pegar unos puntos suspensivos. Eso produce «Tipos electrostáticos de FIBC (A,
 * B, C y…», que se lee como un error del sitio y no como una decisión.
 *
 * LO QUE HACE EN SU LUGAR: el complemento se añade SOLO SI CABE ENTERO. Un
 * término corto se lleva su explicación —«HDPE: qué es y cómo se especifica»—
 * y uno largo se queda con el nombre solo, que es completo y suficiente. Nunca
 * hay una frase partida por la mitad.
 *
 * Lo mismo con las descripciones: se van añadiendo frases COMPLETAS mientras
 * quepan, y se para. La descripción resultante siempre termina donde termina
 * una idea.
 *
 * Los presupuestos no son inventados: 65 caracteres es el punto en el que
 * Google recorta el título (mide en píxeles, ~600px, que en español ronda esa
 * cifra) y 155 el de la descripción. Se dejan como constantes con nombre para
 * que el día que cambien se cambien en un sitio.
 */

/** Lo que ocupa el sufijo de marca de la plantilla: « | Plastilonas». */
export const SUFIJO_MARCA = ' | Plastilonas'.length;

/** Punto de recorte del título en el resultado de búsqueda. */
export const MAX_TITULO = 65;

/** Espacio real para el título de la página, ya descontada la marca. */
export const PRESUPUESTO_TITULO = MAX_TITULO - SUFIJO_MARCA;

/** Punto de recorte de la descripción. */
export const MAX_DESCRIPCION = 155;

/**
 * Título con un complemento que solo entra si cabe entero.
 *
 * `base` es lo que no se negocia —el nombre del término, del producto, de la
 * ciudad—. `complemento` es lo que ayuda al clic cuando hay sitio.
 */
export function tituloAjustado(base: string, complemento?: string, presupuesto = PRESUPUESTO_TITULO): string {
  const limpio = base.trim();
  if (!complemento) return limpio;
  const completo = `${limpio}: ${complemento.trim()}`;
  return completo.length <= presupuesto ? completo : limpio;
}

/**
 * Descripción armada con frases completas, hasta donde quepa.
 *
 * Se pasan las frases en orden de importancia: la primera es la que siempre
 * sobrevive. Si ni esa cabe, se recorta por palabra —único caso— porque una
 * descripción vacía es peor que una recortada.
 */
export function descripcionAjustada(partes: (string | undefined | null)[], max = MAX_DESCRIPCION): string {
  const frases = partes.map((p) => (p ?? '').trim()).filter(Boolean);
  if (!frases.length) return '';

  let salida = '';
  for (const frase of frases) {
    const candidata = salida ? `${salida} ${frase}` : frase;
    if (candidata.length > max) break;
    salida = candidata;
  }
  return salida || recortarPorPalabra(frases[0], max);
}

/**
 * Recorte por palabra, con puntos suspensivos. Último recurso: solo cuando ni
 * la primera frase cabe. Nunca parte una palabra por la mitad.
 */
export function recortarPorPalabra(texto: string, max: number): string {
  const t = texto.trim();
  if (t.length <= max) return t;
  const corte = t.slice(0, max - 1);
  const espacio = corte.lastIndexOf(' ');
  return `${(espacio > max * 0.6 ? corte.slice(0, espacio) : corte).replace(/[.,;:\s]+$/, '')}…`;
}

/** ¿Este título cabe en el resultado de búsqueda, con la marca incluida? */
export const tituloCabe = (titulo: string): boolean => titulo.length + SUFIJO_MARCA <= MAX_TITULO;
