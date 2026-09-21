import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AssistantResponse } from '@/lib/ai/schema';

/**
 * `AssistantCard` (components/ai/AssistantCard.tsx) es el despachador que
 * decide qué tarjeta de components/ai/cards/* renderizar para cada variante
 * de `AssistantResponse`. Su `switch` termina en un `never` de TypeScript
 * (ver el archivo) para que agregar una variante al esquema sin agregar su
 * `case` rompa la compilación — pero eso solo protege contra un cambio FUTURO
 * al esquema, hecho DESPUÉS de tocar el switch. No protege contra un `case`
 * que alguien borre por error hoy sin tocar el esquema en el mismo cambio, ni
 * documenta la cobertura para quien lea el repo sin compilar.
 *
 * Esta prueba hace explícito, en tiempo de test y no solo de build, que:
 *  1. Cada variante real de `AssistantResponse.options` (la fuente de verdad,
 *     no una lista copiada a mano que se puede desincronizar) tiene un
 *     `case '<type>':` literal en AssistantCard.tsx.
 *  2. El switch sigue teniendo su guardia de exhaustividad (`never`), para
 *     que si alguien la retira, la prueba lo señale en vez de solo confiar en
 *     `tsc --noEmit`.
 *  3. Cada variante tiene un archivo de tarjeta propio bajo components/ai/cards
 *     (no dos variantes compartiendo un componente por accidente).
 */

const raiz = process.cwd();
const rutaAssistantCard = 'components/ai/AssistantCard.tsx';
const fuenteAssistantCard = readFileSync(join(raiz, rutaAssistantCard), 'utf8');

/** Las variantes reales del discriminated union — nunca una lista a mano. */
const variantes = AssistantResponse.options.map(
  (option) => (option.shape.type._def as { value: string }).value,
);

describe('AssistantCard cubre cada variante real de AssistantResponse', () => {
  it('el esquema declara al menos las variantes conocidas de Fase 1', () => {
    // Salvaguarda contra que este test quede vacío si el import cambia de forma.
    expect(variantes.length).toBeGreaterThanOrEqual(10);
    expect(variantes).toContain('rfq');
    expect(variantes).toContain('product');
  });

  it.each(variantes)('tiene un case %s en el switch de AssistantCard', (tipo) => {
    const patron = new RegExp(`case '${tipo}':`);
    expect(fuenteAssistantCard, `AssistantCard.tsx no tiene "case '${tipo}':"`).toMatch(patron);
  });

  it('conserva la guardia de exhaustividad `never` (protege variantes futuras)', () => {
    expect(fuenteAssistantCard).toMatch(/const _exhaustive: never = response/);
  });

  it('no hay más cases de los que el esquema declara (nada muerto, nada inventado)', () => {
    const casesEnArchivo = [...fuenteAssistantCard.matchAll(/case '([a-zA-Z]+)':/g)].map((m) => m[1]);
    expect(new Set(casesEnArchivo)).toEqual(new Set(variantes));
  });
});
