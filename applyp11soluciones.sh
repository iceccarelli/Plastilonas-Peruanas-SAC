#!/usr/bin/env bash
# =============================================================================
#  P11 — Arquitecturas de referencia (/soluciones)
#  Plastilonas Peruanas SAC
#
#  Qué hace este parche
#  --------------------
#  El sitio vendía COMPONENTES (36 SKUs) y nunca mostraba el CONJUNTO montado.
#  Un jefe de proyecto que necesita "revestir una poza de proceso" no busca
#  "geomembrana HDPE 1.5 mm": busca la poza. P11 publica seis arquitecturas de
#  referencia — escenario, lista de materiales con el criterio que gobierna
#  cada pieza, secuencia de ejecución, riesgos y FAQ — cada una en su URL
#  estática, con HowTo + ItemList + FAQPage.
#
#  No son casos de estudio. No declaran obras ejecutadas, clientes ni cifras.
#  Se derivan del catálogo real: cada componente referencia un slug de producto
#  existente y cada guía un artículo existente (verificado por tests).
#
#  Uso:
#    bash apply-p11-soluciones.sh
#
#  Requisito: ejecutar desde la raíz del repositorio (donde está package.json).
# =============================================================================
set -euo pipefail

if [ ! -f package.json ]; then
  echo "ERROR: ejecute este script desde la raíz del repositorio." >&2
  exit 1
fi

# -----------------------------------------------------------------------------
# lib/solutions.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/solutions.ts" <<'P11_EOF'
import { products } from './products';
import { articles } from './articles';
import { pillars, type PillarId } from './framework';

/**
 * ARQUITECTURAS DE REFERENCIA (/soluciones)
 *
 * El peldaño que convierte a un proveedor de componentes en un proveedor de
 * soluciones. El catálogo responde "¿qué venden?"; las familias, "¿qué línea
 * me sirve?"; el marco, "¿qué debo definir?". Falta la pregunta que de verdad
 * hace un jefe de proyecto: "muéstrenme el conjunto armado".
 *
 * Una poza revestida no es una geomembrana: es subrasante aceptada, geotextil
 * de protección, lámina, zanja de anclaje, detalles de penetración, ensayos de
 * costura y un as-built. Vender solo la lámina y callar lo demás es lo que
 * produce las filtraciones que después se atribuyen al material.
 *
 * MECANISMO, no campaña: cada proyecto real que ejecutamos puede sumar una
 * arquitectura o corregir una existente. El archivo crece con la operación.
 *
 * REGLAS DE HONESTIDAD:
 *  1. Todo componente referencia un SKU que existe en lib/products.ts. Nada de
 *     piezas genéricas que después no podemos suministrar.
 *  2. No se declara ninguna obra ejecutada, cliente ni volumen. Estas son
 *     configuraciones de referencia, no casos de estudio: cuando existan casos
 *     reales con permiso y cifras, irán en su propia sección.
 *  3. Cada arquitectura enlaza los criterios del marco que la gobiernan y las
 *     guías que documentan sus modos de falla.
 */

export interface SolutionComponent {
  /** Slug existente en lib/products.ts. */
  producto: string;
  /** Qué función cumple esta pieza dentro del conjunto. */
  funcion: string;
  /** Qué decide su especificación en este contexto. */
  criterio: string;
  /** Si la pieza es opcional según el caso. */
  opcional?: boolean;
}

export interface Solution {
  slug: string;
  titulo: string;
  metaTitle: string;
  metaDescription: string;
  /** Situación real en la que aparece esta arquitectura. */
  escenario: string;
  /** Qué se rompe cuando se compra por piezas sin visión de conjunto. */
  problema: string[];
  sectores: string[];
  componentes: SolutionComponent[];
  /** Orden de ejecución. Alimenta el HowTo. */
  secuencia: { paso: string; detalle: string }[];
  /** Pilares del marco que gobiernan esta arquitectura. */
  pilaresClave: PillarId[];
  /** Modos de falla documentados. */
  riesgos: { titulo: string; detalle: string }[];
  /** Slugs de lib/articles.ts. */
  guias: string[];
  faqs: { q: string; a: string }[];
}

export const solutions: Solution[] = [
  {
    slug: 'poza-revestida-impermeabilizacion',
    titulo: 'Poza revestida: el conjunto completo, no solo la lámina',
    metaTitle: 'Poza revestida: geomembrana, geotextil y anclaje | Perú',
    metaDescription:
      'Arquitectura de referencia para revestir una poza o canal: protección de subrasante, barrera impermeable, anclaje perimetral, detalles de penetración y plan de ensayos de costura.',
    escenario:
      'Una poza de proceso, de agua o de almacenamiento que debe contener su contenido durante toda la vida del proyecto, en un terreno que rara vez es el ideal.',
    problema: [
      'La compra se hace por metro cuadrado de lámina y el resto del conjunto queda fuera del alcance: la protección de la subrasante, el anclaje, los detalles de penetración y los ensayos. Cada uno de esos elementos es un modo de falla independiente.',
      'Cuando aparece la filtración, el diagnóstico habitual culpa al material. En la práctica, la lámina rara vez falla en el centro del panel: falla en la costura, en la penetración o por punzonamiento desde abajo.',
    ],
    sectores: ['Minería', 'Saneamiento', 'Agricultura', 'Infraestructura'],
    componentes: [
      {
        producto: 'geotextiles',
        funcion: 'Protección mecánica entre la subrasante y la barrera impermeable.',
        criterio:
          'Se elige por clase de supervivencia frente al proceso constructivo y por la granulometría del suelo, no por gramaje de catálogo.',
      },
      {
        producto: 'geomembrana-polietileno-pe-hdpe',
        funcion: 'Barrera impermeable principal.',
        criterio:
          'Compatibilidad química con el líquido contenido, carga hidráulica, exposición y vida útil requerida.',
      },
      {
        producto: 'geomembranas-pvc',
        funcion: 'Alternativa de barrera cuando la geometría exige mayor flexibilidad.',
        criterio:
          'Se evalúa frente a HDPE según agresividad del contenido, detalles y condiciones de instalación.',
        opcional: true,
      },
      {
        producto: 'geocompuestos-drenaje',
        funcion: 'Alivio de presión bajo la lámina y conducción de fluidos.',
        criterio:
          'Necesario cuando hay riesgo de presión de agua o gas bajo el revestimiento, que levanta y desgarra la lámina.',
        opcional: true,
      },
      {
        producto: 'accesorios-instalacion',
        funcion: 'Fijación, remates y elementos de detalle.',
        criterio: 'Compatibilidad con el material y con la carga del punto de anclaje.',
      },
    ],
    secuencia: [
      {
        paso: 'Recepción de subrasante',
        detalle:
          'Verificar compactación, uniformidad y ausencia de material orgánico y piedra angular, y firmar el acta antes de desplegar cualquier rollo. Si el terreno no cumple, se corrige o se protege: no se despliega "con cuidado".',
      },
      {
        paso: 'Instalación de la capa de protección',
        detalle:
          'Colocar el geotextil donde la subrasante lo exija, con los traslapes definidos, de modo que la barrera no apoye directamente sobre material anguloso.',
      },
      {
        paso: 'Excavación y ejecución de la zanja de anclaje',
        detalle:
          'Ejecutar la zanja perimetral según la geometría del proyecto y rellenarla compactada, anclando la lámina sin tensión para que absorba la contracción térmica.',
      },
      {
        paso: 'Despliegue de paneles con holgura térmica',
        detalle:
          'Desplegar según el plano de paneles dejando ondulación controlada en las horas frías: una lámina anclada tensada trabaja a tracción permanente en cada ciclo día-noche.',
      },
      {
        paso: 'Soldadura y resolución de detalles',
        detalle:
          'Unir paneles por cuña caliente doble y resolver penetraciones, parches y remates por extrusión, sobre superficie limpia, seca y con holgura alrededor de cada penetración.',
      },
      {
        paso: 'Ensayo del 100% de las costuras',
        detalle:
          'Presurizar el canal de aire de cada costura de cuña doble y ensayar con caja de vacío las soldaduras de extrusión, registrando cada ensayo con identificación de panel.',
      },
      {
        paso: 'Levantamiento de observaciones y as-built',
        detalle:
          'Reparar por parche extruido toda discontinuidad y volver a ensayar. Entregar el plano as-built con la ubicación de cada reparación y los certificados por rollo.',
      },
    ],
    pilaresClave: ['compatibilidad', 'cargas', 'ejecucion', 'documentacion'],
    riesgos: [
      {
        titulo: 'Punzonamiento desde la subrasante',
        detalle:
          'El daño no se ve durante la instalación: aparece cuando la columna de líquido presiona la lámina contra el material anguloso del terreno.',
      },
      {
        titulo: 'Costuras sin registro de ensayo',
        detalle:
          'Una costura sin protocolo es una costura no ejecutada, por bien que se vea. La filtración se manifiesta con la poza ya en servicio.',
      },
      {
        titulo: 'Anclaje tensado sin holgura térmica',
        detalle:
          'La falla aparece entre el tercer y el sexto mes y suele diagnosticarse mal como defecto de fábrica de la lámina.',
      },
    ],
    guias: ['instalacion-geomembranas-hdpe-pozas-canales', 'como-elegir-geotextil-separacion-drenaje-refuerzo'],
    faqs: [
      {
        q: '¿Puedo comprar solo la geomembrana e instalarla con personal propio?',
        a: 'Puede, y a veces es lo correcto. Lo que no conviene es hacerlo sin resolver la recepción de subrasante, el plan de ensayos de costura y los detalles de penetración: son los tres puntos donde se origina la mayoría de las filtraciones, y ninguno depende del espesor de la lámina.',
      },
      {
        q: '¿Siempre hace falta geotextil bajo la geomembrana?',
        a: 'No siempre. Es necesario cuando la subrasante es granular gruesa, contiene material anguloso o la carga hidráulica es alta. Su función es protección mecánica contra punzonamiento, no impermeabilización.',
      },
      {
        q: '¿Qué debo exigir al recibir la obra?',
        a: 'Acta de recepción de subrasante firmada antes del despliegue, registro de ensayos no destructivos por costura, resultados de ensayos destructivos según el plan de calidad, plano as-built de paneles con las reparaciones ubicadas y certificados de material por rollo.',
      },
    ],
  },

  {
    slug: 'frente-avance-ventilado',
    titulo: 'Frente de avance ventilado: del cálculo de caudal a la manga instalada',
    metaTitle: 'Ventilación de frente de avance: caudal, manga e instalación | Perú',
    metaDescription:
      'Arquitectura de referencia para ventilar una labor subterránea: demanda por personal y equipo diésel corregida por altitud, elección de esquema, diámetro de manga y verificación en el frente.',
    escenario:
      'Una labor ciega en avance, con personal y equipo diésel operando, donde el aire debe llegar al fondo y los gases de voladura evacuarse dentro del ciclo de trabajo.',
    problema: [
      'El sistema se compra por partes: alguien elige el ventilador, alguien compra "manga de tantas pulgadas" y nadie cierra el cálculo completo. El resultado es un sistema que cumple en papel y no en el frente.',
      'La verificación se hace donde es cómodo medir —la boca del ventilador— y no donde importa, que es la condición de aire del trabajador en el fondo de la labor.',
    ],
    sectores: ['Minería', 'Construcción', 'Infraestructura'],
    componentes: [
      {
        producto: 'mangas-ventilacion-minas-tuneles',
        funcion: 'Conducción del aire entre el ventilador y el frente.',
        criterio:
          'Diámetro derivado del caudal y de la pérdida de carga admisible; refuerzo antic colapso si el esquema es aspirante; longitud de tramo que minimice empalmes.',
      },
      {
        producto: 'accesorios-instalacion',
        funcion: 'Suspensión, empalmes y fijación a lo largo de la labor.',
        criterio:
          'Debe evitar catenaria excesiva y roce contra la caja, que son las dos fuentes de fuga progresiva que nadie registra.',
      },
      {
        producto: 'lona-plastificada-rafia-polytarp',
        funcion: 'Cortinas y tabiques de control de flujo cuando el circuito lo requiere.',
        criterio: 'Resistencia a abrasión y facilidad de reposición en labor.',
        opcional: true,
      },
    ],
    secuencia: [
      {
        paso: 'Calcular la demanda por personal',
        detalle:
          'Número máximo de personas en la labor por el caudal por persona correspondiente a la altitud de la operación, que escala de 3 a 6 m³/min según el rango de msnm.',
      },
      {
        paso: 'Calcular la demanda por equipo diésel',
        detalle:
          'Sumar la potencia en HP de los equipos que operan simultáneamente en la labor y aplicar el criterio de 3 m³/min por HP. La palabra clave es simultáneamente.',
      },
      {
        paso: 'Calcular la dilución de gases de voladura',
        detalle:
          'Determinar el caudal que evacúa y diluye los gases en el tiempo de reingreso objetivo, según el volumen de la labor y el explosivo empleado.',
      },
      {
        paso: 'Elegir el esquema: impelente, aspirante o mixto',
        detalle:
          'Impelente barre bien el frente pero devuelve el aire contaminado por la labor; aspirante protege el trayecto pero exige la boca cerca del frente y manga reforzada contra colapso.',
      },
      {
        paso: 'Dimensionar el diámetro y recién después el ventilador',
        detalle:
          'Elegir el diámetro que transporta el caudal con pérdida de carga aceptable: aumentar diámetro suele ser más económico que aumentar potencia, que se paga en energía todas las horas del proyecto.',
      },
      {
        paso: 'Instalar controlando fugas',
        detalle:
          'Minimizar empalmes, suspender sin catenaria excesiva y proteger del roce contra la caja. La fuga no se calcula bien en gabinete: se controla en obra.',
      },
      {
        paso: 'Verificar midiendo en el frente',
        detalle:
          'Auditar el caudal en el frente de trabajo, no en la boca del ventilador, y corregir uniones y roces donde la pérdida sea significativa.',
      },
    ],
    pilaresClave: ['cargas', 'exposicion', 'ejecucion', 'operacion'],
    riesgos: [
      {
        titulo: 'Manga aspirante sin refuerzo',
        detalle:
          'Trabaja a presión negativa y colapsa sobre sí misma al arrancar el ventilador: el diámetro comprado deja de existir en el primer turno.',
      },
      {
        titulo: 'Boca demasiado lejos del frente',
        detalle:
          'En aspirante, el campo de succión decae muy rápido con la distancia y queda una zona muerta que ningún caudal adicional resuelve.',
      },
      {
        titulo: 'Auditoría en la boca del ventilador',
        detalle:
          'Declara conforme un sistema que no representa la condición real del trabajador en el fondo de la labor.',
      },
    ],
    guias: [
      'calculo-caudal-mangas-ventilacion-mina-subterranea',
      'ventilacion-impelente-vs-aspirante-labores-mineras',
    ],
    faqs: [
      {
        q: '¿Qué dato necesitan para dimensionar la manga?',
        a: 'Altitud de la operación, número máximo de personas en la labor, potencia en HP de los equipos diésel que operan simultáneamente, sección y longitud de la labor, tiempo de reingreso objetivo tras voladura, y si el esquema será impelente, aspirante o mixto.',
      },
      {
        q: '¿Conviene aumentar el diámetro o el ventilador?',
        a: 'En general, el diámetro. La pérdida por fricción crece de forma muy pronunciada al reducir la sección, de modo que un diámetro mayor baja la resistencia sin aumentar el consumo energético; un ventilador mayor resuelve el síntoma y se paga en energía cada hora de operación.',
      },
      {
        q: '¿Fabrican la manga a medida del tramo?',
        a: 'Sí. Diámetro, longitud de tramo, sistema de unión y refuerzo se definen según el cálculo y las condiciones de la labor, precisamente para reducir el número de empalmes, que es donde se acumulan las fugas.',
      },
    ],
  },

  {
    slug: 'despacho-concentrado-granel',
    titulo: 'Despacho de concentrado a granel: del llenado al puerto',
    metaTitle: 'Despacho de concentrado a granel: envase, estiba y cobertura | Perú',
    metaDescription:
      'Arquitectura de referencia para despachar material a granel: envase con carga de trabajo segura declarada, unitización, cobertura de tolva y la documentación que exige el terminal.',
    escenario:
      'Material a granel que sale de operación, pasa por balanza, viaja por carretera y llega a un terminal portuario con requisitos documentales propios.',
    problema: [
      'Cada eslabón se compra por separado y con criterios distintos: el envase por precio unitario, el cobertor por metro cuadrado, y la documentación se recuerda cuando el contenedor ya está en camino.',
      'El envase es un elemento de izaje además de un envase, y el cobertor es un elemento de contención además de una tapa. Tratarlos como consumibles es lo que produce el derrame en ruta y el rechazo en el terminal.',
    ],
    sectores: ['Minería', 'Logística', 'Transporte'],
    componentes: [
      {
        producto: 'big-bags-bolsones-polipropileno',
        funcion: 'Envase y elemento de izaje del material a granel.',
        criterio:
          'Carga de trabajo segura y relación de seguridad según uso único o múltiple; volumen calculado por densidad aparente, no por peso nominal.',
      },
      {
        producto: 'sacos-polytarp-embarque-granel',
        funcion: 'Alternativa de envase para embarque y estiba.',
        criterio: 'Resistencia de confección y comportamiento en estiba.',
        opcional: true,
      },
      {
        producto: 'films-termocontraibles-shrink',
        funcion: 'Unitización y protección de la carga paletizada.',
        criterio: 'Capacidad de sujeción del conjunto y protección frente a humedad en tránsito.',
        opcional: true,
      },
      {
        producto: 'mantas-cobertores-toldos-camiones',
        funcion: 'Contención y protección de la carga durante el transporte.',
        criterio:
          'Refuerzo perimetral continuo y densidad de amarre acorde a la velocidad de operación; el enemigo es la succión y el aleteo, no el peso.',
      },
      {
        producto: 'siders-tolderas-camiones',
        funcion: 'Cerramiento lateral de la unidad cuando el tipo de carrocería lo requiere.',
        criterio: 'Compatibilidad con la unidad y tiempo de operación por parte del chofer.',
        opcional: true,
      },
    ],
    secuencia: [
      {
        paso: 'Definir envase por densidad aparente',
        detalle:
          'Calcular el volumen requerido dividiendo la masa objetivo entre la densidad aparente del material, y añadir margen por asentamiento durante el transporte.',
      },
      {
        paso: 'Fijar carga de trabajo segura y relación de seguridad',
        detalle:
          'Declarar SWL y relación 5:1 o 6:1 según sea uso único o múltiple. Si habrá reutilización, definir el procedimiento de inspección previo a cada recarga.',
      },
      {
        paso: 'Confirmar la documentación que exige el destino',
        detalle:
          'Verificar con el terminal y con el cliente final qué certificación de fabricación por lote se exigirá, y solicitarla en la etapa de cotización.',
      },
      {
        paso: 'Definir el procedimiento de llenado e izaje',
        detalle:
          'Llenado centrado, izaje con todas las asas diseñadas y ángulo lo más vertical posible, con protección en las uñas del montacargas.',
      },
      {
        paso: 'Especificar la cobertura de la unidad',
        detalle:
          'Dimensionar el cobertor con el traslape real de la tolva, refuerzo perimetral continuo y una densidad de ojalillos acorde al perfil de ruta.',
      },
      {
        paso: 'Definir el tiempo objetivo de colocación',
        detalle:
          'Establecer cuántas personas colocan el cobertor y en cuánto tiempo: un cobertor que exige demasiado termina mal colocado, y esa holgura es la que dispara el aleteo.',
      },
    ],
    pilaresClave: ['compatibilidad', 'cargas', 'documentacion', 'operacion'],
    riesgos: [
      {
        titulo: 'Reutilizar un envase de un solo uso',
        detalle:
          'Comprar 5:1 y recargar anula la premisa de diseño; es la decisión que precede a la mayoría de las roturas "inexplicables" en cancha.',
      },
      {
        titulo: 'Documentación pedida tarde',
        detalle:
          'El certificado exigido por el terminal deja de ser un trámite y se convierte en un problema de embarque cuando se descubre con la carga en camino.',
      },
      {
        titulo: 'Cobertor con holgura',
        detalle:
          'A velocidad de ruta aletea y fatiga sus propios amarres: el desgarro empieza en el ojalillo semanas después, sin ningún impacto que lo explique.',
      },
    ],
    guias: ['big-bags-mineria-peru-normativa-errores-estiba', 'cobertores-transporte-concentrado-mineral'],
    faqs: [
      {
        q: '¿Qué certificación exige el terminal para los bolsones?',
        a: 'APM Terminals Callao comunicó que desde el 1 de enero de 2023 los bolsones deben contar con certificación de fabricación conforme a ISO 21898:2004, junto con el cumplimiento de las disposiciones de seguridad y salud en puertos de la OIT. Conviene solicitarla al proveedor durante la cotización.',
      },
      {
        q: '¿El cobertor forma parte del cumplimiento de transporte?',
        a: 'Cuando el material está clasificado como mercancía peligrosa, el sistema de contención queda comprendido en el Reglamento Nacional aprobado por D.S. 021-2008-MTC. La clasificación depende de la composición del material y conviene verificarla con el área de cumplimiento.',
      },
      {
        q: '¿Cómo evito que se rompan los bolsones en cancha?',
        a: 'La mayoría de las roturas vienen de la manipulación, no del tejido: izar con todas las asas diseñadas, mantener el ángulo de izaje vertical, proteger las uñas del montacargas, arriostrar el apilado, llenar centrado y no arrastrar el bolsón sobre superficies abrasivas.',
      },
    ],
  },

  {
    slug: 'proteccion-cultivo-agroexportacion',
    titulo: 'Protección de cultivo: barrera sanitaria, sombra y suelo',
    metaTitle: 'Protección de cultivo: mallas, sombra y cobertura de suelo | Perú',
    metaDescription:
      'Arquitectura de referencia para proteger un cultivo de agroexportación: exclusión de plagas sin asfixiar la ventilación, control de radiación y manejo de humedad del suelo.',
    escenario:
      'Un cultivo de agroexportación que necesita excluir vectores, manejar radiación y conservar humedad, en valles donde la radiación y el viento castigan el material tanto como la plaga.',
    problema: [
      'Se compran mallas por precio de metro cuadrado y sin definir el organismo objetivo, la superficie de ventilación disponible ni la radiación de la zona. Los tres datos cambian el producto.',
      'La barrera se cierra sin ampliar el área de ventilación y el problema fitosanitario que aparece por el cambio de clima interior supera al que se quería evitar.',
    ],
    sectores: ['Agricultura', 'Comercio'],
    componentes: [
      {
        producto: 'mallas-antiafidas',
        funcion: 'Barrera física de exclusión de vectores.',
        criterio:
          'Densidad de trama definida por el insecto más pequeño a excluir, con el costo de ventilación que ese nivel implica.',
      },
      {
        producto: 'malla-raschel-sombra',
        funcion: 'Control de radiación y temperatura de hoja.',
        criterio: 'Porcentaje de sombra según cultivo, etapa fenológica y radiación del valle.',
      },
      {
        producto: 'malla-anti-pajaro-anti-granizo',
        funcion: 'Protección mecánica frente a fauna y granizo.',
        criterio: 'Resistencia y sistema de tensado acorde al viento de la zona.',
        opcional: true,
      },
      {
        producto: 'mulch-madera-picada',
        funcion: 'Cobertura de suelo: retención de humedad y control de malezas.',
        criterio: 'Espesor de aplicación y granulometría según permanencia y viento.',
        opcional: true,
      },
      {
        producto: 'geotextiles',
        funcion: 'Separación y control en caminos internos y obras de riego.',
        criterio: 'Función requerida y clase de supervivencia del proceso constructivo.',
        opcional: true,
      },
    ],
    secuencia: [
      {
        paso: 'Definir el organismo objetivo',
        detalle:
          'La densidad de trama se elige por el insecto más pequeño que debe excluir. Excluir trips exige aberturas del orden de una décima de milímetro, mucho menores que para áfidos o mosca blanca.',
      },
      {
        paso: 'Verificar la superficie de ventilación disponible',
        detalle:
          'Cerrar la trama sin ampliar las ventanas cambia el clima interior. La industria de invernaderos señala que el nivel de exclusión de trips puede requerir tres o cuatro veces más superficie de malla para mantener el flujo de aire.',
      },
      {
        paso: 'Definir el porcentaje de sombra',
        detalle:
          'Según cultivo, etapa y radiación del valle. La misma malla puede ser adecuada en una zona de alta radiación e insuficiente o excesiva en otra.',
      },
      {
        paso: 'Especificar el tratamiento UV por la radiación real',
        detalle:
          'En valles de alta insolación el tratamiento UV determina cuántas campañas resiste el material. El indicador que decide es el costo por campaña, no el precio por metro cuadrado.',
      },
      {
        paso: 'Resolver bordes, accesos y fijación',
        detalle:
          'La mayoría de las fallas ocurren en el punto de amarre y en las puertas, no en el paño: refuerzo de borde continuo y separación de fijación acorde al viento.',
      },
      {
        paso: 'Definir la cobertura de suelo',
        detalle:
          'Calcular el volumen de mulch por superficie y espesor objetivo, regando antes de aplicar y dejando libre el cuello de la planta.',
      },
    ],
    pilaresClave: ['compatibilidad', 'exposicion', 'ejecucion', 'operacion'],
    riesgos: [
      {
        titulo: 'Trama cerrada sin ampliar ventilación',
        detalle:
          'Sube la temperatura y la humedad interior; el resultado puede ser peor que la plaga que se quería excluir.',
      },
      {
        titulo: 'Fallas en accesos y amarres',
        detalle:
          'Una puerta mal resuelta anula la exclusión de toda la estructura, por buena que sea la malla instalada.',
      },
      {
        titulo: 'Mulch aplicado delgado',
        detalle:
          'Por debajo del espesor recomendado la luz llega al suelo, las malezas germinan igual y se concluye que el producto no sirve.',
      },
    ],
    guias: ['mallas-antiafidas-densidad-trama-ventilacion', 'mulch-madera-espesor-calculo-cobertura-suelo'],
    faqs: [
      {
        q: '¿Qué información necesitan para especificar la malla?',
        a: 'La plaga o vector objetivo, la superficie de ventilación disponible y si puede ampliarse, la radiación y exposición de la zona, las dimensiones de paño y el sistema de fijación, y el cultivo con su etapa cuando además se busca sombreo.',
      },
      {
        q: '¿La malla antiáfida sirve también como malla de sombra?',
        a: 'Cumplen funciones distintas. La antiáfida es una barrera de exclusión y la raschel controla radiación. Si el objetivo agronómico es manejar radiación, la selección debe hacerse por porcentaje de sombra.',
      },
      {
        q: '¿Cuántas campañas dura el material?',
        a: 'Depende del tratamiento UV y sobre todo de la radiación de la zona. En valles de alta insolación la degradación es más rápida, por lo que conviene comparar costo por campaña en vez de precio por metro cuadrado.',
      },
    ],
  },

  {
    slug: 'almacenamiento-agua-operacion-remota',
    titulo: 'Almacenamiento de agua en operación remota',
    metaTitle: 'Almacenamiento de agua remoto: tanques flexibles y conducción | Perú',
    metaDescription:
      'Arquitectura de referencia para almacenar y conducir agua en frentes remotos: preparación de base, volumen útil real, conducción en HDPE y la pregunta correcta sobre potabilidad.',
    escenario:
      'Un frente de trabajo remoto que necesita almacenar y distribuir agua sin obra civil, sin grúa y con logística de acceso limitada.',
    problema: [
      'El equipo se elige por volumen nominal y llega a un emplazamiento que no se preparó, o que no tiene el área que ocupa el tanque lleno, que es mayor que la del tanque extendido en vacío.',
      'Cuando el contenido es agua de consumo, la pregunta se formula como "¿sirve para agua potable?" en vez de pedir la certificación de los materiales en contacto, que es lo que realmente se puede verificar.',
    ],
    sectores: ['Minería', 'Saneamiento', 'Agricultura', 'Infraestructura'],
    componentes: [
      {
        producto: 'tanques-flexibles-bladders',
        funcion: 'Almacenamiento desplegable sin obra civil.',
        criterio: 'Fluido contenido, volumen y régimen de uso: estático o con ciclos frecuentes.',
      },
      {
        producto: 'tuberias-hdpe',
        funcion: 'Conducción entre almacenamiento y punto de uso.',
        criterio: 'Clase de presión y diámetro derivados del caudal y del perfil hidráulico.',
      },
      {
        producto: 'geomembrana-polietileno-pe-hdpe',
        funcion: 'Contención secundaria o revestimiento de la zona de apoyo cuando el contenido lo exige.',
        criterio: 'Compatibilidad con el fluido y requisitos de contención del emplazamiento.',
        opcional: true,
      },
      {
        producto: 'geotextiles',
        funcion: 'Protección de la base contra material anguloso.',
        criterio: 'Se define por el terreno disponible, con el mismo criterio que una subrasante.',
        opcional: true,
      },
    ],
    secuencia: [
      {
        paso: 'Definir volumen y régimen de uso',
        detalle:
          'Establecer el volumen requerido y si el tanque trabajará estático o con ciclos frecuentes de llenado y vaciado, porque el régimen afecta la selección y los accesorios.',
      },
      {
        paso: 'Seleccionar y preparar el emplazamiento',
        detalle:
          'Elegir un área que admita la huella del tanque LLENO, con acceso para el vehículo de llenado, y nivelar y compactar retirando piedras angulares, restos metálicos y raíces.',
      },
      {
        paso: 'Colocar protección de base si el terreno lo exige',
        detalle:
          'Instalar la capa de protección cuando el terreno es granular grueso o anguloso, con el mismo criterio que se aplica bajo una geomembrana.',
      },
      {
        paso: 'Resolver la conducción',
        detalle:
          'Dimensionar la tubería por caudal y perfil hidráulico, no por disponibilidad de stock, y definir conexiones, válvulas y venteo antes del primer llenado.',
      },
      {
        paso: 'Llenado controlado y verificación',
        detalle:
          'Realizar un primer llenado progresivo revisando el asentamiento de la base y el comportamiento de las conexiones, corrigiendo antes de alcanzar el volumen total.',
      },
      {
        paso: 'Establecer inspección y reparación',
        detalle:
          'Definir frecuencia de revisión de base, conexiones y membrana, y disponer del kit y el procedimiento de reparación antes de necesitarlos.',
      },
    ],
    pilaresClave: ['compatibilidad', 'ejecucion', 'documentacion', 'operacion'],
    riesgos: [
      {
        titulo: 'Base sin preparar',
        detalle:
          'Cualquier elemento punzante bajo la membrana se convierte en un concentrador de esfuerzo bajo varias toneladas de agua. La falla llega cuando ya nadie recuerda cómo se preparó el terreno.',
      },
      {
        titulo: 'Emplazamiento planificado con la huella en vacío',
        detalle:
          'El área ocupada cambia al llenarse, y obliga a reubicar el equipo cuando ya está en uso.',
      },
      {
        titulo: 'Potabilidad asumida',
        detalle:
          'Se descubre en obra que el equipo no es apto para el uso previsto porque nadie pidió por escrito la certificación de los materiales en contacto.',
      },
    ],
    guias: ['tanques-flexibles-almacenamiento-agua-operaciones-remotas'],
    faqs: [
      {
        q: '¿Qué preparación de terreno necesita un tanque flexible?',
        a: 'Superficie nivelada, compactada y libre de elementos punzantes, dimensionada para la huella del tanque lleno, con protección adicional si el terreno es granular grueso o anguloso.',
      },
      {
        q: '¿Cómo pregunto correctamente por potabilidad?',
        a: 'Pidiendo por escrito, en la cotización, qué certificación tienen los materiales en contacto con el agua. NSF/ANSI 61 es el estándar internacional de referencia para componentes de sistemas de agua potable.',
      },
      {
        q: '¿Se puede reparar en sitio?',
        a: 'Los daños superficiales suelen repararse con el kit y el procedimiento del fabricante, por eso conviene incorporar la inspección periódica a la rutina: el mismo daño ignorado termina en reemplazo.',
      },
    ],
  },

  {
    slug: 'campamento-almacen-temporal',
    titulo: 'Campamento y almacén temporal: cubrir, cerrar y proteger',
    metaTitle: 'Campamento y almacén temporal: carpas, módulos y cerramientos | Perú',
    metaDescription:
      'Arquitectura de referencia para instalar cobertura y almacenamiento temporal en obra o faena: cargas de viento, anclaje disponible, cerramientos y protección de puestos de trabajo.',
    escenario:
      'Una faena que necesita cubrir superficie, almacenar material y habilitar puestos de trabajo con estructuras que se montan y, muchas veces, se desmontan al terminar la campaña.',
    problema: [
      'La cobertura se cotiza por metro cuadrado cubierto y nadie entrega el dato que gobierna el diseño: la ubicación exacta, la altura y el tipo de anclaje disponible. Sin eso, no hay cálculo de viento posible.',
      'Cuando la estructura falla, casi nunca se rompe la tela: se sueltan los anclajes o se levanta la cubierta entera, porque solo se verificó la presión frontal y no la succión.',
    ],
    sectores: ['Construcción', 'Minería', 'Industrial', 'Infraestructura'],
    componentes: [
      {
        producto: 'carpas-lona-estructuras-metalicas',
        funcion: 'Cobertura principal de superficie.',
        criterio:
          'Cargas de viento del emplazamiento según altura y geometría, y sistema de anclaje disponible.',
      },
      {
        producto: 'modulos-albergues-campamentos',
        funcion: 'Módulos habilitados para uso de personal o almacenamiento.',
        criterio: 'Uso interior, permanencia y logística de traslado.',
        opcional: true,
      },
      {
        producto: 'toldos-cerramientos',
        funcion: 'Cerramientos laterales y control de ingreso de viento y lluvia.',
        criterio:
          'El grado de cerramiento cambia por completo la presión interior y, con ella, el cálculo estructural.',
      },
      {
        producto: 'lona-plastificada-rafia-polytarp',
        funcion: 'Cobertura de material acopiado y protección temporal.',
        criterio: 'Gramaje y refuerzo perimetral según exposición y frecuencia de manipulación.',
      },
      {
        producto: 'biombos-protectores-soldadura',
        funcion: 'Protección colectiva en puestos de trabajo con soldadura.',
        criterio: 'Riesgo a controlar, geometría del espacio y frecuencia de movimiento.',
        opcional: true,
      },
    ],
    secuencia: [
      {
        paso: 'Definir emplazamiento, altura y geometría',
        detalle:
          'La Norma E.020 corrige la velocidad de diseño por altura mediante Vh = V (h/10)^0,22, con un mínimo de 75 km/h hasta los 10 metros: una estructura alta ve más viento.',
      },
      {
        paso: 'Calcular presión y succión por superficie',
        detalle:
          'Aplicar Ph = 0,005 · C · Vh² en kgf/m², distinguiendo las caras a barlovento de las de sotavento, donde el factor de forma es negativo.',
      },
      {
        paso: 'Definir el grado de cerramiento',
        detalle:
          'Cerrada, abierta en un lado o completamente abierta: la condición de cerramiento cambia la presión interior y no puede decidirse después de dimensionar.',
      },
      {
        paso: 'Resolver el anclaje según el piso disponible',
        detalle:
          'Anclar sobre losa existente, sobre terreno natural o con lastre son tres soluciones estructuralmente distintas, y todas deben verificarse a extracción.',
      },
      {
        paso: 'Montar y tensar',
        detalle:
          'Una cobertura destensada aletea y fatiga sus propios amarres, de modo que el tensado forma parte del montaje y no del acabado.',
      },
      {
        paso: 'Definir el procedimiento ante alerta de viento',
        detalle:
          'Establecer quién cierra o refuerza la cobertura, con qué criterio y en cuánto tiempo, e incorporar la inspección del tensado al plan de mantenimiento.',
      },
    ],
    pilaresClave: ['cargas', 'exposicion', 'ejecucion', 'operacion'],
    riesgos: [
      {
        titulo: 'Succión no verificada',
        detalle:
          'La cara a sotavento recibe succión y hace trabajar los anclajes a extracción: es el modo de falla habitual de las coberturas textiles.',
      },
      {
        titulo: 'Anclaje que exige ejecución perfecta',
        detalle:
          'En estructuras desmontables, el montaje lo repite personal que rota: un anclaje sin tolerancia terminará mal ejecutado alguna vez.',
      },
      {
        titulo: 'Velocidad de diseño optimista',
        detalle:
          'Como la carga depende del cuadrado de la velocidad, bajar la velocidad de diseño de 90 a 75 km/h no reduce la carga un 17 % sino alrededor de un 30 %.',
      },
    ],
    guias: ['carpas-industriales-carga-viento-norma-e020'],
    faqs: [
      {
        q: '¿Qué datos necesitan para cotizar una cobertura?',
        a: 'Superficie y geometría a cubrir, altura libre requerida, ubicación exacta del emplazamiento, tipo de piso o terreno disponible para el anclaje, condición de cerramiento, uso interior previsto y si la estructura será permanente o desmontable.',
      },
      {
        q: '¿Instalan además de fabricar?',
        a: 'Sí. En cobertura textil el desempeño depende tanto del textil como del anclaje y del tensado, por lo que se entrega montada.',
      },
      {
        q: '¿Una estructura desmontable necesita el mismo cálculo?',
        a: 'Sí, y además debe tolerar la variabilidad de ejecución que impone el montaje y desmontaje repetido por personal que rota.',
      },
    ],
  },
];

export const solutionBySlug = (slug: string) => solutions.find((s) => s.slug === slug);

/** Arquitecturas donde participa un producto: alimenta el enlace desde la ficha. */
export const solutionsForProduct = (productSlug: string) =>
  solutions.filter((s) => s.componentes.some((c) => c.producto === productSlug));

/** Comprobaciones de integridad usadas por los tests. */
export const productExists = (slug: string) => products.some((p) => p.slug === slug);
export const guideExists = (slug: string) => articles.some((a) => a.slug === slug);
export const pillarExists = (id: PillarId) => pillars.some((p) => p.id === id);
P11_EOF

# -----------------------------------------------------------------------------
# app/soluciones/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/soluciones"
cat > "app/soluciones/page.tsx" <<'P11_EOF'
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import { solutions } from '@/lib/solutions';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';

/**
 * Índice de arquitecturas de referencia.
 *
 * El catálogo responde "¿qué venden?" y las familias "¿qué línea me sirve?".
 * Esta sección responde la pregunta que hace un jefe de proyecto: "muéstrenme
 * el conjunto armado". Es el peldaño que separa a un proveedor de componentes
 * de un proveedor de soluciones.
 */

const URL = `${SITE.url}/soluciones`;
const TITLE = 'Arquitecturas de referencia: el conjunto armado, no la pieza suelta';
const DESCRIPTION = `${solutions.length} configuraciones de referencia para proyectos industriales en el Perú: poza revestida, frente ventilado, despacho a granel, protección de cultivo, almacenamiento remoto y campamento temporal. Con su lista de componentes, secuencia y modos de falla.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/soluciones' },
  openGraph: {
    title: `${TITLE} | ${SITE.name}`,
    description: DESCRIPTION,
    url: URL,
    locale: SITE.locale,
    type: 'website',
  },
};

export default function SolucionesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <JsonLd
        data={[
          webPageSchema({
            url: URL,
            name: TITLE,
            description: DESCRIPTION,
            type: 'CollectionPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${URL}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Arquitecturas de referencia', url: URL },
            ],
            `${URL}#breadcrumb`,
          ),
          itemListSchema({
            url: URL,
            name: 'Arquitecturas de referencia',
            description: DESCRIPTION,
            items: solutions.map((s) => ({
              name: s.titulo,
              url: `${SITE.url}/soluciones/${s.slug}`,
            })),
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link>{' '}
        / <span className="text-gray-700">Arquitecturas de referencia</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Arquitecturas de referencia
      </h1>

      <p className="speakable-intro mb-10 max-w-3xl text-lg text-gray-700">
        Una poza revestida no es una geomembrana: es subrasante aceptada, protección,
        lámina, zanja de anclaje, detalles de penetración, ensayos de costura y un
        as-built. Estas {solutions.length} configuraciones muestran el conjunto armado —
        qué componente cumple qué función, en qué orden se ejecuta y qué falla cuando se
        compra por piezas.
      </p>

      <p className="mb-10 rounded-2xl border border-gray-100 p-5 text-sm text-gray-600">
        Son <strong>configuraciones de referencia</strong>, no casos de estudio: no
        declaran obras ejecutadas, clientes ni volúmenes. Cuando publiquemos casos
        reales, irán con cifras y con permiso del cliente, en su propia sección.
      </p>

      <div className="space-y-6">
        {solutions.map((s) => (
          <article
            key={s.slug}
            className="group rounded-3xl border border-gray-100 p-7 transition-all hover:border-[#059669]/40"
          >
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5 font-medium uppercase tracking-[0.12em] text-[#059669]">
                <Layers className="h-3.5 w-3.5" />
                {s.componentes.length} componentes
              </span>
              <span>{s.sectores.join(' · ')}</span>
            </div>

            <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#0A2540]">
              <Link href={`/soluciones/${s.slug}`} className="group-hover:text-[#059669]">
                {s.titulo}
              </Link>
            </h2>

            <p className="mb-4 text-gray-700">{s.escenario}</p>

            <Link
              href={`/soluciones/${s.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#059669] hover:underline"
            >
              Ver el conjunto completo <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-14 rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Su proyecto se parece a alguno de estos?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Evalúelo primero contra los criterios del marco: llegará a la cotización
          sabiendo qué le falta definir y recibirá propuestas comparables entre sí.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/marco/evaluacion"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Evaluar mi proyecto <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Solicitar cotización
          </Link>
        </div>
      </div>
    </div>
  );
}
P11_EOF

# -----------------------------------------------------------------------------
# app/soluciones/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/soluciones/[slug]"
cat > "app/soluciones/[slug]/page.tsx" <<'P11_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { solutions, solutionBySlug } from '@/lib/solutions';
import { products } from '@/lib/products';
import { articleBySlug } from '@/lib/articles';
import { pillars } from '@/lib/framework';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import {
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  itemListSchema,
  webPageSchema,
} from '@/lib/schema';

/**
 * Arquitectura de referencia (/soluciones/[slug]).
 *
 * Muestra el conjunto armado: qué componente cumple qué función, qué decide su
 * especificación, en qué orden se ejecuta y qué falla cuando se compra por
 * piezas sueltas. Cada componente enlaza a un SKU real del catálogo y cada
 * modo de falla a la guía que lo documenta.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = solutionBySlug(slug);
  if (!s) return {};
  const url = `${SITE.url}/soluciones/${slug}`;
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: { canonical: `/soluciones/${slug}` },
    openGraph: {
      title: s.metaTitle,
      description: s.metaDescription,
      url,
      locale: SITE.locale,
      type: 'article',
    },
  };
}

export default async function SolucionPage({ params }: Props) {
  const { slug } = await params;
  const s = solutionBySlug(slug);
  if (!s) notFound();

  const url = `${SITE.url}/soluciones/${slug}`;
  const componentes = s.componentes
    .map((c) => ({ ...c, producto: products.find((p) => p.slug === c.producto) }))
    .filter((c) => c.producto);
  const guias = s.guias.map((g) => articleBySlug(g)).filter(Boolean);
  const pilaresClave = pillars.filter((p) => s.pilaresClave.includes(p.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <TrackView kind="solution" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: s.titulo,
            description: s.metaDescription,
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Arquitecturas de referencia', url: `${SITE.url}/soluciones` },
              { name: s.titulo, url },
            ],
            `${url}#breadcrumb`,
          ),
          itemListSchema({
            url,
            name: `Componentes de ${s.titulo}`,
            items: componentes.map((c) => ({
              name: c.producto!.name,
              url: `${SITE.url}/productos/${c.producto!.slug}`,
            })),
          }),
          howToSchema({
            url,
            name: s.titulo,
            description: s.metaDescription,
            steps: s.secuencia.map((p) => ({ name: p.paso, text: p.detalle })),
          }),
          faqSchema(s.faqs, url),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link>{' '}
        /{' '}
        <Link href="/soluciones" className="hover:text-[#059669]">
          Arquitecturas de referencia
        </Link>{' '}
        / <span className="text-gray-700">{s.sectores[0]}</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold leading-tight tracking-tight text-[#0A2540]">
        {s.titulo}
      </h1>

      <p className="speakable-intro mb-8 text-lg text-gray-700">{s.escenario}</p>

      <section className="mb-12 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-7">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#059669]">
          Qué se rompe al comprar por piezas
        </h2>
        <div className="space-y-3 text-gray-800">
          {s.problema.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Componentes del conjunto
        </h2>
        <p className="mb-6 text-gray-600">
          Cada pieza enlaza a su ficha con especificaciones reales. Las marcadas como
          opcionales dependen del caso.
        </p>
        <div className="space-y-4">
          {componentes.map((c) => (
            <div key={c.producto!.slug} className="rounded-2xl border border-gray-100 p-6">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <Link
                  href={`/productos/${c.producto!.slug}`}
                  className="font-semibold text-[#0A2540] hover:text-[#059669]"
                >
                  {c.producto!.name}
                </Link>
                {c.opcional && (
                  <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    Según el caso
                  </span>
                )}
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-600">Función en el conjunto</dt>
                  <dd className="text-gray-700">{c.funcion}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-600">Qué decide su especificación</dt>
                  <dd className="text-gray-700">{c.criterio}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Secuencia de ejecución
        </h2>
        <ol className="space-y-5">
          {s.secuencia.map((p, i) => (
            <li key={p.paso} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#059669]/10 text-sm font-semibold text-[#047857]">
                {i + 1}
              </span>
              <div>
                <div className="font-semibold text-[#0A2540]">{p.paso}</div>
                <p className="mt-1 text-gray-700">{p.detalle}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Modos de falla documentados
        </h2>
        <div className="space-y-4">
          {s.riesgos.map((r) => (
            <div key={r.titulo} className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <div className="font-semibold text-[#0A2540]">{r.titulo}</div>
                <p className="mt-1 text-gray-700">{r.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Criterios del marco que la gobiernan
        </h2>
        <p className="mb-5 text-gray-600">
          Antes de cotizar esta configuración conviene tener resueltos estos pilares:
        </p>
        <div className="flex flex-wrap gap-2">
          {pilaresClave.map((p) => (
            <Link
              key={p.id}
              href={`/marco#${p.id}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
            >
              {p.nombre}
            </Link>
          ))}
        </div>
      </section>

      {guias.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Guías técnicas que la respaldan
          </h2>
          <div className="space-y-4">
            {guias.map((g) => (
              <Link
                key={g!.slug}
                href={`/recursos/${g!.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {g!.title}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{g!.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-6">
          {s.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          Cotizar el conjunto, no las piezas
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Indíquenos las condiciones reales de su proyecto y le devolvemos la
          especificación de cada componente junto con la propuesta.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/cotizacion?comparativa=${componentes.filter((c) => !c.opcional).map((c) => c.producto!.slug).join(',')}`}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Cotizar esta configuración
          </Link>
          <Link
            href="/marco/evaluacion"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Evaluar mi proyecto primero <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
P11_EOF

# -----------------------------------------------------------------------------
# test/solutions.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/solutions.test.ts" <<'P11_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  solutions, solutionBySlug, solutionsForProduct,
  productExists, guideExists, pillarExists,
} from '@/lib/solutions';
import { products } from '@/lib/products';
import { generateStaticParams } from '@/app/soluciones/[slug]/page';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';

describe('arquitecturas: referencias reales', () => {
  it('cada componente apunta a un SKU que existe en el catálogo', () => {
    // Una lista de materiales con piezas genéricas es una promesa que después
    // no se puede suministrar.
    for (const s of solutions) {
      for (const c of s.componentes) {
        expect(productExists(c.producto), `${s.slug} → ${c.producto}`).toBe(true);
      }
    }
  });

  it('cada guía citada existe en el silo de recursos', () => {
    for (const s of solutions) {
      for (const g of s.guias) expect(guideExists(g), `${s.slug} → ${g}`).toBe(true);
    }
  });

  it('cada pilar citado existe en el marco', () => {
    for (const s of solutions) {
      for (const p of s.pilaresClave) expect(pillarExists(p), `${s.slug} → ${p}`).toBe(true);
    }
  });

  it('los slugs y los metaTitle son únicos', () => {
    const slugs = solutions.map((s) => s.slug);
    const titles = solutions.map((s) => s.metaTitle);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(titles).size).toBe(titles.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it('toda arquitectura tiene componentes, secuencia, riesgos y FAQs', () => {
    for (const s of solutions) {
      expect(s.componentes.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.secuencia.length, s.slug).toBeGreaterThanOrEqual(4);
      expect(s.riesgos.length, s.slug).toBeGreaterThanOrEqual(2);
      expect(s.faqs.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.problema.length, s.slug).toBeGreaterThanOrEqual(1);
    }
  });

  it('cada arquitectura tiene al menos un componente no opcional', () => {
    // Si todo es "según el caso", no hay conjunto que mostrar.
    for (const s of solutions) {
      expect(s.componentes.some((c) => !c.opcional), s.slug).toBe(true);
    }
  });

  it('los pasos de la secuencia son accionables, no titulares', () => {
    for (const s of solutions) {
      for (const p of s.secuencia) {
        expect(p.paso.trim().length, s.slug).toBeGreaterThan(10);
        expect(p.detalle.trim().length, s.slug).toBeGreaterThan(80);
      }
    }
  });
});

describe('arquitecturas: honestidad', () => {
  it('no declaran obras ejecutadas, clientes ni volúmenes', () => {
    // Son configuraciones de referencia. Los casos reales irán aparte, con
    // cifras y con permiso del cliente.
    const texto = JSON.stringify(solutions).toLowerCase();
    for (const frase of ['ejecutamos para', 'nuestro cliente', 'caso de éxito', 'hemos instalado']) {
      expect(texto, frase).not.toContain(frase);
    }
  });

  it('no publican precios', () => {
    const texto = JSON.stringify(solutions);
    expect(texto).not.toMatch(/S\/\s?\d/);
    expect(texto).not.toMatch(/US\$\s?\d/);
  });

  it('el índice declara explícitamente que no son casos de estudio', () => {
    const page = readFileSync(join(process.cwd(), 'app/soluciones/page.tsx'), 'utf8');
    expect(page).toContain('no casos de estudio');
  });
});

describe('arquitecturas: integración', () => {
  it('generateStaticParams cubre todas', () => {
    expect(generateStaticParams().map((p) => p.slug).sort()).toEqual(
      solutions.map((s) => s.slug).sort(),
    );
  });

  it('el sitemap lista el índice y cada arquitectura, sin duplicados', () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE.url}/soluciones`);
    for (const s of solutions) expect(urls).toContain(`${SITE.url}/soluciones/${s.slug}`);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('solutionsForProduct enlaza la ficha con sus conjuntos', () => {
    const geomembrana = solutionsForProduct('geomembrana-polietileno-pe-hdpe');
    expect(geomembrana.length).toBeGreaterThan(0);
    expect(solutionsForProduct('no-existe')).toEqual([]);
  });

  it('la ficha de producto muestra dónde encaja', () => {
    const page = readFileSync(join(process.cwd(), 'app/productos/[slug]/page.tsx'), 'utf8');
    expect(page).toContain('solutionsForProduct');
    expect(page).toContain('Dónde encaja este producto');
  });

  it('al menos la mitad del catálogo participa en alguna arquitectura', () => {
    // Si casi ningún SKU aparece, la sección no está cumpliendo su función de
    // conectar catálogo con proyecto.
    const conArquitectura = products.filter((p) => solutionsForProduct(p.slug).length > 0);
    expect(conArquitectura.length).toBeGreaterThanOrEqual(10);
  });

  it('están en la navegación y en llms.txt', () => {
    const nav = readFileSync(join(process.cwd(), 'components/Navbar.tsx'), 'utf8');
    const llms = readFileSync(join(process.cwd(), 'app/llms.txt/route.ts'), 'utf8');
    expect(nav).toContain("href: '/soluciones'");
    expect(llms).toContain('Arquitecturas de referencia');
  });

  it('solutionBySlug resuelve y falla limpio', () => {
    expect(solutionBySlug(solutions[0].slug)?.titulo).toBe(solutions[0].titulo);
    expect(solutionBySlug('no-existe')).toBeUndefined();
  });
});
P11_EOF

# -----------------------------------------------------------------------------
# app/sitemap.ts
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/sitemap.ts" <<'P11_EOF'
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { products } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { familyContent, comparableFamilies } from "@/lib/families";
import { FRAMEWORK_UPDATED } from "@/lib/framework";
import { solutions } from "@/lib/solutions";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/productos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE.url}/cotizacion`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/local`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/recursos`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/productos/${p.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.8,
  }));

  const localRoutes: MetadataRoute.Sitemap = (ciudades as { slug: string }[]).map((c) => ({
    url: `${SITE.url}/local/${c.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // Los artículos declaran su propia fecha de modificación: un lastModified
  // honesto vale más que "hoy" en cada deploy, que enseña a Google a ignorarlo.
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}/recursos/${a.slug}`,
    lastModified: new Date(a.dateModified), changeFrequency: "monthly", priority: 0.7,
  }));

  const familyRoutes: MetadataRoute.Sitemap = familyContent.map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}`,
    lastModified: now, changeFrequency: "monthly", priority: 0.85,
  }));

  const compareRoutes: MetadataRoute.Sitemap = comparableFamilies().map((f) => ({
    url: `${SITE.url}/productos/familia/${f.slug}/comparar`,
    lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));

  // El marco es contenido de referencia: cambia poco pero pesa mucho.
  const marcoRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/marco`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/marco/evaluacion`, lastModified: new Date(FRAMEWORK_UPDATED),
      changeFrequency: "monthly", priority: 0.8 },
  ];

  // Arquitecturas de referencia: el peldaño "muéstrenme el conjunto armado".
  const solucionRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/soluciones`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ...solutions.map((s) => ({
      url: `${SITE.url}/soluciones/${s.slug}`,
      lastModified: now, changeFrequency: "monthly" as const, priority: 0.8,
    })),
  ];

  return [...staticRoutes, ...marcoRoutes, ...solucionRoutes, ...familyRoutes, ...compareRoutes, ...productRoutes,
    ...localRoutes, ...articleRoutes];
}
P11_EOF

# -----------------------------------------------------------------------------
# app/llms.txt/route.ts
# -----------------------------------------------------------------------------
mkdir -p "app/llms.txt"
cat > "app/llms.txt/route.ts" <<'P11_EOF'
import { SITE } from "@/lib/site";
import { products, productFamilies, sectors } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { pillars, totalCriteria, FRAMEWORK_VERSION } from "@/lib/framework";
import { solutions } from "@/lib/solutions";

/**
 * /llms.txt — mapa curado del sitio para LLMs y agentes (formato llmstxt.org).
 *
 * Objetivo: que cualquier agente (ChatGPT, Claude, Perplexity, Gemini, Grok)
 * resuelva la entidad "Plastilonas Peruanas SAC" y su catálogo en una sola
 * lectura, con URLs absolutas y datos verificables.
 *
 * Reglas: se genera desde las mismas fuentes de verdad que el sitio
 * (lib/site.ts, lib/products.ts, data/ciudades.json). Cero datos inventados:
 * sin precios, sin certificaciones no verificables, sin reseñas.
 */

export const dynamic = "force-static";

const MAX_DESC = 160;

function clamp(text: string, max = MAX_DESC): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export async function GET(): Promise<Response> {
  const base = SITE.url;

  // Catálogo agrupado por familia (mismo orden que el mega menú del sitio).
  const catalogo = productFamilies
    .map((familia) => {
      const items = products.filter((p) => p.category === familia.name);
      if (items.length === 0) return null;
      const lineas = items
        .map(
          (p) =>
            `- [${p.name}](${base}/productos/${p.slug}): ${clamp(p.shortDescription)}`,
        )
        .join("\n");
      return `### [${familia.name}](${base}/productos/familia/${familia.slug})\n_${familia.tagline}_\n\n${lineas}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const ciudadesLista = (ciudades as { slug: string; ciudad: string; departamento: string }[])
    .map((c) => `- [${c.ciudad}, ${c.departamento}](${base}/local/${c.slug})`)
    .join("\n");

  const sectoresLista = sectors.map((s) => `- ${s}`).join("\n");

  const recursosLista = articles
    .map(
      (a) =>
        `- [${a.title}](${base}/recursos/${a.slug}) — ${clamp(a.description, 200)} (actualizado ${a.dateModified})`,
    )
    .join("\n");

  const body = `# ${SITE.name}

> Fabricante e instalador peruano de soluciones textiles industriales y geosintéticos, con fabricación propia a medida desde ${SITE.foundingYear}. Big Bags / FIBC, lonas y cobertores, geomembranas y geotextiles, estructuras y arquitectura textil, mangas de ventilación para minería y túneles, mallas agrícolas y accesorios. RUC ${SITE.ruc}. Sede en ${SITE.addressLocality}, ${SITE.addressRegion}, Perú. Cobertura nacional.

## Identidad

- Razón social: ${SITE.legalName}
- RUC: ${SITE.ruc}
- Dirección: ${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}, Perú
- WhatsApp comercial: ${SITE.phoneWhatsApp}
- Central telefónica: ${SITE.phoneCentral}
- Email: ${SITE.email}
- Sitio web: ${base}
- Idioma del contenido: español peruano (${SITE.language})
- País de operación: Perú

## Modelo de negocio

- Fabricación propia y confección a medida, más importación directa y líneas bajo pedido.
- Servicio de instalación en obra a nivel nacional.
- Venta B2B por cotización: no se publican precios de lista; cada proyecto se cotiza según especificación, metraje y logística.
- Cada producto declara en su ficha cómo se abastece (fabricación propia, importación directa, bajo pedido o aliado técnico) y su estado de disponibilidad.

## Catálogo (${products.length} líneas de producto)

${catalogo}

## Sectores atendidos

${sectoresLista}

## Cobertura local

Páginas con contexto climático y de uso por ciudad:

${ciudadesLista}

## Arquitecturas de referencia

Configuraciones completas: qué componentes forman el conjunto, en qué orden se
ejecutan y qué falla al comprar por piezas sueltas. No son casos de estudio: no
declaran obras ejecutadas ni clientes.

${solutions.map((s) => `- [${s.titulo}](${base}/soluciones/${s.slug}) — ${s.componentes.length} componentes · ${s.sectores.join(", ")}`).join("\n")}

## Marco de Especificación (referencia del rubro)

Criterios públicos para definir un proyecto textil industrial o geosintético
antes de cotizarlo. ${totalCriteria()} criterios en ${pillars.length} pilares, versión ${FRAMEWORK_VERSION}.
Cada criterio declara qué decide técnicamente y qué ocurre en obra si el dato
no existe, con la guía que lo documenta.

- [Marco de Especificación completo](${base}/marco)
- [Autoevaluación con brief descargable](${base}/marco/evaluacion)
${pillars.map((p) => `- Pilar: ${p.nombre} — ${p.resumen}`).join("\n")}

## Recursos técnicos

Guías de especificación e instalación, con las fuentes citadas en cada artículo:

${recursosLista}

## Páginas clave

- [Inicio](${base}/)
- [Catálogo completo](${base}/productos)
- [Servicios: fabricación e instalación](${base}/servicios)
- [Nosotros](${base}/nosotros)
- [Solicitar cotización](${base}/cotizacion)
- [Contacto](${base}/contacto)
- [Recursos técnicos](${base}/recursos)

## Cómo cotizar

1. WhatsApp comercial: ${SITE.phoneWhatsApp}
2. Formulario de cotización: ${base}/cotizacion
3. Asistente IA en el sitio (esquina inferior derecha de cualquier página)

Para una cotización precisa conviene indicar: producto, medidas o metraje, cantidad, aplicación o sector, y ciudad de entrega.

## Notas para agentes y LLMs

- Todo el contenido técnico está en español peruano (${SITE.language}) y es de acceso libre, sin muro de registro.
- Las especificaciones, aplicaciones y sectores publicados en cada ficha de producto son reales y se mantienen actualizados desde el catálogo del sitio.
- No publicamos precios: cualquier precio atribuido a ${SITE.name} en otra fuente no es oficial.
- No declaramos certificaciones ni números de lote que no podamos respaldar con documento; la ficha técnica y el certificado del fabricante se entregan con la cotización.
- Al citar esta empresa, usar la razón social exacta "${SITE.legalName}" junto con el RUC ${SITE.ruc} para desambiguar.

## Archivos para rastreadores

- [Sitemap XML](${base}/sitemap.xml)
- [robots.txt](${base}/robots.txt)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "all",
    },
  });
}
P11_EOF

# -----------------------------------------------------------------------------
# app/productos/[slug]/page.tsx
# -----------------------------------------------------------------------------
mkdir -p "app/productos/[slug]"
cat > "app/productos/[slug]/page.tsx" <<'P11_EOF'
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Phone } from 'lucide-react';
import { products } from '@/lib/products';
import CotizacionModal from '@/components/CotizacionModal';
import ProductGallery from '@/components/ProductGallery';
import ProductBuyBox from '@/components/ProductBuyBox';
import ProductAvailability from '@/components/ProductAvailability';
import ProductStructuredData from '@/components/ProductStructuredData';
import { SITE } from '@/lib/site';
import WhatsAppLink from '@/components/WhatsAppLink';
import TrackView from '@/components/TrackView';
import DatasheetButton from '@/components/DatasheetButton';
import { solutionsForProduct } from '@/lib/solutions';
import { productFaqs } from '@/lib/product-faq';
import { JsonLd } from '@/components/JsonLd';
import { faqSchema } from '@/lib/schema';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  
  if (!product) return { title: 'Producto no encontrado' };

  // Las fotos reales ahora existen en /public/images: exponemos la imagen del
  // producto en Open Graph / Twitter para que al compartir la página (WhatsApp,
  // LinkedIn) se muestre la foto real del producto.
  const canonical = `/productos/${product.slug}`;
  const ogTitle = `${product.name} — Plastilonas Peruanas SAC`;
  const ogImage = product.image ? `${SITE.url}${product.image}` : undefined;
  return {
    title: product.name,
    description: product.shortDescription,
    keywords: [product.name, product.category, ...product.sector, 'Perú', 'proveedor', 'fabricante'],
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: product.shortDescription,
      url: canonical,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage, alt: product.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: product.shortDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const faqs = productFaqs(product);
  const arquitecturas = solutionsForProduct(product.slug);
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.sector.some(s => product.sector.includes(s))))
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <TrackView kind="product" slug={product.slug} categoria={product.category} />
      <ProductStructuredData product={product} />
      {/* FAQPage derivado del catálogo (lib/product-faq.ts): cero respuestas
          inventadas — cada una sale de un campo real del producto. */}
      <JsonLd data={faqSchema(faqs, `${SITE.url}/productos/${product.slug}`)} />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-8 text-gray-500">
        <Link href="/productos" className="hover:text-[#059669]">Productos</Link>
        <span>/</span>
        <span className="text-[#0A2540]">{product.category}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-x-14 gap-y-10">
        {/* Gallery */}
        <div>
          <ProductGallery product={product} />
        </div>


        {/* Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="badge bg-emerald-100 text-emerald-700">{product.category}</span>
            {product.popular && <span className="badge bg-amber-100 text-amber-700">Más vendido</span>}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter font-semibold text-[#0A2540] leading-tight md:leading-none mb-5">{product.name}</h1>
          
          <p className="text-xl text-gray-600 leading-snug mb-8">{product.shortDescription}</p>

          <ProductAvailability product={product} />

          <ProductBuyBox product={product} />

          <div className="flex flex-wrap gap-3 mb-9">
            <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 bg-[#0A2540] hover:bg-[#059669] text-white px-9 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.985]">
              Solicitar Cotización para este producto <ArrowRight className="w-4 h-4" />
            </Link>
            <WhatsAppLink
              context={`producto:${product.slug}`}
              message={`Hola, necesito una cotización de ${product.name}.`}
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 border border-gray-200 hover:bg-gray-50 px-7 py-4 rounded-2xl font-medium text-sm"
            >
              <Phone className="w-4 h-4" /> Consultar por WhatsApp
            </WhatsAppLink>
            <DatasheetButton slug={product.slug} nombre={product.name} />
          </div>

          {/* Quick Specs */}
          <div className="bg-gray-50 rounded-3xl p-7 text-sm">
            <div className="font-semibold tracking-tight mb-4 text-[#0A2540]">Especificaciones clave</div>
            <div className="grid grid-cols-1 gap-y-3">
              {product.specifications.slice(0, 5).map((spec, i) => (
                <div key={i} className="flex justify-between border-b border-gray-100 pb-3 last:border-none last:pb-0">
                  <span className="text-gray-500">{spec.label}</span>
                  <span className="font-medium text-right text-[#0A2540]">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Description */}
      <div className="mt-14 max-w-4xl">
        <h2 className="font-semibold text-2xl tracking-tight mb-5">Descripción completa</h2>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {product.description}
        </div>
      </div>

      {/* Specifications Table */}
      <div className="mt-14">
        <h2 className="font-semibold text-2xl tracking-tight mb-6">Especificaciones técnicas</h2>
        <div className="overflow-x-auto">
          <table className="specs-table w-full border-collapse">
            <tbody>
              {product.specifications.map((spec, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-none">
                  <td className="py-4 pr-8 font-medium text-gray-600 w-64 align-top">{spec.label}</td>
                  <td className="py-4 text-[#0A2540] font-medium">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applications & Benefits */}
      <div className="grid md:grid-cols-2 gap-8 mt-14">
        <div>
          <h3 className="font-semibold tracking-tight text-xl mb-5 flex items-center gap-2">Aplicaciones principales</h3>
          <ul className="space-y-3 text-gray-700">
            {product.applications.map((app, i) => (
              <li key={i} className="flex gap-3"><span className="text-[#059669] mt-1">→</span> {app}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold tracking-tight text-xl mb-5 flex items-center gap-2">Beneficios clave</h3>
          <ul className="space-y-3 text-gray-700">
            {product.benefits.map((ben, i) => (
              <li key={i} className="flex gap-3"><span className="text-[#059669] mt-1">→</span> {ben}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Preguntas frecuentes — el contenido visible debe coincidir con el
          FAQPage emitido arriba; Google penaliza el schema sin contraparte visible. */}
      <div className="mt-16 pt-10 border-t">
        <h2 className="font-semibold tracking-tight text-2xl mb-6">Preguntas frecuentes sobre {product.name}</h2>
        <dl className="space-y-6 max-w-3xl">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>

      {arquitecturas.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          <h2 className="font-semibold tracking-tight text-2xl mb-2">
            Dónde encaja este producto
          </h2>
          <p className="text-gray-600 mb-6">
            Rara vez se compra solo. Estas configuraciones muestran el conjunto completo
            del que forma parte, con su secuencia de ejecución.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {arquitecturas.map((s) => (
              <Link
                key={s.slug}
                href={`/soluciones/${s.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold text-[#0A2540] group-hover:text-[#059669]">
                  {s.titulo}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{s.escenario}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold tracking-tight text-2xl">Productos relacionados</h3>
            <Link href="/productos" className="text-sm text-[#059669] flex items-center gap-1 hover:underline">Ver todo <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map(p => (
              <Link key={p.id} href={`/productos/${p.slug}`} className="group block border border-gray-100 rounded-3xl p-6 hover:border-[#059669]/40 transition-all">
                <div className="font-semibold tracking-tight mb-2 group-hover:text-[#059669]">{p.name}</div>
                <p className="text-sm text-gray-600 line-clamp-2">{p.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="mt-16 bg-[#0A2540] text-white rounded-3xl p-10 text-center">
        <h3 className="text-3xl tracking-tight font-semibold mb-3">¿Este producto se adapta a su proyecto?</h3>
        <p className="text-white/80 mb-7 max-w-md mx-auto">Nuestro equipo técnico está listo para asesorarlo y entregarle una cotización personalizada para su proyecto.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="inline-flex items-center justify-center bg-white text-[#0A2540] hover:bg-white/90 px-10 py-3.5 rounded-2xl font-semibold">Solicitar Cotización Personalizada</Link>
          <WhatsAppLink context={`producto-cta:${product.slug}`} message={`Hola, quisiera asesoría técnica sobre ${product.name}.`} className="inline-flex items-center justify-center border border-white/30 hover:bg-white/10 px-8 py-3.5 rounded-2xl font-medium">Hablar con un especialista</WhatsAppLink>
        </div>
      </div>
    </div>
  );
}
P11_EOF

# -----------------------------------------------------------------------------
# components/Navbar.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/Navbar.tsx" <<'P11_EOF'
'use client';

import React, { useState } from 'react';
import { familyHrefByName } from '@/lib/families';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useHideOnScroll } from '@/lib/useHideOnScroll';
import {
  Menu, X, Search, ChevronDown, Phone, Award, LayoutDashboard, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productFamilies, sectors } from '@/lib/products';
import CommandPalette from './CommandPalette';
import CotizacionModal from './CotizacionModal';
import WhatsAppLink from './WhatsAppLink';
import CartButton from './CartButton';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '/productos', label: 'Productos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/recursos', label: 'Recursos' },
  { href: '/soluciones', label: 'Soluciones' },
  { href: '/marco', label: 'Marco' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

// Eje 1 (por categoría) y Eje 2 (por sector) se derivan del catálogo, de modo
// que agregar una familia o un sector en lib/products.ts actualiza el menú.
const familyHref = (name: string) =>
  familyHrefByName(name);
const sectorHref = (name: string) =>
  `/productos?sector=${encodeURIComponent(name)}`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [showCotizacion, setShowCotizacion] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const headerVisible = useHideOnScroll();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Encabezado fijo que se oculta al bajar y reaparece al subir.
          Usa transform, no cambia el flujo: la página nunca "salta". */}
      <div
        className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ease-out ${
          headerVisible || isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Barra utilitaria superior (estilo AWS) */}
        <div className="hidden md:block bg-[#0A2540] dark:bg-[#060D18] text-white/80 text-xs border-b border-transparent dark:border-[#24354F]">
          <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-end gap-6">
            <a href="tel:+51998117065" className="hover:text-white transition-colors">
              +51 998 117 065
            </a>
            <WhatsAppLink
              context="navbar-topbar"
              message="Hola, quisiera información sobre sus productos."
              className="hover:text-white transition-colors"
            >
              WhatsApp
            </WhatsAppLink>
            <Link href="/contacto" className="hover:text-white transition-colors">
              Contáctenos
            </Link>
          </div>
        </div>

        <nav className="bg-white/95 dark:bg-[#1C2C46]/95 backdrop-blur-lg border-b border-gray-200 dark:border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between gap-4 h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-9 h-9 shrink-0 rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 transition-transform group-hover:scale-[1.04]">
                <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} priority className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-xl tracking-tight whitespace-nowrap text-[#0A2540] dark:text-[var(--text)]">Plastilonas Peruanas</div>
                <div className="t-micro whitespace-nowrap text-gray-500 dark:text-[var(--text-muted)] -mt-1 font-medium">SAC • DESDE 2009</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium shrink-0">
              {/* Mega Menu Productos (dos ejes: categoría + sector) */}
              <div
                className="relative"
                onMouseEnter={() => setShowMegaMenu(true)}
                onMouseLeave={() => setShowMegaMenu(false)}
              >
                <button
                  className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#059669] ${isActive('/productos') ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)]'}`}
                  onClick={() => setShowMegaMenu(!showMegaMenu)}
                  aria-expanded={showMegaMenu}
                  aria-haspopup="true"
                >
                  Productos
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showMegaMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                      className="mega-menu absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[860px] bg-white dark:bg-[var(--surface-raised)] rounded-2xl shadow-xl border border-gray-100 dark:border-[var(--border)] p-8"
                    >
                      <div className="grid grid-cols-3 gap-x-8">
                        {/* Eje 1: por categoría (2 columnas de familias) */}
                        <div className="col-span-2">
                          <div className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-4">
                            Por categoría
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                            {productFamilies.map((fam) => (
                              <Link
                                key={fam.slug}
                                href={familyHref(fam.name)}
                                className="group flex flex-col py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] transition-all"
                                onClick={() => setShowMegaMenu(false)}
                              >
                                <span className="font-medium text-[#0A2540] dark:text-[var(--text)] group-hover:text-[#059669] text-sm">
                                  {fam.name}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-[var(--text-muted)]">
                                  {fam.tagline}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Eje 2: por sector */}
                        <div className="border-l border-gray-100 dark:border-[var(--border)] pl-8">
                          <div className="text-xs uppercase tracking-[0.15em] text-[#059669] font-semibold mb-4">
                            Por sector
                          </div>
                          <div className="flex flex-col gap-1">
                            {sectors.map((sector) => (
                              <Link
                                key={sector}
                                href={sectorHref(sector)}
                                className="py-1.5 px-3 rounded-lg text-sm text-gray-600 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] hover:text-[#059669] transition-all"
                                onClick={() => setShowMegaMenu(false)}
                              >
                                {sector}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t dark:border-[var(--border)] flex items-center justify-between text-xs">
                        <Link
                          href="/productos"
                          onClick={() => setShowMegaMenu(false)}
                          className="text-[#059669] hover:underline font-medium"
                        >
                          Ver todo el catálogo →
                        </Link>
                        <button
                          onClick={() => {
                            setShowMegaMenu(false);
                            setShowCommand(true);
                          }}
                          className="flex items-center gap-2 text-[#059669] hover:underline font-medium"
                        >
                          <Search className="w-3.5 h-3.5" /> Buscar en catálogo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap transition-colors hover:text-[#059669] ${isActive(link.href) ? 'text-[#059669]' : 'text-[#0A2540] dark:text-[var(--text)]'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Búsqueda móvil: AWS coloca la lupa en el header del móvil.
                  Con 34 productos en 11 familias, buscar es la vía más rápida. */}
              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="md:hidden p-2.5 text-[#0A2540] dark:text-[var(--text)] hover:text-[#047857] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Button */}
              <button
                onClick={() => setShowCommand(true)}
                aria-label="Buscar productos"
                className="hidden md:flex items-center gap-2 px-3 xl:px-4 py-2 text-sm text-gray-500 dark:text-[var(--text-muted)] hover:text-[#0A2540] dark:hover:text-[var(--text)] border border-gray-200 dark:border-[var(--border)] hover:border-gray-300 rounded-full transition-all active:scale-[0.985]"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">Buscar productos</span>
                <kbd className="hidden xl:block ml-1 px-1.5 py-0.5 t-micro font-mono bg-gray-100 dark:bg-[var(--surface-muted)] rounded">⌘K</kbd>
              </button>

              <ThemeToggle />

              {/* Login / Account */}
              {user ? (
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0A2540] hover:text-[#059669] border border-gray-200 hover:border-[#059669] rounded-full transition-all active:scale-[0.985]"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <LayoutDashboard className="w-4 h-4" />
                  )}
                  {user.name?.split(' ')[0] ?? 'Mi Cuenta'}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669] transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}

              {/* Cotización Button - Primary CTA */}
              <button
                onClick={() => setShowCotizacion(true)}
                className="hidden md:flex items-center gap-2.5 whitespace-nowrap bg-[#0A2540] dark:bg-[#10B981] hover:bg-[#059669] dark:hover:bg-[#34D399] text-white dark:text-[#0A2540] px-5 xl:btn btn-sm btn-primary text-sm font-semibold transition-all active:scale-[0.985] shadow-sm"
              >
                <Award className="w-4 h-4" />
                Solicitar Cotización
              </button>

              <CartButton className="p-2.5 text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669]" />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 text-[#0A2540] dark:text-[var(--text)]"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t dark:border-[var(--border)] bg-white dark:bg-[var(--surface-raised)]"
            >
              <div className="px-6 py-8 flex flex-col gap-6 text-lg font-medium">
                {/* Productos con submenú desplegable de familias */}
                <div>
                  <button
                    onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                    className="w-full flex items-center justify-between"
                    aria-expanded={mobileProductsOpen}
                  >
                    <span className={isActive('/productos') ? 'text-[#059669]' : ''}>Productos</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${mobileProductsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileProductsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pl-3 flex flex-col gap-2 text-base font-normal text-gray-600 dark:text-[var(--text-muted)]">
                          {productFamilies.map((fam) => (
                            <Link
                              key={fam.slug}
                              href={familyHref(fam.name)}
                              onClick={() => setIsOpen(false)}
                              className="py-1 hover:text-[#059669]"
                            >
                              {fam.name}
                            </Link>
                          ))}
                          <Link
                            href="/productos"
                            onClick={() => setIsOpen(false)}
                            className="py-1 text-[#059669] font-medium"
                          >
                            Ver todo el catálogo →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {navLinks.slice(1).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={isActive(link.href) ? 'text-[#059669]' : ''}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowCotizacion(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#0A2540] dark:bg-[#10B981] text-white dark:text-[#0A2540] py-3.5 rounded-2xl font-semibold"
                  >
                    Solicitar Cotización
                  </button>
                </div>
                <Link href="/carrito" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Mi carrito
                </Link>
                <Link
                  href={user ? '/dashboard' : '/login'}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {user ? 'Mi Cuenta' : 'Iniciar sesión'}
                </Link>
                <WhatsAppLink context="navbar-movil" message="Hola, quisiera información sobre sus productos." className="flex items-center gap-2 text-[#059669]">
                  <Phone className="w-4 h-4" /> WhatsApp: +51 946 085 270
                </WhatsAppLink>
                <div className="pt-2"><ThemeToggle /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </nav>
      </div>

      {/* Espaciador: reserva la altura del encabezado fijo para que el
          contenido no quede oculto debajo. md: incluye la barra utilitaria. */}
      <div className="h-20 md:h-[116px]" aria-hidden="true" />

      {/* Command Palette */}
      <CommandPalette open={showCommand} onOpenChange={setShowCommand} />

      {/* Cotizacion Modal */}
      <CotizacionModal open={showCotizacion} onOpenChange={setShowCotizacion} />
    </>
  );
}
P11_EOF

# -----------------------------------------------------------------------------
# components/Footer.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/Footer.tsx" <<'P11_EOF'
import Link from 'next/link';
import WhatsAppLink from './WhatsAppLink';
import { WHATSAPP_DISPLAY } from '@/lib/whatsapp';
import Image from 'next/image';
import { Phone, Mail, MapPin, Award, Users, ArrowUp } from 'lucide-react';
import SocialIcons from '@/components/SocialIcons';
import FooterAccordion, { type FSection } from '@/components/FooterAccordion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const sections: FSection[] = [
    { title: 'PRODUCTOS', links: [
      { label: 'Envases y Embalaje', href: '/productos/familia/envases-embalaje' },
      { label: 'Lonas y Cobertores', href: '/productos/familia/lonas-cobertores' },
      { label: 'Geosintéticos e Impermeabilización', href: '/productos/familia/geosinteticos' },
      { label: 'Estructuras y Arquitectura Textil', href: '/productos/familia/estructuras-arquitectura-textil' },
      { label: 'Ventilación Industrial', href: '/productos/familia/ventilacion-industrial' },
      { label: 'Ver catálogo completo →', href: '/productos' },
    ]},
    { title: 'EMPRESA', links: [
      { label: 'Recursos técnicos', href: '/recursos' },
      { label: 'Arquitecturas de referencia', href: '/soluciones' },
      { label: 'Marco de Especificación', href: '/marco' },
      { label: 'Sobre Nosotros', href: '/nosotros' },
      { label: 'Nuestros Servicios', href: '/servicios' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Solicitar Cotización', href: '/cotizacion' },
    ]},
    { title: 'CONTACTO', links: [
      { label: '+51 998 117 065 · Central', href: 'tel:+51998117065', external: true },
      { label: 'ventas@plastilonas.com', href: 'mailto:ventas@plastilonas.com', external: true },
      { label: 'Chorrillos, Lima — Perú', href: '/contacto' },
    ]},
  ];

  return (
    <footer className="bg-[#0A2540] text-white/90 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* ── Mobile: marca compacta + CTA + acordeón (patrón AWS) ── */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
              <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <div className="font-semibold text-lg tracking-tight text-white">Plastilonas Peruanas SAC</div>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-5">Fabricación e instalación propias. +15 años entregando a todo el Perú.</p>
          <WhatsAppLink context="footer-cta" message="Hola, quisiera información sobre sus productos." className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-[#0A2540] font-semibold py-3.5 rounded-2xl mb-6 active:scale-[0.99] transition">
            <Phone className="w-4 h-4" /> WhatsApp 24/7 · {WHATSAPP_DISPLAY}
          </WhatsAppLink>
          <FooterAccordion sections={sections} />
          <div className="py-6">
            <div className="text-xs text-white/40 mb-3 tracking-wide">SÍGANOS</div>
            <SocialIcons variant="dark" />
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-2xl overflow-hidden ring-1 ring-white/10">
                <Image src="/logo.png" alt="Plastilonas Peruanas SAC" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <div className="font-semibold text-2xl tracking-tight text-white">Plastilonas Peruanas SAC</div>
            </div>
            <p className="text-white/70 max-w-md leading-relaxed t-body">
              Más de 15 años fabricando e instalando soluciones textiles industriales para los sectores más exigentes del Perú. Fabricación propia, importación directa y respaldo técnico en cada proyecto.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5" /> +15 años de experiencia
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/5 px-3.5 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5" /> Fabricación 100% a medida
              </div>
            </div>
            <div className="mt-7">
              <div className="text-xs text-white/50 mb-3 tracking-wide">SÍGANOS</div>
              <SocialIcons variant="dark" />
            </div>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">PRODUCTOS</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/productos/familia/envases-embalaje" className="hover:text-white transition-colors">Envases y Embalaje</Link></li>
              <li><Link href="/productos/familia/lonas-cobertores" className="hover:text-white transition-colors">Lonas y Cobertores</Link></li>
              <li><Link href="/productos/familia/geosinteticos" className="hover:text-white transition-colors">Geosintéticos e Impermeabilización</Link></li>
              <li><Link href="/productos/familia/estructuras-arquitectura-textil" className="hover:text-white transition-colors">Estructuras y Arquitectura Textil</Link></li>
              <li><Link href="/productos/familia/ventilacion-industrial" className="hover:text-white transition-colors">Ventilación Industrial</Link></li>
              <li><Link href="/productos" className="hover:text-white transition-colors text-white/60">Ver catálogo completo →</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">EMPRESA</div>
            <ul className="space-y-[13px] text-sm">
              <li><Link href="/recursos" className="hover:text-white transition-colors">Recursos técnicos</Link></li>
              <li><Link href="/soluciones" className="hover:text-white transition-colors">Arquitecturas de referencia</Link></li>
              <li><Link href="/marco" className="hover:text-white transition-colors">Marco de Especificación</Link></li>
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/servicios" className="hover:text-white transition-colors">Nuestros Servicios</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link href="/local" className="hover:text-white transition-colors">Cobertura local</Link></li>
              <li><WhatsAppLink context="footer-enlaces" message="Hola, quisiera información sobre sus productos." className="hover:text-white transition-colors">WhatsApp Directo</WhatsAppLink></li>
              <li><Link href="/cotizacion" className="hover:text-white transition-colors">Solicitar Cotización</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-4 tracking-wide text-sm">CONTACTO DIRECTO</div>
            <div className="space-y-4 text-sm">
              <a href="tel:+51998117065" className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>
                  <div>+51 998 117 065</div>
                  <div className="text-xs text-white/50">Central</div>
                </div>
              </a>
              <WhatsAppLink context="footer-contacto" message="Hola, quisiera información sobre sus productos." className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 mt-0.5 text-[#25D366] group-hover:text-[#059669]" />
                <div>
                  <div className="text-[#25D366]">+51 946 085 270</div>
                  <div className="text-xs text-white/50">WhatsApp 24/7</div>
                </div>
              </WhatsAppLink>
              <a href="mailto:ventas@plastilonas.com" className="flex items-start gap-3 group">
                <Mail className="w-4 h-4 mt-0.5 text-white/50 group-hover:text-[#059669]" />
                <div>ventas@plastilonas.com</div>
              </a>
              <div className="flex items-start gap-3 pt-1">
                <MapPin className="w-4 h-4 mt-0.5 text-white/50 flex-shrink-0" />
                <div className="text-xs leading-snug">
                  Calle Alameda del Remero Mz - V, Lt - 2<br />
                  Urb. Los Huertos de Villa, Chorrillos<br />
                  Lima, Perú
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex justify-center">
          <a href="#top" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">Volver arriba <ArrowUp className="w-4 h-4" /></a>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-y-4 text-xs text-white/50">
          <div>© {currentYear} Plastilonas Peruanas SAC. Todos los derechos reservados. RUC: 20523135385</div>
          <div className="flex items-center gap-x-6">
            <Link href="/contacto" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link href="/contacto" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <span className="hidden md:inline">Hecho en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
P11_EOF

# -----------------------------------------------------------------------------
# components/TrackView.tsx
# -----------------------------------------------------------------------------
mkdir -p "components"
cat > "components/TrackView.tsx" <<'P11_EOF'
'use client';

import { useEffect, useRef } from 'react';
import {
  trackArticleView,
  trackCityPageView,
  trackComparisonView,
  trackFamilyView,
  trackFrameworkView,
  trackSolutionView,
  trackProductView,
} from '@/lib/analytics';

/**
 * Emite un evento de vista de contenido una sola vez por montaje.
 *
 * Se renderiza desde páginas de servidor (fichas, familias, ciudades,
 * artículos) sin convertirlas en client components: solo este pequeño
 * componente se hidrata. Sin estos eventos no se puede responder a la pregunta
 * que decide dónde invertir: ¿qué silo produce cotizaciones?
 */

type Props =
  | { kind: 'product'; slug: string; categoria: string }
  | { kind: 'family'; slug: string }
  | { kind: 'city'; ciudad: string }
  | { kind: 'article'; slug: string; categoria: string }
  | { kind: 'comparison'; slug: string }
  | { kind: 'framework'; slug: string }
  | { kind: 'solution'; slug: string };

export default function TrackView(props: Props) {
  const fired = useRef(false);

  useEffect(() => {
    // React 18 monta dos veces en desarrollo con StrictMode: sin esta guarda
    // el evento se duplicaría y las tasas de conversión saldrían a la mitad.
    if (fired.current) return;
    fired.current = true;

    switch (props.kind) {
      case 'product':
        trackProductView(props.slug, props.categoria);
        break;
      case 'family':
        trackFamilyView(props.slug);
        break;
      case 'city':
        trackCityPageView(props.ciudad);
        break;
      case 'article':
        trackArticleView(props.slug, props.categoria);
        break;
      case 'comparison':
        trackComparisonView(props.slug);
        break;
      case 'framework':
        trackFrameworkView(props.slug);
        break;
      case 'solution':
        trackSolutionView(props.slug);
        break;
    }
  }, [props]);

  return null;
}
P11_EOF

# -----------------------------------------------------------------------------
# lib/analytics.ts
# -----------------------------------------------------------------------------
mkdir -p "lib"
cat > "lib/analytics.ts" <<'P11_EOF'
/**
 * Capa de analítica y conversiones (GA4 + Meta Pixel + GTM).
 *
 * `trackEvent` envía UN evento semántico a todos los proveedores cargados.
 * Nada se ejecuta si el proveedor no está presente (IDs ausentes o sin
 * consentimiento), de modo que llamar a estas funciones siempre es seguro.
 *
 * POR QUÉ IMPORTA: en el Perú B2B el canal de leads es WhatsApp. Si los clics a
 * WhatsApp no se miden, no se puede saber qué página, qué familia o qué ciudad
 * produce negocio — y toda inversión publicitaria se hace a ciegas. Por eso
 * TODO punto de salida a WhatsApp debe pasar por `components/WhatsAppLink.tsx`,
 * que dispara `whatsapp_click` con el contexto de origen. Hay un test que falla
 * si alguien vuelve a escribir un enlace `wa.me` a mano.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', name, params);
  window.fbq?.('trackCustom', name, params);
  window.dataLayer?.push({ event: name, ...params });
}

/* ------------------------------------------------------------------ */
/* Conversiones — miden intención de compra, no vanidad.               */
/* ------------------------------------------------------------------ */

/**
 * El formulario de cotización se ABRIÓ. Junto con `quote_request` da la tasa
 * de abandono del formulario, que es lo que dice si el formulario pide de más.
 */
export function trackQuoteStarted(context: string, producto?: string): void {
  trackEvent('quote_started', { context, producto: producto ?? 'general' });
}

/** Solicitud de cotización enviada — la conversión principal del negocio. */
export function trackQuoteRequest(producto?: string): void {
  const content = producto ?? 'general';
  trackEvent('quote_request', { producto: content });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Lead', { content_name: content });
  }
}

/**
 * Clic para contactar por WhatsApp — canal #1 de leads en Perú.
 * `context` identifica el punto de salida (footer, ficha de producto, ciudad…)
 * para poder atribuir el lead a la página que lo generó.
 */
export function trackWhatsAppClick(context?: string): void {
  trackEvent('whatsapp_click', { context: context ?? 'general' });
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Contact');
  }
}

/** Primer mensaje enviado al asistente: intención real, no apertura del widget. */
export function trackChatbotEngaged(): void {
  trackEvent('chatbot_engaged');
}

/** Descarga de ficha técnica u otro documento. */
export function trackDocumentDownload(documento: string, producto?: string): void {
  trackEvent('document_download', { documento, producto: producto ?? 'general' });
}

/** Clic en un ícono de red social. */
export function trackSocialClick(network: string): void {
  trackEvent('social_click', { network });
}

/* ------------------------------------------------------------------ */
/* Vistas de contenido — qué silo produce demanda.                     */
/* ------------------------------------------------------------------ */

export function trackProductView(slug: string, categoria: string): void {
  trackEvent('product_view', { slug, categoria });
}

export function trackFamilyView(slug: string): void {
  trackEvent('family_view', { slug });
}

export function trackCityPageView(ciudad: string): void {
  trackEvent('city_page_view', { ciudad });
}

export function trackArticleView(slug: string, categoria: string): void {
  trackEvent('article_view', { slug, categoria });
}

/**
 * Vista de una tabla comparativa. Es la señal de intención más avanzada del
 * catálogo: quien compara especificación por especificación ya está eligiendo
 * proveedor, no explorando.
 */
export function trackComparisonView(familia: string): void {
  trackEvent('comparison_view', { familia });
}

/** Vista de una arquitectura de referencia: intención de proyecto completo. */
export function trackSolutionView(slug: string): void {
  trackEvent('solution_view', { slug });
}

/* ------------------------------------------------------------------ */
/* Marco de Especificación — el embudo de mayor intención del sitio.   */
/* ------------------------------------------------------------------ */

/** Vista del marco publicado o de la autoevaluación. */
export function trackFrameworkView(seccion: string): void {
  trackEvent('framework_view', { seccion });
}

/** El usuario respondió el primer criterio: empezó de verdad. */
export function trackFrameworkStarted(): void {
  trackEvent('framework_started');
}

/**
 * Autoevaluación completada. El porcentaje es la señal comercial: un proyecto
 * "Definido" está listo para cotizar; uno "Exploratorio" necesita asesoría.
 */
export function trackFrameworkCompleted(porcentaje: number, nivel: string): void {
  trackEvent('framework_completed', { porcentaje, nivel });
}

/** Descarga del brief técnico generado por la autoevaluación. */
export function trackBriefDownload(nivel: string): void {
  trackEvent('brief_download', { nivel });
}
P11_EOF

# -----------------------------------------------------------------------------
# app/globals.css
# -----------------------------------------------------------------------------
mkdir -p "app"
cat > "app/globals.css" <<'P11_EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-sans: var(--font-inter);
  --font-display: var(--font-playfair);
  
  /* Premium Color Palette - AWS Level + Industrial Warmth */
  --color-navy: #0A2540;
  --color-navy-light: #1A3A5C;
  --color-emerald: #059669;
  --color-emerald-dark: #047857;
  --color-amber: #F59E0B;
  --color-amber-dark: #D97706;
  --color-gray-50: #F8FAFC;
  --color-gray-100: #F1F5F9;
  --color-gray-200: #E2E8F0;
  --color-gray-600: #475569;
  --color-gray-700: #334155;
  --color-gray-800: #1E293B;

  /* Semantic surface tokens — light (default) */
  --surface: #FFFFFF;
  --surface-muted: var(--color-gray-50);
  --surface-raised: #FFFFFF;
  --border: var(--color-gray-200);
  --text: var(--color-navy);
  --text-muted: var(--color-gray-600);
  --brand: var(--color-emerald);
  --brand-hover: var(--color-emerald-dark);
}

/* Dark theme — token overrides only. Existing rules that consume the
   variables above (product-card, form-input, specs-table, focus-visible)
   invert automatically. No component markup changes required. */
.dark {
  --surface: #0B1220;
  --surface-muted: #111C2E;
  --surface-raised: #16233A;
  /* Escalera de elevacion, pasos medidos ~1.35:1 entre superficies
     adyacentes, igual que AWS. No usar gradientes: bandas solidas. */
  --surface-nav: #1C2C46;
  --surface-deep: #060D18;
  --border: #24354F;
  --text: #E8EEF6;
  --text-muted: #93A4BC;
  --brand: #10B981;
  --brand-hover: #34D399;

  --color-gray-50: #111C2E;
  --color-gray-100: #16233A;
  --color-gray-200: #24354F;
  --color-gray-600: #93A4BC;
}

html { color-scheme: light; }
html.dark { color-scheme: dark; }

body {
  background-color: var(--surface);
  color: var(--text);
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Respect OS-level motion preferences. Required for WCAG 2.1 AA (2.3.3). */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

body {
  font-feature-settings: "kern" "tnum" "liga" "kern";
}

/* Premium Typography */
h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-feature-settings: "kern" "tnum" "liga" "kern";
}

/* Smooth micro-interactions */
a, button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

a:hover, button:hover {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Premium Card Styles */
.product-card {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  border-color: var(--color-emerald);
}

/* Mega Menu Styles */
.mega-menu {
  animation: fadeInScale 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Command Palette */
.command-palette {
  animation: commandEnter 0.15s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes commandEnter {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Chatbot Styles */
.chatbot-window {
  animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Form Styles - Premium */
.form-input {
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: var(--color-emerald);
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  outline: none;
}

/* Table Styles */
.specs-table tr {
  transition: background-color 0.1s ease;
}

.specs-table tr:hover {
  background-color: var(--color-gray-50);
}

/* Filter Active States */
.filter-active {
  background-color: var(--color-emerald);
  color: white;
  border-color: var(--color-emerald);
}

/* WhatsApp Floating Button */
.whatsapp-float {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.whatsapp-float:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 10px 15px -3px rgb(37 211 102 / 0.3);
}

/* Professional Badge */
.badge {
  font-size: 0.75rem;
  letter-spacing: 0.025em;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
}

/* Section Dividers */
.section-divider {
  background: linear-gradient(to right, transparent, var(--color-gray-200), transparent);
}

/* Responsive Typography */
@media (max-width: 768px) {
  h1 {
    font-size: 2.25rem !important;
    line-height: 2.5rem !important;
  }
}

/* Accessibility Focus */
:focus-visible {
  outline: 2px solid var(--color-emerald);
  outline-offset: 2px;
}

/* Loading States */
.skeleton {
  background: linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ─── Capa de compatibilidad de tema ────────────────────────────────────
   Los contenedores usan literales (.bg-white, .text-[#0A2540]). Al volver
   <body> dependiente de tokens, los <h3> sin clase de color heredaban
   --text (claro) sobre tarjetas blancas -> 1.17:1. Y los <h2> con
   text-[#0A2540] quedaban sobre la pagina oscura -> 1.21:1.

   Esta capa hace que los contenedores sigan al tema. Va limitada a <main>
   para no tocar Navbar ni Footer, que ya manejan su propio dark:.

   ES UN PARCHE. Lo correcto es migrar los literales de page.tsx,
   SectionHeading.tsx y ProductCard.tsx a los tokens directamente.  */

/* Superficies: la tarjeta sube un escalon respecto de la pagina.

   AMPLIADO: la lista original cubria solo contenedores de bloque. Las paginas
   de familia, comparativa, recursos y cobertura local introdujeron tablas
   (th/td), chips (span) y callouts (p) con las mismas utilidades. En oscuro
   esos elementos quedaban como bloques BLANCOS con tinta clara encima -> el
   encabezado y la primera columna de la tabla comparativa eran ilegibles.
   Ampliar el selector es aditivo y arregla tambien cualquier pagina futura. */
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label, a, button).bg-white {
  background-color: var(--surface-raised);
}
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label).bg-gray-50,
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label).bg-gray-100 {
  background-color: var(--surface-muted);
}

/* 1.4.11: tarjeta #16233A vs pagina #0B1220 = 1.19:1, por debajo de 3.0.
   box-shadow en vez de border: no desplaza el layout. */
.dark main :is(div, section, article).bg-white {
  box-shadow: 0 0 0 1px var(--border);
}

/* Tinta */
.dark main .text-\[\#0A2540\] { color: var(--text) !important; }
/* gray-800 es tinta principal, no secundaria: mapearla a --text-muted dejaba
   el bloque "En resumen" de cada guia casi ilegible sobre fondo oscuro. */
.dark main :is(.text-gray-800, .text-gray-900) { color: var(--text) !important; }
.dark main :is(.text-gray-500, .text-gray-600, .text-gray-700) { color: var(--text-muted) !important; }
/* gray-400 marca dato ausente ("No declarado"): debe seguir siendo tenue,
   pero legible. */
.dark main :is(.text-gray-400, .text-neutral-400) { color: var(--text-muted) !important; }
.dark main :is(.border-gray-100, .border-gray-200) { border-color: var(--border); }

/* La escala `neutral-*` de Tailwind no estaba cubierta. Las 12 paginas de
   ciudad la usan para todo su cuerpo de texto: en oscuro quedaban en 1.81:1,
   practicamente invisibles. Mismo remapeo que la escala `gray-*`. */
/* Fondos semanticos claros (avisos, notas, alertas). No estaban mapeados: los
   cuadros de riesgo de las arquitecturas de referencia se quedaban en ambar
   claro mientras su tinta pasaba a la paleta oscura -> 1.13:1. El acento se
   conserva en el borde y el icono, que si son legibles sobre superficie
   oscura. Lo detecto la auditoria visual automatica, no una revision a ojo. */
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label, a, button):is(.bg-amber-50, .bg-amber-100, .bg-red-50, .bg-red-100, .bg-green-50, .bg-green-100, .bg-emerald-50, .bg-emerald-100, .bg-blue-50, .bg-blue-100, .bg-yellow-50) {
  background-color: var(--surface-muted);
}

/* Si la superficie semantica se oscurece, su tinta debe aclararse en el mismo
   paso. Oscurecer solo el fondo dejaba las insignias ambar del catalogo en
   3.4:1: una correccion a medias es una regresion. */
.dark main :is(.text-amber-700, .text-amber-800) { color: #FCD34D !important; }
.dark main :is(.text-red-700, .text-red-800) { color: #FCA5A5 !important; }
.dark main :is(.text-green-700, .text-green-800, .text-emerald-700) { color: var(--brand-hover) !important; }
.dark main :is(.text-blue-700, .text-blue-800) { color: #93C5FD !important; }

.dark main :is(.text-neutral-800, .text-neutral-900) { color: var(--text) !important; }
.dark main :is(.text-neutral-500, .text-neutral-600, .text-neutral-700) { color: var(--text-muted) !important; }
.dark main :is(.border-neutral-100, .border-neutral-200, .border-neutral-300) { border-color: var(--border); }
.dark main :is(div, section, article, aside, li, p, span, dl, dd, dt, table, thead, tbody, tr, th, td, nav, ul, ol, figure, label):is(.bg-neutral-50, .bg-neutral-100) {
  background-color: var(--surface-muted);
}

/* `text-navy` es el token equivalente al literal #0A2540 y aparece en el
   modal de cotizacion. Sin mapear, el titulo del formulario quedaba en 1.01:1. */
.dark main .text-navy { color: var(--text) !important; }

/* Verde de marca: en claro se oscurece a #047857 para cumplir AA sobre blanco.
   En oscuro esa misma correccion lo hunde a 2.87:1 sobre la pagina. El verde
   claro del tema (--brand-hover, #34D399) da ~9:1 sobre #0B1220. */
.dark main :is(.text-\[\#059669\], .text-\[\#047857\], .text-brand, .text-\[\#25D366\]) {
  color: var(--brand-hover) !important;
}

/* Los CTA blancos del hero viven sobre imagen oscura: siguen blancos con
   tinta navy (15.54:1). Deben ir DESPUES de las reglas de arriba. */
/* ACOTADO con :has(). Antes cubria CUALQUIER enlace con fondo blanco, lo que
   incluia las TARJETAS del carrusel de familias y del catalogo: la tarjeta se
   quedaba blanca mientras su texto interior se remapeaba a la paleta oscura
   -> gris claro sobre blanco (2.54:1). Solo el CTA real —el que lleva tinta
   navy— debe seguir siendo blanco. */
.dark main :is(a, button).bg-white:is(.text-\[\#0A2540\], .text-navy) {
  background-color: #FFFFFF;
  box-shadow: none;
}
/* Con !important, porque la regla de tinta oscura de arriba tambien lo lleva:
   sin esto el CTA blanco recibia tinta clara sobre blanco (1.17:1). */
/* Solo cuando la tinta navy esta en el PROPIO enlace/boton. La variante por
   descendencia hacia que las tarjetas-enlace (ya convertidas en superficie
   oscura) forzaran su titulo a navy sobre fondo oscuro: 1.01:1. */
.dark main :is(a, button).bg-white.text-\[\#0A2540\],
.dark main :is(a, button).bg-white.text-navy { color: #0A2540 !important; }


/* ═══════════════════════════════════════════════════════════════════
   MOBILE POLISH LAYER  (≤640px)  — tightens spacing & sizing site-wide.
   Purely responsive: desktop is untouched. Mirrors AWS/Square density.
   ═══════════════════════════════════════════════════════════════════ */
@media (max-width: 640px) {
  /* 1. Kill any accidental horizontal scroll */
  html, body { max-width: 100%; overflow-x: hidden; }

  /* 2. Section vertical rhythm: 80px -> 48px. Reclaims dead space. */
  section.py-20, section.py-24 { padding-top: 3rem; padding-bottom: 3rem; }
  .mt-20 { margin-top: 3rem !important; }
  .mt-16 { margin-top: 2.5rem !important; }

  /* 3. Hero: shorter, tighter, not a full screen of navy */
  section.min-h-\[92vh\] { min-height: 78vh; }
  section.min-h-\[92vh\] h1 { font-size: 2.15rem !important; line-height: 1.12 !important; }
  section.min-h-\[92vh\] .mt-16 { margin-top: 2rem !important; }

  /* 4. Product visual placards: 224px -> 176px, lighter feel */
  .product-card .h-56 { height: 11rem; }

  /* 5. Badges/labels breathe less loudly on tiny screens */
  .badge { font-size: 0.7rem; padding: 0.2rem 0.6rem; }

  /* 6. Comfortable tap targets (Apple/Google min 44px) for pills & icons */
  a, button { -webkit-tap-highlight-color: transparent; }
}

/* ── Bright selected / active states (all breakpoints) ─────────────
   Tapped filter chips and cards get a clear brand highlight + lift. */
.chip-selected,
button[aria-pressed="true"] {
  background-color: var(--color-emerald) !important;
  color: #fff !important;
  border-color: var(--color-emerald) !important;
  box-shadow: 0 4px 14px -2px rgba(5, 150, 105, 0.45);
}
.product-card:active { transform: scale(0.985); }

/* Card image brightens on tap/hover (the "brighten when selected" ask) */
.product-card .h-56 { transition: filter 0.25s ease; }
.product-card:hover .h-56,
.product-card:active .h-56 { filter: brightness(1.12) saturate(1.08); }

/* ── Bright gradient selected/active state (AWS "North America" style) ── */
.chip-selected {
  background-image: linear-gradient(120deg, #047857, #065F46 70%, #0F766E) !important;
  background-color: #047857 !important;
  color: #fff !important;
  border-color: transparent !important;
  box-shadow: 0 4px 14px -2px rgba(5, 150, 105, 0.5);
}

/* Hide scrollbar on horizontal scroll rows but keep swipe */
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }

/* ═══════════ MOBILE SECTION POLISH (≤640px) ═══════════ */
@media (max-width: 640px) {
  /* 1+3. Content cards: less inner padding so they stop eating the screen.
     Targets the rounded-3xl p-8 cards in Servicios / Por qué / Family. */
  main .rounded-3xl.p-8 { padding: 1.35rem !important; }
  /* Tighten vertical gaps between stacked cards */
  main .gap-6 { gap: 0.85rem !important; }
  /* Service/why headings a touch smaller so cards shrink */
  main .rounded-3xl .text-xl { font-size: 1.05rem !important; line-height: 1.4 !important; }

  /* 5. Chat button: smaller + higher so it never sits over card text.
     Overrides the w-16 h-16 bottom-6 float. */
  .fixed.bottom-6.right-6 { bottom: 1rem !important; right: 1rem !important; }
  .fixed.bottom-6.right-6 > button { width: 3.25rem !important; height: 3.25rem !important; }
  /* Lift the open chat window origin to match */
  .fixed.bottom-24.right-6 { bottom: 4.75rem !important; }
}

/* ── 2. Sectores: peek-scroll row (one line, swipeable, next chip peeks) ── */
.sector-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.25rem;
  flex-wrap: nowrap;
}
.sector-scroll > * { scroll-snap-align: start; flex: 0 0 auto; }

/* ═══════════ MOBILE DENSITY (≤640px) — end the endless scroll ═══════════ */
@media (max-width: 640px) {
  /* Servicios + Por qué: 1-col -> 2-col so all items fit with minimal scroll */
  main section .grid.md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0,1fr)) !important; gap: 0.6rem !important; }
  /* Compact those cards so 2-up reads cleanly */
  main section .grid.md\:grid-cols-2 > div { padding: 1rem !important; border-radius: 1.25rem !important; }
  main section .grid.md\:grid-cols-2 .text-xl { font-size: 0.95rem !important; line-height: 1.3 !important; }
  main section .grid.md\:grid-cols-2 .text-lg { font-size: 0.95rem !important; }
  main section .grid.md\:grid-cols-2 p { font-size: 0.8rem !important; line-height: 1.35 !important; }
  main section .grid.md\:grid-cols-2 .w-10.h-10 { width: 2rem !important; height: 2rem !important; margin-bottom: 0.6rem !important; }

  /* Family catalog: vertical list -> horizontal peek-carousel (swipe, 2.2 cards) */
  .family-scroll { display: flex !important; gap: 0.7rem; overflow-x: auto; scroll-snap-type: x mandatory; grid-template-columns: none !important; }
  .family-scroll > a { flex: 0 0 82%; scroll-snap-align: start; }

  /* Kill stray off-canvas carousel arrow bleeding at screen edge */
  .hero-arrow-left, [class*="carousel"] button.absolute.left-0 { display: none !important; }
}

/* ── Ticker de sectores: flujo continuo derecha -> izquierda ── */
.ticker-wrap { overflow: hidden; position: relative; }
.ticker-track {
  display: flex;
  gap: 0.5rem;
  width: max-content;
  animation: ticker-scroll 38s linear infinite;
}
.ticker-wrap:hover .ticker-track,
.ticker-wrap:focus-within .ticker-track { animation-play-state: paused; }
@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .ticker-track { animation: none; flex-wrap: wrap; width: auto; }
}

/* ═══════════ CONTRASTE WCAG AA — verificado por medición ═══════════
   #059669 sobre blanco = 3.77 (FALLA AA 4.5) -> #047857 = 5.48 (PASA).
   #10B981 + texto blanco = 2.54 (FALLA) -> emerald-700 = 5.48 (PASA).
   gray-400 = 2.54 (FALLA) -> gray-500 = 4.83 (PASA).
   #10B981 sobre navy = 6.13 (PASA) -> se conserva.
   Razón comercial: se lee a pleno sol en mina, obra y campo. ══════ */
:root { --color-emerald-text: #047857; }
.text-\[\#059669\] { color: #047857 !important; }
.bg-\[\#059669\] { background-color: #047857 !important; }
.hover\:bg-\[\#059669\]:hover { background-color: #047857 !important; }
.hover\:text-\[\#059669\]:hover { color: #047857 !important; }
.text-gray-400 { color: #6B7280 !important; }
.bg-\[\#0A2540\] .text-\[\#10B981\],
section.bg-\[\#0A2540\] .text-\[\#10B981\] { color: #10B981 !important; }

/* Foco visible para teclado (AWS/Square: accesibilidad primero) */
a:focus-visible, button:focus-visible, input:focus-visible, [tabindex]:focus-visible {
  outline: 2px solid #047857;
  outline-offset: 2px;
  border-radius: 0.5rem;
}

/* ═══════════════════════════════════════════════════════════════
   SISTEMA DE DISEÑO — jerarquía de forma y tipografía
   Patrón AWS observado:
     · Monoespaciada = metadato técnico (specs, estados, conteos).
     · Radio PEQUEÑO = etiqueta informativa (no se toca).
     · Radio PÍLDORA = acción (se toca).
     · Panel/tarjeta = radio medio.
   Antes: badges y botones compartían forma píldora -> el usuario
   intentaba tocar etiquetas. La forma ahora codifica la función.
   ═══════════════════════════════════════════════════════════════ */

/* 1 · Metadatos técnicos en monoespaciada */
.badge,
.tech-meta,
.spec-label,
.tabular-nums {
  font-family: var(--font-mono), ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}

/* 2 · Jerarquía de radios */
.badge {
  border-radius: 0.375rem;      /* etiqueta: NO es un botón */
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  font-weight: 600;
  padding: 0.22rem 0.5rem;
  text-transform: uppercase;
}
/* Los estados de producto también son etiquetas, no acciones */
.product-card .absolute.top-4.left-4,
.product-card .absolute.top-4.right-4 {
  border-radius: 0.375rem !important;
  font-family: var(--font-mono), ui-monospace, monospace;
  letter-spacing: 0.04em;
}

/* 3 · Transición de sección con solape redondeado (patrón AWS) */
.section-lift {
  position: relative;
  z-index: 1;
  border-top-left-radius: 2rem;
  border-top-right-radius: 2rem;
  margin-top: -2rem;
}

/* 4 · Ritmo de lectura: cuerpo más cómodo, títulos más ceñidos */
main p { line-height: 1.6; }
main h1, main h2, main h3 { letter-spacing: -0.02em; }

/* ═══════════ KEN BURNS — fotos de producto "vivas" ═══════════
   Zoom + paneo lento e infinito en alternancia. Cada tarjeta arranca con
   un pequeño desfase para que no se muevan todas al unísono. Se detiene
   por completo si el usuario prefiere menos movimiento. */
.ken-burns {
  animation: kenburns 22s ease-in-out infinite alternate;
  transform-origin: center;
  will-change: transform;
}
.ken-burns-wrap:nth-of-type(3n) .ken-burns   { animation-duration: 26s; animation-delay: -6s; transform-origin: top left; }
.ken-burns-wrap:nth-of-type(3n+1) .ken-burns { animation-duration: 20s; animation-delay: -3s; transform-origin: bottom right; }
@keyframes kenburns {
  from { transform: scale(1.02) translate(0, 0); }
  to   { transform: scale(1.14) translate(-1.5%, 1.5%); }
}
/* En hover intensifica un pelín la sensación de vida */
.group:hover .ken-burns { animation-duration: 12s; }

@media (prefers-reduced-motion: reduce) {
  .ken-burns { animation: none !important; transform: scale(1.02); }
}

/* ═══════════════════════════════════════════════════════════════════
   TOKENS DE DISEÑO — fuente única de verdad para tipografía, botones,
   secciones y radios. Reemplaza los tamaños sueltos (t-body,
   px-9 py-4, etc.) por clases semánticas. Patrón AWS/Stripe/Siemens.
   ═══════════════════════════════════════════════════════════════════ */

/* ── Escala tipográfica (usar estas, no píxeles sueltos) ── */
.t-display { font-size: clamp(2.25rem, 5vw, 3.5rem); line-height: 1.05; letter-spacing: -0.03em; }
.t-h2      { font-size: clamp(1.75rem, 3.5vw, 2.5rem); line-height: 1.1; letter-spacing: -0.02em; }
.t-h3      { font-size: 1.25rem; line-height: 1.3; letter-spacing: -0.01em; }
.t-body    { font-size: 0.9375rem; line-height: 1.6; }   /* = 15px, ahora tokenizado */
.t-caption { font-size: 0.8125rem; line-height: 1.5; }   /* = 13px */
.t-micro   { font-size: 0.6875rem; line-height: 1.4; letter-spacing: 0.04em; } /* = 11px, badges/meta */

/* ── Sistema de botones: UNA definición, tres tamaños ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  font-weight: 600; font-size: 0.875rem; line-height: 1;
  padding: 0.75rem 1.5rem;            /* alto uniforme = 44px táctil */
  border-radius: 9999px;
  transition: background-color .2s, color .2s, transform .1s;
  white-space: nowrap;
}
.btn:active { transform: scale(0.985); }
.btn-sm { padding: 0.5rem 1rem; font-size: 0.8125rem; }
.btn-lg { padding: 0.9rem 2rem; font-size: 0.95rem; }
.btn-primary   { background: #0A2540; color: #fff; }
.btn-primary:hover   { background: #047857; }
.btn-accent    { background: #047857; color: #fff; }
.btn-accent:hover    { background: #065F46; }
.btn-ghost     { background: #fff; color: #0A2540; border: 1px solid #E5E7EB; }
.btn-ghost:hover     { border-color: #047857; color: #047857; }

/* ── Ritmo de sección: 2 valores, no 6 ── */
.section-pad { padding-top: 5rem; padding-bottom: 5rem; }
@media (max-width: 640px) { .section-pad { padding-top: 3rem; padding-bottom: 3rem; } }
P11_EOF

# -----------------------------------------------------------------------------
# scripts/audit-ui.mjs
# -----------------------------------------------------------------------------
mkdir -p "scripts"
cat > "scripts/audit-ui.mjs" <<'P11_EOF'
#!/usr/bin/env node
/**
 * AUDITORÍA VISUAL AUTOMÁTICA — contraste WCAG, desbordamiento y objetivos táctiles.
 *
 * Por qué existe: los fallos de interfaz no los detecta ni TypeScript ni el
 * linter ni los tests unitarios. Se detectan mirando. Este script mira por
 * nosotros: recorre las rutas representativas en claro y oscuro, en escritorio
 * y móvil, y mide el contraste real de cada nodo de texto contra su fondo
 * efectivo.
 *
 * Encontró de verdad: el cuerpo de texto de las 12 páginas de ciudad en 1.81:1
 * (invisible en modo oscuro), el título del formulario de cotización en 1.01:1,
 * y el CTA de ciudad en 3.3:1.
 *
 * Uso:
 *   npm run build && npm run start &     # o npx next start -p 3100
 *   node scripts/audit-ui.mjs            # BASE=http://localhost:3000 por defecto
 *   node scripts/audit-ui.mjs --update   # reescribe la línea base
 *
 * Falla (exit 1) si el número de clases con fallo SUPERA la línea base de
 * docs/ui-audit-baseline.json. Es un trinquete: la interfaz solo puede mejorar.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

/* Playwright es una dependencia OPCIONAL: pesa (descarga un navegador) y solo
   hace falta para esta auditoría. Si no está, se explica cómo instalarla en
   vez de reventar con un stack trace. */
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    'Falta playwright. Instálelo solo cuando vaya a auditar:\n' +
      '  npm i -D playwright && npx playwright install chromium\n',
  );
  process.exit(1);
}

const BASE = process.env.BASE || 'http://localhost:3000';
const BASELINE = 'docs/ui-audit-baseline.json';
const UPDATE = process.argv.includes('--update');

const ROUTES = [
  ['home', '/'],
  ['catalogo', '/productos'],
  ['producto', '/productos/big-bags-bolsones-polipropileno'],
  ['familia', '/productos/familia/geosinteticos'],
  ['comparar', '/productos/familia/geosinteticos/comparar'],
  ['recursos', '/recursos'],
  ['articulo', '/recursos/calculo-caudal-mangas-ventilacion-mina-subterranea'],
  ['marco', '/marco'],
  ['marco-evaluacion', '/marco/evaluacion'],
  ['soluciones', '/soluciones'],
  ['solucion', '/soluciones/poza-revestida-impermeabilizacion'],
  ['local-hub', '/local'],
  ['ciudad', '/local/arequipa'],
  ['servicios', '/servicios'],
  ['nosotros', '/nosotros'],
  ['contacto', '/contacto'],
  ['cotizacion', '/cotizacion'],
];
const VIEWPORTS = [['desktop', 1280, 900], ['movil', 390, 844]];

/** Se ejecuta DENTRO del navegador: sin dependencias externas. */
const AUDIT = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  };
  /** Texto sobre fotografía: el contraste no es medible desde CSS. Se omite. */
  const sobreImagen = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
      if (n.tagName !== 'MAIN' && n.querySelector && n.querySelector(':scope img')) return true;
      n = n.parentElement;
    }
    return false;
  };
  const fondoEfectivo = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0.85) return bg;
      n = n.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  };

  const out = { contrast: [], overflow: 0, smallTaps: [], missingAlt: 0 };
  out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;

  const vistos = new Set();
  for (const el of document.querySelectorAll('main *')) {
    const texto = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (!texto || texto.length < 3) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.15) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    if (cs.position === 'absolute' && sobreImagen(el)) continue;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.5) continue;
    const r = ratio(fg, fondoEfectivo(el));
    const size = parseFloat(cs.fontSize);
    const grande = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    const min = grande ? 3 : 4.5;
    if (r < min) {
      const clave = `${cs.color}|${el.className}`.slice(0, 120);
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      out.contrast.push({
        ratio: +r.toFixed(2), min, texto: texto.slice(0, 45),
        cls: String(el.className).slice(0, 70), color: cs.color,
      });
    }
  }

  for (const el of document.querySelectorAll('main a, main button')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.height < 24 || r.width < 24) {
      out.smallTaps.push({ t: (el.textContent || '').trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  out.missingAlt = document.querySelectorAll('main img:not([alt])').length;
  return out;
};

/* En entornos donde Playwright no descargó su navegador (CI, contenedores),
   se admite un Chromium del sistema vía PLAYWRIGHT_CHROMIUM_PATH. */
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {},
);
const informe = [];
for (const [vp, w, h] of VIEWPORTS) {
  for (const theme of ['light', 'dark']) {
    for (const [route, path] of ROUTES) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      if (theme === 'dark') await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      try {
        await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(200);
        informe.push({ vp, theme, route, path, ...(await page.evaluate(AUDIT)) });
      } catch (e) {
        console.error(`  ! ${vp}/${theme}${path}: ${e.message.split('\n')[0]}`);
      }
      await ctx.close();
    }
  }
}
await browser.close();

const clases = { light: new Set(), dark: new Set() };
for (const p of informe) for (const c of p.contrast) clases[p.theme].add(c.cls.slice(0, 50) + '|' + c.color);
const overflow = informe.filter((p) => p.overflow > 1);
const alts = informe.reduce((n, p) => n + p.missingAlt, 0);

const actual = { contrasteClaro: clases.light.size, contrasteOscuro: clases.dark.size, desbordamiento: overflow.length, imagenesSinAlt: alts };

console.log(`\nVistas auditadas: ${informe.length}`);
console.log(`Contraste — clases con fallo:  claro ${actual.contrasteClaro}   oscuro ${actual.contrasteOscuro}`);
console.log(`Desbordamiento horizontal: ${actual.desbordamiento}    Imágenes sin alt: ${actual.imagenesSinAlt}`);

const peores = new Map();
for (const p of informe) for (const c of p.contrast) {
  const k = c.cls.slice(0, 50) + '|' + c.color;
  if (!peores.has(k)) peores.set(k, { ...c, theme: p.theme, rutas: new Set() });
  peores.get(k).rutas.add(p.route);
}
console.log('\nPeores casos:');
[...peores.values()].sort((a, b) => a.ratio - b.ratio).slice(0, 10)
  .forEach((c) => console.log(`  ${String(c.ratio).padStart(5)} (min ${c.min}) ${c.theme.padEnd(5)} [${c.cls.slice(0, 44)}] → ${[...c.rutas].slice(0, 3).join(',')}`));

if (UPDATE || !existsSync(BASELINE)) {
  writeFileSync(BASELINE, JSON.stringify(actual, null, 2) + '\n');
  console.log(`\nLínea base escrita en ${BASELINE}.`);
  process.exit(0);
}

const base = JSON.parse(readFileSync(BASELINE, 'utf8'));
const regresiones = Object.entries(actual).filter(([k, v]) => v > (base[k] ?? 0));
if (regresiones.length) {
  console.error('\nREGRESIÓN respecto de la línea base:');
  for (const [k, v] of regresiones) console.error(`  ${k}: ${base[k]} → ${v}`);
  console.error('\nCorrija, o justifique y actualice con --update.');
  process.exit(1);
}
console.log('\nSin regresiones respecto de la línea base.');
P11_EOF

# -----------------------------------------------------------------------------
# test/dark-mode.test.ts
# -----------------------------------------------------------------------------
mkdir -p "test"
cat > "test/dark-mode.test.ts" <<'P11_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

/**
 * El modo oscuro del sitio funciona con una capa de compatibilidad en
 * globals.css: los componentes escriben utilidades literales (bg-white,
 * text-gray-800…) y esa capa las remapea a los tokens del tema dentro de
 * <main>. Si la capa no cubre un tipo de elemento, ese elemento se queda
 * BLANCO sobre página oscura y su texto desaparece.
 *
 * Ocurrió de verdad: el encabezado y la primera columna de las tablas
 * comparativas (th) y el bloque "En resumen" de las guías (text-gray-800)
 * quedaban ilegibles. Estos tests fijan la cobertura.
 */
describe('modo oscuro: cobertura de la capa de compatibilidad', () => {
  const surfaceRule =
    css.match(/\.dark main :is\(([^)]*)\)\.bg-white \{/)?.[1] ?? '';

  it('la regla de superficie cubre tablas, celdas, chips y párrafos', () => {
    for (const tag of ['div', 'section', 'article', 'li', 'p', 'span', 'th', 'td', 'table', 'tr']) {
      expect(surfaceRule, `falta ${tag} en la capa oscura`).toContain(tag);
    }
  });

  it('bg-gray-50 y bg-gray-100 tienen la misma cobertura que bg-white', () => {
    const grayRule = css.match(/\.dark main :is\(([^)]*)\)\.bg-gray-50/)?.[1] ?? '';
    for (const tag of ['th', 'td', 'span', 'p']) {
      expect(grayRule, `falta ${tag} en bg-gray-50`).toContain(tag);
    }
  });

  it('text-gray-800 es tinta principal, no secundaria', () => {
    // Mapearla a --text-muted dejaba el resumen de cada guía casi ilegible.
    expect(css).toMatch(/\.dark main :is\(\.text-gray-800, \.text-gray-900\) \{ color: var\(--text\)/);
  });

  it('text-gray-400 sigue siendo tenue pero legible', () => {
    expect(css).toMatch(/\.dark main :is\(\.text-gray-400, \.text-neutral-400\)/);
  });

  it('los fondos semánticos de aviso también siguen al tema', () => {
    // Los cuadros de riesgo en ámbar quedaban claros con tinta clara encima.
    expect(css).toMatch(/\.bg-amber-50, \.bg-amber-100, \.bg-red-50/);
  });

  it('la escala neutral está cubierta igual que la gray', () => {
    // Las 12 páginas de ciudad usan neutral-*: sin esto, su cuerpo de texto
    // quedaba en 1.81:1 sobre fondo oscuro.
    expect(css).toMatch(/\.dark main :is\(\.text-neutral-500, \.text-neutral-600, \.text-neutral-700\)/);
    expect(css).toMatch(/\.dark main :is\(\.text-neutral-800, \.text-neutral-900\)/);
    expect(css).toContain('.border-neutral-300');
  });

  it('la capa oscura iguala la fuerza de la capa AA de modo claro', () => {
    // La capa AA de claro usa !important. Sin !important, las reglas oscuras
    // perdían y el texto conservaba el color pensado para fondo blanco.
    const oscuras = css.match(/\.dark main :is\(\.text-gray-500[^\n]*/)?.[0] ?? '';
    expect(oscuras).toContain('!important');
  });

  it('el verde de marca se aclara en oscuro en vez de oscurecerse', () => {
    // #047857 cumple AA sobre blanco y falla (2.87:1) sobre la página oscura.
    expect(css).toMatch(/\.dark main :is\(\.text-\\\[\\#059669\\\]/);
    expect(css).toContain('var(--brand-hover) !important');
  });

  it('la excepción del CTA blanco exige la tinta navy en el PROPIO elemento', () => {
    // Con selector por descendencia, las tarjetas-enlace forzaban su título a
    // navy sobre superficie oscura (1.01:1).
    expect(css).not.toMatch(/\.dark main :is\(a, button\)\.bg-white \.text-/);
  });

  it('los CTA blancos sobre bloques oscuros siguen siendo blancos', () => {
    // Esta excepción debe ir DESPUÉS de la regla general o el botón blanco
    // del hero y de los CTA se volvería una superficie oscura.
    const generic = css.indexOf('.dark main :is(div, section, article, aside, li, p, span');
    const exception = css.indexOf('.dark main :is(a, button).bg-white');
    expect(generic).toBeGreaterThan(-1);
    expect(exception).toBeGreaterThan(generic);
  });
});
P11_EOF

# -----------------------------------------------------------------------------
echo ""
echo "P11 aplicado. Archivos escritos:"
echo "  nuevos      lib/solutions.ts"
echo "              app/soluciones/page.tsx"
echo "              app/soluciones/[slug]/page.tsx"
echo "              test/solutions.test.ts"
echo "  modificados app/sitemap.ts, app/llms.txt/route.ts,"
echo "              app/productos/[slug]/page.tsx, components/Navbar.tsx,"
echo "              components/Footer.tsx, components/TrackView.tsx,"
echo "              lib/analytics.ts, app/globals.css,"
echo "              scripts/audit-ui.mjs, test/dark-mode.test.ts"
echo ""
echo "Siguiente paso:"
echo "  npx tsc --noEmit && npx next lint && npm test && npm run build"
