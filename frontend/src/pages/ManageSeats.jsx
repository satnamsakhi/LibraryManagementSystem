import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { seatService } from '../services/seatService';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Armchair,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Wrench,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const ManageSeats = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [floorFilter, setFloorFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeat, setEditingSeat] = useState(null);
  const [formData, setFormData] = useState({
    seat_number: '',
    floor: 'First Floor',
    section: 'Quiet Zone',
    seat_type: 'REGULAR',
    is_active: true,
    is_under_maintenance: false,
  });
  const [modalError, setModalError] = useState('');
  const [modalSaving, setModalSaving] = useState(false);

  // Delete State
  const [seatToDelete, setSeatToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const params = {
        floor: floorFilter || undefined,
        section: sectionFilter || undefined,
      };
      const response = await seatService.getSeats(params);
      const list = response.results || response.data || response;
      setSeats(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load seats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [floorFilter, sectionFilter]);

  const handleOpenAdd = () => {
    setEditingSeat(null);
    setFormData({
      seat_number: '',
      floor: 'First Floor',
      section: 'Quiet Zone',
      seat_type: 'REGULAR',
      is_active: true,
      is_under_maintenance: false,
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (seat) => {
    setEditingSeat(seat);
    setFormData({
      seat_number: seat.seat_number,
      floor: seat.floor,
      section: seat.section,
      seat_type: seat.seat_type,
      is_active: seat.is_active,
      is_under_maintenance: seat.is_under_maintenance,
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleSaveSeat = async (e) => {
    e.preventDefault();
    setModalSaving(true);
    setModalError('');

    try {
      if (editingSeat) {
        await adminService.updateSeat(editingSeat.id, formData);
      } else {
        await adminService.createSeat(formData);
      }
      setModalOpen(false);
      fetchSeats();
    } catch (err) {
      const errDetail =
        err.response?.data?.seat_number?.[0] ||
        err.response?.data?.message ||
        'Failed to save seat inventory record.';
      setModalError(errDetail);
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteClick = (seat) => {
    setSeatToDelete(seat);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!seatToDelete) return;
    setDeleteError('');
    try {
      await adminService.deleteSeat(seatToDelete.id);
      setDeleteModalOpen(false);
      setSeatToDelete(null);
      fetchSeats();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Cannot delete seat with active future reservations.';
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
                Facility & Physical Assets
              </span>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Floor Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              Study Desks & Seat Inventory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Configure physical reading cubicles, computer workstations, zone assignments, and maintenance availability.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition self-start sm:self-auto active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" /> Add Study Desk
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none font-medium text-slate-900 dark:text-white"
            >
              <option value="">All Floors</option>
              <option value="Ground Floor">Ground Floor</option>
              <option value="First Floor">First Floor</option>
              <option value="Second Floor">Second Floor</option>
              <option value="Third Floor">Third Floor</option>
            </select>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold">
            {seats.length} {seats.length === 1 ? 'desk listed' : 'desks listed'}
          </span>
        </div>

        {/* Seats Table */}
        {loading ? (
          <div className="py-20 flex justify-center bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80">
            <LoadingSpinner text="Loading desk catalog..." />
          </div>
        ) : seats.length > 0 ? (
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Desk Code</th>
                    <th className="py-3.5 px-4">Floor & Zone</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {seats.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                        {s.seat_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white block">{s.floor}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{s.section}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                          {s.seat_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              s.is_active
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 border border-slate-200 dark:border-slate-600'
                            }`}
                          >
                            {s.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {s.is_under_maintenance && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
                              <Wrench className="w-3 h-3" /> Maintenance
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            title="Edit Desk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(s)}
                            className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                            title="Delete Desk"
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
            <Armchair className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-base font-bold font-display text-slate-900 dark:text-white">No Desks Configured</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Use "Add Study Desk" to register desks on this floor.</p>
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
                  Catalog Inventory Entry
                </span>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                  {editingSeat ? `Edit Desk ${editingSeat.seat_number}` : 'Add New Study Desk'}
                </h3>
              </div>

              {modalError && (
                <div className="mb-4 text-xs text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/50 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-800/60 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveSeat} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                    Desk Identifier Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.seat_number}
                    onChange={(e) => setFormData({ ...formData, seat_number: e.target.value })}
                    placeholder="e.g. F1-A01"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none font-mono font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                      Floor Level *
                    </label>
                    <select
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Ground Floor">Ground Floor</option>
                      <option value="First Floor">First Floor</option>
                      <option value="Second Floor">Second Floor</option>
                      <option value="Third Floor">Third Floor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                      Desk Category *
                    </label>
                    <select
                      value={formData.seat_type}
                      onChange={(e) => setFormData({ ...formData, seat_type: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="REGULAR">Regular Desk</option>
                      <option value="COMPUTER">Computer Workstation</option>
                      <option value="DISCUSSION">Discussion Pod</option>
                      <option value="SILENT">Silent Cubicle</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                    Section / Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="e.g. Silent Reading Zone"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2.5 space-y-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Desk is active in service</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_under_maintenance}
                      onChange={(e) => setFormData({ ...formData, is_under_maintenance: e.target.checked })}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span className="font-medium text-amber-600 dark:text-amber-400">Under repair / maintenance (temporarily unavailable)</span>
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
                    {modalSaving ? 'Saving...' : 'Save Desk'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          title="Delete Study Desk"
          message={`Are you sure you want to permanently delete desk ${seatToDelete?.seat_number}? This operation cannot be reversed.`}
          confirmText="Delete Desk"
          type="danger"
          onClose={() => {
            setDeleteModalOpen(false);
            setSeatToDelete(null);
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

export default ManageSeats;