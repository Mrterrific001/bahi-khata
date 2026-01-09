import React, { useState } from 'react';
import { Search, MoreVertical, Bell, ChevronRight, CheckCheck, Loader2, AlertCircle } from 'lucide-react';
import { GroupDetailView } from './GroupDetailView';
import { GroupDuesView } from './GroupDuesView';
import { useStudentGroups } from '../hooks/useStudentGroups';

type ViewMode = 'LIST' | 'DETAIL' | 'DUES_FEED';

export const GroupsTab: React.FC = () => {
  const { groups, loading, markRead, userPhone } = useStudentGroups();
  const [viewMode, setViewMode] = useState<ViewMode>('LIST');
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const handleGroupClick = (group: any) => {
    setSelectedGroup(group);
    markRead(group.id); // Mark as read when opened
    setViewMode('DETAIL');
  };

  const handleOpenDues = () => {
    setViewMode('DUES_FEED');
  };

  const handleBack = () => {
    if (viewMode === 'DUES_FEED') {
      setViewMode('DETAIL');
    } else {
      setViewMode('LIST');
      setSelectedGroup(null);
    }
  };

  if (viewMode === 'DETAIL' && selectedGroup) {
      // Adapt ledger data to GroupDetailView props structure if needed
      // For now, we pass the ledger entry directly as it mimics the structure well enough
      const detailGroup = {
          name: selectedGroup.businessName,
          type: selectedGroup.type,
          admin: selectedGroup.adminName,
          ...selectedGroup
      };
      return <GroupDetailView group={detailGroup} onBack={handleBack} onOpenDues={handleOpenDues} />;
  }

  if (viewMode === 'DUES_FEED' && selectedGroup) {
      return (
        <GroupDuesView 
          groupName={selectedGroup.businessName} 
          totalDue={selectedGroup.totalDue}
          timeline={selectedGroup.timeline || []}
          onBack={handleBack} 
        />
      );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
         <h1 className="text-xl font-bold text-slate-800 tracking-tight">Broadcasters</h1>
         <div className="flex items-center gap-3">
             <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                <Search className="w-5 h-5" />
             </button>
         </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
         {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                 <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                 <p className="text-slate-400 text-sm">Finding your groups...</p>
             </div>
         ) : !userPhone ? (
             <div className="bg-amber-50 p-6 rounded-2xl text-center border border-amber-100">
                 <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                     <AlertCircle className="w-6 h-6 text-amber-600" />
                 </div>
                 <h3 className="font-bold text-amber-800 mb-1">Profile Incomplete</h3>
                 <p className="text-sm text-amber-700">Please add your Phone Number in Settings to find your institutions.</p>
             </div>
         ) : groups.length === 0 ? (
             <div className="text-center py-20">
                 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Bell className="w-8 h-8 text-slate-300" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-700">No Broadcasters Yet</h3>
                 <p className="text-slate-500 text-sm mt-1 px-8">
                     Ask your admin to add you using your phone number: 
                     <br/><span className="font-mono font-bold text-slate-800 mt-2 block">{userPhone}</span>
                 </p>
             </div>
         ) : (
             groups.map((group) => {
                 // Determine Status Text based on timeline
                 const lastEvent = group.timeline && group.timeline.length > 0 ? group.timeline[0] : null;
                 const statusText = lastEvent ? lastEvent.title : (group.totalDue > 0 ? `Due: ₹${group.totalDue}` : 'No Dues');
                 const timeText = lastEvent ? new Date(lastEvent.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';

                 return (
                    <div 
                        key={group.id} 
                        onClick={() => handleGroupClick(group)}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center gap-4"
                    >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm ${
                                group.type === 'CLASS' 
                                ? 'bg-gradient-to-br from-indigo-500 to-violet-600' 
                                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                            }`}>
                                {group.businessName.substring(0, 1)}
                            </div>
                            {group.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                                    {group.unreadCount}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h3 className="text-base font-bold text-slate-900 truncate pr-2">{group.businessName}</h3>
                                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{timeText}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">Admin: {group.adminName}</p>
                            
                            <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                                group.unreadCount > 0 ? 'text-indigo-600' : 'text-slate-400'
                            }`}>
                                {group.unreadCount > 0 ? <Bell className="w-3 h-3 fill-current" /> : <CheckCheck className="w-3 h-3 text-emerald-500" />}
                                <span className="truncate">{statusText}</span>
                            </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                    </div>
                 );
             })
         )}
      </div>
    </div>
  );
};
