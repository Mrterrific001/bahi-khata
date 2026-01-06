import React, { useState } from 'react';
import { X, Calendar, Wallet } from 'lucide-react';

interface ClearDueModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  monthlyFee: number;
  onClear: (amount: number, monthsCleared: number) => void;
}

export const ClearDueModal: React.FC<ClearDueModalProps> = ({ 
  isOpen, 
  onClose, 
  studentName, 
  monthlyFee, 
  onClear 
}) => {
  const [mode, setMode] = useState<'MONTHS' | 'MANUAL'>('MONTHS');
  const [months, setMonths] = useState('1');
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleClear = () => {
    if (mode === 'MONTHS') {
      const numMonths = parseInt(months) || 0;
      onClear(numMonths * monthlyFee, numMonths);
    } else {
      const manualAmount = parseInt(amount) || 0;
      onClear(manualAmount, 0);
    }
    setMonths('1');
    setAmount('');
    onClose();
  };

  const calculatedAmount = parseInt(months) * monthlyFee;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 transform transition-all animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Clear Due</h2>
            <p className="text-xs text-slate-500">For {studentName}</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setMode('MONTHS')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'MONTHS'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            By Months
          </button>
          <button
            onClick={() => setMode('MANUAL')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'MANUAL'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Manual
          </button>
        </div>

        {mode === 'MONTHS' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Number of Months</label>
              <div className="flex items-center gap-3">
                 <button onClick={() => setMonths(Math.max(1, parseInt(months) - 1).toString())} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold">-</button>
                 <input
                    type="number"
                    min="1"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    className="flex-1 text-center font-bold text-lg py-2 bg-white text-slate-900 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                 />
                 <button onClick={() => setMonths((parseInt(months) + 1).toString())} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold">+</button>
              </div>
            </div>
            
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
              <p className="text-sm text-emerald-800">Total Calculation</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">₹{isNaN(calculatedAmount) ? 0 : calculatedAmount}</p>
              <p className="text-xs text-emerald-600 mt-1">({months} months × ₹{monthlyFee})</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Amount to Clear (₹)</label>
              <input
                type="number"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-400 font-bold text-lg"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleClear}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6"
        >
          Confirm Payment
        </button>
      </div>
    </div>
  );
};