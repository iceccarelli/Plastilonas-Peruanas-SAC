# Contexto de construcción: la RAÍZ del repositorio, no servicio/.
# El servicio importa lib/calculadoras.ts del sitio a propósito: el cálculo que
# publica esta API tiene que ser exactamente el que muestra la web, no una copia
# que se desincroniza.
#
# SE DESPLIEGA DESDE LA RAÍZ, SIN --dockerfile:
#
#   npm run desplegar:api          (= fly deploy . --config servicio/fly.toml)
#
# flyctl resuelve la ruta del Dockerfile RELATIVA AL fly.toml, no al directorio
# de trabajo. Medido: `--dockerfile servicio/Dockerfile` con
# `--config servicio/fly.toml` buscó servicio/servicio/Dockerfile y falló. Por
# eso la ruta vive en `[build] dockerfile = "Dockerfile"` dentro del fly.toml,
# donde sólo se puede leer de una manera, y la bandera no se usa.
#
# El .dockerignore está en la RAÍZ del repositorio, que es donde Docker lo lee:
# excluye todo y vuelve a incluir sólo lo que estas tres líneas COPY necesitan.
#
FROM node:22-alpine AS construccion
WORKDIR /obra
COPY servicio/package.json servicio/tsconfig.json ./servicio/
RUN cd servicio && npm install --no-audit --no-fund
COPY lib/calculadoras.ts lib/site.ts ./lib/
COPY servicio/src ./servicio/src
COPY servicio/test ./servicio/test
# El gate del servicio vive aquí: si `tsc` falla o una prueba se pone en rojo,
# la imagen no se construye y no se despliega nada. El sitio tiene su gate en
# scripts/aplicar-entrega.sh; éste tiene el suyo donde le corresponde.
RUN cd servicio && npm run build && node --test dist/servicio/test

FROM node:22-alpine AS produccion
ENV NODE_ENV=production
WORKDIR /app
# Sin dependencias de ejecución: sólo el JavaScript compilado y el Node base.
COPY --from=construccion /obra/servicio/dist ./dist
COPY servicio/package.json ./package.json
USER node
EXPOSE 8080
CMD ["node", "dist/servicio/src/index.js"]
