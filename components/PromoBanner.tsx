/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Copy, Check, Ticket, Calendar, Percent } from 'lucide-react';
import { Promo } from '../types';

interface PromoBannerProps {
  promos: Promo[];
  onCopySuccess: (text: string) => void;
}

const PromoBanner: React.FC<PromoBannerProps> = ({ promos, onCopySuccess }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    onCopySuccess(`Kode promo ${code} berhasil disalin ke clipboard!`);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  if (!promos || promos.length === 0) return null;

  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-950/60 transition-colors" id="promo-carousels">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8">
          <div>
            <span className="text-[10px] bg-orange-100 text-orange-850 dark:bg-orange-950/40 dark:text-orange-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
              Spesial Hari Ini
            </span>
            <h2 className="text-2xl md:text-3.5xl font-display font-bold text-slate-900 dark:text-white mt-3 tracking-tight">
              Kupon Promo Kuliner Hemat
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gunakan kode voucher di kasir / masukkan saat memesan makanan khas via WhatsApp!
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 mt-3 md:mt-0 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-xl">
            <Ticket className="w-4 h-4" />
            <span>{promos.length} Kupon Aktif</span>
          </div>
        </div>

        {/* PROMO CARDS CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promos.map((promo) => {
            const isCopied = copiedId === promo.id;
            return (
              <div 
                key={promo.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col sm:flex-row h-full transition-all hover:shadow-xl group"
              >
                {/* Image panel */}
                <div className="w-full sm:w-1/3 relative h-40 sm:h-auto min-h-[140px] bg-slate-100 dark:bg-slate-800">
                  <img
                    src={promo.bannerUrl}
                    alt={promo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Floating percentage badge */}
                  <div className="absolute top-3 left-3 bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-display font-bold px-3 py-1.5 rounded-2xl shadow-md flex items-center gap-0.5 text-xs">
                    <Percent className="w-3.5 h-3.5" />
                    <span>{promo.discountPercentage}% OFF</span>
                  </div>
                </div>

                {/* Info panel */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-base md:text-lg text-slate-800 dark:text-white leading-snug">
                      {promo.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                      {promo.description}
                    </p>
                  </div>

                  {/* Copy Coupon code widget */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-300 text-[10px] md:text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Berlaku s/d: <strong className="text-slate-700 dark:text-slate-200">{promo.expiryDate}</strong></span>
                    </div>

                    <button
                      onClick={() => handleCopyCode(promo.code, promo.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                        isCopied
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800'
                          : 'bg-white border-slate-200 hover:border-orange-500 text-slate-800 dark:bg-slate-900 dark:border-slate-750 dark:text-white dark:hover:border-amber-400'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>DISALIN</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="font-mono">{promo.code}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default PromoBanner;
