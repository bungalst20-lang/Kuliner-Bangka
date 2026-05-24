/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */
import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ZoomIn, ZoomOut, Search, ExternalLink } from 'lucide-react';
import { CulinarySpot } from '../types';

interface InteractiveMapProps {
  spots: CulinarySpot[];
  selectedSpot: CulinarySpot | null;
  onSelectSpot: (spot: CulinarySpot) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ spots, selectedSpot, onSelectSpot }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(3);
  const [mapSearch, setMapSearch] = useState<string>('');

  // Localized simulated coordinate grids for Pangkalpinang center
  // Center: -2.124618, 106.111822 (Kota Pangkalpinang)
  const mapCenter = { lat: -2.128, lng: 106.12 };

  // Helper to calculate pixel positions on our beautiful vector canvas grid representation
  const getCoordinatesPosition = (lat: number, lng: number) => {
    // Map bounds focused on Pangkalpinang metropolitan area
    const minLat = -2.16;
    const maxLat = -2.11;
    const minLng = 106.10;
    const maxLng = 106.15;

    // Convert to percentage
    const latPct = ((lat - minLat) / (maxLat - minLat)) * 100;
    const lngPct = ((lng - minLng) / (maxLng - minLng)) * 100;

    // Constrain within bounds
    const x = Math.max(5, Math.min(95, lngPct));
    // Lat is opposite (y increases downwards)
    const y = Math.max(5, Math.min(95, 100 - latPct));

    return { x, y };
  };

  const filteredSpots = spots.filter(spot => 
    spot.name.toLowerCase().includes(mapSearch.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row h-[550px]" id="radar-peta-kuliner">
      {/* Search & List panel on the left */}
      <div className="w-full md:w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col h-1/2 md:h-full bg-slate-50 dark:bg-slate-900/50">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h3 className="font-display font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
            Peta Kuliner Terdekat
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Klik lokasi makanan untuk rincian rute & alamat.
          </p>
          
          <div className="relative mt-3">
            <input
              type="text"
              placeholder="Cari di peta..."
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Spot lists */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredSpots.map((spot) => {
            const isSelected = selectedSpot?.id === spot.id;
            return (
              <button
                key={spot.id}
                onClick={() => onSelectSpot(spot)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex gap-3 ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-500'
                    : 'bg-white border-slate-100 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700'
                }`}
              >
                <img
                  src={spot.photoUrl}
                  alt={spot.name}
                  className="w-12 h-12 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {spot.category}
                  </p>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                    {spot.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {spot.address}
                  </p>
                </div>
              </button>
            );
          })}
          {filteredSpots.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              Tidak ada kuliner ditemukan
            </div>
          )}
        </div>
      </div>

      {/* Map visualization area */}
      <div className="flex-1 relative bg-sky-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden h-1/2 md:h-full">
        {/* Decorative Grid Lines to look like actual radar / blueprint radar */}
        <div className="absolute inset-0 bg-grid opacity-10 dark:opacity-20 pointer-events-none"></div>
        
        {/* Concentric rings represent distances */}
        <div className="absolute border border-dashed border-emerald-450/20 dark:border-emerald-500/10 rounded-full w-[400px] h-[400px] pointer-events-none flex items-center justify-center">
          <span className="text-[9px] text-slate-400/40 transform dark:text-slate-500 -translate-y-48">Radius 2 KM</span>
        </div>
        <div className="absolute border border-dashed border-emerald-450/20 dark:border-emerald-500/10 rounded-full w-[250px] h-[250px] pointer-events-none flex items-center justify-center">
          <span className="text-[9px] text-slate-400/40 transform dark:text-slate-500 -translate-y-28">Radius 1 KM</span>
        </div>
        <div className="absolute border border-dashed border-emerald-450/20 dark:border-emerald-500/10 rounded-full w-[100px] h-[100px] pointer-events-none flex items-center justify-center">
          <span className="text-[9px] text-slate-400/40 transform dark:text-slate-500 -translate-y-[45px]">Pusat Kota</span>
        </div>

        {/* Outer Pangkalpinang Island boundary representation overlay for beautiful aesthetic */}
        <div className="absolute select-none pointer-events-none w-[700px] h-[500px] opacity-40 dark:opacity-20 flex items-center justify-center text-slate-350 dark:text-slate-800">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-100 dark:fill-slate-900 border-none">
            <path d="M15,40 Q25,35 35,45 T55,50 T75,30 T90,50 T75,80 T50,75 T25,85 Z" />
          </svg>
        </div>

        {/* Legend */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] text-slate-650 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Pusat Kota Pangkalpinang (Alun-Alun)</span>
        </div>

        {/* Current Location Marker representing user */}
        <div className="absolute bg-sky-500/25 p-3 rounded-full border-2 border-white dark:border-slate-905 flex items-center justify-center animate-pulse" style={{ left: '42%', top: '55%' }}>
          <Navigation className="w-3.5 h-3.5 text-sky-600 fill-sky-600 transform rotate-45" />
          <span className="absolute -top-6 bg-sky-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow">Anda</span>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
          <button 
            onClick={() => setZoomLevel(Math.min(5, zoomLevel + 1))}
            className="p-1.5 bg-white dark:bg-slate-800 text-slate-650 dark:text-slate-300 hover:text-emerald-500 rounded-lg shadow-md border border-slate-100 dark:border-slate-700"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
            className="p-1.5 bg-white dark:bg-slate-800 text-slate-650 dark:text-slate-300 hover:text-emerald-500 rounded-lg shadow-md border border-slate-100 dark:border-slate-700"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Markers for each gourmet spot */}
        {filteredSpots.map((spot) => {
          const { x, y } = getCoordinatesPosition(spot.location.lat, spot.location.lng);
          const isSelected = selectedSpot?.id === spot.id;

          return (
            <div
              key={spot.id}
              className="absolute transition-all duration-500"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `scale(${1 + (zoomLevel - 3) * 0.15}) translate(-50%, -50%)`,
                zIndex: isSelected ? 40 : 20
              }}
            >
              {/* Pin */}
              <button
                onClick={() => onSelectSpot(spot)}
                className={`group relative flex flex-col items-center justify-center p-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  isSelected 
                    ? 'bg-rose-500 text-white shadow-lg' 
                    : 'bg-white text-slate-700 hover:bg-emerald-500 hover:text-white shadow-md border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                }`}
              >
                <MapPin className={`w-5 h-5 ${isSelected ? 'animate-bounce text-white' : 'group-hover:animate-bounce'}`} />
                
                {/* Custom tooltip name of spot */}
                <div className={`absolute bottom-full mb-2 whitespace-nowrap px-2.5 py-1 rounded-xl shadow-lg border text-[10px] font-bold tracking-wide transition-all ${
                  isSelected
                    ? 'bg-rose-500 text-white border-rose-400 opacity-100 translate-y-0 scale-100'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-150 dark:border-slate-800 scale-90 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'
                } pointer-events-none z-[100]`}>
                  {spot.name}
                  <div className="text-[8px] opacity-75 font-normal mt-0.5">{spot.category}</div>
                </div>
              </button>
            </div>
          );
        })}

        {/* Selection Details Box on Map */}
        {selectedSpot && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-emerald-500/20 z-30 transition-all duration-300 animate-in slide-in-from-bottom-4">
            <div className="flex gap-3">
              <img
                src={selectedSpot.photoUrl}
                alt={selectedSpot.name}
                className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-slate-100 dark:border-slate-850"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {selectedSpot.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                  {selectedSpot.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {selectedSpot.address}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                Rp {selectedSpot.averagePrice.toLocaleString('id-ID')} Rata-rata
              </span>
              
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${selectedSpot.location.lat},${selectedSpot.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-sm shadow-emerald-600/20"
              >
                Penunjuk Arah
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveMap;
