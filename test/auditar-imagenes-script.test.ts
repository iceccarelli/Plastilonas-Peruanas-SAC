import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';

/**
 * /OG.PNG ES UNA RUTA GENERADA, NO UN ARCHIVO ROTO.
 *
 * `scripts/auditar-imagenes.mjs` escanea el código en busca de rutas con
 * pinta de imagen y comprueba que existan en `public/`. `/og.png` (citada en
 * lib/meta.ts, OG_IMAGEN) no vive ahí: la sirve `app/og.png/route.tsx` en
 * tiempo de petición, tal como documenta lib/meta.ts. Sin distinguir ese
 * caso, el auditor marcaba como rota una imagen que el sitio sirve de
 * verdad, y `npm run auditar:imagenes` — que corre en CI — quedaba rojo
 * permanentemente por un falso positivo, no por un defecto real.
 *
 * Esta prueba ejecuta el script de verdad (necesita `public/` y `app/` tal
 * como están en el repositorio; no necesita `next build`) y fija que termina
 * en 0.
 */
describe('auditoría de imágenes: /og.png no es una ruta rota', () => {
  it('el script termina en 0 (ninguna ruta citada sin archivo o generador)', () => {
    let salida = '';
    let codigo = 0;
    try {
      salida = execFileSync('node', ['scripts/auditar-imagenes.mjs'], {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (err) {
      const e = err as { status?: number; stdout?: string; stderr?: string };
      codigo = e.status ?? 1;
      salida = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    }
    expect(codigo, salida).toBe(0);
    expect(salida).not.toContain('/og.png');
  });
});
