import React from 'react';

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

/**
 * @deprecated This component is replaced by SmartCameraInput.tsx which handles image processing automatically.
 * This file is kept to maintain project structure but renders nothing.
 */
export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCrop, onCancel }) => {
  return null;
};
