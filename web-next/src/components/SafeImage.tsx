'use client';

type SafeImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export default function SafeImage({
  src,
  fallbackSrc = '/img/placeholder.jpg',
  alt = '',
  ...props
}: SafeImageProps) {
  return (
    <img
      {...props}
      src={src}
      alt={alt}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = fallbackSrc;
      }}
    />
  );
}
