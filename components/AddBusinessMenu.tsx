import React, { useState, useEffect } from 'react';
import { GraduationCap, Store, X, ChevronRight, ArrowLeft, User } from 'lucide-react';
import { BusinessType } from '../types';

interface AddBusinessMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (type: BusinessType, name: string, ownerName?: string) => void;
}

export const AddBusinessMenu: React.FC<AddBusinessMenuProps> = ({ isOpen, onClose, onCreate }) => {
  const [step, setStep] = useState<'SELECT' | 'NAME_INPUT'>('SELECT');
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');

  // Reset state when menu opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('SELECT');
      setBusinessName('');
      setOwnerName('');
      setSelectedType(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTypeSelect = (type: BusinessType) => {
    setSelectedType(type);
    setStep('NAME_INPUT');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessName.trim() && selectedType) {
      // Validate owner name if shop
      if (selectedType === BusinessType.SHOP && !ownerName.trim()) {
          return;
      }
      onCreate(selectedType, businessName.trim(), ownerName.trim() || undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-in slide-in-from-bottom-10 fade-in duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            {step === 'NAME_INPUT' && (
              <button 
                onClick={() => setStep('SELECT')}
                className="p-1 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-slate-800">
              {step === 'SELECT' ? 'Add New Business' : 'Business Details'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'SELECT' ? (
            <div className="space-y-4">
              {/* Option 1: Teacher & Student */}
              <button
                onClick={() => handleTypeSelect(BusinessType.TEACHER_STUDENT)}
                className="group w-full relative overflow-hidden bg-white border-2 border-slate-100 hover:border-indigo-500 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100 text-left flex items-center gap-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 w-14 h-14 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-8 h-8" />
                </div>
                
                <div className="relative z-10 flex-1">
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors">Teacher & Student</h3>
                  <p className="text-sm text-slate-500 leading-tight mt-1">Coaching / Institute</p>
                </div>
                
                <div className="relative z-10 text-slate-300 group-hover:text-indigo-500 transition-colors">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </button>

              {/* Option 2: Shop */}
              <button
                onClick={() => handleTypeSelect(BusinessType.SHOP)}
                className="group w-full relative overflow-hidden bg-white border-2 border-slate-100 hover:border-emerald-500 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-100 text-left flex items-center gap-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Store className="w-8 h-8" />
                </div>
                
                <div className="relative z-10 flex-1">
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">Shop</h3>
                  <p className="text-sm text-slate-500 leading-tight mt-1">Inventory & Billing</p>
                </div>

                <div className="relative z-10 text-slate-300 group-hover:text-emerald-500 transition-colors">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="space-y-2">
                <label htmlFor="instituteName" className="block text-sm font-medium text-slate-700">
                   {selectedType === BusinessType.TEACHER_STUDENT ? 'Institute Name' : 'Shop Name'}
                </label>
                <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                    id="instituteName"
                    type="text"
                    autoFocus
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={selectedType === BusinessType.TEACHER_STUDENT ? "e.g. Physics Wallah" : "e.g. Gupta General Store"}
                    className="w-full pl-12 pr-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
              </div>

              {selectedType === BusinessType.SHOP && (
                  <div className="space-y-2 animate-in fade-in">
                    <label htmlFor="ownerName" className="block text-sm font-medium text-slate-700">
                        Owner Name
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                        id="ownerName"
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. Rahul Gupta"
                        className="w-full pl-12 pr-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                  </div>
              )}
              
              <button
                type="submit"
                disabled={!businessName.trim() || (selectedType === BusinessType.SHOP && !ownerName.trim())}
                className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 ${
                    selectedType === BusinessType.TEACHER_STUDENT 
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                }`}
              >
                {selectedType === BusinessType.TEACHER_STUDENT ? 'Create Institute' : 'Create Shop'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};