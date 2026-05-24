/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { ChefHat, Sun, Moon, LogIn, LogOut, Heart, ShieldAlert, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onScrollToSection: (id: string) => void;
  favoriteCount: number;
  onShowFavorites: () => void;
  onShowAdminPanel: () => void;
  showAdminBtn: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  onScrollToSection,
  favoriteCount,
  onShowFavorites,
  onShowAdminPanel,
  showAdminBtn
}) => {
  return (
    <header className="sticky top-0 z-[100] w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* LOGO */}
        <div 
          onClick={() => onScrollToSection('beranda')} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight">
              Kuliner <span className="text-orange-500">Bangka</span>
            </span>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium tracking-widest uppercase -mt-1 hidden sm:block">
              Pangkalpinang Taste
            </p>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => onScrollToSection('beranda')}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-amber-400 transition-colors"
          >
            Beranda
          </button>
          <button 
            onClick={() => onScrollToSection('kategori-section')}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-amber-400 transition-colors"
          >
            Kategori
          </button>
          <button 
            onClick={() => onScrollToSection('radar-peta-kuliner')}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-amber-400 transition-colors"
          >
            Peta Lokasi
          </button>
          <button 
            onClick={() => onScrollToSection('promo-carousels')}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-amber-400 transition-colors"
          >
            Promo Hemat
          </button>
        </nav>

        {/* ACTION UTILITIES */}
        <div className="flex items-center gap-3">
          {/* DARK MODE SWITCH */}
          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 transition-all flex items-center justify-center border border-slate-100 dark:border-slate-800 focus:outline-none"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400 animate-pulse" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* FAVORITES COUNT TOGGLE */}
          {currentUser && (
            <button
              onClick={onShowFavorites}
              className="relative p-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-450 transition-all flex items-center justify-center border border-rose-100/50 dark:border-rose-900/30 focus:outline-none"
              title="Tempat Favorit Saya"
            >
              <Heart className="w-4 h-4 fill-rose-650" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900">
                  {favoriteCount}
                </span>
              )}
            </button>
          )}

          {/* ADMIN CONSOLE KEY */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={onShowAdminPanel}
              className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/50 text-amber-600 dark:text-amber-400 transition-all flex items-center gap-1.5 border border-amber-100/50 dark:border-amber-900/30 font-display text-xs font-bold"
              title="Dashboard Admin"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden lg:inline">Admin Panel</span>
            </button>
          )}

          {/* SIGN IN BUTTON OR USER PROFILE */}
          {currentUser ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-250 block truncate max-w-[100px]">
                  {currentUser.username}
                </span>
                <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest block -mt-0.5">
                  {currentUser.role === 'admin' ? 'Administrator' : 'Penikmat Rasa'}
                </span>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <UserIcon className="w-4 h-4" />
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-all text-xs font-bold"
                title="Keluar Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-150 text-white dark:text-slate-900 font-display text-xs font-bold py-2.5 px-4 rounded-2xl flex items-center gap-1.5 shadow-sm transition-all shadow-slate-900/10 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              Masuk
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
