import React from 'react';

export function Avatar({ children, className = '' }) {
  return (
    <div className={`relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 ${className}`}>
      {children}
    </div>
  );
}

