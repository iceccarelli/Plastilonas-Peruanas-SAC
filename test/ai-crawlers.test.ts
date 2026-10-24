import { describe, it, expect, afterEach, vi } from 'vitest';
import robots from '@/app/robots';
import { AGENTES_BUSQUEDA, AGENTES_ENTRENAMIENTO, agentesPermitidos, bloqueaEntrenamiento } from '@/lib/ai-crawlers';

/** Los 19 agentes que robots.txt permitía explícitamente antes de separar las dos clases. */
const ANTES = [
  'Googlebot', 'Bingbot', 'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai',
  'Google-Extended', 'PerplexityBot', 'Perplexity-User', 'Applebot', 'Applebot-Extended', 'Amazonbot', 'Bytespider', 'CCBot', 'cohere-ai', 'Meta-ExternalAgent',
];
const rules = () => (robots().rules as Array<{ userAgent: string; allow?: string | string[]; disallow?: string | string[] }>);

afterEach(() => vi.unstubAllEnvs());

describe('política de rastreadores de IA', () => {
  it('por defecto NADA cambia: los mismos 19 agentes, todos permitidos', () => {
    expect([...agentesPermitidos({})].sort()).toEqual([...ANTES].sort());
    const agents = rules().map((r) => r.userAgent);
    for (const a of ANTES) expect(agents, a).toContain(a);
    expect(rules().every((r) => !(Array.isArray(r.disallow) ? r.disallow : [r.disallow]).includes('/'))).toBe(true);
  });

  it('las dos clases no se solapan y juntas son los 19 de antes', () => {
    expect(AGENTES_BUSQUEDA.filter((a) => (AGENTES_ENTRENAMIENTO as readonly string[]).includes(a))).toEqual([]);
    expect(AGENTES_BUSQUEDA.length + AGENTES_ENTRENAMIENTO.length).toBe(ANTES.length);
  });

  it('AI_TRAINING_CRAWLERS=block: solo los de ENTRENAMIENTO quedan fuera; búsqueda y respuesta siguen permitidos', () => {
    vi.stubEnv('AI_TRAINING_CRAWLERS', 'block');
    const byAgent = new Map(rules().map((r) => [r.userAgent, r]));
    for (const a of AGENTES_ENTRENAMIENTO) expect(byAgent.get(a)?.disallow, a).toEqual(['/']);
    for (const a of AGENTES_BUSQUEDA) {
      const r = byAgent.get(a)!;
      expect(r.allow, a).toContain('/');
      expect(r.disallow, a).not.toContain('/');
    }
    // El comodín y Googlebot/Bingbot no se tocan: el SEO clásico sigue intacto.
    expect(byAgent.get('*')?.disallow).not.toContain('/');
  });

  it('un valor desconocido no bloquea nada (el valor por defecto manda)', () => {
    for (const v of ['', 'true', 'yes', '1', 'BLOQUEAR']) expect(bloqueaEntrenamiento({ AI_TRAINING_CRAWLERS: v }), v).toBe(false);
    expect(bloqueaEntrenamiento({ AI_TRAINING_CRAWLERS: ' BLOCK ' })).toBe(true);
  });
});
