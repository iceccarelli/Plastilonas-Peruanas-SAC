import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  pillars, allCriteria, totalCriteria, maxScore, evidenceExists, nivel,
  FRAMEWORK_VERSION,
} from '@/lib/framework';
import { buildBriefPdf } from '@/lib/framework-brief';
import { scoreAnswers, type Answers } from '@/lib/framework-score';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';

describe('marco: integridad de los criterios', () => {
  it('hay seis pilares y todos tienen criterios', () => {
    expect(pillars).toHaveLength(6);
    for (const p of pillars) expect(p.criterios.length, p.id).toBeGreaterThanOrEqual(3);
  });

  it('los identificadores de criterio son únicos en todo el marco', () => {
    const ids = allCriteria().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cada criterio declara qué decide y qué pasa si falta el dato', () => {
    for (const c of allCriteria()) {
      expect(c.pregunta.trim().length, c.id).toBeGreaterThan(25);
      expect(c.porQue.trim().length, c.id).toBeGreaterThan(60);
      expect(c.riesgo.trim().length, c.id).toBeGreaterThan(50);
      expect([1, 2]).toContain(c.peso);
    }
  });

  it('toda evidencia citada existe realmente en el silo de guías', () => {
    // Un criterio que cita una guía inexistente es una afirmación sin respaldo.
    for (const c of allCriteria()) {
      if (c.evidencia) expect(evidenceExists(c.evidencia), `${c.id} → ${c.evidencia}`).toBe(true);
    }
  });

  it('cada pilar tiene al menos un criterio crítico', () => {
    for (const p of pillars) {
      expect(p.criterios.some((c) => c.peso === 2), p.id).toBe(true);
    }
  });

  it('el marco no se atribuye exclusividad ni vende en los criterios', () => {
    // Es útil aunque el proyecto se compre a otro: esa es la razón por la que
    // puede convertirse en referencia del rubro.
    const texto = JSON.stringify(pillars).toLowerCase();
    for (const frase of ['solo nosotros', 'únicos', 'nuestra ventaja', 'mejor que la competencia']) {
      expect(texto, frase).not.toContain(frase);
    }
    expect(texto).not.toMatch(/s\/\s?\d/);
  });
});

describe('marco: puntuación', () => {
  const todos = (v: 'si' | 'no' | 'nose'): Answers =>
    Object.fromEntries(allCriteria().map((c) => [c.id, v]));

  it('todo definido da 100% y nivel Definido', () => {
    const r = scoreAnswers(todos('si'));
    expect(r.porcentaje).toBe(100);
    expect(r.obtenido).toBe(maxScore());
    expect(r.nivel.etiqueta).toBe('Definido');
    expect(r.porPilar.every((p) => p.pendientes.length === 0)).toBe(true);
  });

  it('nada definido da 0% y lista TODOS los criterios como pendientes', () => {
    const r = scoreAnswers({});
    expect(r.porcentaje).toBe(0);
    expect(r.porPilar.reduce((n, p) => n + p.pendientes.length, 0)).toBe(totalCriteria());
  });

  it('"no lo sé" cuenta igual que "no": mide lo DEFINIDO, no el optimismo', () => {
    expect(scoreAnswers(todos('nose')).porcentaje).toBe(scoreAnswers(todos('no')).porcentaje);
  });

  it('los criterios críticos pesan el doble', () => {
    const critico = allCriteria().find((c) => c.peso === 2)!;
    const normal = allCriteria().find((c) => c.peso === 1)!;
    expect(scoreAnswers({ [critico.id]: 'si' }).obtenido).toBe(2);
    expect(scoreAnswers({ [normal.id]: 'si' }).obtenido).toBe(1);
  });

  it('los umbrales de nivel son monótonos', () => {
    expect(nivel(100).etiqueta).toBe('Definido');
    expect(nivel(70).etiqueta).toBe('Avanzado');
    expect(nivel(40).etiqueta).toBe('Preliminar');
    expect(nivel(10).etiqueta).toBe('Exploratorio');
  });
});

describe('marco: brief en PDF', () => {
  it('genera un PDF válido en cualquier nivel de respuesta', async () => {
    for (const answers of [{}, Object.fromEntries(allCriteria().map((c) => [c.id, 'si' as const]))]) {
      const bytes = await buildBriefPdf(scoreAnswers(answers), 'Proyecto de prueba', '2026-08-19');
      expect(Buffer.from(bytes.slice(0, 5)).toString('latin1')).toBe('%PDF-');
      expect(bytes.length).toBeGreaterThan(2000);
    }
  }, 30_000);

  it('pdf-lib NO viaja en la carga inicial de la evaluación', () => {
    // 210 kB de JavaScript por una descarga opcional es un impuesto que paga
    // todo el que solo quería responder las preguntas.
    const page = readFileSync(join(process.cwd(), 'app/(es)/marco/evaluacion/page.tsx'), 'utf8');
    expect(page).toContain("await import('@/lib/framework-brief')");
    expect(page).not.toMatch(/^import .*framework-brief/m);
    const score = readFileSync(join(process.cwd(), 'lib/framework-score.ts'), 'utf8');
    // Se comprueba la IMPORTACIÓN, no la prosa: el comentario del módulo
    // explica por qué está separado y debe poder nombrar la librería.
    expect(score).not.toMatch(/from ['"]pdf-lib['"]/);
  });

  it('el brief se genera en el navegador y lo dice en el pie', () => {
    const src = readFileSync(join(process.cwd(), 'lib/framework-brief.ts'), 'utf8');
    expect(src).toContain('no se enviaron a ningún servidor');
  });

  it('la evaluación no pide datos personales', () => {
    const src = readFileSync(join(process.cwd(), 'app/(es)/marco/evaluacion/page.tsx'), 'utf8');
    for (const campo of ['email', 'correo', 'telefono', 'teléfono', 'ruc']) {
      expect(src.toLowerCase(), `pide ${campo}`).not.toContain(`"${campo}"`);
    }
    expect(src).toContain('no se envían a ningún servidor');
  });
});

describe('marco: integración con el sitio', () => {
  it('el sitemap lista el marco y la evaluación', () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE.url}/marco`);
    expect(urls).toContain(`${SITE.url}/marco/evaluacion`);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('el marco está en la navegación, no solo en el sitemap', () => {
    const nav = readFileSync(join(process.cwd(), 'components/Navbar.tsx'), 'utf8');
    const footer = readFileSync(join(process.cwd(), 'components/Footer.tsx'), 'utf8');
    expect(nav).toContain("href: '/marco'");
    expect(footer).toContain("href: '/marco'");
  });

  it('llms.txt declara el marco para los agentes', () => {
    const src = readFileSync(join(process.cwd(), 'app/llms.txt/route.ts'), 'utf8');
    expect(src).toContain('Marco de Especificación');
    expect(src).toContain('/marco/evaluacion');
  });

  it('la versión del marco está declarada', () => {
    expect(FRAMEWORK_VERSION).toMatch(/^\d+\.\d+$/);
  });
});
