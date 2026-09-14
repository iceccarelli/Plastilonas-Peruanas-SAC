# P6 — el servidor MCP completo: herramientas, recursos e instrucciones

**Fecha:** 2026-09-14 · **Base:** `main` con 0002 a 0018 aplicados ·
**Primitivas MCP:** 1 → 3 · **Recursos:** 6 + 1 plantilla · **Instrucciones:** 4 ·
**Pruebas del servicio:** 36 → 50

## 1. Verificado primero: la cadena entera está en pie

```
GET https://plastilonas-peruanas-sac.vercel.app/ai.txt
  → «## Herramientas para agentes (API y MCP)»
  → https://plastilonas-api.fly.dev/mcp
  → las seis herramientas, listadas
```

El sitio ya anuncia el servidor a todo agente que pase, y el servidor responde.
Lo que sigue es hacer que ese servidor valga lo que puede valer.

## 2. Lo que faltaba, y es más de lo que parece

**MCP tiene tres primitivas. Casi todos los servidores que circulan publican
una.** Nosotros también publicábamos una. La diferencia no es de catálogo:

| Primitiva | Quién decide usarla | Qué implica |
|---|---|---|
| **Herramientas** | el modelo | Cuesta un turno y una decisión. Sólo se llama lo que el modelo cree necesitar. |
| **Recursos** | el **cliente** | Se adjuntan al contexto. No hay decisión que acertar. |
| **Instrucciones** | la **persona** | Aparecen como comandos. Las pulsa quien no sabe qué es MCP. |

### Los recursos arreglan el fallo más caro de este rubro

Un modelo que no ha leído nuestros límites **rellena**: inventa una
certificación, da un plazo, cita un precio. Hasta hoy, evitar eso dependía de
que el modelo decidiera llamar a una herramienta para averiguarlo — y no lo
hace, porque no sabe que le falta.

`plastilonas://limites` es el primero de la lista y su descripción empieza por
**«ADJUNTE ESTE RECURSO ANTES DE RESPONDER»**. Sirve `/ai.txt`, que ya enumera
lo que esta empresa no afirma: certificaciones propias, envío mundial, precios
de lista, clientes, obras, rankings, reseñas. Sin duplicar la lista: si el sitio
añade un límite, llega aquí solo.

Los otros cinco —catálogo, glosario, métodos con su fórmula, identidad, índice
del sitio— y una plantilla, `plastilonas://producto/{slug}`, para leer una ficha
sin traerse el catálogo entero.

### Las instrucciones cambian a quién sirve esto

Sin ellas, el servidor funciona **sólo si el modelo acierta a llamarlo**. Con
ellas, una persona abre su asistente, elige un comando, y el proveedor la guía
con su propio método hasta una solicitud completa:

- **¿Cuánto material necesito?** — elige el método, pide sólo los datos que
  faltan, calcula, entrega el número con su desglose y sus límites.
- **No sé qué pedir: ayúdeme a especificarlo** — y enseña al modelo a **leer el
  campo `certeza` antes de hablar**: con certeza baja, la primera pregunta no es
  la fecha de entrega, es qué se va a contener, cubrir o impermeabilizar.
- **Preparar una solicitud de cotización** — reúne los cinco datos, muestra el
  resumen, y sólo registra si la persona lo pide y da correo y teléfono.
- **¿Fabricar en el Perú o importar?** — y **obliga a decir en qué casos gana
  importar**, porque el proveedor lo publica y ocultarlo contradiría su página.

**Cada instrucción impone al modelo las mismas cinco reglas que gobiernan el
sitio**, antes que la tarea: no dar precios ni «aproximados», no atribuir
certificaciones ni clientes, repetir los límites junto al número, no registrar
un RFQ sin consentimiento, y citar la fuente y no la API.

Un proveedor que entrega el guion también entrega las restricciones. Si no, el
guion se usa para vender de más.

## 3. Lo que lo mantiene

`servicio/test/mcp-completo.test.ts`, 14 pruebas nuevas (50 en total):

- el servidor declara las tres capacidades, y las instrucciones de arranque
  mandan leer los límites antes de afirmar nada;
- **el primer recurso de la lista es el de los límites** —un cliente que adjunta
  «el primero» adjunta el que evita que el modelo invente una certificación—;
- cada recurso se anuncia con URI, título, descripción de más de 60 caracteres
  y tipo: sin eso, el cliente no puede decidir si adjuntarlo;
- un recurso inexistente devuelve **−32002**, el código que el protocolo reserva
  para «no encontrado», con la lista de los que sí existen;
- `plastilonas://calculos` se lee **sin tocar la red**: si el sitio cae, el
  método sigue siendo legible y citable;
- **toda** instrucción impone las cinco reglas;
- una instrucción sin sus argumentos obligatorios no se construye a medias.

Y en el sitio, `test/api-publica.test.ts` sube a 16: los recursos y las
instrucciones anunciados en `/ai.txt` son **exactamente** los que el servicio
sirve. Anunciar un recurso que el servidor no tiene enseña a los agentes que
esta empresa promete cosas que no cumple, que es el único activo que aquí no se
puede reponer.

Verificadas en sentido contrario: renombrando un recurso del servicio y quitando
la regla de precios de una instrucción, falla exactamente la que corresponde.

## 4. Probado levantando el servidor

| Llamada | Resultado |
|---|---|
| `initialize` → `capabilities` | `tools`, `resources`, `prompts` |
| `resources/list` | los 6, con `plastilonas://limites` primero |
| `resources/templates/list` | la plantilla `producto/{slug}` |
| `resources/read` de la plantilla | la ficha de big bags con sus límites |
| `resources/read` inexistente | −32002 + los 6 disponibles |
| `prompts/list` | las 4, con título y argumentos |
| `prompts/get cuanto-material-necesito` | 1.845 caracteres, las reglas primero |

Y las 50 pruebas corren sobre el JavaScript **compilado**, con el mismo comando
exacto que ejecuta la imagen.

## 5. Dónde se ve

- `/integraciones` publica las tres listas y explica la diferencia entre quién
  decide usar cada primitiva.
- La consola del servicio las tabula.
- `/ai.txt` las anuncia con el orden y el motivo.
- El OpenAPI lo dice en su descripción.

## 6. Lo que NO entra

- Ni un precio, ni una certificación, ni un cliente, ni una obra.
- Ninguna dependencia: el servicio sigue en **cero** paquetes de ejecución.
- No se toca el cálculo ni el catálogo: esto es superficie de protocolo.
