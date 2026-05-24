/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { X, Star, MapPin, Clock, MessageSquare, Send, Calendar, ExternalLink, ShieldCheck, ShoppingCart } from 'lucide-react';
import { CulinarySpot, Review, User } from '../types';

interface FoodDetailModalProps {
  spot: CulinarySpot | null;
  onClose: () => void;
  currentUser: User | null;
  onSubmitReview: (spotId: string, rating: number, comment: string) => Promise<void>;
  isSubmittingReview: boolean;
}

const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  spot,
  onClose,
  currentUser,
  onSubmitReview,
  isSubmittingReview
}) => {
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  if (!spot) return null;

  // Generate customized WhatsApp pre-filled greeting text for ordering
  const constructWhatsAppLink = () => {
    const greeting = `Halo ${spot.name}, saya melihat menu kuliner khas Pangkalpinang ini di aplikasi "Kuliner Bangka". Saya ingin menanyakan ketersediaan menu dan cara memesan porsi kuliner Anda.`;
    const encodedText = encodeURIComponent(greeting);
    return `https://wa.me/${spot.phoneWhatsApp}?text=${encodedText}`;
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);

    if (!commentInput.trim()) {
      setReviewError('Komentar ulasan tidak boleh kosong.');
      return;
    }

    try {
      await onSubmitReview(spot.id, ratingInput, commentInput);
      setCommentInput('');
      setRatingInput(5);
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Gagal mengirim ulasan.');
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
        
        {/* Photo Left Panel */}
        <div className="w-full md:w-1/2 relative bg-slate-100 dark:bg-slate-800 h-64 md:h-auto min-h-[250px]">
          <img
            src={spot.photoUrl}
            alt={spot.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Header text overlays on photo */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <span className="text-[10px] bg-orange-500 text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-orange-400/30">
              {spot.category}
            </span>
            <h2 className="text-xl md:text-2.5xl font-display font-bold leading-tight">
              {spot.name}
            </h2>
            
            <div className="flex items-center gap-3 text-xs opacity-90">
              <div className="flex items-center gap-0.5 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold">{spot.rating}</span>
              </div>
              <span>•</span>
              <span>{spot.reviews?.length || 0} Ulasan</span>
            </div>
          </div>

          {/* Close button inside photo for mobile */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full backdrop-blur-md transition-all focus:outline-none"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Right Panel */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between max-h-[50vh] md:max-h-[90vh] space-y-6">
          <div className="space-y-6">
            {/* Quick specifications */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-150 dark:border-slate-800">
              <div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Jam Operasional</span>
                <div className="flex items-center gap-1.5 mt-1 text-slate-800 dark:text-slate-250 text-xs">
                  <Clock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="font-semibold">{spot.openingHours}</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Harga Rata-Rata</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  Rp {spot.averagePrice.toLocaleString('id-ID')} / porsi
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-display">Tentang Makanan</h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-light">
                {spot.description}
              </p>
            </div>

            {/* Address with Google coordinates link */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="text-[10px] font-bold text-slate-405 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                Lokasi Google Maps
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {spot.address}
              </p>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-450 font-mono">
                  GPS: {spot.location.lat.toFixed(5)}, {spot.location.lng.toFixed(5)}
                </span>
                
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${spot.location.lat},${spot.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-0.5"
                >
                  Buka di Google Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* WhatsApp Ordering Widget */}
            <div className="pt-2">
              <a
                href={constructWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-display text-sm font-bold p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 transition-all active:scale-[0.98]"
              >
                <ShoppingCart className="w-4 h-4 fill-white text-emerald-600" />
                Pesan via WhatsApp Kuliner
              </a>
              <p className="text-[10px] text-center text-slate-450 dark:text-slate-500 mt-2 font-medium">
                Sistem akan otomatis mengarahkan ke obrolan WhatsApp toko untuk pemesanan cepat.
              </p>
            </div>

            {/* Reviews list representation */}
            <div className="space-y-4 pt-4 border-t border-slate-150 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  Ulasan Komunitas ({spot.reviews?.length || 0})
                </h3>
              </div>

              {/* Enter review box */}
              {currentUser ? (
                <form onSubmit={handleReviewSubmit} className="space-y-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">Berikan Rating Ulasan</span>
                  
                  {/* Star selection widget */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        className="focus:outline-none transition-transform active:scale-125"
                      >
                        <Star className={`w-5 h-5 ${star <= ratingInput ? 'text-amber-500 fill-amber-500' : 'text-slate-350 dark:text-slate-600'}`} />
                      </button>
                    ))}
                    <span className="text-xs text-slate-500 font-bold font-mono ml-2">({ratingInput} Bintang)</span>
                  </div>

                  {/* Comment Input */}
                  <div className="relative">
                    <textarea
                      placeholder="Tulis ulasan Anda tentang kualitas rasa masakan, porsi, dan pelayanan tempat ini..."
                      rows={2}
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {reviewError && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {reviewError}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-150 text-white dark:text-slate-950 px-4 py-1.5 rounded-xl font-display text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Kamu harus <strong className="text-slate-800 dark:text-slate-200">Masuk Akun</strong> terlebih dahulu untuk memberikan ulasan dan rating pada kuliner ini.
                  </p>
                </div>
              )}

              {/* History index cards listed below */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {spot.reviews && spot.reviews.length > 0 ? (
                  spot.reviews.map((rev) => (
                    <div 
                      key={rev.id} 
                      className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all shadow-sm space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {rev.reviewerName}
                          </p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {rev.date}
                          </p>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-700">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-bold text-slate-705 dark:text-slate-350 font-mono">
                            {rev.rating}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-light">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center text-slate-400 italic py-4">
                    Belum ada ulasan untuk kuliner ini. Jadilah yang pertama memberikan ulasan!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer close option */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-display text-xs font-bold py-2.5 px-5 rounded-2xl transition-all"
            >
              Tutup Rincian
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FoodDetailModal;
