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

  const loadVacations = async () => {
    try {
      const data = await api.getVacations();
      setVacations(data);
    } catch (error) {
      console.error('Failed to load vacations');
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
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
    } catch (error) {
      alert('Failed to create vacation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await api.createUser({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
        role: formData.get('role') as string,
        managerId: (formData.get('managerId') as string) || null,
      });
      setShowUserModal(false);
      loadUsers();
    } catch (error) {
      alert('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.approveVacation(id);
      loadVacations();
    } catch (error) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.rejectVacation(id);
      loadVacations();
    } catch (error) {
      alert('Failed to reject');
    }
  };

  const handleDeleteVacation = async (id: number) => {
    if (confirm('Delete this vacation?')) {
      try {
        await api.deleteVacation(id);
        loadVacations();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('Delete this user?')) {
      try {
        await api.deleteUser(id);
        loadUsers();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Vacation Management</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-gray-500">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === Role.ADMIN && (
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Users</h2>
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
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="py-3 px-4 text-black font-medium">{u.name}</td>
                      <td className="py-3 px-4 text-black">{u.email}</td>
                      <td className="py-3 px-4 text-black">{u.role}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
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
                    <td className="py-3 px-4 text-gray-300 font-medium">{v.userName}</td>
                    <td className="py-3 px-4 text-gray-300">{formatDate(v.startDate)}</td>
                    <td className="py-3 px-4 text-gray-300">{formatDate(v.endDate)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        v.status === VacationStatus.APPROVED ? 'bg-green-100 text-green-800' :
                        v.status === VacationStatus.REJECTED ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
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
                              className="text-green-600 hover:text-green-700 text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(v.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteVacation(v.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
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
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
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
                <input type="password" name="password" required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
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
                  <option value="">None</option>
                  {users.filter(u => u.role === Role.MANAGER).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
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
    </div>
  );
}