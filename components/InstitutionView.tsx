import React, { useState, useRef, useMemo } from 'react';
import { Plus, Users, Pin, TrendingUp } from 'lucide-react';
import { Business, ClassGroup } from '../types';
import { Header } from './Header';
import { AddClassModal } from './AddClassModal';
import { ClassContextMenu } from './ClassContextMenu';
import { ClassInfoModal } from './ClassInfoModal';
import { ConfirmationModal } from './ConfirmationModal';

interface InstitutionViewProps {
  business: Business;
  onBack: () => void;
  onUpdate: (updatedBusiness: Business) => void;
  onSelectClass: (classId: string) => void;
  onTogglePin: (classId: string) => void;
}

export const InstitutionView: React.FC<InstitutionViewProps> = ({ 
  business, 
  onBack, 
  onUpdate, 
  onSelectClass,
  onTogglePin 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  const [contextMenuClassId, setContextMenuClassId] = useState<string | null>(null);
  const [infoModalClassId, setInfoModalClassId] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stats = useMemo(() => {
      let totalDue = 0;
      let totalCollected = 0;
      let studentsWithDues = 0;
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      business.classes?.forEach(c => {
          c.students?.forEach(s => {
              totalDue += s.totalDue;
              if(s.totalDue > 0) studentsWithDues++;
              s.paymentHistory.forEach(p => {
                  const d = new Date(p.date);
                  if(d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                      totalCollected += p.amount;
                  }
              });
          });
      });
      return { totalDue, totalCollected, studentsWithDues };
  }, [business]);

  const handleAddClass = (
      standard: string, 
      name: string | undefined, 
      fee: number, 
      totalCourseFee: number | undefined, 
      duration: number | undefined, 
      startDate: Date | undefined,
      feeOverrides: Record<string, number> | undefined
  ) => {
    const newClass: ClassGroup = {
      id: crypto.randomUUID(),
      standard,
      batchName: name,
      feeAmount: fee,
      totalCourseFee,
      courseDuration: duration,
      startDate: startDate || new Date(),
      feeOverrides,
      createdAt: new Date(),
      students: [],
      isPinned: false
    };

    const updatedBusiness = {
      ...business,
      classes: [newClass, ...(business.classes || [])]
    };

    onUpdate(updatedBusiness);
  };
  
  const handleUpdateClass = (classId: string, updates: Partial<ClassGroup>) => {
      const updatedClasses = (business.classes || []).map(cls => {
          if (cls.id === classId) {
              return { ...cls, ...updates };
          }
          return cls;
      });
      onUpdate({ ...business, classes: updatedClasses });
  };

  const handleDeleteClass = () => {
    if (!classToDelete) return;
    const updatedClasses = (business.classes || []).filter(cls => cls.id !== classToDelete);
    onUpdate({ ...business, classes: updatedClasses });
    setClassToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const sortedClasses = [...(business.classes || [])].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    const stdA = parseInt(a.standard);
    const stdB = parseInt(b.standard);
    if (stdA !== stdB) return stdA - stdB;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const handleTouchStart = (classId: string) => {
    timerRef.current = setTimeout(() => {
      setContextMenuClassId(classId);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 600); 
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const activeContextMenuClass = business.classes?.find(c => c.id === contextMenuClassId);
  const activeInfoClass = business.classes?.find(c => c.id === infoModalClassId);
  const deleteTargetClass = business.classes?.find(c => c.id === classToDelete);

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      <Header 
        title={business.name} 
        subtitle="Institution Manager" 
        showBack={true} 
        onBack={onBack} 
      />

      <main className="max-w-md mx-auto px-6 pt-6 space-y-8">
        
        {/* Dashboard Overview - Modern Violet */}
        <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-3xl p-6 text-white shadow-xl shadow-violet-200 transform transition-all hover:scale-[1.01]">
            <h2 className="text-violet-100 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Institution Overview
            </h2>
            <div className="grid grid-cols-2 gap-y-6">
                <div>
                    <p className="text-3xl font-bold">₹{stats.totalDue.toLocaleString()}</p>
                    <p className="text-xs text-violet-200 mt-1">Total Pending Due</p>
                </div>
                <div>
                    <p className="text-3xl font-bold">₹{stats.totalCollected.toLocaleString()}</p>
                    <p className="text-xs text-violet-200 mt-1">Collected This Month</p>
                </div>
                <div className="col-span-2 pt-4 border-t border-white/10 flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="font-bold">{stats.studentsWithDues} Students</span>
                        <span className="text-xs text-violet-200 ml-1">have pending dues</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="mb-4 text-xs text-zinc-400 text-center">
            Long press a class for options.
        </div>
        
        {sortedClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10 text-center space-y-6">
            <div className="w-24 h-24 bg-white border-2 border-dashed border-zinc-200 rounded-2xl flex items-center justify-center mb-2">
               <Users className="w-10 h-10 text-zinc-300" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-zinc-800">No Classes Yet</h3>
              <p className="text-zinc-500 mt-2 max-w-xs mx-auto">
                Tap the plus button to add your first class or batch.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
             {sortedClasses.map((cls) => (
               <div 
                key={cls.id} 
                onClick={() => onSelectClass(cls.id)}
                onMouseDown={() => handleTouchStart(cls.id)}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                onTouchStart={() => handleTouchStart(cls.id)}
                onTouchEnd={handleTouchEnd}
                className={`relative bg-white p-5 rounded-2xl shadow-sm border flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] duration-200 select-none ${
                    cls.isPinned ? 'border-violet-200 ring-1 ring-violet-100' : 'border-zinc-100 hover:shadow-md'
                }`}
               >
                 {cls.isPinned && (
                    <div className="absolute -top-2 -right-2 bg-violet-600 text-white p-1 rounded-full shadow-sm z-10">
                        <Pin className="w-3 h-3 fill-current" />
                    </div>
                 )}
                 
                 <div className="flex items-center gap-4 w-full">
                   <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold border ${cls.isPinned ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-violet-50 text-violet-600 border-violet-100'}`}>
                      <span className="text-xs font-normal opacity-70 leading-none mb-0.5">Class</span>
                      <span className="text-lg leading-none">{cls.standard}</span>
                   </div>
                   <div>
                     <h3 className="font-bold text-zinc-800 text-lg">
                       {cls.batchName || `Class ${cls.standard}`}
                     </h3>
                     <p className="text-xs text-zinc-500 font-medium">
                       {cls.students?.length || 0} Students • ₹{cls.feeAmount}/mo
                     </p>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        )}

      </main>

      <div className="fixed bottom-8 right-6 z-40">
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center justify-center w-16 h-16 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl shadow-xl shadow-violet-300 hover:shadow-violet-400 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-violet-200"
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <AddClassModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddClass}
      />

      <ClassContextMenu 
         isOpen={!!contextMenuClassId}
         onClose={() => setContextMenuClassId(null)}
         classNameStr={activeContextMenuClass?.batchName || `Class ${activeContextMenuClass?.standard}`}
         isPinned={!!activeContextMenuClass?.isPinned}
         onTogglePin={() => contextMenuClassId && onTogglePin(contextMenuClassId)}
         onShowInfo={() => setInfoModalClassId(contextMenuClassId)}
         onDelete={() => {
            setClassToDelete(contextMenuClassId);
            setIsDeleteModalOpen(true);
         }}
      />

      {activeInfoClass && (
         <ClassInfoModal 
            isOpen={!!infoModalClassId}
            onClose={() => setInfoModalClassId(null)}
            classGroup={activeInfoClass}
            onUpdateClass={(updates) => handleUpdateClass(activeInfoClass.id, updates)}
         />
      )}

      <ConfirmationModal 
         isOpen={isDeleteModalOpen}
         onClose={() => setIsDeleteModalOpen(false)}
         onConfirm={handleDeleteClass}
         title="Delete Class"
         message="Are you sure you want to delete this class? All students and their data in this class will be lost."
         itemName={deleteTargetClass?.batchName || `Class ${deleteTargetClass?.standard}`}
         confirmLabel="Delete Class"
      />
    </div>
  );
};