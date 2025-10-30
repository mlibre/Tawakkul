import React from 'react';
import type { Verse } from '../types';

interface VerseActionsProps {
  verse: Verse;
}

export const VerseActions: React.FC<VerseActionsProps> = ({ verse }) => {
  const surahNumber = verse.surah.number;
  const ayahNumber = verse.ayah;
  const surahTitlePersian = verse.surah.farsi.replace(/ /g, '_');

  const khameneiUrl = `https://farsi.khamenei.ir/newspart-index?sid=${surahNumber}&npt=7&aya=${ayahNumber}`;
  const tafsirNoorUrl = `https://quran.makarem.ir/fa/interpretation?sura=${surahNumber}&verse=${ayahNumber}`;
  const shaanNozulUrl = `https://wiki.ahlolbait.com/آیه_${ayahNumber}_سوره_${surahTitlePersian}`;

  return (
    <div className="flex justify-end gap-2">
      <a href={khameneiUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
        فیش رهبری
      </a>
      <span className="text-slate-300 dark:text-slate-600">|</span>
      <a href={tafsirNoorUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
        تفسیر نمونه
      </a>
      <span className="text-slate-300 dark:text-slate-600">|</span>
      <a href={shaanNozulUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
        شأن نزول
      </a>
    </div>
  );
};