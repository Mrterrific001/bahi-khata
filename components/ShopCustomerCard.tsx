import React, { useEffect, useRef, useState } from 'react';
import { Phone, Plus, User, Check, Wallet } from 'lucide-react';
import { Customer } from '../types';

interface ShopCustomerCardProps {
  customer: Customer;
  onClearDue: () => void;
  onAddDue: () => void;
  onEditImage: () => void;
  onLongPress?: () => void;
  onClick?: () => void;
}

export const ShopCustomerCard: React.FC<ShopCustomerCardProps> = ({ 
  customer, 
  onClearDue, 
  onAddDue, 
  onEditImage,
  onClick
}) => {
  // Logic to track previous values for animation detection
  const prevDueRef = useRef(customer.totalDue);
  const prevAdvanceRef = useRef(customer.advanceAmount);
  
  // Animation State
  const [anim, setAnim] = useState<{ text: string; colorClass: string; bgClass: string; borderClass: string } | null>(null);

  useEffect(() => {
    const prevDue = prevDueRef.current;
    const prevAdvance = prevAdvanceRef.current;
    const currDue = customer.totalDue;
    const currAdvance = customer.advanceAmount;

    // Calculate Net Balance Change
    const prevBalance = prevDue - prevAdvance;
    const currBalance = currDue - currAdvance;
    const diff = currBalance - prevBalance;

    let cleanup;

    // Only animate if there is a real value change
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
        // Animation duration is 1.5s
        const t = setTimeout(() => setAnim(null), 1500); 
        cleanup = () => clearTimeout(t);
    }

    prevDueRef.current = currDue;
    prevAdvanceRef.current = currAdvance;

    return cleanup;
  }, [customer.totalDue, customer.advanceAmount]);

  return (
    <div 
        onClick={onClick}
        className="relative bg-white p-4 flex gap-4 overflow-hidden cursor-pointer select-none rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-[0.99] hover:border-slate-300"
    >
      {/* 
          ANIMATION LAYER 
          Rounded Box style, contained inside card.
      */}
      {anim && (
          <div 
            className={`absolute top-4 right-2 z-20 flex items-center justify-center px-4 py-2 rounded-xl border shadow-sm font-black text-lg ${anim.bgClass} ${anim.colorClass} ${anim.borderClass} pointer-events-none`}
            style={{
                animation: 'slideInRight 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
             {anim.text}
          </div>
      )}

      {/* Animation Keyframes */}
      <style>{`
        @keyframes slideInRight {
            0% { transform: translateX(120%); opacity: 0; }
            15% { transform: translateX(0); opacity: 1; }
            80% { opacity: 1; transform: translateX(0); }
            100% { transform: translateX(-20px); opacity: 0; }
        }
      `}</style>

      {/* LEFT SECTION: Square Avatar */}
      <div 
        className="shrink-0"
        onClick={(e) => { e.stopPropagation(); onEditImage(); }}
      >
        {customer.photoUrl ? (
            <img 
                src={customer.photoUrl} 
                alt={customer.name} 
                className="w-16 h-16 rounded-xl object-cover border border-slate-100 bg-slate-50"
            />
        ) : (
            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                <User className="w-8 h-8 opacity-50" />
            </div>
        )}
      </div>

      {/* CENTER SECTION */}
      <div className="flex-1 flex flex-col min-w-0 justify-center">
         {/* Name */}
         <h3 className="text-base font-bold text-slate-900 truncate pr-2">
            {customer.name}
         </h3>
         
         {/* Phone */}
         <p className="text-xs text-slate-500 mb-1.5 font-medium truncate">
            {customer.phoneNumber}
         </p>
         
         {/* Current Amount Text */}
         <div className="text-sm font-bold mb-3">
             {customer.totalDue > 0 ? (
                 <span className="text-red-600">₹{customer.totalDue} Due</span>
             ) : customer.advanceAmount > 0 ? (
                 <span className="text-yellow-600">₹{customer.advanceAmount} Advance</span>
             ) : (
                 <span className="text-slate-400">No due</span>
             )}
         </div>

         {/* BOTTOM AREA: Add Due Button */}
         <button 
            onClick={(e) => { e.stopPropagation(); onAddDue(); }}
            className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg w-fit transition-colors active:scale-95 border border-rose-100 hover:bg-rose-100"
         >
            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
            <span className="text-xs font-bold uppercase tracking-wide">Add Due</span>
         </button>
      </div>

      {/* RIGHT SECTION: Vertical Alignment */}
      <div className="flex flex-col justify-between items-end pl-2">
          {/* Call Button (Top) */}
          <a 
             href={`tel:${customer.phoneNumber}`}
             onClick={(e) => e.stopPropagation()}
             className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center active:scale-90 transition-transform hover:bg-slate-100 hover:border-slate-300 mb-auto"
          >
             <Phone className="w-4 h-4 fill-current" />
          </a>

          {/* Action Button (Bottom) - Rectangular & Same Size as Add Due */}
          {customer.totalDue > 0 ? (
              <button 
                 onClick={(e) => { e.stopPropagation(); onClearDue(); }}
                 className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg w-fit transition-colors active:scale-95 border border-emerald-100 hover:bg-emerald-100 mt-2"
              >
                 <Check className="w-3.5 h-3.5" strokeWidth={3} />
                 <span className="text-xs font-bold uppercase tracking-wide">Clear</span>
              </button>
          ) : (
              <button 
                 onClick={(e) => { e.stopPropagation(); onClearDue(); }}
                 className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg w-fit transition-colors active:scale-95 border border-yellow-200 hover:bg-yellow-100 mt-2"
              >
                 <Wallet className="w-3.5 h-3.5" strokeWidth={3} />
                 <span className="text-xs font-bold uppercase tracking-wide">Advance</span>
              </button>
          )}
      </div>

    </div>
  );
};