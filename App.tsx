
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
import { MOCK_BILLS, DEFAULT_CATEGORIES, DEFAULT_USERS, DEFAULT_COMPANIES } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  const [bills, setBills] = useState<Bill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  // Initialize Data
  useEffect(() => {
    // Load Bills
    const savedBills = localStorage.getItem('billtrackr_data');
    let loadedBills: any[] = savedBills ? JSON.parse(savedBills) : MOCK_BILLS;
    
    // Load Categories
    const savedCats = localStorage.getItem('billtrackr_categories');
    let loadedCats: Category[] = savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES;

    // Load Users
    const savedUsers = localStorage.getItem('billtrackr_users');
    let loadedUsers: User[] = savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS;

    // Load Companies
    const savedCompanies = localStorage.getItem('billtrackr_companies');
    let loadedCompanies: string[] = savedCompanies ? JSON.parse(savedCompanies) : DEFAULT_COMPANIES;

    // Check Overdue Status and Migrate Data
    const today = new Date().toISOString().split('T')[0];
    const updatedBills: Bill[] = loadedBills.map((bill) => {
      // Status Check
      let status = bill.status;
      if (status === PaymentStatus.PENDING && bill.dueDate < today) {
        status = PaymentStatus.OVERDUE;
      }
      
      // Data Migration: Ensure currency exists
      const currency = bill.currency || 'USD';

      return { ...bill, status, currency };
    });

    setBills(updatedBills);
    setCategories(loadedCats);
    setUsers(loadedUsers);
    setCompanies(loadedCompanies);
    
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
      localStorage.setItem('billtrackr_companies', JSON.stringify(companies));
    }
  }, [bills, categories, users, companies, isLoaded]);

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

  const handleSaveBill = (bill: Bill) => {
    const today = new Date().toISOString().split('T')[0];
    let billToSave = { ...bill };

    // Update overdue status automatically if dates changed
    if (billToSave.status === PaymentStatus.PENDING && billToSave.dueDate < today) {
      billToSave.status = PaymentStatus.OVERDUE;
    } else if (billToSave.status === PaymentStatus.OVERDUE && billToSave.dueDate >= today) {
      billToSave.status = PaymentStatus.PENDING;
    }

    setBills(prev => {
      const exists = prev.some(b => b.id === billToSave.id);
      if (exists) {
        return prev.map(b => b.id === billToSave.id ? billToSave : b);
      }
      return [...prev, billToSave];
    });
    
    setEditingBill(null);
    setCurrentView('bills');
  };

  const handleDeleteBill = (id: string) => {
    if (confirm("Are you sure you want to delete this bill?")) {
      setBills(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleAddCompany = (name: string) => {
    if (!companies.includes(name)) {
      setCompanies(prev => [...prev, name].sort());
    }
  };

  const handleUpdateStatus = (id: string, status: PaymentStatus) => {
    if (currentUser?.role === 'VIEWER') return; // Security check
    setBills(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const startAddingBill = () => {
    setEditingBill(null);
    setCurrentView('add-bill');
  };

  const startEditingBill = (bill: Bill) => {
    setEditingBill(bill);
    setCurrentView('add-bill');
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
        return <Dashboard bills={bills} onAddBill={startAddingBill} currentUser={currentUser} />;
      case 'bills':
        return <BillList 
          bills={bills} 
          onUpdateStatus={handleUpdateStatus} 
          onEdit={startEditingBill}
          onDelete={handleDeleteBill}
          currentUser={currentUser} 
        />;
      case 'add-bill':
        return canEdit ? 
          <BillForm 
            categories={categories} 
            companies={companies}
            onAddCompany={handleAddCompany}
            onSubmit={handleSaveBill} 
            onCancel={() => {
              setEditingBill(null);
              setCurrentView('bills');
            }} 
            initialData={editingBill || undefined}
          /> : 
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
        return <Dashboard bills={bills} onAddBill={startAddingBill} currentUser={currentUser} />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView} currentUser={currentUser} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
