
import React from 'react';
import type { TranslationKey, Theme } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  currentPage: number;
  totalPages: number;
  translation: TranslationKey;
  setTranslation: (translation: TranslationKey) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const translations: { key: TranslationKey; label: string }[] = [
  { key: 'farsi_makarem', label: 'مکارم' },
  { key: 'english_arberry', label: 'Arberry' },
];

export const Header: React.FC<HeaderProps> = ({ currentPage, totalPages, translation, setTranslation, theme, setTheme }) => {
  return (
    <header className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-4 sm:p-6 mb-6 text-center border border-white/30 dark:border-slate-700/50">
      <div className="flex justify-between items-center mb-4">
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-sky-400 dark:to-fuchsia-400">
          یک صفحه روزانه از قرآن
        </h1>
        <div className="w-10"></div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        صفحه {currentPage} از {totalPages}
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {translations.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTranslation(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 transform
              ${translation === key
                ? 'bg-purple-600 text-white shadow-md scale-105'
                : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
};
