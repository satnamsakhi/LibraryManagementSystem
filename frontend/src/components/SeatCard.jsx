import React from 'react';
import { Armchair, Monitor, Users, VolumeX, CheckCircle, Lock, Wrench, Ban } from 'lucide-react';

const SeatCard = ({ seat, isSelected, onSelect }) => {
  const isAvailable = seat.status === 'AVAILABLE';
  const isReserved = seat.status === 'RESERVED';
  const isMaintenance = seat.status === 'MAINTENANCE';
  const isInactive = seat.status === 'INACTIVE';

  const getTypeIcon = () => {
    switch (seat.seat_type) {
      case 'COMPUTER':
        return <Monitor className="w-4 h-4" />;
      case 'DISCUSSION':
        return <Users className="w-4 h-4" />;
      case 'SILENT':
        return <VolumeX className="w-4 h-4" />;
      default:
        return <Armchair className="w-4 h-4" />;
    }
  };

  const getStatusBadge = () => {
    if (isSelected) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
          <CheckCircle className="w-3 h-3" /> Selected
        </span>
      );
    }
    if (isReserved) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100/90 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          <Lock className="w-3 h-3" /> Reserved
        </span>
      );
    }
    if (isMaintenance) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100/90 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
          <Wrench className="w-3 h-3" /> Maintenance
        </span>
      );
    }
    if (isInactive) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
          <Ban className="w-3 h-3" /> Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
        <CheckCircle className="w-3 h-3" /> Available
      </span>
    );
  };

  const getCardClasses = () => {
    if (isSelected) {
      return 'bg-blue-600 text-white border-2 border-blue-500 shadow-glow-primary ring-4 ring-blue-500/25 scale-[1.03] cursor-pointer';
    }
    if (isReserved) {
      return 'bg-amber-500/5 dark:bg-amber-950/20 text-slate-800 dark:text-slate-200 border-2 border-amber-500/40 dark:border-amber-500/30 cursor-not-allowed opacity-90';
    }
    if (isMaintenance) {
      return 'bg-rose-500/5 dark:bg-rose-950/20 text-slate-800 dark:text-slate-200 border-2 border-rose-500/40 dark:border-rose-500/30 cursor-not-allowed opacity-85';
    }
    if (isInactive) {
      return 'bg-slate-100/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60';
    }
    // Available (Green)
    return 'bg-white dark:bg-slate-800/90 hover:bg-emerald-500/5 dark:hover:bg-emerald-950/30 text-slate-800 dark:text-slate-100 border-2 border-emerald-500/40 hover:border-emerald-500 dark:border-emerald-600/40 dark:hover:border-emerald-500 shadow-xs hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5';
  };

  const handleClick = () => {
    if (isAvailable && onSelect) {
      onSelect(seat);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between ${getCardClasses()}`}
    >
      <div className="flex items-center justify-between gap-1 mb-2.5">
        <span className="text-base font-display font-extrabold tracking-tight">
          {seat.seat_number}
        </span>
        <div className={isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}>
          {getTypeIcon()}
        </div>
      </div>

      <div className="space-y-0.5 text-xs mb-3.5">
        <p className={`font-semibold truncate ${isSelected ? 'text-blue-100' : 'text-slate-600 dark:text-slate-300'}`}>
          {seat.floor}
        </p>
        <p className={`truncate ${isSelected ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>
          {seat.section}
        </p>
      </div>

      <div className={`pt-2.5 border-t flex items-center justify-between ${isSelected ? 'border-blue-500/40' : 'border-slate-100 dark:border-slate-700/60'}`}>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
          {seat.seat_type}
        </span>
        {getStatusBadge()}
      </div>
    </div>
  );
};

export default SeatCard;