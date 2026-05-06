import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const result = await register(form.username, form.email, form.password);
    if (result.success) {
      toast.success('Account created! Welcome to MovieCircle 🎬');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-48 w-96 h-96 rounded-full bg-cinema-teal/5 blur-3xl" />
        <div className="absolute bottom-1/4 -left-48 w-96 h-96 rounded-full bg-cinema-gold/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-cinema-gold flex items-center justify-center text-cinema-black font-bold group-hover:scale-105 transition-transform">
              🎬
            </div>
            <span className="font-display text-xl font-bold text-cinema-text">MovieCircle</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-cinema-text">Create your account</h1>
          <p className="text-cinema-subtle mt-2">Join the circle, start watching</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-cinema-subtle mb-2">Username</label>
              <input
                type="text"
                className="input-field"
                placeholder="cinephile42"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cinema-subtle mb-2">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cinema-subtle mb-2">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cinema-subtle mb-2">Confirm Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-cinema-black/30 border-t-cinema-black rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-cinema-subtle mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-cinema-gold hover:text-cinema-gold-dim font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
