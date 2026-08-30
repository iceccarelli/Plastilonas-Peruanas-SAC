import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildStamp } from '@/lib/version';
import { SITE } from '@/lib/site';

/**
 * La verificación de despliegue es un mecanismo: si se rompe en silencio,
 * volvemos a interrogar al build anterior y a confundir un despliegue en curso
 * con un defecto del código. Estos tests vigilan las tres formas conocidas de
 * que eso ocurra.
 */

const script = readFileSync(join(process.cwd(), 'scripts/verificar-despliegue.sh'), 'utf8');
const route = readFileSync(join(process.cwd(), 'app/version.json/route.ts'), 'utf8');
const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));

describe('sello de compilación', () => {
  it('expone el commit, la rama, el entorno y el origen canónico', () => {
    const s = buildStamp();
    expect(s).toHaveProperty('commit');
    expect(s).toHaveProperty('commitShort');
    expect(s).toHaveProperty('branch');
    expect(s).toHaveProperty('entorno');
    expect(s.siteUrl).toBe(SITE.url);
  });

  it('commitShort son los siete primeros caracteres del SHA', () => {
    const s = buildStamp();
    expect(s.commitShort).toBe(s.commit.slice(0, 7));
  });

  it('fuera de Vercel no inventa un commit', () => {
    // Un sello falso es peor que ninguno: haría creer que ya desplegó.
    const s = buildStamp();
    if (!process.env.VERCEL_GIT_COMMIT_SHA) {
      expect(s.commit).toBe('');
      expect(s.entorno).toBe('local');
    }
  });

  it('no expone ninguna variable de entorno que no sea de la plataforma', () => {
    const lib = readFileSync(join(process.cwd(), 'lib/version.ts'), 'utf8');
    const vars = lib.match(/process\.env\.[A-Z_0-9]+/g) ?? [];
    for (const v of vars) expect(v.startsWith('process.env.VERCEL_'), v).toBe(true);
  });

  it('el endpoint no se indexa y no se cachea', () => {
    // Cacheado deja de responder la única pregunta que se le hace.
    expect(route).toMatch(/'X-Robots-Tag': 'noindex'/);
    expect(route).toMatch(/no-store/);
  });

  it('el route handler no exporta nada fuera del contrato de Next', () => {
    // Un export extra rompe el build entero; ya pasó una vez con indexnow.
    const exports = route.match(/^export\s+(const|async function|function)\s+(\w+)/gm) ?? [];
    for (const e of exports) {
      expect(/\b(GET|POST|dynamic|revalidate|runtime)\b/.test(e), e).toBe(true);
    }
  });
});

describe('script de verificación', () => {
  it('está enlazado como npm run verify:deploy', () => {
    expect(pkg.scripts['verify:deploy']).toContain('scripts/verificar-despliegue.sh');
  });

  it('espera al commit antes de comprobar nada', () => {
    expect(script).toMatch(/version\.json/);
    expect(script).toMatch(/commitShort/);
    expect(script).toMatch(/ESPERA_MAX/);
  });

  it('deriva el origen de lib/site.ts y no lo escribe a mano', () => {
    // El día de la migración a plastilonas.com este script debe seguirla solo.
    expect(script).toMatch(/lib\/site\.ts/);
    expect(script).not.toContain('https://plastilonas-peruanas-sac.vercel.app');
    expect(script).not.toContain('https://www.plastilonas.com');
  });

  it('no usa tuberías con grep -q, que dan falsos negativos con pipefail', () => {
    // grep -q cierra la entrada al primer acierto; con pipefail el curl que
    // alimenta la tubería muere con SIGPIPE y la comprobación "falla" pese a
    // haber encontrado el patrón. Es el fallo que tuvo este mismo script.
    expect(script).not.toMatch(/cuerpo "\$1" \| grep -q/);
    expect(script).toMatch(/grep -q "\$2" <<< "\$b"/);
  });

  it('sale con código distinto de cero cuando algo falla', () => {
    expect(script).toMatch(/exit 1/);
  });
});

describe('cobertura: nada se publica sin verificarse', () => {
  /**
   * El fallo que esto evita no es hipotético: se añade un endpoint de datos,
   * se despliega, y nadie se entera de que devuelve 404 hasta que un agente
   * deja de citarlo. La verificación tiene que crecer con el sitio SOLA, o
   * deja de significar algo a los dos patches.
   */
  /**
   * EL VERIFICADOR TIENE QUE PODER VERIFICAR.
   *
   * Estuvo roto veintiséis commits sin que nadie se enterara, y las pruebas de
   * este archivo no lo notaron porque comprobaban que el script MENCIONARA cada
   * ruta —cosa que hacía— y no que supiera a qué host pedirlas.
   *
   * La causa: el script extraía el origen buscando `url: "https://…"` en
   * lib/site.ts, y la fase 29 cambió esa línea a `url: originFromEnv()` al
   * introducir el interruptor de dominio. El grep dejó de casar, BASE_URL quedó
   * vacía, y cada curl pedía una ruta relativa. El script decía «el despliegue
   * no llegó» mientras el sitio servía el commit correcto.
   *
   * Esta prueba ejecuta la extracción REAL del script, en bash, y comprueba que
   * devuelve exactamente SITE.url. El día que alguien vuelva a cambiar la forma
   * de lib/site.ts, falla aquí y no en producción.
   */
  it('el script resuelve el mismo origen que lib/site.ts', () => {
    const extraccion = script
      .split('\n')
      .filter((l) => /^SITE_URL=|^  SITE_URL=|^\s*\| grep -oE/.test(l))
      .join('\n');
    expect(extraccion, 'el script ya no extrae el origen de ningún sitio').not.toBe('');

    /**
     * SE EJECUTAN LAS LÍNEAS DEL SCRIPT, NO UNA COPIA DE ELLAS.
     *
     * Esta prueba llevaba dentro un duplicado literal del grep del script. Un
     * duplicado no vigila: envejece. Cuando se sacó NEXT_PUBLIC_SITE_URL del
     * fallback de originFromEnv() —era la variable de Stripe y podía mandar
     * todos los canónicos a localhost— el script se reancló y esta copia siguió
     * probando el ancla vieja, que es exactamente el fallo de veintiséis commits
     * que el comentario de arriba narra.
     *
     * Ahora se recorta el bloque real del archivo y se ejecuta. Si alguien
     * cambia el ancla, esto se entera el mismo día.
     */
    const bloque = /SITE_URL="\$\{CANONICAL_ORIGIN[\s\S]*?\nfi\n/.exec(script)?.[0];
    expect(bloque, 'no se encontró el bloque que resuelve el origen en el script').toBeTruthy();

    const resuelto = execFileSync(
      'bash',
      ['-c', `${bloque}\nprintf %s "$SITE_URL"`],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: { ...process.env, CANONICAL_ORIGIN: '', NEXT_PUBLIC_SITE_URL: '' },
      },
    );
    expect(resuelto, 'la extracción del origen devolvió vacío: el verificador no puede verificar nada').not.toBe('');
    expect(resuelto).toBe(SITE.url);
  });

  /**
   * No esperar trescientos segundos a un commit que sólo existe en el disco.
   * Ese mensaje —«lo más probable es que el BUILD FALLÓ»— mandó a buscar el
   * fallo donde no estaba, dos veces. Un verificador que se equivoca con
   * seguridad es peor que uno que calla.
   */
  it('avisa si el commit esperado no está en el remoto', () => {
    expect(script).toContain('no está en el remoto todavía');
    expect(script).toMatch(/merge-base --is-ancestor/);
    expect(script).toContain('exit 3');
  });

  it('para en seco si no hay origen, en vez de curlear una cadena vacía', () => {
    // El defecto no fue que el grep dejara de casar: fue seguir adelante con
    // BASE_URL vacía durante trescientos segundos.
    expect(script).toMatch(/if \[ -z "\$BASE_URL" \]; then/);
    expect(script).toContain('exit 2');
  });

  it('todos los volcados JSON del sitio están en la verificación', () => {
    const rutas: string[] = [];
    const recorrer = (dir: string) => {
      for (const e of readdirSync(join(process.cwd(), dir), { withFileTypes: true })) {
        if (e.isDirectory()) recorrer(`${dir}/${e.name}`);
        else if (e.name === 'route.ts' && dir.endsWith('.json')) rutas.push(dir.replace(/^app/, '').replace(/\/\([^)]+\)/g, ''));
      }
    };
    recorrer('app');
    // Los endpoints bajo /api no son para rastreadores: no se verifican aquí.
    const publicas = rutas.filter((r) => !r.startsWith('/api/'));
    expect(publicas.length).toBeGreaterThan(3);
    for (const r of publicas) {
      expect(script, `${r} no aparece en verificar-despliegue.sh`).toContain(r);
    }
  });

  it('las calculadoras se verifican con su método y sus límites', () => {
    // Comprobar que la página responde 200 no dice nada: una calculadora sin
    // su fórmula y sin sus límites a la vista responde 200 igual.
    expect(script).toContain('/calculadoras/formulas.json');
    expect(script).toMatch(/SoftwareApplication/);
    expect(script).toMatch(/noCubre/);
    expect(script).toMatch(/NO cubre/);
  });
});
