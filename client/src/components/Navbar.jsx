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
                  <Link to="/notifications" className="relative hover:underline" title="Notifications">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                    </svg>
                  </Link>
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
