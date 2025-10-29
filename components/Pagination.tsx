
import React from 'react';
import { ChevronRight, ChevronLeft, Check, X } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  isPageRead: boolean;
  onToggleRead: () => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, isPageRead, onToggleRead }) => {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-2 border border-white/30 dark:border-slate-700/50">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
        <span>قبلی</span>
      </button>
      
      <button
        onClick={onToggleRead}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 shadow-md transform hover:scale-105
          ${isPageRead
            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
            : 'bg-gradient-to-r from-slate-400 to-slate-500'
          }`}
      >
        {isPageRead ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
        <span>{isPageRead ? 'خوانده شد' : 'خوانده نشده'}</span>
      </button>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span>بعدی</span>
        <ChevronLeft className="w-5 h-5" />
      </button>
    </div>
  );
};
