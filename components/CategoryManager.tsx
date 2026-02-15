import React, { useState } from 'react';
import { Category } from '../types';
import { Plus, Trash2, Tag, FolderOpen, Loader2 } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (category: Category) => Promise<void>;
  onUpdateCategory: (category: Category) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }) => {
  const [newCatName, setNewCatName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    setIsSubmitting(true);
    const newCategory: Category = {
      id: `cat_${Date.now()}`, // Temporary ID, backend will likely overwrite or use this
      name: newCatName.trim(),
      subcategories: []
    };
    
    await onAddCategory(newCategory);
    setNewCatName('');
    setIsSubmitting(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure? This will remove the category and all subcategories.')) {
      if (selectedCatId === id) setSelectedCatId(null);
      await onDeleteCategory(id);
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !newSubName.trim()) return;

    const category = categories.find(c => c.id === selectedCatId);
    if (!category) return;

    setIsSubmitting(true);
    const updatedCategory = {
      ...category,
      subcategories: [...category.subcategories, newSubName.trim()]
    };

    await onUpdateCategory(updatedCategory);
    setNewSubName('');
    setIsSubmitting(false);
  };

  const handleDeleteSubcategory = async (catId: string, sub: string) => {
    const category = categories.find(c => c.id === catId);
    if (!category) return;

    const updatedCategory = {
      ...category,
      subcategories: category.subcategories.filter(s => s !== sub)
    };

    await onUpdateCategory(updatedCategory);
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
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
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
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Add
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
            <FolderOpen size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Select a category to manage subcategories</p>
          </div>
        )}
      </div>
    </div>
  );
};