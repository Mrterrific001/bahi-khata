
import React, { useState } from 'react';
import { X, IndianRupee, Plus, CheckCircle } from 'lucide-react';

interface ShopActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ADD_DUE' | 'CLEAR_DUE';
  customerName: string;
  currentDue?: number;
  onConfirm: (amount: number, description: string) => void;
}

export const ShopActionModal: React.FC<ShopActionModalProps> = ({ 
  isOpen, 
  onClose, 
  type, 
  customerName, 
  currentDue = 0,
  onConfirm 
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (val > 0) {
        onConfirm(val, description.trim() || (type === 'ADD_DUE' ? 'Added manually' : 'Payment received'));
        setAmount('');
        setDescription('');
        onClose();
    }
  };

  const isAdd = type === 'ADD_DUE';

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
         
         <div className="flex justify-between items-center mb-4">
            <div>
                <h3 className={`text-lg font-bold ${isAdd ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isAdd ? 'Add Due Amount' : 'Clear Due Amount'}
                </h3>
                <p className="text-xs text-slate-500">{customerName}</p>
            </div>
            <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
         </div>

         {!isAdd && (
             <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-500">Current Due</span>
                 <span className="text-lg font-bold text-slate-800">₹{currentDue}</span>
             </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Amount</label>
                <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        autoFocus
                        type="number" 
                        min="1"
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        placeholder="0" 
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 outline-none font-bold text-lg transition-all ${
                            isAdd 
                            ? 'border-rose-100 focus:border-rose-500 focus:ring-rose-100 text-rose-600' 
                            : 'border-emerald-100 focus:border-emerald-500 focus:ring-emerald-100 text-emerald-600'
                        }`}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Description <span className="text-slate-300 font-normal">(Optional)</span></label>
                <input 
                    type="text" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder={isAdd ? "e.g. Rice & Oil" : "e.g. Cash Payment"} 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none text-sm"
                />
            </div>

            <button 
                type="submit" 
                className={`w-full font-bold py-3.5 rounded-xl text-white shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${
                    isAdd 
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                }`}
            >
                {isAdd ? <Plus className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                {isAdd ? 'Add to Due' : 'Accept Payment'}
            </button>
         </form>
      </div>
    </div>
  );
};
