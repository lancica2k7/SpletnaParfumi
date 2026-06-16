import React, { useState } from 'react';
import { fetchOrderDetails, updateOrderStatus, deleteOrder } from '../../utils/adminApi';

const OrdersTable = ({ orders, loading, error, onRefresh, onShowToast }) => {
  const [viewingOrder, setViewingOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleViewOrder = async (order) => {
    setViewingOrder(order);
    setLoadingDetails(true);
    try {
      const details = await fetchOrderDetails(order.id);
      setOrderDetails(details);
    } catch (err) {
      onShowToast(err.message || 'Failed to load order details', 'error');
      setViewingOrder(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateOrderStatus(viewingOrder.id, newStatus);
      onShowToast('Order status updated successfully', 'success');
      setOrderDetails({...orderDetails, status: newStatus});
      onRefresh();
    } catch (err) {
      onShowToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteOrder(orderId);
      onShowToast('Order deleted successfully', 'success');
      setViewingOrder(null);
      setOrderDetails(null);
      onRefresh();
    } catch (err) {
      onShowToast(err.message || 'Failed to delete order', 'error');
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-800 p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-bold text-white">Orders</h3>
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
        <h3 className="mb-4 text-xl font-bold text-white">Orders</h3>
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">Error loading orders: {error}</p>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="rounded-2xl bg-slate-800 p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-bold text-white">Orders</h3>
        <div className="py-12 text-center">
          <p className="text-lg text-slate-400">No orders found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* View Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-800 p-6 shadow-2xl my-8">
            <button
              onClick={() => {
                setViewingOrder(null);
                setOrderDetails(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="mb-4 text-2xl font-bold text-white">Order #{viewingOrder.id}</h2>
            
            {loadingDetails ? (
              <div className="py-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-slate-400">Loading order details...</p>
              </div>
            ) : orderDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Customer</p>
                    <p className="text-white">{orderDetails.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white">{orderDetails.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Status</p>
                    <select
                      value={orderDetails.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Total</p>
                    <p className="text-white">{formatCurrency(orderDetails.total)}                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleDeleteOrder(viewingOrder.id)}
                    className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition hover:bg-red-500"
                  >
                    Delete Order
                  </button>
                </div>

                {orderDetails.items && orderDetails.items.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-white">Order Items</h3>
                    <div className="rounded-lg border border-slate-700 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-slate-700">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">Product</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-slate-300">Quantity</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-slate-300">Price</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-slate-300">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {orderDetails.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-white">{item.product_name}</td>
                              <td className="px-4 py-2 text-right text-slate-300">{item.quantity}</td>
                              <td className="px-4 py-2 text-right text-slate-300">{formatCurrency(item.price)}</td>
                              <td className="px-4 py-2 text-right text-white font-semibold">
                                {formatCurrency(item.quantity * item.price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400">No details available</p>
            )}
          </div>
        </div>
      )}

    <div className="rounded-2xl bg-slate-800 p-6 shadow-lg">
      <h3 className="mb-4 text-xl font-bold text-white">Recent Orders ({orders.length})</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 text-left">
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Order ID</th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Customer</th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Total</th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
              <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Date</th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {orders.map((order) => (
              <tr key={order.id} className="transition hover:bg-slate-700/30">
                <td className="py-4 pr-4">
                  <span className="font-mono text-sm font-medium text-blue-400">#{order.id}</span>
                </td>
                <td className="py-4 pr-4">
                  <span className="font-medium text-white">{order.customer}</span>
                </td>
                <td className="py-4 pr-4">
                  <span className="font-semibold text-green-400">{formatCurrency(order.total)}</span>
                </td>
                <td className="py-4 pr-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    order.status.toLowerCase() === 'completed' 
                      ? 'bg-green-500/20 text-green-300' 
                      : order.status.toLowerCase() === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 pr-4">
                  <span className="text-sm text-slate-400">{formatDate(order.date)}</span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-500"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-500"
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
    </>
  );
};

export default OrdersTable;
