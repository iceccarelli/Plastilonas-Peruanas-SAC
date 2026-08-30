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

# ─────────────────────────────────────────────────────────────────────────────
# EL ORIGEN, RESUELTO COMO LO RESUELVE lib/site.ts — Y NO COMO SOLÍA ESTAR
# ─────────────────────────────────────────────────────────────────────────────
#
# Esto estuvo roto veintiséis commits, en silencio, y es el peor fallo posible
# en un verificador: no avisaba de nada, y encima siempre daba error, así que
# se aprendió a ignorarlo.
#
# La versión anterior buscaba una línea `url: "https://…"` en lib/site.ts. Esa
# línea existió hasta que la fase 29 introdujo el interruptor de dominio y la
# convirtió en `url: originFromEnv()`. Desde entonces el grep no casaba con
# nada, BASE_URL quedaba VACÍA, y cada `curl "$BASE_URL/version.json"` pedía una
# ruta relativa que no existe. El script informaba «sirviendo desconocido»
# durante 300 segundos y concluía que el despliegue no había llegado — mientras
# el sitio servía perfectamente el commit correcto.
#
# Ahora se resuelve en el mismo orden que originFromEnv(): CANONICAL_ORIGIN
# primero, y si no está, el literal de reserva que ese archivo declara. No se
# escribe ningún host a mano aquí: test/dominio.test.ts rompe el build si
# alguien lo intenta, y con razón — un verificador con su propia copia del
# dominio es el archivo que se queda atrás el día de la migración.
#
# SEGUNDA VEZ. Este grep volvió a quedarse sin ancla cuando se sacó
# NEXT_PUBLIC_SITE_URL del fallback —era la variable de Stripe y podía mandar
# todos los canónicos a localhost—. La lección de la primera vez era anclar en
# algo estable, y `process.env.…` no lo era. Ahora se ancla en la CONSTANTE que
# originFromEnv() devuelve por defecto, que es un nombre y no un camino de
# ejecución, y test/deploy-verify.test.ts comprueba que siga casando.
SITE_URL="${CANONICAL_ORIGIN:-}"
if [ -z "$SITE_URL" ]; then
  SITE_URL=$(grep -E '^const ORIGEN_POR_DEFECTO' lib/site.ts \
    | grep -oE '"https://[^"]+"' | head -1 | tr -d '"')
fi
BASE_URL="${BASE_URL:-$SITE_URL}"

# Fallar RUIDOSAMENTE si no hay origen. El defecto real no fue que el grep
# dejara de casar: fue que al no casar el script siguió adelante con una cadena
# vacía en vez de parar. Un verificador que no puede verificar tiene que decirlo
# en la primera línea, no en la línea trescientos.
if [ -z "$BASE_URL" ]; then
  printf '\033[31mNo se pudo resolver el origen del sitio desde lib/site.ts.\033[0m\n'
  echo "Pase BASE_URL=https://… al ejecutar, o revise originFromEnv() en lib/site.ts."
  exit 2
fi
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
  # ───────────────────────────────────────────────────────────────────────────
  # ¿ESTÁ EL COMMIT EN EL REMOTO? PORQUE VERCEL CONSTRUYE LO QUE HAY EN GITHUB
  # ───────────────────────────────────────────────────────────────────────────
  #
  # Este script esperaba trescientos segundos a un commit que sólo existía en el
  # disco local, y después culpaba al build. El mensaje era largo, detallado y
  # convincente —hablaba de errores de prerenderizado— y llevó a buscar el fallo
  # exactamente donde no estaba, dos veces.
  #
  # Un verificador que se equivoca con seguridad es peor que uno que calla.
  git fetch -q 2>/dev/null || true
  if git rev-parse --verify --quiet '@{u}' >/dev/null 2>&1 \
     && ! git merge-base --is-ancestor "$COMMIT" '@{u}' 2>/dev/null; then
    printf '  \033[33m! El commit %s no está en el remoto todavía.\033[0m\n' "$COMMIT"
    echo "    Vercel construye lo que hay en GitHub, no lo que hay en su disco."
    echo "    Haga «git push» y vuelva a ejecutar esto."
    exit 3
  fi

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
      echo "  Antes de culpar al build: compruebe que $COMMIT está en el remoto"
      echo "  («git log origin/main -1»). Vercel construye GitHub, no su disco."
      echo ""
      echo "  Si sí está, lo más probable es que el BUILD FALLÓ."
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
         /big-bags /lonas-camiones /ventilacion-minera \
         /local /marco /marco/evaluacion /soluciones /novedades /glosario \
         /informes /indicadores /descargas /privacidad /terminos \
         /calculadoras /calculadoras/caudal-ventilacion-mina \
         /calculadoras/geomembrana-poza; do
  ruta "$r"
done

echo "— Archivos para rastreadores —"
ruta /robots.txt
ruta /sitemap.xml
ruta /sitemaps/pages.xml
ruta /sitemaps/productos.xml
ruta /sitemaps/industrias.xml
ruta /sitemaps/recursos.xml
ruta /llms.txt
ruta /novedades/rss.xml
ruta /novedades/feed.json
ruta /glosario/terminos.json
ruta /indicadores/datos.json
ruta /productos/catalogo.json
ruta /calculadoras/formulas.json
ruta /indexnow-key.txt
ruta /version.json
# Superficies de recuperación por máquina añadidas con el mapa de consultas.
ruta /mapa-consultas.json
# Tarjeta de entidad. Sustituye al antiguo public/entidad.json estático, que
# declaraba otro dominio en su @id y cobertura en cinco países.
ruta /entidad.json
ruta /llms-full.txt
ruta /productos/big-bags-bolsones-polipropileno/contenido.md

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
# /sitemap.xml es un ÍNDICE: las URLs viven en sus cuatro hijos. Contar <loc>
# en el índice daría 4 y pasaría por bueno cualquier sitemap hijo vacío.
cuenta "/sitemap.xml" '<sitemap>'      4 "sitemaps declarados en el índice"
cuenta "/sitemaps/productos.xml"  '<loc>'      40 "URLs de catálogo"
cuenta "/sitemaps/pages.xml"      '<loc>'      20 "URLs de páginas"
cuenta "/sitemaps/industrias.xml" 'soluciones'  7 "arquitecturas en el sitemap"
cuenta "/sitemaps/recursos.xml"   'novedades'   8 "novedades en el sitemap"
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
# El mapa de consultas va ANTES del catálogo en llms.txt: es la tabla de
# decisión que evita que un agente elija entre ocho páginas parecidas.
contiene "/llms.txt" 'Mapa de consultas comerciales' "llms.txt declara el mapa de consultas"
contiene "/mapa-consultas.json" '"canonica"' "el mapa declara una canónica por clúster"
contiene "/mapa-consultas.json" 'Una consulta, una página' "el mapa declara su propia regla"
# La escisión de identidad se comprueba contra el HTML servido, no contra el
# repositorio: es el único sitio donde se ve qué origen declara de verdad.
contiene "/entidad.json" '#organization' "la tarjeta de entidad declara el nodo de organización"
if grep -q 'plastilonas\.com/#' <<< "$(cuerpo /entidad.json)"; then
  fallo "/entidad.json declara un @id en el dominio de marca mientras el sitio se sirve desde otro host"
else
  ok "/entidad.json declara su @id en el origen que se rastrea"
fi
contiene "/llms-full.txt" 'corpus completo para agentes' "el corpus se sirve entero"
contiene "/productos/big-bags-bolsones-polipropileno/contenido.md" 'Hechos citables' "el espejo trae el bloque de citación"
contiene "/productos/big-bags-bolsones-polipropileno" '"@type":"BreadcrumbList"' "la ficha de producto declara su jerarquía"

# La prueba de propiedad de IndexNow. Sin ella, el envío obtiene 403 y el sitio
# es invisible para Bing, Yandex, Seznam, Naver y Yep — y, por la vía de Bing,
# para la búsqueda de ChatGPT. Respondía 404 hasta que la clave pasó al
# repositorio: se comprueba que sirve EXACTAMENTE la clave, no que exista.
clave_repo=$(grep -oE "INDEXNOW_KEY = '[^']+'" lib/indexnow.ts | grep -oE "'[^']+'" | tr -d "'")
clave_viva=$(cuerpo /indexnow-key.txt | tr -d '[:space:]')
if [ -n "$clave_repo" ] && [ "$clave_viva" = "$clave_repo" ]; then
  ok "la prueba de propiedad de IndexNow sirve la clave del repositorio"
else
  bad "la prueba de propiedad de IndexNow no coincide con lib/indexnow.ts"
fi

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
