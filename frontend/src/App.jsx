import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './context/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GroupPage from './pages/GroupPage';
import LandingPage from './pages/LandingPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

const ProtectedRoute = ({ children }) => {
  const { token, user } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { token, user } = useAuthStore();
  if (token && user) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#16161f',
            color: '#e8e8f0',
            border: '1px solid #1e1e2e',
            borderRadius: '10px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#f5c518', secondary: '#0a0a0f' },
          },
          error: {
            iconTheme: { primary: '#e63946', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        <Route path="/group/:groupId" element={<ProtectedRoute><GroupPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="text-center text-gray-400 py-5 border-t border-gray-800 bg-[#0a0a0f]">
        <p>© 2026 MovieCircle</p>
        <p className="text-sm text-gray-500 mt-3 mb-8">
  Built from curiosity by{' '}
  <span className="text-yellow-400 font-medium">Swapnil Sarker</span>
</p>
      </footer>  
    </BrowserRouter>
  );
}
