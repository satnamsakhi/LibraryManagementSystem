import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Armchair,
  Clock,
  Users,
  QrCode,
  History,
  User,
  ShieldCheck,
  BookmarkCheck,
  BarChart3,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user, isAdmin, isLibrarian, isGateStaff } = useAuth();

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/book', label: 'Reserve Desk', icon: CalendarCheck },
    { to: '/seats', label: 'Seat Grid', icon: Armchair },
    { to: '/my-bookings', label: 'My Passes', icon: BookmarkCheck },
    { to: '/profile', label: 'Account Profile', icon: User },
  ];

  const librarianLinks = [
    { to: '/gate-scanner', label: 'Turnstile Scanner', icon: QrCode, badge: 'Live' },
    { to: '/entry-history', label: 'Admittance History', icon: History },
    { to: '/seats', label: 'Live Floor Matrix', icon: Armchair },
    { to: '/profile', label: 'Staff Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/seats', label: 'Manage Desks', icon: Armchair },
    { to: '/admin/slots', label: 'Manage Slots', icon: Clock },
    { to: '/admin/bookings', label: 'Reservations', icon: CalendarCheck },
    { to: '/gate-scanner', label: 'Gate Scanner', icon: QrCode, highlight: true },
    { to: '/admin/entry-history', label: 'Admittance Logs', icon: History },
    { to: '/seats', label: 'Public Seat Grid', icon: Armchair },
    { to: '/profile', label: 'Admin Profile', icon: User },
  ];

  let links = studentLinks;
  if (isAdmin) {
    links = adminLinks;
  } else if (isLibrarian) {
    links = librarianLinks;
  }

  const roleLabel = isAdmin ? 'Administrator' : isLibrarian ? 'Library Gate Staff' : 'Student Scholar';

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0 transition-colors duration-200">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0 ${
            isAdmin
              ? 'bg-blue-600 shadow-glow-primary'
              : isLibrarian
              ? 'bg-teal-600 shadow-glow-secondary'
              : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
          }`}>
            {isAdmin ? <ShieldCheck className="w-5 h-5" /> : isLibrarian ? <QrCode className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div className="overflow-hidden">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate font-display">
              {user?.full_name || 'Academic User'}
            </h5>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block tracking-wide">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2 block">
            Navigation
          </span>
          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin' || item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-glow-primary'
                        : item.highlight
                        ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-950/70'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3 truncate">
                        <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                        }`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isActive
                            ? 'bg-white text-blue-600'
                            : 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info Widget */}
      <div className="mt-8 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1 text-xs">
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
          <Sparkles className="w-3.5 h-3.5" /> Turnstile Check-In
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
          Passes activate 15 mins before your time slot. Scan with gate staff upon arrival.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
