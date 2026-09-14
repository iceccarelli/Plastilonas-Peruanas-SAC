import { SITIO, CACHE_MINUTOS } from './config';

/**
 * EL SITIO ES LA FUENTE DE VERDAD, Y ESTE MÓDULO ES LA ÚNICA PUERTA.
 *
 * El catálogo, el glosario, la identidad de la empresa y el mapa de consultas
 * ya se publican como JSON en el sitio. Copiarlos aquí crearía una segunda
 * verdad que se desincroniza el día que alguien corrige una especificación en
 * `lib/products.ts` y se olvida de este repositorio. Se leen en vivo, se
 * cachean en memoria y se sirven con el sello de cuándo se leyeron.
 *
 * Si el sitio no responde, esta API responde 503 con el motivo. No inventa un
 * catálogo de reserva: una ficha técnica vieja servida como actual es peor que
 * un error honesto.
 */

interface Entrada {
  datos: unknown;
  leido: number;
}

const cache = new Map<string, Entrada>();

export class SitioCaido extends Error {
  constructor(public ruta: string, public causa: string) {
    super(`No se pudo leer ${ruta} del sitio: ${causa}`);
  }
}

export async function leerDelSitio<T = unknown>(ruta: string): Promise<T> {
  const ahora = Date.now();
  const guardada = cache.get(ruta);
  if (guardada && ahora - guardada.leido < CACHE_MINUTOS * 60 * 1000) {
    return guardada.datos as T;
  }

  const control = new AbortController();
  const corte = setTimeout(() => control.abort(), 8000);
  try {
    const r = await fetch(`${SITIO}${ruta}`, {
      signal: control.signal,
      headers: { accept: 'application/json', 'user-agent': 'plastilonas-api/1.0 (+servicio interno)' },
    });
    if (!r.ok) throw new SitioCaido(ruta, `HTTP ${r.status}`);
    const datos = (await r.json()) as T;
    cache.set(ruta, { datos, leido: ahora });
    return datos;
  } catch (e) {
    // Una copia vencida vale más que un 503 mientras el sitio se recupera,
    // siempre que se diga que es vencida — y se dice: `leido` viaja en la
    // respuesta de /v1/salud.
    if (guardada) return guardada.datos as T;
    throw e instanceof SitioCaido ? e : new SitioCaido(ruta, e instanceof Error ? e.message : 'desconocido');
  } finally {
    clearTimeout(corte);
  }
}

export function estadoCache(): { ruta: string; edad_segundos: number }[] {
  const ahora = Date.now();
  return [...cache.entries()].map(([ruta, e]) => ({
    ruta,
    edad_segundos: Math.round((ahora - e.leido) / 1000),
  }));
}

/* ── Formas conocidas de las superficies del sitio ───────────────────── */

export interface ProductoDelSitio {
  slug: string;
  name: string;
  url: string;
  familia: string;
  familiaUrl: string;
  descripcionCorta: string;
  descripcion: string;
  especificaciones: { nombre: string; valor: string }[];
  aplicaciones: string[];
  beneficios: string[];
  sectores: string[];
  suministro: {
    origen: string | null;
    disponibilidad: string;
    plazoReferencial: string | null;
    documentacion: string;
  };
  fichaTecnicaPdf: string;
  terminosClave: { termino: string; url: string }[];
  arquitecturas: { titulo: string; url: string }[];
}

export interface FamiliaDelSitio {
  name: string;
  slug: string;
  url: string;
  tagline: string;
  resumen: string | null;
  productos: number;
}

interface Catalogo {
  familias: FamiliaDelSitio[];
  dataset: ProductoDelSitio[];
}

export const catalogo = () => leerDelSitio<Catalogo>('/productos/catalogo.json');
export const entidad = () => leerDelSitio<Record<string, unknown>>('/entidad.json');
export const glosario = () => leerDelSitio<Record<string, unknown>>('/glosario/terminos.json');
export const mapaConsultas = () => leerDelSitio<Record<string, unknown>>('/mapa-consultas.json');

/**
 * PUNTUAR POR LO QUE DISTINGUE, NO POR LO QUE SE REPITE.
 *
 * Primera versión: cada palabra de la consulta valía lo mismo. Medido sobre el
 * catálogo real, «poza de relaves a 4100 msnm con contacto ácido» daba
 * geomembrana 5, malla antiáfidos 3, y otros seis productos empatados en 2 —
 * porque «minería» aparece como sector en media docena de fichas y sumaba
 * tanto como «relaves», que aparece en dos.
 *
 * Ahora cada palabra pesa por lo RARA que es en el catálogo: `log(N / (1+df))`.
 * «Relaves» distingue; «minería» casi no. No hay número afinado a mano: el peso
 * lo pone el propio catálogo, así que añadir productos lo recalibra solo.
 */

const campo = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const VACIAS = new Set([
  'para', 'con', 'los', 'las', 'del', 'que', 'por', 'una', 'uno', 'unos', 'unas',
  'the', 'for', 'and', 'with', 'como', 'sobre', 'desde', 'hasta', 'este',
  'esta', 'estos', 'estas', 'mas', 'muy', 'sus', 'nos', 'necesito', 'quiero',
  'busco', 'precio', 'precios', 'cotizar', 'cotizacion',
]);

const palabrasDe = (texto: string): string[] =>
  campo(texto).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !VACIAS.has(w));

/**
 * SE COMPARAN PALABRAS, NO SUBCADENAS.
 *
 * Medido: «cubrir 3 hectáreas de vivero del sol» devolvía biombos para
 * SOLdadura, porque «sol» está dentro de «soldadura». Buscar por subcadena
 * convierte cualquier palabra corta en un comodín, y el resultado se presenta
 * con la misma confianza que uno bueno.
 *
 * Se admite prefijo sólo desde cinco letras —«manga» encuentra «mangas»,
 * «geomembran» encuentra «geomembranas»—, que es donde la variante morfológica
 * deja de confundirse con la coincidencia accidental.
 */
interface Zonas { nombre: Set<string>; familia: Set<string>; cuerpo: Set<string> }

const zonasDe = (p: ProductoDelSitio): Zonas => ({
  nombre: new Set(palabrasDe(p.name)),
  familia: new Set(palabrasDe(p.familia)),
  /**
   * SE INDEXA TAMBIÉN LA DESCRIPCIÓN LARGA, QUE ES DONDE ESTÁ EL RUBRO.
   *
   * Sin ella, «poza» y «relaves» no aparecían en NINGUNA ficha del catálogo
   * —frecuencia cero— y la consulta de una poza de relaves se decidía con
   * «años», «vida» y «útil», que sí estaban en la descripción corta de media
   * docena de productos. El vocabulario técnico que un comprador usa vive en el
   * párrafo largo; dejarlo fuera era buscar en el resumen y no en el texto.
   */
  cuerpo: new Set(
    palabrasDe(
      [
        p.descripcionCorta,
        p.descripcion,
        ...p.aplicaciones,
        ...p.beneficios,
        ...p.sectores,
        ...p.especificaciones.map((e) => `${e.nombre} ${e.valor}`),
      ].join(' '),
    ),
  ),
});

function contiene(zona: Set<string>, w: string): boolean {
  if (zona.has(w)) return true;
  if (w.length < 5) return false;
  for (const palabra of zona) if (palabra.startsWith(w) || w.startsWith(palabra)) return true;
  return false;
}

/**
 * CUÁNTAS FICHAS CONTIENEN CADA PALABRA DE LA CONSULTA — contadas con la MISMA
 * regla con la que después se puntúa.
 *
 * La primera versión contaba palabras exactas y puntuaba admitiendo prefijos.
 * El efecto era el contrario del buscado: «relaves» no existía como palabra
 * exacta en ninguna ficha —frecuencia cero, peso máximo— pero sí casaba por
 * prefijo con «relave», así que la palabra más rara del catálogo valía lo mismo
 * que una inventada. Medido: una manga de ventilación encabezaba la consulta de
 * una poza de relaves.
 *
 * Se cuenta sólo sobre las palabras de la consulta, que son diez, no sobre todo
 * el vocabulario: treinta y seis fichas por diez palabras es nada.
 */
function frecuencias(productos: ProductoDelSitio[], palabras: string[]): Map<string, number> {
  const zonas = productos.map(zonasDe);
  const df = new Map<string, number>();
  for (const w of palabras) {
    let n = 0;
    for (const z of zonas) {
      if (contiene(z.nombre, w) || contiene(z.familia, w) || contiene(z.cuerpo, w)) n += 1;
    }
    df.set(w, n);
  }
  return df;
}

/**
 * Puntuación de un producto contra una consulta. `df` y `total` describen el
 * catálogo en el que se busca; sin ellos toda palabra pesa igual, que es el
 * comportamiento que se quiere en una prueba unitaria y no en producción.
 */
export function puntuar(
  p: ProductoDelSitio,
  consulta: string,
  df?: Map<string, number>,
  total = 1,
): number {
  const palabras = [...new Set(palabrasDe(consulta))];
  if (!palabras.length) return 0;
  const z = zonasDe(p);

  let puntos = 0;
  /**
   * Y UNA CONDICIÓN DE ENTRADA: al menos una palabra que DISTINGA.
   *
   * «Años», «vida» y «útil» aparecen en media docena de fichas; sumadas
   * bastaban para colar una malla antiáfidos en la consulta de una poza de
   * relaves. Un producto que sólo coincide en vocabulario genérico no es un
   * candidato: es ruido con puntuación. Se exige que alguna coincidencia venga
   * de una palabra presente en menos de un tercio del catálogo.
   */
  let discrimina = !df;
  for (const w of palabras) {
    const frecuencia = df?.get(w) ?? 0;
    const peso = df ? Math.max(0.1, Math.log(total / (1 + frecuencia))) : 1;
    const donde = contiene(z.nombre, w) ? 6 : contiene(z.familia, w) ? 3 : contiene(z.cuerpo, w) ? 1 : 0;
    if (!donde) continue;
    puntos += donde * peso;
    // `max(1, …)` para que en un catálogo pequeño —o en una prueba— el umbral
    // no caiga por debajo de uno y nada llegue a distinguir nunca.
    if (df && frecuencia <= Math.max(1, total / 3)) discrimina = true;
  }
  return discrimina ? puntos : 0;
}

/**
 * UN CANDIDATO DÉBIL PRESENTADO JUNTO A UNO FUERTE ES UN CANDIDATO FALSO.
 *
 * Un agente no lee esta lista como un ranking: la lee como opciones válidas, y
 * presenta la segunda al comprador con la misma seguridad que la primera. Por
 * eso se corta por debajo del 40 % de la mejor puntuación: preferimos devolver
 * uno que cuatro.
 */
export interface Candidato {
  producto: ProductoDelSitio;
  puntos: number;
  /** Cuánto destaca sobre el siguiente. 1 = empate técnico. */
  ventaja: number;
  /** Alguna palabra de la consulta está en el NOMBRE del producto. */
  en_nombre: boolean;
}

export function buscarConPuntaje(productos: ProductoDelSitio[], consulta: string, tope = 4): Candidato[] {
  const palabras = [...new Set(palabrasDe(consulta))];
  const df = frecuencias(productos, palabras);
  const puntuados = productos
    .map((p) => ({
      p,
      n: puntuar(p, consulta, df, productos.length),
      enNombre: palabras.some((w) => contiene(zonasDe(p).nombre, w)),
    }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  if (!puntuados.length) return [];
  const mejor = puntuados[0]!.n;
  const segundo = puntuados[1]?.n ?? 0;
  const piso = mejor * 0.55;
  return puntuados
    .filter((x) => x.n >= piso)
    .slice(0, tope)
    .map((x) => ({
      producto: x.p,
      puntos: x.n,
      ventaja: segundo > 0 ? mejor / segundo : Infinity,
      en_nombre: x.enNombre,
    }));
}

export function buscar(productos: ProductoDelSitio[], consulta: string, tope = 4): ProductoDelSitio[] {
  return buscarConPuntaje(productos, consulta, tope).map((c) => c.producto);
}

/**
 * CUÁNTO SE PUEDE FIAR UN AGENTE DE ESTA LISTA.
 *
 * Buscar sobre treinta y seis fichas cortas tiene un techo: una consulta que
 * describe CONDICIONES —«4100 msnm, contacto ácido, ocho años»— y no un
 * producto reparte la puntuación entre media docena de familias, y ningún
 * umbral separa bien. Perseguir el ranking perfecto es trabajo sin fin; decir
 * la verdad sobre la lista es trabajo de una tarde.
 *
 * Así que se declara: con certeza «baja», la primera pregunta que el agente
 * debe hacer no es la fecha de entrega, es qué se va a contener, cubrir o
 * impermeabilizar. Una lista insegura presentada como segura es exactamente
 * cómo un comprador acaba con el producto equivocado.
 */
export type Certeza = 'alta' | 'media' | 'baja';

export function certezaDe(candidatos: Candidato[]): Certeza {
  if (!candidatos.length) return 'baja';
  const mejor = candidatos[0]!;
  /**
   * DOS CONDICIONES, NO UNA: separarse del segundo no basta si nada casó bien.
   *
   * Y la medida de «casó bien» no puede ser la puntuación: el peso por rareza
   * castiga justo la palabra correcta de una familia grande —«geomembrana»
   * aparece en cuatro fichas, así que vale poco—, y «geomembrana para poza de
   * relaves», que es una consulta perfecta, sacaba menos que el umbral.
   *
   * La medida honesta es otra: ¿alguna palabra de la consulta está en el NOMBRE
   * del producto? «Geomembrana» sí. «4100 msnm contacto ácido» no toca ningún
   * nombre del catálogo, y ahí el agente no debe liderar con una familia: debe
   * preguntar qué se va a contener, cubrir o impermeabilizar.
   */
  if (!mejor.en_nombre) return 'baja';
  if (candidatos.length === 1) return 'alta';

  /**
   * LA FAMILIA PUEDE ESTAR CLARA AUNQUE EL PRODUCTO NO LO ESTÉ.
   *
   * «Geomembrana para poza de relaves» devuelve cuatro geomembranas empatadas.
   * Llamar a eso «certeza baja» sería mentir al revés: lo que hay que
   * impermeabilizar está clarísimo, y lo único abierto es qué polímero, que es
   * justo una de las variables a definir y una de las preguntas pendientes. Si
   * todos los candidatos son de la misma familia, la familia es la respuesta.
   */
  if (candidatos.every((c) => c.producto.familia === mejor.producto.familia)) return 'alta';

  const v = mejor.ventaja;
  if (v >= 1.6) return 'alta';
  if (v >= 1.15) return 'media';
  return 'baja';
}

