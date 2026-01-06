import React, { useState, useEffect } from 'react';
import { X, Calendar, ArrowRight, Edit2, Check, Save, AlertTriangle, Divide } from 'lucide-react';
import { ClassGroup } from '../types';

interface ClassInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  classGroup: ClassGroup;
  onUpdateClass: (updates: Partial<ClassGroup>) => void;
}

export const ClassInfoModal: React.FC<ClassInfoModalProps> = ({ isOpen, onClose, classGroup, onUpdateClass }) => {
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  
  // Edit Form State
  const [batchName, setBatchName] = useState(classGroup.batchName || '');
  const [standard, setStandard] = useState(classGroup.standard);
  const [feeAmount, setFeeAmount] = useState(classGroup.feeAmount.toString());
  const [totalCourseFee, setTotalCourseFee] = useState(classGroup.totalCourseFee?.toString() || '');
  const [courseDuration, setCourseDuration] = useState(classGroup.courseDuration?.toString() || '12');
  const [startDate, setStartDate] = useState(
    classGroup.startDate 
    ? new Date(classGroup.startDate).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0]
  );
  
  // Extra Fee Distribution State
  const [extraFees, setExtraFees] = useState<Record<number, number>>({});

  useEffect(() => {
    if (isOpen) {
        setBatchName(classGroup.batchName || '');
        setStandard(classGroup.standard);
        setFeeAmount(classGroup.feeAmount.toString());
        setTotalCourseFee(classGroup.totalCourseFee?.toString() || '');
        setCourseDuration(classGroup.courseDuration?.toString() || '12');
        setStartDate(classGroup.startDate 
            ? new Date(classGroup.startDate).toISOString().split('T')[0] 
            : new Date().toISOString().split('T')[0]);
        setIsEditingDetails(false);
        setExtraFees({}); // Reset temporary distribution
    }
  }, [isOpen, classGroup]);

  // Calculations
  const numericFeeAmount: number = Number(feeAmount) || 0;
  const numericDuration: number = Number(courseDuration) || 0;
  const numericTotalCourseFee: number = Number(totalCourseFee) || 0;
  
  const baseTotal: number = numericFeeAmount * numericDuration;
  const deficit: number = numericTotalCourseFee - baseTotal;
  const isDeficit = deficit > 0;
  
  const distributedAmount = (Object.values(extraFees) as number[]).reduce((sum, val) => sum + val, 0);
  const remainingToDistribute = deficit - distributedAmount;

  // Generate Months
  const getMonths = () => {
    const months: Date[] = [];
    const start = new Date(startDate); // Use current form state start date
    const duration = numericDuration || 12; 
    
    for (let i = 0; i < duration; i++) {
        const d = new Date(start);
        d.setMonth(d.getMonth() + i);
        months.push(d);
    }
    return months;
  };
  const monthsList = getMonths();

  // Initial Load of Overrides for Deficit Logic
  useEffect(() => {
      if (isOpen && isEditingDetails) {
          // If editing, and there are existing overrides, load them into extraFees relative index
          const newExtraFees: Record<number, number> = {};
          if (classGroup.feeOverrides) {
              const start = new Date(startDate);
              monthsList.forEach((d, idx) => {
                  const key = `${d.getFullYear()}-${d.getMonth()}`;
                  const override = classGroup.feeOverrides?.[key];
                  if (override !== undefined && override > numericFeeAmount) {
                      newExtraFees[idx] = override - numericFeeAmount;
                  }
              });
          }
          setExtraFees(newExtraFees);
      }
  }, [isOpen, isEditingDetails]);


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

  const handleSaveDetails = () => {
      // Validate Deficit
      if (isDeficit && remainingToDistribute !== 0) {
          alert(`You must distribute the full extra fee of ₹${deficit}. Remaining: ₹${remainingToDistribute}`);
          return;
      }

      // Convert extraFees (relative index) to feeOverrides (date keys)
      const newOverrides: Record<string, number> = {};
      
      monthsList.forEach((d, idx) => {
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          const extra = extraFees[idx] || 0;
          if (extra > 0) {
              newOverrides[key] = numericFeeAmount + extra;
          }
      });

      onUpdateClass({
          batchName,
          standard,
          feeAmount: numericFeeAmount,
          totalCourseFee: numericTotalCourseFee || undefined,
          courseDuration: numericDuration,
          startDate: new Date(startDate),
          feeOverrides: Object.keys(newOverrides).length > 0 ? newOverrides : undefined
      });
      setIsEditingDetails(false);
  };

  // Helper for rendering the read-only list with correct "FREE" logic
  let runningCumulativeCost = 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur">
          <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-lg font-bold text-slate-800 truncate">
                  {isEditingDetails ? 'Edit Class Details' : (classGroup.batchName || `Class ${classGroup.standard}`)}
              </h2>
              {!isEditingDetails && (
                 <p className="text-xs text-slate-500">
                    {new Date(classGroup.startDate || Date.now()).toLocaleDateString()} - {classGroup.courseDuration} Months
                 </p>
              )}
          </div>
          <div className="flex items-center gap-1">
            {!isEditingDetails && (
                <button 
                    onClick={() => setIsEditingDetails(true)} 
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
            
            {isEditingDetails ? (
                <div className="space-y-4">
                    {/* Standard Fields */}
                    <div className="space-y-4 border-b border-slate-100 pb-4">
                         <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Standard</label>
                                <input type="text" value={standard} onChange={e => setStandard(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-indigo-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Batch Name</label>
                                <input type="text" value={batchName} onChange={e => setBatchName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-indigo-500 outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-indigo-500 outline-none" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Monthly</label>
                                <input type="number" value={feeAmount} onChange={e => setFeeAmount(e.target.value)} className="w-full px-2 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-indigo-500 outline-none" />
                            </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Months</label>
                                <input type="number" value={courseDuration} onChange={e => setCourseDuration(e.target.value)} className="w-full px-2 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-indigo-500 outline-none" />
                            </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Total Fee</label>
                                <input type="number" value={totalCourseFee} onChange={e => setTotalCourseFee(e.target.value)} className="w-full px-2 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-indigo-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Deficit / Surplus Logic UI */}
                    {isDeficit ? (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-3 animate-in fade-in">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-red-700">Extra Fee Distribution Needed</p>
                                    <p className="text-xs text-red-500 mt-1">
                                        Total Fee (₹{numericTotalCourseFee}) exceeds standard monthly sum (₹{baseTotal}). 
                                        You must distribute the extra <strong>₹{deficit}</strong>.
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
                    ) : (
                        deficit < 0 && (
                            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-700">Discount / Free Months</p>
                                    <p className="text-xs text-emerald-600 mt-0.5">
                                        Last months will be automatically marked FREE.
                                    </p>
                                </div>
                            </div>
                        )
                    )}

                    <button 
                        onClick={handleSaveDetails} 
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            isDeficit && remainingToDistribute !== 0 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                        }`}
                        disabled={isDeficit && remainingToDistribute !== 0}
                    >
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Read Only View */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Monthly Fee</p>
                            <p className="text-xl font-bold text-slate-800 mt-1">₹{classGroup.feeAmount}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Course</p>
                            <p className="text-xl font-bold text-slate-800 mt-1">₹{classGroup.totalCourseFee || (classGroup.feeAmount * (classGroup.courseDuration||1))}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Fee Structure
                        </h3>
                        <div className="space-y-2">
                            {monthsList.map((date, idx) => {
                                const key = `${date.getFullYear()}-${date.getMonth()}`;
                                const override = classGroup.feeOverrides?.[key];
                                const currentFee = override ?? classGroup.feeAmount;
                                const cap = classGroup.totalCourseFee;
                                
                                let isFree = false;
                                
                                // Logic for "FREE" display in read-only list
                                if (cap && cap > 0) {
                                   if (runningCumulativeCost >= cap) {
                                       isFree = true;
                                   } else if (runningCumulativeCost + currentFee > cap) {
                                       // Partial fee month, handled as just displaying the remainder?
                                       // For simplicity in list view, if it hits cap, next ones are free.
                                       // Ideally we display the partial amount, but here we check strictly > cap for free status
                                   }
                                }
                                
                                // Cap cumulative for next iteration
                                runningCumulativeCost += currentFee;
                                if (cap && runningCumulativeCost > cap) runningCumulativeCost = cap;

                                return (
                                    <div key={idx} className={`border rounded-xl p-3 flex items-center justify-between ${isFree ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-bold ${isFree ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                                <span>{date.toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-[9px] opacity-70">{date.getFullYear().toString().substr(2)}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                {isFree ? (
                                                    <span className="text-sm font-bold text-emerald-600">FREE</span>
                                                ) : (
                                                    <>
                                                    <span className={`text-sm font-bold ${override ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                        ₹{currentFee}
                                                    </span>
                                                    {override && <span className="text-[9px] text-indigo-500 font-medium">Includes Extra Fee</span>}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {isFree && <Check className="w-4 h-4 text-emerald-500" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};