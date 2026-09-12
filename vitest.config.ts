import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'node', // por-archivo se puede cambiar con // @vitest-environment jsdom
    globals: true,
    include: ['test/**/*.test.ts'],
    /**
     * TECHO DE 20 s, NO DE 5 s.
     *
     * Ninguna prueba de esta suite espera a la red: todas leen lib/, generan
     * un PDF en memoria o renderizan una plantilla. Lo único que puede tardar
     * segundos es la PRIMERA transformación de un grafo de módulos grande
     * cuando la máquina tiene dos núcleos y está compilando otra cosa — un
     * Codespace, el runner de CI cargado. Con el límite por defecto de 5 s eso
     * se presenta como una prueba roja, y el gate de entregas corre con
     * `set -e`: una entrega correcta se queda sin empujar por el reloj de la
     * máquina. Subir el techo no esconde un bloqueo real —no hay nada que
     * pueda quedarse esperando— y sí elimina el falso rojo.
     */
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
});
