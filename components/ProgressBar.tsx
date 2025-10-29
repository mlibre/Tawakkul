
import React from 'react';

interface ProgressBarProps {
  readCount: number;
  totalCount: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ readCount, totalCount }) => {
  const percentage = totalCount > 0 ? (readCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-white/30 dark:border-slate-700/50">
      <div className="flex justify-between items-center mb-1 text-sm text-slate-600 dark:text-slate-300">
        <span>پیشرفت مطالعه</span>
        <span>{readCount} از {totalCount}</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
