'use client';

import { VacationRequest, VacationStatus } from '@/types';

interface CalendarProps {
  vacations: VacationRequest[];
}

export default function Calendar({ vacations }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getVacationsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return vacations.filter(v => {
      const start = new Date(v.startDate);
      const end = new Date(v.endDate);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={previousMonth}
          className="p-2 text-white hover:bg-gray-700 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-xl font-bold text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 text-white hover:bg-gray-700 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map(i => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {days.map(day => {
          const dayVacations = getVacationsForDay(day);
          const isToday = day === new Date().getDate() && 
                         currentDate.getMonth() === new Date().getMonth() && 
                         currentDate.getFullYear() === new Date().getFullYear();
          
          return (
            <div
              key={day}
              className={`aspect-square border border-gray-700 rounded-lg p-1 flex flex-col ${
                isToday ? 'bg-blue-900 border-blue-500' : 'bg-gray-900'
              }`}
            >
              <span className="text-xs text-white font-medium">{day}</span>
              <div className="flex-1 flex flex-col gap-1 mt-1 overflow-hidden">
                {dayVacations.slice(0, 3).map(v => (
                  <div
                    key={v.id}
                    className={`text-[10px] px-1 rounded truncate ${
                      v.status === VacationStatus.APPROVED ? 'bg-green-900 text-green-200' :
                      v.status === VacationStatus.REJECTED ? 'bg-red-900 text-red-200' :
                      'bg-yellow-900 text-yellow-200'
                    }`}
                    title={`${v.userName} - ${v.status}`}
                  >
                    {v.userName.split(' ')[0]}
                  </div>
                ))}
                {dayVacations.length > 3 && (
                  <span className="text-[10px] text-gray-400">+{dayVacations.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-900 border border-green-700"></div>
          <span className="text-xs text-gray-400">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-900 border border-yellow-700"></div>
          <span className="text-xs text-gray-400">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-900 border border-red-700"></div>
          <span className="text-xs text-gray-400">Rejected</span>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';