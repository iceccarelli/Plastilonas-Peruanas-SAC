# P3 — 2,1 GB por despliegue, y un Dockerfile que no estaba donde decía

**Fecha:** 2026-09-14 · **Base:** `main` con 0002 a 0015 aplicados ·
**Contexto de construcción:** 2,1 GB / 44.727 archivos → **175 kB / 20 archivos**

El primer `fly deploy` falló, y falló dos veces por la misma clase de defecto:
un archivo puesto donde parecía, no donde la herramienta lo lee.

## 1. El `.dockerignore` que no filtraba nada

Lo puse en `servicio/`, junto al Dockerfile. Docker no lo lee ahí: lo lee en la
raíz del **contexto**, y el contexto de esta imagen es la raíz del repositorio,
porque el servicio importa `lib/calculadoras.ts` a propósito.

Lo que subió al constructor, medido por el propio flyctl:

```
Build context is 2.1 GB across 44,727 files
  node_modules/  844 MB
  .next/         680 MB
  .git/          512 MB
  public/         51 MB
```

Eso no es lentitud: es el repositorio íntegro, con su historia completa,
viajando a un constructor remoto en cada despliegue.

**Ahora el `.dockerignore` está en la raíz y excluye TODO** para volver a
incluir sólo tres cosas: `lib/calculadoras.ts`, `lib/site.ts` y `servicio/`. Al
revés —enumerar lo que sobra— se olvida siempre algo, y lo que se olvida se
sube. Así, lo que no está nombrado no puede acabar en la imagen.

**175 kB en 20 archivos.**

## 2. El Dockerfile que se buscaba dos veces

```
Error: dockerfile '/workspaces/.../servicio/servicio/Dockerfile' not found
```

`--dockerfile servicio/Dockerfile` junto a `--config servicio/fly.toml`. flyctl
resuelve esa ruta **contra el fly.toml**, no contra el directorio de trabajo, y
la concatenó consigo misma. Lo escribí yo en las instrucciones de 0014.

La ruta pasa a vivir en `[build] dockerfile = "Dockerfile"` dentro del propio
`fly.toml`, donde sólo se puede leer de una manera, y la bandera desaparece:

```bash
npm run desplegar:api      # fly deploy . --config servicio/fly.toml
```

Un comando, en `package.json`, para que no vuelva a haber dos versiones de cómo
se despliega esto.

## 3. Lo que lo mantiene

`test/despliegue-servicio.test.ts`, 6 pruebas. El despliegue no se puede
ejecutar dentro de `npm test`, pero sus dos trampas sí se pueden vigilar:

- el `.dockerignore` está en la raíz, y **no** está en `servicio/` —un
  `.dockerignore` que no filtra nada es peor que ninguno: hace creer que sí—;
- la primera regla es `*`, y ni `node_modules`, ni `.next`, ni `.git`, ni
  `public` pueden reincluirse;
- **lo que el `Dockerfile` copia de `lib/` es exactamente lo que el
  `.dockerignore` deja pasar**: el día que el servicio importe otro módulo del
  sitio hay que tocar los dos archivos, y olvidar uno da un fallo tardío y
  confuso dentro de la imagen;
- el comando de despliegue existe, apunta al `fly.toml` y **no** lleva
  `--dockerfile`;
- el `path` del health check es una ruta que `servicio/src/rutas.ts` sirve de
  verdad — un health check a una ruta inexistente deja la máquina reiniciándose
  sin decir por qué.

Verificadas las cuatro primeras en sentido contrario: devolviendo el
`.dockerignore` a `servicio/`, copiando en el Dockerfile un módulo que el ignore
no deja pasar, reintroduciendo `--dockerfile` en el comando y reincluyendo
`node_modules`, falla exactamente la que corresponde.

## 4. Antes de aplicar este parche

`fly launch` **reescribió** `servicio/fly.toml` con su plantilla. El árbol de
trabajo lo tiene modificado —el gate lo mostró: `M servicio/fly.toml`— y este
parche toca ese archivo, así que `git am` se negaría.

```bash
git checkout -- servicio/fly.toml
```

El del repositorio es el bueno: lleva la región de São Paulo, el escalado a
cero, el health check y las variables de entorno. El de `fly launch` no.

## 5. Lo que NO entra

- No se toca el sitio, ni el servicio, ni una sola línea de lógica: sólo dónde
  vive la configuración del despliegue.
- No se añade ninguna dependencia.
