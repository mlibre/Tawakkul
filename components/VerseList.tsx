
import React from 'react';
import type { Verse, TranslationKey } from '../types';
import { VerseActions } from './VerseActions';

interface VerseListProps {
  verses: Verse[];
  translationKey: TranslationKey;
}

export const VerseList: React.FC<VerseListProps> = ({ verses, translationKey }) => {
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-4 sm:p-8 mb-6 border border-white/30 dark:border-slate-700/50">
      <div className="space-y-6">
        {verses.map((verse) => (
          <div key={verse.id} className="pb-4 pt-2 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            <p className="font-arabic text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 text-right mb-4" style={{ fontSize: '2.1rem', lineHeight: 'inherit' }}>
              {verse.verse.arabic_enhanced}
              <span className="text-lg font-persian text-purple-600 dark:text-purple-400 mx-2">
                ({verse.ayah_persian})
              </span>
            </p>
            <p className="font-persian text-base sm:text-lg text-slate-600 dark:text-slate-300 text-right leading-loose">
              {verse.verse[translationKey]}
            </p>
            <div className="flex justify-between items-center mt-4">
              <div className="text-xs text-slate-400 dark:text-slate-500 text-right">
                سوره {verse.surah.farsi} - آیه {verse.ayah_persian}
              </div>
              <VerseActions verse={verse} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
