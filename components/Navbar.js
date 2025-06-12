import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <nav className="bg-indigo-600 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">CourseApp</Link>
        <div className="space-x-4">
          <Link href="/" className="hover:text-indigo-200">Home</Link>
          {user && (
            <Link href="/my-courses" className="hover:text-indigo-200">My Courses</Link>
          )}
          {user ? (
            <button onClick={logout} className="hover:text-indigo-200">Logout</button>
          ) : (
            <button onClick={login} className="hover:text-indigo-200">Sign in with Google</button>
          )}
        </div>
      </div>
    </nav>
  );
}
