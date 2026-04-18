import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import { useAppStore } from './store/appStore';
import ElevenLabsWidget from './components/common/ElevenLabsWidget';

function PrivateRoute({ children }) {
  const { token } = useAppStore();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { token } = useAppStore();
  const location = useLocation();
  const showWidget = location.pathname !== '/login';

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <ProfileSetup />
          </PrivateRoute>
        } />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showWidget && <ElevenLabsWidget />}
    </>
  );
}
