
import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, MapPin } from 'lucide-react';
import { Customer } from '../types';
import { SmartCameraInput } from './SmartCameraInput';

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
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && customer) {
      setName(customer.name);
      setPhone(customer.phoneNumber);
      setAddress(customer.address || '');
      setImage(customer.photoUrl || null);
    }
  }, [isOpen, customer]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(customer.id, {
      name: name.trim(),
      phoneNumber: phone.trim(),
      address: address.trim() || undefined,
      photoUrl: image || undefined,
      updatedAt: new Date()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
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
            
            <SmartCameraInput 
                onCapture={setImage} 
                currentImage={image} 
                label="Photo" 
            />

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
  );
};
