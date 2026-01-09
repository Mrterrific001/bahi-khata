import React from 'react';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Calendar, Ghost } from 'lucide-react';
import { LedgerTimelineItem } from '../lib/ledgerService';

interface GroupDuesViewProps {
  groupName: string;
  totalDue: number;
  timeline: LedgerTimelineItem[];
  onBack: () => void;
}

export const GroupDuesView: React.FC<GroupDuesViewProps> = ({ groupName, totalDue, timeline, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header with Gradient Background */}
      <div className="bg-gradient-to-br from-indigo-900 to-violet-800 text-white pb-8 rounded-b-[2.5rem] shadow-xl relative z-10">
        <div className="px-4 py-4 flex items-center gap-3">
            <button 
                onClick={onBack}
                className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="font-semibold text-lg truncate">{groupName}</span>
        </div>

        <div className="px-8 mt-2 text-center">
            <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest mb-1">Current Outstanding</p>
            <h1 className="text-5xl font-black tracking-tight drop-shadow-sm">₹{totalDue}</h1>
            <div className="mt-4 flex justify-center gap-2">
                {totalDue > 0 ? (
                    <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 text-rose-100">
                        <AlertCircle className="w-3 h-3" />
                        Pending Payment
                    </span>
                ) : (
                    <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 text-emerald-100">
                        <CheckCircle className="w-3 h-3" />
                        All Cleared
                    </span>
                )}
            </div>
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="flex-1 px-6 -mt-4 relative z-20 pb-24 overflow-y-auto">
         {timeline.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm mt-4">
                <Ghost className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-slate-600 font-bold">No History</h3>
                <p className="text-slate-400 text-sm mt-1">No transaction history available yet.</p>
            </div>
         ) : (
             <div className="space-y-6 pt-4">
                {timeline.map((item, index) => (
                    <div key={item.id} className="flex gap-4">
                        {/* Timeline Line */}
                        <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full shrink-0 mt-2 ring-4 ring-slate-50 ${
                                item.type === 'PAYMENT' ? 'bg-emerald-500' : 
                                item.type === 'REQUEST' ? 'bg-amber-500' : 'bg-rose-500'
                            }`} />
                            {index !== timeline.length - 1 && (
                                <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                            )}
                        </div>

                        {/* Content Card */}
                        <div className="flex-1 pb-2">
                            <p className="text-xs text-slate-400 font-medium mb-1.5">
                                {new Date(item.date).toLocaleDateString(undefined, { 
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                            
                            <div className={`p-4 rounded-2xl border shadow-sm ${
                                item.type === 'PAYMENT' ? 'bg-white border-emerald-100' :
                                item.type === 'REQUEST' ? 'bg-amber-50 border-amber-100' :
                                'bg-white border-rose-100'
                            }`}>
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-bold text-sm ${
                                        item.type === 'PAYMENT' ? 'text-emerald-700' :
                                        item.type === 'REQUEST' ? 'text-amber-800' :
                                        'text-rose-700'
                                    }`}>
                                        {item.title}
                                    </h3>
                                    {item.amount !== undefined && item.amount !== null && (
                                        <span className={`font-bold ${
                                            item.type === 'PAYMENT' ? 'text-emerald-600' : 'text-rose-600'
                                        }`}>
                                            {item.type === 'PAYMENT' ? '+' : '-'}₹{item.amount}
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-sm text-slate-600 leading-snug">
                                    {item.message}
                                </p>

                                {/* Badge for Type */}
                                <div className="mt-3 flex items-center gap-1.5">
                                    {item.type === 'PAYMENT' && (
                                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                            <CheckCircle className="w-3 h-3" /> Paid
                                        </span>
                                    )}
                                    {item.type === 'DUE_ADDED' && (
                                        <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                            <Clock className="w-3 h-3" /> Due Added
                                        </span>
                                    )}
                                    {item.type === 'REQUEST' && (
                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                            <AlertCircle className="w-3 h-3" /> Admin Request
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
         )}
      </div>
    </div>
  );
};
