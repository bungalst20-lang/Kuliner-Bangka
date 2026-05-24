/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { 
  Search, ChefHat, Heart, Star, MapPin, Grid, SlidersHorizontal, 
  ArrowRight, ShieldCheck, AlignJustify, Phone, LogOut, Moon, Sun, 
  ChevronLeft, ChevronRight, Eye, Tablet, Smartphone, Laptop, Sparkles, AlertCircle
} from 'lucide-react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PromoBanner from './components/PromoBanner';
import FoodCard from './components/FoodCard';
import FoodDetailModal from './components/FoodDetailModal';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import InteractiveMap from './components/InteractiveMap';
import Toast, { ToastMessage } from './components/Toast';
import Loading, { FoodSkeleton } from './components/Loading';
import { CulinarySpot, Promo, User, Category } from './types';

const App: React.FC = () => {
  // Device Preview Mode (to cover requested Website and Mobile App layouts)
  const [previewMode, setPreviewMode] = useState<'website' | 'mobile'>('website');

  // Core Data Lists
  const [spots, setSpots] = useState<CulinarySpot[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  
  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Semua'>('Semua');
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Active Modals & Selected items
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Loading indicator states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // Auth state
  const [token, setToken] = useState<string | null>(localStorage.getItem('bangka_kuliner_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Toast status
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null);

  // Theme support
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // default to a polished dark theme

  // Initialize and load spots + promos
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch current user if token exists
  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setCurrentUser(null);
    }
  }, [token]);

  // Dark mode side effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const triggerToast = (text: string, type: 'success' | 'error' | 'info') => {
    setActiveToast({
      id: Date.now().toString(),
      text,
      type
    });
  };

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [spotsRes, promosRes] = await Promise.all([
        fetch('/api/spots'),
        fetch('/api/promos')
      ]);

      if (spotsRes.ok) {
        const spotsData = await spotsRes.json();
        setSpots(spotsData);
      }
      if (promosRes.ok) {
        const promosData = await promosRes.json();
        setPromos(promosData);
      }
    } catch (err) {
      console.error("Error fetching initial culinary data:", err);
      triggerToast("Gagal memuat katalog makanan. Server API luring.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        // Token expired/invalid
        handleLogout();
      }
    } catch (err) {
      console.error("Error fetching profile details:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bangka_kuliner_token');
    setToken(null);
    setCurrentUser(null);
    setShowAdminPanel(false);
    triggerToast("Berhasil keluar dari akun.", "success");
  };

  const handleAuthSuccess = (newToken: string, user: any) => {
    setToken(newToken);
    setCurrentUser(user);
  };

  // Toggle spots favorite state on Express database
  const handleToggleFavorite = async (spotId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card detail trigger click
    if (!token) {
      setShowAuthModal(true);
      triggerToast("Harap masuk akun untuk menyimpan kuliner favorit.", "info");
      return;
    }

    try {
      const res = await fetch(`/api/auth/favorites/${spotId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            favorites: data.favorites
          });
        }
        triggerToast(data.message, "success");
      } else {
        throw new Error("Gagal mengubah bookmark favorit.");
      }
    } catch (err: any) {
      triggerToast(err.message || "Gagal mengubah favorit.", "error");
    }
  };

  // Submit food review and rating
  const handleSubmitReview = async (spotId: string, rating: number, comment: string) => {
    if (!token) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/spots/${spotId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      if (res.ok) {
        const data = await res.json();
        triggerToast(data.message, "success");
        // Reload all spots to propagate ratings
        await fetchInitialData();
      } else {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal mengirim ulasan.");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleScrollToSegment = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter and sort listings
  const filteredSpots = spots.filter(spot => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch = spot.name.toLowerCase().includes(query) || 
                          spot.description.toLowerCase().includes(query) ||
                          spot.address.toLowerCase().includes(query);

    // 2. Category Filter
    const matchesCategory = selectedCategory === 'Semua' || spot.category === selectedCategory;

    // 3. Favorites Tab Toggle
    const matchesFavorites = !showFavoritesOnly || (currentUser?.favorites?.includes(spot.id));

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  // Apply Sorting Logic
  const sortedAndFilteredSpots = [...filteredSpots].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else if (sortBy === 'price_asc') {
      return a.averagePrice - b.averagePrice;
    } else if (sortBy === 'price_desc') {
      return b.averagePrice - a.averagePrice;
    }
    // Newest / Featured priority first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  // Calculate current spot items for paginations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPagedSpots = sortedAndFilteredSpots.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedAndFilteredSpots.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Find currently selected spot detailed info
  const activeSpotDetails = spots.find(s => s.id === selectedSpotId) || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* DEVICE PLATFORM PREVIEW SELECTOR IN HEADER (Extremely Innovative Feature!) */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 py-2.5 px-4 flex items-center justify-between text-white selection:bg-orange-850">
        <div className="flex items-center gap-2 text-xs font-bold font-display">
          <Sparkles className="w-4 h-4 animate-spin-slow text-yellow-300" />
          <span>Kuliner Bangka Sandbox Environment: Berhasil Terkoneksi ke REST API</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 bg-black/30 p-1 rounded-xl text-xs font-bold">
          <span className="px-2 text-[10px] text-slate-300 uppercase tracking-widest font-mono">Pilih Mode Tampilan:</span>
          <button 
            onClick={() => setPreviewMode('website')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
              previewMode === 'website' 
                ? 'bg-white text-orange-600 shadow' 
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            Website Desktop
          </button>
          
          <button 
            onClick={() => setPreviewMode('mobile')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
              previewMode === 'mobile' 
                ? 'bg-white text-orange-600 shadow animate-pulse' 
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Aplikasi Mobile
          </button>
        </div>
      </div>

      {/* RENDER MODE DETERMINATOR */}
      {previewMode === 'mobile' ? (
        
        /* ======================== MOBILE SMARTPHONE PREVIEW LAYER ======================== */
        <div className="py-8 md:py-12 flex items-center justify-center bg-slate-100 dark:bg-slate-900/60 transition-colors" id="mobile-shell">
          
          {/* Visual Phone Frame Shell Representation */}
          <div className="relative w-full max-w-[410px] h-[840px] bg-slate-900 dark:bg-slate-950 rounded-[48px] border-[12px] border-slate-800 dark:border-slate-850 shadow-2xl overflow-hidden flex flex-col ring-4 ring-orange-500/15">
            
            {/* Phone Top Notch Speaker & Lens line */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-800 dark:bg-slate-850 rounded-b-2xl z-[160] flex items-center justify-center gap-2">
              <div className="w-12 h-1 bg-black rounded-full mb-1"></div>
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-700 mb-1"></div>
            </div>

            {/* Simulated Phone Status Bar */}
            <div className="bg-white dark:bg-slate-900 px-6 pt-7 pb-2 flex justify-between items-center text-[10px] font-bold text-slate-800 dark:text-slate-100 z-50">
              <span>12:30 📱</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-emerald-500">● Live Backend</span>
                <span>📶 LTE</span>
                <span>🔋 100%</span>
              </div>
            </div>

            {/* Embedded Mobile Canvas Screen Box */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col relative pb-16">
              
              {/* Internal Inline Mobile Navbar */}
              <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm p-4 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white text-xs">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <span className="font-display font-black text-xs text-slate-900 dark:text-white">
                    Kuliner <span className="text-orange-500">Bangka</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-1 px-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {isDarkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3" />}
                  </button>

                  {currentUser && (
                    <button 
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className={`p-1 px-1.5 rounded-lg text-xs font-bold flex items-center gap-0.5 ${
                        showFavoritesOnly ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                      }`}
                    >
                      <Heart className="w-3 h-3 fill-rose-650" />
                      <span>{currentUser.favorites?.length || 0}</span>
                    </button>
                  )}

                  {currentUser ? (
                    <button 
                      onClick={handleLogout}
                      className="p-1 text-slate-400 hover:text-rose-500"
                      title="Keluar"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="text-[9px] bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold px-2 py-1 rounded"
                    >
                      Masuk
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Micro Slogan banner or scroll items */}
              <div className="bg-gradient-to-b from-orange-500 to-orange-650 text-white p-4 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                <h2 className="font-display font-medium text-base tracking-tight leading-snug">
                  Cari Kuliner Asli Bangka di HP Kamu!
                </h2>
                <p className="text-[10px] text-orange-100">
                  Nikmati layanan pesan cepat WhatsApp langsung ke warung favorit terdekat.
                </p>

                {/* Inline Mobile Search */}
                <div className="relative mt-2">
                  <input
                    type="text"
                    required
                    placeholder="Cari masakan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-[11px] pl-8 pr-3 py-2 bg-white text-slate-900 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Mobile Category Quick Icons */}
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Kategori Tradisional</span>
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {['Semua', 'Seafood', 'Mie Bangka', 'Martabak Bangka', 'Otak-otak', 'Lempah Kuning', 'Kopi', 'Dessert'].map((c) => {
                    const isSel = selectedCategory === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setSelectedCategory(c as Category | 'Semua')}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap border ${
                          isSel 
                            ? 'bg-orange-500 text-white border-orange-400' 
                            : 'bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200 border-slate-100 dark:border-slate-800'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile list grid */}
              <div className="p-4 space-y-4 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase font-display">
                    Eateries Tersedia ({sortedAndFilteredSpots.length})
                  </h3>
                  
                  {/* Sorting mobile selectors */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-[10px] p-1 rounded border border-slate-200 dark:bg-slate-800"
                  >
                    <option value="default">Rekomendasi</option>
                    <option value="rating">Rating Tertinggi</option>
                    <option value="price_asc">Harga Termurah</option>
                    <option value="price_desc">Harga Termahal</option>
                  </select>
                </div>

                {isLoading ? (
                  <div className="space-y-4 py-8 animate-pulse">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-slate-200 dark:bg-slate-900 rounded-xl"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentPagedSpots.map((spot) => {
                      const isF = !!currentUser?.favorites?.includes(spot.id);
                      return (
                        <div
                          key={spot.id}
                          onClick={() => setSelectedSpotId(spot.id)}
                          className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-orange-400 transition-all flex gap-3 relative"
                        >
                          <img
                            src={spot.photoUrl}
                            alt={spot.name}
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <span className="text-[8px] font-bold text-orange-500 uppercase">{spot.category}</span>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight mt-0.5">{spot.name}</h4>
                            </div>
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] font-bold font-mono text-slate-700 dark:text-slate-350">
                                Rp {spot.averagePrice.toLocaleString('id-ID')}
                              </span>
                              <div className="flex items-center gap-0.5 text-[9px] font-bold text-amber-500">
                                <Star className="w-2.5 h-2.5 fill-amber-500" />
                                <span>{spot.rating}</span>
                              </div>
                            </div>
                          </div>

                          {/* Mobile quick favorite toggles */}
                          {currentUser && (
                            <button
                              onClick={(e) => handleToggleFavorite(spot.id, e)}
                              className="absolute top-2 right-2 text-rose-500"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isF ? 'fill-rose-500' : ''}`} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {currentPagedSpots.length === 0 && (
                      <p className="text-xs text-slate-450 italic text-center py-10">Tidak ditemukan kuliner khas.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile pagination indicators */}
              {totalPages > 1 && (
                <div className="p-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border p-1 px-2.5 rounded disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-[10px] font-semibold text-slate-500 font-mono">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border p-1 px-2.5 rounded disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </div>

            {/* Phone Home visual Indicator Bar */}
            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-400 dark:bg-slate-700 rounded-full z-[160]"></div>
          </div>
        </div>
      ) : (
        
        /* ======================== DESKTOP WEBSITE PREVIEW LAYER ======================== */
        <div className="space-y-0 select-text">
          {/* Main Website Header */}
          <Navbar
            currentUser={currentUser}
            onOpenAuth={() => setShowAuthModal(true)}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onScrollToSection={handleScrollToSegment}
            favoriteCount={currentUser?.favorites ? currentUser.favorites.length : 0}
            onShowFavorites={() => {
              setShowFavoritesOnly(!showFavoritesOnly);
              handleScrollToSegment('explore-listings');
              triggerToast(
                showFavoritesOnly ? "Menampilkan semua kuliner" : "Menampilkan bookmark kuliner favorit saya", 
                "info"
              );
            }}
            onShowAdminPanel={() => setShowAdminPanel(true)}
            showAdminBtn={currentUser?.role === 'admin'}
          />

          {/* Interactive Hero banner background selector */}
          <HeroSection
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            selectedCategory={selectedCategory}
            onCategoryChange={(c) => {
              setSelectedCategory(c);
              setCurrentPage(1);
            }}
            totalSpotsFound={sortedAndFilteredSpots.length}
          />

          {/* Vouchers and interactive promo banner cards section */}
          <PromoBanner
            promos={promos}
            onCopySuccess={(txt) => triggerToast(txt, "success")}
          />

          {/* Main Catalog listings */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12" id="explore-listings">
            
            {/* Header filters catalog */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl md:text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Grid className="w-5 h-5 text-orange-500" />
                  {showFavoritesOnly ? 'Daftar Kuliner Favorit Anda' : 'Jelajahi Kuliner Pangkalpinang'}
                </h2>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-light">
                  Menyajikan list warung, depot cafe legendaris lokal yang terverifikasi citarasanya.
                </p>
              </div>

              {/* Catalog control filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <span>Urutkan:</span>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {['default', 'rating', 'price_asc'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`text-xs font-semibold py-1.5 px-3.5 rounded-xl transition-all ${
                        sortBy === s
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-805 dark:hover:text-slate-350'
                      }`}
                    >
                      {s === 'default' && 'Rekomendasi'}
                      {s === 'rating' && 'Bintang Tertinggi'}
                      {s === 'price_asc' && 'Harga Terjangkau'}
                    </button>
                  ))}
                </div>

                {/* Show raw count tag */}
                <span className="text-[11px] font-mono font-bold bg-orange-100 text-orange-850 dark:bg-orange-955 dark:text-orange-355 px-3 py-1.5 rounded-full">
                  {sortedAndFilteredSpots.length} Tempat Makan
                </span>
              </div>
            </div>

            {/* CATALOG CARDS OR SKELETON */}
            {isLoading ? (
              <FoodSkeleton />
            ) : (
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {currentPagedSpots.map((spot) => (
                    <FoodCard
                      key={spot.id}
                      spot={spot}
                      onViewDetail={(id) => setSelectedSpotId(id)}
                      currentUser={currentUser}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={!!currentUser?.favorites?.includes(spot.id)}
                    />
                  ))}
                </div>

                {/* PAGINATION WIDGET */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-850">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="text-xs font-bold py-2 px-5 rounded-2xl border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 bg-white dark:bg-slate-900 transition-all flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Sebelumnya
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePageChange(idx + 1)}
                          className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all ${
                            currentPage === idx + 1
                              ? 'bg-orange-500 text-white shadow-md shadow-orange-550/10'
                              : 'bg-white dark:bg-slate-900 border border-slate-150 hover:bg-slate-50 dark:border-slate-800'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="text-xs font-bold py-2 px-5 rounded-2xl border border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 bg-white dark:bg-slate-900 transition-all flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Berikutnya
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {sortedAndFilteredSpots.length === 0 && (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] max-w-xl mx-auto space-y-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/20 text-orange-600 rounded-full flex items-center justify-center mx-auto text-xl">
                      🍜
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-slate-800 dark:text-white">Tidak ada kuliner khas</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                        Sayang sekali, tidak ada hasil makan yang cocok dengan query filter / pencarian Anda hari ini. Coba ketikkan kata kunci lain!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Maps Integration Section */}
            <div className="space-y-4 pt-10 border-t border-slate-150 dark:border-slate-800">
              <InteractiveMap
                spots={spots}
                selectedSpot={activeSpotDetails}
                onSelectSpot={(spot) => {
                  setSelectedSpotId(spot.id);
                  handleScrollToSegment('radar-peta-kuliner');
                }}
              />
            </div>

          </main>

          {/* Simple Website Footer block */}
          <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 text-center sm:text-left sm:flex justify-between items-center space-y-4 sm:space-y-0 text-xs">
              <div>
                <span className="font-display font-bold text-base text-white tracking-tight">
                  Kuliner <span className="text-orange-500">Bangka</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed max-w-sm font-light">
                  Platform peta & promosi digital kuliner lokal Pangkalpinang, Bangka Belitung. Menghubungkan cita rasa legendaris ke genggaman Anda.
                </p>
              </div>

              <div className="text-slate-500 font-light space-y-1">
                <p>© 2026 Kuliner Bangka. Hak Cipta Dilindungi Undang-Undang.</p>
                <p className="text-[10px]">Dibuat dengan dedikasi penuh untuk pelestarian warisan budaya kuliner nusantara.</p>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* RENDER ACTIVE DETAILED MODAL */}
      {selectedSpotId && (
        <FoodDetailModal
          spot={activeSpotDetails}
          onClose={() => setSelectedSpotId(null)}
          currentUser={currentUser}
          onSubmitReview={handleSubmitReview}
          isSubmittingReview={isSubmittingReview}
        />
      )}

      {/* RENDER AUTH MODAL */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
          onToast={triggerToast}
        />
      )}

      {/* RENDER ADMIN PANEL */}
      {showAdminPanel && (
        <AdminPanel
          onClose={() => setShowAdminPanel(false)}
          token={token || ''}
          onToast={triggerToast}
          onRefreshData={fetchInitialData}
          spots={spots}
          promos={promos}
        />
      )}

      {/* RENDER FLOATING TOAST BANNER */}
      <Toast
        toast={activeToast}
        onClose={() => setActiveToast(null)}
      />

    </div>
  );
};

export default App;
