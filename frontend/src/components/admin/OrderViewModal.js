import React, { useState, useEffect } from 'react';
import { OrderDetails, fetchOrderDetails } from '../../utils/adminApi';

const OrderViewModal = ({ order, onClose, onUpdateStatus }) => {
  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (dateStr === '—') return dateStr;
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'delivered')
      return 'bg-green-500/20 text-green-300';
    if (statusLower === 'pending' || statusLower === 'processing')
      return 'bg-yellow-500/20 text-yellow-300';
    if (statusLower === 'cancelled' || statusLower === 'failed') return 'bg-red-500/20 text-red-300';
    return 'bg-blue-500/20 text-blue-300';
  };

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        setLoading(true);
        const details = await fetchOrderDetails(order.id);
        setOrderDetails(details);
      } catch (err) {
        console.error('Failed to load order details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [order.id]);

  const handleUpdateStatus = async () => {
    if (!onUpdateStatus || status === order.status) return;

    setUpdating(true);
    try {
      await onUpdateStatus(Number(order.id), status);
      onClose();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (

        {/* Close button */}
        
          ✕

        {/* Header */}
        
          Order Details
          Order #{order.id}

        {/* Content */}
        {loading ? (

        ) : (
          
            {/* Customer & Total */}

                  Customer
                
                {order.customer}
                {orderDetails?.customer_email && (
                  {orderDetails.customer_email}
                )}

                  Total Amount
                
                {formatCurrency(order.total)}

            {/* Status & Date */}

                  Status

                   setStatus(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white transition focus-blue-500 focus-none focus-2 focus-blue-500/20"
                    disabled={updating}
                  >
                    Pending
                    Processing
                    Completed
                    Cancelled
                  
                  {onUpdateStatus && status !== order.status && (
                    
                      {updating ? '...' : 'Update'}
                    
                  )}

                    Current: {order.status}

                  Order Date
                
                {formatDate(order.date)}

            {/* Order Items */}
            {orderDetails && orderDetails.items.length > 0 && (

                  Order Items ({orderDetails.items.length})

                          Product

                          Qty

                          Price

                          Subtotal

                      {orderDetails.items.map((item) => (

                            {item.product_name}
                            ID: {item.product_id}

                              {item.quantity}

                            {formatCurrency(item.price)}

                            {formatCurrency(item.subtotal)}

                      ))}

                          Total:

                          {formatCurrency(order.total)}

            )}

                Order ID
              
              #{order.id}

        )}

        {/* Footer */}

            Close

  );
};

export default OrderViewModal;

