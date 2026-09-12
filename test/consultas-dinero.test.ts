import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  CONSULTAS_DINERO,
  consultasPorIdioma,
  palabrasDeRespuesta,
  type ConsultaDinero,
} from '@/lib/consultas-dinero';
import { clusters, clusterDeTermino, idiomaDe, intenciones } from '@/lib/search/topic-map';
import { SITE } from '@/lib/site';
import { GET as llms } from '@/app/llms.txt/route';
import { GET as mapaJson } from '@/app/mapa-consultas.json/route';

/**
 * LA RESPUESTA CORTA LA ESCRIBE ESTA EMPRESA O LA ESCRIBE EL MODELO.
 *
 * Un motor de respuestas no enlaza: extrae. Cuando no encuentra un párrafo que
 * conteste la consulta de compra, redacta uno con lo que suele ser cierto en el
 * rubro —un precio de referencia, un plazo de entrega, una ISO que nadie
 * declaró— y lo publica atribuido a esta empresa. Por eso lib/consultas-dinero.ts
 * existe, y por eso tiene esta prueba: una respuesta citable que se relaje se
 * convierte en la peor superficie del sitio, porque es la que se cita entera.
 *
 * Lo que se comprueba: que cada consulta del encargo siga cubierta, que su
 * respuesta resuelva a la misma página que el mapa de consultas, que quepa en
 * la ventana de un fragmento destacado, que traiga su límite, y que ninguna
 * haya empezado a prometer precio, plazo o certificado propio.
 */

const raiz = process.cwd();

/** Las 22 consultas de dinero del encargo. Si una deja de resolver, esto falla. */
const ENCARGO: { consulta: string; idioma: ConsultaDinero['idioma'] }[] = [
  { consulta: 'big bags FIBC a medida Perú', idioma: 'es' },
  { consulta: 'big bags para el Callao ISO 21898', idioma: 'es' },
  { consulta: 'lonas y toldos para camión Perú', idioma: 'es' },
  { consulta: 'lonas para camión Chile', idioma: 'es' },
  { consulta: 'lonas para camión Ecuador', idioma: 'es' },
  { consulta: 'mangas de ventilación minera Perú', idioma: 'es' },
  { consulta: 'geomembrana PVC para poza o canal', idioma: 'es' },
  { consulta: 'expediente que pide geomembrana HDPE', idioma: 'es' },
  { consulta: 'malla raschel antiáfida anti-granizo', idioma: 'es' },
  { consulta: 'fabricar en Perú o importar', idioma: 'es' },
  { consulta: 'EXW Lima FOB Callao textil industrial', idioma: 'es' },
  { consulta: 'fabricante de geomembranas y textil industrial en Chorrillos', idioma: 'es' },
  { consulta: 'FIBC big bags manufactured in Peru', idioma: 'en' },
  { consulta: 'truck tarpaulins from Peru', idioma: 'en' },
  { consulta: 'mine ventilation ducting Peru', idioma: 'en' },
  { consulta: 'sourcing industrial textiles from Peru', idioma: 'en' },
  { consulta: 'RFQ from an overseas buyer', idioma: 'en' },
  { consulta: 'fabricante peruano de têxteis industriais', idioma: 'pt' },
  { consulta: 'big bags sob medida no Peru', idioma: 'pt' },
  { consulta: 'exportação EXW Lima FOB Callao para o Brasil', idioma: 'pt' },
  { consulta: 'lona para caminhão', idioma: 'pt' },
  { consulta: 'dutos de ventilação para mineração', idioma: 'pt' },
];

/**
 * Lo que una respuesta citable NO puede contener. No se persiguen palabras
 * —«precio» aparece legítimamente en «no hay lista de precios»— sino
 * AFIRMACIONES: una cifra con moneda, un plazo en días, una certificación en
 * primera persona, una cobertura que no existe.
 */
const PROHIBIDO: { re: RegExp; porque: string }[] = [
  { re: /(?:S\/|US\$|USD|R\$|€)\s*\d|\b\d+(?:[.,]\d+)?\s*(?:soles|d[óo]lares|dollars|reais)\b/i, porque: 'un precio: la venta es B2B por cotización' },
  { re: /\b\d+\s*(?:d[íi]as|dias|days|semanas|weeks|semanas)\b/i, porque: 'un plazo de entrega que ningún sistema de esta empresa sostiene' },
  { re: /\b(?:somos|estamos|contamos con)\s+(?:certificad|acreditad)/i, porque: 'una certificación propia' },
  { re: /\bwe\s+are\s+(?:certified|accredited)\b/i, porque: 'una certificación propia, en inglés' },
  { re: /\b(?:somos|nossa empresa é)\s+certificad/i, porque: 'una certificación propia, en portugués' },
  { re: /\bnuestra\s+(?:certificaci[óo]n|ISO)\b/i, porque: 'una certificación propia' },
  { re: /\benv[ií]os?\s+a\s+todo\s+el\s+mundo\b|\bworldwide\s+shipping\b(?![^.]{0,60}\bno\b)/i, porque: 'envío mundial' },
  { re: /\b(?:l[íi]der|lider|leading manufacturer|n[úu]mero uno)\b/i, porque: 'un liderazgo de mercado sin estudio que lo sostenga' },
  { re: /\b(?:m[áa]s de|\+)\s*\d[\d.,]*\s*(?:clientes|empresas|obras|clients|projects)\b/i, porque: 'un recuento de clientes u obras' },
];

/** ¿Existe esta ruta como página, contando los grupos de idioma? */
function rutaExiste(ruta: string): boolean {
  const partes = ruta.replace(/^\//, '').split('/').filter(Boolean);
  for (const grupo of ['', '(es)', '(en)', '(pt)']) {
    const base = grupo ? join(raiz, 'app', grupo) : join(raiz, 'app');
    if (existsSync(join(base, ...partes, 'page.tsx'))) return true;
  }
  return false;
}

describe('consultas de dinero: integridad de la tabla', () => {
  it('cada consulta apunta a un clúster que existe', () => {
    const ids = new Set(clusters.map((c) => c.id));
    const huérfanas = CONSULTAS_DINERO.filter((c) => !ids.has(c.cluster)).map((c) => c.consulta);
    expect(huérfanas, 'una respuesta sin clúster es una respuesta sin página canónica').toEqual([]);
  });

  it('cada consulta resuelve, como término, al mismo clúster que declara', () => {
    /**
     * Ésta es la prueba que impide la deriva más probable: que alguien escriba
     * aquí una respuesta preciosa para una consulta que el mapa manda a otra
     * página. Entonces /llms.txt anuncia una URL y /mapa-consultas.json otra,
     * y el agente elige — que es exactamente lo que el mapa existe para evitar.
     */
    const desviadas = CONSULTAS_DINERO.filter((c) => clusterDeTermino(c.consulta)?.id !== c.cluster).map(
      (c) => `«${c.consulta}» → ${clusterDeTermino(c.consulta)?.id ?? 'ningún clúster'} ≠ ${c.cluster}`,
    );
    expect(desviadas, 'añada la consulta como término del clúster que la contesta').toEqual([]);
  });

  it('el idioma de la consulta es el de su clúster y el de su página', () => {
    const incoherentes: string[] = [];
    for (const c of CONSULTAS_DINERO) {
      const cluster = clusters.find((k) => k.id === c.cluster);
      if (!cluster) continue;
      if (idiomaDe(cluster) !== c.idioma) incoherentes.push(`${c.consulta}: ${idiomaDe(cluster)} ≠ ${c.idioma}`);
      const enIngles = cluster.canonica === '/en' || cluster.canonica.startsWith('/en/');
      const enPortugues = cluster.canonica === '/pt' || cluster.canonica.startsWith('/pt/');
      if (c.idioma === 'en' && !enIngles) incoherentes.push(`${c.consulta}: en inglés pero contesta ${cluster.canonica}`);
      if (c.idioma === 'pt' && !enPortugues) incoherentes.push(`${c.consulta}: en portugués pero contesta ${cluster.canonica}`);
      if (c.idioma === 'es' && (enIngles || enPortugues)) incoherentes.push(`${c.consulta}: en español pero contesta ${cluster.canonica}`);
    }
    expect(incoherentes).toEqual([]);
  });

  it('cada respuesta cabe en un fragmento destacado: 40 a 80 palabras', () => {
    const fuera = CONSULTAS_DINERO.filter((c) => palabrasDeRespuesta(c) < 40 || palabrasDeRespuesta(c) > 80).map(
      (c) => `${c.consulta}: ${palabrasDeRespuesta(c)} palabras`,
    );
    expect(fuera, 'menos de 40 no contesta; más de 80 lo resume el modelo, y al resumir redondea').toEqual([]);
  });

  it('ninguna respuesta viaja sin su límite', () => {
    const flojas = CONSULTAS_DINERO.filter((c) => c.limite.trim().split(/\s+/).length < 12).map((c) => c.consulta);
    expect(flojas, 'el límite es parte de la respuesta, no una nota al pie').toEqual([]);
  });

  it('el siguiente paso es una página que existe', () => {
    const rotas = CONSULTAS_DINERO.filter((c) => !rutaExiste(c.siguiente)).map((c) => `${c.consulta} → ${c.siguiente}`);
    expect(rotas).toEqual([]);
  });

  it('ninguna consulta se repite en el mismo idioma', () => {
    const vistas = new Map<string, number>();
    for (const c of CONSULTAS_DINERO) {
      const k = `${c.idioma}·${c.consulta.toLowerCase()}`;
      vistas.set(k, (vistas.get(k) ?? 0) + 1);
    }
    expect([...vistas.entries()].filter(([, n]) => n > 1).map(([k]) => k)).toEqual([]);
  });

  it('«corredor» está documentada como intención en el mapa', () => {
    // La intención nueva de esta etapa. Si desaparece del JSON, el mapa deja de
    // explicar por qué una consulta en inglés no la contesta el catálogo.
    expect(Object.keys(intenciones)).toContain('corredor');
  });
});

describe('consultas de dinero: nada de lo que no se puede sostener', () => {
  for (const { re, porque } of PROHIBIDO) {
    it(`ninguna respuesta ni límite contiene ${porque}`, () => {
      const hallazgos: string[] = [];
      for (const c of CONSULTAS_DINERO) {
        for (const [campo, texto] of [
          ['respuesta', c.respuesta],
          ['límite', c.limite],
        ] as const) {
          if (re.test(texto)) hallazgos.push(`${c.consulta} (${campo})`);
        }
      }
      expect(hallazgos.join('\n'), porque).toBe('');
    });
  }

  it('en las tres lenguas, el límite NIEGA algo concreto', () => {
    /**
     * Un «límite» que sólo matiza no es un límite. El comprador extranjero se
     * juega el dinero en dos puntos —qué certifica este proveedor y hasta dónde
     * entrega—, y la conducta que /confianza fija en español es decir en voz
     * alta lo que NO se afirma. Así que se exige una negación explícita, en el
     * idioma de la respuesta: es lo que un motor no puede suavizar al citar.
     */
    const NIEGA = /\b(?:no|ni|sin|ning[úu]n\w*|ninguna|n[ãa]o|sem|nenhum\w*|not|nor|neither|without)\b/i;
    for (const idioma of ['es', 'en', 'pt'] as const) {
      const lista = consultasPorIdioma(idioma);
      expect(lista.length, `${idioma} no publica ninguna consulta de dinero`).toBeGreaterThan(0);
      const tibios = lista.filter((c) => !NIEGA.test(c.limite)).map((c) => c.consulta);
      expect(tibios, `${idioma}: límites que no niegan nada`).toEqual([]);
    }
  });
});

describe('las 22 consultas del encargo siguen cubiertas', () => {
  for (const { consulta, idioma } of ENCARGO) {
    it(`«${consulta}» tiene página y respuesta`, () => {
      const cluster = clusterDeTermino(consulta);
      expect(cluster, 'el mapa de consultas no la resuelve').toBeDefined();
      const entrada = CONSULTAS_DINERO.find((c) => c.consulta === consulta);
      expect(entrada, 'no hay respuesta citable escrita para esta consulta').toBeDefined();
      expect(entrada!.idioma).toBe(idioma);
      expect(entrada!.cluster).toBe(cluster!.id);
    });
  }
});

describe('las respuestas se publican donde un agente las lee', () => {
  it('/llms.txt trae cada consulta, su respuesta, su límite y su página', async () => {
    const texto = (await (await llms()).text()).replace(/\s+/g, ' ');
    const ausentes: string[] = [];
    for (const c of CONSULTAS_DINERO) {
      const cluster = clusters.find((k) => k.id === c.cluster);
      const canonica = `${SITE.url}${cluster?.canonica ?? '/'}`;
      const norm = (t: string) => t.replace(/\s+/g, ' ').trim();
      if (!texto.includes(norm(c.consulta))) ausentes.push(`consulta: ${c.consulta}`);
      if (!texto.includes(norm(c.respuesta))) ausentes.push(`respuesta: ${c.consulta}`);
      if (!texto.includes(norm(c.limite))) ausentes.push(`límite: ${c.consulta}`);
      if (!texto.includes(canonica)) ausentes.push(`canónica: ${canonica}`);
    }
    expect(ausentes, 'una respuesta que no se publica no la cita nadie').toEqual([]);
  });

  it('/mapa-consultas.json trae las respuestas pegadas a su clúster', async () => {
    const doc = JSON.parse(await (await mapaJson()).text()) as {
      totales: { consultasConRespuesta: number };
      clusters: { id: string; idioma: string; consultas?: { consulta: string; respuesta: string; limite: string; siguiente: string }[] }[];
    };
    expect(doc.totales.consultasConRespuesta).toBe(CONSULTAS_DINERO.length);
    const publicadas = doc.clusters.flatMap((c) => c.consultas ?? []);
    expect(publicadas.length).toBe(CONSULTAS_DINERO.length);
    for (const q of publicadas) {
      expect(q.respuesta.length).toBeGreaterThan(0);
      expect(q.limite.length).toBeGreaterThan(0);
      expect(q.siguiente.startsWith(SITE.url), 'el siguiente paso se publica absoluto').toBe(true);
    }
  });

  it('cada clúster declara su idioma en el JSON', () => {
    // Un agente que copia el mapa a su índice necesita saber que «truck
    // tarpaulins from Peru» no es la traducción de «lonas para camión».
    const idiomas = new Set(clusters.map((c) => idiomaDe(c)));
    expect([...idiomas].sort()).toEqual(['en', 'es', 'pt']);
  });
});
