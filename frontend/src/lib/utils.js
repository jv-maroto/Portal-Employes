// src/lib/utils.js

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Función que combina clases usando clsx y twMerge
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
