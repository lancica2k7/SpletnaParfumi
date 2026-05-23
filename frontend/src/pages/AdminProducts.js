import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import ProductAddModal from '../components/admin/ProductAddModal';
import AdminToast from '../components/admin/AdminToast';
import { fetchProducts } from '../utils/adminApi';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const loadProducts = () => {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const showToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleProductAdded = () => {
    showToast('Product added successfully!', 'success');
    loadProducts();
  };

  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      String(product.id).includes(query)
    );
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-6 py-8">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/admin')}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                  aria-label="Back to dashboard"
                >
                  ← Back
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-white">Product Management</h1>
                  <p className="mt-1 text-sm text-slate-400">
                    Manage your perfume collection
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-500"
              >
                + Add Product
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search products by name, brand, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  🔍
                </span>
              </div>
            </div>
          </header>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-sm text-slate-400">Total Products</p>
              <p className="mt-1 text-2xl font-bold text-white">{products.length}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-sm text-slate-400">In Stock</p>
              <p className="mt-1 text-2xl font-bold text-green-400">
                {products.filter((p) => p.stock > 0).length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-sm text-slate-400">Categories</p>
              <p className="mt-1 text-2xl font-bold text-blue-400">
                {new Set(products.map(p => p.category)).size}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-800 p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold text-white">Products</h3>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded bg-slate-700"></div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                <p className="text-sm text-red-400">Error: {error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-slate-400">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 text-left">
                      <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">ID</th>
                      <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Product</th>
                      <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Price</th>
                      <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Stock</th>
                      <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Category</th>
                      <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="group transition hover:bg-slate-700/30">
                        <td className="py-4 pr-4">
                          <span className="font-mono text-sm font-medium text-blue-400">#{product.id}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            {product.image_url && (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-white">{product.name}</p>
                              <p className="text-xs text-slate-400">{product.brand || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="font-semibold text-green-400">{formatCurrency(product.price)}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-sm text-slate-300">{product.stock ?? '—'}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                            {product.category || '—'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            className="rounded-lg bg-slate-700 px-3 py-1 text-xs font-medium text-white transition hover:bg-slate-600"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {showAddModal && (
        <ProductAddModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleProductAdded}
        />
      )}

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

export default AdminProducts;
