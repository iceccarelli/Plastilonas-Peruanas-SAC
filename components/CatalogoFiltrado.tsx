'use client';

import React, { useState, useMemo } from 'react';
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

/**
 * Rejilla filtrable del catálogo.
 *
 * Vivía dentro de app/productos/page.tsx, que era 'use client' entero y
 * envolvía TODO en <Suspense>. Como el componente lee `useSearchParams`, Next
 * solo podía prerenderizar el fallback: el HTML servido de /productos —la
 * página comercial más importante del sitio— llegaba con el texto «Cargando
 * catálogo…», sin <h1> y con CERO enlaces a las 36 fichas. El ItemList de
 * JSON-LD declaraba las URLs, pero un ItemList no es un grafo de enlaces: las
 * fichas no recibían ni una gota de señal interna desde su propio catálogo, y
 * cualquier agente que lea HTML sin ejecutar JavaScript veía una página vacía.
 *
 * Ahora la página es un componente de SERVIDOR que renderiza el encabezado y
 * el índice completo del catálogo, y esta rejilla interactiva se monta encima.
 */

// Orden de los estados de disponibilidad para el filtro (estilo AWS: el estado
// de la oferta es un eje de navegación de primera clase).
const AVAILABILITY_ORDER: Availability[] = ['stock', 'a_medida', 'bajo_pedido'];

export default function CatalogoFiltrado() {
  // Los enlaces del navbar, footer y home usan ?categoria=, ?sector= y
  // ?disponibilidad=. Antes estos parámetros se ignoraban y toda la navegación
  // por categoría llevaba al catálogo sin filtrar.
  const searchParams = useSearchParams();
  const initialCategoria = searchParams.get('categoria');
  const initialSector = searchParams.get('sector');
  const initialDisponibilidad = searchParams.get('disponibilidad');
  // ?q= alimenta el buscador: es el destino real del SearchAction de WebSite
  // en components/StructuredData.tsx (sitelinks searchbox de Google).
  const initialQuery = searchParams.get('q');

  const [searchTerm, setSearchTerm] = useState(initialQuery ?? '');
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
      {/* El encabezado y el <h1> viven ahora en el componente de servidor: este
          bloque solo estaba en el HTML después de hidratar, y un rastreador que
          no ejecuta JavaScript veía la página sin título. Aquí queda el único
          dato que SÍ depende del filtro. */}
      <div className="mb-6 text-sm text-gray-500" aria-live="polite">
        {filteredProducts.length} productos encontrados
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

          {/* El <select> no tenia etiqueta de ningun tipo: ni <label>, ni
              aria-label, ni name. Un lector de pantalla lo anunciaba como
              «cuadro combinado» a secas, sin decir que ordenaba el catalogo.
              La etiqueta va oculta a la vista, no ausente. */}
          <label htmlFor="orden-catalogo" className="sr-only">
            Ordenar el catálogo
          </label>
          <select
            id="orden-catalogo"
            name="orden"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'popular')}
            className="px-5 py-3.5 border border-gray-200 rounded-2xl text-sm bg-white focus:border-[#059669]"
          >
            <option value="popular">Más populares primero</option>
            <option value="name">Orden alfabético</option>
          </select>

          {/* Los dos botones de vista eran iconos sin texto ni aria-label: para
              un lector de pantalla, dos botones anonimos uno al lado del otro.
              Son un grupo de dos estados excluyentes, asi que se declaran como
              tales con aria-pressed y con nombre. */}
          <div
            role="group"
            aria-label="Forma de ver el catálogo"
            className="flex border border-gray-200 rounded-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Ver en cuadrícula"
              aria-pressed={viewMode === 'grid'}
              className={`p-3.5 ${viewMode === 'grid' ? 'bg-[#0A2540] text-white' : 'hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="Ver en lista"
              aria-pressed={viewMode === 'list'}
              className={`p-3.5 ${viewMode === 'list' ? 'bg-[#0A2540] text-white' : 'hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </button>
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
        {/* Las fichas titulan con h3 (ProductCard) y encima sólo había un h1:
            salto de nivel. El h2 de la región de resultados existía en el
            diseño —es «el catálogo»— pero no en el marcado. */}
        <h2 className="sr-only">Resultados del catálogo</h2>
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
