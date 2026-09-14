import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

/**
 * EL DESPLIEGUE DEL SERVICIO NO SE PUEDE PROBAR AQUÍ, PERO SÍ SUS DOS TRAMPAS.
 *
 * El primer intento de `fly deploy` falló dos veces por la misma clase de
 * defecto: un archivo colocado donde parecía y no donde la herramienta lo lee.
 *
 *   1. `servicio/.dockerignore` no filtraba nada. Docker busca el
 *      `.dockerignore` en la raíz del CONTEXTO, y el contexto de esta imagen es
 *      la raíz del repositorio. Resultado medido: 2,1 GB en 44.727 archivos
 *      subidos al constructor —844 MB de node_modules, 680 MB de .next, 512 MB
 *      de .git— en cada despliegue.
 *   2. `--dockerfile servicio/Dockerfile` junto a `--config servicio/fly.toml`
 *      buscó `servicio/servicio/Dockerfile`: flyctl resuelve esa ruta contra el
 *      fly.toml, no contra el directorio de trabajo.
 *
 * Las dos se arreglaron moviendo la configuración a donde se lee. Estas pruebas
 * impiden que vuelva a moverse a donde parece.
 */

const raiz = process.cwd();
const leer = (rel: string) => readFileSync(join(raiz, rel), 'utf8');

describe('el contexto que se sube a construir es pequeño a propósito', () => {
  it('el .dockerignore vive en la raíz, que es donde Docker lo lee', () => {
    expect(existsSync(join(raiz, '.dockerignore')), 'sin él se suben 2,1 GB por despliegue').toBe(true);
    expect(
      existsSync(join(raiz, 'servicio/.dockerignore')),
      'un .dockerignore en servicio/ no filtra nada y hace creer que sí',
    ).toBe(false);
  });

  it('excluye todo y vuelve a incluir sólo lo necesario', () => {
    // Al revés —enumerar lo que sobra— se olvida siempre algo, y lo que se
    // olvida se sube.
    const ign = leer('.dockerignore').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
    expect(ign[0], 'la primera regla tiene que excluirlo todo').toBe('*');
    for (const necesario of ['!lib', '!lib/calculadoras.ts', '!lib/site.ts', '!servicio']) {
      expect(ign, `falta reincluir ${necesario}`).toContain(necesario);
    }
    for (const pesado of ['node_modules', '.next', '.git', 'public']) {
      expect(ign.some((l) => l.startsWith(`!${pesado}`)), `${pesado} no puede reincluirse`).toBe(false);
    }
  });

  it('lo que el Dockerfile copia de lib/ es exactamente lo que el .dockerignore deja pasar', () => {
    /**
     * Si mañana el servicio importa otro módulo del sitio, hay que tocar los
     * dos archivos. Olvidar uno da un fallo tardío y confuso: el `COPY` no
     * encuentra el archivo, o peor, `tsc` no lo encuentra dentro de la imagen.
     */
    const docker = leer('servicio/Dockerfile');
    const copiados = [...docker.matchAll(/COPY\s+((?:lib\/[\w.-]+\s+)+)\.\/lib\//g)]
      .flatMap((m) => m[1]!.trim().split(/\s+/))
      .sort();
    const permitidos = leer('.dockerignore')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('!lib/'))
      .map((l) => l.slice(1))
      .sort();
    expect(copiados.length, 'no se encontró el COPY de lib/ en el Dockerfile').toBeGreaterThan(0);
    expect(copiados).toEqual(permitidos);
  });
});

describe('el gate del servicio comprueba lo que dice comprobar', () => {
  /**
   * `node --test <directorio>` NO BUSCA DENTRO: intenta ejecutar el directorio
   * como módulo y falla con «Cannot find module», que no dice nada de lo que
   * ocurre. Medido en Node 22 con el árbol ya compilado: la forma de directorio
   * reporta 1 prueba y 1 fallo; el patrón de archivos reporta las 36 y pasa.
   * Con barra final tampoco cambia.
   *
   * Costó un despliegue entero. Aquí se fija para que no cueste otro.
   */
  const GLOB = /node --test\s+\S*\*\.test\.js/;

  it('las pruebas del servicio se invocan por patrón de archivos, no por directorio', () => {
    const pkg = JSON.parse(leer('servicio/package.json'));
    expect(pkg.scripts.test, 'node --test <directorio> no busca dentro').toMatch(GLOB);
    expect(leer('servicio/Dockerfile'), 'la imagen se construiría sin haber probado nada').toMatch(GLOB);
  });

  it('la imagen comprueba que el ejecutable existe antes de publicarse', () => {
    // Si alguien cambia `rootDir`, la salida cambia de sitio y la imagen se
    // construiría con un CMD que apunta a un archivo inexistente: el fallo
    // aparecería al arrancar la máquina, en producción.
    expect(leer('servicio/Dockerfile')).toMatch(/test -f dist\/servicio\/src\/index\.js/);
  });

  it('el CMD y el arranque apuntan a donde el tsconfig deja el ejecutable', () => {
    /**
     * La ruta compilada NO se escribe a mano en tres sitios: se deriva aquí del
     * propio tsconfig —`rootDir` y `outDir`— y se compara con lo que dicen el
     * Dockerfile y el package.json. El día que cambie una de las dos opciones,
     * falla esta prueba y no el arranque de la máquina.
     */
    const dirServicio = join(raiz, 'servicio');
    const tsconfig = JSON.parse(leer('servicio/tsconfig.json').replace(/^\s*\/\/.*$/gm, ''));
    const rootDir: string = tsconfig.compilerOptions.rootDir;
    const outDir: string = tsconfig.compilerOptions.outDir;
    const relativa = relative(resolve(dirServicio, rootDir), resolve(dirServicio, 'src/index.ts'));
    const esperado = join(outDir, relativa).replace(/\.ts$/, '.js');

    expect(esperado).toBe('dist/servicio/src/index.js');
    expect(JSON.parse(leer('servicio/package.json')).scripts.start).toContain(esperado);
    expect(leer('servicio/Dockerfile')).toContain(esperado);
  });

  it('hay una prueba que levanta el servidor de verdad', () => {
    // Que compile no es que sirva: un error de enrutado o un manejador que
    // lanza al primer contacto pasan `tsc` y las pruebas unitarias sin
    // despeinarse, y aparecen en producción.
    const src = leer('servicio/test/servidor.test.ts');
    expect(src).toContain('createServer');
    expect(src).toContain('/v1/salud');
    expect(src).toContain('/mcp');
  });
});

describe('el despliegue se invoca de una sola manera', () => {
  it('hay un comando, y no lleva --dockerfile', () => {
    const pkg = JSON.parse(leer('package.json'));
    const cmd: string = pkg.scripts['desplegar:api'] ?? '';
    expect(cmd, 'falta el comando de despliegue').toContain('fly deploy');
    expect(cmd).toContain('--config servicio/fly.toml');
    expect(
      cmd.includes('--dockerfile'),
      'flyctl resuelve --dockerfile contra el fly.toml: la ruta vive en el propio fly.toml',
    ).toBe(false);
  });

  it('el fly.toml declara el Dockerfile relativo a sí mismo', () => {
    expect(leer('servicio/fly.toml')).toMatch(/^\s*dockerfile = "Dockerfile"$/m);
  });

  it('el health check apunta a una ruta que el servicio sirve', () => {
    // Un health check a una ruta inexistente deja la máquina reiniciándose sin
    // que el error diga por qué.
    const ruta = leer('servicio/fly.toml').match(/^\s*path = "([^"]+)"$/m)?.[1];
    expect(ruta, 'el fly.toml debe declarar un health check').toBeTruthy();
    expect(leer('servicio/src/rutas.ts')).toContain(`obtener('${ruta}'`);
  });
});
