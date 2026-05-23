import React, { useState } from 'react';

const ProductAddModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    originalPrice: '',
    category: 'Men',
    description: '',
    notes: '',
    image_url: '',
    rating: '4.5',
    reviews: '0'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          brand: formData.brand,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          category: formData.category,
          description: formData.description,
          notes: formData.notes,
          image_url: formData.image_url,
          rating: parseFloat(formData.rating),
          reviews: parseInt(formData.reviews)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Failed to create product');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Product</h2>
          <p className="mt-1 text-sm text-slate-400">Fill in the perfume details</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g., Sauvage"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g., Dior"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="89.99"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Original Price ($)</label>
              <input
                type="number"
                step="0.01"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="120.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="A sophisticated fragrance with..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Fragrance Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Top: Bergamot, Pepper | Middle: Lavender | Base: Ambroxan, Cedar"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Image URL</label>
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="/slike/perfume.jpg or https://..."
            />
            <p className="mt-1 text-xs text-slate-500">
              Upload image to /slike folder first, then use: /slike/filename.jpg
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-700 px-6 py-2 font-medium text-white transition hover:bg-slate-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductAddModal;
