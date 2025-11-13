
import React, { useState } from 'react';
import type { Verse, TranslationKey } from '../types';
import { VerseActions } from './VerseActions';
import { AIInterpretation } from './AIInterpretation';

interface VerseListProps {
  verses: Verse[];
  translationKey: TranslationKey;
  readAyahs: Set<number>;
  onToggleAyahRead: (ayahId: number) => void;
}

export const VerseList: React.FC<VerseListProps> = ({ verses, translationKey, readAyahs, onToggleAyahRead }) => {
  const [activeAIInterpretation, setActiveAIInterpretation] = useState<number | null>(null);

  const handleToggleAI = (verseId: number) => {
    setActiveAIInterpretation(prev => (prev === verseId ? null : verseId));
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-4 sm:p-8 mb-6 border border-white/30 dark:border-slate-700/50">
      <div className="space-y-6">
        {verses.map((verse) => (
          <div key={verse.id} className="pb-3 pt-2 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            <p className="font-arabic text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 text-right mb-4" style={{ fontSize: '2.1rem', lineHeight: '3.8rem' }}>
              {verse.verse.ar}
              <span className="text-lg font-persian text-purple-600 dark:text-purple-400 mx-2">
                ({verse.ap})
              </span>
            </p>
            <p className="font-persian text-base sm:text-lg text-slate-600 dark:text-slate-300 text-right" style={{ lineHeight: '2rem' }}>
              {verse.verse[translationKey]}
            </p>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-2">
              <div className="flex items-center gap-2 flex-row sm:items-center">
                <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 text-right sm:text-left">
                  سوره {verse.surah.farsi} - آیه {verse.ap}
                </div>
                <button
                  onClick={() => onToggleAyahRead(verse.id)}
                  className={`mt-2 rounded-full transition-all duration-300 transform hover:scale-110 cursor-pointer
                    ${readAyahs.has(verse.id)
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  title={readAyahs.has(verse.id) ? 'خوانده شده' : 'خوانده نشده'}
                >
                  {readAyahs.has(verse.id) ? '✓' : '○'}
                </button>
              </div>
              <div className="flex flex-wrap justify-center w-full sm:w-auto text-center">
                <VerseActions verse={verse} onToggleAIInterpretation={() => handleToggleAI(verse.id)} />
              </div>
            </div>
            {activeAIInterpretation === verse.id && (
              <AIInterpretation verse={verse} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
