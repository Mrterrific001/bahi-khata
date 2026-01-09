
import React, { useState } from 'react';
import { User, Phone, ArrowRight, Check, Shield, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { SmartCameraInput } from './SmartCameraInput';

interface ProfileSetupScreenProps {
  initialData?: UserProfile | null;
  defaultEmail?: string;
  onComplete: (profile: UserProfile) => Promise<void> | void;
  isEditing?: boolean;
  onCancel?: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ 
  initialData, 
  defaultEmail,
  onComplete, 
  isEditing = false,
  onCancel 
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phoneNumber || '');
  const [image, setImage] = useState<string | null>(initialData?.photoUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use email from data or default from login
  const email = initialData?.email || defaultEmail || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    
    try {
        const profile: UserProfile = {
          id: initialData?.id || 'current_user',
          name: name.trim(),
          email: email, // Use the read-only email
          createdAt: initialData?.createdAt || new Date(),
          ...(phone.trim() ? { phoneNumber: phone.trim() } : {}),
          ...(image ? { photoUrl: image } : {})
        };
        await onComplete(profile);
    } catch (err) {
        console.error("Error in profile setup:", err);
        setIsSaving(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[200] bg-slate-50 flex flex-col ${isEditing ? 'bg-black/50 backdrop-blur-sm' : ''}`}>
      
      {/* Main Container */}
      <div className={`flex-1 flex flex-col items-center justify-center p-6 ${isEditing ? 'h-full' : 'min-h-screen'}`}>
        <div className={`w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative ${isEditing ? 'animate-in zoom-in-95' : 'animate-in slide-in-from-bottom-10 fade-in duration-500'}`}>
           
           {/* Decorative Header */}
           <div className="h-32 bg-gradient-to-br from-violet-600 to-indigo-700 relative">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]"></div>
               <div className="absolute top-4 right-4">
                  {isEditing && onCancel && (
                      <button type="button" onClick={onCancel} className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors">
                          <ArrowRight className="w-5 h-5 rotate-180" />
                      </button>
                  )}
               </div>
           </div>

           {/* Content */}
           <div className="px-8 pb-8 -mt-16">
              
              <form onSubmit={handleSubmit}>
                  {/* Smart Camera Input */}
                  <div className="flex justify-center mb-8">
                     <SmartCameraInput 
                        onCapture={setImage} 
                        currentImage={image} 
                        circular={true}
                        label="Profile"
                     />
                  </div>

                  <div className="text-center mb-8">
                      <h2 className="text-2xl font-black text-slate-900">{isEditing ? 'Edit Profile' : 'Setup Profile'}</h2>
                      
                      {/* Read-Only Email Badge */}
                      <div className="flex items-center justify-center gap-1.5 mt-2 bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-xs font-bold w-fit mx-auto border border-slate-200">
                        <Shield className="w-3 h-3 text-emerald-500" />
                        {email || "No Email"}
                      </div>
                  </div>

                  <div className="space-y-5">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Full Name</label>
                          <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                              <input 
                                  required
                                  type="text" 
                                  value={name}
                                  onChange={e => setName(e.target.value)}
                                  disabled={isSaving}
                                  placeholder="e.g. Pradeep Gupta"
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all font-medium text-slate-800 disabled:opacity-60"
                              />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Phone (Optional)</label>
                          <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                              <input 
                                  type="tel" 
                                  value={phone}
                                  onChange={e => setPhone(e.target.value)}
                                  disabled={isSaving}
                                  placeholder="+91 98765 43210"
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all font-medium text-slate-800 disabled:opacity-60"
                              />
                          </div>
                      </div>
                  </div>

                  <button 
                      type="submit"
                      disabled={isSaving}
                      className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-bold py-4 rounded-xl shadow-xl shadow-violet-200 mt-8 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                  >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>{isEditing ? 'Save Changes' : 'Continue'}</span>
                          {isEditing ? <Check className="w-5 h-5" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </>
                      )}
                  </button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};
