import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CommunityFab() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Link
      to="/community"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 hover:shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-green-400/50"
      title="Community"
      aria-label="Open Community"
    >
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </Link>
  );
}
