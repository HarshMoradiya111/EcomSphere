'use client';

import { useEffect, useMemo, useState } from 'react';
import { getProductImageFallbackSrc } from '@/utils/imagePaths';

type SafeImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
  showPlaceholder?: boolean;
};

function uniqueSources(values: Array<string | undefined | null>) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const candidate = value?.trim();
    if (!candidate || seen.has(candidate)) return;
    seen.add(candidate);
    result.push(candidate);
  });

  return result;
}

export default function SafeImage({
  src,
  fallbackSrc,
  alt = '',
  showPlaceholder = false,
  ...props
}: SafeImageProps) {
  const source = typeof src === 'string' && src.trim() ? src.trim() : '';

  const placeholderImage = showPlaceholder ? '/img/placeholder.jpg' : '';

  const candidates = useMemo(() => {
    const fileName = source.split('/').pop() || '';
    const alternateSources = fileName && source
      ? [
          source,
          source.includes('/uploads/') ? `/img/products/${fileName}` : undefined,
          source.includes('/img/products/') ? `/uploads/${fileName}` : undefined,
          source.startsWith('/uploads/') ? `/img/products/${fileName}` : `/uploads/${fileName}`,
          fallbackSrc,
          getProductImageFallbackSrc(source),
          placeholderImage || '/img/placeholder.jpg',
        ]
      : [source, fallbackSrc, getProductImageFallbackSrc(source), placeholderImage || '/img/placeholder.jpg'].filter(Boolean);

    return uniqueSources(alternateSources).filter(Boolean);
  }, [fallbackSrc, source, placeholderImage]);

  const [displaySrc, setDisplaySrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveImage() {
      for (const candidate of candidates) {
        const isPlaceholder = candidate === placeholderImage && placeholderImage !== '';

        const canLoad = await new Promise<boolean>((resolve) => {
          if (isPlaceholder) {
            resolve(true);
            return;
          }

          const image = new Image();
          image.onload = () => resolve(true);
          image.onerror = () => resolve(false);
          image.src = candidate;
        });

        if (cancelled) return;

        if (canLoad) {
          setDisplaySrc(candidate);
          return;
        }
      }

      if (!cancelled) {
        setDisplaySrc(null);
      }
    }

    void resolveImage();

    return () => {
      cancelled = true;
    };
  }, [candidates]);

  return (
    <img
      {...props}
      src={displaySrc || undefined}
      alt={alt}
      loading="eager"
      style={{ backgroundColor: '#f7f7f7', ...props.style }}
    />
  );
}
