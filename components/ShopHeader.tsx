import React from 'react';
import { ArrowLeft, Store, Settings, Search, Sparkles } from 'lucide-react';

interface ShopHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({ title, subtitle, onBack }) => {
  return (
    <header className="sticky top-0 z-50 mb-2">
      {/* Fancy Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-b-[2rem] shadow-lg shadow-emerald-900/10 overflow-hidden">
        {/* Abstract Shapes/Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
      </div>

      <div className="relative pt-4 pb-6 px-6">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="p-2.5 -ml-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all active:scale-95 border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all active:scale-95 border border-white/10">
                <Search className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all active:scale-95 border border-white/10">
                <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 px-1">
          <div className="w-14 h-14 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border-2 border-white/50 shadow-lg shadow-emerald-900/10 shrink-0">
            <Store className="w-7 h-7 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight leading-none text-white truncate drop-shadow-sm">{title}</h1>
            <div className="flex items-center gap-2 mt-1.5 opacity-90">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-400 border border-emerald-300">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-900" />
                </span>
                <p className="text-sm font-medium text-emerald-50 truncate">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};