import React, { useState, useMemo } from 'react';
import { ArrowLeft, Edit2, Phone, MapPin, Calendar, ArrowUpRight, ArrowDownLeft, Wallet, CheckCircle } from 'lucide-react';
import { Customer } from '../types';
import { ShopEditCustomerModal } from './ShopEditCustomerModal';

interface ShopCustomerDetailViewProps {
  customer: Customer;
  onBack: () => void;
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => void;
}

export const ShopCustomerDetailView: React.FC<ShopCustomerDetailViewProps> = ({ 
  customer, 
  onBack, 
  onUpdateCustomer 
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handle Scroll for Animation
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop);
  };

  // Sort History: Newest First
  const history = useMemo(() => {
    return [...(customer.paymentHistory || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [customer.paymentHistory]);

  // Animation Values
  const imageScale = Math.max(0.9, 1 - scrollY / 1000);
  const imageOpacity = Math.max(0, 1 - scrollY / 300);
  
  // Header Opacity
  const headerOpacity = Math.min(1, scrollY / 100);

  // Fallback image generator
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 bg-slate-50 z-[200] flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* NEW STYLE HEADER - Always visible */}
      <div className="absolute top-0 left-0 right-0 z-[60]">
         {/* Background that fades in on scroll */}
         <div 
            className="absolute inset-0 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-opacity duration-200"
            style={{ opacity: headerOpacity }}
         />

         <div className="relative flex justify-between items-center px-4 py-3">
            <button 
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-md shadow-sm border border-black/5 flex items-center justify-center text-slate-800 active:scale-95 transition-all hover:bg-white"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            
            <span 
                className="font-bold text-slate-800 text-lg transition-opacity duration-200"
                style={{ opacity: headerOpacity }}
            >
                {customer.name}
            </span>

            <button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-md shadow-sm border border-black/5 flex items-center justify-center text-slate-800 active:scale-95 transition-all hover:bg-white"
            >
                <Edit2 className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar" onScroll={handleScroll}>
        
        {/* Hero Section (Image) */}
        <div className="relative w-full h-[360px]">
            <div 
                className="absolute inset-0 w-full h-full origin-top"
                style={{ 
                    transform: `scale(${imageScale})`,
                    opacity: imageOpacity + 0.1 
                }}
            >
                {customer.photoUrl ? (
                    <img src={customer.photoUrl} alt={customer.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <span className="text-6xl font-black text-white/10">{getInitials(customer.name)}</span>
                    </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Name on Image */}
            <div 
                className="absolute bottom-10 left-6 right-6 text-white z-10"
                style={{ 
                    opacity: 1 - scrollY / 200,
                    transform: `translateY(${scrollY * 0.3}px)`
                }}
            >
                <h1 className="text-3xl font-black leading-tight drop-shadow-md">{customer.name}</h1>
                <div className="flex items-center gap-2 mt-2 opacity-90 text-sm font-medium">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phoneNumber}</span>
                </div>
            </div>
        </div>

        {/* Content Body - Overlapping the image */}
        <div className="relative bg-slate-50 min-h-screen rounded-t-[2.5rem] -mt-8 pt-8 px-6 pb-24 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            
            {/* Stats Summary */}
            <div className="flex gap-4 mb-8">
                <div className={`flex-1 p-5 rounded-2xl border shadow-sm ${customer.totalDue > 0 ? 'bg-white border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Current Due</p>
                    <div className={`text-2xl font-black flex items-center gap-2 ${customer.totalDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {customer.totalDue > 0 ? (
                            <>
                                ₹{customer.totalDue}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-6 h-6" /> Paid
                            </>
                        )}
                    </div>
                </div>
                {customer.advanceAmount > 0 && (
                    <div className="flex-1 p-5 rounded-2xl bg-white border border-yellow-100 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Advance</p>
                        <div className="text-2xl font-black text-yellow-600 flex items-center gap-2">
                             ₹{customer.advanceAmount}
                        </div>
                    </div>
                )}
            </div>

            {/* Info Section */}
            {(customer.address) && (
                <div className="mb-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                     <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">Info</h3>
                     <div className="space-y-3">
                        {customer.address && (
                            <div className="flex items-start gap-3 text-slate-600">
                                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                <span className="text-sm">{customer.address}</span>
                            </div>
                        )}
                        <div className="flex items-start gap-3 text-slate-600">
                            <Calendar className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="text-sm">Added {new Date(customer.createdAt).toLocaleDateString()}</span>
                        </div>
                     </div>
                </div>
            )}

            {/* Transaction History */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-indigo-500" />
                    Payment History
                </h3>

                {history.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                        <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No transaction history yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((record) => {
                            // CORRECTED LOGIC (Swapped Signs):
                            // DUE_ADDED = (-)
                            // PAYMENT = (+)
                            const isDueAdded = record.type === 'DUE_ADDED'; 
                            
                            return (
                                <div key={record.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                            isDueAdded ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                                        }`}>
                                            {isDueAdded ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{record.description}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {new Date(record.date).toLocaleDateString(undefined, { 
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-right font-bold ${isDueAdded ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        <p>{isDueAdded ? '-' : '+'} ₹{record.amount}</p>
                                        <p className="text-[10px] font-medium opacity-60 uppercase">{isDueAdded ? 'Due Added' : 'Payment'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
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