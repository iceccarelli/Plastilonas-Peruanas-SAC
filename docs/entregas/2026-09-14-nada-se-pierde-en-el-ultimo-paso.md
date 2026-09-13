# C2a — el configurador mandaba la especificación y el formulario la tiraba

**Fecha:** 2026-09-14 · **Base:** `main` con 0002 a 0008 aplicados ·
**Defectos cerrados:** 3 · **Pruebas nuevas:** 4

## 1. El más caro: la configuración del big bag se descartaba

`/configurador` deja al comprador definir su FIBC —capacidad, tipo de tapa y de
fondo, asas, factor de seguridad, extras— y lo envía al RFQ con la
configuración completa en `?notas=`.

`/cotizacion` sólo leía `?nota=`.

El resultado: quien se tomó el trabajo de configurar su bolsón llegaba a un
formulario **vacío**, sin una palabra de lo que acababa de definir. O lo
escribía otra vez, o mandaba un RFQ pobre, o se iba. Lo mismo pasaba en los
ocho hubs de aplicación, que enlazan con `?notas=Aplicación: …`.

Ahora la página lee los dos nombres. Cuál sea el canónico importa menos que no
tirar lo que alguien ya definió.

## 2. El segundo: el chat no se podía medir

El asistente enlaza `/cotizacion?origen=chat` desde hace etapas. Nadie leía
`origen`. La pregunta «¿cuántas solicitudes produce el asistente?» no tenía
respuesta posible — ni el chat, ni el configurador, ni las calculadoras.

`origen` se lee, se sanea, viaja en el lead hasta Supabase y hasta el CRM, y
etiqueta el evento `rfq_start`. El configurador, las calculadoras y los hubs de
aplicación ahora lo declaran.

## 3. El tercero: todos los leads decían venir de /cotizacion

`source` estaba fijo en `…/cotizacion`, así que una solicitud enviada desde
`/en/rfq` —un comprador extranjero— llegaba al CRM etiquetada como si viniera
del formulario en español. Ahora la fuente es la ruta real que envió el
formulario, con el origen entre paréntesis cuando existe.

## 4. Lo que lo mantiene

`test/parametros-cotizacion.test.ts` compara **los dos extremos del enlace**:
recorre todos los `href` hacia `/cotizacion` y `/en/rfq`, extrae los parámetros
que mandan, y los contrasta con los que la página declara leer en su tipo
`searchParams`. Un parámetro que nadie lee no falla en tiempo de ejecución: se
pierde en silencio, que es como este defecto sobrevivió tanto.

Además comprueba que `origen` llega al modelo del lead y que el esquema de la
API lo declara —zod descarta en silencio lo que no está declarado—, y que las
tres superficies que producen solicitudes se identifican.

## 5. Lo que NO entra

- Ningún cambio de contenido, de diseño ni de destino: los mismos enlaces, las
  mismas páginas.
- Ninguna columna nueva en Supabase: `origen` viaja dentro de `payload`, que ya
  guarda el lead completo.
- El modelo tipado de brief (C1) sigue pendiente. Esto es la parte del embudo
  que ya estaba construida y goteaba.
