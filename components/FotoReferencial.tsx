import Image from 'next/image';

/**
 * Fotografía ILUSTRATIVA con su etiqueta de honestidad, en un solo sitio.
 *
 * El lote de fotos del sitio muestra la aplicación —un camión entoldado, un
 * frente ventilado, un patio de carga—, no obras ejecutadas por esta empresa.
 * Publicarlas sin decirlo las convierte en un caso de éxito implícito, que es
 * exactamente lo que /confianza promete no hacer; publicarlas con la etiqueta
 * cuesta una línea y deja la puerta abierta a que las fotos de planta reales,
 * cuando existan (docs/HUMAN-GATES.md), se distingan de estas a simple vista.
 *
 * `sizes` está declarado para que el optimizador no sirva el archivo de
 * escritorio a un teléfono; no lleva `priority` porque nunca es el LCP: vive
 * bajo el encabezado y el primer párrafo.
 */
export default function FotoReferencial({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-gray-100">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 900px, 100vw"
          quality={75}
          className="object-cover"
        />
      </div>
      <figcaption className="mt-2 text-xs text-gray-500">
        {alt} Imagen referencial de la aplicación: no documenta una obra ejecutada.
      </figcaption>
    </figure>
  );
}
