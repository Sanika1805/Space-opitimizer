import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Drives from './pages/Drives';
import Profile from './pages/Profile';
import InchargeLogin from './pages/InchargeLogin';
import InchargeDashboard from './pages/InchargeDashboard';
import InchargeVerify from './pages/InchargeVerify';

function PrivateRoute({ children, inchargeOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (inchargeOnly && user.role !== 'incharge') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="/drives" element={<Drives />} />
          <Route path="/incharge" element={<InchargeLogin />} />
          <Route
            path="/incharge/verify"
            element={
              <PrivateRoute inchargeOnly>
                <InchargeVerify />
              </PrivateRoute>
            }
          />
          <Route
            path="/incharge/dashboard"
            element={
              <PrivateRoute inchargeOnly>
                <InchargeDashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
