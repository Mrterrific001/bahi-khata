import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Header } from './components/Header';
import { AddBusinessMenu } from './components/AddBusinessMenu';
import { InstitutionView } from './components/InstitutionView';
import { ClassView } from './components/ClassView';
import { ShopView } from './components/ShopView';
import { SettingsSidebar } from './components/SettingsSidebar';
import { BusinessContextMenu } from './components/BusinessContextMenu';
import { ConfirmationModal } from './components/ConfirmationModal';
import { HistoryView } from './components/HistoryView';
import { HomeDashboard } from './components/HomeDashboard'; 
import { PinnedItemsSection, PinnedItem } from './components/PinnedItemsSection';
import { AuthScreen } from './components/AuthScreen';
import { ProfileSetupScreen } from './components/ProfileSetupScreen';
import { Business, BusinessType, Student, PaymentRecord, UserProfile } from './types';
import { useBusinessData } from './hooks/useBusinessData';
import { exportData, importDataFromFile } from './lib/dataTransfer';
import { saveUserProfileToDB, loadUserProfileFromDB } from './lib/db';
import { auth, isFirebaseEnabled } from './lib/firebase';

export const App: React.FC = () => {
  const { businesses, isLoading: isDataLoading, addBusiness, updateBusiness, deleteBusiness, toggleClassPin, toggleBusinessPin, importData } = useBusinessData();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [uiVersion, setUiVersion] = useState<'modern' | 'classic'>('modern');
  
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [initialStudentId, setInitialStudentId] = useState<string | null>(null); 
  
  const [contextMenuBusinessId, setContextMenuBusinessId] = useState<string | null>(null);
  const [isDeleteBusinessModalOpen, setIsDeleteBusinessModalOpen] = useState(false);
  const [businessToDeleteId, setBusinessToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isFirebaseEnabled && auth) {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsAuthenticated(true);
                setCurrentUserEmail(user.email || '');
                setCurrentUserId(user.uid);
                
                try {
                    const profile = await loadUserProfileFromDB(user.uid);
                    if (profile) {
                        setUserProfile(profile);
                    } else {
                        setIsProfileSetupOpen(true);
                    }
                } catch (e) {
                    console.error("Error loading profile", e);
                }
            } else {
                setIsAuthenticated(false);
                setUserProfile(null);
            }
            setIsProfileLoading(false);
        });

        return () => unsubscribe();
    } else {
        const initGuest = async () => {
             setIsProfileLoading(false);
        };
        initGuest();
    }
  }, []);

  const handleLoginSuccess = async (email: string) => {
      setIsAuthenticated(true);
      setCurrentUserEmail(email);
      
      const uid = isFirebaseEnabled ? (auth?.currentUser?.uid || '') : 'guest_user';
      setCurrentUserId(uid);

      const profile = await loadUserProfileFromDB(uid);
      if (profile) {
          setUserProfile(profile);
      } else {
          setIsProfileSetupOpen(true);
      }
  };

  const handleProfileComplete = async (profileData: UserProfile) => {
      if (!currentUserId) return;
      
      const completeProfile = { ...profileData, id: currentUserId };
      await saveUserProfileToDB(completeProfile);
      setUserProfile(completeProfile);
      setIsProfileSetupOpen(false);
      setIsEditingProfile(false);
  };

  const handleLogout = async () => {
      if (isFirebaseEnabled && auth) {
          await signOut(auth);
      } else {
          setIsAuthenticated(false);
      }
      setIsSettingsOpen(false);
      setActiveBusinessId(null);
  };

  const allTransactions = useMemo(() => {
    const txs: any[] = [];
    businesses.forEach(b => {
      if (b.type === BusinessType.TEACHER_STUDENT && b.classes) {
        b.classes.forEach(c => {
          c.students?.forEach(s => {
            s.paymentHistory.forEach(p => {
              txs.push({
                ...p,
                studentId: s.id,
                studentName: s.name,
                classId: c.id,
                className: c.batchName || `Class ${c.standard}`,
                businessId: b.id,
                businessName: b.name,
                businessType: b.type
              });
            });
          });
        });
      }
      if (b.type === BusinessType.SHOP && b.customers) {
         b.customers.forEach(c => {
             const groupName = b.customerGroups?.find(g => g.id === c.groupId)?.name || 'General';
             c.paymentHistory.forEach(p => {
                 txs.push({
                     ...p,
                     studentId: c.id, 
                     studentName: c.name, 
                     classId: c.groupId,
                     className: groupName,
                     businessId: b.id,
                     businessName: b.name,
                     businessType: b.type
                 });
             });
         });
      }
    });
    return txs;
  }, [businesses]);

  const pinnedItems = useMemo(() => {
    const items: PinnedItem[] = [];
    
    businesses.forEach(b => {
        if (b.isPinned) {
            items.push({ type: 'BUSINESS', data: b, businessName: b.name, businessId: b.id });
        }

        if (b.type === BusinessType.TEACHER_STUDENT && b.classes) {
            b.classes.forEach(c => { 
                if (c.isPinned) items.push({ type: 'CLASS', data: c, businessName: b.name, businessId: b.id }); 
            });
        }
        if (b.type === BusinessType.SHOP && b.customers) {
            b.customers.forEach(c => {
                if (c.isPinned) items.push({ type: 'CUSTOMER', data: c, businessName: b.name, businessId: b.id });
            });
        }
    });
    return items;
  }, [businesses]);

  const sortedBusinesses = useMemo(() => {
    return [...businesses].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [businesses]);

  const handleNavigateFromHistory = (businessId: string, classId: string | undefined, studentId: string) => {
    setIsHistoryOpen(false);
    setActiveBusinessId(businessId);
    if (classId) {
      setActiveClassId(classId); 
    }
    setInitialStudentId(studentId);
  };

  const handleOpenBusiness = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    if (business?.isNew) {
        updateBusiness({ ...business, isNew: false });
    }
    setActiveBusinessId(businessId);
  };
  
  const handleOpenItem = (businessId: string, itemId: string) => {
      handleOpenBusiness(businessId);
      const bus = businesses.find(b => b.id === businessId);
      if (bus?.type === BusinessType.TEACHER_STUDENT) {
          setActiveClassId(itemId);
      } else if (bus?.type === BusinessType.SHOP) {
          const customer = bus.customers?.find(c => c.id === itemId);
          if (customer) {
              setActiveClassId(customer.groupId);
          }
      }
  };

  const handleExportData = () => {
    exportData(businesses, 'bahi_khata_backup.json');
  };
  
  const handleExportSingleBusiness = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    if (!business) return;
    exportData(business, `bahi_khata_${business.name.replace(/\s+/g, '_')}.json`);
  };

  const handleImportData = (file: File) => {
    importDataFromFile(file, (data) => {
      importData(data);
      setIsSettingsOpen(false);
    });
  };

  if (!isAuthenticated) {
      return <AuthScreen onLogin={handleLoginSuccess} />;
  }

  if (isProfileLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
      );
  }

  if (isProfileSetupOpen || (isAuthenticated && !userProfile)) {
      return (
          <ProfileSetupScreen 
             initialData={userProfile}
             defaultEmail={currentUserEmail}
             onComplete={handleProfileComplete} 
          />
      );
  }
  
  if (isEditingProfile && userProfile) {
      return (
          <ProfileSetupScreen 
             initialData={userProfile}
             defaultEmail={currentUserEmail}
             isEditing={true}
             onComplete={handleProfileComplete}
             onCancel={() => setIsEditingProfile(false)}
          />
      );
  }

  if (activeBusinessId) {
      const business = businesses.find(b => b.id === activeBusinessId);
      if (business) {
          if (business.type === BusinessType.TEACHER_STUDENT) {
              if (activeClassId) {
                  const activeClass = business.classes?.find(c => c.id === activeClassId);
                  if (activeClass) {
                      return (
                          <ClassView 
                            classGroup={activeClass}
                            initialSelectedStudentId={initialStudentId}
                            onBack={() => { setActiveClassId(null); setInitialStudentId(null); }}
                            onAddStudent={(name, fatherName, address, phone, image, joiningDate, initialDue) => {
                                const newStudent: Student = {
                                    id: crypto.randomUUID(),
                                    name, fatherName, address, phoneNumber: phone, photoUrl: image,
                                    totalDue: initialDue, advanceAmount: 0, pendingMonths: [], paymentHistory: [],
                                    joiningDate, createdAt: new Date()
                                };
                                const updatedClass = { ...activeClass, students: [newStudent, ...(activeClass.students || [])] };
                                const updatedBusiness = {
                                    ...business,
                                    classes: business.classes?.map(c => c.id === activeClass.id ? updatedClass : c)
                                };
                                updateBusiness(updatedBusiness);
                            }}
                            onUpdateStudent={(studentId, updates) => {
                                const updatedClass = {
                                    ...activeClass,
                                    students: activeClass.students?.map(s => s.id === studentId ? { ...s, ...updates } : s)
                                };
                                const updatedBusiness = { ...business, classes: business.classes?.map(c => c.id === activeClass.id ? updatedClass : c) };
                                updateBusiness(updatedBusiness);
                            }}
                            onUpdateStudentDue={(studentId, newDue) => {
                                 const updatedClass = {
                                     ...activeClass,
                                     students: activeClass.students?.map(s => s.id === studentId ? { ...s, totalDue: newDue } : s)
                                 };
                                 const updatedBusiness = { ...business, classes: business.classes?.map(c => c.id === activeClass.id ? updatedClass : c) };
                                 updateBusiness(updatedBusiness);
                            }}
                            onUpdateStudentImage={(studentId, img) => {
                                 const updatedClass = {
                                     ...activeClass,
                                     students: activeClass.students?.map(s => s.id === studentId ? { ...s, photoUrl: img } : s)
                                 };
                                 const updatedBusiness = { ...business, classes: business.classes?.map(c => c.id === activeClass.id ? updatedClass : c) };
                                 updateBusiness(updatedBusiness);
                            }}
                            onDeleteStudent={(studentId) => {
                                const updatedClass = {
                                    ...activeClass,
                                    students: activeClass.students?.filter(s => s.id !== studentId)
                                };
                                const updatedBusiness = { ...business, classes: business.classes?.map(c => c.id === activeClass.id ? updatedClass : c) };
                                updateBusiness(updatedBusiness);
                            }}
                            onProcessPayment={(studentId, amount, monthsCleared, description) => {
                                const updatedClass = {
                                     ...activeClass,
                                     students: activeClass.students?.map(s => {
                                         if (s.id === studentId) {
                                             const record: PaymentRecord = { id: crypto.randomUUID(), amount, date: new Date(), description, type: 'PAYMENT' };
                                             return { 
                                                 ...s, 
                                                 totalDue: Math.max(0, s.totalDue - amount), 
                                                 paymentHistory: [...s.paymentHistory, record] 
                                             };
                                         }
                                         return s;
                                     })
                                 };
                                 const updatedBusiness = { ...business, classes: business.classes?.map(c => c.id === activeClass.id ? updatedClass : c) };
                                 updateBusiness(updatedBusiness);
                            }}
                          />
                      );
                  }
              }
              return (
                  <InstitutionView 
                    business={business} 
                    onBack={() => setActiveBusinessId(null)}
                    onUpdate={updateBusiness}
                    onSelectClass={setActiveClassId}
                    onTogglePin={(classId) => toggleClassPin(business.id, classId)}
                  />
              );
          } else {
              return (
                  <ShopView 
                    business={business}
                    initialGroupId={activeClassId || undefined} 
                    onBack={() => { setActiveBusinessId(null); setActiveClassId(null); }}
                    onUpdate={updateBusiness}
                    onTogglePin={() => toggleBusinessPin(business.id)}
                  />
              );
          }
      }
  }

  if (isHistoryOpen) {
      return (
          <HistoryView 
            transactions={allTransactions}
            onBack={() => setIsHistoryOpen(false)}
            onNavigateToItem={handleNavigateFromHistory}
          />
      );
  }

  const theme = uiVersion === 'modern' 
    ? { cardBg: 'bg-white', border: 'border-zinc-100' }
    : { cardBg: 'bg-white', border: 'border-slate-100' };

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-500 ${uiVersion === 'modern' ? 'bg-zinc-50' : 'bg-slate-50'}`}>
      <Header 
        variant="home" 
        title="Bahi Khata"
        subtitle="by P.Gupta"
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        uiVersion={uiVersion}
      />

      <HomeDashboard 
        businesses={sortedBusinesses}
        pinnedItems={pinnedItems}
        uiVersion={uiVersion}
        onOpenBusiness={handleOpenBusiness}
        onOpenItem={handleOpenItem}
        onContextMenu={(id) => { setContextMenuBusinessId(id); }}
        theme={theme}
      />

      <div className="fixed bottom-8 right-6 z-40">
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`group relative flex items-center justify-center w-16 h-16 text-white rounded-2xl shadow-xl transition-all duration-300 focus:outline-none hover:scale-105 ${uiVersion === 'modern' ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-300 hover:shadow-violet-400 focus:ring-4 focus:ring-violet-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-300 hover:shadow-indigo-400 focus:ring-4 focus:ring-indigo-200'}`}
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <AddBusinessMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onCreate={(type, name, owner) => {
            const newId = addBusiness(type, name, owner);
            setIsMenuOpen(false);
        }}
      />

      <SettingsSidebar 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onExport={handleExportData}
        onImport={handleImportData}
        currentUiVersion={uiVersion}
        onToggleUiVersion={() => setUiVersion(prev => prev === 'modern' ? 'classic' : 'modern')}
        userProfile={userProfile}
        onEditProfile={() => { setIsSettingsOpen(false); setIsEditingProfile(true); }}
        onLogout={handleLogout}
      />

      <BusinessContextMenu 
        isOpen={!!contextMenuBusinessId}
        onClose={() => setContextMenuBusinessId(null)}
        businessName={businesses.find(b => b.id === contextMenuBusinessId)?.name || ''}
        isPinned={!!businesses.find(b => b.id === contextMenuBusinessId)?.isPinned}
        onTogglePin={() => contextMenuBusinessId && toggleBusinessPin(contextMenuBusinessId)}
        onExport={() => contextMenuBusinessId && handleExportSingleBusiness(contextMenuBusinessId)}
        onDelete={() => {
            setBusinessToDeleteId(contextMenuBusinessId);
            setContextMenuBusinessId(null);
            setIsDeleteBusinessModalOpen(true);
        }}
      />

      <ConfirmationModal 
         isOpen={isDeleteBusinessModalOpen}
         onClose={() => setIsDeleteBusinessModalOpen(false)}
         onConfirm={() => {
            if(businessToDeleteId) deleteBusiness(businessToDeleteId);
            setIsDeleteBusinessModalOpen(false);
         }}
         title="Delete Workspace"
         message="Are you sure you want to delete this workspace? This action cannot be undone and all data within it will be lost."
         itemName={businesses.find(b => b.id === businessToDeleteId)?.name || 'Workspace'}
         confirmLabel="Delete Workspace"
      />
    </div>
  );
};