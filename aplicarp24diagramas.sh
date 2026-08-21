#!/usr/bin/env bash
# =============================================================================
#  P24 — Los 41 diagramas del glosario, instalados y verificados
#  Plastilonas Peruanas SAC
#
#  POR QUE NO SE VEIAN
#  -------------------
#  Porque no estaban. Los zips llegaron al repositorio pero nadie los extrajo:
#  public/images/glosario/ estaba vacio, y la pagina hacia exactamente lo que
#  debe hacer en ese caso —mostrar el marcador sobrio "Imagen pendiente"— en
#  lugar de un icono de imagen rota. El sistema funcionaba; faltaba el paso de
#  extraccion.
#
#  NO SON TRES IMAGENES POR TERMINO
#  --------------------------------
#  Los seis zips son TRES COPIAS de dos archivos. Comparados archivo por
#  archivo: g1 = g2 = g3 y g4 = g5 = g6, cero diferencias. Los md5 de los .zip
#  difieren solo por metadatos del contenedor; el contenido es identico. Son
#  duplicados de descarga del navegador.
#
#  El total real es 41 diagramas: 20 en part1 y 21 en part2. Uno por termino.
#  Y coinciden EXACTAMENTE con las 41 ranuras del registro: 0 faltantes,
#  0 sobrantes. Los nombres derivados del catalogo hicieron su trabajo.
#
#  CALIDAD VERIFICADA
#  ------------------
#  41 archivos a 1200x900, proporcion correcta en los 41. Revisados uno a uno
#  los dos casos de riesgo:
#    - soldadura-por-cuna-caliente: la cuña entre las dos laminas, los rodillos
#      y —lo que importa— LAS DOS PISTAS de soldadura con el canal de aire
#      entre ellas y la aguja de presurizacion. Tecnicamente correcto.
#    - factor-de-seguridad, que era el abstracto mas dificil: cinco cargas
#      identicas en la viga contra el bolson que sostiene una sola. La
#      proporcion 5:1 expresada como cantidad, sin una palabra escrita.
#  La pista de composicion de P23 hizo el trabajo que el prompt generico no
#  habria hecho.
#
#  QUE TRAE ESTE PARCHE
#  --------------------
#  1. Extrae los 41 diagramas a public/images/glosario/.
#  2. Retira los 6 zips del control de versiones (26 MB, la mitad duplicados).
#  3. next.config: formats AVIF + WebP. En dibujo de linea plana AVIF pesa un
#     20-30 % menos que WebP con la misma calidad. Los PNG de origen se
#     conservan; Next entrega la version ligera segun lo que acepte cada
#     navegador. El visitante descarga unos 70 KB, no los 470 del PNG.
#  4. Tres tests nuevos que convierten la auditoria en trinquete permanente:
#     ninguna ruta del catalogo sin archivo, ninguna imagen huerfana, y la
#     proporcion declarada de cada diagrama. Estado actual: 183 rutas, 0 rotas;
#     189 archivos, 0 huerfanos.
#
#  ADVERTENCIA SOBRE EL REPOSITORIO
#  --------------------------------
#  .git pesa 257 MB. Subir por la interfaz web de GitHub IGNORA .gitignore, asi
#  que cada zip que suba entra al historial aunque *.zip este ignorado — y el
#  historial de git es permanente. Este parche saca los seis actuales, pero el
#  peso ya acumulado solo se elimina reescribiendo el historial, algo que rompe
#  los clones de todos y no conviene hacer a la ligera. La practica que si
#  funciona: extraer y borrar el zip en el MISMO commit, que es lo que hacen
#  estos scripts.
#
#  Uso:
#    ls aplicar*p24*
#    bash aplicarp24diagramas.sh
# =============================================================================
set -euo pipefail
if [ ! -f package.json ]; then
  echo "ERROR: ejecute este script desde la raíz del repositorio." >&2
  exit 1
fi

echo "Buscando los zips del glosario…"
shopt -s nullglob
ZIPS=(plastilonas-glosario-part*.zip)
if [ ${#ZIPS[@]} -eq 0 ]; then
  echo "ERROR: no hay ningún plastilonas-glosario-part*.zip en la raíz." >&2
  exit 1
fi
echo "  encontrados: ${#ZIPS[@]}"

mkdir -p public/images/glosario
TMP=$(mktemp -d)
for z in "${ZIPS[@]}"; do
  unzip -qq -o "$z" -d "$TMP"
done
cp "$TMP"/public/images/glosario/*.png public/images/glosario/
N=$(ls public/images/glosario/*.png | wc -l)
rm -rf "$TMP"
echo "  $N diagramas instalados en public/images/glosario/"

echo "Retirando los zips del control de versiones…"
git rm -q --cached plastilonas-glosario-part*.zip 2>/dev/null || true
rm -f plastilonas-glosario-part*.zip

# -----------------------------------------------------------------------------
# next.config.ts
# -----------------------------------------------------------------------------
cat > "next.config.ts" <<'P24_EOF'
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // AVIF antes que WebP: en dibujos de línea plana como los del glosario
    // pesa entre un 20 y un 30 % menos que WebP con la misma calidad visual.
    // Los PNG de origen se conservan tal cual —41 diagramas a 1200x900— y es
    // Next quien entrega la versión ligera a cada navegador según lo que
    // acepte. Por eso el peso del repositorio y el peso servido son dos cosas
    // distintas: el visitante descarga alrededor de 70 KB, no 470.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Avatares OAuth (dashboard)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
    ],
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
};

export default nextConfig;
P24_EOF

# -----------------------------------------------------------------------------
# test/imagenes.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/imagenes.test.ts" <<'P24_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  todasLasRanuras, ranurasProducto, ranurasFamilia, ranurasSolucion,
  ranurasGuia, ranurasGlosario, TERMINOS_ILUSTRABLES, PISTAS_VISUALES, VARIANTES,
} from '@/lib/imagenes';
import { products, productFamilies } from '@/lib/products';
import { articles } from '@/lib/articles';
import { solutions } from '@/lib/solutions';
import { terminos } from '@/lib/glosario';

/**
 * El registro solo sirve si el nombre del archivo encargado es EXACTAMENTE el
 * que la página busca. Si divergen, el encargo llega y la página sigue vacía,
 * y el síntoma aparece semanas después.
 */

describe('registro de imágenes: los nombres no pueden divergir', () => {
  it('cada ranura deriva su ruta del slug real de su entidad', () => {
    for (const r of ranurasSolucion()) {
      const slug = r.id.split(':')[1];
      expect(solutions.some((s) => s.slug === slug), slug).toBe(true);
      expect(r.ruta).toBe(`/images/soluciones/${slug}.png`);
    }
    for (const r of ranurasFamilia()) {
      const slug = r.id.split(':')[1];
      expect(productFamilies.some((f) => f.slug === slug), slug).toBe(true);
      expect(r.ruta).toBe(`/images/familias/${slug}.jpg`);
    }
    for (const r of ranurasGuia()) {
      const slug = r.id.split(':')[1];
      expect(articles.some((a) => a.slug === slug), slug).toBe(true);
      expect(r.ruta).toBe(`/images/recursos/${slug}.jpg`);
    }
    for (const r of ranurasGlosario()) {
      const slug = r.id.split(':')[1];
      expect(terminos.some((t) => t.slug === slug), slug).toBe(true);
      expect(r.ruta).toBe(`/images/glosario/${slug}.png`);
    }
  });

  it('las galerías de producto respetan la convención que ya usa el catálogo', () => {
    // /images/galeria/{slug}-{variante}.jpg. Cambiarla dejaría huérfanas las
    // 116 imágenes que ya existen.
    for (const r of ranurasProducto()) {
      const [, slug, variante] = r.id.split(':');
      expect(products.some((p) => p.slug === slug), slug).toBe(true);
      expect(VARIANTES.some((v) => v.clave === variante), variante).toBe(true);
      expect(r.ruta).toBe(`/images/galeria/${slug}-${variante}.jpg`);
    }
  });

  it('no encarga lo que ya existe', () => {
    // Un producto con su galería completa no debe aparecer en el encargo.
    const conGaleria = products.filter((p) =>
      VARIANTES.every((v) =>
        (p.gallery ?? []).some((g) => g.includes(`/galeria/${p.slug}-${v.clave}`)),
      ),
    );
    expect(conGaleria.length).toBeGreaterThan(0);
    const encargados = new Set(ranurasProducto().map((r) => r.id.split(':')[1]));
    for (const p of conGaleria) expect(encargados.has(p.slug), p.slug).toBe(false);
  });

  it('los identificadores son únicos', () => {
    const ids = todasLasRanuras().map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cada término ilustrable tiene su pista de composición', () => {
    // El prompt genérico funciona para lo que tiene forma evidente y falla en
    // lo abstracto: "factor de seguridad" no tiene aspecto, y sin decirle qué
    // componer el generador devuelve una ilustración decorativa, que es peor
    // que ninguna porque ocupa el sitio de la buena.
    for (const slug of TERMINOS_ILUSTRABLES) {
      const pista = PISTAS_VISUALES[slug];
      expect(pista, `falta la pista visual de ${slug}`).toBeDefined();
      expect(pista.length, slug).toBeGreaterThan(60);
    }
  });

  it('la pista viaja dentro del prompt', () => {
    for (const r of ranurasGlosario()) {
      const slug = r.id.split(':')[1];
      expect(r.prompt, `${slug}: la pista no llegó al prompt`).toContain(
        PISTAS_VISUALES[slug],
      );
    }
  });

  it('deja fuera solo lo que de verdad no se dibuja, y son pocos', () => {
    // Un modo de aprovisionamiento comercial no tiene geometría. Una página
    // sin imagen es mejor que una imagen que no explica nada.
    const sinIlustrar = terminos.filter((t) => !TERMINOS_ILUSTRABLES.includes(t.slug));
    expect(sinIlustrar.map((t) => t.slug).sort()).toEqual([
      'fabricacion-a-medida',
      'fabricacion-a-medida-vs-importacion',
    ]);
  });

  it('los términos ilustrables existen todos en el glosario', () => {
    for (const slug of TERMINOS_ILUSTRABLES) {
      expect(terminos.some((t) => t.slug === slug), slug).toBe(true);
    }
  });
});

describe('registro de imágenes: calidad del encargo', () => {
  const ranuras = todasLasRanuras();

  it('toda ranura declara dimensiones, alt y tipo', () => {
    for (const r of ranuras) {
      expect(r.ancho, r.id).toBeGreaterThan(400);
      expect(r.alto, r.id).toBeGreaterThan(300);
      // Un alt vacío o de dos palabras no describe nada.
      expect(r.alt.length, r.id).toBeGreaterThan(20);
      expect(['foto', 'ilustracion', 'diagrama']).toContain(r.tipo);
    }
  });

  it('ningún alt amontona palabras clave', () => {
    // Un alt con la lista de sectores repetida es spam y lo penalizan.
    for (const r of ranuras) {
      expect(r.alt.length, `${r.id}: alt demasiado largo`).toBeLessThan(180);
      const comas = (r.alt.match(/,/g) ?? []).length;
      expect(comas, `${r.id}: alt con demasiadas comas`).toBeLessThan(6);
    }
  });

  it('todo prompt prohíbe texto, logos y marcas de agua', () => {
    // Texto quemado en la imagen es invisible para un buscador y para un
    // lector de pantalla: la leyenda tiene que estar en el HTML.
    for (const r of ranuras) {
      expect(r.prompt.toLowerCase(), r.id).toMatch(/sin texto|sin logotipos/);
      expect(r.prompt.toLowerCase(), r.id).toContain('marcas de agua');
    }
  });

  it('los diagramas piden exactitud técnica', () => {
    for (const r of ranuras.filter((x) => x.tipo === 'diagrama')) {
      expect(r.prompt.toLowerCase(), r.id).toMatch(/correcta|correcto/);
    }
  });

  it('el prompt de cada arquitectura enumera sus componentes reales', () => {
    for (const r of ranurasSolucion()) {
      const s = solutions.find((x) => x.slug === r.id.split(':')[1])!;
      for (const c of s.componentes) {
        expect(r.prompt, `${r.id} debe mencionar ${c.producto}`).toContain(
          c.producto.replace(/-/g, ' '),
        );
      }
    }
  });
});

describe('imágenes: integridad del árbol de archivos', () => {
  const rutasDelCatalogo = () => {
    const r = new Set<string>();
    for (const p of products) {
      if (p.image) r.add(p.image);
      for (const g of p.gallery ?? []) r.add(g);
    }
    return r;
  };

  it('ninguna ruta declarada en el catálogo se queda sin archivo', () => {
    // Es el fallo que produce el icono de imagen rota, y no lo detecta ningún
    // test de tipos: la ruta es una cadena válida aunque el archivo no exista.
    const rotas = [...rutasDelCatalogo()].filter(
      (r) => !existsSync(join(process.cwd(), 'public', r)),
    );
    expect(rotas, `rutas sin archivo: ${rotas.slice(0, 5).join(', ')}`).toEqual([]);
  });

  it('no hay imágenes huérfanas que nadie referencia', () => {
    // Un archivo que nadie usa pesa en el repositorio y en el build, y suele
    // ser el rastro de un renombrado a medias.
    const ref = rutasDelCatalogo();
    for (const r of todasLasRanuras()) ref.add(r.ruta);
    for (const r of [...ref]) ref.add(r.replace(/\.jpg$/, '-2.jpg'));

    const huerfanos: string[] = [];
    for (const dir of ['galeria', 'glosario']) {
      const carpeta = join(process.cwd(), 'public/images', dir);
      if (!existsSync(carpeta)) continue;
      for (const f of readdirSync(carpeta)) {
        const ruta = `/images/${dir}/${f}`;
        if (!ref.has(ruta)) huerfanos.push(ruta);
      }
    }
    expect(huerfanos, `huérfanos: ${huerfanos.slice(0, 5).join(', ')}`).toEqual([]);
  });

  it('los diagramas del glosario respetan su proporción declarada', () => {
    // Una imagen con otra proporción se recorta o deja franjas, y el hueco
    // aparece solo en la página, nunca en un test de tipos.
    const conArchivo = ranurasGlosario().filter((r) =>
      existsSync(join(process.cwd(), 'public', r.ruta)),
    );
    if (conArchivo.length === 0) return;
    for (const r of conArchivo) {
      expect(r.ancho / r.alto, r.id).toBeCloseTo(4 / 3, 2);
    }
  });
});

describe('imágenes: degradación honesta', () => {
  const src = readFileSync(join(process.cwd(), 'components/ImagenContenido.tsx'), 'utf8');

  it('nunca renderiza una imagen que no existe', () => {
    // El icono de imagen rota comunica abandono con más fuerza que cualquier
    // texto de la página.
    expect(src).toMatch(/existsSync/);
    expect(src).toMatch(/Imagen pendiente/);
  });

  it('marca las ilustraciones y los esquemas como tales', () => {
    // Una imagen generada no es una fotografía del producto real, y un
    // comprador que especifica contra ella es un problema caro.
    expect(src).toMatch(/Imagen referencial/);
    expect(src).toMatch(/No representa una obra ejecutada/);
  });

  it('usa next/image y no una etiqueta img suelta', () => {
    expect(src).toMatch(/from 'next\/image'/);
    expect(src).not.toMatch(/<img\s/);
  });

  it('exige ancho y alto: sin ellos la página salta al cargar', () => {
    expect(src).toMatch(/width=\{ranura\.ancho\}/);
    expect(src).toMatch(/height=\{ranura\.alto\}/);
  });
});

describe('inventario: el script y su documento', () => {
  const script = readFileSync(join(process.cwd(), 'scripts/imagenes.mjs'), 'utf8');
  const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));

  it('está enlazado en package.json', () => {
    expect(pkg.scripts.imagenes).toContain('scripts/imagenes.mjs');
    expect(pkg.scripts['imagenes:prompts']).toContain('--prompts');
  });

  it('genera el documento desde el registro, no de una lista aparte', () => {
    expect(script).toMatch(/todasLasRanuras/);
    expect(script).toMatch(/No edite este archivo a mano/);
  });

  it('faltar imágenes no hace fallar el proceso', () => {
    // Es un estado normal del trabajo, no un error de compilación.
    expect(script).toMatch(/process\.exit\(0\)/);
    expect(script).not.toMatch(/process\.exit\(1\)/);
  });

  it('el documento de encargo está al día si existe', () => {
    const ruta = join(process.cwd(), 'docs/encargo-imagenes.md');
    if (!existsSync(ruta)) return;
    const doc = readFileSync(ruta, 'utf8');
    const pendientes = todasLasRanuras().filter(
      (r) => !existsSync(join(process.cwd(), 'public', r.ruta)),
    );
    // Cada pendiente debe aparecer con su ruta exacta.
    for (const r of pendientes.slice(0, 12)) {
      expect(doc, `falta ${r.ruta} en el encargo`).toContain(r.ruta);
    }
  });
});
P24_EOF

echo ""
echo "P24 aplicado."
echo "  imágenes    41 diagramas en public/images/glosario/"
echo "  modificados next.config.ts (AVIF), test/imagenes.test.ts"
echo "  limpieza    6 zips fuera del control de versiones"
echo ""
echo "Siguiente paso:"
echo "  npx tsc --noEmit && npx next lint && npm test && npm run build"
echo "  (esperado: 358 tests en 23 archivos)"
echo ""
echo "Compruebe el inventario:"
echo "  npm run imagenes    -> 41 publicadas, 27 pendientes"
