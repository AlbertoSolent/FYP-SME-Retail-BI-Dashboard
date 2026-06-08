import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Header from '../components/layout/Header';
import { UserPlus, Trash2, Shield, Eye, Pencil, Check, X } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';

const ROLE_LABELS = {
  super: 'Admin',
  viewer: 'Viewer',
};

const UserManagement = () => {
  const { user } = useAuth();
  const isSuper = user?.role === 'super';

  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleValue, setEditingRoleValue] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      await api.post('/api/users', form);
      setSuccess('User created successfully');
      setForm({ name: '', email: '', password: '', role: 'viewer' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    clearMessages();
    try {
      await api.delete(`/api/users/${deleteTarget.userId}`);
      setSuccess(`${deleteTarget.name} has been deleted`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
      setDeleteTarget(null);
    }
  };

  const startEditRole = (userId, currentRole) => {
    setEditingRoleId(userId);
    setEditingRoleValue(currentRole);
  };

  const cancelEditRole = () => {
    setEditingRoleId(null);
    setEditingRoleValue('');
  };

  const saveRole = async (userId) => {
    clearMessages();
    try {
      await api.put(`/api/users/${userId}/role`, { role: editingRoleValue });
      setSuccess('Role updated successfully');
      setEditingRoleId(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans transition-colors">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isSuper ? 'User Management' : 'Team Members'}
            </h2>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              {isSuper ? 'Manage dashboard access and roles.' : 'View all team members with dashboard access.'}
            </p>
          </div>
          {isSuper && (
            <button
              onClick={() => { setShowForm(!showForm); clearMessages(); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              <UserPlus size={18} />
              Add User
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm">
            {success}
          </div>
        )}

        {showForm && isSuper && (
          <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="super">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Create User
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-slate-600">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-600">
                <th className="py-3 px-6 font-semibold text-gray-700 dark:text-slate-300">Name</th>
                <th className="py-3 px-6 font-semibold text-gray-700 dark:text-slate-300">Email</th>
                <th className="py-3 px-6 font-semibold text-gray-700 dark:text-slate-300">Role</th>
                {isSuper && (
                  <th className="py-3 px-6 font-semibold text-gray-700 dark:text-slate-300 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="py-3 px-6 text-gray-900 dark:text-slate-200 font-medium">
                    <div className="flex items-center gap-2">
                      {u.role === 'super' ? <Shield size={16} className="text-amber-500" /> : <Eye size={16} className="text-blue-400" />}
                      {u.name}
                      {u.is_protected ? <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">Protected</span> : null}
                    </div>
                  </td>
                  <td className="py-3 px-6 text-gray-600 dark:text-slate-400">{u.email}</td>
                  <td className="py-3 px-6">
                    {editingRoleId === u.user_id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={editingRoleValue}
                          onChange={(e) => setEditingRoleValue(e.target.value)}
                          className="px-2 py-1 rounded border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="super">Admin</option>
                        </select>
                        <button
                          onClick={() => saveRole(u.user_id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEditRole}
                          className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600 rounded transition-colors"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === 'super'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    )}
                  </td>
                  {isSuper && (
                    <td className="py-3 px-6 text-right">
                      {!u.is_protected && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEditRole(u.user_id, u.role)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Change role"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ userId: u.user_id, name: u.name })}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {deleteTarget && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          confirmLabel="Delete User"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;
