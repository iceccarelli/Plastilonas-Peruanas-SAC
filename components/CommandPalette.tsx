'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, ArrowRight, Package } from 'lucide-react';
import { products } from '@/lib/products';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const filteredProducts = products
    .filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 8);

  const handleSelect = (slug: string) => {
    onOpenChange(false);
    setSearch('');
    router.push(`/productos/${slug}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
        className="command-palette w-full max-w-[640px] mx-4 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <Command className="w-full" shouldFilter={false}>
          <div className="flex items-center border-b px-5 py-4 gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <Command.Input 
              value={search}
              onValueChange={setSearch}
              placeholder="Buscar productos, categorías o aplicaciones..." 
              className="flex-1 bg-transparent text-lg placeholder:text-gray-400 focus:outline-none"
              autoFocus
            />
            <kbd className="hidden sm:block text-xs px-2 py-1 bg-gray-100 rounded font-mono text-gray-500">ESC</kbd>
          </div>

          <Command.List className="max-h-[420px] overflow-y-auto p-2">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Command.Item
                  key={product.id}
                  value={product.slug}
                  onSelect={() => handleSelect(product.slug)}
                  className="flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer hover:bg-gray-50 data-[selected=true]:bg-gray-50 group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <Package className="w-5 h-5 text-[#059669]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#0A2540] group-hover:text-[#059669] transition-colors">{product.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{product.shortDescription}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">{product.category}</span>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#059669] transition-colors" />
                  </div>
                </Command.Item>
              ))
            ) : (
              <div className="px-5 py-12 text-center">
                <p className="text-gray-500">No se encontraron productos para &ldquo;{search}&rdquo;</p>
                <button 
                  onClick={() => {
                    onOpenChange(false);
                    router.push('/productos');
                  }}
                  className="mt-4 text-sm text-[#059669] hover:underline"
                >
                  Ver catálogo completo →
                </button>
              </div>
            )}

            <div className="px-4 pt-3 pb-2 t-micro text-gray-400 flex items-center justify-between border-t mt-2">
              <div>Resultados de búsqueda en tiempo real</div>
              <div className="hidden sm:block">Presiona Enter para ver detalles</div>
            </div>
          </Command.List>
        </Command>
      </motion.div>
    </div>
  );
}
