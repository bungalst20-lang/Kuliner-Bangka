/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Loader2, Utensils } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

export const FoodSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="h-48 bg-slate-200 dark:bg-slate-850 w-full"></div>
          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
            </div>
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-full w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Loading: React.FC<LoadingProps> = ({ message = 'Memuat kelezatan Bangka...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/40 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 animate-bounce">
          <Utensils className="w-8 h-8" />
        </div>
        <Loader2 className="absolute -bottom-1 -right-1 w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 font-display animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default Loading;
