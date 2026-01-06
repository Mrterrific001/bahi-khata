import React from 'react';
import { BookOpen, ArrowLeft, Menu, History } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenSettings?: () => void;
  onOpenHistory?: () => void;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  variant?: 'home' | 'standard' | 'transparent';
  uiVersion?: 'modern' | 'classic';
}

export const Header: React.FC<HeaderProps> = ({ 
  title = "Bahi Khata", 
  subtitle = "by P.Gupta", 
  showBack = false, 
  onBack,
  onOpenSettings,
  onOpenHistory,
  actionIcon,
  onAction,
  variant = 'standard',
  uiVersion = 'modern'
}) => {
  
  // Home Variant
  if (variant === 'home') {
    return (
      <header className="sticky top-0 z-50 pt-4 px-6 pb-4 bg-zinc-50/90 backdrop-blur-md">
        <div className="flex items-center justify-between">
           <button 
             onClick={onOpenHistory}
             className={`p-2.5 rounded-xl transition-all active:scale-95 shadow-sm border ${uiVersion === 'modern' ? 'bg-white text-zinc-600 border-zinc-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
           >
             <History className="w-6 h-6" />
           </button>
           
           <div className="flex flex-col items-center">
             <h1 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${uiVersion === 'modern' ? 'text-violet-900' : 'text-slate-800'}`}>
               <BookOpen className={`w-6 h-6 ${uiVersion === 'modern' ? 'text-violet-600' : 'text-indigo-600'}`} />
               {title}
             </h1>
             <span className={`text-[10px] font-semibold uppercase tracking-widest ${uiVersion === 'modern' ? 'text-zinc-400' : 'text-slate-400'}`}>{subtitle}</span>
           </div>

           <button 
             onClick={onOpenSettings}
             className={`p-2.5 rounded-xl transition-all active:scale-95 shadow-sm border ${uiVersion === 'modern' ? 'bg-white text-zinc-600 border-zinc-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
           >
             <Menu className="w-6 h-6" />
           </button>
        </div>
      </header>
    );
  }

  // Standard Variant (for inner pages)
  const isTransparent = variant === 'transparent';
  
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isTransparent ? 'bg-transparent' : 'bg-white/90 backdrop-blur-xl border-b border-zinc-200/60 shadow-sm'}`}>
      <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-3">
        {showBack && (
          <button 
            onClick={onBack}
            className="mr-1 p-2 -ml-2 rounded-full hover:bg-zinc-100 text-zinc-700 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h1 className={`font-bold text-zinc-900 tracking-tight leading-none truncate ${title.length > 20 ? 'text-lg' : 'text-2xl'}`}>{title}</h1>
          {subtitle && <p className="text-xs font-medium text-zinc-500 mt-1 truncate">{subtitle}</p>}
        </div>

        {actionIcon && onAction && (
          <button 
            onClick={onAction}
            className={`p-2 -mr-2 rounded-full transition-all active:scale-95 ${uiVersion === 'modern' ? 'text-zinc-500 hover:text-violet-600 hover:bg-violet-50' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
          >
            {actionIcon}
          </button>
        )}
      </div>
    </header>
  );
};