import React from 'react';
import { QrCode, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative z-20 bg-slate-950 text-white border-t border-slate-800 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: System Info (spans 2 columns on desktop) */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white p-1 shadow-lg border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src="/images/galgotias-logo.png"
                  alt="Galgotias College Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-white text-xl leading-tight tracking-tight">
                  Galgotias College
                </span>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest mt-0.5">
                  Smart Library
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-sans max-w-md">
              Autonomous university workspace platform with real-time seat telemetry,
              conflict-free scheduling, and cryptographic QR turnstile admittance.
            </p>

            <div className="inline-flex items-center gap-2.5 py-2 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs shadow-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-400 tracking-wide">
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Col 2: Workspace & Seating */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white mb-4 font-display flex items-center gap-2 border-b border-slate-800 pb-2">
              Workspace & Desks
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-200 hover:text-white hover:translate-x-1 transition-all inline-block font-medium">
                  Library Overview
                </Link>
              </li>
              <li>
                <Link to="/seats" className="text-slate-200 hover:text-white hover:translate-x-1 transition-all inline-block font-medium">
                  Live Seat Availability
                </Link>
              </li>
              <li>
                <Link to="/book" className="text-slate-200 hover:text-white hover:translate-x-1 transition-all inline-block font-medium">
                  Reserve a Workspace
                </Link>
              </li>
              <li>
                <Link to="/gate-scanner" className="text-teal-300 hover:text-teal-200 hover:translate-x-1 transition-all flex items-center gap-1.5 font-medium">
                  <QrCode className="w-4 h-4 text-teal-400" /> Turnstile Scanner
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Student & Portal Services */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white mb-4 font-display flex items-center gap-2 border-b border-slate-800 pb-2">
              Student & Portal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/dashboard" className="text-slate-200 hover:text-white hover:translate-x-1 transition-all inline-block font-medium">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-slate-200 hover:text-white hover:translate-x-1 transition-all inline-block font-medium">
                  My Reservations
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-200 hover:text-white hover:translate-x-1 transition-all inline-block font-medium">
                  Account Profile
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:translate-x-1 transition-all inline-flex items-center gap-1 font-semibold">
                  Sign In to Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
