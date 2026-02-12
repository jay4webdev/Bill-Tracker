
import React, { useState, useMemo } from 'react';
import { Bill, PaymentStatus } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  bills: Bill[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ bills }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const getBillsForDay = (day: number) => {
    return bills.filter(bill => {
      const billDate = new Date(bill.dueDate);
      return (
        billDate.getDate() === day &&
        billDate.getMonth() === month &&
        billDate.getFullYear() === year
      );
    });
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return 'bg-green-100 text-green-700 border-green-200';
      case PaymentStatus.OVERDUE: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalSlots = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;

    for (let i = 0; i < totalSlots; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      
      const dayBills = isCurrentMonth ? getBillsForDay(dayNumber) : [];
      const isToday = isCurrentMonth && 
        dayNumber === new Date().getDate() && 
        month === new Date().getMonth() && 
        year === new Date().getFullYear();

      days.push(
        <div 
          key={i} 
          className={`min-h-[120px] border border-gray-100 p-2 relative transition-colors ${
            isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50'
          }`}
        >
          {isCurrentMonth && (
            <>
              <div className={`text-sm font-medium mb-2 w-7 h-7 flex items-center justify-center rounded-full ${
                isToday ? 'bg-blue-600 text-white' : 'text-gray-500'
              }`}>
                {dayNumber}
              </div>
              
              <div className="space-y-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                {dayBills.map(bill => (
                  <div 
                    key={bill.id}
                    className={`text-[10px] px-1.5 py-1 rounded border truncate font-medium ${getStatusColor(bill.status)}`}
                    title={`${bill.staffName} - ${bill.amount}`}
                  >
                    {bill.currency === 'USD' ? '$' : 'MVR '}{bill.amount.toLocaleString()} - {bill.staffName}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <CalendarIcon size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
            {monthName} {year}
            </h2>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToday} className="px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 bg-gray-200 gap-px border-b border-gray-200">
        {renderCalendarDays()}
      </div>
      
      <div className="p-4 bg-gray-50 flex gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div> Pending
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div> Paid
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div> Overdue
        </div>
      </div>
    </div>
  );
};
