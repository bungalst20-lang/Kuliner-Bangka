/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Edit, Trash2, Users, Tag, UtensilsCrossed, Save, 
  MapPin, Clock, Phone, Link, FileText, Percent, Calendar, ShieldCheck 
} from 'lucide-react';
import { CulinarySpot, Promo, User, Category } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  token: string;
  onToast: (text: string, type: 'success' | 'error' | 'info') => void;
  onRefreshData: () => Promise<void>;
  spots: CulinarySpot[];
  promos: Promo[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  onClose,
  token,
  onToast,
  onRefreshData,
  spots,
  promos
}) => {
  const [activeTab, setActiveTab] = useState<'spots' | 'promos' | 'users'>('spots');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Form states for culinary spot
  const [spotId, setSpotId] = useState<string | null>(null);
  const [spotName, setSpotName] = useState('');
  const [spotPhotoUrl, setSpotPhotoUrl] = useState('');
  const [spotCategory, setSpotCategory] = useState<Category>('Seafood');
  const [spotDescription, setSpotDescription] = useState('');
  const [spotAddress, setSpotAddress] = useState('');
  const [spotOpeningHours, setSpotOpeningHours] = useState('');
  const [spotAveragePrice, setSpotAveragePrice] = useState<number>(20000);
  const [spotPhoneWhatsApp, setSpotPhoneWhatsApp] = useState('628');
  const [spotLat, setSpotLat] = useState<number>(-2.124618);
  const [spotLng, setSpotLng] = useState<number>(106.111822);
  const [spotFeatured, setSpotFeatured] = useState<boolean>(false);
  const [showSpotForm, setShowSpotForm] = useState(false);

  // Form states for Promo
  const [promoId, setPromoId] = useState<string | null>(null);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoPercent, setPromoPercent] = useState<number>(15);
  const [promoBanner, setPromoBanner] = useState('');
  const [promoExpiry, setPromoExpiry] = useState('2026-12-31');
  const [showPromoForm, setShowPromoForm] = useState(false);

  // Fetch users when on users tab
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      } else {
        throw new Error('Gagal mengambil data pengguna.');
      }
    } catch (err: any) {
      onToast(err.message, 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSpotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: spotName,
        photoUrl: spotPhotoUrl,
        category: spotCategory,
        description: spotDescription,
        address: spotAddress,
        openingHours: spotOpeningHours,
        averagePrice: Number(spotAveragePrice),
        phoneWhatsApp: spotPhoneWhatsApp,
        featured: spotFeatured,
        location: {
          lat: Number(spotLat),
          lng: Number(spotLng),
          address: spotAddress
        }
      };

      const method = spotId ? 'PUT' : 'POST';
      const endpoint = spotId ? `/api/spots/${spotId}` : '/api/spots';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Gagal menyimpan tempat kuliner.');
      }

      onToast(spotId ? 'Tempat kuliner berhasil diperbarui!' : 'Tempat kuliner baru ditambahkan!', 'success');
      resetSpotForm();
      await onRefreshData();
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: promoTitle,
        description: promoDesc,
        code: promoCode,
        discountPercentage: Number(promoPercent),
        bannerUrl: promoBanner,
        expiryDate: promoExpiry
      };

      const method = promoId ? 'PUT' : 'POST';
      const endpoint = promoId ? `/api/promos/${promoId}` : '/api/promos';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Gagal menyimpan promo.');
      }

      onToast(promoId ? 'Kupon promo berhasil diperbarui!' : 'Kupon promo baru ditambahkan!', 'success');
      resetPromoForm();
      await onRefreshData();
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  const deleteSpot = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus tempat kuliner ini dari sistem?')) return;
    try {
      const res = await fetch(`/api/spots/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        onToast('Tempat kuliner berhasil dihapus.', 'success');
        await onRefreshData();
      } else {
        throw new Error('Gagal menghapus kuliner.');
      }
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  const deletePromo = async (id: string) => {
    if (!window.confirm('Hapus kupon diskon ini?')) return;
    try {
      const res = await fetch(`/api/promos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        onToast('Promo berhasil dihapus.', 'success');
        await onRefreshData();
      } else {
        throw new Error('Gagal menghapus promo.');
      }
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Yakin ingin memblokir dan menghapus pengguna ini?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        onToast('Pengguna berhasil dihapus.', 'success');
        fetchUsers();
      } else {
        throw new Error('Gagal menghapus pengguna.');
      }
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  const toggleUserRole = async (id: string, currentRole: 'admin' | 'user') => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: nextRole })
      });
      if (res.ok) {
        onToast(`Hak akses berhasil diubah ke ${nextRole}!`, 'success');
        fetchUsers();
      } else {
        throw new Error('Gagal mengubah hak akses.');
      }
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  const openEditSpot = (spot: CulinarySpot) => {
    setSpotId(spot.id);
    setSpotName(spot.name);
    setSpotPhotoUrl(spot.photoUrl);
    setSpotCategory(spot.category);
    setSpotDescription(spot.description);
    setSpotAddress(spot.address);
    setSpotOpeningHours(spot.openingHours);
    setSpotAveragePrice(spot.averagePrice);
    setSpotPhoneWhatsApp(spot.phoneWhatsApp);
    setSpotLat(spot.location.lat);
    setSpotLng(spot.location.lng);
    setSpotFeatured(!!spot.featured);
    setShowSpotForm(true);
  };

  const openEditPromo = (p: Promo) => {
    setPromoId(p.id);
    setPromoTitle(p.title);
    setPromoDesc(p.description);
    setPromoCode(p.code);
    setPromoPercent(p.discountPercentage);
    setPromoBanner(p.bannerUrl);
    setPromoExpiry(p.expiryDate);
    setShowPromoForm(true);
  };

  const resetSpotForm = () => {
    setSpotId(null);
    setSpotName('');
    setSpotPhotoUrl('');
    setSpotCategory('Seafood');
    setSpotDescription('');
    setSpotAddress('');
    setSpotOpeningHours('');
    setSpotAveragePrice(20000);
    setSpotPhoneWhatsApp('628');
    setSpotLat(-2.124618);
    setSpotLng(106.111822);
    setSpotFeatured(false);
    setShowSpotForm(false);
  };

  const resetPromoForm = () => {
    setPromoId(null);
    setPromoTitle('');
    setPromoDesc('');
    setPromoCode('');
    setPromoPercent(15);
    setPromoBanner('');
    setPromoExpiry('2026-12-31');
    setShowPromoForm(false);
  };

  const categories: Category[] = ['Seafood', 'Mie Bangka', 'Martabak Bangka', 'Otak-otak', 'Lempah Kuning', 'Kopi', 'Dessert'];

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-slate-900 dark:to-slate-850">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 text-[10px] bg-amber-500 text-white font-bold rounded">ADMIN</span>
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
              Dashboard Manajemen Bangka Kuliner
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('spots')}
            className={`py-3 px-4 font-display text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'spots'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-300'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            Daftar Tempat Makan ({spots.length})
          </button>
          
          <button
            onClick={() => setActiveTab('promos')}
            className={`py-3 px-4 font-display text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'promos'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-300'
            }`}
          >
            <Tag className="w-4 h-4" />
            Voucher & Promo ({promos.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 font-display text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            Manajemen Pengguna
          </button>
        </div>

        {/* WORK CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/20">
          
          {/* 1. SPOTS TAB */}
          {activeTab === 'spots' && (
            <div className="space-y-6">
              
              {/* Add form toggler */}
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">
                  {showSpotForm ? 'Formulir Detail Tempat' : 'Listings Restoran / Cafe'}
                </h3>
                
                <button
                  onClick={() => {
                    if (showSpotForm) {
                      resetSpotForm();
                    } else {
                      setShowSpotForm(true);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-display text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1 shadow transition-all active:scale-95"
                >
                  {showSpotForm ? 'Batal Form' : 'Tambah Tempat Kuliner'}
                  {!showSpotForm && <Plus className="w-4 h-4" />}
                </button>
              </div>

              {showSpotForm ? (
                /* COLLAPSIBLE CULINARY SPOT FORM */
                <form onSubmit={handleSpotSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl space-y-5 animate-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">Nama Tempat Kuliner</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Mie Koba Iskandar Baru"
                        value={spotName}
                        onChange={(e) => setSpotName(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">Kategori Makan</label>
                      <select
                        value={spotCategory}
                        onChange={(e) => setSpotCategory(e.target.value as Category)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Photo Url */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">URL Foto Kuliner (Unsplash/Imgur)</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={spotPhotoUrl}
                        onChange={(e) => setSpotPhotoUrl(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* Opening hours */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">Jam Buka & Tutup</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 08:00 - 22:00 WIB"
                        value={spotOpeningHours}
                        onChange={(e) => setSpotOpeningHours(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* Average Price */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">Estimasi Harga Porsi (IDR Rupiah)</label>
                      <input
                        type="number"
                        required
                        min={1000}
                        value={spotAveragePrice}
                        onChange={(e) => setSpotAveragePrice(Number(e.target.value))}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* WA Link phone format */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">No WhatsApp Pemesanan (Format: 628xxx)</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 6282177000123"
                        value={spotPhoneWhatsApp}
                        onChange={(e) => setSpotPhoneWhatsApp(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* Map GPS coordinates */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">Latitude Maps Koordinat</label>
                      <input
                        type="number"
                        step="any"
                        value={spotLat}
                        onChange={(e) => setSpotLat(Number(e.target.value))}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">Longitude Maps Koordinat</label>
                      <input
                        type="number"
                        step="any"
                        value={spotLng}
                        onChange={(e) => setSpotLng(Number(e.target.value))}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Address Text */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Alamat Lengkap</label>
                    <textarea
                      required
                      placeholder="Masukkan alamat lengkap restoran, jalan, kelurahan, kecamatan di Pangkalpinang..."
                      rows={2}
                      value={spotAddress}
                      onChange={(e) => setSpotAddress(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Deskripsi Kuliner & Sejarah Singkat Rasa</label>
                    <textarea
                      required
                      placeholder="Tulis penjelasan mendalam tentang rasa masakan, bumbu rempah unik, kelembutan ikan tenggiri..."
                      rows={3}
                      value={spotDescription}
                      onChange={(e) => setSpotDescription(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Feature Checkbar */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="spotFeatured"
                      checked={spotFeatured}
                      onChange={(e) => setSpotFeatured(e.target.checked)}
                      className="w-4.5 h-4.5 rounded text-orange-500 accent-orange-550 cursor-pointer"
                    />
                    <label htmlFor="spotFeatured" className="text-xs font-semibold text-slate-750 dark:text-slate-350 cursor-pointer">
                      Jadikan Rekomendasi Utama (Tampil Banner / Badge khusus)
                    </label>
                  </div>

                  {/* Saving Triggers */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <button
                      type="button"
                      onClick={resetSpotForm}
                      className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-800 py-2 px-5 rounded-xl bg-white dark:bg-slate-905"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-display text-xs font-bold py-2 px-6 rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Save className="w-4 h-4" />
                      {spotId ? 'Simpan Perubahan' : 'Terbitkan Kuliner'}
                    </button>
                  </div>
                </form>
              ) : (
                /* GRID OF EXISTING SPOTS FOR CRUD ACTIONS */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {spots.map((spot) => (
                    <div 
                      key={spot.id} 
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between space-y-4"
                    >
                      <div className="flex gap-3">
                        <img
                          src={spot.photoUrl}
                          alt={spot.name}
                          className="w-16 h-16 rounded-2xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full uppercase">
                            {spot.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                            {spot.name}
                          </h4>
                          <p className="text-[10px] text-slate-455 truncate">
                            {spot.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                          Rp {spot.averagePrice.toLocaleString('id-ID')}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditSpot(spot)}
                            className="p-1 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500 text-slate-600 dark:text-slate-300 hover:text-orange-500 text-[10px] font-bold flex items-center gap-1"
                            title="Edit Spot"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Ubah
                          </button>
                          <button
                            onClick={() => deleteSpot(spot.id)}
                            className="p-1 px-2.5 rounded-xl border border-slate-200 dark:border-slate-705 hover:border-rose-500 text-slate-400 hover:text-rose-550 text-[10px] font-bold flex items-center gap-1"
                            title="Hapus Spot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {spots.length === 0 && (
                    <p className="text-center text-xs text-slate-400 col-span-full py-8">
                      Belum ada data tempat makan. Tambahkan sekarang!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. PROMOS TAB */}
          {activeTab === 'promos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-display">
                  {showPromoForm ? 'Formulir Kupon Diskon' : 'List Kupon Diskon Aktif'}
                </h3>
                
                <button
                  onClick={() => {
                    if (showPromoForm) {
                      resetPromoForm();
                    } else {
                      setShowPromoForm(true);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-display text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1 shadow transition-all"
                >
                  {showPromoForm ? 'Batal Form' : 'Tambah Kupon Voucher'}
                  {!showPromoForm && <Plus className="w-4 h-4" />}
                </button>
              </div>

              {showPromoForm ? (
                /* PROMO INPUT FORM */
                <form onSubmit={handlePromoSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl space-y-5 animate-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">Judul Banner Promosi</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Diskon Makan Lempah Gurih"
                        value={promoTitle}
                        onChange={(e) => setPromoTitle(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* Voucher Code */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">Kode Voucher Kupon (Kapital, Contoh: LEMPAH20)</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: BANGA20"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                      />
                    </div>

                    {/* Discount Pct */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">Persentase Diskon % (Angka)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={100}
                        value={promoPercent}
                        onChange={(e) => setPromoPercent(Number(e.target.value))}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* Expiry date */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">Tanggal Kedaluwarsa</label>
                      <input
                        type="date"
                        required
                        value={promoExpiry}
                        onChange={(e) => setPromoExpiry(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Banner Photo Url */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">URL Gambar Banner Promo</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={promoBanner}
                      onChange={(e) => setPromoBanner(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Promo Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Keterangan Deskripsi Promosi</label>
                    <textarea
                      required
                      placeholder="Tulis detail promo cara memperoleh, minimum transaksi, dll..."
                      rows={2}
                      value={promoDesc}
                      onChange={(e) => setPromoDesc(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Saves */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={resetPromoForm}
                      className="text-xs font-bold text-slate-655 border border-slate-250 py-2 px-5 rounded-xl bg-white dark:bg-slate-900 text-slate-600"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-display text-xs font-bold py-2 px-6 rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Save className="w-4 h-4" />
                      {promoId ? 'Simpan Promo' : 'Terbitkan Voucher'}
                    </button>
                  </div>
                </form>
              ) : (
                /* PROMO CARDS VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {promos.map((p) => (
                    <div 
                      key={p.id} 
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-extrabold text-orange-500 font-mono bg-orange-50 dark:bg-orange-955 px-2 py-0.5 rounded">
                            {p.code}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Disc: {p.discountPercentage}%
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display leading-tight">{p.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-805">
                        <span className="text-[10px] text-slate-400">
                          S/D: {p.expiryDate}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditPromo(p)}
                            className="p-1 px-2.5 rounded-xl border border-slate-205 dark:border-slate-700 text-slate-605 text-[10px] font-bold flex items-center gap-1 text-slate-600 hover:text-orange-555"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Ubah
                          </button>
                          <button
                            onClick={() => deletePromo(p.id)}
                            className="p-1 px-2.5 rounded-xl border border-slate-205 dark:border-slate-700 text-slate-405 text-[10px] font-bold flex items-center gap-1 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {promos.length === 0 && (
                    <p className="text-center text-xs text-slate-400 col-span-full py-8">
                      Belum ada data promo kupon. Tambahkan sekarang!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. USERS LOG TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <p className="text-xs text-slate-500 dark:text-slate-450">
                Data real-time user terdaftar di database Kuliner Bangka. Sebagai Admin, Anda dapat memberikan status administrator atau mencabut izin akses pengguna jahil.
              </p>

              {loadingUsers ? (
                <div className="text-center py-8 text-xs text-slate-400 animate-pulse">
                  Mengambil data user di database...
                </div>
              ) : (
                <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 border-b border-slate-100 dark:border-slate-800 font-bold uppercase tracking-wider">
                        <th className="p-4">Username</th>
                        <th className="p-4">Email Account</th>
                        <th className="p-4">Hak Akses Role</th>
                        <th className="p-4 text-right">Aksi Manajemen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {usersList.map((userObj) => (
                        <tr key={userObj.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                          <td className="p-4 font-bold text-slate-900 dark:text-white">
                            {userObj.username}
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-350">
                            {userObj.email}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                              userObj.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-955 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {userObj.role === 'admin' && <ShieldCheck className="w-3 h-3 text-amber-500" />}
                              {userObj.role}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => toggleUserRole(userObj.id, userObj.role)}
                              className="text-[10px] font-bold border border-slate-200 dark:border-slate-702 bg-white dark:bg-slate-900 text-slate-720 dark:text-slate-350 hover:border-amber-500 py-1 px-2.5 rounded-lg active:scale-95"
                            >
                              Jadikan {userObj.role === 'admin' ? 'Regular' : 'Admin'}
                            </button>
                            
                            <button
                              onClick={() => deleteUser(userObj.id)}
                              className="text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-300 py-1 px-2.5 rounded-lg active:scale-95"
                              disabled={userObj.email === 'admin@kulinerbangka.com'} // secure protection
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* FOOTER PANELS */}
        <div className="p-6 border-t border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-right">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-150 text-white dark:text-slate-900 font-display text-xs font-bold py-2.5 px-6 rounded-2xl cursor-pointer shadow-sm transition-all active:scale-95"
          >
            Tutup Panel Admin
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;
