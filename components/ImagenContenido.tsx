import Image from 'next/image';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { RanuraImagen } from '@/lib/imagenes';

/**
 * Imagen de contenido con degradación honesta.
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
 * La comprobación es de servidor y ocurre una sola vez por compilación: no
 * añade nada al navegador.
 *
 * `prioridad` solo para la imagen que se ve sin desplazar: marcar varias como
 * prioritarias hace que compitan entre sí y empeora la métrica que se quería
 * mejorar.
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

  return (
    <figure className={className}>
      <Image
        src={ranura.ruta}
        alt={ranura.alt}
        width={ranura.ancho}
        height={ranura.alto}
        sizes={sizes}
        priority={prioridad}
        className="h-auto w-full rounded-3xl object-cover"
      />
      {/* Una ilustración no es una fotografía del producto real, y decirlo es
          más barato que un pedido devuelto. */}
      {ranura.tipo !== 'foto' && (
        <figcaption className="mt-2 text-xs text-gray-500">
          {ranura.tipo === 'diagrama'
            ? 'Esquema explicativo. No representa una obra ejecutada.'
            : 'Imagen referencial. Las especificaciones se confirman en la cotización.'}
        </figcaption>
      )}
    </figure>
  );
}
