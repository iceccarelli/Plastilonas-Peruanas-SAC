# P2 — de calculadora a ingeniero de aplicaciones

**Fecha:** 2026-09-14 · **Base:** `main` con 0002 a 0014 aplicados ·
**Ruta nueva:** `POST /v1/especificar` · **Herramienta MCP nueva:** `especificar_requerimiento` ·
**Herramientas MCP:** 5 → 6

## 1. El hueco que quedaba

0014 dejó al agente capaz de calcular y de buscar. Pero un comprador industrial
casi nunca llega sabiendo qué pedir. Llega con un problema:

> «Poza de relaves a 4.100 msnm, contacto con solución ácida, ocho años de vida
> útil.»

Entre ese problema y una cotización falta el trabajo que hoy hace una persona
por teléfono —y que se pierde en cuanto cuelga—: traducirlo a una familia,
enumerar las variables que hay que fijar, y decir cuáles siguen sin respuesta.

## 2. Lo que entra

`POST /v1/especificar` y la herramienta MCP `especificar_requerimiento`.
Devuelven:

- **candidatos**, cada uno con la razón por la que aparece («cubre la aplicación
  *pozas de relaves*», «se usa en Minería»);
- **variables a definir** —con en qué unidad se miden y qué deciden en obra—;
- **preguntas pendientes**, las que de verdad faltan dados los datos aportados;
- **el cálculo que aplica**, enlazado;
- **lo que NO decidimos por el comprador**;
- **certeza**: cuánto se puede fiar el agente de la lista.

**Este módulo no entiende lenguaje, y no le hace falta.** Quien lo llama ya lo
entiende. Lo que ese agente no tiene es el libro de reglas del rubro, y ese
libro está DERIVADO, no escrito de memoria: las variables salen de las
especificaciones reales de los productos candidatos; cómo se mide cada una y por
qué importa salen del glosario publicado; el cálculo se empareja por área contra
las calculadoras existentes, así que añadir una calculadora la pone en
circulación sola.

### Lo que declara que no decide

Cuatro cosas, en toda respuesta, porque callarlas induce a usar el resto fuera
de sus límites: compatibilidad química con un fluido concreto; vida útil bajo
una exposición dada; diseño estructural, anclaje y estabilidad de taludes; y las
certificaciones que fija el pliego del comprador o del puerto. Se firman, y aquí
no se firma nada.

## 3. Cuatro defectos de búsqueda encontrados midiendo, no leyendo

El endpoint sólo vale lo que valga su búsqueda. Ejercitada contra el catálogo
real —36 productos, 11 familias— aparecieron cuatro, cada uno peor que el
anterior:

**a) Palabras vacías.** «Bolsas **para** concentrado de cobre» devolvía mantas
para camiones: el «para» de la descripción puntuaba igual que una coincidencia
real. *(Corregido en 0014.)*

**b) Todas las palabras valían lo mismo.** «Minería» aparece como sector en 18
de 36 fichas y sumaba tanto como «relaves», que aparece en una. Ahora cada
palabra pesa por lo rara que es en el catálogo, `log(N / (1+df))`. Sin números
afinados a mano: el peso lo pone el catálogo, así que añadir productos lo
recalibra solo.

**c) Se buscaba por subcadena.** «Cubrir hectáreas de vivero del **sol**»
devolvía biombos para **sol**dadura. Ahora se comparan palabras; el prefijo se
admite sólo desde cinco letras, que es donde «manga → mangas» deja de
confundirse con la coincidencia accidental.

**d) La rareza se contaba con una regla y se puntuaba con otra.** «Relaves» no
existía como palabra exacta en ninguna ficha —frecuencia cero, **peso máximo**—
pero sí casaba por prefijo con «relave». La palabra más cara del catálogo valía
lo mismo que una inventada, y una manga de ventilación encabezaba la consulta de
una poza. Ahora la frecuencia se cuenta con la MISMA regla con la que se puntúa.

Y una causa de fondo: **no se indexaba la descripción larga**, que es donde vive
el vocabulario del rubro. «Poza» y «relaves» no aparecían en ninguna ficha
porque sólo se miraba el resumen.

Resultado, medido sobre las mismas consultas:

| Consulta | Antes | Ahora |
|---|---|---|
| `big bag para harina de pescado` | 3 candidatos | 1, certeza alta |
| `manga de ventilación 800 mm` | 4 candidatos | mangas primero, 27 vs 15 puntos |
| `cubrir 4 ha de arándanos contra granizo` | biombos de soldadura | malla anti-pájaro anti-granizo, certeza alta |
| `impermeabilizar canal de riego` | plano | las tres geomembranas |

## 4. La certeza, que es la parte honesta

Buscar sobre 36 fichas cortas tiene un techo. Una consulta que describe
CONDICIONES y no un producto —«4.100 msnm, contacto ácido, ocho años»— reparte
la puntuación entre media docena de familias y ningún umbral separa bien.
Perseguir el ranking perfecto es trabajo sin fin; decir la verdad sobre la lista
es trabajo de una tarde.

Así que se declara `certeza`, y se calcula con dos reglas que costó encontrar:

- **¿Alguna palabra de la consulta está en el NOMBRE de un producto?** Si no, es
  `baja` — y entonces la primera pregunta que el agente debe hacer no es la
  fecha de entrega, es qué se va a contener, cubrir o impermeabilizar. El peso
  por rareza no sirve como medida aquí: castiga justo la palabra correcta de una
  familia grande («geomembrana» está en cuatro fichas, así que vale poco).
- **La familia puede estar clara aunque el producto no.** «Geomembrana para poza
  de relaves» devuelve cuatro geomembranas empatadas; llamar a eso certeza baja
  sería mentir al revés. Si todos los candidatos son de la misma familia, la
  familia es la respuesta, y lo abierto —qué polímero— ya es una de las
  variables a definir.

Medido en las tres:

| Consulta | Certeza | Primera pregunta |
|---|---|---|
| «Necesito geomembrana para una poza de relaves» | **alta** | qué producto o familia |
| «Poza a 4100 msnm con contacto ácido, 8 años» | **baja** | qué se va a contener, cubrir o impermeabilizar |
| «Cubrir 4 ha de arándanos contra granizo» | **alta** | qué producto o familia |

Una lista insegura presentada como segura es exactamente cómo un comprador
acaba con el producto equivocado — y con nuestro nombre encima.

## 5. Y las variables caben en una conversación

Primera versión: 32 variables, de tres familias mezcladas. Eso no es una guía,
es un inventario, y un inventario no lo lee nadie: el agente escoge tres al azar
y pregunta lo que no toca.

Ahora salen de **una sola familia** —uno especifica dentro de una familia—,
primero las que el glosario respalda (traen unidad y motivo) y con techo de
catorce.

## 6. Lo que lo mantiene

`servicio/test/api.test.ts` pasa de 18 a 25 pruebas. Las nuevas fijan cada
defecto corregido para que no vuelva:

- «sol» no encuentra «soldadura», y «manga» sí encuentra «mangas»;
- un producto que sólo coincide en vocabulario genérico no es candidato;
- la certeza baja cuando ninguna palabra toca un nombre, y sube cuando todos los
  candidatos comparten familia;
- una descripción demasiado corta devuelve la pregunta, no una especificación;
- con preguntas pendientes el siguiente paso es completarlas, no cotizar.

`test/api-publica.test.ts` ya exigía que las herramientas anunciadas en
`/ai.txt` fuesen exactamente las que el servicio registra: al añadir la sexta,
la prueba la reclamó. Funcionó como se pretendía.

## 7. Lo que NO entra

- No se toca ninguna página del sitio: sólo el anuncio en `/ai.txt` y
  `/llms.txt`, que sigue detrás de `NEXT_PUBLIC_API_URL`.
- No se recomienda un material para una condición química ni una vida útil: se
  dice qué hay que definir y quién lo define.
- Ni precios, ni certificaciones como credenciales propias, ni clientes.
