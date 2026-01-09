
import React, { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, CheckCircle, Camera, Calendar, Phone, Sparkles } from 'lucide-react';
import { Student } from '../types';

interface StudentCardProps {
  student: Student;
  totalCourseFee?: number;
  onEditDue: (studentId: string) => void;
  onClearDue: (studentId: string) => void;
  onEditImage: (studentId: string) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, totalCourseFee, onEditDue, onClearDue, onEditImage }) => {
  // Refs to track previous values for transition detection
  const prevDueRef = useRef(student.totalDue);
  const prevAdvanceRef = useRef(student.advanceAmount);

  // Animation States
  const [isClearing, setIsClearing] = useState(false);
  const [clearedAmountSnapshot, setClearedAmountSnapshot] = useState(0);

  const [isMerging, setIsMerging] = useState(false);
  const [mergedAdvanceSnapshot, setMergedAdvanceSnapshot] = useState(0);

  // New Slide-In Animation State (similar to ShopCustomerCard)
  const [anim, setAnim] = useState<{ text: string; colorClass: string; bgClass: string; borderClass: string } | null>(null);

  // Calculate total paid
  const totalPaid = student.paymentHistory.reduce((sum, rec) => sum + rec.amount, 0);
  const isCourseCompleted = totalCourseFee && totalCourseFee > 0 && totalPaid >= totalCourseFee;

  useEffect(() => {
    const prevDue = prevDueRef.current;
    const prevAdvance = prevAdvanceRef.current;
    const currDue = student.totalDue;
    const currAdvance = student.advanceAmount;

    // --- LOGIC 1: Visual Transitions (Ghosts) ---
    // Detect Due Clearing (Positive -> Zero)
    if (prevDue > 0 && currDue === 0) {
        setClearedAmountSnapshot(prevDue);
        setIsClearing(true);
        const timer = setTimeout(() => setIsClearing(false), 1300);
        return () => clearTimeout(timer);
    }
    // Detect Advance Merging (Advance Decreased AND Due Changed)
    if (prevAdvance > 0 && currAdvance < prevAdvance) {
        setMergedAdvanceSnapshot(prevAdvance);
        setIsMerging(true);
        const timer = setTimeout(() => setIsMerging(false), 1600);
        return () => clearTimeout(timer);
    }

    // --- LOGIC 2: Numeric Slide-In Animation (Add/Subtract Value) ---
    // Calculate Net Balance Change
    // Balance = Due - Advance. Positive = Debt. Negative = Credit.
    const prevBalance = prevDue - prevAdvance;
    const currBalance = currDue - currAdvance;
    const diff = currBalance - prevBalance;

    let cleanup;
    
    // Only animate if there is a real value change > 0.01
    if (Math.abs(diff) > 0.01) {
        let newAnim = null;

        if (diff > 0) {
            // Debt Increased (Due Added or Advance Used) -> Red
            newAnim = { 
                text: `- ₹${Math.abs(diff)}`, 
                colorClass: 'text-rose-700',
                bgClass: 'bg-rose-50',
                borderClass: 'border-rose-200'
            };
        } else {
            // Debt Decreased (Payment or Advance Added) -> Green/Yellow
            const amount = Math.abs(diff);
            const isPayment = prevDue > 0;
            
            newAnim = { 
                text: `+ ₹${amount}`, 
                colorClass: isPayment ? 'text-emerald-700' : 'text-yellow-700',
                bgClass: isPayment ? 'bg-emerald-50' : 'bg-yellow-50',
                borderClass: isPayment ? 'border-emerald-200' : 'border-yellow-200'
            };
        }

        setAnim(newAnim);
        const t = setTimeout(() => setAnim(null), 1500); 
        cleanup = () => clearTimeout(t);
    }

    // Update Refs
    prevDueRef.current = currDue;
    prevAdvanceRef.current = currAdvance;
    
    return cleanup;
  }, [student.totalDue, student.advanceAmount]);

  return (
    <div className={`p-3 rounded-2xl shadow-sm border transition-all active:scale-[0.99] duration-200 relative overflow-hidden ${
        isCourseCompleted 
        ? 'bg-emerald-50 border-emerald-200' 
        : 'bg-white border-slate-100 hover:shadow-md'
    }`}>
      {/* 
          ANIMATION LAYER 
      */}
      {anim && (
          <div 
            className={`absolute top-2 right-2 z-20 flex items-center justify-center px-3 py-1.5 rounded-xl border shadow-sm font-black text-sm ${anim.bgClass} ${anim.colorClass} ${anim.borderClass} pointer-events-none`}
            style={{
                animation: 'slideInRight 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
             {anim.text}
          </div>
      )}
      
      {/* Animation Keyframes Definition (Scoped) */}
      <style>{`
        @keyframes slideInRight {
            0% { transform: translateX(120%); opacity: 0; }
            15% { transform: translateX(0); opacity: 1; }
            80% { opacity: 1; transform: translateX(0); }
            100% { transform: translateX(-20px); opacity: 0; }
        }
      `}</style>

      {isCourseCompleted && (
          <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
             <Sparkles className="w-24 h-24 text-emerald-600 rotate-12" />
          </div>
      )}

      <div className="flex gap-3 relative z-10">
        {/* Avatar Section */}
        <div className="shrink-0 relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); onEditImage(student.id); }}>
          {student.photoUrl ? (
            <img 
              src={student.photoUrl} 
              alt={student.name} 
              className={`w-14 h-14 rounded-xl object-cover shadow-sm ${isCourseCompleted ? 'border-2 border-emerald-300' : 'border border-slate-100'}`}
            />
          ) : (
            <div className={`w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center transition-colors ${
                isCourseCompleted ? 'bg-emerald-100 border-emerald-300 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400 group-hover:border-indigo-300 group-hover:text-indigo-400'
            }`}>
              <Plus className="w-5 h-5" />
            </div>
          )}
          {/* Overlay for editing */}
          <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className={`font-bold text-base leading-tight truncate pr-2 ${isCourseCompleted ? 'text-emerald-900' : 'text-slate-800'}`}>
                {student.name}
              </h3>
              <div className={`flex items-center gap-1 text-[10px] ${isCourseCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Calendar className="w-3 h-3" />
                <span>{new Date(student.joiningDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
               <Phone className={`w-3 h-3 ${isCourseCompleted ? 'text-emerald-500' : 'text-slate-400'}`} />
               <p className={`text-xs ${isCourseCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>{student.phoneNumber}</p>
            </div>
          </div>
          
          {/* Actions Section */}
          <div className="flex items-end justify-between mt-2">
            <div className="flex flex-col gap-0.5 min-w-0">
               {isCourseCompleted ? (
                   <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800 animate-pop-in">
                       <CheckCircle className="w-3 h-3 fill-emerald-600 text-white" />
                       <span className="text-xs font-bold">Course Paid</span>
                   </div>
               ) : (
                   <div className="flex gap-2 relative">
                        {/* 
                           GHOST ELEMENT: Old Due Amount Flying Away 
                           Shown only when isClearing is true
                        */}
                        {isClearing && (
                            <div className="absolute left-0 top-0 flex items-center gap-1.5 px-2 py-0.5 rounded-lg border w-fit bg-red-50 border-red-100 text-red-700 animate-fly-off pointer-events-none z-20">
                                <span className="text-xs font-bold">Due: ₹{clearedAmountSnapshot}</span>
                                <Pencil className="w-2.5 h-2.5 opacity-50" />
                            </div>
                        )}

                        {/* Actual Due / No Due Badge */}
                        {student.totalDue > 0 ? (
                            <div 
                                onClick={(e) => { e.stopPropagation(); onEditDue(student.id); }}
                                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border w-fit cursor-pointer transition-colors bg-red-50 border-red-100 text-red-700 hover:bg-red-100 ${isMerging ? 'animate-due-pulse' : ''}`}
                            >
                                <span className="text-xs font-bold">Due: ₹{student.totalDue}</span>
                                <Pencil className="w-2.5 h-2.5 opacity-50" />
                            </div>
                        ) : (
                             <div 
                                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border w-fit cursor-pointer transition-colors bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 ${isClearing ? 'animate-appear-smooth opacity-0' : ''}`}
                                style={isClearing ? { animationDelay: '0.5s' } : {}}
                                onClick={(e) => { e.stopPropagation(); onEditDue(student.id); }}
                            >
                                <span className="text-xs font-bold">No Due</span>
                                <Pencil className="w-2.5 h-2.5 opacity-50" />
                            </div>
                        )}
                        
                        {/* 
                           GHOST ELEMENT: Old Advance Merging
                           Shown only when isMerging is true.
                           We position it absolutely relative to the container to animate it towards the due badge.
                        */}
                        {isMerging && (
                            <div className="absolute left-[80px] top-0 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 animate-merge-advance pointer-events-none z-20">
                                <span className="text-xs font-bold">Adv: ₹{mergedAdvanceSnapshot}</span>
                            </div>
                        )}

                        {student.advanceAmount > 0 && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700">
                                <span className="text-xs font-bold">Adv: ₹{student.advanceAmount}</span>
                            </div>
                        )}
                   </div>
               )}

               {student.pendingMonths.length > 0 && student.totalDue > 0 && (
                 <p className="text-[10px] text-red-400 truncate max-w-[120px] pl-0.5">
                   {student.pendingMonths[0]}{student.pendingMonths.length > 1 ? ` +${student.pendingMonths.length - 1}` : ''}
                 </p>
               )}
            </div>

            {/* Clear button only if there is Due */}
            {student.totalDue > 0 && (
                <button
                onClick={(e) => { e.stopPropagation(); onClearDue(student.id); }}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm shadow-emerald-200 transition-all active:scale-95 uppercase tracking-wide"
                >
                <CheckCircle className="w-3 h-3" />
                Clear
                </button>
            )}
            
            {/* Show Pay Advance button if No Due and Not Completed */}
            {student.totalDue === 0 && !isCourseCompleted && (
                 <button
                 onClick={(e) => { e.stopPropagation(); onClearDue(student.id); }}
                 className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm shadow-indigo-200 transition-all active:scale-95 uppercase tracking-wide"
                 >
                 <Plus className="w-3 h-3" />
                 Pay
                 </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
