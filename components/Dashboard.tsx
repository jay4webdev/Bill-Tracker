
import React from 'react';
import { Bill, PaymentStatus, User } from '../types';
import { StatCard } from './StatCard';
import { DollarSign, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  bills: Bill[];
  onAddBill: () => void;
  currentUser: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ bills, onAddBill, currentUser }) => {
  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR';

  // Exchange rate assumption for dashboard aggregation
  const MVR_TO_USD = 0.065; // 1 MVR ~= 0.065 USD (approx)

  const normalizeAmount = (bill: Bill) => {
    return bill.currency === 'MVR' ? bill.amount * MVR_TO_USD : bill.amount;
  };

  const totalOutstanding = bills
    .filter(b => b.status === PaymentStatus.PENDING || b.status === PaymentStatus.OVERDUE)
    .reduce((acc, curr) => acc + normalizeAmount(curr), 0);

  const totalPaid = bills
    .filter(b => b.status === PaymentStatus.PAID)
    .reduce((acc, curr) => acc + normalizeAmount(curr), 0);

  const overdueBills = bills.filter(b => b.status === PaymentStatus.OVERDUE);
  const overdueAmount = overdueBills.reduce((acc, curr) => acc + normalizeAmount(curr), 0);
  
  const upcomingBills = bills
    .filter(b => b.status === PaymentStatus.PENDING)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Data for Charts (Normalized to USD)
  const companyExpenses = bills.reduce((acc, bill) => {
    acc[bill.companyName] = (acc[bill.companyName] || 0) + normalizeAmount(bill);
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.keys(companyExpenses).map(name => ({
    name,
    amount: companyExpenses[name]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Outstanding (USD Est.)" 
          value={`$${totalOutstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          subValue={`${bills.filter(b => b.status === PaymentStatus.PENDING).length} bills pending`}
          icon={DollarSign} 
          color="blue" 
        />
        <StatCard 
          label="Overdue Amount (USD Est.)" 
          value={`$${overdueAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          subValue={`${overdueBills.length} bills overdue`}
          icon={AlertTriangle} 
          color="red" 
        />
        <StatCard 
          label="Paid YTD (USD Est.)" 
          value={`$${totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          icon={TrendingUp} 
          color="green" 
        />
        <StatCard 
          label="Next Due" 
          value={upcomingBills[0]?.dueDate || "N/A"} 
          subValue={upcomingBills[0]?.staffName || "No upcoming bills"}
          icon={Calendar} 
          color="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Company (USD Equivalent)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Due</h3>
            {canEdit && (
              <button onClick={onAddBill} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                + Add New
              </button>
            )}
          </div>
          <div className="space-y-4">
            {upcomingBills.length === 0 ? (
               <p className="text-gray-400 text-sm text-center py-8">No upcoming bills.</p>
            ) : (
              upcomingBills.map(bill => (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
                  <div>
                    <p className="font-medium text-gray-900">{bill.staffName}</p>
                    <p className="text-xs text-gray-500">{bill.dueDate} • {bill.companyName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                        {bill.currency === 'USD' ? '$' : 'MVR '}{bill.amount.toLocaleString()}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                      {Math.ceil((new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
