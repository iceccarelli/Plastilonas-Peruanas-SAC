/**
 * POLÍTICA DE RASTREADORES DE IA — dos clases con consecuencias distintas.
 *
 *  · BÚSQUEDA / RESPUESTA (retrieval): indexan para citar o abren una página
 *    cuando una persona lo pide. Traen visitas y citas con enlace. Bloquearlos
 *    es desaparecer de las respuestas de ChatGPT Search, Claude, Perplexity o
 *    Siri. Siempre permitidos.
 *  · ENTRENAMIENTO (training): copian el texto para entrenar modelos. No traen
 *    visitas directas; a cambio, el modelo puede “conocer” a la empresa y su
 *    catálogo. Decisión del propietario, no del código.
 *
 * El comportamiento por defecto NO cambia: todos permitidos (como estaba). El
 * interruptor es AI_TRAINING_CRAWLERS=block en Vercel; cualquier otro valor
 * (o ninguno) deja todo permitido. robots.txt es una petición cortés, no un
 * control de acceso: un rastreador que lo ignora (Bytespider tiene esa fama)
 * solo se detiene con una regla de cortafuegos en la plataforma.
 *
 * Recomendación (ver docs/HUMAN-GATES.md §7): mantener permitidos los de
 * búsqueda; permitir también GPTBot, ClaudeBot y Google-Extended mientras el
 * catálogo público no contenga precios ni datos de clientes —hoy no los tiene—
 * porque ahí está la oportunidad de que los modelos describan bien a la empresa;
 * y bloquear Bytespider, CCBot, cohere-ai y Meta-ExternalAgent, que no tienen
 * producto de búsqueda que devuelva visitas a un proveedor industrial peruano.
 * Es una recomendación comercial, no una verdad técnica: se revisa con datos
 * de visitas por canal (/staff/embudo).
 */
export const AGENTES_BUSQUEDA = [
  'Googlebot', 'Bingbot',
  'OAI-SearchBot', 'ChatGPT-User',
  'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User',
  'Applebot',
] as const;

export const AGENTES_ENTRENAMIENTO = [
  'GPTBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'Applebot-Extended',
  'Amazonbot', 'Bytespider', 'CCBot', 'cohere-ai', 'Meta-ExternalAgent',
] as const;

type Env = Record<string, string | undefined>;

export const bloqueaEntrenamiento = (env: Env = process.env): boolean => env.AI_TRAINING_CRAWLERS?.trim().toLowerCase() === 'block';

/** Agentes con permiso explícito de todo el sitio público. */
export function agentesPermitidos(env: Env = process.env): string[] {
  return bloqueaEntrenamiento(env) ? [...AGENTES_BUSQUEDA] : [...AGENTES_BUSQUEDA, ...AGENTES_ENTRENAMIENTO];
}

export function agentesDeEntrenamientoBloqueados(env: Env = process.env): string[] {
  return bloqueaEntrenamiento(env) ? [...AGENTES_ENTRENAMIENTO] : [];
}
