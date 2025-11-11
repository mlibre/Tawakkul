import React from 'react';

interface LoadingProgressBarProps {
  progress: number;
}

export const LoadingProgressBar: React.FC<LoadingProgressBarProps> = ({ progress }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
      <div
        className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};