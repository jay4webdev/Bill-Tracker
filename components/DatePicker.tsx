import React, { useState, useEffect, useRef } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  label: string;
  value: string; // ISO string YYYY-MM-DD
  onChange: (date: string) => void;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value or default to today
  const selectedDate = value ? new Date(value) : null;

  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(value));
    }
  }, []); // Run once on mount if value exists to set calendar view

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDayClick = (day: Date) => {
    // Adjust for timezone offset to ensure the date string is local YYYY-MM-DD
    const offset = day.getTimezoneOffset();
    const localDate = new Date(day.getTime() - (offset * 60 * 1000));
    onChange(localDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const dayList = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
            {d}
          </div>
        ))}
        {dayList.map((dayItem, idx) => {
           const isSelected = selectedDate && isSameDay(dayItem, selectedDate);
           const isCurrentMonth = isSameMonth(dayItem, monthStart);
           const isDayToday = isToday(dayItem);

           return (
             <button
               key={idx}
               type="button" // Prevent form submission
               onClick={() => handleDayClick(dayItem)}
               className={`
                 h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all
                 ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                 ${isSelected ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md' : 'hover:bg-gray-100'}
                 ${isDayToday && !isSelected ? 'border border-blue-600 text-blue-600 font-semibold' : ''}
               `}
             >
               {format(dayItem, dateFormat)}
             </button>
           );
        })}
      </div>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && '*'}</label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full px-4 py-2.5 border rounded-lg cursor-pointer bg-white transition-all
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {value ? format(new Date(value), "MMM dd, yyyy") : 'Select date'}
        </span>
        <CalendarIcon size={18} className="text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white rounded-xl shadow-xl border border-gray-100 w-[280px] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-gray-800">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button type="button" onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
              <ChevronRight size={20} />
            </button>
          </div>
          
          {renderDays()}

          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center">
            <button 
              type="button"
              onClick={() => {
                handleDayClick(new Date());
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Select Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
