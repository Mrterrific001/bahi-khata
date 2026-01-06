import React, { useState } from 'react';
import { ArrowLeft, MapPin, Phone, User, Calendar, CheckCircle, Clock, IndianRupee, Pencil, Wallet, Gift, Trash2 } from 'lucide-react';
import { Student, ClassGroup } from '../types';
import { Header } from './Header';
import { EditStudentModal } from './EditStudentModal';
import { ConfirmationModal } from './ConfirmationModal';

interface StudentDetailViewProps {
  student: Student;
  classGroup: ClassGroup; // We need the full class object for course settings
  monthlyFee: number; // Kept for backwards compatibility if needed, but classGroup has feeAmount
  onBack: () => void;
  onClearDue: () => void;
  onEditImage: () => void;
  onUpdateStudent: (id: string, updates: { name: string; fatherName: string; address: string; phoneNumber: string; joiningDate: Date }) => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({ 
  student, 
  classGroup,
  onBack, 
  onClearDue,
  onEditImage,
  onUpdateStudent,
  onDeleteStudent
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Calculate Course Metrics
  const totalPaid = student.paymentHistory.reduce((sum, rec) => sum + rec.amount, 0);
  const totalCourseFee = classGroup.totalCourseFee || 0;
  const isCourseFullyPaid = totalCourseFee > 0 && totalPaid >= totalCourseFee;
  
  // Logic to generate the calendar
  const getCourseCalendar = () => {
    const months = [];
    // Start date should align with Class Start Date if fixed, or Student Joining if flexible.
    // For batch systems, it usually aligns with Class Start Date.
    // However, if the student joins late, the prompt implies "monthly fee completes course fee".
    // We will stick to student joining date for personal calendar view or class start date?
    // Using Class Start Date is safer for "Batch" logic.
    const startDate = classGroup.startDate ? new Date(classGroup.startDate) : new Date(student.joiningDate);
    
    const duration = classGroup.courseDuration || 12; // Default to 12 months if not set
    
    for (let i = 0; i < duration; i++) {
        const d = new Date(startDate);
        d.setMonth(d.getMonth() + i);
        months.push(d);
    }
    return months;
  };

  const calendarMonths = getCourseCalendar();
  const currentMonth = new Date();

  // Helper to calculate specific month cost
  const getMonthCost = (date: Date) => {
     const key = `${date.getFullYear()}-${date.getMonth()}`;
     return classGroup.feeOverrides?.[key] ?? classGroup.feeAmount;
  };

  // Helper to check status of a month
  const getMonthStatus = (date: Date, index: number) => {
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    const isFuture = date > currentMonth;
    
    const pending = student.pendingMonths || [];
    const isPending = pending.includes(monthName);
    
    // Calculate cumulative cost up to this month
    let cumulativeCost = 0;
    for(let i=0; i<=index; i++) {
        cumulativeCost += getMonthCost(calendarMonths[i]);
    }
    
    // Logic for "Free" months if Total Course Fee is set and exceeded
    let effectiveCostForThisMonth = getMonthCost(date);
    
    if (totalCourseFee > 0) {
        const prevCumulative = cumulativeCost - effectiveCostForThisMonth;
        if (prevCumulative >= totalCourseFee) {
             return 'FREE'; // Already paid full course fee in previous months steps
        }
        // If this month exceeds the cap, its effective cost is just the remainder
        if (cumulativeCost > totalCourseFee) {
            effectiveCostForThisMonth = totalCourseFee - prevCumulative;
            cumulativeCost = totalCourseFee; // Cap cumulative
        }
    }

    if (isPending) return 'DUE'; // Explicitly marked as Due
    
    if (isCourseFullyPaid) {
        // Double check if this specific month was actually "Free" due to cap
        if (totalCourseFee > 0 && (cumulativeCost - effectiveCostForThisMonth) >= totalCourseFee) return 'FREE';
        return 'CLEARED';
    }

    if (totalPaid >= cumulativeCost) return 'CLEARED';
    
    // Partial payment logic could go here, but for now binary Cleared/Future
    if (isFuture) return 'FUTURE';
    
    return 'CLEARED'; // Fallback
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header 
        title="Student Profile" 
        subtitle="Detailed Info & History" 
        showBack={true} 
        onBack={onBack}
        actionIcon={<Trash2 className="w-5 h-5 text-red-500" />}
        onAction={() => setIsDeleteModalOpen(true)}
      />

      <main className="max-w-md mx-auto px-6 pt-6 space-y-6">
        
        {/* Profile Card */}
        <div className={`rounded-3xl shadow-sm border overflow-hidden relative ${isCourseFullyPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
           <div className={`h-24 bg-gradient-to-r ${isCourseFullyPaid ? 'from-emerald-500 to-emerald-600' : 'from-indigo-500 to-indigo-600'}`}></div>
           <div className="px-6 pb-6">
             <div className="relative -mt-12 mb-4 flex justify-between items-end">
                <div onClick={onEditImage} className="relative group cursor-pointer">
                    <img 
                      src={student.photoUrl || "https://via.placeholder.com/150"} 
                      alt={student.name} 
                      className={`w-24 h-24 rounded-2xl shadow-md object-cover bg-white ${isCourseFullyPaid ? 'border-4 border-emerald-200' : 'border-4 border-white'}`}
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                        Edit
                    </div>
                </div>
                <div className="mb-1 text-right flex flex-col items-end gap-1">
                    {student.advanceAmount > 0 && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                            <Wallet className="w-3.5 h-3.5" />
                            Adv: ₹{student.advanceAmount}
                        </div>
                    )}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${student.totalDue > 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>
                        {student.totalDue > 0 ? (
                            <>
                                <Clock className="w-3.5 h-3.5" />
                                Due: ₹{student.totalDue}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                {isCourseFullyPaid ? 'Course Paid' : 'No Dues'}
                            </>
                        )}
                    </div>
                </div>
             </div>
             
             <div>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-full transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                </div>

                <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{student.phoneNumber}</span>
                    </div>
                    {student.fatherName && (
                        <div className="flex items-center gap-3 text-slate-600">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium">S/O {student.fatherName}</span>
                        </div>
                    )}
                    {student.address && (
                        <div className="flex items-center gap-3 text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium">{student.address}</span>
                        </div>
                    )}
                     <div className="flex items-center gap-3 text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">Joined: {new Date(student.joiningDate).toLocaleDateString()}</span>
                    </div>
                </div>
             </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
             {student.totalDue > 0 ? (
                <button 
                    onClick={onClearDue}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <CheckCircle className="w-5 h-5" />
                    Clear Due
                </button>
             ) : (
                 <button 
                    onClick={onClearDue}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Wallet className="w-5 h-5" />
                    Pay Advance
                </button>
             )}
        </div>

        {/* Course Calendar */}
        <div className="space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 justify-between">
                <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Course Calendar
                </span>
                {classGroup.totalCourseFee && (
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-lg text-slate-500">
                        Total: ₹{classGroup.totalCourseFee}
                    </span>
                )}
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
                {calendarMonths.map((date, idx) => {
                    const status = getMonthStatus(date, idx);
                    const cost = getMonthCost(date);
                    const monthStr = date.toLocaleString('default', { month: 'short', year: '2-digit' });
                    
                    let bgClass = 'bg-slate-50 border-slate-100 text-slate-400';
                    let icon = null;
                    let label = '';
                    let labelColor = 'text-slate-400';

                    if (status === 'DUE') {
                        bgClass = 'bg-red-50 border-red-100 text-red-700';
                        icon = <Clock className="w-4 h-4" />;
                        label = 'Due';
                        labelColor = 'text-red-700';
                    } else if (status === 'CLEARED') {
                        bgClass = 'bg-emerald-50 border-emerald-100 text-emerald-700';
                        icon = <CheckCircle className="w-4 h-4" />;
                        label = 'Paid';
                        labelColor = 'text-emerald-700';
                    } else if (status === 'FREE') {
                        bgClass = 'bg-amber-50 border-amber-100 text-amber-600';
                        icon = <Gift className="w-4 h-4" />;
                        label = 'Free';
                        labelColor = 'text-amber-600';
                    } else if (status === 'FUTURE') {
                        label = 'Future';
                        labelColor = 'text-slate-400';
                    }

                    return (
                        <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between ${bgClass}`}>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm leading-none">{monthStr}</span>
                                {status !== 'FREE' && (
                                    <span className="text-[10px] opacity-70 mt-1">₹{cost}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold uppercase tracking-wider opacity-90 ${labelColor}`}>{label}</span>
                                {icon}
                            </div>
                        </div>
                    );
                })}
            </div>
            {classGroup.startDate && (
                 <div className="text-center text-xs text-slate-400 mt-2">
                    Course Started: {new Date(classGroup.startDate).toLocaleDateString()}
                 </div>
            )}
        </div>

        {/* Payment History */}
        <div className="space-y-3">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-indigo-500" />
                Payment History
            </h3>
            {student.paymentHistory && student.paymentHistory.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                    {student.paymentHistory.slice().reverse().map((record) => (
                        <div key={record.id} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-slate-800 text-sm">{record.description}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-sm">
                                + ₹{record.amount}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
                    No payment history available.
                </div>
            )}
        </div>
      </main>

      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={student}
        onSave={onUpdateStudent}
      />
      
      <ConfirmationModal 
         isOpen={isDeleteModalOpen}
         onClose={() => setIsDeleteModalOpen(false)}
         onConfirm={() => {
            onDeleteStudent(student.id);
            setIsDeleteModalOpen(false);
            onBack();
         }}
         title="Delete Student"
         message="Are you sure you want to delete this student? This action cannot be undone."
         itemName={student.name}
         confirmLabel="Delete Student"
      />
    </div>
  );
};