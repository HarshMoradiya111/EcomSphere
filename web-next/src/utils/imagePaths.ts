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

  // 2. If it's a specific local image starting with /img/ or /uploads/, return with API_URL
  if (imgStr.startsWith('/img/') || imgStr.startsWith('/uploads/')) {
    return `${API_URL}${imgStr}`;
  }
  
  // 3. If it contains a directory separator but doesn't start with /, prepend it
  if (imgStr.includes('/')) {
    return `${API_URL}/${imgStr}`;
  }
  
  // 4. Heuristic: If it looks like a filename, it could be in /img/products/ (legacy) or /uploads/ (new)
  // We'll try /uploads/ as default but allow the browser to fallback via onError in components
  return `${API_URL}/uploads/${imgStr}`;
}

// Legacy helpers for existing components
export function getProductImageSrc(image?: string | null) {
  return getImageUrl(image);
}

export function getProductImageFallbackSrc(image?: string | null) {
  if (!image || typeof image !== 'string') return `${API_URL}/img/placeholder.jpg`;
  if (image.startsWith('http')) return image;
  if (image.startsWith('/img/')) return `${API_URL}${image}`;
  return `${API_URL}/img/products/${image}`;
}

