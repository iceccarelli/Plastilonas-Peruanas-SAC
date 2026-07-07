// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useCart, cartCount, cartSubtotal, type CartItem } from '@/lib/cart-store';
import type { Product } from '@/lib/types';

function makeProduct(over: Partial<Product> = {}): Product {
  return {
    id: 'x', slug: 'demo', name: 'Demo', category: 'Cat', sector: [],
    shortDescription: '', description: '', specifications: [], applications: [],
    benefits: [], image: '/x.jpg', gallery: [], featured: false, popular: false,
    price: 10, priceUnit: 'unidad', purchasable: true, ...over,
  };
}

describe('cart-store', () => {
  beforeEach(() => {
    useCart.setState({ items: [], isOpen: false });
  });

  it('añade un producto comprable', () => {
    useCart.getState().add(makeProduct({ slug: 'a' }));
    const { items } = useCart.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
  });

  it('acumula cantidad al añadir el mismo producto', () => {
    const p = makeProduct({ slug: 'a' });
    useCart.getState().add(p);
    useCart.getState().add(p, 2);
    expect(useCart.getState().items[0].quantity).toBe(3);
  });

  it('IGNORA productos no comprables (sin precio o purchasable=false)', () => {
    useCart.getState().add(makeProduct({ slug: 'nope', purchasable: false }));
    useCart.getState().add(makeProduct({ slug: 'nope2', price: undefined }));
    expect(useCart.getState().items).toHaveLength(0);
  });

  it('setQuantity a 0 elimina la línea', () => {
    useCart.getState().add(makeProduct({ slug: 'a' }));
    useCart.getState().setQuantity('a', 0);
    expect(useCart.getState().items).toHaveLength(0);
  });

  it('remove elimina por slug', () => {
    useCart.getState().add(makeProduct({ slug: 'a' }));
    useCart.getState().add(makeProduct({ slug: 'b' }));
    useCart.getState().remove('a');
    expect(useCart.getState().items.map((i) => i.slug)).toEqual(['b']);
  });

  it('clear vacía el carrito', () => {
    useCart.getState().add(makeProduct({ slug: 'a' }));
    useCart.getState().clear();
    expect(useCart.getState().items).toHaveLength(0);
  });

  it('selectores: cartCount y cartSubtotal', () => {
    const items: CartItem[] = [
      { slug: 'a', name: 'A', price: 10, image: '', quantity: 2 },
      { slug: 'b', name: 'B', price: 5.5, image: '', quantity: 4 },
    ];
    expect(cartCount(items)).toBe(6);
    expect(cartSubtotal(items)).toBe(42); // 20 + 22
  });
});
