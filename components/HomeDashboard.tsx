
import React from 'react';
import { Plus, Store, ArrowRight, GraduationCap } from 'lucide-react';
import { Business, BusinessType } from '../types';
import { PinnedItemsSection, PinnedItem } from './PinnedItemsSection';

interface HomeDashboardProps {
  businesses: Business[];
  pinnedItems: PinnedItem[];
  uiVersion: 'modern' | 'classic';
  onOpenBusiness: (id: string, viewMode?: 'DASHBOARD' | 'DUEBOOK') => void;
  onOpenItem: (businessId: string, itemId: string) => void;
  onContextMenu: (businessId: string) => void;
  theme: { cardBg: string; border: string; }; 
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  businesses,
  pinnedItems,
  uiVersion,
  onOpenBusiness,
  onOpenItem,
  onContextMenu,
  theme
}) => {
  
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (businessId: string) => {
    timerRef.current = setTimeout(() => { 
        onContextMenu(businessId); 
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
    <main className="max-w-md mx-auto px-6 pt-4 space-y-8">
        
        {/* Pinned Section */}
        <PinnedItemsSection 
            items={pinnedItems}
            uiVersion={uiVersion}
            theme={theme}
            onOpenItem={onOpenItem}
            onOpenBusiness={onOpenBusiness}
        />

        {/* Businesses List */}
        <div className="space-y-4 pb-4">
             <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2">
                    <Store className={`w-4 h-4 ${uiVersion === 'modern' ? 'text-zinc-400' : 'text-slate-400'}`} />
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${uiVersion === 'modern' ? 'text-zinc-500' : 'text-slate-500'}`}>Your Workspaces</h3>
                 </div>
                 <span className={`text-[10px] ${uiVersion === 'modern' ? 'bg-zinc-200 text-zinc-600' : 'bg-slate-200 text-slate-500'} px-2 py-0.5 rounded-full`}>{businesses.length}</span>
             </div>

             {businesses.length === 0 ? (
                <div className={`${theme.cardBg} rounded-3xl p-8 text-center border border-dashed ${theme.border}`}>
                    <div className={`w-16 h-16 ${uiVersion === 'modern' ? 'bg-zinc-100' : 'bg-slate-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Plus className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className={`text-lg font-bold ${uiVersion === 'modern' ? 'text-zinc-700' : 'text-slate-700'}`}>No Workspaces</h3>
                    <p className={`text-sm mt-1 ${uiVersion === 'modern' ? 'text-zinc-400' : 'text-slate-400'}`}>Tap the + button to create one.</p>
                </div>
             ) : (
                 <div className="space-y-3">
                    {businesses.map((business) => (
                    <div 
                        key={business.id} 
                        onClick={() => onOpenBusiness(business.id, 'DASHBOARD')}
                        onMouseDown={() => handleTouchStart(business.id)}
                        onMouseUp={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                        onTouchStart={() => handleTouchStart(business.id)}
                        onTouchEnd={handleTouchEnd}
                        className={`${theme.cardBg} p-5 rounded-2xl shadow-sm border ${theme.border} flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer active:scale-[0.98] duration-200 relative overflow-hidden select-none group`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner 
                            ${business.type === BusinessType.TEACHER_STUDENT 
                                ? (uiVersion === 'modern' ? 'bg-violet-50 text-violet-600' : 'bg-indigo-50 text-indigo-600') 
                                : (uiVersion === 'modern' ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-600')
                            }`}
                        >
                            {business.type === BusinessType.TEACHER_STUDENT ? (
                            <GraduationCap className="w-7 h-7" />
                            ) : (
                            <Store className="w-7 h-7" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className={`font-bold text-lg truncate transition-colors ${uiVersion === 'modern' ? 'text-zinc-800 group-hover:text-violet-700' : 'text-slate-800 group-hover:text-indigo-700'}`}>{business.name}</h3>
                                {business.isNew && (
                                    <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide animate-pulse">
                                        New
                                    </span>
                                )}
                            </div>
                            <p className={`text-xs truncate flex items-center gap-2 mt-0.5 ${uiVersion === 'modern' ? 'text-zinc-500' : 'text-slate-500'}`}>
                                {business.type === BusinessType.TEACHER_STUDENT 
                                    ? <><span className={`w-1.5 h-1.5 rounded-full ${uiVersion === 'modern' ? 'bg-violet-400' : 'bg-indigo-400'}`}></span> {business.classes?.length || 0} Classes</> 
                                    : <><span className={`w-1.5 h-1.5 rounded-full ${uiVersion === 'modern' ? 'bg-rose-400' : 'bg-teal-400'}`}></span> {business.customers?.length || 0} Customers</>}
                            </p>
                        </div>
                        <div className="text-zinc-300 group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </div>
                    ))}
                 </div>
             )}
        </div>
    </main>
  );
};
