import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { BillList } from './components/BillList';
import { BillForm } from './components/BillForm';
import { CategoryManager } from './components/CategoryManager';
import { CalendarView } from './components/CalendarView';
import { UserManager } from './components/UserManager';
import { Bill, View, PaymentStatus, Category, User } from './types';
import { MOCK_BILLS, DEFAULT_CATEGORIES, DEFAULT_USERS, DEFAULT_COMPANIES } from './constants';
import { db, isFirebaseEnabled, collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, writeBatch, setDoc, getDocs } from './services/firebase';
import { Loader2, CloudOff, Cloud } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  const [bills, setBills] = useState<Bill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  // --- Initial Load Effect ---
  useEffect(() => {
    const loadData = async () => {
      // Check session
      const sessionUser = localStorage.getItem('billtrackr_session');
      if (sessionUser) {
        setCurrentUser(JSON.parse(sessionUser));
      }

      if (isFirebaseEnabled && db) {
        // --- FIREBASE MODE ---
        await seedDatabaseIfEmpty();

        // Subscriptions are set up below in separate effects to avoid stale closures if we were to mix them here
        // But for simplicity in this hybrid component, we'll set loading false after a brief timeout 
        // or let the onSnapshot callbacks handle it.
        
      } else {
        // --- LOCAL STORAGE MODE ---
        console.log("Using Local Storage Mode");
        
        const savedBills = localStorage.getItem('billtrackr_data');
        const loadedBills = savedBills ? JSON.parse(savedBills) : MOCK_BILLS;
        
        const savedCats = localStorage.getItem('billtrackr_categories');
        const loadedCats = savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES;

        const savedUsers = localStorage.getItem('billtrackr_users');
        const loadedUsers = savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS;

        const savedCompanies = localStorage.getItem('billtrackr_companies');
        const loadedCompanies = savedCompanies ? JSON.parse(savedCompanies) : DEFAULT_COMPANIES;

        // Process Bills for Overdue
        const today = new Date().toISOString().split('T')[0];
        const processedBills = loadedBills.map((bill: Bill) => {
           let status = bill.status;
           const currency = bill.currency || 'USD';
           if (status === PaymentStatus.PENDING && bill.dueDate < today) {
             status = PaymentStatus.OVERDUE;
           }
           return { ...bill, status, currency };
        });

        setBills(processedBills);
        setCategories(loadedCats);
        setUsers(loadedUsers);
        setCompanies(loadedCompanies);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // --- Firebase Subscriptions ---
  useEffect(() => {
    if (!isFirebaseEnabled || !db) return;

    // Bills
    const unsubBills = onSnapshot(collection(db, 'bills'), (snapshot) => {
      const fetchedBills: Bill[] = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Bill));
      const today = new Date().toISOString().split('T')[0];
      const processedBills = fetchedBills.map(bill => {
        let status = bill.status;
        const currency = bill.currency || 'USD';
        if (status === PaymentStatus.PENDING && bill.dueDate < today) {
          status = PaymentStatus.OVERDUE;
        }
        return { ...bill, status, currency };
      });
      setBills(processedBills);
    });

    // Categories
    const unsubCats = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Category)));
    });

    // Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as User)));
    });

    // Companies
    const unsubCompanies = onSnapshot(collection(db, 'companies'), (snapshot) => {
      const companyNames = snapshot.docs.map(d => d.data().name).sort();
      setCompanies(companyNames);
      setIsLoading(false); // Assume loaded once all listeners attach
    });

    return () => {
      unsubBills();
      unsubCats();
      unsubUsers();
      unsubCompanies();
    };
  }, []);

  // --- Local Storage Persistence Effect ---
  useEffect(() => {
    if (!isFirebaseEnabled && !isLoading) {
      localStorage.setItem('billtrackr_data', JSON.stringify(bills));
      localStorage.setItem('billtrackr_categories', JSON.stringify(categories));
      localStorage.setItem('billtrackr_users', JSON.stringify(users));
      localStorage.setItem('billtrackr_companies', JSON.stringify(companies));
    }
  }, [bills, categories, users, companies, isLoading]);

  // --- Seeding Logic (Firebase Only) ---
  const seedDatabaseIfEmpty = async () => {
    if (!isFirebaseEnabled || !db) return;
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      if (usersSnap.empty) {
        console.log("Seeding Database...");
        const batch = writeBatch(db);
        DEFAULT_USERS.forEach(u => { const ref = doc(collection(db, 'users')); batch.set(ref, { ...u, id: ref.id }); });
        DEFAULT_CATEGORIES.forEach(c => { const ref = doc(collection(db, 'categories')); batch.set(ref, { ...c, id: ref.id }); });
        DEFAULT_COMPANIES.forEach(name => { const ref = doc(collection(db, 'companies')); batch.set(ref, { name }); });
        MOCK_BILLS.forEach(b => { const ref = doc(collection(db, 'bills')); batch.set(ref, { ...b, id: ref.id }); });
        await batch.commit();
      }
    } catch (e) {
      console.error("Error seeding DB:", e);
    }
  };

  // --- Handlers (Hybrid) ---

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('billtrackr_session', JSON.stringify(user));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('billtrackr_session');
    setCurrentView('login');
  };

  const handleSaveBill = async (bill: Bill) => {
    const today = new Date().toISOString().split('T')[0];
    let billToSave = { ...bill };
    if (billToSave.status === PaymentStatus.PENDING && billToSave.dueDate < today) {
      billToSave.status = PaymentStatus.OVERDUE;
    } else if (billToSave.status === PaymentStatus.OVERDUE && billToSave.dueDate >= today) {
      billToSave.status = PaymentStatus.PENDING;
    }

    if (isFirebaseEnabled && db) {
      try {
        const { id, ...data } = billToSave;
        if (bills.some(b => b.id === bill.id)) {
          await updateDoc(doc(db, 'bills', id), data);
        } else {
           // Ensure we don't pass undefined ID if we want Firestore to generate
           if (id && !id.startsWith('new_')) {
             await setDoc(doc(db, 'bills', id), { ...data, id });
           } else {
             await addDoc(collection(db, 'bills'), data);
           }
        }
      } catch (e) {
        console.error(e);
        alert("Sync error");
      }
    } else {
      // Local
      setBills(prev => {
        const exists = prev.some(b => b.id === billToSave.id);
        return exists ? prev.map(b => b.id === billToSave.id ? billToSave : b) : [...prev, billToSave];
      });
    }
    setEditingBill(null);
    setCurrentView('bills');
  };

  const handleBulkSaveBills = async (newBills: Bill[]) => {
    const today = new Date().toISOString().split('T')[0];
    const processed = newBills.map(b => {
        let status = b.status;
        if (status === PaymentStatus.PENDING && b.dueDate < today) status = PaymentStatus.OVERDUE;
        return { ...b, status };
    });

    if (isFirebaseEnabled && db) {
      const batch = writeBatch(db);
      processed.forEach(b => { const ref = doc(collection(db, 'bills')); batch.set(ref, { ...b, id: ref.id }); });
      
      const newCompanies = new Set(processed.map(b => b.companyName));
      const existing = new Set(companies);
      newCompanies.forEach(n => { if(!existing.has(n)) { const ref = doc(collection(db, 'companies')); batch.set(ref, {name: n}); }});
      
      await batch.commit();
    } else {
      setBills(prev => [...prev, ...processed]);
      const newCompanies = new Set(companies);
      processed.forEach(b => newCompanies.add(b.companyName));
      setCompanies(Array.from(newCompanies).sort());
    }
    setCurrentView('bills');
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm("Delete bill?")) return;
    if (isFirebaseEnabled && db) {
      await deleteDoc(doc(db, 'bills', id));
    } else {
      setBills(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleUpdateStatus = async (id: string, status: PaymentStatus) => {
    if (currentUser?.role === 'VIEWER') return;
    if (isFirebaseEnabled && db) {
      await updateDoc(doc(db, 'bills', id), { status });
    } else {
      setBills(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    }
  };

  const handleAddCompany = async (name: string) => {
    if (companies.includes(name)) return;
    if (isFirebaseEnabled && db) {
      await addDoc(collection(db, 'companies'), { name });
    } else {
      setCompanies(prev => [...prev, name].sort());
    }
  };

  const handleAddCategory = async (cat: Category) => {
    if (isFirebaseEnabled && db) {
       const ref = doc(collection(db, 'categories'));
       await setDoc(ref, { ...cat, id: ref.id });
    } else {
       setCategories(prev => [...prev, cat]);
    }
  };

  const handleUpdateCategory = async (cat: Category) => {
    if (isFirebaseEnabled && db) {
      const { id, ...data } = cat;
      await updateDoc(doc(db, 'categories', id), data);
    } else {
      setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (isFirebaseEnabled && db) {
      await deleteDoc(doc(db, 'categories', id));
    } else {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleAddUser = async (user: User) => {
    if (isFirebaseEnabled && db) {
      const { id, ...data } = user;
      const ref = doc(collection(db, 'users'));
      await setDoc(ref, { ...data, id: ref.id });
    } else {
      setUsers(prev => [...prev, user]);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (isFirebaseEnabled && db) {
      await deleteDoc(doc(db, 'users', id));
    } else {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  // --- Render ---

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 flex-col gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-500 font-medium">Loading Organization Data...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} />;
  }

  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR';
  const isAdmin = currentUser.role === 'ADMIN';

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard bills={bills} onAddBill={() => { setEditingBill(null); setCurrentView('add-bill'); }} currentUser={currentUser} />;
      case 'bills':
        return <BillList bills={bills} onUpdateStatus={handleUpdateStatus} onEdit={(b) => { setEditingBill(b); setCurrentView('add-bill'); }} onDelete={handleDeleteBill} currentUser={currentUser} />;
      case 'add-bill':
        return canEdit ? 
          <BillForm 
            categories={categories} companies={companies} onAddCompany={handleAddCompany} onSubmit={handleSaveBill} onBulkSubmit={handleBulkSaveBills}
            onCancel={() => { setEditingBill(null); setCurrentView('bills'); }} initialData={editingBill || undefined}
          /> : <div className="p-4 text-center text-red-500">Unauthorized</div>;
      case 'categories':
        return isAdmin ? <CategoryManager categories={categories} onAddCategory={handleAddCategory} onUpdateCategory={handleUpdateCategory} onDeleteCategory={handleDeleteCategory} /> : <div className="p-4 text-center text-red-500">Unauthorized</div>;
      case 'users':
        return isAdmin ? <UserManager users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} currentUser={currentUser} /> : <div className="p-4 text-center text-red-500">Unauthorized</div>;
      case 'calendar':
        return <CalendarView bills={bills} />;
      default:
        return <Dashboard bills={bills} onAddBill={() => setCurrentView('add-bill')} currentUser={currentUser} />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView} currentUser={currentUser} onLogout={handleLogout}>
      {!isFirebaseEnabled && (
         <div className="bg-orange-50 text-orange-700 px-4 py-2 text-xs font-medium text-center border-b border-orange-100 flex justify-center items-center gap-2">
           <CloudOff size={14} />
           Demo Mode (Local Storage). To enable Cloud Sync, add Firebase VITE_ keys to .env file.
         </div>
      )}
      {isFirebaseEnabled && (
        <div className="bg-green-50 text-green-700 px-4 py-1 text-[10px] font-medium text-center border-b border-green-100 flex justify-center items-center gap-1">
          <Cloud size={10} /> Cloud Sync Active
        </div>
      )}
      {renderContent()}
    </Layout>
  );
};

export default App;