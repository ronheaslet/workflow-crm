import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { Layout } from './components/core/Layout';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { Jobs } from './pages/Jobs';
import { Partners } from './pages/Partners';
import { VoiceEntry } from './pages/VoiceEntry';
import { Settings } from './pages/Settings';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/contacts" element={<PrivateRoute><Layout><Contacts /></Layout></PrivateRoute>} />
      <Route path="/jobs" element={<PrivateRoute><Layout><Jobs /></Layout></PrivateRoute>} />
      <Route path="/partners" element={<PrivateRoute><Layout><Partners /></Layout></PrivateRoute>} />
      <Route path="/voice" element={<PrivateRoute><Layout><VoiceEntry /></Layout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
      <Route path="/inventory" element={<PrivateRoute><Layout><div className="text-2xl font-bold text-slate">Inventory - Coming Soon</div></Layout></PrivateRoute>} />
      <Route path="/appointments" element={<PrivateRoute><Layout><div className="text-2xl font-bold text-slate">Appointments - Coming Soon</div></Layout></PrivateRoute>} />
      <Route path="/compliance" element={<PrivateRoute><Layout><div className="text-2xl font-bold text-slate">Compliance - Coming Soon</div></Layout></PrivateRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <AppRoutes />
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
