import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmationModal = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  confirmVariant = "danger",
  onConfirm,
  onClose,
  onCancel,
  children
}) => {
  const handleClose = onClose || onCancel;
  const actionType = type || confirmVariant;

  const buttonVariants = {
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-xs",
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-glow-primary",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs",
    warning: "bg-amber-600 hover:bg-amber-500 text-white shadow-xs",
  };

  const iconVariants = {
    danger: <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
    primary: <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.2, bounce: 0 }}
            className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-white z-10"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl p-1.5 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center shrink-0 mt-0.5">
                {iconVariants[actionType] || iconVariants.primary}
              </div>
              <div>
                <h3 className="text-base font-bold font-display leading-tight">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{message}</p>
              </div>
            </div>

            {children && <div className="my-4">{children}</div>}

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${buttonVariants[actionType] || buttonVariants.primary}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
