import React, { useState } from 'react';
import { updateUser, deleteUser } from '../../utils/adminApi';

const UsersTable = ({ users, loading, error, userRole, onRefresh, onShowToast }) => {
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  const handleView = (user) => {
    setViewingUser(user);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      return;
    }

    try {
      await deleteUser(user.id);
      onShowToast('User deleted successfully', 'success');
      onRefresh();
    } catch (err) {
      onShowToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleSaveEdit = async () => {
    try {
      // Split name into first and last name
      const nameParts = editingUser.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      await updateUser(editingUser.id, {
        first_name: firstName,
        last_name: lastName,
        email: editingUser.email,
        role: editingUser.role,
        is_active: editingUser.status === 'active' ? 1 : 0
      });
      onShowToast('User updated successfully', 'success');
      setEditingUser(null);
      onRefresh();
    } catch (err) {
      onShowToast(err.message || 'Failed to update user', 'error');
    }
  };
  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-800 p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-bold text-white">Users</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-slate-700"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-slate-800 p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-bold text-white">Users</h3>
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">Error loading users: {error}</p>
        </div>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="rounded-2xl bg-slate-800 p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-bold text-white">Users</h3>
        <div className="py-12 text-center">
          <p className="text-lg text-slate-400">No users found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-2xl">
            <button
              onClick={() => setViewingUser(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="mb-4 text-2xl font-bold text-white">User Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">Name</p>
                <p className="text-white">{viewingUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="text-white">{viewingUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Role</p>
                <p className="text-white">{viewingUser.role}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Status</p>
                <p className="text-white">{viewingUser.status}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Last Login</p>
                <p className="text-white">{viewingUser.lastLogin}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-2xl">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="mb-4 text-2xl font-bold text-white">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    <div className="rounded-2xl bg-slate-800 p-6 shadow-lg">
      <h3 className="mb-4 text-xl font-bold text-white">Users ({users.length})</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 text-left">
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Name</th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Role</th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Last Login</th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map((user) => (
              <tr key={user.id} className="transition hover:bg-slate-700/30">
                <td className="py-4 pr-4">
                  <span className="font-medium text-white">{user.name}</span>
                </td>
                <td className="py-4 pr-4">
                  <span className="text-sm text-slate-300">{user.email}</span>
                </td>
                <td className="py-4 pr-4">
                  <span className="inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                    {user.role}
                  </span>
                </td>
                <td className="py-4 pr-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    user.status === 'active' 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-4 pr-4">
                  <span className="text-sm text-slate-400">{user.lastLogin}</span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleView(user)}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-500"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="rounded-lg bg-slate-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-slate-500"
                    >
                      Edit
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDelete(user)}
                        className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export default UsersTable;
