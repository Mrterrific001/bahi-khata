import React from 'react';
import { Home, Users } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'HOME' | 'GROUPS';
  onTabChange: (tab: 'HOME' | 'GROUPS') => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 z-[45] pb-safe shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <button
          onClick={() => onTabChange('HOME')}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95 group"
        >
          <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === 'HOME' ? 'bg-violet-50' : 'bg-transparent'}`}>
            <Home 
              className={`w-6 h-6 transition-colors duration-300 ${activeTab === 'HOME' ? 'text-violet-600 fill-violet-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
              strokeWidth={activeTab === 'HOME' ? 2.5 : 2} 
            />
          </div>
          <span className={`text-[10px] font-bold transition-colors duration-300 ${activeTab === 'HOME' ? 'text-violet-600' : 'text-slate-400'}`}>
            Home
          </span>
        </button>

        <button
          onClick={() => onTabChange('GROUPS')}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95 group"
        >
          <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === 'GROUPS' ? 'bg-indigo-50' : 'bg-transparent'}`}>
            <Users 
              className={`w-6 h-6 transition-colors duration-300 ${activeTab === 'GROUPS' ? 'text-indigo-600 fill-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
              strokeWidth={activeTab === 'GROUPS' ? 2.5 : 2} 
            />
          </div>
          <span className={`text-[10px] font-bold transition-colors duration-300 ${activeTab === 'GROUPS' ? 'text-indigo-600' : 'text-slate-400'}`}>
            Groups
          </span>
        </button>
      </div>
    </div>
  );
};
