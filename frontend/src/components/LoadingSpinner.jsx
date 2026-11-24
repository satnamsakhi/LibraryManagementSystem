import React from 'react';

const LoadingSpinner = ({ size = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    default: 'w-9 h-9 border-[3px]',
    large: 'w-14 h-14 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3.5">
      <div className="relative">
        <div
          className={`rounded-full border-blue-200 dark:border-blue-900/60 border-t-blue-600 dark:border-t-blue-500 animate-spin ${
            sizeClasses[size] || sizeClasses.default
          }`}
        />
        <div
          className={`absolute inset-0 rounded-full border-teal-400/20 border-b-teal-400 animate-spin animate-reverse ${
            sizeClasses[size] || sizeClasses.default
          }`}
          style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}
        />
      </div>
      {text && (
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;