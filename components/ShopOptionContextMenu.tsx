import React from 'react';
import { Pin, X, Wallet } from 'lucide-react';

interface ShopOptionContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
}

export const ShopOptionContextMenu: React.FC<ShopOptionContextMenuProps> = ({ 
  isOpen, 
  onClose, 
  isPinned, 
  onTogglePin
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 bg-white rounded-2xl shadow-2xl p-2 animate-in zoom-in-95 duration-200">
         <div className="px-4 py-3 border-b border-slate-100 mb-1 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-pink-500" />
                Due Book Options
            </h3>
            <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
         </div>
         <div className="space-y-1">
            <button 
               onClick={() => { onTogglePin(); onClose(); }}
               className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
            >
               <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPinned ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
               </div>
               <span className="font-medium text-slate-700">{isPinned ? 'Unpin Duebook' : 'Pin Duebook'}</span>
            </button>
         </div>
      </div>
    </>
  );
};