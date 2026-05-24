/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Search, MapPin, Sparkles, Filter, Undo } from 'lucide-react';
import { Category } from '../types';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: Category | 'Semua';
  onCategoryChange: (category: Category | 'Semua') => void;
  totalSpotsFound: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  totalSpotsFound
}) => {
  const categoriesList: { name: Category | 'Semua'; icon: string; bgClass: string; textClass: string }[] = [
    { name: 'Semua', icon: '🍽️', bgClass: 'bg-slate-100 dark:bg-slate-800', textClass: 'text-slate-900 dark:text-white' },
    { name: 'Seafood', icon: '🦀', bgClass: 'bg-sky-100/70 dark:bg-sky-950/45', textClass: 'text-sky-600 dark:text-sky-450' },
    { name: 'Lempah Kuning', icon: '🍲', bgClass: 'bg-amber-100/70 dark:bg-amber-950/45', textClass: 'text-amber-600 dark:text-amber-400' },
    { name: 'Mie Bangka', icon: '🍜', bgClass: 'bg-yellow-100/70 dark:bg-yellow-950/45', textClass: 'text-yellow-600 dark:text-yellow-400' },
    { name: 'Martabak Bangka', icon: '🥞', bgClass: 'bg-orange-100/70 dark:bg-orange-950/45', textClass: 'text-orange-600 dark:text-orange-400' },
    { name: 'Otak-otak', icon: '🍢', bgClass: 'bg-emerald-100/70 dark:bg-emerald-950/45', textClass: 'text-emerald-500 dark:text-emerald-400' },
    { name: 'Kopi', icon: '☕', bgClass: 'bg-amber-100/70 dark:bg-amber-950/45', textClass: 'text-amber-700 dark:text-amber-300' },
    { name: 'Dessert', icon: '🍧', bgClass: 'bg-pink-100/70 dark:bg-pink-950/45', textClass: 'text-pink-500 dark:text-pink-400' }
  ];

  return (
    <div className="relative overflow-hidden bg-slate-950 text-white py-16 md:py-24" id="beranda">
      {/* Background decoration representing the Coast & Waves */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
      
      {/* Beautiful ambient visual circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-orange-600/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-emerald-600/10 blur-[90px] pointer-events-none"></div>

      <div className="relative max-w-5xl mx-auto px-4 text-center space-y-8">
        {/* BADGE */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 dark:bg-slate-800/60 backdrop-blur-md rounded-full border border-white/10 text-orange-400 text-xs font-bold font-display uppercase tracking-widest animate-pulse max-w-xs mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-orange-405" />
          Kuliner Asli Pangkalpinang
        </div>

        {/* HERO TITLE */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight leading-none text-white max-w-3xl mx-auto">
            Jelajahi Cita Rasa <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Bangka Belitung</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Dari racikan kuah Mie Koba legendaris hingga kesegaran kuah asam pedas Lempah Kuning asli Pangkalpirang. Temukan, cicipi, & pesan langsung sekarang!
          </p>
        </div>

        {/* REALTIME SEARCH INPUT */}
        <div className="max-w-xl mx-auto">
          <div className="relative bg-white dark:bg-slate-900 p-2 rounded-2xl md:rounded-3xl shadow-2xl shadow-black/40 flex flex-col sm:flex-row items-center gap-2 border border-white/10">
            <div className="relative w-full flex-1">
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Mie Koba, Lempah Kuning, Otak-otak..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm md:text-base"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto px-2 justify-between">
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">Pangkalpinang</span>
              </div>
            </div>
          </div>
          {searchQuery && (
            <p className="text-xs text-orange-400 mt-2 font-display">
              Menampilkan {totalSpotsFound} hasil untuk pencarian "{searchQuery}"
            </p>
          )}
        </div>

        {/* CATEGORIES BUTTONS LIST */}
        <div className="space-y-4 pt-4" id="kategori-section">
          <div className="flex items-center gap-2 text-xs text-slate-450 uppercase tracking-widest font-bold justify-center">
            <Filter className="w-3.5 h-3.5" />
            <span>Pilih Kategori Favorit</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => onCategoryChange(cat.name)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                    isActive
                      ? 'bg-gradient-to-tr from-orange-500 to-orange-600 text-white ring-2 ring-orange-500/30 ring-offset-2 ring-offset-slate-950 scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/5 active:scale-95'
                  }`}
                >
                  <span className="text-sm md:text-base">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
