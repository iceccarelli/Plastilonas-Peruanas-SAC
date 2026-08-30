/**
 * Interruptores de superficie pública.
 *
 * CARRITO/LOGIN — apagados por defecto. Este es un negocio B2B por RFQ: un
 * carrito vacío y un «Iniciar sesión» en la cabecera le dicen al comprador
 * industrial que llegó a una tienda minorista, y a Google que la página
 * quiere transaccionar. El código del carrito no se borra: se apaga hasta que
 * exista una línea de SKUs estandarizados con precio que lo justifique.
 * Para reactivarlo: NEXT_PUBLIC_ENABLE_CART=true en el entorno.
 */
export const CART_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CART === 'true';
