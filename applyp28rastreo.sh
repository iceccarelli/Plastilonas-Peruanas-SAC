#!/usr/bin/env bash
# =============================================================================
# P28 — LO QUE UN RASTREADOR VE DE VERDAD
#
# INCLUYE P27. Si ya lo aplicó, esto es idempotente. Si no, aquí va también el
# arreglo del build roto.
#
# ---------------------------------------------------------------------------
# EL HALLAZGO
#
# Todas las verificaciones de este proyecto miraban el CÓDIGO: que un archivo
# contenga una cadena, que un objeto tenga un campo. Escribí un auditor que
# mira el HTML REALMENTE GENERADO por `next build`, y lo primero que encontró
# fue esto:
#
#   /productos  —el catálogo, la página comercial más importante del sitio—
#   se sirve con:
#       · ningún <h1>
#       · CERO enlaces `href="/productos/…"`, de 36 fichas
#       · como texto del cuerpo: «Cargando catálogo…»
#
#   Para comparar, /glosario —que sí es un componente de servidor— sirve 43
#   enlaces desde el primer byte.
#
# Causa: la página era 'use client' entera y envolvía todo en <Suspense>. Como
# la rejilla lee `useSearchParams`, Next solo podía prerenderizar el fallback.
# El mismo patrón dejaba /cotizacion —la página de conversión— sin encabezado
# y sin una línea de texto, y /carrito y /checkout literalmente vacías.
#
# Y nada fallaba. Compilaba, pasaban los tipos, pasaban las 440 pruebas. El
# ItemList de JSON-LD declaraba las 36 URLs y por eso las fichas se indexaban
# igual desde el sitemap. Pero un ItemList NO es un grafo de enlaces: el
# catálogo no le pasaba señal interna a ninguna de sus 36 fichas, y cualquier
# agente que lea HTML sin ejecutar JavaScript —que son casi todos los
# rastreadores de IA— veía una página en blanco donde está el portafolio.
#
# ---------------------------------------------------------------------------
# QUÉ CAMBIA
#
# 1. /productos pasa a ser componente de SERVIDOR. El <h1>, la entrada y un
#    índice completo con las 36 fichas agrupadas por familia están en el primer
#    byte. La rejilla filtrable sigue siendo cliente, montada encima.
#      medido:  0 → 36 enlaces a fichas, + 11 a familias, + <h1>
#
# 2. /cotizacion, /carrito y /checkout emiten su encabezado antes de hidratar.
#
# 3. El sufijo del <title> pasa de « | Plastilonas Peruanas SAC» (27 car.) a
#    « | Plastilonas» (14). Medido: 100 de 167 títulos pasaban de 65 —donde
#    Google recorta— y el sufijo por sí solo causaba 67 de esos 100. Lo que se
#    recorta es el final, así que la marca larga se comía el texto que gana el
#    clic. La razón social exacta sigue en el JSON-LD, en /llms.txt y en el pie,
#    que es donde de verdad desambigua la entidad.
#      medido:  100 → 58 títulos recortados
#
# 4. Las calculadoras usaban su PREGUNTA como <title> (86-99 caracteres). Ahora
#    llevan un título corto; la pregunta sigue siendo el <h1>.
#
# 5. Carrito, checkout y confirmación compartían el MISMO <title> por defecto
#    del sitio —la señal exacta de contenido duplicado— y no tenían canónico.
#    Ahora llevan título propio, canónico y noindex explícito.
#
# 6. EL MECANISMO: `npm run auditar`, y el auditor corre en CI después del
#    build. Detecta enlaces internos rotos, títulos duplicados, páginas sin
#    <h1> o sin canónico, imágenes sin alt, JSON-LD que no parsea y @id
#    colgantes. Distingue error de aviso y solo falla por errores.
#
# ---------------------------------------------------------------------------
# RESULTADO MEDIDO, sobre las 167 páginas del HTML generado
#
#      175 errores  →  0
#      (de los 175, 167 eran falsos positivos del propio auditor por /login,
#       que existe y es dinámica; el auditor ahora conoce las rutas dinámicas.
#       Un auditor que grita por lo que está bien deja de mirarse.)
#
#      Quedan 128 avisos: 58 títulos y 67 descripciones que siguen pasándose de
#      largo, y 3 huérfanas que son correctas (carrito y checkout se alcanzan
#      desde el botón del carrito). Son deuda VISIBLE, no una parada de línea.
#
# CÓMO APLICARLO
#   bash applyp28rastreo.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ] || [ ! -d app ]; then
  echo "ERROR: ejecute esto desde la raíz del repositorio." >&2
  exit 1
fi

echo "P28 — escribiendo archivos..."

mkdir -p "$(dirname 'components/CalculadoraForm.tsx')"
cat > 'components/CalculadoraForm.tsx' <<'P28EOF'
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Sigma } from 'lucide-react';
import { calculadoraPorSlug, valoresIniciales, ADVERTENCIA } from '@/lib/calculadoras';
import { numeroPE } from '@/lib/format';
import { trackEvent } from '@/lib/analytics';
import WhatsAppLink from '@/components/WhatsAppLink';

/**
 * Formulario de una calculadora de predimensionamiento.
 *
 * Tres decisiones que no son estéticas:
 *
 * 1. NO ENVÍA NADA A NINGÚN SERVIDOR. Todo se calcula en el navegador. Las
 *    medidas de una poza de relaves o la potencia diésel de una labor son
 *    información del proyecto de un tercero; pedirlas a cambio de un resultado
 *    convertiría una herramienta pública en un formulario de captación, y nadie
 *    con un proyecto real la usaría dos veces.
 *
 * 2. EL RESULTADO SE RECALCULA AL TECLEAR, sin botón. Ver el número moverse al
 *    cambiar el talud es la mitad del valor de la herramienta: enseña qué
 *    variable manda. Un botón «Calcular» esconde justamente eso.
 *
 * 3. LOS SUPUESTOS SE MARCAN Y SE PUEDEN CAMBIAR. Un traslape o un desperdicio
 *    presentados como si fueran datos del proyecto son una mentira silenciosa.
 *    Aquí llevan etiqueta y se editan.
 *
 * `numeroPE` en lugar de toLocaleString: el ICU reducido de algunos contenedores
 * devolvía formato inglés, y el mismo código imprimía «1,141.3» en producción y
 * «1 141,3» en local. Un número mal formateado en una memoria de cálculo se lee
 * como un error de cálculo.
 *
 * POR QUÉ RECIBE UN `slug` Y NO LA CALCULADORA ENTERA. Una `Calculadora` lleva
 * dentro su método `calcular`, y una función NO CRUZA la frontera entre un
 * componente de servidor y uno de cliente: React serializa las props, y una
 * función no se serializa. El build falla en el prerenderizado con «Functions
 * cannot be passed directly to Client Components», no antes: ni el chequeo de
 * tipos ni las pruebas unitarias pueden verlo, porque en TypeScript la prop es
 * perfectamente válida.
 *
 * Así que aquí se recibe el identificador y el propio cliente resuelve la
 * calculadora contra el registro, que es TypeScript puro sin nada de servidor
 * dentro. El registro viaja al navegador, y está bien que viaje: es el mismo
 * método que publicamos abierto en /calculadoras/formulas.json.
 */

export default function CalculadoraForm({ slug }: { slug: string }) {
  const calc = calculadoraPorSlug(slug);
  if (!calc) return null;
  return <Formulario calc={calc} />;
}

/**
 * El cuerpo va aparte porque los hooks no pueden colgar de un `return` previo:
 * la comprobación del slug tiene que ocurrir ANTES del primer useState, y las
 * reglas de los hooks prohíben ambas cosas en la misma función.
 */
function Formulario({ calc }: { calc: NonNullable<ReturnType<typeof calculadoraPorSlug>> }) {
  const inicial = useMemo(() => valoresIniciales(calc), [calc]);
  const [valores, setValores] = useState<Record<string, number>>(inicial);
  const [tocado, setTocado] = useState(false);

  const salida = useMemo(() => calc.calcular(valores), [calc, valores]);

  const cambiar = (id: string, bruto: string) => {
    const n = Number(bruto);
    setValores((v) => ({ ...v, [id]: Number.isFinite(n) ? n : 0 }));
    if (!tocado) {
      setTocado(true);
      trackEvent('calculadora_usada', { calculadora: calc.slug });
    }
  };

  const reiniciar = () => {
    setValores(inicial);
    setTocado(false);
  };

  const datos = calc.campos.filter((c) => !c.esSupuesto);
  const supuestos = calc.campos.filter((c) => c.esSupuesto);

  const resumenParaCotizar = [
    `Consulta desde la calculadora "${calc.titulo}".`,
    ...calc.campos.map((c) => `${c.etiqueta}: ${numeroPE(valores[c.id] ?? 0)} ${c.unidad}`.trim()),
    ...(salida.invalido
      ? []
      : salida.principales.map((p) => `→ ${p.etiqueta}: ${numeroPE(p.valor, p.decimales)} ${p.unidad}`)),
  ].join('\n');

  const campoInput = (c: (typeof calc.campos)[number]) => (
    <label key={c.id} className="block">
      <span className="block text-sm font-medium text-gray-800">
        {c.etiqueta}
        {c.unidad && <span className="ml-1 font-normal text-gray-500">({c.unidad})</span>}
      </span>
      {c.tipo === 'opcion' && c.opciones ? (
        <select
          value={valores[c.id]}
          onChange={(e) => cambiar(c.id, e.target.value)}
          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900"
        >
          {c.opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="number"
          inputMode="decimal"
          value={valores[c.id]}
          min={c.min}
          max={c.max}
          step={c.paso}
          onChange={(e) => cambiar(c.id, e.target.value)}
          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900"
        />
      )}
      {c.ayuda && <span className="mt-1 block text-xs text-gray-500">{c.ayuda}</span>}
    </label>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* ---------------- Entradas ---------------- */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Datos del proyecto
          </legend>
          {datos.map(campoInput)}
        </fieldset>

        {supuestos.length > 0 && (
          <fieldset className="space-y-4 rounded-2xl bg-gray-50 p-4">
            <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Supuestos — cámbielos
            </legend>
            <p className="text-xs text-gray-600">
              Estos valores son un punto de partida, no una recomendación de diseño. El resultado
              depende de ellos, así que van a la vista y no escondidos en el código.
            </p>
            {supuestos.map(campoInput)}
          </fieldset>
        )}

        <button
          type="button"
          onClick={reiniciar}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Volver a los valores de partida
        </button>
      </form>

      {/* ---------------- Resultado ---------------- */}
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100" aria-live="polite">
          {salida.invalido ? (
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B45309]" aria-hidden="true" />
              <p className="text-sm text-gray-800">{salida.invalido}</p>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {salida.principales.map((p) => (
                  <div key={p.etiqueta}>
                    <p className="text-sm text-gray-600">{p.etiqueta}</p>
                    <p className="mt-0.5 text-3xl font-semibold tracking-tight text-gray-900">
                      {numeroPE(p.valor, p.decimales)}{' '}
                      <span className="text-lg font-normal text-gray-500">{p.unidad}</span>
                    </p>
                    {p.nota && <p className="mt-1 text-xs text-gray-500">{p.nota}</p>}
                  </div>
                ))}
              </div>

              <hr className="my-5 border-gray-100" />

              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Cómo sale ese número
              </h3>
              <dl className="mt-3 space-y-2">
                {salida.desglose.map((d) => (
                  <div key={d.etiqueta} className="flex flex-wrap items-baseline justify-between gap-2">
                    <dt className="text-sm text-gray-600">
                      {d.etiqueta}
                      {d.nota && <span className="block text-xs text-gray-400">{d.nota}</span>}
                    </dt>
                    <dd className="text-sm font-medium tabular-nums text-gray-900">
                      {numeroPE(d.valor, d.decimales)} {d.unidad}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>

        {salida.avisos.length > 0 && (
          <ul className="space-y-3">
            {salida.avisos.map((a) => (
              <li key={a} className="flex gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="flex items-start gap-2 text-xs text-gray-600">
            <Sigma className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{ADVERTENCIA}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <WhatsAppLink
            context={`calculadora:${calc.slug}`}
            message={resumenParaCotizar}
            className="inline-flex items-center gap-2 rounded-full bg-[#059669] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#047857]"
          >
            Revisar este resultado con un especialista
          </WhatsAppLink>
          <Link
            href="/cotizacion"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 hover:border-gray-400"
          >
            Pedir cotización
          </Link>
        </div>
        <p className="text-xs text-gray-500">
          Nada de lo que escriba aquí sale de su navegador. El resumen solo viaja si usted pulsa el
          botón de WhatsApp.
        </p>
      </div>
    </div>
  );
}
P28EOF
echo '  ok  components/CalculadoraForm.tsx'

mkdir -p "$(dirname 'scripts/verificar-despliegue.sh')"
cat > 'scripts/verificar-despliegue.sh' <<'P28EOF'
#!/usr/bin/env bash
# =============================================================================
#  Verificación de despliegue — espera al commit correcto y luego comprueba.
#
#  El problema que resuelve: tras `git push`, Vercel tarda entre uno y tres
#  minutos en construir. Correr los curls de inmediato interroga al despliegue
#  ANTERIOR y devuelve 404 en rutas que sí existen. Eso parece un defecto del
#  código, no lo es, y enseña a desconfiar de la verificación.
#
#  Este script pregunta a /version.json qué commit está sirviendo el sitio y no
#  comprueba nada hasta que coincide con el que usted acaba de subir.
#
#  Uso:
#    npm run verify:deploy                 # verifica el HEAD local
#    COMMIT=22e3673 npm run verify:deploy  # verifica un commit concreto
#    BASE_URL=https://otro.vercel.app npm run verify:deploy
#
#  Salida: 0 si todo pasa, 1 si algo falla o si el despliegue no llegó a
#  tiempo. Apto para CI.
# =============================================================================
set -uo pipefail

# El origen sale de lib/site.ts, la única fuente de verdad del dominio: el día
# de la migración a plastilonas.com este script la sigue sin tocarse.
# Se ancla a principio de línea para no capturar la URL de ejemplo que vive
# dentro del comentario de migración a plastilonas.com.
SITE_URL=$(grep -oE '^[[:space:]]*url:[[:space:]]*"[^"]+"' lib/site.ts | head -1 | sed 's/.*"\(.*\)"/\1/')
BASE_URL="${BASE_URL:-$SITE_URL}"
ESPERA_MAX="${ESPERA_MAX:-300}"   # segundos
INTERVALO="${INTERVALO:-10}"

# El commit esperado: el que se pase por entorno, o el HEAD del repo local.
COMMIT="${COMMIT:-$(git rev-parse --short=7 HEAD 2>/dev/null || echo '')}"

pass=0; fail=0
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; pass=$((pass+1)); }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; fail=$((fail+1)); }

# --- 1. Esperar a que el despliegue sirva el commit esperado -----------------

echo "Verificando $BASE_URL"
if [ -z "$COMMIT" ]; then
  echo "  ! Sin commit esperado (¿fuera de un repo git?): se verifica lo que haya en línea."
else
  echo "  Esperando al commit $COMMIT (máximo ${ESPERA_MAX}s)…"
  transcurrido=0
  servido=""
  while [ "$transcurrido" -lt "$ESPERA_MAX" ]; do
    servido=$(curl -sf "$BASE_URL/version.json" 2>/dev/null \
      | grep -o '"commitShort": *"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
    if [ "$servido" = "$COMMIT" ]; then
      echo "  → desplegado tras ${transcurrido}s"
      break
    fi
    sleep "$INTERVALO"
    transcurrido=$((transcurrido + INTERVALO))
    printf '    …%ss (sirviendo %s)\n' "$transcurrido" "${servido:-desconocido}"
  done
  if [ "$servido" != "$COMMIT" ]; then
    echo ""
    # printf y no echo: echo no interpreta \033 y la advertencia salía con las
    # secuencias de color en crudo, justo en el mensaje que hay que leer bien.
    printf '  \033[31mEl despliegue no llegó en %ss.\033[0m\n' "$ESPERA_MAX"
    if [ -z "$servido" ]; then
      echo "  /version.json no responde: el despliegue en línea es anterior a P14,"
      echo "  o el build falló. Revíselo en el panel de Vercel antes de dar nada por roto."
    else
      echo "  Sirviendo todavía: $servido"
      echo ""
      echo "  Lo más probable NO es que Vercel vaya lento: es que el BUILD FALLÓ."
      echo "  Un error de prerenderizado —por ejemplo, pasar una función como"
      echo "  prop a un componente de cliente— pasa limpiamente por tsc y por"
      echo "  las pruebas, y solo revienta al construir. El sitio se queda"
      echo "  entonces sirviendo el commit anterior, que es lo que usted ve."
      echo ""
      echo "  En este orden:"
      echo "    1. gh run list --limit 3          (el flujo CI construye igual que Vercel)"
      echo "    2. npx next build                 (reproducirlo aquí mismo)"
      echo "    3. el panel de Vercel, solo si los dos anteriores dan verde."
    fi
    exit 1
  fi
fi

echo ""

# --- 2. Comprobaciones ------------------------------------------------------

estado() { curl -s -o /dev/null -w '%{http_code}' "$BASE_URL$1"; }
cuerpo() { curl -s "$BASE_URL$1"; }

ruta() { # <ruta> [status esperado]
  local got; got=$(estado "$1")
  [ "$got" = "${2:-200}" ] && ok "$1 → $got" || bad "$1 → $got (esperado ${2:-200})"
}

# Se usa here-string y NO tubería: con `set -o pipefail`, `grep -q` cierra la
# entrada al primer acierto, curl muere con SIGPIPE y el pipeline devuelve
# fallo aunque el patrón SÍ estuviera. Este script existe para dar respuestas
# fiables; un falso negativo suyo sería peor que no tenerlo.
contiene() { # <ruta> <patrón> <descripción>
  local b; b=$(cuerpo "$1")
  if grep -q "$2" <<< "$b"; then ok "$3"; else bad "$3"; fi
}

cuenta() { # <ruta> <patrón> <mínimo> <descripción>
  local b n; b=$(cuerpo "$1"); n=$(grep -c "$2" <<< "$b")
  if [ "$n" -ge "$3" ]; then ok "$4 ($n)"; else bad "$4 (obtuvo $n, mínimo $3)"; fi
}

echo "— Rutas —"
for r in / /productos /servicios /nosotros /contacto /cotizacion /recursos \
         /local /marco /marco/evaluacion /soluciones /novedades /glosario \
         /informes /indicadores /descargas /privacidad /terminos \
         /calculadoras /calculadoras/caudal-ventilacion-mina \
         /calculadoras/geomembrana-poza; do
  ruta "$r"
done

echo "— Archivos para rastreadores —"
ruta /robots.txt
ruta /sitemap.xml
ruta /llms.txt
ruta /novedades/rss.xml
ruta /novedades/feed.json
ruta /glosario/terminos.json
ruta /indicadores/datos.json
ruta /productos/catalogo.json
ruta /calculadoras/formulas.json
ruta /version.json

echo "— Documentos descargables —"
# Un PDF que responde 200 pero devuelve HTML es un enlace roto que no lo parece.
pdf() { # <ruta>
  local ct; ct=$(curl -s -o /dev/null -w '%{content_type}' "$BASE_URL$1")
  case "$ct" in
    application/pdf*) ok "$1 → application/pdf" ;;
    *) bad "$1 → $ct (esperado application/pdf)" ;;
  esac
}
pdf /marco/marco.pdf
pdf /glosario/glosario.pdf
pdf /informes/sectores-compradores-textiles-industriales-peru/informe.pdf
pdf /productos/big-bags-bolsones-polipropileno/ficha-tecnica.pdf
pdf /recursos/instalacion-geomembranas-hdpe-pozas-canales/guia.pdf
pdf /soluciones/poza-revestida-impermeabilizacion/arquitectura.pdf

echo "— Entidad y datos estructurados —"
contiene "/" '"@id":"[^"]*#organization"' "grafo de entidad con @id estable"
contiene "/soluciones/poza-revestida-impermeabilizacion" '"@type":"HowTo"' "arquitecturas emiten HowTo"
contiene "/marco" '"@type":"FAQPage"' "el marco emite FAQPage"
# En expresión regular básica el + es literal: escribirlo como \+ lo convierte
# en cuantificador y el patrón pasa a buscar "application/rssxml".
contiene "/" 'application/rss+xml' "feed declarado en toda página"
contiene "/glosario" '"@type":"DefinedTermSet"' "el glosario emite DefinedTermSet"
contiene "/glosario/geotextil" '"@type":"DefinedTerm"' "cada término emite DefinedTerm"
contiene "/informes/sectores-compradores-textiles-industriales-peru" '"@type":"Dataset"' "el informe emite Dataset con procedencia"

echo "— Contenido esperado —"
# Los mínimos son cotas inferiores medidas, no cifras exactas: el sitemap
# crece con el catálogo y una igualdad estricta obligaría a editar este script
# en cada patch, que es justo como una verificación deja de correrse.
cuenta "/sitemap.xml" '<loc>'       100 "URLs en el sitemap"
cuenta "/sitemap.xml" 'soluciones'    7 "arquitecturas en el sitemap"
cuenta "/sitemap.xml" 'novedades'     8 "novedades en el sitemap"
cuenta "/novedades/rss.xml" '<item>'  7 "entradas en el feed RSS"
contiene "/llms.txt" 'Arquitecturas de referencia' "llms.txt declara arquitecturas"
contiene "/llms.txt" 'Novedades (registro fechado)' "llms.txt declara el registro"
contiene "/llms.txt" 'Glosario técnico' "llms.txt declara el glosario"
contiene "/glosario/terminos.json" 'atribucionSugerida' "el volcado declara cómo citarlo"
contiene "/descargas" '"@type":"DataCatalog"' "el centro de documentación emite DataCatalog"
contiene "/productos/catalogo.json" 'atribucionSugerida' "el catálogo declara cómo citarlo"
contiene "/llms.txt" 'Documentos descargables' "llms.txt declara los documentos"
contiene "/llms.txt" 'Informes del sector' "llms.txt declara los informes"
contiene "/llms.txt" 'Indicadores en vivo' "llms.txt declara los indicadores"
contiene "/llms.txt" 'Calculadoras de predimensionamiento' "llms.txt declara las calculadoras"

# Las calculadoras solo son citables si publican el método y sus límites. Una
# caja negra que devuelve un número no la puede verificar nadie.
contiene "/calculadoras/geomembrana-poza" '"@type":"SoftwareApplication"' "la calculadora se declara como herramienta"
contiene "/calculadoras/geomembrana-poza" '"@type":"HowTo"' "la calculadora publica su método"
contiene "/calculadoras/geomembrana-poza" 'factor_solape' "la fórmula se ve en la página"
contiene "/calculadoras/geomembrana-poza" 'NO cubre' "la página declara qué no cubre"
contiene "/calculadoras/formulas.json" 'atribucionSugerida' "los métodos declaran cómo citarlos"
contiene "/calculadoras/formulas.json" 'noCubre' "los métodos publican sus límites"
contiene "/calculadoras/formulas.json" 'prismatoide' "los métodos publican la fórmula completa"

# El dato en vivo debe llegar con su fecha, siempre. Un valor sin periodo es
# un adorno: quien lo lea no puede saber si sirve.
contiene "/indicadores/datos.json" '"periodo"' "cada indicador declara su periodo"
contiene "/indicadores/datos.json" 'esUltimaLecturaConocida' "declara si el dato es fresco o de respaldo"
contiene "/indicadores" 'BCRP' "la página cita la fuente de cada serie"

echo "— Ningún dato inventado a la vista —"
# El catálogo abierto no debe publicar precios: lo que no se sostiene en la
# cotización no se publica en datos.
if grep -qE '"(precio|price|offers|stock)"' <<< "$(cuerpo /calculadoras/formulas.json)"; then
  bad "los métodos de cálculo exponen precios"
else
  ok "los métodos de cálculo no publican precios"
fi
if grep -qE '"(precio|price|offers|stock)"' <<< "$(cuerpo /productos/catalogo.json)"; then
  bad "el catálogo en JSON expone precios o existencias"
else
  ok "el catálogo en JSON no publica precios ni existencias"
fi

# El informe debe declarar sus límites en la página, no solo en el PDF.
contiene "/informes/sectores-compradores-textiles-industriales-peru" 'NO afirma' "el informe declara qué no afirma"
contiene "/informes/formacion-de-precio-y-volatilidad-textiles-industriales" 'no publicamos lista de precios' "el informe de precios explica por qué no hay lista"
home=$(cuerpo "/")
n=$(grep -o 'data-social="[a-z]*"' <<< "$home" | sort -u | wc -l)
if [ "$n" -le 2 ]; then ok "sólo perfiles sociales reales ($n)"; else
  bad "hay $n perfiles sociales renderizados; sólo WhatsApp y Facebook son reales"; fi
if grep -q 'href="https://www.instagram.com/"' <<< "$home"; then
  bad "perfil marcador de Instagram visible"; else ok "sin perfiles marcadores"; fi

echo ""
printf 'Resultado: \033[32m%s correctas\033[0m, ' "$pass"
if [ "$fail" -eq 0 ]; then printf '\033[32m0 fallos\033[0m\n'; else printf '\033[31m%s fallos\033[0m\n' "$fail"; fi
[ "$fail" -eq 0 ] || exit 1
P28EOF
echo '  ok  scripts/verificar-despliegue.sh'

mkdir -p "$(dirname 'test/frontera-cliente.test.ts')"
cat > 'test/frontera-cliente.test.ts' <<'P28EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * LA FRONTERA ENTRE SERVIDOR Y CLIENTE.
 *
 * El fallo que este archivo existe para impedir ya ocurrió, y llegó hasta el
 * despliegue: se pasó un objeto `Calculadora` —que lleva dentro su método
 * `calcular`— desde un componente de servidor a uno de cliente. React
 * serializa las props para cruzar esa frontera, y una función no se serializa.
 *
 * Lo grave no es el error: es DÓNDE aparece. `tsc` lo da por bueno, porque en
 * TypeScript la prop es perfectamente válida. Las pruebas unitarias lo dan por
 * bueno, porque llaman a la función directamente y nunca cruzan nada. El único
 * que se entera es `next build`, en la fase de prerenderizado, y para entonces
 * el commit ya está empujado y el despliegue en cola.
 *
 * De ahí estas dos comprobaciones. La primera es estructural y corre en
 * milisegundos; la segunda vigila que `next build` siga formando parte de la
 * verificación, que es lo que de verdad cierra el agujero.
 */

const raiz = process.cwd();

function archivos(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(join(raiz, dir), { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.next' || e.name === '.git') continue;
    if (e.isDirectory()) archivos(`${dir}/${e.name}`, out);
    else if (/\.tsx?$/.test(e.name)) out.push(`${dir}/${e.name}`);
  }
  return out;
}

/** Interfaces y tipos exportados que llevan una función dentro. */
function tiposConFuncion(): Map<string, string> {
  const encontrados = new Map<string, string>();
  for (const ruta of archivos('lib')) {
    const src = readFileSync(join(raiz, ruta), 'utf8');
    const re = /export\s+(?:interface|type)\s+(\w+)\s*(?:=\s*)?\{/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      // Cuerpo del bloque, contando llaves.
      let i = src.indexOf('{', m.index);
      let nivel = 0;
      let fin = i;
      for (; fin < src.length; fin++) {
        if (src[fin] === '{') nivel++;
        else if (src[fin] === '}') {
          nivel--;
          if (nivel === 0) break;
        }
      }
      const cuerpo = src.slice(i + 1, fin);
      // `nombre: (...) => X`  o  `nombre(...): X`
      if (/^\s*\w+\??\s*:\s*\([^)]*\)\s*=>/m.test(cuerpo) || /^\s*\w+\??\([^)]*\)\s*:/m.test(cuerpo)) {
        encontrados.set(m[1], ruta);
      }
    }
  }
  return encontrados;
}

describe('frontera servidor/cliente: ninguna función cruza como prop', () => {
  const conFuncion = tiposConFuncion();

  it('detecta los tipos que llevan una función dentro', () => {
    // Si esto queda vacío, el resto del archivo es un test que no prueba nada.
    expect(conFuncion.size, 'ningún tipo con función: revise el detector').toBeGreaterThan(0);
    expect([...conFuncion.keys()]).toContain('Calculadora');
  });

  it('ningún componente de cliente los usa como tipo de sus props', () => {
    const clientes = [...archivos('components'), ...archivos('app')].filter((r) =>
      /^['"]use client['"]/m.test(readFileSync(join(raiz, r), 'utf8')),
    );
    expect(clientes.length, 'no se encontró ningún componente de cliente').toBeGreaterThan(3);

    for (const ruta of clientes) {
      const src = readFileSync(join(raiz, ruta), 'utf8');
      for (const [tipo, origen] of conFuncion) {
        const usadoComoProp = new RegExp(`:\\s*\\{[^}]*:\\s*${tipo}\\b|\\b\\w+:\\s*${tipo}\\s*[;,}]`).test(src);
        expect(
          usadoComoProp,
          `${ruta} recibe un ${tipo} (definido en ${origen}), que lleva una función dentro. ` +
            'Una función no se serializa al cruzar a un componente de cliente y el build ' +
            'falla en el prerenderizado. Pase un identificador y resuelva el objeto en el cliente.',
        ).toBe(false);
      }
    }
  });

  it('el formulario de calculadora recibe un slug, no la calculadora', () => {
    // La forma concreta del fallo que ya ocurrió.
    const src = readFileSync(join(raiz, 'components/CalculadoraForm.tsx'), 'utf8');
    expect(src).toMatch(/CalculadoraForm\(\{\s*slug\s*\}: \{\s*slug: string\s*\}\)/);
    const page = readFileSync(join(raiz, 'app/calculadoras/[slug]/page.tsx'), 'utf8');
    expect(page).toMatch(/<CalculadoraForm slug=\{calc\.slug\}/);
    expect(page).not.toMatch(/<CalculadoraForm calc=/);
  });
});

describe('el agujero de verificación que dejó pasar el fallo', () => {
  it('hay integración continua y construye de verdad', () => {
    // `tsc` y vitest daban verde con el build roto. La única verificación que
    // ve un error de prerenderizado es `next build`, y tiene que correr en el
    // repositorio —en rojo, con el log al lado— y no solo en un panel de
    // Vercel al que hay que ir a mirar.
    const ci = readFileSync(join(raiz, '.github/workflows/ci.yml'), 'utf8');
    expect(ci).toMatch(/next build/);
    expect(ci).toMatch(/tsc --noEmit/);
    expect(ci).toMatch(/vitest run/);
    expect(ci).toMatch(/on:[\s\S]*push:/);
  });

  it('el build corre después de tipos y pruebas, no antes', () => {
    // Dos minutos de compilación para descubrir que faltaba un punto y coma
    // es la forma más segura de que alguien acabe saltándose la verificación.
    // Se mira solo la lista de pasos: el comentario de cabecera del propio
    // flujo menciona `next build` para explicar por qué existe, y comparar
    // posiciones sobre el archivo entero medía la prosa, no el orden real.
    const completo = readFileSync(join(raiz, '.github/workflows/ci.yml'), 'utf8');
    const pasos = completo.slice(completo.indexOf('    steps:'));
    expect(pasos.indexOf('tsc --noEmit')).toBeGreaterThan(-1);
    expect(pasos.indexOf('tsc --noEmit')).toBeLessThan(pasos.indexOf('next build'));
    expect(pasos.indexOf('vitest run')).toBeLessThan(pasos.indexOf('next build'));
  });

  it('package.json conserva el build de producción', () => {
    const pkg = JSON.parse(readFileSync(join(raiz, 'package.json'), 'utf8'));
    expect(pkg.scripts.build).toContain('next build');
  });
});
P28EOF
echo '  ok  test/frontera-cliente.test.ts'

mkdir -p "$(dirname 'app/layout.tsx')"
cat > 'app/layout.tsx' <<'P28EOF'
import ExitIntentModal from '@/components/ExitIntentModal';
import type { Metadata } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import CartDrawer from '@/components/CartDrawer';
import { Toaster } from 'sonner';
import AuthProvider from '@/components/AuthProvider';
import StructuredData from '@/components/StructuredData';
import { SITE } from '@/lib/site';
import Analytics from '@/components/Analytics';
import WebPush from '@/components/WebPush';
import ConsentBanner from '@/components/ConsentBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['700'],
});

// Mono para metadatos técnicos (specs, estados, conteos).
// Patrón AWS: la monoespaciada señala "dato de ingeniería", no marketing.
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Plastilonas Peruanas SAC | Soluciones Industriales de Lona y Plástico',
    // El sufijo pasa de 27 caracteres a 14. Medido sobre el HTML generado:
    // 100 de 167 títulos pasaban de 65 caracteres —el punto en el que Google
    // recorta— y el sufijo por sí solo causaba 67 de esos 100. Lo que se
    // recorta es el final del título, así que la marca larga se comía la parte
    // del texto que gana el clic.
    //
    // La razón social exacta no se pierde: vive donde de verdad desambigua la
    // entidad —el JSON-LD, /llms.txt y el pie— que es donde un buscador y un
    // agente la leen. El <title> es un espacio de clic, no un registro legal.
    template: '%s | Plastilonas',
  },
  description: 'Más de 15 años fabricando e instalando soluciones industriales a medida en el Perú: big bags, lonas y cobertores, geosintéticos, estructuras y arquitectura textil, mallas agrícolas, ventilación industrial y más. Un solo proveedor, fabricación propia e instalación.',
  keywords: [
    'plastilonas peruanas',
    'big bags lima',
    'geomembranas perú',
    'carpas industriales',
    'mantas para camiones',
    'lona plastificada',
    'soluciones textiles industriales',
    'fabricación a medida perú',
    'big bags minería',
    'geomembrana pvc',
  ],
  authors: [{ name: 'Plastilonas Peruanas SAC' }],
  creator: 'Plastilonas Peruanas SAC',
  publisher: 'Plastilonas Peruanas SAC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Origen canónico único (lib/site.ts): alimenta canonicals, OG e imágenes.
  metadataBase: new URL(SITE.url),
  // Verificación de propiedad en Search Console y Bing Webmaster Tools.
  // Se emiten SOLO si la variable existe: una meta de verificación vacía o
  // inventada no verifica nada y ensucia el <head>.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
  openGraph: {
    title: 'Plastilonas Peruanas SAC | Soluciones Textiles Industriales — Fabricación e Importación Directa',
    description: 'Portafolio integral de soluciones textiles industriales en el Perú: big bags, geosintéticos, estructuras y arquitectura textil, mallas, ventilación y lonas a medida. Fabricación propia, instalación e importación directa.',
    // og:image lo genera app/opengraph-image.tsx (antes apuntaba a un archivo
    // inexistente /images/og-image.jpg y las vistas previas salían en blanco).
    locale: 'es_PE',
    type: 'website',
  },
  // Favicon y apple-touch-icon estáticos: app/icon.png y app/apple-icon.png
  // (Next los detecta automáticamente).
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Feed del registro fechado, declarado en TODO el sitio. Va como JSX
            y no en `metadata.alternates`: cada página declara su propio
            `alternates.canonical`, y Next reemplaza el objeto entero, de modo
            que el enlace del feed desaparecía en todas menos en /novedades. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`Novedades — ${SITE.name}`}
          href={`${SITE.url}/novedades/rss.xml`}
        />
        {/* Aplica el tema antes del primer pintado: sin esto, una carga en
            modo oscuro parpadea en blanco. Debe ser sincrono y estar en <head>. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      {/* bg/text salen de los tokens de globals.css: las utilidades de Tailwind
          (0,1,0) ganaban al selector body (0,0,1) y anulaban .dark */}
      <body className="font-sans antialiased bg-[var(--surface)] text-[var(--text)]">
        {/* Destino del enlace "Volver arriba" del pie: apuntaba a #top y no
            existía ningún elemento con ese id, de modo que no hacía nada. */}
        <span id="top" aria-hidden="true" />
        <StructuredData />
        <Analytics />
        <WebPush />
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Chatbot />
          <CartDrawer />
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
              <ExitIntentModal />
        <ConsentBanner />
      </body>
    </html>
  );
}
P28EOF
echo '  ok  app/layout.tsx'

mkdir -p "$(dirname 'app/productos/page.tsx')"
cat > 'app/productos/page.tsx' <<'P28EOF'
import { Suspense } from 'react';
import { products } from '@/lib/products';
import { JsonLd } from '@/components/JsonLd';
import { SITE } from '@/lib/site';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';
import CatalogoFiltrado from '@/components/CatalogoFiltrado';
import IndiceCatalogo from '@/components/IndiceCatalogo';

/**
 * CATÁLOGO — ahora un componente de SERVIDOR.
 *
 * Antes este archivo era 'use client' entero y envolvía todo su contenido en
 * un <Suspense>. Como la rejilla lee `useSearchParams`, Next solo podía
 * prerenderizar el fallback, así que el HTML servido de la página comercial
 * más importante del sitio contenía exactamente esto:
 *
 *   «Cargando catálogo…»
 *
 * Sin <h1>. Sin un solo enlace a las 36 fichas. Medido sobre el HTML generado:
 * 0 enlaces `/productos/…` aquí, contra 43 enlaces `/glosario/…` en el
 * glosario, que sí es un componente de servidor.
 *
 * El reparto ahora es explícito:
 *   · SERVIDOR — el <h1>, la entrada, el JSON-LD y el índice completo con las
 *     36 fichas enlazadas. Está en el primer byte, para todo el mundo.
 *   · CLIENTE  — solo la rejilla filtrable, que es lo único que de verdad
 *     necesita leer la URL.
 */

const CATALOGO_URL = `${SITE.url}/productos`;

export default function ProductosPage() {
  return (
    <>
      {/* Un ItemList de las 36 fichas le da a los buscadores y a los agentes el
          mapa completo del portafolio desde una sola URL. Se emite aquí y no en
          app/productos/layout.tsx porque ese layout también envuelve
          /productos/[slug], donde este bloque sería ruido duplicado.

          Ojo con la lectura fácil: este ItemList NO sustituye a los enlaces.
          Declara URLs; no transmite señal interna. Por eso existe además
          <IndiceCatalogo />. */}
      <JsonLd
        data={[
          webPageSchema({
            url: CATALOGO_URL,
            name: `Catálogo de ${products.length} soluciones textiles industriales`,
            type: 'CollectionPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${CATALOGO_URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Catálogo', url: CATALOGO_URL },
            ],
            `${CATALOGO_URL}#breadcrumb`,
          ),
          itemListSchema({
            url: CATALOGO_URL,
            name: 'Catálogo Plastilonas Peruanas SAC',
            items: products.map((p) => ({
              name: p.name,
              url: `${SITE.url}/productos/${p.slug}`,
            })),
          }),
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="text-xs tracking-[0.15em] text-[#059669] font-semibold">CATÁLOGO COMPLETO</div>
        <h1 className="t-display font-semibold text-[#0A2540]">Productos Industriales</h1>
        <p className="speakable-intro text-gray-600 mt-2 max-w-3xl">
          {products.length} líneas de producto para minería, agroindustria, construcción e industria
          en el Perú: envases y embalaje, lonas y cobertores, geosintéticos, estructuras textiles,
          ventilación y mallas agrícolas. Fabricación propia, importación directa e instalación.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-6 py-20 text-gray-400">Cargando filtros…</div>
        }
      >
        <CatalogoFiltrado />
      </Suspense>

      <IndiceCatalogo />
    </>
  );
}
P28EOF
echo '  ok  app/productos/page.tsx'

mkdir -p "$(dirname 'app/cotizacion/page.tsx')"
cat > 'app/cotizacion/page.tsx' <<'P28EOF'
'use client';

import CotizacionModal from '@/components/CotizacionModal';
import WhatsAppLink from '@/components/WhatsAppLink';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { products } from '@/lib/products';

/**
 * DEFECTO CORREGIDO AQUÍ: esta página nunca leía `?producto=`.
 *
 * Las 36 fichas de producto enlazan a `/cotizacion?producto=<nombre>` desde dos
 * botones cada una, y las páginas de familia y los artículos también empujan
 * hacia aquí. El parámetro se descartaba: el comprador llegaba al formulario
 * con el campo de producto vacío y tenía que volver a escribir lo que acababa
 * de mirar. El dato más valioso del embudo se perdía en el último paso.
 *
 * También se acepta `?comparativa=slug,slug` desde las tablas comparativas:
 * el primer producto queda seleccionado y el mensaje llega redactado con la
 * lista completa, para que el equipo comercial sepa qué se está evaluando.
 */

function CotizacionContent() {
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(true);

  const productoParam = searchParams.get('producto') ?? undefined;

  // La comparativa llega por slugs; se traducen a nombres reales del catálogo
  // para que coincidan con las opciones del formulario.
  const comparativa = (searchParams.get('comparativa') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const preselectedProduct = productoParam ?? comparativa[0]?.name;
  const preselectedMessage = comparativa.length
    ? `Estoy comparando estas alternativas y necesito una cotización: ${comparativa
        .map((p) => p.name)
        .join('; ')}. `
    : undefined;

  return (
    <div className="text-center">
      {preselectedProduct && (
        <p className="mt-6 inline-block rounded-2xl border border-[#059669]/30 bg-[#059669]/5 px-5 py-3 text-sm text-[#0A2540]">
          Cotizando: <strong>{preselectedProduct}</strong>
          {comparativa.length > 1 && ` y ${comparativa.length - 1} alternativa(s) más`}
        </p>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="mt-10 inline-flex items-center justify-center bg-[#0A2540] hover:bg-[#059669] text-white btn btn-lg btn-accent w-full justify-center font-semibold text-lg active:scale-[0.985] transition-all"
      >
        Abrir Formulario de Cotización
      </button>

      <div className="mt-16 text-xs text-gray-400 max-w-xs mx-auto">
        También puede contactarnos directamente por WhatsApp al <WhatsAppLink context="cotizacion-nota" message="Hola, quisiera una cotización." className="underline">+51 946 085 270</WhatsAppLink> para una atención inmediata.
      </div>

      <CotizacionModal
        open={showModal}
        onOpenChange={setShowModal}
        preselectedProduct={preselectedProduct}
        preselectedMessage={preselectedMessage}
      />
    </div>
  );
}

/**
 * El encabezado vive FUERA del <Suspense>.
 *
 * Con todo dentro, Next solo podía prerenderizar el fallback —el componente lee
 * `useSearchParams`— y el HTML servido de la página de conversión llegaba sin
 * <h1> y sin una sola línea de texto: solo «Cargando formulario…». Para un
 * rastreador que no ejecuta JavaScript, la página de cotización estaba en
 * blanco.
 */
export default function CotizacionPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#059669] mb-8">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al inicio
      </Link>

      <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter font-semibold mb-4">
        Solicite su cotización técnica
      </h1>
      <p className="speakable-intro text-xl text-gray-600 max-w-xl mx-auto">
        Complete el formulario y su solicitud llega directamente a nuestro equipo comercial por
        WhatsApp. Para una cotización precisa conviene indicar producto, medidas o metraje, cantidad,
        aplicación o sector y ciudad de entrega.
      </p>

      <Suspense
        fallback={<div className="py-16 text-center text-gray-400">Cargando formulario…</div>}
      >
        <CotizacionContent />
      </Suspense>
    </div>
  );
}
P28EOF
echo '  ok  app/cotizacion/page.tsx'

mkdir -p "$(dirname 'app/carrito/page.tsx')"
cat > 'app/carrito/page.tsx' <<'P28EOF'
'use client';

import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart, cartSubtotal } from '@/lib/cart-store';
import { formatPEN, IGV_RATE } from '@/lib/format';

export default function CarritoPage() {
  const { items, setQuantity, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const subtotal = cartSubtotal(items);
  const igv = subtotal * IGV_RATE;
  const total = subtotal + igv;

  if (!mounted) {
    // El carrito vive en el navegador, así que su CONTENIDO no se puede
    // prerenderizar sin provocar un desajuste de hidratación. El encabezado sí:
    // devolver un div vacío dejaba la página sin un solo <h1> en el HTML
    // servido, y una página sin encabezado es una página sin tema. Cuesta dos
    // líneas y elimina el hueco.
    return (
      <div className="max-w-5xl mx-auto px-6 py-14">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-[#0A2540] mb-10">
          Tu carrito
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <Link href="/productos" className="inline-flex items-center text-sm text-gray-500 hover:text-[#059669] mb-8">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Seguir comprando
      </Link>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-[#0A2540] mb-10">
        Tu carrito
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="mb-6">Tu carrito está vacío.</p>
          <Link
            href="/productos"
            className="inline-block bg-[#0A2540] hover:bg-[#059669] text-white font-semibold px-8 py-3 rounded-2xl transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Líneas */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.slug} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex-1">
                  <p className="font-medium text-[#0A2540]">{item.name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {formatPEN(item.price)}{item.unit ? ` / ${item.unit}` : ''}
                  </p>
                </div>
                <div className="inline-flex items-center border border-gray-200 rounded-full">
                  <button onClick={() => setQuantity(item.slug, item.quantity - 1)} className="p-2 text-gray-500 hover:text-[#0A2540]" aria-label="Disminuir">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => setQuantity(item.slug, item.quantity + 1)} className="p-2 text-gray-500 hover:text-[#0A2540]" aria-label="Aumentar">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-28 text-right font-semibold text-[#0A2540]">
                  {formatPEN(item.price * item.quantity)}
                </div>
                <button onClick={() => remove(item.slug)} className="text-gray-300 hover:text-red-500" aria-label="Quitar">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-3xl p-7 sticky top-28">
              <h2 className="font-semibold text-lg text-[#0A2540] mb-5">Resumen</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-[#0A2540] font-medium">{formatPEN(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>IGV (18%)</span>
                  <span className="text-[#0A2540] font-medium">{formatPEN(igv)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs">
                  <span>Envío</span>
                  <span>Se calcula en el checkout</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                  <span className="font-semibold text-[#0A2540]">Total</span>
                  <span className="text-2xl font-semibold text-[#0A2540]">{formatPEN(total)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 block w-full text-center bg-[#0A2540] hover:bg-[#059669] text-white font-semibold py-3.5 rounded-2xl transition-colors active:scale-[0.99]"
              >
                Ir a pagar
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
P28EOF
echo '  ok  app/carrito/page.tsx'

mkdir -p "$(dirname 'app/carrito/layout.tsx')"
cat > 'app/carrito/layout.tsx' <<'P28EOF'
import type { Metadata } from 'next';

/**
 * El carrito, el checkout y su confirmación son páginas transaccionales:
 * no aportan señal, no deben competir en resultados y ya están bloqueadas en
 * robots.txt. Sin metadatos propios heredaban el título por defecto del sitio,
 * y tres URLs distintas salían con el MISMO <title> — que es exactamente la
 * señal de contenido duplicado que se quiere evitar.
 *
 * `robots: index:false` es la declaración honesta: robots.txt impide el
 * rastreo, pero una URL enlazada desde fuera puede indexarse igual sin haber
 * sido rastreada. El meta lo cierra.
 */
export const metadata: Metadata = {
  title: 'Carrito de cotización',
  description:
    'Productos seleccionados para solicitar una cotización a Plastilonas Peruanas SAC. No se publican precios: el precio se establece en cada cotización.',
  alternates: { canonical: '/carrito' },
  robots: { index: false, follow: true },
};

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
P28EOF
echo '  ok  app/carrito/layout.tsx'

mkdir -p "$(dirname 'app/checkout/page.tsx')"
cat > 'app/checkout/page.tsx' <<'P28EOF'
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useCart, cartSubtotal } from '@/lib/cart-store';
import { formatPEN, IGV_RATE } from '@/lib/format';
import { PERU_DEPARTMENTS, type ShippingDetails } from '@/lib/peru';

const EMPTY: ShippingDetails = {
  name: '', email: '', phone: '', ruc: '',
  address: '', district: '', province: '', department: 'Lima',
  reference: '', notes: '',
};

export default function CheckoutPage() {
  const { items } = useCart();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<ShippingDetails>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const subtotal = cartSubtotal(items);
  const igv = subtotal * IGV_RATE;
  const total = subtotal + igv;

  const set = (k: keyof ShippingDetails) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const requiredOk =
    form.name && form.email && form.phone && form.address && form.district && form.province;

  async function handlePay() {
    setError(null);
    if (!requiredOk) {
      setError('Complete los campos obligatorios (*) para continuar.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shipping: form }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'No se pudo iniciar el pago.');
      }
      window.location.href = data.url; // Stripe Checkout hospedado
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago.');
      setSubmitting(false);
    }
  }

  // Ver la nota de app/carrito/page.tsx: el contenido depende del navegador,
  // el encabezado no. Sin él la página se servía literalmente vacía.
  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-14">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-[#0A2540] mb-10">
          Confirmar solicitud
        </h1>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-[#0A2540] mb-4">Tu carrito está vacío</h1>
        <Link href="/productos" className="inline-block bg-[#0A2540] hover:bg-[#059669] text-white font-semibold px-8 py-3 rounded-2xl transition-colors">
          Ver catálogo
        </Link>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#059669]/40 focus:border-[#059669]';

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <Link href="/carrito" className="inline-flex items-center text-sm text-gray-500 hover:text-[#059669] mb-8">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al carrito
      </Link>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-[#0A2540] mb-10">
        Finalizar compra
      </h1>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Formulario */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-semibold text-lg text-[#0A2540] mb-4">Datos de contacto</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={inputCls} placeholder="Nombre completo *" value={form.name} onChange={set('name')} />
              <input className={inputCls} type="email" placeholder="Correo electrónico *" value={form.email} onChange={set('email')} />
              <input className={inputCls} placeholder="Teléfono *" value={form.phone} onChange={set('phone')} />
              <input className={inputCls} placeholder="RUC (para factura, opcional)" value={form.ruc} onChange={set('ruc')} />
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-[#0A2540] mb-4">Dirección de envío</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={`${inputCls} sm:col-span-2`} placeholder="Dirección (calle, número) *" value={form.address} onChange={set('address')} />
              <input className={inputCls} placeholder="Distrito *" value={form.district} onChange={set('district')} />
              <input className={inputCls} placeholder="Provincia *" value={form.province} onChange={set('province')} />
              <select className={inputCls} value={form.department} onChange={set('department')}>
                {PERU_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input className={inputCls} placeholder="Referencia (opcional)" value={form.reference} onChange={set('reference')} />
              <textarea className={`${inputCls} sm:col-span-2`} rows={3} placeholder="Notas del pedido (opcional)" value={form.notes} onChange={set('notes')} />
            </div>
          </section>
        </div>

        {/* Resumen + pago */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-3xl p-7 sticky top-28">
            <h2 className="font-semibold text-lg text-[#0A2540] mb-5">Tu pedido</h2>

            <div className="space-y-3 mb-5 max-h-56 overflow-y-auto">
              {items.map((item) => (
                <div key={item.slug} className="flex justify-between text-sm">
                  <span className="text-gray-600 pr-3">
                    {item.name} <span className="text-gray-400">×{item.quantity}</span>
                  </span>
                  <span className="text-[#0A2540] font-medium whitespace-nowrap">
                    {formatPEN(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span className="text-[#0A2540] font-medium">{formatPEN(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>IGV (18%)</span><span className="text-[#0A2540] font-medium">{formatPEN(igv)}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-gray-100 pt-3">
                <span className="font-semibold text-[#0A2540]">Total</span>
                <span className="text-2xl font-semibold text-[#0A2540]">{formatPEN(total)}</span>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <button
              onClick={handlePay}
              disabled={submitting}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#0A2540] hover:bg-[#059669] disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-colors active:scale-[0.99]"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Redirigiendo…</>
              ) : (
                <>Pagar con tarjeta</>
              )}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 t-micro text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Pago seguro procesado por Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
P28EOF
echo '  ok  app/checkout/page.tsx'

mkdir -p "$(dirname 'app/checkout/layout.tsx')"
cat > 'app/checkout/layout.tsx' <<'P28EOF'
import type { Metadata } from 'next';

/** Ver la nota de app/carrito/layout.tsx: página transaccional, fuera del índice. */
export const metadata: Metadata = {
  title: 'Confirmar solicitud',
  description:
    'Confirmación de la solicitud de cotización a Plastilonas Peruanas SAC. Fabricación e instalación a medida en el Perú.',
  alternates: { canonical: '/checkout' },
  robots: { index: false, follow: true },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
P28EOF
echo '  ok  app/checkout/layout.tsx'

mkdir -p "$(dirname 'app/checkout/exito/layout.tsx')"
cat > 'app/checkout/exito/layout.tsx' <<'P28EOF'
import type { Metadata } from 'next';

/** Ver la nota de app/carrito/layout.tsx: página transaccional, fuera del índice. */
export const metadata: Metadata = {
  title: 'Solicitud recibida',
  description:
    'Su solicitud llegó a nuestro equipo comercial. Plastilonas Peruanas SAC responde por WhatsApp y correo con la cotización técnica.',
  alternates: { canonical: '/checkout/exito' },
  robots: { index: false, follow: true },
};

export default function ExitoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
P28EOF
echo '  ok  app/checkout/exito/layout.tsx'

mkdir -p "$(dirname 'app/calculadoras/[slug]/page.tsx')"
cat > 'app/calculadoras/[slug]/page.tsx' <<'P28EOF'
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, FileJson, Sigma, ShieldAlert } from 'lucide-react';
import {
  calculadoras,
  calculadoraPorSlug,
  ADVERTENCIA,
  CITA_SUGERIDA,
  CALCULADORAS_ACTUALIZADO,
} from '@/lib/calculadoras';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import {
  breadcrumbSchema,
  howToSchema,
  softwareApplicationSchema,
  webPageSchema,
} from '@/lib/schema';
import CalculadoraForm from '@/components/CalculadoraForm';

/**
 * Página de una calculadora.
 *
 * El orden de la página no es estético: pregunta → herramienta → fórmula →
 * supuestos → LÍMITES. Los límites van después del resultado y antes de los
 * enlaces, porque quien ya tiene un número en la mano es exactamente quien
 * necesita leer qué no incluye. Ponerlos arriba, donde nadie los ha necesitado
 * todavía, es una forma elegante de que no los lea nadie.
 */

export const revalidate = 86400;
/**
 * Solo existen las cinco calculadoras del registro. Cualquier otra ruta bajo
 * /calculadoras/ es un 404 real y no una página generada bajo demanda: un
 * slug inventado que devuelve una página "vacía pero 200" es exactamente lo
 * que un buscador clasifica como soft-404 y lo que erosiona la confianza en
 * el resto del silo.
 *
 * No afecta a /calculadoras/formulas.json: en el App Router un segmento
 * estático tiene precedencia sobre uno dinámico, igual que ya ocurre con
 * /productos/catalogo.json frente a /productos/[slug].
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return calculadoras.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const calc = calculadoraPorSlug(slug);
  if (!calc) return {};
  const url = `${SITE.url}/calculadoras/${calc.slug}`;
  return {
    // Título corto para el buscador; la pregunta completa es el <h1>.
    title: calc.tituloSeo,
    // El resumen completo llegaba a 280 caracteres y se recorta cerca de 155.
    // Se emite la pregunta, que es lo que el usuario reconoce en el resultado.
    description: `${calc.pregunta} Método abierto de predimensionamiento, con la fórmula a la vista y sus límites declarados.`,
    alternates: { canonical: `/calculadoras/${calc.slug}` },
    openGraph: {
      title: `${calc.titulo} | ${SITE.name}`,
      description: calc.resumen,
      url,
      locale: SITE.locale,
      type: 'website',
    },
  };
}

export default async function CalculadoraPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const calc = calculadoraPorSlug(slug);
  if (!calc) notFound();

  const url = `${SITE.url}/calculadoras/${calc.slug}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: calc.pregunta,
            description: calc.resumen,
            type: 'ItemPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Calculadoras', url: `${SITE.url}/calculadoras` },
              { name: calc.titulo, url },
            ],
            `${url}#breadcrumb`,
          ),
          softwareApplicationSchema({
            url,
            name: calc.titulo,
            description: calc.resumen,
            limitaciones: calc.noCubre,
          }),
          howToSchema({
            url,
            name: calc.titulo,
            description: `${calc.resumen} ${ADVERTENCIA}`,
            steps: calc.formula.map((linea, i) => ({
              name: `Paso ${i + 1}`,
              text: linea,
            })),
          }),
        ]}
      />

      <nav aria-label="Ruta" className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link href="/calculadoras" className="hover:underline">
          Calculadoras
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{calc.titulo}</span>
      </nav>

      <p className="text-sm font-semibold uppercase tracking-wide text-[#059669]">{calc.area}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
        {calc.pregunta}
      </h1>
      <p className="speakable-intro mt-4 max-w-3xl text-lg text-gray-600">{calc.resumen}</p>

      <div className="mt-10">
        <CalculadoraForm slug={calc.slug} />
      </div>

      {/* ---------------- Método ---------------- */}
      <section className="mt-16">
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-gray-900">
          <Sigma className="h-6 w-6 text-[#059669]" aria-hidden="true" /> La fórmula
        </h2>
        <p className="mt-2 max-w-3xl text-gray-600">
          Se publica completa. Una caja negra que devuelve un número no la puede verificar nadie —ni
          un ingeniero ni un modelo de lenguaje— y por eso no la cita nadie.
        </p>
        <ol className="mt-5 space-y-2">
          {calc.formula.map((linea, i) => (
            <li
              key={linea}
              id={`paso-${i + 1}`}
              className="overflow-x-auto rounded-2xl bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800"
            >
              {linea}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Supuestos</h2>
        <ul className="mt-4 space-y-3">
          {calc.supuestos.map((s) => (
            <li key={s} className="flex gap-3 text-gray-700">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#059669]" aria-hidden="true" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- Límites ---------------- */}
      <section className="mt-12 rounded-3xl bg-gray-50 p-6">
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-gray-900">
          <ShieldAlert className="h-6 w-6 text-[#B45309]" aria-hidden="true" /> Qué NO cubre este
          cálculo
        </h2>
        <p className="mt-2 max-w-3xl text-gray-700">
          Va después del resultado a propósito: quien ya tiene un número en la mano es exactamente
          quien necesita saber qué no incluye.
        </p>
        <ul className="mt-4 space-y-3">
          {calc.noCubre.map((n) => (
            <li key={n} className="flex gap-3 text-gray-800">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B45309]" aria-hidden="true" />
              <span>{n}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-gray-200 pt-4 text-sm text-gray-600">{ADVERTENCIA}</p>
      </section>

      {/* ---------------- Respaldo ---------------- */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
          De dónde sale y dónde seguir
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {calc.verTambien.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                className="group flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 hover:ring-gray-300"
              >
                <span className="text-sm font-medium text-gray-800">{e.texto}</span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-[#059669] transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-3xl bg-gray-50 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <FileJson className="h-5 w-5" aria-hidden="true" /> Cómo citar este método
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          Método revisado el {CALCULADORAS_ACTUALIZADO}. Fórmula, supuestos y límites están
          publicados como datos en{' '}
          <a href="/calculadoras/formulas.json" className="font-medium text-[#059669] hover:underline">
            /calculadoras/formulas.json
          </a>
          .
        </p>
        <p className="mt-3 rounded-2xl bg-white p-3 font-mono text-xs text-gray-800">
          {CITA_SUGERIDA} — {calc.titulo}, {url}
        </p>
        <p className="mt-3 text-sm text-gray-600">
          Al citar un resultado, cite también los límites del método. Un predimensionamiento
          presentado sin ellos induce a usarlo como cálculo de ingeniería.
        </p>
      </section>
    </div>
  );
}
P28EOF
echo '  ok  app/calculadoras/[slug]/page.tsx'

mkdir -p "$(dirname 'components/CatalogoFiltrado.tsx')"
cat > 'components/CatalogoFiltrado.tsx' <<'P28EOF'
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Grid, List, Filter, X } from 'lucide-react';
import {
  products,
  categories,
  sectors,
  availabilityLabels,
  sourcingLabels,
} from '@/lib/products';
import type { Availability } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import ProductRotator from '@/components/ProductRotator';
import FilterControls from '@/components/FilterControls';
import FilterSheet from '@/components/FilterSheet';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Rejilla filtrable del catálogo.
 *
 * Vivía dentro de app/productos/page.tsx, que era 'use client' entero y
 * envolvía TODO en <Suspense>. Como el componente lee `useSearchParams`, Next
 * solo podía prerenderizar el fallback: el HTML servido de /productos —la
 * página comercial más importante del sitio— llegaba con el texto «Cargando
 * catálogo…», sin <h1> y con CERO enlaces a las 36 fichas. El ItemList de
 * JSON-LD declaraba las URLs, pero un ItemList no es un grafo de enlaces: las
 * fichas no recibían ni una gota de señal interna desde su propio catálogo, y
 * cualquier agente que lea HTML sin ejecutar JavaScript veía una página vacía.
 *
 * Ahora la página es un componente de SERVIDOR que renderiza el encabezado y
 * el índice completo del catálogo, y esta rejilla interactiva se monta encima.
 */

// Orden de los estados de disponibilidad para el filtro (estilo AWS: el estado
// de la oferta es un eje de navegación de primera clase).
const AVAILABILITY_ORDER: Availability[] = ['stock', 'a_medida', 'bajo_pedido'];

export default function CatalogoFiltrado() {
  // Los enlaces del navbar, footer y home usan ?categoria=, ?sector= y
  // ?disponibilidad=. Antes estos parámetros se ignoraban y toda la navegación
  // por categoría llevaba al catálogo sin filtrar.
  const searchParams = useSearchParams();
  const initialCategoria = searchParams.get('categoria');
  const initialSector = searchParams.get('sector');
  const initialDisponibilidad = searchParams.get('disponibilidad');
  // ?q= alimenta el buscador: es el destino real del SearchAction de WebSite
  // en components/StructuredData.tsx (sitelinks searchbox de Google).
  const initialQuery = searchParams.get('q');

  const [searchTerm, setSearchTerm] = useState(initialQuery ?? '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategoria ? [initialCategoria] : []
  );
  const [selectedSectors, setSelectedSectors] = useState<string[]>(
    initialSector ? [initialSector] : []
  );
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(
    initialDisponibilidad ? [initialDisponibilidad] : []
  );
  const [sortBy, setSortBy] = useState<'name' | 'popular'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.shortDescription.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Sector filter
    if (selectedSectors.length > 0) {
      result = result.filter(p => p.sector.some(s => selectedSectors.includes(s)));
    }

    // Availability filter (estado de la oferta)
    if (selectedAvailability.length > 0) {
      result = result.filter(p =>
        selectedAvailability.includes(p.availability ?? 'a_medida')
      );
    }

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return 0;
      });
    }

    return result;
  }, [searchTerm, selectedCategories, selectedSectors, selectedAvailability, sortBy]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev =>
      prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
    );
  };

  const toggleAvailability = (a: string) => {
    setSelectedAvailability(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedSectors([]);
    setSelectedAvailability([]);
    setSortBy('popular');
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCategories.length > 0 ||
    selectedSectors.length > 0 ||
    selectedAvailability.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* El encabezado y el <h1> viven ahora en el componente de servidor: este
          bloque solo estaba en el HTML después de hidratar, y un rastreador que
          no ejecuta JavaScript veía la página sin título. Aquí queda el único
          dato que SÍ depende del filtro. */}
      <div className="mb-6 text-sm text-gray-500" aria-live="polite">
        {filteredProducts.length} productos encontrados
      </div>

      {/* Search + Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, descripción o aplicación..."
            className="w-full pl-12 pr-5 py-3.5 border border-gray-200 rounded-2xl text-sm focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3.5 border border-gray-200 rounded-2xl text-sm font-medium hover:bg-gray-50 lg:hidden"
          >
            <Filter className="w-4 h-4" /> Filtros
          </button>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'name' | 'popular')}
            className="px-5 py-3.5 border border-gray-200 rounded-2xl text-sm bg-white focus:border-[#059669]"
          >
            <option value="popular">Más populares primero</option>
            <option value="name">Orden alfabético</option>
          </select>

          <div className="flex border border-gray-200 rounded-2xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-3.5 ${viewMode === 'grid' ? 'bg-[#0A2540] text-white' : 'hover:bg-gray-50'}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-3.5 ${viewMode === 'list' ? 'bg-[#0A2540] text-white' : 'hover:bg-gray-50'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar (desktop) */}
        <div className="hidden lg:block lg:w-72 flex-shrink-0">
          <div className="sticky top-24 bg-white border border-gray-100 rounded-3xl p-7">
            <FilterControls
              categories={categories}
              availabilityOrder={AVAILABILITY_ORDER}
              sectors={sectors}
              availabilityLabels={availabilityLabels}
              selectedCategories={selectedCategories}
              selectedAvailability={selectedAvailability}
              selectedSectors={selectedSectors}
              toggleCategory={toggleCategory}
              toggleAvailability={toggleAvailability}
              toggleSector={toggleSector}
              clearFilters={clearFilters}
              hasActiveFilters={!!hasActiveFilters}
            />
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {filteredProducts.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredProducts.map((product) => (
                  viewMode === 'grid' ? (
                    <ProductCard key={product.id} product={product} />
                  ) : (
                    <div key={product.id} className="flex gap-6 bg-white border border-gray-100 p-6 rounded-3xl group">
                      <div className="relative w-36 h-28 rounded-2xl overflow-hidden flex-shrink-0">
                        <ProductRotator product={product} />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className="badge bg-gray-100 text-gray-600 text-xs">{product.category}</span>
                          {product.availability && (
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                product.availability === 'stock'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : product.availability === 'bajo_pedido'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {availabilityLabels[product.availability]}
                            </span>
                          )}
                          {product.sourcing && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-gray-50 text-gray-500 border border-gray-100">
                              {sourcingLabels[product.sourcing]}
                            </span>
                          )}
                        </div>
                        <Link href={`/productos/${product.slug}`} className="font-semibold text-xl tracking-tight text-[#0A2540] group-hover:text-[#059669] block mb-2">{product.name}</Link>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.shortDescription}</p>
                        <div className="flex gap-3">
                          <Link href={`/productos/${product.slug}`} className="text-sm font-medium text-[#059669]">Ver detalles →</Link>
                          <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="text-sm font-semibold text-white bg-[#0A2540] px-5 py-1.5 rounded-full text-xs">Cotizar este producto</Link>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-500 mb-4">No se encontraron productos con los filtros seleccionados.</p>
                <button onClick={clearFilters} className="text-[#059669] font-medium text-sm">Limpiar todos los filtros</button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <FilterSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        resultCount={filteredProducts.length}
        hasActiveFilters={!!hasActiveFilters}
        onClear={clearFilters}
      >
        <FilterControls
          categories={categories}
          availabilityOrder={AVAILABILITY_ORDER}
          sectors={sectors}
          availabilityLabels={availabilityLabels}
          selectedCategories={selectedCategories}
          selectedAvailability={selectedAvailability}
          selectedSectors={selectedSectors}
          toggleCategory={toggleCategory}
          toggleAvailability={toggleAvailability}
          toggleSector={toggleSector}
          clearFilters={clearFilters}
          hasActiveFilters={!!hasActiveFilters}
          showHeader={false}
        />
      </FilterSheet>
    </div>
  );
}
P28EOF
echo '  ok  components/CatalogoFiltrado.tsx'

mkdir -p "$(dirname 'components/IndiceCatalogo.tsx')"
cat > 'components/IndiceCatalogo.tsx' <<'P28EOF'
import Link from 'next/link';
import { products, productFamilies, availabilityLabels } from '@/lib/products';
import { familyHrefByName } from '@/lib/families';

/**
 * ÍNDICE COMPLETO DEL CATÁLOGO, RENDERIZADO EN EL SERVIDOR.
 *
 * El defecto que resuelve, medido sobre el HTML realmente servido: /productos
 * llegaba con CERO enlaces `<a href="/productos/…">`. Toda la rejilla vivía
 * detrás de un <Suspense> cuyo contenido depende de `useSearchParams`, así que
 * lo único prerenderizado era el texto «Cargando catálogo…». El /glosario, que
 * es un componente de servidor, servía 43 enlaces desde el primer byte.
 *
 * Por qué importa más de lo que parece. El ItemList de JSON-LD ya declaraba las
 * 36 URLs, y por eso las fichas se indexaban igual desde el sitemap. Pero un
 * ItemList NO es un grafo de enlaces: no transmite señal interna. El catálogo
 * —la página que debería concentrar y repartir autoridad hacia las 36 fichas—
 * no le pasaba ninguna a ninguna. Y cualquier agente que lea HTML sin ejecutar
 * JavaScript (que son casi todos los rastreadores de IA) veía una página vacía
 * donde debería estar el portafolio entero.
 *
 * Por qué un índice y no mover la rejilla al servidor. La rejilla es filtrable
 * y eso es una función de cliente legítima. Duplicarla en el servidor daría dos
 * copias del mismo contenido. Un índice agrupado por familia es otra cosa: es
 * más denso, se recorre de un vistazo y es lo que un comprador técnico que ya
 * sabe lo que busca prefiere usar. Sirve a las personas y resuelve el rastreo
 * con la misma pieza.
 */

export default function IndiceCatalogo() {
  const porFamilia = productFamilies
    .map((f) => ({
      familia: f,
      items: products.filter((p) => p.category === f.name),
    }))
    .filter((g) => g.items.length > 0);

  const enFamilia = new Set(porFamilia.flatMap((g) => g.items.map((p) => p.slug)));
  const sueltos = products.filter((p) => !enFamilia.has(p.slug));

  return (
    <section
      id="indice-catalogo"
      className="max-w-7xl mx-auto px-6 pb-20 pt-4 scroll-mt-24"
      aria-labelledby="indice-catalogo-titulo"
    >
      <div className="border-t border-gray-200 pt-10">
        <h2 id="indice-catalogo-titulo" className="text-2xl font-semibold tracking-tight text-[#0A2540]">
          Índice completo del catálogo
        </h2>
        <p className="mt-2 max-w-3xl text-gray-600">
          Las {products.length} líneas de producto, agrupadas por familia. Si ya sabe qué busca, este
          índice es más rápido que los filtros.
        </p>

        <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {porFamilia.map(({ familia, items }) => (
            <div key={familia.slug}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                <Link href={familyHrefByName(familia.name)} className="hover:text-[#059669]">
                  {familia.name}
                </Link>
              </h3>
              <ul className="mt-3 space-y-2">
                {items.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/productos/${p.slug}`}
                      className="text-sm text-[#0A2540] hover:text-[#059669] hover:underline"
                    >
                      {p.name}
                    </Link>
                    {/* El modo de suministro es un dato estable y es lo primero
                        que pregunta un comprador. El precio no: ése se
                        establece en la cotización. Puede faltar, y entonces no
                        se inventa una etiqueta: simplemente no se muestra. */}
                    {p.availability && (
                      <span className="ml-1.5 text-xs text-gray-400">
                        {availabilityLabels[p.availability]}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {sueltos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Otras líneas</h3>
              <ul className="mt-3 space-y-2">
                {sueltos.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/productos/${p.slug}`}
                      className="text-sm text-[#0A2540] hover:text-[#059669] hover:underline"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
P28EOF
echo '  ok  components/IndiceCatalogo.tsx'

mkdir -p "$(dirname 'lib/calculadoras.ts')"
cat > 'lib/calculadoras.ts' <<'P28EOF'
import { SITE } from './site';

/**
 * CALCULADORAS DE PREDIMENSIONAMIENTO.
 *
 * QUÉ SON Y QUÉ NO SON. Son herramientas de PREDIMENSIONAMIENTO: sirven para
 * llegar a una cotización con un número propio en la mano y para entender qué
 * variable manda. No son un cálculo de ingeniería, no reemplazan una memoria
 * firmada y no autorizan a construir nada.
 *
 * POR QUÉ EXISTEN. Un comprador que sabe cuántos metros necesita negocia
 * distinto que uno que pregunta «¿cuánto cuesta?». Y una pregunta como
 * «¿cuánta geomembrana necesito para una poza de 30×20×4?» no la responde hoy
 * nadie en el rubro en el Perú: se responde por teléfono, una vez, y se pierde.
 * Publicada con su fórmula a la vista, esa respuesta se puede citar.
 *
 * LAS CUATRO REGLAS QUE NINGUNA CALCULADORA PUEDE ROMPER
 *
 * 1. LA FÓRMULA SE PUBLICA. Cada calculadora muestra la expresión que usa. Una
 *    caja negra que escupe un número no es citable por nadie —ni por un
 *    ingeniero ni por un modelo de lenguaje— porque no se puede verificar.
 *
 * 2. NINGÚN DATO INVENTADO. Aquí no se publican densidades de materiales,
 *    medidas interiores de contenedores, cargas útiles ni anchos de rollo «de
 *    memoria»: los pone quien calcula, tomándolos de su ficha, de la placa del
 *    contenedor o del transportista. Lo que aportamos es el MÉTODO. Cuando un
 *    valor sí procede de norma o de fuente publicada —los criterios de aire por
 *    persona y por HP diésel— se cita el artículo del sitio que lo documenta
 *    con su fuente.
 *
 * 3. LOS SUPUESTOS SON EDITABLES Y ESTÁN DECLARADOS. Traslape, desperdicio,
 *    desarrollo de zanja y factor de fugas son puntos de partida, no
 *    recomendaciones de diseño. Cada uno se puede cambiar y cada uno dice de
 *    dónde sale.
 *
 * 4. SE DECLARA LO QUE EL CÁLCULO NO CUBRE. `noCubre` es obligatorio. Una
 *    herramienta que calla sus límites induce a usarla fuera de ellos, y en
 *    minería o en una poza de relaves eso no es un error de marketing.
 *
 * Sin precios. Nunca. Una calculadora que termina en un precio deja de ser
 * una referencia y pasa a ser un formulario de venta, que es exactamente lo
 * contrario de lo que la vuelve citable.
 */

export const CALCULADORAS_VERSION = '1.0';
/** Fecha de la última revisión del método. No se deriva del reloj. */
export const CALCULADORAS_ACTUALIZADO = '2026-08-21';

export type TipoCampo = 'numero' | 'opcion';

export interface OpcionCampo {
  valor: number;
  etiqueta: string;
}

export interface Campo {
  id: string;
  etiqueta: string;
  unidad: string;
  ayuda: string;
  tipo: TipoCampo;
  porDefecto: number;
  min?: number;
  max?: number;
  paso?: number;
  opciones?: OpcionCampo[];
  /** Marca los supuestos editables frente a los datos del proyecto. */
  esSupuesto?: boolean;
}

export interface Magnitud {
  etiqueta: string;
  valor: number;
  unidad: string;
  decimales: number;
  /** Explica qué decide este número, no cómo se llama. */
  nota?: string;
}

export interface Salida {
  /** Lo que la persona vino a buscar. Uno o dos números, no diez. */
  principales: Magnitud[];
  /** De dónde sale el principal: sin esto no se puede auditar. */
  desglose: Magnitud[];
  /** Condiciones que exigen mirar antes de usar el número. */
  avisos: string[];
  /** Si la geometría o los datos no cierran, el número no se emite. */
  invalido?: string;
}

export interface Enlace {
  texto: string;
  href: string;
}

export interface Calculadora {
  slug: string;
  titulo: string;
  /**
   * Título para el <title> y la pestaña: corto a propósito.
   *
   * Usar `pregunta` aquí daba títulos de 86 a 99 caracteres, y Google recorta
   * cerca de 60: el buscador veía «¿Cuántos metros cuadrados de geomembrana
   * neces…». La pregunta completa sigue siendo el <h1> de la página, que es
   * donde sí cabe y donde sí ayuda.
   */
  tituloSeo: string;
  /** La pregunta tal como la escribe quien busca. Es el encabezado real. */
  pregunta: string;
  resumen: string;
  /** Familia a la que pertenece, para agrupar el índice. */
  area: 'Ventilación minera' | 'Geosintéticos' | 'Envases y embalaje' | 'Coberturas';
  campos: Campo[];
  /** La expresión, en texto plano, tal como se aplica. Se publica. */
  formula: string[];
  supuestos: string[];
  noCubre: string[];
  verTambien: Enlace[];
  calcular: (v: Record<string, number>) => Salida;
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

const redondear = (n: number, d = 2): number => {
  const f = 10 ** d;
  return Math.round((n + Number.EPSILON) * f) / f;
};

const finito = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/**
 * CUÁNTAS PIEZAS ENTERAS CABEN EN UN ESPACIO — y por qué no basta con floor().
 *
 * En coma flotante, 2,4 ÷ 0,8 vale 2,9999999999999996. `Math.floor` devuelve
 * 2, y una fila entera de bolsones desaparece de cada viaje. No es un decimal
 * de más: es un error de flete que se paga en cada despacho, provocado por una
 * medida que en el papel encaja exactamente.
 *
 * La tolerancia es de 1e-9 sobre el COCIENTE, es decir, ruido de representación
 * y nada más. Una holgura real —2,399 m para piezas de 0,8 m— sigue dando 2,
 * que es la respuesta correcta.
 */
export function cuantosCaben(espacio: number, pieza: number): number {
  if (!(pieza > 0) || !(espacio > 0)) return 0;
  const bruto = espacio / pieza;
  const entero = Math.round(bruto);
  return Math.abs(bruto - entero) < 1e-9 ? entero : Math.floor(bruto);
}

/**
 * Cuántas unidades enteras hacen falta para cubrir un total. El mismo problema
 * al revés: 2,1 ÷ 0,3 vale 7,000000000000001 y `Math.ceil` compra un paño
 * entero de más que nadie va a usar.
 */
export function cuantosNecesarios(total: number, unidad: number): number {
  if (!(unidad > 0) || total <= 0) return 0;
  const bruto = total / unidad;
  const entero = Math.round(bruto);
  return Math.abs(bruto - entero) < 1e-9 ? entero : Math.ceil(bruto);
}

/**
 * Factor de solape por ancho útil. Es geometría exacta, no un porcentaje
 * inventado: si el rollo mide `ancho` y cada paño pisa `traslape` al vecino,
 * el ancho que efectivamente cubre es `ancho − traslape`, y hacen falta
 * `ancho / (ancho − traslape)` metros de material por cada metro cubierto.
 */
export function factorTraslape(ancho: number, traslape: number): number {
  const util = ancho - traslape;
  if (util <= 0) return Number.POSITIVE_INFINITY;
  return ancho / util;
}

/**
 * Aire por persona según altitud, en m³/min. Escala publicada en la guía del
 * sitio, que cita a Revista Seguridad Minera y al D.S. 024-2016-EM. No es un
 * criterio nuestro: es el criterio del rubro, y por eso se puede verificar.
 */
export function airePorPersona(altitudMsnm: number): number {
  if (altitudMsnm <= 1500) return 3;
  if (altitudMsnm <= 3000) return 4;
  if (altitudMsnm <= 4000) return 5;
  return 6;
}

/** m³/min por HP diésel operando simultáneamente. Mismo origen. */
export const AIRE_POR_HP_DIESEL = 3;

/** Velocidades del aire en la labor, en m/min. Mismo origen. */
export const VELOCIDAD_MINIMA = 20;
export const VELOCIDAD_MINIMA_ANFO = 25;
export const VELOCIDAD_MAXIMA = 250;

const GUIA_VENTILACION = '/recursos/calculo-caudal-mangas-ventilacion-mina-subterranea';
const GUIA_GEOMEMBRANA = '/recursos/instalacion-geomembranas-hdpe-pozas-canales';
const GUIA_GEOTEXTIL = '/recursos/como-elegir-geotextil-separacion-drenaje-refuerzo';
const GUIA_BIGBAGS = '/recursos/big-bags-mineria-peru-normativa-errores-estiba';

/* ================================================================== */
/* 1. Caudal de ventilación en labor subterránea                       */
/* ================================================================== */

const caudalVentilacion: Calculadora = {
  slug: 'caudal-ventilacion-mina',
  tituloSeo: 'Calculadora de caudal de ventilación minera',
  titulo: 'Caudal de ventilación para una labor subterránea',
  pregunta: '¿Cuánto aire necesita mi labor y qué caudal debe entregar el ventilador?',
  resumen:
    'Suma la demanda de aire del personal —corregida por altitud— y la del equipo diésel operando ' +
    'a la vez, comprueba la velocidad resultante en la sección de la labor y devuelve el caudal que ' +
    'el ventilador debe entregar para que ese aire llegue al frente pese a las fugas de la manga.',
  area: 'Ventilación minera',
  campos: [
    {
      id: 'personas',
      etiqueta: 'Personas en la labor',
      unidad: 'personas',
      ayuda: 'Máximo simultáneo, no el total del turno.',
      tipo: 'numero',
      porDefecto: 8,
      min: 0,
      max: 200,
      paso: 1,
    },
    {
      id: 'altitud',
      etiqueta: 'Altitud de la operación',
      unidad: 'msnm',
      ayuda: 'Decide el aire por persona: 3, 4, 5 o 6 m³/min según el tramo.',
      tipo: 'numero',
      porDefecto: 4200,
      min: 0,
      max: 5500,
      paso: 50,
    },
    {
      id: 'hpDiesel',
      etiqueta: 'Potencia diésel operando a la vez',
      unidad: 'HP',
      ayuda:
        'Solo los equipos que trabajan simultáneamente en la labor. Sumar la flota completa ' +
        'sobredimensiona el sistema; contar un solo equipo lo deja corto el día que entran dos.',
      tipo: 'numero',
      porDefecto: 250,
      min: 0,
      max: 5000,
      paso: 10,
    },
    {
      id: 'seccion',
      etiqueta: 'Sección de la labor',
      unidad: 'm²',
      ayuda: 'Área transversal libre. Sirve para comprobar la velocidad del aire.',
      tipo: 'numero',
      porDefecto: 16,
      min: 1,
      max: 200,
      paso: 0.5,
    },
    {
      id: 'anfo',
      etiqueta: '¿Se emplea ANFO u otro agente de voladura?',
      unidad: '',
      ayuda: 'Con ANFO la velocidad mínima exigida sube de 20 a 25 m/min.',
      tipo: 'opcion',
      porDefecto: 1,
      opciones: [
        { valor: 0, etiqueta: 'No' },
        { valor: 1, etiqueta: 'Sí' },
      ],
    },
    {
      id: 'fugas',
      etiqueta: 'Fugas estimadas de la instalación',
      unidad: '%',
      ayuda:
        'Punto de partida, NO una predicción. La fuga no se calcula en gabinete: depende de las ' +
        'uniones, del roce contra la caja y de la catenaria, y se audita midiendo caudal en el frente.',
      tipo: 'numero',
      porDefecto: 15,
      min: 0,
      max: 60,
      paso: 1,
      esSupuesto: true,
    },
  ],
  formula: [
    'aire_por_persona = 3 m³/min hasta 1500 msnm · 4 hasta 3000 · 5 hasta 4000 · 6 por encima',
    'Q_personal = personas × aire_por_persona',
    'Q_diesel   = HP_simultáneos × 3 m³/min por HP',
    'Q_frente   = Q_personal + Q_diesel',
    'velocidad  = Q_frente ÷ sección de la labor',
    'Q_ventilador = Q_frente ÷ (1 − fugas)',
  ],
  supuestos: [
    'Los criterios de aire por persona según altitud, los 3 m³/min por HP diésel y las velocidades ' +
      'mínima y máxima proceden de la guía publicada en este sitio, que cita a Revista Seguridad ' +
      'Minera y al D.S. N.° 024-2016-EM. Verifique el texto vigente del reglamento antes de emitir ' +
      'una memoria de cálculo.',
    'El factor de fugas es un supuesto que usted fija. No es una predicción del comportamiento de ' +
      'una manga concreta.',
    'La velocidad se comprueba contra 20 m/min (25 m/min con ANFO) como mínimo y 250 m/min como máximo.',
  ],
  noCubre: [
    'La dilución de gases de voladura. Es la tercera demanda del cálculo y en labores ciegas de ' +
      'avance suele GOBERNAR por encima de personal y diésel. Depende del tipo y la cantidad de ' +
      'explosivo y del tiempo de reingreso admitido, y no se resuelve con una fórmula general.',
    'La pérdida de carga por fricción y la selección del ventilador contra su curva.',
    'La verificación de oxígeno (mínimo 19,5 %) y de gases en el ambiente de trabajo.',
    'El diámetro de la manga: aquí se calcula caudal, no se selecciona el ducto.',
  ],
  verTambien: [
    { texto: 'Guía: cálculo de caudal y mangas de ventilación', href: GUIA_VENTILACION },
    { texto: 'Arquitectura: frente de avance ventilado', href: '/soluciones/frente-avance-ventilado' },
    { texto: 'Glosario: caudal', href: '/glosario/caudal' },
    { texto: 'Glosario: factor de fuga', href: '/glosario/factor-de-fuga' },
    { texto: 'Glosario: pérdida de carga', href: '/glosario/perdida-de-carga' },
  ],
  calcular: (v) => {
    const personas = v.personas ?? 0;
    const altitud = v.altitud ?? 0;
    const hp = v.hpDiesel ?? 0;
    const seccion = v.seccion ?? 0;
    const conAnfo = (v.anfo ?? 0) === 1;
    const fugas = v.fugas ?? 0;

    if (seccion <= 0) return { principales: [], desglose: [], avisos: [], invalido: 'La sección de la labor debe ser mayor que cero.' };
    if (fugas >= 100) return { principales: [], desglose: [], avisos: [], invalido: 'Con 100 % de fugas no llega aire al frente: revise el dato.' };

    const porPersona = airePorPersona(altitud);
    const qPersonal = personas * porPersona;
    const qDiesel = hp * AIRE_POR_HP_DIESEL;
    const qFrente = qPersonal + qDiesel;
    const velocidad = qFrente / seccion;
    const qVentilador = qFrente / (1 - fugas / 100);

    const vMin = conAnfo ? VELOCIDAD_MINIMA_ANFO : VELOCIDAD_MINIMA;
    const avisos: string[] = [];

    if (velocidad < vMin) {
      avisos.push(
        `La velocidad resultante (${redondear(velocidad, 1)} m/min) queda por debajo del mínimo de ` +
          `${vMin} m/min. Por debajo del mínimo el aire no barre la labor: el caudal no basta o la ` +
          `sección es demasiado grande para él.`,
      );
    }
    if (velocidad > VELOCIDAD_MAXIMA) {
      avisos.push(
        `La velocidad resultante (${redondear(velocidad, 1)} m/min) supera el máximo de ` +
          `${VELOCIDAD_MAXIMA} m/min. Por encima del máximo el aire levanta polvo y afecta la operación.`,
      );
    }
    if (qDiesel > qPersonal && qPersonal > 0) {
      avisos.push(
        'El equipo diésel domina la demanda, que es lo normal en labor mecanizada. Revise que la ' +
          'potencia declarada sea la que opera SIMULTÁNEAMENTE.',
      );
    }
    avisos.push(
      'Este resultado NO incluye la dilución de gases de voladura, que en labores ciegas de avance ' +
        'suele gobernar por encima de estas dos demandas.',
    );
    avisos.push(
      'La medición que vale es la del frente de trabajo, no la de la boca del ventilador. Declarar ' +
        'conforme un sistema midiendo en el ventilador es el error de auditoría más común.',
    );

    return {
      principales: [
        {
          etiqueta: 'Caudal requerido en el frente',
          valor: redondear(qFrente, 1),
          unidad: 'm³/min',
          decimales: 1,
          nota: 'Lo que debe llegar donde se trabaja.',
        },
        {
          etiqueta: 'Caudal que debe entregar el ventilador',
          valor: redondear(qVentilador, 1),
          unidad: 'm³/min',
          decimales: 1,
          nota: `Incluye ${redondear(fugas, 0)} % de fugas supuestas en la instalación.`,
        },
      ],
      desglose: [
        { etiqueta: 'Aire por persona a esa altitud', valor: porPersona, unidad: 'm³/min', decimales: 0 },
        { etiqueta: 'Demanda del personal', valor: redondear(qPersonal, 1), unidad: 'm³/min', decimales: 1 },
        { etiqueta: 'Demanda del equipo diésel', valor: redondear(qDiesel, 1), unidad: 'm³/min', decimales: 1 },
        { etiqueta: 'Velocidad del aire en la labor', valor: redondear(velocidad, 1), unidad: 'm/min', decimales: 1, nota: `Mínimo aplicable: ${vMin} m/min. Máximo: ${VELOCIDAD_MAXIMA} m/min.` },
        { etiqueta: 'Caudal perdido por fugas', valor: redondear(qVentilador - qFrente, 1), unidad: 'm³/min', decimales: 1, nota: 'Aire pagado que no llega al frente.' },
      ],
      avisos,
    };
  },
};

/* ================================================================== */
/* 2. Geomembrana para poza o laguna revestida                         */
/* ================================================================== */

const geomembranaPoza: Calculadora = {
  slug: 'geomembrana-poza',
  tituloSeo: 'Calculadora de geomembrana para poza',
  titulo: 'Geomembrana para una poza o laguna revestida',
  pregunta: '¿Cuántos metros cuadrados de geomembrana necesito para revestir una poza?',
  resumen:
    'Desarrolla la superficie de un vaso rectangular con taludes —fondo más los cuatro planos ' +
    'inclinados—, añade el desarrollo de la zanja de anclaje del perímetro, aplica el solape de ' +
    'soldadura según el ancho de rollo y devuelve área, metros lineales y capacidad del vaso.',
  area: 'Geosintéticos',
  campos: [
    { id: 'largo', etiqueta: 'Largo en la corona', unidad: 'm', ayuda: 'Medida en el borde superior, no en el fondo.', tipo: 'numero', porDefecto: 30, min: 1, max: 500, paso: 0.5 },
    { id: 'ancho', etiqueta: 'Ancho en la corona', unidad: 'm', ayuda: 'Medida en el borde superior.', tipo: 'numero', porDefecto: 20, min: 1, max: 500, paso: 0.5 },
    { id: 'profundidad', etiqueta: 'Profundidad', unidad: 'm', ayuda: 'Desde la corona hasta el fondo.', tipo: 'numero', porDefecto: 4, min: 0.2, max: 40, paso: 0.1 },
    {
      id: 'talud',
      etiqueta: 'Talud (H:V)',
      unidad: 'H por 1 V',
      ayuda: 'Metros en horizontal por cada metro en vertical. 2 significa 2H:1V.',
      tipo: 'numero',
      porDefecto: 2,
      min: 0,
      max: 6,
      paso: 0.25,
    },
    { id: 'anchoRollo', etiqueta: 'Ancho del rollo', unidad: 'm', ayuda: 'El de la ficha del material que va a usar. No lo suponemos por usted.', tipo: 'numero', porDefecto: 7, min: 0.5, max: 12, paso: 0.1 },
    {
      id: 'traslape',
      etiqueta: 'Traslape entre paños',
      unidad: 'm',
      ayuda: 'Punto de partida. El valor real lo fija el procedimiento de soldadura y la ficha del material.',
      tipo: 'numero',
      porDefecto: 0.1,
      min: 0,
      max: 1,
      paso: 0.01,
      esSupuesto: true,
    },
    {
      id: 'zanja',
      etiqueta: 'Desarrollo de la zanja de anclaje',
      unidad: 'm por metro de corona',
      ayuda: 'Metros de membrana que consume la zanja por cada metro de perímetro. Depende de su sección; póngalo 0 si no lleva zanja.',
      tipo: 'numero',
      porDefecto: 1.5,
      min: 0,
      max: 6,
      paso: 0.1,
      esSupuesto: true,
    },
    {
      id: 'desperdicio',
      etiqueta: 'Desperdicio por cortes y geometría',
      unidad: '%',
      ayuda: 'Punto de partida. Sube con esquinas, ingresos, tuberías pasantes y terreno irregular.',
      tipo: 'numero',
      porDefecto: 5,
      min: 0,
      max: 40,
      paso: 1,
      esSupuesto: true,
    },
  ],
  formula: [
    'fondo_largo = largo_corona − 2 × talud × profundidad     (ídem para el ancho)',
    'talud_desarrollado = profundidad × √(1 + talud²)',
    'área_fondo   = fondo_largo × fondo_ancho',
    'área_taludes = 2 × talud_desarrollado × (largo + ancho − 2 × talud × profundidad)',
    'área_zanja   = 2 × (largo + ancho) × desarrollo_de_zanja',
    'factor_solape = ancho_rollo ÷ (ancho_rollo − traslape)',
    'área_total = (área_fondo + área_taludes + área_zanja) × factor_solape × (1 + desperdicio)',
    'metros_lineales = área_total ÷ ancho_rollo',
    'capacidad = profundidad ÷ 6 × (A_corona + 4 × A_media + A_fondo)     (prismatoide, exacta)',
  ],
  supuestos: [
    'El vaso se trata como un tronco de pirámide rectangular con las cuatro caras planas y el mismo ' +
      'talud en todo el perímetro. Sobre esa geometría el desarrollo es exacto, no aproximado.',
    'El factor de solape es geometría, no un porcentaje: si el rollo mide 7 m y cada paño pisa 0,10 m ' +
      'al vecino, cubre 6,90 m y hacen falta 7 ÷ 6,90 metros de material por metro cubierto.',
    'Traslape, desarrollo de zanja y desperdicio son supuestos que usted fija. Los valores de partida ' +
      'no son una recomendación de diseño.',
  ],
  noCubre: [
    'La geomembrana no es el único material del paquete: bajo ella suele ir geotextil de protección ' +
      'y sobre ella puede ir una capa de cobertura. Aquí solo se desarrolla la membrana.',
    'Ingresos, salidas, tuberías pasantes, sumideros, rampas de acceso y bermas intermedias.',
    'La estabilidad del talud, la preparación de la subrasante y la comprobación de la subpresión.',
    'El espesor de la membrana y su selección, que dependen del contenido, del punzonamiento y de la vida de diseño.',
    'La longitud real de los paños según el despiece de obra: los metros lineales son un total, no un despiece.',
  ],
  verTambien: [
    { texto: 'Guía: instalación de geomembranas HDPE en pozas y canales', href: GUIA_GEOMEMBRANA },
    { texto: 'Arquitectura: poza revestida e impermeabilización', href: '/soluciones/poza-revestida-impermeabilizacion' },
    { texto: 'Glosario: zanja de anclaje', href: '/glosario/zanja-de-anclaje' },
    { texto: 'Glosario: soldadura por cuña caliente', href: '/glosario/soldadura-por-cuna-caliente' },
    { texto: 'Glosario: subrasante', href: '/glosario/subrasante' },
  ],
  calcular: (v) => {
    const L = v.largo ?? 0;
    const A = v.ancho ?? 0;
    const h = v.profundidad ?? 0;
    const n = v.talud ?? 0;
    const w = v.anchoRollo ?? 0;
    const t = v.traslape ?? 0;
    const z = v.zanja ?? 0;
    const d = v.desperdicio ?? 0;

    const fondoL = L - 2 * n * h;
    const fondoA = A - 2 * n * h;
    if (fondoL <= 0 || fondoA <= 0) {
      return {
        principales: [],
        desglose: [],
        avisos: [],
        invalido:
          `Con talud ${n}H:1V y ${h} m de profundidad, los taludes se cruzan antes de llegar al fondo ` +
          `(quedaría ${redondear(fondoL, 2)} × ${redondear(fondoA, 2)} m). Reduzca el talud o la ` +
          `profundidad, o amplíe la corona.`,
      };
    }
    const ft = factorTraslape(w, t);
    if (!finito(ft)) {
      return { principales: [], desglose: [], avisos: [], invalido: 'El traslape no puede igualar ni superar el ancho del rollo.' };
    }

    const s = h * Math.sqrt(1 + n * n);
    const areaFondo = fondoL * fondoA;
    const areaTaludes = 2 * s * (L + A - 2 * n * h);
    const perimetro = 2 * (L + A);
    const areaZanja = perimetro * z;
    const areaGeometrica = areaFondo + areaTaludes;
    const areaTotal = (areaGeometrica + areaZanja) * ft * (1 + d / 100);
    const metrosLineales = areaTotal / w;

    // Prismatoide: exacta para un tronco de pirámide.
    const aCorona = L * A;
    const aMedia = (L - n * h) * (A - n * h);
    const capacidad = (h / 6) * (aCorona + 4 * aMedia + areaFondo);

    const avisos: string[] = [];
    if (n === 0) {
      avisos.push('Talud 0 significa paredes verticales. Un vaso en tierra con paredes verticales no se sostiene: verifique el dato.');
    }
    if (z === 0) {
      avisos.push('Sin zanja de anclaje la membrana no tiene cómo resistir el viento ni la tracción del talud. Si su diseño usa otro anclaje, decláre­lo en la memoria.');
    }
    avisos.push('El resultado es el desarrollo de la membrana, no un despiece de paños. El despiece lo define el instalador con el plano de obra.');
    avisos.push('La capacidad calculada es la del vaso lleno hasta la corona, sin borde libre. El borde libre lo fija el diseño hidráulico.');

    return {
      principales: [
        { etiqueta: 'Geomembrana total', valor: redondear(areaTotal, 1), unidad: 'm²', decimales: 1, nota: 'Incluye solape, zanja y desperdicio.' },
        { etiqueta: 'Metros lineales de rollo', valor: redondear(metrosLineales, 1), unidad: 'm', decimales: 1, nota: `A ${w} m de ancho.` },
      ],
      desglose: [
        { etiqueta: 'Fondo', valor: redondear(fondoL, 2), unidad: `m × ${redondear(fondoA, 2)} m`, decimales: 2 },
        { etiqueta: 'Área del fondo', valor: redondear(areaFondo, 1), unidad: 'm²', decimales: 1 },
        { etiqueta: 'Talud desarrollado', valor: redondear(s, 2), unidad: 'm', decimales: 2, nota: 'Longitud sobre el plano inclinado, mayor que la profundidad.' },
        { etiqueta: 'Área de los taludes', valor: redondear(areaTaludes, 1), unidad: 'm²', decimales: 1 },
        { etiqueta: 'Área geométrica del vaso', valor: redondear(areaGeometrica, 1), unidad: 'm²', decimales: 1, nota: 'Sin solape ni zanja: la superficie real a cubrir.' },
        { etiqueta: 'Perímetro de la corona', valor: redondear(perimetro, 1), unidad: 'm', decimales: 1 },
        { etiqueta: 'Membrana en la zanja de anclaje', valor: redondear(areaZanja, 1), unidad: 'm²', decimales: 1 },
        { etiqueta: 'Factor de solape', valor: redondear(ft, 4), unidad: '×', decimales: 4, nota: `Rollo de ${w} m con ${t} m de traslape cubre ${redondear(w - t, 2)} m.` },
        { etiqueta: 'Capacidad del vaso hasta la corona', valor: redondear(capacidad, 1), unidad: 'm³', decimales: 1, nota: `Equivale a ${redondear(capacidad * 1000, 0)} litros.` },
      ],
      avisos,
    };
  },
};

/* ================================================================== */
/* 3. Rollos necesarios para cubrir una superficie plana               */
/* ================================================================== */

const rollosPorSuperficie: Calculadora = {
  slug: 'rollos-por-superficie',
  tituloSeo: 'Calculadora de rollos por superficie',
  titulo: 'Rollos necesarios para cubrir una superficie',
  pregunta: '¿Cuántos rollos necesito para cubrir una superficie, contando el traslape?',
  resumen:
    'Vale para geotextil, geomembrana en superficie plana, malla raschel, malla antiáfida, ' +
    'mulch y lona. Calcula cuántos paños entran a lo ancho, cuántos metros lineales suman y ' +
    'cuántos rollos hay que pedir, con el sobrante que queda.',
  area: 'Geosintéticos',
  campos: [
    { id: 'largo', etiqueta: 'Largo de la superficie', unidad: 'm', ayuda: 'Conviene orientar los paños en la dirección más larga: menos uniones.', tipo: 'numero', porDefecto: 100, min: 0.5, max: 5000, paso: 0.5 },
    { id: 'ancho', etiqueta: 'Ancho de la superficie', unidad: 'm', ayuda: '', tipo: 'numero', porDefecto: 40, min: 0.5, max: 5000, paso: 0.5 },
    { id: 'anchoRollo', etiqueta: 'Ancho del rollo', unidad: 'm', ayuda: 'De la ficha del material.', tipo: 'numero', porDefecto: 4, min: 0.2, max: 12, paso: 0.1 },
    { id: 'largoRollo', etiqueta: 'Largo del rollo', unidad: 'm', ayuda: 'De la ficha del material.', tipo: 'numero', porDefecto: 100, min: 1, max: 2000, paso: 1 },
    {
      id: 'traslape',
      etiqueta: 'Traslape entre paños',
      unidad: 'm',
      ayuda: 'Punto de partida. En geotextil de separación depende de la calidad de la subrasante; en malla, del sistema de unión.',
      tipo: 'numero',
      porDefecto: 0.3,
      min: 0,
      max: 2,
      paso: 0.05,
      esSupuesto: true,
    },
    {
      id: 'desperdicio',
      etiqueta: 'Desperdicio por cortes',
      unidad: '%',
      ayuda: 'Punto de partida. Sube con formas irregulares y obstáculos.',
      tipo: 'numero',
      porDefecto: 5,
      min: 0,
      max: 40,
      paso: 1,
      esSupuesto: true,
    },
  ],
  formula: [
    'ancho_útil_por_paño = ancho_rollo − traslape',
    'paños = techo(ancho_superficie ÷ ancho_útil_por_paño)',
    'metros_lineales = paños × largo_superficie × (1 + desperdicio)',
    'rollos = techo(metros_lineales ÷ largo_rollo)',
    'sobrante = rollos × largo_rollo × ancho_rollo − área_cubierta_efectiva',
  ],
  supuestos: [
    'Los paños corren en la dirección del largo y se traslapan entre sí a lo ancho.',
    'El número de paños se redondea SIEMPRE hacia arriba: medio paño no cubre.',
    'No se contempla empalmar retazos para completar un paño. Se puede, pero cada empalme es una ' +
      'unión más y en geotextil de separación las uniones son el punto débil.',
  ],
  noCubre: [
    'El traslape en los EXTREMOS de cada paño cuando el rollo no alcanza el largo completo. Si su ' +
      'largo supera el del rollo, añada ese traslape al desperdicio.',
    'La orientación óptima de los paños en una superficie irregular.',
    'El sistema de unión —cosido, soldado, solo traslapado— y lo que cada uno exige.',
  ],
  verTambien: [
    { texto: 'Guía: cómo elegir un geotextil', href: GUIA_GEOTEXTIL },
    { texto: 'Glosario: gramaje', href: '/glosario/gramaje' },
    { texto: 'Glosario: geotextil', href: '/glosario/geotextil' },
    { texto: 'Glosario: porcentaje de sombra', href: '/glosario/porcentaje-de-sombra' },
  ],
  calcular: (v) => {
    const L = v.largo ?? 0;
    const A = v.ancho ?? 0;
    const w = v.anchoRollo ?? 0;
    const lr = v.largoRollo ?? 0;
    const t = v.traslape ?? 0;
    const d = v.desperdicio ?? 0;

    const util = w - t;
    if (util <= 0) {
      return { principales: [], desglose: [], avisos: [], invalido: 'El traslape no puede igualar ni superar el ancho del rollo: no quedaría ancho útil.' };
    }
    if (lr <= 0) {
      return { principales: [], desglose: [], avisos: [], invalido: 'El largo del rollo debe ser mayor que cero.' };
    }

    const panos = cuantosNecesarios(A, util);
    const metrosLineales = panos * L * (1 + d / 100);
    const rollos = cuantosNecesarios(metrosLineales, lr);
    const areaSuperficie = L * A;
    const areaComprada = rollos * lr * w;
    const sobrante = areaComprada - areaSuperficie;
    const rendimiento = areaSuperficie / areaComprada;

    const avisos: string[] = [];
    if (L > lr) {
      avisos.push(
        `El largo de la superficie (${L} m) supera el del rollo (${lr} m): cada paño necesitará al ` +
          'menos un empalme a lo largo. Ese traslape adicional NO está contado aquí.',
      );
    }
    if (rendimiento < 0.75) {
      avisos.push(
        `Solo se aprovecha el ${redondear(rendimiento * 100, 0)} % del material comprado. Con otro ` +
          'ancho de rollo o girando la dirección de los paños suele mejorar bastante.',
      );
    }
    const restoUltimoPano = panos * util - A;
    if (restoUltimoPano > util * 0.6) {
      avisos.push(
        `El último paño sobra en ${redondear(restoUltimoPano, 2)} m de ancho. Comprobar si conviene ` +
          'repartir el exceso aumentando el traslape en lugar de recortar.',
      );
    }

    return {
      principales: [
        { etiqueta: 'Rollos a pedir', valor: rollos, unidad: 'rollos', decimales: 0, nota: `De ${w} × ${lr} m.` },
        { etiqueta: 'Metros lineales necesarios', valor: redondear(metrosLineales, 1), unidad: 'm', decimales: 1 },
      ],
      desglose: [
        { etiqueta: 'Ancho útil por paño', valor: redondear(util, 2), unidad: 'm', decimales: 2, nota: `${w} m de rollo menos ${t} m de traslape.` },
        { etiqueta: 'Paños a lo ancho', valor: panos, unidad: 'paños', decimales: 0 },
        { etiqueta: 'Superficie a cubrir', valor: redondear(areaSuperficie, 1), unidad: 'm²', decimales: 1 },
        { etiqueta: 'Material comprado', valor: redondear(areaComprada, 1), unidad: 'm²', decimales: 1 },
        { etiqueta: 'Sobrante', valor: redondear(sobrante, 1), unidad: 'm²', decimales: 1, nota: `Aprovechamiento del ${redondear(rendimiento * 100, 1)} %.` },
      ],
      avisos,
    };
  },
};

/* ================================================================== */
/* 4. Big bags por viaje                                               */
/* ================================================================== */

const bigBagsPorViaje: Calculadora = {
  slug: 'big-bags-por-viaje',
  tituloSeo: 'Calculadora de big bags por viaje',
  titulo: 'Big bags por contenedor o por viaje',
  pregunta: '¿Cuántos big bags entran en un contenedor o en una plataforma, y qué limita la carga?',
  resumen:
    'Compara las dos restricciones que gobiernan un despacho a granel —el espacio y la carga útil— ' +
    'y devuelve la que manda. Casi siempre manda el peso mucho antes que el volumen, y ese es ' +
    'justamente el error que se paga en flete.',
  area: 'Envases y embalaje',
  campos: [
    { id: 'bolsaA', etiqueta: 'Base del bolsón, lado A', unidad: 'm', ayuda: 'Medida del bolsón LLENO, que se ensancha respecto del plano.', tipo: 'numero', porDefecto: 1.05, min: 0.3, max: 3, paso: 0.05 },
    { id: 'bolsaB', etiqueta: 'Base del bolsón, lado B', unidad: 'm', ayuda: '', tipo: 'numero', porDefecto: 1.05, min: 0.3, max: 3, paso: 0.05 },
    { id: 'bolsaH', etiqueta: 'Altura del bolsón lleno', unidad: 'm', ayuda: 'Con el bolsón asentado, no izado.', tipo: 'numero', porDefecto: 1.2, min: 0.3, max: 3, paso: 0.05 },
    { id: 'pesoLleno', etiqueta: 'Peso del bolsón lleno', unidad: 'kg', ayuda: 'Contenido más envase.', tipo: 'numero', porDefecto: 1000, min: 1, max: 5000, paso: 10 },
    { id: 'espacioL', etiqueta: 'Largo interior del espacio de carga', unidad: 'm', ayuda: 'De la placa del contenedor o de la ficha del transportista. No lo publicamos de memoria: varía por fabricante.', tipo: 'numero', porDefecto: 5.9, min: 1, max: 30, paso: 0.01 },
    { id: 'espacioA', etiqueta: 'Ancho interior', unidad: 'm', ayuda: 'Misma fuente.', tipo: 'numero', porDefecto: 2.35, min: 0.5, max: 5, paso: 0.01 },
    { id: 'espacioH', etiqueta: 'Altura interior', unidad: 'm', ayuda: 'Misma fuente.', tipo: 'numero', porDefecto: 2.39, min: 0.5, max: 5, paso: 0.01 },
    { id: 'cargaUtil', etiqueta: 'Carga útil admisible', unidad: 'kg', ayuda: 'De la placa CSC del contenedor o del límite de peso por eje de la ruta. Es un dato del transporte, no del bolsón.', tipo: 'numero', porDefecto: 26000, min: 100, max: 60000, paso: 100 },
    {
      id: 'apilable',
      etiqueta: '¿Los bolsones son apilables?',
      unidad: '',
      ayuda: 'No todos los FIBC lo son. Apilar uno que no está diseñado para ello es un modo de falla, no una decisión de carga.',
      tipo: 'opcion',
      porDefecto: 0,
      opciones: [
        { valor: 0, etiqueta: 'No: un solo piso' },
        { valor: 1, etiqueta: 'Sí, según su ficha' },
      ],
    },
  ],
  formula: [
    'por_piso = máximo entre  ⌊L÷a⌋ × ⌊A÷b⌋  y  ⌊L÷b⌋ × ⌊A÷a⌋      (se prueban las dos orientaciones)',
    'pisos = apilable ? ⌊altura_interior ÷ altura_bolsón⌋ : 1',
    'límite_por_espacio = por_piso × pisos',
    'límite_por_peso    = ⌊carga_útil ÷ peso_del_bolsón⌋',
    'bolsones = mínimo(límite_por_espacio, límite_por_peso)',
  ],
  supuestos: [
    'Los bolsones se acomodan en retícula ortogonal, todos en la misma orientación. Es como se carga ' +
      'en la práctica y es lo que permite estibar y trincar.',
    'Todas las medidas del espacio de carga y la carga útil las aporta usted. No publicamos medidas ' +
      'interiores de contenedores ni cargas útiles: varían por fabricante, por naviera y por la ruta.',
    'La altura del bolsón es la del bolsón LLENO y asentado, que no es la del plano.',
  ],
  noCubre: [
    'La distribución del peso sobre los ejes y el centro de gravedad de la carga. Que quepan no ' +
      'significa que la carga esté bien repartida.',
    'El trincado, los separadores y la sujeción, que son obligatorios y consumen espacio.',
    'Los límites de peso por eje de la ruta peruana, que suelen ser más restrictivos que la placa ' +
      'del contenedor.',
    'La compatibilidad del bolsón con el material: tipo electrostático, liner interior y ' +
      'permeabilidad no se deciden por espacio.',
  ],
  verTambien: [
    { texto: 'Guía: big bags en minería, normativa y errores de estiba', href: GUIA_BIGBAGS },
    { texto: 'Arquitectura: despacho de concentrado a granel', href: '/soluciones/despacho-concentrado-granel' },
    { texto: 'Glosario: big bag (FIBC)', href: '/glosario/big-bag-fibc' },
    { texto: 'Glosario: carga de trabajo segura', href: '/glosario/carga-de-trabajo-segura' },
    { texto: 'Glosario: tipo electrostático (FIBC)', href: '/glosario/tipo-electrostatico-fibc' },
  ],
  calcular: (v) => {
    const a = v.bolsaA ?? 0;
    const b = v.bolsaB ?? 0;
    const hB = v.bolsaH ?? 0;
    const peso = v.pesoLleno ?? 0;
    const L = v.espacioL ?? 0;
    const A = v.espacioA ?? 0;
    const H = v.espacioH ?? 0;
    const util = v.cargaUtil ?? 0;
    const apilable = (v.apilable ?? 0) === 1;

    if (a <= 0 || b <= 0 || hB <= 0 || peso <= 0) {
      return { principales: [], desglose: [], avisos: [], invalido: 'Las medidas y el peso del bolsón deben ser mayores que cero.' };
    }
    const orientacion1 = cuantosCaben(L, a) * cuantosCaben(A, b);
    const orientacion2 = cuantosCaben(L, b) * cuantosCaben(A, a);
    const porPiso = Math.max(orientacion1, orientacion2);
    const pisosPorAltura = cuantosCaben(H, hB);
    const pisos = apilable ? Math.max(1, pisosPorAltura) : 1;
    const porEspacio = porPiso * pisos;
    const porPeso = cuantosCaben(util, peso);
    const cantidad = Math.min(porEspacio, porPeso);

    if (porPiso === 0) {
      return { principales: [], desglose: [], avisos: [], invalido: 'No entra ni un bolsón en el piso: revise las medidas del bolsón y del espacio de carga.' };
    }

    const limitante = porPeso < porEspacio ? 'peso' : porPeso > porEspacio ? 'espacio' : 'ambas';
    const pesoTotal = cantidad * peso;
    const ocupacionPiso = (porPiso * a * b) / (L * A);

    const avisos: string[] = [];
    if (limitante === 'peso') {
      avisos.push(
        `Manda el PESO: por espacio caben ${porEspacio} bolsones, pero la carga útil solo admite ` +
          `${porPeso}. Quedan ${porEspacio - cantidad} huecos. Un bolsón de menor capacidad —o el ` +
          'mismo bolsón llenado a menos— aprovecha mejor el flete.',
      );
    }
    if (limitante === 'espacio') {
      avisos.push(
        `Manda el ESPACIO: la carga útil admitiría ${porPeso} bolsones pero solo entran ${porEspacio}. ` +
          `Quedan ${redondear(util - pesoTotal, 0)} kg de carga útil sin usar.`,
      );
    }
    if (apilable && pisos > 1) {
      avisos.push(
        `Se están apilando ${pisos} pisos. Apilar exige que el bolsón esté DISEÑADO para apilamiento ` +
          'y que el contenido lo permita: compruébelo en la ficha antes de contar con esta cifra.',
      );
    }
    if (!apilable && pisosPorAltura > 1) {
      avisos.push(
        `Por altura cabrían ${pisosPorAltura} pisos, pero se está calculando con uno solo porque ` +
          'los bolsones se declararon no apilables. Ahí hay capacidad disponible si la ficha lo admite.',
      );
    }
    avisos.push('El trincado y los separadores son obligatorios y consumen espacio: este cálculo no los descuenta.');

    return {
      principales: [
        { etiqueta: 'Bolsones por viaje', valor: cantidad, unidad: 'bolsones', decimales: 0, nota: `Limita: ${limitante === 'ambas' ? 'espacio y peso por igual' : `el ${limitante}`}.` },
        { etiqueta: 'Peso cargado', valor: redondear(pesoTotal, 0), unidad: 'kg', decimales: 0, nota: `Sobre ${redondear(util, 0)} kg admisibles.` },
      ],
      desglose: [
        { etiqueta: 'Bolsones por piso', valor: porPiso, unidad: 'bolsones', decimales: 0, nota: `Mejor de las dos orientaciones (${orientacion1} contra ${orientacion2}).` },
        { etiqueta: 'Pisos', valor: pisos, unidad: 'pisos', decimales: 0 },
        { etiqueta: 'Límite por espacio', valor: porEspacio, unidad: 'bolsones', decimales: 0 },
        { etiqueta: 'Límite por carga útil', valor: porPeso, unidad: 'bolsones', decimales: 0 },
        { etiqueta: 'Ocupación del piso', valor: redondear(ocupacionPiso * 100, 1), unidad: '%', decimales: 1, nota: 'Superficie del piso realmente ocupada por las bases.' },
        { etiqueta: 'Carga útil sin usar', valor: redondear(Math.max(0, util - pesoTotal), 0), unidad: 'kg', decimales: 0 },
      ],
      avisos,
    };
  },
};

/* ================================================================== */
/* 5. Capacidad de un big bag                                          */
/* ================================================================== */

const capacidadBigBag: Calculadora = {
  slug: 'capacidad-big-bag',
  tituloSeo: 'Calculadora de capacidad de big bag',
  titulo: 'Capacidad de un big bag según el material',
  pregunta: '¿Cuánto material entra en un big bag de estas medidas, y cuánto va a pesar?',
  resumen:
    'Convierte las medidas del bolsón en volumen y, con la densidad aparente del material que usted ' +
    'mide o toma de su ficha, en peso. Después compara ese peso con la carga de trabajo segura del ' +
    'bolsón, que es la comprobación que decide si el envase sirve.',
  area: 'Envases y embalaje',
  campos: [
    { id: 'bolsaA', etiqueta: 'Base, lado A', unidad: 'm', ayuda: 'Del bolsón lleno.', tipo: 'numero', porDefecto: 0.9, min: 0.2, max: 3, paso: 0.05 },
    { id: 'bolsaB', etiqueta: 'Base, lado B', unidad: 'm', ayuda: '', tipo: 'numero', porDefecto: 0.9, min: 0.2, max: 3, paso: 0.05 },
    { id: 'bolsaH', etiqueta: 'Altura útil de llenado', unidad: 'm', ayuda: 'Hasta donde llega el material, no la altura total del bolsón.', tipo: 'numero', porDefecto: 1.1, min: 0.2, max: 3, paso: 0.05 },
    {
      id: 'densidad',
      etiqueta: 'Densidad aparente del material',
      unidad: 't/m³',
      ayuda:
        'La del material suelto, no la del sólido. Se mide llenando un recipiente de volumen conocido ' +
        'y pesándolo. No la publicamos: cambia con la humedad, la granulometría y el asentamiento.',
      tipo: 'numero',
      porDefecto: 1.6,
      min: 0.05,
      max: 6,
      paso: 0.05,
      esSupuesto: true,
    },
    {
      id: 'llenado',
      etiqueta: 'Grado de llenado',
      unidad: '%',
      ayuda: 'Punto de partida. Llenar al 100 % del volumen geométrico deja el bolsón sin forma para izar ni estibar.',
      tipo: 'numero',
      porDefecto: 90,
      min: 10,
      max: 100,
      paso: 1,
      esSupuesto: true,
    },
    {
      id: 'swl',
      etiqueta: 'Carga de trabajo segura del bolsón (SWL)',
      unidad: 'kg',
      ayuda: 'De la etiqueta del bolsón. Es el dato que decide si el envase sirve para este material.',
      tipo: 'numero',
      porDefecto: 1000,
      min: 50,
      max: 5000,
      paso: 50,
    },
  ],
  formula: [
    'volumen_geométrico = A × B × altura_útil',
    'volumen_llenado    = volumen_geométrico × grado_de_llenado',
    'peso_del_contenido = volumen_llenado × densidad_aparente × 1000',
    'comprobación: peso_del_contenido ≤ carga_de_trabajo_segura',
  ],
  supuestos: [
    'El bolsón se trata como un prisma recto. Un bolsón lleno se abomba, así que el volumen real es ' +
      'algo mayor y el prisma queda del lado conservador para el volumen — pero del lado optimista ' +
      'para la altura, porque el abombamiento reduce la altura que alcanza el material.',
    'La densidad aparente la aporta usted. Cambia con la humedad, la granulometría y el asentamiento ' +
      'durante el transporte, y por eso no se publica de memoria.',
    'El grado de llenado es un supuesto editable, no una recomendación.',
  ],
  noCubre: [
    'El factor de seguridad del bolsón (5:1 o 6:1 según el uso). La SWL de la etiqueta ya lo incorpora; ' +
      'no se aplica dos veces.',
    'La compatibilidad química ni la necesidad de liner interior.',
    'El tipo electrostático exigido por el material y por la atmósfera del punto de llenado.',
    'El asentamiento durante el transporte, que cambia la altura y el centro de gravedad.',
  ],
  verTambien: [
    { texto: 'Guía: big bags en minería, normativa y errores de estiba', href: GUIA_BIGBAGS },
    { texto: 'Glosario: densidad aparente', href: '/glosario/densidad-aparente' },
    { texto: 'Glosario: carga de trabajo segura', href: '/glosario/carga-de-trabajo-segura' },
    { texto: 'Glosario: factor de seguridad', href: '/glosario/factor-de-seguridad' },
    { texto: 'Glosario: liner interior', href: '/glosario/liner-interior' },
  ],
  calcular: (v) => {
    const a = v.bolsaA ?? 0;
    const b = v.bolsaB ?? 0;
    const h = v.bolsaH ?? 0;
    const dens = v.densidad ?? 0;
    const llenado = v.llenado ?? 0;
    const swl = v.swl ?? 0;

    if (a <= 0 || b <= 0 || h <= 0 || dens <= 0) {
      return { principales: [], desglose: [], avisos: [], invalido: 'Medidas y densidad deben ser mayores que cero.' };
    }

    const volGeom = a * b * h;
    const volLleno = volGeom * (llenado / 100);
    const pesoContenido = volLleno * dens * 1000;
    const holgura = swl - pesoContenido;

    const avisos: string[] = [];
    if (pesoContenido > swl) {
      avisos.push(
        `El contenido pesaría ${redondear(pesoContenido, 0)} kg y la carga de trabajo segura declarada ` +
          `es de ${redondear(swl, 0)} kg. El bolsón NO sirve para este material a este llenado: hay que ` +
          'bajar el llenado, reducir el bolsón o subir la SWL.',
      );
    } else if (holgura < swl * 0.05) {
      avisos.push(
        `Queda menos del 5 % de holgura contra la SWL (${redondear(holgura, 0)} kg). Con un material ` +
          'que se asienta o que llega más húmedo, ese margen desaparece.',
      );
    }
    if (llenado >= 98) {
      avisos.push('Con el bolsón lleno al ras no queda material de cuello para cerrar ni forma para izar. Revise el grado de llenado.');
    }
    avisos.push('La densidad aparente cambia con la humedad y la granulometría: mídala sobre el material que va a envasar, no sobre una referencia genérica.');

    return {
      principales: [
        { etiqueta: 'Peso del contenido', valor: redondear(pesoContenido, 0), unidad: 'kg', decimales: 0, nota: pesoContenido > swl ? 'Supera la carga de trabajo segura declarada.' : `Holgura de ${redondear(holgura, 0)} kg contra la SWL.` },
        { etiqueta: 'Volumen de llenado', valor: redondear(volLleno, 3), unidad: 'm³', decimales: 3, nota: `Equivale a ${redondear(volLleno * 1000, 0)} litros.` },
      ],
      desglose: [
        { etiqueta: 'Volumen geométrico', valor: redondear(volGeom, 3), unidad: 'm³', decimales: 3, nota: `${a} × ${b} × ${h} m.` },
        { etiqueta: 'Grado de llenado', valor: redondear(llenado, 0), unidad: '%', decimales: 0 },
        { etiqueta: 'Densidad aparente usada', valor: redondear(dens, 2), unidad: 't/m³', decimales: 2 },
        { etiqueta: 'Carga de trabajo segura declarada', valor: redondear(swl, 0), unidad: 'kg', decimales: 0 },
        { etiqueta: 'Holgura contra la SWL', valor: redondear(holgura, 0), unidad: 'kg', decimales: 0 },
      ],
      avisos,
    };
  },
};

/* ================================================================== */
/* Registro                                                            */
/* ================================================================== */

export const calculadoras: Calculadora[] = [
  caudalVentilacion,
  geomembranaPoza,
  rollosPorSuperficie,
  bigBagsPorViaje,
  capacidadBigBag,
];

export const calculadoraPorSlug = (slug: string): Calculadora | undefined =>
  calculadoras.find((c) => c.slug === slug);

/**
 * Calculadoras que se apoyan en una página concreta (una guía, una
 * arquitectura, un término). Se DERIVA de `verTambien` en lugar de declararse
 * aparte: un enlace declarado dos veces se queda a medias el día que alguien
 * renombra un slug, y el síntoma es una guía que promete una calculadora que
 * ya no la enlaza. Aquí el enlace inverso no puede divergir porque no existe:
 * se calcula.
 */
export function calculadorasQueEnlazan(href: string): Calculadora[] {
  return calculadoras.filter((c) => c.verTambien.some((e) => e.href === href));
}

export const areasDeCalculo = (): string[] => [...new Set(calculadoras.map((c) => c.area))];

/** Valores de partida de una calculadora, listos para el estado del formulario. */
export function valoresIniciales(c: Calculadora): Record<string, number> {
  const v: Record<string, number> = {};
  for (const campo of c.campos) v[campo.id] = campo.porDefecto;
  return v;
}

/**
 * La advertencia que acompaña a TODA salida, en el sitio y en el volcado JSON.
 * Una sola frase, escrita una sola vez, imposible de olvidar en una página.
 */
export const ADVERTENCIA =
  'Predimensionamiento, no cálculo de ingeniería. Sirve para llegar a la cotización con un número ' +
  'propio y para ver qué variable manda. No sustituye una memoria de cálculo firmada ni autoriza a ' +
  'ejecutar nada. Verifique todo valor normativo contra el texto vigente.';

export const CITA_SUGERIDA = `${SITE.legalName} — Calculadoras de predimensionamiento, ${SITE.url}/calculadoras`;
P28EOF
echo '  ok  lib/calculadoras.ts'

mkdir -p "$(dirname 'scripts/auditar-html.mjs')"
cat > 'scripts/auditar-html.mjs' <<'P28EOF'
#!/usr/bin/env node
/**
 * AUDITORÍA DEL HTML REALMENTE GENERADO.
 *
 * Por qué contra el HTML y no contra el código. Todas las verificaciones que
 * este proyecto tenía hasta ahora miran el CÓDIGO FUENTE: que un archivo
 * contenga una cadena, que un objeto tenga un campo. Eso deja pasar
 * exactamente la clase de fallo que más daño hace, porque solo existe después
 * de renderizar: un enlace interno a una ruta que ya no existe, dos páginas
 * compitiendo con el mismo <title>, un @id de JSON-LD que apunta al vacío, una
 * página a la que no llega ningún enlace del propio sitio.
 *
 * Ninguno de esos rompe la compilación. Todos erosionan exactamente lo que el
 * sitio existe para construir.
 *
 *   node scripts/auditar-html.mjs            audita .next/server/app
 *   node scripts/auditar-html.mjs --json     salida legible por máquina
 *
 * Sale 1 si hay defectos de gravedad "error". Los "aviso" no rompen la
 * ejecución: son deuda visible, no una parada de línea.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = process.cwd();
const DIR = '.next/server/app';

const rojo = (t) => `\x1b[31m${t}\x1b[0m`;
const ambar = (t) => `\x1b[33m${t}\x1b[0m`;
const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const gris = (t) => `\x1b[90m${t}\x1b[0m`;

if (!existsSync(join(RAIZ, DIR))) {
  console.error(`\nNo existe ${DIR}. Ejecute primero:  npx next build\n`);
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Recolección                                                         */
/* ------------------------------------------------------------------ */

function htmls(dir, out = []) {
  for (const e of readdirSync(join(RAIZ, dir), { withFileTypes: true })) {
    if (e.isDirectory()) htmls(`${dir}/${e.name}`, out);
    else if (e.name.endsWith('.html')) out.push(`${dir}/${e.name}`);
  }
  return out;
}

/** Ruta pública a partir del archivo generado. */
const rutaDe = (archivo) => {
  const r = archivo.slice(DIR.length).replace(/\.html$/, '');
  return r === '/index' ? '/' : r || '/';
};

const paginas = htmls(DIR)
  .map((archivo) => ({ archivo, ruta: rutaDe(archivo), html: readFileSync(join(RAIZ, archivo), 'utf8') }))
  // _not-found es una plantilla de error, no una página del sitio.
  .filter((p) => !p.ruta.startsWith('/_'));

const rutasExistentes = new Set(paginas.map((p) => p.ruta));

/** Rutas que existen pero no son .html: endpoints y documentos generados. */
const noHtml = new Set();
(function endpoints(dir) {
  for (const e of readdirSync(join(RAIZ, dir), { withFileTypes: true })) {
    if (e.isDirectory()) endpoints(`${dir}/${e.name}`);
    else if (/\.(body|meta)$/.test(e.name) || e.name === 'route.js') {
      const r = `${dir}/${e.name}`.slice(DIR.length).replace(/\/route\.js$|\.(body|meta)$/, '');
      if (r) noHtml.add(r);
    }
  }
})(DIR);

/**
 * Rutas declaradas en app/, incluidas las que se renderizan bajo demanda y por
 * tanto NO dejan un .html tras el build.
 *
 * Sin esto el auditor daba 167 falsos positivos de golpe: `/login` existe como
 * página y está enlazada desde el navbar de todas las páginas, pero es
 * dinámica. Un auditor que grita en cada página por algo que está bien es un
 * auditor que se deja de mirar a la segunda ejecución, y entonces no sirve
 * para nada.
 */
const patronesDeclarados = [];
(function rutasApp(dir, ruta = '') {
  for (const e of readdirSync(join(RAIZ, dir), { withFileTypes: true })) {
    if (e.isDirectory()) {
      // Los grupos (carpeta) no aparecen en la URL.
      const seg = /^\(.*\)$/.test(e.name) ? '' : `/${e.name}`;
      rutasApp(`${dir}/${e.name}`, ruta + seg);
    } else if (e.name === 'page.tsx' || e.name === 'page.jsx') {
      patronesDeclarados.push(ruta || '/');
    }
  }
})('app');

/** ¿La ruta encaja con alguna declarada, resolviendo los segmentos dinámicos? */
const rutaDeclarada = (destino) =>
  patronesDeclarados.some((patron) => {
    if (!patron.includes('[')) return patron === destino;
    const re = new RegExp(
      '^' +
        patron
          .split('/')
          .map((seg) =>
            /^\[\.\.\..*\]$/.test(seg) ? '.+' : /^\[.*\]$/.test(seg) ? '[^/]+' : seg.replace(/[.*+?^${}()|\\]/g, '\\$&'),
          )
          .join('/') +
        '$',
    );
    return re.test(destino);
  });

const defectos = [];
const anota = (gravedad, tipo, ruta, detalle) => defectos.push({ gravedad, tipo, ruta, detalle });

/* ------------------------------------------------------------------ */
/* Extracción                                                          */
/* ------------------------------------------------------------------ */

const entre = (html, re) => html.match(re)?.[1]?.trim() ?? null;
const decodificar = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&#x2F;/g, '/');

const titulo = (h) => {
  const t = entre(h, /<title[^>]*>([\s\S]*?)<\/title>/i);
  return t ? decodificar(t) : null;
};
const descripcion = (h) => {
  const m = h.match(/<meta name="description" content="([^"]*)"/i);
  return m ? decodificar(m[1]) : null;
};
const canonico = (h) => h.match(/<link rel="canonical" href="([^"]+)"/i)?.[1] ?? null;
const h1s = (h) => [...h.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => decodificar(m[1].replace(/<[^>]+>/g, '')).trim());

/** Enlaces internos, ya normalizados y sin ancla ni query. */
function enlacesInternos(html) {
  const out = new Set();
  for (const m of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
    let r = m[1];
    if (/^\/(_next|images|fonts|favicon)/.test(r)) continue;
    if (r.length > 1) r = r.replace(/\/$/, '');
    out.add(r || '/');
  }
  return [...out];
}

function bloquesJsonLd(html) {
  const out = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    out.push(m[1]);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Comprobaciones                                                      */
/* ------------------------------------------------------------------ */

const porTitulo = new Map();
const porDescripcion = new Map();
const recibenEnlace = new Set();
const idsDeclarados = new Set();
const idsReferenciados = [];

for (const p of paginas) {
  const { ruta, html } = p;

  // --- Título -------------------------------------------------------
  const t = titulo(html);
  if (!t) anota('error', 'sin-titulo', ruta, 'la página no emite <title>');
  else {
    if (t.length > 65) anota('aviso', 'titulo-largo', ruta, `${t.length} caracteres: Google trunca cerca de 60`);
    if (t.length < 15) anota('aviso', 'titulo-corto', ruta, `«${t}» (${t.length} caracteres)`);
    porTitulo.set(t, [...(porTitulo.get(t) ?? []), ruta]);
  }

  // --- Descripción --------------------------------------------------
  const d = descripcion(html);
  if (!d) anota('error', 'sin-descripcion', ruta, 'la página no emite meta description');
  else {
    if (d.length > 165) anota('aviso', 'descripcion-larga', ruta, `${d.length} caracteres: se trunca cerca de 155`);
    if (d.length < 70) anota('aviso', 'descripcion-corta', ruta, `${d.length} caracteres`);
    porDescripcion.set(d, [...(porDescripcion.get(d) ?? []), ruta]);
  }

  // --- Canónico -----------------------------------------------------
  const c = canonico(html);
  if (!c) anota('error', 'sin-canonico', ruta, 'sin <link rel="canonical">');

  // --- Encabezados --------------------------------------------------
  const hs = h1s(html);
  if (hs.length === 0) anota('error', 'sin-h1', ruta, 'ningún <h1>');
  else if (hs.length > 1) anota('aviso', 'h1-multiple', ruta, `${hs.length} elementos <h1>: ${hs.slice(0, 3).join(' | ')}`);

  // --- Imágenes sin alt ---------------------------------------------
  const sinAlt = [...html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/gi)];
  if (sinAlt.length) anota('error', 'img-sin-alt', ruta, `${sinAlt.length} <img> sin atributo alt`);

  // --- JSON-LD ------------------------------------------------------
  for (const bruto of bloquesJsonLd(html)) {
    let dato;
    try {
      dato = JSON.parse(bruto.replace(/\\u003c/g, '<'));
    } catch (e) {
      anota('error', 'jsonld-invalido', ruta, `bloque JSON-LD no parsea: ${e.message}`);
      continue;
    }
    const recorrer = (n) => {
      if (Array.isArray(n)) return n.forEach(recorrer);
      if (!n || typeof n !== 'object') return;
      const claves = Object.keys(n);
      if (n['@id'] && claves.length > 1) idsDeclarados.add(n['@id']);
      if (n['@id'] && claves.length === 1) idsReferenciados.push({ ruta, id: n['@id'] });
      for (const k of claves) recorrer(n[k]);
    };
    recorrer(dato);
  }

  // --- Enlaces internos ---------------------------------------------
  for (const destino of enlacesInternos(html)) {
    recibenEnlace.add(destino);
    if (rutasExistentes.has(destino) || noHtml.has(destino)) continue;
    // Rutas dinámicas servidas por route.js sin archivo estático.
    if ([...noHtml].some((n) => destino.startsWith(n))) continue;
    // Páginas que existen pero se renderizan bajo demanda.
    if (rutaDeclarada(destino)) continue;
    anota('error', 'enlace-roto', ruta, `enlaza a ${destino}, que no existe`);
  }
}

// --- Duplicados -----------------------------------------------------
for (const [t, rutas] of porTitulo) {
  if (rutas.length > 1) {
    anota('error', 'titulo-duplicado', rutas[0], `«${t}» se repite en ${rutas.length} páginas: ${rutas.join(', ')}`);
  }
}
for (const [d, rutas] of porDescripcion) {
  if (rutas.length > 1) {
    anota('aviso', 'descripcion-duplicada', rutas[0], `misma descripción en ${rutas.length} páginas: ${rutas.slice(0, 5).join(', ')}`);
  }
}

// --- Huérfanas ------------------------------------------------------
// Una página a la que no llega ni un enlace del propio sitio existe solo en el
// sitemap. Se rastrea peor, no acumula señal interna y, en la práctica, es
// contenido que nadie encuentra navegando.
for (const p of paginas) {
  if (p.ruta === '/') continue;
  if (!recibenEnlace.has(p.ruta)) {
    anota('aviso', 'huerfana', p.ruta, 'ninguna página del sitio enlaza aquí');
  }
}

// --- @id colgantes ---------------------------------------------------
for (const { ruta, id } of idsReferenciados) {
  if (!idsDeclarados.has(id)) {
    anota('error', 'jsonld-id-colgante', ruta, `referencia {"@id": "${id}"} que no está declarado en ninguna página`);
  }
}

/* ------------------------------------------------------------------ */
/* Salida                                                              */
/* ------------------------------------------------------------------ */

const errores = defectos.filter((d) => d.gravedad === 'error');
const avisos = defectos.filter((d) => d.gravedad === 'aviso');

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ paginas: paginas.length, errores: errores.length, avisos: avisos.length, defectos }, null, 2));
  process.exit(errores.length ? 1 : 0);
}

console.log(`\nAuditoría del HTML generado — ${paginas.length} páginas, ${patronesDeclarados.length} rutas declaradas\n`);

const porTipo = new Map();
for (const d of defectos) porTipo.set(d.tipo, [...(porTipo.get(d.tipo) ?? []), d]);

for (const [tipo, lista] of [...porTipo].sort((a, b) => b[1].length - a[1].length)) {
  const grave = lista[0].gravedad === 'error';
  const marca = grave ? rojo('✗') : ambar('!');
  console.log(`  ${marca} ${tipo} — ${lista.length}`);
  for (const d of lista.slice(0, 8)) console.log(gris(`      ${d.ruta}: ${d.detalle}`));
  if (lista.length > 8) console.log(gris(`      … y ${lista.length - 8} más`));
  console.log('');
}

if (!defectos.length) console.log(`  ${verde('Sin defectos.')}\n`);

console.log(
  `Resultado: ${errores.length ? rojo(`${errores.length} errores`) : verde('0 errores')}, ` +
    `${avisos.length ? ambar(`${avisos.length} avisos`) : verde('0 avisos')}\n`,
);

process.exit(errores.length ? 1 : 0);
P28EOF
echo '  ok  scripts/auditar-html.mjs'

mkdir -p "$(dirname 'test/auditoria.test.ts')"
cat > 'test/auditoria.test.ts' <<'P28EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * LO QUE SOLO SE VE EN EL HTML SERVIDO.
 *
 * El defecto que estas pruebas custodian se midió, no se supuso. Sobre el HTML
 * realmente generado, /productos —la página comercial más importante del
 * sitio— contenía:
 *
 *   · ningún <h1>
 *   · CERO enlaces `href="/productos/…"`, de 36 fichas
 *   · como texto del cuerpo: «Cargando catálogo…»
 *
 * Causa: la página era 'use client' entera y envolvía todo en <Suspense>. Como
 * la rejilla lee `useSearchParams`, Next solo podía prerenderizar el fallback.
 * El mismo patrón dejaba /cotizacion —la página de conversión— sin encabezado
 * y sin una línea de texto.
 *
 * Lo insidioso es que NADA fallaba: compilaba, pasaba los tipos, pasaba las
 * 440 pruebas, y el ItemList de JSON-LD declaraba las 36 URLs, así que las
 * fichas se indexaban igual desde el sitemap. Pero un ItemList no es un grafo
 * de enlaces: el catálogo no le pasaba señal interna a ninguna ficha, y
 * cualquier agente que lea HTML sin ejecutar JavaScript veía una página vacía
 * donde debería estar el portafolio entero.
 */

const raiz = process.cwd();
const leer = (r: string) => readFileSync(join(raiz, r), 'utf8');

/**
 * Solo el cuerpo del componente exportado.
 *
 * Comparar posiciones sobre el archivo entero mide la prosa y los imports:
 * `import { Suspense }` aparece en la línea 5 y un comentario que EXPLICA por
 * qué el encabezado va fuera del Suspense lo menciona otra vez. Ya se cayó en
 * esta trampa antes en este repositorio, con `will-change` y con
 * `toLocaleString`. Se afirma sobre el JSX.
 */
const jsx = (src: string) => src.slice(src.lastIndexOf('export default function'));

describe('el catálogo se sirve como HTML, no como promesa', () => {
  it('/productos es un componente de SERVIDOR', () => {
    const src = leer('app/productos/page.tsx');
    expect(src.startsWith("'use client'"), '/productos volvió a ser cliente entero').toBe(false);
    expect(src).toMatch(/import IndiceCatalogo/);
    expect(src).toMatch(/<IndiceCatalogo \/>/);
  });

  it('el <h1> y la entrada están fuera del Suspense', () => {
    // Dentro del Suspense, lo único que se prerenderiza es el fallback.
    const cuerpo = jsx(leer('app/productos/page.tsx'));
    expect(cuerpo.indexOf('<h1 className')).toBeGreaterThan(-1);
    expect(cuerpo.indexOf('<h1 className')).toBeLessThan(cuerpo.indexOf('<Suspense'));
  });

  it('el índice enlaza a TODAS las fichas del catálogo', () => {
    const src = leer('components/IndiceCatalogo.tsx');
    // Se deriva del catálogo: no puede quedarse corto al añadir un producto.
    expect(src).toMatch(/products\.filter/);
    expect(src).toMatch(/href=\{`\/productos\/\$\{p\.slug\}`\}/);
    expect(src).not.toMatch(/^'use client'/);
  });

  it('la rejilla filtrable ya no arrastra el encabezado', () => {
    // Dos <h1> en la misma página compiten por decir de qué trata.
    const src = leer('components/CatalogoFiltrado.tsx');
    expect(src).not.toMatch(/<h1\s+className/);
    expect(src.startsWith("'use client'")).toBe(true);
  });

  it('/cotizacion tiene su encabezado fuera del Suspense', () => {
    const cuerpo = jsx(leer('app/cotizacion/page.tsx'));
    const h1 = cuerpo.indexOf('<h1 className');
    const suspense = cuerpo.indexOf('<Suspense');
    expect(h1).toBeGreaterThan(-1);
    expect(suspense).toBeGreaterThan(-1);
    expect(h1, 'el <h1> volvió a caer dentro del Suspense').toBeLessThan(suspense);
  });

  it('carrito y checkout emiten encabezado antes de montar', () => {
    // Devolvían un div vacío: la página se servía literalmente sin contenido.
    for (const r of ['app/carrito/page.tsx', 'app/checkout/page.tsx']) {
      const src = leer(r);
      const guarda = src.indexOf('if (!mounted)');
      expect(guarda, r).toBeGreaterThan(-1);
      const bloque = src.slice(guarda, guarda + 700);
      expect(bloque, `${r}: sigue devolviendo un contenedor vacío`).toMatch(/<h1\s+className/);
    }
  });

  it('las páginas transaccionales declaran título propio y noindex', () => {
    // Tres URLs distintas compartían el MISMO <title> por defecto del sitio,
    // que es exactamente la señal de duplicado que se quiere evitar.
    const titulos = new Set<string>();
    for (const r of ['app/carrito/layout.tsx', 'app/checkout/layout.tsx', 'app/checkout/exito/layout.tsx']) {
      const src = leer(r);
      const t = src.match(/title:\s*'([^']+)'/)?.[1];
      expect(t, `${r} sin título propio`).toBeTruthy();
      titulos.add(t!);
      expect(src, `${r} sin canónico`).toMatch(/alternates:\s*\{\s*canonical/);
      // robots.txt impide el rastreo, pero una URL enlazada desde fuera puede
      // indexarse sin haber sido rastreada. El meta lo cierra.
      expect(src, `${r} sin noindex`).toMatch(/robots:\s*\{\s*index:\s*false/);
    }
    expect(titulos.size, 'los tres títulos deben ser distintos entre sí').toBe(3);
  });
});

describe('el auditor del HTML es un mecanismo, no un script suelto', () => {
  it('está enlazado en package.json y corre en CI después del build', () => {
    const pkg = JSON.parse(leer('package.json'));
    expect(pkg.scripts.auditar).toContain('auditar-html.mjs');
    const ci = leer('.github/workflows/ci.yml');
    const pasos = ci.slice(ci.indexOf('    steps:'));
    expect(pasos).toMatch(/npm run auditar/);
    // Audita la salida del build: antes del build no hay nada que auditar.
    expect(pasos.indexOf('next build')).toBeLessThan(pasos.indexOf('npm run auditar'));
  });

  it('conoce las rutas dinámicas y no grita por ellas', () => {
    // Sin esto daba 167 falsos positivos de golpe por /login, que existe y es
    // dinámica. Un auditor que grita por lo que está bien deja de mirarse.
    const src = leer('scripts/auditar-html.mjs');
    expect(src).toMatch(/rutaDeclarada/);
    expect(src).toMatch(/patronesDeclarados/);
  });

  it('distingue error de aviso y solo falla por errores', () => {
    const src = leer('scripts/auditar-html.mjs');
    expect(src).toMatch(/process\.exit\(errores\.length \? 1 : 0\)/);
    for (const tipo of ['enlace-roto', 'sin-h1', 'sin-canonico', 'titulo-duplicado', 'jsonld-id-colgante']) {
      expect(src, `${tipo} debería ser error`).toMatch(new RegExp(`'error', '${tipo}'`));
    }
  });

  it('el título de la plantilla no se come el espacio del clic', () => {
    // El sufijo de 27 caracteres causaba por sí solo 67 de los 100 títulos
    // recortados. La razón social exacta sigue en el JSON-LD y en llms.txt,
    // que es donde de verdad desambigua la entidad.
    const src = leer('app/layout.tsx');
    const plantilla = src.match(/template:\s*'([^']+)'/)?.[1] ?? '';
    expect(plantilla).toBeTruthy();
    expect(plantilla.replace('%s', '').length, `sufijo demasiado largo: «${plantilla}»`).toBeLessThanOrEqual(16);
  });

  it('ninguna calculadora usa su pregunta como <title>', () => {
    const src = leer('app/calculadoras/[slug]/page.tsx');
    expect(src).toMatch(/title: calc\.tituloSeo/);
    expect(src).not.toMatch(/title: calc\.pregunta/);
  });
});
P28EOF
echo '  ok  test/auditoria.test.ts'

mkdir -p "$(dirname 'package.json')"
cat > 'package.json' <<'P28EOF'
{
  "name": "plastilonas-peruanas",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:smoke": "bash scripts/smoke.sh",
    "audit:ui": "node scripts/audit-ui.mjs",
    "verify:deploy": "bash scripts/verificar-despliegue.sh",
    "vigilancia": "node scripts/vigilancia-fuentes.mjs",
    "imagenes": "node scripts/imagenes.mjs",
    "imagenes:prompts": "node scripts/imagenes.mjs --prompts",
    "imagenes:glosario": "node scripts/imagenes.mjs --prompts --grupo glosario",
    "imagenes:tomas": "node scripts/imagenes.mjs --tomas",
    "imagenes:tomas:glosario": "node scripts/imagenes.mjs --tomas --grupo glosario",
    "auditar": "node scripts/auditar-html.mjs",
    "auditar:json": "node scripts/auditar-html.mjs --json"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "^1.2.12",
    "@ai-sdk/react": "^1.2.12",
    "@hookform/resolvers": "^3.9.1",
    "@supabase/supabase-js": "^2.45.4",
    "ai": "^4.3.16",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.4",
    "date-fns": "^4.1.0",
    "framer-motion": "^11.18.2",
    "lucide-react": "^0.469.0",
    "next": "^15.5.20",
    "next-auth": "^5.0.0-beta.31",
    "pdf-lib": "^1.17.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.2",
    "react-icons": "^5.7.0",
    "sonner": "^1.7.1",
    "stripe": "^17.5.0",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.24.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.20",
    "eslint": "^9",
    "eslint-config-next": "15.3.3",
    "jsdom": "^25.0.1",
    "postcss": "^8",
    "sharp": "^0.35.3",
    "tailwindcss": "^3.4.17",
    "typescript": "^5",
    "vitest": "^2.1.8"
  }
}
P28EOF
echo '  ok  package.json'

mkdir -p "$(dirname '.github/workflows/ci.yml')"
cat > '.github/workflows/ci.yml' <<'P28EOF'
name: CI

# POR QUÉ EXISTE ESTE FLUJO.
#
# Un error de frontera entre servidor y cliente —pasar una función como prop a
# un componente 'use client'— pasa limpiamente por `tsc` y por las 400 pruebas,
# y solo aparece en la fase de PRERENDERIZADO de `next build`. Ocurrió: el
# commit se empujó, Vercel intentó construir, falló, y el sitio se quedó
# sirviendo el commit anterior durante cinco minutos mientras el verificador
# de despliegue esperaba algo que nunca iba a llegar.
#
# Vercel ya construye en cada push, pero su fallo se ve en un panel que hay que
# ir a mirar. Este flujo hace lo mismo delante: falla en rojo, en el repositorio,
# con el log al lado, y marca el commit como roto para cualquiera que lo mire.
#
# El build corre DESPUÉS de tipos y pruebas a propósito: son diez segundos
# contra dos minutos, y no tiene sentido compilar 240 páginas para descubrir
# que faltaba un punto y coma.

on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  # Un push nuevo cancela la comprobación del anterior: lo que importa es si
  # la punta de la rama construye, no si construía hace tres commits.
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verificar:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Instalar dependencias
        run: npm ci

      - name: Tipos
        run: npx tsc --noEmit

      - name: Pruebas
        run: npx vitest run --reporter=dot

      - name: Build de producción
        # La única verificación que ve un error de prerenderizado.
        run: npx next build

      - name: Auditar el HTML generado
        # Enlaces rotos, títulos duplicados, páginas sin <h1> ni canónico,
        # JSON-LD con @id colgantes. Nada de eso rompe la compilación y todo
        # eso erosiona exactamente lo que el sitio existe para construir.
        # Corre DESPUÉS del build porque audita su salida, no el código.
        run: npm run auditar
P28EOF
echo '  ok  .github/workflows/ci.yml'

echo ""
echo "P28 — verificando..."
npx tsc --noEmit
echo "  ok  TypeScript"
npx vitest run --reporter=dot
echo "  ok  pruebas"

echo ""
echo "P28 — build de producción (la única verificación que ve un error de prerenderizado)"
npx next build
echo "  ok  build"

echo ""
echo "P28 — auditoría del HTML realmente generado"
npm run auditar

echo ""
echo "P28 — lo que ahora ve un rastreador en /productos:"
echo -n "   enlaces a fichas: "
grep -o 'href="/productos/[a-z0-9-]*"' .next/server/app/productos.html | sort -u | wc -l
echo -n "   encabezado: "
grep -o '<h1[^>]*>[^<]*' .next/server/app/productos.html | head -1

echo ""
echo "============================================================"
echo " P28 aplicado, construido y auditado. Ahora sí:"
echo ""
echo "   git add -A"
echo "   git commit -m 'fix(p28): el catalogo se sirve como HTML; auditor del HTML generado en CI'"
echo "   git push"
echo "   npm run verify:deploy"
echo "============================================================"
