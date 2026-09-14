import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * EL GATE TIENE QUE SER UNA SEÑAL BINARIA.
 *
 * `scripts/aplicar-entrega.sh` es lo único que separa este repositorio de la
 * rama que se despliega: typecheck, pruebas, lint y build, y sólo después el
 * push. Vale lo que valga su capacidad de decir NO.
 *
 * DOS VECES EN ESTA MISMA SERIE DE ENTREGAS el lint pasó de cero advertencias a
 * una, y las dos veces el gate lo imprimió y empujó igual: la 0009, con una
 * dependencia que faltaba en un efecto; y la 0012, al convertir la tarjeta
 * social en manejador de ruta. Una advertencia conocida deja de leerse a la
 * segunda, y a la tercera ya no se distingue de una nueva. `--max-warnings=0`
 * convierte esa advertencia en un fallo: el gate para, y quien la introdujo la
 * arregla antes de empujar, que es cuando cuesta barato.
 */

const raiz = process.cwd();
const pkg = JSON.parse(readFileSync(join(raiz, 'package.json'), 'utf8'));
const gate = readFileSync(join(raiz, 'scripts/aplicar-entrega.sh'), 'utf8');

describe('el gate de entregas dice que no cuando toca', () => {
  it('una advertencia de lint detiene la entrega', () => {
    expect(
      pkg.scripts.lint,
      'sin --max-warnings=0 una advertencia se imprime y se empuja igual',
    ).toContain('--max-warnings=0');
  });

  it('corre las cuatro comprobaciones, y las cuatro antes del push', () => {
    // Quitar una de las cuatro es la forma barata de que un parche pase. Que
    // cueste al menos borrar una línea que dice por qué está.
    const pasos = ['npm run typecheck', 'npm test', 'npm run lint', 'npm run build'];
    for (const paso of pasos) expect(gate, `el gate ya no corre «${paso}»`).toContain(paso);
    const push = gate.indexOf('git push origin main');
    expect(push, 'el gate debe empujar').toBeGreaterThan(-1);
    for (const paso of pasos) {
      expect(gate.indexOf(paso), `«${paso}» corre después del push`).toBeLessThan(push);
    }
  });

  it('se detiene al primer fallo', () => {
    // Sin `set -e`, un typecheck en rojo imprime el error y el script sigue
    // hasta el push como si nada.
    expect(gate).toMatch(/^set -euo pipefail$/m);
  });
});
