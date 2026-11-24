import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  BookOpen,
  LayoutDashboard,
  CalendarCheck,
  Armchair,
  Clock,
  User,
  Users,
  LogOut,
  Menu,
  X,
  QrCode,
  ShieldCheck,
  ChevronDown,
  History,
  Sun,
  Moon,
  Sparkles,
  BarChart3,
  BookmarkCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isLibrarian, isStudent, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 shrink-0">
                <img
                  src="/images/galgotias-logo.png"
                  alt="Galgotias College Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 dark:from-white dark:via-blue-200 dark:to-slate-200 bg-clip-text text-transparent leading-tight">
                  Galgotias College
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-blue-600 dark:text-cyan-400 uppercase leading-none mt-0.5">
                  Smart Library
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/60 p-1 rounded-full border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                isActive('/')
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Home
            </Link>

            <Link
              to="/seats"
              className={`px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                isActive('/seats')
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Armchair className="w-3.5 h-3.5" />
              Seats
            </Link>

            {isStudent && (
              <>
                <Link
                  to="/book"
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                    isActive('/book')
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  Reservations
                </Link>

                <Link
                  to="/my-bookings"
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                    isActive('/my-bookings')
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  My Passes
                </Link>
              </>
            )}

            {(isAdmin || isLibrarian) && (
              <Link
                to="/gate-scanner"
                className={`px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                  isActive('/gate-scanner')
                    ? 'bg-teal-500 text-white font-semibold shadow-xs'
                    : 'text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                Gate Scanner
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics
              </Link>
            )}

            <Link
              to="/about"
              className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                isActive('/about')
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              About
            </Link>
          </nav>

          {/* Right Action Icons & User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/60 dark:border-slate-700/60"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4 text-slate-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                    isAdmin
                      ? 'bg-blue-600'
                      : isLibrarian
                      ? 'bg-teal-600'
                      : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                  }`}>
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[110px] leading-tight">
                      {user?.full_name?.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                      {user?.role?.toLowerCase()}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" />
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-200 dark:border-slate-700 p-2 z-50 text-xs"
                    >
                      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700/60">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {user?.full_name}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate mt-0.5">
                          {user?.email}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isAdmin
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : isLibrarian
                              ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {user?.role}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            ● Active
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        {isStudent && (
                          <>
                            <Link
                              to="/dashboard"
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
                            >
                              <LayoutDashboard className="w-4 h-4 text-blue-500" />
                              Student Dashboard
                            </Link>
                            <Link
                              to="/my-bookings"
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
                            >
                              <BookmarkCheck className="w-4 h-4 text-teal-500" />
                              My Passes & Bookings
                            </Link>
                          </>
                        )}

                        {isAdmin && (
                          <>
                            <Link
                              to="/admin"
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
                            >
                              <BarChart3 className="w-4 h-4 text-blue-500" />
                              Admin Overview
                            </Link>
                            <Link
                              to="/admin/users"
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
                            >
                              <Users className="w-4 h-4 text-indigo-500" />
                              Manage Users
                            </Link>
                          </>
                        )}

                        {(isAdmin || isLibrarian) && (
                          <Link
                            to="/gate-scanner"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
                          >
                            <QrCode className="w-4 h-4 text-teal-500" />
                            Turnstile QR Scanner
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
                        >
                          <User className="w-4 h-4 text-amber-500" />
                          Account Settings
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-glow-primary transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200/60 dark:border-slate-700/60"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-4 space-y-2 text-sm"
          >
            <Link
              to="/"
              className={`block px-3 py-2 rounded-xl font-medium ${
                isActive('/') ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              Home
            </Link>
            <Link
              to="/seats"
              className={`block px-3 py-2 rounded-xl font-medium ${
                isActive('/seats') ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              Seat Grid & Availability
            </Link>

            {isStudent && (
              <>
                <Link
                  to="/book"
                  className={`block px-3 py-2 rounded-xl font-medium ${
                    isActive('/book') ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  Reserve Desk
                </Link>
                <Link
                  to="/my-bookings"
                  className={`block px-3 py-2 rounded-xl font-medium ${
                    isActive('/my-bookings') ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  My Passes
                </Link>
              </>
            )}

            {(isAdmin || isLibrarian) && (
              <Link
                to="/gate-scanner"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium ${
                  isActive('/gate-scanner') ? 'bg-teal-500 text-white font-semibold' : 'text-teal-600 dark:text-teal-400'
                }`}
              >
                <QrCode className="w-4 h-4" />
                Gate QR Scanner
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className={`block px-3 py-2 rounded-xl font-medium ${
                    isActive('/admin') ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  className={`block px-3 py-2 rounded-xl font-medium ${
                    isActive('/admin/users') ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  Manage Users
                </Link>
              </>
            )}

            <Link
              to="/about"
              className={`block px-3 py-2 rounded-xl font-medium ${
                isActive('/about') ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              About & Architecture
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
