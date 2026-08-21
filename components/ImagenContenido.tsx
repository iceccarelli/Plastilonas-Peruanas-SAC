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
 * La solución: se comprueba en tiempo de compilación si el archivo existe. Si
 * está, se muestra. Si no, se muestra un marcador sobrio que declara qué
 * imagen falta — visible para quien administra el sitio, discreto para el
 * visitante, e imposible de confundir con contenido terminado.
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

  if (!hay) {
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

  const tomas = tomasDe(ranura.ruta);
  const capas = tomas.slice(1);
  const ciclo = claseCiclo(tomas.length);

  return (
    <figure className={className}>
      <div
        className={`ken-burns-wrap ${ciclo ?? ''} relative overflow-hidden rounded-3xl`}
        style={{ aspectRatio: `${ranura.ancho} / ${ranura.alto}` }}
      >
        <Image
          src={ranura.ruta}
          alt={ranura.alt}
          fill
          sizes={sizes}
          priority={prioridad}
          className="ken-burns object-cover"
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
            <Image src={toma} alt="" fill sizes={sizes} className="ken-burns object-cover" />
          </div>
        ))}
      </div>
      {/* Una ilustración no es una fotografía del producto real, y decirlo es
          más barato que un pedido devuelto. */}
      {ranura.tipo !== 'foto' && (
        <figcaption className="mt-2 text-xs text-gray-500">
          {ranura.tipo === 'diagrama'
            ? 'Esquema explicativo. No representa una obra ejecutada.'
            : 'Imagen referencial. Las especificaciones se confirman en la cotización.'}
          {capas.length > 0 && ` ${tomas.length} vistas alternadas.`}
        </figcaption>
      )}
    </figure>
  );
}
