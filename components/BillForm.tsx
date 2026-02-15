import React, { useState, useEffect } from 'react';
import { Bill, PaymentStatus, Category } from '../types';
import { Plus, Check, X, Coins, FileSpreadsheet, FileText } from 'lucide-react';
import { BulkUpload } from './BulkUpload';
import { DatePicker } from './DatePicker';

const simpleId = () => Math.random().toString(36).substr(2, 9);

interface BillFormProps {
  categories: Category[];
  companies: string[];
  onAddCompany: (name: string) => void;
  onSubmit: (bill: Bill) => void;
  onBulkSubmit: (bills: Bill[]) => void;
  onCancel: () => void;
  initialData?: Bill;
}

export const BillForm: React.FC<BillFormProps> = ({ categories, companies, onAddCompany, onSubmit, onBulkSubmit, onCancel, initialData }) => {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  // Single Entry State
  const [formData, setFormData] = useState<Partial<Bill>>({
    status: PaymentStatus.PENDING,
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: 0,
    currency: 'USD',
    companyName: '',
    staffName: '',
    category: '',
    subcategory: '',
    description: ''
  });

  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompanyInput, setNewCompanyInput] = useState('');

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
      setMode('single'); // Ensure we are in single mode if editing
    } else {
      // Default values for new bill
      if (categories.length > 0 && !formData.category) {
        setFormData(prev => ({ 
          ...prev, 
          category: categories[0].name,
          subcategory: categories[0].subcategories[0] || ''
        }));
      }
    }
  }, [initialData, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      const selectedCat = categories.find(c => c.name === value);
      setFormData(prev => ({
        ...prev,
        category: value,
        subcategory: selectedCat?.subcategories[0] || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'amount' ? parseFloat(value) : value
      }));
    }
  };

  const handleDateChange = (name: string, date: string) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSaveNewCompany = () => {
    if (newCompanyInput.trim()) {
      onAddCompany(newCompanyInput.trim());
      setFormData(prev => ({ ...prev, companyName: newCompanyInput.trim() }));
      setNewCompanyInput('');
      setIsAddingCompany(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staffName || !formData.amount || !formData.dueDate || !formData.companyName) {
      alert("Please fill in all required fields.");
      return;
    }

    const newBill: Bill = {
      id: initialData?.id || simpleId(), // Use existing ID if editing
      companyName: formData.companyName!,
      staffName: formData.staffName!,
      description: formData.description || '',
      amount: formData.amount!,
      currency: formData.currency || 'USD',
      billDate: formData.billDate!,
      dueDate: formData.dueDate!,
      status: formData.status as PaymentStatus,
      category: formData.category || 'Other',
      subcategory: formData.subcategory || ''
    };

    onSubmit(newBill);
  };

  const toggleCurrency = () => {
    setFormData(prev => ({
      ...prev,
      currency: prev.currency === 'USD' ? 'MVR' : 'USD'
    }));
  };

  const selectedCategoryObj = categories.find(c => c.name === formData.category);
  const isEditing = !!initialData;

  // Render Bulk Upload View
  if (mode === 'bulk') {
    return (
      <div className="space-y-4">
        <div className="max-w-2xl mx-auto flex justify-end">
           <button 
             onClick={() => setMode('single')}
             className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
           >
             <FileText size={16} /> Switch to Single Entry
           </button>
        </div>
        <BulkUpload 
          onBulkSubmit={onBulkSubmit} 
          onCancel={onCancel}
          categories={categories}
          companies={companies}
        />
      </div>
    );
  }

  // Render Single Entry View
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto p-4 md:p-8 relative">
      {!isEditing && (
        <div className="absolute top-4 right-4 md:top-8 md:right-8">
          <button 
            onClick={() => setMode('bulk')}
            className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-100 transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet size={16} /> <span className="hidden sm:inline">Bulk Upload</span>
          </button>
        </div>
      )}

      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Edit Bill' : 'Log New Bill'}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Row 1: Company & Staff */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <div className="flex gap-2">
              {isAddingCompany ? (
                <div className="flex-1 flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={newCompanyInput}
                    onChange={(e) => setNewCompanyInput(e.target.value)}
                    placeholder="Enter new company name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <button 
                    type="button" 
                    onClick={handleSaveNewCompany}
                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Check size={20} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsAddingCompany(false); setNewCompanyInput(''); }}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <select
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    required
                  >
                    <option value="" disabled>Select Company</option>
                    {companies.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingCompany(true)}
                    className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Add new company"
                  >
                    <Plus size={20} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
            <input
              type="text"
              name="staffName"
              value={formData.staffName}
              onChange={handleChange}
              placeholder="e.g. Hasif Husain"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          {/* Row 2: Category & Subcategory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="" disabled>Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              disabled={!selectedCategoryObj || selectedCategoryObj.subcategories.length === 0}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400 bg-white"
            >
              {selectedCategoryObj?.subcategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
              {(!selectedCategoryObj || selectedCategoryObj.subcategories.length === 0) && (
                <option value="">No subcategories</option>
              )}
            </select>
          </div>

          {/* Row 3: Amount & Dates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 flex items-center">
                <button
                  type="button"
                  onClick={toggleCurrency}
                  className="h-full py-0 pl-3 pr-2 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 hover:bg-gray-100 text-sm font-medium transition-colors flex items-center gap-1 focus:ring-2 focus:ring-blue-500"
                >
                  <Coins size={14} className="text-gray-400" />
                  {formData.currency}
                </button>
              </div>
              <input
                type="number"
                name="amount"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                className="block w-full pl-24 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <DatePicker 
              label="Bill Date"
              value={formData.billDate || ''}
              onChange={(date) => handleDateChange('billDate', date)}
              required
            />
          </div>

          <div>
             <DatePicker 
              label="Due Date"
              value={formData.dueDate || ''}
              onChange={(date) => handleDateChange('dueDate', date)}
              required
            />
          </div>

          {/* Spacer to align grid if odd number of inputs */}
          <div className="hidden md:block"></div> 
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Reimbursement details or invoice note..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center gap-4 pt-4 border-t border-gray-100">
           <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all"
          >
            Cancel
          </button>
           <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-sm"
          >
            {isEditing ? 'Update Bill' : 'Save Bill'}
          </button>
        </div>
      </form>
    </div>
  );
};