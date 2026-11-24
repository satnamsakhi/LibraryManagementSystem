import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Printer,
  RefreshCw,
  Clock,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkInService } from '../services/checkInService';
import LoadingSpinner from './LoadingSpinner';

const DigitalBookingPass = ({ bookingId, onClose, onRefreshSuccess }) => {
  const [passData, setPassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadPass = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await checkInService.getBookingPass(bookingId);
      if (res.success && res.data) {
        setPassData(res.data);
      } else {
        setError(res.message || 'Failed to load QR pass.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to retrieve entry pass.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      loadPass();
    }
  }, [bookingId]);

  const handleRefresh = async () => {
    if (!window.confirm("Refreshing this pass will permanently invalidate your current QR code. Continue?")) {
      return;
    }
    setRefreshing(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await checkInService.refreshBookingPass(bookingId);
      if (res.success && res.data) {
        setPassData(res.data);
        setSuccessMsg("QR credential successfully rotated. Old pass is now invalid.");
        if (onRefreshSuccess) onRefreshSuccess(res.data);
      } else {
        setError(res.message || 'Failed to refresh pass.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to rotate QR credential.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownload = () => {
    if (!passData?.qr_data_uri) return;
    const link = document.createElement('a');
    link.href = passData.qr_data_uri;
    link.download = `Library-Pass-${passData.booking_reference || bookingId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-900 dark:text-slate-100 overflow-hidden"
      >
        {/* Holographic Top Glow Stripe */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-teal-400 to-amber-400"></div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition no-print"
            aria-label="Close pass modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {loading ? (
          <div className="py-16 text-center">
            <LoadingSpinner text="Minting digital entry credential..." />
          </div>
        ) : error ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Entry Pass Unavailable</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{error}</p>
            {onClose && (
              <button
                onClick={onClose}
                className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold"
              >
                Close
              </button>
            )}
          </div>
        ) : passData ? (
          <div className="space-y-6">
            {/* Header: Institutional branding */}
            <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 rounded-full text-xs font-mono font-semibold text-blue-700 dark:text-blue-300 tracking-wide uppercase mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                Physical Turnstile Entry Credential
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Smart Digital Library</h2>
              <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                Official Access Verification Pass
              </p>
            </div>

            {/* Notification messages */}
            {successMsg && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {/* Ticket Card Body */}
            <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 space-y-5 shadow-sm">
              {/* Reference & Status */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block">
                    Booking Reference
                  </span>
                  <span className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">
                    {passData.booking_reference}
                  </span>
                </div>
                <div>
                  {passData.is_used ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Entry Recorded
                    </span>
                  ) : passData.is_revoked ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                      <XCircle className="w-3.5 h-3.5 text-rose-500" /> Revoked
                    </span>
                  ) : passData.is_currently_valid ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active For Entry
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                      Scheduled
                    </span>
                  )}
                </div>
              </div>

              {/* QR Code Container - Always crisp white background for scanners */}
              <div className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner">
                <div className="p-3.5 bg-white rounded-xl shadow-md border border-slate-200">
                  {passData.qr_data_uri ? (
                    <img
                      src={passData.qr_data_uri}
                      alt="Booking Entry QR Code"
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                      <QrCode className="w-16 h-16 opacity-30" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-3.5 text-center">
                  Align this QR code with the gate turnstile scanner or webcam
                </p>
              </div>

              {/* Student & Seat Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                    <User className="w-3 h-3 text-blue-500" /> Student
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{passData.student_name}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">ID: {passData.student_id_masked}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-500" /> Assigned Desk
                  </span>
                  <p className="font-display font-extrabold text-blue-600 dark:text-blue-400 text-sm">Seat {passData.seat_number}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{passData.floor} &bull; {passData.section}</p>
                </div>

                <div className="space-y-1 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-500" /> Date
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-white text-xs">{passData.booking_date}</p>
                </div>

                <div className="space-y-1 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-teal-500" /> Time Window
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-white text-xs font-mono">
                    {passData.start_time?.slice(0,5)} &mdash; {passData.end_time?.slice(0,5)}
                  </p>
                </div>
              </div>

              {/* 20-Minute Arrival Grace Period Alert */}
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-semibold text-amber-950 dark:text-amber-100">20-Minute Arrival Policy:</strong> You must scan this pass at the gate turnstile within <strong>20 minutes</strong> of slot start time ({passData.start_time?.slice(0,5)}). Unclaimed desks after 20 minutes are automatically cancelled and unlocked for other students.
                </div>
              </div>

              {/* Security verification disclaimer */}
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-200/50 dark:border-blue-900/50 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong className="text-blue-700 dark:text-blue-300">Gate Verification:</strong> Turnstile access opens 15 minutes before the start time. Please have your physical student ID ready for manual spot checks if requested.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 no-print">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing || passData.is_used}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition disabled:opacity-50"
                title="Revoke and generate a fresh QR token"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Rotating...' : 'Refresh QR Pass'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!passData.qr_data_uri}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save Image
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm shadow-blue-500/25 active:scale-[0.98]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Pass
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
};

export default DigitalBookingPass;