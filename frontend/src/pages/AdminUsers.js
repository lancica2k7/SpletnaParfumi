import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import UsersTable from '../components/admin/UsersTable';
import AdminToast from '../components/admin/AdminToast';
import { fetchUsers, getCurrentRole } from '../utils/adminApi';
import { useLanguage } from '../context/LanguageContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole] = useState(getCurrentRole());
  const [toasts, setToasts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const loadUsers = () => {
    setLoading(true);
    fetchUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-6 py-8">
          <header className="mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Back to dashboard"
              >
                {t('back')}
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">{t('userManagement')}</h1>
                <p className="mt-1 text-sm text-slate-400">
                  {language === 'sl' ? 'Upravljajte vse uporabnike in njihove pravice' : 'Manage all users and their permissions'}
                </p>
              </div>
            </div>

            <div className="relative mt-6">
              <input
                type="search"
                placeholder={language === 'sl' ? 'Išči uporabnike po imenu, emailu ali vlogi...' : 'Search users by name, email, or role...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                ⌕
              </span>
            </div>
          </header>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-sm text-slate-400">{t('totalUsers')}</p>
              <p className="mt-1 text-2xl font-bold text-white">{users.length}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-sm text-slate-400">{t('activeUsers')}</p>
              <p className="mt-1 text-2xl font-bold text-green-400">
                {users.filter((u) => u.status === 'active').length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-sm text-slate-400">{language === 'sl' ? 'Filtrirani Rezultati' : 'Filtered Results'}</p>
              <p className="mt-1 text-2xl font-bold text-blue-400">{filteredUsers.length}</p>
            </div>
          </div>

          <UsersTable
            users={filteredUsers}
            loading={loading}
            error={error}
            userRole={userRole}
            onRefresh={loadUsers}
            onShowToast={showToast}
          />
        </div>
      </main>

      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-3">
        {toasts.map((toast) => (
          <AdminToast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
