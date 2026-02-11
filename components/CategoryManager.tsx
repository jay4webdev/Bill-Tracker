
import React, { useState } from 'react';
import { Category } from '../types';
import { Plus, Trash2, Tag, FolderPlus, FolderOpen, ShieldAlert } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, setCategories }) => {
  const [newCatName, setNewCatName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');

  // This component is routed only for Admins in App.tsx, but defensive programming is good.
  // We assume if it's rendered, the user is authorized, but we can rely on parent checks.

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      subcategories: []
    };
    
    setCategories([...categories, newCategory]);
    setNewCatName('');
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure? This will remove the category and all subcategories.')) {
      setCategories(categories.filter(c => c.id !== id));
      if (selectedCatId === id) setSelectedCatId(null);
    }
  };

  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !newSubName.trim()) return;

    setCategories(categories.map(cat => {
      if (cat.id === selectedCatId) {
        return { ...cat, subcategories: [...cat.subcategories, newSubName.trim()] };
      }
      return cat;
    }));
    setNewSubName('');
  };

  const handleDeleteSubcategory = (catId: string, sub: string) => {
    setCategories(categories.map(cat => {
      if (cat.id === catId) {
        return { ...cat, subcategories: cat.subcategories.filter(s => s !== sub) };
      }
      return cat;
    }));
  };

  const selectedCategory = categories.find(c => c.id === selectedCatId);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Category List */}
      <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FolderOpen size={20} className="text-blue-600" />
          Categories
        </h3>
        
        <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="New Category..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={18} />
          </button>
        </form>

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {categories.map(cat => (
            <div 
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`p-3 rounded-lg cursor-pointer flex justify-between items-center group transition-all ${
                selectedCatId === cat.id 
                  ? 'bg-blue-50 border-blue-200 border' 
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <span className={`font-medium ${selectedCatId === cat.id ? 'text-blue-700' : 'text-gray-700'}`}>
                {cat.name}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subcategory Manager */}
      <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center min-h-[400px]">
        {selectedCategory ? (
          <div className="w-full h-full flex flex-col">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Tag className="text-purple-500" />
                {selectedCategory.name} <span className="text-gray-400 font-normal">/ Subcategories</span>
              </h3>
            </div>

            <form onSubmit={handleAddSubcategory} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder={`Add subcategory to ${selectedCategory.name}...`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2">
                <Plus size={18} /> Add
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedCategory.subcategories.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-400 italic">
                  No subcategories yet. Add one above.
                </div>
              ) : (
                selectedCategory.subcategories.map((sub, idx) => (
                  <div key={idx} className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 flex justify-between items-center group">
                    <span className="text-gray-700 font-medium">{sub}</span>
                    <button 
                      onClick={() => handleDeleteSubcategory(selectedCategory.id, sub)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <FolderPlus size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Select a category to manage subcategories</p>
          </div>
        )}
      </div>
    </div>
  );
};
