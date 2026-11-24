import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import Sidebar from '../components/Sidebar';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import DigitalBookingPass from '../components/DigitalBookingPass';
import {
  CalendarCheck,
  PlusCircle,
  Filter,
  BookmarkCheck,
  AlertCircle,
  QrCode,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, active, upcoming, past, cancelled
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionError, setActionError] = useState('');

  // Digital QR Pass Modal
  const [activePassBookingId, setActivePassBookingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'all') {
        params.filter = activeTab;
      }
      const response = await bookingService.getMyBookings(params);
      const list = response.results || response.data || response;
      setBookings(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load student bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

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
      fetchBookings();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel reservation.');
    }
  };

  const tabs = [
    { id: 'all', label: 'All Reservations' },
    { id: 'active', label: 'Active Sessions' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past / Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-slate-900 dark:text-slate-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              Personal Study Schedule
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Seat Reservations & Passes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Access your digital entrance QR codes, inspect desk assignments, and manage upcoming research sessions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchBookings}
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition shadow-xs"
              title="Refresh reservations"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 text-teal-200" /> Reserve Study Desk
            </Link>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {actionError && (
          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 text-xs p-3.5 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="py-24 text-center">
            <LoadingSpinner text="Fetching reservation records..." />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 mx-auto flex items-center justify-center text-slate-400 dark:text-slate-500">
              <BookmarkCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">No Reservations in this Category</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                You currently have no bookings matching the selected filter. Check other tabs or reserve a new study desk.
              </p>
            </div>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-semibold shadow-md shadow-blue-500/25 transition active:scale-[0.98]"
            >
              Reserve a Study Desk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelClick}
                onViewPass={(b) => setActivePassBookingId(b.id)}
              />
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        <ConfirmationModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
          title={`Cancel Reservation: ${selectedBookingToCancel?.booking_reference}`}
          message="Are you sure you want to cancel this reservation? The seat will be immediately released for other students, and your digital QR entry pass will be invalidated."
          confirmText="Yes, Cancel Booking"
          type="danger"
        >
          <div className="mt-3 space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cancellation Reason (Optional)
            </label>
            <input
              type="text"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g., Class schedule change, unwell, etc."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </ConfirmationModal>

        {/* Digital QR Entry Pass Modal */}
        {activePassBookingId && (
          <DigitalBookingPass
            bookingId={activePassBookingId}
            onClose={() => setActivePassBookingId(null)}
            onRefreshSuccess={() => fetchBookings()}
          />
        )}
      </main>
    </div>
  );
};

export default MyBookings;