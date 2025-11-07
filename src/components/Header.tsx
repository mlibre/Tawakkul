
import React from 'react';
import type { Theme, PageData } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  pageData: PageData | null;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const Header: React.FC<HeaderProps> = ({ pageData, theme, setTheme }) => {
  const surahName = pageData?.verses[0]?.surah.farsi || '...';
  const juz = pageData?.meta?.juz?.[0] || '...';

  return (
    <header className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-4 sm:p-6 mb-6 text-center border border-white/30 dark:border-slate-700/50">
      <div className="flex justify-between items-center mb-4">
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-sky-400 dark:to-fuchsia-400">
          یک صفحه روزانه از قرآن
        </h1>
        <div className="w-10"></div>
      </div>
      <div className="flex justify-around items-center text-sm text-slate-600 dark:text-slate-400">
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
        <span>سوره: {surahName}</span>
        <span>جزء: {juz}</span>
      </div>
    </header>
  );
};
