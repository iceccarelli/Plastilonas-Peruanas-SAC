import { createServer } from 'node:http';
import { atender } from './http';
import { rutasCargadas } from './rutas';
import { HOST, PUERTO, SITIO, ORIGEN_API, VERSION_API } from './config';

/**
 * PUNTO DE ENTRADA.
 *
 * Un proceso, sin estado, sin base de datos. Todo lo que sabe lo lee del sitio;
 * todo lo que recibe lo reenvía al buzón del sitio. Eso significa que se puede
 * reiniciar, escalar a cero, duplicar en otra región o tirar y volver a
 * desplegar sin perder nada — que es exactamente lo que se quiere de la pieza
 * por la que entran las consultas de terceros.
 */

rutasCargadas();

const servidor = createServer((req, res) => {
  void atender(req, res);
});

// Un agente lento detrás de una red mala no debe tumbar una conexión a medias.
servidor.keepAliveTimeout = 65000;
servidor.headersTimeout = 70000;
servidor.requestTimeout = 30000;

servidor.listen(PUERTO, HOST, () => {
  console.log(
    JSON.stringify({
      evento: 'arranque',
      version: VERSION_API,
      escuchando: `http://${HOST}:${PUERTO}`,
      origen_publico: ORIGEN_API,
      sitio: SITIO,
    }),
  );
});

/** Fly envía SIGTERM antes de reemplazar la máquina. Se cierra en orden. */
for (const senal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(senal, () => {
    console.log(JSON.stringify({ evento: 'apagado', senal }));
    servidor.close(() => process.exit(0));
    // Si una conexión se queda colgada, no se espera para siempre.
    setTimeout(() => process.exit(0), 8000).unref();
  });
}
