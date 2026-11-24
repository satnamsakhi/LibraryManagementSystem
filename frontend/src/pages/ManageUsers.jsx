import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Mail,
  Shield,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Action / Confirmation modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetAction, setTargetAction] = useState(null); // 'deactivate' | 'activate' | 'change_role'
  const [modalOpen, setModalOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setActionError('');
    try {
      const params = {
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      };
      const response = await adminService.getUsers(params);
      const list = response.results || response.data || response;
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load users", err);
      setActionError("Failed to fetch users list from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleDeactivateClick = (u) => {
    setSelectedUser(u);
    setTargetAction('deactivate');
    setActionError('');
    setModalOpen(true);
  };

  const handleActivateClick = (u) => {
    setSelectedUser(u);
    setTargetAction('activate');
    setActionError('');
    setModalOpen(true);
  };

  const handleRoleChangeClick = (u) => {
    setSelectedUser(u);
    setTargetAction('change_role');
    setActionError('');
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedUser || !targetAction) return;
    setActionError('');
    setIsSubmitting(true);

    try {
      if (targetAction === 'deactivate') {
        const res = await adminService.updateUser(selectedUser.id, {
          account_status: 'INACTIVE',
        });
        setActionSuccess(`Account for ${selectedUser.full_name} has been suspended. Login and entry privileges have been revoked.`);
      } else if (targetAction === 'activate') {
        const res = await adminService.updateUser(selectedUser.id, {
          account_status: 'ACTIVE',
        });
        setActionSuccess(`Account for ${selectedUser.full_name} has been restored to active status.`);
      } else if (targetAction === 'change_role') {
        const newRole = selectedUser.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
        const res = await adminService.updateUser(selectedUser.id, {
          role: newRole,
        });
        setActionSuccess(`User role for ${selectedUser.full_name} changed to ${newRole}.`);
      }

      setModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      console.error("Admin action failed", err);
      const data = err.response?.data;
      const msg =
        data?.account_status?.[0] ||
        data?.role?.[0] ||
        data?.detail ||
        data?.message ||
        (typeof data?.errors === 'string' ? data.errors : null) ||
        (data?.errors && typeof data.errors === 'object' ? Object.values(data.errors).flat()[0] : null) ||
        'Server rejected the account update. Verify user permissions.';
      setActionError(String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-slate-900 dark:text-slate-100">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              Identity & Access Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              User Directory & Account Status
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Review enrolled students, activate or suspend accounts, and manage library administrative credentials.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        {/* Success Alert */}
        {actionSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs p-4 rounded-2xl flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {actionSuccess}
            </span>
            <button onClick={() => setActionSuccess('')} className="text-emerald-600 font-bold hover:text-emerald-800 text-base">&times;</button>
          </div>
        )}

        {/* Global Action Error Alert */}
        {actionError && (
          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 text-xs p-4 rounded-2xl flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" /> {actionError}
            </span>
            <button onClick={() => setActionError('')} className="text-rose-500 font-bold hover:text-rose-700 text-base">&times;</button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student name, email, roll number, or department..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Students Only</option>
              <option value="LIBRARIAN">Librarians & Gate Staff</option>
              <option value="ADMIN">Administrators Only</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="">All Account Statuses</option>
              <option value="ACTIVE">Active Users</option>
              <option value="INACTIVE">Suspended / Inactive</option>
            </select>
          </div>
        </div>

        {/* Main Users Table */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <LoadingSpinner text="Retrieving registered academic accounts..." />
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Users className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
              <p className="text-base font-display font-bold text-slate-900 dark:text-white">No Registered Users Located</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No user profiles match the selected filter criteria. Try clearing search filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Student / Name</th>
                    <th className="py-3.5 px-4">Enrollment ID</th>
                    <th className="py-3.5 px-4">Department / Program</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4">Registration Date</th>
                    <th className="py-3.5 px-4 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {users.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    const isActive = u.account_status === 'ACTIVE';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                              u.role === 'ADMIN' ? 'bg-blue-600' : u.role === 'LIBRARIAN' ? 'bg-teal-600' : 'bg-indigo-600'
                            }`}>
                              {u.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="truncate max-w-[200px]">
                              <p className="font-semibold text-slate-900 dark:text-white leading-tight truncate">
                                {u.full_name} {isSelf && <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold">(You)</span>}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300 text-[11px] whitespace-nowrap">
                          {u.student_id || <span className="text-slate-400 italic">None (Staff)</span>}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap truncate max-w-[150px]">
                          {u.department || 'General Academic'}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            u.role === 'ADMIN'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : u.role === 'LIBRARIAN'
                              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Suspended
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Activate / Deactivate Toggle Button */}
                            {isActive ? (
                              <button
                                type="button"
                                onClick={() => handleDeactivateClick(u)}
                                disabled={isSelf}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 rounded-xl transition disabled:opacity-30 disabled:pointer-events-none"
                                title={isSelf ? "You cannot deactivate your own administrative account" : "Suspend student account and revoke entry"}
                              >
                                <UserX className="w-3.5 h-3.5" /> Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleActivateClick(u)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/60 rounded-xl transition"
                                title="Restore active account access"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Activate
                              </button>
                            )}

                            {/* Role Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleRoleChangeClick(u)}
                              disabled={isSelf}
                              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition disabled:opacity-30 disabled:pointer-events-none"
                              title={isSelf ? "You cannot modify your own administrative role" : "Toggle between Student and Administrator role"}
                            >
                              Role
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={confirmAction}
          title={
            targetAction === 'deactivate'
              ? `Confirm Account Suspension: ${selectedUser?.full_name}`
              : targetAction === 'activate'
              ? `Restore Account Access: ${selectedUser?.full_name}`
              : `Change System Role: ${selectedUser?.full_name}`
          }
          message={
            targetAction === 'deactivate'
              ? `Are you certain you wish to deactivate ${selectedUser?.full_name}'s account? The student will immediately be barred from signing in, booking library seats, and entering through the physical gate scanners. All previously issued active session tokens will be rejected.`
              : targetAction === 'activate'
              ? `Restore full account privileges for ${selectedUser?.full_name}? The student will immediately regain access to library seat bookings and entry pass issuance.`
              : `Change this account's operational role between Administrator and Student?`
          }
          confirmText={
            targetAction === 'deactivate'
              ? isSubmitting ? 'Deactivating...' : 'Confirm Deactivation'
              : targetAction === 'activate'
              ? isSubmitting ? 'Activating...' : 'Restore Access'
              : isSubmitting ? 'Updating...' : 'Update Role'
          }
          type={targetAction === 'deactivate' ? 'danger' : 'primary'}
        />
      </main>
    </div>
  );
};

export default ManageUsers;