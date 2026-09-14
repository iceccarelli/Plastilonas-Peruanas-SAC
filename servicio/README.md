# `servicio/` — API pública y servidor MCP

Un proceso Node, sin dependencias de ejecución, que despliega en Fly.io **aparte
del sitio**. Expone como REST y como herramientas de agente lo que este
repositorio ya sabe: qué se fabrica, cuánto material hace falta y cómo entra una
solicitud de cotización.

## Para qué existe

El sitio responde a quien lo lee. Esto responde a quien lo **ejecuta**: un ERP de
compras, un integrador, y sobre todo un agente. Cuando un jefe de compras le
pregunta a su asistente cuánta geomembrana necesita para una poza de 40 × 25 × 4,
el asistente no parafrasea un artículo nuestro: llama a `calcular_predimensionamiento`,
recibe 1 371,5 m² con su desglose, su fórmula y sus límites, y devuelve un enlace
de cotización con el cálculo ya cargado.

Esa es la diferencia entre estar citado y ser la herramienta.

## Lo que devuelve, y lo que no

Devuelve especificación y cantidad. **No devuelve precios**, y no es una omisión
temporal: el precio depende de material, medidas, cantidad, destino e Incoterm y
se emite en una cotización. Una API con precios dejaría de ser una referencia
para pasar a ser una promesa que no se puede sostener.

Toda respuesta trae `limites`, `fuente`, `cita_sugerida` y `siguiente_paso`.

## Cómo está armado

- **Sin dependencias de ejecución.** Sólo `node:http`. Por este borde entran
  peticiones de terceros; cada paquete sería una superficie más que auditar.
- **Sin estado.** Lo que sabe lo lee del sitio (`/productos/catalogo.json`,
  `/entidad.json`, `/glosario/terminos.json`, `/mapa-consultas.json`) con caché
  en memoria. Lo que recibe lo reenvía a `/api/lead` del sitio. Se puede tirar y
  volver a desplegar sin perder nada.
- **Un solo cálculo.** Importa `lib/calculadoras.ts` del sitio, el mismo módulo
  que usa la web. Nunca una copia: dos implementaciones de la misma fórmula dan
  dos números y nadie sabe cuál se cotizó.
- **Su propio gate, en tres pasos.** El `Dockerfile` corre `tsc`, comprueba que
  el ejecutable existe donde el `CMD` lo busca, y corre las 36 pruebas —doce de
  ellas levantando el servidor de verdad en un puerto efímero y preguntándole—.
  Si algo está en rojo, la imagen no se construye y no se despliega nada. Que
  compile no es que sirva.
- **Contexto de construcción mínimo.** El `.dockerignore` vive en la RAÍZ del
  repositorio —que es donde Docker lo lee— y excluye todo para volver a incluir
  sólo `lib/calculadoras.ts`, `lib/site.ts` y `servicio/`: **175 kB en 20
  archivos**, frente a los 2,1 GB en 44.727 archivos que se subían cuando el
  archivo estaba en `servicio/`, donde no filtraba nada.

## Desplegar

Desde la **raíz del repositorio** (el contexto de construcción es la raíz,
porque el servicio importa `lib/`):

```bash
fly auth login
fly launch --config servicio/fly.toml --no-deploy --copy-config --name plastilonas-api
npm run desplegar:api          # fly deploy . --config servicio/fly.toml
```

**No pase `--dockerfile`.** flyctl resuelve esa ruta contra el `fly.toml`, no
contra el directorio de trabajo: `--dockerfile servicio/Dockerfile` junto a
`--config servicio/fly.toml` busca `servicio/servicio/Dockerfile`. La ruta vive
en `[build] dockerfile = "Dockerfile"` dentro del propio `fly.toml`, donde sólo
se puede leer de una manera.

`fly launch` reescribe `servicio/fly.toml` con su propia plantilla. Después de
lanzarlo, recupere el del repositorio —lleva la región, el escalado a cero, el
health check y las variables— con `git checkout -- servicio/fly.toml`.

Después, apunte `ORIGEN_API` a la URL real (se publica en el OpenAPI, en el
descriptor MCP y en la consola):

```bash
fly secrets set ORIGEN_API=https://plastilonas-api.fly.dev --config servicio/fly.toml
```

## Anunciarlo en el sitio

El sitio **no** anuncia esta API hasta que responda. En Vercel:

```
NEXT_PUBLIC_API_URL=https://plastilonas-api.fly.dev
```

Con esa variable, `/ai.txt` y `/llms.txt` publican solos el servidor MCP, el
contrato OpenAPI y las cinco herramientas, con sus reglas de uso. Sin ella, no
mencionan nada: anunciar lo que no responde enseña a los agentes que esta
empresa promete cosas que no cumple.

## En local

```bash
cd servicio && npm install
npm run build && npm start          # http://localhost:8080
npm test                            # compila y corre 36 pruebas sobre el JS compilado
```

`npm test` pasa un **patrón de archivos**, no un directorio: `node --test
dist/servicio/test` no busca dentro — intenta ejecutar el directorio como módulo
y falla con «Cannot find module», que no dice nada de lo que ocurre. Medido en
Node 22 con el mismo árbol: la forma de directorio reporta 1 prueba y 1 fallo;
el patrón reporta las 36 y pasa.

## Superficie

| Ruta | Qué resuelve |
|---|---|
| `GET /` | Consola con probador de cálculos y documentación |
| `GET /openapi.json` | Contrato OpenAPI 3.1, generado desde el motor |
| `GET /v1/salud` | Estado y edad de la caché (lo usa el health check de Fly) |
| `GET /v1/entidad` | Identidad verificable de la empresa |
| `GET /v1/catalogo?q=…` | Qué producto corresponde a lo que el comprador describe |
| `GET /v1/catalogo/{slug}` | Ficha completa con su PDF |
| `GET /v1/calculos` | Qué se puede predimensionar y qué datos pide cada cálculo |
| `POST /v1/calculos/{slug}` | El número, con desglose, supuestos, fórmula y límites |
| `GET /v1/glosario` | Términos que gobiernan una especificación |
| `GET /v1/respuestas` | Consultas comerciales y su página canónica |
| `POST /v1/cotizaciones` | Registra la solicitud y devuelve su referencia |
| `POST /mcp` | Servidor MCP (JSON-RPC 2.0), cinco herramientas |
