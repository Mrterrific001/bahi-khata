import React, { useRef } from 'react';
import { X, Download, Upload, FileJson, AlertCircle, HelpCircle, Layout, LogOut, User, Edit2, Mail, Phone } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  currentUiVersion?: 'modern' | 'classic';
  onToggleUiVersion?: () => void;
  userProfile: UserProfile | null;
  onEditProfile: () => void;
  onLogout: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ 
  isOpen, 
  onClose, 
  onExport, 
  onImport,
  currentUiVersion = 'modern',
  onToggleUiVersion,
  userProfile,
  onEditProfile,
  onLogout
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
    // Reset
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-zinc-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-[70] w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
             <h2 className="text-xl font-bold text-zinc-800">Settings</h2>
             <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-200">
               <X className="w-5 h-5" />
             </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
             
             {/* Profile Section */}
             {userProfile && (
                <div className="p-6 bg-gradient-to-br from-violet-600 to-indigo-700 text-white mb-2">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 overflow-hidden shrink-0">
                         {userProfile.photoUrl ? (
                             <img src={userProfile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center">
                                 <User className="w-8 h-8 text-white/50" />
                             </div>
                         )}
                      </div>
                      <div className="min-w-0">
                          <h3 className="font-bold text-lg truncate">{userProfile.name}</h3>
                          <div className="flex items-center gap-1.5 text-indigo-100 text-xs mt-0.5 truncate">
                              <Mail className="w-3 h-3" />
                              <span>{userProfile.email}</span>
                          </div>
                      </div>
                   </div>
                   
                   <button 
                      onClick={onEditProfile}
                      className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
                   >
                       <Edit2 className="w-3.5 h-3.5" />
                       Edit Profile
                   </button>
                </div>
             )}

             <div className="p-6 space-y-8">
                {/* Appearance Section */}
                {onToggleUiVersion && (
                    <section>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Appearance</h3>
                        <button 
                            onClick={onToggleUiVersion}
                            className="w-full flex items-center gap-3 p-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 active:scale-[0.98] transition-all group"
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${currentUiVersion === 'modern' ? 'bg-violet-50 text-violet-600 group-hover:bg-violet-100' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
                                <Layout className="w-5 h-5" />
                            </div>
                            <div className="text-left flex-1">
                                <p className="font-bold text-zinc-700">Switch UI Theme</p>
                                <p className="text-xs text-zinc-400">Current: {currentUiVersion === 'modern' ? 'Modern Violet' : 'Classic Indigo'}</p>
                            </div>
                        </button>
                    </section>
                )}

                {/* Data Management Section */}
                <section>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Data Management</h3>
                    
                    <div className="space-y-3">
                    {/* Export */}
                    <button 
                        onClick={onExport}
                        className="w-full flex items-center gap-3 p-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 active:scale-[0.98] transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <Download className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-zinc-700">Export Data</p>
                            <p className="text-xs text-zinc-400">Save backup to file</p>
                        </div>
                    </button>

                    {/* Import */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center gap-3 p-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 active:scale-[0.98] transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                            <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-zinc-700">Import Data</p>
                            <p className="text-xs text-zinc-400">Restore from backup</p>
                        </div>
                    </button>
                    <input 
                        type="file" 
                        accept=".json" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                    </div>
                </section>

                {/* Guide Section */}
                <section>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Guide</h3>
                    <div className="bg-zinc-50 p-4 rounded-xl space-y-4 text-sm text-zinc-600 border border-zinc-100">
                    <div className="flex gap-3">
                        <FileJson className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                        <p>Data is exported as a <span className="font-mono text-xs bg-zinc-200 px-1 py-0.5 rounded">.json</span> file. Keep this file safe.</p>
                    </div>
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p>Importing data will <strong>replace</strong> or <strong>merge</strong> with your current businesses. Be careful.</p>
                    </div>
                    <div className="flex gap-3">
                        <HelpCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <p>You can use the exported file to transfer your data to another device.</p>
                    </div>
                    </div>
                </section>
             </div>
          </div>

          {/* Footer / Logout */}
          <div className="p-6 border-t border-zinc-100">
             <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-red-100 bg-red-50 text-red-600 font-bold hover:bg-red-100 active:scale-[0.98] transition-all"
             >
                 <LogOut className="w-4 h-4" />
                 Log Out
             </button>
             <p className="text-center text-xs text-zinc-400 mt-4">v1.4.0 • Bahi Khata</p>
          </div>
        </div>
      </div>
    </>
  );
};
