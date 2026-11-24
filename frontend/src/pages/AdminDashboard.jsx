import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import {
  Users,
  Armchair,
  CalendarCheck,
  Percent,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Wrench,
  ShieldCheck,
  QrCode,
  History,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [dashRes, repRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getReports(),
      ]);
      if (dashRes.success) setData(dashRes.data);
      if (repRes.success) setReports(repRes.data);
    } catch (err) {
      console.error("Failed to load admin metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Compiling administrator telemetry..." />
      </div>
    );
  }

  const users = data?.users || {};
  const seats = data?.seats || {};
  const bookings = data?.bookings || {};
  const todayReservations = data?.today_reservations || [];
  const dailyTrends = reports?.daily_trends || [];
  const floorReport = reports?.floor_report || [];

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-slate-900 dark:text-slate-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrative Operations Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              Library Oversight & Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time seat utilization, turnstile admittance logging, and inventory management.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchData}
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition shadow-xs"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <Link
              to="/gate-scanner"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition shadow-md shadow-teal-500/25 active:scale-[0.98]"
            >
              <QrCode className="w-3.5 h-3.5" /> Gate Scanner
            </Link>

            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-md shadow-blue-500/25 active:scale-[0.98]"
            >
              <Users className="w-3.5 h-3.5 text-blue-200" /> Manage Users
            </Link>
          </div>
        </div>

        {/* 6 Key Telemetry Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
              Enrolled Users
            </span>
            <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">{users.total || 0}</p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">{users.active || 0} active</span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
              Physical Desks
            </span>
            <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">{seats.total || 0}</p>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">{seats.under_maintenance || 0} repairs</span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-blue-600 dark:text-blue-400 block">
              Today's Bookings
            </span>
            <p className="text-2xl font-display font-extrabold text-blue-600 dark:text-blue-400">{bookings.today_count || 0}</p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{bookings.confirmed || 0} confirmed</span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-teal-600 dark:text-teal-400 block">
              Capacity Gauge
            </span>
            <p className="text-2xl font-display font-extrabold text-teal-600 dark:text-teal-400">{bookings.occupancy_rate || 0}%</p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Today's load</span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-rose-600 dark:text-rose-400 block">
              Cancellations
            </span>
            <p className="text-2xl font-display font-extrabold text-rose-600 dark:text-rose-400">{bookings.cancelled || 0}</p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Desks released</span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
              Completed
            </span>
            <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">{bookings.completed || 0}</p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Concluded study</span>
          </div>
        </div>

        {/* Floor Utilization & Gate Quick Action Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Floor Capacity Progress (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-800/90 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Floor Utilization Breakdown</h3>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">3 Facility Levels</span>
            </div>

            {floorReport.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 italic">No floor inventory data available.</p>
            ) : (
              <div className="space-y-4">
                {floorReport.map((fl) => {
                  const pct = fl.total > 0 ? Math.round((fl.reserved / fl.total) * 100) : 0;
                  return (
                    <div key={fl.floor} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{fl.floor}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                          {fl.reserved} / {fl.total} reserved ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-teal-500 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Security & Gate Controls (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block">
                Turnstile Operations
              </span>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Gate Entrance Controls</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                Launch the turnstile camera scanner or review full immutable admittance audit logs to verify student physical entrance.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                to="/gate-scanner"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-teal-500/25 transition active:scale-[0.98]"
              >
                <QrCode className="w-4 h-4" /> Launch Turnstile QR Scanner
              </Link>

              <Link
                to="/admin/entry-history"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                <History className="w-4 h-4 text-slate-400" /> View Admittance Audit Logs
              </Link>
            </div>
          </div>
        </div>

        {/* Today's Active Reservations Table */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden space-y-0">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Today's Active Reservations</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Students scheduled to occupy library study desks today.</p>
            </div>
            <Link to="/admin/bookings" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              View all bookings &rarr;
            </Link>
          </div>

          {todayReservations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 italic">
              No active reservations booked for today.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Ref</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Desk</th>
                    <th className="py-3.5 px-4">Floor / Zone</th>
                    <th className="py-3.5 px-4">Session Window</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Gate Check-in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {todayReservations.map((bk) => (
                    <tr key={bk.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{bk.booking_reference}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{bk.user?.full_name}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">Seat {bk.seat?.seat_number}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{bk.seat?.floor}</td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono">
                        {bk.slot?.start_time?.slice(0, 5)} - {bk.slot?.end_time?.slice(0, 5)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                          {bk.booking_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {bk.checked_in_at ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            {new Date(bk.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Awaiting arrival</span>
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

export default AdminDashboard;