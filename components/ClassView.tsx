
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Users, Search } from 'lucide-react';
import { ClassGroup } from '../types';
import { Header } from './Header';
import { StudentCard } from './StudentCard';
import { AddStudentModal } from './AddStudentModal';
import { ClearDueModal } from './ClearDueModal';
import { EditDueModal } from './EditDueModal';
import { StudentDetailView } from './StudentDetailView';
import { processImage } from '../lib/imageCompression';

interface ClassViewProps {
  classGroup: ClassGroup;
  initialSelectedStudentId?: string | null;
  onBack: () => void;
  onAddStudent: (name: string, fatherName: string, address: string, phone: string, image: string | undefined, joiningDate: Date, initialDue: number) => void;
  onUpdateStudentDue: (studentId: string, newDue: number) => void;
  onUpdateStudentImage: (studentId: string, newImageUrl: string) => void;
  onUpdateStudent: (id: string, updates: { name: string; fatherName: string; address: string; phoneNumber: string; joiningDate: Date }) => void;
  onDeleteStudent: (studentId: string) => void;
  onProcessPayment: (studentId: string, amount: number, monthsCleared: number, description: string) => void;
}

export const ClassView: React.FC<ClassViewProps> = ({ 
  classGroup, 
  initialSelectedStudentId,
  onBack, 
  onAddStudent, 
  onUpdateStudentDue, 
  onUpdateStudentImage,
  onUpdateStudent,
  onDeleteStudent,
  onProcessPayment
}) => {
  const [activeTab, setActiveTab] = useState<'DUEBOOK'>('DUEBOOK');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [clearDueStudentId, setClearDueStudentId] = useState<string | null>(null);
  const [editDueStudentId, setEditDueStudentId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const [editingImageStudentId, setEditingImageStudentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialSelectedStudentId) {
        setSelectedStudentId(initialSelectedStudentId);
    }
  }, [initialSelectedStudentId]);

  const students = classGroup.students || [];
  const activeStudentForClear = students.find(s => s.id === clearDueStudentId);
  const activeStudentForEdit = students.find(s => s.id === editDueStudentId);
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return [...students].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA === query && nameB !== query) return -1;
      if (nameB === query && nameA !== query) return 1;
      const startsA = nameA.startsWith(query);
      const startsB = nameB.startsWith(query);
      if (startsA && !startsB) return -1;
      if (startsB && !startsA) return 1;
      return 0;
    }).filter(s => s.name.toLowerCase().includes(query) || s.phoneNumber.includes(query));
  }, [students, searchQuery]);

  const handleClearDue = (amount: number, monthsCleared: number) => {
    if (!activeStudentForClear) return;
    const description = monthsCleared > 0 ? `Cleared ${monthsCleared} Month${monthsCleared > 1 ? 's' : ''}` : 'Manual Payment';
    onProcessPayment(activeStudentForClear.id, amount, monthsCleared, description);
  };

  const handleEditDueSave = (newDue: number) => {
    if (!activeStudentForEdit) return;
    onUpdateStudentDue(activeStudentForEdit.id, newDue);
  };

  const handleEditImageClick = (studentId: string) => {
    setEditingImageStudentId(studentId);
    // Add small delay to ensure ref is available if conditionally rendered
    setTimeout(() => { fileInputRef.current?.click(); }, 50);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingImageStudentId) {
        try {
            const processed = await processImage(file);
            onUpdateStudentImage(editingImageStudentId, processed);
        } catch (err) {
            console.error(err);
            alert("Failed to process image.");
        }
    }
    setEditingImageStudentId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (selectedStudent) {
    return (
      <>
       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      <StudentDetailView
        student={selectedStudent}
        classGroup={classGroup}
        monthlyFee={classGroup.feeAmount}
        onBack={() => setSelectedStudentId(null)}
        onClearDue={() => setClearDueStudentId(selectedStudent.id)}
        onEditImage={() => handleEditImageClick(selectedStudent.id)}
        onUpdateStudent={onUpdateStudent}
        onDeleteStudent={onDeleteStudent}
      />
       <ClearDueModal isOpen={!!clearDueStudentId} onClose={() => setClearDueStudentId(null)} studentName={activeStudentForClear?.name || ''} monthlyFee={classGroup.feeAmount} onClear={handleClearDue} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      <Header 
        title={classGroup.batchName || `Class ${classGroup.standard}`} 
        subtitle={`Std ${classGroup.standard} • ₹${classGroup.feeAmount}/mo`}
        showBack={true} 
        onBack={onBack} 
      />

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      <div className="sticky top-[73px] z-40 bg-zinc-50/95 backdrop-blur-sm px-6 pt-2 pb-2 border-b border-zinc-200/50">
        <div className="flex p-1 bg-white rounded-xl border border-zinc-200 shadow-sm">
          <button
            onClick={() => setActiveTab('DUEBOOK')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'DUEBOOK'
                ? 'bg-violet-50 text-violet-600 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            Duebook
          </button>
        </div>
      </div>

      <main className="max-w-md mx-auto px-6 pt-6">
        {activeTab === 'DUEBOOK' && (
          <>
            {students.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-12 text-center space-y-6">
                 <div className="w-24 h-24 bg-white border-2 border-dashed border-zinc-200 rounded-2xl flex items-center justify-center mb-2">
                    <Users className="w-10 h-10 text-zinc-300" />
                 </div>
                 <div>
                   <h3 className="text-xl font-semibold text-zinc-800">No Students Added</h3>
                   <p className="text-zinc-500 mt-2 max-w-xs mx-auto">
                     Add students to this batch to manage their fees and dues.
                   </p>
                 </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search students..." 
                        className="w-full bg-white text-zinc-900 pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:border-violet-500 outline-none transition-all shadow-sm focus:shadow-md"
                    />
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400 text-sm">
                        No students found matching "{searchQuery}"
                    </div>
                ) : (
                    filteredStudents.map((student) => (
                    <div key={student.id} onClick={() => setSelectedStudentId(student.id)} className="cursor-pointer">
                        <StudentCard 
                            student={student} 
                            totalCourseFee={classGroup.totalCourseFee}
                            onEditDue={(id) => setEditDueStudentId(id)}
                            onClearDue={(id) => setClearDueStudentId(id)}
                            onEditImage={(id) => handleEditImageClick(id)}
                        />
                    </div>
                    ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      <div className="fixed bottom-8 right-6 z-40">
        <button
          onClick={() => setIsAddStudentOpen(true)}
          className="group relative flex items-center justify-center w-16 h-16 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl shadow-xl shadow-violet-300 hover:shadow-violet-400 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-violet-200"
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <AddStudentModal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} monthlyFee={classGroup.feeAmount} onAdd={onAddStudent} />
      <ClearDueModal isOpen={!!clearDueStudentId} onClose={() => setClearDueStudentId(null)} studentName={activeStudentForClear?.name || ''} monthlyFee={classGroup.feeAmount} onClear={handleClearDue} />
      <EditDueModal isOpen={!!editDueStudentId} onClose={() => setEditDueStudentId(null)} studentName={activeStudentForEdit?.name || ''} currentDue={activeStudentForEdit?.totalDue || 0} advanceAmount={activeStudentForEdit?.advanceAmount || 0} monthlyFee={classGroup.feeAmount} onSave={handleEditDueSave} />
    </div>
  );
};
