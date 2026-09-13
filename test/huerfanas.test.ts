import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';

/**
 * NINGUNA PÁGINA SIN UN SOLO ENLACE ENTRANTE.
 *
 * Una página a la que no llega ningún enlace del sitio sólo la encuentra quien
 * ya conoce su URL: ni un comprador que navega, ni un rastreador que sigue
 * enlaces. Da igual lo buena que sea la página — para el negocio no existe.
 *
 * scripts/auditar-estado.mjs construye el grafo de enlaces internos y sabe
 * responder esto, pero vivía sólo en `npm run seo:consistency`, que el gate de
 * entregas (scripts/aplicar-entrega.sh: typecheck, test, lint, build) NO corre.
 * Es decir: una entrega podía dejar huérfana una página comercial y pasar el
 * gate entero. Aquí se cierra esa puerta, porque `npm test` sí corre siempre.
 *
 * El auditor devuelve 1 y NOMBRA la página. Las excepciones —el retorno de la
 * pasarela, el acceso de clientes— se declaran con su motivo en
 * HUERFANAS_PERMITIDAS, dentro del propio auditor.
 */
describe('el grafo interno no deja páginas colgando', () => {
  it('ninguna ruta queda sin enlaces entrantes sin declararlo', () => {
    let salida = '';
    let codigo = 0;
    try {
      salida = execFileSync(
        'node',
        ['scripts/auditar-estado.mjs', '--check', '--no-escribir'],
        { cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
      );
    } catch (err) {
      const e = err as { status?: number; stdout?: string; stderr?: string };
      codigo = e.status ?? 1;
      salida = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    }
    expect(codigo, salida).toBe(0);
  });
});
