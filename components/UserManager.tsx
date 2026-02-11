
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UserPlus, Shield, Trash2, User as UserIcon, Lock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User;
}

export const UserManager: React.FC<UserManagerProps> = ({ users, setUsers, currentUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'VIEWER' as UserRole
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.fullName) return;

    if (users.some(u => u.username === formData.username)) {
      alert('Username already exists');
      return;
    }

    const newUser: User = {
      id: uuidv4(),
      username: formData.username,
      password: formData.password,
      fullName: formData.fullName,
      role: formData.role
    };

    setUsers([...users, newUser]);
    setFormData({ username: '', password: '', fullName: '', role: 'VIEWER' });
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser.id) {
      alert("You cannot delete yourself.");
      return;
    }
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'EDITOR': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'VIEWER': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Shield size={48} className="mb-4 opacity-20" />
        <h2 className="text-lg font-medium">Access Restricted</h2>
        <p>Only Administrators can manage users.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Add User Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-blue-600" />
            Add New User
          </h3>
          
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Sarah Connor"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. sarah.c"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <div className="grid grid-cols-1 gap-2">
                {(['VIEWER', 'EDITOR', 'ADMIN'] as UserRole[]).map(role => (
                   <label key={role} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${formData.role === role ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                     <input 
                       type="radio" 
                       name="role" 
                       checked={formData.role === role} 
                       onChange={() => setFormData({...formData, role})}
                       className="hidden"
                     />
                     <div className="flex-1">
                       <div className="font-semibold text-sm text-gray-800">{role}</div>
                       <div className="text-xs text-gray-500">
                         {role === 'ADMIN' && 'Full access to everything.'}
                         {role === 'EDITOR' && 'Can manage bills, no settings.'}
                         {role === 'VIEWER' && 'Read-only access.'}
                       </div>
                     </div>
                     {formData.role === role && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                   </label>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Create User
            </button>
          </form>
        </div>
      </div>

      {/* User List */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
           <UserIcon size={20} className="text-gray-500" />
           Existing Users ({users.length})
        </h3>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Username</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {user.fullName.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.id !== currentUser.id && (
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {user.id === currentUser.id && (
                       <span className="text-xs text-gray-400 italic">Current</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
