import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('/storage/')) {
    return `/api${url}`;
  }
  if (url.startsWith('tenant-')) {
    return `/api/storage/${url}`;
  }
  return url;
}
