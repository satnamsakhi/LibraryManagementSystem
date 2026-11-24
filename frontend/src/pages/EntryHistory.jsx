import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  RefreshCw,
  User,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { checkInService } from '../services/checkInService';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';

const EntryHistory = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        status: statusFilter || undefined,
        date: dateFilter || undefined,
      };
      const res = await checkInService.getGateHistory(params);
      const list = res.results || res.data || res;
      setEvents(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch entry audit history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setDateFilter('');
    setTimeout(fetchHistory, 50);
  };

  return (
    <div className="flex min-h-screen text-slate-900 dark:text-slate-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-mono uppercase tracking-wider font-bold rounded-full border border-blue-200 dark:border-blue-800">
                Physical Security Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              Gate Admittance Audit History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive immutable record of all physical turnstile QR verification events.
            </p>
          </div>

          <button
            onClick={fetchHistory}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Records
          </button>
        </div>

        {/* Filters Card */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student, seat, ref, or ID..."
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="">All Verification Outcomes</option>
                <option value="APPROVED">Approved Admittance Only</option>
                <option value="REJECTED">Rejected Attempts Only</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="sm:col-span-3">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Search Button */}
            <div className="sm:col-span-1 flex gap-1">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition text-center shadow-sm shadow-blue-500/25 active:scale-[0.98]"
              >
                Filter
              </button>
            </div>
          </form>

          {(search || statusFilter || dateFilter) && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Active filters applied</span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Data Table Container */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <LoadingSpinner text="Loading gate admittance logs..." />
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <History className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
              <p className="text-base font-display font-bold text-slate-900 dark:text-white">No Gate Audit Records Found</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No entry events match the current criteria. Clear filters or verify scanner activity.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Enrollment ID</th>
                    <th className="py-3.5 px-4">Booking Ref</th>
                    <th className="py-3.5 px-4">Seat Code</th>
                    <th className="py-3.5 px-4">Slot</th>
                    <th className="py-3.5 px-4">Gate Staff Officer</th>
                    <th className="py-3.5 px-4">Details / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {ev.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> APPROVED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                            <XCircle className="w-3.5 h-3.5 text-rose-500" /> REJECTED
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {ev.scanned_at ? new Date(ev.scanned_at).toLocaleString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        }) : 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-900 dark:text-white">
                        {ev.student_name || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-500 dark:text-slate-400">
                        {ev.student_id_masked || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-blue-600 dark:text-blue-400">
                        {ev.booking_reference || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        {ev.seat_number ? `Seat ${ev.seat_number}` : 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                        {ev.slot_name || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                        {ev.scanned_by_name || 'Gate Scanner'}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={ev.rejection_reason}>
                        {ev.rejection_reason || (
                          <span className="text-emerald-600 dark:text-emerald-400 italic font-medium">Turnstile passed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EntryHistory;