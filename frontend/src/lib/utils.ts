import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('/storage/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    return `${baseUrl}/api${url}`;
  }
  if (url.startsWith('tenant-')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    return `${baseUrl}/api/storage/${url}`;
  }
  return url;
}
