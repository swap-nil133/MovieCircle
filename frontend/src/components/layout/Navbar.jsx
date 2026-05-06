import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../context/authStore';
import { getInitials, getUserColor } from '../../utils/format';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-cinema-dark/90 backdrop-blur-md border-b border-cinema-border">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-cinema-gold flex items-center justify-center text-cinema-black font-bold text-lg group-hover:scale-105 transition-transform">
            🎬
          </div>
          <span className="font-display text-lg font-bold text-cinema-text hidden sm:block">MovieCircle</span>
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="flex items-center gap-2.5 hover:bg-cinema-muted rounded-xl px-3 py-2 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-cinema-black"
              style={{ backgroundColor: getUserColor(user?.username) }}
            >
              {getInitials(user?.username)}
            </div>
            <span className="text-cinema-text text-sm font-medium hidden sm:block">{user?.username}</span>
            <svg className={`w-4 h-4 text-cinema-subtle transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 card shadow-modal z-20 animate-scale-in">
                <div className="p-3 border-b border-cinema-border">
                  <div className="text-sm font-medium text-cinema-text">{user?.username}</div>
                  <div className="text-xs text-cinema-subtle truncate">{user?.email}</div>
                </div>
                <div className="p-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-cinema-text hover:bg-cinema-muted transition-colors"
                  >
                    🏠 Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-cinema-accent hover:bg-cinema-accent/10 transition-colors"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
