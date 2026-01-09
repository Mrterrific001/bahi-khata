import React from 'react';
import { ArrowLeft, Wallet, GraduationCap, FileText, ChevronRight, User, Phone, MapPin } from 'lucide-react';

interface GroupDetailViewProps {
  group: any;
  onBack: () => void;
  onOpenDues: () => void;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({ group, onBack, onOpenDues }) => {
  return (
    <div className="min-h-screen bg-slate-50 animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-slate-100 sticky top-0 z-20">
         <button 
             onClick={onBack}
             className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
         >
             <ArrowLeft className="w-6 h-6" />
         </button>
         <span className="font-bold text-slate-800">Profile</span>
      </div>

      <div className="p-6">
         {/* Institution Profile Card */}
         <div className="flex flex-col items-center mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl mb-4 ${
                 group.type === 'CLASS' 
                 ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-200' 
                 : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200'
            }`}>
                {group.name.substring(0, 1)}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 text-center">{group.name}</h1>
            <p className="text-slate-500 font-medium">Institution</p>
            
            <div className="flex items-center gap-2 mt-4 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                 <User className="w-3.5 h-3.5" />
                 <span>Admin: {group.adminName || 'Admin'}</span>
            </div>
         </div>

         {/* Options Grid */}
         <div className="grid grid-cols-1 gap-4">
             
             {/* Dues Option */}
             <button 
                onClick={onOpenDues}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all hover:shadow-md hover:border-indigo-100"
             >
                 <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                         <Wallet className="w-6 h-6" />
                     </div>
                     <div className="text-left">
                         <h3 className="font-bold text-slate-800 text-lg">Dues & Fees</h3>
                         <p className="text-xs text-slate-500 font-medium">View history & status</p>
                     </div>
                 </div>
                 <div className="flex items-center gap-3">
                     {group.totalDue > 0 ? (
                        <span className="text-sm font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                            ₹{group.totalDue} Due
                        </span>
                     ) : (
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            Settled
                        </span>
                     )}
                     <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />
                 </div>
             </button>

             {/* Test Marks Option (Placeholder) */}
             <button className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all hover:shadow-md hover:border-emerald-100">
                 <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                         <GraduationCap className="w-6 h-6" />
                     </div>
                     <div className="text-left">
                         <h3 className="font-bold text-slate-800 text-lg">Test Marks</h3>
                         <p className="text-xs text-slate-500 font-medium">Performance report</p>
                     </div>
                 </div>
                 <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-400" />
             </button>

             {/* Attendance (Placeholder) */}
             <button className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all hover:shadow-md hover:border-blue-100">
                 <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                         <FileText className="w-6 h-6" />
                     </div>
                     <div className="text-left">
                         <h3 className="font-bold text-slate-800 text-lg">Attendance</h3>
                         <p className="text-xs text-slate-500 font-medium">Monthly record</p>
                     </div>
                 </div>
                 <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400" />
             </button>

         </div>

         {/* Contact Info */}
         <div className="mt-8 bg-slate-100 rounded-2xl p-4 space-y-3">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Contact Details</h3>
             <div className="flex items-center gap-3 text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                 <Phone className="w-4 h-4 text-slate-400" />
                 <span className="text-sm font-medium">Available via Admin</span>
             </div>
             {/* 
             <div className="flex items-center gap-3 text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                 <MapPin className="w-4 h-4 text-slate-400" />
                 <span className="text-sm font-medium">123, Gandhi Nagar, Delhi</span>
             </div> 
             */}
         </div>
      </div>
    </div>
  );
};
