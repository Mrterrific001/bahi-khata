import React, { useState, useRef } from 'react';
import { X, User, Phone, MapPin, Wallet, Camera, Image as ImageIcon } from 'lucide-react';
import { ImageCropper } from './ImageCropper';

interface ShopAddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, phone: string, address: string | undefined, initialDue: number, image: string | undefined) => void;
}

export const ShopAddCustomerModal: React.FC<ShopAddCustomerModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [due, setDue] = useState('');
  
  // Image State
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    
    onAdd(
        name.trim(), 
        phone.trim(), 
        address.trim() || undefined, 
        Number(due) || 0,
        croppedImage || undefined
    );
    
    // Reset
    setName('');
    setPhone('');
    setAddress('');
    setDue('');
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

      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-in slide-in-from-bottom-10 duration-300 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Add Customer</h2>
            <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Image Upload */}
            <div className="flex justify-center mb-6">
               <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-slate-100 cursor-pointer flex flex-col items-center justify-center text-slate-400 transition-all overflow-hidden group shadow-sm"
               >
                  {croppedImage ? (
                     <img src={croppedImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                     <>
                       <Camera className="w-8 h-8 mb-1 group-hover:scale-110 transition-transform text-slate-300 group-hover:text-emerald-500" />
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Name <span className="text-rose-500">*</span></label>
              <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                      required
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Customer Name"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                  />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Phone Number <span className="text-rose-500">*</span></label>
              <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                      required
                      type="tel" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                  />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Address <span className="font-normal text-slate-300">(Optional)</span></label>
              <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                      type="text" 
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Near Market..."
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                  />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Initial Due Amount</label>
              <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                      type="number" 
                      min="0"
                      value={due}
                      onChange={e => setDue(e.target.value)}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-100 outline-none transition-all"
                  />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 mt-4 active:scale-[0.98] transition-all"
            >
              Add Customer
            </button>
          </form>
        </div>
      </div>
    </>
  );
};