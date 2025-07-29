import React from 'react';

export function Progress({ value, className = '', barColor = 'bg-blue-600' }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 ${className}`}>
      <div 
        className={`${barColor} h-2.5 rounded-full`} 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}
