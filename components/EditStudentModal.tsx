import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Student } from '../types';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onSave: (id: string, updates: { name: string; fatherName: string; address: string; phoneNumber: string; joiningDate: Date }) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, onClose, student, onSave }) => {
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [joiningDate, setJoiningDate] = useState('');

  useEffect(() => {
    if (isOpen && student) {
      setName(student.name);
      setFatherName(student.fatherName || '');
      setAddress(student.address || '');
      setPhone(student.phoneNumber);
      // Format date for input type="date"
      const date = new Date(student.joiningDate);
      const formattedDate = date.toISOString().split('T')[0];
      setJoiningDate(formattedDate);
    }
  }, [isOpen, student]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(student.id, {
      name: name.trim(),
      fatherName: fatherName.trim(),
      address: address.trim(),
      phoneNumber: phone.trim(),
      joiningDate: new Date(joiningDate)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 transform transition-all animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Edit Details</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Student Name</label>
              <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
              />
          </div>

          <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Father's Name</label>
              <input
              type="text"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
              />
          </div>

          <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
                className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Joined On</label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};