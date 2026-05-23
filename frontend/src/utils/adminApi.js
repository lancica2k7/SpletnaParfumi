/**
 * Admin API Helper - Normalized fetch with safe parsing
 * 
 * Expected API shapes (flexible):
 * - /api/admin/stats: { totalUsers, activeUsers, totalRevenue, ordersToday } 
 *   OR { stats: { ... } } OR { users: { total, active }, revenue: { total }, orders: { today } }
 * - /api/admin/users: [{ id, name, email, role, status, lastLogin }] 
 *   OR { users: [...] } OR { data: [...] }
 * - /api/admin/orders: [{ id, customer, total, status, date }] 
 *   OR { orders: [...] } OR { data: [...] }
 * - /api/admin/products: [{ id, name, price, stock }] 
 *   OR { products: [...] } OR { data: [...] }
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Generic fetch with error handling
async function fetchAPI(endpoint, options) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Fetch dashboard statistics
export async function fetchStats() {
  const data = await fetchAPI('/api/admin/stats');
  
  // Handle multiple possible shapes
  const stats = data.stats || data;
  
  return {
    totalUsers: stats.totalUsers ?? stats.users?.total ?? 0,
    activeUsers: stats.activeUsers ?? stats.users?.active ?? 0,
    totalRevenue: stats.totalRevenue ?? stats.revenue?.total ?? stats.revenue ?? 0,
    ordersToday: stats.ordersToday ?? stats.orders?.today ?? 0,
  };
}

// Fetch all users
export async function fetchUsers() {
  const data = await fetchAPI('/api/admin/users');
  const rawUsers = data.users || data.data || data;
  
  if (!Array.isArray(rawUsers)) return [];
  
  return rawUsers.map((u) => ({
    id: u.id ?? u.userId ?? '—',
    name: u.name ?? u.username ?? u.fullName ?? '—',
    email: u.email ?? '—',
    role: u.role ?? 'user',
    status: u.status ?? 'active',
    lastLogin: u.lastLogin ?? u.last_login ?? u.lastActivity ?? '—',
  }));
}

// Fetch all orders
export async function fetchOrders() {
  const data = await fetchAPI('/api/admin/orders');
  const rawOrders = data.orders || data.data || data;
  
  if (!Array.isArray(rawOrders)) return [];
  
  return rawOrders.map((o) => ({
    id: o.id ?? o.orderId ?? '—',
    customer: o.customer ?? o.customerName ?? o.user?.name ?? '—',
    customer_email: o.customer_email ?? o.customerEmail ?? o.email,
    total: o.total ?? o.amount ?? o.price ?? 0,
    status: o.status ?? 'pending',
    date: o.date ?? o.createdAt ?? o.orderDate ?? '—',
  }));
}

// Fetch single order details with items
export async function fetchOrderDetails(orderId) {
  const data = await fetchAPI(`/api/admin/orders/${orderId}`);
  return data.order;
}

// Fetch all products
export async function fetchProducts() {
  const data = await fetchAPI('/api/admin/products');
  const rawProducts = data.products || data.data || data;
  
  if (!Array.isArray(rawProducts)) return [];
  
  return rawProducts.map((p) => ({
    id: p.id ?? p.productId ?? '—',
    name: p.name ?? p.title ?? '—',
    brand: p.brand,
    price: p.price ?? 0,
    originalPrice: p.original_price,
    stock: p.stock ?? p.inventory ?? 0,
    category: p.category,
    description: p.description,
    notes: p.notes,
    image_url: p.image_url,
    rating: p.rating,
    reviews: p.reviews,
  }));
}

// Get current user role
export function getCurrentRole() {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role ?? 'moderator';
    }
    return localStorage.getItem('role') ?? 'moderator';
  } catch {
    return 'moderator';
  }
}

// =================
// CRUD OPERATIONS
// =================

// Update user
export async function updateUser(userId, updates) {
  await fetchAPI(`/api/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// Delete user
export async function deleteUser(userId) {
  await fetchAPI(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

// Toggle user status (disable/enable)
export async function toggleUserStatus(userId, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  await updateUser(userId, {
    status: newStatus,
    is_active: newStatus === 'active' ? 1 : 0,
  });
}

// Update order status
export async function updateOrderStatus(orderId, status) {
  await fetchAPI(`/api/admin/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// Delete order
export async function deleteOrder(orderId) {
  await fetchAPI(`/api/admin/orders/${orderId}`, {
    method: 'DELETE',
  });
}

// Create product
export async function createProduct(product) {
  const result = await fetchAPI('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
  return result.productId;
}

// Update product
export async function updateProduct(productId, updates) {
  await fetchAPI(`/api/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// Delete product
export async function deleteProduct(productId) {
  await fetchAPI(`/api/admin/products/${productId}`, {
    method: 'DELETE',
  });
}

