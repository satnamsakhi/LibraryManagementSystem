import React from 'react';
import { Calendar, Clock, MapPin, Tag, AlertCircle, CheckCircle2, XCircle, QrCode, Timer } from 'lucide-react';

const BookingCard = ({ booking, onCancel, onViewPass }) => {
  const isConfirmed = booking.booking_status === 'CONFIRMED';
  const isCancelled = booking.booking_status === 'CANCELLED';
  const isCompleted = booking.booking_status === 'COMPLETED';

  // Can cancel if status is CONFIRMED and date is today or later
  const today = new Date().toISOString().split('T')[0];
  const isCancellable = isConfirmed && booking.booking_date >= today;

  const getStatusBadge = () => {
    switch (booking.booking_status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Confirmed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
            <XCircle className="w-3.5 h-3.5 text-rose-500" /> Cancelled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" /> {booking.booking_status}
          </span>
        );
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-card-dark hover:border-blue-500/40 dark:hover:border-blue-500/50 transition-all p-5 flex flex-col justify-between text-slate-900 dark:text-slate-100">
      <div>
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-700/60">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
              Reference
            </span>
            <p className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
              {booking.booking_reference}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-800/60 flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 px-2.5 py-1">
            <span className="text-[9px] uppercase font-mono font-bold tracking-wider opacity-80">Seat</span>
            <span className="text-base font-display font-extrabold">{booking.seat?.seat_number}</span>
          </div>

          <div className="space-y-0.5 truncate">
            <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm leading-snug truncate">
              {booking.seat?.floor} &bull; {booking.seat?.section}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 font-medium">
                <Tag className="w-3 h-3 text-teal-500" /> {booking.seat?.seat_type}
              </span>
              {booking.checked_in_at ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold">
                  &bull; Checked In
                </span>
              ) : isConfirmed ? (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-medium">
                  <Timer className="w-3 h-3 text-amber-500" /> 20m Grace Window
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 space-y-2 text-xs mb-4 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-blue-500" /> Date:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.booking_date}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-teal-500" /> Slot:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {booking.slot?.start_time?.slice(0, 5)} - {booking.slot?.end_time?.slice(0, 5)}
            </span>
          </div>
        </div>

        {isCancelled && booking.cancellation_reason && (
          <div className="mb-4 text-xs text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60">
            <span className="font-semibold">Reason:</span> {booking.cancellation_reason}
          </div>
        )}
      </div>

      <div className="pt-3.5 flex items-center justify-between gap-2 text-xs border-t border-slate-100 dark:border-slate-700/60">
        {isConfirmed ? (
          <button
            type="button"
            onClick={() => onViewPass && onViewPass(booking)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-blue-500/20"
          >
            <QrCode className="w-3.5 h-3.5 text-teal-200" />
            View QR Pass
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            {booking.booking_date}
          </span>
        )}

        {isCancellable && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(booking)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-3 py-2 rounded-xl transition"
          >
            Cancel Reservation
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;