import React, { useState } from 'react';
import { X, Calendar, Wallet, ArrowDown } from 'lucide-react';

interface EditDueModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  currentDue: number;
  advanceAmount?: number; // New prop for advance
  monthlyFee: number;
  onSave: (newDue: number) => void;
}

export const EditDueModal: React.FC<EditDueModalProps> = ({ 
  isOpen, 
  onClose, 
  studentName, 
  currentDue,
  advanceAmount = 0,
  monthlyFee, 
  onSave 
}) => {
  const [mode, setMode] = useState<'MONTHS' | 'MANUAL'>('MONTHS');
  const [months, setMonths] = useState('1');
  const [manualAmount, setManualAmount] = useState(currentDue.toString());

  // Reset state when opening
  React.useEffect(() => {
    if (isOpen) {
      setManualAmount(currentDue.toString());
      setMonths('1');
      setMode('MONTHS');
    }
  }, [isOpen, currentDue]);

  if (!isOpen) return null;

  const handleSave = () => {
    let finalDue = currentDue;
    
    if (mode === 'MONTHS') {
      const numMonths = parseInt(months) || 0;
      const amountToAdd = numMonths * monthlyFee;
      // Calculate merging in save is handled by App.tsx, but UI shows the preview
      finalDue = currentDue + amountToAdd;
    } else {
      finalDue = parseInt(manualAmount) || 0;
    }
    
    onSave(finalDue);
    onClose();
  };

  const amountToAdd = parseInt(months) * monthlyFee;
  const grossNewDue = currentDue + (isNaN(amountToAdd) ? 0 : amountToAdd);
  
  // Visual Calculation for Merging
  const mergedAmount = Math.min(advanceAmount, isNaN(amountToAdd) ? 0 : amountToAdd);
  const netDueIncrease = (isNaN(amountToAdd) ? 0 : amountToAdd) - mergedAmount;
  const finalProjectedDue = currentDue + netDueIncrease;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 transform transition-all animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manage Due</h2>
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
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Add Months
          </button>
          <button
            onClick={() => setMode('MANUAL')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'MANUAL'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Manual Set
          </button>
        </div>

        {mode === 'MONTHS' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Add Pending Months</label>
              <div className="flex items-center gap-3">
                 <button onClick={() => setMonths(Math.max(1, parseInt(months) - 1).toString())} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold">-</button>
                 <input
                    type="number"
                    min="1"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    className="flex-1 text-center font-bold text-lg py-2 bg-white text-slate-900 rounded-xl border border-slate-200 outline-none focus:border-red-500"
                 />
                 <button onClick={() => setMonths((parseInt(months) + 1).toString())} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold">+</button>
              </div>
            </div>
            
            {advanceAmount > 0 && amountToAdd > 0 ? (
                // Advance Merging Visualization
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-center space-y-2 animate-slide-up">
                    <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide">Advance Payment Found</p>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Adding:</span>
                        <span className="font-bold text-red-600">₹{amountToAdd}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-yellow-200 pb-2">
                         <span className="text-slate-600">Advance:</span>
                         <span className="font-bold text-emerald-600">- ₹{mergedAmount}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold pt-1">
                        <span className="text-slate-800">Net Added:</span>
                        <span className="text-red-700">₹{netDueIncrease}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                        Advance will be automatically deducted.
                    </div>
                </div>
            ) : (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                    <div className="flex justify-between items-center mb-2 border-b border-red-200/50 pb-2">
                        <span className="text-xs text-red-600">Current Due</span>
                        <span className="text-xs font-bold text-red-700">₹{currentDue}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-red-600">Adding ({months} mo)</span>
                        <span className="text-xs font-bold text-red-700">+ ₹{amountToAdd}</span>
                    </div>
                    <div className="pt-1">
                        <p className="text-xs text-red-500 uppercase tracking-wide font-semibold">New Total</p>
                        <p className="text-3xl font-bold text-red-700 mt-1">₹{grossNewDue}</p>
                    </div>
                </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
             <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Set Total Due (₹)</label>
              <input
                type="number"
                autoFocus
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="Enter total amount"
                className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all placeholder:text-slate-400 font-bold text-lg"
              />
              <p className="text-xs text-slate-400">This will overwrite the current due amount.</p>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-200 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6"
        >
          {mode === 'MONTHS' ? 'Confirm & Add' : 'Update Due'}
        </button>
      </div>
    </div>
  );
};