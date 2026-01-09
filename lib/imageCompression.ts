
/**
 * Processes an image file to ensure it meets strict storage requirements:
 * 1. Resizes/Crops to square aspect ratio (Center Crop).
 * 2. Target Dimensions: 380x380 (Optimized for <30KB).
 * 3. Format: WebP (Better compression).
 * 4. File Size Limit: < 30KB.
 */
export const processImage = async (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Step 1: Create Canvas
        let targetSize = 380; // Reduced from 512 to ensure quality at low file size
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context unavailable');

        // Step 2: Draw Image (Center Crop / Cover)
        // Calculate scaling to cover the square area
        const scale = Math.max(targetSize / img.width, targetSize / img.height);
        const x = (targetSize / 2) - (img.width / 2) * scale;
        const y = (targetSize / 2) - (img.height / 2) * scale;
        
        // Fill white background (for transparency issues)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetSize, targetSize);
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Step 3: Iterative Compression to fit < 30KB
        const MAX_SIZE_BYTES = 30 * 1024; // 30KB
        let quality = 0.92;
        let dataUrl = canvas.toDataURL('image/webp', quality);

        const checkSizeAndCompress = () => {
           // Approximate base64 size in bytes: (length * 3/4) - padding
           const sizeInBytes = dataUrl.length * (3/4);
           
           if (sizeInBytes > MAX_SIZE_BYTES) {
               if (quality > 0.1) {
                   // Reduce quality
                   quality -= 0.1;
                   dataUrl = canvas.toDataURL('image/webp', quality);
                   checkSizeAndCompress();
               } else {
                   // Quality is too low, resize canvas down as last resort
                   if (targetSize > 200) {
                       targetSize = 200;
                       const smallCanvas = document.createElement('canvas');
                       smallCanvas.width = targetSize;
                       smallCanvas.height = targetSize;
                       const smallCtx = smallCanvas.getContext('2d');
                       if (smallCtx) {
                           smallCtx.fillStyle = '#FFFFFF';
                           smallCtx.fillRect(0, 0, targetSize, targetSize);
                           smallCtx.drawImage(canvas, 0, 0, targetSize, targetSize);
                           
                           // Reset quality for smaller resolution
                           quality = 0.85;
                           dataUrl = smallCanvas.toDataURL('image/webp', quality);
                           checkSizeAndCompress();
                       } else {
                           resolve(dataUrl); // Return best effort
                       }
                   } else {
                       resolve(dataUrl); // Return best effort
                   }
               }
           } else {
               resolve(dataUrl);
           }
        };

        checkSizeAndCompress();
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
};
