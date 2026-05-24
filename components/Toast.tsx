/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[300] flex items-center p-4 rounded-2xl shadow-xl border max-w-sm w-full bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800"
        >
          <div className="mr-3">
            {toast.type === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
            {toast.type === 'error' && <AlertCircle className="w-6 h-6 text-rose-500" />}
            {toast.type === 'info' && <Info className="w-6 h-6 text-sky-500" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white font-display">
              {toast.type === 'success' ? 'Berhasil' : toast.type === 'error' ? 'Kesalahan' : 'Informasi'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
              {toast.text}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
