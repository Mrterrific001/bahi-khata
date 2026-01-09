
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Grid, MoreVertical } from 'lucide-react';
import { Business, Customer, PaymentRecord } from '../types';
import { ShopHeader } from './ShopHeader';
import { ShopStatsView } from './ShopStatsView';
import { ShopDuebookView } from './ShopDuebookView';
import { ShopCustomerDetailView } from './ShopCustomerDetailView';
import { ShopAddCustomerModal } from './ShopAddCustomerModal';
import { ShopAddTabModal } from './ShopAddTabModal';
import { ShopActionModal } from './ShopActionModal';
import { ShopCustomerContextMenu } from './ShopCustomerContextMenu';
import { ShopOptionContextMenu } from './ShopOptionContextMenu';
import { ConfirmationModal } from './ConfirmationModal';
import { processImage } from '../lib/imageCompression';

interface ShopViewProps {
  business: Business;
  initialGroupId?: string;
  initialView?: 'DASHBOARD' | 'DUEBOOK'; // New Prop
  onBack: () => void;
  onUpdate: (updatedBusiness: Business) => void;
  onTogglePin: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ business, initialGroupId, initialView, onBack, onUpdate, onTogglePin }) => {
  // State for View Mode
  // If initialGroupId exists (deep link) OR initialView is explicitly DUEBOOK (pinned item), start in DUEBOOK
  const [view, setView] = useState<'DASHBOARD' | 'DUEBOOK'>(
      (initialGroupId || initialView === 'DUEBOOK') ? 'DUEBOOK' : 'DASHBOARD'
  );

  // Initialization Logic for Groups
  useEffect(() => {
    if (!business.customerGroups || business.customerGroups.length === 0) {
        const defaultGroup = { id: 'general', name: 'General' };
        onUpdate({ 
            ...business, 
            customerGroups: [defaultGroup],
            customers: business.customers?.map(c => ({ ...c, groupId: c.groupId || 'general' })) || []
        });
    }
  }, [business.id]);

  const [activeTabId, setActiveTabId] = useState<string>(
      initialGroupId || business.customerGroups?.[0]?.id || 'general'
  );

  // If initialGroupId is provided (from History deep link), switch to DUEBOOK view automatically
  useEffect(() => {
    if (initialGroupId) {
        setView('DUEBOOK');
        setActiveTabId(initialGroupId);
    }
  }, [initialGroupId]);
  
  // Modals State
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddTabOpen, setIsAddTabOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: 'ADD_DUE' | 'CLEAR_DUE'; customerId: string } | null>(null);
  
  const [contextMenuCustomerId, setContextMenuCustomerId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  
  // Option Menu State (Due Book Pinning)
  const [isOptionMenuOpen, setIsOptionMenuOpen] = useState(false);

  // Image Editing State
  const [editingImageCustomerId, setEditingImageCustomerId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived state
  const groups = business.customerGroups || [];
  const selectedActionCustomer = business.customers?.find(c => c.id === actionModal?.customerId);
  const activeContextMenuCustomer = business.customers?.find(c => c.id === contextMenuCustomerId);
  const selectedCustomer = business.customers?.find(c => c.id === selectedCustomerId);


  // --- Handlers ---

  const handleAddTab = (name: string) => {
    const newGroup = { id: crypto.randomUUID(), name };
    onUpdate({
        ...business,
        customerGroups: [...groups, newGroup]
    });
    setActiveTabId(newGroup.id);
  };

  const handleAddCustomer = (name: string, phone: string, address: string | undefined, initialDue: number, image: string | undefined) => {
    const newCustomer: Customer = {
        id: crypto.randomUUID(),
        groupId: activeTabId,
        name,
        phoneNumber: phone,
        totalDue: initialDue,
        advanceAmount: 0,
        paymentHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPinned: false,
        ...(address ? { address } : {}),
        ...(image ? { photoUrl: image } : {})
    };
    onUpdate({
        ...business,
        customers: [newCustomer, ...(business.customers || [])]
    });
  };

  const handleTransaction = (amount: number, description: string) => {
     if (!actionModal || !selectedActionCustomer) return;

     const { type } = actionModal;
     const updatedCustomers = (business.customers || []).map(c => {
         if (c.id === selectedActionCustomer.id) {
             let newDue = c.totalDue;
             let newAdvance = c.advanceAmount;

             if (type === 'ADD_DUE') {
                 // Adding due reduces advance first, then adds to due (Merge Logic)
                 if (newAdvance >= amount) {
                     newAdvance -= amount;
                 } else {
                     const remainder = amount - newAdvance;
                     newAdvance = 0;
                     newDue += remainder;
                 }
             } else {
                 // CLEAR_DUE (or Advance Payment)
                 // Paying reduces due first, then adds to advance
                 if (newDue >= amount) {
                     newDue -= amount;
                 } else {
                     const remainder = amount - newDue;
                     newDue = 0;
                     newAdvance += remainder;
                 }
             }

             const paymentRecord: PaymentRecord = {
                 id: crypto.randomUUID(),
                 amount: amount,
                 date: new Date(),
                 description: description,
                 type: type === 'ADD_DUE' ? 'DUE_ADDED' : 'PAYMENT'
             };

             return {
                 ...c,
                 totalDue: newDue,
                 advanceAmount: newAdvance,
                 paymentHistory: [...c.paymentHistory, paymentRecord],
                 updatedAt: new Date()
             };
         }
         return c;
     });

     onUpdate({ ...business, customers: updatedCustomers });
  };

  const handleUpdateCustomer = (id: string, updates: Partial<Customer>) => {
      const updatedCustomers = (business.customers || []).map(c => 
          c.id === id ? { ...c, ...updates } : c
      );
      onUpdate({ ...business, customers: updatedCustomers });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && editingImageCustomerId) {
          try {
              const processed = await processImage(file);
              const updatedCustomers = (business.customers || []).map(c => 
                  c.id === editingImageCustomerId ? { ...c, photoUrl: processed, updatedAt: new Date() } : c
              );
              onUpdate({ ...business, customers: updatedCustomers });
          } catch(err) {
              console.error(err);
              alert("Failed to process image.");
          }
      }
      setEditingImageCustomerId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTogglePin = (customerId: string) => {
      const updatedCustomers = (business.customers || []).map(c => 
          c.id === customerId ? { ...c, isPinned: !c.isPinned } : c
      );
      onUpdate({ ...business, customers: updatedCustomers });
  };

  const handleDeleteCustomer = () => {
      if (!customerToDelete) return;
      const updatedCustomers = (business.customers || []).filter(c => c.id !== customerToDelete);
      onUpdate({ ...business, customers: updatedCustomers });
      setCustomerToDelete(null);
      setIsDeleteModalOpen(false);
  };

  // --- Views ---

  // 1. DASHBOARD VIEW
  if (view === 'DASHBOARD') {
      return (
          <div className="min-h-screen bg-slate-50 font-sans">
              <ShopHeader 
                title={business.name} 
                subtitle={business.ownerName || "Shop Manager"} 
                onBack={onBack} 
              />
              
              <main className="max-w-md mx-auto px-6">
                 <ShopStatsView 
                   business={business} 
                   onOpenDuebook={() => setView('DUEBOOK')}
                   onLongPressDuebook={() => setIsOptionMenuOpen(true)}
                 />
              </main>

              <ShopOptionContextMenu 
                isOpen={isOptionMenuOpen}
                onClose={() => setIsOptionMenuOpen(false)}
                isPinned={!!business.isPinned}
                onTogglePin={onTogglePin}
              />
          </div>
      );
  }

  // 2. DUEBOOK VIEW
  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* Hidden Inputs */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
      
      {/* Detail View Overlay */}
      {selectedCustomer && (
          <ShopCustomerDetailView 
              customer={selectedCustomer}
              onBack={() => setSelectedCustomerId(null)}
              onUpdateCustomer={handleUpdateCustomer}
              onAction={(type) => setActionModal({ isOpen: true, type, customerId: selectedCustomer.id })}
          />
      )}

      {/* Floating Island Header - HIDDEN WHEN CUSTOMER DETAILS ARE OPEN */}
      {!selectedCustomer && (
          <div className="sticky top-2 z-50 px-4 mb-4 animate-in slide-in-from-top-4 duration-300">
              <div className="bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-400/20 p-3 flex items-center justify-between border border-slate-800">
                  <button 
                    onClick={() => setView('DASHBOARD')} 
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors active:scale-90"
                  >
                      <ArrowRight className="w-5 h-5 text-slate-400 rotate-180" />
                  </button>
                  
                  <div className="flex flex-col items-center">
                      <h2 className="font-bold text-base tracking-wide flex items-center gap-2">
                          <Grid className="w-4 h-4 text-pink-500" />
                          DUE BOOK
                      </h2>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{business.name}</p>
                  </div>

                  <button className="w-10 h-10 rounded-xl hover:bg-slate-800 flex items-center justify-center transition-colors">
                      <MoreVertical className="w-5 h-5 text-slate-400" />
                  </button>
              </div>
          </div>
      )}

      {/* Main Content - Only visible when list is active */}
      {!selectedCustomer && (
        <main className="max-w-md mx-auto px-4">
            <ShopDuebookView 
            business={business}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            onAddTab={() => setIsAddTabOpen(true)}
            onAddCustomer={() => setIsAddCustomerOpen(true)}
            onContextMenu={setContextMenuCustomerId}
            onEditImage={(id) => {
                setEditingImageCustomerId(id);
                // Trigger input directly
                setTimeout(() => fileInputRef.current?.click(), 50);
            }}
            onAction={(type, id) => setActionModal({ isOpen: true, type, customerId: id })}
            onSelectCustomer={(c) => setSelectedCustomerId(c.id)}
            />
        </main>
      )}

      {/* Modals */}
      <ShopAddCustomerModal 
        isOpen={isAddCustomerOpen} 
        onClose={() => setIsAddCustomerOpen(false)} 
        onAdd={handleAddCustomer} 
      />

      <ShopAddTabModal
        isOpen={isAddTabOpen}
        onClose={() => setIsAddTabOpen(false)}
        onAdd={handleAddTab}
      />
      
      <ShopActionModal 
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        type={actionModal?.type || 'CLEAR_DUE'}
        customerName={selectedActionCustomer?.name || 'Customer'}
        currentDue={selectedActionCustomer?.totalDue || 0}
        onConfirm={handleTransaction}
      />

      <ShopCustomerContextMenu 
        isOpen={!!contextMenuCustomerId}
        onClose={() => setContextMenuCustomerId(null)}
        customerName={activeContextMenuCustomer?.name || ''}
        phoneNumber={activeContextMenuCustomer?.phoneNumber || ''}
        isPinned={!!activeContextMenuCustomer?.isPinned}
        onTogglePin={() => contextMenuCustomerId && handleTogglePin(contextMenuCustomerId)}
        onDelete={() => {
            setCustomerToDelete(contextMenuCustomerId);
            setContextMenuCustomerId(null);
            setIsDeleteModalOpen(true);
        }}
      />
      
      <ConfirmationModal 
         isOpen={isDeleteModalOpen}
         onClose={() => setIsDeleteModalOpen(false)}
         onConfirm={handleDeleteCustomer}
         title="Delete Customer"
         message="Are you sure you want to delete this customer? All records will be lost."
         itemName={business.customers?.find(c => c.id === customerToDelete)?.name || 'Customer'}
         confirmLabel="Delete Customer"
      />
    </div>
  );
};
