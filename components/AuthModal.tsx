/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, User as UserIcon, AlertCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (token: string, user: any) => void;
  onToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuthSuccess, onToast }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleShortcutClick = (shortcutEmail: string, shortcutPass: string) => {
    setEmail(shortcutEmail);
    setPassword(shortcutPass);
    setActiveTab('login');
    setErrorText(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorText(null);

    // Frontend validations
    if (!email || !password) {
      setErrorText('Mohon isi email dan password.');
      setIsSubmitting(false);
      return;
    }
    if (activeTab === 'register' && !username) {
      setErrorText('Registrasi memerlukan nama lengkap username Anda.');
      setIsSubmitting(false);
      return;
    }

    try {
      const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = activeTab === 'login' 
        ? { email, password } 
        : { email, password, username };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal autentikasi.');
      }

      // Success
      localStorage.setItem('bangka_kuliner_token', data.token);
      onAuthSuccess(data.token, data.user);
      onToast(
        activeTab === 'login' 
          ? `Selamat Datang, ${data.user.username}! Berhasil masuk.` 
          : `Akun berhasil dibuat! Selamat Datang, ${data.user.username}!`,
        'success'
      );
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Koneksi API backend bermasalah.');
      onToast(err.message || 'Gagal login.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Beautiful Top Gradient Strip */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"></div>

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none bg-slate-50 dark:bg-slate-800 p-2 rounded-xl transition-all"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 md:p-8 space-y-6 pt-10">
          {/* LOGO BRIEF */}
          <div className="text-center space-y-1">
            <span className="font-display font-bold text-2xl text-slate-900 dark:text-white">
              Kuliner <span className="text-orange-500">Bangka</span>
            </span>
            <p className="text-xs text-slate-550 dark:text-slate-400">
              Masuk untuk menyimpan favorit, pesan cepat, & beri ulasan!
            </p>
          </div>

          {/* TAB CHOOOSER */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorText(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold font-display transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Masuk Akun
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorText(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold font-display transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Daftar Baru
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* USERNAME (FOR REGISTRATION ONLY) */}
            {activeTab === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-400 block">Username / Nama Lengkap</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Kamu"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

            {/* EMAIL */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-400 block">Alamat Email</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-400 block">Kata Sandi (Password)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* ERROR DISPLAY */}
            {errorText && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-start gap-2 text-xs">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-450 text-white font-display text-xs font-bold py-3.5 rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses Autentikasi...' : activeTab === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}
            </button>
          </form>

          {/* QUICK DEMO CREDENTIAL SHORTS */}
          <div className="p-4 bg-amber-50/70 dark:bg-slate-800/50 rounded-2xl border border-amber-100/45 dark:border-slate-750 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              Developer Sandbox Shortcuts (Klik demo instan)
            </span>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleShortcutClick('admin@kulinerbangka.com', 'admin123')}
                className="flex-1 text-[10px] text-left p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-800 dark:text-slate-350"
              >
                <div className="font-bold text-orange-600 dark:text-orange-400">🛡️ Akun Admin</div>
                <div className="opacity-75 font-mono">admin@kulinerbangka.com</div>
                <div className="opacity-75 font-mono mt-0.5">Sandi: admin123</div>
              </button>

              <button
                onClick={() => handleShortcutClick('user@kulinerbangka.com', 'password1123')}
                className="flex-1 text-[10px] text-left p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-800 dark:text-slate-350"
              >
                <div className="font-bold text-emerald-600 dark:text-emerald-400">👤 Akun Penikmat</div>
                <div className="opacity-75 font-mono">user@kulinerbangka.com</div>
                <div className="opacity-75 font-mono mt-0.5">Sandi: password123</div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;
