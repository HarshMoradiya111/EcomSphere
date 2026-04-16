import { API_URL } from '@/config';

/**
 * Robust image URL resolution engine for EcomSphere.
 * Handles:
 * 1. Missing images (returns placeholder)
 * 2. Absolute URLs (returns as is)
 * 3. Array of images (picks first)
 * 4. Path-prefixed local images (e.g. /img/blog/x.jpg)
 * 5. Raw filenames from uploads (prepends /uploads/)
 */
export function getImageUrl(image: any): string {
  if (!image) return `${API_URL}/img/placeholder.jpg`;
  
  // Support both single string and array structures (prevalent in AI cataloging)
  const imgStr = Array.isArray(image) ? image[0] : image;
  
  if (typeof imgStr !== 'string' || !imgStr.trim()) {
    return `${API_URL}/img/placeholder.jpg`;
  }

  // 1. Return absolute URLs as is
  if (imgStr.startsWith('http')) {
    return imgStr;
  }
  
  // 2. If it already contains a directory separator, assume it's a qualified relative path
  if (imgStr.includes('/')) {
    return `${API_URL}${imgStr.startsWith('/') ? '' : '/'}${imgStr}`;
  }
  
  // 3. Default fallback: All raw filenames map to the primary uploads directory
  return `${API_URL}/uploads/${imgStr}`;
}

// Legacy helpers for existing components
export function getProductImageSrc(image?: string | null) {
  return getImageUrl(image);
}

export function getProductImageFallbackSrc(image?: string | null) {
  if (!image || typeof image !== 'string') return '';
  if (image.startsWith('http') || image.startsWith('/img/')) return '';
  return `${API_URL}/img/products/${image}`;
}