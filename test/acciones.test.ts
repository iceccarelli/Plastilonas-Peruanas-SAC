import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ACCIONES, ACCIONES_EN, WHATSAPP_LABEL, ETIQUETAS_CANONICAS, mensajeWhatsApp } from '@/lib/acciones';

/**
 * UN BOTÓN, UN NOMBRE, UN GRUPO.
 *
 * El botón que abre el RFQ estaba escrito de ocho maneras —«Solicitar
 * cotización», «Solicitar Cotización», «Cotizar ahora», «Solicitar Cotización
 * Personalizada»…— y la tarjeta azul que cierra las páginas estaba copiada y
 * pegada en quince archivos, cada uno con sus clases. Ninguna de las quince en
 * español ofrecía WhatsApp, que es por donde entra la mayoría de las consultas
 * comerciales en el Perú, y ninguna declaraba contexto de atribución: seis
 * eventos distintos que no se podían sumar.
 *
 * Para un comprador industrial que recorre cinco páginas antes de escribir, eso
 * es una puerta distinta en cada habitación. Aquí se fija lo contrario: el
 * vocabulario vive en lib/acciones.ts, la agrupación en
 * components/CierreComercial.tsx, y las páginas deciden qué dicen y a dónde
 * llevan — que es lo suyo.
 */

const raiz = process.cwd();
const TARJETA = 'rounded-3xl bg-[#0A2540] p-10 text-center text-white';

/**
 * Quién puede seguir pintando la tarjeta a mano, y por qué.
 *
 * LA LISTA ERA MÁS LARGA Y EL MOTIVO ERA FALSO. La entrega 0007 declaró aquí
 * CunaHubEn y FabricarOImportar como «componentes de cliente» que no podían
 * renderizar uno de servidor. No lo son: ninguno declara 'use client'. La
 * excepción se escribió sin comprobarla, y una excepción sin comprobar es una
 * regla que se afloja sola. Los dos están migrados.
 *
 * Queda una, y ésta sí lo es: /marco/evaluacion corre en el navegador porque
 * la autoevaluación calcula y descarga el brief sin enviar nada al servidor.
 */
const PINTAN_TARJETA: Record<string, string> = {
  'components/CierreComercial.tsx': 'es el componente',
  'app/(es)/marco/evaluacion/page.tsx': "página de cliente ('use client'): la evaluación vive en el navegador",
};

/** El título de /cotizacion no es un botón: es el nombre de la página. */
const TITULOS_DE_PAGINA = ['app/(es)/cotizacion/layout.tsx'];

function fuentes(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) fuentes(rel, out);
    else if (/\.tsx?$/.test(e.name)) out.push(rel);
  }
  return out;
}

/**
 * ¿Existe esta ruta como página? Cuenta los grupos de idioma —(es), (en),
 * (pt)— y las plantillas dinámicas: /informes/<slug> lo sirve
 * app/(es)/informes/[slug]/page.tsx, y un destino así es tan real como uno
 * literal.
 */
function rutaExiste(href: string): boolean {
  const partes = href.split('?')[0].replace(/^\//, '').split('/').filter(Boolean);
  const grupos = ['', '(es)', '(en)', '(pt)'];
  for (const g of grupos) {
    if (existsSync(join(raiz, 'app', g, ...partes, 'page.tsx'))) return true;
    if (partes.length > 1) {
      const padre = join(raiz, 'app', g, ...partes.slice(0, -1));
      if (existsSync(padre)) {
        const dinamica = readdirSync(padre, { withFileTypes: true }).find(
          (e) => e.isDirectory() && e.name.startsWith('['),
        );
        if (dinamica && existsSync(join(padre, dinamica.name, 'page.tsx'))) return true;
      }
    }
  }
  return false;
}

const archivos = [...fuentes('app'), ...fuentes('components')];

/** Líneas que el usuario ve: sin comentarios, que explican y no muestran. */
function lineasServibles(rel: string): { n: number; texto: string }[] {
  return readFileSync(join(raiz, rel), 'utf8')
    .split('\n')
    .map((texto, i) => ({ n: i + 1, texto }))
    .filter(({ texto }) => {
      const t = texto.trim();
      return !(t.startsWith('*') || t.startsWith('//') || t.startsWith('/*') || t.startsWith('{/*'));
    });
}

describe('el vocabulario comercial tiene una sola fuente', () => {
  for (const etiqueta of ETIQUETAS_CANONICAS) {
    it(`«${etiqueta}» no se escribe a mano fuera de lib/acciones.ts`, () => {
      const hallazgos: string[] = [];
      for (const f of archivos) {
        if (TITULOS_DE_PAGINA.includes(f)) continue;
        for (const { n, texto } of lineasServibles(f)) {
          /**
           * Se busca la etiqueta COMPLETA, no la subcadena. «Ver catálogo
           * completo →» es otra etiqueta, de otro sitio del pie, y perseguirla
           * por contener «Ver catálogo» obligaría a renombrarla para pasar la
           * prueba — que es como se debilita una regla buena.
           */
          const t = texto.trim();
          const literal =
            t === etiqueta ||
            texto.includes(`>${etiqueta}<`) ||
            texto.includes(`'${etiqueta}'`) ||
            texto.includes(`"${etiqueta}"`);
          if (literal) hallazgos.push(`${f}:${n}`);
        }
      }
      expect(
        hallazgos.join('\n'),
        'use ACCIONES / ACCIONES_EN / WHATSAPP_LABEL de lib/acciones.ts',
      ).toBe('');
    });
  }

  it('cada acción declarada apunta a una página que existe', () => {
    const rotas = [...Object.values(ACCIONES), ...Object.values(ACCIONES_EN)]
      .map((a) => a.href)
      .filter((href) => !rutaExiste(href));
    expect(rotas, 'una acción no puede llevar a una ruta que no existe').toEqual([]);
  });

  it('el mensaje de WhatsApp pide los cuatro datos que una cotización necesita', () => {
    // Un «Hola» se responde con otra pregunta. Este mensaje llega con los
    // huecos puestos, y el comprador los rellena antes de enviar.
    for (const idioma of ['es', 'en'] as const) {
      const m = mensajeWhatsApp('prueba', idioma);
      expect(m).toContain('___');
      expect(m.match(/___/g)?.length ?? 0).toBeGreaterThanOrEqual(4);
    }
    expect(WHATSAPP_LABEL.es).not.toBe(WHATSAPP_LABEL.en);
  });
});

describe('la tarjeta que cierra una página vive en un solo archivo', () => {
  it('ningún otro archivo la vuelve a maquetar', () => {
    const intrusos = archivos
      .filter((f) => !(f in PINTAN_TARJETA))
      .filter((f) => readFileSync(join(raiz, f), 'utf8').includes(TARJETA));
    expect(
      intrusos,
      'use <CierreComercial>; si de verdad no puede, declare el archivo en PINTAN_TARJETA con su motivo',
    ).toEqual([]);
  });

  it('cada uso declara su contexto de atribución', () => {
    const sinContexto: string[] = [];
    for (const f of archivos) {
      const src = readFileSync(join(raiz, f), 'utf8');
      for (const m of src.matchAll(/<CierreComercial\b([\s\S]*?)>/g)) {
        // Vale el literal —contexto="recursos"— y vale la expresión
        // —contexto={`cuna-en-final:${cuna.slug}`}—, que es como lo declaran
        // los bloques que sirven varias páginas con la misma plantilla.
        if (!/\bcontexto=("|\{)/.test(m[1])) sinContexto.push(f);
      }
    }
    expect(sinContexto, 'sin contexto, el clic de WhatsApp no dice de qué página salió').toEqual([]);
  });

  it('los destinos literales de cada bloque existen', () => {
    const rotos: string[] = [];
    for (const f of archivos) {
      const src = readFileSync(join(raiz, f), 'utf8');
      for (const m of src.matchAll(/<CierreComercial\b([\s\S]*?)\n\s*>/g)) {
        for (const h of m[1].matchAll(/href:\s*"([^"]+)"/g)) {
          if (!rutaExiste(h[1])) rotos.push(`${f} → ${h[1]}`);
        }
      }
    }
    expect(rotos).toEqual([]);
  });

  it('los dos botones del grupo alcanzan el objetivo táctil de 44 px', () => {
    // WCAG 2.5.8. La versión copiada y pegada no lo declaraba en ninguna de
    // las quince páginas: los botones medían 3.5rem por el padding, y eso
    // dependía de que nadie tocara el padding.
    const src = readFileSync(join(raiz, 'components/CierreComercial.tsx'), 'utf8');
    const clases = [...src.matchAll(/const (PRIMARIO|SECUNDARIO) =\s*'([^']+)'/g)].map((m) => m[2]);
    expect(clases.length, 'no se encontraron las dos clases del grupo').toBe(2);
    for (const c of clases) expect(c).toContain('min-h-[44px]');
  });

  it('el grupo se anuncia como grupo', () => {
    const src = readFileSync(join(raiz, 'components/CierreComercial.tsx'), 'utf8');
    expect(src).toContain('role="group"');
    expect(src).toMatch(/aria-label=/);
  });
});
