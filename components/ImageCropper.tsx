import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Minus, Plus, Move } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCrop, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPosition({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = document.createElement('canvas');
    const size = 300; // Final output size
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (ctx && imgRef.current) {
      const img = imgRef.current;
      const containerSize = 280; // The visual container size in pixels
      const scaleFactor = size / containerSize;

      // Fill white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      ctx.save();
      // Move to center
      ctx.translate(size / 2, size / 2);
      // Apply user translation (scaled up to canvas size)
      ctx.translate(position.x * scaleFactor, position.y * scaleFactor);
      
      // Calculate scale to match visual "fit-contain" start point
      const aspect = img.naturalWidth / img.naturalHeight;
      let renderWidth, renderHeight;
      
      if (aspect > 1) {
          renderWidth = containerSize;
          renderHeight = containerSize / aspect;
      } else {
          renderWidth = containerSize * aspect;
          renderHeight = containerSize;
      }

      // Apply zoom
      ctx.scale(zoom, zoom);

      // Draw image centered
      ctx.drawImage(
        img, 
        -renderWidth / 2 * scaleFactor, 
        -renderHeight / 2 * scaleFactor, 
        renderWidth * scaleFactor, 
        renderHeight * scaleFactor
      );
      
      ctx.restore();
      
      onCrop(canvas.toDataURL('image/jpeg', 0.9));
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm">
        <div className="flex justify-between items-center mb-6 text-white">
          <h3 className="text-lg font-bold">Adjust Photo</h3>
          <button onClick={onCancel} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-[280px] h-[280px] mx-auto bg-slate-900 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl mb-6 cursor-move touch-none">
          {/* Grid Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none opacity-30">
            <div className="w-full h-1/3 border-b border-white"></div>
            <div className="w-full h-1/3 border-b border-white top-1/3 absolute"></div>
            <div className="h-full w-1/3 border-r border-white absolute top-0 left-0"></div>
            <div className="h-full w-1/3 border-r border-white absolute top-0 left-1/3"></div>
          </div>
          
          <div 
             className="w-full h-full flex items-center justify-center"
             onMouseDown={handleMouseDown}
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
             onTouchStart={handleMouseDown}
             onTouchMove={handleMouseMove}
             onTouchEnd={handleMouseUp}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop"
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                maxWidth: '100%',
                maxHeight: '100%',
                transition: isDragging ? 'none' : 'transform 0.1s'
              }}
            />
          </div>
        </div>

        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
           <div className="flex items-center gap-4 mb-2">
              <Minus className="w-4 h-4 text-white/70" />
              <input 
                type="range" 
                min="1" 
                max="3" 
                step="0.05" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
              <Plus className="w-4 h-4 text-white/70" />
           </div>
           <p className="text-center text-xs text-white/50 flex items-center justify-center gap-1">
             <Move className="w-3 h-3" /> Drag to position
           </p>
        </div>

        <button
          onClick={handleCrop}
          className="w-full mt-6 bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
        >
          <Check className="w-5 h-5" />
          Save Photo
        </button>
      </div>
    </div>
  );
};