import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  rounded?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', width = '100%', height = 16, rounded = 'rounded-md' }) => (
  <div
    className={`animate-pulse bg-muted ${rounded} ${className}`}
    style={{ width, height }}
  />
); 