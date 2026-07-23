'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Grid, List, Filter, X } from 'lucide-react';
import {
  products,
  categories,
  sectors,
  availabilityLabels,
  sourcingLabels,
} from '@/lib/products';
import type { Availability } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import ProductRotator from '@/components/ProductRotator';
import FilterControls from '@/components/FilterControls';
import FilterSheet from '@/components/FilterSheet';
import { motion, AnimatePresence } from 'framer-motion';

// Orden de los estados de disponibilidad para el filtro (estilo AWS: el estado
// de la oferta es un eje de navegación de primera clase).
const AVAILABILITY_ORDER: Availability[] = ['stock', 'a_medida', 'bajo_pedido'];

function ProductosContent() {
  // Los enlaces del navbar, footer y home usan ?categoria=, ?sector= y
  // ?disponibilidad=. Antes estos parámetros se ignoraban y toda la navegación
  // por categoría llevaba al catálogo sin filtrar.
  const searchParams = useSearchParams();
  const initialCategoria = searchParams.get('categoria');
  const initialSector = searchParams.get('sector');
  const initialDisponibilidad = searchParams.get('disponibilidad');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategoria ? [initialCategoria] : []
  );
  const [selectedSectors, setSelectedSectors] = useState<string[]>(
    initialSector ? [initialSector] : []
  );
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(
    initialDisponibilidad ? [initialDisponibilidad] : []
  );
  const [sortBy, setSortBy] = useState<'name' | 'popular'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.shortDescription.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Sector filter
    if (selectedSectors.length > 0) {
      result = result.filter(p => p.sector.some(s => selectedSectors.includes(s)));
    }

    // Availability filter (estado de la oferta)
    if (selectedAvailability.length > 0) {
      result = result.filter(p =>
        selectedAvailability.includes(p.availability ?? 'a_medida')
      );
    }

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return 0;
      });
    }

    return result;
  }, [searchTerm, selectedCategories, selectedSectors, selectedAvailability, sortBy]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev =>
      prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
    );
  };

  const toggleAvailability = (a: string) => {
    setSelectedAvailability(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedSectors([]);
    setSelectedAvailability([]);
    setSortBy('popular');
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCategories.length > 0 ||
    selectedSectors.length > 0 ||
    selectedAvailability.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <div className="text-xs tracking-[0.15em] text-[#059669] font-semibold">CATÁLOGO COMPLETO</div>
          <h1 className="t-display font-semibold text-[#0A2540]">Productos Industriales</h1>
          <p className="text-gray-600 mt-2">Soluciones de alta performance para los sectores más exigentes del Perú</p>
        </div>
        <div className="text-sm text-gray-500">{filteredProducts.length} productos encontrados</div>
      </div>

      {/* Search + Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, descripción o aplicación..."
            className="w-full pl-12 pr-5 py-3.5 border border-gray-200 rounded-2xl text-sm focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3.5 border border-gray-200 rounded-2xl text-sm font-medium hover:bg-gray-50 lg:hidden"
          >
            <Filter className="w-4 h-4" /> Filtros
          </button>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'name' | 'popular')}
            className="px-5 py-3.5 border border-gray-200 rounded-2xl text-sm bg-white focus:border-[#059669]"
          >
            <option value="popular">Más populares primero</option>
            <option value="name">Orden alfabético</option>
          </select>

          <div className="flex border border-gray-200 rounded-2xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-3.5 ${viewMode === 'grid' ? 'bg-[#0A2540] text-white' : 'hover:bg-gray-50'}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-3.5 ${viewMode === 'list' ? 'bg-[#0A2540] text-white' : 'hover:bg-gray-50'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar (desktop) */}
        <div className="hidden lg:block lg:w-72 flex-shrink-0">
          <div className="sticky top-24 bg-white border border-gray-100 rounded-3xl p-7">
            <FilterControls
              categories={categories}
              availabilityOrder={AVAILABILITY_ORDER}
              sectors={sectors}
              availabilityLabels={availabilityLabels}
              selectedCategories={selectedCategories}
              selectedAvailability={selectedAvailability}
              selectedSectors={selectedSectors}
              toggleCategory={toggleCategory}
              toggleAvailability={toggleAvailability}
              toggleSector={toggleSector}
              clearFilters={clearFilters}
              hasActiveFilters={!!hasActiveFilters}
            />
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {filteredProducts.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredProducts.map((product) => (
                  viewMode === 'grid' ? (
                    <ProductCard key={product.id} product={product} />
                  ) : (
                    <div key={product.id} className="flex gap-6 bg-white border border-gray-100 p-6 rounded-3xl group">
                      <div className="relative w-36 h-28 rounded-2xl overflow-hidden flex-shrink-0">
                        <ProductRotator product={product} />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className="badge bg-gray-100 text-gray-600 text-xs">{product.category}</span>
                          {product.availability && (
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                product.availability === 'stock'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : product.availability === 'bajo_pedido'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {availabilityLabels[product.availability]}
                            </span>
                          )}
                          {product.sourcing && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-gray-50 text-gray-500 border border-gray-100">
                              {sourcingLabels[product.sourcing]}
                            </span>
                          )}
                        </div>
                        <Link href={`/productos/${product.slug}`} className="font-semibold text-xl tracking-tight text-[#0A2540] group-hover:text-[#059669] block mb-2">{product.name}</Link>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.shortDescription}</p>
                        <div className="flex gap-3">
                          <Link href={`/productos/${product.slug}`} className="text-sm font-medium text-[#059669]">Ver detalles →</Link>
                          <Link href={`/cotizacion?producto=${encodeURIComponent(product.name)}`} className="text-sm font-semibold text-white bg-[#0A2540] px-5 py-1.5 rounded-full text-xs">Cotizar este producto</Link>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-500 mb-4">No se encontraron productos con los filtros seleccionados.</p>
                <button onClick={clearFilters} className="text-[#059669] font-medium text-sm">Limpiar todos los filtros</button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <FilterSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        resultCount={filteredProducts.length}
        hasActiveFilters={!!hasActiveFilters}
        onClear={clearFilters}
      >
        <FilterControls
          categories={categories}
          availabilityOrder={AVAILABILITY_ORDER}
          sectors={sectors}
          availabilityLabels={availabilityLabels}
          selectedCategories={selectedCategories}
          selectedAvailability={selectedAvailability}
          selectedSectors={selectedSectors}
          toggleCategory={toggleCategory}
          toggleAvailability={toggleAvailability}
          toggleSector={toggleSector}
          clearFilters={clearFilters}
          hasActiveFilters={!!hasActiveFilters}
          showHeader={false}
        />
      </FilterSheet>
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-20 text-gray-400">Cargando catálogo…</div>}>
      <ProductosContent />
    </Suspense>
  );
}
