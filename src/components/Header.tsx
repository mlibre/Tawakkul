import React, { useState, useMemo, useEffect } from 'react';
import type { Theme, PageData } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { getAllSurahs } from '../services/quranService';

interface HeaderProps {
  pageData: PageData | null;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onPageChange: (page: number) => void;
}

export const Header: React.FC<HeaderProps> = ({ pageData, theme, setTheme, onPageChange }) => {
  const surahName = pageData?.verses[0]?.surah.farsi || '...';
  const juz = pageData?.meta?.juz?.[0] || '...';
  const currentPage = pageData?.page || 1;
  
  const [isSurahDropdownOpen, setIsSurahDropdownOpen] = useState(false);
  const [isPageInputVisible, setIsPageInputVisible] = useState(false);
  
  const allSurahs = useMemo(() => getAllSurahs(), []);

  // Sync page input with current page
  const [pageInput, setPageInput] = useState(currentPage.toString());
  
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handleSurahSelect = (page: number) => {
    onPageChange(page);
    setIsSurahDropdownOpen(false);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageInput(value);
    
    const pageNumber = parseInt(value);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= 604) {
      onPageChange(pageNumber);
    }
  };

  return (
    <div className="relative" style={{ zIndex: 5000 }}>
      <header className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-4 sm:p-6 mb-6 text-center border border-white/30 dark:border-slate-700/50 relative">
        <div className="flex justify-between items-center mb-4">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-sky-400 dark:to-fuchsia-400">
            یک صفحه روزانه از قرآن
          </h1>
          <div className="w-10"></div>
        </div>
        <div className="flex justify-around items-center text-sm text-slate-600 dark:text-slate-400 flex-wrap gap-2">
          <span>
            ترجمه: <a
              href="https://quran.makarem.ir"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 underline"
            >
              مکارم
            </a>
          </span>
          
          {/* Surah Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSurahDropdownOpen(!isSurahDropdownOpen)}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 underline cursor-pointer"
            >
              سوره: {surahName}
            </button>
            {isSurahDropdownOpen && (
              <div
                className="fixed inset-0 bg-transparent"
                style={{ zIndex: 6000 }}
                onClick={() => setIsSurahDropdownOpen(false)}
              />
            )}
            {isSurahDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto min-w-48"
                style={{ zIndex: 7000 }}
              >
                {allSurahs.map((surah) => (
                  <button
                    key={surah.number}
                    onClick={() => handleSurahSelect(surah.firstPage)}
                    className="block w-full text-right px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-200"
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ص {surah.firstPage}
                    </span>
                    {surah.farsi}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Page Input Toggle - Fixed size to prevent layout shift */}
          <div className="w-20 flex items-center justify-center min-h-[1.25rem]">
            {!isPageInputVisible ? (
              <button
                onClick={() => setIsPageInputVisible(true)}
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 underline cursor-pointer"
              >
                صفحه: {currentPage}
              </button>
            ) : (
              <div className="flex items-center gap-0">
                <span className="text-xs text-slate-600 dark:text-slate-400">صفحه:</span>
                <input
                  id="page-input"
                  type="number"
                  min="1"
                  max="604"
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onBlur={() => {
                    if (parseInt(pageInput) === currentPage) {
                      setIsPageInputVisible(false);
                    }
                  }}
                  className="w-8 px-0 py-0 text-xs border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="1"
                  autoFocus
                />
              </div>
            )}
          </div>

          <span>جزء: {juz}</span>
        </div>
      </header>
    </div>
  );
};
