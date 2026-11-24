import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import DigitalBookingPass from '../components/DigitalBookingPass';
import {
  CalendarCheck,
  Search,
  Filter,
  XCircle,
  Eye,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Armchair,
  QrCode,
  RefreshCw,
  X,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Cancellation State
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Administrative operational adjustment');
  const [actionError, setActionError] = useState('');

  // Pass Modal State
  const [activePassBookingId, setActivePassBookingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        status: statusFilter || undefined,
        date: dateFilter || undefined,
      };
      const response = await adminService.getBookings(params);
      const list = response.results || response.data || response;
      setBookings(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleCancelClick = (b) => {
    setSelectedBookingToCancel(b);
    setActionError('');
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedBookingToCancel) return;
    setActionError('');
    try {
      await adminService.cancelBooking(selectedBookingToCancel.id, cancelReason);
      setCancelModalOpen(false);
      setSelectedBookingToCancel(null);
      fetchBookings();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel reservation.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-slate-900 dark:text-slate-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              Operations Audit
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              Master Reservation Register
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Inspect student reservations, examine check-in timestamps, and exercise administrative cancellation controls.
            </p>
          </div>

          <button
            onClick={fetchBookings}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        {actionError && (
          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 text-xs p-4 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference, student name, seat code..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="sm:col-span-1">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition shadow-sm shadow-blue-500/25 active:scale-[0.98]"
              >
                Filter
              </button>
            </div>
          </form>
        </div>

        {/* Master Table */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <LoadingSpinner text="Retrieving booking records..." />
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <CalendarCheck className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
              <p className="text-base font-display font-bold text-slate-900 dark:text-white">No Reservations Found</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No bookings match your current search parameters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Ref Code</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Desk</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Session Window</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Turnstile Admittance</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {bookings.map((b) => {
                    const isConfirmed = b.booking_status === 'CONFIRMED';
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {b.booking_reference}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-900 dark:text-white">
                          {b.user?.full_name || 'N/A'}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                          Seat {b.seat?.seat_number}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-mono">
                          {b.booking_date}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-mono">
                          {b.slot?.start_time?.slice(0, 5)} - {b.slot?.end_time?.slice(0, 5)}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            b.booking_status === 'CONFIRMED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                              : b.booking_status === 'CANCELLED'
                              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {b.booking_status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {b.checked_in_at ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              {new Date(b.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Not yet scanned</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {isConfirmed && (
                              <button
                                type="button"
                                onClick={() => setActivePassBookingId(b.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-xl transition"
                                title="Inspect student's QR pass"
                              >
                                <QrCode className="w-3.5 h-3.5 text-teal-500" /> Pass
                              </button>
                            )}

                            {isConfirmed && (
                              <button
                                type="button"
                                onClick={() => handleCancelClick(b)}
                                className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 rounded-xl transition"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cancellation Modal */}
        <ConfirmationModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onConfirm={confirmCancel}
          title={`Administrative Cancellation: ${selectedBookingToCancel?.booking_reference}`}
          message="Are you sure you want to cancel this booking? The seat will be released immediately for other students."
          confirmText="Yes, Cancel Reservation"
          type="danger"
        >
          <div className="mt-3 space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Recorded Operational Reason
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </ConfirmationModal>

        {/* Digital Pass Modal */}
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

export default ManageBookings;