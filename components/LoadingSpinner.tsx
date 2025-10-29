
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
      <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 dark:border-purple-700 dark:border-t-purple-400 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold">در حال بارگذاری اطلاعات قرآن...</p>
    </div>
  );
};
