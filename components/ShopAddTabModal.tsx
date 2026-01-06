import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ShopAddTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export const ShopAddTabModal: React.FC<ShopAddTabModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
        onAdd(name.trim());
        setName('');
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xs bg-white rounded-2xl p-4 shadow-xl animate-in zoom-in-95">
         <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">New List / Tab</h3>
            <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
         </div>
         <form onSubmit={handleSubmit}>
            <input 
                autoFocus
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="List Name (e.g. Suppliers)" 
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none mb-4"
            />
            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 rounded-xl">Create</button>
         </form>
      </div>
    </div>
  );
};