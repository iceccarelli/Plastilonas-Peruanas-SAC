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
 * BÚSQUEDA DE PRODUCTO POR TEXTO LIBRE.
 *
 * Un agente no pregunta por slug: pregunta «geomembrana HDPE para poza» o
 * «bolsas para concentrado de cobre». Se puntúa contra nombre, familia,
 * aplicaciones, sectores y especificaciones, y se devuelve lo que empata, no
 * lo más parecido a cualquier precio: un cero resultados honesto es mejor que
 * un producto que no era.
 */
const VACIAS = new Set([
  'para', 'con', 'los', 'las', 'del', 'que', 'por', 'una', 'uno', 'unos', 'unas',
  'the', 'for', 'and', 'with', 'que', 'como', 'sobre', 'desde', 'hasta', 'este',
  'esta', 'estos', 'estas', 'mas', 'muy', 'sus', 'nos', 'necesito', 'quiero',
  'busco', 'precio', 'precios', 'cotizar', 'cotizacion',
]);

export function puntuar(p: ProductoDelSitio, consulta: string): number {
  const q = consulta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  /**
   * Las palabras vacías se descartan antes de puntuar. Sin esto, «bolsas PARA
   * concentrado de cobre» devolvía mantas para camiones: el «para» de la
   * descripción sumaba tanto como una coincidencia real. Un agente que recibe
   * el producto equivocado lo repite con la misma seguridad que el correcto.
   */
  const palabras = [...new Set(q.split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !VACIAS.has(w)))];
  if (!palabras.length) return 0;

  const campo = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const nombre = campo(p.name);
  const familia = campo(p.familia);
  const cuerpo = campo(
    [p.descripcionCorta, ...p.aplicaciones, ...p.sectores, ...p.especificaciones.map((e) => `${e.nombre} ${e.valor}`)].join(' '),
  );

  let puntos = 0;
  for (const w of palabras) {
    if (nombre.includes(w)) puntos += 6;
    else if (familia.includes(w)) puntos += 3;
    else if (cuerpo.includes(w)) puntos += 1;
  }
  return puntos;
}

export function buscar(productos: ProductoDelSitio[], consulta: string, tope = 5): ProductoDelSitio[] {
  return productos
    .map((p) => ({ p, n: puntuar(p, consulta) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, tope)
    .map((x) => x.p);
}
