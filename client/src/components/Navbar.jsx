import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = ['/signup', '/login', '/incharge'].includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showGuestNav = !user || isAuthPage;

  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl hover:opacity-90">
          Green Space Optimizer
        </Link>
        <div className="flex gap-4 items-center">
          {showGuestNav ? (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/incharge" className="hover:underline">Incharge</Link>
            </>
          ) : (
            <>
              {user.role === 'incharge' ? (
                <Link to="/incharge/dashboard" className="hover:underline">Incharge</Link>
              ) : (
                <>
                  <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                  <Link
                    to="/profile"
                    className={`flex items-center justify-center w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 transition-colors ${
                      !user.profileComplete
                        ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-green-800 animate-pulse'
                        : ''
                    }`}
                    title={!user.profileComplete ? 'Complete your profile' : 'Profile'}
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2a4 4 0 0 0-4 4v1a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4zm-2 6a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0V8zm2 4a5 5 0 0 0-5 5v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a5 5 0 0 0-5-5z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded text-sm font-medium"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
