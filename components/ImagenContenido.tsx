import Image from 'next/image';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { RanuraImagen } from '@/lib/imagenes';
import { tomasDe, claseCiclo } from '@/lib/galeria';

/**
 * Imagen de contenido con degradación honesta y rotación de tomas.
 *
 * El problema que resuelve: 75 imágenes encargadas no llegan todas el mismo
 * día. Una página que referencia un archivo inexistente muestra el icono de
 * imagen rota, que comunica abandono con más fuerza que cualquier texto de la
 * página. Y una imagen de relleno genérica es peor todavía: ocupa el sitio de
 * la buena y nadie vuelve a acordarse de encargarla.
 *
 * La solución, en tres escalones:
 *
 *   1. Si el archivo encargado existe, se muestra. Siempre gana.
 *   2. Si no, y la ranura declara un RESPALDO —la fotografía real de un
 *      producto de esa misma familia, solución o guía, ya publicada en este
 *      repositorio—, se muestra esa. No es relleno genérico ni una
 *      ilustración inventada: es material propio y correspondiente al tema.
 *      El `alt` pasa a describir lo que de verdad se ve, porque un alt que
 *      describe una imagen ausente es peor que no tener alt.
 *   3. Si tampoco hay respaldo, el marcador sobrio: declara qué falta,
 *      visible para quien administra e imposible de confundir con contenido
 *      terminado. Un hueco declarado sigue siendo mejor que una imagen que no
 *      corresponde.
 *
 * ROTACIÓN. Si además existen `{nombre}-2`, `-3` o `-4`, se apilan y se
 * alternan con el mismo cruce de la galería de producto. Un término del
 * glosario ilustrado desde dos ángulos se entiende mejor que desde uno, y en
 * un glosario técnico esa es toda la razón de ser de la imagen. Quien resuelve
 * qué tomas hay es `lib/galeria`, que ya descarta las copias byte a byte: una
 * imagen fundiéndose contra un duplicado exacto de sí misma no es una
 * rotación, es una página que parece congelada.
 *
 * La comprobación es de servidor y ocurre una sola vez por compilación: no
 * añade nada al navegador.
 *
 * `prioridad` solo para la imagen que se ve sin desplazar: marcar varias como
 * prioritarias hace que compitan entre sí y empeora la métrica que se quería
 * mejorar. Nunca se marca prioritaria una toma secundaria — competiría con la
 * primera, que es la que mide el LCP.
 */

function archivoExiste(ruta: string): boolean {
  try {
    return existsSync(join(process.cwd(), 'public', ruta));
  } catch {
    return false;
  }
}

export default function ImagenContenido({
  ranura,
  prioridad = false,
  className = '',
  sizes = '(min-width: 1024px) 900px, 100vw',
}: {
  ranura: RanuraImagen;
  prioridad?: boolean;
  className?: string;
  sizes?: string;
}) {
  const hay = archivoExiste(ranura.ruta);
  const respaldo =
    !hay && ranura.respaldo && archivoExiste(ranura.respaldo.ruta) ? ranura.respaldo : null;

  // Lo que se va a pintar de verdad. A partir de aquí el componente no vuelve
  // a mirar `ranura.ruta`: si mezclara la ruta pedida con el alt del respaldo
  // —o al revés— el resultado sería una imagen mal descrita, que es
  // exactamente el fallo de accesibilidad que esto pretende evitar.
  const fuente = hay ? ranura.ruta : respaldo?.ruta ?? null;
  const textoAlt = hay ? ranura.alt : respaldo?.alt ?? ranura.alt;

  if (!fuente) {
    return (
      <div
        className={`flex items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center ${className}`}
        style={{ aspectRatio: `${ranura.ancho} / ${ranura.alto}` }}
        role="note"
        aria-label={`Imagen pendiente: ${ranura.alt}`}
      >
        <p className="max-w-sm text-sm text-gray-500">
          <span className="mb-1 block font-mono text-xs">{ranura.ruta}</span>
          Imagen pendiente de publicación.
        </p>
      </div>
    );
  }

  const tomas = tomasDe(fuente);
  const capas = tomas.slice(1);
  const ciclo = claseCiclo(tomas.length);

  /**
   * EL ZOOM ES PARA FOTOGRAFÍAS, NO PARA ESQUEMAS.
   *
   * `.ken-burns` va de scale(1.01) a scale(1.06) con un pequeño desplazamiento.
   * En una fotografía de catálogo eso da vida sin coste: el encuadre tiene aire
   * y lo que se recorta es fondo. En un DIAGRAMA no hay aire — la composición
   * llega hasta el borde a propósito, porque cada elemento está colocado donde
   * significa algo. Un 6 % de zoom se come alrededor de un 3 % por lado, y ese
   * 3 % es la primera columna de los pilares del marco, el borde de la silueta
   * del Perú o la tercera banda del método de los informes.
   *
   * El comentario de globals.css ya razona esto para las fotos —«en un catálogo
   * técnico ese detalle ES el argumento»—; en un esquema el argumento es el
   * dibujo entero. Así que el diagrama conserva el CRUCE entre tomas, que es lo
   * que aporta, y renuncia al zoom, que sólo le quita información.
   */
  const animar = ranura.tipo !== 'diagrama';

  return (
    <figure className={className}>
      <div
        className={`ken-burns-wrap ${ciclo ?? ''} relative overflow-hidden rounded-3xl`}
        style={{ aspectRatio: `${ranura.ancho} / ${ranura.alto}` }}
      >
        <Image
          src={fuente}
          alt={textoAlt}
          fill
          sizes={sizes}
          priority={prioridad}
          className={`${animar ? 'ken-burns' : ''} object-cover`}
        />
        {/* Tomas adicionales del MISMO concepto. aria-hidden porque el alt de
            la primera ya las describe: repetirlo es ruido para quien escucha
            la página, no información. */}
        {capas.map((toma, k) => (
          <div
            key={toma}
            className={`toma-cruce toma-capa-${k + 2} absolute inset-0`}
            aria-hidden="true"
          >
            <Image src={toma} alt="" fill sizes={sizes} className={`${animar ? 'ken-burns' : ''} object-cover`} />
          </div>
        ))}
      </div>
      {/* El pie describe lo que se está viendo AHORA, no lo que la ranura
          pedía. Si se está mostrando el respaldo, lo que hay en pantalla es
          una fotografía real de nuestro catálogo: llamarla «imagen
          referencial» o «esquema» sería mentir en la dirección contraria, y
          restar credibilidad a una foto que sí es nuestra. */}
      {respaldo ? (
        <figcaption className="mt-2 text-xs text-gray-500">
          Fotografía de nuestro catálogo: {respaldo.nombre}.
          {capas.length > 0 && ` ${tomas.length} vistas alternadas.`}
        </figcaption>
      ) : (
        ranura.tipo !== 'foto' && (
          <figcaption className="mt-2 text-xs text-gray-500">
            {ranura.tipo === 'diagrama'
              ? 'Esquema explicativo. No representa una obra ejecutada.'
              : 'Imagen referencial. Las especificaciones se confirman en la cotización.'}
            {capas.length > 0 && ` ${tomas.length} vistas alternadas.`}
          </figcaption>
        )
      )}
    </figure>
  );
}
