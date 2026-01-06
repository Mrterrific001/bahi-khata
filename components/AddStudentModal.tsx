import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Calendar, Wallet } from 'lucide-react';
import { ImageCropper } from './ImageCropper';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyFee: number;
  onAdd: (name: string, fatherName: string, address: string, phone: string, image: string | undefined, joiningDate: Date, initialDue: number) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, monthlyFee, onAdd }) => {
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Image State
  const [rawImage, setRawImage] = useState<string | null>(null); // For cropping
  const [croppedImage, setCroppedImage] = useState<string | null>(null); // Final result
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Due calculation state
  const [dueMode, setDueMode] = useState<'MONTHS' | 'MANUAL'>('MONTHS');
  const [dueMonths, setDueMonths] = useState('0');
  const [manualDue, setManualDue] = useState('0');

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImage(reader.result as string);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (cropped: string) => {
    setCroppedImage(cropped);
    setRawImage(null);
  };

  const getFinalDue = () => {
    if (dueMode === 'MONTHS') {
        return (parseInt(dueMonths) || 0) * monthlyFee;
    }
    return parseInt(manualDue) || 0;
  };

  const finalDue = getFinalDue();
  const isDueZero = finalDue === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(
      name.trim(), 
      fatherName.trim(),
      address.trim(),
      phone.trim(), 
      croppedImage || undefined,
      new Date(joiningDate),
      finalDue
    );
    // Reset form
    setName('');
    setFatherName('');
    setAddress('');
    setPhone('');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setDueMonths('0');
    setManualDue('0');
    setDueMode('MONTHS');
    setCroppedImage(null);
    setRawImage(null);
    onClose();
  };

  return (
    <>
      {rawImage && (
        <ImageCropper 
          imageSrc={rawImage} 
          onCrop={handleCropComplete} 
          onCancel={() => setRawImage(null)} 
        />
      )}

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 transform transition-all animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Add Student</h2>
            <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Image Upload */}
            <div className="flex justify-center">
               <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-slate-100 cursor-pointer flex flex-col items-center justify-center text-slate-400 transition-all overflow-hidden group shadow-sm"
               >
                  {croppedImage ? (
                     <img src={croppedImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                     <>
                       <ImageIcon className="w-8 h-8 mb-1 group-hover:scale-110 transition-transform" />
                       <span className="text-[10px] font-medium uppercase tracking-wider">Photo</span>
                     </>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-medium">Change</span>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
               </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Student Name</label>
                  <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                  />
              </div>

              <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Father's Name</label>
                  <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                  />
              </div>

              <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Address / Location</label>
                  <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Near Gandhi Chowk"
                  className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                  />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Phone</label>
                    <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all text-slate-600"
                  />
                </div>
              </div>

              {/* Initial Due Section */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                 <label className="block text-sm font-medium text-slate-700">Initial Pending Due</label>
                 
                 <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setDueMode('MONTHS')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        dueMode === 'MONTHS'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      By Months
                    </button>
                    <button
                      type="button"
                      onClick={() => setDueMode('MANUAL')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        dueMode === 'MANUAL'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      Manual
                    </button>
                 </div>

                 {dueMode === 'MONTHS' ? (
                    <div className={`p-3 rounded-xl border transition-colors ${
                       isDueZero ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-100'
                    }`}>
                       <div className="flex items-center gap-3">
                          <button type="button" onClick={() => setDueMonths(Math.max(0, parseInt(dueMonths) - 1).toString())} className={`w-8 h-8 rounded-lg bg-white border flex items-center justify-center font-bold transition-colors ${isDueZero ? 'border-slate-200 text-slate-600 hover:bg-slate-100' : 'border-red-100 text-red-600 hover:bg-red-100'}`}>-</button>
                          <div className="flex-1 text-center">
                             <span className={`block text-lg font-bold ${isDueZero ? 'text-slate-700' : 'text-red-700'}`}>{dueMonths} Months</span>
                             <span className={`text-xs font-medium ${isDueZero ? 'text-slate-500' : 'text-red-500'}`}>= ₹{(parseInt(dueMonths) || 0) * monthlyFee}</span>
                          </div>
                          <button type="button" onClick={() => setDueMonths((parseInt(dueMonths) + 1).toString())} className={`w-8 h-8 rounded-lg bg-white border flex items-center justify-center font-bold transition-colors ${isDueZero ? 'border-slate-200 text-slate-600 hover:bg-slate-100' : 'border-red-100 text-red-600 hover:bg-red-100'}`}>+</button>
                       </div>
                    </div>
                 ) : (
                    <input
                      type="number"
                      min="0"
                      value={manualDue}
                      onChange={(e) => setManualDue(e.target.value)}
                      placeholder="0"
                      className={`w-full px-4 py-3 bg-white text-slate-900 rounded-xl border focus:ring-4 outline-none transition-all placeholder:text-slate-400 font-bold ${
                        isDueZero 
                          ? 'border-slate-200 focus:border-slate-400 focus:ring-slate-100' 
                          : 'border-slate-200 focus:border-red-500 focus:ring-red-100 text-red-700'
                      }`}
                    />
                 )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
            >
              Add Student
            </button>
          </form>
        </div>
      </div>
    </>
  );
};