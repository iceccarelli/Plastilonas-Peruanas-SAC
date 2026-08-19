#!/usr/bin/env bash
# =============================================================================
# P7 — COMPARATIVAS + EL DEEP LINK DE COTIZACIÓN QUE NO FUNCIONABA
#
# Plastilonas Peruanas SAC. Aplica sobre main en c33e693 o posterior.
#
# 1. DEFECTO: app/cotizacion/page.tsx nunca leía `?producto=`. Las 36 fichas
#    enlazan ahí con el nombre del producto desde DOS botones cada una, y el
#    parámetro se descartaba: el comprador llegaba al formulario con el campo
#    vacío y tenía que volver a escribir lo que acababa de mirar. El dato más
#    valioso del embudo se perdía en el último paso.
#
# 2. Tablas comparativas por familia: así decide un comprador técnico, poniendo
#    las alternativas lado a lado. Se generan las 8 familias con dos o más
#    productos; las de un solo producto quedan fuera.
#
# 3. Limpieza: se elimina el PDF de muestra que quedó suelto en la raíz del
#    repositorio; la ficha real se genera en /productos/<slug>/ficha-tecnica.pdf
#    y ese archivo suelto solo puede desincronizarse.
#
# Uso:   bash apply-p7-comparativas.sh
# =============================================================================
set -euo pipefail

if [ ! -f package.json ] || [ ! -d app ]; then
  echo "ERROR: ejecute este script desde la raíz del repo." >&2
  exit 1
fi

echo "==> Creando directorios"
mkdir -p "app/productos/familia/[slug]/comparar"

echo "==> Eliminando el PDF de muestra suelto en la raíz"
rm -f fichabigbagsbolsonespolipropileno.pdf ficha-big-bags-bolsones-polipropileno.pdf

echo "==> Escribiendo lib/families.ts"
cat > 'lib/families.ts' <<'PP_EOF'
import { productFamilies, products } from './products';

/**
 * CONTENIDO EDITORIAL POR FAMILIA (/productos/familia/[slug]).
 *
 * Por qué existe esta capa: hasta ahora la navegación por familia se resolvía
 * con `?categoria=` sobre el catálogo filtrado en cliente. Eso funciona para el
 * usuario pero deja UNA sola URL indexable para once mercados distintos: quien
 * busca "geomembranas Perú" y quien busca "big bags minería" aterrizan en la
 * misma página genérica. Cada familia necesita su propia URL estática con
 * contenido propio, schema propio y enlazado propio.
 *
 * REGLA DE HONESTIDAD: el texto describe criterios técnicos de especificación y
 * cómo abastecemos cada línea (dato que ya vive en `sourcing`/`availability`).
 * No declara certificaciones, proyectos, capacidades de planta ni volúmenes que
 * el catálogo no respalde.
 */

export interface FamilyContent {
  /** Debe coincidir con ProductFamily.slug de lib/products.ts. */
  slug: string;
  /** H1 de la página de familia, con intención de búsqueda. */
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  /** Qué define realmente la especificación en esta familia. */
  selectionCriteria: { titulo: string; detalle: string }[];
  faqs: { q: string; a: string }[];
}

export const familyContent: FamilyContent[] = [
  {
    slug: 'envases-embalaje',
    h1: 'Envases y embalaje industrial a medida en el Perú',
    metaTitle: 'Envases y embalaje industrial: big bags, sacos y films | Perú',
    metaDescription:
      'Big Bags FIBC, sacos polytarp, bolsas y láminas de polietileno y films termocontraíbles fabricados a medida para minería, agroexportación y logística en el Perú.',
    intro: [
      'El envase industrial es el último eslabón entre su producto terminado y el cliente, y el primero que falla cuando se especifica por precio unitario. Un bolsón que se rompe en cancha, un film que no unitiza la paleta o un saco que no resiste la estiba convierten un ahorro de céntimos por unidad en pérdida de producto, parada de despacho e incidente de seguridad.',
      'Esta familia cubre el envase de material a granel y la protección de carga paletizada. Todo se define por especificación: capacidad real según densidad aparente, configuración de boca y fondo, tratamientos y documentación exigida por el destino.',
    ],
    selectionCriteria: [
      {
        titulo: 'Densidad aparente del material',
        detalle:
          'El envase se compra por peso pero se llena por volumen. Sin densidad aparente, el dimensionamiento sale mal en una de dos direcciones: se paga volumen que nunca se usa o se sobrellena por encima de la carga de trabajo segura.',
      },
      {
        titulo: 'Carga de trabajo segura y relación de seguridad',
        detalle:
          'En big bags, la relación 5:1 corresponde a un solo uso y 6:1 a uso múltiple con inspección documentada. Es un criterio de uso, no un grado de calidad del tejido.',
      },
      {
        titulo: 'Configuración de carga y descarga',
        detalle:
          'Boca abierta, con boquilla, con falda o con cierre; fondo plano o con descarga. Define la velocidad de llenado y vaciado en su operación, no la resistencia.',
      },
      {
        titulo: 'Exposición y tratamiento',
        detalle:
          'Anti-UV, impermeabilidad y antiestático según dónde se almacena y qué contiene. El polipropileno expuesto a la intemperie durante meses llega degradado a la operación sin que se note a simple vista.',
      },
      {
        titulo: 'Documentación exigida por el destino',
        detalle:
          'Terminales portuarios y clientes de exportación piden certificación de fabricación por lote. Ese requisito debe entrar en la cotización, no aparecer cuando el contenedor ya está en camino.',
      },
    ],
    faqs: [
      {
        q: '¿Fabrican big bags a medida en el Perú?',
        a: 'Sí. Los Big Bags y sacos de esta familia son de fabricación propia y se producen según la especificación del cliente: dimensiones, capacidad, configuración de boca y fondo, y tratamientos. Las bolsas, láminas y films de polietileno se abastecen por importación directa bajo nuestro control.',
      },
      {
        q: '¿Cuál es el pedido mínimo de envases industriales?',
        a: 'Depende del producto y de la configuración: un bolsón a medida con boca y fondo especiales tiene una cantidad mínima distinta a la de un film estándar. Se confirma en la cotización junto con el plazo, según especificación y ciudad de entrega.',
      },
      {
        q: '¿Pueden imprimir el logo de mi empresa en los big bags?',
        a: 'Sí, los Big Bags admiten personalización con logo y especificaciones del cliente. La cantidad de colores y la ubicación de la impresión se definen al cotizar, ya que afectan el proceso de fabricación.',
      },
    ],
  },
  {
    slug: 'lonas-cobertores',
    h1: 'Lonas, cobertores y mantas industriales confeccionadas a medida',
    metaTitle: 'Lonas y cobertores industriales a medida | Perú',
    metaDescription:
      'Lona plastificada, mantas y cobertores para camiones, siders, cobertores agrícolas y mantas aislantes, confeccionados a medida en el Perú con refuerzos y ojalillos según uso.',
    intro: [
      'La lona es el producto donde la confección pesa más que el material. Dos cobertores del mismo rollo se comportan de forma completamente distinta según el paso de costura, el refuerzo del perímetro, la distancia entre ojalillos y el tratamiento del borde: ahí es donde una lona dura tres temporadas o se rasga en la primera tormenta.',
      'Esta familia cubre desde el cobertor de camión que trabaja a 90 km/h con carga viva hasta la manta térmica de proceso industrial. Todo se confecciona a la medida real del elemento a cubrir, no a medidas de catálogo.',
    ],
    selectionCriteria: [
      {
        titulo: 'Gramaje y material según exposición',
        detalle:
          'El gramaje se elige por la combinación de radiación UV, abrasión y carga de viento del uso real. Sobredimensionar encarece y agrega peso que el operario no querrá manipular; subdimensionar acorta la vida útil a una temporada.',
      },
      {
        titulo: 'Refuerzo perimetral y densidad de ojalillos',
        detalle:
          'El perímetro es donde se concentra el esfuerzo. Un refuerzo continuo y una distancia de ojalillos adecuada a la carga de viento evitan el desgarro progresivo desde el punto de amarre.',
      },
      {
        titulo: 'Tipo de unión',
        detalle:
          'Costura, termosellado o alta frecuencia según estanqueidad requerida y esfuerzo mecánico. Una unión cosida filtra por la perforación de la aguja cuando la aplicación exige impermeabilidad total.',
      },
      {
        titulo: 'Sistema de amarre y manipulación',
        detalle:
          'Quién y cómo lo va a colocar determina el diseño: un cobertor que dos personas no pueden tender en cinco minutos termina mal colocado o directamente sin usar.',
      },
    ],
    faqs: [
      {
        q: '¿Hacen lonas y cobertores en medidas especiales?',
        a: 'Sí, es el modo estándar de trabajo en esta familia: la confección es propia y se ejecuta a la medida real del elemento a cubrir, con el refuerzo perimetral, la densidad de ojalillos y el sistema de amarre definidos según el uso.',
      },
      {
        q: '¿Qué información necesitan para cotizar una lona a medida?',
        a: 'Las dimensiones exactas del elemento a cubrir, el uso (transporte, obra, almacenamiento, agrícola), la exposición esperada al sol y al viento, si requiere impermeabilidad total, y el sistema de amarre disponible. Con eso se define material, gramaje y confección.',
      },
      {
        q: '¿Cuánto dura una lona industrial a la intemperie?',
        a: 'Depende del material, del gramaje, del tratamiento UV y sobre todo de la exposición real: la radiación de sierra sobre 3000 msnm degrada mucho más rápido que la garúa costera. Por eso la especificación parte de dónde va a trabajar la lona, no de un plazo genérico.',
      },
    ],
  },
  {
    slug: 'estructuras-arquitectura-textil',
    h1: 'Carpas, coberturas tensadas y arquitectura textil en el Perú',
    metaTitle: 'Carpas industriales y arquitectura textil a medida | Perú',
    metaDescription:
      'Carpas con estructura metálica, coberturas tensadas, módulos para campamento, galpones e invernaderos y toldos, diseñados, fabricados e instalados a medida en el Perú.',
    intro: [
      'Una cobertura textil es una estructura, no una lona grande. El textil trabaja a tracción y transmite las cargas de viento y de nieve a un sistema estructural que debe estar dimensionado para recibirlas: cuando falla una carpa industrial, casi nunca falla la tela, falla el anclaje o el cálculo de la carga que nadie hizo.',
      'Esta familia cubre desde el módulo de campamento minero hasta la cubierta tensada arquitectónica. Cada proyecto parte de la geometría, la ubicación y las cargas del sitio.',
    ],
    selectionCriteria: [
      {
        titulo: 'Cargas de viento del emplazamiento',
        detalle:
          'La zona, la altura sobre el terreno y la exposición definen la presión de diseño. Es el dato que gobierna la estructura y el que más se omite en un requerimiento inicial.',
      },
      {
        titulo: 'Sistema de anclaje disponible',
        detalle:
          'Anclar sobre losa existente, sobre terreno natural o con lastre son tres proyectos distintos. El anclaje define el sistema, no al revés.',
      },
      {
        titulo: 'Permanencia y desmontabilidad',
        detalle:
          'Una cobertura permanente y una que se monta y desmonta cada campaña se diseñan distinto en uniones, tratamiento y logística.',
      },
      {
        titulo: 'Uso interior',
        detalle:
          'Almacenamiento, taller, comedor, invernadero o albergue determinan requisitos de luz, ventilación, aislamiento y comportamiento frente al fuego.',
      },
    ],
    faqs: [
      {
        q: '¿Instalan las carpas y estructuras que fabrican?',
        a: 'Sí. Esta familia incluye fabricación e instalación: la cobertura textil y su sistema estructural se entregan montados, porque el desempeño depende tanto del textil como del anclaje y del tensado.',
      },
      {
        q: '¿Qué datos necesitan para cotizar una carpa industrial?',
        a: 'Superficie a cubrir y geometría, altura libre requerida, ubicación exacta (define cargas de viento), tipo de piso o terreno disponible para el anclaje, uso interior previsto, y si la estructura será permanente o desmontable.',
      },
      {
        q: '¿Sirven para campamentos mineros en altura?',
        a: 'Los módulos, albergues y carpas de esta familia se especifican según el emplazamiento. En altura, la radiación UV, la amplitud térmica y las cargas de viento son más exigentes y elevan los requisitos de material y de anclaje, lo que se refleja en el diseño y en la cotización.',
      },
    ],
  },
  {
    slug: 'mallas-agricolas',
    h1: 'Mallas agrícolas: antiáfidas, raschel y antipájaro para el agro peruano',
    metaTitle: 'Mallas agrícolas antiáfidas, raschel y antipájaro | Perú',
    metaDescription:
      'Mallas antiáfidas para control de plagas, malla raschel de sombra y mallas antipájaro y antigranizo para protección de cultivos en la costa, sierra y selva del Perú.',
    intro: [
      'En agroexportación la malla no es un insumo de ferretería: es una barrera sanitaria y un instrumento de manejo de radiación. La densidad de trama de una antiáfida determina qué insecto pasa y cuál no; el porcentaje de sombra de una raschel cambia la temperatura de hoja y, con ella, el comportamiento del cultivo.',
      'Esta familia se abastece por importación directa, lo que permite mantener densidades y porcentajes consistentes entre lotes: un cambio de trama entre campañas invalida la comparación agronómica del ciclo anterior.',
    ],
    selectionCriteria: [
      {
        titulo: 'Densidad de trama (mesh) según la plaga objetivo',
        detalle:
          'La malla antiáfida se elige por el tamaño del insecto que debe excluir. Una trama más cerrada excluye más, pero también reduce el intercambio de aire y eleva la temperatura interior.',
      },
      {
        titulo: 'Porcentaje de sombra',
        detalle:
          'Se define por cultivo, etapa fenológica y radiación de la zona. La misma malla que protege en Ica puede sombrear de más en un valle con menor radiación.',
      },
      {
        titulo: 'Resistencia UV y vida útil esperada',
        detalle:
          'El tratamiento UV determina cuántas campañas resiste antes de perder resistencia mecánica. En zonas de alta radiación es el factor dominante del costo por campaña.',
      },
      {
        titulo: 'Sistema de fijación y tensado',
        detalle:
          'La mayoría de las fallas ocurren en el punto de amarre, no en el paño. El refuerzo de borde y la separación de los puntos de fijación deben corresponder al viento de la zona.',
      },
    ],
    faqs: [
      {
        q: '¿Qué malla antiáfida necesito para mi cultivo?',
        a: 'Se define por la plaga que debe excluir, que determina la densidad de trama, y por el compromiso con la ventilación: a mayor cierre de trama, mayor exclusión pero menor intercambio de aire y mayor temperatura interior. La radiación de la zona y el cultivo terminan de definir la selección.',
      },
      {
        q: '¿Qué porcentaje de sombra debe tener la malla raschel?',
        a: 'Depende del cultivo, la etapa del ciclo y la radiación del valle. No hay un porcentaje universal: la misma malla puede ser adecuada en una zona de alta radiación e insuficiente o excesiva en otra.',
      },
      {
        q: '¿Venden mallas por rollo completo o cortadas a medida?',
        a: 'Ambas modalidades existen en esta familia según el producto: hay líneas en stock por rollo y líneas que se cortan y confeccionan a medida con refuerzo de borde. La disponibilidad exacta se confirma en la cotización.',
      },
    ],
  },
  {
    slug: 'ventilacion-industrial',
    h1: 'Mangas de ventilación para minería subterránea y túneles',
    metaTitle: 'Mangas de ventilación minera y de túneles a medida | Perú',
    metaDescription:
      'Mangas de ventilación impelente y aspirante para labores subterráneas y túneles, fabricadas a medida en el Perú según diámetro, tramo y sistema de unión.',
    intro: [
      'La manga es el último tramo del sistema de ventilación y el punto donde se pierde el aire que el proyecto ya pagó. El síntoma es siempre el mismo: el ventilador cumple su curva, el cálculo dice que hay caudal suficiente y la medición en el frente no llega.',
      'Se fabrican a medida porque el diámetro, la longitud de tramo, el sistema de unión y el refuerzo se derivan del cálculo de caudal y de las condiciones reales de la labor, no de un catálogo de medidas estándar.',
    ],
    selectionCriteria: [
      {
        titulo: 'Caudal requerido y diámetro',
        detalle:
          'La pérdida por fricción crece de forma muy pronunciada al reducir la sección. Aumentar el diámetro suele ser más barato que instalar un ventilador mayor, que además consume más energía cada hora de operación.',
      },
      {
        titulo: 'Sistema impelente o aspirante',
        detalle:
          'Soplar hacia el frente o extraer desde él exige mangas distintas: la aspirante trabaja a presión negativa y debe resistir el colapso.',
      },
      {
        titulo: 'Longitud de tramo y número de empalmes',
        detalle:
          'Cada empalme es un punto potencial de fuga. Menos uniones y mejor ejecutadas valen más que un material superior mal empalmado.',
      },
      {
        titulo: 'Abrasión y humedad de la labor',
        detalle:
          'El roce contra la caja perfora la manga y genera fugas progresivas que nadie registra. El refuerzo y el sistema de suspensión se eligen por esa realidad.',
      },
    ],
    faqs: [
      {
        q: '¿Cómo se calcula el diámetro de una manga de ventilación?',
        a: 'A partir del caudal requerido en el frente —determinado por personal, equipo diésel y dilución de gases de voladura, corregido por altitud— y de la pérdida de carga admisible en el tramo. El diámetro se elige antes de seleccionar el ventilador, no después.',
      },
      {
        q: '¿Fabrican mangas de ventilación a medida?',
        a: 'Sí, son de fabricación propia y se producen según diámetro, longitud de tramo, sistema de unión y condiciones de la labor. Las especificaciones exactas se definen en la cotización.',
      },
      {
        q: '¿Por qué llega menos aire al frente que el que entrega el ventilador?',
        a: 'Por pérdida de carga por fricción a lo largo de la manga, que depende fuertemente del diámetro, y por fugas de la instalación: uniones deficientes, perforaciones por roce, catenaria excesiva y empalmes improvisados. Por eso la auditoría válida mide caudal en el frente, no en la boca del ventilador.',
      },
    ],
  },
  {
    slug: 'geosinteticos',
    h1: 'Geosintéticos e impermeabilización: geomembranas, geotextiles y geomallas',
    metaTitle: 'Geomembranas HDPE y PVC, geotextiles y geomallas | Perú',
    metaDescription:
      'Geomembranas de PVC, HDPE, PE fortificado y bituminosas, geotextiles, geomallas y geocompuestos de drenaje para pozas, canales, rellenos y obras en el Perú.',
    intro: [
      'En impermeabilización, el material es la parte fácil. Una geomembrana bien especificada y mal instalada se comporta peor que una lámina más delgada bien instalada: las filtraciones aparecen en la soldadura, en las penetraciones y en la zanja de anclaje, casi nunca en el centro del panel.',
      'Esta familia cubre la barrera (geomembranas), la protección y separación (geotextiles), el refuerzo (geomallas) y el drenaje (geocompuestos). Las líneas técnicas se abastecen bajo pedido con ficha y certificado de lote del fabricante entregados en la cotización: no publicamos como propios números de certificado que no podemos respaldar.',
    ],
    selectionCriteria: [
      {
        titulo: 'Qué contiene y con qué agresividad',
        detalle:
          'Agua, solución de proceso o lixiviado no exigen la misma barrera. La compatibilidad química con el líquido contenido precede a cualquier decisión de espesor.',
      },
      {
        titulo: 'Carga hidráulica y geometría de taludes',
        detalle:
          'La altura de columna y la pendiente definen el esfuerzo sobre la lámina y sobre su anclaje, y determinan si hace falta protección adicional.',
      },
      {
        titulo: 'Calidad de la subrasante',
        detalle:
          'Una superficie con material anguloso perfora la lámina desde abajo cuando el líquido la presiona contra el terreno. Si el terreno no cumple, la respuesta correcta es geotextil de protección o corregirlo, no "desplegar con cuidado".',
      },
      {
        titulo: 'Plan de ensayos de costura',
        detalle:
          'Toda costura debe ensayarse: presión de aire en el canal central de la soldadura por cuña doble, caja de vacío en las soldaduras por extrusión. Una costura sin registro de ensayo es una costura no ejecutada.',
      },
      {
        titulo: 'Exposición y vida útil requerida',
        detalle:
          'Una lámina expuesta y una enterrada envejecen de forma distinta. La vida útil requerida cambia el material antes que el espesor.',
      },
    ],
    faqs: [
      {
        q: '¿Qué geomembrana conviene para una poza: PVC o HDPE?',
        a: 'Depende del líquido contenido y su agresividad química, de la geometría y pendiente de los taludes, de la carga hidráulica, de si la lámina quedará expuesta o enterrada y de la vida útil requerida. Son criterios de proyecto: no existe una respuesta de catálogo válida para todos los casos.',
      },
      {
        q: '¿Instalan las geomembranas o solo venden el material?',
        a: 'Ofrecemos fabricación e instalación. En impermeabilización, el desempeño depende críticamente de la ejecución —recepción de subrasante, zanja de anclaje, soldadura y ensayos—, por lo que el suministro sin instalación traslada ese riesgo al cliente.',
      },
      {
        q: '¿Entregan ficha técnica y certificado del material?',
        a: 'Sí. Las líneas de geosintéticos se manejan bajo pedido y la ficha técnica junto con el certificado de lote del fabricante se entregan en la cotización. No publicamos como propios números de certificado que no podamos respaldar con documento.',
      },
    ],
  },
  {
    slug: 'ambientales-fluidos',
    h1: 'Soluciones ambientales y manejo de fluidos: tanques flexibles, biodigestores y tuberías HDPE',
    metaTitle: 'Tanques flexibles, biodigestores y tuberías HDPE | Perú',
    metaDescription:
      'Tanques flexibles y bladders para almacenamiento de agua y combustible, biodigestores y tuberías HDPE para saneamiento, agricultura y operaciones mineras en el Perú.',
    intro: [
      'Almacenar y conducir fluidos en operaciones remotas plantea un problema distinto al de la obra urbana: la solución tiene que llegar en camión, montarse sin grúa y funcionar sin mantenimiento especializado durante toda la campaña.',
      'Esta familia se abastece por importación directa y mediante aliados técnicos especializados, en modalidad bajo pedido. Se declara así de forma explícita: preferimos decir cómo abastecemos cada línea antes que presentar todo como fabricación propia.',
    ],
    selectionCriteria: [
      {
        titulo: 'Fluido contenido',
        detalle:
          'Agua de consumo, agua de proceso, combustible o efluente exigen compatibilidad de material distinta y, en algunos casos, documentación específica.',
      },
      {
        titulo: 'Volumen y logística de traslado',
        detalle:
          'El volumen útil se define junto con cómo llega el equipo al emplazamiento. Un tanque que no entra al acceso disponible no es una solución.',
      },
      {
        titulo: 'Terreno y preparación de base',
        detalle:
          'Los tanques flexibles requieren una base preparada y libre de elementos punzantes: es el equivalente a la subrasante en impermeabilización.',
      },
      {
        titulo: 'Presión y diámetro en conducción',
        detalle:
          'En tuberías HDPE, la clase de presión y el diámetro se derivan del caudal y del perfil hidráulico, no de la disponibilidad de stock.',
      },
    ],
    faqs: [
      {
        q: '¿Los tanques flexibles sirven para agua potable?',
        a: 'Depende del material y de la documentación de la línea específica. Es exactamente el tipo de requisito que debe declararse al cotizar, porque determina qué producto se ofrece y qué documentación acompaña la entrega.',
      },
      {
        q: '¿Cómo se abastecen estos productos?',
        a: 'Esta familia se maneja por importación directa y mediante aliados técnicos especializados, en modalidad bajo pedido: se confirma disponibilidad, plazo y documentación al cotizar. Lo declaramos de forma explícita en cada ficha.',
      },
      {
        q: '¿Qué se necesita para instalar un tanque flexible?',
        a: 'Una base preparada, nivelada y libre de elementos punzantes, con el área suficiente para el volumen desplegado, más los accesos de llenado y descarga previstos. La preparación de la base es determinante para la vida útil del equipo.',
      },
    ],
  },
  {
    slug: 'seguridad-industrial',
    h1: 'Protección y seguridad industrial: biombos de soldadura y barreras acústicas',
    metaTitle: 'Biombos de soldadura y barreras acústicas industriales | Perú',
    metaDescription:
      'Biombos y cortinas de protección para soldadura y barreras acústicas para obra e industria, fabricados a medida en el Perú según el espacio y el riesgo a controlar.',
    intro: [
      'Los elementos de protección colectiva se especifican por el riesgo que controlan, no por su apariencia. Un biombo de soldadura existe para que la radiación del arco no alcance a quien pasa al lado; una barrera acústica, para que el nivel de presión sonora baje del otro lado de la línea de propiedad.',
      'Se fabrican a medida porque el espacio que deben proteger y la fuente que deben contener son siempre particulares.',
    ],
    selectionCriteria: [
      {
        titulo: 'Riesgo a controlar',
        detalle:
          'Radiación de arco, proyección de partículas, ruido o combinación. Determina material, opacidad y densidad superficial.',
      },
      {
        titulo: 'Geometría del espacio',
        detalle:
          'Altura libre, longitud a cubrir y espacio de circulación definen módulos, apertura y si la solución es fija o móvil.',
      },
      {
        titulo: 'Frecuencia de movimiento',
        detalle:
          'Una protección que se mueve varias veces por turno se diseña distinto que una instalación permanente, en peso, ruedas y sistema de unión.',
      },
    ],
    faqs: [
      {
        q: '¿Fabrican biombos de protección a medida?',
        a: 'Sí, es fabricación propia y se ejecuta a la medida del espacio y del riesgo a controlar: altura, longitud, modulación y sistema de soporte se definen en el requerimiento.',
      },
      {
        q: '¿Qué información necesitan para cotizar una barrera acústica?',
        a: 'La fuente de ruido y su ubicación, la longitud y altura a cubrir, el objetivo de atenuación buscado y las condiciones del emplazamiento (viento, anclaje disponible, permanencia).',
      },
      {
        q: '¿Las cortinas de soldadura cumplen alguna norma?',
        a: 'Los requisitos aplicables dependen de la norma que exija su operación o su cliente. Le indicamos qué documentación puede entregar el fabricante de cada material en la cotización, sin atribuirnos certificaciones que no podamos respaldar.',
      },
    ],
  },
  {
    slug: 'accesorios',
    h1: 'Accesorios y complementos para instalación de lonas y coberturas',
    metaTitle: 'Accesorios de instalación: ojalillos, sogas y tensores | Perú',
    metaDescription:
      'Ojalillos, sogas, tensores, tubos y accesorios de instalación para lonas, cobertores, mallas y estructuras textiles. Disponibles en stock en el Perú.',
    intro: [
      'La mayoría de las fallas de una cobertura ocurren en el punto de amarre, no en el paño. Un cobertor de alto gramaje amarrado con soga inadecuada o con ojalillos demasiado separados se rasga desde el borde en la primera carga de viento seria.',
      'Esta familia existe para cerrar esa brecha: los accesorios se manejan en stock por importación directa y acompañan a las líneas de lonas, mallas y estructuras.',
    ],
    selectionCriteria: [
      {
        titulo: 'Carga en el punto de amarre',
        detalle:
          'El accesorio debe estar por encima de la carga esperada en el punto, no del promedio del conjunto.',
      },
      {
        titulo: 'Compatibilidad con el material',
        detalle:
          'El herraje debe convivir con el textil sin producir abrasión ni corrosión en el punto de contacto.',
      },
      {
        titulo: 'Frecuencia de montaje y desmontaje',
        detalle:
          'Un sistema que se abre a diario exige un accesorio distinto al de una instalación permanente.',
      },
    ],
    faqs: [
      {
        q: '¿Venden accesorios por separado, sin la lona?',
        a: 'Sí. Los accesorios de instalación se manejan en stock y pueden adquirirse de forma independiente, aunque lo habitual es especificarlos junto con la cobertura para que la carga del punto de amarre sea coherente con el paño.',
      },
      {
        q: '¿Cada cuánto deben ir los ojalillos en una lona?',
        a: 'La separación se define por la carga de viento esperada y por el gramaje del material: a mayor exposición, menor separación y mayor refuerzo perimetral. Es parte de la especificación de confección, no un valor fijo.',
      },
      {
        q: '¿Tienen stock disponible de accesorios?',
        a: 'Esta línea se maneja como stock por importación directa. La disponibilidad puntual por cantidad y medida se confirma al cotizar.',
      },
    ],
  },
  {
    slug: 'publicidad',
    h1: 'Publicidad y comunicación visual: gigantografías y rotulado de flota',
    metaTitle: 'Gigantografías, señalética y rotulado vehicular | Perú',
    metaDescription:
      'Gigantografías, señalética y revestimiento vehicular con toldos publicitarios impresos, fabricados a medida en el Perú para comercio, industria y flotas de transporte.',
    intro: [
      'Una gigantografía a la intemperie y una gráfica de flota son problemas de material antes que de diseño: el sustrato debe resistir radiación, lluvia y velocidad sin que la tinta se degrade ni el borde se despegue.',
      'Esta familia es de fabricación propia y aprovecha la misma capacidad de confección de las lonas: refuerzo perimetral, ojalillos y terminaciones pensadas para instalación real a la intemperie, no solo para la impresión.',
    ],
    selectionCriteria: [
      {
        titulo: 'Exposición e iluminación',
        detalle:
          'Interior, exterior o retroiluminado cambian el sustrato y la tinta antes que el diseño.',
      },
      {
        titulo: 'Sistema de montaje',
        detalle:
          'Tensado en bastidor, amarrado con ojalillos o adherido: define terminación, refuerzo y tolerancias de medida.',
      },
      {
        titulo: 'Vida útil esperada de la campaña',
        detalle:
          'Una campaña de tres meses y una señalética permanente no justifican el mismo material.',
      },
      {
        titulo: 'Superficie a rotular en flota',
        detalle:
          'La curvatura, el estado de la superficie y la velocidad de operación determinan el sistema y su durabilidad.',
      },
    ],
    faqs: [
      {
        q: '¿Imprimen gigantografías con refuerzo para exteriores?',
        a: 'Sí. Al ser fabricación propia con la misma capacidad de confección de lonas, las piezas para exterior se entregan con refuerzo perimetral, ojalillos y terminaciones aptas para instalación a la intemperie.',
      },
      {
        q: '¿Qué necesitan para cotizar el rotulado de una flota?',
        a: 'Modelo y cantidad de unidades, superficies a intervenir con sus medidas, el arte o su nivel de avance, si la aplicación es total o parcial, y la vida útil esperada de la campaña.',
      },
      {
        q: '¿Cuánto dura una gigantografía a la intemperie?',
        a: 'Depende del sustrato, del sistema de impresión y de la exposición real del emplazamiento. Se define junto con la duración prevista de la campaña, porque especificar para diez años una campaña de tres meses es dinero perdido.',
      },
    ],
  },
  {
    slug: 'especialidades',
    h1: 'Especialidades: mulch de madera picada para paisajismo y agricultura',
    metaTitle: 'Mulch de madera picada para agricultura y paisajismo | Perú',
    metaDescription:
      'Mulch de madera picada para cobertura de suelo en agricultura, paisajismo y obras: control de malezas, retención de humedad y regulación térmica del suelo.',
    intro: [
      'La cobertura de suelo cumple tres funciones simultáneas —reducir evaporación, controlar malezas y amortiguar la oscilación térmica del suelo— y su rendimiento depende del espesor aplicado y de la granulometría, no solo del volumen comprado.',
      'Esta línea es de fabricación propia y se maneja en stock, con entrega según volumen y ciudad de destino.',
    ],
    selectionCriteria: [
      {
        titulo: 'Espesor de aplicación',
        detalle:
          'Determina el control efectivo de malezas y la retención de humedad. Aplicar de menos es el error más frecuente y anula el beneficio.',
      },
      {
        titulo: 'Granulometría',
        detalle:
          'Define la permanencia frente a viento y riego, y el aspecto final en aplicaciones de paisajismo.',
      },
      {
        titulo: 'Volumen y logística',
        detalle:
          'El volumen se calcula por superficie y espesor objetivo; el flete suele pesar tanto como el producto en el costo total entregado.',
      },
    ],
    faqs: [
      {
        q: '¿Cuánto mulch necesito por metro cuadrado?',
        a: 'El volumen se obtiene multiplicando la superficie a cubrir por el espesor de aplicación objetivo. El espesor lo define la función buscada: controlar malezas exige más espesor que solo reducir evaporación.',
      },
      {
        q: '¿El mulch de madera sirve para paisajismo y para cultivo?',
        a: 'Sí, se usa en ambos: en cultivo prima la retención de humedad y el control de malezas; en paisajismo pesa además la granulometría por su permanencia y su aspecto final.',
      },
      {
        q: '¿Hacen entregas fuera de Lima?',
        a: 'Sí, con despacho nacional. En productos de volumen como el mulch conviene evaluar el flete desde el inicio, porque puede representar una parte importante del costo entregado.',
      },
    ],
  },
];

export const familyContentBySlug = (slug: string): FamilyContent | undefined =>
  familyContent.find((f) => f.slug === slug);

/** Familia (taxonomía) + su contenido editorial, resueltos juntos. */
export function resolveFamily(slug: string) {
  const family = productFamilies.find((f) => f.slug === slug);
  const content = familyContentBySlug(slug);
  return family && content ? { family, content } : null;
}

/** URL canónica de la página de familia. Reemplaza a `/productos?categoria=`. */
export function familyHrefByName(name: string): string {
  const family = productFamilies.find((f) => f.name === name);
  return family ? `/productos/familia/${family.slug}` : '/productos';
}

/**
 * Familias con dos o más productos: las únicas donde una comparativa tiene
 * sentido. Una tabla de un solo elemento es una página vacía que no debe
 * generarse ni indexarse.
 */
export function comparableFamilies() {
  return productFamilies.filter(
    (f) => products.filter((p) => p.category === f.name).length >= 2,
  );
}
PP_EOF

echo "==> Escribiendo lib/analytics.ts"
cat > 'lib/analytics.ts' <<'PP_EOF'
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
PP_EOF

echo "==> Escribiendo components/TrackView.tsx"
cat > 'components/TrackView.tsx' <<'PP_EOF'
'use client';

import { useEffect, useRef } from 'react';
import {
  trackArticleView,
  trackCityPageView,
  trackComparisonView,
  trackFamilyView,
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
  | { kind: 'comparison'; slug: string };

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
    }
  }, [props]);

  return null;
}
PP_EOF

echo "==> Escribiendo components/CotizacionModal.tsx"
cat > 'components/CotizacionModal.tsx' <<'PP_EOF'
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '@/lib/products';
import { toast } from 'sonner';
import { buildQuoteMessage, openWhatsApp, saveQuoteLocally } from '@/lib/whatsapp';
import { trackQuoteRequest, trackQuoteStarted } from '@/lib/analytics';
import { postLead } from '@/lib/lead';

const formSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  empresa: z.string().min(2, 'Ingrese el nombre de su empresa'),
  email: z.string().email('Ingrese un correo electrónico válido'),
  telefono: z.string().min(9, 'Ingrese un número de teléfono válido').regex(/^[0-9+\s()-]+$/, 'Formato de teléfono inválido'),
  producto: z.string().optional(),
  cantidad: z.string().optional(),
  fechaNecesaria: z.string().optional(),
  mensaje: z.string().min(15, 'Por favor describa su requerimiento con más detalle (mínimo 15 caracteres)'),
});

type FormData = z.infer<typeof formSchema>;

interface CotizacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedProduct?: string;
  /** Texto inicial del campo "mensaje" (p. ej. una comparativa de productos). */
  preselectedMessage?: string;
}

export default function CotizacionModal({ open, onOpenChange, preselectedProduct, preselectedMessage }: CotizacionModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      producto: preselectedProduct || '',
      mensaje: preselectedMessage || '',
    },
  });

  React.useEffect(() => {
    if (preselectedProduct) {
      setValue('producto', preselectedProduct);
    }
  }, [preselectedProduct, setValue]);

  React.useEffect(() => {
    if (preselectedMessage) {
      setValue('mensaje', preselectedMessage);
    }
  }, [preselectedMessage, setValue]);

  // El formulario ABIERTO es un evento distinto del formulario ENVIADO: la
  // diferencia entre ambos es la tasa de abandono, que es lo que dice si el
  // formulario está pidiendo más datos de los que el comprador quiere dar.
  React.useEffect(() => {
    if (open) trackQuoteStarted('modal', preselectedProduct);
  }, [open, preselectedProduct]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    // Envío real: abrimos WhatsApp con la solicitud estructurada, lista para
    // enviar al equipo comercial. Sin backend intermedio que pueda fallar.
    const message = buildQuoteMessage({
      nombre: data.nombre,
      empresa: data.empresa,
      email: data.email,
      telefono: data.telefono,
      producto: data.producto,
      cantidad: data.cantidad,
      mensaje: [data.mensaje, data.fechaNecesaria ? `Fecha requerida: ${data.fechaNecesaria}` : '']
        .filter(Boolean)
        .join(' — '),
    });

    saveQuoteLocally({
      nombre: data.nombre,
      empresa: data.empresa,
      email: data.email,
      telefono: data.telefono,
      producto: data.producto,
      cantidad: data.cantidad,
      mensaje: data.mensaje,
    });

    void postLead({
      nombre: data.nombre,
      empresa: data.empresa,
      email: data.email,
      telefono: data.telefono,
      producto: data.producto,
      cantidad: data.cantidad,
      fechaNecesaria: data.fechaNecesaria,
      mensaje: data.mensaje,
    });

    openWhatsApp(message);
    trackQuoteRequest(data.producto);

    setIsSubmitting(false);
    setIsSuccess(true);

    toast.success('Su solicitud está lista en WhatsApp', {
      description: 'Pulse enviar en la ventana de WhatsApp para que nuestro equipo comercial la reciba de inmediato.',
      duration: 7000,
    });

    setTimeout(() => {
      onOpenChange(false);
      setIsSuccess(false);
      reset();
    }, 2200);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      setTimeout(() => {
        setIsSuccess(false);
        reset();
      }, 300);
    }
  };

  // Cerrar con Escape: paridad de teclado con el resto de overlays del sitio.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isSubmitting]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={handleClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="bg-white w-full max-w-[620px] max-h-[calc(100dvh-2rem)] rounded-3xl shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cotizacion-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b">
              <div>
                <h2 id="cotizacion-title" className="text-2xl font-semibold tracking-tight text-navy">Solicitar Cotización</h2>
                <p className="text-sm text-gray-500 mt-0.5">Atención directa por WhatsApp en horario comercial</p>
              </div>
              <button onClick={handleClose} aria-label="Cerrar" className="p-2 text-gray-400 hover:text-gray-600 transition-colors" disabled={isSubmitting}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="px-8 py-16 text-center">
                <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-[#059669]" />
                </div>
                <h3 className="text-2xl font-semibold text-navy mb-3">¡Gracias por confiar en nosotros!</h3>
                <p className="text-gray-600 max-w-sm mx-auto">Su solicitud quedó lista en WhatsApp: pulse enviar en esa ventana y un especialista de Plastilonas Peruanas le responderá.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo *</label>
                    <input 
                      {...register('nombre')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="Juan Pérez García" 
                    />
                    {errors.nombre && <p className="text-red-500 text-xs mt-1.5">{errors.nombre.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Empresa / Razón Social *</label>
                    <input 
                      {...register('empresa')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="Minera XYZ S.A.C." 
                    />
                    {errors.empresa && <p className="text-red-500 text-xs mt-1.5">{errors.empresa.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico *</label>
                    <input 
                      {...register('email')} 
                      type="email" 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="ventas@suempresa.com" 
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono / WhatsApp *</label>
                    <input 
                      {...register('telefono')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="+51 998 117 065" 
                    />
                    {errors.telefono && <p className="text-red-500 text-xs mt-1.5">{errors.telefono.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Producto de interés</label>
                    <select 
                      {...register('producto')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669] bg-white"
                    >
                      <option value="">Seleccione un producto (opcional)</option>
                      {products.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad aproximada</label>
                    <input 
                      {...register('cantidad')} 
                      className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                      placeholder="Ej: 50 unidades / 2000 m²" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha requerida (aprox.)</label>
                  <input 
                    {...register('fechaNecesaria')} 
                    type="date" 
                    className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#059669]" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Describa su proyecto o requerimiento *</label>
                  <textarea 
                    {...register('mensaje')} 
                    rows={4} 
                    className="form-input w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm resize-y min-h-[110px] focus:border-[#059669]" 
                    placeholder="Necesito 80 big bags de 1 tonelada para transporte de concentrado de cobre. Requiero tratamiento antiestático y entrega en mina en Arequipa para el 15 de agosto..."
                  />
                  {errors.mensaje && <p className="text-red-500 text-xs mt-1.5">{errors.mensaje.message}</p>}
                </div>

                <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3">
                  <button 
                    type="button" 
                    onClick={handleClose} 
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2.5 bg-[#0A2540] hover:bg-[#059669] disabled:bg-gray-400 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.985]"
                  >
                    {isSubmitting ? (
                      <>Enviando solicitud...</>
                    ) : (
                      <>Enviar Solicitud de Cotización <Send className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                <p className="text-center t-micro text-gray-400 pt-1">
                  Sus datos se envían directamente a nuestro equipo comercial por WhatsApp. No los compartimos con terceros.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
PP_EOF

echo "==> Escribiendo app/cotizacion/page.tsx"
cat > 'app/cotizacion/page.tsx' <<'PP_EOF'
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
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#059669] mb-8"><ArrowLeft className="w-4 h-4 mr-1.5" /> Volver al inicio</Link>

      <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter font-semibold mb-4">Solicite su cotización</h1>
      <p className="text-xl text-gray-600 max-w-md mx-auto">Complete el formulario y su solicitud llegará directamente a nuestro equipo comercial por WhatsApp.</p>

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

export default function CotizacionPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-400">Cargando formulario…</div>}>
      <CotizacionContent />
    </Suspense>
  );
}
PP_EOF

echo "==> Escribiendo app/productos/familia/[slug]/page.tsx"
cat > 'app/productos/familia/[slug]/page.tsx' <<'PP_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { products, productFamilies, sourcingLabels, availabilityLabels } from '@/lib/products';
import { familyContent, resolveFamily } from '@/lib/families';
import { articles } from '@/lib/articles';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, faqSchema, itemListSchema, webPageSchema } from '@/lib/schema';

/**
 * Página de familia (/productos/familia/[slug]).
 *
 * Cierra el hueco estructural más caro del sitio: la navegación por familia se
 * resolvía con `?categoria=` sobre un catálogo filtrado en cliente, de modo que
 * once mercados con intención de búsqueda distinta compartían UNA sola URL
 * indexable. Ahora cada familia tiene URL estática, contenido propio, FAQ,
 * ItemList de sus SKUs y enlaces a los artículos y ciudades relacionados.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return familyContent.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveFamily(slug);
  if (!resolved) return {};
  const { content } = resolved;
  const url = `${SITE.url}/productos/familia/${slug}`;
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical: `/productos/familia/${slug}` },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url,
      locale: SITE.locale,
      type: 'website',
    },
  };
}

export default async function FamilyPage({ params }: Props) {
  const { slug } = await params;
  const resolved = resolveFamily(slug);
  if (!resolved) notFound();
  const { family, content } = resolved;

  const url = `${SITE.url}/productos/familia/${slug}`;
  const items = products.filter((p) => p.category === family.name);
  const sectores = Array.from(new Set(items.flatMap((p) => p.sector)));
  const sourcings = Array.from(new Set(items.map((p) => p.sourcing).filter(Boolean))) as string[];
  const disponibilidades = Array.from(
    new Set(items.map((p) => p.availability ?? 'a_medida')),
  );
  const relatedArticles = articles.filter((a) => a.category === family.name);
  const otherFamilies = productFamilies.filter((f) => f.slug !== slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <TrackView kind="family" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: content.h1,
            description: content.metaDescription,
            type: 'CollectionPage',
            speakable: ['.speakable-intro'],
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Catálogo', url: `${SITE.url}/productos` },
              { name: family.name, url },
            ],
            `${url}#breadcrumb`,
          ),
          itemListSchema({
            url,
            name: family.name,
            description: content.metaDescription,
            items: items.map((p) => ({
              name: p.name,
              url: `${SITE.url}/productos/${p.slug}`,
            })),
          }),
          faqSchema(content.faqs, url),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">
          Inicio
        </Link>{' '}
        /{' '}
        <Link href="/productos" className="hover:text-[#059669]">
          Catálogo
        </Link>{' '}
        / <span className="text-gray-700">{family.name}</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">{content.h1}</h1>

      <p className="mb-6 text-sm font-medium uppercase tracking-[0.12em] text-[#059669]">
        {family.tagline} · {items.length} {items.length === 1 ? 'línea' : 'líneas'} de producto
      </p>

      <div className="speakable-intro mb-10 max-w-3xl space-y-4 text-lg text-gray-700">
        {content.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {/* Cómo abastecemos y en qué estado está la oferta: dato real del catálogo. */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            Cómo lo entregamos
          </h2>
          <p className="text-gray-700">
            {sourcings.map((s) => sourcingLabels[s] ?? s).join(' · ')}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            Estado de la oferta
          </h2>
          <p className="text-gray-700">
            {disponibilidades.map((a) => availabilityLabels[a] ?? a).join(' · ')}
          </p>
        </div>
      </div>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Productos de esta familia
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((p) => (
            <Link
              key={p.slug}
              href={`/productos/${p.slug}`}
              className="group block rounded-3xl border border-gray-100 p-6 transition-all hover:border-[#059669]/40"
            >
              <span className="mb-2 block font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                {p.name}
              </span>
              <span className="mb-3 block text-sm text-gray-600">{p.shortDescription}</span>
              <span className="flex flex-wrap gap-2 text-xs text-gray-500">
                {p.sector.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-full bg-gray-50 px-2.5 py-1">
                    {s}
                  </span>
                ))}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {items.length >= 2 && (
        <div className="mb-14 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#059669]/20 bg-[#059669]/5 p-6">
          <p className="text-gray-800">
            ¿Está eligiendo entre varias de estas {items.length} alternativas? Véalas con
            sus especificaciones lado a lado.
          </p>
          <Link
            href={`/productos/familia/${slug}/comparar`}
            className="inline-flex items-center gap-1 rounded-2xl bg-[#0A2540] px-6 py-3 font-semibold text-white hover:bg-[#059669]"
          >
            Comparar las {items.length} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Qué define la especificación
        </h2>
        <dl className="space-y-5">
          {content.selectionCriteria.map((c) => (
            <div key={c.titulo} className="border-l-4 border-[#059669]/30 pl-5">
              <dt className="font-semibold text-[#0A2540]">{c.titulo}</dt>
              <dd className="mt-1 text-gray-700">{c.detalle}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Sectores que compran esta familia
        </h2>
        <div className="flex flex-wrap gap-2">
          {sectores.map((s) => (
            <Link
              key={s}
              href={`/productos?sector=${encodeURIComponent(s)}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      {relatedArticles.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Guías técnicas de esta familia
          </h2>
          <div className="space-y-4">
            {relatedArticles.map((a) => (
              <Link
                key={a.slug}
                href={`/recursos/${a.slug}`}
                className="group block rounded-2xl border border-gray-100 p-5 transition-colors hover:border-[#059669]/40"
              >
                <span className="block font-semibold tracking-tight text-[#0A2540] group-hover:text-[#059669]">
                  {a.title}
                </span>
                <span className="mt-1 block text-sm text-gray-600">{a.description}</span>
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
          {content.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold text-[#0A2540]">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-14 border-t pt-10">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-[#0A2540]">
          Otras familias del catálogo
        </h2>
        <div className="flex flex-wrap gap-2">
          {otherFamilies.map((f) => (
            <Link
              key={f.slug}
              href={`/productos/familia/${f.slug}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
            >
              {f.name}
            </Link>
          ))}
        </div>
      </section>

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Especificamos su caso?
        </h2>
        <p className="mx-auto mb-7 max-w-md text-white/80">
          Envíenos medidas, cantidad, aplicación y ciudad de entrega y le devolvemos la
          especificación técnica junto con la cotización.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cotizacion"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Solicitar cotización
          </Link>
          <Link
            href="/productos"
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Ver catálogo completo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
PP_EOF

echo "==> Escribiendo app/productos/familia/[slug]/comparar/page.tsx"
cat > 'app/productos/familia/[slug]/comparar/page.tsx' <<'PP_EOF'
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { products, sourcingLabels, availabilityLabels } from '@/lib/products';
import { resolveFamily, comparableFamilies } from '@/lib/families';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import TrackView from '@/components/TrackView';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';

/**
 * Tabla comparativa por familia (/productos/familia/[slug]/comparar).
 *
 * Así es como decide de verdad un comprador técnico: pone las alternativas una
 * al lado de la otra y compara especificación por especificación. Hasta ahora
 * tenía que abrir seis pestañas y hacerlo a mano.
 *
 * REGLA DE HONESTIDAD: la matriz se construye con la UNIÓN de las etiquetas de
 * especificación declaradas por los productos de la familia. Donde un producto
 * no declara esa especificación se escribe "No declarado" — nunca se rellena
 * con un valor plausible ni se copia el del vecino.
 *
 * Solo se generan las familias con dos o más productos: una comparativa de un
 * solo elemento es una página vacía que no debe indexarse.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return comparableFamilies().map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveFamily(slug);
  if (!resolved) return {};
  const { family } = resolved;
  const items = products.filter((p) => p.category === family.name);
  const title = `Comparativa: ${items.length} alternativas de ${family.name.toLowerCase()}`;
  const description = `Tabla comparativa de ${items.map((p) => p.name).slice(0, 3).join(', ')} y más: especificaciones lado a lado, origen de suministro y disponibilidad, para elegir con criterio técnico.`;
  return {
    title,
    description,
    alternates: { canonical: `/productos/familia/${slug}/comparar` },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description,
      url: `${SITE.url}/productos/familia/${slug}/comparar`,
      locale: SITE.locale,
      type: 'website',
    },
  };
}

export default async function CompararPage({ params }: Props) {
  const { slug } = await params;
  const resolved = resolveFamily(slug);
  if (!resolved) notFound();
  const { family } = resolved;

  const items = products.filter((p) => p.category === family.name);
  if (items.length < 2) notFound();

  const url = `${SITE.url}/productos/familia/${slug}/comparar`;

  // Unión de etiquetas, en el orden en que aparecen en el catálogo.
  const labels: string[] = [];
  for (const p of items) {
    for (const spec of p.specifications) {
      if (!labels.includes(spec.label)) labels.push(spec.label);
    }
  }

  // Una fila solo compara si al menos DOS productos declaran esa
  // especificación. Con la unión completa, una familia de siete productos
  // producía una tabla de mayoría "No declarado": técnicamente honesta pero
  // inservible para decidir, y que además hace parecer pobre al catálogo.
  const cuenta = (label: string) =>
    items.filter((p) => p.specifications.some((s) => s.label === label)).length;
  const sharedLabels = labels.filter((l) => cuenta(l) >= 2);

  // Lo exclusivo de cada producto no se descarta: se muestra debajo, donde
  // aporta como diferenciador en vez de como hueco en la matriz.
  const exclusivas = items
    .map((p) => ({
      producto: p,
      specs: p.specifications.filter((s) => cuenta(s.label) < 2),
    }))
    .filter((x) => x.specs.length > 0);

  const valueFor = (slugProducto: string, label: string): string => {
    const p = items.find((x) => x.slug === slugProducto);
    return p?.specifications.find((s) => s.label === label)?.value ?? 'No declarado';
  };

  const cotizarTodos = `/cotizacion?comparativa=${items.map((p) => p.slug).join(',')}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <TrackView kind="comparison" slug={slug} />
      <JsonLd
        data={[
          webPageSchema({
            url,
            name: `Comparativa de ${family.name}`,
            description: `Especificaciones lado a lado de ${items.length} alternativas de ${family.name}.`,
            type: 'CollectionPage',
            breadcrumbId: `${url}#breadcrumb`,
          }),
          breadcrumbSchema(
            [
              { name: 'Inicio', url: `${SITE.url}/` },
              { name: 'Catálogo', url: `${SITE.url}/productos` },
              { name: family.name, url: `${SITE.url}/productos/familia/${slug}` },
              { name: 'Comparativa', url },
            ],
            `${url}#breadcrumb`,
          ),
          itemListSchema({
            url,
            name: `Comparativa de ${family.name}`,
            items: items.map((p) => ({ name: p.name, url: `${SITE.url}/productos/${p.slug}` })),
          }),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#059669]">Inicio</Link>{' '}
        / <Link href="/productos" className="hover:text-[#059669]">Catálogo</Link>{' '}
        /{' '}
        <Link href={`/productos/familia/${slug}`} className="hover:text-[#059669]">
          {family.name}
        </Link>{' '}
        / <span className="text-gray-700">Comparativa</span>
      </nav>

      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#0A2540]">
        Comparativa: {items.length} alternativas de {family.name.toLowerCase()}
      </h1>

      <p className="mb-8 max-w-3xl text-lg text-gray-700">
        Especificaciones lado a lado, tal como las declara nuestro catálogo. Donde un
        producto no declara una especificación, la celda dice{' '}
        <strong>No declarado</strong>: preferimos el vacío honesto a un valor plausible
        que después no podamos sostener en la cotización.
      </p>

      <div className="mb-10 overflow-x-auto rounded-3xl border border-gray-100">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="sticky left-0 z-10 min-w-[190px] bg-gray-50 p-4 text-left font-semibold text-[#0A2540]">
                Especificación
              </th>
              {items.map((p) => (
                <th key={p.slug} className="min-w-[220px] p-4 text-left align-top">
                  <Link
                    href={`/productos/${p.slug}`}
                    className="font-semibold text-[#0A2540] hover:text-[#059669]"
                  >
                    {p.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <th className="sticky left-0 z-10 bg-white p-4 text-left font-medium text-gray-600">
                Origen
              </th>
              {items.map((p) => (
                <td key={p.slug} className="p-4 align-top text-gray-700">
                  {p.sourcing ? sourcingLabels[p.sourcing] ?? p.sourcing : 'No declarado'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100">
              <th className="sticky left-0 z-10 bg-white p-4 text-left font-medium text-gray-600">
                Disponibilidad
              </th>
              {items.map((p) => (
                <td key={p.slug} className="p-4 align-top text-gray-700">
                  {availabilityLabels[p.availability ?? 'a_medida'] ?? 'A medida'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100">
              <th className="sticky left-0 z-10 bg-white p-4 text-left font-medium text-gray-600">
                Sectores
              </th>
              {items.map((p) => (
                <td key={p.slug} className="p-4 align-top text-gray-700">
                  {p.sector.join(', ')}
                </td>
              ))}
            </tr>

            {sharedLabels.map((label) => (
              <tr key={label} className="border-b border-gray-100 last:border-none">
                <th className="sticky left-0 z-10 bg-white p-4 text-left font-medium text-gray-600">
                  {label}
                </th>
                {items.map((p) => {
                  const value = valueFor(p.slug, label);
                  return (
                    <td
                      key={p.slug}
                      className={`p-4 align-top ${
                        value === 'No declarado' ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}

            <tr>
              <th className="sticky left-0 z-10 bg-white p-4 text-left font-medium text-gray-600">
                Ficha técnica
              </th>
              {items.map((p) => (
                <td key={p.slug} className="p-4 align-top">
                  <a
                    href={`/productos/${p.slug}/ficha-tecnica.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#059669] hover:underline"
                  >
                    Descargar PDF
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {exclusivas.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-2 text-2xl font-semibold tracking-tight text-[#0A2540]">
            Especificaciones exclusivas de cada alternativa
          </h2>
          <p className="mb-6 text-gray-600">
            Datos que solo declara uno de los productos: no entran en la tabla porque no
            hay con qué compararlos, pero suelen ser la razón por la que se elige uno u
            otro.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {exclusivas.map(({ producto, specs }) => (
              <div key={producto.slug} className="rounded-2xl border border-gray-100 p-5">
                <Link
                  href={`/productos/${producto.slug}`}
                  className="mb-3 block font-semibold text-[#0A2540] hover:text-[#059669]"
                >
                  {producto.name}
                </Link>
                <dl className="space-y-2 text-sm">
                  {specs.map((s) => (
                    <div key={s.label}>
                      <dt className="font-medium text-gray-600">{s.label}</dt>
                      <dd className="text-gray-700">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-3xl bg-[#0A2540] p-10 text-center text-white">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight">
          ¿Cotizamos las alternativas que está evaluando?
        </h2>
        <p className="mx-auto mb-7 max-w-lg text-white/80">
          Le enviamos precio y plazo de las {items.length} opciones para que compare con
          números reales. Indíquenos medidas, cantidad y ciudad de entrega.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={cotizarTodos}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-3.5 font-semibold text-[#0A2540] hover:bg-white/90"
          >
            Cotizar las {items.length} alternativas
          </Link>
          <Link
            href={`/productos/familia/${slug}`}
            className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/30 px-8 py-3.5 font-medium hover:bg-white/10"
          >
            Volver a {family.name} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
PP_EOF

echo "==> Escribiendo app/sitemap.ts"
cat > 'app/sitemap.ts' <<'PP_EOF'
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { products } from "@/lib/products";
import ciudades from "@/data/ciudades.json";
import { articles } from "@/lib/articles";
import { familyContent, comparableFamilies } from "@/lib/families";

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

  return [...staticRoutes, ...familyRoutes, ...compareRoutes, ...productRoutes,
    ...localRoutes, ...articleRoutes];
}
PP_EOF

echo "==> Escribiendo test/comparison.test.ts"
cat > 'test/comparison.test.ts' <<'PP_EOF'
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { products, productFamilies } from '@/lib/products';
import { comparableFamilies } from '@/lib/families';
import { generateStaticParams } from '@/app/productos/familia/[slug]/comparar/page';
import sitemap from '@/app/sitemap';
import { SITE } from '@/lib/site';

const ROOT = process.cwd();

describe('comparativas: qué familias las tienen', () => {
  it('solo se generan familias con dos o más productos', () => {
    for (const f of comparableFamilies()) {
      const n = products.filter((p) => p.category === f.name).length;
      expect(n, f.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it('las familias de un solo producto quedan fuera: una comparativa vacía no se indexa', () => {
    const comparables = new Set(comparableFamilies().map((f) => f.slug));
    for (const f of productFamilies) {
      const n = products.filter((p) => p.category === f.name).length;
      if (n < 2) expect(comparables.has(f.slug), `${f.slug} no debería ser comparable`).toBe(false);
    }
  });

  it('generateStaticParams cubre exactamente las familias comparables', () => {
    const params = generateStaticParams().map((p) => p.slug).sort();
    expect(params).toEqual(comparableFamilies().map((f) => f.slug).sort());
  });

  it('el sitemap lista cada comparativa y sigue sin duplicados', () => {
    const urls = sitemap().map((e) => e.url);
    for (const f of comparableFamilies()) {
      expect(urls).toContain(`${SITE.url}/productos/familia/${f.slug}/comparar`);
    }
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe('comparativas: honestidad de la matriz', () => {
  const page = readFileSync(
    join(ROOT, 'app/productos/familia/[slug]/comparar/page.tsx'),
    'utf8',
  );

  it('las celdas sin dato dicen "No declarado" y no se rellenan', () => {
    expect(page).toContain("'No declarado'");
    // La celda vacía nunca hereda el valor de otro producto.
    expect(page).toContain('specifications.find((s) => s.label === label)?.value ??');
  });

  it('la matriz usa la unión de etiquetas declaradas, no una lista fija', () => {
    expect(page).toContain('if (!labels.includes(spec.label)) labels.push(spec.label);');
  });

  it('solo compara filas que al menos dos productos declaran', () => {
    // Con la unión completa, una familia de siete productos daba una tabla de
    // mayoría "No declarado": honesta pero inservible para decidir.
    expect(page).toContain('const sharedLabels = labels.filter((l) => cuenta(l) >= 2);');
  });

  it('lo exclusivo de cada producto se muestra, no se descarta', () => {
    expect(page).toContain('const exclusivas = items');
    expect(page).toContain('Especificaciones exclusivas de cada alternativa');
  });

  it('no publica precios: el negocio sigue siendo por cotización', () => {
    expect(page).not.toMatch(/S\/\s?\d/);
    expect(page).not.toContain('price');
  });
});

describe('deep link de cotización', () => {
  const page = readFileSync(join(ROOT, 'app/cotizacion/page.tsx'), 'utf8');
  const modal = readFileSync(join(ROOT, 'components/CotizacionModal.tsx'), 'utf8');

  it('la página de cotización LEE el parámetro producto', () => {
    // Las 36 fichas enlazan con ?producto=; antes el parámetro se descartaba y
    // el comprador tenía que volver a escribir lo que acababa de mirar.
    expect(page).toContain('useSearchParams');
    expect(page).toContain("searchParams.get('producto')");
    expect(page).toContain('preselectedProduct');
  });

  it('acepta una comparativa por slugs y la traduce a nombres del catálogo', () => {
    expect(page).toContain("searchParams.get('comparativa')");
    expect(page).toContain('products.find((p) => p.slug === slug)');
  });

  it('el modal aplica producto y mensaje preseleccionados', () => {
    expect(modal).toContain('preselectedProduct');
    expect(modal).toContain('preselectedMessage');
    expect(modal).toContain("setValue('mensaje', preselectedMessage)");
  });

  it('el valor del <select> es el nombre del producto, que es lo que llega por la URL', () => {
    expect(modal).toContain('value={p.name}');
  });

  it('cada ficha de producto enlaza a la cotización con su propio nombre', () => {
    const productPage = readFileSync(join(ROOT, 'app/productos/[slug]/page.tsx'), 'utf8');
    expect(productPage).toContain('/cotizacion?producto=${encodeURIComponent(product.name)}');
  });
});
PP_EOF

echo ""
echo "==> Puertas de calidad"
npx tsc --noEmit
npx next lint
npm test
npm run build

echo ""
echo "=============================================================="
echo " LISTO. Esperado: 11 test files / 124 tests, y en el build:"
echo "   * /productos/familia/[slug]/comparar   (8 rutas)"
echo "   138 páginas estáticas generadas"
echo ""
echo " Compruébelo en local (npm run start):"
echo "   /productos/familia/geosinteticos/comparar"
echo "   /cotizacion?producto=Big%20Bags%20%2F%20Bolsones%20de%20Polipropileno"
echo ""
echo " Siguiente:"
echo "   git add -A"
echo "   git commit -m 'feat(conv): comparativas por familia y deep link de cotizacion operativo'"
echo "   git push origin main"
echo "=============================================================="
