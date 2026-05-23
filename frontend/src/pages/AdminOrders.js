import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import OrdersTable from '../components/admin/OrdersTable';
import AdminToast from '../components/admin/AdminToast';
import { fetchOrders } from '../utils/adminApi';
import { useLanguage } from '../context/LanguageContext';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const loadOrders = () => {
    setLoading(true);
    fetchOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const showToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.customer.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query) ||
      String(order.id).includes(query)
    );
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const totalRevenue = filteredOrders.reduce((sum, order) => {
    if (order.status.toLowerCase() === 'completed') {
      return sum + order.total;
    }
    return sum;
  }, 0);

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
                <h1 className="text-3xl font-bold text-white">{t('orderManagement')}</h1>
                <p className="mt-1 text-sm text-slate-400">{language === 'sl' ? 'Oglejte in upravljajte vsa naročila strank' : 'View and manage all customer orders'}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <div className="relative flex-1">
                <input
                  type="search"
                  placeholder={language === 'sl' ? 'Išči naročila...' : 'Search orders...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">⌕</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">{language === 'sl' ? 'Vsi Statusi' : 'All Status'}</option>
                <option value="pending">{t('pending')}</option>
                <option value="processing">{t('processing')}</option>
                <option value="completed">{t('completed')}</option>
                <option value="cancelled">{t('cancelled')}</option>
              </select>
            </div>
          </header>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-sm text-slate-400">{language === 'sl' ? 'Skupaj Naročil' : 'Total Orders'}</p>
              <p className="mt-1 text-2xl font-bold text-white">{orders.length}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-sm text-slate-400">{t('pending')}</p>
              <p className="mt-1 text-2xl font-bold text-yellow-400">
                {orders.filter((o) => o.status.toLowerCase() === 'pending').length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-sm text-slate-400">{t('completed')}</p>
              <p className="mt-1 text-2xl font-bold text-green-400">
                {orders.filter((o) => o.status.toLowerCase() === 'completed').length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-sm text-slate-400">{t('totalRevenue')}</p>
              <p className="mt-1 text-2xl font-bold text-blue-400">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>

          <OrdersTable
            orders={filteredOrders}
            loading={loading}
            error={error}
            onRefresh={loadOrders}
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

export default AdminOrders;
