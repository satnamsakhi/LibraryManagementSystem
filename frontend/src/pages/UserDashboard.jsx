import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import Sidebar from '../components/Sidebar';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import DigitalBookingPass from '../components/DigitalBookingPass';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Clock,
  Armchair,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ArrowRight,
  QrCode,
  AlertCircle,
  ShieldCheck,
  MapPin,
  Calendar,
  Sparkles,
  TrendingUp
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionError, setActionError] = useState('');

  // Pass modal
  const [activePassBookingId, setActivePassBookingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const response = await bookingService.getStudentDashboard();
      if (response.success) {
        setStats(response.data);
      }
    } catch (e) {
      console.error("Failed to load student dashboard stats", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelClick = (booking) => {
    setSelectedBookingToCancel(booking);
    setCancelModalOpen(true);
    setActionError('');
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingToCancel) return;
    try {
      await bookingService.cancelBooking(selectedBookingToCancel.id, cancellationReason);
      setCancelModalOpen(false);
      setSelectedBookingToCancel(null);
      setCancellationReason('');
      fetchDashboardData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel reservation.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Retrieving student profile & schedule..." />
      </div>
    );
  }

  const overview = stats?.overview || {};
  const upcoming = stats?.upcoming_booking;
  const recent = stats?.recent_bookings || [];

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-slate-900 dark:text-slate-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800/90 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
              <span>Academic Student Portal</span>
              <span>&bull;</span>
              <span>Roll: {user?.student_id || 'N/A'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome, {user?.full_name?.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.department || 'University Scholar'} &bull; Status:{' '}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{user?.account_status}</span>
            </p>
          </div>

          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 hover:shadow-glow-primary transition-all self-start sm:self-auto active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-teal-200" /> Reserve Study Desk
          </Link>
        </motion.div>

        {/* Telemetry Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500">
              Total Reservations
            </span>
            <p className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
              {overview.total_bookings || 0}
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Lifetime reservations</span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-blue-600 dark:text-blue-400">
              Active Sessions
            </span>
            <p className="text-3xl font-display font-extrabold text-blue-600 dark:text-blue-400">
              {overview.active_bookings || 0}
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Confirmed for today / future</span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-teal-600 dark:text-teal-400">
              Completed Hours
            </span>
            <p className="text-3xl font-display font-extrabold text-teal-600 dark:text-teal-400">
              {overview.completed_bookings || 0}
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Past concluded sessions</span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-rose-600 dark:text-rose-400">
              Cancellations
            </span>
            <p className="text-3xl font-display font-extrabold text-rose-600 dark:text-rose-400">
              {overview.cancelled_bookings || 0}
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Released study desks</span>
          </div>
        </div>

        {/* Priority Upcoming Session & QR Pass Banner */}
        {upcoming ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-50/60 to-teal-50/60 dark:from-blue-950/40 dark:to-teal-950/40 border-2 border-blue-500/30 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-blue-200/60 dark:border-blue-900/60 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-blue-700 dark:text-blue-300">
                  Next Scheduled Research Session
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                Ref: {upcoming.booking_reference}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Assigned Workspace</span>
                <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                  Seat {upcoming.seat?.seat_number}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {upcoming.seat?.floor} &bull; {upcoming.seat?.section}
                </p>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">Timing</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" /> {upcoming.booking_date}
                </p>
                <p className="font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-500" />
                  {upcoming.slot?.start_time?.slice(0, 5)} - {upcoming.slot?.end_time?.slice(0, 5)}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActivePassBookingId(upcoming.id)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-blue-500/25 transition-all active:scale-[0.98]"
                >
                  <QrCode className="w-4 h-4 text-teal-200" />
                  Open Entry QR Pass
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-slate-800/80 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center space-y-2.5">
            <CalendarCheck className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600" />
            <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">No Active Study Session Scheduled</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You do not have any upcoming reservations booked. Reserve a study desk to obtain your entrance pass.
            </p>
            <div className="pt-2">
              <Link
                to="/book"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Book a study desk now &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Recent Bookings Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Recent Study Sessions</h3>
            <Link to="/my-bookings" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              View all history &rarr;
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-6 italic text-center">No previous reservations recorded.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recent.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelClick}
                  onViewPass={(b) => setActivePassBookingId(b.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        <ConfirmationModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
          title={`Cancel Reservation: ${selectedBookingToCancel?.booking_reference}`}
          message="Are you sure you wish to cancel this reservation? The desk will be immediately released, and your digital QR pass will be invalidated."
          confirmText="Confirm Cancellation"
          type="danger"
        />

        {/* Digital QR Entry Pass Modal */}
        {activePassBookingId && (
          <DigitalBookingPass
            bookingId={activePassBookingId}
            onClose={() => setActivePassBookingId(null)}
            onRefreshSuccess={() => fetchDashboardData()}
          />
        )}
      </main>
    </div>
  );
};

export default UserDashboard;