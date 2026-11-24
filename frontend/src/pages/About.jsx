import React from 'react';
import { Award, BookOpen, CheckCircle, Code, Database, Layers, ShieldCheck, Cpu, QrCode, Lock, Zap, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800"
      >
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
          Smart Digital Library Slot Booking System
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-2xl mx-auto font-sans">
          An enterprise-grade, full-stack digital platform engineered to eliminate library seat contention,
          modernize academic research spaces, and enforce conflict-free desk reservation with digital QR gate verification.
        </p>
      </motion.div>

      {/* Tech Stack Cards */}
      <section className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Code className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              Technology Architecture & Engineering Stack
            </h2>
          </div>
          <a
            href="http://127.0.0.1:8000/api/docs/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
          >
            <span>OpenAPI Swagger</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Backend Architecture
            </span>
            <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">Python 3.14 & Django 5.2</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Django REST Framework, SimpleJWT authentication, PyMySQL / mysqlclient database driver,
              service-layer design pattern, and strict PEP-8 compliance.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Frontend Architecture
            </span>
            <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">React 18 & Tailwind CSS</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Vite build pipeline, Axios HTTP interceptors with automated JWT refresh,
              Lucide React icons, Framer Motion transitions, and modern SaaS design tokens.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Database Storage
            </span>
            <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">MySQL 8.0 Relational DB</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              InnoDB storage engine, ACID atomic transactions, pessimistic row-level locking
              (<code>select_for_update</code>), and indexed foreign key constraints.
            </p>
          </div>
        </div>
      </section>

      {/* QR Code Gate Verification System */}
      <section className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-700/60">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <QrCode className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            Cryptographic QR Entry Verification System
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
          The application implements secure digital entry passes generated via cryptographic tokens.
          When a reservation is confirmed, the system creates a unique <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[11px]">CheckInPass</code> record:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase text-blue-600 dark:text-blue-400 block">
              1. High-Entropy Tokens
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Tokens are generated using Python's <code>secrets.token_urlsafe(32)</code> and stored in the database
              exclusively as SHA-256 hashes to prevent pre-computation and token replay.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase text-teal-600 dark:text-teal-400 block">
              2. Single-Use Admittance
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Passes are strictly single-use. Once scanned at the turnstile, <code>used_at</code> is stamped
              atomically under <code>select_for_update()</code> to defeat concurrent duplicate scan attempts.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400 block">
              3. Privacy Preservation
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              QR passes mask sensitive student identifiers (e.g. <code>STU-****-042</code>) while displaying
              verification credentials for gate staff cross-examination.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Concurrency & Validation Logic */}
      <section className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-700/60">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            Mathematical Overlap Prevention & Concurrency
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
          Traditional naive systems compare slot primary keys (e.g. <code>slot_id == requested_slot_id</code>).
          The Smart Digital Library Slot Booking System employs true time interval comparison:
        </p>
        <div className="bg-slate-900 text-teal-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800">
          <code>
            overlap = max(slot1.start_time, slot2.start_time) &lt; min(slot1.end_time, slot2.end_time)
          </code>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This guarantees that if two different slot configurations overlap in time, or if a student already
          holds an active reservation elsewhere during that time window, the reservation is rejected with an explanatory error.
        </p>
      </section>

      {/* Sustainable Development Goals Alignment */}
      <section className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-700/60">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              Sustainable Development Goals (SDG) Alignment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Mapping institutional technology to the United Nations 2030 Agenda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-1">
            <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">SDG 4: Quality Education</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Equitable and predictable access to quiet desks and workstations fosters an optimal research
              environment, eliminating waiting lines and facility uncertainty for students.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-1">
            <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 uppercase">SDG 9: Industry, Innovation & Infrastructure</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Modernizes higher education campus management by replacing slow manual logbooks with secure,
              automated digital reservation and turnstile validation infrastructure.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">SDG 11: Sustainable Cities & Communities</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Optimizes the utilization of shared academic resources, preventing desk hogging and ensuring
              maximum seat turnover across student cohorts.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">SDG 12: Responsible Consumption & Production</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              100% paperless digital passes reduce paper waste and physical logbooks across library floors
              while recording real-time space utilization analytics.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;