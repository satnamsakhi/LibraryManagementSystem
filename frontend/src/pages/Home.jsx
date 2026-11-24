import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { seatService } from '../services/seatService';
import { motion } from 'framer-motion';
import {
  BookOpen,
  CalendarCheck,
  Armchair,
  ShieldCheck,
  Clock,
  ArrowRight,
  QrCode,
  Layers,
  Award,
  Lock,
  UserCheck,
  TrendingUp,
  Users,
  Compass,
  BellRing,
  BarChart3,
  ChevronRight,
  MapPin,
  Laptop
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, isStudent, isAdmin, isLibrarian } = useAuth();
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState({
    available_seats: 42,
    total_seats: 48,
    active_reservations: 4,
    occupied_seats: 4,
    students_count: 4,
    students_today: 1,
    floors_count: 4,
  });

  // Fetch live system telemetry from backend on mount
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await seatService.getPublicStats();
        if (res.success && res.data) {
          setTelemetry(res.data);
        }
      } catch (err) {
        console.error("Failed to load public telemetry", err);
      }
    };
    fetchTelemetry();
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const stats = [
    {
      label: 'Available Seats',
      value: telemetry.available_seats,
      total: `/ ${telemetry.total_seats}`,
      change: 'Real-time database sync',
      color: 'emerald'
    },
    {
      label: 'Active Reservations',
      value: telemetry.active_reservations,
      total: 'confirmed',
      change: 'Active today',
      color: 'blue'
    },
    {
      label: 'Floors Covered',
      value: telemetry.floors_count,
      total: 'active floors',
      change: 'Ground, 1st, 2nd & 3rd',
      color: 'teal'
    },
    {
      label: 'Student Usage',
      value: telemetry.students_today || telemetry.students_count,
      total: 'active scholars',
      change: 'Turnstile verified',
      color: 'amber'
    },
  ];

  const features = [
    {
      icon: Armchair,
      title: 'Real-Time Seat Availability',
      desc: 'View live desk availability across 4 floors with color-coded status badges and instant updates.',
      tag: 'Live Telemetry',
      link: '/seats',
      btnText: 'View Available Desks',
      accent: 'text-blue-400 bg-blue-500/10 border-blue-400/20'
    },
    {
      icon: QrCode,
      title: 'Instant QR Code Entry',
      desc: 'Cryptographic digital passes with rotating SHA-256 tokens enable 2-second turnstile admittance.',
      tag: 'Zero Queues',
      link: isAuthenticated ? (isAdmin || isLibrarian ? '/gate-scanner' : '/my-bookings') : '/login',
      btnText: 'Access Digital Pass',
      accent: 'text-teal-400 bg-teal-500/10 border-teal-400/20'
    },
    {
      icon: Layers,
      title: 'Multi-Floor Navigation',
      desc: 'Switch effortlessly between Quiet Study, Computer Lab, and Collaborative Discussion zones.',
      tag: 'Smart Zoning',
      link: '/seats',
      btnText: 'Explore 4 Floors',
      accent: 'text-indigo-400 bg-indigo-500/10 border-indigo-400/20'
    },
    {
      icon: Clock,
      title: 'Reservation History & Rebook',
      desc: 'Track completed research sessions, review pass timestamps, and rebook preferred desks in 1 click.',
      tag: 'Student Audit',
      link: isAuthenticated ? '/my-bookings' : '/login',
      btnText: 'Check Active Slots',
      accent: 'text-amber-400 bg-amber-500/10 border-amber-400/20'
    },
    {
      icon: BellRing,
      title: 'Automated Reminders & Release',
      desc: 'Automatic 15-minute gate admittance alerts and instant seat recycling on cancellation.',
      tag: 'Zero Hoarding',
      link: isAuthenticated ? '/book' : '/login',
      btnText: 'Reserve Quiet Desk',
      accent: 'text-purple-400 bg-purple-500/10 border-purple-400/20'
    },
    {
      icon: BarChart3,
      title: 'Admin & Staff Telemetry',
      desc: 'Powerful administrative dashboard with seat utilization rates, user management, and gate scanning.',
      tag: 'Live Insights',
      link: isAuthenticated ? (isAdmin ? '/admin' : isLibrarian ? '/gate-scanner' : '/dashboard') : '/login',
      btnText: 'Open Console',
      accent: 'text-rose-400 bg-rose-500/10 border-rose-400/20'
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Full Home Page Fixed Smart Digital Library Photographic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src="/images/digital-smart-library.jpg"
          alt="Smart Digital Library Interior"
          className="w-full h-full object-cover object-center opacity-70 filter brightness-[0.90] contrast-[1.12]"
        />
        {/* Full-Page Balanced Atmospheric Scrim: Keeps Library Image Visible Throughout Entire Page */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/45 to-slate-950/70" />

        {/* Center Radial Soft Vignette for Text Clarity */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,_rgba(15,23,42,0.30)_0%,_rgba(2,6,23,0.70)_100%)]" />

        {/* Ambient Cyan Accent Glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-tr from-cyan-500/15 via-blue-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />
      </div>

      {/* Main Page Content - relative z-10 ensures content is elevated above the fixed background */}
      <div className="relative z-10 space-y-20 pb-20">
        {/* Hero Section */}
        <section className="relative pt-12 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="space-y-6"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.1] uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                Smart Digital Library <br />
                <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_18px_rgba(37,99,235,0.6)]">
                  Slot Booking
                </span>
              </h1>

              <p className="text-slate-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-sans font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                Reserve library desks, monitor live seat availability, and access study resources from one modern platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                {isAuthenticated ? (
                  <Link
                    to={isAdmin ? "/admin" : isLibrarian ? "/gate-scanner" : "/dashboard"}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-glow-primary hover:-translate-y-0.5 transition-all"
                  >
                    Enter Portal Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/book"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-glow-primary hover:-translate-y-0.5 transition-all"
                    >
                      <CalendarCheck className="w-4 h-4" /> Reserve Seat
                    </Link>
                    <Link
                      to="/seats"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg hover:-translate-y-0.5 transition-all backdrop-blur-md"
                    >
                      <Armchair className="w-4 h-4 text-cyan-300" /> Explore Library
                    </Link>
                  </>
                )}

                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition"
                >
                  Learn Architecture <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      {/* Statistics Section (4 Glass Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-slate-900/75 backdrop-blur-2xl rounded-2xl p-6 border border-white/15 shadow-2xl hover:border-blue-500/50 hover:bg-slate-900/90 transition-all relative overflow-hidden"
            >
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  {stat.label}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-display font-black text-white">
                    {stat.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {stat.total}
                  </span>
                </div>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{stat.change}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 6 Interactive Feature Cards (Showing and Working) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => navigate(feat.link)}
                className="group p-6 rounded-3xl bg-slate-900/65 hover:bg-slate-900/85 backdrop-blur-xl border border-white/10 hover:border-blue-400/50 shadow-2xl transition-all flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${feat.accent} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                      {feat.tag}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-cyan-300 transition-colors">
                  <span>{feat.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Institutional CTA Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-700 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <h3 className="text-2xl sm:text-4xl font-display font-black tracking-tight">
              Ready to experience modern library management?
            </h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Reserve your quiet study slot or test turnstile gate scanning in real-time.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/book"
                className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 font-semibold text-sm rounded-xl transition shadow-md"
              >
                Book Your Study Slot Now
              </Link>
              <a
                href="http://127.0.0.1:8000/api/docs/"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold text-sm rounded-xl transition backdrop-blur-xs border border-white/20"
              >
                Swagger API Specs &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default Home;