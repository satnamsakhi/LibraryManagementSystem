import React from 'react';
import { Clock, Check } from 'lucide-react';

const SlotCard = ({ slot, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(slot)}
      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
        isSelected
          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-100 shadow-sm ring-2 ring-blue-500/20'
          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-200 hover:shadow-xs'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          }`}
        >
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">{slot.slot_name}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            {slot.start_time?.slice(0, 5)} &mdash; {slot.end_time?.slice(0, 5)} ({slot.duration_minutes} mins)
          </p>
        </div>
      </div>

      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
          isSelected
            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
        }`}
      >
        {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
      </div>
    </div>
  );
};

export default SlotCard;