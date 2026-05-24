/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { star, Star, Heart, Clock, DollarSign, ArrowRight, MapPin } from 'lucide-react';
import { CulinarySpot, User } from '../types';

interface FoodCardProps {
  spot: CulinarySpot;
  onViewDetail: (id: string) => void;
  currentUser: User | null;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  isFavorite: boolean;
}

const FoodCard: React.FC<FoodCardProps> = ({
  spot,
  onViewDetail,
  currentUser,
  onToggleFavorite,
  isFavorite
}) => {
  return (
    <div 
      onClick={() => onViewDetail(spot.id)}
      className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      {/* PHOTO PANEL */}
      <div className="relative h-48 md:h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={spot.photoUrl}
          alt={spot.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Category Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <span className="text-[10px] uppercase font-bold tracking-widest bg-slate-900/85 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/10">
            {spot.category}
          </span>
        </div>

        {/* Favorite Bookmark Heart */}
        {currentUser && (
          <button
            onClick={(e) => onToggleFavorite(spot.id, e)}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow flex items-center justify-center text-slate-400 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-450 transition-colors focus:outline-none"
            title={isFavorite ? "Hapus dari Favorit" : "Simpan Favorit"}
          >
            <Heart className={`w-4 .5 h-4.5 ${isFavorite ? 'text-rose-500 fill-rose-500 scale-110' : ''} transition-transform`} />
          </button>
        )}

        {/* Featured Ribbon */}
        {spot.featured && (
          <div className="absolute bottom-4 left-4 bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold font-display text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-lg shadow-sm">
            Rekomendasi Utama
          </div>
        )}
      </div>

      {/* TEXT INFORMATION */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Rating and Reviews count */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{spot.rating}</span>
            </div>
            <span>•</span>
            <span className="text-[11px] font-medium font-mono">({spot.reviews?.length || 0} Ulasan)</span>
            
            <span>•</span>
            <div className="flex items-center gap-0.5 text-slate-650 dark:text-slate-300">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] truncate max-w-[80px]">{spot.openingHours}</span>
            </div>
          </div>

          {/* Spot Name */}
          <h3 className="font-display font-bold text-base md:text-lg text-slate-950 dark:text-white leading-snug group-hover:text-orange-500 transition-colors line-clamp-1">
            {spot.name}
          </h3>

          {/* Address Preview */}
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 line-clamp-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{spot.address}</span>
          </p>
        </div>

        {/* PRICE BAR & ACTION */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-550 block font-medium uppercase tracking-wide">Estimasi Harga</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
              Rp {spot.averagePrice.toLocaleString('id-ID')} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">/ porsi</span>
            </span>
          </div>

          <span className="text-xs font-bold text-orange-500 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform font-display">
            Lihat Detail
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
