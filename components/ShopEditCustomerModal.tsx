import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Camera, User, Phone, MapPin } from 'lucide-react';
import { Customer } from '../types';
import { ImageCropper } from './ImageCropper';

interface ShopEditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onSave: (id: string, updates: Partial<Customer>) => void;
}

export const ShopEditCustomerModal: React.FC<ShopEditCustomerModalProps> = ({ isOpen, onClose, customer, onSave }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Image State
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && customer) {
      setName(customer.name);
      setPhone(customer.phoneNumber);
      setAddress(customer.address || '');
      setCroppedImage(customer.photoUrl || null);
    }
  }, [isOpen, customer]);

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
    onSave(customer.id, {
      name: name.trim(),
      phoneNumber: phone.trim(),
      address: address.trim() || undefined,
      photoUrl: croppedImage || undefined,
      updatedAt: new Date()
    });
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
            <h2 className="text-xl font-bold text-slate-800">Edit Customer</h2>
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Name</label>
              <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                      required
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                  />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Phone</label>
              <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                      required
                      type="tel" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                  />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Address</label>
              <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                      type="text" 
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                  />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 mt-4 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </>
  );
};