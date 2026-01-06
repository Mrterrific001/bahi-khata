import React, { useState, useEffect } from 'react';
import { X, Calculator, AlertTriangle, Divide, Check } from 'lucide-react';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (standard: string, name: string | undefined, fee: number, totalCourseFee: number | undefined, duration: number | undefined, startDate: Date | undefined, feeOverrides: Record<string, number> | undefined) => void;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [standard, setStandard] = useState('10');
  const [batchName, setBatchName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Mandatory Fields - Decoupled
  const [feeAmount, setFeeAmount] = useState('');
  const [totalCourseFee, setTotalCourseFee] = useState('');
  const [courseDuration, setCourseDuration] = useState('');

  // Extra Fee Distribution State
  const [extraFees, setExtraFees] = useState<Record<number, number>>({});

  useEffect(() => {
     if (isOpen) {
         setStandard('10');
         setBatchName('');
         setFeeAmount('');
         setTotalCourseFee('');
         setCourseDuration('');
         setStartDate(new Date().toISOString().split('T')[0]);
         setExtraFees({});
     }
  }, [isOpen]);

  // Calculations
  const numericFeeAmount: number = Number(feeAmount) || 0;
  const numericDuration: number = Number(courseDuration) || 0;
  const numericTotalCourseFee: number = Number(totalCourseFee) || 0;
  
  // Only calculate deficit if all fields have values
  const baseTotal: number = numericFeeAmount * numericDuration;
  
  // Deficit calculation
  const deficit: number = (numericTotalCourseFee > 0 && numericDuration > 0) ? (numericTotalCourseFee - baseTotal) : 0;
  const isDeficit = deficit > 0;
  
  const distributedAmount = (Object.values(extraFees) as number[]).reduce((sum, val) => sum + val, 0);
  const remainingToDistribute = deficit - distributedAmount;

  // Generate Preview Months
  const getMonths = () => {
    const months: Date[] = [];
    const start = new Date(startDate); 
    const duration = numericDuration || 0;
    
    for (let i = 0; i < duration; i++) {
        const d = new Date(start);
        d.setMonth(d.getMonth() + i);
        months.push(d);
    }
    return months;
  };
  const monthsList = getMonths();

  const handleDistributeEvenly = (e: React.MouseEvent) => {
      e.preventDefault();
      if (!isDeficit) return;
      
      const count = monthsList.length;
      if (count === 0) return;

      const perMonth = Math.floor(deficit / count);
      const remainder = deficit % count;
      
      const newFees: Record<number, number> = {};
      for(let i=0; i<count; i++) {
          newFees[i] = perMonth + (i < remainder ? 1 : 0);
      }
      setExtraFees(newFees);
  };

  const handleManualExtraFee = (idx: number, val: string) => {
      const amount = Math.max(0, parseInt(val) || 0);
      setExtraFees(prev => ({ ...prev, [idx]: amount }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeAmount || !totalCourseFee || !courseDuration) {
        return; 
    }
    
    if (isDeficit && remainingToDistribute !== 0) {
        alert(`You must distribute the full extra fee of ₹${deficit}. Remaining: ₹${remainingToDistribute}`);
        return;
    }

    // Convert extraFees (relative index) to feeOverrides (date keys)
    const newOverrides: Record<string, number> = {};
    if (Object.keys(extraFees).length > 0) {
        monthsList.forEach((d, idx) => {
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            const extra = extraFees[idx] || 0;
            if (extra > 0) {
                newOverrides[key] = numericFeeAmount + extra;
            }
        });
    }
    
    // DIFFERENT APPROACH: Close first, then add.
    // This ensures UI responsiveness immediately.
    onClose();

    // Defer the data update slightly to allow the modal to unmount/close visually
    setTimeout(() => {
        onAdd(
            standard, 
            batchName.trim() || undefined, 
            Number(feeAmount),
            Number(totalCourseFee),
            Number(courseDuration),
            startDate ? new Date(startDate) : undefined,
            Object.keys(newOverrides).length > 0 ? newOverrides : undefined
        );
    }, 50);
  };

  const standards = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  // CRITICAL FIX: Do not render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 transform transition-all animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Add Class / Batch</h2>
          <button type="button" onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Class / Standard</label>
            <div className="grid grid-cols-4 gap-2">
              {standards.map((std) => (
                <button
                  key={std}
                  type="button"
                  onClick={() => setStandard(std)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    standard === std
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {std}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="batchName" className="block text-sm font-medium text-slate-700">
              Batch Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="batchName"
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g. Morning Batch"
              className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Start Date</label>
                <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all text-slate-600"
                />
            </div>
             <div className="space-y-2">
                <label htmlFor="feeAmount" className="block text-sm font-medium text-slate-700">
                Monthly Fee (₹) <span className="text-red-500">*</span>
                </label>
                <input
                id="feeAmount"
                type="number"
                required
                min="0"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                placeholder="500"
                className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-4">
             <div className="flex items-center gap-2 text-indigo-600">
                <Calculator className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wide">Course Settings</span>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Total Fee <span className="text-red-500">*</span></label>
                    <input
                    type="number"
                    required
                    min="0"
                    value={totalCourseFee}
                    onChange={(e) => setTotalCourseFee(e.target.value)}
                    placeholder="Total ₹"
                    className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Duration (Mo) <span className="text-red-500">*</span></label>
                    <input
                    type="number"
                    required
                    min="1"
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                    placeholder="Months"
                    className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
             </div>

             {/* Deficit Distribution Logic (Extra Fee Needed) */}
             {isDeficit && (
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-3 animate-in fade-in">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-red-700">Extra Fee Distribution Needed</p>
                            <p className="text-xs text-red-500 mt-1">
                                Total ({numericTotalCourseFee}) &gt; Monthly Sum ({baseTotal}). 
                                Distribute <strong>₹{deficit}</strong>.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white/50 p-2 rounded-lg">
                        <span className="text-xs font-bold text-red-600">Remaining to Assign:</span>
                        <span className={`text-sm font-bold ${remainingToDistribute === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            ₹{remainingToDistribute}
                        </span>
                    </div>

                    <button 
                        onClick={handleDistributeEvenly}
                        type="button"
                        className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                    >
                        <Divide className="w-3 h-3" /> Distribute Evenly
                    </button>

                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                        {monthsList.map((d, idx) => {
                            const extra = extraFees[idx] || 0;
                            const monthName = d.toLocaleString('default', { month: 'short', year: '2-digit' });
                            return (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                    <span className="w-12 font-medium text-slate-500">{monthName}</span>
                                    <div className="flex-1 flex items-center bg-white border border-slate-200 rounded px-2 py-1">
                                        <span className="text-slate-400 mr-1">₹{numericFeeAmount} +</span>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={extra === 0 ? '' : extra}
                                            onChange={(e) => handleManualExtraFee(idx, e.target.value)}
                                            placeholder="0"
                                            className="w-12 outline-none font-bold text-red-600 placeholder:text-slate-300"
                                        />
                                    </div>
                                    <span className="w-12 text-right font-bold text-slate-700">₹{numericFeeAmount + extra}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
             )}

             {/* Surplus Logic (Free Months Notification) - Checks if Deficit is negative */}
             {!isDeficit && deficit < 0 && (
                 <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-start gap-2 animate-in fade-in">
                    <div className="bg-emerald-100 p-1 rounded-full text-emerald-600 mt-0.5">
                        <Check className="w-3 h-3" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-emerald-700">Discount / Free Months</p>
                        <p className="text-xs text-emerald-600 mt-1">
                            Total Course Fee (₹{numericTotalCourseFee}) is less than the monthly sum (₹{baseTotal}). 
                            The last months will be automatically marked as <strong>FREE</strong>.
                        </p>
                    </div>
                </div>
             )}
          </div>

          <button
            type="submit"
            className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 ${
                isDeficit && remainingToDistribute !== 0 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
            disabled={isDeficit && remainingToDistribute !== 0}
          >
            Create Class
          </button>
        </form>
      </div>
    </div>
  );
};