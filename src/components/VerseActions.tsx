import React, { useState } from 'react';
import type { Verse } from '../types';
import { AIInterpretationModal } from './AIInterpretationModal';

interface VerseActionsProps {
  verse: Verse;
}

export const VerseActions: React.FC<VerseActionsProps> = ({ verse }) => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const surahNumber = verse.surah.number;
  const ayahNumber = verse.ayah;
  const surahTitlePersian = verse.surah.farsi.replace(/ /g, '_');

  const khameneiUrl = `https://farsi.khamenei.ir/newspart-index?sid=${surahNumber}&npt=7&aya=${ayahNumber}`;
  const tafsirNoorUrl = `https://quran.makarem.ir/fa/interpretation?sura=${surahNumber}&verse=${ayahNumber}`;
  const alMizanUrl = `https://quran.inoor.ir/fa/ayah/${surahNumber}/${ayahNumber}/commentary?book=121`;
  const shaanNozulUrl = `https://wiki.ahlolbait.com/آیه_${ayahNumber}_سوره_${surahTitlePersian}`;

  return (
    <>
      <div className="mt-2 flex justify-end gap-2 items-center">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsAIModalOpen(true);
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
      <AIInterpretationModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        verseText={verse.verse.arabic_enhanced}
        surahNumber={surahNumber}
        ayahNumber={ayahNumber}
      />
    </>
  );
};