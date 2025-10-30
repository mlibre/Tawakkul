
import React from 'react';

interface ProgressBarProps {
  readCount: number;
  totalCount: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ readCount, totalCount }) => {
  const percentage = totalCount > 0 ? (readCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-white/30 dark:border-slate-700/50 w-20 flex flex-col items-center">
      <div className="text-center text-sm text-slate-600 dark:text-slate-300 mb-2">
        پیشرفت مطالعه
      </div>
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 mb-4">
        {readCount} از {totalCount}
      </div>
      <div className="relative h-64 w-4 bg-slate-200 dark:bg-slate-700 rounded-full">
        <div
          className="absolute bottom-0 bg-gradient-to-t from-blue-500 to-purple-600 w-4 rounded-full transition-all duration-500"
          style={{ height: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
