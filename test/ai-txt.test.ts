import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { GET as aiTxt } from '@/app/ai.txt/route';
import { GET as llms } from '@/app/llms.txt/route';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { SITE, HORARIO } from '@/lib/site';
import { products } from '@/lib/products';
import { guides } from '@/lib/guides';
import { calculadoras } from '@/lib/calculadoras';
import {
  SUPERFICIES_MAQUINA,
  SUPERFICIES_INDEXABLES,
  SUPERFICIES_NO_INDEXABLES,
} from '@/lib/superficies-maquina';

/**
 * /ai.txt Y LOS PERMISOS EXPLÍCITOS DE LAS SUPERFICIES PARA MÁQUINAS.
 *
 * /ai.txt estuvo prometido y respondió 404 durante semanas: la ficha de
 * identidad que un motor de respuesta necesita para citar sin inventar,
 * sencillamente no existía. Y las superficies que sí existían (/llms.txt,
 * /entidad.json, los catálogos JSON) estaban permitidas solo por accidente:
 * las salvaba el «Allow: /» genérico, no una decisión escrita.
 *
 * Estas pruebas fijan las tres condiciones que una superficie para máquinas
 * debe cumplir A LA VEZ: responder (route handler real), estar anunciada
 * (llms.txt / sitemap) y estar permitida explícitamente (robots.txt, para
 * todos los agentes nombrados). Una URL que falla cualquiera de las tres es
 * una promesa rota, y un agente que tropieza con una promesa rota descuenta
 * el resto del grafo.
 */

async function cuerpo(): Promise<string> {
  return await (await aiTxt()).text();
}

describe('/ai.txt responde y dice la verdad', () => {
  it('responde 200, texto plano, indexable', async () => {
    const res = await aiTxt();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
    expect(res.headers.get('X-Robots-Tag')).toBe('all');
  });

  it('lleva la identidad completa: nombre, RUC, teléfonos, planta, horario', async () => {
    const t = await cuerpo();
    for (const dato of [
      SITE.legalName,
      SITE.ruc,
      SITE.phoneCentral,
      SITE.phoneWhatsApp,
      SITE.email,
      SITE.addressStreet,
      SITE.addressLocality,
      HORARIO.completo,
      SITE.url,
    ]) {
      expect(t, `ai.txt dejó de declarar: ${dato}`).toContain(dato);
    }
  });

  it('declara la fundación oficial y desmiente la fecha errónea de terceros', async () => {
    const t = await cuerpo();
    expect(t).toContain(`Fundación: ${SITE.foundingYear}`);
    // El desmentido de «2007» es contenido, no adorno: es la fecha que circula
    // en un perfil de terceros y que un agente copiaría sin este párrafo.
    expect(t).toContain('2007');
    expect(t).toMatch(/2007[^.]*incorrecta/);
  });

  it('no declara la mudanza de dominio como hecha antes de que ocurra', async () => {
    const t = await cuerpo();
    const migrado = new URL(SITE.url).host.replace(/^www\./, '') === SITE.brandHost;
    if (!migrado) {
      expect(t, 'mientras el sitio viva en Vercel, ai.txt debe decirlo').toContain('no ocurrió');
      expect(t).toContain(SITE.brandHost);
    }
  });

  it('publica los límites: sin certificaciones propias, sin precios, sin obras, sin envío mundial', async () => {
    const t = (await cuerpo()).replace(/\s+/g, ' ');
    for (const limite of [
      'ISO, ASTM, CE, UL',
      'No hay envío mundial',
      'NO hay lista pública de precios',
      'ninguna es fotografía de una obra ejecutada',
      'predimensionamiento',
    ]) {
      expect(t, `ai.txt dejó de declarar el límite: ${limite}`).toContain(limite);
    }
  });

  it('no publica ningún precio, porque no existe lista', async () => {
    const t = await cuerpo();
    expect(/S\/\s?\d/.test(t), 'apareció un precio en soles').toBe(false);
    expect(/USD\s?\d/.test(t), 'apareció un precio en dólares').toBe(false);
  });

  it('cada URL de producto que cita existe en el catálogo', async () => {
    const t = await cuerpo();
    const slugs = [...t.matchAll(/\/productos\/([a-z0-9-]+)/g)]
      .map((m) => m[1])
      .filter((s) => s !== 'familia' && s !== 'catalogo');
    expect(slugs.length).toBeGreaterThan(0);
    const vivos = new Set(products.map((p) => p.slug));
    const rotos = slugs.filter((s) => !vivos.has(s));
    expect(rotos, 'ai.txt promete fichas que no existen').toEqual([]);
  });

  it('toda URL absoluta que emite cuelga del origen canónico', async () => {
    const t = await cuerpo();
    const urls = [...t.matchAll(/https?:\/\/[^\s)"]+/g)].map((m) => m[0]);
    const ajenas = urls.filter(
      (u) => !u.startsWith(SITE.url) && !SITE.sameAs.some((s) => u.startsWith(s)),
    );
    expect(ajenas, 'ai.txt emite hosts que no son ni el canónico ni un perfil verificado').toEqual([]);
  });
});

describe('las superficies para máquinas cumplen sus tres condiciones', () => {
  it('cada superficie declarada tiene su route handler: anunciar un 404 es peor que callar', () => {
    const sinRuta = SUPERFICIES_MAQUINA.filter(
      (p) => !existsSync(join(process.cwd(), 'app', p.replace(/^\//, ''), 'route.ts')),
    );
    expect(sinRuta).toEqual([]);
  });

  it('llms.txt anuncia /ai.txt', async () => {
    const t = await (await llms()).text();
    expect(t).toContain(`${SITE.url}/ai.txt`);
  });

  it('robots.txt permite explícitamente cada superficie, para * y para cada agente nombrado', () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    expect(rules.length).toBeGreaterThan(1);
    for (const rule of rules) {
      const allow = Array.isArray(rule.allow) ? rule.allow : [rule.allow];
      for (const p of SUPERFICIES_MAQUINA) {
        expect(allow, `${String(rule.userAgent)} no permite explícitamente ${p}`).toContain(p);
      }
    }
  });

  it('el sitemap declara las superficies indexables y NO las noindex', () => {
    const urls = new Set(sitemap().map((e) => e.url));
    for (const p of SUPERFICIES_INDEXABLES) {
      expect(urls.has(`${SITE.url}${p}`), `el sitemap no declara ${p}`).toBe(true);
    }
    for (const p of SUPERFICIES_NO_INDEXABLES) {
      expect(urls.has(`${SITE.url}${p}`), `${p} es noindex: declararlo en el sitemap es contradecirse`).toBe(false);
    }
  });
});

describe('llms.txt: las tres preguntas de especificador apuntan a URLs vivas', () => {
  it('cada guía y calculadora citada en el bloque de preguntas existe en su fuente', async () => {
    const t = await (await llms()).text();
    expect(t).toContain('## Tres preguntas que este sitio responde mejor que un directorio');
    const guiaSlugs = new Set(guides.map((g) => g.slug));
    for (const s of ['especificacion-fibc', 'seleccion-geomembrana', 'seleccion-mangas-ventilacion']) {
      expect(guiaSlugs.has(s), `la guía ${s} ya no existe: actualice el bloque de preguntas`).toBe(true);
      expect(t).toContain(`${SITE.url}/biblioteca/${s}`);
    }
    expect(new Set(calculadoras.map((c) => c.slug)).has('geomembrana-poza')).toBe(true);
  });

  it('anuncia las nueve URLs comerciales canónicas', async () => {
    const t = await (await llms()).text();
    expect(t).toContain('## URLs comerciales canónicas');
    for (const ruta of [
      '/productos/big-bags-bolsones-polipropileno',
      '/productos/lona-plastificada-rafia-polytarp',
      '/productos/mantas-cobertores-toldos-camiones',
      '/productos/geomembranas-pvc',
      '/productos/geomembrana-polietileno-pe-hdpe',
      '/productos/mangas-ventilacion-minas-tuneles',
      '/productos/carpas-lona-estructuras-metalicas',
      '/servicios',
      '/cotizacion',
    ]) {
      expect(t).toContain(`${SITE.url}${ruta}`);
    }
  });
});
