import React, { useState } from 'react';
import { getOptimizedImageData } from '../utils/imageUtils';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  sizes?: string;
  maxWidth?: number;
  className?: string;
  pictureClassName?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  imgRef?: React.Ref<HTMLImageElement>;
  disableOriginalFallbackOnError?: boolean;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  sizes = '100vw',
  maxWidth = 1920,
  className,
  pictureClassName = 'contents',
  style,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  imgRef,
  disableOriginalFallbackOnError = false,
  onLoad,
  onError,
}) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const fallbackToOriginal = failedSrc === src;
  const data = getOptimizedImageData(src, maxWidth);

  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    if (data.isOptimized && !disableOriginalFallbackOnError && !fallbackToOriginal) {
      setFailedSrc(src);
      return;
    }
    onError?.(e);
  };

  if (!data.isOptimized || fallbackToOriginal) {
    return (
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={data.originalWidth}
        height={data.originalHeight}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        style={style}
        className={className}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  return (
    <picture className={pictureClassName}>
      {data.avifSrcSet && (
        <source type="image/avif" srcSet={data.avifSrcSet} sizes={sizes} />
      )}
      {data.webpSrcSet && (
        <source type="image/webp" srcSet={data.webpSrcSet} sizes={sizes} />
      )}
      <img
        ref={imgRef}
        src={data.fallbackSrc}
        alt={alt}
        width={data.intrinsicWidth}
        height={data.intrinsicHeight}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        style={style}
        className={className}
        onLoad={onLoad}
        onError={handleError}
      />
    </picture>
  );
};
