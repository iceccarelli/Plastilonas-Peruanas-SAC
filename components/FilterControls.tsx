'use client';

import { X } from 'lucide-react';
import type { Availability } from '@/lib/types';

export default function FilterControls({
  categories, availabilityOrder, sectors, availabilityLabels,
  selectedCategories, selectedAvailability, selectedSectors,
  toggleCategory, toggleAvailability, toggleSector,
  clearFilters, hasActiveFilters, showHeader = true,
}: {
  categories: string[];
  availabilityOrder: Availability[];
  sectors: string[];
  availabilityLabels: Record<string, string>;
  selectedCategories: string[];
  selectedAvailability: string[];
  selectedSectors: string[];
  toggleCategory: (c: string) => void;
  toggleAvailability: (a: string) => void;
  toggleSector: (s: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  showHeader?: boolean;
}) {
  return (
    <>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="font-semibold tracking-tight">Filtros</div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs flex items-center gap-1 text-[#059669] hover:underline">
              <X className="w-3 h-3" /> Limpiar
            </button>
          )}
        </div>
      )}

      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">CATEGORÍA</div>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <button key={cat} onClick={() => toggleCategory(cat)}
              className={`w-full text-left px-4 py-2.5 text-sm rounded-2xl flex items-center justify-between transition-all ${
                selectedCategories.includes(cat) ? 'bg-[#059669] text-white font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
              {cat}
              {selectedCategories.includes(cat) && <span className="text-xs">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">DISPONIBILIDAD</div>
        <div className="space-y-1.5">
          {availabilityOrder.map((a) => (
            <button key={a} onClick={() => toggleAvailability(a)}
              className={`w-full text-left px-4 py-2.5 text-sm rounded-2xl flex items-center justify-between transition-all ${
                selectedAvailability.includes(a) ? 'bg-[#0A2540] text-white font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
              {availabilityLabels[a]}
              {selectedAvailability.includes(a) && <span className="text-xs">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">SECTOR DE APLICACIÓN</div>
        <div className="flex flex-wrap gap-2">
          {sectors.map((sector) => (
            <button key={sector} onClick={() => toggleSector(sector)}
              className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-all ${
                selectedSectors.includes(sector) ? 'chip-selected' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
              {sector}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
