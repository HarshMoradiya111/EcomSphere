export function getProductImageSrc(image?: string | null) {
  if (!image) {
    return '';
  }

  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
    return image;
  }

  return `/uploads/${image}`;
}

export function getProductImageFallbackSrc(image?: string | null) {
  if (!image) {
    return '';
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return '';
  }

  if (image.startsWith('/img/')) {
    return '';
  }

  return `/img/products/${image}`;
}