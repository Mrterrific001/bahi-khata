
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Edit2, Phone, MapPin, Calendar, ArrowUpRight, ArrowDownLeft, Wallet, CheckCircle, Plus } from 'lucide-react';
import { Customer } from '../types';
import { ShopEditCustomerModal } from './ShopEditCustomerModal';

interface ShopCustomerDetailViewProps {
  customer: Customer;
  onBack: () => void;
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => void;
  onAction: (type: 'ADD_DUE' | 'CLEAR_DUE') => void;
}

export const ShopCustomerDetailView: React.FC<ShopCustomerDetailViewProps> = ({ 
  customer, 
  onBack, 
  onUpdateCustomer,
  onAction
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Sort History: Newest First
  const history = useMemo(() => {
    return [...(customer.paymentHistory || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [customer.paymentHistory]);

  // Fallback image generator
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 bg-slate-50 z-[200] flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md px-4 py-3 flex justify-between items-center shadow-sm z-10 border-b border-slate-100">
         <button 
             onClick={onBack}
             className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors active:scale-95"
         >
             <ArrowLeft className="w-5 h-5" />
         </button>
         <span className="font-bold text-slate-800 text-base">Customer Profile</span>
         <button 
             onClick={() => setIsEditModalOpen(true)}
             className="p-2 -mr-2 text-slate-600 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors active:scale-95"
         >
             <Edit2 className="w-4 h-4" />
         </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-slate-50">
        
        {/* Profile Card - Redesigned */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm animate-in slide-in-from-bottom-8 duration-500">
             {/* Decorative Top Gradient */}
             <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                 <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
             </div>
             
             <div className="px-6 pb-6">
                 <div className="relative -mt-12 flex justify-between items-end mb-5">
                     {/* Smaller Image Size as requested (w-24 = 6rem) */}
                     <div className="relative group">
                         {customer.photoUrl ? (
                            <img 
                                src={customer.photoUrl} 
                                alt={customer.name} 
                                className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover bg-white" 
                            />
                         ) : (
                            <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                <span className="text-2xl font-black text-slate-400">{getInitials(customer.name)}</span>
                            </div>
                         )}
                         <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="absolute bottom-0 right-0 bg-white text-slate-600 p-1.5 rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
                         >
                            <Edit2 className="w-3.5 h-3.5" />
                         </button>
                     </div>

                     {/* Badges */}
                     <div className="flex flex-col items-end gap-1.5 mb-1">
                        {customer.advanceAmount > 0 && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm">
                                <Wallet className="w-3 h-3" />
                                <span>Adv: ₹{customer.advanceAmount}</span>
                            </div>
                        )}
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${customer.totalDue > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {customer.totalDue > 0 ? (
                                <>
                                    <span>Due:</span>
                                    <span className="text-sm">₹{customer.totalDue}</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>Settled</span>
                                </>
                            )}
                        </div>
                     </div>
                 </div>

                 {/* Name & Basic Info */}
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 leading-tight">{customer.name}</h2>
                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-3 text-slate-600">
                             <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4 text-slate-400" />
                             </div>
                             <span className="text-sm font-medium">{customer.phoneNumber}</span>
                        </div>
                        {customer.address && (
                            <div className="flex items-center gap-3 text-slate-600">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                </div>
                                <span className="text-sm font-medium">{customer.address}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-slate-600">
                             <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4 text-slate-400" />
                             </div>
                             <span className="text-sm font-medium">Added {new Date(customer.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                 </div>
             </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={() => onAction('CLEAR_DUE')}
                className="flex flex-col items-center justify-center gap-2 py-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all hover:bg-emerald-700"
             >
                <CheckCircle className="w-6 h-6" />
                <span className="font-bold text-sm">Accept Pay</span>
             </button>
             
             <button 
                onClick={() => onAction('ADD_DUE')}
                className="flex flex-col items-center justify-center gap-2 py-4 bg-white text-rose-600 border border-rose-100 rounded-2xl shadow-lg shadow-rose-100 active:scale-[0.98] transition-all hover:bg-rose-50"
             >
                <Plus className="w-6 h-6" />
                <span className="font-bold text-sm">Add New Due</span>
             </button>
        </div>

        {/* Transaction History */}
        <div>
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Recent Activity</h3>

            {history.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Wallet className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No transaction history found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((record) => {
                        const isDueAdded = record.type === 'DUE_ADDED'; 
                        
                        return (
                            <div key={record.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        isDueAdded ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                                    }`}>
                                        {isDueAdded ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm line-clamp-1">{record.description}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 font-medium">
                                            {new Date(record.date).toLocaleDateString(undefined, { 
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-right font-bold ${isDueAdded ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    <p>{isDueAdded ? '+' : '-'} ₹{record.amount}</p>
                                    <p className="text-[9px] font-bold opacity-60 uppercase tracking-wide">{isDueAdded ? 'Added' : 'Paid'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

      </div>

      <ShopEditCustomerModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
        onSave={onUpdateCustomer}
      />
    </div>
  );
};
