import React, { useMemo } from 'react';
import { Plus, Ghost } from 'lucide-react';
import { Business, Customer } from '../types';
import { ShopCustomerCard } from './ShopCustomerCard';

interface ShopDuebookViewProps {
  business: Business;
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  onAddTab: () => void;
  onAddCustomer: () => void;
  onContextMenu: (customerId: string) => void;
  onEditImage: (customerId: string) => void;
  onAction: (type: 'ADD_DUE' | 'CLEAR_DUE', customerId: string) => void;
  onSelectCustomer: (customer: Customer) => void;
}

export const ShopDuebookView: React.FC<ShopDuebookViewProps> = ({
  business,
  activeTabId,
  setActiveTabId,
  onAddTab,
  onAddCustomer,
  onContextMenu,
  onEditImage,
  onAction,
  onSelectCustomer
}) => {
  const groups = business.customerGroups || [];

  // Filter and Sort Customers
  const activeCustomers = useMemo(() => {
      const filtered = (business.customers || []).filter(c => (c.groupId || 'general') === activeTabId);
      return filtered.sort((a, b) => {
          // Pinned first
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          // Then by Updated At descending
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [business.customers, activeTabId]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Tabs Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-4 px-4 mb-2 scroll-pl-4">
            {groups.map(group => (
                <button
                    key={group.id}
                    onClick={() => setActiveTabId(group.id)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all shadow-sm ${
                        activeTabId === group.id 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-300 scale-100' 
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {group.name}
                </button>
            ))}
            
            <button 
                onClick={onAddTab}
                className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all active:scale-95"
            >
                <Plus className="w-5 h-5" />
            </button>
        </div>
        
        <div className="text-xs text-center text-slate-400 mb-3">Long press a customer to pin or delete.</div>

        {/* Customer List */}
        <div className="space-y-3 pb-24">
            {activeCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                    <Ghost className="w-20 h-20 text-slate-300 mb-4 animate-bounce" />
                    <p className="text-slate-400 font-medium text-sm">No customers in this list.</p>
                </div>
            ) : (
                activeCustomers.map(customer => (
                    <ShopCustomerCard 
                        key={customer.id} 
                        customer={customer} 
                        onClick={() => onSelectCustomer(customer)}
                        onClearDue={() => onAction('CLEAR_DUE', customer.id)}
                        onAddDue={() => onAction('ADD_DUE', customer.id)}
                        onEditImage={() => onEditImage(customer.id)}
                        onLongPress={() => onContextMenu(customer.id)}
                    />
                ))
            )}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-6 z-40">
            <button
            onClick={onAddCustomer}
            className="group relative flex items-center justify-center w-16 h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-300 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
            <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
            </button>
        </div>
    </div>
  );
};