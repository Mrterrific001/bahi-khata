
import React from 'react';
import { Pin, User, BookOpen, Wallet } from 'lucide-react';
import { Business, ClassGroup, Customer } from '../types';

export interface PinnedItem {
    type: 'CLASS' | 'CUSTOMER' | 'BUSINESS';
    data: ClassGroup | Customer | Business;
    businessName: string;
    businessId: string;
}

interface PinnedItemsSectionProps {
    items: PinnedItem[];
    uiVersion: 'modern' | 'classic';
    theme: { cardBg: string; border: string; };
    onOpenItem: (businessId: string, itemId: string) => void;
    onOpenBusiness: (businessId: string, viewMode?: 'DASHBOARD' | 'DUEBOOK') => void;
}

export const PinnedItemsSection: React.FC<PinnedItemsSectionProps> = ({ 
    items, 
    uiVersion, 
    theme, 
    onOpenItem,
    onOpenBusiness
}) => {
    if (items.length === 0) return null;

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 px-1">
                <Pin className={`w-4 h-4 ${uiVersion === 'modern' ? 'text-zinc-400 fill-zinc-400' : 'text-slate-400 fill-slate-400'}`} />
                <h3 className={`text-xs font-bold uppercase tracking-wider ${uiVersion === 'modern' ? 'text-zinc-500' : 'text-slate-500'}`}>Pinned</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {items.map((item) => {
                    const isBusiness = item.type === 'BUSINESS';
                    const isClass = item.type === 'CLASS';
                    
                    if (isBusiness) {
                        const bus = item.data as Business;
                        return (
                            <div 
                                key={`bus-${bus.id}`}
                                onClick={() => onOpenBusiness(bus.id, 'DUEBOOK')}
                                className="bg-gradient-to-br from-pink-500 to-rose-600 p-4 rounded-2xl shadow-lg shadow-pink-200 border border-pink-400/20 active:scale-95 transition-all cursor-pointer hover:shadow-xl group relative overflow-hidden text-white"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-20">
                                    <Pin className="w-4 h-4 fill-white" />
                                </div>
                                <div className="flex flex-col h-full justify-between gap-4 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-pink-50 shadow-inner group-hover:rotate-12 transition-transform duration-300">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold truncate text-sm text-white">{bus.name}</h4>
                                        <div className="flex items-center gap-1 mt-0.5 opacity-90">
                                            <span className="text-[10px] font-medium uppercase tracking-wider">Due Book</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // Handle Classes and Customers
                    const clsData = item.data as ClassGroup;
                    const custData = item.data as Customer;
                    
                    const title = isClass ? (clsData.batchName || `Class ${clsData.standard}`) : custData.name;
                    const badge = isClass ? `Std ${clsData.standard}` : 'Customer';
                    
                    const badgeStyle = isClass 
                        ? (uiVersion === 'modern' ? 'bg-violet-50 text-violet-700 border-violet-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100')
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100';

                    const Icon = isClass ? BookOpen : User;
                    const iconColor = isClass ? 'text-violet-300' : 'text-emerald-300';

                    return (
                        <div 
                            key={item.data.id}
                            onClick={() => onOpenItem(item.businessId, item.data.id)}
                            className={`${theme.cardBg} p-4 rounded-2xl shadow-sm border ${theme.border} active:scale-95 transition-all cursor-pointer hover:shadow-md group relative overflow-hidden`}
                        >
                            <div className="flex flex-col h-full justify-between gap-3">
                                <div className="flex justify-between items-start">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${badgeStyle}`}>
                                        {badge}
                                    </span>
                                    <Pin className={`w-3 h-3 ${iconColor} fill-current`} />
                                </div>
                                <div>
                                    <h4 className={`font-bold truncate text-sm ${uiVersion === 'modern' ? 'text-zinc-800' : 'text-slate-800'}`}>{title}</h4>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        {!isClass && <User className="w-3 h-3 text-slate-300" />}
                                        <p className={`text-[10px] truncate ${uiVersion === 'modern' ? 'text-zinc-400' : 'text-slate-400'}`}>{item.businessName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
