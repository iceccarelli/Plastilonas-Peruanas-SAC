import type { Metadata } from 'next';

/**
 * El carrito, el checkout y su confirmación son páginas transaccionales:
 * no aportan señal, no deben competir en resultados y ya están bloqueadas en
 * robots.txt. Sin metadatos propios heredaban el título por defecto del sitio,
 * y tres URLs distintas salían con el MISMO <title> — que es exactamente la
 * señal de contenido duplicado que se quiere evitar.
 *
 * `robots: index:false` es la declaración honesta: robots.txt impide el
 * rastreo, pero una URL enlazada desde fuera puede indexarse igual sin haber
 * sido rastreada. El meta lo cierra.
 */
export const metadata: Metadata = {
  title: 'Carrito de cotización',
  description:
    'Productos seleccionados para solicitar una cotización a Plastilonas Peruanas SAC. No se publican precios: el precio se establece en cada cotización.',
  alternates: { canonical: '/carrito' },
  robots: { index: false, follow: true },
};

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
