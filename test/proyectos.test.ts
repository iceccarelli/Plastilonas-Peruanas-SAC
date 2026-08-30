import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { projects, projectsPublicados } from '../lib/projects';
import { INDUSTRIAS } from '../lib/industrias';
import { applications } from '../lib/applications';
import { guides } from '../lib/guides';

const raiz = process.cwd();

describe('evidencia de proyecto', () => {
  it('ninguna ficha se publica sin verificar', () => {
    const filtradas = projectsPublicados.filter((p) => !p.verificado);
    expect(filtradas).toEqual([]);
    expect(projectsPublicados.length).toBeLessThanOrEqual(projects.length);
  });

  it('la página lee projectsPublicados, nunca el array crudo', () => {
    const src = readFileSync(join(raiz, 'app/(es)/proyectos/page.tsx'), 'utf8');
    expect(src).toContain('projectsPublicados');
    expect(src).not.toMatch(/import\s*\{[^}]*\bprojects\b[^}]*\}\s*from\s*'@\/lib\/projects'/);
  });

  it('una ficha verificada no puede llevar cliente de marcador', () => {
    for (const p of projectsPublicados) {
      expect(p.client.trim().length, `${p.slug} sin cliente`).toBeGreaterThan(0);
      expect(p.result).not.toMatch(/lorem|TODO|pendiente/i);
    }
  });
});

describe('vocabulario sectorial único', () => {
  const validos = new Set(INDUSTRIAS.map((i) => i.slug));

  it('todo industrySlug de proyectos existe en lib/industrias.ts', () => {
    const huerfanos = projects.map((p) => p.industrySlug).filter((s) => !validos.has(s));
    expect(huerfanos, `sectores inexistentes: ${huerfanos.join(', ')}`).toEqual([]);
  });

  it('todo industrySlugs de aplicaciones y guías existe en lib/industrias.ts', () => {
    const todos = [
      ...applications.flatMap((a) => a.industrySlugs),
      ...guides.flatMap((g) => g.industrySlugs),
    ];
    const huerfanos = [...new Set(todos.filter((s) => !validos.has(s)))];
    expect(huerfanos, `sectores inexistentes: ${huerfanos.join(', ')}`).toEqual([]);
  });
});
