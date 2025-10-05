'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Role, VacationRequest, VacationStatus, User } from '@/types';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [vacations, setVacations] = useState<VacationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<{ id: number; name: string; hasVacations: boolean } | null>(null);
  const [deleteVacationConfirm, setDeleteVacationConfirm] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadVacations();
      if (user.role === Role.ADMIN) {
        loadUsers();
      }
    }
  }, [user, isLoading, router]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadVacations = async () => {
    try {
      const data = await api.getVacations();
      setVacations(data);
    } catch {
      console.error('Failed to load vacations');
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch {
      console.error('Failed to load users');
    }
  };

  const handleCreateVacation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const start = formData.get('startDate') as string;
    const end = formData.get('endDate') as string;

    if (new Date(start) > new Date(end)) {
      alert('End date must be after start date');
      setLoading(false);
      return;
    }

    if (new Date(start) < new Date()) {
      alert('Start date cannot be in the past');
      setLoading(false);
      return;
    }

    try {
      await api.createVacation({ startDate: start, endDate: end });
      setShowVacationModal(false);
      loadVacations();
    } catch {
      alert('Failed to create vacation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const role = formData.get('role') as string;
    const managerId = formData.get('managerId') as string;

    if (role === 'COLLABORATOR' && !managerId) {
      alert('Collaborators MUST have a manager assigned!');
      setLoading(false);
      return;
    }

    try {
      await api.createUser({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
        role,
        managerId: managerId || null,
      });
      setShowUserModal(false);
      loadUsers();
    } catch {
      alert('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.approveVacation(id);
      loadVacations();
    } catch {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.rejectVacation(id);
      loadVacations();
    } catch {
      alert('Failed to reject');
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    setDeleteUserConfirm({ id, name, hasVacations: false });
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserConfirm) return;
    
    try {
      await api.deleteUser(deleteUserConfirm.id);
      loadUsers();
      showToast('User deleted successfully!', 'success');
      setDeleteUserConfirm(null);
    } catch (error: unknown) {
      const err = error as { hasVacations?: boolean; cannotDeleteSelf?: boolean };
      if (err.hasVacations) {
        setDeleteUserConfirm({ ...deleteUserConfirm, hasVacations: true });
      } else if (err.cannotDeleteSelf) {
        showToast('You cannot delete your own account!', 'error');
        setDeleteUserConfirm(null);
      } else {
        showToast('Failed to delete user', 'error');
        setDeleteUserConfirm(null);
      }
    }
  };

  const confirmDeleteUserWithVacations = async () => {
    if (!deleteUserConfirm) return;
    
    try {
      const userVacations = vacations.filter(v => v.userId === deleteUserConfirm.id);
      for (const vacation of userVacations) {
        await api.deleteVacation(vacation.id);
      }
      await api.deleteUser(deleteUserConfirm.id);
      loadUsers();
      loadVacations();
      showToast('User and vacations deleted successfully!', 'success');
      setDeleteUserConfirm(null);
    } catch {
      showToast('Failed to delete user', 'error');
      setDeleteUserConfirm(null);
    }
  };

  const handleDeleteVacation = async (id: number) => {
    setDeleteVacationConfirm(id);
  };

  const confirmDeleteVacation = async () => {
    if (!deleteVacationConfirm) return;
    
    try {
      await api.deleteVacation(deleteVacationConfirm);
      loadVacations();
      showToast('Vacation deleted successfully!', 'success');
      setDeleteVacationConfirm(null);
    } catch {
      showToast('Failed to delete vacation', 'error');
      setDeleteVacationConfirm(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const filteredVacations = vacations.filter(v => {
    const matchesUser = !userFilter || v.userName.toLowerCase().includes(userFilter.toLowerCase());
    const matchesStart = !startDateFilter || v.startDate >= startDateFilter;
    const matchesEnd = !endDateFilter || v.endDate <= endDateFilter;
    return matchesUser && matchesStart && matchesEnd;
  });

  const canApprove = user.role === Role.ADMIN || user.role === Role.MANAGER;

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white">Vacation Management</h1>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 rounded-lg transition"
              >
                <div className="text-right">
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-gray-400 text-xs">{user.role}</p>
                </div>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === Role.ADMIN && (
          <div className="mb-8 bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Users</h2>
              <button
                onClick={() => setShowUserModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                New User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-white font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Role</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-700">
                      <td className="py-3 px-4 text-white font-medium">{u.name}</td>
                      <td className="py-3 px-4 text-white">{u.email}</td>
                      <td className="py-3 px-4 text-white">{u.role}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="text-red-400 hover:text-red-300 transition"
                          title="Delete user"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Vacation Requests</h2>
            {user.role !== Role.ADMIN && (
              <button
                onClick={() => setShowVacationModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                New Request
              </button>
            )}
          </div>

          <div className={`grid ${user.role === Role.COLLABORATOR ? 'grid-cols-2' : 'grid-cols-3'} gap-4 mb-4`}>
            {user.role !== Role.COLLABORATOR && (
              <input
                type="text"
                placeholder="Filter by employee"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              />
            )}
            <input
              type="date"
              placeholder="Start date from"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
            <input
              type="date"
              placeholder="End date until"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-white font-semibold">Employee</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Start Date</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">End Date</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVacations.map((v) => (
                  <tr key={v.id} className="border-b border-gray-700">
                    <td className="py-3 px-4 text-white font-medium">{v.userName}</td>
                    <td className="py-3 px-4 text-white">{formatDate(v.startDate)}</td>
                    <td className="py-3 px-4 text-white">{formatDate(v.endDate)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        v.status === VacationStatus.APPROVED ? 'bg-green-900 text-green-200 border border-green-700' :
                        v.status === VacationStatus.REJECTED ? 'bg-red-900 text-red-200 border border-red-700' :
                        'bg-yellow-900 text-yellow-200 border border-yellow-700'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {canApprove && v.status === VacationStatus.PENDING && (
                          <>
                            <button
                              onClick={() => handleApprove(v.id)}
                              className="text-green-400 hover:text-green-300 transition"
                              title="Approve vacation"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleReject(v.id)}
                              className="text-red-400 hover:text-red-300 transition"
                              title="Reject vacation"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteVacation(v.id)}
                          className="text-red-400 hover:text-red-300 transition"
                          title="Delete vacation"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showVacationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-white">New Vacation Request</h3>
            <form onSubmit={handleCreateVacation}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-white">Start Date</label>
                <input type="date" name="startDate" required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-white">End Date</label>
                <input type="date" name="endDate" required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                  Create
                </button>
                <button type="button" onClick={() => setShowVacationModal(false)} className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-white">New User</h3>
            <form onSubmit={handleCreateUser}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-white">Name</label>
                <input type="text" name="name" required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-white">Email</label>
                <input type="email" name="email" required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-white">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    required 
                    className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-white">Role</label>
                <select 
                  id="roleSelect" 
                  name="role" 
                  required 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  onChange={(e) => {
                    const managerSelect = document.getElementById('managerSelect') as HTMLSelectElement;
                    const managerLabel = document.getElementById('managerLabel') as HTMLLabelElement;
                    if (e.target.value === 'COLLABORATOR') {
                      managerSelect.required = true;
                      managerLabel.innerHTML = 'Manager <span class="text-red-400">*</span>';
                    } else {
                      managerSelect.required = false;
                      managerLabel.innerHTML = 'Manager <span class="text-gray-500">(optional)</span>';
                    }
                  }}
                >
                  <option value="COLLABORATOR">Collaborator</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="mb-4">
                <label id="managerLabel" className="block text-sm font-semibold mb-2 text-white">
                  Manager <span className="text-red-400">*</span>
                </label>
                <select id="managerSelect" name="managerId" required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  <option value="">Select a manager</option>
                  {users.filter(u => u.role === Role.MANAGER).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                  Create
                </button>
                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg border z-50 ${
          toast.type === 'success' 
            ? 'bg-green-900 text-green-200 border-green-700' 
            : 'bg-red-900 text-red-200 border-red-700'
        }`}>
          {toast.message}
        </div>
      )}

      {deleteUserConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-white">Confirm Deletion</h3>
            {deleteUserConfirm.hasVacations ? (
              <p className="text-white mb-6">
                <span className="font-semibold">{deleteUserConfirm.name}</span> has existing vacation requests. 
                Delete user and all their vacation requests?
              </p>
            ) : (
              <p className="text-white mb-6">
                Are you sure you want to delete <span className="font-semibold">{deleteUserConfirm.name}</span>?
              </p>
            )}
            <div className="flex gap-2">
              <button 
                onClick={deleteUserConfirm.hasVacations ? confirmDeleteUserWithVacations : confirmDeleteUser}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
              >
                {deleteUserConfirm.hasVacations ? 'Yes, Delete All' : 'Yes, Delete'}
              </button>
              <button 
                onClick={() => setDeleteUserConfirm(null)}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteVacationConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-white">Confirm Deletion</h3>
            <p className="text-white mb-6">
              Are you sure you want to delete this vacation request?
            </p>
            <div className="flex gap-2">
              <button 
                onClick={confirmDeleteVacation}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
              >
                Yes, Delete
              </button>
              <button 
                onClick={() => setDeleteVacationConfirm(null)}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}