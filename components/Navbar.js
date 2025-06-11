import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <a className="text-2xl font-bold text-indigo-600">StudyHub</a>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/">
            <a className="text-gray-600 hover:text-indigo-600">Home</a>
          </Link>
          {user && (
            <Link href="/my-courses">
              <a className="text-gray-600 hover:text-indigo-600">My Courses</a>
            </Link>
          )}
          {user ? (
            <button onClick={logout} className="text-gray-600 hover:text-indigo-600">
              Logout
            </button>
          ) : (
            <button onClick={signInWithGoogle} className="text-gray-600 hover:text-indigo-600">
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
