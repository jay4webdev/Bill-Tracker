
import React, { useState, useMemo } from 'react';
import { Bill, PaymentStatus, User } from '../types';
import { createGoogleCalendarLink } from '../services/calendarService';
import { CalendarPlus, CheckCircle, Clock, AlertTriangle, Filter, ArrowUpDown, ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react';

interface BillListProps {
  bills: Bill[];
  onUpdateStatus: (id: string, status: PaymentStatus) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  currentUser: User;
}

type SortKey = 'dueDate' | 'amount' | 'staffName';
type SortDirection = 'asc' | 'desc';

export const BillList: React.FC<BillListProps> = ({ bills, onUpdateStatus, onEdit, onDelete, currentUser }) => {
  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR';

  // Filters state
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Get today's date for overdue calculation
  const today = new Date().toISOString().split('T')[0];

  // Derive unique companies for filter dropdown
  const uniqueCompanies = useMemo(() => {
    const companies = new Set(bills.map(b => b.companyName));
    return Array.from(companies).sort();
  }, [bills]);

  // Derive unique categories for filter dropdown from the bills list
  const uniqueCategories = useMemo(() => {
    const categories = new Set(bills.map(b => b.category));
    return Array.from(categories).sort();
  }, [bills]);

  // Filtering Logic
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const matchStatus = statusFilter === 'ALL' || bill.status === statusFilter;
      const matchCompany = companyFilter === 'ALL' || bill.companyName === companyFilter;
      const matchCategory = categoryFilter === 'ALL' || bill.category === categoryFilter;
      return matchStatus && matchCompany && matchCategory;
    });
  }, [bills, statusFilter, companyFilter, categoryFilter]);

  // Sorting Logic
  const sortedBills = useMemo(() => {
    return [...filteredBills].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'amount':
          // Sort by raw amount number for simplicity, ignoring currency conversion for sorting in this view
          comparison = a.amount - b.amount;
          break;
        case 'staffName':
          comparison = a.staffName.localeCompare(b.staffName);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredBills, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return 'bg-green-100 text-green-700';
      case PaymentStatus.OVERDUE: return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return CheckCircle;
      case PaymentStatus.OVERDUE: return AlertTriangle;
      default: return Clock;
    }
  };

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown size={14} className="opacity-40" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handleStatusToggle = (bill: Bill) => {
    if (!canEdit) return;
    
    const isPaid = bill.status === PaymentStatus.PAID;
    if (isPaid) {
      // Revert to unpaid: check if it should be OVERDUE or PENDING based on today's date
      const newStatus = bill.dueDate < today ? PaymentStatus.OVERDUE : PaymentStatus.PENDING;
      onUpdateStatus(bill.id, newStatus);
    } else {
      // Mark as Paid
      onUpdateStatus(bill.id, PaymentStatus.PAID);
    }
  };

  const formatCurrency = (amount: number, currency: 'USD' | 'MVR' = 'USD') => {
    return currency === 'USD' 
      ? `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      : `MVR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800">All Bills</h2>
        
        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full xl:w-auto">
            
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1 w-full md:w-auto">
              {(['ALL', PaymentStatus.PENDING, PaymentStatus.PAID, PaymentStatus.OVERDUE] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                    statusFilter === f 
                      ? 'bg-white text-gray-800 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f}
                </button>
              ))}
            </div>

            <div className="hidden md:block h-6 w-px bg-gray-200"></div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Company Filter */}
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Companies</option>
                {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Categories</option>
                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 self-end xl:self-auto">
            Showing {sortedBills.length} results
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                <th 
                  className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort('staffName')}
                >
                  <div className="flex items-center gap-2">
                    Staff Name <SortIcon colKey="staffName" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center gap-2">
                    Due Date <SortIcon colKey="dueDate" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Amount <SortIcon colKey="amount" />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No bills found matching filters.
                  </td>
                </tr>
              ) : (
                sortedBills.map((bill) => {
                  const StatusIcon = getStatusIcon(bill.status);
                  const isPaid = bill.status === PaymentStatus.PAID;
                  
                  return (
                    <tr key={bill.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                          <StatusIcon size={12} />
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bill.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{bill.staffName}</div>
                        <div className="text-xs text-gray-500">{bill.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {bill.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                        {formatCurrency(bill.amount, bill.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center items-center gap-2">
                          {/* Calendar Link */}
                          <a
                            href={createGoogleCalendarLink(bill)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-md hover:bg-blue-50"
                            title="Add to Google Calendar"
                          >
                            <CalendarPlus size={16} />
                          </a>
                          
                          {/* Mark as Paid/Unpaid */}
                          <button
                            onClick={() => handleStatusToggle(bill)}
                            disabled={!canEdit}
                            className={`transition-all p-1.5 rounded-md ${
                              !canEdit ? 'opacity-30 cursor-not-allowed' :
                              isPaid 
                                ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                                : 'text-gray-400 hover:text-green-600 hover:bg-gray-50'
                            }`}
                            title={!canEdit ? "Read Only" : (isPaid ? "Mark as Unpaid" : "Mark as Paid")}
                          >
                            <CheckCircle size={16} className={isPaid ? "fill-green-100" : ""} />
                          </button>

                          {/* Edit Button */}
                          {canEdit && (
                            <button
                              onClick={() => onEdit(bill)}
                              className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-md transition-all"
                              title="Edit Bill"
                            >
                              <Pencil size={16} />
                            </button>
                          )}

                          {/* Delete Button */}
                          {canEdit && (
                            <button
                              onClick={() => onDelete(bill.id)}
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-all"
                              title="Delete Bill"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
