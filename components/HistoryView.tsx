import React, { useMemo, useState } from 'react';
import { ArrowLeft, Search, Calendar, User, ArrowUpRight, Store } from 'lucide-react';
import { PaymentRecord, BusinessType } from '../types';

interface Transaction extends PaymentRecord {
  studentId: string;
  studentName: string;
  businessId: string;
  businessName: string;
  businessType: BusinessType;
  classId?: string;
  className?: string;
}

interface HistoryViewProps {
  transactions: Transaction[];
  onBack: () => void;
  onNavigateToItem: (businessId: string, classId: string | undefined, studentId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ transactions, onBack, onNavigateToItem }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const sortedTransactions = useMemo(() => {
    let data = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(t => 
        t.studentName.toLowerCase().includes(q) || 
        t.businessName.toLowerCase().includes(q) ||
        t.className?.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return data;
  }, [transactions, searchQuery]);

  const totalRevenue = useMemo(() => transactions.reduce((sum, t) => sum + t.amount, 0), [transactions]);

  // Group by Date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    sortedTransactions.forEach(t => {
      const dateKey = t.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return groups;
  }, [sortedTransactions]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header & Stats Section */}
      <div className="bg-violet-950 text-white pt-6 pb-6 px-6 rounded-b-[2rem] shadow-xl z-20 sticky top-0">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Transaction History</h1>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
           <div>
              <p className="text-violet-200 text-xs uppercase tracking-wider font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">₹{totalRevenue.toLocaleString()}</p>
           </div>
           <div className="bg-emerald-500/20 p-2 rounded-xl">
              <ArrowUpRight className="w-6 h-6 text-emerald-400" />
           </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 px-6 pt-6 pb-6 overflow-y-auto">
        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg shadow-zinc-200/50 p-2 flex items-center gap-2 mb-6 border border-zinc-100">
           <Search className="w-5 h-5 text-zinc-400 ml-2" />
           <input 
             type="text" 
             placeholder="Search transactions..." 
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
             className="flex-1 bg-transparent outline-none text-zinc-700 placeholder:text-zinc-400 py-2"
           />
        </div>

        {Object.keys(groupedTransactions).length === 0 ? (
           <div className="text-center py-10 text-zinc-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No transactions found</p>
           </div>
        ) : (
          <div className="space-y-8">
            {(Object.entries(groupedTransactions) as [string, Transaction[]][]).map(([date, items]) => (
              <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="sticky top-0 bg-zinc-50/95 py-2 backdrop-blur-sm z-10 mb-2">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    {date}
                    </h3>
                </div>
                <div className="space-y-3">
                  {items.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => onNavigateToItem(t.businessId, t.classId, t.studentId)}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer hover:shadow-md"
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        t.businessType === BusinessType.TEACHER_STUDENT 
                          ? 'bg-indigo-50 text-indigo-600' // Blue/Indigo Theme for Institution
                          : 'bg-emerald-50 text-emerald-600' // Green Theme for Shop
                      }`}>
                         {t.businessType === BusinessType.TEACHER_STUDENT ? <User className="w-6 h-6" /> : <Store className="w-6 h-6" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-zinc-800 truncate text-base">{t.studentName}</h4>
                          <span className={`font-bold text-base ${t.businessType === BusinessType.SHOP ? 'text-emerald-600' : 'text-indigo-600'}`}>+₹{t.amount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5 truncate">
                           <span className="font-medium">{t.businessName}</span>
                           {t.className && (
                             <>
                               <span className="w-1 h-1 rounded-full bg-zinc-300" />
                               <span>{t.className}</span>
                             </>
                           )}
                        </div>
                        <div className="mt-2">
                             <span className="text-[10px] text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md font-medium">
                                {t.description}
                            </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};