import React, { useRef, useEffect, useState } from 'react';

interface TransparentLogoProps {
  src: string;
  alt: string;
  className?: string;
  tolerance?: number; // 0-255, how close to black to remove
}

export const TransparentLogo: React.FC<TransparentLogoProps> = ({ src, alt, className = '', tolerance = 15 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = useState<string>('');

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Make black and near-black pixels transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate perceived brightness or just use strict threshold
        if (r <= tolerance && g <= tolerance && b <= tolerance) {
          // You could do a smooth alpha gradient based on how close to black it is,
          // but a strict cut-off with a low tolerance usually works for completely black backgrounds.
          data[i + 3] = 0; // Set alpha to 0
        } else if (r < tolerance * 2 && g < tolerance * 2 && b < tolerance * 2) {
           // Basic anti-aliasing for edges
           const maxVal = Math.max(r, g, b);
           data[i + 3] = Math.max(0, Math.min(255, (maxVal / (tolerance * 2)) * 255));
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setImgUrl(canvas.toDataURL('image/png'));
    };
    img.src = src;
  }, [src, tolerance]);

  // Keep a hidden canvas to process the image, but display via standard img tag for responsiveness 
  // and better integration with Tailwind classes.
  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {imgUrl ? (
        <img src={imgUrl} alt={alt} className={className} />
      ) : (
         /* Fallback while processing */
         <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded ${className}`} />
      )}
    </>
  );
};
