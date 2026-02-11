
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { BillList } from './components/BillList';
import { BillForm } from './components/BillForm';
import { GeminiInsights } from './components/GeminiInsights';
import { CategoryManager } from './components/CategoryManager';
import { CalendarView } from './components/CalendarView';
import { UserManager } from './components/UserManager';
import { Bill, View, PaymentStatus, Category, User } from './types';
import { MOCK_BILLS, DEFAULT_CATEGORIES, DEFAULT_USERS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  const [bills, setBills] = useState<Bill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Data
  useEffect(() => {
    // Load Bills
    const savedBills = localStorage.getItem('billtrackr_data');
    let loadedBills: Bill[] = savedBills ? JSON.parse(savedBills) : MOCK_BILLS;
    
    // Load Categories
    const savedCats = localStorage.getItem('billtrackr_categories');
    let loadedCats: Category[] = savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES;

    // Load Users
    const savedUsers = localStorage.getItem('billtrackr_users');
    let loadedUsers: User[] = savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS;

    // Check Overdue Status
    const today = new Date().toISOString().split('T')[0];
    const updatedBills = loadedBills.map((bill: Bill) => {
      if (bill.status === PaymentStatus.PENDING && bill.dueDate < today) {
        return { ...bill, status: PaymentStatus.OVERDUE };
      }
      return bill;
    });

    setBills(updatedBills);
    setCategories(loadedCats);
    setUsers(loadedUsers);
    
    // Check for active session
    const sessionUser = localStorage.getItem('billtrackr_session');
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
    }

    setIsLoaded(true);
  }, []);

  // Persist Data
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('billtrackr_data', JSON.stringify(bills));
      localStorage.setItem('billtrackr_categories', JSON.stringify(categories));
      localStorage.setItem('billtrackr_users', JSON.stringify(users));
    }
  }, [bills, categories, users, isLoaded]);

  // Handle Login
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('billtrackr_session', JSON.stringify(user));
    setCurrentView('dashboard');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('billtrackr_session');
    setCurrentView('login'); // Technically rendered via conditional, but good for state hygiene
  };

  const handleAddBill = (newBill: Bill) => {
    const today = new Date().toISOString().split('T')[0];
    if (newBill.status === PaymentStatus.PENDING && newBill.dueDate < today) {
      newBill.status = PaymentStatus.OVERDUE;
    }
    setBills(prev => [...prev, newBill]);
    setCurrentView('bills');
  };

  const handleUpdateStatus = (id: string, status: PaymentStatus) => {
    if (currentUser?.role === 'VIEWER') return; // Security check
    setBills(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  // Auth Guard
  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} />;
  }

  // Permission Checks for Routing
  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR';
  const isAdmin = currentUser.role === 'ADMIN';

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard bills={bills} onAddBill={() => setCurrentView('add-bill')} currentUser={currentUser} />;
      case 'bills':
        return <BillList bills={bills} onUpdateStatus={handleUpdateStatus} currentUser={currentUser} />;
      case 'add-bill':
        return canEdit ? 
          <BillForm categories={categories} onSubmit={handleAddBill} onCancel={() => setCurrentView('dashboard')} /> : 
          <div className="p-4 text-center text-red-500">Unauthorized Access</div>;
      case 'categories':
        return isAdmin ? 
          <CategoryManager categories={categories} setCategories={setCategories} /> : 
          <div className="p-4 text-center text-red-500">Unauthorized Access</div>;
      case 'users':
        return isAdmin ?
          <UserManager users={users} setUsers={setUsers} currentUser={currentUser} /> :
          <div className="p-4 text-center text-red-500">Unauthorized Access</div>;
      case 'calendar':
        return <CalendarView bills={bills} />;
      case 'insights':
        return <GeminiInsights bills={bills} />;
      default:
        return <Dashboard bills={bills} onAddBill={() => setCurrentView('add-bill')} currentUser={currentUser} />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView} currentUser={currentUser} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
