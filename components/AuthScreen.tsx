
import React, { useState } from 'react';
import { BookOpen, Sparkles, ArrowRight, ShieldCheck, Zap, AlertCircle, User } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, isFirebaseEnabled } from '../lib/firebase';

interface AuthScreenProps {
  onLogin: (email: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    if (isFirebaseEnabled && auth && googleProvider) {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            if (user && user.email) {
                onLogin(user.email);
            }
        } catch (err: any) {
            console.error("Login failed", err);
            // Show the actual error message from Firebase (e.g., domain not authorized)
            const errorMessage = err.message || "Failed to sign in. Please try again.";
            setError(errorMessage);
            setIsLoading(false);
        }
    } else {
        setTimeout(() => {
            onLogin('guest@bahi-khata.local');
        }, 800);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      <div className="absolute top-0 left-0 w-full h-[55%] bg-gradient-to-br from-violet-600 to-indigo-700 rounded-b-[3rem] shadow-2xl z-0 overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>
         <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-2xl"></div>
         <div className="absolute top-20 -left-20 w-60 h-60 bg-purple-400/20 rounded-full blur-2xl"></div>
         <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 p-8 text-center animate-in slide-in-from-bottom-10 fade-in duration-700">
         
         <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-violet-200 rounded-2xl rotate-6 opacity-50"></div>
            <div className="absolute inset-0 bg-indigo-100 rounded-2xl -rotate-3 flex items-center justify-center shadow-inner">
                 <BookOpen className="w-10 h-10 text-violet-600" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1.5 shadow-sm animate-bounce">
                <Sparkles className="w-3 h-3 text-yellow-900" />
            </div>
         </div>

         <div className="space-y-2 mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bahi Khata</h1>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
                The smart way to manage your<br/>shop & students seamlessly.
            </p>
         </div>

         {error && (
             <div className="mb-4 bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-start text-left justify-center gap-2 break-words">
                 <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                 <span>{error}</span>
             </div>
         )}
         
         {!isFirebaseEnabled && (
             <div className="mb-4 text-xs bg-amber-50 text-amber-700 p-2 rounded-lg border border-amber-100">
                 Running in Offline Guest Mode
             </div>
         )}

         <button 
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group relative overflow-hidden"
         >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="opacity-90">Please wait...</span>
                </div>
            ) : (
                <>
                  <div className="bg-white p-1 rounded-full">
                    {isFirebaseEnabled ? (
                         <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="G" />
                    ) : (
                         <User className="w-4 h-4 text-slate-900" />
                    )}
                  </div>
                  <span>{isFirebaseEnabled ? 'Continue with Google' : 'Enter as Guest'}</span>
                  <ArrowRight className="w-5 h-5 opacity-0 -ml-4 group-hover:ml-0 group-hover:opacity-100 transition-all" />
                </>
            )}
         </button>
      </div>
      
      <div className="absolute bottom-6 text-slate-400 text-xs flex items-center gap-2">
         <ShieldCheck className="w-3 h-3" />
         <span>Secure & Private • v1.4.0</span>
      </div>
    </div>
  );
};
