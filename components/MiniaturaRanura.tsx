import Image from 'next/image';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { RanuraImagen } from '@/lib/imagenes';

/**
 * La miniatura de una ranura, para tarjetas de índice.
 *
 * Por qué no vale `ImagenContenido` aquí. Ese componente pinta una figura a
 * ancho completo, con pie, rotación de tomas y —cuando el archivo no existe—
 * un recuadro punteado que dice «imagen pendiente». Todo eso es correcto
 * dentro de un artículo y desastroso dentro de una lista: doce recuadros
 * punteados en rejilla no comunican «pendiente», comunican «roto».
 *
 * Aquí la regla es la contraria: si el archivo existe se muestra, y si no
 * existe no se muestra nada. Una tarjeta sin miniatura sigue siendo una
 * tarjeta legible; una tarjeta con un hueco declarado es una tarjeta que
 * discute consigo misma.
 *
 * Estas miniaturas reutilizan las MISMAS imágenes que ya publica la página de
 * destino. No se encarga ni un archivo nuevo: lo que cambia es que catorce
 * páginas índice dejan de ser listas de texto plano. Para un rastreador eso
 * significa que el hub ya no es un nodo sin señal visual, y para quien mira
 * significa poder distinguir una guía de otra antes de entrar.
 *
 * `alt=""` es deliberado y no es un descuido de accesibilidad: la miniatura
 * vive DENTRO del enlace cuyo texto ya nombra el destino. Darle un alt
 * descriptivo haría que un lector de pantalla anunciara el mismo elemento dos
 * veces. Cuando la imagen es el único contenido del enlace, hay que pasar
 * `alt` explícitamente.
 */

export default function MiniaturaRanura({
  ranura,
  className = '',
  sizes = '(min-width: 768px) 200px, 100vw',
  alt = '',
}: {
  ranura: RanuraImagen | undefined;
  className?: string;
  sizes?: string;
  alt?: string;
}) {
  if (!ranura) return null;
  let hay = false;
  try {
    hay = existsSync(join(process.cwd(), 'public', ranura.ruta));
  } catch {
    hay = false;
  }
  if (!hay) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gray-50 ${className}`}
      style={{ aspectRatio: '16 / 10' }}
    >
      <Image
        src={ranura.ruta}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    </div>
  );
}
