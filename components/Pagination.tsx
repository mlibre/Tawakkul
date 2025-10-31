
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
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-4 mb-6 md:mb-6 mb-0 flex md:flex-col flex-row items-center gap-4 border border-white/30 dark:border-slate-700/50">
      <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 text-center whitespace-nowrap">
        صفحه {currentPage}
      </div>
      <div className="flex md:flex-col flex-row items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-3 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 shadow-md"
          title="قبلی"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <button
          onClick={onToggleRead}
          className={`p-3 rounded-full font-semibold text-white transition-all duration-300 shadow-md transform hover:scale-110
            ${isPageRead
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-slate-400 to-slate-500'
            }`}
          title={isPageRead ? 'خوانده شده' : 'خوانده نشده'}
        >
          {isPageRead ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-3 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 shadow-md"
          title="بعدی"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
