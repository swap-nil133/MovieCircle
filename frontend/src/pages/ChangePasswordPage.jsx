import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      return toast.error('Please fill all fields');
    }

    if (form.newPassword !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setLoading(true);

      const { data } = await api.put('/auth/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      toast.success(data.message || 'Password updated');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md card p-8 animate-scale-in">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-cinema-subtle hover:text-cinema-text transition-colors mb-5">
          ← Back
        </button>
        
        <h1 className="font-display text-3xl font-bold text-cinema-text mb-2">
          Change Password
        </h1>

        <p className="text-cinema-subtle mb-6">
          Update your account password securely.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm mb-2 text-cinema-subtle">
              Current Password
            </label>

            <input
              type="password"
              className="input-field"
              placeholder="Current password"
              value={form.oldPassword}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  oldPassword: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-cinema-subtle">
              New Password
            </label>

            <input
              type="password"
              className="input-field"
              placeholder="New password"
              value={form.newPassword}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  newPassword: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-cinema-subtle">
              Confirm New Password
            </label>

            <input
              type="password"
              className="input-field"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  confirmPassword: e.target.value,
                }))
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>

        </form>

      </div>
    </div>
  );
}
