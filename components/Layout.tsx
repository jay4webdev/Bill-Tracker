
import React, { useState } from 'react';
import { View, User } from '../types';
import { LayoutDashboard, Receipt, PlusCircle, FolderCog, CalendarDays, Users, LogOut, Menu, X } from 'lucide-react';

interface LayoutProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  currentUser: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, currentUser, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAdmin = currentUser.role === 'ADMIN';
  const isEditor = currentUser.role === 'EDITOR' || isAdmin;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: true },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays, visible: true },
    { id: 'bills', label: 'All Bills', icon: Receipt, visible: true },
    { id: 'add-bill', label: 'Add Bill', icon: PlusCircle, visible: isEditor }, // Only Editors/Admins
    { id: 'categories', label: 'Categories', icon: FolderCog, visible: isAdmin }, // Only Admins
    { id: 'users', label: 'User Management', icon: Users, visible: isAdmin }, // Only Admins
  ];

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setIsSidebarOpen(false); // Close sidebar on mobile when item clicked
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              BillTrackr Pro
            </h1>
            <p className="text-xs text-slate-400 mt-1">Build for Donad Group</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.filter(item => item.visible).map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as View)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-slate-800/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{currentUser.fullName}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{currentUser.role}</p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-8 py-4 flex justify-between items-center z-10 sticky top-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 capitalize flex items-center gap-2">
              {navItems.find(i => i.id === currentView)?.icon && React.createElement(navItems.find(i => i.id === currentView)!.icon, { size: 24, className: "text-gray-400 hidden sm:block" })}
              {navItems.find(i => i.id === currentView)?.label}
            </h2>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 text-right">
            <span className="hidden sm:inline">Organization: </span>
            <span className="font-semibold text-gray-700 block sm:inline">Metalsigns</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
