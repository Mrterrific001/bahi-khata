import React from 'react';
import { Pin, Phone, X, Trash2 } from 'lucide-react';

interface ShopCustomerContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  phoneNumber: string;
  isPinned: boolean;
  onTogglePin: () => void;
  onDelete: () => void;
}

export const ShopCustomerContextMenu: React.FC<ShopCustomerContextMenuProps> = ({ 
  isOpen, 
  onClose, 
  customerName,
  phoneNumber,
  isPinned, 
  onTogglePin, 
  onDelete
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
            <h3 className="font-bold text-slate-800 truncate">{customerName}</h3>
            <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
         </div>
         <div className="space-y-1">
            <button 
               onClick={() => { onTogglePin(); onClose(); }}
               className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
            >
               <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPinned ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
               </div>
               <span className="font-medium text-slate-700">{isPinned ? 'Unpin Customer' : 'Pin Customer'}</span>
            </button>
            <a 
               href={`tel:${phoneNumber}`}
               onClick={() => onClose()}
               className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
            >
               <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
               </div>
               <span className="font-medium text-slate-700">Call Customer</span>
            </a>
            <div className="h-px bg-slate-100 my-1" />
            <button 
               onClick={() => { onClose(); onDelete(); }}
               className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-left group"
            >
               <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <Trash2 className="w-4 h-4" />
               </div>
               <span className="font-medium text-red-600">Delete Customer</span>
            </button>
         </div>
      </div>
    </>
  );
};