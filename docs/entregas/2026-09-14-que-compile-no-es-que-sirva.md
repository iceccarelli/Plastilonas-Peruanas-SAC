# P4 — el gate del servicio no probaba nada, y por eso el despliegue paró

**Fecha:** 2026-09-14 · **Base:** `main` con 0002 a 0016 aplicados ·
**Pruebas del servicio:** 25 → 36 · **Imagen publicada:** todavía ninguna

El contexto bajó a 172 kB y el Dockerfile se encontró. La imagen se construyó
hasta el último paso y se detuvo ahí:

```
> cd servicio && npm run build && node --test dist/servicio/test
Error: Cannot find module '/obra/servicio/dist/servicio/test'
# tests 1 · pass 0 · fail 1
```

## 1. El diagnóstico, hecho ejecutando, no leyendo

El mensaje culpa a un módulo que no existe, y la tentación era creerle: que
`tsc` no hubiera emitido las pruebas, que `rootDir` estuviera mal, que el
`.dockerignore` se hubiera comido el directorio.

**Nada de eso.** Se compiló el servicio con el compilador de verdad y se miró
la salida:

```
dist/servicio/src/index.js      ← el ejecutable, donde el CMD lo busca
dist/servicio/test/api.test.js  ← las pruebas, donde el gate las busca
dist/lib/calculadoras.js
```

Todo estaba en su sitio. Y el compilado ARRANCA: levantado con `node
dist/servicio/src/index.js`, responde `/v1/salud` 200, `/v1/calculos` 200 y las
seis herramientas por MCP.

El defecto era el comando:

| Invocación | Resultado medido, Node 22, mismo árbol |
|---|---|
| `node --test dist/servicio/test` | 1 prueba, 1 fallo, «Cannot find module» |
| `node --test dist/servicio/test/` | 1 prueba, 1 fallo — la barra no cambia nada |
| `node --test dist/servicio/test/*.test.js` | **36 pruebas, 36 pasan** |

`node --test <directorio>` no busca dentro: intenta **ejecutar el directorio
como módulo**. El error no dice eso por ninguna parte, que es lo que lo hace
caro: parece un problema de compilación y es un problema de argumento.

## 2. El defecto de fondo era otro, y más grande

Que el comando estuviera mal es un renglón. Que nadie lo notara hasta el
despliegue es el verdadero fallo: **el gate del servicio comprobaba que compila
y saltaba de ahí a publicar la imagen.**

Entre esas dos cosas está lo único que le importa a quien llama: que el proceso
levante un servidor y que ese servidor responda. Un error de enrutado, una ruta
registrada dos veces, un manejador que lanza al primer contacto — los tres pasan
`tsc` sin despeinarse y aparecen en producción.

**`servicio/test/servidor.test.ts`** levanta el servidor de verdad en un puerto
efímero y le pregunta. Once pruebas nuevas, sobre lo que no depende de la red:

- se declara vivo en la ruta exacta que vigila el health check de Fly;
- los cinco cálculos se sirven con su fórmula y sus límites;
- una poza de 40 × 25 × 4 devuelve su número y un enlace a `/cotizacion`;
- una geometría imposible devuelve 422 y no un número absurdo;
- MCP saluda con el protocolo correcto y ofrece sus seis herramientas;
- una notificación MCP se acepta con 202 y sin cuerpo, como exige el protocolo;
- la consola trae el probador y **no carga ni un recurso de terceros**;
- el OpenAPI declara las seis rutas que existen;
- una ruta desconocida devuelve 404 con código, no una página;
- un RFQ sin correo ni teléfono se rechaza con 422 diciendo qué falta.

Y el gate de la imagen pasa a tener tres pasos en vez de dos: compila,
**comprueba que el ejecutable existe donde el `CMD` lo busca**, y prueba.

## 3. Lo que lo mantiene

`test/despliegue-servicio.test.ts` sube de 6 a 10 pruebas:

- las pruebas del servicio se invocan por patrón de archivos, nunca por
  directorio — ni en `package.json` ni en el `Dockerfile`;
- la imagen comprueba el ejecutable antes de publicarse;
- **el `CMD` y el `start` apuntan a donde el `tsconfig` deja el ejecutable**, y
  esa ruta no se escribe a mano en tres sitios: se DERIVA aquí de `rootDir` y
  `outDir` y se compara. El día que alguien cambie una de las dos opciones falla
  esta prueba, no el arranque de la máquina;
- existe una prueba que levanta el servidor.

Verificadas en sentido contrario: devolviendo la forma de directorio, quitando
la comprobación del ejecutable y cambiando `rootDir` a `"."`, falla exactamente
la que corresponde.

Además, `test/api-publica.test.ts` reclamó: fijaba la forma literal del gate en
una sola línea. Se relaja a exigir que compile y pruebe, y la forma exacta queda
donde le toca. Una prueba que fija el texto de otra prueba estorba al arreglarla.

## 4. Verificación de este parche

- Compilado con TypeScript 5.6.3 real: la salida cae donde el `CMD` la busca.
- `node --test dist/servicio/test/*.test.js` sobre el JavaScript compilado —el
  mismo comando exacto que corre la imagen—: **36 pruebas, 36 pasan.**
- El compilado arranca y responde: salud, cálculos, MCP con seis herramientas.

## 5. Lo que NO entra

- Ni una línea de lógica del servicio ni del sitio: sólo cómo se invoca su gate
  y qué comprueba.
- Ninguna dependencia nueva. El servicio sigue en cero.
