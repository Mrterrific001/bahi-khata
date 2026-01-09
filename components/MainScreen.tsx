import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Header } from './Header';
import { HomeDashboard } from './HomeDashboard';
import { GroupsTab } from './GroupsTab';
import { BottomNavigation } from './BottomNavigation';
import { Business } from '../types';
import { PinnedItem } from './PinnedItemsSection';

interface MainScreenProps {
  businesses: Business[];
  pinnedItems: PinnedItem[];
  uiVersion: 'modern' | 'classic';
  theme: { cardBg: string; border: string; };
  onOpenBusiness: (id: string, viewMode?: 'DASHBOARD' | 'DUEBOOK') => void;
  onOpenItem: (businessId: string, itemId: string) => void;
  onContextMenu: (businessId: string) => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenAddBusiness: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  businesses,
  pinnedItems,
  uiVersion,
  theme,
  onOpenBusiness,
  onOpenItem,
  onContextMenu,
  onOpenSettings,
  onOpenHistory,
  onOpenAddBusiness
}) => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'GROUPS'>('HOME');

  return (
    <div className="min-h-screen bg-zinc-50 transition-colors duration-500">
      
      {/* Header - Only shown for Home Tab (Groups has its own) */}
      {activeTab === 'HOME' && (
        <Header 
          variant="home" 
          title="Bahi Khata"
          subtitle="by P.Gupta"
          onOpenSettings={onOpenSettings}
          onOpenHistory={onOpenHistory}
          uiVersion={uiVersion}
        />
      )}

      {/* Content Area */}
      <main className="pb-20">
        {activeTab === 'HOME' ? (
          <div className="animate-in fade-in duration-300">
             <HomeDashboard 
                businesses={businesses}
                pinnedItems={pinnedItems}
                uiVersion={uiVersion}
                theme={theme}
                onOpenBusiness={onOpenBusiness}
                onOpenItem={onOpenItem}
                onContextMenu={onContextMenu}
             />
             
             {/* FAB for Adding Business (Only on Home) */}
             <div className="fixed bottom-24 right-6 z-40">
                <button
                  onClick={onOpenAddBusiness}
                  className={`group relative flex items-center justify-center w-16 h-16 text-white rounded-2xl shadow-xl transition-all duration-300 focus:outline-none hover:scale-105 active:scale-95 ${uiVersion === 'modern' ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-300 hover:shadow-violet-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-300 hover:shadow-indigo-400'}`}
                >
                  <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
                </button>
             </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right duration-300">
            <GroupsTab />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

    </div>
  );
};
