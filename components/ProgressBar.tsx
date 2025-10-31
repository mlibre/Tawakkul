
import React from 'react';

interface ProgressBarProps {
  readCount: number;
  totalCount: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ readCount, totalCount }) => {
  const percentage = totalCount > 0 ? (readCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-white/30 dark:border-slate-700/50 md:w-20 w-full flex md:flex-col flex-row items-center md:gap-0 gap-4">
      <div className="md:text-center text-sm text-slate-600 dark:text-slate-300 md:mb-2">
        پیشرفت مطالعه
      </div>
      <div className="md:text-center text-xs text-slate-500 dark:text-slate-400 md:mb-4">
        {readCount} از {totalCount}
      </div>
      <div className="relative md:h-64 md:w-4 h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`absolute bg-gradient-to-r md:bg-gradient-to-b from-blue-500 to-purple-600 md:w-4 w-full md:h-auto h-4 md:rounded-t-full rounded-l-full transition-all duration-500`}
          style={{ width: window.innerWidth < 768 ? `${percentage}%` : '100%', height: window.innerWidth < 768 ? '100%' : `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
