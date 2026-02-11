
import React, { useState, useEffect } from 'react';
import { Bill, PaymentStatus, Category } from '../types';

const simpleId = () => Math.random().toString(36).substr(2, 9);

interface BillFormProps {
  categories: Category[];
  onSubmit: (bill: Bill) => void;
  onCancel: () => void;
}

export const BillForm: React.FC<BillFormProps> = ({ categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Bill>>({
    status: PaymentStatus.PENDING,
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: 0,
    companyName: '',
    staffName: '',
    category: '',
    subcategory: '',
    description: ''
  });

  // Set default category on load if available
  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ 
        ...prev, 
        category: categories[0].name,
        subcategory: categories[0].subcategories[0] || ''
      }));
    }
  }, [categories]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staffName || !formData.amount || !formData.dueDate || !formData.companyName) {
      alert("Please fill in all required fields.");
      return;
    }

    const newBill: Bill = {
      id: simpleId(),
      companyName: formData.companyName!,
      staffName: formData.staffName!,
      description: formData.description || '',
      amount: formData.amount!,
      billDate: formData.billDate!,
      dueDate: formData.dueDate!,
      status: formData.status as PaymentStatus,
      category: formData.category || 'Other',
      subcategory: formData.subcategory || ''
    };

    onSubmit(newBill);
  };

  const selectedCategoryObj = categories.find(c => c.name === formData.category);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Log New Bill</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Row 1: Company & Staff */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Unitrac MV"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
            <input
              type="text"
              name="staffName"
              value={formData.staffName}
              onChange={handleChange}
              placeholder="e.g. Hasif Husain"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          {/* Row 2: Category & Subcategory (Moved above Amount) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              name="amount"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
            <input
              type="date"
              name="billDate"
              value={formData.billDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
           <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-sm"
          >
            Save Bill
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
