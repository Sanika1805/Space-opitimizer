import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl hover:opacity-90">
          Green Space Optimizer
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/drives" className="hover:underline">Drives</Link>
          {user ? (
            <>
              {user.role === 'incharge' ? (
                <Link to="/incharge/dashboard" className="hover:underline">Incharge</Link>
              ) : (
                <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/incharge" className="hover:underline">Incharge</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
