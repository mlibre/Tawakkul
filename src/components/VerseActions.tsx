import React from 'react';
import type { Verse } from '../types';

interface VerseActionsProps {
  verse: Verse;
  onToggleAIInterpretation: () => void;
}

export const VerseActions: React.FC<VerseActionsProps> = ({ verse, onToggleAIInterpretation }) => {
  const surahNumber = verse.surah.number;
  const ayahNumber = verse.ayah;

  // Surah name mapping for URLs (when website uses different Persian names)
  const SURAH_NAME_URL_MAP: Record<string, string> = {
  'سجده': 'سجدة',     // سجده -> سجدة (website uses سجدة with ت)
  'جاثیه': 'جاثیة',   // جاثیه -> جاثية (website uses جاثية with ی)
  'انشراح': 'شرح'     // انشراح -> شرح (website uses shorter form)
};

  // Function to get the correct URL version of surah name
  const getSurahNameForUrl = (surahName: string): string => {
    return SURAH_NAME_URL_MAP[surahName] || surahName;
  };

  const khameneiUrl = `https://farsi.khamenei.ir/newspart-index?sid=${surahNumber}&npt=7&aya=${ayahNumber}`;
  const tafsirNoorUrl = `https://quran.makarem.ir/fa/interpretation?sura=${surahNumber}&verse=${ayahNumber}`;
  const alMizanUrl = `https://quran.inoor.ir/fa/ayah/${surahNumber}/${ayahNumber}/commentary?book=121`;
  const shaanNozulUrl = `https://wiki.ahlolbait.com/آیه_${ayahNumber}_سوره_${getSurahNameForUrl(verse.surah.farsi)}`;

  return (
    <div className="mt-2 flex justify-end gap-2 items-center">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onToggleAIInterpretation();
        }}
        className="text-xs text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
      >
        تفسیر هوش
      </a>
      <span className="text-slate-300 dark:text-slate-600">|</span>
      <a href={khameneiUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
        فیش رهبری
      </a>
      <span className="text-slate-300 dark:text-slate-600">|</span>
      <a href={tafsirNoorUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
        تفسیر نمونه
      </a>
      <span className="text-slate-300 dark:text-slate-600">|</span>
      <a href={alMizanUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
        تفسیر المیزان
      </a>
      <span className="text-slate-300 dark:text-slate-600">|</span>
      <a href={shaanNozulUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
        شأن نزول
      </a>
    </div>
  );
};