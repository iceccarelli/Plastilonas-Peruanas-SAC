import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  afirmaciones,
  afirmacion,
  valorDe,
  permitidaEn,
  hechosCitables,
} from '@/lib/content/claims';
import { SITE } from '@/lib/site';
import { PRODUCT_COUNT, FAMILY_COUNT, YEARS_OPERATING } from '@/lib/facts';
import { projectsPublicados } from '@/lib/projects';

/**
 * LA LISTA BLANCA, FRENTE A LA LISTA NEGRA DE afirmaciones.test.ts.
 *
 * Aquella prueba persigue seis mentiras conocidas. Ésta comprueba lo contrario:
 * que toda cifra que el sitio SÍ publica sobre sí mismo esté registrada, tenga
 * un origen escrito, tenga una fecha de verificación, y —sobre todo— que su
 * valor siga saliendo de la fuente de verdad y no de una copia escrita a mano
 * en una página.
 *
 * El fallo que esto impide es aburrido y por eso ocurre: alguien escribe «36
 * soluciones» en una página nueva, tres meses después el catálogo tiene 38, y
 * la página sigue diciendo 36. No es una mentira: es una cifra desincronizada,
 * que para quien homologa a un proveedor se lee exactamente igual.
 */

const raiz = process.cwd();

/** Archivos de texto servibles al usuario. Se excluyen las fuentes de verdad. */
const EXENTOS = [
  'lib/site.ts',
  'lib/facts.ts',
  'lib/products.ts',
  'lib/families.ts',
  'lib/industrias.ts',
  'lib/glosario.ts',
  'lib/guides.ts',
  'lib/projects.ts',
  'lib/content/claims.ts',
  'data/topic-map.json',
];

function fuentes(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) fuentes(rel, out);
    else if (/\.(ts|tsx|json)$/.test(e.name) && statSync(join(raiz, rel)).size < 2_000_000) out.push(rel);
  }
  return out;
}

const archivos = [...fuentes('app'), ...fuentes('components'), ...fuentes('lib'), ...fuentes('data')].filter(
  (f) => !EXENTOS.includes(f),
);

/** Líneas de código servible: sin comentarios, que explican y no afirman. */
function lineasServibles(rel: string): { n: number; texto: string }[] {
  return readFileSync(join(raiz, rel), 'utf8')
    .split('\n')
    .map((texto, i) => ({ n: i + 1, texto }))
    .filter(({ texto }) => {
      const t = texto.trim();
      return !(t.startsWith('*') || t.startsWith('//') || t.startsWith('{/*') || t.startsWith('/*'));
    });
}

describe('registro de afirmaciones: integridad', () => {
  it('no hay ids repetidos', () => {
    const ids = afirmaciones.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cada afirmación declara fuente, comprobabilidad y fecha de verificación', () => {
    const incompletas = afirmaciones
      .filter((a) => !a.fuente.trim() || !a.que.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(a.verificadoEl))
      .map((a) => a.id);
    expect(incompletas).toEqual([]);
  });

  it('ninguna fecha de verificación está en el futuro', () => {
    const hoy = new Date().toISOString().slice(0, 10);
    const futuras = afirmaciones.filter((a) => a.verificadoEl > hoy).map((a) => `${a.id}: ${a.verificadoEl}`);
    expect(futuras, 'una fecha de verificación futura no es una verificación').toEqual([]);
  });

  it('ninguna afirmación devuelve un valor vacío', () => {
    const vacias = afirmaciones.filter((a) => !String(a.valor() ?? '').trim()).map((a) => a.id);
    expect(vacias).toEqual([]);
  });

  it('pedir una afirmación no registrada es un error, no un hueco silencioso', () => {
    expect(() => afirmacion('metros-instalados')).toThrow(/no registrada/i);
  });

  /**
   * EL REGISTRO NO PUEDE CONTENER LO QUE NO SE PUEDE COMPROBAR. Si algún día
   * alguien intenta registrar «clientes atendidos» o «toneladas despachadas»,
   * la conversación que hay que tener es de dónde sale ese número — y esta
   * prueba la fuerza antes de que la cifra llegue a producción.
   */
  it('el registro no admite recuentos que esta empresa no puede sostener', () => {
    const PROHIBIDOS = [
      /clientes?/i, /obras? (ejecutad|entregad)/i, /toneladas/i, /metros (cuadrados )?instalados/i,
      /a[ñn]os de garant[ií]a/i, /plazo de entrega/i, /satisfacci[óo]n/i,
    ];
    const culpables = afirmaciones
      .filter((a) => PROHIBIDOS.some((re) => re.test(a.id) || re.test(a.que)))
      .map((a) => `${a.id}: ${a.que}`);
    expect(culpables, 'una cifra sin sistema detrás no se registra: se retira').toEqual([]);
  });
});

describe('registro de afirmaciones: los valores salen de la fuente, no de una copia', () => {
  it('el año de fundación es el de lib/site.ts', () => {
    expect(valorDe('anio-fundacion')).toBe(SITE.foundingYear);
  });

  it('el RUC es el de lib/site.ts y tiene once dígitos', () => {
    expect(valorDe('ruc')).toBe(SITE.ruc);
    expect(valorDe('ruc')).toMatch(/^\d{11}$/);
  });

  it('los conteos se derivan del catálogo vivo', () => {
    expect(valorDe('productos')).toBe(String(PRODUCT_COUNT));
    expect(valorDe('familias')).toBe(String(FAMILY_COUNT));
    expect(valorDe('anios-operando')).toBe(String(YEARS_OPERATING));
  });

  it('el conteo de proyectos publicados cuenta sólo los confirmados', () => {
    expect(valorDe('proyectos-publicados')).toBe(String(projectsPublicados.length));
  });
});

describe('ninguna cifra registrada está escrita a mano en una página', () => {
  /**
   * Se persiguen las FORMAS de escribir la cifra, no los dígitos sueltos: «36»
   * aparece legítimamente en un gramaje, en un mesh y en una medida. Lo que no
   * puede aparecer es «36 soluciones».
   */
  const FORMAS: { re: RegExp; afirmacion: string; porque: string }[] = [
    {
      re: /\b\d{1,3}\s+soluciones\b/i,
      afirmacion: 'productos',
      porque: 'use COUNT_STATEMENT de lib/facts.ts',
    },
    {
      re: /\b\d{1,3}\s+(l[ií]neas de producto|familias de producto)\b/i,
      afirmacion: 'familias',
      porque: 'use FAMILY_COUNT de lib/facts.ts',
    },
    {
      re: /\b\d{1,2}\s+a[ñn]os\s+(de\s+)?(experiencia|trayectoria|operaci[óo]n|en el mercado)\b/i,
      afirmacion: 'anios-operando',
      porque: 'use YEARS_STATEMENT de lib/facts.ts',
    },
    {
      re: /\b\d{1,3}\s+t[ée]rminos\s+(del\s+)?glosario\b/i,
      afirmacion: 'glosario',
      porque: 'derive el conteo de lib/glosario.ts',
    },
    {
      re: /\b\d{1,3}\s+gu[ií]as\b/i,
      afirmacion: 'guias',
      porque: 'derive el conteo de lib/guides.ts',
    },
    {
      re: /\b\d{1,3}\s+(hubs?\s+)?sectoriales\b/i,
      afirmacion: 'sectores',
      porque: 'derive el conteo de lib/industrias.ts',
    },
  ];

  for (const { re, afirmacion: id, porque } of FORMAS) {
    it(`«${id}» no aparece escrita a mano (${porque})`, () => {
      const hallazgos: string[] = [];
      for (const f of archivos) {
        for (const { n, texto } of lineasServibles(f)) {
          if (re.test(texto)) hallazgos.push(`${f}:${n}  ${texto.trim().slice(0, 130)}`);
        }
      }
      expect(hallazgos.join('\n'), porque).toBe('');
    });
  }

  it('el año de fundación no se repite a mano fuera de lib/site.ts', () => {
    const re = new RegExp(`(fabricaci[óo]n|fabricando|operando|operamos|fundad\\w+|constituid\\w+|en el mercado)[^.\\n]{0,40}desde\\s+${SITE.foundingYear}\\b`, 'i');
    const hallazgos: string[] = [];
    for (const f of archivos) {
      for (const { n, texto } of lineasServibles(f)) {
        if (re.test(texto)) hallazgos.push(`${f}:${n}  ${texto.trim().slice(0, 130)}`);
      }
    }
    expect(
      hallazgos.join('\n'),
      'la antigüedad se publica con YEARS_STATEMENT: el día que cambie el año de constitución, cambia sola',
    ).toBe('');
  });
});

describe('contextos: un dato no se usa de adorno fuera de su sitio', () => {
  it('los datos de identidad valen en cualquier página', () => {
    expect(permitidaEn('ruc', '/productos/big-bags-bolsones-polipropileno')).toBe(true);
    expect(permitidaEn('anio-fundacion', '/')).toBe(true);
  });

  it('los conteos internos NO valen en cualquier página', () => {
    expect(permitidaEn('clusters-consulta', '/')).toBe(false);
    expect(permitidaEn('proyectos-publicados', '/nosotros')).toBe(false);
    expect(permitidaEn('proyectos-publicados', '/proyectos')).toBe(true);
  });
});

describe('bloque de hechos citables', () => {
  const hechos = hechosCitables('/productos/big-bags-bolsones-polipropileno', '/productos/big-bags-bolsones-polipropileno');

  it('trae entidad, RUC, ubicación y canonical', () => {
    expect(hechos.entidad).toBe(SITE.legalName);
    expect(hechos.ruc).toBe(SITE.ruc);
    expect(hechos.ubicacion).toContain(SITE.addressLocality);
    expect(hechos.canonical).toBe('/productos/big-bags-bolsones-polipropileno');
  });

  it('cada hecho citable lleva su fuente y su fecha, nunca suelto', () => {
    expect(hechos.afirmaciones.length).toBeGreaterThan(0);
    for (const a of hechos.afirmaciones) {
      expect(a.fuente.length, `${a.id} sin fuente`).toBeGreaterThan(0);
      expect(a.verificadoEl).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('no filtra a una ficha de producto los conteos internos del sitio', () => {
    const ids = hechos.afirmaciones.map((a) => a.id);
    expect(ids).not.toContain('clusters-consulta');
    expect(ids).not.toContain('proyectos-publicados');
  });
});
