# G3 — la excepción sin comprobar, y la advertencia de lint que dejé abierta

**Fecha:** 2026-09-13 · **Base:** `main` con 0002 a 0009 aplicados ·
**Archivos tocados:** 5 · **Neto:** +3 líneas · **Excepciones:** 3 → 1

Este parche corrige dos cosas que escribí yo. Ninguna de las dos es un
hallazgo: son deuda propia, y se paga antes de seguir construyendo encima.

## 1. La excepción que declaré sin comprobarla

La entrega F3b (0007) movió la tarjeta azul de cierre a
`components/CierreComercial.tsx` y dejó tres archivos fuera, declarados en
`PINTAN_TARJETA` con este motivo:

> Las tres son componentes de **cliente**: no pueden renderizar un componente
> de servidor.

De las tres, **dos no lo son**. Ni `components/CunaHubEn.tsx` ni
`components/FabricarOImportar.tsx` declaran `'use client'`; ambos son
`async function`, que es exactamente lo contrario. Escribí el motivo por
analogía con la tercera y no lo verifiqué.

Importa más de lo que parece. Una prueba con una lista de excepciones vale lo
que valga la lista: cada entrada es un permiso permanente para volver a
divergir, y una entrada cuyo motivo es falso es un permiso que nadie puede
rebatir leyendo el código, porque el código dice otra cosa. La regla se afloja
sola.

Las dos quedan migradas. La lista baja a una, y esa sí lo es:
`app/(es)/marco/evaluacion/page.tsx` declara `'use client'` porque la
autoevaluación calcula y descarga el brief en el navegador, sin enviar nada al
servidor.

**Consecuencia comercial, no cosmética.** `FabricarOImportar` sirve
`/fabricar-o-importar` y `/en/manufacture-in-peru-or-import` —la página donde un
comprador decide si fabrica en Lima o importa un contenedor, la decisión
anterior a cualquier cotización— y `CunaHubEn` sirve las cuñas en inglés. Eran
las páginas de mayor intención del sitio cerrando con un bloque que nadie
mantenía: sin `min-h-[44px]` declarado y sin `role="group"`. Ahora entran por
el mismo sitio que las otras quince.

### Lo que no se pierde al migrar

El bloque común abría WhatsApp con el mensaje genérico de `mensajeWhatsApp()`.
Estas dos páginas traen el suyo —«estoy comparando fabricar en Lima contra
importar…», y el de cada cuña con su producto—, que es mejor que el de
plantilla porque llega ya situado en la conversación. Por eso
`CierreComercial` recibe `whatsappMensaje?`: la página conserva su mensaje, y
el resto sigue tomando el común. Migrar no puede costar precisión.

Único cambio visible: el párrafo de `FabricarOImportar` pasa de `max-w-xl` a
`max-w-lg`, que es el ancho del bloque compartido y el de las otras quince
páginas. Es la uniformidad que se pedía.

## 2. La advertencia de lint que introdujo 0009

`npm run lint` estaba en cero. La entrega 0009 añadió `origen` al efecto de
`trackQuoteStarted` en `components/CotizacionForm.tsx` sin añadirlo al arreglo
de dependencias, y `react-hooks/exhaustive-deps` lo avisó.

No es sólo higiene. El efecto reporta de qué superficie salió el RFQ, y con
`origen` fuera de las dependencias un cambio de origen dentro de la misma
navegación seguiría reportando el anterior — que es justo la atribución que
0009 existía para arreglar. Corregido, con el motivo escrito al lado.

Un lint en cero es una señal binaria y útil; un lint con «sólo una
advertencia conocida» deja de serlo a la segunda.

## 3. Lo que lo mantiene

`test/acciones.test.ts` (16 pruebas, sin cambios de alcance):

- la comprobación de contexto acepta ahora tanto `contexto="recursos"` como
  ``contexto={`cuna-en-final:${slug}`}`` — los bloques que sirven varias
  páginas con la misma plantilla lo declaran como expresión, y la versión
  anterior del regex sólo veía literales, con lo que los habría dado por
  válidos sin mirarlos;
- verificado en sentido contrario: devolviendo la clase de la tarjeta a
  `CunaHubEn.tsx`, la prueba falla nombrando el archivo.

## 4. Lo que NO entra

- No se cambia ningún texto de contenido, ningún destino, ninguna afirmación
  ni ningún dato.
- No se toca `PINTAN_TARJETA` para ampliarlo: la única entrada que queda se
  migrará el día que su bloque deje de depender de estado del navegador.
- **Queda una divergencia de vocabulario, y se declara en vez de arreglarse
  de contrabando.** El botón principal en inglés de `FabricarOImportar` dice
  «Request a quotation»; el de `CunaHubEn` toma `ACCIONES_EN.rfq.label`, que
  hoy es «RFQ form (in English)». Son dos nombres para el mismo botón — lo que
  0007 vino a terminar. No se unifica aquí porque unificarlo obliga a decidir
  cuál de los dos es el bueno, y «(in English)» es una aclaración pensada para
  quien llega desde una página en español, no para un comprador que ya está
  leyendo en inglés. Eso es una decisión de copia sobre las páginas en inglés
  completas, no un renombrado al paso.
- Sigue pendiente y sin diagnosticar el aviso de build `metadataBase property
  in metadata export is not set`: los tres layouts de grupo sí lo declaran, y
  hasta saber de dónde sale no se toca nada — un aviso mal apagado es peor que
  un aviso.
