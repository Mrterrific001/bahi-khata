import React, { useMemo, useRef } from 'react';
import { TrendingUp, ArrowUpRight, Users, Wallet, Plus, Pin } from 'lucide-react';
import { Business } from '../types';

interface ShopStatsViewProps {
  business: Business;
  onOpenDuebook: () => void;
  onLongPressDuebook: () => void;
}

export const ShopStatsView: React.FC<ShopStatsViewProps> = ({ business, onOpenDuebook, onLongPressDuebook }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stats Calculation
  const stats = useMemo(() => {
      let totalDue = 0;
      let totalCollectedToday = 0;
      const allCustomers = business.customers || [];
      const totalCustomers = allCustomers.length;
      
      const today = new Date();
      const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

      allCustomers.forEach(c => {
          totalDue += c.totalDue;
          c.paymentHistory.forEach(p => {
              if (isSameDay(new Date(p.date), today)) {
                  // Only count actual payments, not due additions
                  if (p.type !== 'DUE_ADDED') {
                      totalCollectedToday += p.amount;
                  }
              }
          });
      });

      return { totalDue, totalCollectedToday, totalCustomers };
  }, [business.customers]);

  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => {
        onLongPressDuebook();
        if (navigator.vibrate) navigator.vibrate(50);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        {/* Main Stats Card - Dark Theme (Slate/Blue) */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-300 transform transition-all hover:scale-[1.01] border border-slate-700 relative overflow-hidden">
            
            <h2 className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5 relative z-10">
                <TrendingUp className="w-3.5 h-3.5" />
                Shop Overview
            </h2>
            <div className="grid grid-cols-2 gap-y-6 relative z-10">
                <div>
                    <p className="text-3xl font-bold">₹{stats.totalDue.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">Total Outstanding</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-emerald-400">₹{stats.totalCollectedToday.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-emerald-300/80 mt-1">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Collected Today</span>
                    </div>
                </div>
                <div className="col-span-2 pt-4 border-t border-white/10 flex items-center gap-2">
                    <div className="bg-white/10 p-1.5 rounded-lg text-slate-300">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-200">{stats.totalCustomers} Active Customers</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            {/* Due Book Button - Completely Pink Theme */}
            <div 
                onClick={onOpenDuebook}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`col-span-1 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-5 shadow-lg shadow-pink-200 border border-pink-400/20 relative overflow-hidden group cursor-pointer active:scale-95 transition-all select-none text-white ${business.isPinned ? 'ring-2 ring-pink-300 ring-offset-2' : ''}`}
            >
                {business.isPinned && (
                    <div className="absolute top-2 right-2 text-pink-200 animate-in zoom-in">
                        <Pin className="w-3 h-3 fill-current" />
                    </div>
                )}
                
                {/* Decorative overlay for aesthetic depth */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                <div className="flex flex-col h-full justify-between gap-6 relative z-10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 text-pink-100 shadow-inner group-hover:rotate-12 transition-transform duration-300 ease-out">
                        <Wallet className="w-5 h-5 text-pink-100/90" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tight text-white">Due Book</h3>
                        <p className="text-xs text-pink-100/80 mt-0.5 font-medium">Manage Credits</p>
                    </div>
                </div>
            </div>

            {/* Placeholder for future options */}
            <div className="col-span-1 border-2 border-dashed border-slate-200 rounded-3xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white hover:border-emerald-200 transition-all active:scale-95 group bg-slate-50/50">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                </div>
                <p className="text-xs font-bold text-slate-400 group-hover:text-emerald-600">Add Option</p>
            </div>
        </div>
    </div>
  );
};