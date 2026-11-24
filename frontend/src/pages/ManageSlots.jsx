import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Clock,
  PlusCircle,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Calendar,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const ManageSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    slot_name: '',
    start_time: '09:00:00',
    end_time: '11:00:00',
    is_active: true,
  });
  const [modalError, setModalError] = useState('');
  const [modalSaving, setModalSaving] = useState(false);

  // Delete State
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSlots();
      const list = response.results || response.data || response;
      setSlots(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load slots', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleOpenAdd = () => {
    setEditingSlot(null);
    setFormData({
      slot_name: '',
      start_time: '09:00:00',
      end_time: '11:00:00',
      is_active: true,
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      slot_name: slot.slot_name,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_active: slot.is_active,
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    setModalSaving(true);
    setModalError('');

    try {
      if (editingSlot) {
        await adminService.updateSlot(editingSlot.id, formData);
      } else {
        await adminService.createSlot(formData);
      }
      setModalOpen(false);
      fetchSlots();
    } catch (err) {
      const errDetail =
        err.response?.data?.end_time?.[0] ||
        err.response?.data?.message ||
        'Failed to save time slot.';
      setModalError(errDetail);
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteClick = (slot) => {
    setSlotToDelete(slot);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!slotToDelete) return;
    setDeleteError('');
    try {
      await adminService.deleteSlot(slotToDelete.id);
      setDeleteModalOpen(false);
      setSlotToDelete(null);
      fetchSlots();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Cannot delete time slot linked to active future reservations.';
      setDeleteError(msg);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] text-slate-900 dark:text-slate-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                Operational Timetable
              </span>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Slot Windows</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              Library Session Time Slots
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Define standard study blocks, morning/afternoon shifts, and interval durations across the academic day.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition self-start sm:self-auto active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" /> Add Session Slot
          </button>
        </div>

        {/* Slots Table */}
        {loading ? (
          <div className="py-20 flex justify-center bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80">
            <LoadingSpinner text="Loading timetable slots..." />
          </div>
        ) : slots.length > 0 ? (
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Session Name</th>
                    <th className="py-3.5 px-4">Time Window</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {slots.map((sl) => (
                    <tr key={sl.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                      <td className="py-3.5 px-4 font-bold font-display text-slate-900 dark:text-white text-sm">
                        {sl.slot_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {sl.start_time?.slice(0, 5)} &ndash; {sl.end_time?.slice(0, 5)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-sans">
                        {sl.duration_minutes} minutes
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            sl.is_active
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {sl.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(sl)}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            title="Edit Slot"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(sl)}
                            className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <Clock className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-base font-bold font-display text-slate-900 dark:text-white">No Session Slots Found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure daily study blocks to enable bookings.</p>
          </div>
        )}

        {/* Add / Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 relative border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1 font-bold">
                  Schedule Configuration
                </span>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                  {editingSlot ? `Edit Slot: ${editingSlot.slot_name}` : 'Create New Session Slot'}
                </h3>
              </div>

              {modalError && (
                <div className="mb-4 text-xs text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/50 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-800/60 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveSlot} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                    Slot Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slot_name}
                    onChange={(e) => setFormData({ ...formData, slot_name: e.target.value })}
                    placeholder="e.g. Morning Study Block (09:00 - 11:30)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                      Start Time (HH:MM) *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.start_time.slice(0, 5)}
                      onChange={(e) => setFormData({ ...formData, start_time: `${e.target.value}:00` })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                      End Time (HH:MM) *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.end_time.slice(0, 5)}
                      onChange={(e) => setFormData({ ...formData, end_time: `${e.target.value}:00` })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Slot is active for student reservations</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSaving}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/25 disabled:opacity-50 active:scale-[0.98]"
                  >
                    {modalSaving ? 'Saving...' : 'Save Time Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          title="Delete Time Slot"
          message={`Are you sure you want to delete session slot "${slotToDelete?.slot_name}"? This slot cannot be deleted if active future reservations depend on it.`}
          confirmText="Delete Slot"
          type="danger"
          onClose={() => {
            setDeleteModalOpen(false);
            setSlotToDelete(null);
          }}
          onConfirm={confirmDelete}
        >
          {deleteError && (
            <div className="text-xs text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/50 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-800/60 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{deleteError}</span>
            </div>
          )}
        </ConfirmationModal>
      </main>
    </div>
  );
};

export default ManageSlots;