import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getOptimizedImageData,
  getClosestLocalVariantCandidates,
  markVariantFailed,
  getCachedResolvedSource,
  setCachedResolvedSource,
} from '../utils/imageUtils';

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
  secondaryFallbackSrc?: string;
  disableOriginalFallbackOnError?: boolean;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  onResolvedSrc?: (resolvedSrc: string) => void;
}

type FallbackStage =
  | 'cached'
  | 'picture'
  | 'webp'
  | 'local-closest'
  | 'original'
  | 'secondary'
  | 'exhausted';

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
  } else {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
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
  secondaryFallbackSrc,
  disableOriginalFallbackOnError = false,
  onLoad,
  onError,
  onResolvedSrc,
}) => {
  const data = getOptimizedImageData(src, maxWidth);
  const sourceKey = `${src}|${maxWidth}|${secondaryFallbackSrc || ''}`;
  const cachedResolvedUrl = getCachedResolvedSource(sourceKey);

  const initialStage: FallbackStage = cachedResolvedUrl
    ? 'cached'
    : !data.isOptimized
      ? 'original'
      : data.avifSrcSet
        ? 'picture'
        : 'webp';

  const [stageState, setStageState] = useState<{
    key: string;
    stage: FallbackStage;
    localCandidates: string[];
    localIndex: number;
  }>({
    key: sourceKey,
    stage: initialStage,
    localCandidates: [],
    localIndex: 0,
  });

  const activeStage: FallbackStage =
    stageState.key === sourceKey ? stageState.stage : initialStage;
  const activeLocalCandidates =
    stageState.key === sourceKey ? stageState.localCandidates : [];
  const activeLocalIndex =
    stageState.key === sourceKey ? stageState.localIndex : 0;

  const localImgRef = useRef<HTMLImageElement | null>(null);

  const setComposedRef = useCallback(
    (node: HTMLImageElement | null) => {
      localImgRef.current = node;
      assignRef(imgRef, node);
    },
    [imgRef]
  );

  useEffect(() => {
    const node = localImgRef.current;
    if (node && node.complete && node.naturalWidth > 0) {
      const resolved = node.currentSrc || node.src;
      if (resolved) {
        setCachedResolvedSource(sourceKey, resolved);
        onResolvedSrc?.(resolved);
      }
    }
  }, [sourceKey, activeStage, activeLocalIndex, onResolvedSrc]);

  const handleLoad: React.ReactEventHandler<HTMLImageElement> = (e) => {
    const resolved = e.currentTarget.currentSrc || e.currentTarget.src || src;
    setCachedResolvedSource(sourceKey, resolved);
    onResolvedSrc?.(resolved);
    onLoad?.(e);
  };

  const canUseSecondary = Boolean(secondaryFallbackSrc && secondaryFallbackSrc !== src);

  const moveToLocalClosestOrOriginal = () => {
    if (data.entry) {
      const targetDisplayW = Math.min(maxWidth, data.widths[data.widths.length - 1] || maxWidth);
      const candidates = getClosestLocalVariantCandidates(data.entry, targetDisplayW);
      if (candidates.length > 0) {
        setStageState({
          key: sourceKey,
          stage: 'local-closest',
          localCandidates: candidates,
          localIndex: 0,
        });
        return;
      }
    }
    if (!disableOriginalFallbackOnError) {
      setStageState({
        key: sourceKey,
        stage: 'original',
        localCandidates: [],
        localIndex: 0,
      });
      return;
    }
    setStageState({
      key: sourceKey,
      stage: 'exhausted',
      localCandidates: [],
      localIndex: 0,
    });
  };

  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    const currentFailedUrl = e.currentTarget.currentSrc || e.currentTarget.src || '';
    const lowerFailed = currentFailedUrl.toLowerCase();

    if (currentFailedUrl && currentFailedUrl !== src) {
      markVariantFailed(currentFailedUrl);
    }

    if (activeStage === 'cached') {
      const nextStage: FallbackStage = !data.isOptimized
        ? 'original'
        : data.avifSrcSet
          ? 'picture'
          : 'webp';
      setStageState({
        key: sourceKey,
        stage: nextStage,
        localCandidates: [],
        localIndex: 0,
      });
      return;
    }

    if (activeStage === 'picture') {
      const failedWasWebp = lowerFailed.includes('.webp');
      if (!failedWasWebp && (data.webpSrcSet || data.preferredWebpUrl)) {
        setStageState({
          key: sourceKey,
          stage: 'webp',
          localCandidates: [],
          localIndex: 0,
        });
        return;
      }
      moveToLocalClosestOrOriginal();
      return;
    }

    if (activeStage === 'webp') {
      moveToLocalClosestOrOriginal();
      return;
    }

    if (activeStage === 'local-closest') {
      const nextIdx = activeLocalIndex + 1;
      if (nextIdx < activeLocalCandidates.length) {
        setStageState({
          key: sourceKey,
          stage: 'local-closest',
          localCandidates: activeLocalCandidates,
          localIndex: nextIdx,
        });
        return;
      }
      if (!disableOriginalFallbackOnError) {
        setStageState({
          key: sourceKey,
          stage: 'original',
          localCandidates: [],
          localIndex: 0,
        });
        return;
      }
    } else if (activeStage === 'original') {
      if (canUseSecondary) {
        setStageState({
          key: sourceKey,
          stage: 'secondary',
          localCandidates: [],
          localIndex: 0,
        });
        return;
      }
    }

    setStageState({
      key: sourceKey,
      stage: 'exhausted',
      localCandidates: [],
      localIndex: 0,
    });
    onError?.(e);
  };

  if (activeStage === 'cached' && cachedResolvedUrl) {
    return (
      <img
        key={`${sourceKey}-cached`}
        ref={setComposedRef}
        src={cachedResolvedUrl}
        alt={alt}
        width={data.intrinsicWidth || data.originalWidth}
        height={data.intrinsicHeight || data.originalHeight}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        style={style}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  if (activeStage === 'local-closest' && activeLocalCandidates[activeLocalIndex]) {
    return (
      <img
        key={`${sourceKey}-local-${activeLocalIndex}`}
        ref={setComposedRef}
        src={activeLocalCandidates[activeLocalIndex]}
        alt={alt}
        width={data.intrinsicWidth || data.originalWidth}
        height={data.intrinsicHeight || data.originalHeight}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        style={style}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  if (activeStage === 'secondary' && secondaryFallbackSrc) {
    const secondaryData = getOptimizedImageData(secondaryFallbackSrc, maxWidth);
    const secondaryImgSrc = secondaryData.isOptimized
      ? secondaryData.fallbackSrc
      : secondaryFallbackSrc;
    return (
      <img
        key={`${sourceKey}-secondary`}
        ref={setComposedRef}
        src={secondaryImgSrc}
        alt={alt}
        width={secondaryData.intrinsicWidth || secondaryData.originalWidth}
        height={secondaryData.intrinsicHeight || secondaryData.originalHeight}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        style={style}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  if (!data.isOptimized || activeStage === 'original' || activeStage === 'exhausted') {
    return (
      <img
        key={`${sourceKey}-original`}
        ref={setComposedRef}
        src={src}
        alt={alt}
        width={data.originalWidth}
        height={data.originalHeight}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        style={style}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  if (activeStage === 'webp') {
    return (
      <img
        key={`${sourceKey}-webp`}
        ref={setComposedRef}
        src={data.preferredWebpUrl || data.fallbackSrc}
        srcSet={data.webpSrcSet || undefined}
        sizes={sizes}
        alt={alt}
        width={data.intrinsicWidth}
        height={data.intrinsicHeight}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        style={style}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  return (
    <picture key={`${sourceKey}-picture`} className={pictureClassName}>
      {data.avifSrcSet && (
        <source type="image/avif" srcSet={data.avifSrcSet} sizes={sizes} />
      )}
      {data.webpSrcSet && (
        <source type="image/webp" srcSet={data.webpSrcSet} sizes={sizes} />
      )}
      <img
        ref={setComposedRef}
        src={data.fallbackSrc}
        alt={alt}
        width={data.intrinsicWidth}
        height={data.intrinsicHeight}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        style={style}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
      />
    </picture>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
