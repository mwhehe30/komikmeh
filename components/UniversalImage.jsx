'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const UniversalImage = ({
  src,
  alt,
  className,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  fallback,
  ...props
}) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const hasSrc = src && src.trim() !== '';

  if (!hasSrc || error) {
    return (
      <div
        className={`bg-zinc-800 flex items-center justify-center overflow-hidden ${className} ${
          fill ? 'w-full h-full' : ''
        }`}
        style={
          !fill
            ? {
                width,
                height: 'auto',
                maxWidth: '100%',
                aspectRatio:
                  width && height ? `${width} / ${height}` : undefined,
              }
            : {}
        }
      >
        {fallback || (
          <span className='text-zinc-600 text-xs font-medium'>No Image</span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || 'Image'}
      className={className}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
      {...props}
    />
  );
};

export default UniversalImage;
