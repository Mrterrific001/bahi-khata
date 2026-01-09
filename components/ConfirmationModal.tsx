
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  confirmLabel?: string;
  isDangerous?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmLabel = "Delete",
  isDangerous = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <div className={`p-3 rounded-full ${isDangerous ? 'bg-red-100' : 'bg-indigo-100'}`}>
            <AlertTriangle className={`w-6 h-6 ${isDangerous ? 'text-red-600' : 'text-indigo-600'}`} />
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 mb-6 leading-relaxed text-sm">
          {message} <br/>
          <span className="font-bold text-slate-800 bg-red-50 px-2 py-0.5 rounded border border-red-100 mt-2 inline-block break-all">
            {itemName}
          </span>
        </p>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98] ${
              isDangerous ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
