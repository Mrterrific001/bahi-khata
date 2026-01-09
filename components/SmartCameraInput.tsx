
import React, { useRef, useState, useEffect } from 'react';
import { Image as ImageIcon, X, RefreshCw, Loader2, User, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { processImage } from '../lib/imageCompression';

interface SmartCameraInputProps {
  onCapture: (base64Image: string) => void;
  currentImage?: string | null;
  label?: string;
  circular?: boolean;
}

export const SmartCameraInput: React.FC<SmartCameraInputProps> = ({ 
  onCapture, 
  currentImage, 
  label = "Photo",
  circular = false
}) => {
  // --- STATE ---
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Crop Interaction State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [aspect, setAspect] = useState(1);
  
  // Refs for logic
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStart = useRef<{ x: number, y: number } | null>(null);

  // Cleanup memory when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  // --- HANDLERS ---

  const handleClick = () => {
    // Direct Gallery Access as requested
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsCropperOpen(true);
    }
    e.target.value = '';
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setAspect(naturalWidth / naturalHeight);
  };

  // --- TOUCH / DRAG LOGIC ---

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStart.current) {
      e.preventDefault();
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handlePointerUp = () => {
    dragStart.current = null;
  };

  // --- SAVE & COMPRESS LOGIC ---

  const handleDone = async () => {
    if (!imageRef.current) return;

    try {
      setIsProcessing(true);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const OUTPUT_SIZE = 600;
      const VISUAL_SIZE = 280; // Must match CSS width/height logic below

      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;

      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

        ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
        ctx.scale(zoom, zoom);
        
        const ratio = OUTPUT_SIZE / VISUAL_SIZE;
        ctx.translate(pan.x * ratio, pan.y * ratio);

        const img = imageRef.current;
        
        // Match logic with visual rendering to ensure What You See Is What You Get
        let drawW, drawH;
        if (aspect > 1) {
            // Landscape: Visual height was 280, width was auto (280 * aspect)
            // So Output height is 600, width is 600 * aspect
            drawH = OUTPUT_SIZE;
            drawW = OUTPUT_SIZE * aspect;
        } else {
            // Portrait: Visual width was 280, height was auto (280 / aspect)
            // So Output width is 600, height is 600 / aspect
            drawW = OUTPUT_SIZE;
            drawH = OUTPUT_SIZE / aspect;
        }

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

        canvas.toBlob(async (blob) => {
           if (blob) {
             const compressed = await processImage(blob);
             onCapture(compressed);
             setIsCropperOpen(false);
             setIsProcessing(false);
           }
        }, 'image/jpeg', 0.95);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process image");
      setIsProcessing(false);
    }
  };

  // --- RENDER ---

  const isLandscape = aspect > 1;

  return (
    <>
      {/* TRIGGER BUTTON */}
      <div className="flex justify-center">
        <div 
          onClick={handleClick}
          className={`
            relative cursor-pointer group flex flex-col items-center justify-center overflow-hidden transition-all select-none
            ${circular ? 'w-32 h-32 rounded-full shadow-lg' : 'w-24 h-24 rounded-2xl shadow-sm'}
            ${currentImage ? 'bg-white' : 'bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-slate-100'}
          `}
        >
          {currentImage ? (
            <>
              <img src={currentImage} alt="Profile" className="w-full h-full object-cover" />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                   <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              {!isProcessing && (
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <RefreshCw className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400">
               {isProcessing ? <Loader2 className="w-8 h-8 animate-spin text-indigo-500" /> : (
                 circular ? <User className="w-12 h-12 opacity-50" /> : <ImageIcon className="w-8 h-8 mb-1" />
               )}
               {!circular && <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>}
            </div>
          )}
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* FULL SCREEN CROPPER */}
      {isCropperOpen && imageSrc && (
        <div className="fixed inset-0 z-[400] bg-black flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-md absolute top-0 left-0 right-0 z-20 text-white">
                <span className="font-bold text-lg">Adjust Photo</span>
                <button type="button" onClick={() => setIsCropperOpen(false)} className="p-2 bg-white/10 rounded-full">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Cropping Area */}
            <div 
                className="flex-1 relative overflow-hidden flex items-center justify-center bg-black touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                {/* THE IMAGE */}
                <div 
                   style={{
                       transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                       transition: 'transform 0.05s linear',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       width: '280px',
                       height: '280px' // Container for centering
                   }}
                >
                    <img 
                        ref={imageRef}
                        src={imageSrc} 
                        onLoad={onImageLoad}
                        alt="Crop Target"
                        draggable={false}
                        className="pointer-events-none select-none max-w-none"
                        style={{
                            // Ensure the smaller dimension matches the crop box exactly
                            height: isLandscape ? '280px' : 'auto',
                            width: isLandscape ? 'auto' : '280px'
                        }}
                    />
                </div>

                {/* THE MASK */}
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                    {/* The transparent hole with huge shadow */}
                    <div 
                        className={`
                            w-[280px] h-[280px] border-2 border-white/50 
                            shadow-[0_0_0_9999px_rgba(0,0,0,0.85)]
                            ${circular ? 'rounded-full' : 'rounded-2xl'}
                            relative overflow-hidden
                        `}
                    >
                        {/* Grid Lines */}
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30"></div>
                        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30"></div>
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30"></div>
                        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30"></div>
                    </div>
                </div>

                <div className="absolute bottom-6 left-0 right-0 text-center z-20 pointer-events-none">
                     <span className="text-white/70 text-xs bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                        Drag to Move • Pinch to Zoom
                     </span>
                </div>
            </div>

            {/* Footer Controls */}
            <div className="bg-zinc-900 p-6 pb-safe z-20 flex flex-col gap-6">
                 <div className="flex items-center gap-4 text-slate-400">
                     <ZoomOut className="w-5 h-5" />
                     <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.01" 
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                     />
                     <ZoomIn className="w-5 h-5" />
                 </div>

                 <button 
                    type="button"
                    onClick={handleDone}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                     <Check className="w-5 h-5" />
                     Save Photo
                 </button>
            </div>
        </div>
      )}
    </>
  );
};
