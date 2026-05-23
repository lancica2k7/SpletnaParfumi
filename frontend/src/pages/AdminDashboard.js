import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../components/admin/Sidebar';
import StatsCard from '../components/admin/StatsCard';
import UsersTable from '../components/admin/UsersTable';
import OrdersTable from '../components/admin/OrdersTable';
import AdminToast from '../components/admin/AdminToast';
import { fetchStats, fetchUsers, fetchOrders, getCurrentRole } from '../utils/adminApi';
import { useLanguage } from '../context/LanguageContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorStats, setErrorStats] = useState('');
  const [errorUsers, setErrorUsers] = useState('');
  const [errorOrders, setErrorOrders] = useState('');
  const [userRole] = useState(getCurrentRole());
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const { t, language } = useLanguage();

  const loadData = () => {
    setLoadingStats(true);
    fetchStats()
      .then(setStats)
      .catch((err) => setErrorStats(err.message))
      .finally(() => setLoadingStats(false));

    setLoadingUsers(true);
    fetchUsers()
      .then(setUsers)
      .catch((err) => setErrorUsers(err.message))
      .finally(() => setLoadingUsers(false));

    setLoadingOrders(true);
    fetchOrders()
      .then(setOrders)
      .catch((err) => setErrorOrders(err.message))
      .finally(() => setLoadingOrders(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.customer.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query) ||
        String(order.id).includes(query)
    );
  }, [orders, searchQuery]);

  const formatCurrency = (amount) => {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numAmount);
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-6 py-8">
          <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{language === 'sl' ? 'Dobrodošli nazaj, Admin' : 'Welcome back, Admin'}</h1>
              <p className="mt-1 text-sm text-slate-400">
                {language === 'sl' ? 'Tukaj je kaj se dogaja v vaši trgovini danes.' : "Here's what's happening with your store today."}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="search"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 pl-10 text-sm text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  aria-label="Search dashboard"
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                  ⌕
                </span>
              </div>

              <button
                className="relative rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                aria-label="Notifications"
              >
                <span className="text-xl">◉</span>
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-lg">
                A
              </div>
            </div>
          </header>

          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title={t('totalUsers')}
              value={stats?.totalUsers ?? 0}
              icon="U"
              loading={loadingStats}
            />
            <StatsCard
              title={t('activeUsers')}
              value={stats?.activeUsers ?? 0}
              icon="A"
              loading={loadingStats}
            />
            <StatsCard
              title={t('totalRevenue')}
              value={stats ? formatCurrency(stats.totalRevenue || 0) : '$0.00'}
              icon="$"
              loading={loadingStats}
            />
            <StatsCard
              title={t('ordersToday')}
              value={stats?.ordersToday ?? 0}
              icon="O"
              loading={loadingStats}
            />
          </div>

          {errorStats && (
            <div className="mb-6 rounded-2xl border border-red-500/50 bg-red-500/10 p-4 shadow-lg">
              <p className="text-sm font-medium text-red-400">
                {language === 'sl' ? 'Ni mogoče naložiti statistike' : 'Unable to load statistics'}: {errorStats}
              </p>
            </div>
          )}

          <div className="space-y-8">
            <UsersTable
              users={filteredUsers}
              loading={loadingUsers}
              error={errorUsers}
              userRole={userRole}
              onRefresh={loadData}
              onShowToast={showToast}
            />

            <OrdersTable
              orders={filteredOrders}
              loading={loadingOrders}
              error={errorOrders}
              onRefresh={loadData}
              onShowToast={showToast}
            />
          </div>

          <div className="mt-12 border-t border-slate-800 pt-6 text-center">
            <p className="text-xs text-slate-500">
              Parfumerija CICKO Admin Dashboard · {new Date().getFullYear()}
            </p>
          </div>
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

export default AdminDashboard;
