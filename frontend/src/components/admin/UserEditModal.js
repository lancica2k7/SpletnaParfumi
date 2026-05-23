import React, { useState } from 'react';
import { User } from '../../utils/adminApi';

const UserEditModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name.name,
    email.email,
    role.role,
    status.status });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Split name into first and last
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await onSave(Number(user.id), {
        name.name,
        email.email,
        role.role,
        status.status,
        first_name,
        last_name,
        is_active.status === 'active' ? 1  });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (

        {/* Close button */}
        
          ✕

        {/* Header */}
        
          Edit User
          Update user information

        {/* Form */}

              Full Name
            
             setFormData({ ...formData, name.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition focus-blue-500 focus-none focus-2 focus-blue-500/20"
              required
            />

              Email
            
             setFormData({ ...formData, email.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition focus-blue-500 focus-none focus-2 focus-blue-500/20"
              required
            />

                Role
              
               setFormData({ ...formData, role.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition focus-blue-500 focus-none focus-2 focus-blue-500/20"
              >
                User
                Moderator
                Admin

                Status
              
               setFormData({ ...formData, status.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition focus-blue-500 focus-none focus-2 focus-blue-500/20"
              >
                Active
                Inactive

          {error && (
            
              {error}
            
          )}

          {/* Footer */}

              Cancel

              {saving ? 'Saving...' : 'Save Changes'}

  );
};

export default UserEditModal;

